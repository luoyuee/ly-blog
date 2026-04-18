<script setup lang="ts">
import type { HitokotoTypeSelectOption } from "#shared/types/hitokoto";
import type { IClientConfigHitokoto } from "#shared/types/config";
import { getHitokotoTypeOptions } from "@/apis/hitokoto";
import { useForm } from "@/composables/useForm";
import { useConfigStore } from "@/stores";
import { cloneDeep } from "es-toolkit";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const $notify = useNotification();

const configStore = useConfigStore();

const typeOptions = ref<HitokotoTypeSelectOption[]>([]);

const loadHitokotoTypes = async () => {
  try {
    typeOptions.value = await getHitokotoTypeOptions();
  } catch (error) {
    $notify.error({
      title: "获取分类失败",
      error
    });
  }
};

const schema = z.object({
  max_length: z.number().optional(),
  type: z.number().array().optional()
});

const createInitialFormData = (): IClientConfigHitokoto => {
  return cloneDeep(configStore.hitokoto);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IClientConfigHitokoto>(createInitialFormData());

const syncFormData = () => {
  const nextFormData = createInitialFormData();
  setInitial(nextFormData);
  setForm(nextFormData);
};

onMounted(() => {
  loadHitokotoTypes();
});

const formRef = useTemplateRef("formRef");

const handleSave = () => {
  formRef.value?.submit();
};

const handleSubmit = async () => {
  formState.submitting = true;

  try {
    await configStore.update({
      hitokoto: cloneDeep(formData)
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
    id="hitokoto-setting"
    title="一言"
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
        label="一言类型"
        description="没有选择时，将不限定类型"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <USelect
          v-model="formData.type"
          class="w-full"
          :items="typeOptions"
          value-key="id"
          label-key="name"
          multiple
          highlight
          placeholder="请选择类型"
        />
      </UFormField>
      <UFormField
        name="max_length"
        label="文本长度"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInputNumber v-model="formData.max_length" placeholder="请输入文本长度" />
      </UFormField>
    </UForm>
  </SettingCard>
</template>
