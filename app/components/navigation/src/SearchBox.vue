<script setup lang="ts">
import type { SearchTips } from "#shared/types/navigation-website";
import { useStorage } from "@vueuse/core";
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { searchNavigationWebsites, getPublicSearchEngineList } from "~/apis/navigation-website";
import jsonp from "#shared/utils/jsonp";
import { debounce } from "es-toolkit";
import { useSearchEngine } from "./composables/useSearchEngine";

type SearchHistoryItem = {
  text: string;
  type: "history";
};
type SearchPanelItem = SearchTips | SearchHistoryItem;

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

const kw = ref("");
const searchInputRef = ref<HTMLInputElement | null>(null);
const tipsRef = ref<HTMLElement | null>(null);
const engineSelectorRef = ref<HTMLElement | null>(null);
const engineButtonRef = ref<HTMLElement | null>(null);
const showSearchInput = ref(false);
const searchHistory = useStorage<string[]>(SEARCH_HISTORY_KEY, []);

const tips = reactive<{
  list: SearchTips[];
  current: number;
}>({
  list: [],
  current: -1
});

const kwTrimmed = computed(() => kw.value.trim());
const historyList = computed<SearchHistoryItem[]>(() =>
  searchHistory.value.map((item) => ({
    text: item,
    type: "history"
  }))
);
const isHistoryMode = computed(() => kwTrimmed.value.length === 0);
const displayedList = computed<SearchPanelItem[]>(() =>
  isHistoryMode.value ? historyList.value : tips.list
);
const showSearchPanel = computed(() => showSearchInput.value && displayedList.value.length > 0);

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
 * 统一清洗关键词，避免历史记录因空白字符差异产生重复项。
 */
const normalizeKeyword = (value: string) => value.trim().replace(/\s+/g, " ");

/**
 * 仅在确认搜索后写入历史记录，并保持最近使用项置顶。
 */
const addSearchHistory = (value: string) => {
  const keyword = normalizeKeyword(value);
  if (keyword.length === 0) {
    return;
  }

  const normalizedKeyword = keyword.toLowerCase();
  const nextHistory = searchHistory.value.filter(
    (item) => normalizeKeyword(item).toLowerCase() !== normalizedKeyword
  );
  nextHistory.unshift(keyword);
  searchHistory.value = nextHistory.slice(0, SEARCH_HISTORY_LIMIT);
};

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
          name: item.name,
          icon: item.icon,
          url: item.url
        }))
    );
  } catch (error) {
    console.error(error);
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

  addSearchHistory(keyword);
  const encodedKeyword = encodeURIComponent(keyword);
  const searchUrl = currentEngine.value.url.replaceAll("${kw}", encodedKeyword);
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
