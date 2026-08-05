import type {
  CreateMessageRequest,
  GetMessagePaginatedRequest,
  GetMessagePaginatedResponse,
  UpdateMessageContentRequest
} from "./models";
import type { MessageBoard } from "#shared/types/message";
import request from "@/utils/request";

export const createMessage = (data: CreateMessageRequest): Promise<MessageBoard> => {
  return request({
    url: "/message",
    method: "post",
    data
  });
};

export const getPaginatedMessages = (
  params: GetMessagePaginatedRequest
): Promise<GetMessagePaginatedResponse> => {
  return request({
    url: "/message",
    method: "get",
    params
  });
};

export const getPaginatedAdminMessages = (
  params: GetMessagePaginatedRequest
): Promise<GetMessagePaginatedResponse> => {
  return request({
    url: "/admin/message",
    method: "get",
    params
  });
};

export const deleteMessage = (id: number): Promise<void> => {
  return request({
    url: "/admin/message/" + id,
    method: "delete"
  });
};

export const updateMessageContent = (data: UpdateMessageContentRequest): Promise<void> => {
  return request({
    url: "/admin/message/content",
    method: "patch",
    data
  });
};
