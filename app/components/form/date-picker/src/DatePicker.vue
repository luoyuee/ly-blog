<script setup lang="ts">
import type { TimeValue } from "reka-ui";
import type { PropType } from "vue";
import type {
  DatePickerMode,
  DatePickerShowFormat,
  DatePickerValue,
  DatePickerValueType
} from "./types";
import type { CalendarDateTime } from "@internationalized/date";
import { TimePicker } from "@/components/form/time-picker";
import { computed, ref, shallowRef, watch } from "vue";
import {
  createDayjsFromCalendarValue,
  formatDatePickerValue,
  parsePickerModelValue,
  syncSinglePickerValue
} from "./utils";

const modelValue = defineModel<DatePickerValue>({});

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
    default: "请选择日期"
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
  }
});

const popoverOpen = ref(false);

const dateValue = shallowRef<CalendarDateTime | null>(null);
const timeValue = shallowRef<TimeValue | null>(null);

// 组件内部始终使用 dayjs 做格式化和拼接，避免模板层处理多种日期值类型。
const createDayjsFromValue = () => {
  return createDayjsFromCalendarValue(dateValue.value, timeValue.value);
};

// 只在外部 v-model 变化时同步内部草稿值，弹层内选择不会立即污染表单数据。
const syncCurrentModelValue = () => {
  syncSinglePickerValue(
    parsePickerModelValue(modelValue.value, props.format),
    (value) => {
      dateValue.value = value;
    },
    (value) => {
      timeValue.value = value;
    }
  );
};

watch(
  modelValue,
  () => {
    syncCurrentModelValue();
  },
  { immediate: true }
);

const handleClear = () => {
  modelValue.value = null;
  dateValue.value = null;
  timeValue.value = null;
  popoverOpen.value = false;
};

const handleConfirm = () => {
  const selectedValue = createDayjsFromValue();

  if (selectedValue) {
    modelValue.value = formatDatePickerValue(selectedValue, props.valueType, props.format);
  } else if (!props.clearable && modelValue.value) {
    const currentValue = parsePickerModelValue(modelValue.value, props.format);

    if (currentValue?.isValid()) {
      syncCurrentModelValue();
    } else {
      modelValue.value = null;
    }
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
  const selectedValue = parsePickerModelValue(modelValue.value, props.format);

  if (!selectedValue?.isValid()) {
    return props.placeholder;
  }

  if (props.type === "date") {
    return selectedValue.format(props.showFormat.date);
  }

  return selectedValue.format(`${props.showFormat.date} ${props.showFormat.time}`);
});

const displayDate = computed(() => {
  if (!dateValue.value) {
    return "";
  }

  const selectedValue = createDayjsFromValue();

  return selectedValue ? selectedValue.format(props.showFormat.date) : "";
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
          v-if="dateValue && props.clearable"
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
      <UCalendar v-model="dateValue" class="p-2" />

      <UFieldGroup v-if="props.type === 'datetime'" class="p-2 pt-0">
        <UInput
          variant="subtle"
          icon="lucide:calendar"
          placeholder="请选择日期"
          class="w-36"
          readonly
          :model-value="displayDate"
        />
        <TimePicker v-model="timeValue" class="w-36" value-type="time" show-format="HH:mm:ss" />
      </UFieldGroup>

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
    </template>
  </UPopover>
</template>
