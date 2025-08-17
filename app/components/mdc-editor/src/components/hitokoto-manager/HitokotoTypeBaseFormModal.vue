<script setup lang="ts">
import type { HitokotoTypeItem, HitokotoTypeForm } from "@/types/hitokoto";
import type { FormSubmitEvent } from "@nuxt/ui";
import { createHitokotoType, updateHitokotoType } from "@/apis/hitokoto";
import { AxiosError } from "axios";
import { reactive } from "vue";
import { z } from "zod";

const toast = useToast();

const emits = defineEmits(["cancel", "submit"]);

const schema = z.object({
  id: z.number().optional(),
  name: z.string({ message: "请输入分类名称" }).min(1, "请输入分类名称"),
  description: z.string().optional(),
});

const formData = reactive<HitokotoTypeForm>({
  name: undefined,
  description: undefined,
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
      await updateHitokotoType({
        id: event.data.id,
        name: event.data.name,
        description: event.data.description,
      });

      toast.add({
        title: "修改成功",
        color: "success",
      });
    } else {
      await createHitokotoType({
        name: event.data.name,
        description: event.data.description,
      });

      toast.add({
        title: "创建成功",
        color: "success",
      });
    }

    visible.value = false;

    emits("submit");
  } catch (error) {
    let title = "操作失败";
    if (error instanceof AxiosError) {
      title = `操作失败：${error.response?.data?.message ?? error.message}`;
    }

    toast.add({
      title,
      color: "error",
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
        <UFormField name="name" label="分类名称" required>
          <UInput
            class="w-full"
            v-model="formData.name"
            placeholder="请输入分类名称"
          />
        </UFormField>

        <UFormField name="email" label="分类描述">
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
