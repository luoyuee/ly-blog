<script lang="ts" setup>
const { t } = useI18n();

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  text: {
    type: String
  },
  loadingText: {
    type: String,
    default: ""
  }
});

/** 加载文案兜底：未传入 loadingText 时回退到 i18n 文案。 */
const resolvedLoadingText = computed(
  () => props.loadingText || t("components.article.listDivider.loading")
);
</script>

<template>
  <div class="article-list-divider">
    <span v-if="props.loading" class="article-list-divider__loading">
      <UIcon name="lucide:loader-circle" class="article-list-divider__icon" />
      {{ resolvedLoadingText }}
    </span>
    <span v-else class="article-list-divider__text">
      {{ props.text }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.article-list-divider {
  margin: 64px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-color-4);
  font-size: 1rem;
  white-space: nowrap;

  &::before {
    content: "";
    width: 160px;
    border-top: 1px solid var(--text-color-4);
    margin-right: 1rem;
  }

  &::after {
    content: "";
    width: 160px;
    border-top: 1px solid var(--text-color-4);
    margin-left: 1rem;
  }

  &__loading {
    display: flex;
    align-items: center;
  }

  &__icon {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
