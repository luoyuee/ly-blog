import type { MessageContext } from "./instance";
import type { VNode } from "vue";
import { createVNode, render, computed } from "vue";
import { instances } from "./instance";
import { useNuxtApp } from "#app";
import MessageContractor from "./Message.vue";

export type MessageType = "primary" | "success" | "error" | "warning" | "info";

let seed = 1;
let zIndex = 2000;

export type CreateMessageOptions = {
  message: string | VNode | (() => VNode);
  type: MessageType;
  duration?: number;
  offset?: number;
  showClose?: boolean;
  icon?: string;
  onClose?: () => void;
};

const createMessage = (options: CreateMessageOptions) => {
  const id = `message_${seed++}`;

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
      default:
        return "ep:info-filled";
    }
  });

  const container = document.createElement("div");

  const vnode = createVNode(MessageContractor, {
    ...options,
    id,
    zIndex: zIndex++,
    icon: icon.value,
    onClose: () => {
      const idx = instances.findIndex((item: MessageContext) => item.id === id);

      if (idx === -1) return;

      instances.splice(idx, 1);

      options.onClose?.();
    },
    onDestroy: () => {
      render(null, container);
      container.remove();
    }
  });

  const nuxtApp = useNuxtApp();

  vnode.appContext = nuxtApp.vueApp._context;

  const close = () => {
    vnode.component!.exposed!.close();
  };

  const instance: MessageContext = {
    id,
    vnode,
    handler: { close }
  };

  instances.push(instance);

  render(vnode, container);
  document.body.appendChild(container.firstElementChild!);

  return instance.handler;
};

const closeAllMessage = () => {
  const instancesToClose = [...instances];

  for (const instance of instancesToClose) {
    instance.handler.close();
  }
};

export { createMessage, closeAllMessage };
