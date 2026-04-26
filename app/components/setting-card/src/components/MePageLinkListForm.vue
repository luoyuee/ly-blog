<script setup lang="ts">
import type { IMePageConfigLinkItem } from "#shared/types/config";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { BasicModal } from "@/components/basic-modal";
import { computed, h, onBeforeUnmount, reactive, ref, resolveComponent, watch } from "vue";
import { useSortable } from "@vueuse/integrations/useSortable";
import { z } from "zod";

const handleClass = "me-page-link-list-form__handle";
const tbodyClass = "me-page-link-list-form__tbody";

type RowItem = IMePageConfigLinkItem & {
  id: string;
};

const props = defineProps({
  type: {
    type: String as PropType<"website" | "project">,
    default: "website"
  }
});

const modelValue = defineModel<IMePageConfigLinkItem[]>({
  default: () => []
});

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");

const rows = ref<RowItem[]>([]);

const syncModelValue = () => {
  modelValue.value = rows.value.map((item) => ({
    title: item.title,
    desc: item.desc,
    href: item.href,
    icon: item.icon
  }));
};

watch(
  () => modelValue.value,
  (newVal) => {
    rows.value = newVal.map((item, index) => ({
      id: `key-${index}`,
      ...item
    }));
  },
  { immediate: true }
);

const headerText = computed(() => {
  switch (props.type) {
    case "website":
      return "网站（Website List）";
    case "project":
      return "项目（Project List）";
    default:
      return "";
  }
});

const descriptionText = computed(() => {
  switch (props.type) {
    case "website":
      return "对应个人页 Projects Tab 下的“网站”卡片列表";
    case "project":
      return "对应个人页 Projects Tab 下的“项目”卡片列表";
    default:
      return "";
  }
});

const modalState = reactive<{
  visible: boolean;
  editingIndex: number | null;
}>({
  visible: false,
  editingIndex: null
});

const modalForm = reactive<IMePageConfigLinkItem>({
  title: "",
  desc: "",
  href: "",
  icon: ""
});

const modalSchema = z.object({
  title: z.string({ message: "请输入标题" }).min(1, "请输入标题"),
  desc: z.string({ message: "请输入描述" }).min(1, "请输入描述"),
  href: z.url("请输入正确的链接"),
  icon: z
    .string({ message: "请输入图标图片链接" })
    .min(1, "请输入图标图片链接")
    .refine((value) => value.startsWith("/") || /^https?:\/\//.test(value), {
      message: "请输入正确的图片链接"
    })
});

const modalFormRef = useTemplateRef("modalFormRef");

const openAddModal = () => {
  modalForm.title = "";
  modalForm.desc = "";
  modalForm.href = "";
  modalForm.icon = "";
  modalState.editingIndex = null;
  modalState.visible = true;
};

const openEditModal = (index: number) => {
  const item = rows.value[index];
  if (!item) return;
  modalState.editingIndex = index;
  modalForm.title = item.title;
  modalForm.desc = item.desc;
  modalForm.href = item.href;
  modalForm.icon = item.icon;
  modalState.visible = true;
};

const submitModal = (event: FormSubmitEvent<z.output<typeof modalSchema>>) => {
  const data = {
    title: event.data.title,
    desc: event.data.desc,
    href: event.data.href,
    icon: event.data.icon
  };

  if (modalState.editingIndex === null) {
    rows.value = [
      ...rows.value,
      {
        id: `key-${Date.now()}`,
        ...data
      }
    ];
  } else {
    const idx = modalState.editingIndex;
    if (rows.value[idx]) {
      rows.value[idx] = {
        ...rows.value[idx]!,
        ...data
      };
    }
  }

  modalState.visible = false;
  syncModelValue();
};

const confirmModal = () => {
  modalFormRef.value?.submit();
};

const handleDelete = (index: number) => {
  rows.value = rows.value.filter((_, i) => i !== index);
  syncModelValue();
};

