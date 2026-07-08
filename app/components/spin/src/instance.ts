import type { SpinHandler } from "./types";
import type { VNode } from "vue";
import { shallowReactive } from "vue";

export interface SpinContext {
  id: string;
  vnode: VNode;
  handler: SpinHandler;
}

export const instances: SpinContext[] = shallowReactive([]);
