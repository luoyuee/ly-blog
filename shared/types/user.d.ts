import type { UserRoleEnum } from "@/enums";

export interface Profile {
  nickname: string;
  username: string;
  email: string;
  avatar: string | null;
  role: UserRoleEnum;
  created_at?: string;
  updated_at?: string;
  last_login_time?: string;
  last_login_ip?: string | null;
  last_login_location?: string | null;
  is_admin?: boolean;
}
