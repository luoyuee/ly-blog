<script setup lang="ts">
import type { PropType } from "vue";
import type { SpinUI } from "./types";
import { useSlotsExist } from "@/composables/useSlots";
import { twMerge } from "@/utils/tw-merge";
import { SpinTheme } from "./theme";
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  resolveComponent,
  useSlots,
  watch
} from "vue";

/**
 * 全局滚动锁计数。
 *
 * fullscreen 遮罩可能在页面中同时存在多个实例，
 * 这里通过引用计数避免某个实例提前关闭时把 body 滚动错误恢复掉。
 */
let fullscreenLockCount = 0;

/**
 * 记录 body 原始 overflow，确保最后一个 fullscreen 遮罩关闭时可以正确恢复。
 */
let originalBodyOverflow = "";

const props = defineProps({
  /**
   * 是否显示遮罩层。
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * 是否启用全屏遮罩。
   *
   * - false：遮罩覆盖当前组件包裹的内容区域
   * - true：遮罩通过 Teleport 挂载到 body，并覆盖整个视口
   */
  fullscreen: {
    type: Boolean,
    default: false
  },
  /**
   * fullscreen 模式下是否锁定页面滚动。
   */
  lockScroll: {
    type: Boolean,
    default: true
  },
  /**
   * 主提示文案。
   */
  text: {
    type: String,
    default: "加载中..."
  },
  /**
   * 次级说明文案。
   */
  description: {
    type: String,
    default: ""
  },
  /**
   * 遮罩层层级。
   * fullscreen 场景下通常需要比页面内容更高的层级。
   */
  zIndex: {
    type: Number,
    default: 40
  },
  /**
   * 各部件样式
   */
  ui: {
    type: Object as PropType<SpinUI>,
    default: () => ({})
  }
});

/**
 * 是否处于“激活的全屏遮罩”状态。
 * 这个计算属性用于集中驱动 Teleport 与 body 滚动锁逻辑。
 */
const isActiveFullscreen = computed(() => props.loading && props.fullscreen);

/**
 * 是否传入默认插槽内容。
 *
 * 没有内容时，非 fullscreen 模式下作为独立加载占位使用。
 */
const hasDefaultSlot = useSlotsExist("default");

/**
 * 合并默认主题、外部 ui 覆盖与运行时条件类，模板/Overlay 直接消费 mergedUI.xxx。
 *
 * - wrapper：非 fullscreen 且无默认插槽时（如 createSpin + target），自动追加 absolute inset-0 h-full
 * - overlay：fullscreen 用 fixed inset-0，局部用 absolute inset-0
 */
const mergedUI = computed(() => ({
  // 包裹容器：非 fullscreen 且无默认插槽时（如 createSpin + target），用 absolute inset-0 h-full 充满目标节点
  wrapper: twMerge(
    SpinTheme.wrapper,
    !hasDefaultSlot.value && !props.fullscreen && "absolute inset-0 h-full",
    props.ui?.wrapper
  ),
  // 遮罩层：fullscreen 使用 fixed 覆盖整个视口，局部遮罩使用 absolute 覆盖当前内容区域
  overlay: twMerge(
    SpinTheme.overlay,
    props.fullscreen ? "fixed inset-0" : "absolute inset-0",
    props.ui?.overlay
  ),
  // 中间加载面板：默认保持轻量，仅负责居中排列。需要更强视觉风格时可通过 ui.panel 覆盖
  panel: twMerge(SpinTheme.panel, props.ui?.panel),
  // Spinner 图标
  spinner: twMerge(SpinTheme.spinner, props.ui?.spinner),
  // 主文案
  title: twMerge(SpinTheme.title, props.ui?.title),
  // 次级文案
  description: twMerge(SpinTheme.description, props.ui?.description)
}));

/**
 * 遮罩层行内层级。
 *
 * 使用 style 而不是写死类名，便于调用方通过数字精确控制层级。
 */
const overlayStyle = computed(() => ({
  zIndex: String(props.zIndex)
}));

const slots = useSlots();

/**
 * 遮罩层组件。
 *
 * 用 defineComponent 包裹，保证 <Transition> 的过渡类名能稳定透传到根元素。
 * 通过闭包访问外层 Spin 的 props / slots / 响应式类名。
 *
 * 插槽优先级：panel > { spinner / title / description }。
 * - 传入 panel 插槽时整体替换面板内容
 * - title/description 插槽缺省时回退到 text/description prop 文本
 * - spinner 插槽缺省时回退到默认 mdi:loading 图标
 */
const Overlay = defineComponent({
  name: "SpinOverlay",
  setup() {
    return () => {
      const panelContent = slots.panel
        ? slots.panel()
        : [
            slots.spinner
              ? slots.spinner()
              : h(resolveComponent("UIcon"), {
                  name: "mdi:loading",
                  class: mergedUI.value.spinner
                }),
            h("div", { class: "space-y-1" }, [
              slots.title ? slots.title() : h("div", { class: mergedUI.value.title }, props.text),
              slots.description || props.description
                ? h(
                    "div",
                    { class: mergedUI.value.description },
                    slots.description ? slots.description() : props.description
                  )
                : null
            ])
          ];

      return h(
        "div",
        {
          class: mergedUI.value.overlay,
          style: overlayStyle.value,
          role: "status",
          "aria-live": "polite",
          "aria-busy": "true"
        },
        [h("div", { class: mergedUI.value.panel }, panelContent)]
      );
    };
  }
});

const lockBodyScroll = () => {
  if (typeof document === "undefined") {
    return;
  }

  if (fullscreenLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  fullscreenLockCount += 1;
};

const unlockBodyScroll = () => {
  if (typeof document === "undefined" || fullscreenLockCount === 0) {
    return;
  }

  fullscreenLockCount -= 1;

  if (fullscreenLockCount === 0) {
    document.body.style.overflow = originalBodyOverflow;
    originalBodyOverflow = "";
  }
};

/**
 * 同步 body 滚动锁。
 *
 * 只在“显示中的 fullscreen 遮罩且要求锁滚动”时加锁，
 * 其它状态统一走释放逻辑，避免组件销毁或模式切换时留下副作用。
 */
watch(
  () => [isActiveFullscreen.value, props.lockScroll] as const,
  ([newIsActiveFullscreen, newLockScroll], oldState) => {
    const [oldIsActiveFullscreen, oldLockScroll] = oldState ?? [false, false];
    const wasLocked = oldIsActiveFullscreen && oldLockScroll;
    const shouldLock = newIsActiveFullscreen && newLockScroll;

    if (!wasLocked && shouldLock) {
      lockBodyScroll();
      return;
    }

    if (wasLocked && !shouldLock) {
      unlockBodyScroll();
    }
  },
  {
    immediate: true
  }
);

onBeforeUnmount(() => {
  if (isActiveFullscreen.value && props.lockScroll) {
    unlockBodyScroll();
  }
});
</script>

<template>
  <div :class="mergedUI.wrapper">
    <slot></slot>

    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <component :is="Overlay" v-if="loading && !fullscreen" />
    </Transition>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <component :is="Overlay" v-if="isActiveFullscreen" />
      </Transition>
    </Teleport>
  </div>
</template>
