<script setup lang="ts">
import dayjs from "dayjs";

const { t } = useI18n();

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
      <UIcon name="colorful:mine-outline" class="article-copyright__icon" />
      <span class="article-copyright__label">{{ t("components.article.copyright.authorLabel") }}</span>
      <span class="article-copyright__value">{{ props.author }}</span>
    </div>
    <div v-if="props.updatedAt" class="article-copyright__item">
      <UIcon name="colorful:update-outline" class="article-copyright__icon" />
      <span class="article-copyright__label">{{ t("components.article.copyright.updateLabel") }}</span>
      <span class="article-copyright__value">
        {{ dayjs(props.updatedAt).format(t("format.longDatetime")) }}
      </span>
    </div>
    <div v-if="props.articleUrl" class="article-copyright__item">
      <UIcon name="colorful:share-outline" class="article-copyright__icon" />
      <span class="article-copyright__label">{{ t("components.article.copyright.urlLabel") }}</span>
      <span class="article-copyright__value">
        <a :href="props.articleUrl" target="_blank">
          {{ props.articleUrl }}
        </a>
      </span>
    </div>
    <div class="article-copyright__item">
      <UIcon name="colorful:copyright-outline" class="article-copyright__icon" />
      <span class="article-copyright__label">{{ t("components.article.copyright.licenseLabel") }}</span>
      <span class="article-copyright__value">
        《
        <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans" target="_blank">
          {{ t("components.article.copyright.licenseName") }}
        </a>
        {{ t("components.article.copyright.licenseSuffix") }}
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
