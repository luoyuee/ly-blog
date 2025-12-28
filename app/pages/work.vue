<script setup lang="ts">
import type { WorkItem } from "@@/shared/types/config";
import { useWaterfall } from "@/composables/useWaterfall";
import { BannerImage } from "@/components/banner-image";
import { PageFooter } from "@/components/page-footer";
import { AuthorCard } from "@/components/user-card";
import { NoticeCard } from "@/components/mac-card";

const { data } = await useFetch<WorkItem[]>("/api/config/work", {
  method: "get"
});

const containerRef = ref<HTMLElement | null>(null);

useWaterfall(containerRef, {
  defaultColumns: 1,
  breakpoints: [
    {
      minWidth: 480,
      columns: 2
    },
    {
      minWidth: 720,
      columns: 3
    }
  ]
});
</script>
<template>
  <main>
    <BannerImage title="我的项目" />
    <div class="container mx-auto">
      <div ref="containerRef" class="content work-masonry" aria-label="项目瀑布流列表">
        <article v-for="item in data" :key="item.repoUrl" class="work-masonry__item project-card">
          <header class="project-card__header" aria-label="项目标题">
            <a
              class="project-card__title"
              :href="item.repoUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="打开仓库新页面"
            >
              <div class="project-card__title-content">
                <span class="project-card__icon" aria-hidden="true">{{ item.icon }}</span>
                <h3 class="project-card__name">{{ item.name }}</h3>
              </div>

              <span class="project-card__arrow" aria-hidden="true">→</span>
            </a>
          </header>

          <section class="project-card__body" aria-label="项目内容">
            <p class="project-card__desc">{{ item.description }}</p>
            <img
              class="project-card__image"
              :src="item.image"
              :alt="`项目 ${item.name} 预览图`"
              loading="lazy"
            />
          </section>

          <footer class="project-card__footer" aria-label="项目底部信息">
            <ul class="project-card__tags" aria-label="主要编程语言">
              <li v-for="lang in item.languages" :key="lang" class="project-card__tag">
                {{ lang }}
              </li>
            </ul>
          </footer>
        </article>
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
  .project-card {
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: transform 0.5s ease;
    margin-bottom: 16px;
  }

  .project-card__header {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .project-card__title-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .project-card__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    /* 作为链接时的基础样式：继承颜色并去除默认下划线 */
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;
  }
  .project-card__icon {
    font-size: 20px;
    line-height: 1;
  }
  .project-card__name {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    transition:
      color 0.2s ease,
      text-decoration-color 0.2s ease;
  }
  .project-card__arrow {
    font-size: 16px;
    color: #9ca3af;
    transition:
      transform 0.2s ease,
      color 0.2s ease;
  }
  .project-card__title:hover .project-card__name {
    color: #2563eb;
  }

  .project-card__header:hover .project-card__arrow {
    transform: translateX(4px);
    color: #2563eb;
  }

  .project-card__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
  }
  .project-card__desc {
    margin: 0;
    font-size: 14px;
    color: #4b5563;
  }
  .project-card__image {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
  }

  .project-card__footer {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 12px 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  .project-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .project-card__tag {
    font-size: 12px;
    line-height: 1;
    padding: 4px 8px;
    border-radius: 999px;
    background: #eef2ff;
    color: #3730a3;
  }
}
</style>
