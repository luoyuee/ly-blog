<script setup lang="ts">
import type { IClientConfigMePageProfileTagItem } from "#shared/types/config";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { computed, h, onBeforeUnmount, reactive, ref, resolveComponent, watch } from "vue";
import { useSortable } from "@vueuse/integrations/useSortable";
import { BasicModal } from "@/components/basic-modal";
import { z } from "zod";

const handleClass = "me-page-profile-tags-form__handle";
const tbodyClass = "me-page-profile-tags-form__tbody";

type RowItem = IClientConfigMePageProfileTagItem & {
  id: string;
};

const modelValue = defineModel<IClientConfigMePageProfileTagItem[]>({
  default: () => []
});

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UIcon = resolveComponent("UIcon");

const badgeColorOptions = ["primary", "neutral", "success", "warning", "error", "info"];

const rows = ref<RowItem[]>([]);

const syncModelValue = () => {
  modelValue.value = rows.value.map((item) => ({
    label: item.label,
    color: item.color
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

const modalForm = reactive<IClientConfigMePageProfileTagItem>({
  label: "",
  color: "neutral"
});

const modalSchema = z.object({
  label: z
    .string({ message: "请输入标签文本" })
    .min(1, "请输入标签文本")
    .superRefine((value, ctx) => {
      const duplicateIndex = rows.value.findIndex((item, index) => {
        if (item.label !== value) return false;
        if (modalState.editingIndex === null) return true;
        return index !== modalState.editingIndex;
      });
      if (duplicateIndex !== -1) {
        ctx.addIssue({ code: "custom", message: "标签重复" });
      }
    }),
  color: z.enum(badgeColorOptions).optional()
});

const modalFormRef = useTemplateRef("modalFormRef");

const openAddModal = () => {
  modalForm.label = "";
  modalForm.color = "neutral";
  modalState.editingIndex = null;
  modalState.visible = true;
};

const openEditModal = (index: number) => {
  const item = rows.value[index];
  if (!item) return;
  modalForm.label = item.label;
  modalForm.color = item.color;
  modalState.editingIndex = index;
  modalState.visible = true;
};

const submitModal = (event: FormSubmitEvent<z.output<typeof modalSchema>>) => {
  const data = {
    label: event.data.label,
    color: event.data.color as IClientConfigMePageProfileTagItem["color"]
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
    { accessorKey: "label", header: "标签" },
    {
      accessorKey: "color",
      header: "颜色",
      cell: ({ row }) => {
        const { color } = row.original;
        return h(
          UBadge,
          {
            color,
            variant: "soft",
            size: "sm"
          },
          () => color
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

defineExpose({
  openAdd: openAddModal
});
</script>

<template>
  <UFormField
    label="个人标签"
    description="个人页左侧头像下方的标签列表"
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
      :title="modalState.editingIndex === null ? '添加标签' : '编辑标签'"
      @confirm="confirmModal"
    >
      <UForm
        ref="modalFormRef"
        :state="modalForm"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="submitModal"
      >
        <UFormField name="label" label="标签文本" required>
          <UInput v-model="modalForm.label" placeholder="例如：独立开发" />
        </UFormField>
        <UFormField name="color" label="颜色">
          <USelect v-model="modalForm.color" :items="badgeColorOptions" />
        </UFormField>
      </UForm>
    </BasicModal>
  </UFormField>
</template>
