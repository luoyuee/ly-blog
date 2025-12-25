<template>
  <ol class="breadcrumb">
    <template v-for="(item, index) in displayItems" :key="item.name">
      <li class="breadcrumb__item" :class="{ disabled: item.disabled }">
        <a v-if="item.href && !item.disabled" class="breadcrumb__item-link" :href="item.href">
          <UIcon v-if="item.icon" :name="item.icon" class="breadcrumb__item-icon" />
          <span class="breadcrumb__item-name">{{ item.name }}</span>
        </a>
        <div v-else class="breadcrumb__item-link breadcrumb__item--disabled">
          <UIcon v-if="item.icon" :name="item.icon" class="breadcrumb__item-icon" />
          <span class="breadcrumb__item-name">{{ item.name }}</span>
        </div>
      </li>
      <li v-if="index < props.items.length - 1" class="breadcrumb__item-separator">/</li>
    </template>
  </ol>
</template>

<script lang="ts" setup>
import type { ArticleBreadcrumbItem } from "@@/shared/types/article";
import { computed } from "vue";

const props = defineProps({
  items: {
    type: Array as PropType<ArticleBreadcrumbItem[]>,
    default: () => []
  }
});

const displayItems = computed<ArticleBreadcrumbItem[]>(() => {
  if (props.items.length <= 5) {
    return props.items;
  }

  return [
    ...props.items.slice(0, 1),
    {
      name: "...",
      disabled: true
    },
    ...props.items.slice(-4)
  ];
});
</script>

<style scoped lang="scss">
.breadcrumb {
  display: flex;
  list-style: none;
  cursor: default;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--text-color-4);
  font-size: 1rem;

  &__item {
    &-link {
      text-decoration: none;
      color: var(--text-color-3);
      display: flex;
      align-items: center;
      transition: color 0.3s;

      &:hover {
        color: var(--theme-color);
      }
    }

    &--disabled {
      cursor: default;
    }

    &-icon {
      margin-right: 4px;
    }

    &-name {
      display: block;
      max-width: 32rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:last-child {
      .breadcrumb__item-link {
        color: var(--theme-color);
      }
    }
  }

  &__item-separator {
    padding: 0 8px;
    color: var(--text-color-4);
  }
}
</style>
