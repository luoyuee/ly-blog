<script setup lang="ts">
import type { ArticleCategoryRootItem } from "@@/shared/types/article";
import { useAppStore, useConfigStore } from "@/stores";
import { useDebounceFn } from "@vueuse/core";

const configStore = useConfigStore();
const appStore = useAppStore();

const visible = defineModel<boolean>("visible", { default: false });

const autoHide = useDebounceFn(() => {
  if (window.innerWidth > 1024) {
    visible.value = false;
    window.removeEventListener("resize", autoHide);
  }
}, 100);

watch(visible, (newVal) => {
  appStore.lockScroll = newVal;
  if (newVal) {
    window.addEventListener("resize", autoHide);
  }
});

const { data: categories } = useFetch<ArticleCategoryRootItem[]>("/api/article/category/root", {
  method: "get"
});

interface HeaderDrawerNavItem {
  key: string;
  title: string;
  icon: string;
  href?: string;
  type: "link" | "group";
  children?: HeaderDrawerNavItem[];
}

const drawerNavItems = computed<HeaderDrawerNavItem[]>(() => {
  const categoryChildren: HeaderDrawerNavItem[] = (categories.value ?? []).map((category) => ({
    key: `category-${category.id}`,
    title: category.name,
    icon: category.icon ?? "custom-color:folder",
    href: `/category/${category.id}`,
    type: "link"
  }));

  const staticItems: HeaderDrawerNavItem[] = [
    {
      key: "home",
      title: "首页",
      icon: "custom-color:home",
      href: "/",
      type: "link"
    },
    {
      key: "category-group",
      title: "文档目录",
      icon: "custom-color:folder",
      type: "group",
      children: categoryChildren
    },
    {
      key: "sn",
      title: "闪念笔记",
      icon: "custom-color:execute-book",
      href: "/sn",
      type: "link"
    },
    {
      key: "message",
      title: "留言板",
      icon: "custom-color:message",
      href: "/message",
      type: "link"
    },
    {
      key: "work",
      title: "作品",
      icon: "custom-color:recommend",
      href: "/work",
      type: "link"
    },
    {
      key: "about",
      title: "关于",
      icon: "custom-color:config",
      href: "/about",
      type: "link"
    }
  ];

  const configItems: HeaderDrawerNavItem[] = configStore.nav_menu
    .filter((item) => item.show)
    .map((item) => {
      const children: HeaderDrawerNavItem[] | undefined =
        Array.isArray(item.children) && item.children !== null && item.children.length > 0
          ? item.children
              .filter((child) => child.show)
              .map((child) => ({
                key: `config-${item.id}-${child.id}`,
                title: child.title,
                icon: child.icon ?? "custom-color:link",
                href: child.href ?? "#",
                type: "link"
              }))
          : undefined;

      const hasChildren = !!children && children.length > 0;

      return {
        key: `config-${item.id}`,
        title: item.title,
        icon: item.icon ?? "custom-color:link",
        href: item.href ?? undefined,
        type: hasChildren ? "group" : "link",
        children
      };
    });

  return [...staticItems, ...configItems];
});

/**
 * 抽屉导航二级菜单点击处理
 * 菜单最多只有两级：顶级 li + 单个子 ul
 * - 同级菜单仅允许一个处于激活状态
 * - 通过高度动画控制子菜单展开与收起
 */
const handleActive = (e: Event) => {
  if (!e.currentTarget) return;

  const duration = 350;
  const currentEl = e.currentTarget as HTMLLIElement;
  const parent = currentEl.parentElement;
  const isActive = currentEl.classList.contains("active");

  /**
   * 收起指定菜单项的二级菜单
   */
  const collapse = (menuItem: HTMLLIElement) => {
    const subMenu = menuItem.querySelector("ul.header-drawer__sub-menu") as HTMLUListElement | null;

    if (!subMenu) return;

    subMenu.style.height = `${subMenu.scrollHeight}px`;

    setTimeout(() => {
      subMenu.style.height = "0px";
    });
  };

  /**
   * 展开指定菜单项的二级菜单
   */
  const expand = (menuItem: HTMLLIElement) => {
    const subMenu = menuItem.querySelector("ul.header-drawer__sub-menu") as HTMLUListElement | null;
    const arrow = menuItem.querySelector(".header-drawer__nav-item-arrow") as HTMLElement | null;

    if (!subMenu || !arrow) return;

    subMenu.style.transition = `height ${duration}ms`;
    arrow.style.transition = `transform ${duration}ms`;

    subMenu.style.height = `${subMenu.scrollHeight}px`;

    setTimeout(() => {
      subMenu.style.height = "auto";
    }, duration);
  };

  // 当前项已激活：只需要收起自身
  if (isActive) {
    currentEl.classList.remove("active");
    collapse(currentEl);
    return;
  }

  // 当前项未激活：先关闭同级其它激活项
  if (parent) {
    const siblings = parent.querySelectorAll<HTMLLIElement>(".header-drawer__nav-item.active");

    siblings.forEach((sibling) => {
      if (sibling === currentEl) return;

      sibling.classList.remove("active");
      collapse(sibling);
    });
  }

  // 再激活当前项并展开子菜单
  currentEl.classList.add("active");
  expand(currentEl);
};
</script>
<template>
  <USlideover v-model:open="visible" side="left">
    <template #content>
      <div class="header-drawer">
        <img class="header-drawer__author-bg" src="/images/author_bg.jpg" alt="author_bg" />
        <div class="header-drawer__user">
          <img
            class="header-drawer__user-avatar"
            :src="configStore.author_card.avatar ?? '/images/avatar.webp'"
            alt="avatar"
          />
          <a class="header-drawer__user-name" :href="configStore.author_card.name_link ?? '/'">
            {{ configStore.author_card.name }}
          </a>
          <p v-if="configStore.author_card.motto" class="header-drawer__user-motto">
            {{ configStore.author_card.motto }}
          </p>
        </div>
        <ul class="header-drawer__nav-menu">
          <template v-for="item in drawerNavItems" :key="item.key">
            <li
              v-if="item.children && item.children.length > 0"
              class="header-drawer__nav-item"
              @click="handleActive"
            >
              <div class="header-drawer__sub-menu-item">
                <span class="header-drawer__sub-menu-title">
                  <UIcon class="header-drawer__sub-menu-item-icon" :name="item.icon" :size="16" />
                  <span>{{ item.title }}</span>
                </span>
                <UIcon name="custom:down" class="header-drawer__nav-item-arrow" />
              </div>
              <ul class="header-drawer__sub-menu" @click.stop>
                <li v-for="sub in item.children" :key="sub.key" class="header-drawer__nav-item">
                  <a class="header-drawer__nav-link" :href="sub.href ?? '#'">
                    <UIcon class="header-drawer__nav-link-icon" :name="sub.icon" :size="16" />
                    <span>{{ sub.title }}</span>
                  </a>
                </li>
              </ul>
            </li>
            <li v-else class="header-drawer__nav-item">
              <a class="header-drawer__nav-link" :href="item.href ?? '#'">
                <UIcon class="header-drawer__nav-link-icon" :name="item.icon" :size="16" />
                <span>{{ item.title }}</span>
              </a>
            </li>
          </template>
        </ul>
      </div>
    </template>
  </USlideover>
</template>
<style scoped lang="scss">
@import url("../style/header-drawer.scss");
</style>
