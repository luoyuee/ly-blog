<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  getArticleCategoryTree,
  createArticleCategory,
  updateArticleCategory
} from "@/apis/article";
import { reactive } from "vue";
import { SelectIcon } from "@/components/form/select";
import type { ArticleCategoryTree, ArticleCategoryForm } from "#shared/types/article";
import { BasicModal } from "@/components/basic-modal";
import { TreeSelect } from "@/components/tree-select";
import { z } from "zod";
import { lyEditorEmitter } from "@/events";

const $notify = useNotification();

const emits = defineEmits(["cancel", "submit"]);

const schema = z.object({
  id: z.number().optional(),
  parent_id: z.number().optional(),
  name: z.string({ message: "请输入分类名称" }),
  icon: z.string().optional(),
  description: z.string().optional()
});

const formData = reactive<ArticleCategoryForm>({
  parent_id: undefined,
  name: undefined,
  icon: undefined,
  description: undefined
});

const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    formData[key as keyof ArticleCategoryForm] = undefined;
  });
};

const visible = ref(false);

const handleOpen = (data?: ArticleCategoryForm) => {
  resetForm();

  if (data) {
    formData.id = data.id;
    formData.name = data.name;
    formData.icon = data.icon;
    formData.description = data.description;
  }

  visible.value = true;
};

lyEditorEmitter.on("cmd.modal-manager:open:category-form", handleOpen);

defineExpose({
  open: handleOpen
});

const submitting = ref(false);
const formRef = useTemplateRef("formRef");
const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    submitting.value = true;

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

    emits("submit");
  } catch (error) {
    $notify.error({ title: "操作失败", error });
  } finally {
    lyEditorEmitter.emit("cmd.article-manager:reload");
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

const categoryData = ref<ArticleCategoryTree>([]);

onMounted(async () => {
  categoryData.value = await getArticleCategoryTree();
});
</script>
<template>
  <BasicModal
    v-model:visible="visible"
    :title="formData.id ? '修改分类' : '新建分类'"
    :submitting="submitting"
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
        <SelectIcon v-model="formData.icon" prefix="custom-color:" placeholder="请选择分类图标" />
      </UFormField>

      <UFormField name="description" label="分类描述">
        <UTextarea v-model="formData.description" placeholder="请输入分类描述" />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
