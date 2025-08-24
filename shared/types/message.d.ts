export interface MessageItem {
  id: number;
  created_at: number;
  avatar?: string;
  nickname: string;
  role: number;
  email: string;
  website?: string;
  content: string;
  parent?: number;
  reply?: number;
  reply_nickname?: string;
  ip?: string;
  location?: string;
  platform?: string;
  browser?: string;
  children?: MessageItem[];
}
