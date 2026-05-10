<script setup lang="ts">
/**
 * ColorPicker 颜色选择器组件
 * 支持多种颜色格式（hex、rgb、hsl、cmyk、lab）
 * 可作为颜色选择器使用
 */
import type { PropType } from "vue";
import { computed, ref, watch } from "vue";

const modelValue = defineModel<string | undefined>({});

const props = defineProps({
  format: {
    type: String as PropType<"hex" | "rgb" | "hsl" | "cmyk" | "lab">,
    default: "hex"
  },
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
  }
});

const popoverOpen = ref(false);
const tempColor = ref<string | undefined>(modelValue.value);

watch(popoverOpen, (open) => {
  if (open) {
    tempColor.value = modelValue.value;
  }
});

const chip = computed(() => ({ backgroundColor: modelValue.value }));

const tempChip = computed(() => ({ backgroundColor: tempColor.value }));

const handleConfirm = () => {
  modelValue.value = tempColor.value;
  popoverOpen.value = false;
};

const handleCancel = () => {
  popoverOpen.value = false;
};

const handleReset = () => {
  modelValue.value = undefined;
  tempColor.value = undefined;
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
            size="xl"
            :format="props.format"
            :throttle="props.throttle"
            :disabled="props.disabled"
            :ui="{
              root: 'p-1'
            }"
          />

          <div class="flex items-center gap-2">
            <span :style="tempChip" class="size-6 rounded shrink-0"></span>
            <UInput size="sm" readonly class="flex-1" :model-value="tempColor" />
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
