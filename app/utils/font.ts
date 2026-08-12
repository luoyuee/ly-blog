import { createLogger } from "@/utils/logger";

/**
 * 预置字体所属的平台分组。
 *
 * - `windows` / `macos` / `linux`：各系统常见字体
 * - `cross-platform`：跨平台相对常见、命中率较高的字体
 */
export type FontPresetPlatform = "windows" | "macos" | "linux" | "cross-platform";

/**
 * 字体来源。
 *
 * - `preset`：来自内置常用字体白名单
 * - `custom`：来自用户手动输入、业务扩展来源等动态候选
 */
export type FontSource = "preset" | "custom";

const LOCAL_FONT_PLATFORM = "cross-platform" as const;

/**
 * 字体候选项。
 *
 * 这里表达的是“参与探测的候选字体”，
 * 不是操作系统真实安装字体清单。
 */
export interface FontCandidate {
  label: string;
  family: string;
  source: FontSource;
  platform: FontPresetPlatform;
}

/**
 * 预置字体元数据。
 *
 * - `label`：展示给普通用户的友好名称
 * - `family`：实际用于探测、CSS / canvas 渲染的字体族名称
 */
export interface FontPresetItem {
  label: string;
  family: string;
}

type FontSortMeta = {
  order: number;
  label: string;
};

/**
 * 单字体探测选项。
 */
export interface FontProbeOptions {
  /**
   * 用于 canvas 文本宽度探测的样本文本。
   *
   * 默认值混合了宽字符、窄字符、数字和中文，
   * 目的是尽量拉开不同字体在文本度量上的差异。
   */
  sampleText?: string;
  /**
   * 探测时使用的字号。
   *
   * 字号越大，通常越容易放大不同字体之间的宽度差异。
   */
  fontSize?: number;
}

/**
 * 批量获取可用字体列表时的选项。
 */
export interface GetAvailableFontsOptions extends FontProbeOptions {
  /**
   * 业务层传入的自定义字体候选。
   *
   * 典型来源包括：
   * - 用户手动输入的字体名
   * - 将来上传字体文件并注册后的字体名
   */
  customFonts?: string[];
  /**
   * 指定要参与合并的预置平台分组。
   *
   * 不传时默认合并全部平台分组和 cross-platform 分组。
   */
  includePlatforms?: FontPresetPlatform[];
}

/**
 * Local Font Access 增强探测选项。
 */
export interface GetAvailableFontsAsyncOptions extends GetAvailableFontsOptions {
  /**
   * 是否优先尝试 `queryLocalFonts()`。
   *
   * 默认开启。若浏览器不支持、权限被拒绝或调用失败，
   * 会自动回退到现有 canvas 探测逻辑。
   */
  preferLocalFontsApi?: boolean;
  /**
   * 当浏览器支持 `queryLocalFonts()`，但用户拒绝授权时触发。
   *
   * 注意：
   * - 仅在“API 存在且权限被拒绝”时回调
   * - 浏览器不支持时不会触发该回调
   */
  onLocalFontsDenied?: (error: unknown) => void;
}

/**
 * 可用字体列表结果。
 */
export interface AvailableFontsResult {
  /** 全部候选字体（预置 + 自定义，已去重） */
  candidates: FontCandidate[];
  /** 探测通过、可认为“当前环境大概率可用”的字体 */
  available: FontCandidate[];
  /** 探测未通过的字体 */
  unavailable: FontCandidate[];
  /** 仅保留字体名称的可用列表，便于直接给 UI / 业务层使用 */
  usableFamilies: string[];
}

/**
 * 异步可用字体结果来源。
 */
export type AvailableFontsSource = "local-fonts-api" | "canvas-probe";

/**
 * 异步降级原因。
 */
export type LocalFontsFallbackReason =
  "none" | "not-requested" | "unsupported" | "empty" | "denied" | "security" | "error";

/**
 * 异步可用字体结果。
 */
export interface AvailableFontsAsyncResult extends AvailableFontsResult {
  source: AvailableFontsSource;
  fallbackReason: LocalFontsFallbackReason;
}

/**
 * 生成 canvas 字体字符串时使用的选项。
 */
