<script setup lang="ts">
import type { ImageFolder } from "#shared/types/image";
import { createImageFolder, updateImageFolder } from "@/apis/image";
import { z } from "zod";
import { reactive } from "vue";
import type { FormSubmitEvent } from "@nuxt/ui";
import { BasicModal } from "@/components/basic-modal";

interface FormData {
  id?: number;
  name?: string;
  description?: string;
}

const toast = useToast();

const emits = defineEmits(["cancel", "submit"]);

const schema = z.object({
  id: z.number().optional(),
  name: z.string({ message: "请输入目录名称" }).min(1, "请输入目录名称"),
  description: z.string().optional()
});

const formData = reactive<FormData>({
  name: undefined,
  description: undefined
});

const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    formData[key as keyof FormData] = undefined;
  });
};

const visible = ref(false);

const handleOpen = (data?: ImageFolder) => {
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
      await updateImageFolder({
        id: event.data.id,
        name: event.data.name,
        description: event.data.description
      });

      toast.add({
        title: "修改成功",
        color: "success"
      });
    } else {
      await createImageFolder({
        name: event.data.name,
        description: event.data.description
      });

      toast.add({
        title: "创建成功",
        color: "success"
      });
    }

    visible.value = false;

    emits("submit");
  } catch {
    toast.add({
      title: "操作失败",
      color: "error"
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
  <BasicModal v-model:visible="visible" :title="formData.id ? '修改目录' : '创建目录'">
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

      <UFormField name="email" label="目录描述">
        <UTextarea v-model="formData.description" placeholder="请输入目录描述" />
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
