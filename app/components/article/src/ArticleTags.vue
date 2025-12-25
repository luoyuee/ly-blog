<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
  tags: {
    type: Array as PropType<string[]>
  }
});
</script>
<template>
  <div class="article-tags">
    <a v-for="item in props.tags" :key="item" class="article-tags__item" :href="'/tag/' + item">
      {{ item }}
    </a>
    <span v-if="!props.tags || props.tags.length === 0" class="article-tags__no-tag">
      暂无标签
    </span>
  </div>
</template>
<style scoped lang="scss">
.article-tags {
  &__item {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 0.125rem;
    display: inline-block;
    margin-right: 0.5rem;
    transition: all 0.5s;
    text-decoration: none;

    &:hover {
      background-color: #333 !important;
      color: #fff !important;
    }
  }

  &__item:nth-child(1) {
    color: rgb(50, 204, 188);
    background-color: rgba(50, 204, 188, 0.15);
  }

  &__item:nth-child(2) {
    color: rgb(211, 76, 251);
    background-color: rgba(211, 76, 251, 0.15);
  }

  &__item:nth-child(3) {
    color: rgb(255, 82, 82);
    background-color: rgba(255, 82, 82, 0.15);
  }

  &__item:nth-child(4) {
    color: rgb(58, 198, 116);
    background-color: rgba(58, 198, 116, 0.15);
  }

  &__item:nth-child(5) {
    color: rgb(255, 170, 0);
    background-color: rgba(255, 170, 0, 0.15);
  }

  &__item:nth-child(n + 6) {
    .tag:nth-child(n + 6) {
      display: none;
    }
  }

  &__no-tag {
    padding: 3px 5px;
    font-size: 13px;
    border-radius: 3px;
    display: inline-block;
    margin-right: 4px;
    margin-bottom: 4px;
    text-decoration: none;
    background-color: #e9eef5;
    color: #8a8a8a;
    cursor: default;
  }
}
</style>
