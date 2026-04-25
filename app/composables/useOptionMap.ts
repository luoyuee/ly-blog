import type { MaybeRefOrGetter, ShallowRef } from "vue";
import { shallowRef, toValue, watchEffect } from "vue";

/** 可作为 Map key 的选项值类型 */
type OptionValue = string | number | boolean | null | undefined;

/** useOptionMap 基础配置类型 */
type UseOptionMapBaseOptions<
  T extends Record<string, unknown>,
  K extends keyof T
> = {
  valueKey?: K;
};

/** useOptionMap 仅 valueKey 配置 */
type UseOptionMapValueOptions<
  T extends Record<string, unknown>,
  K extends keyof T
> = UseOptionMapBaseOptions<T, K> & {
  labelKey?: undefined;
};

/** useOptionMap 含 labelKey 配置 */
type UseOptionMapLabelOptions<
  T extends Record<string, unknown>,
  K extends keyof T,
  L extends keyof T
> = UseOptionMapBaseOptions<T, K> & {
  labelKey: L;
};

/** useOptionMap 无 labelKey + defaultValue 配置 */
type UseOptionMapValueDefaultOptions<
  T extends Record<string, unknown>,
  K extends keyof T,
  D
> = UseOptionMapValueOptions<T, K> & {
  defaultValue: D;
};

/** useOptionMap 含 labelKey + defaultValue 配置 */
type UseOptionMapLabelDefaultOptions<
  T extends Record<string, unknown>,
  K extends keyof T,
  L extends keyof T,
  D
> = UseOptionMapLabelOptions<T, K, L> & {
  defaultValue: D;
};

/** 根据 labelKey 决定 get 返回的是字段值还是整项数据 */
type OptionResult<
  T extends Record<string, unknown>,
  L extends keyof T | undefined
> = L extends keyof T ? T[L] : T;

/** 内部维护的值映射表 */
type OptionMap<
  T extends Record<string, unknown>,
  L extends keyof T | undefined
> = Map<OptionValue, OptionResult<T, L>>;

/** 对外暴露的响应式映射表 */
type OptionMapRef<
  T extends Record<string, unknown>,
  L extends keyof T | undefined
> = ShallowRef<OptionMap<T, L>>;

/**
 * 根据选项列表创建一个“值 => 标签 / 原始项”的映射工具。
 *
 * 适用场景：
 * - 下拉选项值转标签
 * - 表格字段值转显示文案
 * - 根据字典 value 快速获取整项数据或指定字段
 *
 * 支持的数据源：
 * - 普通数组
 * - `ref` / `computed` / getter 返回的响应式数组
 *
 * 返回值规则由 `labelKey` 和 `defaultValue` 共同决定：
 * 1. 不传 `labelKey`、不传 `defaultValue` => `T | null`
 * 2. 传 `labelKey`、不传 `defaultValue` => `T[L] | null`
 * 3. 不传 `labelKey`、传 `defaultValue` => `T | D`
 * 4. 传 `labelKey` 和 `defaultValue` => `T[L] | D`
 *
 * 设计说明：
 * - 这里使用 4 组显式重载，而不是复杂条件泛型。
 * - 好处是调用时返回类型更直观，报错信息也更容易理解。
 * - `data` 使用 `MaybeRefOrGetter<T[]>`，统一兼容普通值和响应式来源。
 * - `extraData` 使用 `shallowRef`，避免泛型对象被 Vue 深层解包后污染类型。
 * - `watchEffect` 会在初始化时立即执行一次，并自动追踪 `data` 与 `extraData.value`，
 *   只要这两者发生变化，就会重新构建内部映射表并同步更新对外的 `mapRef`。
 *
 * @example
 * // 示例 1：不传 labelKey，不传 defaultValue
 * const { get: getArchiveItem } = useOptionMap([
 *   { value: 1, label: "案卷", code: "AJ" },
 *   { value: 2, label: "文件", code: "WJ" }
 * ]);
 *
 * getArchiveItem(1);
 * // 返回类型：{ value: number; label: string; code: string } | null
 *
 * @example
 * // 示例 2：传 labelKey，不传 defaultValue
 * const { get: getStatusLabel } = useOptionMap(
 *   [
 *     { value: 0, label: "禁用" },
 *     { value: 1, label: "启用" }
 *   ],
 *   {
 *     labelKey: "label"
 *   }
 * );
 *
 * getStatusLabel(1);
 * // 返回类型：string | null
 *
 * @example
 * // 示例 3：不传 labelKey，传 defaultValue
 * const { get: getArchiveItemOrFallback } = useOptionMap(
 *   [{ value: 1, label: "案卷" }],
 *   {
 *     defaultValue: "未匹配到选项"
 *   }
 * );
 *
 * getArchiveItemOrFallback(99);
 * // 返回类型：{ value: number; label: string } | string
 *
 * @example
 * // 示例 4：传 labelKey 和 defaultValue
 * const remoteOptions = computed(() => {
 *   return apiData.value.map((item) => ({
 *     id: item.dictValue,
 *     name: item.dictLabel
 *   }));
 * });
 *
 * const { get: getRemoteLabel, add } = useOptionMap(remoteOptions, {
 *   valueKey: "id",
 *   labelKey: "name",
 *   defaultValue: "--"
 * });
 *
 * add([{ id: "custom", name: "自定义" }]);
 * getRemoteLabel("custom");
 * // 返回类型：string
 */
