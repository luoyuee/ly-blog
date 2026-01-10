<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
  accept: {
    type: String,
    default: ".png,.jpg,.webp,.svg"
  },
  placeholderImage: {
    type: String,
    default: "/images/blank_avatar.webp"
  },
  size: {
    type: String as PropType<"xs" | "sm" | "md" | "lg" | "xl">,
    default: "md"
  }
});

const emits = defineEmits<{
  (e: "change", file: File | null): void;
  (e: "clear"): void;
}>();

const previewUrl = ref<string>(props.placeholderImage);

const sizeClass = computed(() => {
  const size = props.size || "md";
  return `avatar-select--${size}`;
});

const inputFileRef = ref<HTMLInputElement | null>(null);
const clickInputFile = () => {
  inputFileRef.value?.click();
};

const handleChange = (event: Event): void => {
  const target = event.target as HTMLInputElement | null;
  const file = target?.files?.item(0);
  if (!file) {
    return;
  }

  previewUrl.value = window.URL.createObjectURL(file);

  if (inputFileRef.value) {
    inputFileRef.value.value = "";
  }

  emits("change", file);
};

const handleDelete = (): void => {
  previewUrl.value = props.placeholderImage;
  emits("change", null);
  emits("clear");
};
</script>

<template>
  <div class="avatar-select" :class="sizeClass">
    <input
      ref="inputFileRef"
      class="hidden"
      type="file"
      :accept="props.accept"
      @change="handleChange"
    />
    <div class="avatar" @click="clickInputFile">
      <img :src="previewUrl" alt="icon" class="preview" />
      <span
        class="delete-btn"
        :class="{
          disabled: !previewUrl || previewUrl === props.placeholderImage
        }"
        @click.stop="handleDelete"
      >
        <UIcon name="ep:delete-filled" />
      </span>
    </div>
  </div>
</template>
<style scoped lang="scss">
.avatar-select {
  --avatar-size: 80px;
  --avatar-delete-height: 24px;
  --avatar-delete-font-size: 16px;

  &--xs {
    --avatar-size: 40px;
    --avatar-delete-height: 16px;
    --avatar-delete-font-size: 12px;
  }

  &--sm {
    --avatar-size: 60px;
    --avatar-delete-height: 20px;
    --avatar-delete-font-size: 14px;
  }

  &--md {
    --avatar-size: 80px;
    --avatar-delete-height: 24px;
    --avatar-delete-font-size: 16px;
  }

  &--lg {
    --avatar-size: 100px;
    --avatar-delete-height: 28px;
    --avatar-delete-font-size: 18px;
  }

  &--xl {
    --avatar-size: 120px;
    --avatar-delete-height: 32px;
    --avatar-delete-font-size: 20px;
  }

  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;

  .preview {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .delete-btn {
    user-select: none;
    font-size: var(--avatar-delete-font-size);
    position: absolute;
    width: 100%;
    height: var(--avatar-delete-height);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.3);
    color: #ffffff;
    text-align: center;
    bottom: 0;
    transform: translateY(100%);
    transition:
      transform 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.4);
      color: var(--color-red-400);
    }

    &.disabled {
      display: none;
    }
  }

  &:hover {
    .delete-btn:not(.disabled) {
      transform: translateY(0);
    }
  }
}
</style>
