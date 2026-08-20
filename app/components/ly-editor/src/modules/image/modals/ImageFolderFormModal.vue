<script setup lang="ts">
import type { ImageFolder } from "#shared/types/image";
import type { FormSubmitEvent } from "@nuxt/ui";
import { createImageFolder, updateImageFolder } from "@/apis/image";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "@/composables/useForm";
import { watch } from "vue";
import { z } from "zod";

const $notify = useNotification();

const open = defineModel<boolean>("open", {
  default: false
});

const props = defineProps({
  record: {
    type: Object as PropType<ImageFolder | undefined>,
    default: undefined
  }
});

interface FormData {
  id?: number;
  name?: string;
  description?: string;
}

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
  name: z.string({ message: "请输入目录名称" }).min(1, "请输入目录名称"),
  description: z.string().optional()
});

const { formData, formState, resetForm, setForm } = useForm<FormData>({
  id: undefined,
  name: undefined,
  description: undefined
});

// 监听弹窗显示，初始化表单与回填数据
watch(
  open,
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
      await updateImageFolder({
        id: event.data.id,
        name: event.data.name,
        description: event.data.description
      });

      $notify.success({
        title: "修改成功"
      });
    } else {
      await createImageFolder({
        name: event.data.name,
        description: event.data.description
      });

      $notify.success({
        title: "创建成功"
      });
    }

    open.value = false;

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
  open.value = false;
  emits("close", {
    action: "cancelled"
  });
};
</script>
<template>
  <BasicModal
    v-model:open="open"
    :title="formData.id ? '修改目录' : '创建目录'"
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
      <UFormField name="name" label="目录名称" required>
        <UInput v-model="formData.name" placeholder="请输入目录名称" />
      </UFormField>

      <UFormField name="description" label="目录描述">
        <UTextarea v-model="formData.description" placeholder="请输入目录描述" />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
