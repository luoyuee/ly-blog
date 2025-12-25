<script setup lang="ts">
import type { ComputedRef } from "vue";
import { useConfigStore } from "@/stores";
import { computed } from "vue";

const configStore = useConfigStore();

const avatar: ComputedRef<string> = computed(() => {
  if (configStore.author_card.avatar) {
    return configStore.author_card.avatar;
  } else {
    return "/images/avatar.webp";
  }
});

const { data } = await useFetch<{
  article_count: number;
  like_count: number;
  tag_count: number;
}>("/api/article/count", {
  method: "get"
});
</script>
<template>
  <div class="author-card">
    <img class="author-card__cover" src="/images/author_bg.jpg" alt="author_bg" />
    <div class="author-card__profile">
      <img class="author-card__avatar" :src="avatar" alt="avatar" />
      <a class="author-card__name" :href="configStore.author_card.name_link ?? '/'">
        {{ configStore.author_card.name }}
      </a>
      <p v-if="configStore.author_card.motto" class="author-card__motto">
        {{ configStore.author_card.motto }}
      </p>
    </div>
    <div v-if="data" class="author-card__stats">
      <div class="author-card__stat-item" title="累计文章数">
        <span class="author-card__stat-value">
          {{ data.article_count ?? 0 }}
        </span>
        <span class="author-card__stat-label">文章</span>
      </div>
      <div class="author-card__stat-item" title="累计文章数">
        <span class="author-card__stat-value">{{ data.like_count ?? 0 }}</span>
        <span class="author-card__stat-label">点赞</span>
      </div>
      <div class="author-card__stat-item" title="累计标签数">
        <span class="author-card__stat-value">{{ data.tag_count ?? 0 }}</span>
        <span class="author-card__stat-label">标签</span>
      </div>
    </div>
    <ul class="author-card__links">
      <li
        v-for="(item, index) in configStore.author_card.links"
        :key="index"
        class="author-card__link-item"
      >
        <a :href="item.href" target="_blank">
          <span class="author-card__link-title">{{ item.title }}</span>
          <UIcon
            class="author-card__link-icon"
            :name="configStore.author_card.link_icon ?? 'custom:link'"
          />
        </a>
      </li>
    </ul>
  </div>
</template>
<style scoped lang="scss">
.author-card {
  background-color: var(--card-bg-color);
  padding: 85px 16px 0 16px;
  position: relative;
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 90px;
    left: 0;
    width: 100%;
    height: 30px;
    z-index: 2;
    background: linear-gradient(to bottom, transparent, var(--card-bg-color));
    pointer-events: none;
  }

  &__cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 120px;
    object-fit: cover;
    z-index: 1;
  }

  &__profile {
    position: relative;
    z-index: 4;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 24px;
  }

  &__avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 16px;
    object-fit: cover;
    transition: transform 0.75s;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }

  &__name {
    color: var(--theme-color);
    text-decoration: none;
    margin-bottom: 16px;
    font-size: 1.125rem;
    font-weight: 500;
  }

  &__motto {
    font-size: 0.875rem;
    color: var(--text-color-2);
    text-align: center;
    word-break: break-word;
  }

  &__stats {
    width: 100%;
    padding-bottom: 16px;
    display: flex;
    align-items: center;
  }

  &__stat-item {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 13px;
  }

  &__stat-value {
    max-width: 70px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
    font-size: 1.25rem;
    color: var(--text-color-2);
    margin-bottom: 3px;
  }

  &__stat-label {
    color: var(--text-color-3);
  }

  &__links {
    padding: 12px 0;
    list-style: none;
    border-top: 1px solid var(--text-color-5);

    a {
      color: var(--text-color-2);
      font-size: 0.875rem;
      line-height: 1.875rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-decoration: none;
      position: relative;

      &:hover {
        .author-card__link-title,
        .author-card__link-icon {
          color: var(--theme-color);
        }

        &::before {
          width: 100%;
        }
      }

      &::before {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 1px;
        background: var(--theme-color);
        transition: width 0.35s;
      }
    }
  }

  &__link-title {
    text-wrap: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    transition: color 0.35s;
  }

  &__link-icon {
    transition: color 0.35s;
  }
}
</style>
