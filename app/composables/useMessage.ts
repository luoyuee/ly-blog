import type { CreateMessageOptions } from "@/components/message";
import { createMessage, closeAllMessage } from "@/components/message";
import { isAxiosError } from "axios";
import { h } from "vue";

function normalizeErrorDetail(error: unknown): string {
  if (!error) return "";

  if (isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? "";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export type MessageOptions = Omit<CreateMessageOptions, "type" | "message">;

export function useMessage(options?: MessageOptions) {
  const primary = (message: string) => {
    return createMessage({ ...(options || {}), type: "primary", message });
  };

  const success = (message: string) => {
    return createMessage({ ...(options || {}), type: "success", message });
  };

  const warning = (message: string) => {
    return createMessage({ ...(options || {}), type: "warning", message });
  };

  const info = (message: string) => {
    return createMessage({ ...(options || {}), type: "info", message });
  };

  const error = (message: string, error?: Error | unknown) => {
    if (error) {
      const detail = normalizeErrorDetail(error);

      return createMessage({
        ...(options || {}),
        type: "error",
        message: () => {
          return h("span", {}, [
            h("strong", { style: { marginRight: "4px" } }, message + ":"),
            detail
          ]);
        }
      });
    } else {
      return createMessage({ ...(options || {}), type: "error", message });
    }
  };

  return { primary, success, warning, info, error, closeAllMessage };
}

// const $message = useMessage();
