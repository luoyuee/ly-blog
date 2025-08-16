<script setup lang="ts">
import type { ViewArticleDetail } from "#shared/types";
import type { PropType } from "vue";
import dayjs from "dayjs";

const props = defineProps({
  article: {
    type: Object as PropType<ViewArticleDetail>,
    required: true,
  },
});
</script>
<template>
  <div class="home-picture">
    <div class="infomation">
      <h1 class="title animate__animated animate__fadeIn">
        {{ props.article.title }}
      </h1>
      <div class="sub-title">
        <div>
          <UIcon name="custom:color-calendar" />
          <span>
            {{
              dayjs
                .unix(props.article.content_updated_at)
                .format("YYYY年MM月DD日 HH时mm分")
            }}
          </span>
        </div>
        <div>
          <Icon name="custom:color-hot" />
          <span>{{ props.article.views_count }} 阅读</span>
        </div>
        <div>
          <Icon name="custom:color-comment" />
          <span>{{ props.article.comments_count }} 评论</span>
        </div>
        <div>
          <Icon name="custom:color-like" />
          <span>{{ props.article.likes_count }} 点赞</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.home-picture {
  background-color: var(--white);
  background: url(/api/image/random/background) center;
  background-size: cover;
  height: 50vh;
  position: relative;
  margin-top: calc(0px - var(--header-height));

  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-bottom: 0;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    pointer-events: none;
  }

  &::after {
    content: "";
    width: 100%;
    height: 60px;
    position: absolute;
    bottom: 0;
    left: 0;
    background: linear-gradient(180deg, transparent, var(--bg-color-alpha));
    pointer-events: none;
  }

  .infomation {
    position: absolute;
    line-height: 1.5;
    margin-top: 0;

    .title {
      font-size: 2.25rem;
      color: var(--white);
      text-align: center;
      text-shadow: 0 3px 5px #1c1f21;
      padding: 0 1rem;
      letter-spacing: 0.25rem;
    }

    .sub-title {
      min-height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: var(--white);
      font-size: 1.125rem;
      padding: 0 1rem;
      text-shadow: 0 3px 5px #1c1f21;
      margin-top: 20px;
      letter-spacing: 1px;
      flex-wrap: wrap;

      .iconfont {
        margin-right: 4px;
      }
      .iconfont:nth-child(n + 1) {
        margin-left: 12px;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .home-picture {
    .infomation {
      .title {
        font-size: 1.5rem;
      }
      .sub-title {
        font-size: 0.875rem;

        > div:first-child {
          width: 100%;
          margin-bottom: 4px;
        }
      }
    }
  }
}
</style>
