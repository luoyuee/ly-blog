import type {
  ArticleDashboard,
  NoteDashboard,
  ImageDashboard,
  OverviewDashboard,
  DashboardData,
} from "./models";
import { serviceAxios } from "@/utils/request";

export async function getArticleDashboard(): Promise<ArticleDashboard> {
  try {
    const response = await serviceAxios({
      url: "/admin/dashboard/article",
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getNoteDashboard(): Promise<NoteDashboard> {
  try {
    const response = await serviceAxios({
      url: "/admin/dashboard/note",
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getImageDashboard(): Promise<ImageDashboard> {
  try {
    const response = await serviceAxios({
      url: "/admin/dashboard/image",
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getLikeDashboard(): Promise<DashboardData> {
  try {
    const response = await serviceAxios({
      url: "/admin/dashboard/like",
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getViewDashboard(): Promise<DashboardData> {
  try {
    const response = await serviceAxios({
      url: "/admin/dashboard/view",
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getCommentDashboard(): Promise<DashboardData> {
  try {
    const response = await serviceAxios({
      url: "/admin/dashboard/comment",
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getMessageDashboard(): Promise<DashboardData> {
  try {
    const response = await serviceAxios({
      url: "/admin/dashboard/message",
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getFleetingThoughtDashboard(): Promise<DashboardData> {
  try {
    const response = await serviceAxios({
      url: "/admin/dashboard/thought",
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getOverViewDashboard(): Promise<OverviewDashboard> {
  try {
    const response = await serviceAxios({
      url: "/admin/dashboard/overview",
      method: "get",
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
