<script setup lang="ts">
import type { IMePageConfigBaseInfoItem } from "#shared/types/config";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { computed, h, onBeforeUnmount, reactive, ref, resolveComponent, watch } from "vue";
import { useSortable } from "@vueuse/integrations/useSortable";
import { BasicModal } from "@/components/basic-modal";
import { SelectIcon } from "@/components/form/select";
import { CustomIconNames } from "#shared/constants";
import { z } from "zod";

const { t } = useI18n();

const handleClass = "me-page-base-info-form__handle";
const tbodyClass = "me-page-base-info-form__tbody";

type RowItem = IMePageConfigBaseInfoItem & {
  id: string;
};

const modelValue = defineModel<IMePageConfigBaseInfoItem[]>({
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

const modalForm = reactive<IMePageConfigBaseInfoItem>({
  label: "",
  value: "",
  icon: "",
  href: undefined
});

const modalSchema = z.object({
  label: z
    .string({ message: t("components.settingCard.baseInfoForm.validation.labelRequired") })
    .min(1, t("components.settingCard.baseInfoForm.validation.labelRequired")),
  value: z
    .string({ message: t("components.settingCard.baseInfoForm.validation.valueRequired") })
    .min(1, t("components.settingCard.baseInfoForm.validation.valueRequired")),
  icon: z
    .string({ message: t("components.settingCard.baseInfoForm.validation.iconRequired") })
    .min(1, t("components.settingCard.baseInfoForm.validation.iconRequired")),
  href: z
    .union([z.url(t("components.settingCard.baseInfoForm.validation.linkInvalid")), z.literal("")])
    .optional()
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
          name: "lucide:grip-vertical",
          size: 16,
          class: `${handleClass} text-muted cursor-grab active:cursor-grabbing`
        });
      }
    },
    {
      accessorKey: "icon",
      header: t("components.settingCard.common.icon"),
      cell: ({ row }) => h(UIcon, { name: row.original.icon })
    },
    { accessorKey: "label", header: t("components.settingCard.common.title") },
    { accessorKey: "value", header: t("components.settingCard.common.content") },
    {
      accessorKey: "href",
      header: t("components.settingCard.common.link"),
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
    :label="$t('components.settingCard.baseInfoForm.label')"
    :description="$t('components.settingCard.baseInfoForm.description')"
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
          ? $t('components.settingCard.baseInfoForm.addModalTitle')
          : $t('components.settingCard.baseInfoForm.editModalTitle')
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
          :label="$t('components.settingCard.baseInfoForm.titleLabel')"
          required
        >
          <UInput
            v-model="modalForm.label"
            :placeholder="$t('components.settingCard.baseInfoForm.titlePlaceholder')"
          />
        </UFormField>
        <UFormField
          name="value"
          :label="$t('components.settingCard.baseInfoForm.valueLabel')"
          required
        >
          <UInput
            v-model="modalForm.value"
            :placeholder="$t('components.settingCard.baseInfoForm.valuePlaceholder')"
          />
        </UFormField>
        <UFormField
          name="icon"
          :label="$t('components.settingCard.baseInfoForm.iconLabel')"
          required
        >
          <SelectIcon v-model="modalForm.icon" :items="CustomIconNames" />
        </UFormField>
        <UFormField name="href" :label="$t('components.settingCard.baseInfoForm.linkLabel')">
          <UInput v-model="modalForm.href" icon="lucide:link" placeholder="https://..." />
        </UFormField>
      </UForm>
    </BasicModal>
  </UFormField>
</template>
