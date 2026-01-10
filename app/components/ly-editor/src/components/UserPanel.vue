<script setup lang="ts">
import dayjs from "dayjs";
import { BasicModal } from "@/components/basic-modal";
import { AvatarUpload } from "@/components/avatar";
import { useUserStore } from "@/stores";
import { updateUserProfile, changeUserPassword } from "@/apis/user";
import { UserRoleEnum } from "#shared/enums";
import { useNotification } from "@/composables/useNotification";
import { useMessage } from "@/composables/useMessage";
import { z } from "zod";

const userStore = useUserStore();

const profileForm = reactive<{
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
    profileForm.username = info.username;
    profileForm.nickname = info.nickname;
    profileForm.email = info.email;
    profileForm.avatar = null;
  },
  {
    immediate: true
  }
);

const roleLabel = computed(() => {
  const role = userStore.profile?.role;
  if (role === UserRoleEnum.ADMIN) return "管理员";
  if (role === UserRoleEnum.NORMAL_USER) return "普通用户";
  if (role === UserRoleEnum.VISITOR) return "游客";
  return "未知";
});

const profileSubmitting = ref(false);

const $notify = useNotification();
const $message = useMessage();

const handleAvatarChange = (file: File | null) => {
  profileForm.avatar = file;
};

const handleSaveProfile = async () => {
  if (!profileForm.username || !profileForm.email) {
    $message.error("请填写用户名和邮箱");
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
      title: "保存成功"
    });
  } catch (error) {
    $notify.error({
      title: "保存失败",
      error
    });
  } finally {
    profileSubmitting.value = false;
  }
};

const passwordVisible = ref(false);
const passwordSubmitting = ref(false);
const passwordSchema = z.object({
  old_password: z.string({ message: "请输入当前密码" }).min(1, "请输入当前密码"),
  new_password: z.string({ message: "请输入新密码" }).min(6, "请至少输入6位新密码"),
  confirm_password: z
    .string({ message: "请确认新密码" })
    .min(1, "请确认新密码")
    .refine((data) => data === passwordForm.new_password, {
      message: "两次输入的新密码不一致"
    })
});
const passwordForm = reactive({
  old_password: "",
  new_password: "",
  confirm_password: ""
});

const openPasswordModal = () => {
  passwordForm.old_password = "";
  passwordForm.new_password = "";
  passwordForm.confirm_password = "";
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
      title: "密码已更新"
    });

    passwordVisible.value = false;
  } catch (error) {
    $notify.error({
      title: "修改密码失败",
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
  $message.success("已退出登录，3秒后将刷新页面");
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
          {{ userStore.profile?.nickname || userStore.profile?.username || "未登录" }}
        </div>
        <div class="text-xs text-gray-400">
          <span>角色：{{ roleLabel }}</span>
        </div>
        <div v-if="userStore.profile?.last_login_time" class="text-xs text-gray-400">
          <span>
            最后登录：{{ dayjs(userStore.profile?.last_login_time).format("YYYY-MM-DD HH:mm:ss") }}
          </span>
        </div>
        <div class="text-xs text-gray-400 flex gap-2">
          <span v-if="userStore.profile?.last_login_ip" class="shrink-0">
            IP：{{ userStore.profile?.last_login_ip }}
          </span>
          <span v-if="userStore.profile?.last_login_location" class="break-all whitespace-normal">
            位置：{{ userStore.profile?.last_login_location }}
          </span>
        </div>
      </div>

      <div class="flex gap-2">
        <UButton size="sm" variant="outline" @click="openPasswordModal"> 修改密码 </UButton>
        <UButton size="sm" color="error" variant="outline" @click="handleLogout">
          退出登录
        </UButton>
      </div>
    </div>

    <div class="bg-black/30 rounded p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium">基本信息</h3>
        <div class="space-x-2">
          <UButton
            size="sm"
            color="primary"
            :loading="profileSubmitting"
            @click="handleSaveProfile"
          >
            保存更改
          </UButton>
        </div>
      </div>

      <UForm :state="profileForm" class="space-y-4 flex-1">
        <UFormField
          label="头像"
          name="avatar"
          orientation="horizontal"
          description="上传新头像，支持 PNG、JPG、WebP、SVG 格式"
          :ui="{
            root: 'items-center'
          }"
        >
          <AvatarUpload
            size="sm"
            :placeholder-image="userStore.profile?.avatar ?? '/images/avatar.webp'"
            @change="handleAvatarChange"
          />
        </UFormField>

        <UFormField
          label="昵称"
          name="nickname"
          orientation="horizontal"
          description="显示在博客中的昵称，可包含特殊字符"
          :ui="{
            root: 'items-center'
          }"
        >
          <UInput v-model="profileForm.nickname" class="w-64" placeholder="请输入昵称" />
        </UFormField>

        <UFormField
          label="账号"
          name="username"
          orientation="horizontal"
          description="登陆时使用的用户名"
          :ui="{
            root: 'items-center'
          }"
        >
          <UInput v-model="profileForm.username" class="w-64" placeholder="请输入账号" />
        </UFormField>

        <UFormField
          label="邮箱"
          name="email"
          orientation="horizontal"
          description="邮箱地址，用于接收通知，用户登录"
          :ui="{
            root: 'items-center'
          }"
        >
          <UInput
            v-model="profileForm.email"
            class="w-64"
            type="email"
            placeholder="请输入邮箱地址"
          />
        </UFormField>

        <UFormField
          v-if="userStore.profile?.created_at"
          label="创建时间"
          :description="dayjs(userStore.profile?.created_at).format('YYYY-MM-DD HH:mm:ss')"
          name="created_at"
          orientation="horizontal"
          :ui="{
            root: 'items-center'
          }"
        />

        <UFormField
          v-if="userStore.profile?.updated_at"
          label="修改时间"
          :description="dayjs(userStore.profile?.updated_at).format('YYYY-MM-DD HH:mm:ss')"
          name="updated_at"
          orientation="horizontal"
          :ui="{
            root: 'items-center'
          }"
        />
      </UForm>
    </div>

    <BasicModal v-model:visible="passwordVisible" title="修改密码">
      <UForm
        ref="passwordFormRef"
        :schema="passwordSchema"
        :state="passwordForm"
        :validate-on-input-delay="100"
        class="space-y-4"
        @submit="handleSubmitPassword"
      >
        <UFormField label="当前密码" name="old_password">
          <UInput
            v-model="passwordForm.old_password"
            type="password"
            placeholder="请输入当前密码"
          />
        </UFormField>
        <UFormField label="新密码" name="new_password">
          <UInput v-model="passwordForm.new_password" type="password" placeholder="请输入新密码" />
        </UFormField>
        <UFormField label="确认新密码" name="confirm_password">
          <UInput
            v-model="passwordForm.confirm_password"
            type="password"
            placeholder="请再次输入新密码"
          />
        </UFormField>
      </UForm>

      <template #footer>
        <UButton
          label="取消"
          color="neutral"
          variant="outline"
          :disabled="passwordSubmitting"
          @click="handleCancelPassword"
        />
        <UButton
          label="确认"
          color="primary"
          :loading="passwordSubmitting"
          @click="handleConfirmPassword"
        />
      </template>
    </BasicModal>
  </div>
</template>
