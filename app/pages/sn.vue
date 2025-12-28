<script setup lang="ts">
import type { GetFleetingThoughtPaginatedResponse } from "@/apis/fleeting-thought/models";
import type { FleetingThought } from "#shared/types/fleeting-thought";
import { HitokotoCard, NoticeCard, TagCard } from "@/components/mac-card";
import { getPaginatedFleetingThought } from "@/apis/fleeting-thought";
import { BannerImage } from "@/components/banner-image";
import { useConfigStore, useUserStore } from "@/stores";
import { AuthorCard } from "@/components/user-card";
import { FleetingThoughtEditor, FleetingThoughtItem } from "@/components/fleeting-thought";
import { ref } from "vue";
import { PageFooter } from "@/components/page-footer";

const $message = useMessage();

const configStore = useConfigStore();
const userStore = useUserStore();

const state = reactive<{
  page: number;
  per_page: number;
  total: number;
  loading: boolean;
  more: boolean;
}>({
  page: 1,
  per_page: 10,
  total: 0,
  loading: false,
  more: true
});

const thoughts = ref<FleetingThought[]>([]);

await useFetch("/api/thought", {
  method: "get",
  params: {
    page: state.page,
    per_page: state.per_page
  }
}).then((response) => {
  const data = response.data.value as GetFleetingThoughtPaginatedResponse;

  thoughts.value = data.data ?? [];
  state.page = data.page;
  state.total = data.total;
  state.more = state.page * state.per_page < state.total;
});

const loadData = async () => {
  try {
    state.loading = true;

    const response = await getPaginatedFleetingThought({
      page: state.page,
      per_page: state.per_page
    });

    thoughts.value = response.data;
    state.page = response.page;
    state.total = response.total;
    state.more = state.page * state.per_page < state.total;
  } catch (error) {
    console.error(error);
    $message.error("加载数据失败");
  }
};

const handleReload = () => {
  state.page = 1;
  loadData();
};

const thoughtsListRef = ref<HTMLUListElement | null>(null);
const handleChangePage = () => {
  if (thoughtsListRef.value) {
    window.scrollTo({
      top: thoughtsListRef.value.offsetTop - 240,
      behavior: "smooth"
    });
  }
  loadData();
};
</script>
<template>
  <main>
    <BannerImage title="闪念笔记" />
    <div class="container mx-auto">
      <div class="content">
        <div v-if="configStore.fleeting_thought.intro" class="intros">
          {{ configStore.fleeting_thought.intro }}
        </div>

        <FleetingThoughtEditor
          v-if="userStore.isAdmin"
          class="mt-4"
          :show-cancel-btn="false"
          @submitted="handleReload"
        />

        <ul ref="thoughtsListRef" class="thoughts-list">
          <li v-for="(item, index) in thoughts" :key="item.id" class="mt-4">
            <FleetingThoughtItem v-model="thoughts[index]!" @reload="loadData" />
          </li>
        </ul>

        <div class="mt-4 flex justify-end">
          <el-pagination
            v-model:current-page="state.page"
            background
            layout="prev, pager, next"
            :total="state.total"
            :page-size="state.per_page"
            hide-on-single-page
            @current-change="handleChangePage"
          />
        </div>
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
    .thoughts-list {
      list-style: none;
    }
  }
}
</style>
