<script setup lang="ts">
import { useMdcEditorStore } from "@/stores";
import { onMounted } from "vue";
import IndeterminateProgressBar from "../progress/IndeterminateProgressBar.vue";
import { mdcEditorEmitter } from "@/events";
import NoteTree from "./NoteTree.vue";

const editorStore = useMdcEditorStore();

onMounted(() => {
  editorStore.loadNoteFolderTree();
});

const handleNewNote = () => {
  mdcEditorEmitter.emit("cmd.editor-core:new:file");
};

mdcEditorEmitter.on("cmd.note-manager:reload", () => {
  editorStore.loadNoteFolderTree();
});
</script>
<template>
  <div class="mdc-editor-explorer">
    <div class="toolbar">
      <div class="whitespace-nowrap text-ellipsis overflow-hidden"> 笔记管理 </div>
      <div class="actions">
        <span title="新建文件" @click="handleNewNote">
          <UIcon name="custom:file-add" />
        </span>
        <span title="新建文件夹">
          <UIcon name="custom:folder-plus" />
        </span>
        <span title="刷新目录">
          <UIcon name="custom:redo" />
        </span>
      </div>
    </div>
    <IndeterminateProgressBar :loading="editorStore.noteManager.loading" />
    <NoteTree v-model="editorStore.noteManager.folderTree" />
  </div>
</template>
<style lang="scss">
.mdc-editor-explorer {
  width: 100%;
  height: 100%;
  background-color: #181818;
  overflow-x: hidden;

  .toolbar {
    color: #d5d5d5;
    font-size: 0.875rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #2b2b2b;
    height: 34px;
    padding: 0 6px;

    .actions {
      display: flex;
      font-size: 1rem;

      > span {
        cursor: pointer;
        border-radius: 4px;
        width: 28px;
        text-align: center;
        &:hover {
          background-color: var(--mdc-editor-luminosity-plus2);
        }
      }
    }
  }
}
</style>
