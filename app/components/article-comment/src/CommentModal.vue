<script setup lang="ts">
import type { MessageBoard } from "#shared/types/message";
import { updateCommentContent } from "@/apis/article/comment";
import { TipTapEditor } from "@/components/tiptap-editor";
import { BasicModal } from "@/components/basic-modal";
import { useConfigStore } from "@/stores";
import { useI18n } from "vue-i18n";
import { useMessage } from "@/composables/useMessage";

const $message = useMessage();

const { t } = useI18n();

const configStore = useConfigStore();

const emits = defineEmits(["reload"]);

const state = reactive<{
  visible: boolean;
  submitting: boolean;
}>({
  visible: false,
  submitting: false
});

const handleCancel = () => {
  state.visible = false;

  formData.content = "";

  originalData.value = null;
};

const formData = reactive<{
  content: string;
}>({
  content: ""
});

const handleSubmit = async () => {
  if (!originalData.value) return;

  if (formData.content.trim() === "") {
    $message.warning(t("components.commentModal.emptyWarning"));
    return;
  }

  try {
    await updateCommentContent({
      id: originalData.value?.id,
      content: formData.content.trim()
    });
    $message.success(t("message.update.success"));
    emits("reload");
    handleCancel();
  } catch (error) {
    $message.error(t("message.update.error"), error);
  } finally {
    state.submitting = false;
  }
};

const originalData = ref<MessageBoard | null>(null);

const handleShow = (data: MessageBoard) => {
  originalData.value = data;

  formData.content = data.content;

  state.visible = true;
};

defineExpose({
  show: handleShow
});
</script>
<template>
  <BasicModal
    v-model:open="state.visible"
    :title="t('components.commentModal.title')"
    :confirm-button-text="t('components.commentModal.confirm')"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <div v-if="originalData">
      <div class="header">
        <div class="avatar">
          <img :src="originalData.avatar ?? '/images/blank_avatar.webp'" alt="avatar" />
        </div>

        <UForm class="comment-editor__contact-form" :disabled="true" :state="formData">
          <UFormField class="comment-editor__contact-form__item" name="nickname">
            <UInput
              :value="originalData.nickname"
              :placeholder="t('components.commentModal.nicknamePlaceholder')"
              icon="lucide:user"
            />
          </UFormField>
          <UFormField class="comment-editor__contact-form__item" name="email">
            <UInput
              :value="originalData.email"
              :placeholder="t('components.commentModal.emailPlaceholder')"
              icon="lucide:mail"
            />
          </UFormField>
          <UFormField class="comment-editor__contact-form__item" name="website">
            <UInput
              :value="originalData.website"
              :placeholder="t('components.commentModal.websitePlaceholder')"
              icon="lucide:link"
            />
          </UFormField>
        </UForm>
      </div>

      <TipTapEditor v-model="formData.content" :max="configStore.article.comment_max_length" />
    </div>
  </BasicModal>
</template>
<style lang="scss">
.message-view-modal {
  width: 50%;

  .header {
    display: flex;
    .avatar {
      width: 40px;
      height: 40px;
      transform: translateY(-4px);
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: var(--box-shadow);
      img {
        width: 100%;
        height: 100%;
      }
    }
    .el-form {
      flex: 1;
      display: flex;
      .el-form-item {
        flex: 1;
        margin-right: 0;
        margin-left: 16px;

        :deep(.el-input-group__prepend) {
          padding: 0 12px;
        }
      }
    }
  }
}
</style>
