import type { RecipientOption } from "@@/shared/types";
import type { GetTasksResponse, SendEmailForm } from "./models";

export async function getRecipients(): Promise<RecipientOption[]> {
  try {
    const response = await serviceAxios({
      url: "/admin/email/recipients",
      method: "get"
    });

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function sendEmail(data: SendEmailForm): Promise<void> {
  try {
    await serviceAxios({
      url: "/admin/email/send",
      method: "post",
      data
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getTasks(): Promise<GetTasksResponse> {
  try {
    const response = await serviceAxios({
      baseURL: "",
      url: "/_nitro/tasks",
      method: "get"
    });

    const tasks = { ...(response.data.tasks || {}) };

    response.data.tasks = Object.keys(tasks).map((key) => ({
      name: key,
      description: tasks[key].description
    }));

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function runTask(taskName: string, payload?: object): Promise<void> {
  try {
    await serviceAxios({
      baseURL: "",
      url: `/_nitro/tasks/${taskName}`,
      method: "post",
      data: payload,
    });
  } catch (error) {
    return Promise.reject(error);
  }
}
