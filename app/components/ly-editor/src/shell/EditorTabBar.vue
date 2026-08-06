<script setup lang="ts">
import type { EditorTabItem } from "#shared/types/ly-editor";
import type { ContextMenuItem } from "@nuxt/ui";
import type { SortableEvent } from "sortablejs";
import { useSortable } from "@vueuse/integrations/useSortable";
import { useLyEditorStore } from "@/stores";
import { lyEditorEmitter } from "@/events";
import { onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import Scrollbar from "@/components/scrollbar";

const lyEditorStore = useLyEditorStore();
const { tabs } = storeToRefs(lyEditorStore);

const handleChangeTab = (e: EditorTabItem) => {
  lyEditorStore.currentTab = e.key;

  if (e.type === "note") {
    lyEditorEmitter.emit("cmd.editor-core:switch:file", e);
  }
};

/**
 * 切换到关闭标签后 Pinia 自动选中的笔记标签。
 */
const switchCurrentNoteTab = () => {
  const next = lyEditorStore.getCurrentTabItem();

  if (next && next.type === "note") {
    lyEditorEmitter.emit("cmd.editor-core:switch:file", next);
  }
};

/**
 * 批量关闭标签，并通知编辑器核心同步文件状态。
 */
const closeTabs = (items: EditorTabItem[]) => {
  items.forEach((item) => {
    lyEditorStore.removeTabItem(item.key);
    lyEditorEmitter.emit("cmd.editor-core:close:file", item);
  });

  switchCurrentNoteTab();
};

const handleCloseTab = (e: EditorTabItem) => {
  closeTabs([e]);
};

const getRightTabs = (e: EditorTabItem) => {
  const index = lyEditorStore.tabs.findIndex((item) => item.key === e.key);

  return index === -1 ? [] : lyEditorStore.tabs.slice(index + 1);
};

const getSavedTabs = () => lyEditorStore.tabs.filter((item) => !item.isChange);

const getContextMenuItems = (e: EditorTabItem): ContextMenuItem[] => {
  const rightTabs = getRightTabs(e);
  const savedTabs = getSavedTabs();

  return [
    {
      label: "关闭",
      onSelect: () => {
        closeTabs([e]);
      }
    },
    {
      label: "关闭其他",
      disabled: lyEditorStore.tabs.length <= 1,
      onSelect: () => {
        closeTabs(lyEditorStore.tabs.filter((item) => item.key !== e.key));
      }
    },
    {
      label: "关闭右侧标签页",
      disabled: rightTabs.length === 0,
      onSelect: () => {
        closeTabs(rightTabs);
      }
    },
    {
      label: "关闭已保存",
      disabled: savedTabs.length === 0,
      onSelect: () => {
        closeTabs(savedTabs);
      }
    },
    {
      label: "全部关闭",
      disabled: lyEditorStore.tabs.length === 0,
      onSelect: () => {
        closeTabs([...lyEditorStore.tabs]);
      }
    }
  ];
};

const sortableRef = useTemplateRef<HTMLElement>("sortableRef");

// 标签拖拽排序：storeToRefs 拿到的 tabs 是可写 ref，拖拽完成时由 useSortable 原地写回，Pinia 自动同步
const sortable = useSortable(sortableRef, tabs, {
  animation: 150,
  // 显式声明横向，避免在滚动容器内被自动检测误判为竖向导致阈值算错方向
  direction: "horizontal",
  // 交换区缩到目标 tab 的中央 50%，两侧各 25% 为死区，
  // 短 tab 拖入长 tab 边缘时不会立即换位，需更深拖入才交换
  swapThreshold: 0.5,
  // 被选中拖拽的元素背景高亮
  chosenClass: "editor-tab-bar__item--dragging",
  // 原位置占位符半透明
  ghostClass: "editor-tab-bar__item--ghost",
  forceFallback: true,
  fallbackClass: "editor-tab-bar__item--dragging-cloned",
  onStart: (evt) => {
    const { item, originalEvent } = evt as SortableEvent & { originalEvent: PointerEvent };
    // 容器标记拖拽中，禁用所有 tab 的 hover 样式
    sortableRef.value?.classList.add("editor-tab-bar--dragging");
    // 通过 body 上的状态类配合全局 CSS 强制 move 光标，不直接改内联样式，
    // 避免覆盖其它代码在 body 上设置的 cursor，结束时移除类即可还原
    document.body.classList.add("editor-tab-bar-dragging");
    // 计算鼠标相对 tab 左上角的偏移（即 SortableJS 内部的 tapDistanceLeft/Top）
    // 通过 CSS variable 传给 .fallback，用 margin 补偿 SortableJS 的「点击位置偏移」
    const rect = item.getBoundingClientRect();

    sortableRef.value?.style.setProperty(
      "--dragging-cloned-offset-x",
      `${originalEvent.clientX - rect.left - 10}px`
    );
    sortableRef.value?.style.setProperty(
      "--dragging-cloned-offset-y",
      `${originalEvent.clientY - rect.top - 10}px`
    );
  },
  onEnd: () => {
    sortableRef.value?.classList.remove("editor-tab-bar--dragging");
    document.body.classList.remove("editor-tab-bar-dragging");
  }
});

onBeforeUnmount(() => {
  sortable.stop?.();
});
</script>

<template>
  <div>
    <Scrollbar class="h-8.5 w-full" wheel-direction="horizontal">
      <div ref="sortableRef" class="editor-tab-bar">
        <UContextMenu
          v-for="item in lyEditorStore.tabs"
          :key="item.key"
          :items="getContextMenuItems(item)"
        >
          <div
            class="editor-tab-bar__item"
            :class="{
              'editor-tab-bar__item--active': lyEditorStore.currentTab === item.key,
              'editor-tab-bar__item--changed': item.isChange
            }"
            @click="handleChangeTab(item)"
          >
            <span class="editor-tab-bar__item-label">{{ item.label }}</span>
            <span class="editor-tab-bar__item-action" @click.stop="handleCloseTab(item)">
              <UIcon class="editor-tab-bar__icon editor-tab-bar__icon--change" name="custom:dot" />
              <UIcon
                class="editor-tab-bar__icon editor-tab-bar__icon--close"
                name="custom:close-small"
              />
            </span>
          </div>
        </UContextMenu>
      </div>
    </Scrollbar>
  </div>
