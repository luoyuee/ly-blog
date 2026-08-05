<script setup lang="ts">
import type { PresetColorOption, PresetColorShape } from "./types";
import type { PropType } from "vue";
import chroma from "chroma-js";

const modelValue = defineModel<string | undefined>({});

const props = defineProps({
  /** 预设颜色列表，传入后覆盖默认颜色 */
  options: {
    type: Array as PropType<PresetColorOption[]>,
    default: (): PresetColorOption[] => [
      { label: "蓝色", value: "#3b82f6" },
      { label: "红色", value: "#ef4444" },
      { label: "绿色", value: "#22c55e" },
      { label: "橙色", value: "#f97316" },
      { label: "紫色", value: "#a855f7" },
      { label: "青色", value: "#06b6d4" }
    ]
  },
  /** 是否禁用 */
  disabled: {
    type: Boolean,
    default: false
  },
  /** 色块形状，圆形或圆角方形 */
  shape: {
    type: String as PropType<PresetColorShape>,
    default: "circle"
  }
});

/** 生成颜色提示文本 */
const getTooltipText = (option: PresetColorOption): string => {
  return option.label ? `${option.label} ${option.value}` : option.value;
};

/** 根据 shape 返回色块形状类名 */
const shapeClass = computed(() => (props.shape === "rounded" ? "rounded-md" : "rounded-full"));

/** 根据颜色亮度返回对应的图标颜色（深色背景用白色，浅色背景用灰色） */
const iconClass = (color: string): string => {
  try {
    return chroma(color).luminance() > 0.6 ? "text-gray-600" : "text-white";
  } catch {
    return "text-white";
  }
};
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <UTooltip v-for="option in props.options" :key="option.value" :text="getTooltipText(option)">
      <button
        type="button"
        class="size-6 flex items-center justify-center transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        :class="[shapeClass]"
        :style="{ backgroundColor: option.value }"
        :disabled="props.disabled"
        :aria-label="getTooltipText(option)"
        :aria-pressed="modelValue === option.value"
        @click="modelValue = option.value"
      >
        <UIcon
          v-if="modelValue === option.value"
          name="mdi:check-bold"
          :class="[iconClass(option.value)]"
        />
      </button>
    </UTooltip>
  </div>
</template>
