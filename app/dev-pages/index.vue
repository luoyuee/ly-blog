<script setup lang="ts">
interface DevPageMeta {
  label: string;
  icon: string;
  order: number;
  description?: string;
}

const router = useRouter();

/** 从路由元数据读取测试页清单，生成首页卡片入口。 */
const testPages = computed(() => {
  return router
    .getRoutes()
    .map((route) => {
      const devPage = route.meta.devPage as DevPageMeta | undefined;

      return devPage && route.path !== "/test"
        ? {
            label: devPage.label,
            icon: devPage.icon,
            to: route.path,
            order: devPage.order,
            description: devPage.description
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((itemA, itemB) => itemA.order - itemB.order);
});
</script>

<template>
  <main class="dev-home">
    <section class="dev-home__hero">
      <div class="dev-home__icon">
        <UIcon name="lucide:flask-conical" class="size-8 text-primary" />
      </div>
      <h1 class="dev-home__title">组件测试中心</h1>
      <p class="dev-home__subtitle">
        开发环境专用页面集合，用于手动验证各组件的交互、布局与边界表现。
      </p>
    </section>

    <section class="dev-home__grid">
      <NuxtLink v-for="page in testPages" :key="page.to" :to="page.to" class="dev-home__card">
        <div class="dev-home__card-icon">
          <UIcon :name="page.icon" class="size-5" />
        </div>
        <div class="dev-home__card-body">
          <span class="dev-home__card-label">{{ page.label }}</span>
          <span v-if="page.description" class="dev-home__card-desc">
            {{ page.description }}
          </span>
        </div>
        <UIcon name="lucide:arrow-right" class="dev-home__card-arrow" />
      </NuxtLink>
    </section>
  </main>
</template>

<style scoped lang="scss">
.dev-home {
  max-width: 960px;
  margin: 0 auto;
  padding: 48px 24px 64px;

  &__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
    text-align: center;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background-color: var(--ui-bg-elevated);
    border: 1px solid var(--ui-border);
  }

  &__title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--ui-text-highlighted);
  }

  &__subtitle {
    margin: 0;
    max-width: 480px;
    color: var(--ui-text-muted);
    font-size: 0.95rem;
    line-height: 1.6;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }

  &__card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid var(--ui-border);
    background-color: var(--ui-bg-elevated);
    text-decoration: none;
    transition:
      border-color 0.15s,
      transform 0.15s,
      box-shadow 0.15s;

    &:hover {
      border-color: var(--ui-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
  }

  &__card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 10px;
    background-color: var(--ui-bg-accented);
    color: var(--ui-primary);
  }

  &__card-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  &__card-label {
    font-weight: 600;
    color: var(--ui-text-highlighted);
  }

  &__card-desc {
    font-size: 0.8rem;
    color: var(--ui-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__card-arrow {
    flex-shrink: 0;
    color: var(--ui-text-dimmed);
    transition: transform 0.15s;
  }

  &__card:hover &__card-arrow {
    transform: translateX(2px);
    color: var(--ui-primary);
  }
}
</style>
