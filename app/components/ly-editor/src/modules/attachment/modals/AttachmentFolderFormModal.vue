<script setup lang="ts">
import type { AttachmentFolderForm } from "#shared/types/attachment";
import type { FormSubmitEvent } from "@nuxt/ui";
import type {
  AttachmentFolderFormModalPayload,
  AttachmentFolderFormModalResult
} from "#shared/types/ly-editor";
import { createAttachmentFolder, updateAttachmentFolder } from "@/apis/attachment";
import { BasicModal } from "@/components/basic-modal";
import { SelectIcon } from "@/components/form/select";
import { useForm } from "@/composables/useForm";
import { computed, watch } from "vue";
import { z } from "zod";

const $notify = useNotification();

const visible = defineModel<boolean>("visible", {
  default: false
});

const props = defineProps({
  payload: {
    type: Object as PropType<AttachmentFolderFormModalPayload>,
    default: () => ({
      mode: "create",
      record: undefined
    })
  }
});

const emits = defineEmits<{
  resolve: [result: AttachmentFolderFormModalResult];
}>();

const modalTitle = computed(() => {
  return props.payload.mode === "update" ? "编辑附件目录" : "新建附件目录";
});

const schema = z.object({
  id: z.number().optional(),
  name: z.string({ message: "请输入目录名称" }).min(1, "请输入目录名称"),
  icon: z.string().optional(),
  description: z.string().optional()
});

const { formData, formState, resetForm, setForm } = useForm<AttachmentFolderForm>({
  id: undefined,
  name: undefined,
  icon: undefined,
  description: undefined
});

watch(
  visible,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.payload.record) {
      const { id, name, icon, description } = props.payload.record;
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
      await updateAttachmentFolder({
        id: event.data.id,
        name: event.data.name,
        icon: event.data.icon,
        description: event.data.description
      });

      $notify.success({
        title: "修改成功"
      });
    } else {
      await createAttachmentFolder({
        name: event.data.name,
        icon: event.data.icon,
        description: event.data.description
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
  <BasicModal v-model:visible="visible" :title="modalTitle">
    <UForm
      ref="formRef"
      :schema="schema"
      :state="formData"
      :validate-on-input-delay="100"
      @submit="handleSubmit"
    >
      <UFormField name="name" label="目录名称" required>
        <UInput v-model="formData.name" placeholder="请输入目录名称" />
      </UFormField>

      <UFormField name="icon" label="目录图标">
        <SelectIcon v-model="formData.icon" placeholder="请选择目录图标" />
      </UFormField>

      <UFormField name="description" label="目录描述">
        <UTextarea v-model="formData.description" placeholder="请输入目录描述" />
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
