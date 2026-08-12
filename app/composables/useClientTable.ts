import type { ComputedRef, Ref } from "vue";
import { computed, reactive, ref, shallowReactive, shallowRef, watch } from "vue";

/** 支持普通 ref 和 computed ref，便于把搜索结果继续交给分页能力处理 */
type MaybeReadonlyRef<T> = Ref<T> | ComputedRef<T>;

/** 异步加载客户端表格全量数据 */
export type ClientTableLoader<T extends object> = () => Promise<T[]>;

/** useClientTableData 配置项 */
export type UseClientTableDataOptions<T extends object> = {
  /** 固定数据加载函数；配置后可直接调用 reload() */
  loader?: ClientTableLoader<T>;
  /** 数据加载成功后的回调，例如同步分页或触发外部联动 */
  onLoadSuccess?: (list: T[]) => void;
};

/** 模板可直接 v-model 绑定的本地搜索状态 */
export type ClientTableSearchState<K extends PropertyKey> = {
  /** 当前搜索字段 */
  field: K;
  /** 搜索关键词 */
  keyword: string;
};

/** 模板可直接 v-model 绑定的本地分页状态 */
export type ClientTablePaginationState = {
  /** 当前页，从 1 开始 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 当前数据源下的总条数 */
  total: number;
};

/** 自定义本地搜索匹配函数 */
export type ClientTableSearchMatcher<T extends object, K extends keyof T> = (
  item: T,
  keyword: string,
  field: K
) => boolean;

/** useClientTablePagination 配置项 */
export type UseClientTablePaginationOptions = {
  /** 初始页码，默认 1 */
  page?: number;
  /** 初始每页条数，默认 20 */
  pageSize?: number;
  /** 页码或每页条数变化后的副作用，例如清空表格勾选 */
  onPageChange?: () => void;
};

/** useClientTableSearch 配置项 */
export type UseClientTableSearchOptions<T extends object, K extends keyof T> = {
  /** 初始搜索字段 */
  field: K;
  /** 初始搜索关键词，默认空字符串 */
  keyword?: string;
  /** 自定义本地搜索匹配逻辑，不传时按当前字段做字符串包含匹配 */
  matcher?: ClientTableSearchMatcher<T, K>;
  /** 搜索字段或关键词变化后是否立即更新搜索结果，默认 false，需要手动调用 triggerSearch */
  immediate?: boolean;
  /** 搜索字段或关键词变化后的副作用，例如清空表格勾选 */
  onSearchChange?: () => void;
};

/** useClientTable 一站式组合搜索配置项 */
export type UseClientTableSearchConfig<
  T extends object,
  K extends keyof T
> = UseClientTableSearchOptions<T, K> & {
  /** 搜索字段或关键词变化时是否重置到第一页，默认 true */
  resetPageOnSearchChange?: boolean;
};

/** useClientTable 无搜索配置项 */
type UseClientTableCommonOptions<T extends object> = UseClientTablePaginationOptions & {
  /** 固定数据加载函数；配置后可直接调用 reload() */
  loader?: ClientTableLoader<T>;
  /** 数据加载成功后是否重置到第一页，默认 true */
  resetPageOnLoad?: boolean;
  /** 数据加载成功后的副作用，例如清空选中态或同步外部状态 */
  onLoadSuccess?: (list: T[]) => void;
};

/** useClientTable 无搜索配置项 */
export type UseClientTablePlainOptions<T extends object> = UseClientTableCommonOptions<T> & {
  search?: undefined;
};

/** useClientTable 搜索配置项 */
export type UseClientTableWithSearchOptions<
  T extends object,
  K extends keyof T
> = UseClientTableCommonOptions<T> & {
  /** 搜索配置；传入后 searchState / triggerSearch 等搜索能力必定存在 */
  search: UseClientTableSearchConfig<T, K>;
};

type UseClientTableOptions<T extends object, K extends keyof T> =
  UseClientTablePlainOptions<T> | UseClientTableWithSearchOptions<T, K>;

/**
 * 默认搜索逻辑：取当前字段值转为字符串后做不区分大小写的包含匹配。
 *
 * null / undefined 不参与匹配，避免空值在搜索空白、特殊关键字等边界情况下误命中。
 */
