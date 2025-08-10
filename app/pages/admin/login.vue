<script setup lang="ts">
import type { FormRules, FormInstance } from "element-plus";
import { Lock, User } from "@element-plus/icons-vue";
import { adminLogin } from "@/apis/user";
import { reactive } from "vue";

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

const { data: hasAdminResp } = await useFetch<{ admin: boolean }>(
  "/api/user/has-admin/",
  { method: "get" }
);
if (hasAdminResp?.value && !hasAdminResp.value.admin) {
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
</script>
<template>
  <div class="page-container">
    <div class="login-box">
      <h1 class="title">
        <img src="/ly.svg" alt="logo" />
        {{ $t("login_page.login_box_title") }}
      </h1>
      <el-form :model="formData" :rules="formRules" ref="formRef">
        <el-form-item prop="username">
          <el-input
            size="large"
            v-model="formData.username"
            :placeholder="$t('login_page.username.placeholder')"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            size="large"
            type="password"
            v-model="formData.password"
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
              size="large"
              v-model="formData.remember"
              :label="$t('login_page.remember')"
            />
            <el-link type="primary" :underline="false">
              {{ $t("login_page.back_home") }}
            </el-link>
          </div>
        </el-form-item>
      </el-form>
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
  .login-box {
    width: 360px;
    transform: translateY(-20%);
    padding: 24px 24px 0 24px;
    background-color: var(--white);
    border-radius: var(--radius-inner);
    box-shadow: var(--box-shadow);
    background-color: var(--bg-color);
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
  }
}
</style>
