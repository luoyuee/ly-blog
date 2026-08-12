import type { UseStorageOptions } from "@vueuse/core";
import type { MaybeRefOrGetter, Ref } from "vue";
import { useLocalStorage as useVueuseLocalStorage } from "@vueuse/core";
import { computed, onUnmounted, ref, toValue, watch } from "vue";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import { del as deleteIDBKeyval } from "idb-keyval";

type LocalStorageOptions<T> = UseStorageOptions<T> & {
  /**
   * 组件卸载时是否自动删除当前 key 的持久化缓存。
   *
   * 适合临时草稿、一次性向导等场景；删除只影响底层存储，不会在卸载前额外改写当前内存状态。
   */
  removeOnUnmount?: boolean;
};

type UseLocalStorageReturn<T> = {
  /**
   * 持久化状态本体。
   *
   * 对外始终先暴露调用方传入的初始值；如果当前实例选择的是异步存储层，
   * 则会在首次恢复完成后再切换为缓存值。
   *
   * 这里刻意不再把操作方法挂到 ref 上，避免模板自动解包时把业务字段、状态字段和方法混在同一层级。
   */
  state: Ref<T>;
  /**
   * 删除当前 key 对应的持久化缓存，但不修改当前内存状态。
   *
   * 后续如果继续修改当前 ref，watch 会再次写入缓存；因此它表达的是“删除一次缓存”，
   * 而不是“停止持久化”。
   */
  removeStorage: () => Promise<void>;
  /**
   * 恢复为本次调用传入的初始值，并立即写回当前使用的存储层。
   *
   * 与项目里的 `useForm.resetForm` 类似，适合“恢复默认配置”“清空草稿后重建默认值”等场景。
   */
  reset: () => Promise<void>;
  /**
   * 当前运行环境是否支持 IndexedDB。
   *
   * 它描述的是“环境能力”，不是当前实例最终选择的数据源。
   * 业务层可以用它展示能力提示，例如“当前浏览器支持 IndexedDB”。
   */
  isSupported: Readonly<Ref<boolean>>;
  /**
   * 当前实例是否选择 IndexedDB 作为唯一存储源。
   *
   * 该值在初始化阶段就会确定，之后不会在 localStorage 和 IndexedDB 之间切换。
   */
  isPersistent: Readonly<Ref<boolean>>;
  /**
   * 首次读取持久化数据是否完成。
   *
   * 该字段始终存在：
   * - 同步存储源（如 localStorage）会在初始化阶段立即进入 ready
   * - 异步存储源（如 IndexedDB）会在首次恢复完成后进入 ready
   *
   * 在 ready 之前，`state` 对外保持为调用方传入的初始值。
   */
  isReady: Readonly<Ref<boolean>>;
};

/**
 * 检查当前环境是否能使用 IndexedDB。
 *
 * SSR 或测试环境中可能不存在 `window`，因此访问前需要先做环境判断。
 */
const isIndexedDBSupported = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return typeof window.indexedDB !== "undefined";
};

const cloneInitialValue = <T>(value: T): T => {
  if (value === null || typeof value !== "object") {
    return value;
  }

  try {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }
  } catch {
    // structuredClone 不支持函数等值，继续尝试 JSON 兜底。
  }

  return JSON.parse(JSON.stringify(value)) as T;
};

/**
 * 写入前统一走 JSON 序列化语义，和 localStorage 降级路径保持一致。
 *
 * 本组合式函数只面向 JSON-compatible 数据；复杂对象不在这里做额外兼容处理。
 */
const toStorageValue = <T>(value: T): T => {
  const serializedValue = JSON.stringify(value);

  if (serializedValue === undefined) {
    return value;
  }

  return JSON.parse(serializedValue) as T;
};

const getLocalStorage = <T>(options?: UseStorageOptions<T>): Storage | undefined => {
  if (options?.window) {
    return options.window.localStorage;
  }

  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
};

export function useLocalStorage(
  key: MaybeRefOrGetter<string>,
  initialValue: MaybeRefOrGetter<string>,
  options?: LocalStorageOptions<string>
): UseLocalStorageReturn<string>;

export function useLocalStorage(
  key: MaybeRefOrGetter<string>,
  initialValue: MaybeRefOrGetter<boolean>,
  options?: LocalStorageOptions<boolean>
): UseLocalStorageReturn<boolean>;

export function useLocalStorage(
  key: MaybeRefOrGetter<string>,
  initialValue: MaybeRefOrGetter<number>,
  options?: LocalStorageOptions<number>
): UseLocalStorageReturn<number>;

export function useLocalStorage<T = unknown>(
  key: MaybeRefOrGetter<string>,
  initialValue: MaybeRefOrGetter<T> | MaybeRefOrGetter<null>,
  options?: LocalStorageOptions<T>
): UseLocalStorageReturn<T>;

