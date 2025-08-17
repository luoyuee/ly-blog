<script setup lang="ts">
import type { UploadImageItem } from "@/apis/image/models";
import type { AxiosProgressEvent } from "axios";
import { InputTagArea } from "@/components/input";
import { uploadImageFile } from "@/apis/image";
import { ref } from "vue";
import { useMessageBox } from "@/components/message-box";
import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";

const props = defineProps({
  folder: {
    type: Number,
    required: true,
  },
});

const visible = ref(false);

const emits = defineEmits(["cancel", "submit"]);

const inputRef = useTemplateRef("inputRef");

const fileList = ref<UploadImageItem[]>([]);

const clickInputFile = (): void => {
  inputRef.value?.click();
};

const inputFileChange = (e: any): void => {
  console.log(e);
  let count = e.target.files.length;
  if (count > 0) {
    for (let i = 0; i < count; i++) {
      console.log(e.target.files[i]);
      fileList.value.push({
        file: e.target.files[i],
        preview: window.URL.createObjectURL(e.target.files[i]),
        tags: [],
        status: "waiting",
        upload_progress: 0,
      });
    }
  }
};

const dragenter = (e: any): void => {
  e.preventDefault();
};

const dragover = (e: any): void => {
  e.preventDefault();
};

const drop = (e: any): void => {
  e.preventDefault();
  e.stopPropagation();
  for (let i = 0, l = e.dataTransfer.files.length; i < l; i++) {
    console.log(e.dataTransfer.files[i]);
    fileList.value.push({
      file: e.dataTransfer.files[i],
      preview: window.URL.createObjectURL(e.dataTransfer.files[i]),
      tags: [],
      status: "waiting",
      upload_progress: 0,
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
  failed: { label: "上传失败", color: "error", progress: "exception" },
};

const handleConfirm = async (): Promise<void> => {
  if (props.folder !== undefined) {
    for (let i = 0, l = fileList.value.length; i < l; i++) {
      if (fileList.value[i].status !== "succeed") {
        console.log(fileList.value[i]);

        fileList.value[i].status = "uploading";

        try {
          await uploadImageFile(
            {
              folder: props.folder,
              file: fileList.value[i].file,
              tags: fileList.value[i].tags,
            },
            (e: AxiosProgressEvent) => {
              fileList.value[i].upload_progress = Math.round(
                (e.progress ?? 0) * 100
              );
            }
          );

          fileList.value[i].status = "succeed";
        } catch {
          fileList.value[i].status = "failed";
          fileList.value[i].upload_progress = 0;
        }
      }
    }
    emits("submit");
  }
};

const clearFileList = (): void => {
  fileList.value = [];
};

const handleCancel = () => {
  if (handleBeforeClose(false)) {
    emits("cancel");
  }
};

const handleOpen = () => {
  visible.value = true;
};

defineExpose({
  open: handleOpen,
});

const uploading = ref(false);

const uploadListRef = useTemplateRef("uploadListRef");
const dismissible = ref(true);
const handlePreview = (index: number) => {
  if (!uploadListRef.value) return;

  const viewer = new Viewer(uploadListRef.value, {
    hidden: () => {
      dismissible.value = true;
      viewer.destroy();
    },
  });
  viewer.view(index);
  dismissible.value = false;
};

const handleBeforeClose = (e: boolean) => {
  console.log(e);
  if (e === false) {
    for (let i = 0; i < fileList.value.length; i++) {
      if (fileList.value[i].status === "waiting") {
        const msg = useMessageBox({
          title: "确认关闭？",
          message: "还有未上传的图片，关闭后将清空列表",
          type: "warning",
          confirmButtonText: "关闭",
          onConfirm() {
            visible.value = false;
          },
        });

        msg.show();
      }
      return false;
    }
    visible.value = false;
  }

  return true;
};

const handleDeleteItem = (index: number) => {
  fileList.value.splice(index, 1);
};
</script>
<template>
  <UModal
    title="上传图片"
    :open="visible"
    :ui="{
      footer: 'justify-end',
      overlay: 'bg-elevated/40',
      content: 'max-w-2xl',
    }"
    :dismissible="dismissible"
    :modal="false"
    @update:open="handleBeforeClose"
  >
    <template #body>
      <div class="flex items-center justify-between mb-4">
        <UButton icon="i-lucide-folder" @click="clickInputFile">
          选择图片
        </UButton>

        <input
          class="hidden"
          ref="inputRef"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
          multiple
          @change="inputFileChange"
        />

        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="outline"
          @click="clearFileList"
        >
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
        <li
          v-for="(item, index) in fileList"
          :key="index"
          class="flex hover:bg-white/5"
        >
          <img
            class="w-24 h-20 rounded bg-white object-cover"
            :src="item.preview"
            @click="handlePreview(index)"
          />
          <div
            class="flex-1 px-2 flex flex-col justify-between overflow-hidden"
          >
            <div class="flex items-center justify-between gap-2">
              <p class="truncate">
                {{ item.file.name }}
              </p>
              <UButton
                icon="i-lucide-trash-2"
                size="xs"
                variant="link"
                color="error"
                @click="handleDeleteItem(index)"
              />
            </div>

            <InputTagArea v-model:value="item.tags" />

            <div class="flex gap-2 items-center justify-between">
              <UProgress
                v-model="item.upload_progress"
                :color="statusMap[item.status].color"
              />
              <span
                class="shrink-0 text-xs"
                :style="{
                  color: `var(--ui-${statusMap[item.status].color})`,
                }"
              >
                {{
                  item.status === "uploading"
                    ? item.upload_progress + "%"
                    : statusMap[item.status].label
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
        <Icon name="i-lucide-upload" :size="48" />
      </div>
    </template>

    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="outline"
        @click="handleCancel"
        :disabled="uploading"
      />
      <UButton
        label="上传"
        color="primary"
        @click="handleConfirm"
        :loading="uploading"
      />
    </template>
  </UModal>
</template>
