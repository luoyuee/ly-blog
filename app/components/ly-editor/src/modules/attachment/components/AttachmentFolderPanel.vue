<script setup lang="ts">
import type { PropType } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { AttachmentFolder, AttachmentItem } from "#shared/types/attachment";
import type { AttachmentManagerData, EditorTabItem } from "#shared/types/ly-editor";
import {
  getAttachmentFolderDetail,
  getPaginatedAttachments,
  deleteAttachment,
  uploadAttachmentFile
} from "@/apis/attachment";
import { Pagination } from "@/components/pagination";
import { useLyEditorModal } from "@/composables/useLyEditorModal";
import { useLyEditorStore } from "@/stores";
import { h, resolveComponent } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import numeral from "numeral";

const props = defineProps({
  tab: {
    type: Object as PropType<EditorTabItem & { type: "attachment-panel"; data: AttachmentManagerData }>,
    required: true,
    validator: (value: EditorTabItem) => value.type === "attachment-panel"
  }
});

const $notify = useNotification();
const $msgBox = useMessageBox();
const { t } = useI18n();
const lyEditorStore = useLyEditorStore();

const { openModal } = useLyEditorModal();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const defaultFolderIcon = "icon-park-outline:folder-open";

const data = ref<AttachmentItem[]>([]);
const currentFolder = ref<AttachmentFolder>({ ...props.tab.data });
const fileInputRef = useTemplateRef("fileInputRef");

const state = reactive<{
  page: number;
  per_page: number;
  total: number;
  keyword?: string;
  highlightKeyword?: string;
  loading: boolean;
}>({
  page: 1,
  per_page: 50,
  total: 0,
  keyword: undefined,
  highlightKeyword: undefined,
  loading: false
});

/**
 * 将关键字高亮到文本中，便于列表定位结果。
 */
const renderHighlightText = (content?: string) => {
  const text = content ?? "";
  const highlightKeyword = unref(state.highlightKeyword);

  if (!highlightKeyword || !text.includes(highlightKeyword)) {
    return h("div", text || "-");
  }

  const index = text.indexOf(highlightKeyword);

  return h("div", [
    h("span", text.slice(0, index)),
    h("span", { class: "text-red-400" }, highlightKeyword),
    h("span", text.slice(index + highlightKeyword.length))
  ]);
};

