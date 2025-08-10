// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: [
    "@/styles/reset.css",
    "@/styles/index.css",
    "@/styles/github-markdown.css",
  ],
  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@element-plus/nuxt",
    "@unocss/nuxt",
  ],
  i18n: {
    defaultLocale: "zh-CN",
    locales: [{ code: "zh-CN", name: "简体中文", file: "zh-CN.json" }],
  },
  icon: {
    serverBundle: {
      collections: ["ep", "lucide"],
    },
    customCollections: [
      {
        prefix: "custom",
        dir: "./app/assets/icons",
      },
      {
        prefix: "custom-color",
        dir: "./app/assets/color-icons",
      },
    ],
  },
  elementPlus: {},
});