export interface CanvasFontOptions {
  /** 目标字号，必填 */
  fontSize: number;
  /** 回退字体族，默认使用 `sans-serif` */
  fallbackFamily?: string;
  /** 字重，例如 `400`、`600`、`bold` */
  fontWeight?: string | number;
  /** 字体样式，例如 `normal`、`italic` */
  fontStyle?: string;
}

/**
 * 字体下拉选项。
 */
export interface FontSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  source?: FontSource | "default";
  platform?: FontPresetPlatform;
}

/**
 * `queryLocalFonts()` 返回的字体元数据最小结构。
 *
 * 不同实现还可能附带 `blob()` 等能力，
 * 但当前工具只依赖用于匹配的名称字段。
 */
interface LocalFontDataLike {
  family: string;
  fullName?: string;
  postscriptName?: string;
  style?: string;
}

/**
 * 扩展 Window 类型，声明实验性 Local Font Access API。
 */
interface WindowWithLocalFonts extends Window {
  queryLocalFonts?: () => Promise<LocalFontDataLike[]>;
}

/**
 * 默认探测文本。
 *
 * 设计目标：
 * - 同时覆盖英文宽窄字符和数字
 * - 补充中文字符，提升 CJK 字体探测区分度
 */
const DEFAULT_SAMPLE_TEXT = "WwMmIi1234567890中文字体测试";

/** 默认探测字号 */
const DEFAULT_FONT_SIZE = 72;

/**
 * 用于对比的基础通用字体族。
 *
 * 探测思路不是“直接问浏览器这个字体是否存在”，
 * 而是把目标字体拼到不同 fallback 前面，比较文本宽度是否变化。
 */
const BASE_FONT_FAMILIES = ["monospace", "sans-serif", "serif"] as const;

const DEFAULT_ASYNC_FALLBACK_REASON: LocalFontsFallbackReason = "none";

const fontLogger = createLogger("font");

const LOCAL_FONT_FALLBACK_ORDER = Number.MAX_SAFE_INTEGER;

/**
 * 常用字体白名单。
 *
 * 这份列表的目标不是穷举系统字体，而是：
 * - 在没有 `queryLocalFonts()` 时，作为降级探测的候选字体白名单
 * - 在成功读取本地字体时，作为排序优先级参考，而不是过滤条件
 */
export const COMMON_FONT_FAMILIES: Record<FontPresetPlatform, FontPresetItem[]> = {
  windows: [
    { label: "微软雅黑", family: "Microsoft YaHei" },
    { label: "宋体", family: "SimSun" },
    { label: "黑体", family: "SimHei" },
    { label: "楷体", family: "KaiTi" },
    { label: "仿宋", family: "FangSong" },
    { label: "等线", family: "DengXian" },
    { label: "新宋体", family: "NSimSun" },
    { label: "Arial", family: "Arial" },
    { label: "Times New Roman", family: "Times New Roman" },
    { label: "Courier New", family: "Courier New" },
    { label: "Tahoma", family: "Tahoma" },
    { label: "Verdana", family: "Verdana" }
  ],
  macos: [
    { label: "苹方", family: "PingFang SC" },
    { label: "冬青黑体", family: "Hiragino Sans GB" },
    { label: "宋体-简", family: "Songti SC" },
    { label: "黑体-简", family: "Heiti SC" },
    { label: "华文黑体", family: "STHeiti" },
    { label: "楷体-简", family: "Kaiti SC" },
    { label: "Arial", family: "Arial" },
    { label: "Helvetica", family: "Helvetica" },
    { label: "Times New Roman", family: "Times New Roman" },
    { label: "Courier", family: "Courier" },
    { label: "Menlo", family: "Menlo" }
  ],
  linux: [
    { label: "Noto Sans CJK SC", family: "Noto Sans CJK SC" },
    { label: "Noto Serif CJK SC", family: "Noto Serif CJK SC" },
    { label: "Noto Sans", family: "Noto Sans" },
    { label: "Noto Serif", family: "Noto Serif" },
    { label: "思源黑体", family: "Source Han Sans SC" },
    { label: "思源宋体", family: "Source Han Serif SC" },
    { label: "文泉驿微米黑", family: "WenQuanYi Micro Hei" },
    { label: "文泉驿正黑", family: "WenQuanYi Zen Hei" },
    { label: "DejaVu Sans", family: "DejaVu Sans" },
    { label: "DejaVu Serif", family: "DejaVu Serif" },
    { label: "Liberation Sans", family: "Liberation Sans" },
    { label: "Liberation Serif", family: "Liberation Serif" }
  ],
  "cross-platform": [
    { label: "Arial", family: "Arial" },
    { label: "Helvetica", family: "Helvetica" },
    { label: "Times New Roman", family: "Times New Roman" },
    { label: "Georgia", family: "Georgia" },
    { label: "Verdana", family: "Verdana" },
    { label: "Tahoma", family: "Tahoma" },
    { label: "Trebuchet MS", family: "Trebuchet MS" },
    { label: "Courier New", family: "Courier New" },
    { label: "Noto Sans", family: "Noto Sans" },
    { label: "Noto Serif", family: "Noto Serif" }
  ]
};

