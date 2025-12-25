<template>
  <!-- 目录项列表 -->
  <ul>
    <!-- 遍历目录项 -->
    <li v-for="item in props.toc" :key="item.id" class="article-toc__item">
      <!-- 目录链接 -->
      <a
        class="article-toc__link"
        :class="{ 'article-toc__link--active': item.id === modelValue }"
        :href="`#${item.id}`"
        :style="{ paddingLeft: props.depth + 0.5 + 'rem' }"
        :data-toc-id="item.id"
        @click="handleTocClick(item)"
      >
        {{ item.text }}
      </a>
      <!-- 递归渲染子项 -->
      <ArticleTocItem
        v-if="item.children"
        v-model="modelValue"
        :toc="item.children"
        :depth="props.depth + 1"
      />
    </li>
  </ul>
</template>

<script lang="ts" setup>
/**
 * 文章目录项组件
 * 功能：
 * 1. 渲染单个目录项及其子项
 * 2. 支持递归渲染多级目录结构
 * 3. 处理目录项点击事件
 */

import type { ArticleTOCItem } from "@@/shared/types/article";
import type { PropType } from "vue";

// 双向绑定的激活项ID
const modelValue = defineModel<string>({
  default: ""
});

// 组件属性定义
const props = defineProps({
  /** 目录项数据 */
  toc: {
    type: Array as PropType<ArticleTOCItem[]>,
    default: () => []
  },
  /** 当前层级深度，用于缩进计算 */
  depth: {
    type: Number,
    default: 0
  }
});

/**
 * 处理目录项点击事件
 * @param item - 被点击的目录项
 */
const handleTocClick = (item: ArticleTOCItem) => {
  modelValue.value = item.id;
};
</script>
<style scoped lang="scss">
.article-toc__item {
  list-style: none;
}

.article-toc__link {
  color: var(--text-color-3);
  text-decoration: none;
  display: block;
  padding: 4px 0;
  transition: color 0.2s;
  border-left: 3px solid transparent;
  font-size: 0.875rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  &:hover {
    color: var(--color-primary);
  }
}

.article-toc__link--active {
  color: var(--color-primary);
  font-weight: 600;
  border-left-color: var(--color-primary);
  background-color: var(--ui-color-primary-50);
  border-radius: 0 2px 2px 0;
}
</style>
