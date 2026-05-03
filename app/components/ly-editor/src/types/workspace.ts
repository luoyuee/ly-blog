/**
 * 工作台一级模块注册项。
 */
export type WorkspaceModule = {
  key: string;
  label: string;
  icon: string;
  sidebar?: string;
  defaultPanel: string;
};
