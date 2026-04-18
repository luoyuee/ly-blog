<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import {
  ArticleSetting,
  AuthorCardSetting,
  MePageSettingCard,
  BasicSettingCard,
  BeianSettingCard,
  CzdbSettingCard,
  FleetingThoughtSettingCard,
  MessageBoardSettingCard,
  HeroSetting,
  NavMenuSetting,
  HitokotoSettingCard,
  MailerSettingCard,
  SwiperSettingCard,
  Live2dSettingCard
} from "@/components/setting-card";
import { useConfigStore, useServerConfigStore } from "@/stores";

const configStore = useConfigStore();
const serverConfigStore = useServerConfigStore();

type SettingMenuItemConfig = {
  label: string;
  icon: string;
  id: string;
};

/** 左侧设置导航项配置，id 与右侧设置卡片根节点 id 一一对应 */
const settingMenuGroups: SettingMenuItemConfig[][] = [
  [
    { label: "文章设置", icon: "i-lucide-file-text", id: "article-setting" },
    { label: "作者卡片", icon: "i-lucide-user-round", id: "author-card-setting" },
    { label: "个人页配置", icon: "i-lucide-id-card", id: "me-page-setting" },
    { label: "基本信息", icon: "i-lucide-settings-2", id: "basic-setting" },
    { label: "备案信息", icon: "i-lucide-shield-check", id: "beian-setting" },
    { label: "顶部背景", icon: "i-lucide-image", id: "hero-setting" },
    { label: "导航菜单", icon: "i-lucide-panel-top", id: "nav-menu-setting" },
    { label: "轮播图", icon: "i-lucide-images", id: "swiper-setting" }
  ],
  [
    { label: "闪念笔记", icon: "i-lucide-notebook-pen", id: "fleeting-thought-setting" },
    { label: "留言板", icon: "i-lucide-messages-square", id: "message-board-setting" },
    { label: "一言", icon: "i-lucide-quote", id: "hitokoto-setting" },
    { label: "邮件设置", icon: "i-lucide-mail", id: "mailer-setting" },
    { label: "CZDB 设置", icon: "i-lucide-database", id: "czdb-setting" },
    { label: "Live2D", icon: "i-lucide-bot", id: "live2d-setting" }
  ]
] as const;

const contentRef = useTemplateRef("contentRef");
/** 当前激活的设置项 id，用于驱动左侧导航高亮 */
const activeSettingId = ref("article-setting");
/**
 * 标记当前是否允许通过滚动位置同步左侧高亮。
 * - 点击左侧导航后会暂时关闭，避免程序化滚动立刻覆盖点击结果
 * - 用户主动滚动右侧内容区后再重新开启
 */
const shouldSyncActiveOnScroll = ref(true);

/** 当前右侧滚动容器绑定的滚动监听卸载函数 */
let removeScrollListener: (() => void) | null = null;
/** requestAnimationFrame 节流标记，避免滚动时重复执行高亮计算 */
let scrollSyncFrameId: number | null = null;

/**
 * 用户主动滚动内容区时，重新启用“根据滚动位置同步高亮”的能力。
 */
const enableScrollSync = () => {
  shouldSyncActiveOnScroll.value = true;
};

/**
 * 根据设置卡片 id 滚动到目标区域。
 * 点击左侧导航时会先写入 activeSettingId，确保导航立即反馈当前点击项。
 */
const scrollToSettingCard = (targetId: string) => {
  if (!targetId || !contentRef.value) {
    return;
  }

  shouldSyncActiveOnScroll.value = false;
  activeSettingId.value = targetId;

  const targetElement = contentRef.value.querySelector<HTMLElement>(`#${targetId}`);

  if (!targetElement) {
    return;
  }

  targetElement.scrollIntoView({
    behavior: "instant",
    block: "start"
  });
};

/**
 * 生成单个导航菜单项。
 * `active` 由当前激活 id 决定，用于驱动 Nuxt UI 内建高亮。
 */
const createNavigationItem = (item: SettingMenuItemConfig): NavigationMenuItem => {
  const isActive = activeSettingId.value === item.id;

  return {
    label: item.label,
    icon: item.icon,
    id: item.id,
    value: item.id,
    active: isActive,
    onSelect: () => {
      scrollToSettingCard(item.id);
    }
  };
};

/** 所有设置卡片 id 的平铺列表，用于滚动时遍历定位当前高亮项 */
const settingSectionIds = computed(() => {
  return settingMenuGroups.flat().map((item) => item.id);
});

/**
 * 根据右侧滚动容器中各设置卡片距离顶部的距离，计算当前最接近顶部的卡片，
 * 并同步到左侧导航高亮。
 */
