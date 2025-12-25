// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt([
  // 忽略文件配置
  {
    ignores: [
      "node_modules/**",
      ".nuxt/**",
      "dist/**",
      ".output/**",
      "*.min.js",
      "*.min.css",
      "*.db",
      "*.sqlite",
      "logs/**",
      "*.log",
      ".env*",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      ".DS_Store",
      "Thumbs.db",
      "prisma"
    ]
  },

  // TypeScript 规则 (仅针对 .ts/.tsx 文件)
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // 基础代码质量规则替代
      // "prefer-const": "error", // 推荐使用const
      "no-var": "error" // 禁止使用var
      // "object-shorthand": "error", // 推荐对象简写
      // "prefer-template": "error", // 推荐模板字符串
      // "prefer-arrow-callback": "error", // 推荐箭头函数
      // "prefer-spread": "error", // 推荐展开运算符
      // "prefer-rest-params": "error", // 推荐剩余参数
      // "no-loop-func": "error", // 禁止在循环中创建函数
      // "no-param-reassign": "error" // 禁止参数重新赋值
    }
  },

  // Vue 规则
  {
    files: ["**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "warn",
      "vue/require-default-prop": "off",
      "vue/require-explicit-emits": "off",
      "vue/valid-template-root": "error",
      "@typescript-eslint/no-explicit-any": "warn",

      // HTML标签规则
      "vue/html-self-closing": [
        "warn",
        {
          html: {
            void: "always", // HTML空元素使用自闭合
            normal: "never", // 普通元素使用自闭合
            component: "always" // Vue组件使用自闭合
          },
          svg: "always", // SVG元素使用自闭合
          math: "always" // MathML元素使用自闭合
        }
      ],

      // Vue 属性顺序规则
      "vue/attributes-order": [
        "warn",
        {
          order: [
            "DEFINITION",
            "LIST_RENDERING",
            "CONDITIONALS",
            "RENDER_MODIFIERS",
            "GLOBAL",
            "UNIQUE",
            "TWO_WAY_BINDING",
            "OTHER_DIRECTIVES",
            "OTHER_ATTR",
            "EVENTS",
            "CONTENT"
          ]
        }
      ]
    }
  },

  // 核心规则
  {
    rules: {
      // 基础规则
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
      "no-unused-vars": "off",
      "no-undef": "off",

      // 代码风格
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      // "prefer-template": "error",
      "prefer-arrow-callback": "error",

      // 格式规则
      "linebreak-style": ["error", "unix"],
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: true
        }
      ],
      semi: ["error", "always"],
      // indent: ["error", 2],
      "no-trailing-spaces": "error",
      "eol-last": "error",

      // 最佳实践
      eqeqeq: ["error", "always"],
      // curly: ["error", "all"],
      "no-eval": "error",
      "no-alert": "error"
    }
  }
]);
