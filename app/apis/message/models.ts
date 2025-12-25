import type { GetPaginatedRequest, GetPaginatedResponse } from "#shared/types/common";
import type { MessageBoard } from "#shared/types/message";

export interface CreateMessageRequest {
  avatar?: string;
  nickname: string;
  email: string;
  website?: string;
  content: string;
  parent_id?: number;
  reply_id?: number;
}

export type GetMessagePaginatedRequest = GetPaginatedRequest;

export type GetMessagePaginatedResponse = GetPaginatedResponse<MessageBoard>;

export interface UpdateMessageContentRequest {
  id: number;
  content: string;
}
