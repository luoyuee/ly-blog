import type { EditorTabItem } from "#shared/types/ly-editor";
import { useLyEditorStore } from "@/stores";
import { updateNoteContent } from "@/apis/note";
import { useDebounceFn } from "@vueuse/core";
import { registerFileHandlers } from "./file-handlers";
import { registerEditorLanguage } from "./language";
import { initMonaco } from "./monaco";
import { syncNotePreview } from "./preview-sync";
import { createLogger } from "@/utils/logger";
import { useLyEditorModal } from "@/composables/useLyEditorModal";

const logger = createLogger("ly-editor");

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
      logger.error(error);
    }
  } else {
    const { openModal } = useLyEditorModal();
    openModal("note-save", e);
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
      automaticLayout: true,
      formatOnType: true
    });

    const handleOpenFile = (path: string): void => {
      const model = monacoPackage.editor.getModel(monacoPackage.Uri.parse(path));

      if (!model) return;

      monacoEditor.setModel(model);
      lyEditorStore.preview.content = monacoEditor.getValue();
    };

    monacoEditor.onDidChangeModelContent(
      useDebounceFn(() => {
        const item: EditorTabItem | undefined = lyEditorStore.getCurrentTabItem();

        syncNotePreview(item, monacoEditor.getValue(), lyEditorStore);
      }, 200)
    );

    monacoEditor.addAction({
      id: "save",
      label: "save",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        const item = lyEditorStore.getCurrentTabItem();

        if (!item || item.type !== "note") {
          return;
        }

        item.data.content = monacoEditor.getValue();
        handleSaveNote(item);
      }
    });

    registerFileHandlers(monacoPackage, monacoEditor, lyEditorStore, handleOpenFile);

    lyEditorStore.editor.initializing = false;
    return monacoEditor;
  } catch (error) {
    return Promise.reject(error);
  }
}
