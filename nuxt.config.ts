import tailwindcss from "@tailwindcss/vite";
import injectMetadata from "./vite-config/inject-metadata";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  devServer: {
    host: "0.0.0.0",
    port: 3000
  },
  nitro: {
    rollupConfig: {
      external: [/^@prisma\//, /\.wasm$/]
    }
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      target: "esnext"
    },
    define: {
      ...injectMetadata()
    }
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith("cropper-") // 自定义元素 cropper-*
    }
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/mdc"
  ],
  css: ["@/styles/var.css", "@/styles/font.css", "@/styles/main.css"],
  colorMode: {
    classSuffix: ""
  },
  i18n: {
    defaultLocale: "zh-CN",
    locales: [{ code: "zh-CN", name: "简体中文", file: "zh-CN.json" }]
  },
  ui: {
    fonts: false
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
  eslint: {},
  typescript: {
    tsConfig: {
      compilerOptions: {
        lib: ["DOM", "ESNext"]
      }
    }
  }
});
