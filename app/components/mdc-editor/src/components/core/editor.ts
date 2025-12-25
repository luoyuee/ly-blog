import type { EditorTabItem } from "#shared/types/mdc-editor";
import { useMdcEditorStore } from "@/stores";
import { mdcEditorEmitter } from "@/events";
import monacoLoader from "@monaco-editor/loader";
import dayjs from "dayjs";
import { updateNote } from "@/apis/note";
import { language as mdc } from "@nuxtlabs/monarch-mdc";
import { useDebounceFn } from "@vueuse/core";
import { getEditorFilePath } from "@/utils/editor";

async function handleSaveNote(e: EditorTabItem) {
  if (e.type === "note" && e.data.id) {
    try {
      await updateNote({
        id: e.data.id,
        folder_id: e.data.folder_id,
        name: e.data.name,
        content: e.data.content
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
    mdcEditorEmitter.emit("intent.editor-core:save:file", e);
  }
}

export async function initEditor(editorEl: HTMLElement) {
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
      automaticLayout: true
    });

    function handleOpenFile(path: string): void {
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

    function handleLeaveWarning(e: BeforeUnloadEvent) {
      const isChange = Object.values(mdcEditorStore.tabs).find((item) => item.isChange);
      if (isChange) {
        e.preventDefault(); // 阻止默认的关闭行为
        return "您有未保存的更改，确定要离开吗？";
      }
    }

    window.removeEventListener("beforeunload", handleLeaveWarning);
    window.addEventListener("beforeunload", handleLeaveWarning);

    monaco.languages.registerCompletionItemProvider("markdown", {
      provideCompletionItems: (model, position) => {
        const wordPosition = model.getWordAtPosition(position);
        if (!wordPosition) return;

        const start = {
          lineNumber: position.lineNumber,
          column: wordPosition.startColumn
        };
        return {
          suggestions: [
            {
              label: "card",
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: "::card::\n\n::card::",
              detail: "Card 组件",
              documentation: "在文档中使用Card组件",
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: monaco.Range.fromPositions(start)
            }
          ]
        };
      }
    });

    monacoEditor.onDidChangeModelContent(
      useDebounceFn(() => {
        const item: EditorTabItem | undefined = mdcEditorStore.getCurrentTabItem();

        if (item && item.type === "note") {
          item.data.content = monacoEditor.getValue();
          item.isChange = true;
          item.lastEditTime = dayjs().unix();
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
      }
    });

    /**
     * 新建文件
     */
    mdcEditorEmitter.on("cmd.editor-core:new:file", () => {
      const name = `新建文件-${dayjs().format("YYYY/MM/DD HH-mm-ss")}.md`;

      const path = getEditorFilePath({ name });

      const content = `# 标题\n\n> 创建时间: ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`;

      mdcEditorStore.pushTabItem({
        key: path,
        label: name,
        isChange: true,
        type: "note",
        data: {
          name,
          content
        },
        openTime: dayjs().unix()
      });

      mdcEditorStore.editor.filePath = path;
      mdcEditorStore.currenTab = path;

      monacoPackage.editor.createModel(content, "markdown", monacoPackage.Uri.parse(path));

      handleOpenFile(path);

      console.log("12312312=====================================");
    });

    /**
     * 打开文件
     */
    mdcEditorEmitter.on("cmd.editor-core:open:file", (e) => {
      console.log(e);

      if (e.type !== "note") return;

      if (!mdcEditorStore.getTabItem(e.key)) {
        mdcEditorStore.tabs.push(e);

        monacoPackage.editor.createModel(
          e.data.content,
          "markdown",
          monacoPackage.Uri.parse(e.key)
        );

        mdcEditorEmitter.emit("editor-preview:preview:content", e.data.content);
      }

      mdcEditorStore.editor.filePath = e.key;
      mdcEditorStore.currenTab = e.key;

      handleOpenFile(e.key);
    });

    mdcEditorEmitter.on("cmd.editor-core:update:file", (e) => {
      const item = mdcEditorStore.getTabItem(e.key);

      if (item) {
        item.data = e.data;
        item.isChange = e.isChange;
      }
    });

    mdcEditorEmitter.on("cmd.editor-core:close:file", (e) => {
      console.log(e);
      const model = monacoPackage.editor.getModel(monacoPackage.Uri.parse(e.key));
      console.log(model);
      if (model) model.dispose();
    });

    mdcEditorEmitter.on("cmd.editor-core:switch:file", (e: EditorTabItem) => {
      if (e.type !== "note") return;
      handleOpenFile(e.key);
    });

    mdcEditorEmitter.on("cmd.editor-core:inster:card", () => {
      const text = `\n::Card::\n\ntitle =\n\n::Card::\n`;
      // 获取光标的信息
      const cursorSelection = monacoEditor.getSelection();
      if (!cursorSelection) return;

      const { startLineNumber, startColumn, endLineNumber, endColumn } = cursorSelection;
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
          forceMoveMarkers: true
        }
      ]);
      // 插入完文本 需要聚焦下光标
      monacoEditor.focus();
    });

    mdcEditorStore.editor.initializing = false;
    return monacoEditor;
  } catch (error) {
    return Promise.reject(error);
  }
}
