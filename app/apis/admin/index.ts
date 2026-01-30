import type { RecipientOption } from "@@/shared/types";
import type { SendEmailForm } from "./models";

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
