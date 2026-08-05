import type {
  GetUserInfoResponse,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  UpdateUserProfileRequest,
  ChangePasswordRequest
} from "./models";
import request from "@/utils/request";

export const adminRegister = (data: RegisterRequest): Promise<void> => {
  const form = new FormData();

  form.append("nickname", data.nickname);
  form.append("username", data.username);
  form.append("password", data.password);
  form.append("email", data.email);

  if (data.avatar) {
    form.append("avatar", data.avatar);
  }

  return request({
    url: "/admin/register",
    method: "post",
    data: form
  });
};

export const adminLogin = (data: LoginRequest): Promise<LoginResponse> => {
  return request({
    url: "/admin/login",
    method: "post",
    data
  });
};

export const getUserInfo = (): Promise<GetUserInfoResponse> => {
  return request({
    url: "/user/info",
    method: "get"
  });
};

export const updateUserProfile = (data: UpdateUserProfileRequest): Promise<void> => {
  const form = new FormData();

  form.append("username", data.username);
  form.append("email", data.email);

  if (data.nickname !== undefined) {
    form.append("nickname", data.nickname);
  }

  if (data.avatar) {
    form.append("avatar", data.avatar);
  }

  return request({
    url: "/admin/user/profile",
    method: "patch",
    data: form
  });
};

export const changeUserPassword = (data: ChangePasswordRequest): Promise<void> => {
  return request({
    url: "/admin/user/password",
    method: "patch",
    data
  });
};
