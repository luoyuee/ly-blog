<script setup lang="ts">
import type { FormRules, FormInstance } from "element-plus";
import { Lock, User } from "@element-plus/icons-vue";
import { adminLogin } from "@/apis/user";
import { reactive } from "vue";
import { useParticleAnimation } from "@/composables/useParticleAnimation";

definePageMeta({
  layout: "blank",
});

const formRef = ref<FormInstance | null>();
const formData = reactive({
  username: "",
  password: "",
  remember: false,
});

const formRules: FormRules<typeof formData> = {
  username: [{ required: true, message: "请输入用户名" }],
  password: [{ required: true, message: "请输入密码" }],
};

const { data: hasAdminResp } = await useFetch<{ has_admin: boolean }>(
  "/api/user/has-admin/",
  { method: "get" }
);

if (hasAdminResp?.value && !hasAdminResp.value.has_admin) {
  await navigateTo("/admin/register");
}

const handleSubmit = async (): Promise<void> => {
  try {
    await formRef.value?.validate();
  } catch {
    ElMessage.warning("请检查表单！");
    return;
  }

  try {
    const user = await adminLogin({
      username: formData.username,
      password: formData.password,
    });
    ElMessage.success("登录成功！");

    const authorization = useCookie("Authorization");
    authorization.value = user.token;
    window.location.href = "/admin";
  } catch {
    ElMessage.error("登录失败！");
  }
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
      <h1 class="flex items-center justify-center mb-8 mt-2 select-none">
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
        <el-form-item label="管理员邮箱" prop="username">
          <el-input
            v-model="formData.username"
            size="large"
            :placeholder="$t('login_page.username.placeholder')"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="管理员密码" prop="password">
          <el-input
            v-model="formData.password"
            size="large"
            type="password"
            :placeholder="$t('login_page.password.placeholder')"
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <div class="w-full flex justify-center">
            <el-button
              type="primary"
              size="large"
              class="w-full tracking-[1px]"
              @click="handleSubmit"
            >
              {{ $t("login_page.login_btn_text") }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <div class="w-full flex justify-between">
            <el-checkbox
              v-model="formData.remember"
              size="large"
              :label="$t('login_page.remember')"
            />
            <el-link type="primary" :underline="false" href="/">
              {{ $t("login_page.back_home") }}
            </el-link>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <canvas
      ref="particleCanvasRef"
      class="fixed top-0 left-0 -z-0 select-none pointer-events-none"
    />
  </div>
</template>
