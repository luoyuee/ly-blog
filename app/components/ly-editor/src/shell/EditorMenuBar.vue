<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { useLyEditorModal } from "@ly-editor";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { useLyEditorStore, useUserStore } from "@/stores";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { useFullscreen } from "@vueuse/core";

const { t } = useI18n();

const lyEditorStore = useLyEditorStore();
const userStore = useUserStore();

const { open: openNoticeManager } = useLyEditorModal("notice-manager");
const { open: openSendEmail } = useLyEditorModal("send-email");
const { openTabPanel } = useLyEditorTabs();

const dropdownMenu = computed<{ key: number; name: string; items: DropdownMenuItem[] }[]>(() => [
  {
    key: 1,
    name: t("components.lyEditor.shell.menuBar.file"),
    items: [
      {
        label: t("components.lyEditor.shell.menuBar.newFile"),
        icon: "lucide:file-plus",
        onSelect: () => {}
      },
      {
        label: t("components.lyEditor.shell.menuBar.newFolder"),
        icon: "lucide:folder-plus",
        onSelect: () => {}
      }
    ]
  },
  {
    key: 2,
    name: t("components.lyEditor.shell.menuBar.edit"),
    items: [
      {
        label: t("components.lyEditor.shell.menuBar.insertCard"),
        onSelect: () => {}
      }
    ]
  }
]);

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

const togglePreview = () => {
  lyEditorStore.preview.show = !lyEditorStore.preview.show;
};

const toggleSidebar = () => {
  lyEditorStore.sidebar.show = !lyEditorStore.sidebar.show;
};

const userDropdownMenuItem = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Luoyue",
      type: "label"
    }
  ],
  [
    {
      label: t("components.lyEditor.shell.menuBar.userInfo"),
      icon: "lucide:user",
      onSelect: () => {
        openTabPanel({
          key: LyEditorTabPanelEnum.UserPanel,
          label: t("components.lyEditor.shell.menuBar.userInfo"),
          type: LyEditorTabPanelEnum.UserPanel
        });
      }
    }
  ],
  [
    {
      label: t("components.lyEditor.shell.menuBar.logout"),
      icon: "lucide:log-out",
      onSelect: () => {}
    }
  ]
]);

const openNoticeManagerModal = async () => {
  await openNoticeManager(undefined);
};

const openSendEmailModal = async () => {
  await openSendEmail(undefined);
};
</script>

<template>
  <nav class="ly-editor-menu-bar">
    <div class="menu-bar-logo">
      <img src="/ly.svg" alt="logo" class="logo" />
    </div>
    <div class="menu-bar-start-group" @click.stop>
      <UDropdownMenu
        v-for="item in dropdownMenu"
        :key="item.key"
        :items="item.items"
        :ui="{
          content: 'w-48 divide-gray-700 ring-gray-700',
          item: 'cursor-pointer'
        }"
      >
        <div class="menu-bar-item">
          {{ item.name }}
        </div>
      </UDropdownMenu>
    </div>

    <div class="menu-bar-center-group"></div>

    <div class="menu-bar-end-group"></div>

    <div class="menu-bar-window-controls">
      <UTooltip
        :text="$t('components.lyEditor.shell.menuBar.toggleMainSidebar')"
        :content="{ side: 'bottom' }"
      >
        <div @click="toggleSidebar">
          <UIcon :name="lyEditorStore.sidebar.show ? 'custom:left-bar-fill' : 'custom:left-bar'" />
        </div>
      </UTooltip>
      <UTooltip
        :text="$t('components.lyEditor.shell.menuBar.toggleAuxSidebar')"
        :content="{ side: 'bottom' }"
      >
        <div @click="togglePreview">
          <UIcon
            :name="lyEditorStore.preview.show ? 'custom:right-bar-fill' : 'custom:right-bar'"
          />
        </div>
      </UTooltip>
      <UTooltip
        :text="$t('components.lyEditor.shell.menuBar.toggleFullscreen')"
        :content="{ side: 'bottom' }"
      >
        <div @click="toggleFullscreen">
          <UIcon :name="isFullscreen ? 'custom:off-screen' : 'custom:full-screen'" />
        </div>
      </UTooltip>
      <UTooltip
        :text="$t('components.lyEditor.shell.menuBar.message')"
        :content="{ side: 'bottom' }"
      >
        <div @click="openNoticeManagerModal">
          <UIcon name="lucide:bell" />
        </div>
      </UTooltip>
      <UTooltip
        :text="$t('components.lyEditor.shell.menuBar.notice')"
        :content="{ side: 'bottom' }"
      >
        <div @click="openNoticeManagerModal">
          <UIcon name="custom:notice" />
        </div>
      </UTooltip>
      <UTooltip :text="$t('components.lyEditor.shell.menuBar.mail')" :content="{ side: 'bottom' }">
        <div @click="openSendEmailModal">
          <UIcon name="lucide:mail" />
        </div>
      </UTooltip>
      <UTooltip :text="$t('components.lyEditor.shell.menuBar.home')" :content="{ side: 'bottom' }">
        <div v-navigate-to._blank="'/'">
          <UIcon name="custom:home" />
        </div>
      </UTooltip>
    </div>
    <div class="flex pl-2 pr-3 items-center">
      <UDropdownMenu
        :items="userDropdownMenuItem"
        :ui="{
          content: 'w-48 divide-gray-700 ring-gray-700',
          item: 'cursor-pointer'
        }"
      >
        <UAvatar
          :src="userStore.profile?.avatar ?? '/images/avatar.webp'"
          size="xs"
          class="cursor-pointer"
        />
      </UDropdownMenu>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.ly-editor-menu-bar {
  height: var(--ly-editor-menu-bar-height);
  background-color: var(--ly-editor-toolbar-background);
  color: var(--ly-editor-foreground);
  display: flex;
  overflow: hidden;

  .menu-bar-logo {
    flex-shrink: 0;
    width: var(--ly-editor-activity-bar-width);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .logo {
      width: 28px;
      height: 28px;
    }
  }
  .menu-bar-start-group,
  .menu-bar-center-group,
  .menu-bar-end-group {
    flex: 1;
    display: flex;
    align-items: center;
    list-style: none;
    height: 100%;
    font-size: 0.875rem;

    .menu-bar-item {
      padding: 4px 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 4px;
      &:hover {
        background-color: var(--ly-editor-luminosity-plus2);
      }
    }
  }
  .menu-bar-window-controls {
    flex-shrink: 0;
    display: flex;
    list-style: none;
    align-items: center;
    font-size: 1rem;

    div {
      padding: 6px 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 4px;
      &:hover {
        background-color: var(--ly-editor-luminosity-plus2);
      }
    }
  }
}
</style>
