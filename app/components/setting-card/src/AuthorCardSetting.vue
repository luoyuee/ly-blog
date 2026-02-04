<script setup lang="ts">
import type { IClientConfigAuthorCard, IClientConfigAuthorCardLink } from "@@/shared/types/config";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import type { WatchStopHandle } from "vue";
import { BasicModal } from "@/components/basic-modal";
import { SelectIcon } from "@/components/form/select";
import { h, resolveComponent, watch } from "vue";
import { isEqual, cloneDeep } from "lodash-es";
import { useConfigStore } from "@/stores";
import { z } from "zod";

const configStore = useConfigStore();

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");

const state = reactive({
  isChange: false,
  submitting: false
});

const formData = reactive<IClientConfigAuthorCard>({
  name: "",
  motto: undefined,
  links: undefined
});

const schema = z.object({
  name: z.string().min(1, "请输入名称")
});

let formWatcher: WatchStopHandle;
const startWatch = () => {
  formWatcher = watch(formData, (newVal) => {
    state.isChange = !isEqual(newVal, configStore.author_card);
  });
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  Object.assign(formData, cloneDeep(configStore.author_card));
  startWatch();
});

const formRef = useTemplateRef("formRef");
const handleSave = () => {
  formRef.value?.submit();
};

const handleSubmit = async () => {
  state.submitting = true;
  try {
    await configStore.update({
      author_card: unref(formData)
    });

    handleReset();
  } finally {
    state.submitting = false;
  }
};

const handleReset = () => {
  stopWatch();

  formData.name = configStore.author_card.name;
  formData.name_link = configStore.author_card.name_link;
  formData.avatar = configStore.author_card.avatar;
  formData.motto = configStore.author_card.motto;
  formData.links = configStore.author_card.links;

  state.isChange = false;

  startWatch();
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
        name: icon || "custom-color:link"
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
  <div class="p-4 shadow-md rounded">
    <div class="mb-4 flex justify-between items-center min-h-8">
      <h3 class="pl-2 border-l-4 border-primary leading-none">作者卡片</h3>
      <div v-if="state.isChange" class="space-x-2">
        <UButton variant="outline" size="sm" :disabled="state.submitting" @click="handleReset">
          取消
        </UButton>
        <UButton size="sm" :loading="state.submitting" @click="handleSave"> 保存 </UButton>
      </div>
    </div>

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
  </div>
</template>
