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
import { PageFooter } from "@/components/page-footer";
import { useRoute } from "vue-router";

const route = useRoute();

const article = ref<Article | null>(null);

console.log("route.path", route.path);

const { data: response, status: responseStatus } = await useFetch<Article>("/api/article/query", {
  method: "post",
  body: {
    path: route.path,
    query: {
      pwd: typeof route.query.pwd === "string" ? route.query.pwd : undefined
    }
  }
});

console.log("response", response);

if (responseStatus.value === "error" || !response.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "文章不存在"
  });
}

article.value = response.value;

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

const breadcrumb = computed<ArticleBreadcrumbItem[]>(() => {
  const items: ArticleBreadcrumbItem[] = [];

  if (article.value?.category_id && article.value.category_name) {
    items.push({
      name: article.value.category_name,
      href: "/category/" + article.value.category_id
    });
  }

  return [
    {
      name: "首页",
      href: "/",
      icon: "colorful:home"
    },
    ...items,
    {
      name: "正文",
      href: route.path
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

          <div v-else class="article__locked">
            <p v-if="route.query.pwd && article.locked" class="article__locked-error">密码错误</p>

            <div class="article__locked-form">
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
        <div class="article__aside-sticky">
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

      &__locked {
        min-height: 12.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 12px;

        &-error {
          color: var(--color-error-500);
        }

        &-form {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }

      &__aside-sticky {
        position: sticky;
        top: calc(var(--header-height) + 16px);
      }
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

  .aside {
    .article__aside-sticky {
      position: sticky;
      top: calc(var(--header-height) + 16px);
    }
  }
}

@media (max-width: 768px) {
  .container {
    .content {
      .article {
        &__locked-form {
          width: 100%;
          flex-direction: column;
          align-items: stretch;
        }
      }
    }
  }
}
</style>
