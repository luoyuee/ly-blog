<script setup lang="ts">
import { animate } from "animejs";
import type { DockItem } from "./types";

const visible = ref(false);

const dockItems = ref<DockItem[]>([
  {
    id: 1,
    name: "所有捷径",
    style: "background-image: linear-gradient(135deg, rgb(84, 174, 229), rgb(147, 106, 209));",
    icon: "mdi:apps"
  },
  {
    id: 2,
    name: "翻译",
    style: "background-image: linear-gradient(135deg, rgb(124, 214, 255), rgb(26, 135, 178));",
    icon: "mdi:translate"
  },
  {
    id: 3,
    name: "AI工具",
    style: "background-image: linear-gradient(135deg, rgb(220, 227, 91), rgb(68, 128, 0));",
    icon: "hugeicons:chat-gpt"
  },
  {
    id: 4,
    name: "图片",
    style: "background-image: linear-gradient(135deg, rgb(255, 173, 141), rgb(243, 82, 92));",
    icon: "mdi:image"
  },
  {
    id: 5,
    name: "便签",
    style: "background-image: linear-gradient(135deg, rgb(255, 217, 118), rgb(221, 137, 0));",
    icon: "mdi:note-text"
  },
  {
    id: 6,
    name: "空投快传",
    style: "background-image: linear-gradient(135deg, rgb(174, 210, 255), rgb(0, 85, 192));",
    icon: "mdi:cloud"
  },
  {
    id: 7,
    name: "邮箱",
    style: "background-image: linear-gradient(135deg, rgb(255, 181, 151), rgb(215, 93, 43));",
    icon: "mdi:email"
  },
  {
    id: 8,
    name: "音乐",
    style: "background-image: linear-gradient(135deg, rgb(255, 163, 170), rgb(242, 68, 82));",
    icon: "mdi:music-box"
  },
  {
    id: 9,
    name: "哔哩哔哩",
    style: "background-image: linear-gradient(135deg, rgb(255, 162, 191), rgb(235, 71, 114));",
    icon: "ri:bilibili-fill"
  },
  {
    id: 10,
    name: "壁纸",
    style: "background-image: linear-gradient(135deg, rgb(84, 174, 229), rgb(147, 106, 209));",
    icon: "mdi:folder-image"
  },
  {
    id: 11,
    name: "主题",
    style: "background-image: linear-gradient(135deg, rgb(247, 206, 70), rgb(213, 104, 41));",
    icon: "mdi:lightbulb-on"
  }
]);

/**
 * 显示遮罩层并等待入场动画完成，便于页面层统一编排显示时序。
 */
const show = async () => {
  if (visible.value) {
    return;
  }

  visible.value = true;

  await new Promise<void>((resolve) => {
    animate(".navigation-dock-overlay", {
      opacity: [0, 1],
      duration: 150,
      easing: "ease-out",
      delay: 0,
      onComplete: () => {
        resolve();
      }
    });
  });
};

/**
 * 隐藏遮罩层并等待退场动画完成，避免 SearchBox 与遮罩层同时闪动。
 */
const hide = async () => {
  if (!visible.value) {
    return;
  }

  await new Promise<void>((resolve) => {
    animate(".navigation-dock-overlay", {
      opacity: [1, 0],
      duration: 100,
      easing: "ease-in",
      delay: 0,
      onComplete: () => {
        visible.value = false;
        resolve();
      }
    });
  });
};

const handleToggleVisible = () => {
  if (visible.value) {
    hide();
  } else {
    show();
  }
};

defineExpose({
  handleToggleVisible,
  show,
  hide
});
</script>

<template>
  <div v-show="visible" class="navigation-dock-overlay">
    <button v-for="item in dockItems" :key="item.id" class="navigation-dock-overlay__item">
      <div class="navigation-dock-overlay__icon">
        <UIcon :name="item.icon" :size="36" :style="item.style" />
      </div>
      <span class="navigation-dock-overlay__name">
        {{ item.name }}
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.navigation-dock-overlay {
  scrollbar-width: none;
  border-top: 1px solid #0000;
  border-bottom: 1px solid #0000;
  grid-template-columns: repeat(6, 60px);
  gap: 50px;
  max-height: calc(100vh - 330px);
  padding: 10px 10px 50px;
  transition: all 0.25s;
  display: grid;
  overflow: hidden ;
  user-select: none;
  margin: 0 auto;

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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    cursor: pointer;
    gap: 4px;

    &:hover {
      transform: scale(1.15);
    }
  }

  &__icon {
    appearance: none;
    background-color: #1e1e1e;
    outline-offset: 2px;
    border: none;
    border-radius: 14px;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 60px;
    padding: 0;
    display: flex;
  }

  &__name {
    color: #fff;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    overflow: hidden;
  }
}
</style>
