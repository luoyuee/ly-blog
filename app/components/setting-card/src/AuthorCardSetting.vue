<script setup lang="ts">
import type { IClientConfigAuthorCard, IClientConfigAuthorCardLink } from "#shared/types/config";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { BasicModal } from "@/components/basic-modal";
import { SelectIcon } from "@/components/form/select";
import { useForm } from "@/composables/useForm";
import { h, resolveComponent } from "vue";
import { cloneDeep } from "es-toolkit";
import { useConfigStore } from "@/stores";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const { t } = useI18n();

const configStore = useConfigStore();

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");

const createInitialFormData = (): IClientConfigAuthorCard => {
  return cloneDeep(configStore.author_card);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IClientConfigAuthorCard>(createInitialFormData());

const schema = z.object({
  name: z.string().min(1, t("components.settingCard.authorCard.validation.nameRequired"))
});

const syncFormData = () => {
  const nextFormData = createInitialFormData();
  setInitial(nextFormData);
  setForm(nextFormData);
};

const formRef = useTemplateRef("formRef");
const handleSave = () => {
  formRef.value?.submit();
};

const handleSubmit = async () => {
  formState.submitting = true;
  try {
    await configStore.update({
      author_card: cloneDeep(formData)
    });

    syncFormData();
  } finally {
    formState.submitting = false;
  }
};

const handleReset = () => {
  resetForm();
};

const modalState = reactive({
  visible: false,
  isEdit: false
});

const modalFormData = reactive<IClientConfigAuthorCardLink>({
  title: "",
  href: ""
});

const modalSchema = z.object({
  icon: z.string().optional(),
  title: z
    .string({ message: t("components.settingCard.authorCard.validation.titleRequired") })
    .min(1, t("components.settingCard.authorCard.validation.titleRequired")),
  href: z
    .url(t("components.settingCard.authorCard.validation.linkInvalid"))
    .superRefine((value, ctx) => {
      if (modalState.isEdit) return;

      if (formData.links && formData.links.find((item) => item.href === value)) {
        ctx.addIssue({
          code: "custom",
          message: t("components.settingCard.authorCard.validation.duplicateLink")
        });
      }
    })
});

const modalFormRef = useTemplateRef("modalFormRef");

const handleAddLink = () => {
  modalFormData.title = "";
  modalFormData.href = "";
  modalFormData.icon = undefined;

  modalState.isEdit = false;
  modalState.visible = true;
};

const handleModalSubmit = (event: FormSubmitEvent<z.output<typeof modalSchema>>) => {
  const { title, href } = event.data;

  if (modalState.isEdit && formData.links) {
    const item = formData.links.find((item) => item.href === href);
    if (item) item.title = title;
  } else {
    if (formData.links) {
      formData.links.push(event.data);
    } else {
      formData.links = [{ ...event.data }];
    }
  }

  modalState.visible = false;
};

const handleModalConfirm = () => {
  modalFormRef.value?.submit();
};

const linkColumns: TableColumn<IClientConfigAuthorCardLink>[] = [
  {
    accessorKey: "icon",
    header: t("components.settingCard.common.icon"),
    cell: ({ row }) => {
      const { icon } = row.original;
      return h(UIcon, {
        name: icon || "colorful:link"
      });
    }
  },
  {
    accessorKey: "href",
    header: t("components.settingCard.common.link")
  },
  {
    accessorKey: "title",
    header: t("components.settingCard.common.title")
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
      const { title, href, icon } = row.original;

      return h("div", { class: "flex justify-end gap-2" }, [
        h(UButton, {
          size: "xs",
          color: "primary",
          variant: "ghost",
          icon: "lucide:edit",
          onClick: () => {
            modalFormData.title = title;
            modalFormData.href = href;
            modalFormData.icon = icon;

            modalState.isEdit = true;
            modalState.visible = true;
          }
        }),
        h(UButton, {
          size: "xs",
          color: "error",
          variant: "ghost",
          icon: "lucide:trash-2",
          onClick: () => {
            if (formData.links) {
              formData.links = formData.links.filter((item) => item.href !== href);
            }
          }
        })
      ]);
    }
  }
];
</script>
<template>
  <SettingCard
    id="author-card-setting"
    :title="$t('components.settingCard.authorCard.title')"
    :is-change="isDirty"
    :submitting="formState.submitting"
    @reset="handleReset"
    @save="handleSave"
  >
    <UForm
      ref="formRef"
      class="space-y-2"
      :state="formData"
      :schema="schema"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField :label="$t('components.settingCard.authorCard.nameLabel')" prop="name">
        <UInput v-model="formData.name" />
      </UFormField>
      <UFormField :label="$t('components.settingCard.authorCard.nameLinkLabel')" prop="name_link">
        <UInput v-model="formData.name_link" icon="lucide:link" />
      </UFormField>
      <UFormField :label="$t('components.settingCard.authorCard.avatarLabel')" prop="avatar">
        <UInput v-model="formData.avatar" icon="lucide:link" />
      </UFormField>
      <UFormField :label="$t('components.settingCard.authorCard.mottoLabel')" prop="motto">
        <UTextarea v-model="formData.motto" />
      </UFormField>

      <UFormField
        :label="$t('components.settingCard.authorCard.linkListLabel')"
        :description="$t('components.settingCard.authorCard.linkListDescription')"
        :ui="{
          description: 'text-xs text-gray-400',
          container: 'mt-2'
        }"
      >
        <template #hint>
          <UButton size="xs" icon="lucide:plus" @click="handleAddLink">
            {{ $t("common.add") }}
          </UButton>
        </template>
        <div class="space-y-2">
          <div class="border border-muted rounded-md overflow-hidden">
            <UTable :data="formData.links ?? []" :columns="linkColumns" sticky class="max-h-64" />
          </div>
        </div>
      </UFormField>
    </UForm>

    <BasicModal
      v-model:open="modalState.visible"
      :title="
        modalState.isEdit
          ? $t('components.settingCard.authorCard.linkModalEdit')
          : $t('components.settingCard.authorCard.linkModalAdd')
      "
      @confirm="handleModalConfirm"
    >
      <UForm
        ref="modalFormRef"
        :state="modalFormData"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="handleModalSubmit"
      >
        <UFormField :label="$t('components.settingCard.authorCard.linkIconLabel')" prop="link_icon">
          <SelectIcon v-model="modalFormData.icon" />
        </UFormField>
        <UFormField name="title" :label="$t('components.settingCard.common.title')">
          <UInput
            v-model="modalFormData.title"
            :placeholder="$t('components.settingCard.authorCard.linkTitlePlaceholder')"
          />
        </UFormField>
        <UFormField name="href" :label="$t('components.settingCard.common.link')">
          <UInput
            v-model="modalFormData.href"
            icon="lucide:link"
            :placeholder="$t('components.settingCard.authorCard.linkPlaceholder')"
            :disabled="modalState.isEdit"
          />
        </UFormField>
      </UForm>
    </BasicModal>
  </SettingCard>
</template>
