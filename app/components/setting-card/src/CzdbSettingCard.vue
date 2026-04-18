<script setup lang="ts">
import type { IServerConfigCzdb } from "#shared/types/config";
import SettingCard from "./SettingCard.vue";
import { cloneDeep } from "es-toolkit";
import { useForm } from "@/composables/useForm";
import { useServerConfigStore } from "@/stores";
import { z } from "zod";

const serverConfigStore = useServerConfigStore();

const schema = z.object({
  download_url: z.union([z.url("请输入正确的下载链接"), z.literal("")]).optional()
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
    title="CZDB 设置"
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
        label="下载链接"
        description="用于下载 CZDB 压缩包并更新 v4/v6 数据库文件"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInput
          v-model="formData.download_url"
          class="w-full"
          icon="i-lucide-link"
          placeholder="请输入 CZDB 下载链接"
        />
      </UFormField>
    </UForm>
  </SettingCard>
</template>
