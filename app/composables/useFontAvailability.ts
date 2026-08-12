import type { MaybeRefOrGetter, Ref } from "vue";
import type {
  AvailableFontsAsyncResult,
  AvailableFontsResult,
  FontPresetPlatform,
  FontSelectOption,
  GetAvailableFontsAsyncOptions,
  LocalFontsFallbackReason,
  AvailableFontsSource
} from "@/utils/font";
import { computed, ref, shallowRef, toValue, watch } from "vue";
import { useLogger } from "@/composables/useLogger";
import { getAvailableFontsAsync, mergeFontCandidates, toFontSelectOptions } from "@/utils/font";

const fontLogger = useLogger();

/**
 * 解析指定 DOM 的默认字体族。
 *
 * @param target 目标元素；不传时回退到根文档节点
 * @param fallback 无法读取时的兜底字体族，默认 `sans-serif`
 * @returns 当前环境下可用的字体族
 */
export const resolveDefaultFontFamily = (
  target?: HTMLElement | null,
  fallback = "sans-serif"
): string => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fallback;
  }

  const element = target ?? document.documentElement;

  if (!element) {
    return fallback;
  }

  return getComputedStyle(element).fontFamily || fallback;
};

type UseFontAvailabilityOptions = {
  customFonts?: MaybeRefOrGetter<string[] | undefined>;
  uploadedFonts?: MaybeRefOrGetter<string[] | undefined>;
  includePlatforms?: MaybeRefOrGetter<FontPresetPlatform[] | undefined>;
  sampleText?: MaybeRefOrGetter<string | undefined>;
  fontSize?: MaybeRefOrGetter<number | undefined>;
  includeDefaultOption?: MaybeRefOrGetter<boolean | undefined>;
  /**
   * 静默刷新时是否优先尝试 Local Font Access。
   *
   * 默认关闭，避免在自动 watch / immediate 刷新链路中意外触发权限相关行为。
   * 若业务需要显式请求本地字体权限，请调用 `requestLocalFonts()`。
   */
  preferLocalFontsApi?: MaybeRefOrGetter<boolean | undefined>;
  onLocalFontsDenied?: (error: unknown) => void;
};

type UseFontAvailabilityReturn = {
  result: Ref<AvailableFontsAsyncResult>;
  candidates: Readonly<Ref<AvailableFontsResult["candidates"]>>;
  availableFonts: Readonly<Ref<AvailableFontsResult["available"]>>;
  unavailableFonts: Readonly<Ref<AvailableFontsResult["unavailable"]>>;
  usableFamilies: Readonly<Ref<AvailableFontsResult["usableFamilies"]>>;
  fontOptions: Readonly<Ref<FontSelectOption[]>>;
  loading: Readonly<Ref<boolean>>;
  isReady: Readonly<Ref<boolean>>;
  source: Readonly<Ref<AvailableFontsSource>>;
  fallbackReason: Readonly<Ref<LocalFontsFallbackReason>>;
  /**
   * 静默刷新字体结果。
   *
   * 默认只做安全降级链路，不主动触发本地字体权限请求。
   */
  refresh: () => Promise<AvailableFontsAsyncResult>;
  /**
   * 显式请求本地字体访问权限并刷新结果。
   *
   * 该方法应尽量放在按钮点击等用户手势触发的时机调用。
   */
  requestLocalFonts: () => Promise<AvailableFontsAsyncResult>;
};

const createEmptyResult = (): AvailableFontsAsyncResult => ({
  candidates: [],
  available: [],
  unavailable: [],
  usableFamilies: [],
  source: "canvas-probe",
  fallbackReason: "not-requested"
});

/**
 * 管理字体候选源与可用字体列表。
 *
 * 适用场景：
 * - 页面内置一组常用字体，进入页面后探测当前浏览器可用字体
 * - 用户输入自定义字体后，需要自动刷新字体下拉选项
 * - 未来支持上传字体文件后，将已注册的字体名并入可用字体列表
 *
 * 设计说明：
 * - 字体探测与候选合并仍保留在 `utils/font.ts`，这里仅负责 Vue 响应式接入。
 * - `customFonts`、`uploadedFonts`、`includePlatforms` 支持普通值、`ref`、`computed` 或 getter。
 * - 自动刷新默认只走静默链路，不主动触发本地字体权限请求。
 * - 若业务需要枚举浏览器可访问的本地字体，应在用户点击等显式手势中调用 `requestLocalFonts()`。
 * - 内部采用 latest-wins 策略，避免多个异步刷新并发完成后用旧结果覆盖新结果。
 *
 * @example
 * ```ts
 * import { ref } from "vue";
 * import { useFontAvailability } from "@/composables/useFontAvailability";
 *
 * const customFonts = ref<string[]>([]);
 * const uploadedFonts = ref<string[]>([]);
 *
 * const {
 *   fontOptions,
 *   usableFamilies,
 *   loading,
 *   isReady,
 *   source,
 *   fallbackReason,
 *   refresh,
 *   requestLocalFonts
 * } = useFontAvailability({
 *   customFonts,
 *   uploadedFonts,
 *   onLocalFontsDenied: (error) => {
 *     console.warn("用户拒绝本地字体访问权限", error);
 *   }
 * });
 *
 * // 页面初始化或用户输入变化后，composable 会自动走静默刷新。
 * // 如果需要显式请求本机字体访问权限，应放在按钮点击等用户手势中调用：
 * const handleReadLocalFonts = async () => {
 *   await requestLocalFonts();
 * };
 * ```
 *
 * @param options 字体来源与探测选项
 * @returns 响应式字体状态与手动刷新方法
 */
