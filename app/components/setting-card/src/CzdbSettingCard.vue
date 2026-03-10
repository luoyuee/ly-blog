<script setup lang="ts">
import type { IServerConfigCzdb } from "#shared/types/config";
import type { WatchStopHandle } from "vue";
import SettingCard from "./SettingCard.vue";
import { cloneDeep, isEqual } from "lodash-es";
import { useServerConfigStore } from "@/stores";
import { watch } from "vue";
import { z } from "zod";

const serverConfigStore = useServerConfigStore();

const schema = z.object({
  download_url: z.union([z.url("请输入正确的下载链接"), z.literal("")]).optional()
});

const formData = reactive<IServerConfigCzdb>({
  download_url: undefined
});

const state = reactive({
  isChange: false,
  submitting: false
});

let formWatcher: WatchStopHandle;
const startWatch = () => {
  formWatcher = watch(formData, (newVal) => {
    state.isChange = !isEqual(newVal, serverConfigStore.czdb || {});
  });
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  Object.assign(formData, cloneDeep(serverConfigStore.czdb || {}));
  startWatch();
});

const formRef = useTemplateRef("formRef");
const handleSave = () => {
  formRef.value?.submit();
};

const handleSubmit = async () => {
  state.submitting = true;
  try {
    await serverConfigStore.update({
      czdb: unref(formData)
    });
    handleReset();
  } finally {
    state.submitting = false;
  }
};

const handleReset = () => {
  stopWatch();

  Object.assign(formData, cloneDeep(serverConfigStore.czdb || {}));

  state.isChange = false;

  startWatch();
};
</script>

<template>
  <SettingCard
    title="CZDB 设置"
    :is-change="state.isChange"
    :submitting="state.submitting"
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
