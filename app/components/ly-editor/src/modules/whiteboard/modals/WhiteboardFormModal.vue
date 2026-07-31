<script setup lang="ts">
import type { WhiteboardItem, WhiteboardFormModalResult } from "#shared/types/ly-editor";
import type { FormSubmitEvent } from "@nuxt/ui";
import { createWhiteboard, updateWhiteboard } from "@/apis/canvas-document";
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
    type: Object as PropType<WhiteboardItem | undefined>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [result: WhiteboardFormModalResult];
}>();

interface FormData {
  id?: number;
  title?: string;
  description?: string;
}

const schema = z.object({
  id: z.number().optional(),
  title: z.string({ message: "请输入白板标题" }).min(1, "请输入白板标题"),
  description: z.string().optional()
});

const { formData, formState, resetForm, setForm } = useForm<FormData>({
  id: undefined,
  title: undefined,
  description: undefined
});

const isEdit = computed(() => {
  return props.mode === "update";
});

const modalTitle = computed(() => {
  return isEdit.value ? "修改白板" : "新建白板";
});

// 监听弹窗显示，初始化表单与回填数据
watch(
  visible,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      const { id, title, description } = props.record;
      setForm({ id, title, description: description ?? undefined });
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

    if (isEdit.value && event.data.id) {
      await updateWhiteboard({
        id: event.data.id,
        title: event.data.title,
        description: event.data.description
      });

      $notify.success({
        title: "修改成功"
      });
    } else {
      await createWhiteboard({
        title: event.data.title,
        description: event.data.description,
        // 新建白板初始数据为空内容
        data: {
          notes: [],
          strokes: [],
          connections: []
        }
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
  <BasicModal
    v-model:visible="visible"
    :title="modalTitle"
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
      <UFormField name="title" label="白板标题" required>
        <UInput v-model="formData.title" placeholder="请输入白板标题" />
      </UFormField>

      <UFormField name="description" label="白板描述">
        <UTextarea v-model="formData.description" placeholder="请输入白板描述" />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
