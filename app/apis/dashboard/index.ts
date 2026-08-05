import type {
  ArticleDashboard,
  NoteDashboard,
  ImageDashboard,
  OverviewDashboard,
  DashboardData
} from "./models";
import request from "@/utils/request";

export const getArticleDashboard = (): Promise<ArticleDashboard> => {
  return request({
    url: "/admin/dashboard/article",
    method: "get"
  });
};

export const getNoteDashboard = (): Promise<NoteDashboard> => {
  return request({
    url: "/admin/dashboard/note",
    method: "get"
  });
};

export const getImageDashboard = (): Promise<ImageDashboard> => {
  return request({
    url: "/admin/dashboard/image",
    method: "get"
  });
};

export const getLikeDashboard = (): Promise<DashboardData> => {
  return request({
    url: "/admin/dashboard/like",
    method: "get"
  });
};

export const getViewDashboard = (): Promise<DashboardData> => {
  return request({
    url: "/admin/dashboard/view",
    method: "get"
  });
};

export const getCommentDashboard = (): Promise<DashboardData> => {
  return request({
    url: "/admin/dashboard/comment",
    method: "get"
  });
};

export const getMessageDashboard = (): Promise<DashboardData> => {
  return request({
    url: "/admin/dashboard/message",
    method: "get"
  });
};

export const getFleetingThoughtDashboard = (): Promise<DashboardData> => {
  return request({
    url: "/admin/dashboard/thought",
    method: "get"
  });
};

export const getOverViewDashboard = (): Promise<OverviewDashboard> => {
  return request({
    url: "/admin/dashboard/overview",
    method: "get"
  });
};
