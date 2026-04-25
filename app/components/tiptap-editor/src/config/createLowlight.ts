import { all, createLowlight as createLowlightInstance } from "lowlight";

export const createLowlight = () => {
  return createLowlightInstance(all);
};
