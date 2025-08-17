<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
import { ref, nextTick, reactive } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  value: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  label: {
    type: String,
    default: "添加标签"
  }
});

const emits = defineEmits(["update:value"]);

const state = reactive<{
  showInput: boolean;
  value?: string;
}>({
  showInput: false,
  value: undefined
});

const inputRef = ref<HTMLInputElement | null>(null);

const removeTag = (tag: string): void => {
  emits(
    "update:value",
    props.value.filter((item) => item !== tag)
  );
};

const handleChange = (): void => {
  if (state.value !== undefined) {
    state.value = state.value.trim();
    if (state.value) {
      if (props.value) {
        if (props.value.indexOf(state.value) === -1) {
          emits("update:value", [...props.value, state.value]);
        } else {
          ElMessage.warning({
            message: "标签重复"
          });
        }
      } else {
        emits("update:value", [state.value]);
      }
    }
  }
  state.showInput = false;
  state.value = undefined;
};

const showInput = (): void => {
  state.showInput = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const blurInput = (): void => {
  if (!state.value) state.showInput = false;
};
</script>

<template>
  <div class="tag-area" @click.stop>
    <el-tag
      v-for="tag in props.value"
      :key="tag"
      closable
      class="mr-1 mb-1"
      @close="removeTag(tag)"
    >
      {{ tag }}
    </el-tag>
    <el-input
      v-if="state.showInput"
      ref="inputRef"
      v-model:model-value="state.value"
      class="!w-20 mb-1"
      size="small"
      @change="handleChange"
      @blur="blurInput"
    />
    <el-button v-else class="mb-1" size="small" :icon="Plus" @click="showInput">
      {{ props.label }}
    </el-button>
  </div>
</template>
