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
import { useConfigStore, useMePageConfigStore, useServerConfigStore } from "@/stores";
import SettingConfigTransfer from "./SettingConfigTransfer.vue";

const { t } = useI18n();

const configStore = useConfigStore();
const mePageConfigStore = useMePageConfigStore();
const serverConfigStore = useServerConfigStore();

type SettingMenuItemConfig = {
  label: string;
  icon: string;
  id: string;
};

const settingMenuGroups = computed<SettingMenuItemConfig[][]>(() => [
  [
    {
      label: t("components.lyEditor.modules.settings.sections.article"),
      icon: "lucide:file-text",
      id: "article-setting"
    },
    {
      label: t("components.lyEditor.modules.settings.sections.authorCard"),
      icon: "lucide:user-round",
      id: "author-card-setting"
    },
    {
      label: t("components.lyEditor.modules.settings.sections.mePage"),
      icon: "lucide:id-card",
      id: "me-page-setting"
    },
    {
      label: t("components.lyEditor.modules.settings.sections.basic"),
      icon: "lucide:settings-2",
      id: "basic-setting"
    },
    {
      label: t("components.lyEditor.modules.settings.sections.beian"),
      icon: "lucide:shield-check",
      id: "beian-setting"
    },
    {
      label: t("components.lyEditor.modules.settings.sections.hero"),
      icon: "lucide:image",
      id: "hero-setting"
    },
    {
      label: t("components.lyEditor.modules.settings.sections.navMenu"),
      icon: "lucide:panel-top",
      id: "nav-menu-setting"
    },
    {
      label: t("components.lyEditor.modules.settings.sections.swiper"),
      icon: "lucide:images",
      id: "swiper-setting"
    }
  ],
  [
    {
      label: t("components.lyEditor.modules.settings.sections.fleetingThought"),
      icon: "lucide:notebook-pen",
      id: "fleeting-thought-setting"
    },
    {
      label: t("components.lyEditor.modules.settings.sections.messageBoard"),
      icon: "lucide:messages-square",
      id: "message-board-setting"
    },
    {
      label: t("components.lyEditor.modules.settings.sections.hitokoto"),
      icon: "lucide:quote",
      id: "hitokoto-setting"
    },
    {
      label: t("components.lyEditor.modules.settings.sections.mailer"),
      icon: "lucide:mail",
      id: "mailer-setting"
    },
    {
      label: t("components.lyEditor.modules.settings.sections.czdb"),
      icon: "lucide:database",
      id: "czdb-setting"
    },
    { label: "Live2D", icon: "lucide:bot", id: "live2d-setting" }
  ]
]);

const contentRef = useTemplateRef("contentRef");
const activeSettingId = ref("article-setting");
const shouldSyncActiveOnScroll = ref(true);

let removeScrollListener: (() => void) | null = null;
let scrollSyncFrameId: number | null = null;

const enableScrollSync = () => {
  shouldSyncActiveOnScroll.value = true;
};

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

const settingSectionIds = computed(() => {
  return settingMenuGroups.value.flat().map((item) => item.id);
});

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

const scheduleSyncActiveSetting = () => {
  if (scrollSyncFrameId !== null) {
    return;
  }

  scrollSyncFrameId = requestAnimationFrame(() => {
    scrollSyncFrameId = null;
    syncActiveSetting();
  });
};

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

const settingMenuItems = computed<NavigationMenuItem[][]>(() => {
  return settingMenuGroups.value.map((group) => {
    return group.map((item) => createNavigationItem(item));
  });
});

const state = reactive({
  initializing: true
});

onMounted(() => {
  Promise.all([configStore.fetch(), mePageConfigStore.fetch(), serverConfigStore.fetch()]).finally(
    () => {
      state.initializing = false;
    }
  );
});

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
      <UIcon name="lucide:loader-circle" :size="32" class="text-primary animate-spin" />
    </div>
    <div v-else class="h-full flex gap-4">
      <aside
        class="w-48 overflow-hidden rounded-lg border border-default bg-black/20 p-3 flex flex-col justify-between"
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

        <div>
          <USeparator class="my-2" />
          <SettingConfigTransfer />
        </div>
      </aside>

      <div
        ref="contentRef"
        class="space-y-4 overflow-y-auto flex-1"
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
