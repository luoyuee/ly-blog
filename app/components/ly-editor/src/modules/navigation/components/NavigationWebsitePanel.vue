<script setup lang="ts">
import type { NavigationWebsiteItem } from "#shared/types/navigation-website";
import type { TableColumn } from "@nuxt/ui";
import {
  getPaginatedNavigationWebsites,
  deleteNavigationWebsite,
  exportNavigationWebsiteData
} from "@/apis/navigation-website";
import { useLyEditorModal } from "@ly-editor";
import { TabPanelTable } from "@ly-editor/src/components";
import { useLogger } from "@/composables/useLogger";
import { downloadFile } from "@/utils/file";
import { h, resolveComponent } from "vue";
import dayjs from "dayjs";

const logger = useLogger();
const { t } = useI18n();
const $notify = useNotification();
const $msgBox = useMessageBox();

const { open: openWebsiteForm } = useLyEditorModal("navigation-website-form");
const { open: openImport } = useLyEditorModal("navigation-website-import");

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const data = ref<NavigationWebsiteItem[]>([]);
const exporting = ref(false);

const state = reactive<{
  page: number;
  per_page: number;
  total: number;
  keyword?: string;
  highlightKeyword?: string;
  type: number;
  status: number;
  loading: boolean;
}>({
  page: 1,
  per_page: 50,
  total: 0,
  keyword: undefined,
  highlightKeyword: undefined,
  type: -1,
  status: -1,
  loading: false
});

const statusOptions = computed(() => [
  { label: t("common.all"), value: -1 },
  { label: t("components.lyEditor.common.status.enabled"), value: 1 },
  { label: t("components.lyEditor.common.status.disabled"), value: 2 }
]);

const getStatusMeta = (status: number) => {
  switch (status) {
    case 1:
      return {
        label: t("components.lyEditor.common.status.enabled"),
        className: "text-green-400"
      };
    case 2:
      return {
        label: t("components.lyEditor.common.status.disabled"),
        className: "text-amber-400"
      };
    default:
      return {
        label: t("components.lyEditor.common.status.unknown"),
        className: "text-red-400"
      };
  }
};

const typeOptions = computed(() => [
  { label: t("common.all"), value: -1 },
  { label: t("components.lyEditor.modules.navigation.website.typeWebsite"), value: 1 },
  { label: t("components.lyEditor.modules.navigation.website.typeBookmark"), value: 2 }
]);

const columns = computed<TableColumn<NavigationWebsiteItem>[]>(() => [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => `#${row.getValue("id")}`
  },
  {
    accessorKey: "name",
    header: t("components.lyEditor.common.table.name"),
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
    header: t("components.lyEditor.common.table.url"),
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
    header: t("components.lyEditor.common.table.icon"),
    cell: ({ row }) => {
      const icon = row.original.icon;

      if (!icon) return h("div", "-");

      return h("img", { src: icon, class: "size-5 object-contain" });
    }
  },
  {
    accessorKey: "tags",
    header: t("components.lyEditor.common.table.tags"),
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
    header: t("components.lyEditor.common.table.description"),
    cell: ({ row }) => h("div", { class: "max-w-48 truncate" }, row.getValue("description") ?? "-")
  },
  {
    accessorKey: "type",
    header: t("components.lyEditor.common.table.type"),
    cell: ({ row }) => {
      const type = row.original.type;
      return h(
        "span",
        {
          class: type === 2 ? "text-sky-400" : "text-emerald-400"
        },
        type === 2
          ? t("components.lyEditor.modules.navigation.website.typeBookmark")
          : t("components.lyEditor.modules.navigation.website.typeWebsite")
      );
    }
  },
  {
    accessorKey: "hot",
    header: t("components.lyEditor.modules.navigation.website.headers.hot"),
    cell: ({ row }) => h("div", row.getValue("hot") ?? 0)
  },
  {
    accessorKey: "is_favorite",
    header: t("components.lyEditor.modules.navigation.website.headers.favorite"),
    cell: ({ row }) => {
      const isFavorite = row.getValue<boolean>("is_favorite");
      return h(
        "span",
        {
          class: isFavorite ? "text-yellow-400" : "text-gray-400"
        },
        isFavorite
          ? t("components.lyEditor.common.status.favorite")
          : t("components.lyEditor.common.status.unfavorite")
      );
    }
  },
  {
    accessorKey: "is_public",
    header: t("components.lyEditor.modules.navigation.website.headers.public"),
    cell: ({ row }) => {
      const isPublic = row.getValue<boolean>("is_public");
      return h(
        "span",
        {
          class: isPublic ? "text-emerald-400" : "text-gray-400"
        },
        isPublic
          ? t("components.lyEditor.common.status.public")
          : t("components.lyEditor.common.status.private")
      );
    }
  },
  {
    accessorKey: "status",
    header: t("components.lyEditor.common.table.status"),
    cell: ({ row }) => {
      const status = row.getValue<number>("status");
      const meta = getStatusMeta(status);

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
                label: t("components.lyEditor.modules.navigation.website.menu.edit"),
                icon: "lucide:square-pen",
                onSelect: () => {
                  handleOpenFormModal(row.original);
                }
              },
              {
                label: t("components.lyEditor.modules.navigation.website.menu.delete"),
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
]);

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
      type: state.type === -1 ? undefined : state.type,
      status: state.status === -1 ? undefined : state.status
    });

    state.highlightKeyword = keyword;
    state.total = res.total;
    data.value = res.data;
  } catch (error) {
    logger.error(error);
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  loadData();
});

