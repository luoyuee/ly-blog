<script setup lang="ts">
import type { ImageFolder } from "#shared/types/image";
import type { FormSubmitEvent } from "@nuxt/ui";
import { createImageFolder, updateImageFolder } from "@/apis/image";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "@/composables/useForm";
import { watch } from "vue";
import { z } from "zod";

const { t } = useI18n();

const $notify = useNotification();

const open = defineModel<boolean>("open", {
  default: false
});

const props = defineProps({
  record: {
    type: Object as PropType<ImageFolder | undefined>,
    default: undefined
  }
});

interface FormData {
  id?: number;
  name?: string;
  description?: string;
}

const emits = defineEmits<{
  close: [
    result:
      | {
          action: "submitted";
        }
      | {
          action: "cancelled";
        }
  ];
}>();

const schema = z.object({
  id: z.number().optional(),
  name: z
    .string({ message: t("components.lyEditor.modules.image.folderForm.validation.nameRequired") })
    .min(1, t("components.lyEditor.modules.image.folderForm.validation.nameRequired")),
  description: z.string().optional()
});

const { formData, formState, resetForm, setForm } = useForm<FormData>({
  id: undefined,
  name: undefined,
  description: undefined
});

// 监听弹窗显示，初始化表单与回填数据
watch(
  open,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      const { id, name, description } = props.record;
      setForm({ id, name, description });
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

    if (event.data.id) {
      await updateImageFolder({
        id: event.data.id,
        name: event.data.name,
        description: event.data.description
      });

      $notify.success({
        title: t("message.edit.success")
      });
    } else {
      await createImageFolder({
        name: event.data.name,
        description: event.data.description
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
    :title="
      formData.id
        ? $t('components.lyEditor.modules.image.folderForm.editTitle')
        : $t('components.lyEditor.modules.image.folderForm.createTitle')
    "
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
        name="name"
        :label="$t('components.lyEditor.modules.image.folderForm.nameLabel')"
        required
      >
        <UInput
          v-model="formData.name"
          :placeholder="$t('components.lyEditor.modules.image.folderForm.namePlaceholder')"
        />
      </UFormField>

      <UFormField
        name="description"
        :label="$t('components.lyEditor.modules.image.folderForm.descriptionLabel')"
      >
        <UTextarea
          v-model="formData.description"
          :placeholder="$t('components.lyEditor.modules.image.folderForm.descriptionPlaceholder')"
        />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