/**
 * 预置字体顺序索引。
 *
 * 用途：
 * - 降级探测时：`COMMON_FONT_FAMILIES` 本身就是候选白名单
 * - 本地字体读取成功时：仅用作排序优先级参考，让常用字体排前面
 */
let fontSortOrderMapCache: Map<string, FontSortMeta> | null = null;

/**
 * 检查当前环境是否具备浏览器 canvas 探测能力。
 *
 * 这个工具依赖 DOM + canvas，因此在 SSR、Node、测试环境下
 * 可能不存在 `window` / `document` / `HTMLCanvasElement`。
 */
const isBrowserSupported = (): boolean => {
  return (
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined"
  );
};

/**
 * 检查当前环境是否暴露了 `queryLocalFonts()`。
 */
const isLocalFontsApiSupported = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return typeof (window as WindowWithLocalFonts).queryLocalFonts === "function";
};

/**
 * 规范化字体名称。
 *
 * 这里会：
 * - 去掉首尾空白
 * - 去掉首尾成对的单引号 / 双引号
 *
 * 注意：
 * - 仅做最小清洗，不改写中间内容
 * - 不在数据层强制拼接 CSS 引号
 */
const normalizeFontFamily = (family: string): string => {
  return family.trim().replace(/^['"]+|['"]+$/g, "");
};

/**
 * 生成用于去重的字体 key。
 *
 * 采用大小写不敏感的方式，避免 `Arial` 和 `arial` 被重复收录。
 */
const getFontFamilyKey = (family: string): string => {
  return normalizeFontFamily(family).toLocaleLowerCase();
};

/**
 * 获取预置字体排序索引。
 *
 * 这里采用惰性初始化，避免模块加载时在工具函数定义前就访问 `getFontFamilyKey`。
 */
const getFontSortOrderMap = (): Map<string, FontSortMeta> => {
  if (fontSortOrderMapCache) {
    return fontSortOrderMapCache;
  }

  const orderMap = new Map<string, FontSortMeta>();
  let order = 0;

  for (const platformFonts of Object.values(COMMON_FONT_FAMILIES)) {
    for (const item of platformFonts) {
      const familyKey = getFontFamilyKey(item.family);

      if (!familyKey || orderMap.has(familyKey)) {
        continue;
      }

      orderMap.set(familyKey, {
        order,
        label: item.label
      });
      order += 1;
    }
  }

  fontSortOrderMapCache = orderMap;
  return orderMap;
};

/**
 * 转义字体名称中的反斜杠和双引号，避免拼接成非法 CSS font 值。
 */
const escapeFontFamily = (family: string): string => {
  return family.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
};

/**
 * 判断是否属于用户拒绝 Local Font Access 的错误。
 */
const isLocalFontsDeniedError = (error: unknown): boolean => {
  if (!(error instanceof DOMException)) {
    return false;
  }

  return error.name === "NotAllowedError";
};

/**
 * 判断是否属于安全上下文 / 用户手势 / Permissions-Policy 相关失败。
 */
const isLocalFontsSecurityError = (error: unknown): boolean => {
  if (!(error instanceof DOMException)) {
    return false;
  }

  return error.name === "SecurityError";
};

/**
 * 生成 Local Font Access 失败的控制台提示。
 */
const logLocalFontsFallback = (
  fallbackReason: Exclude<LocalFontsFallbackReason, "none" | "not-requested">,
  error: unknown
): void => {
  if (fallbackReason === "empty") {
    fontLogger.warn(
      "queryLocalFonts() returned an empty list. Falling back to canvas probing.",
      error
    );
    return;
  }

  if (fallbackReason === "denied") {
    fontLogger.warn("queryLocalFonts() permission denied. Falling back to canvas probing.", error);
    return;
  }

  if (fallbackReason === "security") {
    fontLogger.warn(
      "queryLocalFonts() blocked by security constraints. Falling back to canvas probing.",
      error
    );
    return;
  }

  if (fallbackReason === "error") {
    fontLogger.warn(
      "queryLocalFonts() failed unexpectedly. Falling back to canvas probing.",
      error
    );
  }
};

/**
 * 获取面向普通用户的字体展示名。
 *
 * 本地字体优先使用 `fullName`，没有时回退到 `family`。
 */
const getLocalFontLabel = (font: LocalFontDataLike): string => {
  const fullName = normalizeFontFamily(font.fullName ?? "");

  if (fullName) {
    return fullName;
  }

  return normalizeFontFamily(font.family);
};

/**
 * 从本地字体元数据中提取用于渲染的 family。
 */
const getLocalFontFamily = (font: LocalFontDataLike): string => {
  return normalizeFontFamily(font.family);
};

/**
 * 使用 Local Font Access 结果构建真实本地字体列表。
 *
 * 规则：
 * - 成功读取本地字体时，以浏览器返回的真实字体列表为主数据源
 * - `COMMON_FONT_FAMILIES` 在这里不参与“是否展示”的限制判断
 * - 预置白名单仅用于排序优先级参考，让常用字体排在更前面
 */
const matchCandidatesWithLocalFonts = (
  candidates: FontCandidate[],
  localFonts: LocalFontDataLike[]
): AvailableFontsResult => {
  const candidateLabelMap = new Map<string, string>();
  const availableMap = new Map<string, FontCandidate>();

  for (const candidate of candidates) {
    candidateLabelMap.set(getFontFamilyKey(candidate.family), candidate.label);
  }

  for (const localFont of localFonts) {
    const localFontFamily = getLocalFontFamily(localFont);
    const localFontFamilyKey = getFontFamilyKey(localFontFamily);

    if (!localFontFamily || availableMap.has(localFontFamilyKey)) {
      continue;
    }

    const presetLabel = candidateLabelMap.get(localFontFamilyKey);
    const localLabel = getLocalFontLabel(localFont);
    const label = localLabel || presetLabel || localFontFamily;

    if (presetLabel) {
      fontLogger.debug("local-fonts matched candidate", {
        candidateLabel: presetLabel,
        candidateFamily: localFontFamily,
        localFontLabel: localLabel,
        localFontFamily,
        localFontFullName: localFont.fullName,
        localFontPostscriptName: localFont.postscriptName
      });
    } else {
      fontLogger.debug("local-fonts appended extra font", {
        label,
        family: localFontFamily,
        fullName: localFont.fullName,
        postscriptName: localFont.postscriptName
      });
    }

    availableMap.set(localFontFamilyKey, {
      label,
      family: localFontFamily,
      source: "custom",
      platform: LOCAL_FONT_PLATFORM
    });
  }

  const fontSortOrderMap = getFontSortOrderMap();

  const available = Array.from(availableMap.values()).sort((prev, next) => {
    const prevSortMeta = fontSortOrderMap.get(getFontFamilyKey(prev.family)) ?? {
      order: LOCAL_FONT_FALLBACK_ORDER,
      label: prev.label
    };
    const nextSortMeta = fontSortOrderMap.get(getFontFamilyKey(next.family)) ?? {
      order: LOCAL_FONT_FALLBACK_ORDER,
      label: next.label
    };

    if (prevSortMeta.order !== nextSortMeta.order) {
      return prevSortMeta.order - nextSortMeta.order;
    }

    return prev.label.localeCompare(next.label, "zh-CN");
  });

  const availableKeys = new Set(available.map((item) => getFontFamilyKey(item.family)));
  const unavailable = candidates.filter((candidate) => {
    return !availableKeys.has(getFontFamilyKey(candidate.family));
  });

  return {
    candidates,
    available,
    unavailable,
    usableFamilies: available.map((item) => item.family)
  };
};

/**
 * 基于现有 canvas 探测逻辑生成异步返回结构。
 */
const getCanvasFallbackResult = (
  options: GetAvailableFontsOptions,
  fallbackReason: LocalFontsFallbackReason
): AvailableFontsAsyncResult => {
  const baseResult = getAvailableFonts(options);

  fontLogger.debug("canvas fallback result", {
    fallbackReason,
    candidateCount: baseResult.candidates.length,
    availableCount: baseResult.available.length,
    unavailableCount: baseResult.unavailable.length,
    usableFamilies: baseResult.usableFamilies
  });

  return {
    ...baseResult,
    source: "canvas-probe",
    fallbackReason
  };
};

/**
 * 调用 Local Font Access API 查询当前浏览器可访问的本地字体。
 */
const queryLocalFontsSafe = async (): Promise<LocalFontDataLike[]> => {
  const localFontsApi = (window as WindowWithLocalFonts).queryLocalFonts;

  if (!localFontsApi) {
    return [];
  }

  return localFontsApi();
};

/**
 * 生成用于 canvas 的 `font` 字符串片段。
 *
 * 这里始终给字体名称加双引号，确保带空格的字体名能被正确解析。
 */
const getCanvasFontValue = (family: string, fallbackFamily: string, fontSize: number): string => {
  return `${fontSize}px "${escapeFontFamily(family)}", ${fallbackFamily}`;
};

/**
 * 基于指定字体测量文本宽度。
 */
const measureTextWidth = (
  context: CanvasRenderingContext2D,
  font: string,
  sampleText: string
): number => {
  context.font = font;
  return context.measureText(sampleText).width;
};

/**
 * 创建 2D canvas 上下文。
 *
 * 如果环境不支持，则返回 null，由上层调用方做安全降级。
 */
const createCanvasContext = (): CanvasRenderingContext2D | null => {
  if (!isBrowserSupported()) {
    return null;
  }

  const canvas = document.createElement("canvas");
  return canvas.getContext("2d");
};

/**
 * 合并预置字体与自定义字体候选项，并按字体名去重。
 * @param options 选项
 * @returns 候选字体列表
 */
export const mergeFontCandidates = (options: GetAvailableFontsOptions = {}): FontCandidate[] => {
  const includePlatforms =
    options.includePlatforms ??
    (["windows", "macos", "linux", "cross-platform"] satisfies FontPresetPlatform[]);

  const mergedCandidates: FontCandidate[] = [];
  const usedKeys = new Set<string>();

  for (const platform of includePlatforms) {
    for (const item of COMMON_FONT_FAMILIES[platform]) {
      const normalizedFamily = normalizeFontFamily(item.family);
      const familyKey = getFontFamilyKey(normalizedFamily);

      if (!normalizedFamily || usedKeys.has(familyKey)) {
        continue;
      }

      usedKeys.add(familyKey);
      mergedCandidates.push({
        label: item.label,
        family: normalizedFamily,
        source: "preset",
        platform
      });
    }
  }

  for (const family of options.customFonts ?? []) {
    const normalizedFamily = normalizeFontFamily(family);
    const familyKey = getFontFamilyKey(normalizedFamily);

    if (!normalizedFamily || usedKeys.has(familyKey)) {
      continue;
    }

    usedKeys.add(familyKey);
    mergedCandidates.push({
      label: normalizedFamily,
      family: normalizedFamily,
      source: "custom",
      platform: "cross-platform"
    });
  }

  return mergedCandidates;
};

/**
 * 探测指定字体在当前浏览器环境中是否可能可用。
 *
 * 实现原理：
 * 1. 选取 `monospace`、`sans-serif`、`serif` 作为基准字体族
 * 2. 分别测量“仅基准字体”和“目标字体 + 基准字体 fallback”的文本宽度
 * 3. 只要任一基准下宽度发生变化，就认为目标字体大概率参与了渲染
 *
 * 注意边界：
 * - 这不是系统字体的官方枚举接口，只能视为“尽力探测”
 * - 少数情况下可能出现误判，例如不同字体宽度刚好接近
 * - 这个结果更适合用于“可用就显示，不可用就回退默认”的业务场景
 *
 * @param family 字体名称
 * @param options 探测选项
 * @returns 是否可用
 */
export const probeFontAvailability = (family: string, options: FontProbeOptions = {}): boolean => {
  const normalizedFamily = normalizeFontFamily(family);

  if (!normalizedFamily) {
    return false;
  }

  const context = createCanvasContext();

  if (!context) {
    return false;
  }

  const sampleText = options.sampleText ?? DEFAULT_SAMPLE_TEXT;
  const fontSize = options.fontSize ?? DEFAULT_FONT_SIZE;

  for (const baseFontFamily of BASE_FONT_FAMILIES) {
    const baseWidth = measureTextWidth(context, `${fontSize}px ${baseFontFamily}`, sampleText);
    const targetWidth = measureTextWidth(
      context,
      getCanvasFontValue(normalizedFamily, baseFontFamily, fontSize),
      sampleText
    );

    if (targetWidth !== baseWidth) {
      return true;
    }
  }

  return false;
};

/**
 * 获取当前浏览器环境下可用的字体列表。
 *
 * 返回值中的 `available` / `usableFamilies` 表示“探测通过”，
 * 不表示操作系统层面的绝对真实安装状态。
 *
 * @param options 选项
 * @returns 字体探测结果
 */
export const getAvailableFonts = (options: GetAvailableFontsOptions = {}): AvailableFontsResult => {
  const candidates = mergeFontCandidates(options);

  fontLogger.debug("getAvailableFonts:start", {
    candidateCount: candidates.length,
    candidates: candidates.map((candidate) => ({
      label: candidate.label,
      family: candidate.family,
      source: candidate.source,
      platform: candidate.platform
    })),
    sampleText: options.sampleText ?? DEFAULT_SAMPLE_TEXT,
    fontSize: options.fontSize ?? DEFAULT_FONT_SIZE
  });

  if (!isBrowserSupported()) {
    fontLogger.warn("getAvailableFonts:browser-unsupported");

    return {
      candidates,
      available: [],
      unavailable: candidates,
      usableFamilies: []
    };
  }

  const available: FontCandidate[] = [];
  const unavailable: FontCandidate[] = [];

  for (const candidate of candidates) {
    const matched = probeFontAvailability(candidate.family, options);

    fontLogger.debug("getAvailableFonts:probe-result", {
      label: candidate.label,
      family: candidate.family,
      matched
    });

    if (matched) {
      available.push(candidate);
      continue;
    }

    unavailable.push(candidate);
  }

  return {
    candidates,
    available,
    unavailable,
    usableFamilies: available.map((item) => item.family)
  };
};

/**
 * 使用 Local Font Access 进行渐进增强的异步可用字体获取。
 *
 * 执行策略：
 * 1. 若未启用 Local Font Access 增强，直接回退到 canvas 探测
 * 2. 若浏览器不支持 `queryLocalFonts()`，回退到 canvas 探测
 * 3. 若用户拒绝或调用失败，记录日志后回退到 canvas 探测
 * 4. 若调用成功，则以本地真实字体列表为主，并参考 `COMMON_FONT_FAMILIES` 排序
 *
 * 注意：
 * - 这是异步增强入口，不会替换现有同步 API
 * - 更适合在用户操作触发的时机调用，以满足权限与安全上下文要求
 *
 * @param options 异步字体获取选项
 * @returns 包含来源与降级原因的可用字体结果
 */
export const getAvailableFontsAsync = async (
  options: GetAvailableFontsAsyncOptions = {}
): Promise<AvailableFontsAsyncResult> => {
  const preferLocalFontsApi = options.preferLocalFontsApi ?? true;

  fontLogger.debug("getAvailableFontsAsync:start", {
    preferLocalFontsApi,
    hasLocalFontsApi: isLocalFontsApiSupported(),
    candidatePlatforms: options.includePlatforms,
    customFonts: options.customFonts
  });

  if (!preferLocalFontsApi) {
    fontLogger.debug("getAvailableFontsAsync:not-requested");
    return getCanvasFallbackResult(options, "not-requested");
  }

  if (!isBrowserSupported() || !isLocalFontsApiSupported()) {
    fontLogger.debug("getAvailableFontsAsync:unsupported");
    return getCanvasFallbackResult(options, "unsupported");
  }

  const candidates = mergeFontCandidates(options);

  try {
    const localFonts = await queryLocalFontsSafe();

    if (localFonts.length === 0) {
      logLocalFontsFallback("empty", localFonts);
      fontLogger.debug("getAvailableFontsAsync:empty -> fallback");
      return getCanvasFallbackResult(options, "empty");
    }

    const matchedResult = matchCandidatesWithLocalFonts(candidates, localFonts);

    fontLogger.debug("getAvailableFontsAsync:local-fonts-success", {
      localFontCount: localFonts.length,
      availableCount: matchedResult.available.length,
      unavailableCount: matchedResult.unavailable.length,
      usableFamilies: matchedResult.usableFamilies,
      localFonts: localFonts.map((font) => ({
        family: font.family,
        fullName: font.fullName,
        postscriptName: font.postscriptName,
        style: font.style
      }))
    });

    return {
      ...matchedResult,
      source: "local-fonts-api",
      fallbackReason: DEFAULT_ASYNC_FALLBACK_REASON
    };
  } catch (error) {
    if (isLocalFontsDeniedError(error)) {
      options.onLocalFontsDenied?.(error);
      logLocalFontsFallback("denied", error);
      fontLogger.debug("getAvailableFontsAsync:denied -> fallback");
      return getCanvasFallbackResult(options, "denied");
    }

    if (isLocalFontsSecurityError(error)) {
      logLocalFontsFallback("security", error);
      fontLogger.debug("getAvailableFontsAsync:security -> fallback");
      return getCanvasFallbackResult(options, "security");
    }

    logLocalFontsFallback("error", error);
    fontLogger.debug("getAvailableFontsAsync:error -> fallback", error);
    return getCanvasFallbackResult(options, "error");
  }
};

/**
 * 获取可直接用于 canvas 的字体值。
 * 如果没有可用字体，则返回 null，表示保持 canvas 默认字体。
 *
 * 典型用法：
 * ```ts
 * const canvasFont = pickCanvasFont(selectedFont, {
 *   fontSize: 16,
 *   fontWeight: 400,
 *   fontStyle: "normal"
 * });
 *
 * if (canvasFont) {
 *   ctx.font = canvasFont;
 * }
 * ```
 *
 * @param family 字体名称
 * @param options canvas 字体选项
 * @returns canvas 字体值或 null
 */
export const pickCanvasFont = (
  family: string | null | undefined,
  options: CanvasFontOptions
): string | null => {
  const normalizedFamily = normalizeFontFamily(family ?? "");

  if (!normalizedFamily) {
    return null;
  }

  if (!probeFontAvailability(normalizedFamily, { fontSize: options.fontSize })) {
    return null;
  }

  const fontParts = [options.fontStyle, options.fontWeight, `${options.fontSize}px`]
    .filter((item): item is string | number => item !== undefined && item !== null && item !== "")
    .map((item) => `${item}`);

  const fallbackFamily = options.fallbackFamily?.trim() || "sans-serif";

  return `${fontParts.join(" ")} "${escapeFontFamily(normalizedFamily)}", ${fallbackFamily}`;
};

/**
 * 将可用字体结果转换为下拉选项。
 *
 * 默认会插入一个“默认字体”选项，value 为 `default`，
 * 便于业务层将其明确识别为“使用 canvas 默认字体”。
 *
 * @param result 可用字体结果
 * @param includeDefaultOption 是否包含默认选项
 * @returns 下拉选项列表
 */
export const toFontSelectOptions = (
  result: AvailableFontsResult,
  includeDefaultOption = true
): FontSelectOption[] => {
  const options: FontSelectOption[] = [];

  if (includeDefaultOption) {
    options.push({
      label: "默认字体",
      value: "default",
      source: "default"
    });
  }

  for (const font of result.available) {
    options.push({
      label: font.label,
      value: font.family,
      source: font.source,
      platform: font.platform
    });
  }

  return options;
};
