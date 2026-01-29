export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("focus", {
    mounted(el) {
      el.focus();
    }
  });

  nuxtApp.vueApp.directive("navigate-to", {
    mounted(el, binding) {
      el.addEventListener("click", async () => {
        if (binding.modifiers.blank) {
          await navigateTo(binding.value, {
            open: {
              target: "_blank"
            }
          });
        } else {
          await navigateTo(binding.value, {
            open: {
              target: "_self"
            }
          });
        }
      });
    }
  });

  /**
   * 带有内部缓存字段的元素类型定义
   */
  type LoadingHostElement = HTMLElement & {
    __vLoadingMask?: HTMLDivElement;
  };

  /**
   * 创建并挂载 loading 遮罩层
   * @param el 绑定指令的元素
   * @returns 创建好的遮罩层元素
   */
  const createLoadingMask = (el: HTMLElement): HTMLDivElement => {
    const host = el as LoadingHostElement;
    const computedPosition = window.getComputedStyle(host).position;

    const mask = document.createElement("div");
    const spinner = document.createElement("div");
    const text = document.createElement("div");

    mask.style.position = "absolute";
    mask.style.left = "0";
    mask.style.top = "0";
    mask.style.right = "0";
    mask.style.bottom = "0";
    mask.style.display = "flex";
    mask.style.alignItems = "center";
    mask.style.justifyContent = "center";
    mask.style.flexDirection = "column";
    mask.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
    mask.style.backdropFilter = "blur(2px)";
    mask.style.zIndex = "10";
    mask.style.pointerEvents = "none";

    spinner.style.width = "24px";
    spinner.style.height = "24px";
    spinner.style.borderRadius = "50%";
    spinner.style.border = "2px solid rgba(255, 255, 255, 0.25)";
    spinner.style.borderTopColor = "var(--theme-color)";
    spinner.style.boxSizing = "border-box";

    spinner.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], {
      duration: 800,
      iterations: Infinity
    });

    mask.appendChild(spinner);

    const customText = host.getAttribute("custom-loading-text");

    if (customText) {
      text.style.fontSize = "12px";
      text.style.marginTop = "8px";
      text.style.color = "var(--theme-color)";

      text.textContent = customText;
      mask.appendChild(text);
    }

    if (!computedPosition || computedPosition === "static") {
      if (!host.style.position) {
        host.style.position = "relative";
      }
    }

    host.appendChild(mask);
    host.__vLoadingMask = mask;

    return mask;
  };

  /**
   * 移除 loading 遮罩层
   * @param el 绑定指令的元素
   */
  const removeLoadingMask = (el: HTMLElement): void => {
    const host = el as LoadingHostElement;
    const mask = host.__vLoadingMask;

    if (!mask) {
      return;
    }

    if (mask.parentNode === host) {
      host.removeChild(mask);
    }

    host.__vLoadingMask = undefined;
  };

  /**
   * v-loading 指令
   * 用法：v-loading="boolean"
   *
   * 自定义属性：
   * - custom-loading-text：自定义加载文本，默认不显示
   *
   * - true：显示加载遮罩层
   * - false：隐藏加载遮罩层
   */
  nuxtApp.vueApp.directive("loading", {
    mounted(el: HTMLElement, binding) {
      if (binding.value) {
        createLoadingMask(el);
      }
    },
    updated(el: HTMLElement, binding) {
      if (binding.value === binding.oldValue) return;

      if (binding.value) {
        createLoadingMask(el);
      } else {
        removeLoadingMask(el);
      }
    },
    unmounted(el: HTMLElement) {
      removeLoadingMask(el);
    }
  });
});
