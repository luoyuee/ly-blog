<script setup lang="ts">
import type { WatchStopHandle } from "vue";
import { useConfigStore } from "@/stores";
import { watch } from "vue";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";
import { isEqual } from "lodash-es";

const $notify = useNotification();

const configStore = useConfigStore();

/**
 * 表单校验 schema
 * modelsJsonText: JSON 字符串，校验并解析为模型配置数组
 */
const schema = z.object({
  enabled: z.boolean().optional(),
  modelsJsonText: z.string().superRefine((val, ctx) => {
    if (!val?.trim()) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(val);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "JSON 解析失败，请检查格式"
      });
      return;
    }

    if (!Array.isArray(parsed)) {
      ctx.addIssue({
        code: "custom",
        message: "JSON 格式错误：models 必须是数组"
      });
      return;
    }

    parsed.forEach((item, index) => {
      if (typeof item !== "object" || item === null) {
        ctx.addIssue({
          code: "custom",
          message: `第 ${index + 1} 项必须是对象`
        });
        return;
      }

      if (!("path" in item) || typeof item.path !== "string") {
        ctx.addIssue({
          code: "custom",
          message: `第 ${index + 1} 项缺少 path 字段`
        });
        return;
      }

      try {
        new URL(item.path);
      } catch {
        ctx.addIssue({
          code: "custom",
          message: `第 ${index + 1} 项的 path 不是合法的 URL`
        });
      }
    });
  })
});

type FormData = z.output<typeof schema>;

const formData = reactive<FormData>({
  enabled: undefined,
  modelsJsonText: ""
});

const state = reactive({
  isChange: false,
  submitting: false
});

let formWatcher: WatchStopHandle;
const startWatch = () => {
  formWatcher = watch(
    formData,
    () => {
      const originalModels = configStore.live2d?.models;
      const currentModels = formData.modelsJsonText?.trim()
        ? JSON.parse(formData.modelsJsonText)
        : undefined;

      state.isChange =
        formData.enabled !== configStore.live2d?.enabled || !isEqual(currentModels, originalModels);
    },
    { deep: true }
  );
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  formData.enabled = configStore.live2d?.enabled;

  const models = configStore.live2d?.models;
  if (models && models.length > 0) {
    formData.modelsJsonText = JSON.stringify(models, null, 2);
  }

  startWatch();
});

const formRef = useTemplateRef("formRef");
const handleSave = () => {
  formRef.value?.submit();
};

/**
 * 解析 JSON 字符串为 models 数组
 */
const parseModels = () => {
  if (!formData.modelsJsonText?.trim()) {
    return undefined;
  }
  return JSON.parse(formData.modelsJsonText);
};

const handleSubmit = async () => {
  state.submitting = true;
  try {
    await configStore.update({
      live2d: {
        enabled: formData.enabled,
        models: parseModels()
      }
    });
    handleReset();
    $notify.success({
      title: "更新成功"
    });
  } catch (error) {
    $notify.error({
      title: "更新失败",
      error
    });
  } finally {
    state.submitting = false;
  }
};

const handleReset = () => {
  stopWatch();

  formData.enabled = configStore.live2d?.enabled;

  const models = configStore.live2d?.models;
  if (models && models.length > 0) {
    formData.modelsJsonText = JSON.stringify(models, null, 2);
  } else {
    formData.modelsJsonText = "";
  }

  state.isChange = false;

  startWatch();
};

const modelsPlaceholder = `[
    {
        path: 'https://model.oml2d.com/HK416-1-normal/model.json',
        position: [0, 60],
        scale: 0.08,
        stageStyle: {
            height: 450
        }
    }
]
`;
</script>
<template>
  <SettingCard
    title="Live2D 看板娘"
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
        name="enabled"
        label="启用 Live2D"
        :ui="{
          container: 'mt-2'
        }"
      >
        <USwitch v-model="formData.enabled" />
      </UFormField>
      <UFormField
        name="modelsJsonText"
        label="模型配置"
        :ui="{
          description: 'text-xs',
          container: 'mt-2'
        }"
      >
        <template #description>
          <p>请输入 JSON 格式的模型配置数组，参考</p>
          <a
            href="https://www.npmjs.com/package/oh-my-live2d"
            target="_blank"
            class="text-primary hover:underline"
          >
            oh-my-live2d 文档
          </a>
        </template>
        <UTextarea v-model="formData.modelsJsonText" :rows="10" :placeholder="modelsPlaceholder" />
      </UFormField>
    </UForm>
  </SettingCard>
</template>
