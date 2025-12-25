// 定义工具栏项目接口
export interface ToolbarDivider {
  type: "divider";
}

export interface ToolbarAction {
  type: "button";
  name: string;
  icon: string;
  title: string;
  action: () => void;
  isActive?: () => boolean;
}

export type ToolbarItem = ToolbarDivider | ToolbarAction;
