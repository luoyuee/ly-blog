import type { ToolbarNames } from "md-editor-v3";

import { defineStore } from "pinia";
import { config } from "md-editor-v3";

export interface MdEditorStoreModel {
  initialized: boolean;
  toolbars: ToolbarNames[];
}

export const mdEditorStore = defineStore("md-editor", {
  state: (): MdEditorStoreModel => ({
    initialized: false,
    toolbars: [
      "bold",
      "underline",
      "italic",
      "-",
      "title",
      "strikeThrough",
      "sub",
      "sup",
      "quote",
      "unorderedList",
      "orderedList",
      "task",
      "-",
      "codeRow",
      "code",
      "link",
      "image",
      "table",
      "=",
      "preview",
    ],
  }),
  actions: {
    initConfig() {
      if (this.initialized) return;
      try {
        config({
          editorExtensions: {},
        });
        this.initialized = true;
      } catch (error) {
        console.error(error);
      }
    },
  },
});

export const useMdEditorStore = () => mdEditorStore();
