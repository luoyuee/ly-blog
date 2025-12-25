<script setup lang="ts">
import type { IClientConfigBeian } from "#shared/types/config";
import type { WatchStopHandle } from "vue";
import { assign, cloneDeep, isEqual } from "lodash-es";
import { useConfigStore } from "@/stores";
import { watch } from "vue";
import { z } from "zod";

const configStore = useConfigStore();

const schema = z.object({
  beian_code: z.string().optional(),
  icp_code: z.string().optional()
});

const formData = reactive<IClientConfigBeian>({
  beian_code: undefined,
  icp_code: undefined
});

const state = reactive({
  isChange: false,
  submitting: false
});

let formWatcher: WatchStopHandle;
const startWatch = () => {
  formWatcher = watch(formData, (newVal) => {
    state.isChange = !isEqual(newVal, configStore.author_card);
  });
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  assign(formData, cloneDeep(configStore.beian));
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
      beian: unref(formData)
    });
    handleReset();
  } catch (error) {
    console.error(error);
  } finally {
    state.submitting = false;
  }
};

const handleReset = () => {
  stopWatch();

  formData.beian_code = configStore.beian.beian_code;
  formData.icp_code = configStore.beian.icp_code;

  state.isChange = false;

  startWatch();
};
</script>
<template>
  <div class="p-4 shadow-md rounded">
    <div class="mb-4 flex justify-between items-center min-h-8">
      <h3 class="pl-2 border-l-4 border-primary leading-none">备案信息</h3>
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
  </div>
</template>
