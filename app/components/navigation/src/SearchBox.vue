<script setup lang="ts">
import type { SearchEngineItem, SearchTips } from "#shared/types/navigation-website";
import { ref, reactive, nextTick, onMounted, onUnmounted } from "vue";
import { searchNavigationWebsites, getSearchEngineList } from "~/apis/navigation-website";
import jsonp from "#shared/utils/jsonp";
import { debounce } from "es-toolkit";

type SearchEngineOption = Pick<SearchEngineItem, "name" | "icon" | "url">;

const emit = defineEmits<{
  open: [];
  close: [];
}>();

// 搜索引擎
const engine = reactive<{
  list: SearchEngineOption[];
  current: number;
}>({
  list: [],
  current: 0
});

// 从后端接口读取搜索引擎列表，并映射为组件内部使用的数据结构
const loadEngines = async () => {
  try {
    const res = await getSearchEngineList();
    engine.list = (res.data ?? [])
      .filter((item) => item.status === 1)
      .map((item) => ({
        name: item.name,
        icon: item.icon,
        url: item.url
      }));
    engine.current = 0;
  } catch (error) {
    console.error(error);
  }
};

// 搜索关键词
const kw = ref("");
const searchInputRef = ref<HTMLInputElement | null>(null);
const showSearchInput = ref(false);

/**
 * 展开搜索框后等待 DOM 更新，再自动聚焦输入框。
 */
const focusSearchInput = async () => {
  await nextTick();
  searchInputRef.value?.focus();
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
  tips.list = [];
  tips.current = -1;
  showEngineSelector.value = false;
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
  if (kw.value.length !== 0) {
    getSearchTips();
  } else {
    tips.list = [];
    tips.current = -1;
  }
};

