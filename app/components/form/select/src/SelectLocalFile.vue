<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  // 支持的文件类型
  accept: {
    type: String,
    default: ".jpg,.jpeg,.png,.webp"
  },
  // 是否支持多选
  multiple: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: "选择文件"
  }
});

const emit = defineEmits(["change"]);

const formRef = ref<HTMLFormElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

// 处理文件选择变化
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files);
    // 通过事件将文件传递给父组件
    emit("change", files);
    // 重置表单状态
    resetForm();
  }
};

// 重置表单状态
const resetForm = () => {
  if (formRef.value) {
    formRef.value.reset();
  }
};

// 触发文件选择
const triggerSelect = () => {
  if (inputRef.value) {
    inputRef.value.click();
  }
};

// 暴露方法给父组件
defineExpose({
  triggerSelect,
  resetForm
});
</script>
<template>
  <form ref="formRef" style="display: none">
    <input
      ref="inputRef"
      type="file"
      :accept="props.accept"
      :multiple="props.multiple"
      @change="handleFileChange"
    />
  </form>
  <slot :trigger-select="triggerSelect" :reset-form="resetForm">
    <UButton color="primary" @click="triggerSelect">{{ props.label }}</UButton>
  </slot>
</template>