const syncActiveSetting = () => {
  if (!contentRef.value) {
    return;
  }

  const containerRect = contentRef.value.getBoundingClientRect();
  const topOffset = containerRect.top + 24;

  let nextActiveId = activeSettingId.value;
  let minDistance = Number.POSITIVE_INFINITY;

  settingSectionIds.value.forEach((id) => {
    const element = contentRef.value?.querySelector<HTMLElement>(`#${id}`);

    if (!element) {
      return;
    }

    const distance = Math.abs(element.getBoundingClientRect().top - topOffset);

    if (distance < minDistance) {
      minDistance = distance;
      nextActiveId = id;
    }
  });

  activeSettingId.value = nextActiveId;
};

/**
 * 使用 requestAnimationFrame 对滚动高亮同步进行节流。
 * 在一帧内只会执行一次高亮计算，避免滚动事件高频触发造成重复计算。
 */
const scheduleSyncActiveSetting = () => {
  if (scrollSyncFrameId !== null) {
    return;
  }

  scrollSyncFrameId = requestAnimationFrame(() => {
    scrollSyncFrameId = null;
    syncActiveSetting();
  });
};

/**
 * 为右侧滚动容器绑定滚动监听。
 * 每次重新绑定前都应先调用 removeScrollListener 清理旧监听，避免重复绑定。
 */
const bindScrollListener = () => {
  if (!contentRef.value) {
    return;
  }

  const handleScroll = () => {
    if (!shouldSyncActiveOnScroll.value) {
      return;
    }

    scheduleSyncActiveSetting();
  };

  contentRef.value.addEventListener("scroll", handleScroll, { passive: true });
  removeScrollListener = () => {
    contentRef.value?.removeEventListener("scroll", handleScroll);
    removeScrollListener = null;
  };
};

/** 根据静态导航配置生成 Nuxt UI 需要的菜单项结构 */
const settingMenuItems = computed<NavigationMenuItem[][]>(() => {
  return settingMenuGroups.map((group) => {
    return group.map((item) => createNavigationItem(item));
  });
});

const state = reactive({
  initializing: true
});

/** 初始化左右两侧依赖的数据源 */
onMounted(() => {
  Promise.all([configStore.fetch(), serverConfigStore.fetch()]).finally(() => {
    state.initializing = false;
  });
});

/**
 * 初始化完成后再绑定滚动监听，确保右侧设置卡片已经渲染出来。
 */
watch(
  () => state.initializing,
  async (initializing) => {
    if (initializing) {
      removeScrollListener?.();
      return;
    }

    await nextTick();

    removeScrollListener?.();
    bindScrollListener();
    syncActiveSetting();
  }
);

/**
 * 当右侧滚动容器引用变化时，重新绑定滚动监听。
 * 这能避免因条件渲染导致的旧 DOM 监听失效问题。
 */
watch(
  () => contentRef.value,
  async (element) => {
    if (!element || state.initializing) {
      return;
    }

    await nextTick();

    removeScrollListener?.();
    bindScrollListener();
    syncActiveSetting();
  }
);

/** 组件销毁前移除滚动监听，避免事件残留 */
onBeforeUnmount(() => {
  if (scrollSyncFrameId !== null) {
    cancelAnimationFrame(scrollSyncFrameId);
    scrollSyncFrameId = null;
  }

  removeScrollListener?.();
});
</script>
<template>
  <div class="h-full p-4">
    <div v-if="state.initializing" class="w-full h-full flex items-center justify-center">
      <UIcon name="i-lucide-loader-circle" :size="32" class="text-primary animate-spin" />
    </div>
    <div v-else class="grid h-full grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside
        class="hidden overflow-hidden rounded-lg border border-default bg-black/20 p-3 lg:block"
      >
        <UNavigationMenu
          orientation="vertical"
          :items="settingMenuItems"
          highlight
          class="w-full"
          :ui="{
            link: 'transition-colors duration-150 rounded-md',
            childLink: 'transition-colors duration-150 rounded-md'
          }"
        />
      </aside>

      <div
        ref="contentRef"
        class="space-y-4 overflow-y-auto pr-1"
        @pointerdown="enableScrollSync"
        @wheel="enableScrollSync"
        @touchstart="enableScrollSync"
      >
        <ArticleSetting class="bg-black/30" />
        <AuthorCardSetting class="bg-black/30" />
        <MePageSettingCard class="bg-black/30" />
        <BasicSettingCard class="bg-black/30" />
        <BeianSettingCard class="bg-black/30" />
        <HeroSetting class="bg-black/30" />
        <NavMenuSetting class="bg-black/30" />
        <SwiperSettingCard class="bg-black/30" />
        <FleetingThoughtSettingCard class="bg-black/30" />
        <MessageBoardSettingCard class="bg-black/30" />
        <HitokotoSettingCard class="bg-black/30" />
        <MailerSettingCard class="bg-black/30" />
        <CzdbSettingCard class="bg-black/30" />
        <Live2dSettingCard class="bg-black/30" />
      </div>
    </div>
  </div>
</template>
