<script setup lang="ts">
import type { IClientConfigNavMenuItem } from "@@/shared/types/config";
import type { WatchStopHandle } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import { SelectIcon } from "@/components/form/select";
import { BasicModal } from "@/components/basic-modal";
import { useConfigStore } from "@/stores";
import { cloneDeep, isEqual } from "es-toolkit";
import { watch } from "vue";
import { z } from "zod";
import dayjs from "dayjs";

const configStore = useConfigStore();

const data = ref<IClientConfigNavMenuItem[]>([]);

const state = reactive<{
  isChange: boolean;
  submitting: boolean;
  modalVisible: boolean;
  current: IClientConfigNavMenuItem | null;
  isEdit: boolean;
}>({
  isChange: false,
  submitting: false,
  modalVisible: false,
  current: null,
  isEdit: false
});

let formWatcher: WatchStopHandle;
const startWatch = () => {
  formWatcher = watch(
    data.value,
    (newVal) => {
      state.isChange = !isEqual(newVal, configStore.nav_menu);
    },
    { deep: true }
  );
};
const stopWatch = () => {
  if (formWatcher) formWatcher();
};

onMounted(() => {
  data.value = cloneDeep(configStore.nav_menu);
  startWatch();
});

const handleSave = async () => {
  state.submitting = true;
  try {
    await configStore.update({
      nav_menu: unref(data)
    });

    handleReset();
  } finally {
    state.submitting = false;
  }
};

const handleReset = () => {
  stopWatch();

  data.value = cloneDeep(configStore.nav_menu);
  state.isChange = false;

  startWatch();
};

const formData = reactive<IClientConfigNavMenuItem>({
  id: 0,
  title: "",
  show: true
});

const modalSchema = z.object({
  id: z.number().int(),
  title: z.string({ message: "请输入菜单名称" }).min(1, "请输入菜单名称"),
  icon: z.string().optional(),
  href: z.string().optional(),
  show: z.boolean()
});

const modalFormRef = useTemplateRef("modalFormRef");

const resetForm = () => {
  formData.id = 0;
  formData.title = "";
  formData.href = undefined;
  formData.icon = undefined;
  formData.show = true;
};

const handleAddItem = () => {
  formData.id = new Date().getTime();
  state.current = null;
  state.isEdit = false;
  state.modalVisible = true;
};

const handleEdit = (e: IClientConfigNavMenuItem) => {
  formData.id = e.id;
  formData.title = e.title;
  formData.href = e.href;
  formData.icon = e.icon;
  formData.show = e.show;

  state.current = e;

  state.isEdit = true;
  state.modalVisible = true;
};

const handleModalSubmit = (event: FormSubmitEvent<z.output<typeof modalSchema>>) => {
  if (state.isEdit && state.current) {
    state.current.title = event.data.title;
    state.current.href = event.data.href;
    state.current.icon = event.data.icon;
    state.current.show = event.data.show;
  } else {
    if (state.current) {
      if (state.current.children) {
        state.current.children.push(cloneDeep(formData));
      } else {
        state.current.children = [cloneDeep(formData)];
      }
    } else {
      data.value.push(event.data);
    }
  }

  state.isChange = true;
  state.current = null;
  state.modalVisible = false;
  resetForm();
};

const handleModalConfirm = () => {
  modalFormRef.value?.submit();
};

const recursionDelete = (list: IClientConfigNavMenuItem[], id: number) => {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list.splice(i, 1);
      return;
    } else if (list[i].children) {
      recursionDelete(list[i].children!, id);
    }
  }
};

const handleDelete = (id: number) => {
  recursionDelete(data.value, id);
  state.isChange = true;
};

const handleAddSub = (e: IClientConfigNavMenuItem) => {
  formData.id = dayjs().unix();

  state.current = e;
  state.isEdit = false;
  state.modalVisible = true;
};
</script>
<template>
  <div id="nav-menu-setting" class="p-4 shadow-md rounded">
    <div class="mb-4 flex justify-between items-center min-h-8">
      <h3 class="pl-2 border-l-4 border-primary leading-none">导航菜单</h3>
      <div v-if="state.isChange" class="space-x-2">
        <UButton variant="outline" size="sm" :disabled="state.submitting" @click="handleReset">
          取消
        </UButton>
        <UButton size="sm" :loading="state.submitting" @click="handleSave"> 保存 </UButton>
      </div>
    </div>

    <div>
      <UButton icon="ep:plus" @click="handleAddItem"> 添加导航菜单 </UButton>
    </div>

    <USeparator type="dashed" class="my-4" />

    <UTree :items="data" label-key="title">
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
        :state="formData"
        :schema="modalSchema"
        :validate-on-input-delay="100"
        @submit="handleModalSubmit"
      >
        <UFormField name="title" label="名称">
          <UInput v-model="formData.title" placeholder="请输入菜单名称" />
        </UFormField>
        <UFormField name="icon" label="菜单图标">
          <SelectIcon v-model="formData.icon" placeholder="请选择菜单图标" />
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
            v-model="formData.href"
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
          <USwitch v-model="formData.show" />
        </UFormField>
      </UForm>
    </BasicModal>
  </div>
</template>
