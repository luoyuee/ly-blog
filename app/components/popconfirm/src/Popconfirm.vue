<template>
  <UPopover
    v-model:open="open"
    :disabled="disabled"
    :arrow="arrow"
    :ui="{ content: 'p-3' }"
    :content="{
      side
    }"
  >
    <slot> </slot>

    <template #content>
      <div class="popconfirm" :style="contentStyle">
        <div class="popconfirm__body">
          <div class="popconfirm__icon" :style="{ color: iconColor }">
            <UIcon :name="icon" />
          </div>
          <div class="popconfirm__text">
            <div class="popconfirm__title">{{ title }}</div>

            <div v-if="description" class="popconfirm__desc">
              {{ description }}
            </div>
          </div>
        </div>
        <div class="popconfirm__footer">
          <UButton
            v-if="showCancelBtn"
            size="sm"
            variant="soft"
            color="neutral"
            :disabled="loading"
            v-bind="cancelBtnProps"
            @click="handleCancel"
          >
            {{ cancelText }}
          </UButton>
          <UButton
            size="sm"
            loading-icon="ep:loading"
            v-bind="confirmBtnProps"
            :loading="loading"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";
import type { PropType } from "vue";
import { computed } from "vue";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps({
  title: {
    type: String,
    default: "确认此操作？"
  },
  description: {
    type: String
  },
  confirmText: {
    type: String,
    default: "确认"
  },
  confirmBtnProps: {
    type: Object as () => ButtonProps,
    default: () => ({})
  },
  cancelText: {
    type: String,
    default: "取消"
  },
  cancelBtnProps: {
    type: Object as () => ButtonProps,
    default: () => ({})
  },
  showCancelBtn: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: "ep:question-filled"
  },
  iconColor: {
    type: String,
    default: "var(--ui-warning)"
  },
  width: {
    type: [Number, String],
    default: 200
  },
  side: {
    type: String as PropType<"top" | "right" | "bottom" | "left">,
    default: "top"
  },
  disabled: {
    type: Boolean,
    default: false
  },
  arrow: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["confirm", "cancel"]);

const contentStyle = computed(() => {
  if (typeof props.width === "number") {
    return { width: `${props.width}px` };
  }

  if (typeof props.width === "string") {
    // 允许传入诸如 '16rem' 或 '240px' 之类的值
    return { width: props.width };
  }
  return {};
});

const handleConfirm = () => {
  emit("confirm");
  open.value = false;
};

const handleCancel = () => {
  emit("cancel");
  open.value = false;
};
</script>

<style scoped lang="scss">
.popconfirm {
  box-sizing: border-box;

  &__body {
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;
  }

  &__icon {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__text {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 0.875rem;
    color: var(--text-color-1);
    line-height: 1.5rem;
    margin: 0;
  }

  &__desc {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--text-color-3);
    line-height: 1.25;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
}
</style>
