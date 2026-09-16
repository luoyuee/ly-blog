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

const { t } = useI18n();
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
    label: t("components.lyEditor.modules.navigation.searchHistory")
  });
};

const actions = computed(() => [
  {
    label: t("components.lyEditor.modules.navigation.history"),
    icon: "mdi:history",
    onClick: handleOpenSearchHistoryPanel
  }
]);

const panelItems = computed<CollapsiblePanelItem[]>(() => [
  {
    value: "shortcut",
    label: t("components.lyEditor.modules.navigation.shortcut"),
    slot: "shortcut",
    defaultOpen: true,
    resizable: true
  },
  {
    value: "search-engine",
    label: t("components.lyEditor.modules.navigation.searchEngine"),
    slot: "searchEngine",
    resizable: true
  }
]);
</script>
<template>
  <SidebarPanel :title="t('components.lyEditor.modules.navigation.title')" :actions="actions">
    <div class="min-h-0 flex-1">
      <CollapsiblePanel :items="panelItems" type="multiple" :min-panel-height="120">
        <template #trailing="{ item }">
          <ToolTipButton
            v-if="item.value === 'shortcut'"
            size="xs"
            icon="lucide:plus"
            color="neutral"
            variant="ghost"
            :tooltip="t('components.lyEditor.modules.navigation.newShortcut')"
            @click.stop="shortcutSectionRef?.openForm()"
          />
          <ToolTipButton
            v-else-if="item.value === 'search-engine'"
            size="xs"
            icon="lucide:plus"
            color="neutral"
            variant="ghost"
            :tooltip="t('components.lyEditor.modules.navigation.newSearchEngine')"
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
