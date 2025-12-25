import type { EditorTabItem, FolderTreeItem } from "#shared/types/mdc-editor";
import { getFolderTree } from "@/apis/note";
import { defineStore } from "pinia";

export interface MdcEditorStoreModel {
  editor: {
    initializing: boolean;
    filePath?: string;
  };
  tabs: EditorTabItem[];
  currenTab?: string;
  modalManager: {
    noteSaveModalVisible?: boolean;
  };
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
      initializing: true
    },
    tabs: [],
    currenTab: undefined,
    modalManager: {},
    noteManager: {
      loading: false,
      folderTree: []
    },
    imageManager: {
      loading: false
    },
    sidebar: {
      show: true,
      active: 1
    },
    preview: {
      show: false
    }
  }),
  actions: {
    async loadNoteFolderTree() {
      try {
        this.noteManager.loading = true;
        this.noteManager.folderTree = await getFolderTree({
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
        const isCurrent = this.currenTab === key;
        // 先删除目标项
        this.tabs.splice(index, 1);

        console.log(this.tabs, index);

        // 如果删除的是当前打开项，按要求设置新的当前项
        if (isCurrent) {
          if (this.tabs.length === 0) {
            // 已无标签
            this.currenTab = undefined;
          } else if (index < this.tabs.length) {
            // 删除后当前位置仍有后一个标签，选中后一个
            this.currenTab = this.tabs[index]?.key;
          } else {
            // 没有后一个，选中前一个（删除的是最后一个）
            this.currenTab = this.tabs[index - 1]?.key;
          }
        }
      }
    }
  }
});

export const useMdcEditorStore = () => mdcEditorStore();
