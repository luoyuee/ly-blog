<script setup lang="ts">
import type { HitokotoTypeItem, HitokotoTypeForm } from "#shared/types/hitokoto";
import type { FormSubmitEvent } from "@nuxt/ui";
import { createHitokotoType, updateHitokotoType } from "@/apis/hitokoto";
import { BasicModal } from "@/components/basic-modal";
import { reactive } from "vue";
import { z } from "zod";

const $notify = useNotification();

const emits = defineEmits(["cancel", "submit"]);

const schema = z.object({
  id: z.number().optional(),
  name: z.string({ message: "请输入分类名称" }).min(1, "请输入分类名称"),
  description: z.string().optional()
});

const formData = reactive<HitokotoTypeForm>({
  name: undefined,
  description: undefined
});

const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    formData[key as keyof HitokotoTypeForm] = undefined;
  });
};

const visible = ref(false);

const handleOpen = (data?: HitokotoTypeItem) => {
  resetForm();

  if (data) {
    formData.id = data.id;
    formData.name = data.name;
    formData.description = data.description;
  }

  visible.value = true;
};

defineExpose({
  open: handleOpen
});

const submitting = ref(false);
const formRef = useTemplateRef("formRef");
const handleSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  try {
    submitting.value = true;

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

    emits("submit");
  } catch (error) {
    $notify.error({
      title: "操作失败",
      error
    });
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
</script>
<template>
  <BasicModal v-model:visible="visible" :title="formData.id ? '修改分类' : '新建分类'">
    <UForm
      ref="formRef"
      class="space-y-2"
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
        label="取消"
        color="neutral"
        variant="outline"
        :disabled="submitting"
        @click="handleCancel"
      />
      <UButton label="确认" color="primary" :loading="submitting" @click="handleConfirm" />
    </template>
  </BasicModal>
</template>
