<script setup lang="ts">
import { LyEditorTabPanel } from "#shared/constants";
import ShortcutSection from "./ShortcutSection.vue";
import SearchEngineSection from "./SearchEngineSection.vue";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { SidebarPanel } from "../../../components";

const { openTabPanel } = useLyEditorTabs();

/**
 * 打开搜索历史记录面板。
 */
const handleOpenSearchHistoryPanel = () => {
  openTabPanel({
    key: LyEditorTabPanel.NavigationHistoryPanel,
    type: LyEditorTabPanel.NavigationHistoryPanel,
    label: "搜索历史"
  });
};

const actions = [
  {
    label: "历史记录",
    icon: "mdi:history",
    onClick: handleOpenSearchHistoryPanel
  }
];
</script>
<template>
  <SidebarPanel title="导航管理" :actions="actions">
    <ShortcutSection />
    <SearchEngineSection />
  </SidebarPanel>
</template>
