<script setup lang="ts">
import type { Article } from "#shared/types/article";
import type { PropType } from "vue";
import dayjs from "dayjs";

const props = defineProps({
  article: {
    type: Object as PropType<Article>,
    required: true
  }
});
</script>
<template>
  <div class="article-banner">
    <div class="article-banner__info">
      <h1 class="article-banner__title animate__animated animate__fadeIn">
        {{ props.article.title }}
      </h1>

      <div class="article-banner__meta">
        <div class="article-banner__date">
          <UIcon name="custom-color:calendar-round-fill" />
          <span>
            {{ dayjs(props.article.content_updated_at).format("YYYY年MM月DD日 HH时mm分") }}
          </span>
        </div>

        <div class="article-banner__stats">
          <div class="article-banner__stat">
            <UIcon name="custom-color:hot-round-fill" />
            <span>{{ props.article.view_count }} 阅读</span>
          </div>

          <div class="article-banner__stat">
            <UIcon name="custom-color:message-round-fill" />
            <span>{{ props.article.comment_count }} 评论</span>
          </div>

          <div class="article-banner__stat">
            <UIcon name="custom-color:like-round-fill" />
            <span>{{ props.article.like_count }} 点赞</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.article-banner {
  background-color: var(--white);
  background: url(/api/image/random/background) center;
  background-size: cover;
  height: 42vh;
  position: relative;
  margin-top: calc(0px - var(--header-height));
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-bottom: 0;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    pointer-events: none;
  }

  &__info {
    position: absolute;
    line-height: 1.5;
    margin-top: 0;
  }

  &__title {
    font-size: 2.25rem;
    color: var(--white);
    text-align: center;
    text-shadow: var(--hero-text-shadow);
    padding: 0 1rem;
    letter-spacing: 0.25rem;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--white);
    font-size: 1.125rem;
    padding: 0 1rem;
    text-shadow: var(--hero-text-shadow);
    margin-top: 1.25rem;
    letter-spacing: 1px;
    flex-wrap: wrap;
  }

  &__date {
    display: flex;
    align-items: center;

    .iconify {
      margin-right: 0.25rem;
    }
  }

  &__stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  &__stat {
    display: flex;
    align-items: center;

    .iconify {
      margin-right: 0.25rem;
    }
  }
}

@media screen and (max-width: 768px) {
  .article-banner {
    &__title {
      font-size: 1.5rem;
    }

    &__meta {
      font-size: 0.875rem;
    }

    &__date {
      width: 100%;
      margin-bottom: 0.25rem;
      justify-content: center;
    }
  }
}
</style>
