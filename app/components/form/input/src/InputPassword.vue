<script setup lang="ts">
import { computed, ref } from "vue";

const modelValue = defineModel<string>({ default: "" });

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ""
  },
  showStrength: {
    type: Boolean,
    default: false
  }
});

// 密码强度条固定为 10 段，便于细粒度展示强度变化。
const STRENGTH_BLOCK_COUNT = 10;

type PasswordStrengthLevel = "none" | "weak" | "medium" | "strong";

interface PasswordStrengthState {
  level: PasswordStrengthLevel;
  label: string;
  filledBlocks: number;
  textClass: string;
}

const showPassword = ref(false);

const passwordStrength = computed<PasswordStrengthState>(() => {
  const password = modelValue.value;
  // 空值不显示强度；长度不足 6 位直接判为弱。
  // 长度合格后按字母、数字、符号三类字符覆盖数判断强度。
  if (!password) {
    return {
      level: "none",
      label: "",
      filledBlocks: 0,
      textClass: "text-transparent"
    };
  }

  if (password.length < 6) {
    return {
      level: "weak",
      label: "非常弱",
      filledBlocks: 2,
      textClass: "text-red-500"
    };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const score = [hasLetter, hasNumber, hasSymbol].filter(Boolean).length;

  if (score === 1) {
    return {
      level: "weak",
      label: "非常弱",
      filledBlocks: 2,
      textClass: "text-red-500"
    };
  }

  if (score === 2) {
    return {
      level: "medium",
      label: "一般",
      filledBlocks: 6,
      textClass: "text-yellow-500"
    };
  }

  return {
    level: "strong",
    label: "非常强",
    filledBlocks: 10,
    textClass: "text-green-500"
  };
});
</script>

<template>
  <div class="w-full flex flex-col gap-1">
    <UInput
      v-model="modelValue"
      :type="showPassword ? 'text' : 'password'"
      :placeholder="placeholder"
      :disabled="disabled"
      v-bind="$attrs"
    >
      <template #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          :icon="showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'"
          @click="showPassword = !showPassword"
        />
      </template>
    </UInput>

    <div v-if="props.showStrength" class="flex items-center gap-2">
      <span class="text-sm text-gray-400 shrink-0">强度：</span>
      <!-- 左侧固定渲染 10 个块，通过填充数量表达强度。 -->
      <div class="flex flex-1 items-center gap-1">
        <span
          v-for="i in STRENGTH_BLOCK_COUNT"
          :key="i"
          class="h-2 flex-1 rounded-[2px] bg-gray-100"
          :class="{
            'bg-red-500': passwordStrength.filledBlocks >= i && passwordStrength.level === 'weak',
            'bg-yellow-500':
              passwordStrength.filledBlocks >= i && passwordStrength.level === 'medium',
            'bg-green-500':
              passwordStrength.filledBlocks >= i && passwordStrength.level === 'strong'
          }"
        ></span>
      </div>
      <!-- 右侧文案固定宽度占位，避免切换强度时布局抖动。 -->
      <span
        class="w-16 shrink-0 text-right text-sm font-medium"
        :class="passwordStrength.textClass"
      >
        {{ modelValue ? passwordStrength.label : "" }}
      </span>
    </div>
  </div>
</template>
