<script setup lang="ts">
import type { ApiKeyDangerLevel } from "#shared/enums";
import { ApiKeyDangerLevelEnum, LyEditorTabPanelEnum } from "#shared/enums";
import { ApiKeyScopeItems } from "#shared/constants/api-key";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { SidebarPanel } from "@ly-editor/src/components";

const { t } = useI18n();
const { openTabPanel } = useLyEditorTabs();

/**
 * 危险等级颜色映射
 */
const dangerLevelIconMap: Record<ApiKeyDangerLevel, { name: string; class: string }> = {
  [ApiKeyDangerLevelEnum.SAFE]: {
    name: "lucide:shield-check",
    class: "text-green-400"
  },
  [ApiKeyDangerLevelEnum.WARNING]: {
    name: "lucide:shield-alert",
    class: "text-yellow-400"
  },
  [ApiKeyDangerLevelEnum.DANGER]: {
    name: "lucide:shield-x",
    class: "text-red-400"
  }
};

/**
 * 打开 API 密钥管理面板。
 */
const handleOpenApiKeyPanel = () => {
  openTabPanel({
    key: LyEditorTabPanelEnum.ApiKeyPanel,
    label: t("components.lyEditor.modules.apiKey.title"),
    type: LyEditorTabPanelEnum.ApiKeyPanel
  });
};

const actions = computed(() => [
  {
    label: t("components.lyEditor.common.openList"),
    icon: "lucide:panel-left-open",
    onClick: handleOpenApiKeyPanel
  }
]);
</script>

<template>
  <SidebarPanel :title="t('components.lyEditor.modules.apiKey.title')" :actions="actions">
    <div class="flex-1 overflow-hidden">
      <Scrollbar class="h-full">
        <ul class="flex flex-col gap-2 p-2">
          <li
            v-for="item in ApiKeyScopeItems"
            :key="item.name"
            class="rounded-md border border-muted bg-elevated/40 px-3 py-2 hover:bg-white/5"
          >
            <div class="text-sm font-medium text-default flex items-center justify-between">
              <span>{{ item.name }}</span>
              <UIcon v-bind="dangerLevelIconMap[item.dangerLevel]" />
            </div>
            <div class="mt-1 text-xs leading-5 text-muted">
              {{ item.description }}
            </div>
          </li>
        </ul>
      </Scrollbar>
    </div>
  </SidebarPanel>
</template>
