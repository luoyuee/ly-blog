<script setup lang="ts">
import type { PropType } from "vue";
import type {
  PickerColumn,
  PickerColumnDisplayItems,
  PickerColumnInteractionState,
  PickerDirection,
  PickerFieldNames,
  PickerItems,
  PickerMode,
  PickerNode,
  PickerPrimitive,
  PickerScrollbarExposed,
  PickerSelectionState
} from "./types";
import { computed, nextTick, ref, watch } from "vue";
import { Scrollbar } from "@/components/scrollbar";
import {
  getPickerAdjacentSelectableOption,
  getPickerColumnDisplayItems,
  getPickerColumnSelectedIndex,
  getPickerColumnItems,
  getPickerDisplayState,
  getPickerOptionItems,
  getPickerOutputSelection,
  normalizePickerColumns,
  normalizePickerOptions,
  resolvePickerSelection
} from "./utils";

const modelValue = defineModel<PickerPrimitive[]>({ default: () => [] });

const props = defineProps({
  mode: {
    type: String as PropType<PickerMode>,
    default: "columns"
  },
  items: {
    type: Array as PropType<PickerItems>,
    default: () => []
  },
  fieldNames: {
    type: Object as PropType<PickerFieldNames>,
    default: () => ({
      label: "label",
      value: "value",
      children: "children",
      disabled: "disabled"
    })
  },
  itemHeight: {
    type: Number,
    default: 44
  },
  visibleItemCount: {
    type: Number,
    default: 5
  },
  arrowControl: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  change: [value: PickerPrimitive[]];
}>();

// PickerPanel 是纯选择面板：所有交互都会实时写回 v-model，不包含确定/取消语义。
// 上层如需“确认后提交”，应像 Picker.vue 一样把它绑定到临时 draft。
const columnRefs = ref<Array<PickerScrollbarExposed | null>>([]);
const scrollSnapTimers = ref<Array<ReturnType<typeof setTimeout> | null>>([]);

// 拖拽滚动条时不立即做吸附，避免“用户还在拖，组件又把位置拉回去”的抢控制问题。
const columnInteractionStates = ref<PickerColumnInteractionState[]>([]);

const getPaddingHeight = () => {
  return (props.itemHeight * props.visibleItemCount - props.itemHeight) / 2;
};

const getPanelHeight = () => {
  if (props.arrowControl) {
    return props.itemHeight * 5;
  }

  return props.itemHeight * props.visibleItemCount;
};

const getHighlightOffset = () => {
  if (props.arrowControl) {
    return props.itemHeight * 2;
  }

  return getPaddingHeight();
};

const normalizedColumns = computed<PickerColumn[]>(() => {
  return normalizePickerColumns(getPickerColumnItems(props.items), props.fieldNames);
});

const normalizedOptions = computed<PickerColumn>(() => {
  return normalizePickerOptions(getPickerOptionItems(props.items), props.fieldNames);
});

const getResolvedSelection = (sourceSelection: PickerSelectionState) => {
  return resolvePickerSelection({
    mode: props.mode,
    sourceSelection,
    normalizedColumns: normalizedColumns.value,
    normalizedOptions: normalizedOptions.value
  });
};

// 面板必须始终展示一条有效路径：外部值为空、失效或指向禁用项时，会回退到首个可选项。
const displayState = computed(() => {
  return getPickerDisplayState({
    mode: props.mode,
    sourceSelection: modelValue.value,
    normalizedColumns: normalizedColumns.value,
    normalizedOptions: normalizedOptions.value,
    shouldResolveSelection: true
  });
});

const getColumnSelectedIndex = (columnIndex: number) => {
  return getPickerColumnSelectedIndex(
    displayState.value.columns,
    displayState.value.selection,
    columnIndex
  );
};

const getSelectableOption = (columnIndex: number, direction: PickerDirection) => {
  return getPickerAdjacentSelectableOption(
    displayState.value.columns,
    displayState.value.selection,
    columnIndex,
    direction
  );
};

const canMoveSelection = (columnIndex: number, direction: PickerDirection) => {
  return getSelectableOption(columnIndex, direction) !== null;
};

// 箭头控制不是滚动列表，而是固定三行的前后预览 + 当前选中项。
const arrowColumnDisplayItems = computed<PickerColumnDisplayItems[]>(() => {
  return displayState.value.columns.map((_, columnIndex) => {
    return getPickerColumnDisplayItems(
      displayState.value.columns,
      displayState.value.selection,
      columnIndex
    );
  });
});

// 关闭箭头控制时，滚动条本身就是交互主入口，因此隐藏轨道视觉，保留内容滚动能力。
const scrollbarTheme = computed(() => {
  if (props.arrowControl) {
    return {};
  }

  return {
    trackColor: "transparent"
  };
});

const getSyncedSelection = () => {
  return getPickerOutputSelection(getResolvedSelection(modelValue.value));
};

const syncModelValue = (selection: PickerSelectionState) => {
  const nextValue = getPickerOutputSelection(getResolvedSelection(selection));

  modelValue.value = nextValue;
  emit("change", nextValue);
};

function scrollToSelection() {
  columnRefs.value.forEach((columnEl, columnIndex) => {
    if (!columnEl) {
      return;
    }

    const selectedIndex = getColumnSelectedIndex(columnIndex);
    if (selectedIndex < 0) {
      return;
    }

    columnEl.scrollTo({
      top: selectedIndex * props.itemHeight
    });
  });
}

watch(
  () => [props.items, props.mode, props.fieldNames] as const,
  () => {
    // 数据源或模式变化后，当前值可能指向不存在的项，立即收敛保证外部拿到的是可选路径。
    syncModelValue(modelValue.value);
    nextTick(scrollToSelection);
  },
  { deep: true }
);

watch(
  modelValue,
  () => {
    nextTick(scrollToSelection);
  },
  { immediate: true, deep: true }
);

const setColumnRef = (el: PickerScrollbarExposed | null, index: number) => {
  columnRefs.value[index] = el;
};

const getColumnInteractionState = (columnIndex: number): PickerColumnInteractionState => {
  const state = columnInteractionStates.value[columnIndex];

  if (state) {
    return state;
  }

  const nextState: PickerColumnInteractionState = {
    isDraggingScrollbar: false
  };
  columnInteractionStates.value[columnIndex] = nextState;
  return nextState;
};

const clearScrollSnapTimer = (columnIndex: number) => {
  const timer = scrollSnapTimers.value[columnIndex];

  if (!timer) {
    return;
  }

  clearTimeout(timer);
  scrollSnapTimers.value[columnIndex] = null;
};

const clearAllScrollSnapTimers = () => {
  scrollSnapTimers.value.forEach((_, columnIndex) => {
    clearScrollSnapTimer(columnIndex);
  });
};

const snapColumnToSelection = (columnIndex: number) => {
  const columnEl = columnRefs.value[columnIndex];

  if (!columnEl) {
    return;
  }

  const selectedIndex = getColumnSelectedIndex(columnIndex);

  if (selectedIndex < 0) {
    return;
  }

  columnEl.scrollTo({
    top: selectedIndex * props.itemHeight,
    behavior: "smooth"
  });
};

// 原生滚动会产生中间态，这里延后一点再吸附，让滚轮/惯性滚动先结束，避免抖动感。
// 拖拽滚动条期间不会触发吸附，防止用户还没放手就被程序强行拉回中心线。
const scheduleScrollSnap = (columnIndex: number) => {
  if (getColumnInteractionState(columnIndex).isDraggingScrollbar) {
    return;
  }

  clearScrollSnapTimer(columnIndex);
  scrollSnapTimers.value[columnIndex] = setTimeout(() => {
    snapColumnToSelection(columnIndex);
    scrollSnapTimers.value[columnIndex] = null;
  }, 120);
};

const handleScrollbarDragStateChange = (columnIndex: number, isDragging: boolean) => {
  const state = getColumnInteractionState(columnIndex);
  state.isDraggingScrollbar = isDragging;

  if (isDragging) {
    clearScrollSnapTimer(columnIndex);
    return;
  }

  scheduleScrollSnap(columnIndex);
};

const updateSelectionAt = (columnIndex: number, value: PickerPrimitive) => {
  const nextSelection = getResolvedSelection(modelValue.value).slice();

  if (props.mode === "columns") {
    // 多列模式各列独立，只替换当前列即可。
    nextSelection[columnIndex] = value;
    syncModelValue(nextSelection);
    nextTick(scrollToSelection);
    return;
  }

  // 级联模式下改动某一层后，下游路径必须全部丢弃并重新推导，才能匹配新的 children 链路。
  const baseSelection = nextSelection.slice(0, columnIndex);
  baseSelection[columnIndex] = value;
  syncModelValue(baseSelection);
  nextTick(scrollToSelection);
};

// 滚动选中依赖“离当前中心线最近的项”，因此使用四舍五入映射到最近一项。
const syncSelectionByScrollTop = (columnIndex: number, scrollTop: number) => {
  const column = displayState.value.columns[columnIndex] ?? [];
  if (column.length === 0) {
    return;
  }

  const nextIndex = Math.round(scrollTop / props.itemHeight);
  const option = column[nextIndex];

  if (!option || option.disabled) {
    return;
  }

  const currentSelected = displayState.value.selection[columnIndex];

  if (currentSelected === option.value) {
    return;
  }

  updateSelectionAt(columnIndex, option.value);
};

const handleScrollbarScroll = (columnIndex: number) => {
  // 箭头模式下不依赖滚动选值，避免按钮步进与滚动监听互相打架。
  if (props.arrowControl) {
    return;
  }

  const scrollElement = columnRefs.value[columnIndex]?.getScrollElement();

  if (!scrollElement) {
    return;
  }

  syncSelectionByScrollTop(columnIndex, scrollElement.scrollTop);
  scheduleScrollSnap(columnIndex);
};

const handleClickItem = (columnIndex: number, option: PickerNode) => {
  if (option.disabled) {
    return;
  }

  updateSelectionAt(columnIndex, option.value);
};

const handleArrowStep = (columnIndex: number, direction: PickerDirection) => {
  const option = getSelectableOption(columnIndex, direction);
  if (!option) {
    return;
  }

  updateSelectionAt(columnIndex, option.value);
};

defineExpose({
  scrollToSelection,
  clearAllScrollSnapTimers,
  getSyncedSelection
});
</script>

<template>
  <div class="w-full max-w-[calc(100vw-1rem)] bg-white rounded-md">
    <div class="flex" :style="{ height: `${getPanelHeight()}px` }">
      <template v-for="(column, columnIndex) in displayState.columns" :key="columnIndex">
        <div
          v-if="props.arrowControl"
          class="relative flex min-w-0 basis-0 flex-1 flex-col border-r border-neutral-200 last:border-r-0"
        >
          <div
            class="pointer-events-none absolute inset-x-0 bg-primary/10"
            :style="{
              top: `${getHighlightOffset()}px`,
              height: `${props.itemHeight}px`
            }"
          ></div>

          <UButton
            color="neutral"
            variant="ghost"
            block
            class="rounded-none"
            :style="{ height: `${props.itemHeight}px` }"
            :disabled="!canMoveSelection(columnIndex, 'previous')"
            @click="handleArrowStep(columnIndex, 'previous')"
            icon="mdi:chevron-up"
          />

          <div class="flex flex-1 flex-col" :style="{ height: `${props.itemHeight * 3}px` }">
            <div
              class="flex items-center justify-center px-3 text-sm text-neutral-500"
              :style="{ height: `${props.itemHeight}px` }"
            >
              <span class="truncate text-center">
                {{ arrowColumnDisplayItems[columnIndex]?.previous?.label ?? "" }}
              </span>
            </div>
            <div
              class="flex items-center justify-center px-3 text-sm font-medium text-primary"
              :style="{ height: `${props.itemHeight}px` }"
            >
              <span class="truncate text-center">
                {{ arrowColumnDisplayItems[columnIndex]?.current?.label ?? "" }}
              </span>
            </div>
            <div
              class="flex items-center justify-center px-3 text-sm text-neutral-500"
              :style="{ height: `${props.itemHeight}px` }"
            >
              <span class="truncate text-center">
                {{ arrowColumnDisplayItems[columnIndex]?.next?.label ?? "" }}
              </span>
            </div>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            block
            class="rounded-none"
            :style="{ height: `${props.itemHeight}px` }"
            :disabled="!canMoveSelection(columnIndex, 'next')"
            @click="handleArrowStep(columnIndex, 'next')"
            icon="mdi:chevron-down"
          />
        </div>
        <Scrollbar
          v-else
          class="picker__column-scrollbar relative min-w-0 basis-0 flex-1 border-r border-neutral-200 last:border-r-0"
          :ref="(el) => setColumnRef(el as PickerScrollbarExposed | null, columnIndex)"
          :theme="scrollbarTheme"
          @drag-state-change="handleScrollbarDragStateChange(columnIndex, $event)"
          @scroll="handleScrollbarScroll(columnIndex)"
        >
          <!-- 中间高亮带仅负责视觉定位，真正的选中值仍以 modelValue 为准。 -->
          <div
            class="pointer-events-none absolute inset-x-0 bg-primary/10"
            :style="{
              top: `${getHighlightOffset()}px`,
              height: `${props.itemHeight}px`
            }"
          />

          <div
            class="h-full overscroll-contain"
            :style="{
              paddingTop: `${getPaddingHeight()}px`,
              paddingBottom: `${getPaddingHeight()}px`
            }"
          >
            <button
              v-for="option in column"
              :key="String(option.value)"
              type="button"
              class="flex w-full items-center justify-center px-3 text-sm transition-colors"
              :class="[
                option.disabled
                  ? 'cursor-not-allowed text-neutral-300'
                  : 'text-neutral-700 hover:bg-neutral-100',
                displayState.selection[columnIndex] === option.value
                  ? 'font-medium text-primary hover:bg-transparent'
                  : ''
              ]"
              :style="{ height: `${props.itemHeight}px` }"
              :disabled="option.disabled"
              @click="handleClickItem(columnIndex, option)"
            >
              <span class="truncate text-center">
                {{ option.label }}
              </span>
            </button>
          </div>
        </Scrollbar>
      </template>
    </div>
  </div>
</template>
