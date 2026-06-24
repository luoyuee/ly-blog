<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { NoteFolderForm } from "#shared/types/note";
import { createFolder, renameFolder, getFolderTree } from "@/apis/note";
import { BasicModal } from "@/components/basic-modal";
import { TreeSelect } from "@/components/tree-select";
import { useForm } from "@/composables/useForm";
import { watch } from "vue";
import { z } from "zod";

const $notify = useNotification();

const visible = defineModel<boolean>("visible", {
  default: false
});

const props = defineProps({
  payload: {
    type: Object as PropType<NoteFolderForm | undefined>,
    default: undefined
  }
});

const emits = defineEmits<{
  resolve: [
    result:
      | {
          action: "submitted";
        }
      | {
          action: "cancelled";
        }
  ];
}>();

const schema = z.object({
  id: z.number().optional(),
  parent_id: z.number().optional(),
  name: z.string({ message: "请输入目录名称" }).min(1, "请输入目录名称")
});

const { formData, formState, resetForm, setForm } = useForm<NoteFolderForm>({
  id: undefined,
  parent_id: undefined,
  name: undefined
});

const folderTree = ref<FolderTreeItem[]>([]);

// 监听弹窗显示，初始化表单与回填数据
watch(
  visible,
  async (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.payload) {
      setForm(props.payload);
    }

    folderTree.value = await getFolderTree();
  },
  {
    immediate: true
  }
);

const formRef = useTemplateRef("formRef");

const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    formState.submitting = true;

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

    emits("resolve", {
      action: "submitted"
    });
  } catch (error) {
    $notify.error({
      title: "操作失败",
      error
    });
  } finally {
    formState.submitting = false;
  }
};

const handleConfirm = async () => {
  formRef.value?.submit();
};

const handleCancel = () => {
  visible.value = false;
  emits("resolve", {
    action: "cancelled"
  });
};
</script>
<template>
  <BasicModal
    v-model:visible="visible"
    :title="formData.id ? '重命名' : '创建目录'"
    :submitting="formState.submitting"
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
  </BasicModal>
</template>
