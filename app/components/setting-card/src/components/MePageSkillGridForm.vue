<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import type { IMePageConfigSkillGridItem } from "#shared/types/config";
import { computed, h, onBeforeUnmount, reactive, ref, resolveComponent, watch } from "vue";
import { useSortable } from "@vueuse/integrations/useSortable";
import { BasicModal } from "@/components/basic-modal";
import { SelectIcon } from "@/components/form/select";
import { SkillIconNames } from "#shared/constants";
import { z } from "zod";

const { t } = useI18n();

const handleClass = "me-page-skill-grid-form__handle";
const tbodyClass = "me-page-skill-grid-form__tbody";

type RowItem = IMePageConfigSkillGridItem & {
  id: string;
};

const modelValue = defineModel<IMePageConfigSkillGridItem[]>({
  default: () => []
});

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");

const rows = ref<RowItem[]>([]);

const syncModelValue = () => {
  modelValue.value = rows.value.map((item) => ({
    title: item.title,
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

const modalForm = reactive<IMePageConfigSkillGridItem>({
  title: "",
  icon: "",
  href: undefined
});

const modalSchema = z.object({
  title: z
    .string({ message: t("components.settingCard.skillGridForm.validation.titleRequired") })
    .min(1, t("components.settingCard.skillGridForm.validation.titleRequired")),
  icon: z
    .string({ message: t("components.settingCard.skillGridForm.validation.iconRequired") })
    .min(1, t("components.settingCard.skillGridForm.validation.iconRequired")),
  href: z
    .union([z.url(t("components.settingCard.skillGridForm.validation.linkInvalid")), z.literal("")])
    .optional()
});

const modalFormRef = useTemplateRef("modalFormRef");

const openAddModal = () => {
  modalForm.title = "";
  modalForm.icon = "";
  modalForm.href = undefined;
  modalState.editingIndex = null;
  modalState.visible = true;
};

const openEditModal = (index: number) => {
  const item = rows.value[index];
  if (!item) return;
  modalForm.title = item.title;
  modalForm.icon = item.icon;
  modalForm.href = item.href;
  modalState.editingIndex = index;
  modalState.visible = true;
};

const submitModal = (event: FormSubmitEvent<z.output<typeof modalSchema>>) => {
  const data = {
    title: event.data.title,
    icon: event.data.icon,
    href: event.data.href ? event.data.href : undefined
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
    { accessorKey: "title", header: t("components.settingCard.common.title") },
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
    :label="$t('components.settingCard.skillGridForm.label')"
    :description="$t('components.settingCard.skillGridForm.description')"
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
        class="max-h-128"
        :ui="{
          tbody: tbodyClass
        }"
      />
    </div>

    <BasicModal
      v-model:open="modalState.visible"
      :title="
        modalState.editingIndex === null
          ? $t('components.settingCard.skillGridForm.addModalTitle')
          : $t('components.settingCard.skillGridForm.editModalTitle')
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
          name="title"
          :label="$t('components.settingCard.skillGridForm.titleLabel')"
          required
        >
          <UInput
            v-model="modalForm.title"
            :placeholder="$t('components.settingCard.skillGridForm.titlePlaceholder')"
          />
        </UFormField>
        <UFormField
          name="icon"
          :label="$t('components.settingCard.skillGridForm.iconLabel')"
          required
        >
          <SelectIcon v-model="modalForm.icon" :items="SkillIconNames" />
        </UFormField>
        <UFormField name="href" :label="$t('components.settingCard.skillGridForm.linkLabel')">
          <UInput v-model="modalForm.href" icon="lucide:link" placeholder="https://..." />
        </UFormField>
      </UForm>
    </BasicModal>
  </UFormField>
</template>
