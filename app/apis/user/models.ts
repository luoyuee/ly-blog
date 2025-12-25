export interface RegisterRequest {
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
  email: string;
  avatar: string | null;
  role: number;
}
