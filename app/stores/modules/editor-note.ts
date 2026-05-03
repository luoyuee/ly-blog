import type { FolderTreeItem } from "#shared/types/ly-editor";
import { getFolderTree } from "@/apis/note";
import { defineStore } from "pinia";

/**
 * 工作台笔记模块状态。
 */
export type EditorNoteStoreModel = {
  loading: boolean;
  folderTree: FolderTreeItem[];
};

export const editorNoteStore = defineStore("editor-note", {
  state: (): EditorNoteStoreModel => ({
    loading: false,
    folderTree: []
  }),
  actions: {
    async loadNoteFolderTree() {
      try {
        this.loading = true;
        this.folderTree = await getFolderTree({
          "include-file": true
        });
      } catch (error) {
        console.error(error);
        const toast = useToast();

        toast.add({
          title: "加载目录失败",
          color: "error",
          icon: "i-lucide-circle-x"
        });
      } finally {
        this.loading = false;
      }
    }
  }
});

export const useEditorNoteStore = () => editorNoteStore();
