<script setup lang="ts">
import type { Time } from "@internationalized/date";
import type { PropType } from "vue";
import type { PickerPrimitive, PickerRawOption } from "@/components/form/picker";
import type {
  TimePickerHourCycle,
  TimePickerInputValue,
  TimePickerRangeInputValue,
  TimePickerRangeValue,
  TimePickerValueType
} from "./types";
import { computed, ref, shallowRef, useAttrs, watch } from "vue";
import { PickerPanel } from "@/components/form/picker";
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
const modelValue = defineModel<TimePickerRangeInputValue>({ default: null });

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
    default: "请选择时间范围"
  },
  startPlaceholder: {
    type: String,
    default: "开始时间"
  },
  endPlaceholder: {
    type: String,
    default: "结束时间"
  },
  separator: {
    type: String,
    default: "~"
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
  }
});

const emit = defineEmits<{
  change: [value: TimePickerRangeValue];
  confirm: [value: TimePickerRangeValue];
  cancel: [value: TimePickerRangeInputValue];
}>();

const popoverOpen = ref(false);

// RangeTimePicker 仍然保留外层“确认后提交”语义。
// 两个 PickerPanel 只负责实时修改这里的 draft，真正的 modelValue 只在 handleConfirm 中更新。
const startTime = shallowRef<Time | null>(null);
const endTime = shallowRef<Time | null>(null);

// PickerPanel 只理解 PickerPrimitive[]，因此时间选择需要先展开为“时/分/秒/上下午”列配置。
const columnModes = computed(() => {
  return getTimePickerColumnModes(props.hourCycle, props.showSecond);
});

// 开始和结束面板共用同一份列数据，保证范围两端的步进、12/24 小时制和秒列展示完全一致。
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

const createSelectionByTime = (time: Time | null) => {
  return createSelectionFromTime(time, columnModes.value, props.hourCycle);
};

const createTimeBySelection = (selection: PickerPrimitive[]) => {
  return createTimeFromSelection(selection, columnModes.value, props.hourCycle);
};

const formatRangeTimeValue = (time: Time) => {
  return formatTimePickerValue(time, props.valueType, props.format);
};

// PickerPanel 的 v-model 是实时 selection；这里用 computed setter 把它桥接成 Time draft。
const startSelection = computed<PickerPrimitive[]>({
  get: () => {
    return createSelectionByTime(startTime.value);
  },
  set: (selection) => {
    startTime.value = createTimeBySelection(selection);
  }
});

const endSelection = computed<PickerPrimitive[]>({
  get: () => {
    return createSelectionByTime(endTime.value);
  },
  set: (selection) => {
    endTime.value = createTimeBySelection(selection);
  }
});

// 只从外部真实值同步到 draft。取消时也调用它，丢弃尚未确认的面板实时选择。
const syncCurrentModelValue = () => {
  startTime.value = parseTimePickerValue(modelValue.value?.start ?? null, props.format);
  endTime.value = parseTimePickerValue(modelValue.value?.end ?? null, props.format);
};

watch(
  modelValue,
  () => {
    syncCurrentModelValue();
  },
  { immediate: true, deep: true }
);

const createRangeValue = (): TimePickerRangeValue => {
  if (!startTime.value || !endTime.value) {
    return null;
  }

  return {
    start: formatRangeTimeValue(startTime.value),
    end: formatRangeTimeValue(endTime.value)
  };
};

// 更新外部值后立刻反向同步 draft，确保 string/time 两种 valueType 下内部 Time 状态一致。
const updateModelValue = (value: TimePickerRangeValue) => {
  modelValue.value = value;
  syncCurrentModelValue();
};

const handleConfirm = () => {
  const nextValue = createRangeValue();

  updateModelValue(nextValue);
  popoverOpen.value = false;
  emit("confirm", nextValue);
  emit("change", nextValue);
};

const handleCancel = () => {
  syncCurrentModelValue();
  popoverOpen.value = false;
  emit("cancel", modelValue.value);
};

const handleClear = () => {
  updateModelValue(null);
  popoverOpen.value = false;
  emit("confirm", null);
  emit("change", null);
};

const formatDisplayValue = (value: TimePickerInputValue) => {
  return formatTimePickerDisplay(parseTimePickerValue(value, props.format), props.showFormat, "");
};

const displayText = computed(() => {
  const startValue = modelValue.value?.start ?? null;
  const endValue = modelValue.value?.end ?? null;

  if (!startValue || !endValue) {
    return props.placeholder;
  }

  const startDisplayText = formatDisplayValue(startValue);
  const endDisplayText = formatDisplayValue(endValue);

  if (!startDisplayText || !endDisplayText) {
    return props.placeholder;
  }

  return `${startDisplayText} ${props.separator} ${endDisplayText}`;
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
      icon="lucide:clock"
      class="w-full"
      :ui="{ leadingIcon: 'text-dimmed' }"
      :disabled="props.disabled"
      v-bind="attrs"
    >
      <span class="min-w-0 flex-1 truncate text-left">
        {{ displayText }}
      </span>

      <template #trailing>
        <UIcon
          v-if="modelValue !== null && props.clearable && !props.disabled"
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

    <template #content>
      <div class="flex items-stretch gap-2 p-2">
        <div class="min-w-0 w-40 overflow-hidden rounded-md border border-slate-200">
          <div class="border-b border-slate-200 px-3 py-2 text-center text-xs text-slate-500">
            {{ props.startPlaceholder }}
          </div>
          <PickerPanel
            v-model="startSelection"
            mode="columns"
            :items="pickerItems"
            :item-height="props.itemHeight"
            :visible-item-count="props.visibleItemCount"
            :arrow-control="props.arrowControl"
          />
        </div>

        <div class="min-w-0 w-40 overflow-hidden rounded-md border border-slate-200">
          <div class="border-b border-slate-200 px-3 py-2 text-center text-xs text-slate-500">
            {{ props.endPlaceholder }}
          </div>
          <PickerPanel
            v-model="endSelection"
            mode="columns"
            :items="pickerItems"
            :item-height="props.itemHeight"
            :visible-item-count="props.visibleItemCount"
            :arrow-control="props.arrowControl"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 border-t border-slate-200 p-2">
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
