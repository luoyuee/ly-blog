import type { ImageFolder } from "./image";

export interface NoteData {
  id?: number;
  folder_id?: number;
  name: string;
  content: string;
}

export interface ImagePreviewData {
  url: string;
}

export type ImageManagerData = ImageFolder;

export type EditorTabItem = {
  key: string;
  label: string;
  isChange?: boolean;
  openTime?: number;
  lastEditTime?: number;
} & (
  | {
      type: "note";
      data: NoteData;
    }
  | {
      type: "article-panel";
      data: object;
    }
  | {
      type: "image-preview";
      data: object;
    }
  | {
      type: "image-panel";
      data: ImageManagerData;
    }
  | {
      type: "hitokoto-panel";
      data: object;
    }
  | {
      type: "dashboard-panel";
      data: object;
    }
  | {
      type: "cron-job-panel";
      data: object;
    }
  | {
      type: "setting-panel";
      data: object;
    }
  | {
      type: "user-panel";
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
