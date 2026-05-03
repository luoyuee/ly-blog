<script setup lang="ts">
import type { SearchHistoryItem as SearchHistoryRecord, SearchTips } from "#shared/types/navigation-website";
import { useStorage } from "@vueuse/core";
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import {
  createSearchHistory,
  getPaginatedSearchHistories,
  getPublicSearchEngineList,
  searchNavigationWebsites
} from "~/apis/navigation-website";
import jsonp from "#shared/utils/jsonp";
import { debounce } from "es-toolkit";
import { useUserStore } from "~/stores/modules/user";
import { useSearchEngine } from "./composables/useSearchEngine";

type SearchHistoryStorageItem = Pick<SearchHistoryRecord, "search_engine_id" | "keyword">;

type SearchHistoryPanelItem = {
  text: string;
  type: "history";
};

type SearchPanelItem = SearchTips | SearchHistoryPanelItem;
type SearchHistoryStorageValue = Array<SearchHistoryStorageItem | string>;
type LocalSearchHistorySnapshot = {
  normalizedItems: SearchHistoryStorageItem[];
  legacyKeywords: string[];
  shouldRewrite: boolean;
  defaultSearchEngineId?: number;
};

const SEARCH_HISTORY_KEY = "ly-blog:navigation-search-history";
const SEARCH_HISTORY_LIMIT = 8;

const emit = defineEmits<{
  open: [];
  close: [];
}>();

const {
  engines,
  currentIndex,
  currentEngine,
  currentEngineIcon,
  isSearchEnabled,
  showSelector: showEngineSelector,
  showCurrentName: showCurrentEngineName,
  setEngines,
  setCurrentEngine,
  selectRelativeEngine,
  toggleSelector: toggleEngineSelector,
  closeSelector: closeEngineSelector,
  resetEngineUi
} = useSearchEngine();

const userStore = useUserStore();

const kw = ref("");
const searchInputRef = ref<HTMLInputElement | null>(null);
const tipsRef = ref<HTMLElement | null>(null);
const engineSelectorRef = ref<HTMLElement | null>(null);
const engineButtonRef = ref<HTMLElement | null>(null);
const showSearchInput = ref(false);
const searchHistory = useStorage<SearchHistoryStorageValue>(SEARCH_HISTORY_KEY, []);

const tips = reactive<{
  list: SearchTips[];
  current: number;
}>({
  list: [],
  current: -1
});

const isSearchHistoryReady = ref(false);
const isRemoteSearchHistoryLoading = ref(false);
const remoteSearchHistory = ref<SearchHistoryStorageItem[]>([]);
let searchHistorySyncToken = 0;

const isLoggedIn = computed(() => !!userStore.profile);
const kwTrimmed = computed(() => kw.value.trim());
const isHistoryMode = computed(() => kwTrimmed.value.length === 0);
const showSearchPanel = computed(() => showSearchInput.value && displayedList.value.length > 0);

/**
 * 统一清洗关键词，避免历史记录因空白字符差异产生重复项。
 */
const normalizeKeyword = (value: string) => value.trim().replace(/\s+/g, " ");

/**
 * 获取当前可用于历史记录归档的默认搜索引擎 id。
 */
const getDefaultSearchEngineId = () => currentEngine.value?.id ?? engines.value[0]?.id;

/**
 * 判断本地历史项是否符合新版结构。
 */
const isSearchHistoryStorageItem = (
  value: SearchHistoryStorageItem | string
): value is SearchHistoryStorageItem =>
  typeof value !== "string" && typeof value.search_engine_id === "number" && typeof value.keyword === "string";

/**
 * 解析本地历史项，兼容旧版 string[]。
 */
const normalizeSearchHistoryItem = (
  value: SearchHistoryStorageItem | string,
  fallbackSearchEngineId?: number
): SearchHistoryStorageItem | null => {
  if (typeof value === "string") {
    if (typeof fallbackSearchEngineId !== "number") {
      return null;
    }

    const keyword = normalizeKeyword(value);
    return keyword.length === 0
      ? null
      : {
          search_engine_id: fallbackSearchEngineId,
          keyword
        };
  }

  if (!isSearchHistoryStorageItem(value)) {
    return null;
  }

  const keyword = normalizeKeyword(value.keyword);
  return keyword.length === 0
    ? null
    : {
        search_engine_id: value.search_engine_id,
        keyword
      };
};

