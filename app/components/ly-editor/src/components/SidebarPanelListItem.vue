<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { PropType } from "vue";
/**
 * 侧边面板通用列表项容器。
 *
 * 默认提供与图片管理器目录项一致的行结构，
 * 同时允许通过具名插槽按需覆盖媒体区、标题、描述、元信息与操作区。
 */
const props = defineProps({
  image: {
    type: String,
    default: ""
  },
  icon: {
    type: String,
    default: ""
  },
  metaItems: {
    type: Array as PropType<
      {
        text: string | number;
        icon?: string;
      }[]
    >,
    default: () => []
  },
  title: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  actionItems: {
    type: Array as PropType<DropdownMenuItem[]>,
    default: () => []
  },
  actionButton: {
    type: Object as PropType<{
      tooltip: string;
      icon: string;
    }>,
    default: () => ({
      label: "设置",
      icon: "custom:setting"
    })
  }
});

const emit = defineEmits<{
  click: [];
}>();

/**
 * 统一处理列表项点击，便于调用方仅监听业务行为。
 */
const handleClick = (): void => {
  emit("click");
};
</script>

<template>
  <div class="flex p-2 cursor-pointer hover:bg-white/5 gap-2" @click="handleClick">
    <div v-if="props.image || props.icon" class="size-16 shrink-0 rounded">
      <slot name="media">
        <img
          v-if="props.image"
          class="szie-full rounded object-cover"
          :src="props.image"
          :alt="props.title"
        />
        <div
          v-else-if="props.icon"
          class="size-16 flex items-center justify-center bg-white/5 rounded"
        >
          <UIcon :name="props.icon" class="size-6" />
        </div>
      </slot>
    </div>

    <div class="flex flex-1 flex-col min-w-0">
      <h6 class="truncate">
        <slot name="title" :title="props.title">
          {{ props.title }}
        </slot>
      </h6>

      <p class="flex-1 truncate text-xs text-muted">
        <slot name="description" :description="props.description">
          {{ props.description || "暂无描述" }}
        </slot>
      </p>

      <div class="flex items-center justify-between gap-2 leading-none">
        <div class="flex-1 flex items-center gap-2">
          <slot name="meta" :meta-items="props.metaItems">
            <div
              v-for="(item, index) in props.metaItems"
              :key="index"
              class="flex items-center gap-1 text-xs text-dimmed leading-none"
            >
              <UIcon v-if="item.icon" :name="item.icon" />
              <span class="truncate">
                {{ item.text }}
              </span>
            </div>
          </slot>
        </div>

        <div class="flex shrink-0 items-center" @click.stop>
          <slot name="actions">
            <UDropdownMenu
              :items="props.actionItems"
              :content="{
                align: 'start',
                side: 'bottom',
                sideOffset: 8
              }"
            >
              <UTooltip :text="props.actionButton.tooltip">
                <UIcon :name="props.actionButton.icon" class="size-4 hover:text-muted" />
              </UTooltip>
            </UDropdownMenu>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
