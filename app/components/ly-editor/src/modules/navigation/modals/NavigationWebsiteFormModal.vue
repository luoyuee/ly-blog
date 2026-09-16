<script setup lang="ts">
import type { NavigationWebsiteFormModalResult } from "#shared/types/ly-editor";
import type { FormSubmitEvent } from "@nuxt/ui";
import type {
  NavigationWebsiteForm,
  NavigationWebsiteItem
} from "#shared/types/navigation-website";
import { createNavigationWebsite, updateNavigationWebsite } from "@/apis/navigation-website";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "~/composables/useForm";
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
    type: Object as PropType<NavigationWebsiteItem | undefined>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [result: NavigationWebsiteFormModalResult];
}>();

const schema = z.object({
  id: z.number().optional(),
  name: z
    .string({
      message: t("components.lyEditor.modules.navigation.websiteForm.validation.nameRequired")
    })
    .min(1, t("components.lyEditor.modules.navigation.websiteForm.validation.nameRequired")),
  url: z.url(t("components.lyEditor.modules.navigation.websiteForm.validation.urlInvalid")),
  icon: z
    .url(t("components.lyEditor.modules.navigation.websiteForm.validation.iconInvalid"))
    .optional(),
  tags: z.array(z.string()).optional().nullable(),
  description: z.string().optional(),
  type: z.number().int().default(1),
  hot: z.number().int().default(0),
  is_favorite: z.boolean().default(false),
  is_public: z.boolean().default(true),
  status: z.number().int().default(1)
});

const { formData, formState, resetForm, setForm } = useForm<NavigationWebsiteForm>({
  id: undefined,
  name: undefined,
  url: undefined,
  icon: undefined,
  tags: undefined,
  description: undefined,
  type: 1,
  hot: 0,
  is_favorite: false,
  is_public: true,
  status: 1
});

const modalTitle = computed(() => {
  return props.mode === "update"
    ? t("components.lyEditor.modules.navigation.websiteForm.editTitle")
    : t("components.lyEditor.modules.navigation.websiteForm.createTitle");
});

watch(
  open,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      const { id, name, url, icon, tags, description, type, hot, is_favorite, is_public, status } =
        props.record;

      setForm({
        id,
        name,
        url,
        icon,
        tags,
        description,
        type,
        hot,
        is_favorite,
        is_public,
        status
      });
    }
  },
  {
    immediate: true
  }
);

const formRef = useTemplateRef("formRef");

const typeOptions = computed(() => [
  { label: t("components.lyEditor.modules.navigation.website.typeWebsite"), value: 1 },
  { label: t("components.lyEditor.modules.navigation.website.typeBookmark"), value: 2 }
]);

const statusOptions = computed(() => [
  { label: t("components.lyEditor.common.status.enabled"), value: 1 },
  { label: t("components.lyEditor.common.status.disabled"), value: 2 }
]);

const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    formState.submitting = true;

    if (event.data.id) {
      await updateNavigationWebsite({
        id: event.data.id,
        name: event.data.name,
        url: event.data.url,
        icon: event.data.icon,
        tags: event.data.tags,
        description: event.data.description,
        type: event.data.type,
        hot: event.data.hot,
        is_favorite: event.data.is_favorite,
        is_public: event.data.is_public,
        status: event.data.status
      });

      $notify.success({
        title: t("message.update.success")
      });
    } else {
      await createNavigationWebsite({
        name: event.data.name,
        url: event.data.url,
        icon: event.data.icon,
        tags: event.data.tags,
        description: event.data.description,
        type: event.data.type,
        hot: event.data.hot,
        is_favorite: event.data.is_favorite,
        is_public: event.data.is_public,
        status: event.data.status
      });

      $notify.success({
        title: t("message.add.success")
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
      class="space-y-4"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField
        name="name"
        :label="t('components.lyEditor.modules.navigation.websiteForm.nameLabel')"
        required
      >
        <UInput
          v-model="formData.name"
          :placeholder="t('components.lyEditor.modules.navigation.websiteForm.namePlaceholder')"
        />
      </UFormField>

      <UFormField
        name="url"
        :label="t('components.lyEditor.modules.navigation.websiteForm.urlLabel')"
        required
      >
        <UInput
          v-model="formData.url"
          :placeholder="t('components.lyEditor.modules.navigation.websiteForm.urlPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="icon"
        :label="t('components.lyEditor.modules.navigation.websiteForm.iconLabel')"
      >
        <UInput
          v-model="formData.icon"
          :placeholder="t('components.lyEditor.modules.navigation.websiteForm.iconPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="tags"
        :label="t('components.lyEditor.modules.navigation.websiteForm.tagsLabel')"
      >
        <UInputTags
          v-model="formData.tags"
          :placeholder="t('components.lyEditor.modules.navigation.websiteForm.tagsPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="description"
        :label="t('components.lyEditor.modules.navigation.websiteForm.descriptionLabel')"
      >
        <UTextarea
          v-model="formData.description"
          :placeholder="
            t('components.lyEditor.modules.navigation.websiteForm.descriptionPlaceholder')
          "
        />
      </UFormField>

      <UFormField
        name="type"
        :label="t('components.lyEditor.modules.navigation.websiteForm.typeLabel')"
      >
        <USelect v-model="formData.type" :items="typeOptions" />
      </UFormField>

      <UFormField
        name="hot"
        :label="t('components.lyEditor.modules.navigation.websiteForm.hotLabel')"
      >
        <UInputNumber
          v-model="formData.hot"
          :min="0"
          :placeholder="t('components.lyEditor.modules.navigation.websiteForm.hotPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="is_favorite"
        :label="t('components.lyEditor.modules.navigation.websiteForm.favoriteLabel')"
      >
        <USwitch v-model="formData.is_favorite" />
      </UFormField>

      <UFormField
        name="is_public"
        :label="t('components.lyEditor.modules.navigation.websiteForm.publicLabel')"
      >
        <USwitch v-model="formData.is_public" />
      </UFormField>

      <UFormField
        name="status"
        :label="t('components.lyEditor.modules.navigation.websiteForm.statusLabel')"
      >
        <USelect v-model="formData.status" :items="statusOptions" />
      </UFormField>
    </UForm>

    <template #footer>
      <UButton
        :label="t('common.cancel')"
        color="neutral"
        variant="outline"
        :disabled="formState.submitting"
        @click="handleCancel"
      />
      <UButton
        :label="t('common.confirm')"
        color="primary"
        :loading="formState.submitting"
        @click="handleConfirm"
      />
    </template>
  </BasicModal>
</template>
