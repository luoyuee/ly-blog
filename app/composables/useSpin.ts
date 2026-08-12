import type { CreateSpinOptions, SpinHandler, UseSpinOptions } from "@/components/spin";
import { closeAllSpin, createSpin } from "@/components/spin";

export const useSpin = (defaultOptions?: UseSpinOptions) => {
  const open = (options?: CreateSpinOptions): SpinHandler => {
    return createSpin({ ...defaultOptions, ...options });
  };

  return { open, closeAll: closeAllSpin };
};
