import type {
  EditorTabItem,
  FolderTreeItem,
  LyEditorModalItem,
  LyEditorModalKey
} from "#shared/types/ly-editor";
import { getFolderTree } from "@/apis/note";
import { defineStore } from "pinia";

export interface LyEditorStoreModel {
  editor: {
    initializing: boolean;
    filePath?: string;
  };
  tabs: EditorTabItem[];
  currentTab?: string;
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
    width: number;
    active: string;
  };
  preview: {
    show: boolean;
    content?: string;
  };
  modal: {
    active?: LyEditorModalItem;
  };
}

export const lyEditorStore = defineStore("ly-editor", {
  state: (): LyEditorStoreModel => ({
    editor: {
      initializing: true
    },
    tabs: [],
    currentTab: undefined,
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
      width: 280,
      active: "note-manager"
    },
    preview: {
      show: false
    },
    modal: {
      active: undefined
    }
  }),
  getters: {
    hasActiveModal: (state) => Boolean(state.modal.active),
    activeModalKey: (state): LyEditorModalKey | undefined => state.modal.active?.key,
    activeModalPayload: (state): unknown => state.modal.active?.payload
  },
  actions: {
    openModal(item: LyEditorModalItem) {
      this.modal.active = item;
    },
    closeModal() {
      this.modal.active = undefined;
    },

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

        console.log(this.tabs, index);

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
