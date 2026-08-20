<script setup lang="ts">
import type { CalendarItem, CalendarFormModalResult } from "#shared/types/ly-editor";
import type { PropType } from "vue";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "@/composables/useForm";
import { computed, watch } from "vue";
import { z } from "zod";

const $notify = useNotification();

const open = defineModel<boolean>("open", {
  default: false
});

const props = defineProps({
  mode: {
    type: String as PropType<"create" | "update">,
    default: "create"
  },
  record: {
    type: Object as PropType<CalendarItem | undefined>,
    default: undefined
  }
});

const emits = defineEmits<{
  close: [result: CalendarFormModalResult];
}>();

interface FormData {
  id?: number;
  title?: string;
  description?: string;
  color?: string;
}

const schema = z.object({
  id: z.number().optional(),
  title: z.string({ message: "请输入日历标题" }).min(1, "请输入日历标题"),
  description: z.string().optional(),
  color: z.string().optional()
});

const { formData, formState, resetForm, setForm } = useForm<FormData>({
  id: undefined,
  title: undefined,
  description: undefined,
  color: undefined
});

const isEdit = computed(() => {
  return props.mode === "update";
});

const modalTitle = computed(() => {
  return isEdit.value ? "修改日历" : "新建日历";
});

// 监听弹窗显示，初始化表单与回填数据
watch(
  open,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.record) {
      const { id, title, description, color } = props.record;
      setForm({
        id,
        title,
        description: description ?? undefined,
        color: color ?? undefined
      });
    }
  },
  {
    immediate: true
  }
);

const formRef = useTemplateRef("formRef");

const handleSubmit = async (event: { data: z.output<typeof schema> }) => {
  try {
    formState.submitting = true;

    // 暂未接入接口，提交仅作占位，后续在此调用 create/update 接口
    $notify.success({
      title: isEdit.value ? "修改成功" : "创建成功"
    });

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
      <UFormField name="title" label="日历标题" required>
        <UInput v-model="formData.title" placeholder="请输入日历标题" />
      </UFormField>

      <UFormField name="description" label="日历描述">
        <UTextarea v-model="formData.description" placeholder="请输入日历描述" />
      </UFormField>

      <UFormField name="color" label="预设颜色">
        <UInput v-model="formData.color" placeholder="如 #3b82f6，留空使用默认色" />
      </UFormField>
    </UForm>
  </BasicModal>
</template>
