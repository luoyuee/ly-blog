import type {
  CreateMessageRequest,
  GetMessageListRequest,
  GetMessageListResponse,
  UpdateMessageContentRequest,
} from "./models";
import { serviceAxios } from "@/utils/request";

export async function createMessage(data: CreateMessageRequest): Promise<any> {
  try {
    const response = await serviceAxios({
      url: "/message",
      method: "post",
      data,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getMessageList(
  params: GetMessageListRequest
): Promise<GetMessageListResponse> {
  try {
    const response = await serviceAxios({
      url: "/message",
      method: "get",
      params,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getAdminMessageList(
  params: GetMessageListRequest
): Promise<GetMessageListResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/message",
      method: "get",
      params,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteMessage(id: number): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/message/" + id,
      method: "delete",
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateMessageContent(
  data: UpdateMessageContentRequest
): Promise<void> {
  try {
    const response = await serviceAxios({
      url: "/admin/message/content",
      method: "patch",
      data,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
