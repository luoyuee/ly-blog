<script setup lang="ts">
import { SidebarPanel } from "@/components/ly-editor/src/components";
import { useLyEditorTabs } from "@/composables/useLyEditorTabs";
import { LyEditorTabPanel } from "#shared/constants";

const { openTabPanel } = useLyEditorTabs();

const scopeItems = [
  {
    name: "hitokoto:import",
    description: "允许调用一言导入接口。"
  },
  {
    name: "note:import",
    description: "允许调用文章内容包导入接口。"
  }
];

/**
 * 打开 Access Token 管理面板。
 */
const handleOpenAccessTokenPanel = () => {
  openTabPanel({
    key: LyEditorTabPanel.AccessTokenPanel,
    label: "令牌管理",
    type: LyEditorTabPanel.AccessTokenPanel
  });
};

const actions = [
  {
    label: "打开列表",
    icon: "ep:arrow-right-bold",
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
            v-for="item in scopeItems"
            :key="item.name"
            class="rounded-md border border-muted bg-elevated/40 px-3 py-2 hover:bg-elevated"
          >
            <div class="text-sm font-medium text-default flex items-center justify-between">
              <span>{{ item.name }}</span>
              <UIcon name="mdi:shield-check-outline" />
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
