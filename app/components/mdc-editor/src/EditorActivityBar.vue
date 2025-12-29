<script setup lang="ts">
import type { ActivityMenuItem } from "./types";
import { useMdcEditorStore } from "@/stores";
import { MdcEditorActivityMenu } from "#shared/constants";

const mdcEditorStore = useMdcEditorStore();

const activityMenu = ref<ActivityMenuItem[]>([
  {
    key: MdcEditorActivityMenu.NoteManager,
    label: "笔记管理",
    icon: "custom:copy-file"
  },
  {
    key: MdcEditorActivityMenu.ArticleManager,
    label: "文章管理",
    icon: "custom:send"
  },
  {
    key: MdcEditorActivityMenu.SearchPanel,
    label: "搜索",
    icon: "custom:search"
  },
  {
    key: MdcEditorActivityMenu.ImageManager,
    label: "图片管理器",
    icon: "custom:pic"
  },
  {
    key: MdcEditorActivityMenu.HitokotoManager,
    label: "一言管理",
    icon: "custom:hitokoto"
  },
  {
    key: MdcEditorActivityMenu.WorkManager,
    label: "项目管理",
    icon: "ep:briefcase"
  }
]);

const actionMenu = ref<ActivityMenuItem[]>([
  {
    key: MdcEditorActivityMenu.SettingPanel,
    label: "设置",
    icon: "custom:setting"
  }
]);

const handleClickMenu = (e: ActivityMenuItem) => {
  mdcEditorStore.sidebar.active = e.key;
  if (e.onClick) e.onClick();
};

const handleClickAction = (e: ActivityMenuItem) => {
  mdcEditorStore.pushTabItem({
    key: "setting-pane",
    label: "设置",
    openTime: new Date().getTime(),
    type: "setting-pane",
    data: e,
    isChange: true
  });

  mdcEditorStore.currenTab = "setting-pane";
};
</script>
<template>
  <aside class="mdc-editor-activity-bar">
    <ul class="activity-bar-start-group">
      <UTooltip
        v-for="item in activityMenu"
        :key="item.key"
        :text="item.label"
        :content="{ side: 'left' }"
      >
        <li
          class="item"
          :class="{ active: mdcEditorStore.sidebar.active === item.key }"
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
.mdc-editor-activity-bar {
  width: var(--mdc-editor-activity-bar-width);
  height: 100%;
  background-color: var(--mdc-editor-toolbar-background);
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  color: var(--mdc-editor-foreground);

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
        background-color: var(--mdc-editor-luminosity-plus2);
      }
    }

    .item.active {
      background-color: var(--mdc-editor-luminosity-plus2);

      &::before {
        content: "";
        position: absolute;
        width: 3px;
        height: 100%;
        left: 0;
        top: 0;
        background-color: var(--mdc-editor-active-color);
      }
    }
  }

  .activity-bar-start-group {
    flex: 1;
  }
}
</style>
