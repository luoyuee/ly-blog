<script setup lang="ts">
import { TipTapEditor } from "@/components/tiptap-editor";
import { MarkdownSupportURL } from "#shared/constants";
import { useMessage } from "@/composables/useMessage";
import { useLogger } from "@/composables/useLogger";
import { getQQInfo, isQQEmail } from "@/utils";
import { createMessage } from "@/apis/message";
import { useConfigStore } from "@/stores";
import { z } from "zod";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const logger = useLogger();
const $message = useMessage();

const configStore = useConfigStore();

const props = defineProps({
  parentId: {
    type: Number
  },
  replyId: {
    type: Number
  },
  replyNickname: {
    type: String
  },
  editorHeight: {
    type: Number,
    default: 360
  },
  showCancelBtn: {
    type: Boolean,
    default: true
  }
});

const emits = defineEmits(["submitted", "cancel"]);

const state = reactive<{
  contentLength: number;
  submitting: boolean;
}>({
  contentLength: 0,
  submitting: false
});

const formData = reactive<{
  avatar?: string;
  nickname: string;
  email: string;
  website?: string;
  qq?: string;
  content: string;
}>({
  nickname: "",
  email: "",
  content: ""
});

const schema = z.object({
  nickname: z
    .string({ message: t("components.messageBoard.editor.nicknameRequired") })
    .min(1, t("components.messageBoard.editor.nicknameRequired")),
  email: z.email(t("components.messageBoard.editor.emailInvalid")),
  website: z
    .url(t("components.messageBoard.editor.websiteInvalid"))
    .optional()
    .or(z.literal("").transform(() => undefined))
});

const clearFormData = () => {
  formData.avatar = undefined;
  formData.qq = undefined;
  formData.nickname = "";
  formData.email = "";
  formData.website = undefined;
  formData.content = "";
};

const handleSubmit = async () => {
  if (formData.content.trim() === "") {
    $message.warning(t("components.messageBoard.editor.emptyWarning"));
    return;
  }
  if (
    configStore.message_board.message_max_length &&
    formData.content.length > configStore.message_board.message_max_length
  ) {
    $message.warning(t("components.messageBoard.editor.overLimitWarning"));
    return;
  }

  state.submitting = true;

  try {
    await createMessage({
      avatar: formData.avatar,
      nickname: formData.nickname,
      email: formData.email,
      website: formData.website,
      content: formData.content.trim(),
      parent_id: props.parentId,
      reply_id: props.replyId
    });

    $message.success(t("components.messageBoard.editor.submitSuccess"));
    clearFormData();
    emits("submitted");
  } catch (error) {
    logger.error(error);
    $message.error(t("components.messageBoard.editor.submitError"));
  } finally {
    state.submitting = false;
  }
};

const handleCancel = () => {
  emits("cancel");
};

const handelEmailChange = () => {
  if (isQQEmail(formData.email)) {
    formData.qq = formData.email.split("@")[0];

    if (!formData.qq) return;

    getQQInfo(formData.qq).then((res) => {
      formData.nickname = res.nickname ?? formData.nickname;
      formData.avatar = res.avatar ?? formData.avatar;
    });
  }
};
</script>
<template>
  <div class="message-editor">
    <div v-if="props.replyId && props.replyNickname" class="message-editor__reply-nickname">
      {{ "@ " + props.replyNickname }}
    </div>

    <div class="message-editor__header">
      <div class="message-editor__avatar">
        <img :src="formData.avatar ?? '/images/blank_avatar.webp'" alt="avatar" />
      </div>

      <UForm class="message-editor__contact-form" :schema="schema" :state="formData">
        <UFormField class="message-editor__contact-form__item" name="nickname">
          <UInput
            v-model.trim="formData.nickname"
            :placeholder="$t('components.messageBoard.editor.nicknamePlaceholder')"
            icon="lucide:user"
          />
        </UFormField>
        <UFormField class="message-editor__contact-form__item" name="email">
          <UInput
            v-model.trim="formData.email"
            :placeholder="$t('components.messageBoard.editor.emailPlaceholder')"
            icon="lucide:mail"
            @blur="handelEmailChange"
          />
        </UFormField>
        <UFormField class="message-editor__contact-form__item" name="website">
          <UInput
            v-model.trim="formData.website"
            :placeholder="$t('components.messageBoard.editor.websitePlaceholder')"
            icon="lucide:link"
          />
        </UFormField>
      </UForm>
    </div>

    <TipTapEditor v-model="formData.content" :max="configStore.message_board.message_max_length" />

    <div class="message-editor__footer">
      <a class="message-editor__md-support" :href="MarkdownSupportURL" target="_blank">
        <UIcon name="custom:markdown-fill" :size="18" />
        {{ $t("components.messageBoard.editor.mdHint") }}
      </a>
      <div class="message-editor__submit-btn">
        <UButton
          v-if="props.showCancelBtn"
          color="neutral"
          variant="outline"
          :disabled="state.submitting"
          @click="handleCancel"
        >
          {{ $t("components.messageBoard.editor.cancel") }}
        </UButton>
        <UButton
          color="primary"
          :loading="state.submitting"
          loading-icon="lucide:loader-circle"
          @click="handleSubmit"
        >
          {{ $t("components.messageBoard.editor.send") }}
        </UButton>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.message-editor {
  background-color: var(--box-bg-color);
  padding: 1rem;
  box-shadow: var(--box-shadow);
  border-radius: var(--radius-wrap);

  &__reply-nickname {
    margin-bottom: 1rem;
    cursor: default;
    color: var(--theme-color);
  }

  &__header {
    display: flex;
    gap: 1rem;
  }

  &__avatar {
    width: 2.5rem;
    height: 2.5rem;
    transform: translateY(-0.25rem);
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: var(--box-shadow);

    img {
      width: 100%;
      height: 100%;
    }
  }

  &__contact-form {
    flex: 1;
    display: flex;
    gap: 1rem;

    &__item {
      flex: 1;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
  }

  &__md-support {
    color: var(--text-color-2);
    font-size: 0.875rem;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.25rem;

    &:hover {
      color: var(--theme-color);
    }
  }

  &__submit-btn {
    display: flex;
    gap: 1rem;
  }
}

@media screen and (max-width: 768px) {
  .message-editor__form {
    flex-direction: column;
    gap: 0;
  }
}
</style>
