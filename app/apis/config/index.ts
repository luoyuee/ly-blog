import type {
  GetClientConfigResponse,
  GetMePageConfigResponse,
  UpdateClientConfigRequest,
  UpdateMePageConfigRequest,
  UpdateServerConfigRequest
} from "./models";
import type { IServerConfig, NoticeConfig, WorkItem } from "#shared/types/config";
import request from "@/utils/request";

export const getClientConfig = (): Promise<GetClientConfigResponse> => {
  return request({
    url: "/config/client",
    method: "get"
  });
};

export const updateClientConfig = (data: UpdateClientConfigRequest): Promise<void> => {
  return request({
    url: "/admin/config/client",
    method: "patch",
    data
  });
};

export const getMePageConfig = (): Promise<GetMePageConfigResponse> => {
  return request({
    url: "/config/me-page",
    method: "get"
  });
};

export const updateMePageConfig = (data: UpdateMePageConfigRequest): Promise<void> => {
  return request({
    url: "/admin/config/me-page",
    method: "put",
    data
  });
};

export const getServerConfig = (): Promise<IServerConfig> => {
  return request({
    url: "/admin/config/server",
    method: "get"
  });
};

export const updateServerConfig = (data: UpdateServerConfigRequest): Promise<void> => {
  return request({
    url: "/admin/config/server",
    method: "patch",
    data
  });
};

export const verifyEmailConfig = (data: {
  host?: string;
  port?: number;
  tls?: boolean;
  user?: string;
  pass?: string;
  notify_email?: string;
}): Promise<void> => {
  return request({
    url: "/admin/config/verify-emailer",
    method: "post",
    data
  });
};

export const getWorkConfig = (): Promise<WorkItem[]> => {
  return request({
    url: "/config/work",
    method: "get"
  });
};

export const updateWorkConfig = (data: WorkItem[]): Promise<void> => {
  return request({
    url: "/admin/config/work",
    method: "put",
    data
  });
};

export const getNoticeConfig = (): Promise<NoticeConfig> => {
  return request({
    url: "/config/notice",
    method: "get"
  });
};

export const updateNoticeConfig = (data: NoticeConfig): Promise<void> => {
  return request({
    url: "/admin/config/notice",
    method: "put",
    data
  });
};