const columns: TableColumn<AttachmentItem>[] = [
  {
    accessorKey: "id",
    header: "#",
    meta: {
      class: { td: "min-w-14" }
    },
    cell: ({ row }) => `#${row.getValue("id")}`
  },
  {
    accessorKey: "name",
    header: "文件名",
    meta: {
      class: { td: "min-w-72" }
    },
    cell: ({ row }) => {
      return renderHighlightText((row.original.original_name || row.original.filename) ?? "");
    }
  },
  {
    accessorKey: "mime_type",
    header: "类型",
    meta: {
      class: { td: "min-w-40" }
    },
    cell: ({ row }) => row.original.mime_type || row.original.ext || "-"
  },
  {
    accessorKey: "download_count",
    header: "下载",
    meta: {
      class: { td: "min-w-20" }
    },
    cell: ({ row }) => row.original.download_count
  },
  {
    accessorKey: "size",
    header: "大小",
    meta: {
      class: { td: "min-w-28" }
    },
    cell: ({ row }) => numeral(row.original.size).format("0.0 b")
  },
  {
    accessorKey: "updated_at",
    header: "更新日期",
    meta: {
      class: { td: "w-46" }
    },
    cell: ({ row }) => {
      return h(
        "span",
        dayjs(row.original.updated_at ?? row.original.created_at).format(t("format.datetime"))
      );
    }
  },
  {
    id: "actions",
    meta: {
      class: { td: "w-16" }
    },
    cell: ({ row }) => {
      return h(
        UDropdownMenu,
        {
          content: {
            align: "end"
          },
          items: [
            {
              label: "复制链接",
              icon: "ep:link",
              disabled: !row.original.url,
              onSelect: async () => {
                if (!row.original.url) return;

                await navigator.clipboard.writeText(row.original.url);
                $notify.success({
                  title: "链接已复制"
                });
              }
            },
            {
              label: "打开文件",
              icon: "ep:view",
              disabled: !row.original.url,
              onSelect: () => {
                if (!row.original.url) return;

                window.open(row.original.url, "_blank", "noopener,noreferrer");
              }
            },
            {
              label: "删除文件",
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
            color: "neutral",
            variant: "ghost",
            icon: "i-lucide-ellipsis"
          })
      );
    }
  }
];

/**
 * 加载当前目录下的附件分页数据。
 */
const loadData = async () => {
  try {
    state.loading = true;

    const response = await getPaginatedAttachments({
      page: state.page,
      per_page: state.per_page,
      folder: props.tab.data.id,
      keyword: state.keyword || undefined
    });

    data.value = response.data;
    state.total = response.total;
    state.page = response.page;
    state.per_page = response.per_page;
    state.highlightKeyword = state.keyword;
  } catch (error) {
    $notify.error({
      title: "加载附件失败",
      error
    });
  } finally {
    state.loading = false;
  }
};

const syncCurrentFolder = (folder: AttachmentFolder) => {
  currentFolder.value = folder;

  const tabItem = lyEditorStore.getTabItem(props.tab.key);

  if (!tabItem || tabItem.type !== "attachment-panel") return;

  tabItem.label = folder.name;
  tabItem.data = folder;
};

const loadFolderDetail = async () => {
  try {
    const folder = await getAttachmentFolderDetail(props.tab.data.id);

    syncCurrentFolder(folder);
  } catch (error) {
    $notify.error({
      title: "加载目录详情失败",
      error
    });
  }
};

const handleSearch = async () => {
  state.page = 1;
  await loadData();
};

const handleResetSearch = async () => {
  state.keyword = undefined;
  state.page = 1;
  await loadData();
};

const handleOpenFolderFormModal = async () => {
  const result = await openModal("attachment-folder-form", {
    mode: "update",
    record: props.tab.data
  });

  if (result.action === "submitted") {
    await loadFolderDetail();
    await loadData();
  }
};

const handleTriggerUpload = () => {
  fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  try {
    state.loading = true;

    await uploadAttachmentFile(
      {
        folder: props.tab.data.id,
        file
      },
      () => {}
    );

    $notify.success({
      title: "上传成功"
    });

    await loadFolderDetail();
    await loadData();
  } catch (error) {
    $notify.error({
      title: "上传失败",
      error
    });
  } finally {
    state.loading = false;
    input.value = "";
  }
};

const handleDelete = (record: AttachmentItem) => {
  const displayName = record.original_name || record.filename;

  $msgBox.error({
    title: "确认删除?",
    message: `即将删除文件「${displayName}」，删除后将无法恢复，是否继续？`,
    confirmButtonText: "删除",
    confirmButtonProps: { color: "error" },
    onConfirm: async () => {
      try {
        await deleteAttachment(record.id);
        $notify.success({
          title: "删除成功"
        });

        if (data.value.length === 1 && state.page > 1) {
          state.page -= 1;
        }

        await loadFolderDetail();
        await loadData();
      } catch (error) {
        $notify.error({
          title: "删除失败",
          error
        });
      }
    }
  });
};

watch(
  () => [state.page, state.per_page],
  () => {
    loadData();
  }
);

onMounted(() => {
  loadFolderDetail();
  loadData();
});
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden p-4">
    <div class="mb-4 flex items-center justify-between gap-4">
      <div>
        <h3 class="flex items-center gap-1 text-sm font-medium">
          <UIcon :name="currentFolder.icon || defaultFolderIcon" class="shrink-0" />
          <span>{{ currentFolder.name }}</span>
        </h3>
        <p class="text-xs text-gray-400">
          {{ currentFolder.description || "当前目录用于管理文章与页面附件资源。" }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <input ref="fileInputRef" type="file" class="hidden" @change="handleFileChange" />
        <UButton color="primary" icon="ep:upload" :loading="state.loading" @click="handleTriggerUpload">
          上传附件
        </UButton>
        <UButton color="neutral" variant="outline" icon="ep:edit" @click="handleOpenFolderFormModal">
          编辑目录
        </UButton>
        <UButton color="neutral" variant="outline" icon="ep:refresh" :loading="state.loading" @click="loadData">
          刷新
        </UButton>
      </div>
    </div>

    <div class="mb-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-xs text-gray-400">
        <span>文件数：{{ state.total }}</span>
        <span>目录容量：{{ numeral(currentFolder.size).format("0.0 b") }}</span>
      </div>

      <UFieldGroup>
        <UInput v-model.trim="state.keyword" class="w-72" placeholder="请输入文件名关键词" @keydown.enter="handleSearch" />
        <UButton icon="ep:search" @click="handleSearch">搜索</UButton>
        <UButton color="neutral" variant="outline" @click="handleResetSearch">重置</UButton>
      </UFieldGroup>
    </div>

    <div class="min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-100/10">
      <UTable :data="data" :columns="columns" sticky class="h-full" :loading="state.loading" />
    </div>

    <div class="pt-4">
      <Pagination v-model:page="state.page" v-model:page-size="state.per_page" :total="state.total" />
    </div>
  </div>
</template>
