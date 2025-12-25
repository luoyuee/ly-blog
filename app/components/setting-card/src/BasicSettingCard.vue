<script setup lang="ts">
import type { IClientConfigBasic } from "#shared/types/config";
import type { WatchStopHandle } from "vue";
import { InputTagArea } from "@/components/form/input";
import { cloneDeep, isEqual } from "lodash-es";
import { useConfigStore } from "@/stores";
import { watch } from "vue";
import { z } from "zod";

const configStore = useConfigStore();

const schema = z.object({
  title: z.string(),
  description: z.string(),
  site_url: z.url(),
  keywords: z.string().array(),
  notice: z.string().optional()
});

const formData = reactive<IClientConfigBasic>({
  title: "",
  description: "",
  site_url: undefined,
  keywords: [],
  notice: undefined
});

const state = reactive({
  isChange: false,
  submitting: false
});

let formWatcher: WatchStopHandle;
const startWatch = () => {
  formWatcher = watch(formData, (newVal) => {
    state.isChange = !isEqual(newVal, configStore.basic);
  });
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  Object.assign(formData, cloneDeep(configStore.basic));
  startWatch();
});

const formRef = useTemplateRef("formRef");
const handleSave = () => {
  formRef.value?.submit();
};

const handleSubmit = async () => {
  state.submitting = true;
  try {
    await configStore.update({
      basic: unref(formData)
    });
    handleReset();
  } finally {
    state.submitting = false;
  }
};

const handleReset = () => {
  stopWatch();

  Object.assign(formData, cloneDeep(configStore.basic));

  state.isChange = false;

  startWatch();
};
</script>
<template>
  <div class="p-4 shadow-md rounded">
    <div class="mb-4 flex justify-between items-center min-h-8">
      <h3 class="pl-2 border-l-4 border-primary leading-none">基本信息</h3>
      <div v-if="state.isChange" class="space-x-2">
        <UButton variant="outline" size="sm" :disabled="state.submitting" @click="handleReset">
          取消
        </UButton>
        <UButton size="sm" :loading="state.submitting" @click="handleSave"> 保存 </UButton>
      </div>
    </div>
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
      <UFormField
        name="notice"
        label="博客公告"
        description="博客公告将显示在网页右侧"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UTextarea v-model="formData.notice" class="w-full" placeholder="请输入站点描述" />
      </UFormField>
    </UForm>
  </div>
</template>
