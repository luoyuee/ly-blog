<script setup lang="ts">
import type { GetArticlePaginatedResponse } from "@/apis/article/models";
import type { ArticleItem } from "#shared/types/article";
import { FullBannerImage } from "@/components/banner-image";
import PageFooter from "@/components/page-footer";
import { AuthorCard } from "@/components/user-card";
import { Swiper } from "@/components/swiper";
import {
  ExternalLinkCard,
  NoticeCard,
  TagCard,
  LifeCountdownCard,
  HitokotoCard
} from "@/components/mac-card";
import { useConfigStore } from "@/stores";
import { ArticleList, ArticleListDivider } from "@/components/article";
import { getPaginatedArticles } from "@/apis/article";
import { useMessage } from "@/composables/useMessage";
import { useIntersectionObserver } from "@vueuse/core";

const configStore = useConfigStore();

const state = reactive<{
  page: number;
  per_page: number;
  total: number;
  loading: boolean;
}>({
  page: 1,
  per_page: 10,
  total: 0,
  loading: false
});

const hasMore = computed(() => state.page * state.per_page < state.total);

const articleList = ref<ArticleItem[]>([]);

const { data: initialData } = await useFetch<GetArticlePaginatedResponse>("/api/article", {
  method: "get",
  params: { page: state.page, per_page: state.per_page }
});

if (initialData.value) {
  articleList.value = initialData.value.data;
  state.page = initialData.value.page;
  state.total = initialData.value.total;
}

const loadArticles = async () => {
  try {
    state.loading = true;

    const response = await getPaginatedArticles({
      page: state.page + 1,
      per_page: state.per_page
    });

    articleList.value = [...articleList.value, ...response.data];

    state.page = response.page;
    state.total = response.total;
  } catch (error) {
    const $message = useMessage();
    $message.error("加载文章失败", error);
  } finally {
    state.loading = false;
  }
};

const dividerRef = useTemplateRef<HTMLElement>("dividerRef");

onMounted(() => {
  useIntersectionObserver(
    dividerRef,
    ([entry]) => {
      if (entry?.isIntersecting && hasMore.value) {
        loadArticles();
      }
    },
    {
      rootMargin: "0px 0px 320px 0px"
    }
  );
});

const { data: tags } = await useFetch<string[]>("/api/article/tags", { method: "get" });
</script>
<template>
  <main>
    <FullBannerImage />
    <div class="container mx-auto">
      <div class="content">
        <Swiper
          v-if="configStore.swiper && configStore.swiper.length > 0"
          class="mb-4"
          :data="configStore.swiper"
        />
        <ArticleList :data="articleList" />
        <ArticleListDivider ref="dividerRef" :loading="state.loading" text="我也是有底线的" />
      </div>
      <div class="aside space-y-4">
        <AuthorCard />
        <NoticeCard />
        <ExternalLinkCard />
        <TagCard :data="tags" />
        <LifeCountdownCard />
        <HitokotoCard />
      </div>
    </div>
    <PageFooter class="mt-4" />
  </main>
</template>
<style scoped lang="scss"></style>