</template>

<style scoped lang="scss">
.editor-tab-bar {
  border-bottom: 1px solid #2b2b2b;
  height: 34px;
  color: #c1c1c1;
  display: flex;

  &__item {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 4px 0 8px;
    font-size: 0.875rem;
    user-select: none;
    cursor: pointer;
    flex-shrink: 0;

    .editor-tab-bar:not(.editor-tab-bar--dragging) &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }

  &__item--active {
    background-color: #1e1e1e;
    position: relative;

    &::before {
      content: "";
      width: 100%;
      height: 2px;
      position: absolute;
      background-color: #0078d4;
      top: 0;
      left: 0;
    }
  }

  &__item--ghost {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &__item--dragging-cloned {
    background-color: rgba(255, 255, 255, 0.05);
    transform: translate(var(--dragging-cloned-offset-x, 0), var(--dragging-cloned-offset-y, 0));
  }

  &__item-label {
    display: inline-block;
  }

  &__item-action {
    margin-left: 4px;
    padding: 3px;
    border-radius: 3px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  &__icon--change {
    display: none;
  }

  &__icon--close {
    display: block;
  }

  &__item--changed {
    .editor-tab-bar__icon--change {
      display: block;
    }
    .editor-tab-bar__icon--close {
      display: none;
    }

    .editor-tab-bar__item-action:hover {
      .editor-tab-bar__icon--change {
        display: none;
      }
      .editor-tab-bar__icon--close {
        display: block;
      }
    }
  }
}
</style>

<style lang="scss">
// 拖拽期间全局锁定光标，使用 !important 覆盖子元素自身的 cursor，
// 类移除后自动失效，不会留下任何内联样式副作用
body.editor-tab-bar-dragging,
body.editor-tab-bar-dragging * {
  cursor: move !important;
}
</style>
