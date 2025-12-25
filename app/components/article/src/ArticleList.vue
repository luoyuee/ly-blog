<script setup lang="ts">
import type { ArticleItem } from "#shared/types/article";
import ArticleListItem from "./ArticleListItem.vue";

const props = defineProps({
  data: {
    type: Array as PropType<ArticleItem[]>,
    required: true
  }
});
</script>
<template>
  <ul class="article-list">
    <li v-for="item in props.data" :key="item.id" class="article-list__item">
      <ArticleListItem :data="item" />
    </li>
  </ul>
</template>
<style scoped lang="scss">
.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-list__item {
  margin-bottom: 1rem;
}
</style>
