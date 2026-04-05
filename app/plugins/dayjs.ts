/**
 * Dayjs 全局注册（Nuxt Plugin）
 *
 * 目标：
 * 1) 统一注册 Dayjs 插件（extend）与语言（locale），避免在每个页面/组件里重复写；
 * 2) 兼容 Node.js 24 的 ESM 解析：对 dayjs/plugin/*、dayjs/locale/* 这类子路径导入显式加 `.js` 后缀；
 * 3) 同时通过 provide 注入到 Nuxt App（可在组件中通过 useNuxtApp().$dayjs 获取）。
 *
 * 说明：
 * - Dayjs 的插件扩展是“全局单例”行为：一旦 extend，后续从 `dayjs` 导入的实例都会具备该插件能力。
 * - 因此即使你在页面/组件中继续 `import dayjs from "dayjs"`，也能直接使用这里注册的插件能力。
 */
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import objectSupport from "dayjs/plugin/objectSupport";

import "dayjs/locale/zh-cn.js";

let isSetup = false;

export default defineNuxtPlugin(() => {
  if (isSetup) return;
  isSetup = true;

  // 统一注册常用插件
  dayjs.extend(localizedFormat);
  dayjs.extend(customParseFormat);
  dayjs.extend(relativeTime);
  dayjs.extend(advancedFormat);
  dayjs.extend(duration);
  dayjs.extend(isSameOrAfter);
  dayjs.extend(isSameOrBefore);
  dayjs.extend(weekday);
  dayjs.extend(weekOfYear);
  dayjs.extend(updateLocale);
  dayjs.extend(objectSupport);

  // 设置默认语言（影响 format、fromNow 等展示）
  dayjs.locale("zh-cn");

  // 注入到 Nuxt App（可选用法：useNuxtApp().$dayjs）
  return {
    provide: {
      dayjs
    }
  };
});
