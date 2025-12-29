import type { UpdateClientConfigRequest, UpdateServerConfigRequest } from "./models";
import { serviceAxios } from "@/utils/request";
import type { IServerConfig } from "#shared/types/config";

export async function getClientConfig(): Promise<IServerConfig> {
  try {
    const response = await serviceAxios({
      url: "/config/client",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateClientConfig(data: UpdateClientConfigRequest): Promise<void> {
  try {
    const response = await serviceAxios({
      url: "/admin/config/client",
      method: "patch",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getServerConfig(): Promise<IServerConfig> {
  try {
    const response = await serviceAxios({
      url: "/admin/config/server",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateServerConfig(data: UpdateServerConfigRequest): Promise<void> {
  try {
    const response = await serviceAxios({
      url: "/admin/config/server",
      method: "patch",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function verifyEmailConfig(data: {
  host?: string;
  port?: number;
  tls?: boolean;
  user?: string;
  pass?: string;
  notif_email?: string;
}): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/config/verify-emailer",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getWorkConfig(): Promise<WorkItem[]> {
  try {
    const response = await serviceAxios({
      url: "/config/work",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateWorkConfig(data: WorkItem[]): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/config/work",
      method: "put",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getNoticeConfig(): Promise<NoticeConfig> {
  try {
    const response = await serviceAxios({
      url: "/config/notice",
      method: "get"
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateNoticeConfig(data: NoticeConfig): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/config/notice",
      method: "put",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}
