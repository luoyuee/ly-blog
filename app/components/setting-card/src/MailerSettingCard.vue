<script setup lang="ts">
import type { IServerConfigMailer } from "#shared/types/config";
import type { FormSubmitEvent } from "@nuxt/ui";
import { verifyEmailConfig } from "@/apis/config";
import { useForm } from "@/composables/useForm";
import { useServerConfigStore } from "@/stores";
import { cloneDeep } from "es-toolkit";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const $notify = useNotification();

const serverConfigStore = useServerConfigStore();

const createInitialFormData = (): IServerConfigMailer => {
  return cloneDeep(serverConfigStore.mailer);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IServerConfigMailer>(createInitialFormData());

const schema = z.object({
  host: z.string(),
  port: z.coerce.number(),
  tls: z.boolean().optional(),
  user: z.email(),
  pass: z.string(),
  notify_email: z.email({ message: "请输入内容" }),
  comment_notify_enabled: z.boolean().optional(),
  enabled: z.boolean().optional()
});

const syncFormData = () => {
  const nextFormData = createInitialFormData();
  setInitial(nextFormData);
  setForm(nextFormData);
};

const handleReset = () => {
  resetForm();
};

const formRef = useTemplateRef("formRef");

const handleSave = () => {
  formRef.value?.submit();
};

const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  formState.submitting = true;

  try {
    if (formData.enabled) {
      await verifyEmailConfig({
        host: event.data.host,
        port: event.data.port,
        tls: event.data.tls,
        user: event.data.user,
        pass: event.data.pass,
        notify_email: event.data.notify_email
      });
    }
  } catch (error) {
    $notify.error({
      title: "验证失败",
      error
    });
    formState.submitting = false;
    return;
  }

  try {
    await serverConfigStore.update({
      mailer: cloneDeep(formData)
    });

    syncFormData();
  } finally {
    formState.submitting = false;
  }
};

const sendLoading = ref(false);
const handleTestEmail = async () => {
  try {
    sendLoading.value = true;
    await verifyEmailConfig({
      host: formData.host,
      port: formData.port,
      tls: formData.tls,
      user: formData.user,
      pass: formData.pass,
      notify_email: formData.notify_email
    });
    $notify.success({
      title: "测试邮件发送成功"
    });
  } catch (error) {
    $notify.error({
      title: "测试邮件发送失败",
      error
    });
  } finally {
    sendLoading.value = false;
  }
};
</script>
<template>
  <SettingCard
    id="mailer-setting"
    title="邮件设置"
    :is-change="isDirty"
    :submitting="formState.submitting"
    @reset="handleReset"
    @save="handleSave"
  >
    <UForm
      ref="formRef"
      class="space-y-2"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField
        name="enabled"
        label="开启邮件通知"
        description="开启邮件通知后将向指定邮箱发送网站事件通知."
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <USwitch
          v-model="formData.enabled"
          :disabled="!(formData.user && formData.pass && formData.notify_email)"
        />
      </UFormField>
      <UFormField
        name="host"
        label="SMTP服务器地址"
        description="例如：QQ邮箱 「smtp.qq.com」"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.host"
          class="w-full"
          icon="i-lucide-link"
          placeholder="请输入SMTP服务器地址"
        />
      </UFormField>
      <UFormField
        name="port"
        label="SMTP服务器端口号"
        description="例如：QQ邮箱「25」或「465」或「587（使用SSL时）」"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInputNumber v-model="formData.port" :min="0" :max="65535" placeholder="请输入端口号" />
      </UFormField>
      <UFormField
        name="tls"
        label="TLS"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <USwitch v-model="formData.tls" />
      </UFormField>
      <UFormField
        name="user"
        label="系统邮箱"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.user"
          class="w-full"
          icon="i-lucide-mail"
          placeholder="请输入系统邮箱"
        />
      </UFormField>
      <UFormField
        name="pass"
        label="系统邮箱授权码"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.pass"
          class="w-full"
          icon="i-lucide-lock-keyhole"
          placeholder="请输入系统邮箱授权码"
        />
      </UFormField>
      <UFormField
        name="notify_email"
        label="通知邮箱"
        description="用于接收系统通知的邮箱"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UFieldGroup class="w-full">
          <UInput
            v-model="formData.notify_email"
            class="w-full"
            icon="i-lucide-mail"
            placeholder="请输入通知邮箱"
          />
          <UButton class="shrink-0" :loading="sendLoading" @click="handleTestEmail">
            发送测试邮件
          </UButton>
        </UFieldGroup>
      </UFormField>
      <UFormField
        name="comment_notify_enabled"
        label="评论通知"
        description="开启评论通知后，评论被回复时，将通过评论邮箱通知用户"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <USwitch v-model="formData.comment_notify_enabled" />
      </UFormField>
    </UForm>
  </SettingCard>
</template>
