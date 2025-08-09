import zh_CN from "@/locales/zh-CN.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "zh-cn",
  messages: {
    "zh-cn": zh_CN,
  },
}));
