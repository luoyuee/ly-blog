<script setup lang="ts">
import type { IClientConfigMessageBoard } from "#shared/types/config";
import type { WatchStopHandle } from "vue";
import { assign, cloneDeep, isEqual } from "lodash-es";
import { updateClientConfig } from "@/apis/config";
import { useConfigStore } from "@/stores";
import { watch } from "vue";
import { z } from "zod";

const $notify = useNotification();

const configStore = useConfigStore();

const schema = z.object({
  intro: z.string().optional(),
  message_max_length: z.number().optional()
});

const formData = reactive<IClientConfigMessageBoard>({});

const state = reactive({
  isChange: false,
  submitting: false
});

let formWatcher: WatchStopHandle;
const startWatch = () => {
  formWatcher = watch(formData, (newVal) => {
    state.isChange = !isEqual(newVal, configStore.message_board);
  });
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  assign(formData, cloneDeep(configStore.message_board));
  startWatch();
});

const formRef = useTemplateRef("formRef");
const handleSave = () => {
  formRef.value?.submit();
};

const handleSubmit = async () => {
  state.submitting = true;
  try {
    await updateClientConfig({
      message_board: unref(formData)
    });
    await configStore.fetch();
    handleReset();
    $notify.success({
      title: "更新成功"
    });
  } catch {
    $notify.error({
      title: "更新失败"
    });
  } finally {
    state.submitting = false;
  }
};

const handleReset = () => {
  formData.intro = configStore.message_board.intro;
  formData.message_max_length = configStore.message_board.message_max_length;

  stopWatch();
  state.isChange = false;
  startWatch();
};
</script>
<template>
  <div class="p-4 shadow-md rounded">
    <div class="mb-4 flex justify-between items-center min-h-8">
      <h3 class="pl-2 border-l-4 border-primary leading-none">留言板设置</h3>
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
        label="引言"
        description="留言板顶部引言"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UTextarea v-model="formData.intro" class="w-full" placeholder="请输入引言" />
      </UFormField>
      <UFormField
        name="site_url"
        label="留言长度"
        description="限制留言的最大文本长度，默认3000字"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <UInputNumber
          v-model="formData.message_max_length"
          placeholder="请输入最大长度"
          :min="1"
          :max="9999"
        />
      </UFormField>
    </UForm>
  </div>
</template>
