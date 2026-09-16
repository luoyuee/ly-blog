<script setup lang="ts">
import type { DockItem } from "./types";

const emit = defineEmits(["click-item"]);

const { t } = useI18n();

/**
 * 将 Dock 图标点击统一向父级抛出，具体行为由页面层决定，避免组件内部堆积业务状态。
 */
const handleItemClick = (item: DockItem) => {
  emit("click-item", item);
};

const dockItems = computed<DockItem[]>(() => [
  {
    id: 1,
    name: t("components.dock.items.all"),
    style: "background-image: linear-gradient(135deg, #E2CCFF 0%, #7FB4FF 100%)",
    icon: "mdi:apps"
  },
  {
    id: 2,
    name: t("components.dock.items.home"),
    style: "background-image: linear-gradient(135deg, rgb(84, 174, 229), rgb(147, 106, 209));",
    icon: "mdi:home"
  },
  {
    id: 3,
    name: t("components.dock.items.translate"),
    style: "background-image: linear-gradient(135deg, rgb(124, 214, 255), rgb(26, 135, 178));",
    icon: "mdi:translate"
  },
  {
    id: 4,
    name: t("components.dock.items.ai"),
    style: "background-image: linear-gradient(135deg, rgb(220, 227, 91), rgb(68, 128, 0));",
    icon: "hugeicons:chat-gpt"
  },
  {
    id: 5,
    name: t("components.dock.items.image"),
    style: "background-image: linear-gradient(135deg, rgb(255, 173, 141), rgb(243, 82, 92));",
    icon: "mdi:image"
  },
  {
    id: 6,
    name: t("components.dock.items.note"),
    style: "background-image: linear-gradient(135deg, rgb(255, 217, 118), rgb(221, 137, 0));",
    icon: "mdi:note-text"
  },
  {
    id: 7,
    name: t("components.dock.items.airdrop"),
    style: "background-image: linear-gradient(135deg, rgb(174, 210, 255), rgb(0, 85, 192));",
    icon: "mdi:cloud"
  },
  {
    id: 8,
    name: t("components.dock.items.mail"),
    style: "background-image: linear-gradient(135deg, rgb(255, 181, 151), rgb(215, 93, 43));",
    icon: "mdi:email"
  },
  {
    id: 9,
    name: t("components.dock.items.music"),
    style: "background-image: linear-gradient(135deg, rgb(255, 163, 170), rgb(242, 68, 82));",
    icon: "mdi:music-box"
  },
  {
    id: 10,
    name: t("components.dock.items.bilibili"),
    style: "background-image: linear-gradient(135deg, rgb(255, 162, 191), rgb(235, 71, 114));",
    icon: "ri:bilibili-fill"
  },
  {
    id: 11,
    name: t("components.dock.items.wallpaper"),
    style: "background-image: linear-gradient(135deg, rgb(84, 174, 229), rgb(147, 106, 209));",
    icon: "mdi:folder-image"
  },
  {
    id: 12,
    name: t("components.dock.items.theme"),
    style: "background-image: linear-gradient(135deg, rgb(247, 206, 70), rgb(213, 104, 41));",
    icon: "mdi:lightbulb-on"
  }
]);
</script>

<template>
  <div class="navigation-dock" @click.stop>
    <button
      v-for="item in dockItems"
      :key="item.id"
      class="navigation-dock__item"
      @click.stop="handleItemClick(item)"
    >
      <UIcon :name="item.icon" :size="24" :style="item.style" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.navigation-dock {
  backdrop-filter: blur(30px) saturate(1.25);
  background-color: rgba(0, 0, 0, 0.1);
  animation: navigation-dock-in 1s;
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  white-space: nowrap;
  gap: 12px;
  padding: 10px;
  border-radius: 20px;
  max-width: calc(100% - 20px);
  overflow: hidden;
  user-select: none;

  @keyframes navigation-dock-in {
    0% {
      opacity: 0;
      transform: translate(-50%) translateY(50%);
    }
    100% {
      opacity: 1;
      transform: translate(-50%);
    }
  }

  &__item {
    appearance: none;
    background-color: #1e1e1e;
    cursor: pointer;
    outline-offset: 2px;
    border: none;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    padding: 4px;
    transition: all 0.35s;
    display: flex;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    &:hover {
      transform: translateY(-6px) scale(1.15);
      background-color: #282828;
    }
  }
}
</style>
