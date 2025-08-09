import type {
  MessageItem,
  GetListRequest,
  GetListResponse,
} from "#shared/types";

export interface CreateMessageRequest {
  avatar?: string;
  nickname: string;
  email: string;
  website?: string;
  content: string;
  parent?: number;
  reply?: number;
}

export interface GetMessageListRequest extends GetListRequest {}

export interface GetMessageListResponse extends GetListResponse<MessageItem> {}

export interface UpdateMessageContentRequest {
  id: number;
  content: string;
}
