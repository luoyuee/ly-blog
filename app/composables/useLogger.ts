import { createLogger } from "@/utils/logger";
import { getCurrentInstance } from "vue";

export const useLogger = (tag?: string) => {
  const instance = getCurrentInstance();
  const loggerTag = tag || instance?.type?.__name || instance?.type?.name || "AnonymousComponent";
  return createLogger(loggerTag);
};
