import type {
  CreateMessageRequest,
  GetMessagePaginatedRequest,
  GetMessagePaginatedResponse,
  UpdateMessageContentRequest
} from "./models";
import type { MessageBoard } from "#shared/types/message";

import { serviceAxios } from "@/utils/request";

export async function createMessage(data: CreateMessageRequest): Promise<MessageBoard> {
  try {
    const response = await serviceAxios({
      url: "/message",
      method: "post",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getPaginatedMessages(
  params: GetMessagePaginatedRequest
): Promise<GetMessagePaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/message",
      method: "get",
      params
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getPaginatedAdminMessages(
  params: GetMessagePaginatedRequest
): Promise<GetMessagePaginatedResponse> {
  try {
    const response = await serviceAxios({
      url: "/admin/message",
      method: "get",
      params
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
      method: "delete"
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function updateMessageContent(data: UpdateMessageContentRequest): Promise<void> {
  try {
    const response = await serviceAxios({
      url: "/admin/message/content",
      method: "patch",
      data
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
