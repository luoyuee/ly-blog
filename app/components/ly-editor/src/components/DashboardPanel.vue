<script setup lang="ts">
import {
  ArticleCard,
  NoteCard,
  ImageCard,
  LikeCard,
  ViewCard,
  CommentCard,
  MessageCard,
  FleetingThoughtCard,
  OverviewCard
} from "@/components/dashboard";

/**
 * 文章数量
 * 笔记数量
 * 评论数量
 * 点赞数量
 * 阅读数量
 * 图片数量（图库数量和图片数量，容量）
 * 总访问次数（只统计博客的访问和api次数）
 * 公告
 * 最近文章
 * 最近笔记
 *
 * 访问IP地图
 */
</script>
<template>
  <div class="space-y-4 h-full p-4 overflow-y-auto slim-scrollbar">
    <div class="grid grid-cols-2 gap-4">
      <ArticleCard />
      <NoteCard />
    </div>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
      <ImageCard />
      <ViewCard />
      <LikeCard />
      <CommentCard />
      <MessageCard />
      <FleetingThoughtCard />
    </div>
    <div class="mt-4">
      <OverviewCard />
    </div>
  </div>
</template>
<style scoped lang="scss">
.control-card {
  background-color: var(--bg-color);
  box-shadow: var(--box-shadow);
  border-radius: var(--radius-wrap);
  padding: 1rem;
  overflow-y: auto;
  max-height: 416px;

  .control-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;
    cursor: pointer;
    transition: all 0.35s;
    height: 80px;

    &:hover {
      box-shadow: var(--box-shadow);
    }

    .text {
      font-size: 0.875rem;
      color: var(--text-color-2);
    }
  }
}
</style>
