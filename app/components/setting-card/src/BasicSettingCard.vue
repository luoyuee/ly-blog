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
    title="基本信息"
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
        label="站点名称"
        description="站点的名称将显示在网页的标题处"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.title" class="w-full" placeholder="请输入站点名称" />
      </UFormField>
      <UFormField
        name="site_url"
        label="站点地址"
        description="站点地址主要用于生成内容的永久链接"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.site_url"
          class="w-full"
          icon="i-lucide-link"
          placeholder="请输入站点名称"
        />
      </UFormField>
      <UFormField
        required
        name="description"
        label="站点描述"
        description="站点描述将显示在网页代码的头部"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UTextarea v-model="formData.description" class="w-full" placeholder="请输入站点描述" />
      </UFormField>
      <UFormField
        required
        name="keywords"
        label="关键词"
        description="站点描述将显示在网页代码的头部"
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
