<script setup lang="ts">
import type { ApiKeyCreatedModalPayload, ApiKeyCreatedModalResult } from "#shared/types/ly-editor";
import { writeClipboardText } from "@/utils/clipboard";
import { BasicModal } from "@/components/basic-modal";

const $notify = useNotification();

const visible = defineModel<boolean>("visible", {
  default: false
});

const props = defineProps({
  payload: {
    type: Object as PropType<ApiKeyCreatedModalPayload>,
    required: true
  }
});

const emits = defineEmits<{
  resolve: [result: ApiKeyCreatedModalResult];
}>();

const tokenVisible = ref(false);

const secretKeyPlaintext = computed(() => {
  return props.payload.record.secret_key;
});

const maskedToken = computed(() => {
  const token = secretKeyPlaintext.value;

  if (token.length <= 2) {
    return token;
  }

  if (token.length <= 8) {
    return `${token.slice(0, 1)}${"*".repeat(token.length - 2)}${token.slice(-1)}`;
  }

  return `${token.slice(0, 6)}${"*".repeat(token.length - 10)}${token.slice(-4)}`;
});

const displayedToken = computed(() => {
  return tokenVisible.value ? secretKeyPlaintext.value : maskedToken.value;
});

watch(
  visible,
  (newVal) => {
    if (newVal) {
      tokenVisible.value = false;
    }
  },
  {
    immediate: true
  }
);

const handleToggleTokenVisible = () => {
  tokenVisible.value = !tokenVisible.value;
};

const handleCopyToken = async () => {
  try {
    await writeClipboardText(secretKeyPlaintext.value);

    $notify.success({
      title: "复制成功"
    });
  } catch (error) {
    $notify.error({
      title: "复制失败",
      description: "请手动复制当前 API 密钥。",
      error
    });
  }
};

/**
 * 关闭弹窗。
 */
const handleClose = () => {
  visible.value = false;
  emits("resolve", {
    action: "closed"
  });
};

const handleCancel = () => {
  handleClose();
};
</script>

<template>
  <BasicModal
    v-model:visible="visible"
    title="请立即保存 API 密钥"
    confirm-button-text="我已保存"
    :show-cancel-button="false"
    @confirm="handleClose"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <div class="space-y-4">
      <UAlert
        color="warning"
        variant="soft"
        icon="lucide:info"
        title="明文 API 密钥仅展示一次"
        description="关闭当前弹窗后，系统将无法再次查看该明文 API 密钥，请先复制并妥善保管。"
      />

      <UFormField label="API 密钥明文">
        <UInput :model-value="displayedToken" readonly class="w-full">
          <template #trailing>
            <div class="flex items-center gap-1">
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                :icon="tokenVisible ? 'lucide:eye-off' : 'lucide:eye'"
                @click="handleToggleTokenVisible"
              />
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="lucide:copy"
                @click="handleCopyToken"
              />
            </div>
          </template>
        </UInput>
      </UFormField>
    </div>
  </BasicModal>
</template>
