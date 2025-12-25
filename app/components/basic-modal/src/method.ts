import type { ButtonProps } from "@nuxt/ui";
import type { VNode } from "vue";
import { createVNode, render } from "vue";
import { useNuxtApp } from "#app";
import BasicModal from "./BasicModal.vue";

type DoneFn = (close: boolean) => void;

export const useBaseModal = (option: {
  title: string;
  content: () => VNode;
  beforeClose?: (done: DoneFn) => void;
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
}) => {
  const visible = ref(false);

  const submitting = ref(false);

  const container = document.createElement("div");

  container.classList.add("base-modal-container");

  const vnode = createVNode(BasicModal, {
    visible,
    submitting: submitting.value,
    title: option.title,
    content: option.content,
    beforeClose: option.beforeClose,
    showCloseButton: option.showCloseButton,
    showCancelButton: option.showCancelButton,
    showConfirmButton: option.showConfirmButton,
    cancelButtonText: option.cancelButtonText,
    confirmButtonText: option.confirmButtonText,
    confirmButtonProps: option.confirmButtonProps,
    cancelButtonProps: option.cancelButtonProps,
    onAfterLeave: () => {
      destroy();
    },
    onConfirm: option.onConfirm,
    onCancel: option.onCancel,
    onClose: option.onClose
  });

  const nuxtApp = useNuxtApp();
  vnode.appContext = nuxtApp.vueApp._context;

  const show = () => {
    document.body.appendChild(container);
    render(vnode, container);

    visible.value = true;
  };

  const destroy = () => {
    render(null, container);
    document.body.removeChild(container);
  };

  return { show, close: destroy };
};
