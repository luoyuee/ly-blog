import type { ZodType } from "zod";
import { isEmpty, cloneDeep } from "es-toolkit/compat";
import { useRoute, useRouter } from "vue-router";
import { createLogger } from "@/utils/logger";
import { computed, shallowRef } from "vue";

const logger = createLogger("useQueryParams");

interface UseQueryParamsOptions<T> {
  /** 是否在初始化时清除当前 URL 的全部 query 参数 */
  clearQuery?: boolean;
  /** 传入 zod schema 后会自动对 query 执行安全解析，返回 parsedData 与 parseError */
  schema?: ZodType<T>;
}

/**
 * 读取当前 URL query 参数，支持 zod schema 安全解析与原地清除
 *
 * 当 `clearQuery` 为 `true` 时，会在初始化时拍一份 query 快照，
 * 然后清空 URL query；所有返回值（query / parsedData / parseError）
 * 均基于快照计算，不受 URL 清空影响。
 *
 * @param options - 配置选项
 * @returns query - 当前 URL query 的响应式引用（clearQuery 时为快照，否则为实时）
 * @returns parsedData - schema 解析后的数据，解析失败或未传 schema 时为 null
 * @returns parseError - schema 解析失败的错误信息，解析成功或未传 schema 时为 null
 *
 * @example 仅读取 query（实时响应 URL 变化）
 * ```ts
 * const { query } = useQueryParams();
 * // query.value = { id: '123', tab: 'detail' }
 * ```
 *
 * @example 传入 zod schema 自动解析
 * ```ts
 * const schema = z.object({ id: z.string(), tab: z.string().optional() });
 * const { parsedData, parseError } = useQueryParams({ schema });
 * // parsedData.value = { id: '123', tab: 'detail' }  (解析成功)
 * // parseError.value = null
 * // 或
 * // parsedData.value = null  (解析失败)
 * // parseError.value = ZodError { ... }
 * ```
 *
 * @example 读取后清除 URL query（数据不受清空影响）
 * ```ts
 * const { query, parsedData } = useQueryParams({ clearQuery: true, schema });
 * // URL 从 /page?id=123 变为 /page
 * // 但 query.value / parsedData.value 仍持有原始数据
 * ```
 */
export const useQueryParams = <T = unknown>(options?: UseQueryParamsOptions<T>) => {
  const router = useRouter();
  const route = useRoute();

  // clearQuery 场景：拍快照，清空 URL 后数据不受影响
  // 非 clearQuery 场景：实时响应 route.query 变化
  const snapshotQuery = shallowRef(options?.clearQuery ? cloneDeep(route.query) : undefined);
  const liveQuery = computed(() => route.query);

  // 根据 clearQuery 决定 query 数据源
  const query = options?.clearQuery ? snapshotQuery : liveQuery;

  logger.debug("初始化", { query: query.value, options });

  // 清除当前 URL 的全部 query
  if (options?.clearQuery) {
    logger.debug("清除 URL query", { path: route.path });
    router.replace({ path: route.path });
  }

  // 若传入 zod schema，对 query 数据源执行安全解析（不抛异常）
  const parseResult = computed(() => {
    if (!options?.schema || isEmpty(query.value)) {
      return null;
    }
    return options.schema.safeParse(query.value);
  });

  // 解析失败的错误信息，未传 schema 或解析成功时为 null
  const parseError = computed(() => parseResult.value?.error ?? null);

  // 解析后的数据，解析失败或未传 schema 时为 null
  const parsedData = computed<T | null>(() => {
    if (parseResult.value === null) {
      return null;
    }

    if (parseResult.value.success) {
      logger.debug("解析成功，返回数据", parseResult.value.data);
      return parseResult.value.data;
    } else {
      logger.debug("解析失败", parseResult.value?.error);
    }

    return null;
  });

  return { query, parsedData, parseError };
};
