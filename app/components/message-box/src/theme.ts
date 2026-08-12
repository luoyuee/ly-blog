// MessageBox 各部件的 tailwind class 字典。
// 各部件可通过 ui prop 覆盖，合并使用 twMerge 保证 tailwind class 正确覆盖。
export const MessageBoxTheme = {
  content: "p-4 relative",
  title: "font-medium text-default",
  closeButton: "absolute top-1 right-1",
  body: "flex items-center mt-4",
  icon: "w-6 h-6 shrink-0 mr-2",
  message: "flex-1 text-sm text-gray-500",
  actions: "mt-4 flex justify-end gap-2"
} as const;

export default MessageBoxTheme;