type UseOptionMapReturn<
  T extends Record<string, unknown>,
  K extends keyof T,
  L extends keyof T | undefined,
  R
> = {
  mapRef: OptionMapRef<T, L>;
  get: (value: T[K]) => R;
  add: (list: T[]) => void;
};

export function useOptionMap<
  T extends Record<string, unknown>,
  K extends keyof T = "value" extends keyof T ? "value" : keyof T
>(
  data: MaybeRefOrGetter<T[]>,
  options?: UseOptionMapValueOptions<T, K>
): UseOptionMapReturn<T, K, undefined, T | null>;

export function useOptionMap<
  T extends Record<string, unknown>,
  K extends keyof T = "value" extends keyof T ? "value" : keyof T,
  L extends keyof T = keyof T
>(
  data: MaybeRefOrGetter<T[]>,
  options: UseOptionMapLabelOptions<T, K, L>
): UseOptionMapReturn<T, K, L, T[L] | null>;

export function useOptionMap<
  T extends Record<string, unknown>,
  K extends keyof T = "value" extends keyof T ? "value" : keyof T,
  D = null
>(
  data: MaybeRefOrGetter<T[]>,
  options: UseOptionMapValueDefaultOptions<T, K, D>
): UseOptionMapReturn<T, K, undefined, T | D>;

export function useOptionMap<
  T extends Record<string, unknown>,
  K extends keyof T = "value" extends keyof T ? "value" : keyof T,
  L extends keyof T = keyof T,
  D = null
>(
  data: MaybeRefOrGetter<T[]>,
  options: UseOptionMapLabelDefaultOptions<T, K, L, D>
): UseOptionMapReturn<T, K, L, T[L] | D>;

export function useOptionMap<
  T extends Record<string, unknown>,
  K extends keyof T = "value" extends keyof T ? "value" : keyof T,
  L extends keyof T | undefined = undefined,
  D = null
>(
  data: MaybeRefOrGetter<T[]>,
  options?:
    | UseOptionMapValueOptions<T, K>
    | UseOptionMapLabelOptions<T, K, Extract<L, keyof T>>
    | UseOptionMapValueDefaultOptions<T, K, D>
    | UseOptionMapLabelDefaultOptions<T, K, Extract<L, keyof T>, D>
) {
  const valueKey = (options?.valueKey ?? "value") as K;
  const labelKey = options?.labelKey as L;
  const defaultValue = (options && "defaultValue" in options
    ? options.defaultValue
    : null) as OptionResult<T, L> | D | null;

  // 通过 add() 追加的补充数据。
  // 这里使用 shallowRef，避免 T 被 Vue 深层解包成 UnwrapRefSimple<T>，
  // 否则和原始 data 的 T[] 合并时会出现类型不一致。
  const extraData: ShallowRef<T[]> = shallowRef([]);

  // 当前生效的内部映射表：key 是选项值，value 是标签或原始项。
  const map: OptionMap<T, L> = new Map();

  // 对外暴露的响应式映射表。
  // 每次内部 map 重建完成后，都会整体替换 mapRef.value，确保外部可以稳定追踪变更。
  const mapRef: OptionMapRef<T, L> = shallowRef(new Map());

  // 将单项数据写入映射表。
  // - valueKey 决定用哪个字段作为索引键
  // - labelKey 存在时返回该字段
  // - labelKey 不存在时返回整项数据
  const setItem = (targetMap: OptionMap<T, L>, item: T) => {
    const value = item[valueKey] as OptionValue;
    const result = labelKey ? item[labelKey] : item;

    targetMap.set(value, result as OptionResult<T, L>);
  };

  // watchEffect 会先执行一次完成初始化，随后自动追踪 effect 中读取到的响应式依赖。
  // 这里依赖的是 toValue(data) 和 extraData.value，因此主数据或追加数据变化时会自动重建 map。
  // 这里采用“先 clear，再全量重建”的策略，逻辑比增量维护更稳定，也更容易保证结果一致。
  watchEffect(() => {
    map.clear();

    [...toValue(data), ...extraData.value].forEach((item) => {
      setItem(map, item);
    });

    mapRef.value = new Map(map);
  });

  // 根据 value 获取映射结果；如果不存在则返回 defaultValue。
  // 当调用方未传 defaultValue 时，这里的默认回退值是 null。
  const get = (value: T[K]) => {
    return map.get(value as OptionValue) ?? defaultValue;
  };

  // 追加额外选项。
  // 由于 watchEffect 内部依赖了 extraData.value，push 后会触发重新构建 map。
  const add = (list: T[]) => {
    extraData.value.push(...list);
  };

  return {
    mapRef,
    get,
    add
  };
};
