<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref } from "vue";
import type { PropType } from "vue";
import { ScrollbarTheme } from "./theme";
import {
  BAR_MAP,
  MIN_SIZE,
  WHEEL_FRICTION,
  WHEEL_SPEED_FACTOR,
  mergeScrollbarClass,
  renderThumbStyle
} from "./utils";
import type { Direction, ScrollbarColorTheme, ScrollbarUi, WheelDirection } from "./types";

// 滚动完全交给原生 overflow:auto，
// 这里只自绘滑块（track/thumb）并处理拖拽/轨道点击，不做任何惯性或键盘拦截。
type Dir = Direction;

const props = defineProps({
  // 滚动条粗细
  barSize: {
    type: Number,
    default: 4
  },
  // 是否始终显示
  always: {
    type: Boolean,
    default: false
  },
  // 主题色（运行时注入 CSS 变量，仅影响自绘滑块外观）
  theme: {
    type: Object as () => ScrollbarColorTheme,
    default: () => ({})
  },
  // 各部件 tailwind class 覆盖（参考 collapsible-panel 的 ui 模式）
  ui: {
    type: Object as () => ScrollbarUi,
    default: () => ({})
  },
  // 滚动容器是否可聚焦（键盘方向键滚动依赖原生，需容器可聚焦）
  tabindex: {
    type: [Number, String] as PropType<number | string>,
    default: 0
  },
  // 鼠标滚轮方向：vertical 走原生（竖滚，Shift+滚轮横滚）；
  // horizontal 将竖向滚轮量映射为横向滚动（仅在有横向可滚时劫持）
  wheelDirection: {
    type: String as PropType<WheelDirection>,
    default: "vertical"
  }
});

const emit = defineEmits<{
  scroll: [event: Event];
  dragStateChange: [isDragging: boolean];
}>();

const wrapRef = ref<HTMLDivElement>();
const viewRef = ref<HTMLDivElement>();
const barVerticalRef = ref<HTMLDivElement>();
const barHorizontalRef = ref<HTMLDivElement>();
const thumbVerticalRef = ref<HTMLDivElement>();
const thumbHorizontalRef = ref<HTMLDivElement>();

const moveX = ref(0);
const moveY = ref(0);
const sizeWidth = ref("");
const sizeHeight = ref("");
const ratioX = ref(1);
const ratioY = ref(1);

const visible = ref(false);
const cursorDown = ref(false);
const cursorLeave = ref(false);
const thumbState = ref<Partial<Record<"X" | "Y", number>>>({});

const thumbStyleVertical = computed(() =>
  renderThumbStyle(moveY.value, sizeHeight.value, "vertical")
);
const thumbStyleHorizontal = computed(() =>
  renderThumbStyle(moveX.value, sizeWidth.value, "horizontal")
);

// 仅当某方向可滚动时才挂载对应滑块
const hasVertical = computed(() => sizeHeight.value !== "");
const hasHorizontal = computed(() => sizeWidth.value !== "");

const rootStyle = computed(() => ({
  "--bar-size": `${props.barSize}px`,
  "--track-color": props.theme.trackColor || "transparent",
  "--thumb-color": props.theme.thumbColor || "#909399",
  "--thumb-hover-color": props.theme.thumbHoverColor || "#606266",
  "--thumb-active-color": props.theme.thumbActiveColor || "#303133"
}));

// 滑块位移跟随原生 scrollTop/scrollLeft（无 transition，实时跟手）
const handleScroll = (e: Event) => {
  const wrap = wrapRef.value;
  if (!wrap) return;
  const offsetHeight = wrap.offsetHeight;
  const offsetWidth = wrap.offsetWidth;

  moveY.value = ((wrap.scrollTop * 100) / offsetHeight) * ratioY.value;
  moveX.value = ((wrap.scrollLeft * 100) / offsetWidth) * ratioX.value;
  emit("scroll", e);
};

// 横向滚轮惯性：滚轮量累加成速度，松手后按摩擦自然滑停。
// 仅在 wheelDirection=horizontal 且确有横向可滚时才劫持，否则放行原生，避免吞掉正常竖向滚轮。
let scrollVelocity = 0;
let momentumRaf = 0;

