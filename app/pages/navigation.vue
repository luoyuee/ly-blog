<script setup lang="ts">
import { useNow, useDateFormat } from "@vueuse/core";
import { Dock, DockOverlay, SearchBox } from "@/components/navigation";
import { computed, useTemplateRef } from "vue";
import type { DockItem } from "~/components/navigation/src/types";

definePageMeta({
  layout: "blank"
});

type NavigationSurfaceState = "idle" | "search" | "overlay";

interface SearchBoxInstance {
  open: () => Promise<void>;
  close: () => void;
  reset: () => void;
}

interface DockOverlayInstance {
  show: () => Promise<void>;
  hide: () => Promise<void>;
}

const currentTime = useDateFormat(useNow({ interval: 30 * 1000 }), "HH:mm");

/**
 * 页面只维护一个顶层状态，避免 blur、SearchBox、DockOverlay 各自维护布尔值后互相打架。
 */
const surfaceState = ref<NavigationSurfaceState>("idle");

/**
 * SearchBox 需要在 DockOverlay 关闭动画结束后再显示，因此额外保留一个显示开关。
 */
const isSearchBoxVisible = ref(true);

/**
 * 当页面主动关闭 SearchBox 去切换别的界面时，记录 close 事件应该落到的目标状态，
 * 防止 SearchBox 自身的 close 事件把页面重新误判成 idle。
 */
const pendingSearchCloseState = ref<NavigationSurfaceState | null>(null);

const isBlurActive = computed(() => surfaceState.value !== "idle");
const shouldRenderSearchBox = computed(
  () => isSearchBoxVisible.value && surfaceState.value !== "overlay"
);

const searchPanelRef = ref<SearchBoxInstance | null>(null);

/**
 * DockOverlay 通过显式 show/hide 管理动画，因此页面层也统一走 imperative API。
 */
const dockOverlayRef = useTemplateRef<DockOverlayInstance>("dockOverlayRef");

/**
 * 包装 SearchBox.close() 的目标状态，确保 close 事件回流时不会覆盖页面当前意图。
 */
const closeSearchBoxToState = (targetState: NavigationSurfaceState) => {
  pendingSearchCloseState.value = targetState;
  searchPanelRef.value?.close();
  pendingSearchCloseState.value = null;
};

/**
 * 显示快捷入口面板时，统一恢复搜索框默认按钮态。
 */
const showDockOverlay = async () => {
  if (surfaceState.value === "overlay") {
    return;
  }

  surfaceState.value = "overlay";
  isSearchBoxVisible.value = false;
  closeSearchBoxToState("overlay");
  await dockOverlayRef.value?.show();
};

/**
 * 关闭 DockOverlay 后恢复为默认页面状态，并在动画结束后再显示 SearchBox。
 */
const hideDockOverlay = async () => {
  if (surfaceState.value !== "overlay") {
    return;
  }

  await dockOverlayRef.value?.hide();
  surfaceState.value = "idle";
  isSearchBoxVisible.value = true;
};

/**
 * 点击空白区域时，统一恢复页面初始显示状态。
 */
const resetPageState = async () => {
  switch (surfaceState.value) {
    case "overlay": {
      await hideDockOverlay();
      break;
    }
    case "search": {
      searchPanelRef.value?.close();
      break;
    }
    default: {
      isSearchBoxVisible.value = true;
      break;
    }
  }
};

/**
 * Dock 当前所有入口都走同一套 overlay 展示逻辑，便于后续扩展差异化分支。
 */
const handleItemClick = async (item: DockItem) => {
  switch (item.id) {
    default:
      await showDockOverlay();
      break;
  }
};

const handleBgClick = async () => {
  await resetPageState();
};

/**
 * SearchBox 进入输入态时直接切到 search 状态，由派生状态统一控制背景模糊。
 */
const handleSearchOpen = () => {
  surfaceState.value = "search";
  isSearchBoxVisible.value = true;
};

/**
 * SearchBox close 事件既可能来自用户主动关闭，也可能来自页面为了切换 overlay 而调用 close，
 * 因此需要以 pendingSearchCloseState 为准来决定最终状态。
 */
const handleSearchClose = () => {
  surfaceState.value = pendingSearchCloseState.value ?? "idle";
  isSearchBoxVisible.value = surfaceState.value !== "overlay";
};
</script>

<template>
  <div class="start-page">
    <div
      class="start-page__bg"
      :class="{ 'start-page__bg--blur': isBlurActive }"
      @click="handleBgClick"
    ></div>

    <div class="start-page__content">
      <div class="start-page__time">{{ currentTime }}</div>
      <Transition name="search-box-fade">
        <SearchBox
          v-show="shouldRenderSearchBox"
          ref="searchPanelRef"
          @open="handleSearchOpen"
          @close="handleSearchClose"
        />
      </Transition>
      <DockOverlay ref="dockOverlayRef" />
    </div>

    <Dock @click-item="handleItemClick" />
  </div>
</template>

<style scoped lang="scss">
.start-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: 0;
    background: url(/api/image/random/background) center / cover no-repeat;
    filter: brightness(0.85);
    transition: all 0.4s ease;
  }

  &__bg--blur {
    filter: brightness(0.85) blur(10px);
    transform: scale(1.1);
  }

  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 120px;
    gap: 24px;
  }

  &__time {
    font-size: 4rem;
    font-weight: 300;
    color: #fff;
    letter-spacing: 4px;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
    user-select: none;
  }
}

.search-box-fade-enter-active,
.search-box-fade-leave-active {
  transition: none;
}

.search-box-fade-enter-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.search-box-fade-enter-from,
.search-box-fade-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}

.search-box-fade-enter-to,
.search-box-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
