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
const dangerLevelColorMap: Record<AccessTokenDangerLevel, string> = {
  [AccessTokenDangerLevelEnum.SAFE]: "text-green-600",
  [AccessTokenDangerLevelEnum.WARNING]: "text-yellow-600",
  [AccessTokenDangerLevelEnum.DANGER]: "text-red-500"
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
    icon: "icon-park-outline:expand-left",
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
              <UIcon
                name="icon-park-outline:protect"
                :class="dangerLevelColorMap[item.dangerLevel]"
              />
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
