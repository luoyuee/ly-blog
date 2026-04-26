import type { SearchEngineItem } from "#shared/types/navigation-website";
import { computed, onUnmounted, ref } from "vue";

export type SearchEngineOption = Pick<SearchEngineItem, "name" | "icon" | "url">;

const ENGINE_NAME_VISIBLE_DURATION = 1200;
const FALLBACK_ENGINE_ICON = "mdi:web";

/**
 * 管理搜索引擎列表、当前选中项、选择器状态和引擎名称临时提示。
 */
export const useSearchEngine = () => {
  const engines = ref<SearchEngineOption[]>([]);
  const currentIndex = ref(0);
  const showSelector = ref(false);
  const showCurrentName = ref(false);
  let currentNameTimer: number | null = null;

  const normalizeIndex = (index: number) => {
    if (engines.value.length === 0) {
      return -1;
    }

    return ((index % engines.value.length) + engines.value.length) % engines.value.length;
  };

  const currentEngine = computed<SearchEngineOption | undefined>(() => {
    const normalizedIndex = normalizeIndex(currentIndex.value);

    return normalizedIndex === -1 ? undefined : engines.value[normalizedIndex];
  });

  const currentEngineIcon = computed(() => currentEngine.value?.icon ?? FALLBACK_ENGINE_ICON);
  const isSearchEnabled = computed(() => !!currentEngine.value);

  const clearCurrentNameTimer = () => {
    if (currentNameTimer === null) {
      return;
    }

    clearTimeout(currentNameTimer);
    currentNameTimer = null;
  };

  const hideCurrentName = () => {
    clearCurrentNameTimer();
    showCurrentName.value = false;
  };

  const revealCurrentName = () => {
    if (!currentEngine.value) {
      hideCurrentName();
      return;
    }

    clearCurrentNameTimer();
    showCurrentName.value = true;
    currentNameTimer = window.setTimeout(() => {
      showCurrentName.value = false;
      currentNameTimer = null;
    }, ENGINE_NAME_VISIBLE_DURATION);
  };

  const setEngines = (nextEngines: SearchEngineOption[]) => {
    engines.value = nextEngines;
    currentIndex.value = normalizeIndex(0);
    hideCurrentName();
  };

  const setCurrentEngine = (index: number) => {
    const normalizedIndex = normalizeIndex(index);
    if (normalizedIndex === -1) {
      return;
    }

    currentIndex.value = normalizedIndex;
    revealCurrentName();
  };

  const selectRelativeEngine = (offset: number) => {
    const normalizedIndex = normalizeIndex(currentIndex.value);
    if (normalizedIndex === -1) {
      return;
    }

    setCurrentEngine(normalizedIndex + offset);
  };

  const toggleSelector = () => {
    showSelector.value = !showSelector.value;
  };

  const closeSelector = () => {
    if (!showSelector.value) {
      return false;
    }

    showSelector.value = false;
    return true;
  };

  const resetEngineUi = () => {
    showSelector.value = false;
    hideCurrentName();
  };

  onUnmounted(() => {
    clearCurrentNameTimer();
  });

  return {
    engines,
    currentIndex,
    currentEngine,
    currentEngineIcon,
    isSearchEnabled,
    showSelector,
    showCurrentName,
    setEngines,
    setCurrentEngine,
    selectRelativeEngine,
    toggleSelector,
    closeSelector,
    resetEngineUi
  };
};
