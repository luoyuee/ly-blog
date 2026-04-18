<script setup lang="ts">
import type { IClientConfigBeian } from "#shared/types/config";
import { cloneDeep } from "es-toolkit";
import { useForm } from "@/composables/useForm";
import { useConfigStore } from "@/stores";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const configStore = useConfigStore();

const schema = z.object({
  beian_code: z.string().optional(),
  icp_code: z.string().optional()
});

const createInitialFormData = (): IClientConfigBeian => {
  return cloneDeep(configStore.beian);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IClientConfigBeian>(createInitialFormData());

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
      beian: cloneDeep(formData)
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
    id="beian-setting"
    title="备案信息"
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
        name="site_url"
        label="网安备案号"
        description="站点地址主要用于生成内容的永久链接"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.beian_code" class="w-full" placeholder="请输入网安备案号" />
      </UFormField>
      <UFormField
        name="site_url"
        label="ICP备案号"
        description="站点地址主要用于生成内容的永久链接"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.icp_code" class="w-full" placeholder="请输入ICP备案号" />
      </UFormField>
    </UForm>
  </SettingCard>
</template>
