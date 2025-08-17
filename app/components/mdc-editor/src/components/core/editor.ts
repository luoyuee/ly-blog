import type { EditorTabItem } from "@/types/mdc-editor";
import { useMdcEditorStore } from "@/stores";
import { mdcEditorEmitter } from "@/events";
import monacoLoader from "@monaco-editor/loader";
import dayjs from "dayjs";
import { updateNote } from "@/apis/note";
import { language as mdc } from "@nuxtlabs/monarch-mdc";
import { useDebounceFn } from "@vueuse/core";

export function getEditorFilePath(options: {
  filename: string;
  folder?: number | string;
}): string {
  if (options.folder) {
    return `/${options.folder}${options.filename}`;
  } else {
    return `/${options.filename}`;
  }
}

async function handleSaveNote(e: EditorTabItem) {
  if (e.type === "note" && e.data.id) {
    try {
      await updateNote({
        id: e.data.id,
        folder_id: e.data.folder_id,
        name: e.data.name,
        content: e.data.content,
      });

      const mdcEditorStore = useMdcEditorStore();

      const item = mdcEditorStore.getTabItem(e.key);
      if (item) {
        item.isChange = false;
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    mdcEditorEmitter.emit("editor-core:save", e);
  }
}

export async function initEditor(editorEl: HTMLElement) {
  console.log(editorEl);
  if (!editorEl) return;

  const mdcEditorStore = useMdcEditorStore();
  mdcEditorStore.editor.initializing = true;

  const monacoPackage = await import("monaco-editor");

  monacoLoader.config({ monaco: monacoPackage });

  try {
    const monaco = await monacoLoader.init();

    // Register the MDC language
    monaco.languages.register({ id: "mdc" });
    monaco.languages.setMonarchTokensProvider("mdc", mdc);

    const monacoEditor = monaco.editor.create(editorEl, {
      language: "mdc",
      theme: "vs-dark",
      model: null,
      automaticLayout: true,
    });

    function openFile(path: string): void {
      console.log(monacoPackage.editor.getModels());
      const model = monacoPackage.editor.getModels().find((model) => {
        console.log([model.uri.path, path]);
        return model.uri.path === path;
      });
      console.log(model);
      if (model) {
        monacoEditor.setModel(model);
        mdcEditorStore.preview.content = monacoEditor.getValue();
      }
    }

    function leaveWarning(e: BeforeUnloadEvent) {
      const isChange = Object.values(mdcEditorStore.tabs).find(
        (item) => item.isChange
      );
      if (isChange) {
        e.preventDefault(); // 阻止默认的关闭行为
        return "您有未保存的更改，确定要离开吗？";
      }
    }

    // window.removeEventListener("beforeunload", leaveWarning);
    // window.addEventListener("beforeunload", leaveWarning);

    monaco.languages.registerCompletionItemProvider("markdown", {
      provideCompletionItems: (model, position) => {
        const wordPosition = model.getWordAtPosition(position);
        if (!wordPosition) return;

        const start = {
          lineNumber: position.lineNumber,
          column: wordPosition.startColumn,
        };
        return {
          suggestions: [
            {
              label: "card",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "::card::\n\n::card::",
              detail: "Card 组件",
              documentation: "在文档中使用Card组件",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: monaco.Range.fromPositions(start),
            },
          ],
        };
      },
    });

    monacoEditor.onDidChangeModelContent(
      useDebounceFn(() => {
        const item: EditorTabItem | undefined =
          mdcEditorStore.getCurrentTabItem();

        if (item) {
          item.data.content = monacoEditor.getValue();
          item.isChange = true;
          item.last_edit_time = dayjs().unix();
          mdcEditorStore.preview.content = item.data.content;
        }
      }, 200)
    );

    monacoEditor.addAction({
      id: "save",
      label: "save",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        const item = mdcEditorStore.getCurrentTabItem();

        if (!item || item.type !== "note") {
          return;
        }

        if (item) {
          item.data.content = monacoEditor.getValue();
          handleSaveNote(item);
        }
      },
    });

    mdcEditorEmitter.on("note:new", () => {
      const filename = `新建文件-${dayjs().format("YYYY/MM/DD HH-mm-ss")}.md`;
      const path = getEditorFilePath({ filename });

      const content = `# 标题\n\n> 创建时间: ${dayjs().format(
        "YYYY-MM-DD HH:mm:ss"
      )}`;

      mdcEditorStore.pushTabItem({
        key: path,
        label: filename,
        isChange: true,
        type: "note",
        data: {
          filename,
          content,
        },
        openTime: dayjs().unix(),
      });

      mdcEditorStore.currenTab = path;

      monacoPackage.editor.createModel(
        content,
        "markdown",
        monacoPackage.Uri.parse(path)
      );

      openFile(path);

      console.log(13123131);
    });

    mdcEditorEmitter.on("editor-tab-bar:change", (e: EditorTabItem) => {
      if (e.type === "markdown") {
        openFile(e.key);
      }
    });

    mdcEditorEmitter.on("inster:card", () => {
      const text = `
::Card::

title = 

::Card::
`;
      // 获取光标的信息
      const cursorSelection = monacoEditor.getSelection();
      if (!cursorSelection) return;

      const { startLineNumber, startColumn, endLineNumber, endColumn } =
        cursorSelection;
      // 在光标位置插入文本
      monacoEditor.executeEdits("", [
        {
          range: new monacoPackage.Range(
            startLineNumber,
            startColumn - 1,
            endLineNumber,
            endColumn
          ),
          text, // 插入的文本
          forceMoveMarkers: true,
        },
      ]);
      // 插入完文本 需要聚焦下光标
      monacoEditor.focus();
    });

    mdcEditorEmitter.on("monaco-editor:open-file", (e) => {
      console.log(e);

      if (!mdcEditorStore.getTabItem(e.key)) {
        mdcEditorStore.tabs.push(e);

        monacoPackage.editor.createModel(
          e.data.content,
          "markdown",
          monacoPackage.Uri.parse(e.key)
        );

        mdcEditorEmitter.emit("monaco-editor:preview-file", e.data.content);
      }

      mdcEditorStore.current_tab = e.key;
      openFile(e.key);
    });

    mdcEditorEmitter.on("monaco-editor:update-file", (e) => {
      const item = mdcEditorStore.getTabItem(e.key);

      if (item) {
        item.data = e.data;
        item.isChange = e.isChange;
      }
    });

    mdcEditorEmitter.on("monaco-editor:close-file", (e) => {
      const paths = mdcEditorStore.tabs.map((item) => item.key);
      let nextPath = "";

      if (paths.length > 1) {
        const currentIndex = paths.indexOf(e.key);
        if (currentIndex === 0) {
          nextPath = paths[1];
        } else if (currentIndex > 0) {
          nextPath = paths[currentIndex - 1];
        }
      }

      mdcEditorStore.removeTabItem(e.key);

      const model = monacoPackage.editor.getModel(
        monacoPackage.Uri.parse(e.key)
      );
      if (model) model.dispose();

      if (nextPath && e.key === mdcEditorStore.current_tab) {
        mdcEditorEmitter.emit("monaco-editor:switch-file", nextPath);
      }
    });

    mdcEditorStore.editor.initializing = false;
    return monacoEditor;
  } catch (error) {
    return Promise.reject(error);
  }
}
