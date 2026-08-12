// Spin 各部件的 tailwind class 字典
// 各部件可通过 ui prop 覆盖，合并使用 twMerge 保证 tailwind class 正确覆盖。
// 注意：overlay 的定位类（fixed/absolute）与 wrapper 的占位类依赖运行时 props，
// 由组件内的 mergedUI 计算属性按条件追加，不写死在本字典中。
export const SpinTheme = {
  wrapper: "relative",
  overlay:
    "flex items-center justify-center overflow-hidden rounded-inherit bg-default/70 backdrop-blur-[2px] transition-opacity",
  panel: "flex min-w-32 max-w-full flex-col items-center gap-2 px-4 py-3 text-center",
  spinner: "size-8 animate-spin text-primary",
  title: "text-sm font-medium text-default",
  description: "text-xs leading-5 text-muted"
} as const;

export default SpinTheme;
