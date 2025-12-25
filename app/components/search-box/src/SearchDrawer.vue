<script setup lang="ts">
import type { ArticleItem } from "#shared/types/article";
import { TagColors } from "#shared/constants";
import { getColorForTag } from "@/utils/color";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(["update:visible"]);

const { data: tags } = await useFetch("/api/article/tags", {
  method: "get"
});

const { data: rank } = await useFetch<ArticleItem[]>("/api/article/hot", {
  method: "get",
  query: { q: 9 }
});

const hide = () => {
  emits("update:visible", false);
};

const formatNumber = (num: number): string => {
  if (num < 1000) {
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  } else if (num < 10000) {
    return (num % 1000 === 0 ? num / 1000 : (num / 1000).toFixed(2)) + "k";
  } else {
    return (num % 10000 === 0 ? num / 10000 : (num / 10000).toFixed(2)) + "w";
  }
};
</script>
<template>
  <div class="search-box" :class="{ 'search-box--active': props.visible }">
    <div class="search-box__search">
      <div class="search-box__title">
        <UIcon name="custom-color:record-outline" :size="18" />
        关键词搜索
      </div>
      <form class="search-box__keyword-search" action="/search" method="get">
        <input type="text" name="kw" placeholder="请输入关键字…" />
        <button type="submit">搜索</button>
      </form>

      <div class="search-box__title">
        <UIcon name="custom-color:label-outline" :size="18" />
        标签搜索
      </div>
      <div class="search-box__tag-search">
        <a
          v-for="(item, index) in tags"
          :key="index"
          :href="'/tag/' + item"
          :style="{ backgroundColor: getColorForTag(item, TagColors) }"
        >
          {{ item }}
        </a>
      </div>
    </div>

    <div class="search-box__ranking">
      <div class="search-box__title">
        <UIcon name="custom-color:hot-outline" :size="18" />
        热门文章
      </div>
      <ul v-if="rank">
        <li v-for="(item, index) in rank" :key="item.id">
          <a :href="'/article/' + item.id">
            <span class="sort">{{ index + 1 }}</span>
            <span class="title">{{ item.title }}</span>
            <span class="views">{{ formatNumber(item.views_count) }} 阅读</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
  <div
    class="search-overlay"
    :class="{ 'search-overlay--active': props.visible }"
    @click="hide"
  ></div>
</template>
<style scoped lang="scss">
.search-box {
  transform: translateY(-100%);
  transition: all 0.35s;
  background-color: rgba(255, 255, 255, 0.85);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 901;
  width: 100%;
  border-top: var(--header-height) solid rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 32px;
  padding: 16px 32px;

  &--active {
    transform: translateY(0);
  }

  &__title {
    padding: 1rem 0;
    font-size: 1rem;
    display: flex;
    align-items: center;

    .iconify {
      margin-right: 0.5rem;
    }
  }

  &__search {
    flex: 1;
    flex-shrink: 0;
  }

  &__keyword-search {
    display: flex;
    align-items: center;

    input[type="text"] {
      flex: 1;
      height: 36px;
      padding: 0 18px;
      border: 1px solid #e4e7ed;
      border-right: none;
      border-radius: 20px 0 0 20px;
      color: #606266;
      outline: none;
      font-size: 0.875rem;
      background: rgba(255, 255, 255, 0.85);
      border-color: #bfc1c5;

      &:focus {
        border-color: #808388;
      }
    }

    button[type="submit"] {
      cursor: pointer;
      white-space: nowrap;
      padding: 0 15px;
      height: 36px;
      border: none;
      background: var(--theme-color);
      color: #fff;
      border-radius: 0px 20px 20px 0px;
      letter-spacing: 0.1em;

      &:hover {
        color: #fff;
        background-color: #449d44;
        border-color: #398439;
      }
    }
  }

  &__tag-search {
    a {
      color: #fff;
      padding: 3px 5px;
      font-size: 13px;
      border-radius: 3px;
      display: inline-block;
      margin-right: 4px;
      margin-bottom: 4px;
      transition: all 0.5s;
      text-decoration: none;

      &:hover {
        background-color: #000 !important;
      }
    }
  }

  &__ranking {
    flex: 1;
    flex-shrink: 0;

    ul {
      list-style: none;

      li {
        font-size: 1rem;
        border-bottom: 1px solid #fff;

        a {
          text-decoration: none;
          color: #606266;
          display: flex;
          align-items: center;
          padding: 8px;

          .sort {
            display: inline-block;
            color: #fff;
            background: #7f7f8c;
            width: 18px;
            height: 18px;
            line-height: 18px;
            border-radius: 2px;
            text-align: center;
            margin-right: 8px;
            font-weight: 500;
          }

          .title {
            flex: 1;
          }

          .views {
            font-size: 0.75rem;
          }
        }

        &:hover {
          background-color: rgba(255, 255, 255, 0.9);
          a {
            color: var(--theme-color);
          }
        }

        &:nth-child(1) .sort {
          background: #fe2d46;
        }
        &:nth-child(2) .sort {
          background: #f60;
        }
        &:nth-child(3) .sort {
          background: #faa90e;
        }
        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
}

.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 900;
  background-color: rgba(0, 0, 0, 0.7);
  visibility: hidden;
  opacity: 0;
  transition:
    visibility 0.35s,
    opacity 0.35s;

  &--active {
    visibility: visible;
    opacity: 1;
  }
}

@media screen and (max-width: 1024px) {
  .search-box {
    &__ranking {
      display: none;
    }
  }
}

@media screen and (max-width: 768px) {
  .search-box {
    padding: 16px;
  }
}
</style>
