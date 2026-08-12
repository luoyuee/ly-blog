import type { MessageContext } from "./instance";
import type { VNode } from "vue";
import { createVNode, render, computed } from "vue";
import { instances } from "./instance";
import { useNuxtApp } from "#app";
import MessageContractor from "./Message.vue";

export type MessageType = "primary" | "success" | "error" | "warning" | "info" | "loading";

let seed = 1;
let zIndex = 2000;

export type CreateMessageOptions = {
  message: string | VNode | (() => VNode);
  type: MessageType;
  duration?: number;
  offset?: number;
  showClose?: boolean;
  spin?: boolean;
  icon?: string;
  onClose?: () => void;
};

const createMessage = (options: CreateMessageOptions) => {
  const id = `message_${seed++}`;

  const icon = computed(() => {
    if (options.icon) return options.icon;

    switch (options.type) {
      case "primary":
        return "mdi:information-variant-circle";
      case "success":
        return "mdi:check-circle";
      case "error":
        return "mdi:close-circle";
      case "warning":
        return "mdi:warning-circle";
      case "info":
        return "mdi:information-variant-circle";
      case "loading":
        return "mdi:loading";
      default:
        return "mdi:information-variant-circle";
    }
  });

  // loading 类型默认 duration 为 0（不自动关闭），保留用户传入值
  const duration = options.duration ?? (options.type === "loading" ? 0 : undefined);

  // spin 默认 false，type 为 loading 时默认 true，保留用户传入值
  const spin = options.spin ?? options.type === "loading";

  const container = document.createElement("div");

  const vnode = createVNode(MessageContractor, {
    ...options,
    id,
    duration,
    spin,
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
