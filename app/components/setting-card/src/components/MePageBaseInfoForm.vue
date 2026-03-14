<script setup lang="ts">
import type { IClientConfigMePageBaseInfoItem } from "#shared/types/config";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { computed, h, onBeforeUnmount, reactive, ref, resolveComponent, watch } from "vue";
import { useSortable } from "@vueuse/integrations/useSortable";
import { CustomIconNames } from "@@/shared/constants/icon-sets";
import { BasicModal } from "@/components/basic-modal";
import { SelectIcon } from "@/components/form/select";
import { z } from "zod";

const handleClass = "me-page-base-info-form__handle";
const tbodyClass = "me-page-base-info-form__tbody";

type RowItem = IClientConfigMePageBaseInfoItem & {
  id: string;
};

const modelValue = defineModel<IClientConfigMePageBaseInfoItem[]>({
  default: () => []
});

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");

const rows = ref<RowItem[]>([]);

const syncModelValue = () => {
  modelValue.value = rows.value.map((item) => ({
    label: item.label,
    value: item.value,
    icon: item.icon,
    href: item.href
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

const modalForm = reactive<IClientConfigMePageBaseInfoItem>({
  label: "",
  value: "",
  icon: "",
  href: undefined
});

const modalSchema = z.object({
  label: z.string({ message: "请输入标签" }).min(1, "请输入标签"),
  value: z.string({ message: "请输入内容" }).min(1, "请输入内容"),
  icon: z.string({ message: "请选择图标" }).min(1, "请选择图标"),
  href: z.union([z.url("请输入正确的链接"), z.literal("")]).optional()
});

const modalFormRef = useTemplateRef("modalFormRef");

const openAddModal = () => {
  modalForm.label = "";
  modalForm.value = "";
  modalForm.icon = "";
  modalForm.href = undefined;
  modalState.editingIndex = null;
  modalState.visible = true;
};

const openEditModal = (index: number) => {
  const row = rows.value[index];

  if (!row) return;

  modalForm.label = row.label;
  modalForm.value = row.value;
  modalForm.icon = row.icon;
  modalForm.href = row.href;
  modalState.editingIndex = index;
  modalState.visible = true;
};

const submitModal = (event: FormSubmitEvent<z.output<typeof modalSchema>>) => {
  const { label, value, icon, href } = event.data;
  const data = {
    label,
    value,
    icon,
    href: href ? href : undefined
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
    { accessorKey: "label", header: "标题" },
    { accessorKey: "value", header: "内容" },
    {
      accessorKey: "href",
      header: "链接",
      cell: ({ row }) => {
        const href = row.original.href;
        if (!href) return "";
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

defineExpose({
  openAdd: openAddModal
});
</script>

<template>
  <UFormField
    label="基础信息（Base Info）"
    description="支持配置年龄/工作经验等；个人页会根据“年龄/工作经验”自动做年份计算"
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
      :title="modalState.editingIndex === null ? '添加基础信息' : '编辑基础信息'"
      @confirm="confirmModal"
    >
      <UForm
        ref="modalFormRef"
        :state="modalForm"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="submitModal"
      >
        <UFormField name="label" label="标题" required>
          <UInput v-model="modalForm.label" placeholder="例如：年龄 / 工作经验" />
        </UFormField>
        <UFormField name="value" label="内容" required>
          <UInput v-model="modalForm.value" placeholder="例如：2000-01-01 / 2020-01" />
        </UFormField>
        <UFormField name="icon" label="图标" required>
          <SelectIcon v-model="modalForm.icon" :options="CustomIconNames" />
        </UFormField>
        <UFormField name="href" label="链接（可选）">
          <UInput v-model="modalForm.href" icon="ep:link" placeholder="https://..." />
        </UFormField>
      </UForm>
    </BasicModal>
  </UFormField>
</template>
