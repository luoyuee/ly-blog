<script setup lang="ts">
import { uploadHitokotoData } from "@/apis/hitokoto";
import { reactive } from "vue";
import { BasicModal } from "@/components/basic-modal";

const $notify = useNotification();

const emits = defineEmits(["cancel", "submit"]);

const formData = reactive<{
  filename?: string;
  file?: File;
}>({
  filename: undefined,
  file: undefined
});

const visible = ref(false);

const handleOpen = () => {
  formData.filename = undefined;
  formData.file = undefined;

  visible.value = true;
};

defineExpose({
  open: handleOpen
});

const submitting = ref(false);
const uploadProgress = ref<number>(0);

const handleConfirm = async () => {
  if (formData.file) {
    try {
      submitting.value = true;
      uploadProgress.value = 0;

      await uploadHitokotoData(formData.file, (e) => {
        uploadProgress.value = Math.round((e.progress ?? 0) * 100);

        if (uploadProgress.value >= 100) {
          uploadProgress.value = 100;
        }
      });

      $notify.success({
        title: "导入成功"
      });

      emits("submit");

      setTimeout(() => {
        visible.value = false;
      }, 500);
    } catch (error) {
      $notify.error({
        title: "操作失败",
        error
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
  <BasicModal
    v-model:visible="visible"
    title="导入数据"
    :submitting="submitting"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <div>
      <UInput
        v-model="formData.filename"
        class="w-full"
        type="file"
        accept=".json"
        :disabled="submitting"
        @change="handleChange"
      />
      <UProgress v-if="submitting" v-model="uploadProgress" status class="mt-4" />
    </div>
  </BasicModal>
</template>
