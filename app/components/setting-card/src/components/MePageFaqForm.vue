<script setup lang="ts">
import type { IMePageConfigFaqItem } from "#shared/types/config";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { computed, h, onBeforeUnmount, reactive, ref, resolveComponent, watch } from "vue";
import { useSortable } from "@vueuse/integrations/useSortable";
import { BasicModal } from "@/components/basic-modal";
import { z } from "zod";

const handleClass = "me-page-faq-form__handle";
const tbodyClass = "me-page-faq-form__tbody";

type RowItem = IMePageConfigFaqItem & {
  id: string;
};

const modelValue = defineModel<IMePageConfigFaqItem[]>({
  default: () => []
});

const syncModelValue = () => {
  modelValue.value = rows.value.map((item) => ({
    label: item.label,
    content: item.content
  }));
};

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");

const rows = ref<RowItem[]>([]);

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

const modalForm = reactive<IMePageConfigFaqItem>({
  label: "",
  content: ""
});

const modalSchema = z.object({
  label: z.string({ message: "请输入问题" }).min(1, "请输入问题"),
  content: z.string({ message: "请输入回答内容" }).min(1, "请输入回答内容")
});

const modalFormRef = useTemplateRef("modalFormRef");

const openAddModal = () => {
  modalForm.label = "";
  modalForm.content = "";
  modalState.editingIndex = null;
  modalState.visible = true;
};

const openEditModal = (index: number) => {
  const row = rows.value[index];

  if (!row) return;

  modalForm.label = row.label;
  modalForm.content = row.content;
  modalState.editingIndex = index;
  modalState.visible = true;
};

const submitModal = (event: FormSubmitEvent<z.output<typeof modalSchema>>) => {
  const data = {
    label: event.data.label,
    content: event.data.content
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
      id: "label",
      header: "问题",
      cell: ({ row }) => row.original.label
    },
    {
      id: "content",
      header: "回答",
      cell: ({ row }) => {
        const text = row.original.content || "";
        return h("div", { class: "whitespace-nowrap overflow-hidden text-ellipsis" }, text);
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
    label="FAQ"
    description="对应个人页 FAQ Tab 的折叠面板内容"
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
        class="max-h-64"
        :ui="{
          tbody: tbodyClass
        }"
      />
    </div>

    <BasicModal
      v-model:visible="modalState.visible"
      :title="modalState.editingIndex === null ? '添加 FAQ' : '编辑 FAQ'"
      @confirm="confirmModal"
    >
      <UForm
        ref="modalFormRef"
        :state="modalForm"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="submitModal"
      >
        <UFormField name="label" label="问题" required>
          <UInput v-model="modalForm.label" placeholder="例如：你在做什么？" />
        </UFormField>
        <UFormField name="content" label="回答" required>
          <UTextarea v-model="modalForm.content" :rows="5" placeholder="请输入回答内容" />
        </UFormField>
      </UForm>
    </BasicModal>
  </UFormField>
</template>
