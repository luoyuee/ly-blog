<script setup lang="ts">
import type { PropType } from "vue";

export type SkillItem = {
  title: string;
  href?: string;
  icon: string;
};

const props = defineProps({
  data: {
    type: Array as PropType<SkillItem[]>,
    default: () => []
  },
  size: {
    type: Number,
    default: 36
  }
});

const items = computed(() => {
  return props.data.map((item) => {
    return {
      key: `${item.title}-${item.icon}`,
      title: item.title,
      icon: item.icon,
      href: item.href
    };
  });
});
</script>

<template>
  <div aria-label="skills" class="flex flex-wrap gap-2">
    <UTooltip
      v-for="item in items"
      :key="item.key"
      :text="item.title"
      arrow
      :content="{
        side: 'top'
      }"
    >
      <component
        :is="item.href ? 'a' : 'div'"
        :href="item.href"
        target="_blank"
        class="flex select-none cursor-pointer items-center justify-center rounded-lg transition-all duration-200 ease-out hover:shadow-lg hover:scale-120"
      >
        <UIcon
          :name="item.icon"
          :size="props.size"
          :style="{
            width: props.size + 'px',
            height: props.size + 'px'
          }"
        />
      </component>
    </UTooltip>
  </div>
</template>
