<script setup lang="ts">
import type { DateRange, TimeValue } from "reka-ui";
import type { PropType } from "vue";
import type {
  DatePickerMode,
  DatePickerRangeValue,
  DatePickerShowFormat,
  DatePickerValueType
} from "./types";
import { TimePicker } from "@/components/form/time-picker";
import { computed, ref, shallowRef, watch } from "vue";
import {
  createDayjsRangeFromValue,
  formatDateRangePickerValue,
  parsePickerModelValue,
  syncRangePickerValue
} from "./utils";

const modelValue = defineModel<DatePickerRangeValue | null>({});

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: "请选择日期范围"
  },
  confirmText: {
    type: String,
    default: "确定"
  },
  cancelText: {
    type: String,
    default: "取消"
  },
  format: {
    type: String,
    default: "YYYY-MM-DD HH:mm:ss"
  },
  valueType: {
    type: String as PropType<DatePickerValueType>,
    default: "string"
  },
  showFormat: {
    type: Object as PropType<DatePickerShowFormat>,
    default: () => ({ date: "YYYY-MM-DD", time: "HH:mm:ss" })
  },
  type: {
    type: String as PropType<DatePickerMode>,
    default: "date"
  },
  numberOfMonths: {
    type: Number,
    default: 2
  }
});

const popoverOpen = ref(false);

const rangeValue = shallowRef<DateRange | null>(null);
const startTimeValue = shallowRef<TimeValue | null>(null);
const endTimeValue = shallowRef<TimeValue | null>(null);

// 范围选择在弹层中维护草稿值，点击确定后才统一写回 v-model。
const createSelectedRange = () => {
  return createDayjsRangeFromValue(rangeValue.value, startTimeValue.value, endTimeValue.value);
};

// 外部值可能是字符串或 Date，这里统一转换为日历与时间组件可识别的值。
const syncCurrentModelValue = () => {
  syncRangePickerValue(
    parsePickerModelValue(modelValue.value?.start, props.format),
    parsePickerModelValue(modelValue.value?.end, props.format),
    (value) => {
      rangeValue.value = value;
    },
    (value) => {
      startTimeValue.value = value;
    },
    (value) => {
      endTimeValue.value = value;
    }
  );
};

watch(
  modelValue,
  () => {
    syncCurrentModelValue();
  },
  { immediate: true, deep: true }
);

const handleClear = () => {
  modelValue.value = null;
  rangeValue.value = null;
  startTimeValue.value = null;
  endTimeValue.value = null;
  popoverOpen.value = false;
};

const handleConfirm = () => {
  const selectedRange = createSelectedRange();

  if (selectedRange?.start && selectedRange.end) {
    modelValue.value = formatDateRangePickerValue(
      {
        start: selectedRange.start,
        end: selectedRange.end
      },
      props.valueType,
      props.format
    );
  } else {
    modelValue.value = null;
  }

  popoverOpen.value = false;
};

const handleCancel = () => {
  syncCurrentModelValue();
  popoverOpen.value = false;
};

const displayText = computed(() => {
  const startValue = parsePickerModelValue(modelValue.value?.start, props.format);
  const endValue = parsePickerModelValue(modelValue.value?.end, props.format);

  if (!startValue?.isValid() || !endValue?.isValid()) {
    return props.placeholder;
  }

  if (props.type === "date") {
    return `${startValue.format(props.showFormat.date)} ~ ${endValue.format(props.showFormat.date)}`;
  }

  return `${startValue.format(`${props.showFormat.date} ${props.showFormat.time}`)} ~ ${endValue.format(`${props.showFormat.date} ${props.showFormat.time}`)}`;
});

const displayStartDate = computed(() => {
  const selectedRange = createSelectedRange();

  if (!selectedRange?.start) {
    return "";
  }

  return selectedRange.start.format(props.showFormat.date);
});

const displayEndDate = computed(() => {
  const selectedRange = createSelectedRange();

  if (!selectedRange?.end) {
    return "";
  }

  return selectedRange.end.format(props.showFormat.date);
});
</script>

<template>
  <UPopover
    v-model:open="popoverOpen"
    :disabled="props.disabled"
    :content="{
      onOpenAutoFocus: (event) => event.preventDefault()
    }"
  >
    <UButton
      color="neutral"
      variant="subtle"
      icon="i-lucide-calendar"
      class="w-full"
      v-bind="$attrs"
      :disabled="props.disabled"
    >
      <span class="truncate flex-1 text-left">
        {{ displayText }}
      </span>

      <template #trailing>
        <UIcon
          v-if="(rangeValue?.start || rangeValue?.end) && props.clearable"
          name="lucide:x"
          class="cursor-pointer shrink-0 text-muted size-5"
          :class="{ 'opacity-50': props.disabled }"
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

    <template #content>
      <UCalendar v-model="rangeValue" class="p-2" range :number-of-months="props.numberOfMonths" />

      <div v-if="props.type === 'datetime'" class="flex">
        <UFieldGroup class="p-2 pt-0">
          <UInput
            variant="subtle"
            icon="lucide:calendar"
            :value="displayStartDate"
            readonly
            class="w-36"
          />
          <TimePicker
            class="w-36"
            v-model="startTimeValue"
            value-type="time"
            show-format="HH:mm:ss"
          />
        </UFieldGroup>
        <UFieldGroup class="p-2 pt-0">
          <UInput
            variant="subtle"
            icon="lucide:calendar"
            :value="displayEndDate"
            readonly
            class="w-36"
          />
          <TimePicker
            class="w-36"
            v-model="endTimeValue"
            value-type="time"
            show-format="HH:mm:ss"
          />
        </UFieldGroup>
      </div>

      <div class="flex justify-end gap-2 p-2 border-t border-slate-200">
        <UButton
          color="neutral"
          variant="subtle"
          size="xs"
          :label="props.cancelText"
          @click="handleCancel"
        />
        <UButton color="primary" size="xs" :label="props.confirmText" @click="handleConfirm" />
      </div>
    </template>
  </UPopover>
</template>
