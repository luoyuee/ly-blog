import type {
  GetUserInfoResponse,
  LoginRequest,
  LoginResponse,
} from "./models";
import { serviceAxios } from "@/utils/request";

export async function adminRegister(data: FormData): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/register",
      method: "post",
      data,
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
      data,
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
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
