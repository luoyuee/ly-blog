import type { GetUserInfoResponse, RegisterRequest, LoginRequest, LoginResponse } from "./models";
import { serviceAxios } from "@/utils/request";

export async function adminRegister(data: RegisterRequest): Promise<void> {
  try {
    const form = new FormData();

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
