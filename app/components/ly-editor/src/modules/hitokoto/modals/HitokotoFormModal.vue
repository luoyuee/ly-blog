<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { HitokotoItem, HitokotoForm, HitokotoTypeSelectOption } from "#shared/types/hitokoto";
import { getHitokotoTypeOptions, createHitokoto, updateHitokoto } from "@/apis/hitokoto";
import { useForm } from "@/composables/useForm";
import { BasicModal } from "@/components/basic-modal";
import { z } from "zod";

const $notify = useNotification();

const visible = defineModel<boolean>("visible", {
  default: false
});

const props = defineProps({
  payload: {
    type: Object as PropType<{
      record?: HitokotoItem;
      mode?: "create" | "update";
    }>,
    default: () => ({})
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
  type: z.coerce.number().optional(),
  source: z.string().optional(),
  author: z.string().optional(),
  content: z.string({ message: "请输入内容" }).min(1, "请输入内容")
});

const { formData, formState, resetForm, setForm } = useForm<HitokotoForm>({
  id: undefined,
  type: undefined,
  source: undefined,
  author: undefined,
  content: undefined
});

const modalTitle = computed(() => {
  return props.payload.mode === "update" ? "修改语句" : "添加语句";
});

watch(
  visible,
  (newVal) => {
    if (!newVal) return;

    resetForm();

    if (props.payload.record) {
      const { id, type, source, author, content } = props.payload.record;
      setForm({ id, type, source, author, content });
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
      await updateHitokoto({ id: event.data.id, ...event.data });

      $notify.success({
        title: "修改成功"
      });
    } else {
      await createHitokoto({ ...event.data });

      $notify.success({
        title: "添加成功"
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

const hitokotoTypeOptions = ref<HitokotoTypeSelectOption[]>([]);

onMounted(async () => {
  hitokotoTypeOptions.value = await getHitokotoTypeOptions();
});
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
      <UFormField name="type" label="语句分类">
        <USelect
          v-model="formData.type"
          value-key="id"
          label-key="name"
          placeholder="请选择语句分类"
          :items="hitokotoTypeOptions"
        />
      </UFormField>
      <UFormField name="source" label="语句来源">
        <UInput v-model="formData.source" placeholder="请输入语句来源" />
      </UFormField>
      <UFormField name="author" label="语句作者">
        <UInput v-model="formData.author" placeholder="请输入语句作者" />
      </UFormField>
      <UFormField name="content" label="语句内容" required>
        <UTextarea v-model="formData.content" placeholder="请输入语句内容" />
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
