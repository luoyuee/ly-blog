<script setup lang="ts">
import type { IClientConfigMessageBoard } from "#shared/types/config";
import { useForm } from "@/composables/useForm";
import { useConfigStore } from "@/stores";
import { cloneDeep } from "es-toolkit";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const configStore = useConfigStore();

const schema = z.object({
  intro: z.string().optional(),
  message_max_length: z.number().optional()
});

const createInitialFormData = (): IClientConfigMessageBoard => {
  return cloneDeep(configStore.message_board);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IClientConfigMessageBoard>(createInitialFormData());

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
      message_board: cloneDeep(formData)
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
    id="message-board-setting"
    :title="$t('components.settingCard.messageBoard.title')"
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
        :label="$t('components.settingCard.messageBoard.introLabel')"
        :description="$t('components.settingCard.messageBoard.introDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UTextarea
          v-model="formData.intro"
          class="w-full"
          :placeholder="$t('components.settingCard.messageBoard.introPlaceholder')"
        />
      </UFormField>
      <UFormField
        name="site_url"
        :label="$t('components.settingCard.messageBoard.maxLengthLabel')"
        :description="$t('components.settingCard.messageBoard.maxLengthDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInputNumber
          v-model="formData.message_max_length"
          :placeholder="$t('components.settingCard.messageBoard.maxLengthPlaceholder')"
          :min="1"
          :max="9999"
        />
      </UFormField>
    </UForm>
  </SettingCard>
</template>
