<script setup lang="ts">
import type { ApiKeyFormModalPayload, ApiKeyFormModalResult } from "#shared/types/ly-editor";
import type { ApiKeyForm } from "#shared/types/api-key";
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

const $notify = useNotification();

const visible = defineModel<boolean>("visible", {
  default: false
});

const props = defineProps({
  payload: {
    type: Object as PropType<ApiKeyFormModalPayload>,
    default: () => ({
      mode: "create",
      record: undefined
    })
  }
});

const emits = defineEmits<{
  resolve: [result: ApiKeyFormModalResult];
}>();

const scopeSchema = z.custom<ApiKeyScope>((value) => {
  return typeof value === "string" && API_KEY_SCOPES.includes(value as ApiKeyScope);
}, "请选择有效的权限范围");

const schema = z.object({
  id: z.number().optional(),
  name: z.string({ message: "请输入 API 密钥名称" }).min(1, "请输入 API 密钥名称"),
  scopes: z.array(scopeSchema).min(1, "请至少选择一个权限范围"),
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
  return props.payload.mode === "update" ? "编辑 API 密钥" : "新建 API 密钥";
});

const isEdit = computed(() => {
  return props.payload.mode === "update";
});

watch(
  visible,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.payload.record) {
      const { id, name, scopes, expires_at, status } = props.payload.record;

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
        title: "修改成功"
      });

      visible.value = false;
      emits("resolve", {
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
      title: "创建成功"
    });

    visible.value = false;
    emits("resolve", {
      action: "submitted",
      data: createdApiKey
    });
  } catch (error) {
    $notify.error({
      title: "操作失败",
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
  visible.value = false;
  emits("resolve", {
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
    v-model:visible="visible"
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
      <UFormField name="name" label="名称" required>
        <UInput v-model="formData.name" placeholder="如：内容导入 API 密钥" />
      </UFormField>

      <UFormField name="scopes" label="权限范围" required>
        <USelectMenu
          v-model="formData.scopes"
          class="w-full"
          multiple
          value-key="value"
          :items="scopeOptions"
          placeholder="请选择权限范围"
        />
      </UFormField>

      <UFormField name="expires_at" label="过期时间">
        <DatePicker v-model="formData.expires_at" type="datetime" />
      </UFormField>

      <UAlert
        v-if="props.payload.mode === 'create'"
        color="warning"
        variant="soft"
        icon="lucide:triangle-alert"
        title="安全提示"
        description="API 密钥创建后仅会展示一次明文，请在关闭提示前妥善保存。"
      />
    </UForm>
  </BasicModal>
</template>
