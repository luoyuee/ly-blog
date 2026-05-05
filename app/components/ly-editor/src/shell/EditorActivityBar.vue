<script setup lang="ts">
import type { ActivityMenuItem, EditorTabItem } from "#shared/types/ly-editor";
import { LyEditorActivityMenu, LyEditorTabPanel } from "#shared/constants";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { useLyEditorStore } from "@/stores";

const { openTabPanel } = useLyEditorTabs();

const lyEditorStore = useLyEditorStore();

const activityMenu = ref<ActivityMenuItem[]>([
  {
    key: LyEditorActivityMenu.NoteManager,
    label: "笔记管理",
    icon: "custom:copy-file"
  },
  {
    key: LyEditorActivityMenu.ArticleManager,
    label: "文章管理",
    icon: "custom:send"
  },
  {
    key: LyEditorActivityMenu.SearchPanel,
    label: "搜索",
    icon: "custom:search"
  },
  {
    key: LyEditorActivityMenu.ImageManager,
    label: "图片管理器",
    icon: "custom:pic"
  },
  {
    key: LyEditorActivityMenu.HitokotoManager,
    label: "一言管理",
    icon: "custom:hitokoto"
  },
  {
    key: LyEditorActivityMenu.NavigationManager,
    label: "导航网站",
    icon: "ep:link",
    panel: LyEditorTabPanel.NavigationWebsitePanel
  },
  {
    key: LyEditorActivityMenu.WorkManager,
    label: "项目管理",
    icon: "ep:briefcase"
  }
]);

const actionMenu = ref<ActivityMenuItem[]>([
  {
    key: LyEditorActivityMenu.DashboardPanel,
    label: "仪表盘",
    icon: "ep:histogram",
    panel: LyEditorTabPanel.DashboardPanel
  },
  {
    key: LyEditorActivityMenu.CronJobPanel,
    label: "定时任务",
    icon: "ep:timer",
    panel: LyEditorTabPanel.CronJobPanel
  },
  {
    key: LyEditorActivityMenu.SettingPanel,
    label: "设置",
    icon: "custom:setting",
    panel: LyEditorTabPanel.SettingPanel
  }
]);

const handleClickMenu = (e: ActivityMenuItem) => {
  lyEditorStore.sidebar.active = e.key;

  if (e.onClick) e.onClick();

  if (!e.panel) return;

  openTabPanel({
    key: e.panel,
    label: e.label,
    type: e.panel
  } as EditorTabItem);
};

const handleClickAction = (e: ActivityMenuItem) => {
  if (e.onClick) e.onClick();

  if (!e.panel) return;

  openTabPanel({
    key: e.panel,
    label: e.label,
    type: e.panel
  } as EditorTabItem);
};
</script>

<template>
  <aside class="ly-editor-activity-bar">
    <ul class="activity-bar-start-group">
      <UTooltip
        v-for="item in activityMenu"
        :key="item.key"
        :text="item.label"
        :content="{ side: 'left' }"
      >
        <li
          class="item"
          :class="{ active: lyEditorStore.sidebar.active === item.key }"
          @click="handleClickMenu(item)"
        >
          <UIcon :name="item.icon" class="size-5" />
        </li>
      </UTooltip>
    </ul>
    <ul class="activity-bar-end-group">
      <UTooltip
        v-for="item in actionMenu"
        :key="item.key"
        :text="item.label"
        :content="{ side: 'left' }"
      >
        <li class="item" @click="handleClickAction(item)">
          <UIcon :name="item.icon" class="size-6" />
        </li>
      </UTooltip>
    </ul>
  </aside>
</template>

<style scoped lang="scss">
.ly-editor-activity-bar {
  width: var(--ly-editor-activity-bar-width);
  height: 100%;
  background-color: var(--ly-editor-toolbar-background);
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  color: var(--ly-editor-foreground);

  .activity-bar-start-group,
  .activity-bar-end-group {
    .item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 0;
      cursor: pointer;
      position: relative;

      &:hover {
        background-color: var(--ly-editor-luminosity-plus2);
      }
    }

    .item.active {
      background-color: var(--ly-editor-luminosity-plus2);

      &::before {
        content: "";
        position: absolute;
        width: 3px;
        height: 100%;
        left: 0;
        top: 0;
        background-color: var(--ly-editor-active-color);
      }
    }
  }

  .activity-bar-start-group {
    flex: 1;
  }
}
</style>
