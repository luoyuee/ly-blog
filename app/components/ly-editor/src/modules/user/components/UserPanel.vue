<script setup lang="ts">
import { updateUserProfile, changeUserPassword } from "@/apis/user";
import { useNotification } from "@/composables/useNotification";
import { BasicModal } from "@/components/basic-modal";
import { useMessage } from "@/composables/useMessage";
import { AvatarUpload } from "@/components/avatar";
import { UserRoleEnum } from "#shared/enums";
import { useUserStore } from "@/stores";
import { z } from "zod";
import dayjs from "dayjs";

const { t } = useI18n();

const userStore = useUserStore();

const {
  formData: profileForm,
  setForm: setProfileForm,
  setInitial: setProfileInitial
} = useForm<{
  username: string;
  nickname: string;
  email: string;
  avatar: File | null;
}>({
  username: "",
  nickname: "",
  email: "",
  avatar: null
});

watch(
  () => userStore.profile,
  (info) => {
    if (!info) return;

    const profileData = {
      username: info.username,
      nickname: info.nickname,
      email: info.email,
      avatar: null
    };

    setProfileInitial(profileData);
    setProfileForm(profileData);
  },
  {
    immediate: true
  }
);

const roleLabel = computed(() => {
  const role = userStore.profile?.role;
  if (role === UserRoleEnum.ADMIN) return t("components.lyEditor.modules.user.roles.admin");
  if (role === UserRoleEnum.NORMAL_USER) return t("components.lyEditor.modules.user.roles.normal");
  if (role === UserRoleEnum.VISITOR) return t("components.lyEditor.modules.user.roles.visitor");
  return t("components.lyEditor.modules.user.roles.unknown");
});

const profileSubmitting = ref(false);

const $notify = useNotification();
const $message = useMessage();

const handleAvatarChange = (file: File | null) => {
  profileForm.avatar = file;
};

const handleSaveProfile = async () => {
  if (!profileForm.username || !profileForm.email) {
    $message.error(t("components.lyEditor.modules.user.profileRequired"));
    return;
  }

  try {
    profileSubmitting.value = true;

    await updateUserProfile({
      username: profileForm.username.trim(),
      email: profileForm.email.trim(),
      nickname: profileForm.nickname.trim() || undefined,
      avatar: profileForm.avatar ?? undefined
    });

    await userStore.fetchProfile();

    $notify.success({
      title: t("message.save.success")
    });
  } catch (error) {
    $notify.error({
      title: t("message.save.error"),
      error
    });
  } finally {
    profileSubmitting.value = false;
  }
};

const passwordVisible = ref(false);
const passwordSubmitting = ref(false);
const { formData: passwordForm, resetForm: resetPasswordForm } = useForm({
  old_password: "",
  new_password: "",
  confirm_password: ""
});
const passwordSchema = z.object({
  old_password: z
    .string({ message: t("components.lyEditor.modules.user.validation.oldPasswordRequired") })
    .min(1, t("components.lyEditor.modules.user.validation.oldPasswordRequired")),
  new_password: z
    .string({ message: t("components.lyEditor.modules.user.validation.newPasswordMin") })
    .min(6, t("components.lyEditor.modules.user.validation.newPasswordMin")),
  confirm_password: z
    .string({ message: t("components.lyEditor.modules.user.validation.confirmPasswordRequired") })
    .min(1, t("components.lyEditor.modules.user.validation.confirmPasswordRequired"))
    .refine((data) => data === passwordForm.new_password, {
      message: t("components.lyEditor.modules.user.validation.passwordMismatch")
    })
});

const openPasswordModal = () => {
  resetPasswordForm();
  passwordVisible.value = true;
};

const passwordFormRef = useTemplateRef("passwordFormRef");

const handleSubmitPassword = async () => {
  try {
    passwordSubmitting.value = true;

    await changeUserPassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password
    });

    $notify.success({
      title: t("components.lyEditor.modules.user.passwordUpdated")
    });

    passwordVisible.value = false;
  } catch (error) {
    $notify.error({
      title: t("components.lyEditor.modules.user.passwordFailed"),
      error
    });
  } finally {
    passwordSubmitting.value = false;
  }
};

const handleConfirmPassword = async () => {
  passwordFormRef.value?.submit();
};

const handleCancelPassword = () => {
  if (passwordSubmitting.value) return;
  passwordVisible.value = false;
};

