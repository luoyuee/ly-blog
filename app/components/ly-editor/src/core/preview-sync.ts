import type { EditorTabItem } from "#shared/types/ly-editor";
import dayjs from "dayjs";

/**
 * 同步当前 note tab 与预览内容。
 */
export const syncNotePreview = (
  currentTab: EditorTabItem | undefined,
  content: string,
  lyEditorStore: ReturnType<typeof useLyEditorStore>
) => {
  if (!currentTab || currentTab.type !== "note") {
    return;
  }

  currentTab.data.content = content;
  currentTab.isChange = true;
  currentTab.lastEditTime = dayjs().unix();
  lyEditorStore.preview.content = currentTab.data.content;
};
