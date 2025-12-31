<script setup lang="ts">
import { useLyEditorStore } from "@/stores";
import { onMounted } from "vue";
import IndeterminateProgressBar from "../progress/IndeterminateProgressBar.vue";
import { lyEditorEmitter } from "@/events";
import NoteTree from "./NoteTree.vue";

const editorStore = useLyEditorStore();

onMounted(() => {
  editorStore.loadNoteFolderTree();
});

const handleNewNote = () => {
  lyEditorEmitter.emit("cmd.editor-core:new:file");
};

lyEditorEmitter.on("cmd.note-manager:reload", () => {
  editorStore.loadNoteFolderTree();
});

const handleNewFolder = () => {
  lyEditorEmitter.emit("intent.note-manager:new:folder");
};

const handleReload = () => {
  editorStore.loadNoteFolderTree();
};
</script>
<template>
  <div class="sidebar-manager">
    <div class="sidebar-manager__header">
      <div class="sidebar-manager__title"> 笔记管理 </div>
      <div class="sidebar-manager__actions">
        <UTooltip text="新建文件">
          <span class="sidebar-manager__actions-item" @click="handleNewNote">
            <UIcon name="custom:file-add" />
          </span>
        </UTooltip>
        <UTooltip text="新建文件夹">
          <span class="sidebar-manager__actions-item" @click="handleNewFolder">
            <UIcon name="custom:folder-plus" />
          </span>
        </UTooltip>
        <UTooltip text="刷新目录">
          <span class="sidebar-manager__actions-item" @click="handleReload">
            <UIcon name="custom:redo" />
          </span>
        </UTooltip>
      </div>
    </div>

    <IndeterminateProgressBar :loading="editorStore.noteManager.loading" />
    <NoteTree v-model="editorStore.noteManager.folderTree" />
  </div>
</template>
