import type { WorkspaceModalItem, WorkspaceModalKey } from "@/components/ly-editor/src/types/modals";
import { defineStore } from "pinia";

/**
 * 工作台弹窗状态。
 */
export type EditorModalStoreModel = {
  activeModal?: WorkspaceModalItem;
};

export const editorModalStore = defineStore("editor-modal", {
  state: (): EditorModalStoreModel => ({
    activeModal: undefined
  }),
  getters: {
    open: (state) => Boolean(state.activeModal),
    activeModalId: (state): WorkspaceModalKey | undefined => state.activeModal?.key,
    payload: (state): unknown => state.activeModal?.payload
  },
  actions: {
    openModal(item: WorkspaceModalItem) {
      this.activeModal = item;
    },
    closeModal() {
      this.activeModal = undefined;
    }
  }
});

export const useEditorModalStore = () => editorModalStore();
