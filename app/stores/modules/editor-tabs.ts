import type { EditorTabItem } from "#shared/types/ly-editor";
import { defineStore } from "pinia";

/**
 * 工作台标签页状态。
 */
export type EditorTabsStoreModel = {
  tabs: EditorTabItem[];
  currentTab?: string;
};

export const editorTabsStore = defineStore("editor-tabs", {
  state: (): EditorTabsStoreModel => ({
    tabs: [],
    currentTab: undefined
  }),
  actions: {
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

        return;
      }

      this.tabs.push(item);
      this.currentTab = item.key;
    },
    removeTabItem(key: string) {
      const index = this.tabs.findIndex((item) => item.key === key);

      if (index === -1) return;

      const isCurrent = this.currentTab === key;
      this.tabs.splice(index, 1);

      if (!isCurrent) return;

      if (this.tabs.length === 0) {
        this.currentTab = undefined;

        return;
      }

      this.currentTab = this.tabs[index]?.key ?? this.tabs[index - 1]?.key;
    }
  }
});

export const useEditorTabsStore = () => editorTabsStore();
