import type { ButtonProps } from "@nuxt/ui";
import type { ComponentUI } from "@/utils/tw-merge";
import type { MessageBoxTheme } from "./theme";

export type MessageBoxAction = "confirm" | "cancel" | "close";

export type MessageBoxType = "primary" | "success" | "warning" | "info" | "question" | "error";

export type MessageBoxResult = {
  action: MessageBoxAction;
};

export type MessageBoxUI = ComponentUI<typeof MessageBoxTheme>;

export type MessageBoxOptions = {
  title?: string;
  message?: string;
  type?: MessageBoxType;
  icon?: string;
  showCloseButton?: boolean;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  cancelButtonText?: string;
  confirmButtonText?: string;
  confirmButtonProps?: Partial<ButtonProps>;
  cancelButtonProps?: Partial<ButtonProps>;
  overlay?: boolean;
  submitting?: boolean;
  closeOnConfirm?: boolean;
  closeOnCancel?: boolean;
  ui?: MessageBoxUI;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: (result: MessageBoxResult) => void;
  onAfterLeave?: () => void;
};
