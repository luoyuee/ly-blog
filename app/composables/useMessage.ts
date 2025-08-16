import type { MessageHandler, MessageOptions } from "element-plus";
import { ElMessage } from "element-plus";
import { isAxiosError } from "axios";

const defaultOptions: MessageOptions = {
  customClass: "custom-message",
  grouping: true,
  duration: 3000,
};

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

export function useMessage(options?: MessageOptions) {
  const merged = { ...defaultOptions, ...options };

  const primary = (msg: string): MessageHandler =>
    ElMessage({
      ...merged,
      type: "primary",
      message: msg,
    });

  const success = (msg: string): MessageHandler =>
    ElMessage({
      ...merged,
      type: "success",
      message: msg,
    });

  const warning = (msg: string): MessageHandler =>
    ElMessage({
      ...merged,
      type: "warning",
      message: msg,
    });

  const info = (msg: string): MessageHandler =>
    ElMessage({
      ...merged,
      type: "info",
      message: msg,
    });

  const error = (err: unknown, prefix?: string): MessageHandler => {
    const detail = normalizeErrorDetail(err);

    return ElMessage({
      ...merged,
      type: "error",
      message: prefix ? `${prefix}: ${detail}` : detail,
    });
  };

  return { primary, success, warning, info, error };
}
