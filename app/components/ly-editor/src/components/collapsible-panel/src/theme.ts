export const CollapsiblePanelTheme = {
  container: "relative h-full min-h-0 overflow-hidden",
  item: "absolute right-0 left-0 overflow-hidden",
  itemTransition: "transition-[top,height] duration-250 ease-in-out",
  transitionNone: "transition-none",
  head: "group flex h-8 cursor-pointer select-none items-center gap-1 px-1 border-b border-[#3c3c3c] text-xs whitespace-nowrap text-[#8b8b8b] transition-colors duration-150",
  headDisabled: "cursor-not-allowed opacity-50 hover:bg-[#252526] hover:text-[#8b8b8b]",
  icon: "size-4 shrink-0",
  title: "flex-1 overflow-hidden text-ellipsis",
  arrow: "size-4 shrink-0 text-[#5a5a5a] transition-transform duration-200 ease-in-out",
  arrowOpen: "rotate-90",
  arrowDisabled: "group-hover:text-[#5a5a5a]",
  body: "min-h-0 overflow-hidden",
  bodyTransition: "transition-[height] duration-250 ease-in-out",
  content: "h-full min-h-0",
  resizeHandle:
    "absolute right-0 -bottom-1 left-0 z-1 h-2 cursor-ns-resize after:absolute after:top-0.75 after:right-0 after:left-0 after:h-0.5 after:bg-transparent after:content-[''] after:transition-colors after:duration-150 after:ease-in-out hover:after:bg-blue-500"
} as const;

export default CollapsiblePanelTheme;
