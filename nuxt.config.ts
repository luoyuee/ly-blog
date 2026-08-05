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
        "@nuxt/ui > prosemirror-gapcursor",
        // @antv/x6 v3 的 ESM 入口包含目录式 import（如 es/shape），
        // Node 原生 ESM 无法解析，交给 Vite 预构建转换为兼容格式
        "@antv/x6"
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
    "@nuxtjs/mdc",
    "@vite-pwa/nuxt"
  ],
  pwa: {
    registerType: "prompt",
    // injectRegister 保持默认 false：@vite-pwa/nuxt 自带 $pwa 客户端插件负责注册 SW，
    // 设为 "auto" 会导致同一 SW 被重复注册。
    // dev 下禁用 SW：vite-plugin-pwa 对 /dev-sw.js 的处理与 Nuxt/Vite SSR 冲突
    // （GenerateSW 校验报错、module/classic 不匹配、app 代码被误编入 SW），
    // 本地验证请用 pnpm build && pnpm preview（localhost 为安全上下文，SW 正常注册）。
    devOptions: {
      enabled: false
    },
    manifest: {
      name: "Ly Blog",
      short_name: "LyBlog",
      description: "基于 Nuxt 的个人博客与内容管理系统",
      lang: "zh-CN",
      dir: "ltr",
      theme_color: "#262626",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      scope: "/",
      icons: [
        { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/pwa-maskable-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable"
        },
        {
          src: "/pwa-maskable-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable"
        },
        { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
      ]
    },
    workbox: {
      // 预缓存只收「应用壳」（HTML/CSS/字体/SVG/图片），不含 .js：
      // Monaco/X6/ECharts/Live2D 等重型 chunk 动辄数 MB（ts.worker 单文件 7MB），
      // 预缓存会撑爆安装体积并拖慢 SW 首次激活；JS 统一走下方 runtimeCaching。
      globPatterns: ["**/*.{css,html,svg,woff2,png,ico}"],
      // 体积红线兜底：防止异常膨胀的 CSS/字体触发构建失败
      maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      // SW 自身与 legacy 产物不进预缓存
      globIgnores: ["**/sw.js", "**/workbox-*.js", "**/*-legacy.*"],
      // 关键：模块在缺失该 key 时会自动补成 "/"（见 dist 源码
      // `if (!("navigateFallback" in options.workbox)) options.workbox.navigateFallback = baseURL ?? "/"`）。
      // 本项目为 SSR（Nitro node preset），无静态 index.html 壳，"/" 不在预缓存清单，
      // 被补成 "/" 会触发 Workbox non-precached-url 报错。
      // 故显式保留 key 并设 undefined：key 存在→模块不覆盖；值 undefined→Workbox 不注册导航回退。
      // 离线能力改由下方 document 的 NetworkFirst 运行时缓存提供。
      navigateFallback: undefined,
      runtimeCaching: [
        {
          // HTML 文档：网络优先，离线回退缓存
          urlPattern: ({ request }) => request.destination === "document",
          handler: "NetworkFirst",
          options: {
            cacheName: "pages",
            networkTimeoutSeconds: 10,
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        {
          // 鉴权/后台接口：绝不缓存，防共享设备泄密
          urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
          handler: "NetworkOnly"
        },
        {
          // 图片：缓存优先，离线可读存量文章
          urlPattern: ({ request }) => request.destination === "image",
          handler: "CacheFirst",
          options: {
            cacheName: "images",
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        {
          // 字体：缓存优先
          urlPattern: ({ request }) => request.destination === "font",
          handler: "CacheFirst",
          options: {
            cacheName: "fonts",
            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        {
          // _nuxt/*.js（含 Monaco/X6/ECharts/Live2D/ts.worker 等重型依赖）：
          // 缓存优先，首次加载即落盘；hash 文件名保证版本更新时自动失效。
          urlPattern: ({ url }) =>
            url.pathname.startsWith("/_nuxt/") && url.pathname.endsWith(".js"),
          handler: "CacheFirst",
          options: {
            cacheName: "nuxt-js",
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] }
          }
        }
      ]
    }
  },
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
