// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["@/styles/var.scss", "@/styles/index.css", "@/styles/github-markdown.css"],
  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@element-plus/nuxt",
    "@unocss/nuxt",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt"
  ],
  colorMode: {
    classSuffix: ""
  },
  i18n: {
    defaultLocale: "zh-CN",
    locales: [{ code: "zh-CN", name: "简体中文", file: "zh-CN.json" }]
  },
  icon: {
    serverBundle: {
      collections: ["ep", "lucide"]
    },
    customCollections: [
      {
        prefix: "custom",
        dir: "./app/assets/icons"
      },
      {
        prefix: "custom-color",
        dir: "./app/assets/color-icons"
      }
    ]
  },
  elementPlus: {},
  eslint: {},
  app: {
    head: {
      script: [
        // TODO: 暂时使用外链
        { src: "//at.alicdn.com/t/c/font_4522837_24pab06z3yu.js" }, //彩色图标
        { src: "//at.alicdn.com/t/c/font_4346236_exivd4en94v.js" }
      ],
      link: [{ rel: "icon", type: "image/svg+xml", href: "ly.svg" }]
    }
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        lib: ["DOM", "ESNext"]
      }
    }
  }
});
