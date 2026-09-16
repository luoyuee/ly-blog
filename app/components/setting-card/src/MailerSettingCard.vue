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

const { t } = useI18n();

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
  notify_email: z.email({
    message: t("components.settingCard.mailer.validation.notifyEmailInvalid")
  }),
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
      title: t("components.settingCard.mailer.verifyFail"),
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
      title: t("components.settingCard.mailer.testSuccess")
    });
  } catch (error) {
    $notify.error({
      title: t("components.settingCard.mailer.testFail"),
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
    :title="$t('components.settingCard.mailer.title')"
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
        :label="$t('components.settingCard.mailer.enableLabel')"
        :description="$t('components.settingCard.mailer.enableDescription')"
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
        :label="$t('components.settingCard.mailer.hostLabel')"
        :description="$t('components.settingCard.mailer.hostDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.host"
          class="w-full"
          icon="lucide:link"
          :placeholder="$t('components.settingCard.mailer.hostPlaceholder')"
        />
      </UFormField>
      <UFormField
        name="port"
        :label="$t('components.settingCard.mailer.portLabel')"
        :description="$t('components.settingCard.mailer.portDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInputNumber
          v-model="formData.port"
          :min="0"
          :max="65535"
          :placeholder="$t('components.settingCard.mailer.portPlaceholder')"
        />
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
        :label="$t('components.settingCard.mailer.systemEmailLabel')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.user"
          class="w-full"
          icon="lucide:mail"
          :placeholder="$t('components.settingCard.mailer.systemEmailPlaceholder')"
        />
      </UFormField>
      <UFormField
        name="pass"
        :label="$t('components.settingCard.mailer.authCodeLabel')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.pass"
          class="w-full"
          icon="lucide:lock-keyhole"
          :placeholder="$t('components.settingCard.mailer.authCodePlaceholder')"
        />
      </UFormField>
      <UFormField
        name="notify_email"
        :label="$t('components.settingCard.mailer.notifyEmailLabel')"
        :description="$t('components.settingCard.mailer.notifyEmailDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UFieldGroup class="w-full">
          <UInput
            v-model="formData.notify_email"
            class="w-full"
            icon="lucide:mail"
            :placeholder="$t('components.settingCard.mailer.notifyEmailPlaceholder')"
          />
          <UButton class="shrink-0" :loading="sendLoading" @click="handleTestEmail">
            {{ $t("components.settingCard.mailer.sendTest") }}
          </UButton>
        </UFieldGroup>
      </UFormField>
      <UFormField
        name="comment_notify_enabled"
        :label="$t('components.settingCard.mailer.commentNotifyLabel')"
        :description="$t('components.settingCard.mailer.commentNotifyDescription')"
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
