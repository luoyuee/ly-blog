<script setup lang="ts">
import ArticlePaneContent from "./components/article-manager/ArticlePaneContent.vue";
import ImageFolderPanel from "./components/image-manager/ImageFolderPanel.vue";
import HitokotoPaneContent from "./components/hitokoto-manager/HitokotoPaneContent.vue";
import DashboardPanel from "./components/DashboardPanel.vue";
import CronJobPanel from "./components/CronJobPanel.vue";
import SettingPanel from "./components/SettingPanel.vue";
import UserPanel from "./components/UserPanel.vue";
import EditorCore from "./components/core/EditorCore.vue";
import { useLyEditorStore } from "@/stores";
import { LyEditorTabPanelEnum } from "@@/shared/enums";

const lyEditorStore = useLyEditorStore();

const ImageFolderPanes = computed(() => {
  return lyEditorStore.tabs.filter((item) => item.type === LyEditorTabPanelEnum.ImagePanel);
});

const hasArticlePane = computed(() => {
  return !!lyEditorStore.tabs.find((item) => item.type === LyEditorTabPanelEnum.ArticlePanel);
});

const hasHitokotoPane = computed(() => {
  return !!lyEditorStore.tabs.find((item) => item.type === LyEditorTabPanelEnum.HitokotoPanel);
});

const hasSettingPane = computed(() => {
  return !!lyEditorStore.tabs.find((item) => item.type === LyEditorTabPanelEnum.SettingPanel);
});

const hasCronJobPane = computed(() => {
  return !!lyEditorStore.tabs.find((item) => item.type === LyEditorTabPanelEnum.CronJobPanel);
});

const hasDashboardPane = computed(() => {
  return !!lyEditorStore.tabs.find((item) => item.type === LyEditorTabPanelEnum.DashboardPanel);
});

const hasUserPane = computed(() => {
  return !!lyEditorStore.tabs.find((item) => item.type === LyEditorTabPanelEnum.UserPanel);
});

const showEditorCore = computed(() => {
  const currentTabItem = lyEditorStore.getCurrentTabItem();
  if (currentTabItem) {
    return currentTabItem.type === "note";
  }

  return false;
});

// const currentTab = computed(() => {
//   return lyEditorStore.tabs.find((item) => item.key === lyEditorStore.currentTab);
// });
</script>
<template>
  <div class="overflow-hidden">
    <EditorCore v-show="showEditorCore" />

    <ArticlePaneContent
      v-if="hasArticlePane"
      v-show="lyEditorStore.currentTab === LyEditorTabPanelEnum.ArticlePanel"
    />

    <ImageFolderPanel
      v-for="item in ImageFolderPanes"
      v-show="lyEditorStore.currentTab === item.key"
      :key="item.key"
      :tab="item"
    />

    <HitokotoPaneContent
      v-if="hasHitokotoPane"
      v-show="lyEditorStore.currentTab === LyEditorTabPanelEnum.HitokotoPanel"
    />

    <DashboardPanel
      v-if="hasDashboardPane"
      v-show="lyEditorStore.currentTab === LyEditorTabPanelEnum.DashboardPanel"
    />

    <CronJobPanel
      v-if="hasCronJobPane"
      v-show="lyEditorStore.currentTab === LyEditorTabPanelEnum.CronJobPanel"
    />

    <SettingPanel
      v-if="hasSettingPane"
      v-show="lyEditorStore.currentTab === LyEditorTabPanelEnum.SettingPanel"
    />

    <UserPanel
      v-if="hasUserPane"
      v-show="lyEditorStore.currentTab === LyEditorTabPanelEnum.UserPanel"
    />
  </div>
</template>
