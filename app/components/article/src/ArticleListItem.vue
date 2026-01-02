<script setup lang="ts">
import type { ArticleItem } from "#shared/types/article";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");
dayjs.extend(relativeTime);

const props = defineProps({
  data: {
    type: Object as PropType<ArticleItem>,
    required: true
  }
});
</script>
<template>
  <div class="article-list-item">
    <a
      v-if="props.data.cover && props.data.cover.length === 1"
      class="article-list-item__cover"
      :href="`/article/${props.data.id}`"
      :title="props.data.title"
    >
      <img :src="props.data.cover[0]" :alt="props.data.title" />
    </a>

    <div class="article-list-item__information">
      <a
        class="article-list-item__title"
        :href="`/article/${props.data.id}`"
        :title="props.data.title"
      >
        <span v-if="props.data.pinned" class="article-list-item__badge">置顶</span>
        {{ props.data.title }}
      </a>

      <a class="article-list-item__abstract" :href="`/article/${props.data.id}`" title="文章摘要">
        {{ props.data.abstract }}
      </a>

      <a
        v-if="props.data.cover && props.data.cover.length > 1"
        class="article-list-item__cover-list"
        :href="`/article/${props.data.id}`"
        :title="props.data.title"
      >
        <img
          v-for="(item, index) in props.data.cover.slice(0, 3)"
          :key="index"
          :src="item"
          :alt="item"
        />
      </a>

      <div class="article-list-item__meta">
        <ul class="article-list-item__meta-items">
          <li class="article-list-item__meta-item">
            <UIcon name="custom:time" />
            <span class="article-list-item__meta-item-text">
              {{ dayjs().to(dayjs.unix(props.data.content_updated_at)) }}
            </span>
          </li>

          <li class="article-list-item__meta-item">
            <UIcon name="lucide:eye" />
            <span class="article-list-item__meta-item-text">
              {{ props.data.view_count }}
            </span>
          </li>

          <li class="article-list-item__meta-item">
            <UIcon name="custom:comment" />
            <span class="article-list-item__meta-item-text">
              {{ props.data.comment_count }}
            </span>
          </li>

          <li class="article-list-item__meta-item">
            <UIcon name="custom:upvote" />
            <span class="article-list-item__meta-item-text">
              {{ props.data.like_count }}
            </span>
          </li>
        </ul>

        <div class="article-list-item__meta-category">
          <UIcon :name="props.data.category_icon ?? 'custom-color:manage-outline'" :size="16" />
          <span class="article-list-item__meta-category-text">
            {{ props.data.category_name ?? "未分类" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.article-list-item {
  background-color: var(--card-bg-color);
  border-radius: var(--card-radius);
  display: flex;
  box-shadow: var(--card-shadow);
  text-decoration: none;
  padding: 0.875rem;
  cursor: default;
  transition:
    transform 0.15s ease-in-out,
    box-shadow 0.25s ease-in-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--card-shadow-hover);

    .article-list-item__cover {
      img {
        opacity: 0.8;
        transform: scale(1.1);
      }
    }
  }

  &__cover {
    flex-shrink: 0;
    overflow: hidden;
    width: 280px;
    height: 100%;
    border-radius: var(--radius-inner);
    margin-right: 0.875rem;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition:
        transform 0.35s,
        opacity 0.35s;
    }
  }

  &__cover-list {
    display: flex;
    gap: 12px;
    margin-top: 1rem;
    img {
      width: 100%;
      height: 100%;
      max-height: 180px;
      object-fit: cover;
      border-radius: var(--radius-inner);
      overflow: hidden;
      transition:
        transform 0.35s,
        opacity 0.35s,
        -webkit-transform 0.35s;

      &:hover {
        transform: scale(1.025);
        opacity: 0.85;
      }
    }
  }

  &__information {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__title {
    font-size: 1.25rem;
    line-height: 1.5rem;
    font-weight: normal;
    text-decoration: none;
    margin-bottom: 1rem;
    color: var(--text-color-1);
    transition: color 0.25s;

    &:hover {
      color: var(--theme-color);
    }

    .article-list-item__badge {
      display: inline-block;
      height: 1.25rem;
      line-height: 1.25rem;
      background: var(--red);
      color: var(--white);
      font-size: 0.75rem;
      margin-right: 4px;
      border-radius: 2px;
      padding: 0 8px;
      white-space: nowrap;
      vertical-align: 3px;
    }
  }

  &__abstract {
    flex: 1;
    font-size: 0.875rem;
    text-decoration: none;
    color: var(--text-color-2);
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    color: var(--text-color-3);
    font-size: 0.75rem;
    height: 1.25rem;

    &-items {
      display: flex;
      list-style: none;
    }

    &-item {
      display: flex;
      align-items: center;

      &:not(:last-child) {
        &::after {
          padding: 0 0.5rem;
          content: "/";
        }
      }

      &-text {
        padding-left: 0.25rem;
      }
    }

    &-category {
      display: flex;
      align-items: center;

      &-text {
        padding-left: 0.25rem;
      }
    }
  }
}
</style>
