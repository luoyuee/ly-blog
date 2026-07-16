<script setup lang="ts">
import type { CollapsiblePanelItem } from "@ly-editor/src/components/collapsible-panel";
import { CollapsiblePanel } from "@ly-editor/src/components/collapsible-panel";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { SidebarPanel } from "@ly-editor/src/components";
import { ToolTipButton } from "@/components/tooltip-button";
import { LyEditorTabPanelEnum } from "#shared/enums";
import { useTemplateRef } from "vue";
import SearchEngineSection from "./SearchEngineSection.vue";
import ShortcutSection from "./ShortcutSection.vue";

const { openTabPanel } = useLyEditorTabs();

const shortcutSectionRef = useTemplateRef("shortcutSectionRef");
const searchEngineSectionRef = useTemplateRef("searchEngineSectionRef");

/**
 * 打开搜索历史记录面板。
 */
const handleOpenSearchHistoryPanel = () => {
  openTabPanel({
    key: LyEditorTabPanelEnum.NavigationHistoryPanel,
    type: LyEditorTabPanelEnum.NavigationHistoryPanel,
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

const panelItems: CollapsiblePanelItem[] = [
  {
    value: "shortcut",
    label: "快捷方式",
    slot: "shortcut",
    defaultOpen: true,
    resizable: true
  },
  {
    value: "search-engine",
    label: "搜索引擎",
    slot: "searchEngine",
    resizable: true
  }
];
</script>
<template>
  <SidebarPanel title="导航管理" :actions="actions">
    <div class="min-h-0 flex-1">
      <CollapsiblePanel :items="panelItems" type="multiple" :min-panel-height="120">
        <template #trailing="{ item }">
          <ToolTipButton
            v-if="item.value === 'shortcut'"
            size="xs"
            icon="lucide:plus"
            color="neutral"
            variant="ghost"
            tooltip="新增快捷方式"
            @click.stop="shortcutSectionRef?.openForm()"
          />
          <ToolTipButton
            v-else-if="item.value === 'search-engine'"
            size="xs"
            icon="lucide:plus"
            color="neutral"
            variant="ghost"
            tooltip="新增搜索引擎"
            @click.stop="searchEngineSectionRef?.openForm()"
          />
        </template>
        <template #shortcut>
          <ShortcutSection ref="shortcutSectionRef" />
        </template>
        <template #searchEngine>
          <SearchEngineSection ref="searchEngineSectionRef" />
        </template>
      </CollapsiblePanel>
    </div>
  </SidebarPanel>
</template>
