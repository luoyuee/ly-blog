import type { WorkspaceModalKey, WorkspaceModalPayloadMap, WorkspaceModalResultMap } from "@/components/ly-editor/src/types/modals";

let activeResolver:
  | ((result: WorkspaceModalResultMap[WorkspaceModalKey]) => void)
  | undefined;

/**
 * 打开工作台弹窗，并以 Promise 接收弹窗结果。
 */
export const openWorkspaceModal = <T extends WorkspaceModalKey>(
  key: T,
  payload: WorkspaceModalPayloadMap[T]
): Promise<WorkspaceModalResultMap[T]> => {
  const modalStore = useEditorModalStore();

  return new Promise((resolve) => {
    activeResolver?.({
      action: "cancelled"
    } as WorkspaceModalResultMap[WorkspaceModalKey]);

    activeResolver = resolve as (
      result: WorkspaceModalResultMap[WorkspaceModalKey]
    ) => void;

    modalStore.openModal({
      id: crypto.randomUUID(),
      key,
      payload
    });
  });
};

/**
 * 完成当前工作台弹窗，并关闭弹窗。
 */
export const resolveWorkspaceModal = <T extends WorkspaceModalKey>(
  result: WorkspaceModalResultMap[T]
) => {
  const modalStore = useEditorModalStore();

  activeResolver?.(result as WorkspaceModalResultMap[WorkspaceModalKey]);
  activeResolver = undefined;
  modalStore.closeModal();
};

/**
 * 取消当前工作台弹窗。
 */
export const cancelWorkspaceModal = () => {
  resolveWorkspaceModal({
    action: "cancelled"
  } as WorkspaceModalResultMap[WorkspaceModalKey]);
};
