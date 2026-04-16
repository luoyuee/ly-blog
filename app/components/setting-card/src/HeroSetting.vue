<script setup lang="ts">
import type { IClientConfigBackground } from "@@/shared/types/config";
import type { WatchStopHandle } from "vue";
import { cloneDeep, isEqual } from "es-toolkit";
import { updateClientConfig } from "@/apis/config";
import { useConfigStore } from "@/stores";
import { watch } from "vue";
import { z } from "zod";

const configStore = useConfigStore();

const formData = reactive<IClientConfigBackground>({});

const state = reactive({
  isChange: false,
  submitting: false
});

const schema = z.object({
  home_page_bg: z.string().optional(),
  home_title: z.string().optional(),
  home_sub_title: z.string().optional(),
  catalog_page_bg: z.string().optional(),
  tag_page_bg: z.string().optional(),
  article_page_bg: z.string().optional()
});

let formWatcher: WatchStopHandle;
const startWatch = () => {
  formWatcher = watch(formData, (newVal) => {
    console.log(newVal, configStore.background);

    state.isChange = !isEqual(newVal, configStore.background);
  });
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  Object.assign(formData, cloneDeep(configStore.background));
  startWatch();
});

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
  state.submitting = true;
  try {
    await updateClientConfig({
      background: unref(formData)
    });
    await configStore.fetch();
    handleReset();
  } finally {
    state.submitting = false;
  }
};

const handleReset = () => {
  formData.home_page_bg = configStore.background.home_page_bg;
  formData.home_title = configStore.background.home_title;
  formData.home_sub_title = configStore.background.home_sub_title;
  formData.catalog_page_bg = configStore.background.catalog_page_bg;
  formData.tag_page_bg = configStore.background.tag_page_bg;
  formData.article_page_bg = configStore.background.article_page_bg;

  stopWatch();
  state.isChange = false;
  startWatch();
};
</script>
<template>
  <div class="background-setting p-4 shadow-md rounded">
    <div class="mb-4 flex justify-between items-center min-h-8">
      <h3 class="pl-2 border-l-4 border-primary leading-none">顶部背景设置</h3>
      <div v-if="state.isChange" class="space-x-2">
        <UButton variant="outline" size="sm" :disabled="state.submitting" @click="handleReset">
          取消
        </UButton>
        <UButton size="sm" :loading="state.submitting" @click="handleSave"> 保存 </UButton>
      </div>
    </div>
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
  </div>
</template>
