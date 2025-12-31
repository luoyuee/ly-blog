<script setup lang="ts">
import type { EditorTabItem, FolderTreeItem } from "#shared/types/ly-editor";
import type { FormSubmitEvent } from "@nuxt/ui";
import { BasicModal } from "@/components/basic-modal";
import { getFolderTree, createNote } from "@/apis/note";
import { lyEditorEmitter } from "@/events";
import { reactive } from "vue";
import { z } from "zod";
import { TreeSelect } from "@/components/tree-select";

const $notify = useNotification();

const emits = defineEmits(["cancel", "submit"]);

const schema = z.object({
  id: z.number().optional(),
  folder_id: z.number().optional(),
  name: z.string({ message: "请输入名称" }),
  content: z.string()
});

const state = reactive<{
  visible: boolean;
  submitting: boolean;
  tabItem?: EditorTabItem;
}>({
  visible: false,
  submitting: false
});

const formData = reactive<{
  id?: number;
  name: string;
  folder_id?: number;
  content: string;
}>({
  name: "",
  content: ""
});

const folderData = ref<FolderTreeItem[]>();

lyEditorEmitter.on("intent.editor-core:save:file", async (e: EditorTabItem): Promise<void> => {
  if (e.type !== "note") return;
  state.tabItem = e;
  state.visible = true;

  try {
    if (e.data.id) return;
    // 同步数据
    formData.id = e.data.id;
    formData.name = e.data.name;
    formData.folder_id = e.data.folder_id;
    formData.content = e.data.content;

    // 读取目录
    folderData.value = await getFolderTree();

    state.visible = true;
  } catch {
    $notify.error({
      title: "获取目录失败"
    });
  }
});

const formRef = useTemplateRef("formRef");

const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    state.submitting = true;

    await createNote({
      name: event.data.name,
      folder_id: event.data.folder_id,
      content: event.data.content,
      extension: ".md"
    });

    if (state.tabItem) {
      lyEditorEmitter.emit("cmd.editor-core:update:file", {
        ...state.tabItem,
        isChange: false,
        label: event.data.name
      });
    }
    $notify.success({
      title: "保存成功"
    });

    state.visible = false;
    lyEditorEmitter.emit("cmd.note-manager:reload");
  } catch (error) {
    $notify.error({
      title: "保存失败",
      error
    });
  } finally {
    state.submitting = false;
  }
};

const handleConfirm = async () => {
  formRef.value?.submit();
};

const handleCancel = () => {
  state.visible = false;
  emits("cancel");
};
</script>
<template>
  <BasicModal v-model:visible="state.visible" title="保存文件">
    <UForm
      ref="formRef"
      class="space-y-2"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField name="folder_id" label="父目录">
        <TreeSelect
          v-model="formData.folder_id"
          label-key="name"
          value-key="id"
          :options="folderData"
        />
      </UFormField>
      <UFormField name="name" label="文件名" required>
        <UInput v-model="formData.name" placeholder="请输入文件名" />
      </UFormField>
    </UForm>

    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="outline"
        :disabled="state.submitting"
        @click="handleCancel"
      />
      <UButton label="确认" color="primary" :loading="state.submitting" @click="handleConfirm" />
    </template>
  </BasicModal>
</template>
