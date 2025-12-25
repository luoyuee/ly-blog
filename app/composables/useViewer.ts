import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";

export const useViewer = (el: HTMLElement, options?: Viewer.Options) => {
  const viewer = new Viewer(el, {
    hidden: () => {
      viewer.destroy();
    },
    ...options,
    zIndex: options?.zIndex || 10000
  });

  const show = () => {
    viewer.show();
  };

  return {
    viewer,
    show
  };
};
