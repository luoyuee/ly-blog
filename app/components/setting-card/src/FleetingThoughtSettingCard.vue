<script setup lang="ts">
import type { IClientConfigFleetingThought } from "#shared/types/config";
import type { WatchStopHandle } from "vue";
import { assign, cloneDeep, isEqual } from "lodash-es";
import { updateClientConfig } from "@/apis/config";
import { useConfigStore } from "@/stores";
import { watch } from "vue";
import { z } from "zod";

const notif = useNotification();
const configStore = useConfigStore();

const schema = z.object({
  intro: z.string().optional()
});

const formData = reactive<IClientConfigFleetingThought>({});

const state = reactive({
  isChange: false,
  submitting: false
});

let formWatcher: WatchStopHandle;
const startWatch = () => {
  formWatcher = watch(formData, (newVal) => {
    state.isChange = !isEqual(newVal, configStore.fleeting_thought);
  });
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  assign(formData, cloneDeep(configStore.fleeting_thought));
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
      fleeting_thought: unref(formData)
    });
    await configStore.fetch();
    handleReset();
    notif.success("更新成功");
  } catch {
    notif.error("更新失败");
  } finally {
    state.submitting = false;
  }
};

const handleReset = () => {
  formData.intro = configStore.fleeting_thought.intro;

  stopWatch();
  state.isChange = false;
  startWatch();
};
</script>
<template>
  <div class="p-4 shadow-md rounded">
    <div class="mb-4 flex justify-between items-center min-h-8">
      <h3 class="pl-2 border-l-4 border-primary leading-none">闪念笔记设置</h3>
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
  </div>
</template>
