<script setup lang="ts">
import type { IServerConfigStorage } from "#shared/types/config";
import { useForm } from "@/composables/useForm";
import { useServerConfigStore } from "@/stores";
import { cloneDeep } from "es-toolkit";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const { t } = useI18n();

const serverConfigStore = useServerConfigStore();

const schema = z.object({
  type: z.string({
    message: t("components.settingCard.storage.form.typeRequired")
  }),
  base_path: z
    .string({ message: t("components.settingCard.storage.form.basePathInvalid") })
    .min(1, t("components.settingCard.storage.form.basePathInvalid")),
  end_point: z.string(),
  url_format: z.string(),
  port: z.number(),
  region: z.string(),
  bucket: z.string(),
  use_ssl: z.boolean(),
  access_key: z.string(),
  secret_key: z.string()
});

const createInitialFormData = (): IServerConfigStorage => {
  return cloneDeep(serverConfigStore.storage);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IServerConfigStorage>(createInitialFormData());

const isLocal = computed(() => formData.type === "local");

const syncFormData = () => {
  const nextFormData = createInitialFormData();
  setInitial(nextFormData);
  setForm(nextFormData);
};

const handleSubmit = async () => {
  try {
    formState.submitting = true;
    await serverConfigStore.update({
      storage: cloneDeep(formData)
    });

    syncFormData();
  } finally {
    formState.submitting = false;
  }
};

const formRef = useTemplateRef("formRef");

const handleSave = () => {
  formRef.value?.submit();
};

const handleReset = () => {
  resetForm();
};
</script>
<template>
  <SettingCard
    :title="t('components.settingCard.storage.title')"
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
        name="type"
        required
        :label="t('components.settingCard.storage.form.typeLabel')"
        :description="t('components.settingCard.storage.form.typeDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <USelect
          v-model="formData.type"
          class="w-full"
          icon="lucide:database"
          :placeholder="t('components.settingCard.storage.form.typePlaceholder')"
          :items="['local', 'minio']"
        />
      </UFormField>

      <UFormField
        label="Base Path"
        name="base_path"
        :description="t('components.settingCard.storage.form.basePathDescription')"
        required
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.base_path"
          class="w-full"
          icon="lucide:folder"
          :placeholder="t('components.settingCard.storage.form.basePathPlaceholder')"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="intro"
        label="End Point"
        required
        :description="t('components.settingCard.storage.form.endPointDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.end_point"
          class="w-full"
          icon="lucide:link"
          :placeholder="t('components.settingCard.storage.form.endPointPlaceholder')"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="intro"
        label="Port"
        required
        :description="t('components.settingCard.storage.form.portDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.port"
          class="w-full"
          icon="lucide:ethernet-port"
          type="number"
          :placeholder="t('components.settingCard.storage.form.portPlaceholder')"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="SSL"
        label="SSL"
        required
        :description="t('components.settingCard.storage.form.sslDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <USwitch v-model="formData.use_ssl" :disabled="isLocal" />
      </UFormField>

      <UFormField
        name="intro"
        label="Url Format"
        required
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <template #description>
          <div>
            <p>
              {{
                t("components.settingCard.storage.form.urlFormatHint")
              }}https://${bucket}.cos.${region}.myqcloud.com/${filename}
            </p>
            <div class="py-2 space-y-1">
              <p>
                {{ t("components.settingCard.storage.form.bucketNameLabel")
                }}<span class="text-blue-400">${bucket}</span>
              </p>
              <p>
                {{ t("components.settingCard.storage.form.regionLabel")
                }}<span class="text-blue-400">${region}</span>
              </p>
              <p>
                {{ t("components.settingCard.storage.form.filenameLabel")
                }}<span class="text-blue-400">${filename}</span>
              </p>
            </div>
          </div>
        </template>
        <UInput
          v-model="formData.url_format"
          class="w-full"
          icon="lucide:link"
          :placeholder="t('components.settingCard.storage.form.urlFormatPlaceholder')"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="intro"
        label="Region"
        required
        :description="t('components.settingCard.storage.form.regionDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.region"
          class="w-full"
          icon="lucide:map-pin"
          :placeholder="t('components.settingCard.storage.form.regionPlaceholder')"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="intro"
        label="Bucket"
        required
        :description="t('components.settingCard.storage.form.bucketDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.bucket"
          class="w-full"
          icon="lucide:server"
          :placeholder="t('components.settingCard.storage.form.bucketPlaceholder')"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="intro"
        label="Access Key"
        required
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.access_key"
          class="w-full"
          icon="lucide:shield-check"
          :placeholder="t('components.settingCard.storage.form.accessKeyPlaceholder')"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="intro"
        label="Secret Key"
        required
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.secret_key"
          class="w-full"
          icon="lucide:key-round"
          type="password"
          :placeholder="t('components.settingCard.storage.form.secretKeyPlaceholder')"
          :disabled="isLocal"
        />
      </UFormField>
    </UForm>
  </SettingCard>
</template>
