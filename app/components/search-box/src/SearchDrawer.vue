<script setup lang="ts">
import type { ArticleItem } from "#shared/types/article";
import { TagColors } from "#shared/constants";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(["update:visible"]);

const randomColor = (): string => {
  const index = Math.floor(Math.random() * TagColors.length);
  return TagColors[index] || "#6fa3ef";
};

const { data: tags } = await useFetch("/api/article/tags", {
  method: "get"
});

const { data: rank } = await useFetch<ArticleItem[]>("/api/article/hot", {
  method: "get",
  query: { q: 9 }
});

const hide = () => {
  emits("update:visible", false);
};

const formatNumber = (num: number): string => {
  if (num < 1000) {
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  } else if (num < 10000) {
    return `${num % 1000 === 0 ? num / 1000 : (num / 1000).toFixed(2)}k`;
  } else {
    return `${num % 10000 === 0 ? num / 10000 : (num / 10000).toFixed(2)}w`;
  }
};
</script>
<template>
  <div class="search-drawer" :class="{ 'search-drawer--active': props.visible }">
    <div class="search-drawer__search">
      <div class="search-drawer__title">
        <Icon name="custom-color:edit" :size="18" />
        关键词搜索
      </div>
      <form class="search-drawer__form" action="/search" method="get">
        <input class="search-drawer__input" type="text" name="kw" placeholder="请输入关键字…" />
        <button class="search-drawer__button" type="submit">搜索</button>
      </form>
      <div class="search-drawer__title">
        <Icon name="custom-color-label" :size="18" />
        标签搜索
      </div>
      <div class="search-drawer__tags">
        <a
          v-for="(item, index) in tags"
          :key="index"
          class="search-drawer__tag"
          :href="'/tag/' + item"
          :style="{ backgroundColor: randomColor() }"
        >
          {{ item }}
        </a>
      </div>
    </div>
    <div class="search-drawer__ranking">
      <div class="search-drawer__title">
        <Icon name="custom-color-hot" :size="18" />
        热门文章
      </div>
      <ul v-if="rank" class="search-drawer__list">
        <li v-for="(item, index) in rank" :key="item.id" class="search-drawer__item">
          <a class="search-drawer__link" :href="'/article/' + item.id">
            <span class="search-drawer__sort" :class="`search-drawer__sort--rank-${index + 1}`">
              {{ index + 1 }}
            </span>
            <span class="search-drawer__title-text">{{ item.title }}</span>
            <span class="search-drawer__views">{{ formatNumber(item.views_count) }} 阅读</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
  <div
    class="search-drawer__overlay"
    :class="{ 'search-drawer__overlay--active': props.visible }"
    @click="hide"
  ></div>
</template>
<style scoped lang="scss">
@import url("../style/search-drawer.scss");
</style>
