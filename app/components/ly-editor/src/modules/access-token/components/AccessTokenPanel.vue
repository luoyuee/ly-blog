<script setup lang="ts">
import type { AccessTokenItem } from "#shared/types/access-token";
import type { TableColumn } from "@nuxt/ui";
import { TabPanelTable } from "@ly-editor/src/components";
import { disableAccessToken, getPaginatedAccessTokens } from "@/apis/access-token";
import { useLyEditorModal } from "@/composables/useLyEditorModal";
import { h, resolveComponent } from "vue";
import dayjs from "dayjs";

const $notify = useNotification();
const $msgBox = useMessageBox();

const { openModal } = useLyEditorModal();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const data = ref<AccessTokenItem[]>([]);

const state = reactive<{
  page: number;
  per_page: number;
  total: number;
  loading: boolean;
}>({
  page: 1,
  per_page: 20,
  total: 0,
  loading: false
});

/**
 * 获取权限范围展示文本。
 */
const getScopeLabel = (scope: string) => {
  return scope;
};

/**
 * 获取状态展示信息。
 */
const getStatusMeta = (status: number) => {
  switch (status) {
    case 1:
      return {
        label: "启用",
        className: "text-emerald-400"
      };
    case 0:
      return {
        label: "禁用",
        className: "text-amber-400"
      };
    default:
      return {
        label: "未知",
        className: "text-red-400"
      };
  }
};

const columns: TableColumn<AccessTokenItem>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => `#${row.getValue("id")}`
  },
  {
    accessorKey: "name",
    header: "名称",
    cell: ({ row }) => h("div", { class: "max-w-52 truncate" }, row.getValue("name"))
  },
  {
    accessorKey: "scopes",
    header: "权限范围",
    cell: ({ row }) => {
      const scopes = row.original.scopes;

      if (!scopes.length) {
        return h("div", "-");
      }

      return h(
        "div",
        { class: "flex max-w-80 flex-wrap gap-1" },
        ...scopes.map((scope) =>
          h(
            "span",
            {
              class: "rounded bg-white/8 px-1.5 py-0.5 text-xs text-gray-300"
            },
            getScopeLabel(scope)
          )
        )
      );
    }
  },
  {
    accessorKey: "expires_at",
    header: "过期时间",
    cell: ({ row }) => {
      if (!row.original.expires_at) {
        return h("div", "永不过期");
      }

      return h(
        "div",
        { class: "w-36" },
        dayjs(row.original.expires_at).format("YYYY/MM/DD HH:mm:ss")
      );
    }
  },
  {
    accessorKey: "last_used_at",
    header: "最近使用",
    cell: ({ row }) => {
      if (!row.original.last_used_at) {
        return h("div", "-");
      }

      return h(
        "div",
        { class: "w-36" },
        dayjs(row.original.last_used_at).format("YYYY/MM/DD HH:mm:ss")
      );
    }
  },
  {
    accessorKey: "last_used_ip",
    header: "最近 IP",
    cell: ({ row }) => h("div", row.original.last_used_ip || "-")
  },
  {
    accessorKey: "use_count",
    header: "调用次数",
    cell: ({ row }) => h("div", row.original.use_count)
  },
  {
    accessorKey: "created_at",
    header: "创建时间",
    cell: ({ row }) =>
      h("div", { class: "w-36" }, dayjs(row.original.created_at).format("YYYY/MM/DD HH:mm:ss"))
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const meta = getStatusMeta(row.original.status);

      return h(
        "span",
        {
          class: meta.className
        },
        meta.label
      );
    }
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
                label: "编辑",
                icon: "ep:edit",
                onSelect: () => {
                  handleOpenFormModal(row.original);
                }
              },
              {
                label: "禁用",
                icon: "ep:remove-filled",
                color: "error",
                onSelect: () => {
                  handleDisable(row.original);
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

/**
 * 加载 Access Token 列表。
 */
const loadData = async () => {
  try {
    state.loading = true;

    const res = await getPaginatedAccessTokens({
      page: state.page,
      per_page: state.per_page
    });

    state.total = res.total;
    data.value = res.data;
  } catch (error) {
    $notify.error({
      title: "加载失败",
      error
    });
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  loadData();
});

/**
 * 打开创建/编辑弹窗。
 */
const handleOpenFormModal = async (record?: AccessTokenItem) => {
  const result = await openModal("access-token-form", {
    mode: record ? "update" : "create",
    record
  });

  if (result.action === "submitted") {
    await loadData();

    if (result.data) {
      await openModal("access-token-created", {
        record: result.data
      });
    }
  }
};

/**
 * 快速禁用 Token。
 */
const handleDisable = (record: AccessTokenItem) => {
  $msgBox.error({
    title: "确认禁用?",
    message: `即将禁用「${record.name}」，禁用后当前后端列表将不再展示该 Token，是否继续？`,
    confirmButtonText: "禁用",
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await disableAccessToken(record.id);
        $notify.success({
          title: "禁用成功"
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
  <TabPanelTable
    v-model:page="state.page"
    v-model:page-size="state.per_page"
    :loading="state.loading"
    :data="data"
    :columns="columns"
    :total="state.total"
    @refresh="loadData"
  >
    <template #header-left>
      <div class="flex items-center gap-2">
        <UButton icon="ep:plus" @click="handleOpenFormModal()">新建令牌</UButton>
        <UButton icon="ep:refresh" color="neutral" variant="soft" @click="loadData">刷新</UButton>
      </div>
    </template>
  </TabPanelTable>
</template>
