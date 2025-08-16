<script setup lang="ts">
import type { IconFontType } from "@/components/icon-font";
import { useConfigStore, useUserStore } from "@/stores";
import { ElMessage } from "element-plus";
import HeaderDrawer from "./HeaderDrawer.vue";
import Search from "@/components/search";

const configStore = useConfigStore();
const userStore = useUserStore();

const { data: categories } = useFetch<
  { id: number; icon: IconFontType; name: string }[]
>("/api/article/category/root", {
  method: "get",
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
      target: "_blank",
    },
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
    },
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
    <div class="menu-btn" @click="showDrawer">
      <IconFont icon="icon-menu" :size="22" />
    </div>
    <a href="/" class="header-logo">
      <img
        :src="configStore.author_card.avatar ?? '/images/avatar.webp'"
        alt="avatar"
      />
    </a>
    <nav class="header-nav">
      <a class="item" href="/">
        <span>
          <IconFont icon="icon-color-shouye" :size="16" />
          首页
        </span>
      </a>
      <div class="item-dropdown">
        <span>
          <IconFont icon="icon-color-wenjianjia" :size="16" />
          文档目录
          <IconFont class="arrow" icon="icon-down" :size="18" />
        </span>
        <nav class="dropdown-menu">
          <a
            :href="`/category/${item.id}`"
            v-for="item in categories"
            :key="item.id"
          >
            <span>
              <IconFont
                :icon="item.icon ?? 'icon-color-wenjianjia'"
                :size="16"
              />
              {{ item.name }}
            </span>
          </a>
        </nav>
      </div>
      <a class="item" href="/sn">
        <span>
          <IconFont icon="icon-color-zhihangshu" :size="16" />
          闪念笔记
        </span>
      </a>
      <a class="item" href="/message">
        <span>
          <IconFont icon="icon-color-xiaoxi" :size="16" />
          留言板
        </span>
      </a>
      <template v-for="item in configStore.nav_menu" :key="item.id">
        <div
          class="item-dropdown"
          v-if="item.children && item.children.length > 0 && item.show"
        >
          <span>
            <IconFont :icon="item.icon ?? 'icon-color-wenjianjia'" :size="16" />
            {{ item.name }}
            <IconFont class="arrow" icon="icon-down" :size="18" />
          </span>
          <nav class="dropdown-menu">
            <template v-for="sub_item in item.children" :key="sub_item.id">
              <a :href="sub_item.url" v-if="sub_item.show">
                <span>
                  <IconFont
                    :icon="sub_item.icon ?? 'icon-color-lianjie'"
                    :size="16"
                  />
                  {{ sub_item.name }}
                </span>
              </a>
            </template>
          </nav>
        </div>
        <a class="item" :href="item.url" v-else-if="item.show">
          <span>
            <IconFont :icon="item.icon ?? 'icon-color-lianjie'" :size="16" />
            {{ item.name }}
          </span>
        </a>
      </template>
    </nav>
    <div class="header-action">
      <IconFont icon="icon-search" :size="20" @click="switchSearch" />
      <IconFont icon="icon-me" :size="20" v-navigate-to="'/admin/login'" />
      <ClientOnly>
        <template #fallback>
          <IconFont icon="icon-light" :size="20"></IconFont>
        </template>
        <div class="theme-switch">
          <IconFont
            :class="{ active: $colorMode.value === 'dark' }"
            icon="icon-dark"
            @click="$colorMode.preference = 'light'"
            :size="20"
          ></IconFont>
          <IconFont
            :class="{ active: $colorMode.value !== 'dark' }"
            icon="icon-light"
            @click="$colorMode.preference = 'dark'"
            :size="20"
          ></IconFont>
        </div>
      </ClientOnly>
    </div>
    <el-dropdown style="margin-right: 30px" v-if="userStore.userInfo">
      <div class="user">{{ userStore.userInfo.username }}</div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>用户信息</el-dropdown-item>
          <el-dropdown-item @click="toAdmin">后台管理</el-dropdown-item>
          <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <div class="search-btn" @click="switchSearch">
      <IconFont icon="icon-search" :size="22" />
    </div>
  </div>
  <Search v-model:visible="showSearch" />
  <HeaderDrawer v-model:visible="drawerVisible" />
