export interface MessageBoard {
  id: number;
  created_at?: number;
  created_by?: number;
  updated_at?: number;
  updated_by?: number;
  email: string;
  website?: string;
  avatar?: string;
  nickname: string;
  content: string;
  parent_id?: number;
  reply_id?: number;
  reply_nickname?: string;
  ip?: string;
  location?: string;
  platform?: string;
  browser?: string;
  role: number;
  status?: number;
  children?: MessageBoard[];
}
