<script setup lang="ts">
import type { IServerConfigMailer } from "#shared/types/config";
import type { WatchStopHandle } from "vue";
import { updateServerConfig, verifyEmailConfig } from "@/apis/config";
import { cloneDeep, isEqual } from "lodash-es";
import { useServerConfigStore } from "@/stores";
import { watch } from "vue";
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const notif = useNotification();

const serverConfigStore = useServerConfigStore();

const formData = reactive<IServerConfigMailer>({
  enable: false,
  tls: true
});

const schema = z.object({
  host: z.string(),
  port: z.coerce.number(),
  tls: z.boolean().optional(),
  user: z.email(),
  pass: z.string(),
  notif_email: z.string({ message: "请输入内容" }).email(),
  enable_comment_notif: z.boolean().optional(),
  enable: z.boolean().optional()
});

const state = reactive({
  isChange: false,
  submitting: false
});

let formWatcher: WatchStopHandle;
const startWatch = () => {
  formWatcher = watch(formData, (newVal) => {
    state.isChange = !isEqual(newVal, serverConfigStore.mailer);
  });
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  Object.assign(formData, cloneDeep(serverConfigStore.mailer));
  startWatch();
});

const handleReset = () => {
  stopWatch();

  // formData.host = serverConfigStore.mailer.host;
  // formData.port = serverConfigStore.mailer.port;
  // formData.tls = serverConfigStore.mailer.tls;
  // formData.user = serverConfigStore.mailer.user;
  // formData.pass = serverConfigStore.mailer.pass;
  // formData.notif_email = serverConfigStore.mailer.notif_email;
  // formData.enable_comment_notif = serverConfigStore.mailer.enable_comment_notif;
  // formData.enable = serverConfigStore.mailer.enable;

  Object.assign(formData, cloneDeep(serverConfigStore.mailer));

  state.isChange = false;

  startWatch();
};

const formRef = useTemplateRef("formRef");
const handleSave = () => {
  formRef.value?.submit();
};

const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  state.submitting = true;
  try {
    if (formData.enable) {
      await verifyEmailConfig({
        host: event.data.host,
        port: event.data.port,
        tls: event.data.tls,
        user: event.data.user,
        pass: event.data.pass,
        notif_email: event.data.notif_email
      });
    }
  } catch (error) {
    notif.error("验证失败", error);
    state.submitting = false;
    return;
  }

  try {
    await updateServerConfig({
      mailer: unref(formData)
    });
    await serverConfigStore.fetch();
    handleReset();
    notif.success("更新成功");
  } catch (error) {
    notif.error("更新失败", error);
  } finally {
    state.submitting = false;
  }
};
</script>
<template>
  <div class="p-4 shadow-md rounded">
    <div class="mb-4 flex justify-between items-center min-h-8">
      <h3 class="pl-2 border-l-4 border-primary leading-none">邮件设置</h3>
      <div v-if="state.isChange" class="space-x-2">
        <UButton variant="outline" size="sm" :disabled="state.submitting" @click="handleReset">
          取消
        </UButton>
        <UButton size="sm" :loading="state.submitting" @click="handleSave"> 保存 </UButton>
      </div>
    </div>

    <UForm
      ref="formRef"
      class="space-y-2"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField
        name="enable"
        label="开启邮件通知"
        description="开启邮件通知后将向指定邮箱发送网站事件通知."
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <USwitch
          v-model="formData.enable"
          :disabled="!(formData.user && formData.pass && formData.notif_email)"
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
        name="notif_email"
        label="通知邮箱"
        description="用于接收系统通知的邮箱"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.notif_email"
          class="w-full"
          icon="i-lucide-mail"
          placeholder="请输入通知邮箱"
        />
      </UFormField>
      <UFormField
        name="enable_comment_notif"
        label="评论通知"
        description="开启评论通知后，评论被回复时，将通过评论邮箱通知用户"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <USwitch v-model="formData.enable_comment_notif" />
      </UFormField>
    </UForm>
  </div>
</template>
