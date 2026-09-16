<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { useSortable } from "@vueuse/integrations/useSortable";
import { BasicModal } from "@/components/basic-modal";
import { computed, h, onBeforeUnmount, reactive, ref, resolveComponent, watch } from "vue";
import { z } from "zod";

const { t } = useI18n();

const handleClass = "me-page-skills-sortable-table__handle";
const tbodyClass = "me-page-skills-sortable-table__tbody";

type SkillItem = {
  id: string;
  name: string;
};

const modelValue = defineModel<string[]>({
  default: () => []
});

const items = ref<SkillItem[]>([]);

const syncModelValue = () => {
  modelValue.value = items.value.map((item) => item.name);
};

watch(
  () => modelValue.value,
  (newValue) => {
    items.value = newValue.map((name, index) => ({
      id: `key-${index}`,
      name
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

const modalForm = reactive<{
  name: string;
}>({
  name: ""
});

const modalSchema = z.object({
  name: z
    .string({ message: t("components.settingCard.skillsSortableTable.validation.nameRequired") })
    .min(1, t("components.settingCard.skillsSortableTable.validation.nameRequired"))
});

const modalFormRef = useTemplateRef("modalFormRef");

const openAddModal = () => {
  modalForm.name = "";
  modalState.editingIndex = null;
  modalState.visible = true;
};

const openEditModal = (index: number) => {
  const item = items.value[index];
  if (!item) return;
  modalForm.name = item.name;
  modalState.editingIndex = index;
  modalState.visible = true;
};

const submitModal = (event: FormSubmitEvent<z.output<typeof modalSchema>>) => {
  const name = event.data.name.trim();

  if (modalState.editingIndex === null) {
    items.value = [
      ...items.value,
      {
        id: `key-${Date.now()}`,
        name
      }
    ];
  } else {
    const idx = modalState.editingIndex;
    if (items.value[idx]) {
      items.value[idx] = {
        ...items.value[idx]!,
        name
      };
    }
  }

  modalState.visible = false;
  syncModelValue();
};

const confirmModal = () => {
  modalFormRef.value?.submit();
};

const handleDelete = (id: string) => {
  items.value = items.value.filter((item) => item.id !== id);
  syncModelValue();
};

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");

const columns = computed<TableColumn<SkillItem>[]>(() => {
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
          name: "lucide:grip-vertical",
          size: 16,
          class: `${handleClass} text-muted cursor-grab active:cursor-grabbing`
        });
      }
    },
    {
      id: "index",
      header: "#",
      meta: {
        class: {
          th: "w-12",
          td: "w-12 text-muted"
        }
      },
      cell: ({ row }) => String(row.index + 1)
    },
    {
      accessorKey: "name",
      header: t("components.settingCard.common.skill")
    },
    {
      id: "actions",
      header: t("components.settingCard.common.actions"),
      meta: {
        class: {
          th: "text-right w-40",
          td: "text-right w-40"
        }
      },
      cell: ({ row }) => {
        const idx = row.index;
        const id = row.original.id;
        return h("div", { class: "flex justify-end gap-2" }, [
          h(UButton, {
            size: "xs",
            color: "primary",
            variant: "ghost",
            icon: "lucide:edit",
            onClick: () => openEditModal(idx)
          }),
          h(UButton, {
            size: "xs",
            color: "error",
            variant: "ghost",
            icon: "lucide:trash-2",
            onClick: () => handleDelete(id)
          })
        ]);
      }
    }
  ];
});

const sortable = useSortable(`.${tbodyClass}`, items, {
  handle: `.${handleClass}`,
  animation: 150,
  ghostClass: "opacity-60",
  chosenClass: "bg-muted/40",
  onEnd: () => {
    setTimeout(syncModelValue);
  }
});

onBeforeUnmount(() => {
  sortable.stop?.();
});
</script>

<template>
  <UFormField
    :label="$t('components.settingCard.skillsSortableTable.label')"
    :description="$t('components.settingCard.skillsSortableTable.description')"
    :ui="{
      description: 'text-xs',
      container: 'mt-2'
    }"
  >
    <template #hint>
      <UButton size="xs" icon="lucide:plus" @click="openAddModal">{{ $t("common.add") }}</UButton>
    </template>
    <div ref="rootRef" class="me-page-skills-sortable-table">
      <div class="border border-muted rounded-md overflow-hidden">
        <UTable
          :data="items"
          :columns="columns"
          :get-row-id="(row) => row.id"
          sticky
          :ui="{
            tbody: tbodyClass
          }"
        />
      </div>
    </div>

    <BasicModal
      v-model:open="modalState.visible"
      :title="
        modalState.editingIndex === null
          ? $t('components.settingCard.skillsSortableTable.addModalTitle')
          : $t('components.settingCard.skillsSortableTable.editModalTitle')
      "
      @confirm="confirmModal"
    >
      <UForm
        ref="modalFormRef"
        :state="modalForm"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="submitModal"
      >
        <UFormField
          name="name"
          :label="$t('components.settingCard.skillsSortableTable.nameLabel')"
          required
        >
          <UTextarea
            v-model="modalForm.name"
            :placeholder="$t('components.settingCard.skillsSortableTable.namePlaceholder')"
          />
        </UFormField>
      </UForm>
    </BasicModal>
  </UFormField>
</template>
