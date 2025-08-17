<script setup lang="ts">
import type { CategoryItem } from "./types";
import { useConfigStore, useUserStore } from "@/stores";
import { SearchDrawer } from "@/components/search-box";
import HeaderDrawer from "./HeaderDrawer.vue";

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
  await navigateTo("/admin", {
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
  const auth = useCookie("Authorization");
  auth.value = null;
  userStore.userInfo = undefined;
  ElMessage.success({
    message: "已退出登录，3秒后将刷新页面",
    onClose: () => {
      window.location.reload();
    }
  });
};

// 侧边抽屉
const drawerVisible = ref(false);

const showDrawer = () => {
  drawerVisible.value = true;
};
</script>
<template>
  <div class="header" :class="{ active }">
    <div class="header__menu-btn" @click="showDrawer">
      <Icon name="custom:menu-button" :size="22" />
    </div>
    <a href="/" class="header__logo">
      <img :src="configStore.author_card.avatar ?? '/images/avatar.webp'" alt="avatar" />
    </a>
    <nav class="header__nav">
      <a class="nav-item" href="/">
        <Icon name="custom-color:home" :size="16" />
        <span> 首页 </span>
      </a>
      <div class="nav-item__dropdown">
        <span class="flex items-center gap-1">
          <Icon name="custom-color:folder" :size="16" />
          文档目录
          <Icon class="arrow" name="custom:down" :size="16" />
        </span>
        <nav class="dropdown-menu">
          <a v-for="item in categories" :key="item.id" :href="`/category/${item.id}`">
            <Icon :name="item.icon ?? 'custom-color:folder'" :size="16" />
            <span>{{ item.name }}</span>
          </a>
        </nav>
      </div>
      <a class="nav-item" href="/sn">
        <Icon name="custom-color:note" :size="16" />
        <span> 闪念笔记 </span>
      </a>
      <a class="nav-item" href="/message">
        <Icon name="custom-color:message" :size="16" />
        <span> 留言板 </span>
      </a>
      <template v-for="item in configStore.nav_menu" :key="item.id">
        <div v-if="item.children && item.children.length > 0 && item.show" class="item-dropdown">
          <span>
            <Icon :name="item.icon ?? ''" :size="16" />
            {{ item.title }}
            <Icon class="arrow" name="custom:down" :size="18" />
          </span>
          <nav class="dropdown-menu">
            <template v-for="sub in item.children" :key="sub.id">
              <a v-if="sub.show" :href="sub.href ?? '#'">
                <span>
                  <Icon :name="sub.icon ?? ''" :size="16" />
                  {{ sub.title }}
                </span>
              </a>
            </template>
          </nav>
        </div>
        <a v-else-if="item.show" class="item" :href="item.href ?? '#'">
          <span>
            <Icon :name="item.icon ?? ''" :size="16" />
            {{ item.title }}
          </span>
        </a>
      </template>
    </nav>
    <div class="header__action">
      <Icon name="i-lucide-search" :size="20" @click="switchSearch" />
      <Icon v-navigate-to="'/admin/login'" name="i-lucide-circle-user-round" :size="20" />
      <ClientOnly>
        <template #fallback>
          <Icon name="custom:light" :size="20" />
        </template>
        <div class="theme-switch">
          <Icon
            class="theme-switch__item"
            name="custom:dark"
            :class="{ active: $colorMode.value === 'dark' }"
            :size="20"
            @click="$colorMode.preference = 'light'"
          />
          <Icon
            class="theme-switch__item"
            name="custom:light"
            :class="{ active: $colorMode.value !== 'dark' }"
            :size="20"
            @click="$colorMode.preference = 'dark'"
          />
        </div>
      </ClientOnly>
    </div>

    <el-dropdown v-if="userStore.userInfo" style="margin-right: 30px">
      <div class="user">{{ userStore.userInfo.username }}</div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>用户信息</el-dropdown-item>
          <el-dropdown-item @click="toAdmin">后台管理</el-dropdown-item>
          <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <div class="header__search-btn" @click="switchSearch">
      <Icon name="i-lucide-search" :size="20" />
    </div>
  </div>
  <SearchDrawer v-model:visible="showSearch" />
  <HeaderDrawer v-model:visible="drawerVisible" />
</template>
<style scoped lang="scss">
@import url("../style/header.scss");
</style>
