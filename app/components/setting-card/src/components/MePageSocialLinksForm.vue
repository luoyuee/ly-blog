<script setup lang="ts">
import type { IMePageConfigSocialLinkItem } from "#shared/types/config";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { computed, h, reactive, ref, resolveComponent, watch } from "vue";
import { useSortable } from "@vueuse/integrations/useSortable";
import { SocialIconNames } from "@@/shared/constants/icons";
import { BasicModal } from "@/components/basic-modal";
import { SelectIcon } from "@/components/form/select";
import { z } from "zod";

const handleClass = "me-page-social-links-form__handle";
const tbodyClass = "me-page-social-links-form__tbody";

type RowItem = IMePageConfigSocialLinkItem & {
  id: string;
};

const modelValue = defineModel<IMePageConfigSocialLinkItem[]>({
  default: () => []
});

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");

const rows = ref<RowItem[]>([]);

const syncModelValue = () => {
  modelValue.value = rows.value.map((item) => ({
    title: item.title,
    href: item.href,
    icon: item.icon,
    hover_bg: item.hover_bg
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

const modalState = reactive<{
  visible: boolean;
  editingIndex: number | null;
}>({
  visible: false,
  editingIndex: null
});

const modalForm = reactive<IMePageConfigSocialLinkItem>({
  title: undefined,
  href: "",
  icon: "",
  hover_bg: undefined
});

const modalSchema = z.object({
  title: z.string().optional(),
  href: z.url("请输入链接"),
  icon: z.string({ message: "请选择图标" }).min(1, "请选择图标"),
  hover_bg: z.string().optional()
});

const modalFormRef = useTemplateRef("modalFormRef");

const openAddModal = () => {
  modalForm.title = undefined;
  modalForm.href = "";
  modalForm.icon = "";
  modalForm.hover_bg = undefined;
  modalState.editingIndex = null;
  modalState.visible = true;
};

const openEditModal = (index: number) => {
  const row = rows.value[index];

  if (!row) return;

  modalForm.title = row.title;
  modalForm.href = row.href;
  modalForm.icon = row.icon;
  modalForm.hover_bg = row.hover_bg;
  modalState.editingIndex = index;
  modalState.visible = true;
};

const submitModal = (event: FormSubmitEvent<z.output<typeof modalSchema>>) => {
  const data = {
    title: event.data.title,
    href: event.data.href,
    icon: event.data.icon,
    hover_bg: event.data.hover_bg
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
      cell: ({ row }) => h(UIcon, { name: row.original.icon })
    },
    { accessorKey: "title", header: "标题" },
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
            class: "text-primary block w-64 overflow-hidden whitespace-nowrap text-ellipsis"
          },
          href
        );
      }
    },
    { accessorKey: "hover_bg", header: "Hover 背景" },
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
    label="社交链接（Social Links）"
    description="个人页头像下方的社交按钮列表"
    :ui="{
      description: 'text-xs',
      container: 'mt-2'
    }"
  >
    <template #hint>
      <UButton size="xs" icon="ep:plus" @click="openAddModal"> 添加 </UButton>
    </template>
    <div ref="rootRef" class="border border-muted rounded-md overflow-hidden">
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
      :title="modalState.editingIndex === null ? '添加社交链接' : '编辑社交链接'"
      @confirm="confirmModal"
    >
      <UForm
        ref="modalFormRef"
        :state="modalForm"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="submitModal"
      >
        <UFormField name="title" label="标题（可选）">
          <UInput v-model="modalForm.title" placeholder="例如：GitHub" />
        </UFormField>
        <UFormField name="href" label="链接" required>
          <UInput v-model="modalForm.href" icon="ep:link" placeholder="https://..." />
        </UFormField>
        <UFormField name="icon" label="图标" required>
          <SelectIcon v-model="modalForm.icon" :items="SocialIconNames" />
        </UFormField>
        <UFormField name="hover_bg" label="Hover 背景（可选）">
          <UInput v-model="modalForm.hover_bg" placeholder="例如：#000 或 var(--color-gray-700)" />
        </UFormField>
      </UForm>
    </BasicModal>
  </UFormField>
</template>
