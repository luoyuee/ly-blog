import type { EditorTabItem, FolderTreeItem } from "#shared/types/mdc-editor";
import { getFolderTree } from "@/apis/note";
import { defineStore } from "pinia";

export interface MdcEditorStoreModel {
  editor: {
    initializing: boolean;
  };
  tabs: EditorTabItem[];
  currenTab?: string;
  noteManager: {
    loading: boolean;
    folderTree: FolderTreeItem[];
  };
  imageManager: {
    loading: boolean;
  };
  sidebar: {
    show: boolean;
    active: number;
  };
  preview: {
    show: boolean;
    content?: string;
  };
}

export const mdcEditorStore = defineStore("mdc-editor", {
  state: (): MdcEditorStoreModel => ({
    editor: {
      initializing: true,
    },
    tabs: [],
    currenTab: undefined,
    noteManager: {
      loading: false,
      folderTree: [],
    },
    imageManager: {
      loading: false,
    },
    sidebar: {
      show: true,
      active: 1,
    },
    preview: {
      show: true,
    },
  }),
  actions: {
    async loadNoteFolderTree() {
      const notify = useNotification();

      try {
        this.noteManager.loading = true;
        this.noteManager.folderTree = await getFolderTree({
          "include-file": true,
        });
      } catch (error) {
        notify.error("加载目录失败", error);
      } finally {
        this.noteManager.loading = false;
      }
    },
    getCurrentTabItem() {
      if (!this.currenTab) return;
      return this.tabs.find((item) => item.key === this.currenTab);
    },
    getTabItem(key: string) {
      return this.tabs.find((item) => item.key === key);
    },
    pushTabItem(item: EditorTabItem) {
      if (this.tabs.find((i) => i.key === item.key)) {
        this.currenTab = item.key;
      } else {
        this.tabs.push(item);
      }
    },
    removeTabItem(key: string) {
      const index = this.tabs.findIndex((item) => item.key === key);
      if (index !== -1) {
        this.tabs.splice(index, 1);
      }
    },
  },
});

export const useMdcEditorStore = () => mdcEditorStore();