/**
 * 对历史记录去重并截断，保留最近使用项优先。
 */
const dedupeSearchHistory = (items: SearchHistoryStorageItem[]) => {
  const seen = new Set<string>();
  const nextHistory: SearchHistoryStorageItem[] = [];

  for (const item of items) {
    const keyword = normalizeKeyword(item.keyword);
    if (keyword.length === 0) {
      continue;
    }

    const key = item.search_engine_id + ":" + keyword.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    nextHistory.push({
      search_engine_id: item.search_engine_id,
      keyword
    });

    if (nextHistory.length >= SEARCH_HISTORY_LIMIT) {
      break;
    }
  }

  return nextHistory;
};

/**
 * 将关键词列表去重并截断，保留最近使用项优先。
 */
const dedupeKeywords = (keywords: string[]) => {
  const seen = new Set<string>();
  const nextKeywords: string[] = [];

  for (const item of keywords) {
    const keyword = normalizeKeyword(item);
    if (keyword.length === 0) {
      continue;
    }

    const key = keyword.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    nextKeywords.push(keyword);

    if (nextKeywords.length >= SEARCH_HISTORY_LIMIT) {
      break;
    }
  }

  return nextKeywords;
};

/**
 * 读取本地历史快照，并在引擎可用时兼容旧版 string[] 数据。
 */
const getLocalSearchHistorySnapshot = (): LocalSearchHistorySnapshot => {
  const defaultSearchEngineId = getDefaultSearchEngineId();
  const normalizedItems: SearchHistoryStorageItem[] = [];
  const legacyKeywords: string[] = [];
  let shouldRewrite = false;

  for (const item of searchHistory.value) {
    if (typeof item === "string") {
      const keyword = normalizeKeyword(item);
      if (keyword.length === 0) {
        shouldRewrite = true;
        continue;
      }

      if (typeof defaultSearchEngineId === "number") {
        normalizedItems.push({
          search_engine_id: defaultSearchEngineId,
          keyword
        });
        shouldRewrite = true;
        continue;
      }

      legacyKeywords.push(keyword);
      continue;
    }

    const normalizedItem = normalizeSearchHistoryItem(item);
    if (!normalizedItem) {
      shouldRewrite = true;
      continue;
    }

    normalizedItems.push(normalizedItem);
  }

  const dedupedItems = dedupeSearchHistory(normalizedItems);
  if (dedupedItems.length !== normalizedItems.length) {
    shouldRewrite = true;
  }

  return {
    normalizedItems: dedupedItems,
    legacyKeywords: dedupeKeywords(legacyKeywords),
    shouldRewrite,
    defaultSearchEngineId
  };
};

/**
 * 读取本地搜索历史，兼容旧版 string[] 与新版对象数组。
 */
const readLocalSearchHistory = () => {
  const snapshot = getLocalSearchHistorySnapshot();

  if (typeof snapshot.defaultSearchEngineId === "number" && snapshot.shouldRewrite) {
    searchHistory.value = snapshot.normalizedItems;
  }

  return snapshot.normalizedItems;
};

/**
 * 为游客模式生成本地历史展示列表，避免旧版 string[] 在引擎未加载前丢失。
 */
const getLocalSearchHistoryKeywords = () => {
  const snapshot = getLocalSearchHistorySnapshot();

  return dedupeKeywords([
    ...snapshot.normalizedItems.map((item) => item.keyword),
    ...snapshot.legacyKeywords
  ]);
};

/**
 * 写回本地搜索历史。
 */
const writeLocalSearchHistory = (items: SearchHistoryStorageItem[]) => {
  searchHistory.value = dedupeSearchHistory(items);
};

/**
 * 仅在游客模式下写入本地历史。
 */
const addLocalSearchHistory = (keyword: string) => {
  const searchEngineId = currentEngine.value?.id;
  if (typeof searchEngineId !== "number") {
    return;
  }

  const normalizedKeyword = normalizeKeyword(keyword);
  if (normalizedKeyword.length === 0) {
    return;
  }

  const nextHistory = readLocalSearchHistory().filter(
    (item) => item.search_engine_id !== searchEngineId || item.keyword.toLowerCase() !== normalizedKeyword.toLowerCase()
  );

  writeLocalSearchHistory([
    {
      search_engine_id: searchEngineId,
      keyword: normalizedKeyword
    },
    ...nextHistory
  ]);
};

