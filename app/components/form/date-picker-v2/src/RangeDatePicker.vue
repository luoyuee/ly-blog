<script setup lang="ts">
import type { DateRange, TimeValue } from "reka-ui";
import type { PropType } from "vue";
import { CalendarDateTime, Time } from "@internationalized/date";
import { computed, ref, shallowRef, watch } from "vue";
import dayjs from "dayjs";

const modelValue = defineModel<{
  start: Date | string | null;
  end: Date | string | null;
} | null>({});

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: "请选择日期范围"
  },
  format: {
    type: String,
    default: "YYYY-MM-DD HH:mm:ss"
  },
  showFormat: {
    type: Object as PropType<{
      date: string;
      time: string;
    }>,
    default: () => ({ date: "YYYY-MM-DD", time: "HH:mm:ss" })
  },
  type: {
    type: String as PropType<"date" | "datetime">,
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

const toCalendarDateTime = (d: dayjs.Dayjs) => {
  return new CalendarDateTime(d.year(), d.month() + 1, d.date(), d.hour(), d.minute(), d.second());
};

const toTime = (d: dayjs.Dayjs) => {
  return new Time(d.hour(), d.minute(), d.second());
};

watch(
  modelValue,
  (newValue) => {
    if (newValue?.start && newValue?.end) {
      const start =
        typeof newValue.start === "string"
          ? dayjs(newValue.start, props.format)
          : dayjs(newValue.start);

      const end =
        typeof newValue.end === "string" ? dayjs(newValue.end, props.format) : dayjs(newValue.end);

      if (start.isValid() && end.isValid()) {
        rangeValue.value = {
          start: toCalendarDateTime(start),
          end: toCalendarDateTime(end)
        };

        startTimeValue.value = toTime(start);

        endTimeValue.value = toTime(end);

        return;
      }
    }

    rangeValue.value = null;
    startTimeValue.value = null;
    endTimeValue.value = null;
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

const handleChange = () => {
  if (rangeValue.value?.start && rangeValue.value?.end) {
    const start = dayjs({
      year: rangeValue.value.start.year,
      month: rangeValue.value.start.month - 1,
      day: rangeValue.value.start.day,
      hour: startTimeValue.value?.hour || 0,
      minute: startTimeValue.value?.minute || 0,
      second: startTimeValue.value?.second || 0
    });

    const end = dayjs({
      year: rangeValue.value.end.year,
      month: rangeValue.value.end.month - 1,
      day: rangeValue.value.end.day,
      hour: endTimeValue.value?.hour || 0,
      minute: endTimeValue.value?.minute || 0,
      second: endTimeValue.value?.second || 0
    });

    modelValue.value = {
      start: start.format(props.format),
      end: end.format(props.format)
    };
    return;
  }

  modelValue.value = null;
};

const displayText = computed(() => {
  if (!rangeValue.value?.start || !rangeValue.value?.end) {
    return props.placeholder;
  }

  const start = dayjs({
    year: rangeValue.value.start.year,
    month: rangeValue.value.start.month - 1,
    day: rangeValue.value.start.day,
    hour: startTimeValue.value?.hour || 0,
    minute: startTimeValue.value?.minute || 0,
    second: startTimeValue.value?.second || 0
  });

  const end = dayjs({
    year: rangeValue.value.end.year,
    month: rangeValue.value.end.month - 1,
    day: rangeValue.value.end.day,
    hour: endTimeValue.value?.hour || 0,
    minute: endTimeValue.value?.minute || 0,
    second: endTimeValue.value?.second || 0
  });

  if (props.type === "date") {
    return `${start.format(props.showFormat.date)} ~ ${end.format(props.showFormat.date)}`;
  }

  return `${start.format(`${props.showFormat.date} ${props.showFormat.time}`)} ~ ${end.format(`${props.showFormat.date} ${props.showFormat.time}`)}`;
});

const displayStartDate = computed(() => {
  if (!rangeValue.value?.start) {
    return "";
  }

  return dayjs({
    year: rangeValue.value.start.year,
    month: rangeValue.value.start.month - 1,
    day: rangeValue.value.start.day
  }).format(props.showFormat.date);
});

const displayEndDate = computed(() => {
  if (!rangeValue.value?.end) {
    return "";
  }

  return dayjs({
    year: rangeValue.value.end.year,
    month: rangeValue.value.end.month - 1,
    day: rangeValue.value.end.day
  }).format(props.showFormat.date);
});
</script>

<template>
  <UPopover v-model:open="popoverOpen" :disabled="props.disabled">
    <UButton
      color="neutral"
      variant="subtle"
      icon="lucide:calendar"
      class="w-full"
      v-bind="$attrs"
      :disabled="props.disabled"
    >
      <div class="w-full flex justify-between items-center overflow-hidden">
        <span class="truncate flex-1 text-left">
          {{ displayText }}
        </span>
        <span class="shrink-0">
          <UIcon
            v-if="rangeValue?.start || rangeValue?.end"
            name="lucide:x"
            class="cursor-pointer"
            :class="{ 'opacity-50': props.disabled }"
            @click.stop="handleClear"
          />
          <UIcon
            v-else
            :name="popoverOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            :class="{ 'opacity-50': props.disabled }"
          />
        </span>
      </div>
    </UButton>

    <template #content>
      <UCalendar
        v-model="rangeValue"
        class="p-2"
        range
        :number-of-months="props.numberOfMonths"
        @update:model-value="handleChange"
      />

      <div v-if="props.type === 'datetime'" class="flex">
        <UFieldGroup class="p-2">
          <UInput :value="displayStartDate" readonly class="w-32" />
          <UInputTime
            v-model="startTimeValue"
            granularity="second"
            icon="lucide:clock"
            @change="handleChange"
          />
        </UFieldGroup>
        <UFieldGroup class="p-2">
          <UInput :value="displayEndDate" readonly class="w-32" />
          <UInputTime
            v-model="endTimeValue"
            granularity="second"
            icon="lucide:clock"
            @change="handleChange"
          />
        </UFieldGroup>
      </div>
    </template>
  </UPopover>
</template>
