import type { ImageFolder } from "./image";
export type EditorTabPaneType = "markdown" | "image-preview" | "image-manager";

export interface NoteData {
  id?: number;
  folder_id?: number;
  name: string;
  content: string;
}

export interface ImagePreviewData {
  url: string;
}

export interface ImageManagerData extends ImageFolder {}

export type EditorTabItem = {
  key: string;
  label: string;
  isChange?: boolean;
  openTime: number;
  lastEditTime?: number;
} & (
  | {
      type: "note";
      data: NoteData;
    }
  | {
      type: "article-manager";
      data: object;
    }
  | {
      type: "image-preview";
      data: Object;
    }
  | {
      type: "image-manager";
      data: ImageManagerData;
    }
  | {
      type: "hitokoto-manager";
      data: object;
    }
  | {
      type: "setting-pane";
      data: object;
    }
);

export type FolderTreeItem = {
  key: string; // 生成的唯一标识符,资源类型+ID
  id: number; // 资源ID,可能会重复
  name: string; // 显示在目录中的
  is_folder?: boolean;
  is_expanded?: boolean;
  created_at?: number;
  updated_at?: number;
  children?: FolderTreeItem[];
  parent_id?: number;
} & (
  | {
      type: "folder";
      data: object;
    }
  | {
      type: "note";
      data: {
        is_published?: boolean;
        article_id?: number;
        extension: string;
      };
    }
);

// export type EditorTabList = EditorTabItem<NoteData>[];

// export type MonacoEditorSaveFileEvent = EditorTabItem<NoteData> & {
//   silent?: boolean;
//   closeTab?: boolean;
// };

// export interface ExplorerNewFolderEvent {
//   parent?: number;
// }

// export interface ExplorerRenameFolderEvent {
//   id: number;
//   parent?: number;
//   name: string;
// }

// export interface ExplorerRenameFileEvent {
//   id: number;
//   filename: string;
// }
