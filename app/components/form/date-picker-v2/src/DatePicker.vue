<script setup lang="ts">
import type { TimeValue } from "reka-ui";
import type { PropType } from "vue";
import { CalendarDateTime, Time } from "@internationalized/date";
import { computed, ref, shallowRef, watch } from "vue";
import dayjs from "dayjs";

const modelValue = defineModel<Date | string | null>({});

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: "请选择日期"
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
  }
});

const popoverOpen = ref(false);

const dateValue = shallowRef<CalendarDateTime | null>(null);
const timeValue = shallowRef<TimeValue | null>(null);

watch(
  modelValue,
  (newValue) => {
    let d: dayjs.Dayjs | null = null;

    if (typeof newValue === "string") {
      d = dayjs(newValue, props.format);
    } else if (newValue instanceof Date) {
      d = dayjs(newValue);
    }

    if (d && d.isValid()) {
      dateValue.value = new CalendarDateTime(
        d.year(),
        d.month() + 1,
        d.date(),
        d.hour(),
        d.minute(),
        d.second()
      );
      timeValue.value = new Time(d.hour(), d.minute(), d.second());
      return;
    }

    dateValue.value = null;
    timeValue.value = null;
  },
  { immediate: true }
);

const handleClear = () => {
  modelValue.value = null;
  dateValue.value = null;
  timeValue.value = null;
  popoverOpen.value = false;
};

const handleChange = () => {
  if (dateValue.value) {
    const d = dayjs({
      year: dateValue.value.year,
      month: dateValue.value.month - 1,
      day: dateValue.value.day,
      hour: timeValue.value?.hour || 0,
      minute: timeValue.value?.minute || 0,
      second: timeValue.value?.second || 0
    });

    modelValue.value = d.format(props.format);
    return;
  }

  modelValue.value = null;
};

const displayText = computed(() => {
  if (!dateValue.value) {
    return props.placeholder;
  }

  const d = dayjs({
    year: dateValue.value.year,
    month: dateValue.value.month - 1,
    day: dateValue.value.day,
    hour: timeValue.value?.hour || 0,
    minute: timeValue.value?.minute || 0,
    second: timeValue.value?.second || 0
  });

  if (props.type === "date") {
    return d.format(props.showFormat.date);
  }

  return d.format(`${props.showFormat.date} ${props.showFormat.time}`);
});

const displayDate = computed(() => {
  if (!dateValue.value) {
    return "";
  }

  return dayjs({
    year: dateValue.value.year,
    month: dateValue.value.month - 1,
    day: dateValue.value.day
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
            v-if="dateValue"
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
      <UCalendar v-model="dateValue" class="p-2" @update:model-value="handleChange" />

      <UFieldGroup v-if="props.type === 'datetime'" class="p-2">
        <UInput :value="displayDate" readonly class="w-32" />
        <UInputTime
          v-model="timeValue"
          granularity="second"
          icon="lucide:clock"
          @change="handleChange"
        />
      </UFieldGroup>
    </template>
  </UPopover>
</template>
