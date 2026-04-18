<script setup lang="ts">
import type { IClientConfigBackground } from "@@/shared/types/config";
import { useForm } from "@/composables/useForm";
import { useConfigStore } from "@/stores";
import { cloneDeep } from "es-toolkit";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const configStore = useConfigStore();

const createInitialFormData = (): IClientConfigBackground => {
  return cloneDeep(configStore.background);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IClientConfigBackground>(createInitialFormData());

const schema = z.object({
  home_page_bg: z.string().optional(),
  home_title: z.string().optional(),
  home_sub_title: z.string().optional(),
  catalog_page_bg: z.string().optional(),
  tag_page_bg: z.string().optional(),
  article_page_bg: z.string().optional()
});

const syncFormData = () => {
  const nextFormData = createInitialFormData();
  setInitial(nextFormData);
  setForm(nextFormData);
};

const formRef = useTemplateRef("formRef");

/**
 * 触发表单校验与保存
 */
const handleSave = () => {
  formRef.value?.submit();
};

/**
 * 顶部背景设置表单提交处理
 */
const handleSubmit = async () => {
  formState.submitting = true;
  try {
    await configStore.update({
      background: cloneDeep(formData)
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
    id="hero-setting"
    title="顶部背景设置"
    :is-change="isDirty"
    :submitting="formState.submitting"
    @reset="handleReset"
    @save="handleSave"
  >
    <UForm
      ref="formRef"
      class="space-y-3"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField
        name="home_page_bg"
        label="首屏图片"
        description="填写图片 URL，不填将随机图片，下面图片设置同理"
        :ui="{
          container: 'mt-2',
          description: 'text-xs text-gray-400'
        }"
      >
        <UInput v-model="formData.home_page_bg" placeholder="请输入图片链接" icon="ep:link" />
      </UFormField>

      <UFormField
        name="home_title"
        label="首屏标题"
        :ui="{
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.home_title" placeholder="请输入标题" />
      </UFormField>

      <UFormField
        name="home_sub_title"
        label="首屏副标题"
        description="一行一句，循环播放"
        :ui="{
          container: 'mt-2',
          description: 'text-xs text-gray-400'
        }"
      >
        <UTextarea v-model="formData.home_sub_title" :rows="3" placeholder="请输入副标题" />
      </UFormField>

      <UFormField
        name="catalog_page_bg"
        label="分类页头图"
        :ui="{
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.catalog_page_bg" placeholder="随机图片" icon="ep:link" />
      </UFormField>

      <UFormField
        name="tag_page_bg"
        label="标签分类页头图"
        :ui="{
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.tag_page_bg" placeholder="随机图片" icon="ep:link" />
      </UFormField>

      <UFormField
        name="article_page_bg"
        label="文章页头图"
        :ui="{
          container: 'mt-2'
        }"
      >
        <UInput v-model="formData.article_page_bg" placeholder="随机图片" icon="ep:link" />
      </UFormField>
    </UForm>
  </SettingCard>
</template>
