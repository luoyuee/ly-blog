<script setup lang="ts">
import type { CalendarItem, CalendarFormModalResult } from "#shared/types/ly-editor";
import type { PropType } from "vue";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "@/composables/useForm";
import { computed, watch } from "vue";
import { z } from "zod";

const { t } = useI18n();
const $notify = useNotification();

const open = defineModel<boolean>("open", {
  default: false
});

const props = defineProps({
  mode: {
    type: String as PropType<"create" | "update">,
    default: "create"
  },
  record: {
    type: Object as PropType<CalendarItem | undefined>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [result: CalendarFormModalResult];
}>();

interface FormData {
  id?: number;
  title?: string;
  description?: string;
  color?: string;
}

const schema = z.object({
  id: z.number().optional(),
  title: z
    .string({ message: t("components.lyEditor.modules.calendar.form.validation.titleRequired") })
    .min(1, t("components.lyEditor.modules.calendar.form.validation.titleRequired")),
  description: z.string().optional(),
  color: z.string().optional()
});

const { formData, formState, resetForm, setForm } = useForm<FormData>({
  id: undefined,
  title: undefined,
  description: undefined,
  color: undefined
});

const isEdit = computed(() => {
  return props.mode === "update";
});

const modalTitle = computed(() => {
  return isEdit.value
    ? t("components.lyEditor.modules.calendar.form.editTitle")
    : t("components.lyEditor.modules.calendar.form.createTitle");
});

// 监听弹窗显示，初始化表单与回填数据
watch(
  open,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      const { id, title, description, color } = props.record;
      setForm({
        id,
        title,
        description: description ?? undefined,
        color: color ?? undefined
      });
    }
  },
  {
    immediate: true
  }
);

const formRef = useTemplateRef("formRef");

const handleSubmit = async (_event: { data: z.output<typeof schema> }) => {
  try {
    formState.submitting = true;

    // 暂未接入接口，提交仅作占位，后续在此调用 create/update 接口
    $notify.success({
      title: isEdit.value ? t("message.update.success") : t("message.create.success")
    });

    open.value = false;

    emits("close", {
      action: "submitted"
    });
  } catch (error) {
    $notify.error({
      title: t("message.operate.error"),
      error
    });
  } finally {
    formState.submitting = false;
  }
};

const handleConfirm = async () => {
  formRef.value?.submit();
};

const handleCancel = () => {
  open.value = false;
  emits("close", {
    action: "cancelled"
  });
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
      <UFormField
        name="title"
        :label="t('components.lyEditor.modules.calendar.form.titleLabel')"
        required
      >
        <UInput
          v-model="formData.title"
          :placeholder="t('components.lyEditor.modules.calendar.form.titlePlaceholder')"
        />
      </UFormField>

      <UFormField
        name="description"
        :label="t('components.lyEditor.modules.calendar.form.descriptionLabel')"
      >
        <UTextarea
          v-model="formData.description"
          :placeholder="t('components.lyEditor.modules.calendar.form.descriptionPlaceholder')"
        />
      </UFormField>

      <UFormField name="color" :label="t('components.lyEditor.modules.calendar.form.colorLabel')">
        <UInput
          v-model="formData.color"
          :placeholder="t('components.lyEditor.modules.calendar.form.colorPlaceholder')"
        />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
