import { devPages } from "./app/dev-pages";
import { fileURLToPath } from "node:url";
import injectMetadata from "./vite-config/inject-metadata";
import tailwindcss from "@tailwindcss/vite";

const DEV_SERVER_PORT = Number.parseInt(process.env.DEV_SERVER_PORT ?? "3000", 10);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  alias: {
    "@ly-editor": fileURLToPath(new URL("./app/components/ly-editor", import.meta.url))
  },
  // sourcemap: false,
  devServer: {
    host: "0.0.0.0",
    port: Number.isNaN(DEV_SERVER_PORT) ? 3000 : DEV_SERVER_PORT
  },
  nitro: {
    rollupConfig: {
      external: [/^@prisma\//, /\.wasm$/]
    },
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      "0 2 * * *": ["backup:full"],
      "0 1 * * 1": ["czdb:update"]
    }
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      target: "esnext"
    },
    define: {
      ...injectMetadata()
    },
    optimizeDeps: {
      include: [
        "@nuxt/ui > prosemirror-state",
        "@nuxt/ui > prosemirror-transform",
        "@nuxt/ui > prosemirror-model",
        "@nuxt/ui > prosemirror-view",
        "@nuxt/ui > prosemirror-gapcursor"
      ],
      // 排除预构建，让其作为独立 chunk
      // monaco-editor 自身已是 ESM 且含大量动态 import / worker，
      // 交给 Vite 预构建容易产生失效 chunk 引用导致 404
      exclude: ["oh-my-live2d", "monaco-editor", "@monaco-editor/loader"]
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
        prefix: "colorful",
        dir: "./app/assets/colorful-icons"
      },
      {
        prefix: "skills",
        dir: "./app/assets/skill-icons"
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
  },
  hooks: {
    /**
     * 仅在开发环境下注册组件示例页，避免测试路由进入生产构建的页面清单。
     */
    "pages:extend"(pages) {
      if (process.env.NODE_ENV !== "development") {
        return;
      }

      pages.push(...devPages);
    }
  }
});
