<script setup lang="ts">
import type { PropType } from "vue";
import type {
  CollapsiblePanelUi,
  CollapsiblePanelItem,
  ModelValue,
  PanelLayout,
  PanelType
} from "./types";
import { CollapsiblePanelTheme } from "./theme";
import {
  computed,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onMounted,
  ref,
  useSlots,
  watch
} from "vue";
import {
  clamp,
  DEFAULT_TRAILING_ICON,
  HEADER_HEIGHT,
  isSameKeys,
  normalizeOpenKeys,
  mergeTailwindClass,
  toEmitValue
} from "./utils";

const props = defineProps({
  /** 配置项数组 */
  items: {
    type: Array as PropType<CollapsiblePanelItem[]>,
    required: true
  },
  /** single 单开 / multiple 多开 */
  type: {
    type: String as PropType<PanelType>,
    default: "single"
  },
  /** single 模式下是否允许收起已展开项 */
  collapsible: {
    type: Boolean,
    default: true
  },
  /** 可拖拽面板的默认最小高度（px） */
  minPanelHeight: {
    type: Number,
    default: 120
  },
  /** 自定义各部分 Tailwind 类名，会与内部默认类名合并 */
  ui: {
    type: Object as PropType<CollapsiblePanelUi>,
    default: () => ({})
  }
});

const modelValue = defineModel<ModelValue>({ default: null });

const emit = defineEmits<{
  change: [value: string | string[] | null];
}>();

const mergedUi = computed(() => ({
  container: mergeTailwindClass(CollapsiblePanelTheme.container, props.ui.container),
  item: mergeTailwindClass(CollapsiblePanelTheme.item, props.ui.item),
  itemTransition: mergeTailwindClass(CollapsiblePanelTheme.itemTransition, props.ui.itemTransition),
  transitionNone: mergeTailwindClass(CollapsiblePanelTheme.transitionNone, props.ui.transitionNone),
  head: mergeTailwindClass(CollapsiblePanelTheme.head, props.ui.head),
  headDisabled: mergeTailwindClass(CollapsiblePanelTheme.headDisabled, props.ui.headDisabled),
  icon: mergeTailwindClass(CollapsiblePanelTheme.icon, props.ui.icon),
  title: mergeTailwindClass(CollapsiblePanelTheme.title, props.ui.title),
  arrow: mergeTailwindClass(CollapsiblePanelTheme.arrow, props.ui.arrow),
  arrowOpen: mergeTailwindClass(CollapsiblePanelTheme.arrowOpen, props.ui.arrowOpen),
  arrowDisabled: mergeTailwindClass(CollapsiblePanelTheme.arrowDisabled, props.ui.arrowDisabled),
  body: mergeTailwindClass(CollapsiblePanelTheme.body, props.ui.body),
  bodyTransition: mergeTailwindClass(CollapsiblePanelTheme.bodyTransition, props.ui.bodyTransition),
  content: mergeTailwindClass(CollapsiblePanelTheme.content, props.ui.content),
  resizeHandle: mergeTailwindClass(CollapsiblePanelTheme.resizeHandle, props.ui.resizeHandle)
}));

// 初始化展开 keys：始终使用 items.defaultOpen 作为默认展开配置
const resolveInitialKeys = (): string[] => {
  const defaultOpenItems = props.items.filter((item) => item.defaultOpen).map((item) => item.value);
  return normalizeOpenKeys(defaultOpenItems, props.type);
};

const openKeys = ref<string[]>(resolveInitialKeys());

// 各展开项的权重用于按比例分配剩余高度，缺省 1
const weights = ref<Record<string, number>>({});
const getWeight = (value: string): number => weights.value[value] ?? 1;
const ensureWeight = (value: string) => {
  if (weights.value[value] === undefined) {
    weights.value[value] = 1;
  }
};

const containerRef = ref<HTMLDivElement | null>(null);
const containerHeight = ref(0);
const isDragging = ref(false);
const isLayoutReady = ref(false);

// type 变化时校正展开数量
watch(
  () => props.type,
  (type) => {
    const next = normalizeOpenKeys(openKeys.value, type);
    if (!isSameKeys(openKeys.value, next)) {
      openKeys.value = next;
    }
  }
);

