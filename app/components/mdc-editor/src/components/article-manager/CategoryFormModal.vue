<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  getArticleCategoryOptions,
  createArticleCategory,
  updateArticleCategory,
} from "@/apis/article";
import { reactive } from "vue";
import { SelectIcon } from "@/components/form/select";
import { z } from "zod";
import type {
  ArticleCategorySelectOption,
  ArticleCategoryForm,
} from "@/types/article";

const notification = useNotification();

const emits = defineEmits(["cancel", "submit"]);

const schema = z.object({
  id: z.number().optional(),
  parent_id: z.number().optional(),
  name: z.string({ message: "请输入分类名称" }),
  icon: z.string().optional(),
  description: z.string().optional(),
});

const formData = reactive<ArticleCategoryForm>({
  parent_id: undefined,
  name: undefined,
  icon: undefined,
  description: undefined,
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

defineExpose({
  open: handleOpen,
});

const submitting = ref(false);
const formRef = useTemplateRef("formRef");
const handleSubmit = async (
  event: FormSubmitEvent<z.output<typeof schema>>
) => {
  try {
    submitting.value = true;

    if (event.data.id) {
      await updateArticleCategory({
        id: event.data.id,
        parent_id: event.data.parent_id,
        name: event.data.name,
        icon: event.data.icon,
        description: event.data.description,
      });

      notification.success("修改成功");
    } else {
      await createArticleCategory({
        parent_id: event.data.parent_id,
        name: event.data.name,
        icon: event.data.icon,
        description: event.data.description,
      });

      notification.success("创建成功");
    }

    visible.value = false;

    emits("submit");
  } catch (error) {
    notification.error("操作失败", error);
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

const articleCategoryOptions = ref<ArticleCategorySelectOption[]>([]);

onMounted(async () => {
  articleCategoryOptions.value = await getArticleCategoryOptions();
});
</script>
<template>
  <UModal
    v-model:open="visible"
    :title="formData.id ? '修改分类' : '新建分类'"
    :ui="{ footer: 'justify-end', overlay: 'bg-elevated/40' }"
  >
    <template #body>
      <UForm
        class="space-y-2"
        ref="formRef"
        :schema="schema"
        :state="formData"
        :validateOnInputDelay="100"
        @submit="handleSubmit"
      >
        <UFormField name="parent_id" label="父级分类">
          <USelect
            class="w-full"
            valueKey="id"
            labelKey="name"
            placeholder="请选择父级分类"
            v-model="formData.parent_id"
            :items="articleCategoryOptions"
          />
        </UFormField>

        <UFormField name="name" label="分类名称" required>
          <UInput
            class="w-full"
            v-model="formData.name"
            placeholder="请输入分类名称"
          />
        </UFormField>
        <UFormField name="icon" label="分类图标">
          <SelectIcon
            prefix="custom-color:"
            v-model="formData.icon"
            placeholder="请选择分类图标"
          />
        </UFormField>

        <UFormField name="description" label="分类描述">
          <UTextarea
            class="w-full"
            v-model="formData.description"
            placeholder="请输入分类描述"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="outline"
        @click="handleCancel"
        :disabled="submitting"
      />
      <UButton
        label="确认"
        color="primary"
        @click="handleConfirm"
        :loading="submitting"
      />
    </template>
  </UModal>
</template>