/**
 * 将本地历史逐条迁移到后端，仅在全部成功后清空本地。
 */
const migrateLocalSearchHistory = async () => {
  const snapshot = getLocalSearchHistorySnapshot();
  if (snapshot.legacyKeywords.length > 0 && typeof snapshot.defaultSearchEngineId !== "number") {
    return;
  }

  const localHistory = readLocalSearchHistory();
  if (localHistory.length === 0) {
    return;
  }

  const pendingHistory = [...localHistory];
  for (const item of localHistory) {
    await createSearchHistory(item);
    pendingHistory.shift();
    writeLocalSearchHistory(pendingHistory);
  }

  searchHistory.value = [];
};

/**
 * 拉取远端搜索历史并映射到组件展示结构。
 */
const loadRemoteSearchHistory = async () => {
  const response = await getPaginatedSearchHistories({
    page: 1,
    per_page: SEARCH_HISTORY_LIMIT
  });

  return dedupeSearchHistory(
    (response.data ?? []).map((item) => ({
      search_engine_id: item.search_engine_id,
      keyword: item.keyword
    }))
  );
};

/**
 * 根据登录态同步历史数据：游客看本地，登录后迁移并展示后端。
 */
const syncSearchHistory = async () => {
  if (!isSearchHistoryReady.value) {
    return;
  }

  const syncToken = ++searchHistorySyncToken;

  if (!isLoggedIn.value) {
    remoteSearchHistory.value = [];
    isRemoteSearchHistoryLoading.value = false;
    return;
  }

  isRemoteSearchHistoryLoading.value = true;

  try {
    await migrateLocalSearchHistory();
  } catch (error) {
    console.error(error);
  }

  if (syncToken !== searchHistorySyncToken || !isLoggedIn.value) {
    return;
  }

  try {
    const nextRemoteHistory = await loadRemoteSearchHistory();
    if (syncToken !== searchHistorySyncToken || !isLoggedIn.value) {
      return;
    }

    remoteSearchHistory.value = nextRemoteHistory;
  } catch (error) {
    console.error(error);
  } finally {
    if (syncToken === searchHistorySyncToken) {
      isRemoteSearchHistoryLoading.value = false;
    }
  }
};

const historyList = computed<SearchHistoryPanelItem[]>(() => {
  const guestHistories = getLocalSearchHistoryKeywords();
  const histories =
    isLoggedIn.value && !(isRemoteSearchHistoryLoading.value && remoteSearchHistory.value.length === 0)
      ? remoteSearchHistory.value.map((item) => item.keyword)
      : guestHistories;

  return histories.map((keyword) => ({
    text: keyword,
    type: "history"
  }));
});

const displayedList = computed<SearchPanelItem[]>(() =>
  isHistoryMode.value ? historyList.value : tips.list
);

watch(isHistoryMode, () => {
  tips.current = -1;
});

watch(
  () => displayedList.value.length,
  (length) => {
    if (length === 0 || tips.current >= length) {
      tips.current = -1;
    }
  }
);

/**
 * 从后端接口读取搜索引擎列表，并映射为组件内部使用的数据结构。
 */
const loadEngines = async () => {
  try {
    const res = await getPublicSearchEngineList();
    setEngines(
      (res.data ?? [])
        .filter((item) => item.status === 1)
        .map((item) => ({
          id: item.id,
          name: item.name,
          icon: item.icon,
          url: item.url
        }))
    );
  } catch (error) {
    console.error(error);
  } finally {
    isSearchHistoryReady.value = true;
    void syncSearchHistory();
  }
};

/**
 * 展开搜索框后等待 DOM 更新，再自动聚焦输入框。
 */
const focusSearchInput = async () => {
  await nextTick();
  searchInputRef.value?.focus();
};

const clearSuggestions = () => {
  tips.list = [];
  tips.current = -1;
};

/**
 * 组件内部控制搜索框显示状态，供按钮点击和父组件 ref 复用。
 */
const open = async () => {
  if (showSearchInput.value) {
    await focusSearchInput();
    return;
  }

  showSearchInput.value = true;
  emit("open");
  await focusSearchInput();
};

/**
 * 恢复搜索框默认按钮态时同步清理内部状态，避免残留交互态。
 */
const reset = () => {
  kw.value = "";
  clearSuggestions();
  resetEngineUi();
};

/**
 * 收起搜索框并向父组件同步当前显示状态。
 */
