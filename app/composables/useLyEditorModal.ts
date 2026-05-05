import type {
  LyEditorModalKey,
  LyEditorModalPayloadMap,
  LyEditorModalResultMap
} from "#shared/types/ly-editor";
import { useLyEditorStore } from "@/stores";

let activeResolver: ((result: LyEditorModalResultMap[LyEditorModalKey]) => void) | undefined;

export const useLyEditorModal = () => {
  const lyEditorStore = useLyEditorStore();

  /**
   * 打开工作台弹窗，并以 Promise 接收弹窗结果。
   */
  const openModal = <T extends LyEditorModalKey>(
    key: T,
    payload: LyEditorModalPayloadMap[T]
  ): Promise<LyEditorModalResultMap[T]> => {
    return new Promise((resolve) => {
      activeResolver?.({
        action: "cancelled"
      } as LyEditorModalResultMap[LyEditorModalKey]);

      activeResolver = resolve as (result: LyEditorModalResultMap[LyEditorModalKey]) => void;

      lyEditorStore.openModal({
        id: crypto.randomUUID(),
        key,
        payload
      });
    });
  };

  /**
   * 完成当前工作台弹窗，并关闭弹窗。
   */
  const resolveModal = <T extends LyEditorModalKey>(result: LyEditorModalResultMap[T]) => {
    activeResolver?.(result as LyEditorModalResultMap[LyEditorModalKey]);
    activeResolver = undefined;
    lyEditorStore.closeModal();
  };

  /**
   * 取消当前工作台弹窗。
   */
  const cancelModal = () => {
    resolveModal({
      action: "cancelled"
    } as LyEditorModalResultMap[LyEditorModalKey]);
  };

  return {
    openModal,
    resolveModal,
    cancelModal
  };
};

export default useLyEditorModal;
