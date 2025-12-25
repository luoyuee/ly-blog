import type { CreateMessageBoxOptions } from "@/components/message-box";
import { createMessageBox } from "@/components/message-box";

export type MessageBoxOptions = Omit<CreateMessageBoxOptions, "type">;

export const useMessageBox = () => {
  const primary = (options: MessageBoxOptions) => {
    const { show } = createMessageBox({
      ...options,
      type: "primary"
    });
    show();
  };

  const success = (options: MessageBoxOptions) => {
    const { show } = createMessageBox({
      ...options,
      type: "success"
    });
    show();
  };

  const warning = (options: MessageBoxOptions) => {
    const { show } = createMessageBox({
      ...options,
      type: "warning"
    });
    show();
  };

  const info = (options: MessageBoxOptions) => {
    const { show } = createMessageBox({
      ...options,
      type: "info"
    });
    show();
  };

  const question = (options: MessageBoxOptions) => {
    const { show } = createMessageBox({
      ...options,
      type: "question"
    });
    show();
  };

  const error = (options: MessageBoxOptions) => {
    const { show } = createMessageBox({
      ...options,
      type: "error"
    });
    show();
  };

  return { primary, success, warning, info, question, error };
};

// const $msgBox = useMessageBox();
