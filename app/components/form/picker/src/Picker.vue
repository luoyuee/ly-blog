<script setup lang="ts">
import type { PropType } from "vue";
import type {
  PickerColumn,
  PickerFieldNames,
  PickerItems,
  PickerMode,
  PickerPrimitive,
  PickerSelectionState
} from "./types";
import { computed, nextTick, ref, watch } from "vue";
import {
  getPickerColumnItems,
  getPickerDisplayText,
  getPickerDisplayState,
  getPickerOptionItems,
  getPickerOutputSelection,
  normalizePickerColumns,
  normalizePickerOptions,
  resolvePickerSelection
} from "./utils";
import PickerPanel from "./PickerPanel.vue";

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
  confirmText: {
    type: String,
    default: "确定"
  },
  cancelText: {
    type: String,
    default: "取消"
  },
  itemHeight: {
    type: Number,
    default: 44
  },
  visibleItemCount: {
    type: Number,
    default: 5
  },
  disabled: {
    type: Boolean,
    default: false
  },
  arrowControl: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: "请选择"
  },
  separator: {
    type: String,
    default: "/"
  },
  popoverContentClass: {
    type: String,
    default: ""
  }
});

const emit = defineEmits<{
  change: [value: PickerPrimitive[]];
  confirm: [value: PickerPrimitive[]];
  cancel: [value: PickerPrimitive[]];
}>();

type PickerTriggerSlotProps = {
  selected: PickerPrimitive[];
  open: boolean;
  displayText: string;
  clearable: boolean;
  disabled: boolean;
  placeholder: string;
  clear: () => void;
};

defineSlots<{
  trigger?: (props: PickerTriggerSlotProps) => unknown;
}>();

const popoverOpen = ref(false);

// Picker 是带触发器和弹层按钮的上层封装：面板内选择只写入 draft，点击确定后才提交给父级。
// 如果需要“选择即生效”的场景，请直接使用 PickerPanel。
const tempSelection = ref<PickerPrimitive[]>([]);

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

// 触发器展示只读外部真实值，不自动补齐默认可选项，避免清空后按钮文案又显示第一项。
const displayState = computed(() => {
  return getPickerDisplayState({
    mode: props.mode,
    sourceSelection: modelValue.value,
    normalizedColumns: normalizedColumns.value,
    normalizedOptions: normalizedOptions.value,
    shouldResolveSelection: false
  });
});

const displayText = computed(() => {
  return getPickerDisplayText(
    displayState.value.columns,
    displayState.value.selection,
    props.placeholder,
    props.separator
  );
});

// 默认 class 会让弹层宽度跟随触发器；外部如需更宽内容区，也可以覆盖该类名。
const popoverUi = computed(() => ({
  content: `w-(--reka-popper-anchor-width) p-0 ${props.popoverContentClass}`
}));

const getConfirmedSelection = () => {
  return getPickerOutputSelection(getResolvedSelection(tempSelection.value));
};

// 弹层关闭时才跟随外部值，避免用户正在编辑 draft 时被外部联动覆盖。
const syncTempSelection = () => {
  tempSelection.value = modelValue.value.slice();
};

// 每次打开都把 draft 修正为可渲染、可滚动、可提交的有效路径。
const initializeTempSelection = () => {
  tempSelection.value = getPickerOutputSelection(getResolvedSelection(modelValue.value));
};

watch(
  modelValue,
  () => {
    if (!popoverOpen.value) {
      syncTempSelection();
    }
  },
  { immediate: true, deep: true }
);

watch(popoverOpen, async (newVal) => {
  if (newVal) {
    initializeTempSelection();
    // 等 PickerPanel 完成列渲染后再让内部 watch/滚动定位接管，避免打开瞬间滚动条引用为空。
    await nextTick();
  }
});

const handleConfirm = () => {
  const nextValue = getConfirmedSelection();

  modelValue.value = nextValue;
  popoverOpen.value = false;
  emit("confirm", nextValue);
};

const handleCancel = () => {
  const currentValue = modelValue.value.slice();

  syncTempSelection();
  popoverOpen.value = false;
  emit("cancel", currentValue);
};

const handleClear = () => {
  if (props.disabled || !props.clearable) {
    return;
  }

  modelValue.value = [];
  popoverOpen.value = false;
  emit("confirm", []);
};
</script>

<template>
  <UPopover v-model:open="popoverOpen" :disabled="props.disabled" :ui="popoverUi">
    <slot
      name="trigger"
      :selected="modelValue"
      :open="popoverOpen"
      :display-text="displayText"
      :clearable="props.clearable"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      :clear="handleClear"
    >
      <UButton color="neutral" variant="subtle" class="w-full" :disabled="props.disabled">
        <span class="min-w-0 flex-1 truncate text-left">
          {{ displayText }}
        </span>

        <template #trailing>
          <UIcon
            v-if="props.clearable && modelValue.length > 0 && !props.disabled"
            name="lucide:x"
            class="cursor-pointer shrink-0 text-muted size-5"
            @click.stop="handleClear"
          />
          <UIcon
            v-else
            class="shrink-0 text-dimmed size-5"
            :name="popoverOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            :class="{ 'opacity-50': props.disabled }"
          />
        </template>
      </UButton>
    </slot>

    <template #content>
      <div>
        <PickerPanel
          v-model="tempSelection"
          :mode="props.mode"
          :items="props.items"
          :field-names="props.fieldNames"
          :item-height="props.itemHeight"
          :visible-item-count="props.visibleItemCount"
          :arrow-control="props.arrowControl"
        />

        <div class="flex justify-end gap-2 p-2 border-t border-muted">
          <UButton
            color="neutral"
            variant="subtle"
            size="xs"
            :label="props.cancelText"
            @click="handleCancel"
          />
          <UButton color="primary" size="xs" :label="props.confirmText" @click="handleConfirm" />
        </div>
      </div>
    </template>
  </UPopover>
</template>
