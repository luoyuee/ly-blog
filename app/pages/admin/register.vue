<script setup lang="ts">
import type { FormRules, FormInstance } from "element-plus";
import { Lock, User, Message } from "@element-plus/icons-vue";
import { adminRegister } from "@/apis/user";
import { reactive } from "vue";
import { AvatarUpload } from "@/components/avatar";
import { useParticleAnimation } from "@/composables/useParticleAnimation";

const $message = useMessage();

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
  username: [{ required: true, message: "请输入用户名" }],
  password: [
    { required: true, message: "请输入密码" },
    {
      validator: (_, value, callback) => {
        formRef.value?.validateField("confirmPassword");
        if (value.length < 6) {
          callback(new Error("密码不能小于6位"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  email: [{ required: true, type: "email", message: "请输入邮箱" }],
  confirmPassword: [
    { required: true, message: "请输入密码" },
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

const state = reactive<{
  submitting: boolean;
}>({
  submitting: false,
});
const formRef = useTemplateRef<FormInstance>("formRef");

const handleSubmit = async () => {
  state.submitting = true;

  try {
    await formRef.value?.validate();
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
    $message.error(error, "初始化失败");
  } finally {
    state.submitting = false;
  }
};

const handleAvatarChange = (file: File | null) => {
  formData.avatar = file ?? undefined;
};

const particleCanvasRef = useTemplateRef("particleCanvasRef");

onMounted(() => {
  if (particleCanvasRef.value) {
    useParticleAnimation(particleCanvasRef.value);
  }
});
</script>
<template>
  <div
    class="flex h-dvh items-center justify-center bg-box sm:bg-page sm:bg-[url('/images/login_background.svg')] bg-cover bg-center bg-no-repeat transition-all"
  >
    <div class="bg-box sm:shadow-md p-6 rounded-md w-128 transition-all">
      <h1 class="flex items-center justify-center mb-6 select-none">
        <img class="w-12" src="/ly.svg" alt="logo" />
        <span class="text-3xl text-gray-300">Blog</span>
      </h1>
      <el-form
        ref="formRef"
        label-position="top"
        :model="formData"
        :rules="formRules"
        @submit.prevent
      >
        <el-form-item>
          <AvatarUpload class="mx-auto" @change="handleAvatarChange" />
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
            @click="handleSubmit"
          >
            创建管理员，开始写作吧
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <canvas
      ref="particleCanvasRef"
      class="fixed top-0 left-0 -z-0 select-none pointer-events-none"
    />
  </div>
</template>
