import type { ButtonProps } from "@nuxt/ui";
import { createVNode, render } from "vue";
import { useNuxtApp } from "#app";
import MessageBox from "./MessageBox.vue";

export type MessageBoxType = "primary" | "success" | "warning" | "info" | "question" | "error";

export type CreateMessageBoxOptions = {
  title: string;
  titleClass?: string;
  message?: string;
  messageClass?: string;
  type?: MessageBoxType;
  icon?: string;
  iconClass?: string;
  showCloseButton?: boolean;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  cancelButtonText?: string;
  confirmButtonText?: string;
  confirmButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
};

export const createMessageBox = (options: CreateMessageBoxOptions) => {
  const visible = ref(false);

  type DoneType = "confirm" | "cancel" | "close";

  let doneResolve: ((value: DoneType) => void) | null = null;

  const icon = computed(() => {
    if (options.icon) return options.icon;

    switch (options.type) {
      case "primary":
        return "ep:info-filled";
      case "success":
        return "ep:circle-check-filled";
      case "error":
        return "ep:circle-close-filled";
      case "warning":
        return "ep:warning-filled";
      case "info":
        return "ep:info-filled";
      case "question":
        return "ep:question-filled";
      default:
        return undefined;
    }
  });

  const iconColor = computed(() => {
    switch (options.type) {
      case "primary":
        return "text-blue-500";
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      case "question":
        return "text-gray-500";
      default:
        return undefined;
    }
  });

  const container = document.createElement("div");

  container.classList.add("message-box-container");

  const vnode = createVNode(MessageBox, {
    visible,
    title: options.title,
    titleClass: options.titleClass,
    message: options.message,
    messageClass: options.messageClass,
    icon: icon.value,
    iconClass: `${iconColor.value ?? ""} ${options.iconClass ?? ""}`,
    showCloseButton: options.showCloseButton,
    showCancelButton: options.showCancelButton,
    showConfirmButton: options.showConfirmButton,
    cancelButtonText: options.cancelButtonText,
    confirmButtonText: options.confirmButtonText,
    confirmButtonProps: options.confirmButtonProps,
    cancelButtonProps: options.cancelButtonProps,
    onAfterLeave: () => {
      destroy();
    },
    onConfirm: () => {
      options.onConfirm?.();
      doneResolve?.("confirm");
    },
    onCancel: () => {
      options.onCancel?.();
      doneResolve?.("cancel");
    },
    onClose: () => {
      options.onClose?.();
      doneResolve?.("close");
    }
  });

  const nuxtApp = useNuxtApp();

  vnode.appContext = nuxtApp.vueApp._context;

  const show = (): Promise<DoneType> => {
    document.body.appendChild(container);
    render(vnode, container);

    visible.value = true;
    return new Promise((resolve) => {
      doneResolve = resolve;
    });
  };

  const destroy = () => {
    render(null, container);
    document.body.removeChild(container);
  };

  return { show, close: destroy };
};