// 内部展开变化时同步外部
watch(
  openKeys,
  (value) => {
    const next = toEmitValue(value, props.type);
    modelValue.value = next;
    emit("change", next);
  },
  { deep: true }
);

const isOpen = (value: string): boolean => openKeys.value.includes(value);

const openItem = (value: string) => {
  if (isOpen(value)) return;
  openKeys.value = props.type === "single" ? [value] : [...openKeys.value, value];
  ensureWeight(value);
};

const closeItem = (value: string) => {
  openKeys.value = openKeys.value.filter((key) => key !== value);
};

// 按配置顺序排列的展开项 keys
const orderedOpenKeys = computed(() =>
  props.items.filter((item) => openKeys.value.includes(item.value)).map((item) => item.value)
);

// 展开项可分配的内容高度总和 = 容器高度 - 所有项 header 总高（收起项也有 header）
const availableHeight = computed(() =>
  Math.max(containerHeight.value - props.items.length * HEADER_HEIGHT, 0)
);

// 布局：每项 top/size/bodyHeight 全像素，撑满靠 weight 按 availableHeight 分配
const layout = computed(() => {
  const result: Record<string, PanelLayout> = {};
  let top = 0;
  const totalWeight = orderedOpenKeys.value.reduce((sum, key) => sum + getWeight(key), 0);
  for (const item of props.items) {
    const open = isOpen(item.value);
    let bodyHeight = 0;
    if (open && totalWeight > 0 && availableHeight.value > 0) {
      bodyHeight = (getWeight(item.value) / totalWeight) * availableHeight.value;
    }
    const size = HEADER_HEIGHT + bodyHeight;
    result[item.value] = { top, size, bodyHeight };
    top += size;
  }
  return result;
});

const getPanelLayout = (value: string): PanelLayout =>
  layout.value[value] ?? { top: 0, size: HEADER_HEIGHT, bodyHeight: 0 };

const toggleItem = (item: CollapsiblePanelItem) => {
  if (item.disabled) return;
  const open = isOpen(item.value);
  if (open) {
    // single 且不可收起时，保持唯一展开项
    if (!props.collapsible && props.type === "single" && openKeys.value.length === 1) {
      return;
    }
    // 收起时保留 weight，重新展开可恢复比例
    closeItem(item.value);
    return;
  }
  openItem(item.value);
};

// 是否显示拖拽手柄：该项可拖拽、已展开、且下方还有展开项
const showResizeHandle = (item: CollapsiblePanelItem): boolean => {
  if (!item.resizable || !isOpen(item.value)) return false;
  const index = orderedOpenKeys.value.indexOf(item.value);
  return index !== -1 && index < orderedOpenKeys.value.length - 1;
};

// ===== 拖拽：改相邻两项 weight（结果反映到像素 height）=====
let dragCurrent = "";
let dragNext = "";
let dragStartCurrentBody = 0;
let dragStartNextBody = 0;
let dragStartY = 0;
let dragTotalWeight = 0;
let dragAvailableHeight = 0;

const onHandleMouseMove = (event: MouseEvent) => {
  if (!dragCurrent || !dragNext || dragAvailableHeight <= 0) return;

  const delta = event.clientY - dragStartY;
  const totalBody = dragStartCurrentBody + dragStartNextBody;
  const minBody = Math.min(props.minPanelHeight, Math.floor(totalBody / 2));
  const newCurrentBody = clamp(dragStartCurrentBody + delta, minBody, totalBody - minBody);
  const newNextBody = totalBody - newCurrentBody;

  // bodyHeight -> weight：weight 仅作分配比例，换算成像素 height 直接定位
  const newCurrentWeight = (newCurrentBody / dragAvailableHeight) * dragTotalWeight;
  const newNextWeight = (newNextBody / dragAvailableHeight) * dragTotalWeight;

  weights.value = {
    ...weights.value,
    [dragCurrent]: newCurrentWeight,
    [dragNext]: newNextWeight
  };
};

const stopResize = () => {
  if (!dragCurrent && !dragNext) return;
  isDragging.value = false;
  dragCurrent = "";
  dragNext = "";
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
  document.removeEventListener("mousemove", onHandleMouseMove);
  document.removeEventListener("mouseup", stopResize);
};

