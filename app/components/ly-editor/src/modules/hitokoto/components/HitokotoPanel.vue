<script setup lang="ts">
import type { HitokotoItem, HitokotoTypeItem } from "#shared/types/hitokoto";
import type { TableColumn, SelectItem } from "@nuxt/ui";
import { useLyEditorModal } from "@/composables/useLyEditorModal";
import { Pagination } from "@/components/pagination";
import { downloadFile } from "@/utils/file";
import { h, resolveComponent } from "vue";
import { useI18n } from "vue-i18n";
import {
  getHitokotoTypeOptions,
  getPaginatedHitokotos,
  deleteHitokoto,
  exportHitokotoData
} from "@/apis/hitokoto";
import dayjs from "dayjs";

const $notify = useNotification();
const $msgBox = useMessageBox();
const { t } = useI18n();

const { openModal } = useLyEditorModal();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const typeOptions = ref<SelectItem[]>([{ label: "全部", value: -1 }]);
const typeMap = ref<Record<number, HitokotoTypeItem>>({});

const loadTypeOptions = async () => {
  try {
    const res = await getHitokotoTypeOptions();
    typeOptions.value = [
      { label: "全部", value: -1 },
      ...res.map((item) => ({
        label: item.name,
        value: item.id
      }))
    ];
    typeMap.value = res.reduce((map: Record<number, HitokotoTypeItem>, item: HitokotoTypeItem) => {
      map[item.id] = item;
      return map;
    }, {});
  } catch (error) {
    console.error(error);
  }
};

const data = ref<HitokotoItem[]>([]);
const exporting = ref(false);

const state = reactive<{
  page: number;
  per_page: number;
  total: number;
  keyword?: string;
  highlightKeyword?: string;
  type?: number;
  loading: boolean;
}>({
  page: 1,
  per_page: 50,
  total: 0,
  keyword: undefined,
  highlightKeyword: undefined,
  type: -1,
  loading: false
});

const columns: TableColumn<HitokotoItem>[] = [
  {
    accessorKey: "id",
    header: "#",
    meta: {
      class: { td: "min-w-12" }
    },
    cell: ({ row }) => `#${row.getValue("id")}`
  },
  {
    accessorKey: "content",
    header: "内容",
    cell: ({ row }) => {
      const content = (row.getValue("content") ?? "") as string;
      const highlightKeyword = unref(state.highlightKeyword);
      if (highlightKeyword) {
        const index = content.indexOf(highlightKeyword);

        return h("div", [
          h("span", content.slice(0, index)),
          h("span", { class: "text-red-400" }, highlightKeyword),
          h("span", content.slice(index + highlightKeyword.length))
        ]);
      } else {
        return h("div", content);
      }
    }
  },
  {
    accessorKey: "source",
    header: "来源",
    meta: {
      class: { td: "min-w-24" }
    }
  },
  {
    accessorKey: "author",
    header: "作者",
    meta: {
      class: { td: "min-w-24" }
    }
  },
  {
    accessorKey: "type",
    header: "类型",
    meta: {
      class: { td: "min-w-24" }
    },
    cell: ({ row }) => {
      const type = row.getValue<number | null>("type");

      return h(
        "div",
        { class: "w-20" },
        type ? (typeMap.value[type] ? typeMap.value[type].name : "") : ""
      );
    }
  },
  {
    accessorKey: "length",
    header: "长度",
    meta: {
      class: { td: "min-w-24" }
    }
  },
  {
    accessorKey: "updated_at",
    header: "更新日期",
    meta: {
      class: { td: "w-46" }
    },
    cell: ({ row }) =>
      h(
        "span",
        dayjs(row.original.updated_at ?? row.original.created_at).format(t("format.datetime"))
      )
  },
  {
    id: "actions",
    meta: {
      class: { td: "w-16" }
    },
    cell: ({ row }) =>
      h(
        UDropdownMenu,
        {
          content: {
            align: "end"
          },
          items: [
            {
              label: "编辑语句",
              icon: "ep:edit",
              onSelect: () => {
                handleOpenHitokotoFormModal("update", row.original);
              }
            },
            {
              label: "删除语句",
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
            icon: "lucide:ellipsis-vertical",
            color: "neutral",
            variant: "ghost"
          })
      )
  }
];

const loadData = async () => {
  try {
    state.loading = true;

    let keyword = undefined;

    if (state.keyword && state.keyword.trim() !== "") {
      keyword = state.keyword.trim();
    }

    const res = await getPaginatedHitokotos({
      page: state.page,
      per_page: state.per_page,
      type: state.type === -1 ? undefined : state.type,
      keyword
    });

    state.highlightKeyword = keyword;

    state.total = res.total;
    data.value = res.data;
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  loadTypeOptions();
  loadData();
});

const handleImportData = async () => {
  const result = await openModal("hitokoto-import", undefined);

  if (result.action === "imported") {
    await loadData();
  }
};

const handleExportData = async () => {
  try {
    exporting.value = true;

    const blob = await exportHitokotoData();
    const fileName = `hitokoto-${dayjs().format("YYYYMMDD-HHmmss")}.json`;
    downloadFile(blob, fileName, {
      mimeType: "application/json;charset=utf-8"
    });

    $notify.success({
      title: "导出成功"
    });
  } catch (error) {
    $notify.error({
      title: "导出失败",
      error
    });
  } finally {
    exporting.value = false;
  }
};

const handleOpenHitokotoFormModal = async (mode: "create" | "update", record?: HitokotoItem) => {
  const result = await openModal("hitokoto-form", { record, mode });

  if (result.action === "submitted") {
    await loadData();
  }
};

const handleSearch = () => {
  state.page = 1;
  loadData();
};

const handleDelete = (e: HitokotoItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除「${e.content}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: { color: "error" },
    onConfirm: async () => {
      try {
        await deleteHitokoto(e.id);
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
  <div class="p-4 h-full overflow-hidden flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <div class="flex gap-4">
        <UButton icon="ep:plus" @click="() => handleOpenHitokotoFormModal('create')">
          新增
        </UButton>
        <UButton icon="ep:upload" @click="handleImportData">导入</UButton>
        <UButton icon="ep:download" :loading="exporting" @click="handleExportData">导出</UButton>
      </div>

      <UFieldGroup>
        <USelect v-model="state.type" :items="typeOptions" class="w-24" />

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

    <Pagination
      v-model:page="state.page"
      v-model:page-size="state.per_page"
      :page-sizes="[50, 100, 200]"
      :total="state.total"
      @update:page="loadData"
      @update:page-size="loadData"
    />
  </div>
</template>