// 搜索框关键词提示
const tips = reactive<{
  list: SearchTips[];
  current: number;
}>({
  list: [],
  current: -1
});
const tipsRef = ref<HTMLElement | null>(null);
const getSearchTips = debounce(async () => {
  const text = kw.value.trim();
  if (text.length !== 0) {
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

      textTips["s"].forEach((item) => {
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
  }
}, 250);

/**
 * 通过键盘上下键在联想项之间切换，并同步输入框光标位置。
 */
const selectTip = (down: boolean) => {
  if (kw.value.trim().length === 0) {
    return;
  }

  if (down) {
    tips.current = tips.current === tips.list.length - 1 ? 0 : tips.current + 1;
  } else {
    tips.current =
      tips.current === 0 || tips.current === -1 ? tips.list.length - 1 : tips.current - 1;
  }
  if (tips.list[tips.current].type === "text") {
    kw.value = tips.list[tips.current].text;
  }
  tipsRef.value?.children[tips.current].scrollIntoView(false);

  nextTick(() => {
    searchInputRef.value?.setSelectionRange(
      searchInputRef.value?.selectionEnd,
      searchInputRef.value?.selectionEnd
    );
  });
};

// 搜索引擎选择器显示状态
const showEngineSelector = ref(false);
const engineSelectorRef = ref<HTMLElement | null>(null);
const leftBtnRef = ref<HTMLElement | null>(null);

/**
 * 切换搜索引擎面板显示状态。
 */
const toggleEngineSelector = () => {
  showEngineSelector.value = !showEngineSelector.value;
};

/**
 * 点击搜索引擎面板外部区域时关闭选择器，避免面板悬挂在页面上。
 */
const handleClickOutside = (e: MouseEvent) => {
  if (
    engineSelectorRef.value &&
    !engineSelectorRef.value.contains(e.target as Node) &&
    leftBtnRef.value &&
    !leftBtnRef.value.contains(e.target as Node)
  ) {
    showEngineSelector.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  loadEngines();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const handleSearch = () => {
  const item: SearchTips | undefined = tips.list[tips.current];
  if (item && item.type === "link") {
    window.open(item.url);
    return;
  }
  kw.value = kw.value.trim();
  if (kw.value.length > 0 && engine.list.length > 0) {
    window.open(engine.list[engine.current].url.replace("${kw}", kw.value));
  }
};

const handleClickTip = (e: SearchTips) => {
  if (e.type === "text") {
    kw.value = e.text;
  }
  handleSearch();
};

/**
 * 对外暴露统一的 open / close / reset 接口，页面层只通过这组 API 编排状态。
 */
defineExpose({
  open,
  close,
  reset
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

    <div v-else class="search-input-box">
      <div class="left">
        <span ref="leftBtnRef" @click="toggleEngineSelector">
          <UIcon name="mdi:internet" :size="24" />
        </span>
        <!-- 搜索引擎选择器 -->
        <div v-show="showEngineSelector" ref="engineSelectorRef" class="engine-selector">
          <div
            v-for="(item, index) in engine.list"
            :key="index"
            class="engine-item"
            :class="{ active: index === engine.current }"
            @click="
              engine.current = index;
              showEngineSelector = false;
            "
          >
            <span :class="item.icon"></span>
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>
      <div class="center">
        <input
          ref="searchInputRef"
          v-model="kw"
          type="text"
          @keydown.enter="handleSearch"
          @keydown.up.prevent="selectTip(false)"
          @keydown.down.prevent="selectTip(true)"
          @input="handleInput"
        />
      </div>
      <div class="right" @click="handleSearch">
        <span>
          <UIcon name="mdi:search" :size="24" class="text-blue-400" />
        </span>
      </div>
    </div>

    <div v-show="showSearchInput && kw.length !== 0" ref="tipsRef" class="search-tips">
      <div
        v-for="(item, index) in tips.list"
        :key="index"
        class="search-tips-item"
        :class="{ active: index === tips.current }"
      >
        <div v-if="item.type === 'text'" class="text" @click="handleClickTip(item)">
          {{ item.text }}
        </div>
        <div v-else-if="item.type === 'link'" class="link" @click="handleClickTip(item)">
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
.search-box {
  width: 640px;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &__trigger,
  .search-input-box {
    width: 640px;
    height: 48px;
    border-radius: 24px;
    box-sizing: border-box;
  }

  &__trigger {
    border: none;
    background: rgba(0, 0, 0, 0.35);
    color: #fff;
    font-size: 14px;
    letter-spacing: 2px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: background 0.25s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    &:hover {
      background: rgba(0, 0, 0, 0.5);
    }
  }

  .search-engine {
    width: 520px;
    line-height: 30px;
    height: 30px;
    margin: 50px 0 30px 0;
    display: flex;
    justify-content: space-between;
    color: #525252;
    position: relative;

    span {
      position: relative;
      cursor: pointer;
      letter-spacing: 1px;
      padding: 0 6px;
    }

    .marker {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      display: block;
      width: 10px;
      height: 5px;
      border-radius: 3px;
      background-color: #525252;
      transition: all 0.2s;
    }
  }

  .search-input-box {
    display: flex;
    justify-self: center;
    align-items: center;
    background-color: #1e1e1ee6;
    color: #606265;
    box-shadow: 0 6px 15px rgba(142, 142, 142, 0.2);
    flex-shrink: 0;

    .left,
    .right {
      width: 50px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }

    .left {
      position: relative;

      > span {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;

        &:hover {
          background-color: #ffffff0d;
        }
      }

      // 搜索引擎选择器
      .engine-selector {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: 150px;
        background-color: #1e1e1ee6;
        border-radius: 10px;
        box-shadow: 0 6px 15px rgba(142, 142, 142, 0.2);
        backdrop-filter: blur(8px);
        padding: 6px;
        z-index: 100;

        .engine-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 8px;
          color: #ffffffe6;
          transition: background-color 0.2s;

          &:hover {
            background-color: #ffffff1a;
          }

          &.active {
            background-color: #ffffff1a;
          }

          span:first-child {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }

    .right {
      > span {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;

        &:hover {
          background-color: #ffffff0d;
        }
      }
    }

    .center {
      height: 100%;
      font-size: 15px;
      flex: 1;
      display: flex;
      align-items: center;

      input {
        flex: 1;
        background-color: transparent;
        border: none;
        outline: none;
        height: 100%;
        color: #ffffff;
        text-align: center;

        &::selection {
          background: #59696e;
          color: #ffffff;
        }
      }

      .i-icon {
        cursor: pointer;
        user-select: none;
      }
    }
  }

  .search-tips {
    width: 640px;
    height: 300px;
    background-color: #0000001a;
    border-radius: 5px;
    backdrop-filter: blur(30px) saturate(1.25);
    margin-top: 10px;
    color: #555;
    box-shadow: 0 6px 15px rgba(142, 142, 142, 0.2);
    backdrop-filter: blur(8px);
    overflow-y: scroll;
    border-radius: 14px;
    padding: 6px;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
      background-color: rgba(0, 0, 0, 0.05);
    }

    .search-tips-item {
      padding: 6px 10px;
      cursor: pointer;
      user-select: none;
      border-radius: 3px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      color: #ffffffe6;
      border-radius: 10px;

      &:hover {
        background-color: #ffffff1a;
      }

      .link {
        display: flex;
        align-items: center;

        img {
          height: 30px;
          width: 30px;
        }

        div {
          padding-left: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          h5 {
            font-size: 14px;
            margin: 0;
          }

          p {
            font-size: 12px;
            margin: 0;
          }
        }
      }
    }

    .search-tips-item.active {
      background-color: #ffffff1a;
    }
  }

  .toolbar {
    position: absolute;
    right: 10px;
    bottom: 10px;
    color: rgba(0, 0, 0, 0.8);
    font-size: 20px;
    display: flex;
    list-style: none;
    margin: 0;

    li {
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

@keyframes fade-in-scale {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  48% {
    opacity: 1;
    transform: scale(1.03);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