const close = () => {
  if (!showSearchInput.value) {
    reset();
    return;
  }

  showSearchInput.value = false;
  reset();
  emit("close");
};

/**
 * 供父级背景点击优先消费内部浮层关闭，避免同一次点击直接关闭整个搜索框。
 */
const closeFloatingPanel = () => closeEngineSelector();

const handleShowSearch = async () => {
  if (showSearchInput.value) {
    return;
  }

  await open();
};

/**
 * 输入为空时立即清空联想结果，避免组件在按钮态和输入态之间切换时残留旧数据。
 */
const handleInput = () => {
  if (kwTrimmed.value.length !== 0) {
    getSearchTips();
    return;
  }

  clearSuggestions();
};

// 搜索框关键词提示
const getSearchTips = debounce(async () => {
  const text = kwTrimmed.value;
  if (text.length === 0) {
    return;
  }

  const temp: SearchTips[] = [];
  try {
    const textTips = await jsonp<{
      s: string[];
    }>({
      url: "https://suggestion.baidu.com/su",
      query: {
        wd: text,
        pre: "1",
        p: "3",
        ie: "utf-8",
        json: "1",
        prod: "pc",
        from: "pc_web"
      },
      callbackParamName: "cb"
    });

    textTips.s.forEach((item) => {
      temp.push({
        text: item,
        type: "text"
      });
    });

    const websites = await searchNavigationWebsites({
      keyword: text
    });

    websites.forEach((item) => {
      temp.push({
        id: item.id,
        text: item.name,
        url: item.url,
        icon: item.icon,
        type: "link"
      });
    });

    tips.current = -1;
    tips.list = temp;
    tipsRef.value?.scrollTo(0, 0);
  } catch (error) {
    console.log(error);
  }
}, 250);

/**
 * 通过键盘上下键在联想项之间切换，并同步输入框光标位置。
 */
const selectTip = (down: boolean) => {
  if (displayedList.value.length === 0) {
    return;
  }

  tips.current = down
    ? tips.current === displayedList.value.length - 1
      ? 0
      : tips.current + 1
    : tips.current === 0 || tips.current === -1
      ? displayedList.value.length - 1
      : tips.current - 1;

  const currentItem = displayedList.value[tips.current];
  if (!isHistoryMode.value && currentItem?.type === "text") {
    kw.value = currentItem.text;
  }
  tipsRef.value?.children[tips.current]?.scrollIntoView(false);

  nextTick(() => {
    const selectionEnd = searchInputRef.value?.selectionEnd ?? kw.value.length;
    searchInputRef.value?.setSelectionRange(selectionEnd, selectionEnd);
  });
};

/**
 * 通过 Tab 在搜索引擎之间切换，并保持输入框焦点与光标位置不变。
 */
const selectEngine = async (forward: boolean) => {
  if (engines.value.length === 0) {
    return;
  }

  const selectionStart = searchInputRef.value?.selectionStart ?? kw.value.length;
  const selectionEnd = searchInputRef.value?.selectionEnd ?? kw.value.length;
  selectRelativeEngine(forward ? 1 : -1);

  await nextTick();
  searchInputRef.value?.focus();
  searchInputRef.value?.setSelectionRange(selectionStart, selectionEnd);
};

/**
 * 输入框内按 Tab / Shift + Tab 时快速切换搜索引擎；无可用引擎时保留原生焦点切换。
 */
const handleEngineKeydown = (event: KeyboardEvent) => {
  if (engines.value.length === 0) {
    return;
  }

  event.preventDefault();
  void selectEngine(!event.shiftKey);
};

const handleSelectEngine = async (index: number) => {
  setCurrentEngine(index);
  closeEngineSelector();
  await focusSearchInput();
};

/**
 * 点击搜索引擎面板外部区域时关闭选择器，避免面板悬挂在页面上。
 */
const handleDocumentClick = (event: MouseEvent) => {
  if (!showEngineSelector.value) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }

  if (engineSelectorRef.value?.contains(target) || engineButtonRef.value?.contains(target)) {
    return;
  }

  closeEngineSelector();
};

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
  loadEngines();
});

watch(
  () => userStore.profile,
  () => {
    if (!isSearchHistoryReady.value) {
      return;
    }

    void syncSearchHistory();
  },
  {
    immediate: true
  }
);

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
});

/**
 * 根据当前交互上下文解析本次确认动作对应的目标项。
 */