export function useLocalStorage<T = unknown>(
  key: MaybeRefOrGetter<string>,
  initialValue: MaybeRefOrGetter<T>,
  options?: LocalStorageOptions<T>
): UseLocalStorageReturn<T> {
  /**
   * 与 VueUse 保持一致：`key` 支持 ref/getter/plain value。
   *
   * 当前实例会在初始化阶段一次性决定存储后端，后续所有读取、写入、删除和重置
   * 都只针对这个已选中的后端执行，不再在 localStorage 和 IndexedDB 之间切换。
   */
  const storageKey = computed(() => toValue(key));
  const defaultValue = computed(() => cloneInitialValue(toValue(initialValue)));
  const useIndexedDB = isIndexedDBSupported();
  const localStorageRef = useIndexedDB
    ? undefined
    : useVueuseLocalStorage(storageKey, initialValue, options);

  const isSupported = ref(useIndexedDB);
  const isReady = ref(!useIndexedDB);
  let stopStateWatcher: (() => void) | undefined;
  // 在准备完成前或没有缓存值时，对外先保持调用方传入的初始值。
  const state = ref(defaultValue.value) as Ref<T>;

  /**
   * VueUse `useLocalStorage` 的 serializer.write 返回字符串，
   * `useIDBKeyval` 的 serializer.write 返回 unknown。
   *
   * 这里复用同一个 `options.serializer`，保持调用参数与 VueUse 接近，
   * 同时把 IDB 读出的 unknown 转成字符串后交给 storage serializer 解析。
   */
  const idbSerializer = options?.serializer
    ? {
        read: (raw: unknown) => options.serializer!.read(String(raw)),
        write: (value: T) => options.serializer!.write(toStorageValue(value))
      }
    : undefined;

  /**
   * IndexedDB 是增强存储层：容量更大、适合复杂对象。
   *
   * 可复用的 options 只透传两边都能理解的字段；`mergeDefaults`、
   * `listenToStorageChanges`、`initOnMounted` 属于 useStorage/localStorage 语义，
   * 不传给 useIDBKeyval，避免制造不存在的行为预期。
   *
   * 只有在当前实例已经确定选择 IndexedDB 时，才会创建这条存储通道。
   */
  const idb = useIndexedDB
    ? useIDBKeyval<T>(storageKey.value, toValue(initialValue), {
        deep: options?.deep,
        flush: options?.flush,
        shallow: options?.shallow,
        writeDefaults: options?.writeDefaults,
        serializer: idbSerializer,
        onError: options?.onError
      })
    : undefined;

  /**
   * 与 VueUse 默认行为保持一致：调用方提供 onError 时交给调用方处理，
   * 否则输出到 console，避免静默吞掉持久化失败。
   */
  const handleError = (error: unknown) => {
    if (options?.onError) {
      options.onError(error);
      return;
    }

    console.error(error);
  };

  /**
   * 根据初始化时已经确定的数据源写入底层存储。
   *
   * 这里不再做“能力探测后切换数据源”，而是始终写回当前实例选中的唯一后端。
   */
  const persistState = async (value: T) => {
    const storageValue = toStorageValue(value);

    if (useIndexedDB) {
      await idb?.set(storageValue);
      return;
    }

    if (localStorageRef) {
      localStorageRef.value = storageValue;
    }
  };

  const stopPersistStateWatcher = () => {
    stopStateWatcher?.();
    stopStateWatcher = undefined;
  };

  const startPersistStateWatcher = () => {
    stopPersistStateWatcher();

    stopStateWatcher = watch(
      state,
      (newVal) => {
        if (useIndexedDB && !isReady.value) {
          // 异步后端尚未完成首次恢复前，保持外部初始值，不把占位值提前写回缓存。
          return;
        }

        persistState(newVal).catch(handleError);
      },
      {
        deep: options?.deep ?? true,
        flush: options?.flush
      }
    );
  };

  /**
   * 用当前实例选中的唯一数据源回填状态。
   *
   * 回填前临时停止持久化 watcher，避免把刚读出的值再次写回；赋值后立即恢复，
   * 因此同一 tick 中后续业务修改仍会正常触发持久化。
   */
  const syncState = (value: T) => {
    stopPersistStateWatcher();
    state.value = value;
    startPersistStateWatcher();
  };

  const reset = async () => {
    const value = toStorageValue(defaultValue.value);

    syncState(value);
    await persistState(value);
  };

  const removeStorage = async () => {
    if (useIndexedDB) {
      await deleteIDBKeyval(storageKey.value);
      return;
    }

    getLocalStorage(options)?.removeItem(storageKey.value);
  };

  if (!useIndexedDB && localStorageRef) {
    // 同步存储源在初始化阶段即可完成首次恢复，因此立即进入 ready。
    syncState(localStorageRef.value);

    watch(
      localStorageRef,
      (newVal) => {
        syncState(newVal);
      },
      {
        deep: options?.deep ?? true,
        flush: options?.flush
      }
    );
  }

  if (useIndexedDB && idb) {
    watch(
      idb.data,
      (newVal) => {
        if (!isReady.value) {
          return;
        }

        syncState(newVal);
      },
      {
        deep: options?.deep ?? true,
        flush: options?.flush
      }
    );
  }

  startPersistStateWatcher();

  if (useIndexedDB && idb) {
    const stop = watch(
      idb.isFinished,
      (newVal) => {
        if (!newVal) {
          return;
        }

        // 异步存储源完成首次恢复后，才把缓存值暴露给业务层并标记 ready。
        syncState(idb.data.value);
        isReady.value = true;
        stop();
      },
      {
        immediate: true
      }
    );
  }

  onUnmounted(() => {
    if (!options?.removeOnUnmount) {
      return;
    }

    removeStorage().catch(handleError);
  });

  /**
   * 返回对象结构，明确区分“持久化数据 ref”和“控制方法/状态”。
   *
   * 这样调用方可以 `const { state } = useLocalStorage(...)`，避免把 reset、isReady 等字段
   * 与业务数据字段混在同一个响应式对象层级里；同时也让 `isReady`、`isPersistent`
   * 等状态的语义保持独立清晰。
   */
  return {
    state,
    removeStorage,
    reset,
    isSupported: computed(() => isSupported.value),
    isPersistent: computed(() => isSupported.value),
    isReady: computed(() => isReady.value)
  };
}
