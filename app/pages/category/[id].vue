<script setup lang="ts">
import type { GetArticlePaginatedResponse } from "@/apis/article/models";
import type { ArticleItem, ArticleCategory } from "@@/shared/types/article";
import { BannerImage } from "@/components/banner-image";
import { NoticeCard, TagCard, LifeCountdownCard, HitokotoCard } from "@/components/mac-card";
import { ArticleList, ArticleListDivider } from "@/components/article";
import { getPaginatedArticles } from "@/apis/article";
import { useRoute } from "vue-router";
import { AuthorCard } from "@/components/user-card";
import { PageFooter } from "@/components/page-footer";
import { useMessage } from "@/composables/useMessage";
import { useIntersectionObserver } from "@vueuse/core";

const $message = useMessage();
const route = useRoute();

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

const { data: category } = await useFetch<ArticleCategory>(
  "/api/article/category/detail/" + route.params["id"],
  {
    method: "get"
  }
);

const title = computed(() => {
  if (category.value) {
    return `「${category.value.name}」 共(${state.total})篇`;
  }
  return "";
});

const articles = ref<ArticleItem[]>([]);

const { data: initialData } = await useFetch<GetArticlePaginatedResponse>("/api/article", {
  method: "get",
  params: {
    page: state.page,
    per_page: state.per_page,
    category: category.value?.id
  }
});

if (initialData.value) {
  articles.value = initialData.value.data;
  state.page = initialData.value.page;
  state.total = initialData.value.total;
}

const loadArticles = async () => {
  try {
    state.loading = true;

    const response = await getPaginatedArticles({
      page: state.page + 1,
      per_page: state.per_page,
      category: category.value?.id
    });

    articles.value = articles.value.concat(response.data);
    state.page = response.page;
    state.total = response.total;
  } catch (error) {
    $message.error("加载数据失败");
    console.error(error);
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
</script>
<template>
  <main>
    <BannerImage :title="title" />

    <div class="container mx-auto">
      <div class="content">
        <ArticleList :data="articles" />
        <ArticleListDivider ref="dividerRef" :loading="state.loading" text="我也是有底线的" />
      </div>

      <div class="aside">
        <AuthorCard class="mb-4" />
        <NoticeCard class="mb-4" />
        <TagCard class="mb-4" />
        <LifeCountdownCard class="mb-4" />
        <HitokotoCard />
      </div>
    </div>
    <PageFooter class="mt-4" />
  </main>
</template>
