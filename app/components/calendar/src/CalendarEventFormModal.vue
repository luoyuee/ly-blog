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

const visible = defineModel<boolean>("visible", {
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

const schema = z
  .object({
    id: z.string(),
    title: z.string({ message: "请输入事件标题" }).min(1, "请输入事件标题"),
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
    recurrenceInterval: z.coerce.number().int().min(1, "重复间隔不能小于 1"),
    recurrenceEndType: z.enum(["never", "count", "until"]),
    recurrenceCount: z.coerce.number().int().min(1, "重复次数不能小于 1"),
    recurrenceUntil: z.string().nullish()
  })
  .superRefine((data, ctx) => {
    if (!data.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "请选择开始日期"
      });
    }

    if (!data.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "请选择结束日期"
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
        message: "请选择截止日期"
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

const modalTitle = computed(() => (isEdit.value ? "编辑事件" : "新建事件"));

/** 事件类型选项 */
const eventTypeOptions = [
  { label: "普通事件", value: "single" },
  { label: "重复事件", value: "recurring" }
];

/** 周期频率选项 */
const recurrenceFrequencyOptions: Array<{
  label: string;
  value: CalendarRecurrenceFrequency;
}> = [
  { label: "每天", value: "DAILY" },
  { label: "每周", value: "WEEKLY" },
  { label: "每月", value: "MONTHLY" },
  { label: "每年", value: "YEARLY" }
];

/** 周期结束方式选项 */
const recurrenceEndTypeOptions: Array<{
  label: string;
  value: CalendarRecurrenceEndType;
}> = [
  { label: "永不结束", value: "never" },
  { label: "按次数结束", value: "count" },
  { label: "按日期结束", value: "until" }
];

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
  visible,
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
  visible.value = false;
};

const handleDelete = () => {
  if (props.record) {
    emit("delete", props.record.id);
  }
};
</script>

<template>
  <BasicModal
    v-model:visible="visible"
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
      <UFormField name="title" label="事件标题" required>
        <UInput v-model="formData.title" placeholder="请输入事件标题" />
      </UFormField>

      <UFormField name="eventType" label="事件类型">
        <UTabs
          v-model="formData.eventType"
          :items="eventTypeOptions"
          :content="false"
          class="w-full"
        />
      </UFormField>

      <UFormField name="allDay" label="全天事件">
        <USwitch v-model="formData.allDay" />
      </UFormField>

      <div v-if="formData.eventType === 'recurring'" class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <UFormField name="recurrenceFrequency" label="重复频率">
          <USelect
            v-model="formData.recurrenceFrequency"
            :items="recurrenceFrequencyOptions"
            value-key="value"
          />
        </UFormField>

        <UFormField name="recurrenceInterval" label="重复间隔">
          <UInput v-model.number="formData.recurrenceInterval" type="number" :min="1" />
        </UFormField>

        <UFormField name="recurrenceEndType" label="结束方式">
          <USelect
            v-model="formData.recurrenceEndType"
            :items="recurrenceEndTypeOptions"
            value-key="value"
          />
        </UFormField>

        <UFormField
          v-if="formData.recurrenceEndType === 'count'"
          name="recurrenceCount"
          label="重复次数"
        >
          <UInput v-model.number="formData.recurrenceCount" type="number" :min="1" />
        </UFormField>

        <UFormField
          v-if="formData.recurrenceEndType === 'until'"
          name="recurrenceUntil"
          label="截止日期"
          required
        >
          <DatePicker v-model="formData.recurrenceUntil" type="date" placeholder="选择截止日期" />
        </UFormField>
      </div>

      <UFormField name="startDate" label="开始时间" required>
        <div class="flex items-center gap-2">
          <DatePicker
            v-model="formData.startDate"
            class="flex-1"
            type="date"
            placeholder="选择日期"
          />
          <TimePicker
            v-if="!formData.allDay"
            v-model="formData.startTime"
            class="w-48"
            show-format="HH:mm:ss"
          />
        </div>
      </UFormField>

      <UFormField name="endDate" label="结束时间" required>
        <div class="flex items-center gap-2">
          <DatePicker
            v-model="formData.endDate"
            class="flex-1"
            type="date"
            placeholder="选择日期"
          />
          <TimePicker
            v-if="!formData.allDay"
            v-model="formData.endTime"
            class="w-48"
            show-format="HH:mm:ss"
          />
        </div>
      </UFormField>

      <UFormField name="location" label="地点">
        <UInput v-model="formData.location" placeholder="请输入地点" />
      </UFormField>

      <UFormField name="color" label="事件颜色">
        <PresetColorPicker v-model="formData.color" />
      </UFormField>

      <UFormField name="description" label="描述">
        <UTextarea v-model="formData.description" placeholder="请输入事件描述" :rows="3" />
      </UFormField>
    </UForm>

    <template #footer>
      <div class="flex w-full items-center justify-between">
        <UButton v-if="isEdit" color="error" variant="soft" label="删除" @click="handleDelete" />
        <div v-else></div>
        <div class="flex gap-2">
          <UButton color="neutral" variant="outline" label="取消" @click="handleCancel" />
          <UButton
            color="primary"
            label="确定"
            :loading="formState.submitting"
            @click="handleConfirm"
          />
        </div>
      </div>
    </template>
  </BasicModal>
</template>
