<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";
import type { TooltipArrowProps, TooltipContentProps } from "reka-ui";
import { computed, useAttrs } from "vue";

defineOptions({
  inheritAttrs: false
});

// 通过类型交集让外部使用时获得 UButton 的参数提示
// @vue-ignore 告知 Vue 编译器不要将 ButtonProps 作为当前组件的运行时 Props，直接通过 $attrs 透传给 UButton
const props = withDefaults(
  defineProps<
    {
      tooltip?: string;
      arrow?: boolean | TooltipArrowProps;
      side?: TooltipContentProps["side"];
    } & /* @vue-ignore */ ButtonProps
  >(),
  {
    tooltip: undefined,
    arrow: false,
    side: "top"
  }
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const attrs = useAttrs();

const disabledTooltip = computed(() => !props.tooltip);

const handleClick = (event: MouseEvent) => {
  emit("click", event);
};
</script>

<template>
  <UTooltip
    ignore-non-keyboard-focus
    :arrow="props.arrow"
    :content="{ side: props.side }"
    :disabled="disabledTooltip"
    :text="props.tooltip"
  >
    <UButton v-bind="attrs" @click="handleClick">
      <slot></slot>
    </UButton>
  </UTooltip>
</template>