const defaultSearchMatcher = <T extends object, K extends keyof T>(
  item: T,
  keyword: string,
  field: K
) => {
  const fieldValue = item[field];

  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  return String(fieldValue).toLowerCase().includes(keyword);
};

/**
 * 管理客户端表格的原始数据源和 loading 状态。
 *
 * 只负责“后端一次性返回全量数据”的写入、清空和加载状态，不参与搜索或分页本身。
 * 如果外部需要在加载成功后做联动，例如重置分页、同步选中态，可通过 `onLoadSuccess`
 * 注入成功回调。
 * 适合在需要完全手动组合能力时作为第一层数据源使用。
 *
 * @example
 * ```ts
 * const { loading, sourceList, reload } = useClientTableData<TodoTaskItem>({
 *   loader: () => getTodoTask({ taskState: 0 })
 * });
 *
 * await reload();
 * ```
 */
export const useClientTableData = <T extends object>(
  options: UseClientTableDataOptions<T> = {}
) => {
  const loading = ref(false);
  const sourceList = shallowRef<T[]>([]);

  const getLoader = (loader?: ClientTableLoader<T>) => {
    const nextLoader = loader ?? options.loader;

    if (!nextLoader) {
      throw new Error("useClientTableData 缺少 loader 配置");
    }

    return nextLoader;
  };

  const setSourceList = (list: T[]) => {
    sourceList.value = list;
  };

  const resetSourceList = () => {
    sourceList.value = [];
  };

  const loadData = async (loader?: ClientTableLoader<T>) => {
    loading.value = true;

    try {
      const list = await getLoader(loader)();
      setSourceList(list);
      options.onLoadSuccess?.(list);
      return list;
    } catch (error) {
      resetSourceList();
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /** 使用配置项中的 loader 重新加载数据 */
  const reload = () => {
    return loadData();
  };

  return {
    loading,
    sourceList,
    setSourceList,
    resetSourceList,
    loadData,
    reload
  };
};

/**
 * 管理客户端表格的本地搜索能力。
 *
 * 输入一个列表，输出 `searchedList`。默认不会在 `field` / `keyword` 输入变化时
 * 立即更新搜索结果，需要调用 `triggerSearch()` 提交搜索条件；如果配置
 * `immediate: true`，则输入变化后立即更新搜索结果。
 *
 * 注意：这个独立搜索能力只负责维护搜索条件和搜索结果。搜索变化后的分页重置、
 * 选中态清理等联动，由 `useClientTable` 或调用方通过 `onSearchChange` 自行桥接。
 *
 * @example
 * ```ts
 * type SearchField = "taskName" | "content";
 *
 * const { sourceList } = useClientTableData<TodoTaskItem>();
 * const { searchState, searchedList } = useClientTableSearch<
 *   TodoTaskItem,
 *   SearchField
 * >(sourceList, {
 *   field: "taskName"
 * });
 *
 * // 模板：<UInput v-model="searchState.keyword" />
 * ```
 */
export const useClientTableSearch = <T extends object, K extends keyof T>(
  list: MaybeReadonlyRef<T[]>,
  options: UseClientTableSearchOptions<T, K>
) => {
  const state = shallowReactive<ClientTableSearchState<K>>({
    field: options.field,
    keyword: options.keyword ?? ""
  });
  const activeField = ref<K>(options.field);
  const activeKeyword = ref(options.keyword ?? "");

  const normalizedKeyword = computed(() => {
    return activeKeyword.value.trim().toLowerCase();
  });

  const searchedList = computed(() => {
    if (!normalizedKeyword.value) {
      return list.value;
    }

    const matcher = options.matcher ?? defaultSearchMatcher<T, K>;

    return list.value.filter((item) => {
      return matcher(item, normalizedKeyword.value, activeField.value);
    });
  });

  const triggerSearch = () => {
    activeField.value = state.field;
    activeKeyword.value = state.keyword;
    options.onSearchChange?.();
  };

  const resetKeyword = () => {
    state.keyword = "";
  };

  watch(
    () => [state.field, state.keyword] as const,
    ([newField, newKeyword], [oldField, oldKeyword]) => {
      if (newField === oldField && newKeyword === oldKeyword) {
        return;
      }

      if (options.immediate) {
        triggerSearch();
      }
    }
  );

  return {
    searchState: state,
    normalizedKeyword,
    searchedList,
    triggerSearch,
    resetKeyword
  };
};

/**
 * 管理客户端表格的本地分页能力。
 *
 * 输入一个列表，输出当前页 `pagedList` 和可直接绑定 `Pagination` 的页码字段。
 * 当输入列表长度变化时，会同步 `total` 并修正越界页码；不会在 `pageSize` 变化时
 * 主动重置页码，因为项目内 `Pagination` 组件已负责该联动。
 *
 * @example
 * ```ts
 * const { sourceList } = useClientTableData<TodoTaskItem>();
 * const { pageState, pagedList } = useClientTablePagination(sourceList, {
 *   pageSize: 20
 * });
 *
 * // 模板：<Pagination v-model:page="pageState.page" />
 * ```
 */
export const useClientTablePagination = <T extends object>(
  list: MaybeReadonlyRef<T[]>,
  options: UseClientTablePaginationOptions = {}
) => {
  const state = reactive<ClientTablePaginationState>({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
    total: 0
  });

  const pagedList = computed(() => {
    const start = (state.page - 1) * state.pageSize;
    const end = start + state.pageSize;

    return list.value.slice(start, end);
  });

  const resetPage = () => {
    state.page = 1;
  };

  watch(
    list,
    (newVal) => {
      state.total = newVal.length;

      const maxPage = Math.max(1, Math.ceil(newVal.length / state.pageSize));

      if (state.page > maxPage) {
        state.page = maxPage;
      }
    },
    {
      immediate: true
    }
  );

  watch(
    () => [state.page, state.pageSize] as const,
    ([newPage, newPageSize], [oldPage, oldPageSize]) => {
      if (newPage === oldPage && newPageSize === oldPageSize) {
        return;
      }

      options.onPageChange?.();
    }
  );

  return {
    pageState: state,
    pagedList,
    resetPage
  };
};

type ClientTableDataReturn<T extends object> = ReturnType<typeof useClientTableData<T>>;

type UseClientTableBaseReturn<T extends object> = {
  loading: ClientTableDataReturn<T>["loading"];
  sourceList: ClientTableDataReturn<T>["sourceList"];
  filteredList: ComputedRef<T[]>;
  tableData: ComputedRef<T[]>;
  pagedList: ComputedRef<T[]>;
  pageState: ClientTablePaginationState;
  resetPage: () => void;
  setSourceList: ClientTableDataReturn<T>["setSourceList"];
  resetSourceList: ClientTableDataReturn<T>["resetSourceList"];
  loadData: ClientTableDataReturn<T>["loadData"];
  reload: ClientTableDataReturn<T>["reload"];
};

export type UseClientTablePlainReturn<T extends object> = UseClientTableBaseReturn<T> & {
  searchState: undefined;
  triggerSearch: undefined;
  resetKeyword: undefined;
};

export type UseClientTableWithSearchReturn<
  T extends object,
  K extends keyof T
> = UseClientTableBaseReturn<T> & {
  searchState: ClientTableSearchState<K>;
  triggerSearch: () => void;
  resetKeyword: () => void;
};

/**
 * 一站式客户端表格组合能力。
 *
 * 数据流：
 * - 不传 `search`：`sourceList -> filteredList(等同 sourceList) -> tableData`
 * - 传入 `search`：`sourceList -> filteredList(搜索结果) -> tableData`
 *
 * 默认行为：
 * - `loader` 放在配置项中，页面通常只调用 `reload()`。
 * - `loadData` 可临时传入 loader 覆盖配置项，适合一次性加载不同数据源。
 * - 数据加载成功后默认重置到第一页，这个行为通过 `useClientTableData` 的
 *   `onLoadSuccess` 成功回调桥接实现，可通过 `resetPageOnLoad: false` 关闭。
 * - 如果外部还需要在加载成功后执行额外副作用，可传入 `onLoadSuccess(list)`。
 * - 加载失败时清空 `sourceList` 并继续抛出错误，调用方负责业务提示。
 * - 搜索字段或关键词变化时默认不立即搜索，需要调用 `triggerSearch()`。
 * - 设置 `search.immediate: true` 后，搜索字段或关键词变化会立即搜索。
 * - 如需关闭搜索变化重置页码，设置 `search.resetPageOnSearchChange: false`。
 *
 * 外部表格取数：
 * - 无搜索 + 全量数据：`:data="table.sourceList"`
 * - 无搜索 + 分页数据：`:data="table.tableData"`
 * - 有搜索 + 过滤后的全部数据：`:data="table.filteredList"`
 * - 有搜索 + 过滤后的分页数据：`:data="table.tableData"`
 *
 * @example 无搜索，仅本地分页
 * ```ts
 * const table = useClientTable<TodoTaskArchiveViewItem>({
 *   pageSize: 20,
 *   loader: () => getTodoTaskArchiveView({ taskId })
 * });
 *
 * await table.reload();
 *
 * // 模板：
 * // <vxe-table :data="table.tableData" :loading="table.loading" />
 * // <Pagination
 * //   v-model:page="table.pageState.page"
 * //   v-model:pageSize="table.pageState.pageSize"
 * //   :total="table.pageState.total"
 * // />
 * ```
 *
 * @example 搜索 + 本地分页
 * ```ts
 * type SearchField = "taskName" | "content" | "userName";
 *
 * const table = useClientTable<TodoTaskItem, SearchField>({
 *   pageSize: 20,
 *   loader: () => getTodoTask({ taskState: 0 }),
 *   search: {
 *     field: "taskName",
 *     onSearchChange: clearCurrentTask
 *   },
 *   onPageChange: clearCurrentTask
 * });
 *
 * // 模板：
 * // <USelect v-model="table.searchState.field" />
 * // <UInput v-model="table.searchState.keyword" />
 * // <UButton @click="table.triggerSearch" />
 * // <vxe-table :data="table.tableData" :loading="table.loading" />
 * ```
 */
export function useClientTable<T extends object>(
  options?: UseClientTablePlainOptions<T>
): UseClientTablePlainReturn<T>;
export function useClientTable<T extends object, K extends keyof T>(
  options: UseClientTableWithSearchOptions<T, K>
): UseClientTableWithSearchReturn<T, K>;
export function useClientTable<T extends object, K extends keyof T = keyof T>(
  options: UseClientTableOptions<T, K> = {}
) {
  let resetPage: (() => void) | null = null;

  const data = useClientTableData<T>({
    loader: options.loader,
    onLoadSuccess: (list) => {
      if (options.resetPageOnLoad !== false) {
        resetPage?.();
      }

      options.onLoadSuccess?.(list);
    }
  });

  const hasSearch = "search" in options && Boolean(options.search);

  const search = hasSearch
    ? useClientTableSearch<T, K>(data.sourceList, {
        field: options.search!.field,
        keyword: options.search!.keyword,
        matcher: options.search!.matcher,
        immediate: options.search!.immediate,
        onSearchChange: () => {
          if (options.search!.resetPageOnSearchChange !== false) {
            resetPage?.();
          }

          options.search!.onSearchChange?.();
        }
      })
    : null;

  const filteredList = computed(() => {
    return search?.searchedList.value ?? data.sourceList.value;
  });

  const pagination = useClientTablePagination<T>(filteredList, {
    page: options.page,
    pageSize: options.pageSize,
    onPageChange: options.onPageChange
  });

  resetPage = pagination.resetPage;

  return {
    loading: data.loading,
    sourceList: data.sourceList,
    filteredList,
    tableData: pagination.pagedList,
    pagedList: pagination.pagedList,
    pageState: pagination.pageState,
    searchState: search?.searchState,
    triggerSearch: search?.triggerSearch,
    resetKeyword: search?.resetKeyword,
    resetPage: pagination.resetPage,
    setSourceList: data.setSourceList,
    resetSourceList: data.resetSourceList,
    loadData: data.loadData,
    reload: data.reload
  };
}
