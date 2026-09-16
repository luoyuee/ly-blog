<script setup lang="ts">
import type { ArticleCategoryOption, ArticleItem } from "#shared/types/article";
import type { TableColumn, SelectItem } from "@nuxt/ui";
import { TabPanelTable } from "@ly-editor/src/components";
import { useLogger } from "@/composables/useLogger";
import {
  getArticleCategoryOptions,
  getAdminPaginatedArticles,
  deleteArticle
} from "@/apis/article";
import { h, resolveComponent } from "vue";
import dayjs from "dayjs";
import { openEditorNoteFile } from "@ly-editor/src/utils";

const { t } = useI18n();

const logger = useLogger();
const $notify = useNotification();
const $msgBox = useMessageBox();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const categoryOptions = ref<SelectItem[]>([{ label: t("common.all"), value: -1 }]);
const categoryMap = ref<Record<number, ArticleCategoryOption>>({});

const loadCategoryOptions = async () => {
  try {
    const res = await getArticleCategoryOptions();
    categoryOptions.value = [
      { label: t("common.all"), value: -1 },
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
    logger.error(error);
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
    header: t("components.lyEditor.common.table.title"),
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
    header: t("components.lyEditor.common.table.author"),
    cell: ({ row }) => h("div", { class: "w-20" }, row.getValue("author"))
  },
  {
    accessorKey: "category_id",
    header: t("components.lyEditor.common.table.category"),
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
    header: t("components.lyEditor.modules.article.headers.wordCount"),
    cell: ({ row }) => h("div", { class: "w-20" }, row.getValue("chars"))
  },
  {
    accessorKey: "updated_at",
    header: t("components.lyEditor.common.table.updatedAt"),
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
                label: t("components.lyEditor.modules.article.menu.openNote"),
                icon: "lucide:square-pen",
                onSelect: () => {
                  openEditorNoteFile(row.original.note_id);
                }
              },
              {
                label: t("components.lyEditor.modules.article.menu.details"),
                icon: "lucide:square-pen",
                onSelect: () => {}
              },
              {
                label: t("components.lyEditor.modules.article.menu.delete"),
                icon: "lucide:trash-2",
                color: "error",
                onSelect: () => {
                  handleDelete(row.original);
                }
              }
            ]
          },
          () =>
            h(UButton, {
              icon: "lucide:ellipsis-vertical",
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
    logger.error(error);
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  loadCategoryOptions();
  loadData();
});

const handleSearch = () => {
  state.page = 1;
  loadData();
};

const handleDelete = (e: ArticleItem) => {
  $msgBox.error({
    title: t("components.lyEditor.common.deleteConfirm.title"),
    message: t("components.lyEditor.common.deleteConfirm.simpleMessage", { name: e.title }),
    confirmButtonText: t("components.lyEditor.common.deleteConfirm.button"),
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteArticle(e.id);
        $notify.success({
          title: t("message.delete.success")
        });
        loadData();
      } catch (error) {
        $notify.error({
          title: t("message.operate.error"),
          error
        });
      }
    }
  });
};
</script>
<template>
  <TabPanelTable
    v-model:page="state.page"
    v-model:page-size="state.per_page"
    :loading="state.loading"
    :data="data"
    :columns="columns"
    :total="state.total"
    @refresh="loadData"
  >
    <template #header-right>
      <UFieldGroup>
        <USelect v-model="state.category_id" :items="categoryOptions" class="w-24" />
        <UInput
          v-model.trim="state.keyword"
          class="w-48"
          :placeholder="$t('components.lyEditor.common.searchPlaceholder')"
          @keydown.enter="handleSearch"
        />
        <UButton icon="lucide:search" @click="handleSearch">{{ $t("common.search") }}</UButton>
      </UFieldGroup>
    </template>
  </TabPanelTable>
</template>
