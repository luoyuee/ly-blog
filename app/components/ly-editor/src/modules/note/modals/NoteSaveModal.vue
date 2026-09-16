<script setup lang="ts">
import type { EditorTabItem, FolderTreeItem } from "#shared/types/ly-editor";
import type { FormSubmitEvent } from "@nuxt/ui";
import { getFolderTree, createNote } from "@/apis/note";
import { BasicModal } from "@/components/basic-modal";
import { TreeSelect } from "@/components/tree-select";
import { lyEditorEmitter } from "@/events";
import { reactive, watch } from "vue";
import { z } from "zod";

const { t } = useI18n();
const $notify = useNotification();

const open = defineModel<boolean>("open", {
  default: false
});

const props = defineProps({
  tab: {
    type: Object as PropType<EditorTabItem>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [
    result:
      | {
          action: "saved";
          tab: EditorTabItem;
        }
      | {
          action: "cancelled";
        }
  ];
}>();

const schema = z.object({
  id: z.number().optional(),
  folder_id: z.number().optional(),
  name: z.string({
    message: t("components.lyEditor.modules.note.save.validation.nameRequired")
  }),
  content: z.string()
});

const state = reactive<{
  submitting: boolean;
  tabItem?: EditorTabItem;
}>({
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

// 监听弹窗显示，初始化笔记表单
watch(
  open,
  async (newVal) => {
    if (!newVal) {
      state.tabItem = undefined;
      return;
    }

    const tabItem = props.tab;

    if (!tabItem || tabItem.type !== "note") {
      open.value = false;
      return;
    }

    if (tabItem.data.id) {
      open.value = false;
      return;
    }

    state.tabItem = tabItem;
    formData.id = tabItem.data.id;
    formData.name = tabItem.data.name;
    formData.folder_id = tabItem.data.folder_id;
    formData.content = tabItem.data.content;

    try {
      folderData.value = await getFolderTree();
    } catch {
      $notify.error({
        title: t("components.lyEditor.modules.note.save.folderFailed")
      });
    }
  },
  {
    immediate: true
  }
);

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
      title: t("message.save.success")
    });

    if (state.tabItem) {
      const tab = state.tabItem;
      open.value = false;
      emits("close", {
        action: "saved",
        tab
      });
    } else {
      open.value = false;
    }

    lyEditorEmitter.emit("cmd.note-manager:reload");
  } catch (error) {
    $notify.error({
      title: t("message.save.error"),
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
  open.value = false;
  emits("close", {
    action: "cancelled"
  });
};
</script>
<template>
  <BasicModal
    v-model:open="open"
    :title="t('components.lyEditor.modules.note.save.title')"
    :submitting="state.submitting"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <UForm
      ref="formRef"
      class="space-y-2"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField name="folder_id" :label="t('components.lyEditor.modules.note.save.parentLabel')">
        <TreeSelect
          v-model="formData.folder_id"
          label-key="name"
          value-key="id"
          :options="folderData"
        />
      </UFormField>
      <UFormField
        name="name"
        :label="t('components.lyEditor.modules.note.save.nameLabel')"
        required
      >
        <UInput
          v-model="formData.name"
          :placeholder="t('components.lyEditor.modules.note.save.namePlaceholder')"
        />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
