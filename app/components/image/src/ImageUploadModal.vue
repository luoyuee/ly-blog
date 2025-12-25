<script setup lang="ts">
import type { UploadImageItem } from "@/apis/image/models";
import type { ImageFolder } from "#shared/types/image";
import type { AxiosProgressEvent } from "axios";
import { SelectLocalFile } from "@/components/form/select";
import { InputTagArea } from "@/components/form/input";
import { BasicModal } from "@/components/basic-modal";
import { uploadImageFile } from "@/apis/image";
import { ref } from "vue";
import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";

const $msgBox = useMessageBox();

const props = defineProps({
  folder: {
    type: Object as PropType<ImageFolder>,
    required: true
  }
});

const visible = ref(false);

const emits = defineEmits(["submit", "close", "uploaded", "failed"]);

const fileList = ref<UploadImageItem[]>([]);

const handleFileChange = (files: File[]): void => {
  files.forEach((file) => {
    fileList.value.push({
      file,
      preview: window.URL.createObjectURL(file),
      tags: [],
      status: "waiting",
      upload_progress: 0
    });
  });
};

const dragenter = (e: DragEvent): void => {
  e.preventDefault();
};

const dragover = (e: DragEvent): void => {
  e.preventDefault();
};

const drop = (e: DragEvent): void => {
  e.preventDefault();
  e.stopPropagation();

  if (!e.dataTransfer) return;

  for (let i = 0, l = e.dataTransfer.files.length; i < l; i++) {
    fileList.value.push({
      file: e.dataTransfer.files[i]!,
      preview: window.URL.createObjectURL(e.dataTransfer.files[i]!),
      tags: [],
      status: "waiting",
      upload_progress: 0
    });
  }
};

const statusMap: Record<
  string,
  {
    label?: string;
    color: "primary" | "success" | "error" | "neutral";
    progress?: "success" | "exception" | "warning";
  }
> = {
  waiting: { label: "等待上传", color: "neutral" },
  uploading: { label: "上传中", color: "primary" },
  succeed: { label: "上传成功", color: "success", progress: "success" },
  failed: { label: "上传失败", color: "error", progress: "exception" }
};

const uploading = ref(false);
const handleConfirm = async (): Promise<void> => {
  if (!props.folder) return;
  uploading.value = true;

  for (const fileItem of fileList.value) {
    if (fileItem.status !== "succeed") {
      console.log(fileItem);

      fileItem.status = "uploading";

      try {
        await uploadImageFile(
          {
            folder: props.folder.id,
            file: fileItem.file,
            tags: fileItem.tags
          },
          (e: AxiosProgressEvent) => {
            fileItem.upload_progress = Math.round((e.progress ?? 0) * 100);
          }
        );

        fileItem.status = "succeed";
        emits("uploaded", unref(fileItem));
      } catch {
        fileItem.status = "failed";
        fileItem.upload_progress = 0;
        emits("failed", unref(fileItem));
      }
    }
  }

  uploading.value = false;
  emits("submit", unref(fileList.value));
};

const clearFileList = (): void => {
  fileList.value = [];
};

const handleClose = () => {
  emits("close", unref(fileList.value));
};

const handleCancel = () => {
  handleBeforeClose(() => {
    visible.value = false;
  });
};

const uploadListRef = useTemplateRef("uploadListRef");
const dismissible = ref(true);
const handlePreview = (index: number) => {
  if (!uploadListRef.value) return;

  const viewer = new Viewer(uploadListRef.value, {
    hidden: () => {
      dismissible.value = true;
      viewer.destroy();
    }
  });
  viewer.view(index);
  dismissible.value = false;
};

const handleBeforeClose = (done: () => void) => {
  const waitingItem = fileList.value.find((item) => item.status === "waiting");

  if (waitingItem) {
    $msgBox.warning({
      title: "确认关闭？",
      message: "还有未上传的图片，关闭后将清空列表",
      onConfirm() {
        done();
      }
    });
  } else {
    done();
  }
};

const handleDeleteItem = (index: number) => {
  fileList.value.splice(index, 1);
};

const handleOpen = () => {
  fileList.value = [];

  visible.value = true;
};

defineExpose({
  open: handleOpen
});
</script>
<template>
  <BasicModal
    v-model:visible="visible"
    content-class="max-w-[640px]"
    :title="`上传图片至「${props.folder.name}」`"
    :before-close="handleBeforeClose"
    :modal="false"
    :dismissible="dismissible"
    @close="handleClose"
  >
    <div class="flex items-center justify-between mb-4">
      <SelectLocalFile multiple @change="handleFileChange">
        <template #default="{ triggerSelect }">
          <UButton icon="i-lucide-folder" @click="triggerSelect"> 选择图片 </UButton>
        </template>
      </SelectLocalFile>

      <UButton icon="i-lucide-trash-2" color="error" variant="outline" @click="clearFileList">
        清空列表
      </UButton>
    </div>

    <ul
      v-if="fileList.length > 0"
      ref="uploadListRef"
      class="h-100 overflow-y-auto slim-scrollbar space-y-4"
      @dragenter="dragenter"
      @dragover="dragover"
      @drop="drop"
    >
      <li v-for="(item, index) in fileList" :key="index" class="flex hover:bg-white/5">
        <img
          class="w-24 h-20 rounded bg-white object-cover"
          :src="item.preview"
          @click="handlePreview(index)"
        />
        <div class="flex-1 px-2 flex flex-col justify-between overflow-hidden">
          <div class="flex items-center justify-between gap-2">
            <p class="truncate">
              {{ item.file.name }}
            </p>
            <UButton
              icon="i-lucide-trash-2"
              size="sm"
              color="error"
              variant="link"
              @click="handleDeleteItem(index)"
            />
          </div>

          <InputTagArea v-model:value="item.tags" />

          <div class="flex gap-2 items-center justify-between">
            <UProgress
              v-model="item.upload_progress"
              class="flex-1"
              size="sm"
              :color="statusMap[item.status]!.color"
            />
            <span
              class="shrink-0 text-xs min-w-[48px] text-right"
              :style="{
                color: `var(--ui-${statusMap[item.status]!.color})`
              }"
            >
              {{
                item.status === "uploading"
                  ? item.upload_progress + "%"
                  : statusMap[item.status]!.label
              }}
            </span>
          </div>
        </div>
      </li>
    </ul>

    <div
      v-else
      class="flex items-center justify-center h-100 bg-white/5 rounded"
      @dragenter="dragenter"
      @dragover="dragover"
      @drop="drop"
    >
      <UIcon name="i-lucide-upload" :size="48" />
    </div>

    <template #footer>
      <UButton :disabled="uploading" @click="handleCancel"> 取消 </UButton>
      <UButton color="primary" :loading="uploading" @click="handleConfirm"> 上传 </UButton>
    </template>
  </BasicModal>
</template>
