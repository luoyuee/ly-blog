<script setup lang="ts">
import type { HitokotoTypeSelectOption } from "@/types/hitokoto";
import type { ClientConfigHitokoto } from "@/types/config";
import type { WatchStopHandle } from "vue";
import { getHitokotoTypeOptions } from "@/apis/hitokoto";
import { updateClientConfig } from "@/apis/config";
import { cloneDeep, isEqual } from "lodash-es";
import { useConfigStore } from "@/stores";
import { watch } from "vue";
import { z } from "zod";

const notif = useNotification();

const configStore = useConfigStore();

const typeOptions = ref<HitokotoTypeSelectOption[]>([]);

const loadHitokotoTypes = async () => {
  try {
    typeOptions.value = await getHitokotoTypeOptions();
  } catch (error) {
    notif.error("获取分类失败", error);
  }
};

const schema = z.object({
  max_length: z.number().optional(),
  type: z.number().array().optional(),
});

const formData = reactive<ClientConfigHitokoto>({
  max_length: undefined,
  type: undefined,
});

const state = reactive({
  isChange: false,
  submitting: false,
});

let formWatcher: WatchStopHandle;
const startWatch = () => {
  formWatcher = watch(formData, (newVal) => {
    state.isChange = !isEqual(newVal, configStore.hitokoto);
  });
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  loadHitokotoTypes();
  console.log(configStore.hitokoto)
  Object.assign(formData, cloneDeep(configStore.hitokoto));
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
      hitokoto: unref(formData),
    });
    await configStore.fetch();
    handleReset();
    notif.success("更新成功");
  } catch (error) {
    notif.error("更新失败", error);
  } finally {
    state.submitting = false;
  }
};

const handleReset = () => {
  stopWatch();

  Object.assign(formData, cloneDeep(configStore.hitokoto));

  state.isChange = false;

  startWatch();
};
</script>
<template>
  <div class="p-4 shadow-md rounded">
    <div class="mb-4 flex justify-between items-center min-h-8">
      <h3 class="pl-2 border-l-4 border-primary leading-none">一言</h3>
      <div class="space-x-2" v-if="state.isChange">
        <UButton
          variant="outline"
          size="sm"
          :disabled="state.submitting"
          @click="handleReset"
        >
          取消
        </UButton>
        <UButton size="sm" :loading="state.submitting" @click="handleSave">
          保存
        </UButton>
      </div>
    </div>
    <UForm
      class="space-y-2"
      ref="formRef"
      :schema="schema"
      :state="formData"
      :validateOnInputDelay="100"
      @submit="handleSubmit"
    >
      <UFormField
        name="site_url"
        label="一言类型"
        description="没有选择时，将不限定类型"
        :ui="{
          description: 'text-xs',
          container: 'mt-2',
        }"
      >
        <USelect
          class="w-full"
          :items="typeOptions"
          valueKey="id"
          labelKey="name"
          multiple
          highlight
          v-model="formData.type"
          placeholder="请选择类型"
        />
      </UFormField>
      <UFormField
        name="max_length"
        label="文本长度"
        :ui="{
          description: 'text-xs',
          container: 'mt-2',
        }"
      >
        <UInputNumber
          v-model="formData.max_length"
          placeholder="请输入文本长度"
        />
      </UFormField>
    </UForm>
  </div>
</template>
