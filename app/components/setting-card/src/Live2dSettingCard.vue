<script setup lang="ts">
import { useForm } from "@/composables/useForm";
import { useConfigStore } from "@/stores";
import { isEqual } from "es-toolkit";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

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

const createInitialFormData = (): FormData => {
  return {
    enabled: configStore.live2d?.enabled,
    modelsJsonText:
      configStore.live2d?.models && configStore.live2d.models.length > 0
        ? JSON.stringify(configStore.live2d.models, null, 2)
        : ""
  };
};

const { formData, formState, setForm, setInitial, resetForm } =
  useForm<FormData>(createInitialFormData());

const tryParseModels = () => {
  const modelsJsonText = formData.modelsJsonText?.trim();

  if (!modelsJsonText) {
    return {
      success: true,
      value: undefined
    } as const;
  }

  try {
    return {
      success: true,
      value: JSON.parse(modelsJsonText)
    } as const;
  } catch {
    return {
      success: false,
      value: undefined
    } as const;
  }
};

const isLive2dDirty = computed(() => {
  if (formData.enabled !== configStore.live2d?.enabled) {
    return true;
  }

  const parsedModelsResult = tryParseModels();

  if (!parsedModelsResult.success) {
    return true;
  }

  return !isEqual(parsedModelsResult.value, configStore.live2d?.models);
});

const syncFormData = () => {
  const nextFormData = createInitialFormData();
  setInitial(nextFormData);
  setForm(nextFormData);
};

const formRef = useTemplateRef("formRef");
const handleSave = () => {
  formRef.value?.submit();
};

/**
 * 解析 JSON 字符串为 models 数组
 */
const parseModels = () => {
  const parsedModelsResult = tryParseModels();

  if (!parsedModelsResult.success) {
    throw new Error("模型配置 JSON 解析失败");
  }

  return parsedModelsResult.value;
};

const handleSubmit = async () => {
  formState.submitting = true;
  try {
    await configStore.update({
      live2d: {
        enabled: formData.enabled,
        models: parseModels()
      }
    });
    syncFormData();
    $notify.success({
      title: "更新成功"
    });
  } catch (error) {
    $notify.error({
      title: "更新失败",
      error
    });
  } finally {
    formState.submitting = false;
  }
};

const handleReset = () => {
  resetForm();
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
    id="live2d-setting"
    title="Live2D 看板娘"
    :is-change="isLive2dDirty"
    :submitting="formState.submitting"
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
