import type { GetTasksResponse, NitroTasksRawResponse, SendEmailForm } from "./models";
import type { RecipientOption } from "#shared/types";
import request from "@/utils/request";

export const getRecipients = (): Promise<RecipientOption[]> => {
  return request({
    url: "/admin/email/recipients",
    method: "get"
  });
};

export const sendEmail = (data: SendEmailForm): Promise<void> => {
  return request({
    url: "/admin/email/send",
    method: "post",
    data
  });
};

export const getTasks = async (): Promise<GetTasksResponse> => {
  const data = (await request({
    baseURL: "",
    url: "/_nitro/tasks",
    method: "get"
  })) as unknown as NitroTasksRawResponse;

  const tasks = { ...(data.tasks || {}) };

  return {
    scheduledTasks: data.scheduledTasks,
    tasks: Object.keys(tasks).map((key) => ({
      name: key,
      description: tasks[key]?.description
    }))
  };
};

export const runTask = (taskName: string, payload?: object): Promise<void> => {
  return request({
    baseURL: "",
    url: `/_nitro/tasks/${taskName}`,
    method: "post",
    data: payload
  });
};
