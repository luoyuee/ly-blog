// 滚动条各部件的 tailwind class 字典（参考 collapsible-panel 的 CollapsiblePanelTheme）。
// 动态尺寸/颜色通过根节点的 CSS 变量注入：--bar-size / --track-color / --thumb-*。
// 隐藏原生滚动条用 tailwind 任意变体：[&::-webkit-scrollbar]:hidden / [scrollbar-width:none] / [-ms-overflow-style:none]。
export const ScrollbarTheme = {
  root: "relative h-full min-h-0 overflow-hidden",
  wrap: "h-full w-full overflow-auto outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  view: "min-w-full min-h-full",
  barVertical:
    "absolute top-0 right-0 bottom-0 z-[1] w-[var(--bar-size)] rounded bg-[var(--track-color)] [&>div]:w-full",
  barHorizontal:
    "absolute right-0 bottom-0 left-0 z-[1] h-[var(--bar-size)] rounded bg-[var(--track-color)] [&>div]:h-full",
  thumb:
    "relative block w-0 h-0 rounded-[inherit] bg-[var(--thumb-color)] opacity-50 cursor-pointer transition-[background-color,opacity] duration-200 ease-out hover:bg-[var(--thumb-hover-color)] hover:opacity-80 active:bg-[var(--thumb-active-color)] active:opacity-100 focus:bg-[var(--thumb-active-color)] focus:opacity-100"
} as const;

export default ScrollbarTheme;