const startResize = (item: CollapsiblePanelItem, event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();

  const index = orderedOpenKeys.value.indexOf(item.value);
  const nextKey = orderedOpenKeys.value[index + 1];
  if (!nextKey) return;

  dragCurrent = item.value;
  dragNext = nextKey;
  dragStartY = event.clientY;
  dragStartCurrentBody = getPanelLayout(item.value).bodyHeight;
  dragStartNextBody = getPanelLayout(nextKey).bodyHeight;
  dragTotalWeight = orderedOpenKeys.value.reduce((sum, key) => sum + getWeight(key), 0);
  dragAvailableHeight = availableHeight.value;
  isDragging.value = true;

  document.body.style.cursor = "ns-resize";
  document.body.style.userSelect = "none";
  document.addEventListener("mousemove", onHandleMouseMove);
  document.addEventListener("mouseup", stopResize);
};

let resizeObserver: ResizeObserver | null = null;
let layoutReadyFrame = 0;

const updateContainerHeight = () => {
  containerHeight.value = containerRef.value?.clientHeight ?? 0;
};

const prepareLayout = async () => {
  isLayoutReady.value = false;
  cancelAnimationFrame(layoutReadyFrame);
  await nextTick();
  updateContainerHeight();
  layoutReadyFrame = requestAnimationFrame(() => {
    isLayoutReady.value = true;
  });
};

onMounted(() => {
  resizeObserver = new ResizeObserver(() => updateContainerHeight());
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }
  prepareLayout();
});

onActivated(() => {
  prepareLayout();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  cancelAnimationFrame(layoutReadyFrame);
  stopResize();
});

const slots = useSlots();

defineExpose({
  toggle: (value: string) => {
    const item = props.items.find((entry) => entry.value === value);
    if (item) toggleItem(item);
  },
  open: (value: string) => {
    openItem(value);
  },
  close: (value: string) => {
    closeItem(value);
  }
});
</script>

<template>
  <div ref="containerRef" :class="mergedUi.container">
    <template v-for="item in items" :key="item.value">
      <div
        :class="[
          mergedUi.item,
          item.class,
          !isLayoutReady || isDragging ? mergedUi.transitionNone : mergedUi.itemTransition
        ]"
        :style="{
          top: getPanelLayout(item.value).top + 'px',
          height: getPanelLayout(item.value).size + 'px'
        }"
      >
        <div
          :class="[mergedUi.head, { [mergedUi.headDisabled]: item.disabled }]"
          @click="toggleItem(item)"
        >
          <slot name="leading" :item="item" :is-open="isOpen(item.value)">
            <UIcon
              :name="item.trailingIcon || DEFAULT_TRAILING_ICON"
              :class="[
                mergedUi.arrow,
                {
                  [mergedUi.arrowOpen]: isOpen(item.value),
                  [mergedUi.arrowDisabled]: item.disabled
                }
              ]"
            />
          </slot>
          <span :class="mergedUi.title">{{ item.label }}</span>
          <slot name="trailing" :item="item" :is-open="isOpen(item.value)">
            <UIcon v-if="item.icon" :name="item.icon" :class="mergedUi.icon" />
          </slot>
        </div>

        <div
          :class="[
            mergedUi.body,
            !isLayoutReady || isDragging ? mergedUi.transitionNone : mergedUi.bodyTransition
          ]"
          :style="{ height: getPanelLayout(item.value).bodyHeight + 'px' }"
        >
          <div :class="mergedUi.content">
            <!-- 1. 指定项 content 插槽 -->
            <slot
              v-if="item.slot && slots[item.slot]"
              :name="item.slot"
              :item="item"
              :is-open="isOpen(item.value)"
            ></slot>
            <!-- 2. 通用 content 插槽 -->
            <slot
              v-else-if="slots.content"
              name="content"
              :item="item"
              :is-open="isOpen(item.value)"
            ></slot>
            <!-- 3. 纯文本兜底 -->
            <template v-else>
              {{ item.content }}
            </template>
          </div>
        </div>

        <div
          v-if="showResizeHandle(item)"
          :class="mergedUi.resizeHandle"
          role="separator"
          aria-orientation="horizontal"
          @mousedown="startResize(item, $event)"
        ></div>
      </div>
    </template>
  </div>
</template>
