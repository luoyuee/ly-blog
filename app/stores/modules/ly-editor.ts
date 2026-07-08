import type { EditorTabItem, FolderTreeItem } from "#shared/types/ly-editor";
import { createLogger } from "@/utils/logger";
import { getFolderTree } from "@/apis/note";
import { defineStore } from "pinia";

const logger = createLogger("ly-editor-store");

export interface LyEditorStoreModel {
  editor: {
    initializing: boolean;
    filePath?: string;
  };
  tabs: EditorTabItem[];
  currentTab?: string;
  noteManager: {
    loading: boolean;
    folderTree: FolderTreeItem[];
    /** 展开的节点 key 集合，独立于树数据，避免刷新数据时丢失展开状态 */
    expandedKeys: Set<string>;
  };
  imageManager: {
    loading: boolean;
  };
  sidebar: {
    show: boolean;
    width: number;
    active: string;
  };
  preview: {
    show: boolean;
    content?: string;
  };
}

export const lyEditorStore = defineStore("ly-editor", {
  state: (): LyEditorStoreModel => ({
    editor: {
      initializing: true
    },
    tabs: [],
    currentTab: undefined,
    noteManager: {
      loading: false,
      folderTree: [],
      expandedKeys: new Set<string>()
    },
    imageManager: {
      loading: false
    },
    sidebar: {
      show: true,
      width: 280,
      active: "note-manager"
    },
    preview: {
      show: false
    }
  }),
  getters: {},
  actions: {
    async loadNoteFolderTree() {
      try {
        this.noteManager.loading = true;
        this.noteManager.folderTree = await getFolderTree({
          "include-file": true
        });
      } catch (error) {
        logger.error(error);
        const toast = useToast();
        toast.add({
          title: "加载目录失败",
          color: "error",
          icon: "lucide:circle-x"
        });
      } finally {
        this.noteManager.loading = false;
      }
    },
    getCurrentTabItem() {
      if (!this.currentTab) return;
      return this.tabs.find((item) => item.key === this.currentTab);
    },
    getTabItem(key: string) {
      return this.tabs.find((item) => item.key === key);
    },
    pushTabItem(item: EditorTabItem) {
      if (this.tabs.find((i) => i.key === item.key)) {
        this.currentTab = item.key;
      } else {
        this.tabs.push(item);
      }
    },
    removeTabItem(key: string) {
      const index = this.tabs.findIndex((item) => item.key === key);
      if (index !== -1) {
        const isCurrent = this.currentTab === key;
        // 先删除目标项
        this.tabs.splice(index, 1);

        logger.debug(this.tabs, index);

        // 如果删除的是当前打开项，按要求设置新的当前项
        if (isCurrent) {
          if (this.tabs.length === 0) {
            // 已无标签
            this.currentTab = undefined;
          } else if (index < this.tabs.length) {
            // 删除后当前位置仍有后一个标签，选中后一个
            this.currentTab = this.tabs[index]?.key;
          } else {
            // 没有后一个，选中前一个（删除的是最后一个）
            this.currentTab = this.tabs[index - 1]?.key;
          }
        }
      }
    }
  }
});

export const useLyEditorStore = () => lyEditorStore();
