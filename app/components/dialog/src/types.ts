import type { ButtonProps } from "@nuxt/ui";
import type { VNode } from "vue";
import type {
  BasicModalAction,
  BasicModalBeforeClose,
  BasicModalBeforeCloseEvent
} from "@/components/basic-modal";

export type DialogAction = BasicModalAction;

export type DialogResult = {
  action: DialogAction;
};

export type DialogContentActions = {
  confirm: () => void;
  cancel: () => void;
  close: () => void;
};

export type DialogContentRender = (actions: DialogContentActions) => VNode;

export type DialogTitleRender = () => VNode;

export type DialogFooterRender = (actions: DialogContentActions) => VNode;

export type DialogBeforeCloseEvent = BasicModalBeforeCloseEvent;

export type DialogBeforeClose = BasicModalBeforeClose;

export type DialogOptions = {
  title?: string;
  titleRender?: DialogTitleRender;
  description?: string;
  content?: DialogContentRender;
  footer?: DialogFooterRender;
  contentClass?: string;
  bodyClass?: string;
  beforeClose?: DialogBeforeClose;
  submitting?: boolean;
  showCloseButton?: boolean;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  showFooter?: boolean;
  closeOnConfirm?: boolean;
  closeOnCancel?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonProps?: Partial<ButtonProps>;
  cancelButtonProps?: Partial<ButtonProps>;
  overlay?: boolean;
  dismissible?: boolean;
  fullscreen?: boolean;
  scrollable?: boolean;
  transition?: boolean;
};
