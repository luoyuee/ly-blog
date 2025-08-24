<script setup lang="ts">
import type { UploadImageItem } from "@/apis/image/models";
import type { ScrollbarInstance } from "element-plus";
import type { AxiosProgressEvent } from "axios";
import { InputTagArea } from "@/components/form/input";
import { BasicModal } from "@/components/basic-modal";
import { uploadImageFile } from "@/apis/image";
import { ElMessageBox } from "element-plus";
import { ref, watch } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  folder: {
    type: Number,
    required: true
  }
});

watch(
  () => props.visible,
  () => {
    if (props.visible) fileList.value = [];
  }
);

const emits = defineEmits(["update:visible", "uploaded"]);

const inputRef = ref<HTMLInputElement | null>(null);
const formRef = ref<HTMLFormElement | null>(null);
const fileList = ref<UploadImageItem[]>([]);

const previewSrcList = computed(() => {
  return fileList.value.map((item) => item.preview);
});

const clickInputFile = (): void => {
  inputRef.value?.click();
};

const inputFileChange = (e: any): void => {
  console.log(e);
  const count = e.target.files.length;
  if (count > 0) {
    for (let i = 0; i < count; i++) {
      console.log(e.target.files[i]);
      fileList.value.push({
        file: e.target.files[i],
        preview: window.URL.createObjectURL(e.target.files[i]),
        tags: [],
        status: "waiting",
        upload_progress: 0
      });
    }
  }
  formRef.value?.reset();
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
      upload_progress: 0
    });
  }
};

const uploadListRef = ref<ScrollbarInstance | null>(null);
const scrollToUploadElement = (index: number): void => {
  if (uploadListRef.value) {
    const li: NodeListOf<HTMLLIElement> = uploadListRef.value.wrapRef!.querySelectorAll("li");
    console.log(li, li[index].offsetTop);
    if (li[index]) {
      uploadListRef.value.setScrollTop(li[index].offsetTop);
    }
  }
};

const statusMap: Record<
  string,
  {
    label?: string;
    color: string;
    progress?: "success" | "exception" | "warning";
  }
> = {
  waiting: { label: "等待上传", color: "#333" },
  uploading: { color: "#1890ff" },
  succeed: { label: "上传成功", color: "#52c41a", progress: "success" },
  failed: { label: "上传失败", color: "#d9363e", progress: "exception" }
};

const uploadFile = async (): Promise<void> => {
  if (props.folder !== undefined) {
    for (let i = 0, l = fileList.value.length; i < l; i++) {
      if (fileList.value[i].status !== "succeed") {
        console.log(fileList.value[i]);
        scrollToUploadElement(i);
        fileList.value[i].status = "uploading";
        await uploadImageFile(
          {
            folder: props.folder,
            file: fileList.value[i].file,
            tags: fileList.value[i].tags
          },
          (e: AxiosProgressEvent) => {
            fileList.value[i].upload_progress = Math.round((e.progress ?? 0) * 100);
          }
        )
          .then(() => {
            fileList.value[i].status = "succeed";
          })
          .catch(() => {
            fileList.value[i].status = "failed";
            fileList.value[i].upload_progress = 0;
          });
      }
    }
    emits("uploaded");
  }
};

const clearFileList = (): void => {
  fileList.value = [];
};

const handleClose = (): void => {
  fileList.value = [];
  emits("update:visible", false);
};

const beforeClose = (done: Function): void => {
  for (let i = 0; i < fileList.value.length; i++) {
    if (fileList.value[i].status === "waiting") {
      ElMessageBox.confirm("还有未上传的图片，关闭后将清空列表", {
        title: "确认关闭？",
        type: "warning",
        confirmButtonText: "关闭"
      })
        .then(() => {
          done();
        })
        .catch(() => {});
      return;
    }
  }
  done();
};
</script>

<template>
  <BasicModal
    title="上传图片"
    :visible="props.visible"
    class="upload-images-modal"
    ok-text="上传"
    :before-close="beforeClose"
    @cancel="handleClose"
    @ok="uploadFile"
  >
    <div class="header">
      <el-button type="primary" @click="clickInputFile">选择图片</el-button>
      <form ref="formRef">
        <input
          ref="inputRef"
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          @change="inputFileChange"
        />
      </form>
      <el-button @click="clearFileList">清空列表</el-button>
    </div>
    <ul
      v-if="fileList.length > 0"
      class="upload-list"
      @dragenter="dragenter"
      @dragover="dragover"
      @drop="drop"
    >
      <el-scrollbar ref="uploadListRef">
        <li v-for="(item, index) in fileList" :key="index">
          <el-image
            style="width: 100px; min-height: 70px"
            :src="item.preview"
            :preview-src-list="previewSrcList"
            :initial-index="index"
            fit="cover"
          />
          <div class="flex-1 pl-2">
            <p class="mb-2">
              {{ item.file.name }}
            </p>
            <InputTagArea v-model:value="item.tags" />
            <el-progress
              :percentage="item.upload_progress"
              class="mt-1"
              :status="statusMap[item.status].progress"
            >
              <span class="status-text" :style="{ color: statusMap[item.status].color }">
                {{
                  item.status === "uploading"
                    ? item.upload_progress + "%"
                    : statusMap[item.status].label
                }}
              </span>
            </el-progress>
          </div>
        </li>
      </el-scrollbar>
    </ul>
    <div
      v-else
      class="upload-list flex items-center justify-center"
      @dragenter="dragenter"
      @dragover="dragover"
      @drop="drop"
    >
      <el-empty image="/images/no_pictures.svg" description="暂无图片" />
    </div>
  </BasicModal>
</template>
<style lang="scss">
.upload-images-modal {
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;

    form {
      display: none;
    }
  }

  .upload-list {
    height: 400px;
    list-style: none;
    border: 1px solid var(--color-neutral-3);
    border-radius: 2px;
    border: 1px solid #dcdfe6;

    li {
      padding: 12px 12px;
      user-select: none;
      display: flex;

      .el-progress {
        .status-text {
          font-size: 0.75rem;
        }
      }
    }

    li:nth-child(n + 2) {
      border-top: 1px dashed #f0f0f0;
    }
  }
}
</style>
