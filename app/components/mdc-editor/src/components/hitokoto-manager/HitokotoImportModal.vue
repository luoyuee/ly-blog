<script setup lang="ts">
import type { HitokotoTypeItem } from "@/types/hitokoto";
import { uploadHitokotoData } from "@/apis/hitokoto";
import { AxiosError } from "axios";
import { reactive } from "vue";

const toast = useToast();

const emits = defineEmits(["cancel", "submit"]);

const formData = reactive<{
  filename?: string;
  file?: File;
}>({
  filename: undefined,
  file: undefined,
});

const visible = ref(false);

const handleOpen = (data?: HitokotoTypeItem) => {
  formData.filename = undefined;
  formData.file = undefined;

  visible.value = true;
};

defineExpose({
  open: handleOpen,
});

const submitting = ref(false);
const uploadProgress = ref<number | null>(0);

const handleConfirm = async () => {
  if (formData.file) {
    try {
      submitting.value = true;
      uploadProgress.value = 0;
      await uploadHitokotoData(formData.file, (e) => {
        uploadProgress.value = Math.round((e.progress ?? 0) * 100);

        if (uploadProgress.value >= 100) {
          uploadProgress.value = null;
        }
      });

      toast.add({
        title: "导入成功",
        color: "success",
      });

      emits("submit");

      setTimeout(() => {
        visible.value = false;
      }, 500);
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
  }
};

const handleCancel = () => {
  visible.value = false;
  emits("cancel");
};

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    formData.file = target.files[0];
  } else {
    formData.file = undefined;
  }
};
</script>
<template>
  <UModal
    v-model:open="visible"
    title="导入数据"
    :ui="{ footer: 'justify-end', overlay: 'bg-elevated/40' }"
  >
    <template #body>
      <div>
        <UInput
          class="w-full"
          type="file"
          v-model="formData.filename"
          accept=".json"
          :disabled="submitting"
          @change="handleChange"
        />
        <UProgress
          v-if="submitting"
          v-model="uploadProgress"
          status
          class="mt-4"
        />
      </div>
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