</template>
<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 999;
  height: var(--header-height);
  background: transparent;
  transition: 0.35s ease-out;
  backdrop-filter: blur(3px);
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-logo {
    img {
      border-radius: 50%;
      width: 40px;
      height: 40px;
      object-fit: cover;
    }
  }
  .header-nav {
    display: flex;
    align-items: center;
    flex: 1;
    margin-left: 32px;
    .item {
      margin-right: 8px;
      padding: 0 8px;
      color: #ffffff;
      text-decoration: none;
      position: relative;
      height: 60px;
      line-height: 60px;
      font-size: 15px;
      transition: color 0.35s;
      white-space: nowrap;
      display: flex;
      align-items: center;

      &:hover {
        color: var(--theme-color);
      }
    }
    .item.active {
      color: var(--theme-color) !important;

      &::after {
        content: "";
        height: 3px;
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        border-radius: 6px 6px 0 0;
        background-color: var(--theme-color);
        transition: 0.35s ease-out;
      }
    }
    .item-dropdown {
      height: 60px;
      line-height: 60px;
      position: relative;
      padding: 0 5px;
      font-size: 15px;
      margin-right: 8px;
      padding: 0 8px;
      transition: color 0.35s;
      white-space: nowrap;
      color: var(--white);
      cursor: pointer;
      .arrow {
        color: var(--white);
        transition: transform 0.35s;
      }

      &:hover {
        .arrow {
          transform: rotateZ(-180deg);
        }
        .dropdown-menu {
          visibility: visible;
          opacity: 1;
          transform: translateX(-50%) perspective(600px) rotateX(0);
        }
      }

      .dropdown-menu {
        position: absolute;
        left: 50%;
        visibility: hidden;
        z-index: 999;
        transform-origin: top;
        background: var(--bg-color);
        display: flex;
        flex-direction: column;
        box-shadow: var(--box-shadow);
        border-radius: 4px;
        overflow: hidden;
        opacity: 0;
        transform: translateX(-50%) perspective(600px) rotateX(-45deg);
        transition: opacity 0.35s, visibility 0.35s, transform 0.35s;

        > a {
          display: block;
          line-height: 40px;
          height: 40px;
          transition: 0.35s;
          color: var(--text-color-1);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 16px;
          text-decoration: none;

          &:hover {
            background: var(--hover-bg-color);
            color: var(--theme-color);
            transition: 0.35s;
          }
        }
      }
    }
  }
  .header-action {
    color: var(--white);
    display: flex;

    .iconfont {
      margin-left: 16px;
      cursor: pointer;

      &:hover {
        color: var(--theme-color);
      }
    }

    .theme-switch {
      margin-left: 16px;
      width: 20px;
      position: relative;

      .iconfont {
        margin-left: 0;
        position: absolute;
        transition: all 0.35s;
        transform: scale(0);
      }

      .iconfont.active {
        transform: scale(1);
      }
    }
  }
  .user {
    color: var(--white);
    margin-left: 1rem;
    outline: none;
    user-select: none;
    cursor: pointer;
    padding: 6px 0;

    &:hover {
      color: var(--theme-color);
    }
  }

  .menu-btn,
  .search-btn {
    display: none;
  }
}

.header.active {
  box-shadow: 0 2px 10px 0px rgba(121, 121, 121, 0.4);
  background-color: var(--bg-color);

  .header-nav {
    .item {
      color: var(--text-color);

      &:hover {
        color: var(--theme-color);
      }
    }
    .item-dropdown {
      color: var(--text-color);
      .arrow {
        color: var(--text-color);
      }
    }
  }
  .user,
  .header-action {
    color: var(--text-color);
  }
}

@media screen and (max-width: 1024px) {
  .header {
    background-color: var(--bg-color);
    padding: 0 1rem;
    .header-logo {
      img {
        width: 32px;
        height: 32px;
      }
    }
    .el-dropdown,
    .header-nav,
    .header-action,
    .user {
      display: none;
    }
    .menu-btn,
    .search-btn {
      display: block;
    }
  }
}
</style>
