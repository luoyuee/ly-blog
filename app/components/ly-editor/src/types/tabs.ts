import type { Component } from "vue";

/**
 * 工作台标签页基础字段。
 */
export type WorkspaceTabBase = {
  key: string;
  label: string;
  isChange?: boolean;
  openTime?: number;
  lastEditTime?: number;
};

/**
 * 工作台文件标签页。
 */
export type WorkspaceFileTab<TData = unknown> = WorkspaceTabBase & {
  kind: "file";
  type: "note";
  data: TData;
};

/**
 * 工作台面板标签页。
 */
export type WorkspacePanelTab<TData = unknown> = WorkspaceTabBase & {
  kind: "panel";
  type: string;
  data?: TData;
};

/**
 * 工作台面板注册项。
 */
export type WorkspacePanelRegistryItem = {
  component: Component;
  keepAlive?: boolean;
};
