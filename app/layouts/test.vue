<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

interface DevPageMeta {
  label: string;
  icon: string;
  order: number;
}

const router = useRouter();

/** 从开发路由元数据生成测试页导航，新增页面时无需重复维护菜单。 */
const navigationItems = computed<NavigationMenuItem[]>(() => {
  return router
    .getRoutes()
    .map((route) => {
      const devPage = route.meta.devPage as DevPageMeta | undefined;

      return devPage
        ? {
            label: devPage.label,
            icon: devPage.icon,
            to: route.path,
            order: devPage.order
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((itemA, itemB) => itemA.order - itemB.order)
    .map(({ order, ...item }) => item);
});
</script>

<template>
  <div class="flex w-full min-w-0 h-dvh bg-(--background-color-primary)">
    <aside class="w-56 h-full p-2 shrink-0 overflow-y-auto border-r border-default bg-default">
      <div
        class="flex items-center justify-center md:justify-start gap-2 h-10 px-2.5 pt-2 pb-4 text-highlighted font-semibold"
      >
        <UIcon name="lucide:flask-conical" class="size-5 text-primary shrink-0" />
        <span class="hidden md:inline">组件测试</span>
      </div>

      <USeparator />

      <UNavigationMenu
        orientation="vertical"
        :items="navigationItems"
        highlight
        class="w-full max-md:[&_span]:hidden"
        :ui="{
          item: 'p-1 pt-0.5 pr-0',
          childItem: 'p-1 pt-0.5 ps-1.5',
          link: 'rounded-md py-2.5 px-2 hover:not-data-active:before:bg-black/5 hover:not-data-active:text-primary data-active:before:bg-blue-400 data-active:before:shadow-md data-active:text-white data-active:*:text-white',
          linkLeadingIcon: 'group-hover:text-primary',
          content: '-mr-1'
        }"
      />
    </aside>

    <div class="min-w-0 h-full flex-1 overflow-auto">
      <slot></slot>
    </div>
  </div>
</template>
