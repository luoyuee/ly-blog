import type { EditorTabItem } from "#shared/types/ly-editor";
import { useLyEditorStore } from "@/stores";
import { lyEditorEmitter } from "@/events";
import dayjs from "dayjs";
import { updateNoteContent } from "@/apis/note";
import { useDebounceFn } from "@vueuse/core";
import { registerFileHandlers } from "./file-handlers";
import { registerEditorLanguage } from "./language";
import { initMonaco } from "./monaco";
import { syncNotePreview } from "./preview-sync";

async function handleSaveNote(e: EditorTabItem) {
  if (e.type === "note" && e.data.id) {
    try {
      await updateNoteContent({
        id: e.data.id,
        content: e.data.content
      });

      const lyEditorStore = useLyEditorStore();

      const item = lyEditorStore.getTabItem(e.key);
      if (item) {
        item.isChange = false;
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    openWorkspaceModal("note-save", e);
  }
}

export async function initEditor(editorEl: HTMLElement) {
  if (!editorEl) return;

  const lyEditorStore = useLyEditorStore();
  lyEditorStore.editor.initializing = true;

  try {
    const { monaco, monacoPackage } = await initMonaco();

    registerEditorLanguage(monaco);

    const monacoEditor = monaco.editor.create(editorEl, {
      language: "mdc",
      theme: "vs-dark",
      model: null,
      automaticLayout: true
    });

    // function handleOpenFile(path: string): void {
    //   console.log(monacoPackage.editor.getModels());

    //   const model = monacoPackage.editor.getModels().find((model) => {
    //     console.log([model.uri.path, path]);
    //     return model.uri.path === path;
    //   });

    //   console.log(model);

    //   if (model) {
    //     monacoEditor.setModel(model);
    //     lyEditorStore.preview.content = monacoEditor.getValue();
    //   }
    // }

    // function handleLeaveWarning(e: BeforeUnloadEvent) {
    //   const isChange = Object.values(lyEditorStore.tabs).find((item) => item.isChange);
    //   if (isChange) {
    //     e.preventDefault();
    //     return "您有未保存的更改，确定要离开吗？";
    //   }
    // }

    // window.removeEventListener("beforeunload", handleLeaveWarning);
    // window.addEventListener("beforeunload", handleLeaveWarning);

    // monacoEditor.onDidChangeModelContent(
    //   useDebounceFn(() => {
    //     const item: EditorTabItem | undefined = lyEditorStore.getCurrentTabItem();

    //     syncNotePreview(item, monacoEditor.getValue(), lyEditorStore);
    //   }, 200)
    // );

    // monacoEditor.addAction({
    //   id: "save",
    //   label: "save",
    //   keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    //   run: () => {
    //     const item = lyEditorStore.getCurrentTabItem();

    //     if (!item || item.type !== "note") {
    //       return;
    //     }

    //     if (item) {
    //       item.data.content = monacoEditor.getValue();
    //       handleSaveNote(item);
    //     }
    //   }
    // });

    // registerFileHandlers(monacoPackage, monacoEditor, lyEditorStore, handleOpenFile);

    lyEditorStore.editor.initializing = false;
    return monacoEditor;
  } catch (error) {
    return Promise.reject(error);
  }
}
