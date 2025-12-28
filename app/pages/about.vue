<script setup lang="ts">
import { NoticeCard } from "@/components/mac-card";
import { BannerImage } from "@/components/banner-image";
import { AuthorCard } from "@/components/user-card";
import { PageFooter } from "@/components/page-footer";

const dependencies = computed(() => {
  return Object.entries(__LY_BLOG_METADATA__?.dependencies || {}).map(([name, version]) => ({
    name,
    version
  }));
});

const devDependencies = computed(() => {
  return Object.entries(__LY_BLOG_METADATA__?.devDependencies || {}).map(([name, version]) => ({
    name,
    version
  }));
});

const baseInfo = [
  {
    title: "版本号",
    content: __LY_BLOG_METADATA__?.appVersion || "0.0.0"
  },
  {
    title: "构建时间",
    content: __LY_BLOG_METADATA__?.buildTime
      ? new Date(__LY_BLOG_METADATA__?.buildTime).toLocaleString()
      : "Unknown"
  },
  {
    title: "开源许可协议",
    content: __LY_BLOG_METADATA__?.license || "Unknown"
  }
];

const repoUrl = computed(() => {
  return __LY_BLOG_METADATA__?.repoUrl;
});
</script>
<template>
  <main>
    <BannerImage title="关于本站" />
    <div class="container mx-auto">
      <div class="content">
        <div class="base-card">
          <h2 class="base-card-title">
            <UIcon class="base-card-title-icon" name="ep:paperclip" />
            项目简介
          </h2>
          这是一个基于 Nuxt 4
          构建的全栈博客系统，支持文章管理、笔记管理、留言板、图片资源管理以及“一言（Hitokoto）”等功能模块，采用现代前端技术与轻量后端方案，开箱即用、易于部署。
        </div>

        <div class="base-card">
          <h2 class="base-card-title">
            <UIcon class="base-card-title-icon" name="ep:operation" />
            基本信息
          </h2>
          <div
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-gray-200 border-l border-t border-gray-200"
          >
            <div
              v-for="item in baseInfo"
              :key="item.title"
              class="flex flex-col items-center p-2 last:border-b last:border-r last:border-gray-200"
            >
              <span class="text-sm text-gray-700">{{ item.title }}</span>
              <span class="text-xs text-gray-500">{{ item.content }}</span>
            </div>

            <div
              class="flex flex-col items-center p-2 last:border-b last:border-r last:border-gray-200"
            >
              <span class="text-sm text-gray-700">仓库主页</span>
              <span class="text-xs text-gray-500">
                <ULink target="_blank" :href="repoUrl" active>{{ repoUrl }}</ULink>
              </span>
            </div>
          </div>
        </div>

        <div class="base-card">
          <h2 class="base-card-title">
            <UIcon class="base-card-title-icon" name="ep:cpu" />
            生产环境依赖
          </h2>
          <div
            class="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-gray-200 border-l border-t border-gray-200"
          >
            <div
              v-for="item in dependencies"
              :key="item.name"
              class="flex flex-col items-center p-2 last:border-b last:border-r last:border-gray-200"
            >
              <span class="text-sm text-gray-700">{{ item.name }}</span>
              <span class="text-xs text-gray-500">{{ item.version }}</span>
            </div>
          </div>
        </div>

        <div class="base-card">
          <h2 class="base-card-title">
            <UIcon class="base-card-title-icon" name="ep:box" />
            开发环境依赖
          </h2>
          <div
            class="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-gray-200 border-l border-t border-gray-200"
          >
            <div
              v-for="item in devDependencies"
              :key="item.name"
              class="flex flex-col items-center p-2 last:border-b last:border-r last:border-gray-200"
            >
              <span class="text-sm text-gray-700">{{ item.name }}</span>
              <span class="text-xs text-gray-500">{{ item.version }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="aside">
        <div style="position: sticky; top: calc(var(--header-height) + 16px)">
          <AuthorCard class="mb-4" />
          <NoticeCard class="mb-4" />
        </div>
      </div>
    </div>
    <PageFooter class="mt-4" />
  </main>
</template>
<style scoped lang="scss">
.container {
  .content {
    .base-card {
      padding: 1.5rem;
      margin-bottom: 1rem;

      &-title {
        font-size: 1.25rem;
        font-weight: bold;
        padding-bottom: 0.5rem;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;

        &-icon {
          margin-right: 0.25rem;
        }
      }
    }
    .base-card:first-child {
      .base-card-title {
        margin-bottom: 1rem;
        border-bottom: 2px solid var(--text-color-5);
      }
    }
  }
}
</style>
