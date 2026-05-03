import { defineStore } from "pinia";

/**
 * 工作台预览状态。
 */
export type EditorPreviewStoreModel = {
  show: boolean;
  content?: string;
  sourceTabKey?: string;
};

export const editorPreviewStore = defineStore("editor-preview", {
  state: (): EditorPreviewStoreModel => ({
    show: false,
    content: undefined,
    sourceTabKey: undefined
  }),
  actions: {
    setVisible(show: boolean) {
      this.show = show;
    },
    toggleVisible() {
      this.show = !this.show;
    },
    setContent(content: string | undefined, sourceTabKey?: string) {
      this.content = content;
      this.sourceTabKey = sourceTabKey;
    }
  }
});

export const useEditorPreviewStore = () => editorPreviewStore();
