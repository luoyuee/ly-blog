<script setup lang="ts">
import { SidebarPanel } from "../../../components";
import { useLyEditorModal } from "@/composables/useLyEditorModal";
import { useLyEditorStore } from "@/stores";
import { lyEditorEmitter } from "@/events";
import { onMounted, onBeforeUnmount } from "vue";
import NoteTree from "./NoteTree.vue";

const editorStore = useLyEditorStore();
const { openModal } = useLyEditorModal();

/**
 * 统一加载笔记目录，避免重复散落的调用点。
 */
const loadNoteFolderTree = () => {
  editorStore.loadNoteFolderTree();
};

onMounted(() => {
  loadNoteFolderTree();
});

const handleNewNote = () => {
  lyEditorEmitter.emit("cmd.editor-core:new:file");
};

/**
 * 响应外部刷新指令。
 */
const handleReloadEvent = () => {
  loadNoteFolderTree();
};

lyEditorEmitter.on("cmd.note-manager:reload", handleReloadEvent);

onBeforeUnmount(() => {
  lyEditorEmitter.off("cmd.note-manager:reload", handleReloadEvent);
});

const handleNewFolder = () => {
  openModal("note-folder-form", undefined).then((result) => {
    if (result.action === "submitted") {
      loadNoteFolderTree();
    }
  });
};

const handleReload = () => {
  loadNoteFolderTree();
};

const actions = [
  {
    label: "新建文件",
    icon: "custom:file-add",
    onClick: handleNewNote
  },
  {
    label: "新建文件夹",
    icon: "custom:folder-plus",
    onClick: handleNewFolder
  },
  {
    label: "刷新目录",
    icon: "custom:redo",
    onClick: handleReload
  }
];
</script>
<template>
  <SidebarPanel
    title="笔记管理"
    :loading="editorStore.noteManager.loading"
    :actions="actions"
  >
    <NoteTree v-model="editorStore.noteManager.folderTree" />
  </SidebarPanel>
</template>
