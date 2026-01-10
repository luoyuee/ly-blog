import type {
  GetUserInfoResponse,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  UpdateUserProfileRequest,
  ChangePasswordRequest
} from "./models";
import { serviceAxios } from "@/utils/request";

export async function adminRegister(data: RegisterRequest): Promise<void> {
  try {
    const form = new FormData();

    form.append("nickname", data.nickname);
    form.append("username", data.username);
    form.append("password", data.password);
    form.append("email", data.email);

    if (data.avatar) {
      form.append("avatar", data.avatar);
    }

    await serviceAxios({
      url: "/admin/register",
      method: "post",
      data: form
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function adminLogin(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/login",
      method: "post",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getUserInfo(): Promise<GetUserInfoResponse> {
  try {
    const response = await serviceAxios({
      url: "/user/info",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateUserProfile(data: UpdateUserProfileRequest): Promise<void> {
  try {
    const form = new FormData();

    form.append("username", data.username);
    form.append("email", data.email);

    if (data.nickname !== undefined) {
      form.append("nickname", data.nickname);
    }

    if (data.avatar) {
      form.append("avatar", data.avatar);
    }

    await serviceAxios({
      url: "/admin/user/profile",
      method: "patch",
      data: form
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function changeUserPassword(data: ChangePasswordRequest): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/user/password",
      method: "patch",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}
