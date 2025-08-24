import type { UserRoleEnum } from "@/enums";

export interface UserInfo {
  username: string;
  email: string;
  avatar: string;
  role: UserRoleEnum;
  last_login_time: number;
}
