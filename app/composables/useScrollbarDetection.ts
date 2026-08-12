import type { MaybeRefOrGetter } from "vue";
import { nextTick, ref, toValue, watch } from "vue";
import { useMutationObserver, useResizeObserver } from "@vueuse/core";

/**
 * 检测目标元素是否出现纵向 / 横向滚动条。
 *
 * 基于 `useResizeObserver` 监听容器自身与子元素尺寸变化，
 * 同时通过 `useMutationObserver` 监听子节点增删，从而在内容变化时
 * 重新计算 `scrollHeight/clientHeight` 与 `scrollWidth/clientWidth`。
 *
 * @param target 目标 DOM 引用 (ref / getter / 元素)
 * @returns `hasVerticalScrollbar` 与 `hasHorizontalScrollbar` 响应式状态
 */
export const useScrollbarDetection = (target: MaybeRefOrGetter<HTMLElement | null | undefined>) => {
  const hasVerticalScrollbar = ref(false);
  const hasHorizontalScrollbar = ref(false);

  const update = () => {
    const el = toValue(target);
    if (!el) {
      hasVerticalScrollbar.value = false;
      hasHorizontalScrollbar.value = false;
      return;
    }
    hasVerticalScrollbar.value = el.scrollHeight > el.clientHeight;
    hasHorizontalScrollbar.value = el.scrollWidth > el.clientWidth;
  };

  // 容器尺寸变化时重新检测
  useResizeObserver(target, update);

  // 子节点变化时（如动态渲染列表）也需要重新检测
  useMutationObserver(target, () => nextTick(update), {
    childList: true,
    subtree: true,
    characterData: true
  });

  // 目标元素挂载/更换时立即检测一次
  watch(
    () => toValue(target),
    () => nextTick(update),
    { immediate: true }
  );

  return {
    hasVerticalScrollbar,
    hasHorizontalScrollbar,
    update
  };
};
