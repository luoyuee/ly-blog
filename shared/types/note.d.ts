export interface Note {
  id: number;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  folder_id?: number;
  name: string;
  extension: string;
  version: number;
  content: string;
  chars?: number;
  metadata?: string;
  status?: number;
  locked?: boolean;
  locked_at?: string;
  locked_by?: number;
}

export interface NoteFolderForm {
  id?: number;
  parent_id?: number;
  name?: string;
}
