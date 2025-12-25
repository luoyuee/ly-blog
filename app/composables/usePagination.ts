import { computed, watch, readonly, ref } from "vue";

// API 响应数据结构
export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

// API 请求参数结构
export interface PaginationRequest {
  page: number;
  per_page: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // 允许额外的参数
}

export interface PaginationOptions<T> {
  /** API 函数 */
  api: (params: PaginationRequest) => Promise<PaginationResponse<T>>;
  /** 请求之前对参数进行处理 */
  beforeFetch?: (params: PaginationRequest) => PaginationRequest;
  /** 请求之后对返回值进行处理 */
  afterFetch?: (response: PaginationResponse<T>) => PaginationResponse<T>;
  /** 初始页码，默认为 1 */
  initialPage?: number;
  /** 每页数据量，默认为 10 */
  initialPerPage?: number;
  initialData?: T[];
  /** 是否立即加载数据，默认为 true */
  immediate?: boolean;
  /** 错误处理函数 */
  onError?: (error: unknown) => void;
  /** 成功回调函数 */
  onSuccess?: (response: PaginationResponse<T>) => void;
}

export function usePagination<T>(options: PaginationOptions<T>) {
  const {
    api,
    beforeFetch,
    afterFetch,
    initialPage,
    initialPerPage,
    initialData = [],
    immediate = true,
    onError,
    onSuccess
  } = options;

  const page = ref(initialPage || 1);
  const perPage = ref(initialPerPage || 10);
  const total = ref(0);
  const data = ref<T[]>(initialData);
  const loading = ref(false);

  // 计算属性
  const totalPage = computed(() => Math.ceil(total.value / perPage.value));
  const hasPrev = computed(() => page.value > 1);
  const hasNext = computed(() => page.value < totalPage.value);

  // 数据请求函数
  const fetchData = async () => {
    try {
      loading.value = true;

      // 构建请求参数
      let params: PaginationRequest = {
        page: page.value,
        per_page: perPage.value
      };

      // 调用 beforeFetch 钩子函数
      if (beforeFetch) {
        params = beforeFetch(params);
      }

      // 调用 API 函数
      let result = await api(params);

      // 调用 afterFetch 钩子函数
      if (afterFetch) {
        result = afterFetch(result);
      }

      data.value = result.data || [];
      total.value = result.total || 0;
      page.value = result.page || page.value;
      perPage.value = result.per_page || perPage.value;

      if (onSuccess) onSuccess(result);
    } catch (error) {
      if (onError) onError(error);
    } finally {
      loading.value = false;
    }
  };

  // 操作方法
  const actions = {
    refresh: async () => {
      await fetchData();
    },

    goToPage: async (current: number) => {
      if (current < 1 || current > totalPage.value) {
        return;
      }
      page.value = current;
      await fetchData();
    },

    prevPage: async () => {
      if (hasPrev.value) {
        await actions.goToPage(page.value - 1);
      }
    },

    nextPage: async () => {
      if (hasNext.value) {
        await actions.goToPage(page.value + 1);
      }
    },

    reset: async () => {
      page.value = initialPage || 1;
      perPage.value = initialPerPage || 10;
      await fetchData();
    },

    changePerPage: async (size: number) => {
      if (size < 1) return;

      perPage.value = size;
      page.value = 1; // 重置到第一页
      await fetchData();
    }
  };

  // 用于标记是否已经初始化过
  let isInitialized = false;

  // 监听页码和每页数量变化（用于外部直接修改状态时自动请求）
  watch(
    () => [page.value, perPage.value],
    () => {
      // 防止初始化时重复请求
      if (!immediate || isInitialized) {
        fetchData();
      }
    },
    { deep: true }
  );

  // 立即加载数据
  if (immediate) {
    fetchData().finally(() => {
      isInitialized = true;
    });
  }

  return {
    // 状态 - 允许外部修改的状态
    page,
    perPage,

    // 只读状态 - 由内部管理，外部不应直接修改
    total: readonly(total),
    data: readonly(data),
    loading: readonly(loading),

    // 计算属性
    totalPage,
    hasPrev,
    hasNext,

    // 操作方法
    ...actions,

    // 手动触发数据获取
    fetchData
  };
}

// 默认导出实例（可选）
export default usePagination;
