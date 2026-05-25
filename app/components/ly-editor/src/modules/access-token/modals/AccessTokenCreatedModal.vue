<script setup lang="ts">
import type {
  AccessTokenCreatedModalPayload,
  AccessTokenCreatedModalResult
} from "#shared/types/ly-editor";
import { writeClipboardText } from "@/utils/clipboard";
import { BasicModal } from "@/components/basic-modal";

const $notify = useNotification();

const visible = defineModel<boolean>("visible", {
  default: false
});

const props = defineProps({
  payload: {
    type: Object as PropType<AccessTokenCreatedModalPayload>,
    required: true
  }
});

const emits = defineEmits<{
  resolve: [result: AccessTokenCreatedModalResult];
}>();

const tokenVisible = ref(false);

const tokenPlaintext = computed(() => {
  return props.payload.record.token;
});

const maskedToken = computed(() => {
  const token = tokenPlaintext.value;

  if (token.length <= 2) {
    return token;
  }

  if (token.length <= 8) {
    return `${token.slice(0, 1)}${"*".repeat(token.length - 2)}${token.slice(-1)}`;
  }

  return `${token.slice(0, 6)}${"*".repeat(token.length - 10)}${token.slice(-4)}`;
});

const displayedToken = computed(() => {
  return tokenVisible.value ? tokenPlaintext.value : maskedToken.value;
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
    await writeClipboardText(tokenPlaintext.value);

    $notify.success({
      title: "复制成功"
    });
  } catch (error) {
    $notify.error({
      title: "复制失败",
      description: "请手动复制当前 Token。",
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
    title="请立即保存 Access Token"
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
        icon="ep:warning-filled"
        title="明文 Token 仅展示一次"
        description="关闭当前弹窗后，系统将无法再次查看该明文 Token，请先复制并妥善保管。"
      />

      <UFormField label="Token 明文">
        <UInput :model-value="displayedToken" readonly class="w-full">
          <template #trailing>
            <div class="flex items-center gap-1">
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                :icon="tokenVisible ? 'ep:hide' : 'ep:view'"
                @click="handleToggleTokenVisible"
              />
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="ep:copy-document"
                @click="handleCopyToken"
              />
            </div>
          </template>
        </UInput>
      </UFormField>

      <div class="space-y-1 text-sm text-gray-400">
        <div>
          <span>名称：</span>
          <span>{{ props.payload.record.name }}</span>
        </div>
        <div>
          <span>权限：</span>
          <UBadge
            v-for="scope in props.payload.record.scopes"
            :key="scope"
            :label="scope"
            class="mb-2 mr-2"
            variant="subtle"
          />
        </div>
      </div>
    </div>
  </BasicModal>
</template>
