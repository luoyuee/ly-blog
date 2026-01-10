export interface RegisterRequest {
  nickname: string;
  username: string;
  password: string;
  email: string;
  avatar?: File;
}

export interface LoginRequest {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  username: string;
  email: string;
  token: string;
}

export interface GetUserInfoResponse {
  username: string;
  nickname?: string;
  email: string;
  avatar: string | null;
  role: number;
  created_at?: number;
  last_login_time?: number;
  last_login_ip?: string | null;
  is_admin?: boolean;
}

export interface UpdateUserProfileRequest {
  username: string;
  email: string;
  nickname?: string;
  avatar?: File;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}
