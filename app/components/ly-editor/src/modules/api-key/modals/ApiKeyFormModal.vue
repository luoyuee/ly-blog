<script setup lang="ts">
import type { ApiKeyFormModalResult } from "#shared/types/ly-editor";
import type { ApiKeyForm, ApiKeyItem } from "#shared/types/api-key";
import type { ApiKeyScope } from "#shared/enums";
import type { FormSubmitEvent, SelectItem } from "@nuxt/ui";
import { API_KEY_SCOPES } from "#shared/enums";
import { createApiKey, updateApiKey } from "@/apis/api-key";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "@/composables/useForm";
import { computed, watch } from "vue";
import { z } from "zod";
import dayjs from "dayjs";
import { DatePicker } from "@/components/form/date-picker";

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
    type: Object as PropType<ApiKeyItem>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [result: ApiKeyFormModalResult];
}>();

const scopeSchema = z.custom<ApiKeyScope>((value) => {
  return typeof value === "string" && API_KEY_SCOPES.includes(value as ApiKeyScope);
}, t("components.lyEditor.modules.apiKey.form.validation.scopeInvalid"));

const schema = z.object({
  id: z.number().optional(),
  name: z
    .string({ message: t("components.lyEditor.modules.apiKey.form.validation.nameRequired") })
    .min(1, t("components.lyEditor.modules.apiKey.form.validation.nameRequired")),
  scopes: z
    .array(scopeSchema)
    .min(1, t("components.lyEditor.modules.apiKey.form.validation.scopeAtLeastOne")),
  expires_at: z.string().nullable().optional()
});

const { formData, formState, resetForm, setForm } = useForm<ApiKeyForm>({
  id: undefined,
  name: undefined,
  scopes: [],
  expires_at: null,
  status: 1
});

const modalTitle = computed(() => {
  return props.mode === "update"
    ? t("components.lyEditor.modules.apiKey.form.editTitle")
    : t("components.lyEditor.modules.apiKey.form.createTitle");
});

const isEdit = computed(() => {
  return props.mode === "update";
});

watch(
  open,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      const { id, name, scopes, expires_at, status } = props.record;

      setForm({
        id,
        name,
        scopes,
        expires_at: expires_at ? dayjs(expires_at).format("YYYY-MM-DDTHH:mm") : null,
        status
      });
    }
  },
  {
    immediate: true
  }
);

const formRef = useTemplateRef("formRef");

/**
 * 规范化过期时间字段。
 */
const normalizeExpiresAt = (value?: string | null) => {
  if (!value) {
    return null;
  }

  return dayjs(value).second(0).milliseconds(0).toISOString();
};

const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    formState.submitting = true;

    if (isEdit.value && event.data.id) {
      await updateApiKey({
        id: event.data.id,
        name: event.data.name,
        scopes: event.data.scopes,
        expires_at: normalizeExpiresAt(event.data.expires_at)
      });

      $notify.success({
        title: t("message.update.success")
      });

      open.value = false;
      emits("close", {
        action: "submitted"
      });
      return;
    }

    const createdApiKey = await createApiKey({
      name: event.data.name,
      scopes: event.data.scopes,
      expires_at: normalizeExpiresAt(event.data.expires_at)
    });

    $notify.success({
      title: t("message.create.success")
    });

    open.value = false;
    emits("close", {
      action: "submitted",
      data: createdApiKey
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

const scopeOptions = computed<SelectItem[]>(() => {
  return API_KEY_SCOPES.map((item) => ({
    label: item,
    value: item
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
      class="space-y-3"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField
        name="name"
        :label="t('components.lyEditor.modules.apiKey.form.nameLabel')"
        required
      >
        <UInput
          v-model="formData.name"
          :placeholder="t('components.lyEditor.modules.apiKey.form.namePlaceholder')"
        />
      </UFormField>

      <UFormField
        name="scopes"
        :label="t('components.lyEditor.modules.apiKey.form.scopeLabel')"
        required
      >
        <USelectMenu
          v-model="formData.scopes"
          class="w-full"
          multiple
          value-key="value"
          :items="scopeOptions"
          :placeholder="t('components.lyEditor.modules.apiKey.form.scopePlaceholder')"
        />
      </UFormField>

      <UFormField
        name="expires_at"
        :label="t('components.lyEditor.modules.apiKey.form.expiresAtLabel')"
      >
        <DatePicker v-model="formData.expires_at" type="datetime" />
      </UFormField>

      <UAlert
        v-if="props.mode === 'create'"
        color="warning"
        variant="soft"
        icon="lucide:info"
        :title="t('components.lyEditor.modules.apiKey.form.safeTipTitle')"
        :description="t('components.lyEditor.modules.apiKey.form.safeTipDescription')"
      />
    </UForm>
  </BasicModal>
</template>
