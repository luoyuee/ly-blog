import type { EditorTabItem } from "#shared/types/ly-editor";
import { useLyEditorStore } from "@/stores";

export const useLyEditorTabs = () => {
  const editorStore = useLyEditorStore();

  const openTabPanel = (item: EditorTabItem) => {
    editorStore.pushTabItem(item);
    editorStore.currentTab = item.key;
  };

  return {
    openTabPanel
  };
};

export default useLyEditorTabs;
