import type { EditorTabItem } from "#shared/types/ly-editor";
import { useLyEditorStore } from "@/stores";

/**
 * 打开工作台标签页。
 *
 * 当前仍写入旧 ly-editor store，后续会切换到 editor-tabs store。
 */
export const openWorkspaceTab = (tab: EditorTabItem) => {
  const editorStore = useLyEditorStore();

  editorStore.pushTabItem(tab);
  editorStore.currentTab = tab.key;
};

/**
 * 打开单例面板标签页。
 */
export const openWorkspacePanelTab = (
  panel: Exclude<EditorTabItem["type"], "note">,
  label: string,
  data: EditorTabItem["data"] = {}
) => {
  openWorkspaceTab({
    key: panel,
    label,
    type: panel,
    data
  } as EditorTabItem);
};
