<script setup lang="ts">
import { IndeterminateProgressBar } from "@/components/progress";
import { SidebarPanel } from "../../../components";
import { useLyEditorStore } from "@/stores";
import { lyEditorEmitter } from "@/events";
import { onMounted } from "vue";
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
  openWorkspaceModal("note-folder-form", undefined).then((result) => {
    if (result.action === "submitted") {
      editorStore.loadNoteFolderTree();
    }
  });
};

const handleReload = () => {
  editorStore.loadNoteFolderTree();
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
  <SidebarPanel title="笔记管理" :actions="actions">
    <IndeterminateProgressBar :loading="editorStore.noteManager.loading" />
    <NoteTree v-model="editorStore.noteManager.folderTree" />
  </SidebarPanel>
</template>
