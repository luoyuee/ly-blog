import type { FolderTreeItem } from "#shared/types/ly-editor";

export type ClickTreeNodeData = FolderTreeItem & {
  $treeNodeId: number;
};

export interface ContextMenuItem {
  label: string;
  icon?: string;
  func?: (data: any) => void;
  children?: ContextMenuItem[];
}

export interface SidebarMenuItem {
  key: number;
  label: string;
  icon: string;
  handler?: () => void;
}

// export type BaseContextMenuInstance = InstanceType<typeof BaseContextMenu>;

export interface ActivityMenuItem {
  key: number;
  label: string;
  icon: string;
  panel?: string;
  onClick?: () => void;
}

export const enum FileTreeItemType {
  FOLDER = "folder",
  FILE = "file"
}

// 定义不同 item_type 对应的 data 类型
export interface FolderData {
  [key: string]: never;
}

export interface FileData {
  [key: string]: never;
}

// 通过联合类型实现自动推断
export type FileTreeItem = {
  id: number;
  name: string;
  key: string;
  children?: FileTreeItem[];
  is_expanded?: boolean;
} & (
  | {
      item_type: FileTreeItemType.FOLDER | "folder";
      data: FolderData;
    }
  | {
      item_type: FileTreeItemType.FILE | "file";
      data: FileData;
    }
);
