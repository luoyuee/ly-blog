<script setup lang="ts">
import type { IClientConfigBasic } from "#shared/types/config";
import { InputTagArea } from "@/components/form/input";
import { useForm } from "@/composables/useForm";
import { useConfigStore } from "@/stores";
import { cloneDeep } from "es-toolkit";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const configStore = useConfigStore();

const schema = z.object({
  title: z.string(),
  description: z.string(),
  site_url: z.url(),
  keywords: z.string().array()
});

const createInitialFormData = (): IClientConfigBasic => {
  return cloneDeep(configStore.basic);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IClientConfigBasic>(createInitialFormData());

const syncFormData = () => {
  const nextFormData = createInitialFormData();
  setInitial(nextFormData);
  setForm(nextFormData);
};

const formRef = useTemplateRef("formRef");

const handleSave = () => {
  formRef.value?.submit();
};

const handleSubmit = async () => {
  formState.submitting = true;

  try {
    await configStore.update({
      basic: cloneDeep(formData)
    });

    syncFormData();
  } finally {
    formState.submitting = false;
  }
};

const handleReset = () => {
  resetForm();
};
</script>
<template>
  <SettingCard
    id="basic-setting"
    :title="$t('components.settingCard.basic.title')"
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
        required
        name="title"
        :label="$t('components.settingCard.basic.siteNameLabel')"
        :description="$t('components.settingCard.basic.siteNameDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.title"
          class="w-full"
          :placeholder="$t('components.settingCard.basic.siteNamePlaceholder')"
        />
      </UFormField>
      <UFormField
        name="site_url"
        :label="$t('components.settingCard.basic.siteUrlLabel')"
        :description="$t('components.settingCard.basic.siteUrlDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.site_url"
          class="w-full"
          icon="lucide:link"
          :placeholder="$t('components.settingCard.basic.siteNamePlaceholder')"
        />
      </UFormField>
      <UFormField
        required
        name="description"
        :label="$t('components.settingCard.basic.siteDescLabel')"
        :description="$t('components.settingCard.basic.siteDescDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UTextarea
          v-model="formData.description"
          class="w-full"
          :placeholder="$t('components.settingCard.basic.siteDescPlaceholder')"
        />
      </UFormField>
      <UFormField
        required
        name="keywords"
        :label="$t('components.settingCard.basic.keywordsLabel')"
        :description="$t('components.settingCard.basic.siteDescDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <InputTagArea v-model="formData.keywords" class="w-full" />
      </UFormField>
    </UForm>
  </SettingCard>
</template>
