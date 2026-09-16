<script setup lang="ts">
import type { HitokotoItem, HitokotoTypeItem } from "#shared/types/hitokoto";
import type { TableColumn, SelectItem } from "@nuxt/ui";
import { TabPanelTable } from "@ly-editor/src/components";
import { useLyEditorModal } from "@ly-editor";
import { useLogger } from "@/composables/useLogger";
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

const logger = useLogger();
const $notify = useNotification();
const $msgBox = useMessageBox();
const { t } = useI18n();

const { open: openHitokotoImport } = useLyEditorModal("hitokoto-import");
const { open: openHitokotoForm } = useLyEditorModal("hitokoto-form");

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const typeOptions = ref<SelectItem[]>([{ label: t("common.all"), value: -1 }]);
const typeMap = ref<Record<number, HitokotoTypeItem>>({});

const loadTypeOptions = async () => {
  try {
    const res = await getHitokotoTypeOptions();
    typeOptions.value = [
      { label: t("common.all"), value: -1 },
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
    logger.error(error);
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

const columns = computed<TableColumn<HitokotoItem>[]>(() => [
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
    header: t("components.lyEditor.common.table.content"),
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
    header: t("components.lyEditor.modules.hitokoto.headers.source"),
    meta: {
      class: { td: "min-w-24" }
    }
  },
  {
    accessorKey: "author",
    header: t("components.lyEditor.common.table.author"),
    meta: {
      class: { td: "min-w-24" }
    }
  },
  {
    accessorKey: "type",
    header: t("components.lyEditor.common.table.type"),
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
    header: t("components.lyEditor.modules.hitokoto.headers.length"),
    meta: {
      class: { td: "min-w-24" }
    }
  },
  {
    accessorKey: "updated_at",
    header: t("components.lyEditor.common.table.updatedAt"),
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
              label: t("components.lyEditor.modules.hitokoto.menu.edit"),
              icon: "lucide:edit",
              onSelect: () => {
                handleOpenHitokotoFormModal("update", row.original);
              }
            },
            {
              label: t("components.lyEditor.modules.hitokoto.menu.delete"),
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
            icon: "lucide:more-horizontal",
            color: "neutral",
            variant: "ghost"
          })
      )
  }
]);

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
    logger.error(error);
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  loadTypeOptions();
  loadData();
});

const handleImportData = async () => {
  const result = await openHitokotoImport(undefined);

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

const handleOpenHitokotoFormModal = async (mode: "create" | "update", record?: HitokotoItem) => {
  const result = await openHitokotoForm({ record, mode });

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
    title: t("components.lyEditor.common.deleteConfirm.title"),
    message: t("components.lyEditor.common.deleteConfirm.message", { name: e.content }),
    confirmButtonText: t("components.lyEditor.common.deleteConfirm.button"),
    confirmButtonProps: { color: "error" },
    onConfirm: async () => {
      try {
        await deleteHitokoto(e.id);
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
        <UButton icon="lucide:plus" @click="() => handleOpenHitokotoFormModal('create')">
          {{ t("components.lyEditor.modules.hitokoto.add") }}
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

        <UInput
          v-model.trim="state.keyword"
          class="w-48"
          :placeholder="t('components.lyEditor.common.searchPlaceholder')"
        />

        <UButton icon="lucide:search" @click="handleSearch">
          {{ t("common.search") }}
        </UButton>
      </UFieldGroup>
    </template>
  </TabPanelTable>
</template>