const getActiveSearchItem = () => displayedList.value[tips.current];

/**
 * 执行搜索或跳转，并在真正发起关键词搜索后写入历史记录。
 */
const handleSearch = (selectedItem?: SearchPanelItem) => {
  const item = selectedItem ?? getActiveSearchItem();
  if (item?.type === "link") {
    window.open(item.url, "_blank", "noopener,noreferrer");
    return;
  }

  const keyword = normalizeKeyword(item?.text ?? kw.value);
  kw.value = keyword;
  if (keyword.length === 0 || !currentEngine.value) {
    return;
  }

  const encodedKeyword = encodeURIComponent(keyword);
  const searchUrl = currentEngine.value.url.replaceAll("${kw}", encodedKeyword);

  if (isLoggedIn.value) {
    void (async () => {
      try {
        await createSearchHistory({
          search_engine_id: currentEngine.value.id,
          keyword
        });
        remoteSearchHistory.value = await loadRemoteSearchHistory();
      } catch (error) {
        console.error(error);
      }
    })();
  } else {
    addLocalSearchHistory(keyword);
  }

  window.open(searchUrl, "_blank", "noopener,noreferrer");
};

const handleClickTip = (item: SearchPanelItem) => {
  if (item.type !== "link") {
    kw.value = item.text;
  }
  handleSearch(item);
};

defineExpose({
  open,
  close,
  reset,
  closeFloatingPanel
});
</script>

<template>
  <div class="search-box" @click.stop>
    <button
      v-if="!showSearchInput"
      class="search-box__trigger"
      type="button"
      @click="handleShowSearch"
    >
      <UIcon name="mdi:search" :size="18" />
      <span>搜索</span>
    </button>

    <div v-else class="search-box__input">
      <div class="search-box__engine">
        <button
          ref="engineButtonRef"
          class="search-box__engine-button"
          type="button"
          :title="isSearchEnabled ? currentEngine?.name : '暂无可用搜索引擎'"
          @click="toggleEngineSelector"
        >
          <UIcon :name="currentEngineIcon" :size="24" />
        </button>

        <Transition
          enter-active-class="search-box__engine-name--enter"
          leave-active-class="search-box__engine-name--leave"
        >
          <span v-if="showCurrentEngineName && currentEngine" class="search-box__engine-name">
            {{ currentEngine.name }}
          </span>
        </Transition>

        <!-- 搜索引擎选择器 -->
        <Transition
          enter-active-class="search-box__engine-menu--enter"
          leave-active-class="search-box__engine-menu--leave"
        >
          <div v-if="showEngineSelector" ref="engineSelectorRef" class="search-box__engine-menu">
            <button
              v-for="(item, index) in engines"
              :key="item.name"
              class="search-box__engine-option"
              :class="{ 'search-box__engine-option--active': index === currentIndex }"
              type="button"
              @click="handleSelectEngine(index)"
            >
              <UIcon :name="item.icon" :size="24" />
              <span>{{ item.name }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <div class="search-box__field" @click="closeEngineSelector">
        <input
          ref="searchInputRef"
          v-model="kw"
          class="search-box__control"
          type="text"
          @keydown.enter="handleSearch"
          @keydown.tab="handleEngineKeydown"
          @keydown.up.prevent="selectTip(false)"
          @keydown.down.prevent="selectTip(true)"
          @input="handleInput"
        />
      </div>

      <button
        class="search-box__submit"
        type="button"
        :title="isSearchEnabled ? '搜索' : '暂无可用搜索引擎'"
        @click="handleSearch()"
      >
        <UIcon name="mdi:search" :size="24" class="text-blue-400" />
      </button>
    </div>

    <div v-show="showSearchPanel" ref="tipsRef" class="search-box__tips">
      <div
        v-for="(item, index) in displayedList"
        :key="`${item.type}-${item.text}-${index}`"
        class="search-box__tip"
        :class="{ 'search-box__tip--active': index === tips.current }"
      >
        <div
          v-if="item.type === 'text' || item.type === 'history'"
          class="search-box__tip-text"
          @click="handleClickTip(item)"
        >
          {{ item.text }}
        </div>
        <div v-else-if="item.type === 'link'" class="search-box__tip-link" @click="handleClickTip(item)">
          <img :src="item.icon" :alt="item.text" />
          <div>
            <h5>{{ item.text }}</h5>
            <p>{{ item.url }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import url("../style/search-box.scss");
</style>