const handleLogout = () => {
  $message.success(t("components.lyEditor.modules.user.logoutSuccess"));
  setTimeout(() => {
    const auth = useCookie("Authorization");
    auth.value = null;

    userStore.profile = undefined;

    window.location.href = "/admin/login";
  }, 3000);
};
</script>
<template>
  <div class="space-y-4 h-full p-4 overflow-y-auto">
    <div class="flex items-center gap-4">
      <UAvatar
        :src="userStore.profile?.avatar ?? '/images/avatar.webp'"
        class="shrink-0"
        :ui="{
          root: 'size-16'
        }"
      />

      <div class="flex-1 space-y-1">
        <div class="text-base font-medium">
          {{
            userStore.profile?.nickname ||
            userStore.profile?.username ||
            $t("components.lyEditor.modules.user.notLoggedIn")
          }}
        </div>
        <div class="text-xs text-gray-400">
          <span>{{ $t("components.lyEditor.modules.user.roleLabel", { role: roleLabel }) }}</span>
        </div>
        <div v-if="userStore.profile?.last_login_time" class="text-xs text-gray-400">
          <span>
            {{
              $t("components.lyEditor.modules.user.lastLoginLabel", {
                time: dayjs(userStore.profile?.last_login_time).format("YYYY-MM-DD HH:mm:ss")
              })
            }}
          </span>
        </div>
        <div class="text-xs text-gray-400 flex gap-2">
          <span v-if="userStore.profile?.last_login_ip" class="shrink-0">
            IP：{{ userStore.profile?.last_login_ip }}
          </span>
          <span v-if="userStore.profile?.last_login_location" class="break-all whitespace-normal">
            {{
              $t("components.lyEditor.modules.user.locationLabel", {
                location: userStore.profile?.last_login_location
              })
            }}
          </span>
        </div>
      </div>

      <div class="flex gap-2">
        <UButton size="sm" variant="outline" @click="openPasswordModal">
          {{ $t("components.lyEditor.modules.user.changePassword") }}
        </UButton>
        <UButton size="sm" color="error" variant="outline" @click="handleLogout">
          {{ $t("components.lyEditor.modules.user.logout") }}
        </UButton>
      </div>
    </div>

    <div class="bg-black/30 rounded p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium">
          {{ $t("components.lyEditor.modules.user.basicInfo") }}
        </h3>
        <div class="space-x-2">
          <UButton
            size="sm"
            color="primary"
            :loading="profileSubmitting"
            @click="handleSaveProfile"
          >
            {{ $t("components.lyEditor.modules.user.saveChanges") }}
          </UButton>
        </div>
      </div>

      <UForm :state="profileForm" class="space-y-4 flex-1">
        <UFormField
          :label="$t('components.lyEditor.modules.user.avatar')"
          name="avatar"
          orientation="horizontal"
        >
          <AvatarUpload
            :src="userStore.profile?.avatar ?? '/images/avatar.webp'"
            @change="handleAvatarChange"
          />
        </UFormField>

        <UFormField
          :label="$t('components.lyEditor.modules.user.username')"
          name="username"
          orientation="horizontal"
        >
          <UInput
            v-model="profileForm.username"
            :placeholder="$t('components.lyEditor.modules.user.usernamePlaceholder')"
          />
        </UFormField>

        <UFormField
          :label="$t('components.lyEditor.modules.user.nickname')"
          name="nickname"
          orientation="horizontal"
        >
          <UInput
            v-model="profileForm.nickname"
            :placeholder="$t('components.lyEditor.modules.user.nicknamePlaceholder')"
          />
        </UFormField>

        <UFormField
          :label="$t('components.lyEditor.modules.user.email')"
          name="email"
          orientation="horizontal"
        >
          <UInput
            v-model="profileForm.email"
            :placeholder="$t('components.lyEditor.modules.user.emailPlaceholder')"
          />
        </UFormField>
      </UForm>
    </div>

    <BasicModal
      v-model:open="passwordVisible"
      :title="$t('components.lyEditor.modules.user.passwordModalTitle')"
      @confirm="handleConfirmPassword"
      @cancel="handleCancelPassword"
    >
      <UForm
        ref="passwordFormRef"
        :schema="passwordSchema"
        :state="passwordForm"
        class="space-y-4"
        @submit="handleSubmitPassword"
      >
        <UFormField :label="$t('components.lyEditor.modules.user.oldPassword')" name="old_password">
          <UInput
            v-model="passwordForm.old_password"
            type="password"
            :placeholder="$t('components.lyEditor.modules.user.oldPasswordPlaceholder')"
          />
        </UFormField>
        <UFormField :label="$t('components.lyEditor.modules.user.newPassword')" name="new_password">
          <UInput
            v-model="passwordForm.new_password"
            type="password"
            :placeholder="$t('components.lyEditor.modules.user.newPasswordPlaceholder')"
          />
        </UFormField>
        <UFormField
          :label="$t('components.lyEditor.modules.user.confirmPassword')"
          name="confirm_password"
        >
          <UInput
            v-model="passwordForm.confirm_password"
            type="password"
            :placeholder="$t('components.lyEditor.modules.user.confirmPasswordPlaceholder')"
          />
        </UFormField>
      </UForm>
    </BasicModal>
  </div>
</template>
