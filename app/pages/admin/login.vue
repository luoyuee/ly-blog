<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { adminLogin } from "@/apis/user";
import { reactive } from "vue";
import { z } from "zod";

definePageMeta({
  layout: "blank"
});

// 检查是否有管理员
const { data: hasAdminResp } = await useFetch<{ has_admin: boolean }>("/api/user/has-admin/", {
  method: "get"
});

if (hasAdminResp?.value && !hasAdminResp.value.has_admin) {
  await navigateTo("/admin/register");
}

const schema = z.object({
  username: z.string({ message: "请输入用户名" }).min(1, "请输入用户名"),
  password: z.string({ message: "请输入密码" }).min(1, "请输入密码"),
  remember: z.boolean().optional()
});

type Schema = z.output<typeof schema>;

const formData = reactive<Partial<Schema>>({
  username: undefined,
  password: undefined,
  remember: undefined
});

const state = reactive<{
  submitting: boolean;
}>({
  submitting: false
});

const handleSubmit = async (event: FormSubmitEvent<Schema>) => {
  const toast = useToast();

  try {
    const user = await adminLogin({
      username: event.data.username,
      password: event.data.password,
      remember: event.data.remember
    });
    toast.add({
      title: "登录成功",
      color: "success"
    });

    const authorization = useCookie("Authorization");
    authorization.value = user.token;

    setTimeout(() => {
      window.location.href = "/admin/editor";
    }, 500);
  } catch {
    toast.add({
      title: "登录失败",
      color: "error"
    });
  } finally {
    state.submitting = false;
  }
};
</script>
<template>
  <div class="flex h-dvh items-center justify-center bg-box sm:bg-page sm:bg-login transition-all">
    <div class="bg-box sm:shadow-md p-6 rounded-md w-96 transition-all">
      <h1 class="flex items-center justify-center mb-6 select-none">
        <img src="/ly.svg" alt="logo" class="w-12" />
        <span class="text-3xl text-gray-300">Blog</span>
      </h1>

      <UForm class="space-y-2" :schema="schema" :state="formData" @submit="handleSubmit">
        <UFormField name="username">
          <UInput
            v-model="formData.username"
            class="w-full"
            icon="i-ep-user"
            placeholder="用户名或邮箱"
          />
        </UFormField>

        <UFormField name="password">
          <UInput
            v-model="formData.password"
            class="w-full"
            icon="i-ep-lock"
            type="password"
            placeholder="请输入密码"
          />
        </UFormField>

        <UButton type="submit" block :loading="state.submitting" loading-icon="ep:loading">
          管理员登录
        </UButton>

        <div class="h-8 flex items-center justify-between">
          <UCheckbox label="记住我" :model-value="formData.remember" />

          <ULink to="/" class="text-primary hover:text-primary-400 text-sm"> 返回首页 </ULink>
        </div>
      </UForm>
    </div>
  </div>
</template>