const stopMomentum = () => {
  if (momentumRaf) cancelAnimationFrame(momentumRaf);
  momentumRaf = 0;
  scrollVelocity = 0;
};

const runMomentum = () => {
  if (momentumRaf) return;
  const step = () => {
    const wrap = wrapRef.value;
    if (!wrap || wrap.scrollWidth <= wrap.clientWidth) return stopMomentum();
    const max = wrap.scrollWidth - wrap.clientWidth;
    wrap.scrollLeft = Math.min(max, Math.max(0, wrap.scrollLeft + scrollVelocity));
    scrollVelocity *= WHEEL_FRICTION; // 摩擦衰减
    if (Math.abs(scrollVelocity) < 0.5) return stopMomentum();
    momentumRaf = requestAnimationFrame(step);
  };
  momentumRaf = requestAnimationFrame(step);
};

// 把不同 deltaMode 的滚轮量统一成像素，避免 Firefox 行模式(deltaMode=1)下几乎不动
const normalizeWheel = (e: WheelEvent): number => {
  const factor = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? wrapRef.value!.clientHeight : 1;
  const dx = e.deltaX * factor;
  const dy = e.deltaY * factor;
  return dx !== 0 ? dx : dy; // 横向优先
};

const handleWheel = (e: WheelEvent) => {
  if (props.wheelDirection !== "horizontal") return;
  const wrap = wrapRef.value;
  if (!wrap || wrap.scrollWidth <= wrap.clientWidth) return;
  e.preventDefault();
  // deltaX（触控板横滑）浏览器已自带惯性，直接累加；deltaY（鼠标滚轮）无衰减，靠速度累积出惯性。
  // 滚轮量先乘缩放系数，避免单个 notch 被惯性放大十几倍滑太远。
  const raw = normalizeWheel(e);
  scrollVelocity = Math.max(-120, Math.min(120, scrollVelocity + raw * WHEEL_SPEED_FACTOR));
  runMomentum();
};

// 依据容器与内容尺寸重算滑块长度与比例修正系数
const update = () => {
  const wrap = wrapRef.value;
  if (!wrap) return;
  const offsetHeight = wrap.offsetHeight;
  const offsetWidth = wrap.offsetWidth;

  const originalHeight = offsetHeight ** 2 / wrap.scrollHeight;
  const originalWidth = offsetWidth ** 2 / wrap.scrollWidth;
  const height = Math.max(originalHeight, MIN_SIZE);
  const width = Math.max(originalWidth, MIN_SIZE);

  ratioY.value =
    originalHeight / (offsetHeight - originalHeight) / (height / (offsetHeight - height));
  ratioX.value = originalWidth / (offsetWidth - originalWidth) / (width / (offsetWidth - width));

  sizeHeight.value = height < offsetHeight ? `${height}px` : "";
  sizeWidth.value = width < offsetWidth ? `${width}px` : "";
};

const getClientCoord = (e: MouseEvent | TouchEvent, key: "clientX" | "clientY"): number =>
  e.type.startsWith("touch") ? (e as TouchEvent).touches[0]![key] : (e as MouseEvent)[key];

// 修正滑块自身高度带来的位移偏差（translate% 相对滑块自身尺寸）
const offsetRatio = (dir: Dir): number => {
  const wrap = wrapRef.value;
  const bar = dir === "vertical" ? barVerticalRef.value : barHorizontalRef.value;
  const thumb = dir === "vertical" ? thumbVerticalRef.value : thumbHorizontalRef.value;
  if (!wrap || !bar || !thumb) return 1;
  const b = BAR_MAP[dir];
  const ratio = dir === "vertical" ? ratioY.value : ratioX.value;
  return bar[b.offset] ** 2 / wrap[b.scrollSize] / ratio / thumb[b.offset];
};

let currentDragDir: Dir = "vertical";
let originalOnSelectStart: ((this: GlobalEventHandlers, ev: Event) => unknown) | null = null;

