import type {
  LyEditorModalKey,
  LyEditorModalPayloadMap,
  LyEditorModalResultMap
} from "#shared/types/ly-editor";
import type { Component } from "vue";
import { lyEditorModalRegistry } from "@ly-editor/src/registry";
import { useOverlay } from "@nuxt/ui/composables";

/**
 * 工作台弹窗函数式调用入口。
 *
 * 基于 Nuxt UI 的 useOverlay 封装，调用形式：
 * ```ts
 * const { open } = useLyEditorModal("note-folder-form");
 * const result = await open({ /* 扁平 props *\/ });
 * ```
 *
 * 内部通过 `instance.open({ ...props, visible: true })` 注入 visible，
 * 使 modal 组件挂载即显示（组件 visible 保持 default: false 不变）。
 * 每次 open 创建新 overlay 实例，close 后销毁，天然支持多实例并存。
 *
 * @param key 弹窗注册表 key
 */
export const useLyEditorModal = <K extends LyEditorModalKey>(key: K) => {
  const overlay = useOverlay();

  /**
   * 打开弹窗，返回强类型 Promise。
   * 组件 emit("close", result) 时 resolve。
   */
  const open = (props: LyEditorModalPayloadMap[K]): Promise<LyEditorModalResultMap[K]> => {
    const instance = overlay.create(lyEditorModalRegistry[key] as Component, {
      destroyOnClose: true
    });
    return instance.open({ ...props, visible: true }) as Promise<LyEditorModalResultMap[K]>;
  };

  return { open };
};

export default useLyEditorModal;
