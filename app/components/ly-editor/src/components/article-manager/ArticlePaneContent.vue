<script setup lang="ts">
import type { ArticleItem } from "#shared/types/article";
import type { TableColumn, SelectItem } from "@nuxt/ui";
import {
  getArticleCategoryOptions,
  getAdminPaginatedArticles,
  deleteArticle
} from "@/apis/article";
import { h, resolveComponent } from "vue";
import numeral from "numeral";
import dayjs from "dayjs";
import { openEditorNoteFile } from "../../utils";

const $notify = useNotification();
const $msgBox = useMessageBox();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const categoryOptions = ref<SelectItem[]>([{ label: "全部", value: -1 }]);
const categoryMap = ref<Record<number, ArticleCategoryOption>>({});

const loadCategoryOptions = async () => {
  try {
    const res = await getArticleCategoryOptions();
    categoryOptions.value = [
      { label: "全部", value: -1 },
      ...res.map((item) => ({
        label: item.name,
        value: item.id
      }))
    ];
    categoryMap.value = res.reduce(
      (map: Record<number, ArticleCategoryOption>, item: ArticleCategoryOption) => {
        map[item.id] = item;
        return map;
      },
      {}
    );
  } catch (error) {
    console.error(error);
  }
};

const data = ref<ArticleItem[]>([]);

const state = reactive<{
  page: number;
  per_page: number;
  category_id?: number;
  total: number;
  keyword?: string;
  highlightKeyword?: string;
  type?: number;
  loading: boolean;
}>({
  page: 1,
  per_page: 50,
  category_id: -1,
  total: 0,
  keyword: undefined,
  highlightKeyword: undefined,
  loading: false
});

const columns: TableColumn<ArticleItem>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => `#${row.getValue("id")}`
  },
  {
    accessorKey: "title",
    header: "标题",
    cell: ({ row }) => {
      const title = (row.getValue("title") ?? "") as string;
      const highlightKeyword = unref(state.highlightKeyword);

      if (highlightKeyword) {
        const index = title.indexOf(highlightKeyword);

        return h("div", [
          h("span", title.slice(0, index)),
          h("span", { class: "text-red-400" }, highlightKeyword),
          h("span", title.slice(index + highlightKeyword.length))
        ]);
      } else {
        return h("div", title);
      }
    }
  },
  {
    accessorKey: "author",
    header: "作者",
    cell: ({ row }) => h("div", { class: "w-20" }, row.getValue("author"))
  },
  {
    accessorKey: "category_id",
    header: "分类",
    minSize: 200,
    size: 200,
    maxSize: 200,
    cell: ({ row }) => {
      const type = row.getValue<number | null>("category_id");

      return h(
        "div",
        { class: "w-20" },
        type ? (categoryMap.value[type] ? categoryMap.value[type].name : "") : ""
      );
    }
  },
  {
    accessorKey: "chars",
    header: "字数",
    cell: ({ row }) => h("div", { class: "w-20" }, row.getValue("chars"))
  },
  {
    accessorKey: "updated_at",
    header: "更新日期",
    cell: ({ row }) =>
      h(
        "div",
        { class: "w-34" },
        dayjs(row.original.updated_at ?? row.original.created_at).format("YYYY/MM/DD HH:mm:ss")
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
                label: "打开关联笔记",
                icon: "ep:edit",
                onSelect: () => {
                  openEditorNoteFile(row.original.note_id);
                }
              },
              {
                label: "文章详情",
                icon: "ep:edit",
                onSelect: () => {}
              },
              {
                label: "删除文章",
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

const loadData = async () => {
  try {
    state.loading = true;

    let keyword = undefined;

    if (state.keyword && state.keyword.trim() !== "") {
      keyword = state.keyword.trim();
    }

    const res = await getAdminPaginatedArticles({
      page: state.page,
      per_page: state.per_page,
      category_id: state.category_id === -1 ? undefined : state.category_id,
      keyword
    });

    state.total = res.total;
    data.value = res.data;
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  loadCategoryOptions();
  loadData();
});

const hitokotoImportModalRef = useTemplateRef("hitokotoImportModalRef");

const handleImportData = () => {
  hitokotoImportModalRef.value?.open();
};

const hitokotoFormModalRef = useTemplateRef("hitokotoFormModalRef");

const handleOpenHitokotoFormModal = (e?: HitokotoItem) => {
  hitokotoFormModalRef.value?.open(e);
};

const handleSearch = () => {
  state.page = 1;
  loadData();
};

const handleDelete = (e: ArticleItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除「${e.title}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteArticle(e.id);
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
      <div class="flex gap-4">
        <UButton icon="ep:plus" @click="handleOpenHitokotoFormModal()"> 新增笔记 </UButton>
        <UButton icon="ep:upload" @click="handleImportData"> 导入笔记 </UButton>
      </div>

      <UFieldGroup>
        <USelect v-model="state.category_id" :items="categoryOptions" class="w-32" />

        <UInput v-model.trim="state.keyword" class="w-64" placeholder="请输入关键词" />

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
