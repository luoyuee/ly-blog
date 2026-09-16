<script setup lang="ts">
import type { MindmapItem, MindmapFormModalResult } from "#shared/types/ly-editor";
import type { FormSubmitEvent } from "@nuxt/ui";
import { createMindmap, updateMindmap } from "@/apis/canvas-document";
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
    type: Object as PropType<MindmapItem | undefined>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [result: MindmapFormModalResult];
}>();

interface FormData {
  id?: number;
  title?: string;
  description?: string;
}

const schema = z.object({
  id: z.number().optional(),
  title: z
    .string({ message: t("components.lyEditor.modules.mindmap.form.validation.titleRequired") })
    .min(1, t("components.lyEditor.modules.mindmap.form.validation.titleRequired")),
  description: z.string().optional()
});

const { formData, formState, resetForm, setForm } = useForm<FormData>({
  id: undefined,
  title: undefined,
  description: undefined
});

const isEdit = computed(() => {
  return props.mode === "update";
});

const modalTitle = computed(() => {
  return isEdit.value
    ? t("components.lyEditor.modules.mindmap.form.editTitle")
    : t("components.lyEditor.modules.mindmap.form.createTitle");
});

// 监听弹窗显示，初始化表单与回填数据
watch(
  open,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      const { id, title, description } = props.record;
      setForm({ id, title, description: description ?? undefined });
    }
  },
  {
    immediate: true
  }
);

const formRef = useTemplateRef("formRef");

const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    formState.submitting = true;

    if (isEdit.value && event.data.id) {
      await updateMindmap({
        id: event.data.id,
        title: event.data.title,
        description: event.data.description
      });

      $notify.success({
        title: t("message.update.success")
      });
    } else {
      await createMindmap({
        title: event.data.title,
        description: event.data.description,
        // 新建思维导图初始数据为中心主题
        data: {
          id: "1",
          type: "topic",
          label: t("components.lyEditor.modules.mindmap.form.centerTopic"),
          width: 160,
          height: 50,
          children: []
        }
      });

      $notify.success({
        title: t("message.create.success")
      });
    }

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
        :label="t('components.lyEditor.modules.mindmap.form.titleLabel')"
        required
      >
        <UInput
          v-model="formData.title"
          :placeholder="t('components.lyEditor.modules.mindmap.form.titlePlaceholder')"
        />
      </UFormField>

      <UFormField
        name="description"
        :label="t('components.lyEditor.modules.mindmap.form.descriptionLabel')"
      >
        <UTextarea
          v-model="formData.description"
          :placeholder="t('components.lyEditor.modules.mindmap.form.descriptionPlaceholder')"
        />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
