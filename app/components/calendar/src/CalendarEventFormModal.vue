<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type {
  CalendarEvent,
  CalendarRecurrenceEndType,
  CalendarRecurrenceFrequency
} from "./types";
import type { PropType } from "vue";
import { BasicModal } from "@/components/basic-modal";
import { PresetColorPicker } from "@/components/form/color-picker";
import { DatePicker } from "@/components/form/date-picker";
import { TimePicker } from "@/components/form/time-picker";
import { useForm } from "@/composables/useForm";
import dayjs from "dayjs";
import { computed, watch } from "vue";
import { z } from "zod";

const open = defineModel<boolean>("open", {
  default: false
});

const props = defineProps({
  mode: {
    type: String as PropType<"create" | "edit">,
    default: "create"
  },
  record: {
    type: Object as PropType<CalendarEvent | undefined>,
    default: undefined
  }
});

const emit = defineEmits<{
  submit: [event: CalendarEvent];
  delete: [id: string];
}>();

interface FormData {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  allDay: boolean;
  color?: string;
  eventType: "single" | "recurring";
  recurrenceFrequency: CalendarRecurrenceFrequency;
  recurrenceInterval: number;
  recurrenceEndType: CalendarRecurrenceEndType;
  recurrenceCount: number;
  recurrenceUntil: string | null;
}

const { t } = useI18n();

const schema = z
  .object({
    id: z.string(),
    title: z
      .string({ message: t("components.calendar.validation.titleRequired") })
      .min(1, t("components.calendar.validation.titleRequired")),
    description: z.string().nullish(),
    location: z.string().nullish(),
    startDate: z.string().nullish(),
    startTime: z.string().nullish(),
    endDate: z.string().nullish(),
    endTime: z.string().nullish(),
    allDay: z.boolean(),
    color: z.string().nullish(),
    eventType: z.enum(["single", "recurring"]),
    recurrenceFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
    recurrenceInterval: z.coerce
      .number()
      .int()
      .min(1, t("components.calendar.validation.intervalMin")),
    recurrenceEndType: z.enum(["never", "count", "until"]),
    recurrenceCount: z.coerce.number().int().min(1, t("components.calendar.validation.countMin")),
    recurrenceUntil: z.string().nullish()
  })
  .superRefine((data, ctx) => {
    if (!data.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: t("components.calendar.validation.startRequired")
      });
    }

    if (!data.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: t("components.calendar.validation.endRequired")
      });
    }

    if (
      data.eventType === "recurring" &&
      data.recurrenceEndType === "until" &&
      !data.recurrenceUntil
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["recurrenceUntil"],
        message: t("components.calendar.validation.untilRequired")
      });
    }
  });

const { formData, formState, resetForm, setForm } = useForm<FormData>({
  id: "",
  title: "",
  description: undefined,
  location: undefined,
  startDate: null,
  startTime: null,
  endDate: null,
  endTime: null,
  allDay: false,
  color: undefined,
  eventType: "single",
  recurrenceFrequency: "WEEKLY",
  recurrenceInterval: 1,
  recurrenceEndType: "never",
  recurrenceCount: 10,
  recurrenceUntil: null
});

const isEdit = computed(() => props.mode === "edit");

const modalTitle = computed(() =>
  isEdit.value ? t("components.calendar.form.editTitle") : t("components.calendar.form.createTitle")
);

/** 事件类型选项 */
const eventTypeOptions = computed(() => [
  { label: t("components.calendar.form.single"), value: "single" },
  { label: t("components.calendar.form.recurring"), value: "recurring" }
]);

/** 周期频率选项 */
const recurrenceFrequencyOptions = computed<
  Array<{ label: string; value: CalendarRecurrenceFrequency }>
>(() => [
  { label: t("components.calendar.form.daily"), value: "DAILY" },
  { label: t("components.calendar.form.weekly"), value: "WEEKLY" },
  { label: t("components.calendar.form.monthly"), value: "MONTHLY" },
  { label: t("components.calendar.form.yearly"), value: "YEARLY" }
]);

/** 周期结束方式选项 */
const recurrenceEndTypeOptions = computed<
  Array<{ label: string; value: CalendarRecurrenceEndType }>
