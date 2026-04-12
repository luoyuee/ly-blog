<script setup lang="ts">
import type { NavigationWebsiteItem } from "#shared/types/navigation-website";
import type { TableColumn } from "@nuxt/ui";
import { getPaginatedNavigationWebsites, deleteNavigationWebsite } from "@/apis/navigation-website";
import { lyEditorEmitter } from "~/events";
import { h, resolveComponent } from "vue";

import numeral from "numeral";
import dayjs from "dayjs";

const $notify = useNotification();
const $msgBox = useMessageBox();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const data = ref<NavigationWebsiteItem[]>([]);

const state = reactive<{
  page: number;
  per_page: number;
  total: number;
  keyword?: string;
  highlightKeyword?: string;
  status: number;
  loading: boolean;
}>({
  page: 1,
  per_page: 50,
  total: 0,
  keyword: undefined,
  highlightKeyword: undefined,
  status: -1,
  loading: false
});

/** 状态筛选选项 */
const statusOptions = [
  { label: "全部", value: -1 },
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 }
];

/** 表格列定义 */
const columns: TableColumn<NavigationWebsiteItem>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => `#${row.getValue("id")}`
  },
  {
    accessorKey: "name",
    header: "名称",
    cell: ({ row }) => {
      const name = (row.getValue("name") ?? "") as string;
      const highlightKeyword = unref(state.highlightKeyword);
      if (highlightKeyword) {
        const index = name.indexOf(highlightKeyword);
        if (index >= 0) {
          return h("div", [
            h("span", name.slice(0, index)),
            h("span", { class: "text-red-400" }, highlightKeyword),
            h("span", name.slice(index + highlightKeyword.length))
          ]);
        }
      }
      return h("div", name);
    }
  },
  {
    accessorKey: "url",
    header: "地址",
    cell: ({ row }) => {
      const url = (row.getValue("url") ?? "") as string;
      return h(
        "a",
        {
          href: url,
          target: "_blank",
          class: "text-blue-400 hover:text-blue-300 truncate block max-w-64"
        },
        url
      );
    }
  },
  {
    accessorKey: "icon",
    header: "图标",
    cell: ({ row }) => {
      const icon = row.original.icon;

      if (!icon) return h("div", "-");

      return h("img", { src: icon, class: "size-5 object-contain" });
    }
  },
  {
    accessorKey: "tags",
    header: "标签",
    cell: ({ row }) => {
      const tags = row.original.tags as string[] | null | undefined;
      if (!tags || tags.length === 0) return h("div", "-");
      return h(
        "div",
        { class: "flex gap-1 flex-wrap" },
        ...tags.map((tag) =>
          h("span", { class: "px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-300" }, tag)
        )
      );
    }
  },
  {
    accessorKey: "description",
    header: "描述",
    cell: ({ row }) => h("div", { class: "max-w-48 truncate" }, row.getValue("description") ?? "-")
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.getValue<number>("status");
      return h(
        "span",
        {
          class: status === 1 ? "text-green-400" : "text-red-400"
        },
        status === 1 ? "启用" : "禁用"
      );
    }
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
                label: "编辑网站",
                icon: "ep:edit",
                onSelect: () => {
                  handleOpenFormModal(row.original);
                }
              },
              {
                label: "删除网站",
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

/** 加载分页数据 */
const loadData = async () => {
  try {
    state.loading = true;

    let keyword = undefined;
    if (state.keyword && state.keyword.trim() !== "") {
      keyword = state.keyword.trim();
    }

    const res = await getPaginatedNavigationWebsites({
      page: state.page,
      per_page: state.per_page,
      keyword,
      status: state.status === -1 ? undefined : state.status
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
  loadData();
});

/** 打开表单弹窗 */
const handleOpenFormModal = (e?: NavigationWebsiteItem) => {
  lyEditorEmitter.emit("cmd.modal-manager:open:navigation-website-form", e);
};

/** 搜索 */
const handleSearch = () => {
  state.page = 1;
  loadData();
};

lyEditorEmitter.on("notify.navigation-website-form:submitted", loadData);

/** 删除 */
const handleDelete = (e: NavigationWebsiteItem) => {
  $msgBox.error({
    title: "确认删除?",
    message: `即将删除「${e.name}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteNavigationWebsite(e.id);
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
        <UButton icon="ep:plus" @click="handleOpenFormModal()"> 新增 </UButton>
      </div>

      <UFieldGroup>
        <USelect v-model="state.status" :items="statusOptions" class="w-24" />

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
