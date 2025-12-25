<template>
  <!-- 文章目录组件，使用MacCard包装 -->
  <MacCard title="文章目录" class="article-toc">
    <div class="article-toc__container">
      <!-- 渲染目录项，传递当前激活的ID和目录数据 -->
      <ArticleTocItem v-model="activeId" :toc="props.toc" :depth="0" />
    </div>
  </MacCard>
</template>

<script lang="ts" setup>
/**
 * 文章目录组件
 * 功能：
 * 1. 显示文章目录结构
 * 2. 监听滚动位置，自动高亮当前阅读的标题
 * 3. 支持点击目录项快速跳转到对应标题位置
 */

import type { ArticleTOCItem } from "@@/shared/types/article";
import type { PropType } from "vue";
import { MacCard } from "@/components/mac-card";
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRoute } from "#app";
import ArticleTocItem from "./ArticleTocItem.vue";

// 组件属性定义
const props = defineProps({
  /** 目录数据，包含标题层级结构 */
  toc: {
    type: Array as PropType<ArticleTOCItem[]>,
    default: () => []
  }
});

// 当前激活的标题ID
const activeId = ref<string>("");

/**
 * 监听激活标题ID变化
 * 当激活的标题ID改变时，自动滚动到对应的目录项
 * @param newId - 新的激活标题ID
 */
watch(activeId, (newId) => {
  if (!newId) return;

  const element = document.querySelector(`a[data-toc-id="${newId}"]`);

  if (element) {
    element.scrollIntoView({
      block: "nearest"
    });
  }
});

// IntersectionObserver实例，用于监听标题元素是否在视口中
let observer: IntersectionObserver | null = null;

// 存储当前在视口中可见的标题ID
let visibleIds: string[] = [];

/**
 * IntersectionObserver回调函数
 * 处理标题元素进入/离开视口的事件，自动更新激活状态
 * @param entries - 观察到的元素条目数组
 */
const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  // 更新可见标题ID列表
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // 标题进入视口，添加到可见列表
      if (!visibleIds.includes(entry.target.id)) visibleIds.push(entry.target.id);
    } else {
      // 标题离开视口，从可见列表中移除
      visibleIds = visibleIds.filter((id) => id !== entry.target.id);
    }
  });

  // 在可见标题中找出最靠近视口顶部的标题
  let minTop = 0;
  let minId = "";

  visibleIds.forEach((id) => {
    const el = document.getElementById(id);

    if (el) {
      const rect = el.getBoundingClientRect();
      // 比较距离视口顶部的距离，找出最小的
      if (minTop === 0 || rect.top < minTop) {
        minTop = rect.top;
        minId = id;
      }
    }
  });

  // 设置最靠近视口顶部的标题为激活状态
  if (minId) {
    activeId.value = minId;
  }
};

/**
 * 递归获取TOC中所有标题对应的DOM元素
 * @param toc - 目录数据数组
 * @returns 标题对应的DOM元素数组
 */
const getTitleElements = (toc: ArticleTOCItem[]): HTMLElement[] => {
  const elements: HTMLElement[] = [];

  for (const item of toc) {
    const el = document.getElementById(item.id);
    if (el) {
      elements.push(el);
    }
    // 递归处理子标题
    if (item.children) {
      elements.push(...getTitleElements(item.children));
    }
  }

  return elements;
};

/**
 * 清理IntersectionObserver实例
 * 断开所有观察连接并重置观察器
 */
const clearObserver = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

/**
 * 初始化IntersectionObserver
 * 创建观察器并开始观察所有标题元素，实现滚动时自动高亮当前阅读的标题
 */
const initObserver = () => {
  // 如果已有观察器，先断开连接
  clearObserver();

  // 获取所有标题元素
  const headingElements = getTitleElements(props.toc);

  // 如果没有标题元素，直接返回
  if (headingElements.length === 0) return;

  // 创建IntersectionObserver实例
  observer = new IntersectionObserver(handleIntersection, {
    root: null, // 使用视口作为根元素
    rootMargin: "-20% 0px -70% 0px", // 顶部留出20%空间，底部留出70%空间，确保标题在视口中间时高亮
    threshold: 1 // 元素完全可见时触发
  });

  // 开始观察所有标题元素
  headingElements.forEach((el) => {
    observer?.observe(el);
  });
};

// 监听toc数据变化，重新初始化观察器
watch(
  () => props.toc,
  () => {
    initObserver();
  }
);

// 组件挂载后初始化观察器
onMounted(() => {
  nextTick(() => {
    initObserver();

    const route = useRoute();
    if (route.hash) {
      activeId.value = route.hash.replace("#", "").trim();
    }
  });
});

// 组件卸载时清理观察器
onUnmounted(clearObserver);
</script>
<style scoped lang="scss">
.article-toc {
  :deep(.mac-card-content) {
    padding: 1rem 0;
  }

  &__container {
    padding: 0 0.75rem 0 1rem;
    margin-right: 0.25rem;
    max-height: 50vh;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.4);
    }
  }
}
</style>
