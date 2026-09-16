<script setup lang="ts">
import type { IMePageConfigProfileTagItem } from "#shared/types/config";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { computed, h, onBeforeUnmount, reactive, ref, resolveComponent, watch } from "vue";
import { useSortable } from "@vueuse/integrations/useSortable";
import { BasicModal } from "@/components/basic-modal";
import { z } from "zod";

const { t } = useI18n();

const handleClass = "me-page-profile-tags-form__handle";
const tbodyClass = "me-page-profile-tags-form__tbody";

type RowItem = IMePageConfigProfileTagItem & {
  id: string;
};

const modelValue = defineModel<IMePageConfigProfileTagItem[]>({
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

const modalForm = reactive<IMePageConfigProfileTagItem>({
  label: "",
  color: "neutral"
});

const modalSchema = z.object({
  label: z
    .string({ message: t("components.settingCard.profileTagsForm.validation.labelRequired") })
    .min(1, t("components.settingCard.profileTagsForm.validation.labelRequired"))
    .superRefine((value, ctx) => {
      const duplicateIndex = rows.value.findIndex((item, index) => {
        if (item.label !== value) return false;
        if (modalState.editingIndex === null) return true;
        return index !== modalState.editingIndex;
      });
      if (duplicateIndex !== -1) {
        ctx.addIssue({
          code: "custom",
          message: t("components.settingCard.profileTagsForm.validation.duplicateLabel")
        });
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
    color: event.data.color as IMePageConfigProfileTagItem["color"]
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
          name: "lucide:grip-vertical",
          size: 16,
          class: `${handleClass} text-muted cursor-grab active:cursor-grabbing`
        });
      }
    },
    { accessorKey: "label", header: t("components.settingCard.common.label") },
    {
      accessorKey: "color",
      header: t("components.settingCard.common.color"),
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
      header: t("components.settingCard.common.actions"),
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
            icon: "lucide:edit",
            onClick: () => openEditModal(idx)
          }),
          h(UButton, {
            size: "xs",
            color: "error",
            variant: "ghost",
            icon: "lucide:trash-2",
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
    :label="$t('components.settingCard.profileTagsForm.label')"
    :description="$t('components.settingCard.profileTagsForm.description')"
    :ui="{
      description: 'text-xs',
      container: 'mt-2'
    }"
  >
    <template #hint>
      <UButton size="xs" icon="lucide:plus" @click="openAddModal">{{ $t("common.add") }}</UButton>
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
      v-model:open="modalState.visible"
      :title="
        modalState.editingIndex === null
          ? $t('components.settingCard.profileTagsForm.addModalTitle')
          : $t('components.settingCard.profileTagsForm.editModalTitle')
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
          name="label"
          :label="$t('components.settingCard.profileTagsForm.labelLabel')"
          required
        >
          <UInput
            v-model="modalForm.label"
            :placeholder="$t('components.settingCard.profileTagsForm.labelPlaceholder')"
          />
        </UFormField>
        <UFormField name="color" :label="$t('components.settingCard.profileTagsForm.colorLabel')">
          <USelect v-model="modalForm.color" :items="badgeColorOptions" />
        </UFormField>
      </UForm>
    </BasicModal>
  </UFormField>
</template>
