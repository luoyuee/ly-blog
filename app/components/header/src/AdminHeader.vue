<script setup lang="ts">
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores";
import IconFont from "@/components/icon-font";

const userStore = useUserStore();
const route = useRoute();

const logout = () => {
  const auth = useCookie("Authorization");
  auth.value = null;
  userStore.userInfo = undefined;
  navigateTo("/admin/login");
};
</script>
<template>
  <div class="admin-header" id="admin-header">
    <div class="flex items-center">
      <div class="header-logo">
        <img src="/ly.svg" alt="logo" />
      </div>
      <el-menu
        :default-active="route.fullPath"
        router
        :ellipsis="false"
        mode="horizontal"
        background-color="#292d33"
        text-color="#BBB"
        popper-class="admin-header-menu"
      >
        <el-menu-item index="/admin">控制台</el-menu-item>
        <el-sub-menu index="/article">
          <template #title>管理</template>
          <el-menu-item index="/admin/article">文章</el-menu-item>
          <el-menu-item index="/admin/article/category">文章分类</el-menu-item>
          <el-menu-item index="/admin/article/comment">文章评论</el-menu-item>
          <el-menu-item index="/admin/message">访客留言</el-menu-item>
          <el-menu-item index="/admin/user">用户</el-menu-item>
          <el-menu-item index="/admin/hitokoto">一言语句</el-menu-item>
          <el-menu-item index="/admin/hitokoto/type">一言分类</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/admin/image">图库</el-menu-item>
        <el-sub-menu index="/setting">
          <template #title>设置</template>
          <el-menu-item index="/admin/setting/client">博客设置</el-menu-item>
          <el-menu-item index="/admin/setting/server">系统设置</el-menu-item>
        </el-sub-menu>
        <el-menu-item v-navigate-to.blank="'/admin/editor'">
          编辑器
        </el-menu-item>
      </el-menu>
    </div>
    <div class="header-action">
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
      <el-divider direction="vertical" />
      <div class="item">luoyue</div>
      <el-divider direction="vertical" />
      <div class="item" @click="logout">注销</div>
      <el-divider direction="vertical" />
      <div class="item" v-navigate-to.blank="'/'">博客</div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.admin-header {
  --el-menu-horizontal-height: var(--admin-header-height);
  position: sticky;
  top: 0;
  left: 0;
  z-index: 999;
  height: 40px;
  background-color: #292d33;
  transition: 0.35s ease-out;
  backdrop-filter: blur(3px);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-logo {
    width: 32px;
    height: 32px;
    margin-right: 16px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .el-menu--horizontal.el-menu {
    border-bottom: 0;
  }

  .el-menu--horizontal {
    .el-menu-item.is-active {
      border-bottom-width: 3px;
    }
  }

  .header-action {
    color: #bbb;
    display: flex;

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

    .iconfont {
      margin-left: 16px;
      cursor: pointer;
    }
    .el-divider {
      border-color: #383d45;
    }
    .item {
      padding: 0 12px;
      height: 100%;
      font-size: 0.875rem;
      cursor: pointer;
      user-select: none;
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
<style>
.el-popper.admin-header-menu.is-light {
  border-color: #292d33;
}
</style>