>(() => [
  { label: t("components.calendar.form.endNever"), value: "never" },
  { label: t("components.calendar.form.endByCount"), value: "count" },
  { label: t("components.calendar.form.endByUntil"), value: "until" }
]);

/**
 * 将 ISO 字符串拆分为日期和时间两部分
 * 全天事件只取日期，非全天事件取日期和时间
 */
const splitDateTime = (iso: string, allDay: boolean) => {
  const d = dayjs(iso);
  if (!d.isValid()) return { date: null, time: null };
  if (allDay) {
    return { date: d.format("YYYY-MM-DD"), time: null };
  }
  return { date: d.format("YYYY-MM-DD"), time: d.format("HH:mm:ss") };
};

/** 将日期和时间组合为 ISO 字符串 */
const combineDateTime = (
  date: string | null | undefined,
  time: string | null | undefined,
  allDay: boolean
) => {
  if (!date) return "";
  if (allDay) {
    return dayjs(date).startOf("day").toISOString();
  }
  const timeStr = time ?? "00:00:00";
  return dayjs(`${date} ${timeStr}`).toISOString();
};

// 监听弹窗显示，初始化表单与回填数据
watch(
  open,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      const startParts = splitDateTime(props.record.start, props.record.allDay);
      const endParts = splitDateTime(props.record.end, props.record.allDay);

      setForm({
        id: props.record.id,
        title: props.record.title,
        description: props.record.description,
        location: props.record.location,
        startDate: startParts.date,
        startTime: startParts.time,
        endDate: endParts.date,
        endTime: endParts.time,
        allDay: props.record.allDay,
        color: props.record.color,
        eventType: props.record.recurrence ? "recurring" : "single",
        recurrenceFrequency: props.record.recurrence?.frequency ?? "WEEKLY",
        recurrenceInterval: props.record.recurrence?.interval ?? 1,
        recurrenceEndType: props.record.recurrence?.endType ?? "never",
        recurrenceCount: props.record.recurrence?.count ?? 10,
        recurrenceUntil: props.record.recurrence?.until
          ? dayjs(props.record.recurrence.until).format("YYYY-MM-DD")
          : null
      });
    }
  },
  { immediate: true }
);

// 全天事件切换时清空时间
watch(
  () => formData.allDay,
  (newVal) => {
    if (newVal) {
      formData.startTime = null;
      formData.endTime = null;
    }
  }
);

const formRef = useTemplateRef("formRef");

const handleSubmit = (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    formState.submitting = true;

    const result: CalendarEvent = {
      id: event.data.id,
      title: event.data.title,
      description: event.data.description ?? undefined,
      location: event.data.location ?? undefined,
      start: combineDateTime(event.data.startDate, event.data.startTime, event.data.allDay),
      end: combineDateTime(event.data.endDate, event.data.endTime, event.data.allDay),
      allDay: event.data.allDay,
      color: event.data.color ?? undefined,
      recurrence:
        event.data.eventType === "recurring"
          ? {
              frequency: event.data.recurrenceFrequency,
              interval: event.data.recurrenceInterval,
              endType: event.data.recurrenceEndType,
              count:
                event.data.recurrenceEndType === "count" ? event.data.recurrenceCount : undefined,
              until:
                event.data.recurrenceEndType === "until" && event.data.recurrenceUntil
                  ? dayjs(event.data.recurrenceUntil).endOf("day").toISOString()
                  : undefined
            }
          : undefined
    };

    emit("submit", result);
  } finally {
    formState.submitting = false;
  }
};

const handleConfirm = () => {
  formRef.value?.submit();
};

const handleCancel = () => {
  open.value = false;
};

const handleDelete = () => {
  if (props.record) {
    emit("delete", props.record.id);
  }
};
</script>

