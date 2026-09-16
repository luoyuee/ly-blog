<script setup lang="ts">
import type { ActivityMenuItem, EditorTabItem } from "#shared/types/ly-editor";
import { LyEditorActivityMenuEnum, LyEditorTabPanelEnum } from "#shared/enums";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { useLyEditorStore } from "@/stores";

const { t } = useI18n();

const { openTabPanel } = useLyEditorTabs();

const lyEditorStore = useLyEditorStore();

const activityMenu = computed<ActivityMenuItem[]>(() => [
  {
    key: LyEditorActivityMenuEnum.NoteManager,
    label: t("components.lyEditor.shell.activityBar.noteManager"),
    icon: "lucide:files"
  },
  {
    key: LyEditorActivityMenuEnum.ArticleManager,
    label: t("components.lyEditor.shell.activityBar.articleManager"),
    icon: "custom:send"
  },
  {
    key: LyEditorActivityMenuEnum.SearchPanel,
    label: t("components.lyEditor.shell.activityBar.search"),
    icon: "lucide:search"
  },
  {
    key: LyEditorActivityMenuEnum.ImageManager,
    label: t("components.lyEditor.shell.activityBar.imageManager"),
    icon: "custom:pic"
  },
  {
    key: LyEditorActivityMenuEnum.AttachmentManager,
    label: t("components.lyEditor.shell.activityBar.attachmentManager"),
    icon: "lucide:folder-open"
  },
  {
    key: LyEditorActivityMenuEnum.HitokotoManager,
    label: t("components.lyEditor.shell.activityBar.hitokotoManager"),
    icon: "custom:hitokoto"
  },
  {
    key: LyEditorActivityMenuEnum.NavigationManager,
    label: t("components.lyEditor.shell.activityBar.navigationManager"),
    icon: "lucide:link",
    panel: LyEditorTabPanelEnum.NavigationWebsitePanel
  },
  {
    key: LyEditorActivityMenuEnum.WorkManager,
    label: t("components.lyEditor.shell.activityBar.workManager"),
    icon: "lucide:briefcase"
  },
  {
    key: LyEditorActivityMenuEnum.ApiKeyManager,
    label: t("components.lyEditor.shell.activityBar.apiKeyManager"),
    icon: "lucide:key",
    panel: LyEditorTabPanelEnum.ApiKeyPanel
  },
  {
    key: LyEditorActivityMenuEnum.WhiteboardManager,
    label: t("components.lyEditor.shell.activityBar.whiteboardManager"),
    icon: "lucide:pencil-sparkles"
  },
  {
    key: LyEditorActivityMenuEnum.KanbanManager,
    label: t("components.lyEditor.shell.activityBar.kanbanManager"),
    icon: "lucide:square-kanban"
  },
  {
    key: LyEditorActivityMenuEnum.FlowchartManager,
    label: t("components.lyEditor.shell.activityBar.flowchartManager"),
    icon: "lucide:workflow"
  },
  {
    key: LyEditorActivityMenuEnum.MindmapManager,
    label: t("components.lyEditor.shell.activityBar.mindmapManager"),
    icon: "lucide:network"
  },
  {
    key: LyEditorActivityMenuEnum.CalendarManager,
    label: t("components.lyEditor.shell.activityBar.calendarManager"),
    icon: "lucide:calendar",
    panel: LyEditorTabPanelEnum.CalendarPanel
  }
]);

const actionMenu = computed<ActivityMenuItem[]>(() => [
  {
    key: LyEditorActivityMenuEnum.DashboardPanel,
    label: t("components.lyEditor.shell.activityBar.dashboard"),
    icon: "lucide:chart-column",
    panel: LyEditorTabPanelEnum.DashboardPanel
  },
  {
    key: LyEditorActivityMenuEnum.CronJobPanel,
    label: t("components.lyEditor.shell.activityBar.cronJob"),
    icon: "lucide:timer",
    panel: LyEditorTabPanelEnum.CronJobPanel
  },
  {
    key: LyEditorActivityMenuEnum.SettingPanel,
    label: t("components.lyEditor.shell.activityBar.setting"),
    icon: "lucide:settings",
    panel: LyEditorTabPanelEnum.SettingPanel
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
