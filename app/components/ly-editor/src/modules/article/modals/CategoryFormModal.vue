<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { ArticleCategoryTree, ArticleCategoryForm } from "#shared/types/article";
import {
  getArticleCategoryTree,
  createArticleCategory,
  updateArticleCategory
} from "@/apis/article";
import { SelectIcon } from "@/components/form/select";
import { BasicModal } from "@/components/basic-modal";
import { TreeSelect } from "@/components/tree-select";
import { useForm } from "@/composables/useForm";
import { lyEditorEmitter } from "@/events";
import { watch } from "vue";
import { z } from "zod";

const $notify = useNotification();

const visible = defineModel<boolean>("visible", {
  default: false
});

const props = defineProps({
  payload: {
    type: Object as PropType<ArticleCategoryForm | undefined>,
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
  name: z.string({ message: "请输入分类名称" }),
  icon: z.string().optional(),
  description: z.string().optional()
});

const { formData, formState, resetForm, setForm } = useForm<ArticleCategoryForm>({
  id: undefined,
  parent_id: undefined,
  name: undefined,
  icon: undefined,
  description: undefined
});

// 监听弹窗显示，初始化表单与回填数据
watch(
  visible,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.payload) {
      const { id, name, icon, description } = props.payload;
      setForm({ id, name, icon, description });
    }
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
      await updateArticleCategory({
        id: event.data.id,
        parent_id: event.data.parent_id,
        name: event.data.name,
        icon: event.data.icon,
        description: event.data.description
      });

      $notify.success({ title: "修改成功" });
    } else {
      await createArticleCategory({
        parent_id: event.data.parent_id,
        name: event.data.name,
        icon: event.data.icon,
        description: event.data.description
      });

      $notify.success({ title: "创建成功" });
    }

    visible.value = false;

    emits("resolve", {
      action: "submitted"
    });
  } catch (error) {
    $notify.error({ title: "操作失败", error });
  } finally {
    lyEditorEmitter.emit("cmd.article-manager:reload");
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

const categoryData = ref<ArticleCategoryTree>([]);

onMounted(async () => {
  categoryData.value = await getArticleCategoryTree();
});
</script>
<template>
  <BasicModal
    v-model:visible="visible"
    :title="formData.id ? '修改分类' : '新建分类'"
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
      <UFormField name="parent_id" label="父级分类">
        <TreeSelect
          v-model="formData.parent_id"
          class="w-full"
          value-key="id"
          label-key="name"
          placeholder="请选择父级分类"
          :options="categoryData"
        />
      </UFormField>

      <UFormField name="name" label="分类名称" required>
        <UInput v-model="formData.name" placeholder="请输入分类名称" />
      </UFormField>

      <UFormField name="icon" label="分类图标">
        <SelectIcon v-model="formData.icon" prefix="colorful:" placeholder="请选择分类图标" />
      </UFormField>

      <UFormField name="description" label="分类描述">
        <UTextarea v-model="formData.description" placeholder="请输入分类描述" />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
