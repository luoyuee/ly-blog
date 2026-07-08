<script setup lang="ts">
import type { PickerPrimitive, PickerRawOption } from "@/components/form/picker";
import type { PropType } from "vue";
import type {
  TimePickerHourCycle,
  TimePickerInputValue,
  TimePickerValue,
  TimePickerValueType
} from "./types";
import { computed, shallowRef, useAttrs, watch } from "vue";
import { Picker } from "@/components/form/picker";
import {
  createHourColumn,
  createPeriodColumn,
  createSelectionFromTime,
  createTimeFromSelection,
  createTimePickerColumn,
  formatTimePickerDisplay,
  formatTimePickerValue,
  getTimePickerColumnModes,
  parseTimePickerValue
} from "./utils";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const modelValue = defineModel<TimePickerInputValue>({ default: null });

const props = defineProps({
  valueType: {
    type: String as PropType<TimePickerValueType>,
    default: "string"
  },
  format: {
    type: String,
    default: "HH:mm:ss"
  },
  showFormat: {
    type: String,
    default: "HH:mm:ss"
  },
  hourCycle: {
    type: Number as PropType<TimePickerHourCycle>,
    default: 24
  },
  minuteStep: {
    type: Number,
    default: 1
  },
  secondStep: {
    type: Number,
    default: 1
  },
  showSecond: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  arrowControl: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: "请选择时间"
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
  popoverContentClass: {
    type: String,
    default: ""
  }
});

const emit = defineEmits<{
  change: [value: TimePickerValue];
  confirm: [value: TimePickerValue];
  cancel: [value: TimePickerInputValue];
}>();

const selectedTime = shallowRef(parseTimePickerValue(modelValue.value, props.format));

const columnModes = computed(() => {
  return getTimePickerColumnModes(props.hourCycle, props.showSecond);
});

const pickerItems = computed<PickerRawOption[][]>(() => {
  const columns: PickerRawOption[][] = [
    createHourColumn(props.hourCycle),
    createTimePickerColumn(59, props.minuteStep)
  ];

  if (props.showSecond) {
    columns.push(createTimePickerColumn(59, props.secondStep));
  }

  if (props.hourCycle === 12) {
    columns.push(createPeriodColumn());
  }

  return columns;
});

const pickerValue = computed<PickerPrimitive[]>(() => {
  return createSelectionFromTime(selectedTime.value, columnModes.value, props.hourCycle);
});

const displayText = computed(() => {
  return formatTimePickerDisplay(selectedTime.value, props.showFormat, props.placeholder);
});

const hasValue = computed(() => modelValue.value !== null);

watch(
  modelValue,
  (newVal) => {
    selectedTime.value = parseTimePickerValue(newVal, props.format);
  },
  { immediate: true }
);

const updateModelValue = (value: TimePickerValue) => {
  modelValue.value = value;
  selectedTime.value = parseTimePickerValue(value, props.format);
};

const handlePickerConfirm = (selection: PickerPrimitive[]) => {
  const time = createTimeFromSelection(selection, columnModes.value, props.hourCycle);
  const nextValue = formatTimePickerValue(time, props.valueType, props.format);

  updateModelValue(nextValue);
  emit("confirm", nextValue);
  emit("change", nextValue);
};

const handlePickerCancel = () => {
  emit("cancel", modelValue.value);
};

const handleClear = () => {
  updateModelValue(null);
  emit("confirm", null);
  emit("change", null);
};
</script>

<template>
  <Picker
    mode="columns"
    :model-value="pickerValue"
    :items="pickerItems"
    :disabled="props.disabled"
    :clearable="props.clearable"
    :arrow-control="props.arrowControl"
    :placeholder="props.placeholder"
    :confirm-text="props.confirmText"
    :cancel-text="props.cancelText"
    :item-height="props.itemHeight"
    :visible-item-count="props.visibleItemCount"
    :popover-content-class="props.popoverContentClass"
    separator=":"
    @confirm="handlePickerConfirm"
    @cancel="handlePickerCancel"
  >
    <template #trigger="{ open }">
      <slot
        name="trigger"
        :selected="modelValue"
        :time="selectedTime"
        :open="open"
        :display-text="displayText"
        :clearable="props.clearable"
        :disabled="props.disabled"
        :placeholder="props.placeholder"
        :clear="handleClear"
      >
        <UButton
          color="neutral"
          variant="outline"
          icon="lucide:clock"
          :ui="{ leadingIcon: 'text-dimmed' }"
          :disabled="props.disabled"
          v-bind="attrs"
        >
          <span class="min-w-0 flex-1 truncate text-left" :class="{ 'text-dimmed': !hasValue }">
            {{ displayText }}
          </span>

          <template #trailing>
            <UIcon
              v-if="props.clearable && modelValue !== null && !props.disabled"
              name="lucide:x"
              class="cursor-pointer shrink-0 text-muted size-5"
              @click.stop="handleClear"
            />
            <UIcon
              v-else
              class="shrink-0 text-dimmed size-5 transition-transform duration-200"
              name="lucide:chevron-down"
              :class="{
                'rotate-180': open,
                'opacity-75': props.disabled
              }"
            />
          </template>
        </UButton>
      </slot>
    </template>
  </Picker>
</template>
