<script setup lang="ts">
import type { ButtonProps, InputProps } from "@nuxt/ui";
import type { PropType } from "vue";
import { useFileDialog } from "@vueuse/core";
import { computed } from "vue";

type InputFileLayout = "normal" | "reverse";

type InputFileValue = File | null;

const modelValue = defineModel<InputFileValue>({ default: null });

const props = defineProps({
  inputProps: {
    type: Object as PropType<InputProps<string>>,
    default: () => ({})
  },
  buttonProps: {
    type: Object as PropType<ButtonProps>,
    default: () => ({})
  },
  layout: {
    type: String as PropType<InputFileLayout>,
    default: "normal"
  },
  placeholder: {
    type: String,
    default: "请选择文件"
  },
  buttonLabel: {
    type: String,
    default: "选择文件"
  },
  icon: {
    type: String,
    default: "mdi:file-document"
  },
  iconHighlightClass: {
    type: String,
    default: "text-primary"
  },
  clearable: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  accept: {
    type: String,
    default: "*"
  }
});

const emit = defineEmits<{
  change: [file: InputFileValue];
  clear: [];
}>();

const { open, onChange, reset } = useFileDialog({
  multiple: false,
  accept: props.accept
});

const fileName = computed(() => modelValue.value?.name ?? "");
const hasFile = computed(() => Boolean(modelValue.value));
const isSelectDisabled = computed(() => props.disabled || props.loading);
const isReverse = computed(() => props.layout === "reverse");
const showClearButton = computed(() => props.clearable && hasFile.value && !props.disabled);

// 输入框和按钮共享选择禁用态，避免加载中仍能打开文件选择器。
const inputDisabled = computed(() => isSelectDisabled.value || Boolean(props.inputProps.disabled));

// 外部传入的 inputProps 优先保留，组件内部只补充文件名展示所需状态。
const mergedInputProps = computed<InputProps<string>>(() => ({
  ...props.inputProps,
  readonly: true,
  placeholder: props.placeholder,
  icon: props.icon,
  highlight: hasFile.value,
  disabled: inputDisabled.value,
  class: ["flex-1", props.inputProps.class],
  ui: {
    ...props.inputProps.ui,
    leadingIcon: hasFile.value ? props.iconHighlightClass : ""
  }
}));

// 按钮 loading/disabled 需要同时响应组件自身状态和外部 buttonProps。
const mergedButtonProps = computed<ButtonProps>(() => ({
  ...props.buttonProps,
  disabled: isSelectDisabled.value || Boolean(props.buttonProps.disabled),
  loading: props.loading || props.buttonProps.loading
}));

const handleSelectFile = () => {
  if (isSelectDisabled.value) return;

  open();
};

const handleInputClick = () => {
  // 已选文件时点击输入框只用于查看文件名，避免误触重新选择。
  if (hasFile.value) return;

  handleSelectFile();
};

const handleClear = () => {
  if (props.disabled) return;

  // 同步清空 v-model 和原生 file input，确保再次选择同名文件也能触发 change。
  modelValue.value = null;
  reset();
  emit("change", null);
  emit("clear");
};

onChange((files) => {
  const file = files?.[0] ?? null;

  modelValue.value = file;
  emit("change", file);
});
</script>

<template>
  <UFieldGroup>
    <UButton v-if="isReverse" v-bind="mergedButtonProps" @click="handleSelectFile">
      {{ props.buttonLabel }}
    </UButton>

    <UInput v-bind="mergedInputProps" :model-value="fileName" @click="handleInputClick">
      <template v-if="showClearButton" #trailing>
        <UButton
          color="neutral"
          icon="mdi:close"
          size="xs"
          square
          variant="ghost"
          @click.stop="handleClear"
        />
      </template>
    </UInput>

    <UButton
      v-if="!isReverse"
      class="shrink-0"
      v-bind="mergedButtonProps"
      @click="handleSelectFile"
    >
      {{ props.buttonLabel }}
    </UButton>
  </UFieldGroup>
</template>
