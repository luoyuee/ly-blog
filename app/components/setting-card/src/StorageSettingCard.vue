<script setup lang="ts">
import type { IServerConfigStorage } from "@/types/config";
import type { WatchStopHandle } from "vue";
import { assign, cloneDeep, isEqual } from "lodash-es";
import { useServerConfigStore } from "@/stores";
import { watch } from "vue";
import { z } from "zod";

const { t } = useI18n();

const serverConfigStore = useServerConfigStore();

const schema = z.object({
  type: z.string({
    message: t("components.settingCard.storage.form.typeRequired"),
  }),
  base_path: z.string({ message: t("") }).min(1, "请输入存储路径"),
  end_point: z.string(),
  url_format: z.string(),
  port: z.number(),
  region: z.string(),
  bucket: z.string(),
  use_ssl: z.boolean(),
  access_key: z.string(),
  secret_key: z.string(),
});

const formData = reactive<IServerConfigStorage>({});

const isLocal = computed(() => formData.type === "local");

const state = reactive({
  isChange: false,
  submitting: false,
});

let formWatcher: WatchStopHandle;
const startWatch = () => {
  formWatcher = watch(formData, (newVal) => {
    state.isChange = !isEqual(newVal, serverConfigStore.storage);
  });
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  assign(formData, cloneDeep(serverConfigStore.storage));
  startWatch();
});

const handleSubmit = async () => {
  try {
    state.submitting = true;
    await serverConfigStore.update({
      storage: unref(formData),
    });
    handleReset();
  } finally {
    state.submitting = false;
  }
};
const formRef = useTemplateRef("formRef");
const handleSave = () => {
  formRef.value?.submit();
};

const handleReset = () => {
  stopWatch();

  Object.assign(formData, cloneDeep(serverConfigStore.storage));

  state.isChange = false;

  startWatch();
};
</script>
<template>
  <div class="p-4 shadow-md rounded">
    <div class="mb-4 flex justify-between items-center min-h-8">
      <h3 class="pl-2 border-l-4 border-primary leading-none">
        {{ t("components.settingCard.storage.title") }}
      </h3>
      <div class="space-x-2" v-if="state.isChange">
        <UButton
          variant="outline"
          size="sm"
          :disabled="state.submitting"
          @click="handleReset"
        >
          {{ t("common.cancel") }}
        </UButton>
        <UButton size="sm" :loading="state.submitting" @click="handleSave">
          {{ t("common.save") }}
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
        name="type"
        required
        :label="t('components.settingCard.storage.form.typeLabel')"
        :description="t('components.settingCard.storage.form.typeDescription')"
        :ui="{
          description: 'text-xs',
          container: 'mt-2',
        }"
      >
        <USelect
          class="w-full"
          v-model="formData.type"
          icon="i-lucide-database"
          :placeholder="
            t('components.settingCard.storage.form.typePlaceholder')
          "
          :items="['local', 'minio']"
        />
      </UFormField>

      <UFormField
        label="Base Path"
        name="base_path"
        description="存储桶基础路径，默认为：storage"
        required
        :ui="{
          description: 'text-xs',
          container: 'mt-2',
        }"
      >
        <UInput
          class="w-full"
          icon="i-lucide-folder"
          v-model="formData.base_path"
          placeholder="请输入 base path"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="intro"
        label="End Point"
        required
        description="对象存储服务端点，如腾讯云：cos.ap-chengdu.myqcloud.com"
        :ui="{
          description: 'text-xs',
          container: 'mt-2',
        }"
      >
        <UInput
          class="w-full"
          icon="i-lucide-link"
          v-model="formData.end_point"
          placeholder="请输入 end point"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="intro"
        label="Port"
        required
        description="端口号，例：433、80"
        :ui="{
          description: 'text-xs',
          container: 'mt-2',
        }"
      >
        <UInput
          class="w-full"
          icon="i-lucide-ethernet-port"
          v-model="formData.port"
          type="number"
          placeholder="请输入 base path"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="SSL"
        label="SSL"
        required
        description="是否启用SSL"
        :ui="{
          description: 'text-xs',
          container: 'mt-2',
        }"
      >
        <USwitch v-model="formData.use_ssl" :disabled="isLocal" />
      </UFormField>

      <UFormField
        name="intro"
        label="Url Format"
        required
        description="文件链接模板1，例：https://${bucket}.cos.${region}.myqcloud.com/${filename}"
        :ui="{
          description: 'text-xs',
          container: 'mt-2',
        }"
      >
        <template #description>
          <div>
            <p>
              文件链接模板，例：https://${bucket}.cos.${region}.myqcloud.com/${filename}
            </p>
            <div class="py-2 space-y-1">
              <p>存储桶名称：<span class="text-blue-400">${bucket}</span></p>
              <p>存储桶地域：<span class="text-blue-400">${region}</span></p>
              <p>文件名：<span class="text-blue-400">${filename}</span></p>
            </div>
          </div>
        </template>
        <UInput
          class="w-full"
          icon="i-lucide-link"
          v-model="formData.url_format"
          placeholder="请输入 url format"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="intro"
        label="Region"
        required
        description="对象存储地域，如：ap-chengdu"
        :ui="{
          description: 'text-xs',
          container: 'mt-2',
        }"
      >
        <UInput
          class="w-full"
          icon="i-lucide-map-pin"
          v-model="formData.region"
          placeholder="请输入 region"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="intro"
        label="Bucket"
        required
        description="对象存储桶名称"
        :ui="{
          description: 'text-xs',
          container: 'mt-2',
        }"
      >
        <UInput
          class="w-full"
          icon="i-lucide-server"
          v-model="formData.bucket"
          placeholder="请输入 bucket"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="intro"
        label="Access Key"
        required
        :ui="{
          description: 'text-xs',
          container: 'mt-2',
        }"
      >
        <UInput
          class="w-full"
          icon="i-lucide-shield-check"
          v-model="formData.access_key"
          placeholder="请输入 access key"
          :disabled="isLocal"
        />
      </UFormField>

      <UFormField
        name="intro"
        label="Secret Key"
        required
        :ui="{
          description: 'text-xs',
          container: 'mt-2',
        }"
      >
        <UInput
          class="w-full"
          icon="i-lucide-key-round"
          v-model="formData.secret_key"
          type="password"
          placeholder="请输入 secret key"
          :disabled="isLocal"
        />
      </UFormField>
    </UForm>
  </div>
</template>
