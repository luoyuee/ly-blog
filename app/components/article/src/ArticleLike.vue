<script setup lang="ts">
import { confirmLikeArticle, cancelLikeArticle } from "@/apis/article";
import { useMessage } from "@/composables/useMessage";
import { useLocalStorage } from "@/utils/storage";
import { useConfigStore } from "@/stores";
import ArticleReward from "./ArticleReward.vue";

const configStore = useConfigStore();
const localStorage = useLocalStorage("article");

const likesCount = defineModel<number>({ default: 0 });

const props = defineProps({
  articleId: {
    type: Number,
    required: true
  },
  reward: {
    type: Boolean,
    default: false
  }
});

const showReward = computed(() => {
  return (
    props.reward &&
    configStore.article.payment_qr_code &&
    configStore.article.payment_qr_code.length > 0
  );
});

let likeList: number[] = [];
const isLiked = ref(false);
onMounted(() => {
  likeList = localStorage.get<number[]>("like") ?? [];
  isLiked.value = likeList.includes(props.articleId);
});

const handleLike = async () => {
  try {
    if (isLiked.value) {
      const response = await cancelLikeArticle(props.articleId);
      isLiked.value = false;
      likesCount.value = response.like_count;
      likeList = likeList.filter((item) => item !== props.articleId);
    } else {
      const response = await confirmLikeArticle(props.articleId);
      isLiked.value = true;
      likesCount.value = response.like_count;
      likeList.push(props.articleId);
    }

    localStorage.set("like", likeList);
  } catch (error) {
    const $message = useMessage();
    $message.error("点赞失败");
    console.error(error);
  }
};
</script>
<template>
  <div class="article-actions">
    <div class="article-actions__item">
      <div
        class="article-actions__button"
        :class="{ 'article-actions__button--active': isLiked }"
        @click="handleLike"
      >
        <UIcon :name="isLiked ? 'custom:upvote-fill' : 'custom:upvote'" :size="24" />
      </div>
      <span class="article-actions__label">{{ likesCount }} 赞</span>
    </div>

    <UPopover v-if="showReward">
      <div class="article-actions__item" label="Open">
        <div class="article-actions__button">
          <UIcon name="custom:reward" :size="28" />
        </div>
        <span class="article-actions__label">打赏</span>
      </div>

      <template #content>
        <ArticleReward />
      </template>
    </UPopover>
  </div>
</template>
<style scoped lang="scss">
.article-actions {
  display: flex;
  padding-top: 2rem;
  padding-bottom: 1.5rem;
  justify-content: center;
  align-items: center;
  column-gap: 2.5rem;
  position: relative;
}

.article-actions__item {
  color: var(--text-color-tertiary);
  text-align: center;
  cursor: default;
}

.article-actions__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  box-shadow: var(--article-circle-button-shadow);
  background: var(--bg-color-primary);
  cursor: pointer;

  &:hover {
    color: var(--theme-color);
  }
}

.article-actions__button--active {
  color: var(--theme-color);
}

.article-actions__label {
  display: block;
  font-size: 0.875rem;
  padding-top: 0.5rem;
}
</style>
