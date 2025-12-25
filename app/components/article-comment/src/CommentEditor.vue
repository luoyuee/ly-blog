<script setup lang="ts">
import { createArticleComment } from "@/apis/article/comment";
import { TipTapEditor } from "@/components/tiptap-editor";
import { MarkdownSupportURL } from "@@/shared/constants";
import { useMessage } from "@/composables/useMessage";
import { useConfigStore } from "@/stores";
import { getQQInfo, isQQEmail } from "@/utils";
import { z } from "zod";

const $message = useMessage();

const configStore = useConfigStore();

const props = defineProps({
  articleId: {
    type: Number,
    required: true
  },
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
  nickname: z.string({ message: "请输入昵称" }).min(1, "请输入昵称"),
  email: z.email("邮箱格式不正确"),
  website: z
    .url("请输入正确的网址")
    .optional()
    .or(z.literal("").transform(() => undefined))
});

const clearData = () => {
  formData.avatar = undefined;
  formData.qq = undefined;
  formData.nickname = "";
  formData.email = "";
  formData.website = undefined;
  formData.content = "";
};

const handleSubmit = async () => {
  if (formData.content.trim() === "") {
    $message.warning("评论不能为空");
    return;
  }
  if (
    configStore.article.comment_max_length &&
    formData.content.length > configStore.article.comment_max_length
  ) {
    $message.warning("评论字数超出上限");
    return;
  }

  state.submitting = true;

  try {
    await createArticleComment({
      article_id: props.articleId,
      avatar: formData.avatar,
      nickname: formData.nickname,
      email: formData.email,
      website: formData.website,
      content: formData.content.trim(),
      parent_id: props.parentId,
      reply_id: props.replyId
    });
    $message.success("提交成功");
    clearData();
    emits("submitted");
  } catch (error) {
    console.error(error);
    $message.error("提交失败");
  } finally {
    state.submitting = false;
  }
};

const handleCancel = () => {
  emits("cancel");
};

const handelEmailChange = () => {
  formData.email = formData.email.trim();

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
  <div class="comment-editor">
    <div v-if="props.replyId && props.replyNickname" class="comment-editor__reply-nickname">
      {{ "@ " + props.replyNickname }}
    </div>

    <div class="comment-editor__header">
      <div class="comment-editor__avatar">
        <img :src="formData.avatar ?? '/images/blank_avatar.webp'" alt="avatar" />
      </div>

      <UForm class="comment-editor__contact-form" :schema="schema" :state="formData">
        <UFormField class="comment-editor__contact-form__item" name="nickname">
          <UInput v-model="formData.nickname" placeholder="昵称（必填）" icon="i-ep-user" />
        </UFormField>
        <UFormField class="comment-editor__contact-form__item" name="email">
          <UInput
            v-model="formData.email"
            placeholder="邮箱（必填，QQ邮箱自动获取信息）"
            icon="i-ep-message"
            @blur="handelEmailChange"
          />
        </UFormField>
        <UFormField class="comment-editor__contact-form__item" name="website">
          <UInput v-model="formData.website" placeholder="网址（选填）" icon="i-ep-link" />
        </UFormField>
      </UForm>
    </div>

    <TipTapEditor v-model="formData.content" :max="configStore.article.comment_max_length" />

    <div class="comment-editor__footer">
      <a class="comment-editor__md-support" :href="MarkdownSupportURL" target="_blank">
        <UIcon name="custom:markdown-fill" :size="18" />
        支持Markdown语法
      </a>
      <div class="comment-editor__submit-btn">
        <UButton
          v-if="props.showCancelBtn"
          color="neutral"
          variant="outline"
          :disabled="state.submitting"
          @click="handleCancel"
        >
          取消
        </UButton>
        <UButton
          color="primary"
          :loading="state.submitting"
          loading-icon="ep:loading"
          @click="handleSubmit"
        >
          发送评论
        </UButton>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.comment-editor {
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
  .comment-editor__form {
    flex-direction: column;
    gap: 0;
  }
}
</style>
