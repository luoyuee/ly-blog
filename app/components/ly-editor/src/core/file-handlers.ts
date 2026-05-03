import type { EditorTabItem } from "#shared/types/ly-editor";
import { lyEditorEmitter } from "@/events";
import dayjs from "dayjs";
import { getEditorFilePath } from "../utils";

/**
 * 绑定文件相关事件。
 */
export const registerFileHandlers = (
  monacoPackage: Awaited<ReturnType<typeof import("monaco-editor")>>,
  monacoEditor: import("monaco-editor").editor.IStandaloneCodeEditor,
  lyEditorStore: ReturnType<typeof useLyEditorStore>,
  handleOpenFile: (path: string) => void
) => {
  lyEditorEmitter.on("cmd.editor-core:new:file", () => {
    const name = `新建文件-${dayjs().format("YYYY/MM/DD HH-mm-ss")}`;

    const path = getEditorFilePath({ name });

    const content = `# 标题\n\n> 创建时间: ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`;

    lyEditorStore.pushTabItem({
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

    lyEditorStore.editor.filePath = path;
    lyEditorStore.currentTab = path;

    monacoPackage.editor.createModel(content, "markdown", monacoPackage.Uri.parse(path));

    handleOpenFile(path);
  });

  lyEditorEmitter.on("cmd.editor-core:open:file", (e) => {
    if (e.type !== "note") return;

    if (!lyEditorStore.getTabItem(e.key)) {
      lyEditorStore.tabs.push(e);

      monacoPackage.editor.createModel(e.data.content, "markdown", monacoPackage.Uri.parse(e.key));
    }

    lyEditorStore.editor.filePath = e.key;
    lyEditorStore.currentTab = e.key;

    handleOpenFile(e.key);
  });

  lyEditorEmitter.on("cmd.editor-core:update:file", (e) => {
    const item = lyEditorStore.getTabItem(e.key);

    if (item) {
      item.data = e.data;
      item.isChange = e.isChange;
    }
  });

  lyEditorEmitter.on("cmd.editor-core:close:file", (e) => {
    const model = monacoPackage.editor.getModel(monacoPackage.Uri.parse(e.key));
    if (model) model.dispose();
  });

  lyEditorEmitter.on("cmd.editor-core:switch:file", (e: EditorTabItem) => {
    if (e.type !== "note") return;
    handleOpenFile(e.key);
  });

  lyEditorEmitter.on("cmd.editor-core:insert:card", () => {
    const text = `\n::Card::\n\ntitle =\n\n::Card::\n`;
    const cursorSelection = monacoEditor.getSelection();
    if (!cursorSelection) return;

    const { startLineNumber, startColumn, endLineNumber, endColumn } = cursorSelection;

    monacoEditor.executeEdits("", [
      {
        range: new monacoPackage.Range(
          startLineNumber,
          startColumn - 1,
          endLineNumber,
          endColumn
        ),
        text,
        forceMoveMarkers: true
      }
    ]);

    monacoEditor.focus();
  });
};
