<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { User, Message, Link } from "@element-plus/icons-vue";
import { TipTapEditor } from "@/components/tiptap-editor";
import { createMessage } from "@/apis/message";
import { useConfigStore } from "@/stores";
import { ElMessage } from "element-plus";
import { getQQInfo } from "@/utils";

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

const formRef = ref<FormInstance | null>(null);

const formRules: FormRules<typeof formData> = {
  nickname: [{ required: true, message: "请输入昵称" }],
  email: [{ required: true, message: "请输入邮箱", type: "email" }],
  website: [{ type: "url" }]
};

const clearData = () => {
  formData.avatar = undefined;
  formData.qq = undefined;
  formData.nickname = "";
  formData.email = "";
  formData.website = undefined;
  formData.content = "";

  if (formRef.value) {
    formRef.value.resetFields();
  }
};

const handleSubmit = async () => {
  if (formData.content.trim() === "") {
    ElMessage.warning("留言不能为空");
    return;
  }
  if (
    configStore.message_board.message_max_length &&
    formData.content.length > configStore.message_board.message_max_length
  ) {
    ElMessage.warning("留言字数超出上限");
    return;
  }

  try {
    await formRef.value?.validate();
  } catch {
    ElMessage.warning("请检查输入内容");
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
    ElMessage.success("提交成功");
    clearData();
    emits("submitted");
  } catch (error) {
    console.error(error);
    ElMessage.error("提交失败");
  } finally {
    state.submitting = false;
  }
};

const handleCancel = () => {
  emits("cancel");
};

const handelEmailChange = () => {
  formData.email = formData.email.trim();
  if (/^\d+@[Qq]{2}\.[Cc][Oo][Mm]$/.test(formData.email)) {
    formData.qq = formData.email.split("@")[0];

    if (!formData.qq) return;

    getQQInfo(formData.qq).then((res) => {
      formData.nickname = res.nickname;
      formData.avatar = res.avatar;
    });
  }
};
</script>
<template>
  <div class="comment-editor" @wheel.stop>
    <div v-if="props.replyId && props.replyNickname" class="reply-nickname">
      {{ "@ " + props.replyNickname }}
    </div>
    <div class="header">
      <div class="avatar">
        <img :src="formData.avatar ?? '/images/blank_avatar.webp'" alt="avatar" />
      </div>
      <el-form
        ref="formRef"
        :inline="true"
        :model="formData"
        :rules="formRules"
        :disabled="state.submitting"
      >
        <el-form-item prop="nickname">
          <el-input v-model:model-value="formData.nickname" placeholder="*昵称（必填）">
            <template #prepend>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model:model-value="formData.email"
            placeholder="*邮箱（必填，QQ邮箱自动获取信息）"
            @change="handelEmailChange"
          >
            <template #prepend>
              <el-icon>
                <Message />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="website">
          <el-input v-model:model-value="formData.website" placeholder="网址（选填）">
            <template #prepend>
              <el-icon>
                <Link />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <TipTapEditor v-model="formData.content" :max="configStore.message_board.message_max_length" />
    <div class="footer">
      <a class="md-support" href="https://markdown.com.cn/cheat-sheet.html" target="_blank">
        <Icon name="custom:markdown-fill" :size="18" class="mr-1" />
        支持Markdown语法
      </a>
      <el-space>
        <el-button v-if="props.showCancelBtn" @click="handleCancel"> 取消 </el-button>
        <el-button type="primary" :loading="state.submitting" @click="handleSubmit">
          发送评论
        </el-button>
      </el-space>
    </div>
  </div>
</template>
<style scoped lang="scss">
.comment-editor {
  background-color: var(--box-bg-color);
  padding: 1rem;
  box-shadow: var(--box-shadow);
  border-radius: var(--radius-wrap);

  .reply-nickname {
    margin-bottom: 16px;
    cursor: default;
    color: var(--theme-color);
  }

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

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;

    .md-support {
      color: var(--text-color-2);
      font-size: 0.875rem;
      text-decoration: none;
      display: flex;
      align-items: center;

      &:hover {
        color: var(--theme-color);
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .el-form {
    flex-direction: column;
  }
}
</style>