const clickThumbHandler = (dir: Dir, e: MouseEvent | TouchEvent) => {
  if (e.type === "mousedown") {
    const me = e as MouseEvent;
    if (me.ctrlKey || [1, 2].includes(me.button)) return;
  }
  e.stopPropagation();
  if (e.type.startsWith("touch")) e.preventDefault();
  window.getSelection()?.removeAllRanges();
  startDrag(dir, e);

  const b = BAR_MAP[dir];
  const el = e.currentTarget as HTMLElement;
  const client = getClientCoord(e, b.client);
  thumbState.value[b.axis] = el[b.offset] - (client - el.getBoundingClientRect()[b.direction]);
};

const clickTrackHandler = (dir: Dir, e: MouseEvent) => {
  const wrap = wrapRef.value;
  const bar = dir === "vertical" ? barVerticalRef.value : barHorizontalRef.value;
  const thumb = dir === "vertical" ? thumbVerticalRef.value : thumbHorizontalRef.value;
  if (!wrap || !bar || !thumb) return;

  e.stopPropagation();
  const b = BAR_MAP[dir];
  const offset = Math.abs(
    (e.target as HTMLElement).getBoundingClientRect()[b.direction] - e[b.client]
  );
  const thumbHalf = thumb[b.offset] / 2;
  const ratio = ((offset - thumbHalf) * 100 * offsetRatio(dir)) / bar[b.offset];
  wrap[b.scroll] = (ratio * wrap[b.scrollSize]) / 100;
};

const startDrag = (dir: Dir, e: MouseEvent | TouchEvent) => {
  e.stopImmediatePropagation();
  cursorDown.value = true;
  currentDragDir = dir;
  stopMomentum(); // 抓取滑块即中断惯性，避免与拖拽打架
  emit("dragStateChange", true);

  const wrap = wrapRef.value;
  if (wrap) {
    baseScrollHeight = wrap.scrollHeight;
    baseScrollWidth = wrap.scrollWidth;
  }

  document.addEventListener("mousemove", onDocumentMove);
  document.addEventListener("mouseup", onDocumentUp);
  document.addEventListener("touchmove", onDocumentMove, { passive: false });
  document.addEventListener("touchend", onDocumentUp);

  originalOnSelectStart = document.onselectstart;
  document.onselectstart = () => false;
};

const onDocumentMove = (e: MouseEvent | TouchEvent) => {
  if (!cursorDown.value) return;
  if (e.type.startsWith("touch")) e.preventDefault();

  const dir = currentDragDir;
  const b = BAR_MAP[dir];
  const bar = dir === "vertical" ? barVerticalRef.value : barHorizontalRef.value;
  const thumb = dir === "vertical" ? thumbVerticalRef.value : thumbHorizontalRef.value;
  const wrap = wrapRef.value;
  if (!bar || !thumb || !wrap) return;

  const prevPage = thumbState.value[b.axis];
  if (!prevPage) return;

  const client = getClientCoord(e, b.client);
  const offset = (bar.getBoundingClientRect()[b.direction] - client) * -1;
  const thumbClickPosition = thumb[b.offset] - prevPage;
  const ratio = ((offset - thumbClickPosition) * 100 * offsetRatio(dir)) / bar[b.offset];

  if (b.scroll === "scrollLeft") {
    wrap[b.scroll] = (ratio * baseScrollWidth) / 100;
  } else {
    wrap[b.scroll] = (ratio * baseScrollHeight) / 100;
  }
};

const onDocumentUp = () => {
  cursorDown.value = false;
  document.removeEventListener("mousemove", onDocumentMove);
  document.removeEventListener("mouseup", onDocumentUp);
  document.removeEventListener("touchmove", onDocumentMove);
  document.removeEventListener("touchend", onDocumentUp);
  if (document.onselectstart !== originalOnSelectStart) {
    document.onselectstart = originalOnSelectStart;
  }
  if (cursorLeave.value) visible.value = false;
  emit("dragStateChange", false);
};

let baseScrollHeight = 0;
let baseScrollWidth = 0;

const onMouseEnter = () => {
  cursorLeave.value = false;
  visible.value = true;
};

