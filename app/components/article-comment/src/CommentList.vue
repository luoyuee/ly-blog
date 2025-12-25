<script setup lang="ts">
import type { ArticleComment } from "#shared/types/article";
import type { GetArticleCommentListResponse } from "@/apis/article/models";
import { deleteArticleComment, getArticleCommentList } from "@/apis/article/comment";
import CommentListItem from "./CommentListItem.vue";
import CommentEditor from "./CommentEditor.vue";
import { useMessage } from "@/composables/useMessage";

const $message = useMessage();

const props = defineProps({
  articleId: {
    type: Number,
    required: true
  }
});

const state = reactive<{
  width: string;
  page: number;
  per_page: number;
  total: number;
  loading: boolean;
  more: boolean;
}>({
  width: "auto",
  page: 1,
  per_page: 10,
  total: 0,
  loading: false,
  more: true
});

const comments = ref<ArticleComment[]>([]);

await useFetch<GetArticleCommentListResponse>("/api/article/comment", {
  method: "get",
  params: {
    article_id: props.articleId,
    page: state.page,
    per_page: state.per_page
  }
}).then((response) => {
  if (response.data.value) {
    const data = response.data.value;
    comments.value = data.data;
    state.page = data.page;
    state.total = data.total;
    state.more = state.page * state.per_page < state.total;
  }
});

const loadData = async () => {
  try {
    state.loading = true;

    const response = await getArticleCommentList({
      article_id: props.articleId,
      page: state.page,
      per_page: state.per_page
    });

    comments.value = response.data;
    state.page = response.page;
    state.total = response.total;
  } catch (error) {
    console.error(error);
    $message.error("加载数据失败");
  }
};

const handleReload = () => {
  state.page = 1;
  loadData();
};

const reply = reactive<{
  id?: number;
  nickname?: string;
}>({});
const showEditor = (parent: number, e: ArticleComment) => {
  reply.id = parent;
  reply.nickname = e.nickname;
};

const handleSubmitted = () => {
  handleRemoveEditor();
  loadData();
};

const handleRemoveEditor = () => {
  reply.id = undefined;
  reply.nickname = undefined;
};

const titleRef = useTemplateRef("titleRef");
const handleChangePage = () => {
  if (titleRef.value) {
    window.scrollTo({
      top: titleRef.value.offsetTop,
      behavior: "smooth"
    });
  }
  loadData();
};

const handleDelete = async (id: number) => {
  try {
    await deleteArticleComment(id);
    $message.success("删除成功");
    loadData();
  } catch (error) {
    console.error(error);
    $message.error("删除失败");
  }
};
</script>
<template>
  <div class="article-comment">
    <div ref="titleRef" class="title">—— 评论区 ——</div>

    <CommentEditor
      :article-id="props.articleId"
      :show-cancel-btn="false"
      @submitted="handleReload"
    />

    <ul class="comment-list">
      <li v-for="item in comments" :key="item.id" class="comment-list-item">
        <CommentListItem
          :data="item"
          @reply="showEditor(item.id, item)"
          @delete="handleDelete(item.id)"
        />

        <Transition name="comment-editor">
          <CommentEditor
            v-if="item.id === reply.id"
            class="mt-4"
            :article-id="props.articleId"
            :parent="item.id"
            :reply="reply.id"
            :reply-nickname="reply.nickname"
            @cancel="handleRemoveEditor"
            @submitted="handleSubmitted"
          />
        </Transition>

        <ul v-if="item.children" class="comment-sub-list">
          <li v-for="subItem in item.children" :key="subItem.id" class="comment-sub-list-item">
            <CommentListItem
              :data="subItem"
              direction="right"
              @reply="showEditor(subItem.id, subItem)"
              @delete="handleDelete(subItem.id)"
            />

            <Transition name="comment-editor">
              <CommentEditor
                v-if="subItem.id === reply.id"
                class="mt-4"
                :article-id="props.articleId"
                :parent="item.id"
                :reply="reply.id"
                :reply-nickname="reply.nickname"
                @cancel="handleRemoveEditor"
                @submitted="handleSubmitted"
              />
            </Transition>
          </li>
        </ul>
      </li>
    </ul>
    <div class="mt-4 flex justify-end">
      <UPagination
        v-model:page="state.page"
        :total="state.total"
        :page-size="state.per_page"
        @update:page="handleChangePage"
      />
    </div>
  </div>
</template>
<style scoped lang="scss">
.article-comment {
  .comment-editor-enter-active,
  .comment-editor-leave-active {
    transition:
      opacity 0.35s ease,
      transform 0.35s ease;
  }

  .comment-editor-enter-from,
  .comment-editor-leave-to {
    opacity: 0;
    transform: scale(0);
  }
  .title {
    margin-bottom: 16px;
    padding: 15px;
    font-weight: 500;
    text-align: center;
    font-size: 24px;
    border-radius: var(--radius-wrap);
    text-shadow: var(--text-shadow);
    color: var(--text-color-tertiary);
  }

  .comment-list {
    list-style: none;

    .comment-list-item {
      background-color: var(--box-bg-color);
      padding: 20px;
      box-shadow: var(--box-shadow);
      border-radius: var(--radius-wrap);
      margin-top: 16px;
      transition: all 0.35s;
    }

    .comment-sub-list {
      list-style: none;
      .comment-sub-list-item {
        margin-top: 16px;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .article-comment {
    .comment-list {
      .comment-list-item {
        padding: 16px;
      }
    }
  }
}
</style>
