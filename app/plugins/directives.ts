export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("focus", {
    mounted(el) {
      el.focus();
    },
  });

  nuxtApp.vueApp.directive("navigate-to", {
    mounted(el, binding) {
      el.addEventListener("click", async () => {
        if (binding.modifiers.blank) {
          await navigateTo(binding.value, {
            open: {
              target: "_blank",
            },
          });
        } else {
          await navigateTo(binding.value, {
            open: {
              target: "_self",
            },
          });
        }
      });
    },
  });
});
