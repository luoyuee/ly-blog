<script setup lang="ts">
import type { IServerConfigCzdb } from "#shared/types/config";
import SettingCard from "./SettingCard.vue";
import { cloneDeep } from "es-toolkit";
import { useForm } from "@/composables/useForm";
import { useServerConfigStore } from "@/stores";
import { z } from "zod";

const { t } = useI18n();

const serverConfigStore = useServerConfigStore();

const schema = z.object({
  download_url: z
    .union([z.url(t("components.settingCard.czdb.validation.urlInvalid")), z.literal("")])
    .optional()
});

const createInitialFormData = (): IServerConfigCzdb => {
  return cloneDeep(serverConfigStore.czdb || {});
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IServerConfigCzdb>(createInitialFormData());

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
    await serverConfigStore.update({
      czdb: cloneDeep(formData)
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
    id="czdb-setting"
    :title="$t('components.settingCard.czdb.title')"
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
        name="download_url"
        :label="$t('components.settingCard.czdb.downloadUrlLabel')"
        :description="$t('components.settingCard.czdb.downloadUrlDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.download_url"
          class="w-full"
          icon="lucide:link"
          :placeholder="$t('components.settingCard.czdb.downloadUrlPlaceholder')"
        />
      </UFormField>
    </UForm>
  </SettingCard>
</template>