const columns = computed<TableColumn<RowItem>[]>(() => {
  return [
    {
      id: "drag",
      header: "",
      meta: {
        class: {
          th: "w-10",
          td: "w-10"
        }
      },
      cell: () => {
        return h(UIcon, {
          name: "ep:rank",
          size: 16,
          class: `${handleClass} text-muted cursor-grab active:cursor-grabbing`
        });
      }
    },
    {
      accessorKey: "icon",
      header: "图标",
      cell: ({ row }) => {
        const icon = row.original.icon;
        const isImageLink = icon.startsWith("/") || /^https?:\/\//.test(icon);
        if (!isImageLink) {
          return h(UIcon, { name: icon });
        }
        return h("img", {
          src: icon,
          alt: row.original.title,
          loading: "lazy",
          decoding: "async",
          class: "w-8 h-8 object-contain"
        });
      }
    },
    { accessorKey: "title", header: "标题" },
    { accessorKey: "desc", header: "描述" },
    {
      accessorKey: "href",
      header: "链接",
      cell: ({ row }) => {
        const href = row.original.href;
        return h(
          "a",
          {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
            class: "text-primary block w-40 overflow-hidden whitespace-nowrap text-ellipsis"
          },
          href
        );
      }
    },
    {
      id: "actions",
      header: "操作",
      meta: {
        class: {
          th: "text-right",
          td: "text-right"
        }
      },
      cell: ({ row }) => {
        const idx = row.index;
        return h("div", { class: "flex justify-end gap-2" }, [
          h(UButton, {
            size: "xs",
            color: "primary",
            variant: "ghost",
            icon: "ep:edit",
            onClick: () => openEditModal(idx)
          }),
          h(UButton, {
            size: "xs",
            color: "error",
            variant: "ghost",
            icon: "ep:delete",
            onClick: () => handleDelete(idx)
          })
        ]);
      }
    }
  ];
});

const sortable = useSortable(`.${tbodyClass}`, rows, {
  handle: `.${handleClass}`,
  animation: 150,
  ghostClass: "opacity-60",
  chosenClass: "bg-muted/40",
  onEnd: () => {
    setTimeout(() => {
      syncModelValue();
    });
  }
});

onBeforeUnmount(() => {
  sortable.stop?.();
});
</script>

<template>
  <UFormField
    :label="headerText"
    :description="descriptionText"
    :ui="{
      description: 'text-xs',
      container: 'mt-2'
    }"
  >
    <template #hint>
      <UButton size="xs" icon="ep:plus" @click="openAddModal"> 添加 </UButton>
    </template>

    <div class="border border-muted rounded-md overflow-hidden">
      <UTable
        :data="rows"
        :columns="columns"
        :get-row-id="(row) => row.id"
        sticky
        :ui="{
          tbody: tbodyClass
        }"
      />
    </div>

    <BasicModal
      v-model:visible="modalState.visible"
      :title="modalState.editingIndex === null ? '添加卡片' : '编辑卡片'"
      @confirm="confirmModal"
    >
      <UForm
        ref="modalFormRef"
        :state="modalForm"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="submitModal"
      >
        <UFormField name="title" label="标题" required>
          <UInput v-model="modalForm.title" placeholder="例如：我的博客" />
        </UFormField>
        <UFormField name="desc" label="描述" required>
          <UInput v-model="modalForm.desc" placeholder="一句话描述" />
        </UFormField>
        <UFormField name="href" label="链接" required>
          <UInput v-model="modalForm.href" icon="ep:link" placeholder="https://..." />
        </UFormField>
        <UFormField
          name="icon"
          label="图标图片链接"
          description="用于卡片右侧图标展示（建议 64x64 或 128x128，支持 https://... 或 /images/..."
          required
          :ui="{
            description: 'text-xs',
            container: 'mt-2'
          }"
        >
          <UInput v-model="modalForm.icon" icon="ep:link" placeholder="请输入图片链接" />
        </UFormField>
      </UForm>
    </BasicModal>
  </UFormField>
</template>