const handleOpenFormModal = async (e?: NavigationWebsiteItem) => {
  const result = await openWebsiteForm({
    mode: e ? "update" : "create",
    record: e
  });

  if (result.action === "submitted") {
    await loadData();
  }
};

const handleImportData = async () => {
  const result = await openImport(undefined);

  if (result.action === "imported") {
    await loadData();
  }
};

const handleExportData = async () => {
  try {
    exporting.value = true;

    const blob = await exportNavigationWebsiteData();
    const fileName = `navigation-website-${dayjs().format("YYYYMMDD-HHmmss")}.json`;
    downloadFile(blob, fileName, {
      mimeType: "application/json;charset=utf-8"
    });

    $notify.success({
      title: t("message.export.success")
    });
  } catch (error) {
    $notify.error({
      title: t("message.export.error"),
      error
    });
  } finally {
    exporting.value = false;
  }
};

const handleSearch = () => {
  state.page = 1;
  loadData();
};

const handleDelete = (e: NavigationWebsiteItem) => {
  $msgBox.error({
    title: t("components.lyEditor.common.deleteConfirm.title"),
    message: t("components.lyEditor.common.deleteConfirm.simpleMessage", { name: e.name }),
    confirmButtonText: t("components.lyEditor.common.deleteConfirm.button"),
    confirmButtonProps: {
      color: "error"
    },
    onConfirm: async () => {
      try {
        await deleteNavigationWebsite(e.id);
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
    <template #header-left>
      <div class="flex items-center gap-4">
        <UButton icon="lucide:plus" @click="handleOpenFormModal()">
          {{ t("components.lyEditor.modules.navigation.website.new") }}
        </UButton>
        <UButton icon="lucide:upload" @click="handleImportData">
          {{ t("components.lyEditor.common.import") }}
        </UButton>
        <UButton icon="lucide:download" :loading="exporting" @click="handleExportData">
          {{ t("components.lyEditor.common.export") }}
        </UButton>
      </div>
    </template>

    <template #header-right>
      <UFieldGroup>
        <USelect v-model="state.type" :items="typeOptions" class="w-24" />
        <USelect v-model="state.status" :items="statusOptions" class="w-24" />
        <UInput
          v-model.trim="state.keyword"
          class="w-48"
          :placeholder="t('components.lyEditor.common.searchPlaceholder')"
          @keydown.enter="handleSearch"
        />
        <UButton icon="lucide:search" @click="handleSearch">
          {{ t("common.search") }}
        </UButton>
      </UFieldGroup>
    </template>
  </TabPanelTable>
</template>
