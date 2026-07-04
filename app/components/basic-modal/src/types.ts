import type { VNode } from "vue";

export type BasicModalAction = "confirm" | "cancel" | "close";

export type BasicModalDoneFn = () => void;

export type BasicModalBeforeCloseEvent = {
  action: BasicModalAction;
  done: BasicModalDoneFn;
};

export type BasicModalBeforeClose = (event: BasicModalBeforeCloseEvent) => void;

export type BasicModalContentRender = () => VNode;
