<script setup lang="ts">
import type { EditorTabItem } from "#shared/types/ly-editor";
import { VueDraggable } from "vue-draggable-plus";
import { useLyEditorStore } from "@/stores";
import { useTemplateRef } from "vue";
import { lyEditorEmitter } from "@/events";
import Scrollbar from "@/components/scrollbar";

const lyEditorStore = useLyEditorStore();

const handleChangeTab = (e: EditorTabItem) => {
  lyEditorStore.currentTab = e.key;

  if (e.type === "note") {
    lyEditorEmitter.emit("cmd.editor-core:switch:file", e);
  }
};

const handleCloseTab = (e: EditorTabItem) => {
  lyEditorStore.removeTabItem(e.key);

  lyEditorEmitter.emit("cmd.editor-core:close:file", e);

  const next = lyEditorStore.getCurrentTabItem();
  if (next && next.type === "note") {
    lyEditorEmitter.emit("cmd.editor-core:switch:file", next);
  }
};

const scrollbarRef = useTemplateRef("scrollbarRef");

const handleWheel = (e: WheelEvent) => {
  scrollbarRef.value?.wheel(e);
};
</script>
<template>
  <div>
    <Scrollbar ref="scrollbarRef" :height="34" class="w-full" mouse-wheel="horizontal">
      <VueDraggable v-model="lyEditorStore.tabs" target=".editor-tab-bar" :animation="150">
        <div class="editor-tab-bar" @wheel="handleWheel">
          <div
            v-for="item in lyEditorStore.tabs"
            :key="item.key"
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
        </div>
      </VueDraggable>
    </Scrollbar>
  </div>
</template>
<style scoped lang="scss">
.editor-tab-bar {
  border-bottom: 1px solid #2b2b2b;
  height: 34px;
  color: #c1c1c1;
  display: flex;
  width: max-content;

  &__item {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 4px 0 8px;
    font-size: 0.875rem;
    user-select: none;
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      background-color: #1f1f1f;
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
