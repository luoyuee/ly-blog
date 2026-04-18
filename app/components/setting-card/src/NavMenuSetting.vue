<script setup lang="ts">
import type { IClientConfigNavMenuItem } from "@@/shared/types/config";
import type { FormSubmitEvent } from "@nuxt/ui";
import { SelectIcon } from "@/components/form/select";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "@/composables/useForm";
import { useConfigStore } from "@/stores";
import { cloneDeep } from "es-toolkit";
import { z } from "zod";
import dayjs from "dayjs";
import SettingCard from "./SettingCard.vue";

const configStore = useConfigStore();

type NavMenuFormData = {
  items: IClientConfigNavMenuItem[];
};

const createInitialFormData = (): NavMenuFormData => {
  return {
    items: cloneDeep(configStore.nav_menu)
  };
};

const {
  formData: navMenuFormData,
  formState,
  isDirty,
  setForm,
  setInitial,
  resetForm: resetNavMenuForm
} = useForm<NavMenuFormData>(createInitialFormData());

const state = reactive<{
  modalVisible: boolean;
  currentParentId: number | null;
  currentEditId: number | null;
  isEdit: boolean;
}>({
  modalVisible: false,
  currentParentId: null,
  currentEditId: null,
  isEdit: false
});

const syncFormData = () => {
  const nextFormData = createInitialFormData();
  setInitial(nextFormData);
  setForm(nextFormData);
};

const handleSave = async () => {
  formState.submitting = true;
  try {
    await configStore.update({
      nav_menu: cloneDeep(navMenuFormData.items)
    });

    syncFormData();
  } finally {
    formState.submitting = false;
  }
};

const handleReset = () => {
  resetNavMenuForm();
};

const createModalInitialFormData = (): IClientConfigNavMenuItem => {
  return {
    id: 0,
    title: "",
    show: true
  };
};

const {
  formData: modalFormData,
  setForm: setModalForm,
  resetForm: resetModalForm
} = useForm<IClientConfigNavMenuItem>(createModalInitialFormData());

const modalSchema = z.object({
  id: z.number().int(),
  title: z.string({ message: "请输入菜单名称" }).min(1, "请输入菜单名称"),
  icon: z.string().optional(),
  href: z.string().optional(),
  show: z.boolean()
});

const modalFormRef = useTemplateRef("modalFormRef");

const findMenuItemById = (
  list: IClientConfigNavMenuItem[],
  id: number
): IClientConfigNavMenuItem | null => {
  for (const item of list) {
    if (item.id === id) {
      return item;
    }

    if (item.children) {
      const target = findMenuItemById(item.children, id);

      if (target) {
        return target;
      }
    }
  }

  return null;
};

const closeModal = () => {
  state.modalVisible = false;
  state.currentParentId = null;
  state.currentEditId = null;
  state.isEdit = false;
  resetModalForm();
};

const createNewMenuItem = (id: number): IClientConfigNavMenuItem => {
  return {
    id,
    title: "",
    href: undefined,
    icon: undefined,
    show: true
  };
};

const handleAddItem = () => {
  setModalForm(createNewMenuItem(new Date().getTime()));

  state.currentParentId = null;
  state.currentEditId = null;
  state.isEdit = false;
  state.modalVisible = true;
};

const handleEdit = (item: IClientConfigNavMenuItem) => {
  setModalForm(cloneDeep(item));

  state.currentEditId = item.id;
  state.currentParentId = null;
  state.isEdit = true;
  state.modalVisible = true;
};