export function useFontAvailability(
  options: UseFontAvailabilityOptions = {}
): UseFontAvailabilityReturn {
  const result = shallowRef<AvailableFontsAsyncResult>(createEmptyResult());
  const loading = ref(false);
  const isReady = ref(false);
  const localFontsAccessDenied = ref(false);
  let requestVersion = 0;

  const resolvedCustomFonts = computed(() => toValue(options.customFonts) ?? []);
  const resolvedUploadedFonts = computed(() => toValue(options.uploadedFonts) ?? []);
  const resolvedIncludePlatforms = computed(() => toValue(options.includePlatforms));
  const resolvedSampleText = computed(() => toValue(options.sampleText));
  const resolvedFontSize = computed(() => toValue(options.fontSize));
  const resolvedPreferLocalFontsApi = computed(() => toValue(options.preferLocalFontsApi) ?? false);
  const resolvedIncludeDefaultOption = computed(
    () => toValue(options.includeDefaultOption) ?? true
  );

  const mergedCustomFonts = computed(() => {
    return [...resolvedCustomFonts.value, ...resolvedUploadedFonts.value];
  });

  const getResolvedOptions = (preferLocalFontsApi: boolean): GetAvailableFontsAsyncOptions => ({
    customFonts: mergedCustomFonts.value,
    includePlatforms: resolvedIncludePlatforms.value,
    sampleText: resolvedSampleText.value,
    fontSize: resolvedFontSize.value,
    preferLocalFontsApi,
    onLocalFontsDenied: options.onLocalFontsDenied
  });

  const runRefresh = async (preferLocalFontsApi: boolean): Promise<AvailableFontsAsyncResult> => {
    requestVersion += 1;
    const currentRequestVersion = requestVersion;

    fontLogger.debug("runRefresh:start", {
      requestVersion: currentRequestVersion,
      preferLocalFontsApi,
      localFontsAccessDenied: localFontsAccessDenied.value,
      customFonts: resolvedCustomFonts.value,
      uploadedFonts: resolvedUploadedFonts.value,
      includePlatforms: resolvedIncludePlatforms.value
    });

    loading.value = true;

    try {
      const nextResult = await getAvailableFontsAsync(
        getResolvedOptions(preferLocalFontsApi && !localFontsAccessDenied.value)
      );

      fontLogger.debug("runRefresh:result", {
        requestVersion: currentRequestVersion,
        source: nextResult.source,
        fallbackReason: nextResult.fallbackReason,
        availableCount: nextResult.available.length,
        unavailableCount: nextResult.unavailable.length,
        usableFamilies: nextResult.usableFamilies,
        available: nextResult.available.map((font) => ({
          label: font.label,
          family: font.family
        }))
      });

      if (nextResult.fallbackReason === "denied" || nextResult.fallbackReason === "empty") {
        localFontsAccessDenied.value = true;
        fontLogger.debug("localFontsAccessDenied:set-true", {
          fallbackReason: nextResult.fallbackReason
        });
      }

      if (currentRequestVersion === requestVersion) {
        result.value = nextResult;
        isReady.value = true;

        fontLogger.debug("runRefresh:committed", {
          requestVersion: currentRequestVersion,
          source: result.value.source,
          fallbackReason: result.value.fallbackReason,
          availableCount: result.value.available.length,
          usableFamilies: result.value.usableFamilies
        });
      } else {
        fontLogger.debug("runRefresh:stale-result-ignored", {
          requestVersion: currentRequestVersion,
          latestRequestVersion: requestVersion
        });
      }

      return nextResult;
    } finally {
      if (currentRequestVersion === requestVersion) {
        loading.value = false;
      }
    }
  };

  const refresh = async (): Promise<AvailableFontsAsyncResult> => {
    fontLogger.debug("refresh");
    return runRefresh(resolvedPreferLocalFontsApi.value);
  };

  const requestLocalFonts = async (): Promise<AvailableFontsAsyncResult> => {
    fontLogger.debug("requestLocalFonts", {
      localFontsAccessDenied: localFontsAccessDenied.value
    });

    if (localFontsAccessDenied.value) {
      return runRefresh(false);
    }

    return runRefresh(true);
  };

  watch(
    [
      resolvedCustomFonts,
      resolvedUploadedFonts,
      resolvedIncludePlatforms,
      resolvedSampleText,
      resolvedFontSize,
      resolvedPreferLocalFontsApi
    ],
    () => {
      void refresh();
    },
    { immediate: true, deep: true }
  );

  const candidates = computed(() => {
    return mergeFontCandidates(getResolvedOptions(resolvedPreferLocalFontsApi.value));
  });
  const availableFonts = computed(() => result.value.available);
  const unavailableFonts = computed(() => result.value.unavailable);
  const usableFamilies = computed(() => result.value.usableFamilies);
  const source = computed(() => result.value.source);
  const fallbackReason = computed(() => result.value.fallbackReason);
  const fontOptions = computed(() => {
    const options = toFontSelectOptions(result.value, resolvedIncludeDefaultOption.value);

    fontLogger.debug("fontOptions", {
      source: result.value.source,
      fallbackReason: result.value.fallbackReason,
      optionCount: options.length,
      options: options.map((option) => ({
        label: option.label,
        value: option.value,
        source: option.source
      }))
    });

    return options;
  });

  return {
    result,
    candidates,
    availableFonts,
    unavailableFonts,
    usableFamilies,
    fontOptions,
    loading,
    isReady,
    source,
    fallbackReason,
    refresh,
    requestLocalFonts
  };
}
