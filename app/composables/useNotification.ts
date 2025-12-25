import type { ButtonProps } from "@nuxt/ui";
import { useToast } from "#imports";
import { isAxiosError } from "axios";

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

export type NotificationType = "primary" | "success" | "info" | "warning" | "error";

export type NotificationOptions = {
  title: string;
  description?: string;
  error?: Error | unknown;
  icon?: string;
  color?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral";
  duration?: number;
  showClose?: boolean;
  actions?: ButtonProps[];
};

const defaultOptions: Partial<NotificationOptions> = {
  duration: 3000,
  showClose: true
};

export const useNotification = () => {
  const toast = useToast();

  const show = (options: NotificationOptions) => {
    const merged = { ...defaultOptions, ...options };

    toast.add(merged);
  };

  const primary = (options: NotificationOptions) => {
    const merged = { ...defaultOptions, ...options };

    toast.add({
      ...merged,
      icon: "ep:circle-check-filled",
      color: "primary"
    });
  };

  const success = (options: NotificationOptions) => {
    const merged = { ...defaultOptions, ...options };

    toast.add({
      ...merged,
      icon: "ep:circle-check-filled",
      color: "success"
    });
  };

  const info = (options: NotificationOptions) => {
    const merged = { ...defaultOptions, ...options };

    toast.add({
      ...merged,
      icon: "ep:info-filled",
      color: "info"
    });
  };

  const warning = (options: NotificationOptions) => {
    const merged = { ...defaultOptions, ...options };

    toast.add({
      ...merged,
      icon: "ep:warning-filled",
      color: "warning"
    });
  };

  const error = (options: NotificationOptions) => {
    const merged = { ...defaultOptions, ...options };

    const description = merged.description
      ? merged.description
      : merged.error
        ? normalizeErrorDetail(merged.error)
        : undefined;

    toast.add({
      ...merged,
      description,
      icon: "ep:circle-close-filled",
      color: "error"
    });
  };

  return { show, primary, success, info, warning, error };
};

// const $notify = useNotification();