const handleModalSubmit = (event: FormSubmitEvent<z.output<typeof modalSchema>>) => {
  if (state.isEdit && state.currentEditId !== null) {
    const currentItem = findMenuItemById(navMenuFormData.items, state.currentEditId);

    if (currentItem) {
      currentItem.title = event.data.title;
      currentItem.href = event.data.href;
      currentItem.icon = event.data.icon;
      currentItem.show = event.data.show;
    }
  } else {
    if (state.currentParentId !== null) {
      const currentParent = findMenuItemById(navMenuFormData.items, state.currentParentId);

      if (currentParent?.children) {
        currentParent.children.push(cloneDeep(event.data));
      } else {
        if (currentParent) {
          currentParent.children = [cloneDeep(event.data)];
        }
      }
    } else {
      navMenuFormData.items.push(event.data);
    }
  }

  closeModal();
};

const handleModalConfirm = () => {
  modalFormRef.value?.submit();
};

const recursionDelete = (list: IClientConfigNavMenuItem[], id: number) => {
  for (let i = 0; i < list.length; i++) {
    const currentItem = list[i];

    if (!currentItem) {
      continue;
    }

    if (currentItem.id === id) {
      list.splice(i, 1);
      return;
    }

    const children = currentItem.children;

    if (Array.isArray(children) && children.length > 0) {
      recursionDelete(children, id);
    }
  }
};

const handleDelete = (id: number) => {
  recursionDelete(navMenuFormData.items, id);
};

const handleAddSub = (item: IClientConfigNavMenuItem) => {
  setModalForm(createNewMenuItem(dayjs().unix()));

  state.currentParentId = item.id;
  state.currentEditId = null;
  state.isEdit = false;
  state.modalVisible = true;
};
</script>
<template>
  <SettingCard
    id="nav-menu-setting"
    title="导航菜单"
    :is-change="isDirty"
    :submitting="formState.submitting"
    @reset="handleReset"
    @save="handleSave"
  >
    <div>
      <UButton icon="ep:plus" @click="handleAddItem"> 添加导航菜单 </UButton>
    </div>

    <USeparator type="dashed" class="my-4" />

    <UTree :items="navMenuFormData.items" label-key="title">
      <template #item-trailing="{ item, level, expanded }">
        <div class="flex items-center gap-x-1">
          <UButton
            v-if="level === 1"
            icon="ep:plus"
            size="xs"
            variant="ghost"
            @click.stop="handleAddSub(item)"
          />
          <UButton icon="ep:edit" size="xs" variant="ghost" @click.stop="handleEdit(item)" />
          <UButton icon="ep:delete" size="xs" variant="ghost" @click.stop="handleDelete(item.id)" />
          <UIcon
            v-if="item.children && item.children.length > 0"
            name="i-lucide:chevron-down"
            class="shrink-0 transform transition-transform duration-200 size-5"
            :class="{ 'rotate-180': expanded }"
          />
        </div>
      </template>
    </UTree>

    <BasicModal
      v-model:visible="state.modalVisible"
      :title="state.isEdit ? '编辑菜单' : '添加菜单'"
      @confirm="handleModalConfirm"
    >
      <UForm
        ref="modalFormRef"
        :state="modalFormData"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="handleModalSubmit"
      >
        <UFormField name="title" label="名称">
          <UInput v-model="modalFormData.title" placeholder="请输入菜单名称" />
        </UFormField>
        <UFormField name="icon" label="菜单图标">
          <SelectIcon v-model="modalFormData.icon" placeholder="请选择菜单图标" />
        </UFormField>
        <UFormField
          name="href"
          label="链接"
          description="如果有子级，该值将被忽略"
          :ui="{
            container: 'mt-2',
            description: 'text-xs text-gray-400'
          }"
        >
          <UInput
            v-model="modalFormData.href"
            icon="ep:link"
            :disabled="state.isEdit"
            placeholder="请输入链接"
          />
        </UFormField>
        <UFormField
          name="show"
          label="是否显示"
          description="该值会影响子级"
          :ui="{
            container: 'mt-2',
            description: 'text-xs text-gray-400'
          }"
        >
          <USwitch v-model="modalFormData.show" />
        </UFormField>
      </UForm>
    </BasicModal>
  </SettingCard>
</template>
