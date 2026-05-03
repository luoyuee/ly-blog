<script setup lang="ts">
import type { SearchEngineItem, SearchHistoryItem } from "#shared/types/navigation-website";
import type { TableColumn } from "@nuxt/ui";
import {
  deleteSearchHistory,
  getPaginatedSearchHistories,
  getSearchEngineList
} from "@/apis/navigation-website";
import { h, resolveComponent } from "vue";
import numeral from "numeral";
import dayjs from "dayjs";

const $notify = useNotification();
const $msgBox = useMessageBox();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const data = ref<SearchHistoryItem[]>([]);
const searchEngines = ref<SearchEngineItem[]>([]);

const state = reactive<{
  page: number;
  per_page: number;
  total: number;
  keyword?: string;
  highlightKeyword?: string;
  search_engine_id: number;
  loading: boolean;
}>({
  page: 1,
  per_page: 50,
  total: 0,
  keyword: undefined,
  highlightKeyword: undefined,
  search_engine_id: -1,
  loading: false
});

const searchEngineOptions = computed(() => [
  { label: "全部", value: -1 },
  ...searchEngines.value.map((item) => ({
    label: item.name,
    value: item.id
  }))
]);

const columns: TableColumn<SearchHistoryItem>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => `#${row.getValue("id")}`
  },
  {
    accessorKey: "keyword",
    header: "关键词",
    cell: ({ row }) => {
      const keyword = (row.getValue("keyword") ?? "") as string;
      const highlightKeyword = unref(state.highlightKeyword);
      if (highlightKeyword) {
        const index = keyword.indexOf(highlightKeyword);
        if (index >= 0) {
          return h("div", [
            h("span", keyword.slice(0, index)),
            h("span", { class: "text-red-400" }, highlightKeyword),
            h("span", keyword.slice(index + highlightKeyword.length))
          ]);
        }
      }
      return h("div", keyword);
    }
  },
  {
    accessorKey: "NavigationSearchEngine",
    header: "搜索引擎",
    cell: ({ row }) => {
      const searchEngine = row.original.NavigationSearchEngine;
      if (!searchEngine) return h("div", "-");

      return h("div", { class: "flex items-center gap-2" }, [
        h(resolveComponent("UIcon"), { name: searchEngine.icon, size: 20, class: "shrink-0" }),
        h("span", { class: "truncate max-w-40" }, searchEngine.name)
      ]);
    }
  },
  {
    accessorKey: "ip",
    header: "IP",
    cell: ({ row }) => h("div", row.getValue("ip") ?? "-")
  },
  {
    accessorKey: "created_by",
    header: "用户ID",
    cell: ({ row }) => h("div", row.getValue("created_by") ?? "-")
  },
  {
    accessorKey: "created_at",
    header: "搜索日期",
    cell: ({ row }) =>
      h(
        "div",
        { class: "w-34" },
        row.original.created_at ? dayjs(row.original.created_at).format("YYYY/MM/DD HH:mm:ss") : "-"
      )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: {
              align: "end"
            },
            items: [
              {
                label: "删除记录",
                icon: "ep:delete",
                color: "error",
                onSelect: () => {
                  handleDelete(row.original);
                }
              }
            ]
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto"
            })
        )
      );
    }
  }
];

const loadSearchEngines = async () => {
  try {
    const res = await getSearchEngineList();
    searchEngines.value = res.data;
  } catch (error) {
    $notify.error({
      title: "搜索引擎加载失败",
      error
    });
  }
};

const loadData = async () => {
  try {
    state.loading = true;

    let keyword = undefined;
    if (state.keyword && state.keyword.trim() !== "") {
      keyword = state.keyword.trim();
    }

    const res = await getPaginatedSearchHistories({
      page: state.page,
      per_page: state.per_page,
      keyword,
      search_engine_id: state.search_engine_id === -1 ? undefined : state.search_engine_id
    });

    state.highlightKeyword = keyword;
    state.total = res.total;
    data.value = res.data;
  } catch (error) {
    $notify.error({
      title: "搜索历史加载失败",
      error
    });
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  loadSearchEngines();
  loadData();
});

const handleSearch = () => {
  state.page = 1;
  loadData();
};

const handleDelete = (e: SearchHistoryItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除搜索记录「${e.keyword}」，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteSearchHistory(e.id);
        $notify.success({
          title: "删除成功"
        });
        loadData();
      } catch (error) {
        $notify.error({
          title: "操作失败",
          error
        });
      }
    }
  });
};
</script>

<template>
  <div class="p-4 h-full overflow-hidden flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-4"></div>

      <UFieldGroup>
        <USelect v-model="state.search_engine_id" :items="searchEngineOptions" class="w-32" />

        <UInput v-model.trim="state.keyword" class="w-48" placeholder="请输入关键词" />

        <UButton icon="ep:search" @click="handleSearch">搜索</UButton>
      </UFieldGroup>
    </div>

    <div class="border border-muted flex-1 overflow-hidden rounded-md">
      <UTable
        sticky
        class="flex-1 max-h-full"
        :loading="state.loading"
        :data="data"
        :columns="columns"
        :ui="{
          th: 'bg-white/8',
          tr: 'hover:bg-white/5',
          td: 'whitespace-normal'
        }"
      />
    </div>

    <div class="pt-4 flex justify-between items-center gap-4">
      <div class="text-sm">
        {{ `共「${numeral(state.total).format("0,0")}」条数据` }}
      </div>
      <div class="flex gap-4 items-center">
        <USelect
          v-model="state.per_page"
          :items="[
            { label: '50/页', value: 50 },
            { label: '100/页', value: 100 },
            { label: '200/页', value: 200 }
          ]"
          class="w-24"
          @change="loadData"
        />
        <UPagination
          v-model:page="state.page"
          :items-per-page="state.per_page"
          :total="state.total"
          @update:page="loadData"
        />
      </div>
    </div>
  </div>
</template>
