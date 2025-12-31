<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { useFullscreen } from "@vueuse/core";
import { useLyEditorStore, useUserStore } from "@/stores";
import NoticeManagerModal from "./components/notice-manager/NoticeManagerModal.vue";

const lyEditorStore = useLyEditorStore();
const userStore = useUserStore();

const dropdownMenu = ref<{ key: number; name: string; items: DropdownMenuItem[] }[]>([
  {
    key: 1,
    name: "文件",
    items: [
      {
        label: "新建文件",
        icon: "ep:document-add",
        onSelect: () => {}
      },
      {
        label: "新建文件夹",
        icon: "ep:folder-add",
        onSelect: () => {}
      }
    ]
  },
  {
    key: 2,
    name: "编辑",
    items: [
      {
        label: "插入Card",
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

const userDropdownMenuItem = ref<DropdownMenuItem[]>([
  [
    {
      label: "Luoyue",
      type: "label"
    }
  ],
  [
    {
      label: "用户信息",
      icon: "i-lucide-user"
    }
  ],
  [
    {
      label: "退出登录",
      icon: "i-lucide-log-out"
    }
  ]
]);

const noticeManagerModalRef = useTemplateRef("noticeManagerModalRef");

const openNoticeManagerModal = () => {
  noticeManagerModalRef.value?.open();
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
      <UTooltip text="切换主侧栏" :content="{ side: 'bottom' }">
        <div @click="toggleSidebar">
          <UIcon :name="lyEditorStore.sidebar.show ? 'custom:left-bar-fill' : 'custom:left-bar'" />
        </div>
      </UTooltip>
      <UTooltip text="切换辅助侧栏" :content="{ side: 'bottom' }">
        <div @click="togglePreview">
          <UIcon
            :name="lyEditorStore.preview.show ? 'custom:right-bar-fill' : 'custom:right-bar'"
          />
        </div>
      </UTooltip>
      <UTooltip text="切换全屏" :content="{ side: 'bottom' }">
        <div @click="toggleFullscreen">
          <UIcon :name="isFullscreen ? 'custom:off-screen' : 'custom:full-screen'" />
        </div>
      </UTooltip>
      <UTooltip text="公告" :content="{ side: 'bottom' }">
        <div @click="openNoticeManagerModal">
          <UIcon name="lucide:bell" />
        </div>
      </UTooltip>
      <UTooltip text="首页" :content="{ side: 'bottom' }">
        <div v-navigate-to="'/'">
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
          :src="userStore.userInfo?.avatar ?? '/images/avatar.webp'"
          size="xs"
          class="cursor-pointer"
        />
      </UDropdownMenu>
    </div>

    <NoticeManagerModal ref="noticeManagerModalRef" />
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
