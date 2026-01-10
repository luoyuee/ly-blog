<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { AvatarUpload } from "@/components/avatar";
import { adminRegister } from "@/apis/user";
import { reactive } from "vue";
import { z } from "zod";

definePageMeta({
  layout: "blank"
});

// 检查是否有管理员
await useFetch<{ has_admin: boolean }>("/api/user/has-admin", {
  method: "get"
}).then((response) => {
  if (response.data.value && response.data.value.has_admin) {
    navigateTo("/admin/login");
  }
});

const schema = z.object({
  nickname: z.string({ message: "请输入昵称" }).min(1, "请输入昵称"),
  username: z.string({ message: "请输入用户名" }).min(1, "请输入用户名"),
  email: z.email({ message: "邮箱格式有误" }),
  password: z.string({ message: "请输入密码" }).min(6, "请至少输入6位密码"),
  confirmPassword: z
    .string({ message: "请输入密码" })
    .min(1, "请输入密码")
    .refine((data) => data === formData.password, {
      message: "密码不一致"
    })
});

const formData = reactive<{
  nickname?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  email?: string;
  avatar?: File;
}>({
  nickname: undefined,
  username: undefined,
  password: undefined,
  confirmPassword: undefined,
  email: undefined,
  avatar: undefined
});

const state = reactive<{
  submitting: boolean;
}>({
  submitting: false
});

const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    state.submitting = true;

    await adminRegister({
      nickname: event.data.nickname!,
      username: event.data.username!,
      password: event.data.password!,
      email: event.data.email!,
      avatar: formData.avatar
    });

    location.href = "/admin/login";
  } catch (error) {
    const toast = useToast();
    toast.add({
      title: String(error),
      color: "error"
    });
  } finally {
    state.submitting = false;
  }
};

const handleAvatarChange = (file: File | null) => {
  formData.avatar = file ?? undefined;
};
</script>
<template>
  <div class="flex h-dvh items-center justify-center bg-box sm:bg-page sm:bg-login transition-all">
    <div class="bg-box sm:shadow-md p-6 rounded-md w-128 transition-all">
      <h1 class="flex items-center justify-center mb-6 select-none">
        <img src="/ly.svg" alt="logo" class="w-12" />
        <span class="text-3xl text-gray-300">LY Blog</span>
      </h1>
      <UForm
        class="space-y-2"
        :schema="schema"
        :state="formData"
        :validate-on-input-delay="100"
        @submit="handleSubmit"
      >
        <div class="w-full flex justify-center">
          <AvatarUpload @change="handleAvatarChange" />
        </div>

        <UFormField name="nickname" label="昵称" required>
          <UInput
            v-model="formData.nickname"
            class="w-full"
            icon="ep:edit-pen"
            placeholder="请输入管理员昵称"
          />
        </UFormField>

        <UFormField name="username" label="账号" required>
          <UInput
            v-model="formData.username"
            class="w-full"
            icon="ep:user"
            placeholder="请输入管理员账号"
          />
        </UFormField>

        <UFormField name="email" label="邮箱" required>
          <UInput
            v-model="formData.email"
            class="w-full"
            icon="ep:message"
            placeholder="请输入管理员邮箱"
          />
        </UFormField>

        <UFormField name="password" label="密码" required>
          <UInput
            v-model="formData.password"
            class="w-full"
            icon="ep:lock"
            type="password"
            placeholder="请输入管理员密码"
          />
        </UFormField>

        <UFormField name="confirmPassword" label="确认密码" required>
          <UInput
            v-model="formData.confirmPassword"
            class="w-full"
            icon="ep:lock"
            type="password"
            placeholder="请再次输入密码"
          />
        </UFormField>

        <UButton type="submit" block :loading="state.submitting" loading-icon="ep:loading">
          创建管理员，开始写作吧
        </UButton>
      </UForm>
    </div>
  </div>
</template>
