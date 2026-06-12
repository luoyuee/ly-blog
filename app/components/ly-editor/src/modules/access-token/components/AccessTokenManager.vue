<script setup lang="ts">
import type { AccessTokenDangerLevel } from "#shared/enums";
import { AccessTokenDangerLevelEnum, LyEditorTabPanelEnum } from "#shared/enums";
import { AccessTokenScopeItems } from "#shared/constants/access-token";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { SidebarPanel } from "@ly-editor/src/components";

const { openTabPanel } = useLyEditorTabs();

/**
 * 危险等级颜色映射
 */
const dangerLevelIconMap: Record<AccessTokenDangerLevel, { name: string; class: string }> = {
  [AccessTokenDangerLevelEnum.SAFE]: {
    name: "lucide:shield-check",
    class: "text-green-400"
  },
  [AccessTokenDangerLevelEnum.WARNING]: {
    name: "lucide:shield-alert",
    class: "text-yellow-400"
  },
  [AccessTokenDangerLevelEnum.DANGER]: {
    name: "lucide:shield-x",
    class: "text-red-400"
  }
};

/**
 * 打开 Access Token 管理面板。
 */
const handleOpenAccessTokenPanel = () => {
  openTabPanel({
    key: LyEditorTabPanelEnum.AccessTokenPanel,
    label: "令牌管理",
    type: LyEditorTabPanelEnum.AccessTokenPanel
  });
};

const actions = [
  {
    label: "打开列表",
    icon: "lucide:panel-left-open",
    onClick: handleOpenAccessTokenPanel
  }
];
</script>

<template>
  <SidebarPanel title="令牌管理" :actions="actions">
    <div class="flex-1 overflow-hidden">
      <Scrollbar class="h-full">
        <ul class="flex flex-col gap-2 p-2">
          <li
            v-for="item in AccessTokenScopeItems"
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
