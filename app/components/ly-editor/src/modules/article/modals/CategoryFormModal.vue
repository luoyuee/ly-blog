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

const { t } = useI18n();
const $notify = useNotification();

const open = defineModel<boolean>("open", {
  default: false
});

const props = defineProps({
  form: {
    type: Object as PropType<ArticleCategoryForm | undefined>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [
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
  name: z.string({
    message: t("components.lyEditor.modules.article.categoryForm.validation.nameRequired")
  }),
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
  open,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.form) {
      const { id, name, icon, description } = props.form;
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

      $notify.success({ title: t("message.update.success") });
    } else {
      await createArticleCategory({
        parent_id: event.data.parent_id,
        name: event.data.name,
        icon: event.data.icon,
        description: event.data.description
      });

      $notify.success({ title: t("message.create.success") });
    }

    open.value = false;

    emits("close", {
      action: "submitted"
    });
  } catch (error) {
    $notify.error({ title: t("message.operate.error"), error });
  } finally {
    lyEditorEmitter.emit("cmd.article-manager:reload");
    formState.submitting = false;
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

const categoryData = ref<ArticleCategoryTree>([]);

onMounted(async () => {
  categoryData.value = await getArticleCategoryTree();
});
</script>
<template>
  <BasicModal
    v-model:open="open"
    :title="
      formData.id
        ? t('components.lyEditor.modules.article.categoryForm.editTitle')
        : t('components.lyEditor.modules.article.categoryForm.createTitle')
    "
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
      <UFormField
        name="parent_id"
        :label="t('components.lyEditor.modules.article.categoryForm.parentLabel')"
      >
        <TreeSelect
          v-model="formData.parent_id"
          class="w-full"
          value-key="id"
          label-key="name"
          :placeholder="t('components.lyEditor.modules.article.categoryForm.parentPlaceholder')"
          :options="categoryData"
        />
      </UFormField>

      <UFormField
        name="name"
        :label="t('components.lyEditor.modules.article.categoryForm.nameLabel')"
        required
      >
        <UInput
          v-model="formData.name"
          :placeholder="t('components.lyEditor.modules.article.categoryForm.namePlaceholder')"
        />
      </UFormField>

      <UFormField
        name="icon"
        :label="t('components.lyEditor.modules.article.categoryForm.iconLabel')"
      >
        <SelectIcon
          v-model="formData.icon"
          prefix="colorful:"
          :placeholder="t('components.lyEditor.modules.article.categoryForm.iconPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="description"
        :label="t('components.lyEditor.modules.article.categoryForm.descriptionLabel')"
      >
        <UTextarea
          v-model="formData.description"
          :placeholder="
            t('components.lyEditor.modules.article.categoryForm.descriptionPlaceholder')
          "
        />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
