<script setup lang="ts">
import type { EditorTabItem } from "@/types/mdc-editor";
import { VueDraggable } from "vue-draggable-plus";
import { useMdcEditorStore } from "@/stores";
import Scrollbar from "@/components/scrollbar";
import { useTemplateRef } from "vue";
import { mdcEditorEmitter } from "@/events";

const mdcEditorStore = useMdcEditorStore();

const handleChangeTab = (e: EditorTabItem) => {
  mdcEditorStore.currenTab = e.key;
  mdcEditorEmitter.emit("editor-tab-bar:change", e);
};

const handleCloseTab = (e: EditorTabItem) => {
  mdcEditorStore.removeTabItem(e.key);
};

const scrollbarRef = useTemplateRef("scrollbarRef");

const handleWheel = (e: WheelEvent) => {
  scrollbarRef.value?.wheel(e);
};
</script>
<template>
  <Scrollbar :height="34" ref="scrollbarRef" mouse-wheel="horizontal">
    <VueDraggable
      v-model="mdcEditorStore.tabs"
      target=".mdc-editor-content-tabs"
      :animation="150"
    >
      <div class="mdc-editor-content-tabs" @wheel="handleWheel">
        <div
          class="tabs-item"
          v-for="(item, key) in mdcEditorStore.tabs"
          :key="item.key"
          :class="{
            active: mdcEditorStore.currenTab === item.key,
            'is-change': item.isChange,
          }"
          @click="handleChangeTab(item)"
        >
          <span>{{ item.label }}</span>
          <span class="action" @click.stop="handleCloseTab(item)">
            <UIcon class="change" name="custom:dot" />
            <UIcon class="close" name="custom:close-small" />
          </span>
        </div>
      </div>
    </VueDraggable>
  </Scrollbar>
</template>
<style scoped lang="scss">
.mdc-editor-content-tabs {
  border-bottom: 1px solid #2b2b2b;
  height: 34px;
  color: #c1c1c1;
  list-style: none;
  display: flex;
  width: max-content;

  .tabs-item {
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

    .action {
      margin-left: 4px;
      padding: 3px;
      border-radius: 3px;
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .change {
        display: none;
      }
      .close {
        display: block;
      }
    }
  }

  .tabs-item.is-change {
    .action {
      .change {
        display: block;
      }
      .close {
        display: none;
      }

      &:hover {
        .change {
          display: none;
        }
        .close {
          display: block;
        }
      }
    }
  }

  .tabs-item.active {
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
}
</style>