<template>
  <BasicModal
    v-model:open="open"
    :title="modalTitle"
    :submitting="formState.submitting"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <UForm
      ref="formRef"
      class="space-y-2"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField name="title" :label="$t('components.calendar.form.titleLabel')" required>
        <UInput
          v-model="formData.title"
          :placeholder="$t('components.calendar.form.titlePlaceholder')"
        />
      </UFormField>

      <UFormField name="eventType" :label="$t('components.calendar.form.eventTypeLabel')">
        <UTabs
          v-model="formData.eventType"
          :items="eventTypeOptions"
          :content="false"
          class="w-full"
        />
      </UFormField>

      <UFormField name="allDay" :label="$t('components.calendar.form.allDayLabel')">
        <USwitch v-model="formData.allDay" />
      </UFormField>

      <div v-if="formData.eventType === 'recurring'" class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <UFormField
          name="recurrenceFrequency"
          :label="$t('components.calendar.form.frequencyLabel')"
        >
          <USelect
            v-model="formData.recurrenceFrequency"
            :items="recurrenceFrequencyOptions"
            value-key="value"
          />
        </UFormField>

        <UFormField name="recurrenceInterval" :label="$t('components.calendar.form.intervalLabel')">
          <UInput v-model.number="formData.recurrenceInterval" type="number" :min="1" />
        </UFormField>

        <UFormField name="recurrenceEndType" :label="$t('components.calendar.form.endTypeLabel')">
          <USelect
            v-model="formData.recurrenceEndType"
            :items="recurrenceEndTypeOptions"
            value-key="value"
          />
        </UFormField>

        <UFormField
          v-if="formData.recurrenceEndType === 'count'"
          name="recurrenceCount"
          :label="$t('components.calendar.form.countLabel')"
        >
          <UInput v-model.number="formData.recurrenceCount" type="number" :min="1" />
        </UFormField>

        <UFormField
          v-if="formData.recurrenceEndType === 'until'"
          name="recurrenceUntil"
          :label="$t('components.calendar.form.untilLabel')"
          required
        >
          <DatePicker
            v-model="formData.recurrenceUntil"
            type="date"
            :placeholder="$t('components.calendar.form.untilPlaceholder')"
          />
        </UFormField>
      </div>

      <UFormField name="startDate" :label="$t('components.calendar.form.startLabel')" required>
        <div class="flex items-center gap-2">
          <DatePicker
            v-model="formData.startDate"
            class="flex-1"
            type="date"
            :placeholder="$t('components.calendar.form.datePlaceholder')"
          />
          <TimePicker
            v-if="!formData.allDay"
            v-model="formData.startTime"
            class="w-48"
            show-format="HH:mm:ss"
          />
        </div>
      </UFormField>

      <UFormField name="endDate" :label="$t('components.calendar.form.endLabel')" required>
        <div class="flex items-center gap-2">
          <DatePicker
            v-model="formData.endDate"
            class="flex-1"
            type="date"
            :placeholder="$t('components.calendar.form.datePlaceholder')"
          />
          <TimePicker
            v-if="!formData.allDay"
            v-model="formData.endTime"
            class="w-48"
            show-format="HH:mm:ss"
          />
        </div>
      </UFormField>

      <UFormField name="location" :label="$t('components.calendar.form.locationLabel')">
        <UInput
          v-model="formData.location"
          :placeholder="$t('components.calendar.form.locationPlaceholder')"
        />
      </UFormField>

      <UFormField name="color" :label="$t('components.calendar.form.colorLabel')">
        <PresetColorPicker v-model="formData.color" />
      </UFormField>

      <UFormField name="description" :label="$t('components.calendar.form.descriptionLabel')">
        <UTextarea
          v-model="formData.description"
          :placeholder="$t('components.calendar.form.descriptionPlaceholder')"
          :rows="3"
        />
      </UFormField>
    </UForm>

    <template #footer>
      <div class="flex w-full items-center justify-between">
        <UButton
          v-if="isEdit"
          color="error"
          variant="soft"
          :label="$t('common.delete')"
          @click="handleDelete"
        />
        <div v-else></div>
        <div class="flex gap-2">
          <UButton
            color="neutral"
            variant="outline"
            :label="$t('common.cancel')"
            @click="handleCancel"
          />
          <UButton
            color="primary"
            :label="$t('common.ok')"
            :loading="formState.submitting"
            @click="handleConfirm"
          />
        </div>
      </div>
    </template>
  </BasicModal>
</template>
