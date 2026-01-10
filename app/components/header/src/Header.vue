<script setup lang="ts">
import type { CategoryItem } from "./types";
import { useConfigStore, useUserStore } from "@/stores";
import { SearchDrawer } from "@/components/search-box";
import HeaderDrawer from "./HeaderDrawer.vue";
import ThemeSwitch from "@/components/theme-switch";

const $message = useMessage();

const configStore = useConfigStore();
const userStore = useUserStore();

const { data: categories } = useFetch<CategoryItem[]>("/api/article/category/root", {
  method: "get"
});

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

const toAdmin = async () => {
  await navigateTo("/admin/editor", {
    open: {
      target: "_blank"
    }
  });
};

const showSearch = ref(false);
const switchSearch = () => {
  showSearch.value = !showSearch.value;
};

const logout = () => {
  $message.success("已退出登录，3秒后将刷新页面");
  setTimeout(() => {
    const auth = useCookie("Authorization");
    auth.value = null;

    userStore.profile = undefined;

    window.location.reload();
  }, 3000);
};

// 侧边抽屉
const drawerVisible = ref(false);

const showDrawer = () => {
  drawerVisible.value = true;
};

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
      <a class="nav-item" href="/">
        <UIcon name="custom-color:home" :size="16" />
        <span> 首页 </span>
      </a>
      <div class="nav-item__dropdown">
        <span class="flex items-center gap-1">
          <UIcon name="custom-color:folder" :size="16" />
          文档目录
          <UIcon class="arrow" name="custom:down" :size="16" />
        </span>
        <nav class="dropdown-menu">
          <a v-for="item in categories" :key="item.id" :href="`/category/${item.id}`">
            <UIcon :name="item.icon ?? 'custom-color:folder'" :size="16" />
            <span>{{ item.name }}</span>
          </a>
        </nav>
      </div>
      <a class="nav-item" href="/sn">
        <UIcon name="custom-color:execute-book" :size="16" />
        <span> 闪念笔记 </span>
      </a>
      <a class="nav-item" href="/message">
        <UIcon name="custom-color:message" :size="16" />
        <span> 留言板 </span>
      </a>
      <a class="nav-item" href="/work">
        <UIcon name="custom-color:recommend" :size="16" />
        <span> 作品 </span>
      </a>
      <a class="nav-item" href="/about">
        <UIcon name="custom-color:config" :size="16" />
        <span> 关于 </span>
      </a>
      <template v-for="item in configStore.nav_menu" :key="item.id">
        <div v-if="item.children && item.children.length > 0 && item.show" class="item-dropdown">
          <span>
            <UIcon :name="item.icon ?? ''" :size="16" />
            {{ item.title }}
            <UIcon class="arrow" name="custom:down" :size="18" />
          </span>
          <nav class="dropdown-menu">
            <template v-for="sub in item.children" :key="sub.id">
              <a v-if="sub.show" :href="sub.href ?? '#'">
                <span>
                  <UIcon :name="sub.icon ?? ''" :size="16" />
                  {{ sub.title }}
                </span>
              </a>
            </template>
          </nav>
        </div>
        <a v-else-if="item.show" class="item" :href="item.href ?? '#'">
          <span>
            <UIcon :name="item.icon ?? ''" :size="16" />
            {{ item.title }}
          </span>
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
