<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { createFolder, renameFolder, getFolderTree } from "@/apis/note";
import { BasicModal } from "@/components/basic-modal";
import { lyEditorEmitter } from "@/events";
import { TreeSelect } from "@/components/tree-select";
import { z } from "zod";
import type { NoteFolderForm } from "~~/shared/types/note";

const $notify = useNotification();

const emits = defineEmits(["cancel", "submit"]);

const schema = z.object({
  id: z.number().optional(),
  parent_id: z.number().optional(),
  name: z.string({ message: "请输入目录名称" }).min(1, "请输入目录名称")
});

const formData = ref<NoteFolderForm>({});

const visible = ref(false);

const folderTree = ref<FolderTreeItem[]>([]);

const handleOpen = (data?: NoteFolderForm) => {
  formData.value = data || {};

  getFolderTree().then((res) => {
    folderTree.value = res;
  });

  visible.value = true;
};

lyEditorEmitter.on("intent.note-manager:new:folder", handleOpen);
lyEditorEmitter.on("intent.note-manager:rename:folder", handleOpen);

defineExpose({
  open: handleOpen
});

const submitting = ref(false);
const formRef = useTemplateRef("formRef");
const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    submitting.value = true;

    if (event.data.id) {
      await renameFolder({
        id: event.data.id,
        name: event.data.name
      });

      $notify.success({
        title: "修改成功"
      });
    } else {
      await createFolder({
        parent_id: event.data.parent_id,
        name: event.data.name
      });

      $notify.success({
        title: "创建成功"
      });
    }

    visible.value = false;

    emits("submit");
  } catch (error) {
    $notify.error({
      title: "操作失败",
      error
    });
  } finally {
    submitting.value = false;
  }
};

const handleConfirm = async () => {
  formRef.value?.submit();
};

const handleCancel = () => {
  visible.value = false;
  emits("cancel");
};
</script>
<template>
  <BasicModal v-model:visible="visible" :title="formData.id ? '重命名' : '创建目录'">
    <UForm
      ref="formRef"
      class="space-y-2"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField v-if="!formData.id" name="parent_id" label="父目录">
        <TreeSelect
          v-model="formData.parent_id"
          label-key="name"
          value-key="id"
          :options="folderTree"
        />
      </UFormField>
      <UFormField name="name" label="目录名称" required>
        <UInput v-model="formData.name" placeholder="请输入目录名称" />
      </UFormField>
    </UForm>

    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="outline"
        :disabled="submitting"
        @click="handleCancel"
      />
      <UButton label="确认" color="primary" :loading="submitting" @click="handleConfirm" />
    </template>
  </BasicModal>
</template>
