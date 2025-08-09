<script setup lang="ts">
import { useConfigStore, useUserStore } from "@/stores";
import type { DropdownMenuItem } from "@nuxt/ui";
import HeaderDrawer from "./HeaderDrawer.vue";
// import { SearchDrawer } from "@/components/search-box";

const configStore = useConfigStore();
const userStore = useUserStore();

const { data: categories } = useFetch<
  { id: number; icon: string; name: string }[]
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
  // ElMessage.success({
  //   message: "已退出登录，3秒后将刷新页面",
  //   onClose: () => {
  //     window.location.reload();
  //   },
  // });
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
      <img
        :src="configStore.author_card.avatar ?? '/images/avatar.webp'"
        alt="avatar"
      />
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
          <a
            v-for="item in categories"
            :key="item.id"
            :href="`/category/${item.id}`"
          >
            <UIcon :name="item.icon ?? 'custom-color:folder'" :size="16" />
            <span>{{ item.name }}</span>
          </a>
        </nav>
      </div>
      <a class="nav-item" href="/sn">
        <UIcon name="custom-color:note" :size="16" />
        <span> 闪念笔记 </span>
      </a>
      <a class="nav-item" href="/message">
        <UIcon name="custom-color:message" :size="16" />
        <span> 留言板 </span>
      </a>
      <template v-for="item in configStore.nav_menu" :key="item.id">
        <div
          class="item-dropdown"
          v-if="item.children && item.children.length > 0 && item.show"
        >
          <span>
            <UIcon :name="item.icon ?? 'icon-color-wenjianjia'" :size="16" />
            {{ item.name }}
            <UIcon class="arrow" name="custom:down" :size="18" />
          </span>
          <nav class="dropdown-menu">
            <template v-for="sub_item in item.children" :key="sub_item.id">
              <a :href="sub_item.url" v-if="sub_item.show">
                <span>
                  <UIcon
                    :name="sub_item.icon ?? 'icon-color-lianjie'"
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
            <UIcon :name="item.icon ?? 'icon-color-lianjie'" :size="16" />
            {{ item.name }}
          </span>
        </a>
      </template>
    </nav>
    <div class="header__action">
      <UIcon name="i-lucide-search" :size="20" />
      <UIcon
        name="i-lucide-circle-user-round"
        :size="20"
        v-navigate-to="'/admin/login'"
      />
      <ClientOnly>
        <template #fallback>
          <UIcon name="custom:light" :size="20" />
        </template>
        <UIcon
          name="custom:dark"
          class="theme-switch"
          :class="{ active: $colorMode.value === 'dark' }"
          :size="20"
          @click="$colorMode.preference = 'light'"
        />
        <UIcon
          name="custom:light"
          class="theme-switch"
          :class="{ active: $colorMode.value !== 'dark' }"
          :size="20"
          @click="$colorMode.preference = 'dark'"
        />
      </ClientOnly>
    </div>

    <UPopover
      v-if="userStore.userInfo"
      mode="hover"
      arrow
      v-model:open="open"
      :ui="{
        content: 'w-32 p-1',
      }"
    >
      <div class="header__user">{{ userStore.userInfo.username }}</div>

      <template #content>
        <div class="text-neutral-200">
          <div
            class="flex items-center p-1.5 hover:bg-elevated select-none cursor-pointer text-sm gap-1.5 text-default"
            @click="open = false"
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
            <UIcon
              name="i-lucide-log-out"
              class="text-neutral-400"
              :size="18"
            />
            <span>退出登录</span>
          </div>
        </div>
      </template>
    </UPopover>
    <div class="header__search-btn" @click="switchSearch">
      <UIcon name="i-lucide-search" :size="20" />
    </div>
  </div>
  <!-- <Search v-model:visible="showSearch" /> -->
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

  &__logo {
    img {
      border-radius: 50%;
      width: 40px;
      height: 40px;
      object-fit: cover;
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    flex: 1;
    margin-left: 32px;
    .nav-item {
      margin-right: 8px;
      padding: 0 8px;
      color: var(--color-white);
      text-decoration: none;
      position: relative;
      height: 60px;
      line-height: 60px;
      font-size: 16px;
      transition: color 0.35s;
      white-space: nowrap;
      display: flex;
      align-items: center;
      display: inline-flex;
      align-items: center;
      gap: 4px;

      &:hover {
        color: var(--ui-color-primary-400);
      }
    }

    .nav-item.active {
      color: var(--primary-color) !important;

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

    .nav-item__dropdown {
      height: 60px;
      line-height: 60px;
      position: relative;
      padding: 0 5px;
      font-size: 15px;
      margin-right: 8px;
      padding: 0 8px;
      transition: color 0.35s;
      white-space: nowrap;
      color: var(--color-white);
      cursor: pointer;

      .arrow {
        color: var(--color-white);
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
        background: var(--header-bg-color);
        display: flex;
        flex-direction: column;
        box-shadow: var(--box-shadow);
        border-radius: 4px;
        overflow: hidden;
        opacity: 0;
        transform: translateX(-50%) perspective(600px) rotateX(-45deg);
        transition: opacity 0.35s, visibility 0.35s, transform 0.35s;

        > a {
          display: inline-flex;
          line-height: 40px;
          height: 40px;
          transition: 0.35s;
          color: var(--ui-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 16px;
          text-decoration: none;
          align-items: center;
          gap: 4px;

          &:hover {
            color: var(--theme-color);
            transition: 0.35s;
          }
        }
      }
    }
  }

  &__action {
    color: var(--color-white);
    display: inline-flex;
    gap: 16px;
    align-items: center;

    .iconify {
      cursor: pointer;

      &:hover {
        color: var(--theme-color);
      }
    }

    .theme-switch {
      display: none;
    }

    .theme-switch.active {
      display: unset;
    }
  }

  &__user {
    color: var(--color-white);
    margin-left: 16px;
    outline: none;
    user-select: none;
    cursor: pointer;

    &:hover {
      color: var(--theme-color);
    }
  }

  &__menu-btn,
  &__search-btn {
    display: none;
  }
}

.header.active {
  box-shadow: 0 2px 10px 0px rgba(121, 121, 121, 0.4);
  background-color: var(--header-bg-color);

  .header__nav {
    .nav-item {
      color: var(--ui-text);

      &:hover {
        color: var(--theme-color);
      }
    }
    .nav-item__dropdown {
      color: var(--ui-text);
      .arrow {
        color: var(--ui-text);
      }
    }
  }
  .header__user,
  .header__action {
    color: var(--ui-text);
  }
}

@media screen and (max-width: 1024px) {
  .header {
    // background-color: var(--bg-color);
    padding: 0 1rem;
    &__logo {
      img {
        width: 32px;
        height: 32px;
      }
    }
    &__nav,
    &__action,
    &__user {
      display: none;
    }
    &__menu-btn,
    &__search-btn {
      display: inline-flex;
    }
  }
}
</style>
