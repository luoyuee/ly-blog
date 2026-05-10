<script setup lang="ts">
/**
 * ColorPickerWithAlpha 支持透明通道的颜色选择器组件
 * 支持 rgba 格式，可调节透明度
 * 使用 chroma-js 进行颜色处理
 */
import type { PropType } from "vue";
import { computed, ref, watch } from "vue";
import chroma from "chroma-js";

// ==================== 类型定义 ====================

interface ColorInfo {
  hex: string;
  alpha: number;
}

// ==================== Props 定义 ====================

const modelValue = defineModel<string | undefined>({});

const props = defineProps({
  size: {
    type: String as PropType<"xs" | "sm" | "md" | "lg" | "xl">,
    default: "md"
  },
  disabled: {
    type: Boolean,
    default: false
  },
  throttle: {
    type: Number,
    default: 50
  },
  label: {
    type: String,
    default: "选择颜色"
  },
  defaultColor: {
    type: String,
    default: "#FFFFFF"
  }
});

// ==================== 响应式状态 ====================

const popoverOpen = ref(false);
const tempColor = ref("#FFFFFF");
const tempAlpha = ref(100);

// ==================== 颜色处理工具函数 ====================

/**
 * 解析颜色字符串，提取 hex 和 alpha 值
 * @param color - 颜色字符串（支持 hex、rgb、rgba 格式）
 * @returns 颜色信息对象
 */
const parseColor = (color: string | undefined): ColorInfo => {
  if (!color) {
    return { hex: "#FFFFFF", alpha: 100 };
  }

  try {
    const colorObj = chroma(color);
    const alpha = colorObj.alpha();
    const hex = colorObj.hex("rgb").toUpperCase();

    return {
      hex,
      alpha: Math.round(alpha * 100)
    };
  } catch {
    return { hex: "#FFFFFF", alpha: 100 };
  }
};

/**
 * 将 hex 颜色和透明度转换为 rgba 格式字符串
 * @param hex - hex 颜色值
 * @param alpha - 透明度（0-100）
 * @returns rgba 格式颜色字符串，如 rgba(255, 255, 255, 1)
 */
const toRgba = (hex: string, alpha: number): string => {
  try {
    const colorObj = chroma(hex);
    const [r, g, b] = colorObj.rgb();
    const a = alpha / 100;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  } catch {
    return "rgba(255, 255, 255, 1)";
  }
};

// ==================== 生命周期钩子 ====================

watch(popoverOpen, (open) => {
  if (open) {
    const parsed = parseColor(modelValue.value);
    tempColor.value = parsed.hex;
    tempAlpha.value = parsed.alpha;
  }
});

// ==================== 计算属性 ====================

const chip = computed(() => {
  const parsed = parseColor(modelValue.value);
  return { backgroundColor: toRgba(parsed.hex, parsed.alpha) };
});

const tempChip = computed(() => {
  return { backgroundColor: toRgba(tempColor.value, tempAlpha.value) };
});

const tempColorDisplay = computed(() => {
  return toRgba(tempColor.value, tempAlpha.value);
});

const alphaSliderStyle = computed(() => {
  return {
    background: `linear-gradient(to right, transparent, ${tempColor.value})`
  };
});

// ==================== 事件处理函数 ====================

const handleConfirm = () => {
  modelValue.value = toRgba(tempColor.value, tempAlpha.value);
  popoverOpen.value = false;
};

const handleCancel = () => {
  popoverOpen.value = false;
};

const handleReset = () => {
  modelValue.value = undefined;
  tempColor.value = "#FFFFFF";
  tempAlpha.value = 100;
  popoverOpen.value = false;
};
</script>

<template>
  <div class="inline-flex items-center gap-2">
    <UPopover v-model:open="popoverOpen" :disabled="disabled">
      <UButton
        color="neutral"
        variant="outline"
        :label="props.label"
        :disabled="props.disabled"
        :size="props.size"
        v-bind="$attrs"
      >
        <template #leading>
          <span :style="chip" class="size-4 rounded-full border border-gray-300"></span>
        </template>
      </UButton>

      <template #content>
        <div class="p-2 flex flex-col gap-4">
          <UColorPicker
            v-model="tempColor"
            format="hex"
            size="xl"
            :throttle="props.throttle"
            :disabled="props.disabled"
            :ui="{
              root: 'p-1'
            }"
          />

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">透明度</span>
              <span class="text-xs text-gray-600 font-mono"> {{ tempAlpha }}% </span>
            </div>
            <div class="relative w-full rounded-lg bg-checker-8 bg-checker-gray">
              <div
                :style="alphaSliderStyle"
                class="absolute inset-0 z-0 pointer-events-none rounded-lg"
              ></div>
              <USlider
                v-model="tempAlpha"
                :min="0"
                :max="100"
                :disabled="props.disabled"
                :ui="{
                  root: 'relative z-10',
                  track: 'bg-transparent h-2',
                  range: 'bg-transparent',
                  thumb: 'bg-transparent border-2 border-white ring-2 ring-gray-400'
                }"
              />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="size-6 rounded shrink-0 bg-checker-8 bg-checker-gray">
              <span :style="tempChip" class="block size-full rounded"></span>
            </span>
            <UInput size="sm" readonly class="flex-1" :model-value="tempColorDisplay" />
          </div>

          <div class="flex justify-between items-center">
            <UButton
              label="重置"
              color="neutral"
              variant="outline"
              size="xs"
              @click="handleReset"
            />

            <div class="flex gap-2 items-center">
              <UButton
                label="取消"
                color="neutral"
                variant="outline"
                size="xs"
                @click="handleCancel"
              />
              <UButton label="确认" color="primary" size="xs" @click="handleConfirm" />
            </div>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>
