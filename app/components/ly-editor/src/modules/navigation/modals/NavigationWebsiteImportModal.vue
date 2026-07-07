<script setup lang="ts">
import type { NavigationWebsiteImportModalResult } from "#shared/types/ly-editor";
import { importNavigationWebsiteData } from "@/apis/navigation-website";
import { BasicModal } from "@/components/basic-modal";
import { useForm } from "@/composables/useForm";

const $notify = useNotification();

const visible = defineModel<boolean>("visible", {
  default: false
});

const emits = defineEmits<{
  resolve: [result: NavigationWebsiteImportModalResult];
}>();

const { formData, formState, resetForm, setFieldValue } = useForm<{
  filename?: string;
  file?: File;
}>({
  filename: undefined,
  file: undefined
});

const uploadProgress = ref<number>(0);

watch(visible, (newVal) => {
  if (!newVal) return;

  resetForm();
  uploadProgress.value = 0;
});

const handleConfirm = async () => {
  if (!formData.file) return;

  try {
    formState.submitting = true;
    uploadProgress.value = 0;

    const result = await importNavigationWebsiteData(formData.file, (e) => {
      uploadProgress.value = Math.round((e.progress ?? 0) * 100);

      if (uploadProgress.value >= 100) {
        uploadProgress.value = 100;
      }
    });

    $notify.success({
      title: "导入成功",
      description: `共 ${result.total} 条，新增 ${result.created} 条，跳过 ${result.skipped} 条`
    });

    emits("resolve", {
      action: "imported"
    });

    setTimeout(() => {
      visible.value = false;
    }, 500);
  } catch (error) {
    $notify.error({
      title: "操作失败",
      error
    });
  } finally {
    formState.submitting = false;
  }
};

const handleCancel = () => {
  visible.value = false;
  emits("resolve", {
    action: "cancelled"
  });
};

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    setFieldValue("file", target.files[0]);
  } else {
    setFieldValue("file", undefined);
  }
};
</script>
<template>
  <BasicModal
    v-model:visible="visible"
    title="导入导航网站"
    :submitting="formState.submitting"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <div>
      <UInput
        v-model="formData.filename"
        class="w-full"
        type="file"
        accept=".json"
        :disabled="formState.submitting"
        @change="handleChange"
      />
      <UProgress v-if="formState.submitting" v-model="uploadProgress" status class="mt-4" />
    </div>
  </BasicModal>
</template>
