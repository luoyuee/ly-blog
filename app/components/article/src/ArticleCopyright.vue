<script setup lang="ts">
import dayjs from "dayjs";

const props = defineProps({
  author: {
    type: String
  },
  updatedAt: {
    type: [String, Date]
  },
  articleUrl: {
    type: String
  }
});
</script>
<template>
  <div class="article-copyright">
    <div v-if="props.author" class="article-copyright__item">
      <UIcon name="custom-color:mine-outline" class="article-copyright__icon" />
      <span class="article-copyright__label">发布作者：</span>
      <span class="article-copyright__value">{{ props.author }}</span>
    </div>
    <div v-if="props.updatedAt" class="article-copyright__item">
      <UIcon name="custom-color:update-outline" class="article-copyright__icon" />
      <span class="article-copyright__label">最后更新：</span>
      <span class="article-copyright__value">
        {{ dayjs(props.updatedAt).format("YYYY年MM月DD日 HH时mm分") }}
      </span>
    </div>
    <div v-if="props.articleUrl" class="article-copyright__item">
      <UIcon name="custom-color:share-outline" class="article-copyright__icon" />
      <span class="article-copyright__label">本文链接：</span>
      <span class="article-copyright__value">
        <a :href="props.articleUrl" target="_blank">
          {{ props.articleUrl }}
        </a>
      </span>
    </div>
    <div class="article-copyright__item">
      <UIcon name="custom-color:copyright-outline" class="article-copyright__icon" />
      <span class="article-copyright__label">作品版权：</span>
      <span class="article-copyright__value">
        《
        <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans" target="_blank">
          署名-非商业性使用-相同方式共享 4.0 国际 (CC BY-NC-SA4.0)
        </a>
        》许可协议授权
      </span>
    </div>
  </div>
</template>
<style scoped lang="scss">
.article-copyright {
  background: var(--card-bg-color);
  box-shadow: var(--card-shadow);
  padding: 16px;

  &__item {
    margin-bottom: 4px;
    display: flex;
    align-items: center;
  }

  &__icon {
    margin-right: 4px;
    font-size: 1rem;
  }

  &__label {
    color: var(--text-color-3);
    font-size: 0.875rem;
  }

  &__value {
    color: var(--text-color-3);
    font-size: 0.875rem;

    a {
      color: inherit;
      text-decoration: none;
      &:hover {
        color: var(--theme-color);
      }
    }
  }
}
</style>
