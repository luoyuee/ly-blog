<script setup lang="ts">
import type { AttachmentFolder, AttachmentFolderForm } from "#shared/types/attachment";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { AttachmentFolderFormModalResult } from "#shared/types/ly-editor";
import { createAttachmentFolder, updateAttachmentFolder } from "@/apis/attachment";
import { BasicModal } from "@/components/basic-modal";
import { SelectIcon } from "@/components/form/select";
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
    type: Object as PropType<AttachmentFolder | undefined>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [result: AttachmentFolderFormModalResult];
}>();

const modalTitle = computed(() => {
  return props.mode === "update"
    ? t("components.lyEditor.modules.attachment.folderForm.editTitle")
    : t("components.lyEditor.modules.attachment.folderForm.createTitle");
});

const schema = z.object({
  id: z.number().optional(),
  name: z
    .string({
      message: t("components.lyEditor.modules.attachment.folderForm.validation.nameRequired")
    })
    .min(1, t("components.lyEditor.modules.attachment.folderForm.validation.nameRequired")),
  icon: z.string().optional(),
  description: z.string().optional()
});

const { formData, formState, resetForm, setForm } = useForm<AttachmentFolderForm>({
  id: undefined,
  name: undefined,
  icon: undefined,
  description: undefined
});

watch(
  open,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      const { id, name, icon, description } = props.record;
      setForm({ id, name, icon, description });
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
      await updateAttachmentFolder({
        id: event.data.id,
        name: event.data.name,
        icon: event.data.icon,
        description: event.data.description
      });

      $notify.success({
        title: t("message.edit.success")
      });
    } else {
      await createAttachmentFolder({
        name: event.data.name,
        icon: event.data.icon,
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
  <BasicModal v-model:open="open" :title="modalTitle">
    <UForm
      ref="formRef"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField
        name="name"
        :label="$t('components.lyEditor.modules.attachment.folderForm.nameLabel')"
        required
      >
        <UInput
          v-model="formData.name"
          :placeholder="$t('components.lyEditor.modules.attachment.folderForm.namePlaceholder')"
        />
      </UFormField>

      <UFormField
        name="icon"
        :label="$t('components.lyEditor.modules.attachment.folderForm.iconLabel')"
      >
        <SelectIcon
          v-model="formData.icon"
          :placeholder="$t('components.lyEditor.modules.attachment.folderForm.iconPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="description"
        :label="$t('components.lyEditor.modules.attachment.folderForm.descriptionLabel')"
      >
        <UTextarea
          v-model="formData.description"
          :placeholder="
            $t('components.lyEditor.modules.attachment.folderForm.descriptionPlaceholder')
          "
        />
      </UFormField>
    </UForm>

    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        :disabled="formState.submitting"
        @click="handleCancel"
      >
        {{ $t("common.cancel") }}
      </UButton>
      <UButton color="primary" :loading="formState.submitting" @click="handleConfirm">
        {{ $t("common.confirm") }}
      </UButton>
    </template>
  </BasicModal>
</template>
