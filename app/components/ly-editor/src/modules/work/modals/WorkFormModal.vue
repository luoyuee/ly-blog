<script setup lang="ts">
import type { FormSubmitEvent, SelectMenuItem } from "@nuxt/ui";
import type { WorkForm, WorkItem } from "#shared/types/config";
import type { WorkFormModalResult } from "#shared/types/ly-editor";
import { EmojiOptions } from "#shared/constants/emoji";
import { updateWorkConfig } from "@/apis/config";
import { BasicModal } from "@/components/basic-modal";
import { ImageSelect } from "@/components/image";
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
    type: Object as PropType<WorkItem | undefined>,
    default: undefined
  },
  works: {
    type: Array as PropType<WorkItem[]>,
    default: () => []
  }
});

const emits = defineEmits<{
  close: [result: WorkFormModalResult];
}>();

const workValidation = {
  nameRequired: t("components.lyEditor.modules.work.form.validation.nameRequired"),
  iconRequired: t("components.lyEditor.modules.work.form.validation.iconRequired"),
  descriptionRequired: t("components.lyEditor.modules.work.form.validation.descriptionRequired"),
  imageRequired: t("components.lyEditor.modules.work.form.validation.imageRequired"),
  languagesRequired: t("components.lyEditor.modules.work.form.validation.languagesRequired"),
  repoRequired: t("components.lyEditor.modules.work.form.validation.repoRequired")
};

const schema = z.object({
  name: z.string({ message: workValidation.nameRequired }).min(1, workValidation.nameRequired),
  icon: z.string({ message: workValidation.iconRequired }).min(1, workValidation.iconRequired),
  description: z
    .string({ message: workValidation.descriptionRequired })
    .min(1, workValidation.descriptionRequired),
  image: z.string({ message: workValidation.imageRequired }).min(1, workValidation.imageRequired),
  languages: z.array(
    z.string({ message: workValidation.languagesRequired }).min(1, workValidation.languagesRequired)
  ),
  repoUrl: z.string({ message: workValidation.repoRequired }).min(1, workValidation.repoRequired)
});

const { formData, formState, resetForm, setForm } = useForm<WorkForm>({
  name: undefined,
  icon: undefined,
  description: undefined,
  image: undefined,
  languages: [],
  repoUrl: undefined
});

const isEdit = computed(() => {
  return props.mode === "update";
});

const modalTitle = computed(() => {
  return isEdit.value
    ? t("components.lyEditor.modules.work.form.editTitle")
    : t("components.lyEditor.modules.work.form.createTitle");
});

const workItems = computed(() => {
  return props.works;
});

const originalRepoUrl = computed(() => {
  return props.record?.repoUrl;
});

watch(
  open,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      const { name, icon, description, image, languages, repoUrl } = props.record;
      setForm({
        name,
        icon,
        description,
        image,
        languages,
        repoUrl
      });
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

    if (isEdit.value) {
      const duplicatedItem = workItems.value.find((item) => {
        return item.repoUrl === event.data.repoUrl && item.repoUrl !== originalRepoUrl.value;
      });

      if (duplicatedItem) {
        $notify.error({
          title: t("components.lyEditor.modules.work.form.exists")
        });
        return;
      }

      const data = workItems.value.map((item) => {
        if (item.repoUrl === originalRepoUrl.value) {
          return {
            ...item,
            name: event.data.name,
            icon: event.data.icon,
            description: event.data.description,
            image: event.data.image,
            languages: event.data.languages
          };
        }

        return item;
      });

      await updateWorkConfig(data);

      $notify.success({
        title: t("message.edit.success")
      });
    } else {
      const isExist = workItems.value.some((item) => item.repoUrl === event.data.repoUrl);

      if (isExist) {
        $notify.error({
          title: t("components.lyEditor.modules.work.form.exists")
        });
        return;
      }

      await updateWorkConfig([
        ...workItems.value,
        {
          name: event.data.name,
          icon: event.data.icon,
          description: event.data.description,
          repoUrl: event.data.repoUrl,
          languages: event.data.languages,
          image: event.data.image
        }
      ]);

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

const emojiItems = computed<SelectMenuItem[]>(() => {
  return EmojiOptions.map((item) => ({
    label: `${item.font} ${item.name}`,
    value: item.font
  }));
});
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
        name="name"
        :label="$t('components.lyEditor.modules.work.form.nameLabel')"
        required
      >
        <UInput
          v-model="formData.name"
          :placeholder="$t('components.lyEditor.modules.work.form.namePlaceholder')"
        />
      </UFormField>

      <UFormField name="icon" :label="$t('components.lyEditor.modules.work.form.iconLabel')">
        <USelectMenu
          v-model="formData.icon"
          :items="emojiItems"
          class="w-full"
          value-key="value"
          virtualize
          clear
        />
      </UFormField>

      <UFormField name="repoUrl" :label="$t('components.lyEditor.modules.work.form.repoLabel')">
        <UInput
          v-model="formData.repoUrl"
          :placeholder="$t('components.lyEditor.modules.work.form.repoPlaceholder')"
          icon="custom:github"
        />
      </UFormField>

      <UFormField
        name="description"
        :label="$t('components.lyEditor.modules.work.form.descriptionLabel')"
      >
        <UTextarea
          v-model="formData.description"
          :placeholder="$t('components.lyEditor.modules.work.form.descriptionPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="languages"
        :label="$t('components.lyEditor.modules.work.form.languagesLabel')"
      >
        <UInputTags
          v-model="formData.languages"
          :placeholder="$t('components.lyEditor.modules.work.form.languagesPlaceholder')"
        />
      </UFormField>

      <UFormField name="image" :label="$t('components.lyEditor.modules.work.form.imageLabel')">
        <ImageSelect v-model="formData.image" />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
