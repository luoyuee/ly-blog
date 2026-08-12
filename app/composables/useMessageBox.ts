import type { MessageBoxOptions, MessageBoxType } from "@/components/message-box";
import { MessageBox } from "@/components/message-box";
import { useOverlay } from "@nuxt/ui/composables";

export type UseMessageBoxOptions = Omit<MessageBoxOptions, "type">;

export const useMessageBox = () => {
  const overlay = useOverlay();

  const build = (type: MessageBoxType, options: UseMessageBoxOptions) => {
    const modal = overlay.create(MessageBox, {
      destroyOnClose: true,
      props: { ...options, type }
    });

    const instance = modal.open();

    return {
      modal,
      instance
    };
  };

  return {
    primary: (options: UseMessageBoxOptions) => build("primary", options),
    success: (options: UseMessageBoxOptions) => build("success", options),
    warning: (options: UseMessageBoxOptions) => build("warning", options),
    info: (options: UseMessageBoxOptions) => build("info", options),
    question: (options: UseMessageBoxOptions) => build("question", options),
    error: (options: UseMessageBoxOptions) => build("error", options)
  };
};
