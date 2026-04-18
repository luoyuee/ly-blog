<script setup lang="ts">
import type { IClientConfigAuthorCard, IClientConfigAuthorCardLink } from "@@/shared/types/config";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { BasicModal } from "@/components/basic-modal";
import { SelectIcon } from "@/components/form/select";
import { useForm } from "@/composables/useForm";
import { h, resolveComponent } from "vue";
import { cloneDeep } from "es-toolkit";
import { useConfigStore } from "@/stores";
import { z } from "zod";
import SettingCard from "./SettingCard.vue";

const configStore = useConfigStore();

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");

const createInitialFormData = (): IClientConfigAuthorCard => {
  return cloneDeep(configStore.author_card);
};

const { formData, formState, isDirty, setForm, setInitial, resetForm } =
  useForm<IClientConfigAuthorCard>(createInitialFormData());

const schema = z.object({
  name: z.string().min(1, "请输入名称")
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
  title: z.string({ message: "请输入标题" }).min(1, "请输入标题"),
  href: z.url("请输入合法的链接").superRefine((value, ctx) => {
    if (modalState.isEdit) return;

    if (formData.links && formData.links.find((item) => item.href === value)) {
      ctx.addIssue({
        code: "custom",
        message: "链接重复"
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
    header: "图标",
    cell: ({ row }) => {
      const { icon } = row.original;
      return h(UIcon, {
        name: icon || "colorful:link"
      });
    }
  },
  {
    accessorKey: "href",
    header: "链接"
  },
  {
    accessorKey: "title",
    header: "标题"
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
      const { title, href, icon } = row.original;

      return h("div", { class: "flex justify-end gap-2" }, [
        h(UButton, {
          size: "xs",
          color: "primary",
          variant: "ghost",
          icon: "ep:edit",
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
          icon: "ep:delete",
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
    title="作者卡片"
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
      <UFormField label="作者名称" prop="name">
        <UInput v-model="formData.name" />
      </UFormField>
      <UFormField label="名称链接" prop="name_link">
        <UInput v-model="formData.name_link" icon="ep:link" />
      </UFormField>
      <UFormField label="头像" prop="avatar">
        <UInput v-model="formData.avatar" icon="ep:link" />
      </UFormField>
      <UFormField label="格言" prop="motto">
        <UTextarea v-model="formData.motto" />
      </UFormField>

      <UFormField
        label="链接"
        description="作者卡片下方显示的外部链接列表"
        :ui="{
          description: 'text-xs text-gray-400',
          container: 'mt-2'
        }"
      >
        <template #hint>
          <UButton size="xs" icon="ep:plus" @click="handleAddLink"> 添加 </UButton>
        </template>
        <div class="space-y-2">
          <div class="border border-muted rounded-md overflow-hidden">
            <UTable :data="formData.links ?? []" :columns="linkColumns" sticky class="max-h-64" />
          </div>
        </div>
      </UFormField>
    </UForm>

    <BasicModal
      v-model:visible="modalState.visible"
      :title="modalState.isEdit ? '编辑链接' : '添加链接'"
      @confirm="handleModalConfirm"
    >
      <UForm
        ref="modalFormRef"
        :state="modalFormData"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="handleModalSubmit"
      >
        <UFormField label="链接图标" prop="link_icon">
          <SelectIcon v-model="modalFormData.icon" />
        </UFormField>
        <UFormField name="title" label="标题">
          <UInput v-model="modalFormData.title" placeholder="请输入链接标题" />
        </UFormField>
        <UFormField name="href" label="链接">
          <UInput
            v-model="modalFormData.href"
            icon="ep:link"
            placeholder="请输入链接"
            :disabled="modalState.isEdit"
          />
        </UFormField>
      </UForm>
    </BasicModal>
  </SettingCard>
</template>
