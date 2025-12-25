<script lang="ts" setup>
import { generateBgColorByText, generateTextColorByText } from "@@/shared/utils/color";
import { computed } from "vue";

interface Props {
  username: string;
  src?: string;
  size?: number | string;
  shape?: "circle" | "square";
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  shape: "circle"
});

const sizeCss = computed(() => (typeof props.size === "number" ? `${props.size}px` : props.size));

const extractDisplay = (name: string): string => {
  const clean = (name || "").trim();
  if (!clean) return "?";

  // 优先匹配中文字符（使用更精确的Unicode范围）
  const chineseMatch = clean.match(/[\p{Script=Han}]/u);
  if (chineseMatch) return chineseMatch[0];

  // 匹配字母和数字字符（支持Unicode字母）
  const letterMatch = clean.match(/[\p{L}\p{N}]/gu);
  if (letterMatch) {
    const letters = letterMatch.join("");
    return letters.length >= 2 ? letters.slice(0, 2).toUpperCase() : letters.toUpperCase();
  }

  // 最后尝试匹配任何非空白字符
  const charMatch = clean.match(/\S/);
  return charMatch ? charMatch[0].toUpperCase() : "?";
};

const displayText = computed(() => extractDisplay(props.username));
const bgColor = computed(() => generateBgColorByText(props.username));
const textColor = computed(() => generateTextColorByText(props.username));

const fontSize = computed(() => `calc(${sizeCss.value} * 0.42)`);
</script>

<template>
  <div
    class="fake-avatar"
    :class="[`fake-avatar--${props.shape}`]"
    :style="{
      width: sizeCss,
      height: sizeCss,
      backgroundColor: bgColor,
      color: textColor
    }"
    :title="props.username"
  >
    <img v-if="props.src" :src="props.src" alt="avatar" class="fake-avatar__image" />
    <span v-else class="fake-avatar__text" :style="{ fontSize: fontSize }">
      {{ displayText }}
    </span>
  </div>
</template>

<style scoped>
.fake-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  user-select: none;
  overflow: hidden;
}

.fake-avatar--circle {
  border-radius: 50%;
}

.fake-avatar--square {
  border-radius: 6px;
}

.fake-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.fake-avatar--circle .fake-avatar__image {
  border-radius: 50%;
}

.fake-avatar--square .fake-avatar__image {
  border-radius: 6px;
}

.fake-avatar__text {
  line-height: 1;
}
</style>
