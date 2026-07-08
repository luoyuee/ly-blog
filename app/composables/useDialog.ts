import type { DialogOptions, DialogResult } from "@/components/dialog";
import { useOverlay } from "@nuxt/ui/composables";
import { Dialog } from "@/components/dialog";

export type UseDialogOptions = DialogOptions & {
  destroyOnClose?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: (result: DialogResult) => void;
  onAfterLeave?: () => void;
};

export const useDialog = (options: UseDialogOptions) => {
  const overlay = useOverlay();
  const { destroyOnClose, ...dialogOptions } = options;

  const dialog = overlay.create(Dialog, {
    destroyOnClose,
    props: dialogOptions
  });

  return dialog;
};
