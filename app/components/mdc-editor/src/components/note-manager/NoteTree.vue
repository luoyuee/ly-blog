<script setup lang="ts">
import type { ComponentPublicInstance, PropType } from "vue";
import type { FolderTreeItem } from "@/types/mdc-editor";
import { ref } from "vue";
import type { ContextMenuItem } from "@nuxt/ui";

const props = defineProps({
  data: {
    type: Array as PropType<FolderTreeItem[]>,
    default: () => [],
  },
  depth: {
    type: Number,
    default: 0,
  },
});

const childrenRef = ref<Element | ComponentPublicInstance | null>(null);
let isAnimating = false;
const handleClickNode = (data: FolderTreeItem): void => {
  console.log(childrenRef.value);
  if (isAnimating) return;
  isAnimating = true;

  data.is_expanded = !data.is_expanded;
  const element = childrenRef.value;
  if (!(element && element instanceof HTMLElement)) return;

  if (data.is_expanded) {
    element.style.display = "block";
    element.style.height = "0";
    requestAnimationFrame(() => {
      element.style.height = `${element.scrollHeight}px`;
    });
  } else {
    element.style.height = `${element.scrollHeight}px`;
    requestAnimationFrame(() => {
      element.style.height = "0";
    });
  }

  // 动画结束后清理状态
  const onTransitionEnd = (): void => {
    if (!data.is_expanded) {
      element.style.display = "none";
    }
    element.style.height = "";
    element.removeEventListener("transitionend", onTransitionEnd);

    isAnimating = false;
  };
  element.addEventListener("transitionend", onTransitionEnd);
};
</script>
<template>
  <div class="file-tree">
    <template v-for="item in props.data" :key="item.key">
      <UContextMenu
        v-if="item.type === 'note'"
        :items="[
          {
            label: '打开文件',
            icon: 'lucide:file-pen',
            color: 'primary',
            action: () => {},
          },
          { label: '发布&更新文章', icon: 'lucide:square-arrow-out-up-right', action: () => {} },
          {
            label: '笔记详情',
            icon: 'lucide:file-text',
            action: () => {},
          },
          {
            label: '导出文件',
            icon: 'lucide:download',
            action: () => {},
          },
          {
            label: '重命名',
            icon: 'lucide:text-cursor-input',
            action: () => {},
          },
          {
            label: '删除笔记',
            icon: 'lucide:trash-2',
            color: 'error',
            action: () => {},
          },
        ]"
        :ui="{
          content: 'w-48',
        }"
      >
        <div class="file-tree-item file">
          <div
            class="hover:bg-gray-800 rounded cursor-pointer"
            :style="{ 'padding-left': 12 * props.depth + 'px' }"
          >
            {{ item.name }}
          </div>
        </div>
      </UContextMenu>

      <div v-else-if="item.type === 'folder'" class="file-tree-item folder">
        <div
          @click="handleClickNode(item)"
          class="hover:bg-gray-800 rounded cursor-pointer"
          :style="{ 'padding-left': 12 * props.depth + 'px' }"
        >
          <span>{{ item.is_expanded ? "📁" : "🎁" }}</span>
          {{ item.name }}
        </div>
        <div
          :ref="(el) => (childrenRef = el)"
          class="file-tree-children transition-all overflow-hidden"
        >
          <NoteTree :data="item.children" :depth="props.depth + 1" />
        </div>
      </div>
    </template>
  </div>
</template>
<style scoped>
.file-tree {
  width: 100%;
}
</style>
