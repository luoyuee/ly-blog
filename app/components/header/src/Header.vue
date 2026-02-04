<script setup lang="ts">
import type { ArticleCategoryRootItem } from "@@/shared/types/article";
import { useConfigStore, useUserStore } from "@/stores";
import { SearchDrawer } from "@/components/search-box";
import ThemeSwitch from "@/components/theme-switch";
import HeaderDrawer from "./HeaderDrawer.vue";

const $message = useMessage();

const configStore = useConfigStore();
const userStore = useUserStore();

/**
 * 顶部导航分类数据
 */
const { data: categories } = useFetch<ArticleCategoryRootItem[]>("/api/article/category/root", {
  method: "get"
});

/**
 * 顶部导航滚动激活状态
 */
const active = ref(false);

const handleScroll = () => {
  active.value = window.scrollY > 200;
};

onMounted(() => {
  active.value = window.scrollY > 200;

  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

/**
 * 顶部导航菜单项类型
 * 统一描述所有需要渲染的菜单项（首页、文档目录、配置菜单等）
 */
interface HeaderNavItem {
  key: string;
  title: string;
  icon: string;
  href?: string;
  type: "link" | "group";
  children?: HeaderNavItem[];
}

/**
 * 顶部导航菜单数据
 * - 静态菜单：首页、文档目录、闪念笔记、留言板、作品、关于
 * - 动态菜单：配置中的 nav_menu
 */
const headerNavItems = computed<HeaderNavItem[]>(() => {
  const categoryChildren: HeaderNavItem[] = (categories.value ?? []).map((category) => ({
    key: `category-${category.id}`,
    title: category.name,
    icon: category.icon ?? "custom-color:folder",
    href: `/category/${category.id}`,
    type: "link"
  }));

  const staticItems: HeaderNavItem[] = [
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

  const configItems: HeaderNavItem[] = configStore.nav_menu
    .filter((item) => item.show)
    .map((item) => {
      const children: HeaderNavItem[] | undefined =
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
 * 跳转到后台编辑器
 */
const toAdmin = async () => {
  await navigateTo("/admin/editor", {
    open: { target: "_blank" }
  });
};

/**
 * 全局搜索抽屉显示状态
 */
const showSearch = ref(false);

const switchSearch = () => {
  showSearch.value = !showSearch.value;
};

/**
 * 退出登录
 */
const logout = () => {
  $message.success("已退出登录，3秒后将刷新页面");

  setTimeout(() => {
    const auth = useCookie("Authorization");

    auth.value = null;

    userStore.profile = undefined;

    window.location.reload();
  }, 3000);
};

/**
 * 侧边抽屉显示状态
 */
const drawerVisible = ref(false);

const showDrawer = () => {
  drawerVisible.value = true;
};

/**
 * 用户信息弹出层显示状态
 */
const open = ref(false);
</script>
<template>
  <div class="header" :class="{ active }">
    <div class="header__menu-btn" @click="showDrawer">
      <UIcon name="custom:menu-button" :size="22" />
    </div>

    <a href="/" class="header__logo">
      <img :src="configStore.author_card.avatar ?? '/images/avatar.webp'" alt="avatar" />
    </a>

    <nav class="header__nav">
      <template v-for="item in headerNavItems" :key="item.key">
        <div v-if="item.children && item.children.length > 0" class="nav-item__dropdown">
          <span class="flex items-center gap-1">
            <UIcon :name="item.icon" :size="16" />
            {{ item.title }}
            <UIcon class="arrow" name="custom:down" :size="16" />
          </span>
          <nav class="dropdown-menu">
            <a v-for="sub in item.children" :key="sub.key" :href="sub.href ?? '#'">
              <UIcon :name="sub.icon" :size="16" />
              <span>{{ sub.title }}</span>
            </a>
          </nav>
        </div>
        <a v-else class="nav-item" :href="item.href ?? '#'">
          <UIcon :name="item.icon" :size="16" />
          <span> {{ item.title }} </span>
        </a>
      </template>
    </nav>

    <div class="header__action">
      <UIcon name="i-lucide-search" :size="20" @click="switchSearch" />
      <UIcon v-navigate-to="'/admin/login'" name="i-lucide-circle-user-round" :size="20" />
      <ThemeSwitch />
    </div>

    <UPopover
      v-if="userStore.profile"
      v-model:open="open"
      mode="hover"
      arrow
      :ui="{ content: 'w-32 p-1' }"
    >
      <div class="header__user">{{ userStore.profile.nickname || userStore.profile.username }}</div>

      <template #content>
        <div class="text-neutral-200">
          <div
            class="flex items-center p-1.5 hover:bg-elevated select-none cursor-pointer text-sm gap-1.5 text-default"
          >
            <UIcon name="i-lucide-user" class="text-neutral-400" :size="18" />
            <span>用户信息</span>
          </div>
          <div
            class="flex items-center p-1.5 hover:bg-elevated select-none cursor-pointer text-sm gap-1.5 text-default"
            @click="toAdmin"
          >
            <UIcon name="i-lucide-server" class="text-neutral-400" :size="18" />
            <span>后台管理</span>
          </div>
          <div
            class="flex items-center p-1.5 hover:bg-elevated select-none cursor-pointer text-sm gap-1.5 text-default"
            @click="logout"
          >
            <UIcon name="i-lucide-log-out" class="text-neutral-400" :size="18" />
            <span>退出登录</span>
          </div>
        </div>
      </template>
    </UPopover>

    <div class="header__search-btn" @click="switchSearch">
      <UIcon name="i-lucide-search" :size="20" />
    </div>
  </div>
  <SearchDrawer v-model:visible="showSearch" />
  <HeaderDrawer v-model:visible="drawerVisible" />
</template>
<style scoped lang="scss">
@import url("../style/header.scss");
</style>
