<script setup lang="ts">
import type { IClientConfigFleetingThought } from "#shared/types/config";
import { cloneDeep } from "es-toolkit";
import { useForm } from "@/composables/useForm";
import { useConfigStore } from "@/stores";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const configStore = useConfigStore();

const schema = z.object({
  intro: z.string().optional()
});

const createInitialFormData = (): IClientConfigFleetingThought => {
  return cloneDeep(configStore.fleeting_thought);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IClientConfigFleetingThought>(createInitialFormData());

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
      fleeting_thought: cloneDeep(formData)
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
    id="fleeting-thought-setting"
    title="闪念笔记设置"
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
        name="intro"
        label="引言"
        description="闪念笔记顶部引言"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UTextarea v-model="formData.intro" class="w-full" placeholder="请输入引言" />
      </UFormField>
    </UForm>
  </SettingCard>
</template>
