<script setup lang="ts">
import type { Article, ArticleBreadcrumbItem } from "#shared/types/article";
import {
  ArticleCopyright,
  ArticleLike,
  ArticleTags,
  ArticleBreadcrumb,
  ArticleToc
} from "@/components/article";
import { ArticleBannerImage } from "@/components/banner-image";
import { NoticeCard, TagCard } from "@/components/mac-card";
import { CommentList } from "@/components/article-comment";
import { AuthorCard } from "@/components/user-card";
import { useRoute } from "vue-router";
import { PageFooter } from "@/components/page-footer";

const route = useRoute();

const article = ref<Article | null>(null);

const { data: response, status: responseStatus } = await useFetch<Article>(
  "/api/article/" + route.params.id,
  {
    method: "get",
    query: route.query
  }
);

// TODO: 处理错误情况
if (responseStatus.value === "error" || !response.value) {
  // navigateTo("/");
}

article.value = response.value ?? null;

const formData = reactive({
  password: ""
});

const handleUnlock = () => {
  navigateTo(route.path + "?pwd=" + formData.password, {
    open: { target: "_self" }
  });
};

const articleUrl = ref<string>("");

onMounted(() => {
  articleUrl.value = window.location.href;
});

const breadcrumb = computed(() => {
  let items: ArticleBreadcrumbItem[] = [];

  if (article.value && Array.isArray(article.value.category_levels)) {
    items = article.value.category_levels.map((item) => ({
      name: item.name,
      href: "/category/" + item.id,
      icon: item.icon
    }));
  }

  return [
    {
      name: "首页",
      href: "/",
      icon: "custom-color:home"
    },
    ...items,
    {
      name: "正文",
      href: "/article/" + route.params.id
    }
  ];
});
</script>
<template>
  <main v-if="article">
    <ArticleBannerImage :article="article" />

    <div class="container mx-auto">
      <div class="content">
        <div class="article">
          <ArticleBreadcrumb :items="breadcrumb" />

          <div v-if="!article.locked" class="p-6">
            <MDC class="markdown-body min-h-50" :value="article.content" />
          </div>

          <div v-else class="h-50 flex items-center justify-center">
            <p v-if="route.query.pwd && article.locked">密码错误</p>

            <div>
              <UFieldGroup>
                <UBadge color="neutral" variant="outline" label="访问密码" />
                <UInput v-model="formData.password" />
              </UFieldGroup>
              <UButton color="primary" @click="handleUnlock">提交</UButton>
            </div>
          </div>

          <ArticleLike
            v-if="!article.locked"
            v-model="article.like_count"
            :article-id="article.id"
            :reward="article.allow_rewards"
          />

          <ArticleTags v-if="!article.locked" :tags="article.tags" />
        </div>

        <ArticleCopyright
          class="mt-4"
          :author="article.author"
          :updated-at="article.updated_at ?? article.created_at"
          :article-url="articleUrl"
        />

        <CommentList
          v-if="article.allow_comments && !article.locked"
          class="mt-4"
          :article-id="article.id"
        />

        <div v-else class="disabled-comment">—— 评论区已禁用 ——</div>
      </div>
      <div class="aside">
        <AuthorCard class="mb-4" />
        <NoticeCard class="mb-4" />
        <div style="position: sticky; top: calc(var(--header-height) + 16px)">
          <ArticleToc :toc="article.toc" class="mb-4" />
          <TagCard :data="article.tags" />
        </div>
      </div>
    </div>

    <PageFooter class="mt-4" />
  </main>
</template>
<style scoped lang="scss">
.container {
  .content {
    .article {
      background: var(--card-bg-color);
      box-shadow: var(--card-shadow);
      padding: 16px;
    }

    .disabled-comment {
      color: var(--text-color-2);
      margin-top: 1rem;
      margin-bottom: 1rem;
      padding: 15px;
      font-weight: 500;
      text-align: center;
      font-size: 24px;
      border-radius: var(--radius-wrap);
      background: var(--bg-color);
      box-shadow: var(--box-shadow);
      text-shadow: var(--text-shadow);
    }
  }
}
</style>
