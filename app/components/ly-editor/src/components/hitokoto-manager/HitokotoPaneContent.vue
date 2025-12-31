<script setup lang="ts">
import type { HitokotoItem, HitokotoTypeItem } from "#shared/types/hitokoto";
import type { TableColumn, SelectItem } from "@nuxt/ui";
import { getHitokotoTypeOptions, getPaginatedHitokotos, deleteHitokoto } from "@/apis/hitokoto";
import { h, resolveComponent } from "vue";
import HitokotoImportModal from "./HitokotoImportModal.vue";
import numeral from "numeral";
import dayjs from "dayjs";
import HitokotoFormModal from "./HitokotoFormModal.vue";

const $notify = useNotification();
const $msgBox = useMessageBox();

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
    cell: ({ row }) => h("div", { class: "w-24" }, row.getValue("source"))
  },
  {
    accessorKey: "author",
    header: "作者",
    cell: ({ row }) => h("div", { class: "w-20" }, row.getValue("author"))
  },
  {
    accessorKey: "type",
    header: "类型",
    minSize: 200,
    size: 200,
    maxSize: 200,
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
    cell: ({ row }) => h("div", { class: "w-20" }, row.getValue("length"))
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
                label: "编辑语句",
                icon: "ep:edit",
                onSelect: () => {
                  handleOpenHitokotoFormModal(row.original);
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

const handleDelete = (e: HitokotoItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除「${e.content}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: {
      color: "error"
    },
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
  <div class="p-4 h-full overflow-hidden flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-4">
        <UButton icon="ep:plus" @click="handleOpenHitokotoFormModal()"> 新增 </UButton>
        <UButton icon="ep:upload" @click="handleImportData">导入</UButton>
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

    <HitokotoImportModal ref="hitokotoImportModalRef" @submit="loadData" />
    <HitokotoFormModal ref="hitokotoFormModalRef" @submit="loadData" />
  </div>
</template>
