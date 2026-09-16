<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { InputPassword } from "@/components/form/input";
import { AvatarUpload } from "@/components/avatar";
import { adminRegister } from "@/apis/user";
import { reactive } from "vue";
import { z } from "zod";

definePageMeta({
  layout: "blank"
});

const { t } = useI18n();

// 检查是否有管理员
await useFetch<{ has_admin: boolean }>("/api/user/has-admin", {
  method: "get"
}).then((response) => {
  if (response.data.value && response.data.value.has_admin) {
    navigateTo("/admin/login");
  }
});

const schema = z.object({
  nickname: z
    .string({ message: t("pages.admin.register.validation.nicknameRequired") })
    .min(1, t("pages.admin.register.validation.nicknameRequired")),
  username: z
    .string({ message: t("pages.admin.register.validation.usernameRequired") })
    .min(1, t("pages.admin.register.validation.usernameRequired")),
  email: z.email({ message: t("pages.admin.register.validation.emailInvalid") }),
  password: z
    .string({ message: t("pages.admin.register.validation.passwordRequired") })
    .min(6, t("pages.admin.register.validation.passwordTooShort")),
  confirmPassword: z
    .string({ message: t("pages.admin.register.validation.passwordRequired") })
    .min(1, t("pages.admin.register.validation.passwordRequired"))
    .refine((data) => data === formData.password, {
      message: t("pages.admin.register.validation.passwordMismatch")
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
    <div class="bg-box sm:shadow-md p-6 rounded-md w-lg transition-all">
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

        <UFormField name="nickname" :label="$t('pages.admin.register.nicknameLabel')" required>
          <UInput
            v-model="formData.nickname"
            class="w-full"
            icon="lucide:square-pen"
            :placeholder="$t('pages.admin.register.nicknamePlaceholder')"
          />
        </UFormField>

        <UFormField name="username" :label="$t('pages.admin.register.usernameLabel')" required>
          <UInput
            v-model="formData.username"
            class="w-full"
            icon="lucide:user"
            :placeholder="$t('pages.admin.register.usernamePlaceholder')"
          />
        </UFormField>

        <UFormField name="email" :label="$t('pages.admin.register.emailLabel')" required>
          <UInput
            v-model="formData.email"
            class="w-full"
            icon="lucide:mail"
            :placeholder="$t('pages.admin.register.emailPlaceholder')"
          />
        </UFormField>

        <UFormField name="password" :label="$t('pages.admin.register.passwordLabel')" required>
          <InputPassword
            v-model="formData.password"
            class="w-full"
            icon="lucide:lock"
            :placeholder="$t('pages.admin.register.passwordPlaceholder')"
            show-strength
          />
        </UFormField>

        <UFormField
          name="confirmPassword"
          :label="$t('pages.admin.register.confirmPasswordLabel')"
          required
        >
          <InputPassword
            v-model="formData.confirmPassword"
            class="w-full"
            icon="lucide:lock"
            :placeholder="$t('pages.admin.register.confirmPasswordPlaceholder')"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          :loading="state.submitting"
          loading-icon="lucide:loader-circle"
        >
          {{ $t("pages.admin.register.submit") }}
        </UButton>
      </UForm>
    </div>
  </div>
</template>
