<script setup lang="ts">
import type { FormRules, FormInstance } from "element-plus";
import { Lock, User, Message } from "@element-plus/icons-vue";
import { adminRegister } from "@/apis/user";
import { ElMessage } from "element-plus";
import { ref, reactive } from "vue";

definePageMeta({
  layout: "blank",
});

const formData = reactive<{
  username?: string;
  password?: string;
  confirmPassword?: string;
  email?: string;
  avatar?: File;
}>({
  username: undefined,
  password: undefined,
  confirmPassword: undefined,
  email: undefined,
  avatar: undefined,
});

const formRules = reactive<FormRules<typeof formData>>({
  username: [{ required: true }],
  password: [
    { required: true },
    {
      validator: (_, value, callback) => {
        elFormRef.value?.validateField("confirmPassword");
        if (value.length < 6) {
          callback(new Error("密码不能小于6位"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  email: [{ required: true, type: "email" }],
  confirmPassword: [
    { required: true },
    {
      validator: (_, value, callback) => {
        if (value === formData.password) {
          callback();
        } else {
          callback(new Error("密码不一致"));
        }
      },
    },
  ],
});

const avatar_preview = ref<string>("/images/blank_avatar.webp");

const inputFileRef = ref<HTMLInputElement | null>(null);
const clickInputFile = () => {
  inputFileRef.value?.click();
};

const handleSelectIcon = (e: any) => {
  if (e.target.files.length > 0) {
    formData.avatar = e.target.files[0];
    avatar_preview.value = window.URL.createObjectURL(e.target.files[0]);

    if (inputFileRef.value) {
      inputFileRef.value.value = "";
    }
  }
};

const handleDeleteIcon = (): void => {
  formData.avatar = undefined;
  avatar_preview.value = "/images/blank_avatar.webp";
};

const state = reactive<{
  submitting: boolean;
}>({
  submitting: false,
});
const elFormRef = ref<FormInstance | null>(null);
const handleInit = async () => {
  state.submitting = true;

  try {
    await elFormRef.value?.validate();
  } catch {
    state.submitting = false;
    return;
  }

  try {
    const form = new FormData();

    form.append("username", formData.username!);
    form.append("password", formData.password!);
    form.append("email", formData.email!);
    if (formData.avatar) {
      form.append("avatar", formData.avatar);
    }
    await adminRegister(form);
    location.href = "/admin/login";
  } catch (error) {
    ElMessage({
      message: "error",
      type: "error",
    });
  } finally {
    state.submitting = false;
  }
};
</script>
<template>
  <div class="page-container">
    <div class="register-wrap">
      <h1 class="title">
        <img src="/ly.svg" alt="logo" />
        LY Blog
      </h1>
      <div class="register-box">
        <el-form
          label-position="top"
          ref="elFormRef"
          :model="formData"
          :rules="formRules"
          @submit.native.prevent
        >
          <el-form-item>
            <div class="w-full flex justify-center" ref="ttRef">
              <input
                class="hidden"
                ref="inputFileRef"
                type="file"
                accept=".png,.jpg,.webp,.svg"
                @change="handleSelectIcon"
              />
              <div
                class="avatar shadow"
                ref="avatarRef"
                @click="clickInputFile"
              >
                <img :src="avatar_preview" alt="icon" />
                <span
                  :class="{ disabled: formData.avatar === undefined }"
                  class="delete-btn"
                  @click.stop="handleDeleteIcon"
                >
                  删除
                </span>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入管理员用户名"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="formData.email"
              placeholder="请输入管理员邮箱"
              :prefix-icon="Message"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入管理员密码"
              :prefix-icon="Lock"
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              :prefix-icon="Lock"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              class="w-full mt-2"
              type="primary"
              :loading="state.submitting"
              @click="handleInit"
            >
              创建管理员，开始写作吧
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.page-container {
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-color);
  background-image: url("/images/login_background.svg");
  display: flex;
  align-items: center;
  justify-content: center;

  .register-wrap {
    width: 480px;
    transform: translateY(-74px);

    .title {
      font-size: 2rem;
      color: var(--text-color-4);
      text-align: center;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 50px;
        height: 50px;
        margin-right: 16px;
      }
    }

    .register-box {
      background-color: var(--white);
      border-radius: var(--radius-inner);
      box-shadow: var(--box-shadow);
      padding: 24px;
      background-color: var(--bg-color);
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
      cursor: pointer;

      img {
        width: 80px;
        height: 80px;
      }

      .delete-btn {
        user-select: none;
        font-size: 12px;
        position: absolute;
        width: 100%;
        height: 24px;
        line-height: 24px;
        display: block;
        background-color: rgba(0, 0, 0, 0.3);
        color: #ffffff;
        text-align: center;
        bottom: -24px;
        transition: bottom 0.3s;
        letter-spacing: 2px;

        &:hover {
          background-color: rgba(0, 0, 0, 0.5);
        }
      }

      &:hover {
        .delete-btn:not(.disabled) {
          bottom: 0;
        }
      }
    }
  }
}
</style>
