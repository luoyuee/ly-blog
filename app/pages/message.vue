<script setup lang="ts">
import { NoticeCard, TagCard, HitokotoCard } from "@/components/mac-card";
import { AuthorCard } from "@/components/user-card";
import { MessageList } from "@/components/message-board";
import { BannerImage } from "@/components/banner-image";
import { useConfigStore } from "@/stores";
import { PageFooter } from "@/components/page-footer";

const configStore = useConfigStore();
</script>
<template>
  <main>
    <BannerImage title="留言板" />
    <div class="container mx-auto">
      <div class="content">
        <div v-if="configStore.message_board.intro" class="intros">
          {{ configStore.message_board.intro }}
        </div>
        <MessageList :class="{ 'mt-4': configStore.message_board.intro }" />
      </div>

      <div class="aside">
        <AuthorCard class="mb-4" />
        <NoticeCard class="mb-4" />
        <TagCard class="mb-4" />
        <HitokotoCard class="mb-4" />
      </div>
    </div>
    <PageFooter class="mt-4" />
  </main>
</template>
<style scoped lang="scss">
.container {
  .content {
    .intros {
      color: var(--text-color-2);
      background: var(--bg-color);
      box-shadow: var(--box-shadow);
      border-radius: var(--radius-wrap);
      text-shadow: var(--text-shadow);
      padding: 32px;
      text-align: center;
      line-height: 1.8;
      white-space: pre-wrap;
    }
  }
}
</style>
