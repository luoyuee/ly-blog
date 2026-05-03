import { defineStore } from "pinia";

/**
 * 工作台外壳状态。
 */
export type EditorShellStoreModel = {
  sidebar: {
    show: boolean;
    active: number;
  };
};

export const editorShellStore = defineStore("editor-shell", {
  state: (): EditorShellStoreModel => ({
    sidebar: {
      show: true,
      active: 1
    }
  }),
  actions: {
    setSidebarVisible(show: boolean) {
      this.sidebar.show = show;
    },
    toggleSidebarVisible() {
      this.sidebar.show = !this.sidebar.show;
    },
    setActiveSidebar(active: number) {
      this.sidebar.active = active;
    }
  }
});

export const useEditorShellStore = () => editorShellStore();