const onMouseLeave = () => {
  cursorLeave.value = true;
  if (!cursorDown.value) visible.value = props.always;
};

// 容器尺寸变化时重算滑块（原生 ResizeObserver，不引入额外依赖）
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (wrapRef.value && viewRef.value) {
    nextTick(update);
    resizeObserver = new ResizeObserver(() => update());
    resizeObserver.observe(wrapRef.value);
    resizeObserver.observe(viewRef.value);
  }
});

onUpdated(() => update());

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  stopMomentum();
  document.removeEventListener("mousemove", onDocumentMove);
  document.removeEventListener("mouseup", onDocumentUp);
  document.removeEventListener("touchmove", onDocumentMove);
  document.removeEventListener("touchend", onDocumentUp);
});

defineExpose({
  getScrollElement: () => wrapRef.value,
  scrollTo: (options: { top?: number; left?: number; behavior?: ScrollBehavior }) => {
    wrapRef.value?.scrollTo(options);
  },
  // 获取当前滚动位置，容器不存在时返回 undefined，便于调用方区分“未挂载”与“滚到 0”
  getScrollTo: () => {
    const wrap = wrapRef.value;
    if (!wrap) {
      return undefined;
    }
    return { scrollTop: wrap.scrollTop, scrollLeft: wrap.scrollLeft };
  },
  scrollToTop: () => {
    if (wrapRef.value) wrapRef.value.scrollTop = 0;
  },
  scrollToBottom: () => {
    if (wrapRef.value) {
      wrapRef.value.scrollTop = wrapRef.value.scrollHeight - wrapRef.value.clientHeight;
    }
  },
  // 横向归零，与 scrollToTop 对称
  scrollToLeft: () => {
    if (wrapRef.value) wrapRef.value.scrollLeft = 0;
  },
  // 横向滚到最右，与 scrollToBottom 对称
  scrollToRight: () => {
    if (wrapRef.value) {
      wrapRef.value.scrollLeft = wrapRef.value.scrollWidth - wrapRef.value.clientWidth;
    }
  }
});
</script>

<template>
  <div
    :class="mergeScrollbarClass(ScrollbarTheme.root, ui?.root)"
    :style="rootStyle"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div
      ref="wrapRef"
      :class="mergeScrollbarClass(ScrollbarTheme.wrap, ui?.wrap)"
      :tabindex="tabindex"
      @scroll="handleScroll"
      @wheel="handleWheel"
    >
      <div ref="viewRef" :class="mergeScrollbarClass(ScrollbarTheme.view, ui?.view)">
        <slot></slot>
      </div>
    </div>

    <transition
      enter-active-class="transition-opacity duration-[340ms] ease-out"
      leave-active-class="transition-opacity duration-[120ms] ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="hasVertical"
        v-show="always || visible"
        ref="barVerticalRef"
        :class="mergeScrollbarClass(ScrollbarTheme.barVertical, ui?.barVertical)"
        @mousedown="clickTrackHandler('vertical', $event)"
      >
        <div
          ref="thumbVerticalRef"
          :class="mergeScrollbarClass(ScrollbarTheme.thumb, ui?.thumb)"
          :style="thumbStyleVertical"
          @mousedown="clickThumbHandler('vertical', $event)"
          @touchstart="clickThumbHandler('vertical', $event)"
        ></div>
      </div>
    </transition>

    <transition
      enter-active-class="transition-opacity duration-[340ms] ease-out"
      leave-active-class="transition-opacity duration-[120ms] ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="hasHorizontal"
        v-show="always || visible"
        ref="barHorizontalRef"
        :class="mergeScrollbarClass(ScrollbarTheme.barHorizontal, ui?.barHorizontal)"
        @mousedown="clickTrackHandler('horizontal', $event)"
      >
        <div
          ref="thumbHorizontalRef"
          :class="mergeScrollbarClass(ScrollbarTheme.thumb, ui?.thumb)"
          :style="thumbStyleHorizontal"
          @mousedown="clickThumbHandler('horizontal', $event)"
          @touchstart="clickThumbHandler('horizontal', $event)"
        ></div>
      </div>
    </transition>
  </div>
</template>
