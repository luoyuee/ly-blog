<script setup lang="ts">
import type {
  AccessTokenFormModalPayload,
  AccessTokenFormModalResult
} from "#shared/types/ly-editor";
import type { AccessTokenForm } from "#shared/types/access-token";
import type { AccessTokenScope } from "#shared/enums";
import type { FormSubmitEvent, SelectItem } from "@nuxt/ui";
import { ACCESS_TOKEN_SCOPES } from "#shared/enums";
import { createAccessToken, updateAccessToken } from "@/apis/access-token";
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
    type: Object as PropType<AccessTokenFormModalPayload>,
    default: () => ({
      mode: "create",
      record: undefined
    })
  }
});

const emits = defineEmits<{
  resolve: [result: AccessTokenFormModalResult];
}>();

const scopeSchema = z.custom<AccessTokenScope>((value) => {
  return typeof value === "string" && ACCESS_TOKEN_SCOPES.includes(value as AccessTokenScope);
}, "请选择有效的权限范围");

const schema = z.object({
  id: z.number().optional(),
  name: z.string({ message: "请输入 Token 名称" }).min(1, "请输入 Token 名称"),
  scopes: z.array(scopeSchema).min(1, "请至少选择一个权限范围"),
  expires_at: z.string().nullable().optional()
});

const { formData, formState, resetForm, setForm } = useForm<AccessTokenForm>({
  id: undefined,
  name: undefined,
  scopes: [],
  expires_at: null,
  status: 1
});

const modalTitle = computed(() => {
  return props.payload.mode === "update" ? "编辑令牌" : "新建令牌";
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
      await updateAccessToken({
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

    const createdToken = await createAccessToken({
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
      data: createdToken
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
  return ACCESS_TOKEN_SCOPES.map((item) => ({
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
        <UInput v-model="formData.name" placeholder="如：内容导入 Token" />
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
        description="Access Token 创建后仅会展示一次明文，请在关闭提示前妥善保存。"
      />
    </UForm>
  </BasicModal>
</template>
