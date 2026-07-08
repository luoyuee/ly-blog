<script setup lang="ts">
import type { HitokotoTypeForm, HitokotoTypeItem } from "#shared/types/hitokoto";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { HitokotoTypeFormModalResult } from "#shared/types/ly-editor";
import { createHitokotoType, updateHitokotoType } from "@/apis/hitokoto";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "@/composables/useForm";
import { computed, watch } from "vue";
import { z } from "zod";

const $notify = useNotification();

const visible = defineModel<boolean>("visible", {
  default: false
});

const props = defineProps({
  mode: {
    type: String as PropType<"create" | "update">,
    default: "create"
  },
  record: {
    type: Object as PropType<HitokotoTypeItem | undefined>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [result: HitokotoTypeFormModalResult];
}>();

const modalTitle = computed(() => {
  return props.mode === "create" ? "新建分类" : "修改分类";
});

const schema = z.object({
  id: z.number().optional(),
  name: z.string({ message: "请输入分类名称" }).min(1, "请输入分类名称"),
  description: z.string().optional()
});

const { formData, formState, resetForm, setForm } = useForm<HitokotoTypeForm>({
  name: undefined,
  description: undefined
});

watch(
  visible,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      const { id, name, description } = props.record;
      setForm({ id, name, description });
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
      await updateHitokotoType({
        id: event.data.id,
        name: event.data.name,
        description: event.data.description
      });

      $notify.success({
        title: "修改成功"
      });
    } else {
      await createHitokotoType({
        name: event.data.name,
        description: event.data.description
      });

      $notify.success({
        title: "创建成功"
      });
    }

    visible.value = false;

    emits("close", {
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
  emits("close", {
    action: "cancelled"
  });
};
</script>
<template>
  <BasicModal v-model:visible="visible" :title="modalTitle">
    <UForm
      ref="formRef"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField name="name" label="分类名称" required>
        <UInput v-model="formData.name" placeholder="请输入分类名称" />
      </UFormField>

      <UFormField name="email" label="分类描述">
        <UTextarea v-model="formData.description" placeholder="请输入分类描述" />
      </UFormField>
    </UForm>

    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        :disabled="formState.submitting"
        @click="handleCancel"
      >
        取消
      </UButton>
      <UButton color="primary" :loading="formState.submitting" @click="handleConfirm">
        确认
      </UButton>
    </template>
  </BasicModal>
</template>
