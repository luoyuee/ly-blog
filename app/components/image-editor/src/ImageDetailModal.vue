<script setup lang="ts">
import type { Image, ImageItem } from "#shared/types/image";
import { InputTagArea } from "@/components/form/input";
import { Copyable } from "@/components/typography";
import { BasicModal } from "@/components/basic-modal";
import { ElMessage } from "element-plus";
import { ref, reactive } from "vue";
import { downloadImageFile, deleteImageFile, updateImageTags, getImageDetail } from "@/apis/image";
import dayjs from "dayjs";
import numeral from "numeral";

const state = reactive<{
  visible: boolean;
  submitting: boolean;
  deleting: boolean;
  loading: boolean;
  downloading: boolean;
  url: string;
}>({
  visible: false,
  submitting: false,
  deleting: false,
  loading: false,
  downloading: false,
  url: ""
});

const emits = defineEmits(["deleted"]);

const preview = reactive<{
  width: number;
  top: number;
  left: number;
  allowMove: boolean;
  containerWidth: number;
  containerHeight: number;
}>({
  width: 600,
  top: 0,
  left: 0,
  allowMove: false,
  containerWidth: 600,
  containerHeight: 500
});

const image = ref<Image | null>(null);

const movePreview = (e: any): void => {
  if (preview.allowMove) {
    preview.top += e.movementY;
    preview.left += e.movementX;
  }
};

const scalePreview = (e: any): void => {
  if (e.deltaY > 0) {
    preview.width += 20;
  } else {
    preview.width -= 20;
  }
};

const handleCancel = (): void => {
  state.visible = false;
};

// 更新标签
const handleUpdateTags = async (): Promise<void> => {
  if (!image.value) return;

  try {
    state.submitting = true;
    await updateImageTags({
      id: image.value.id,
      tags: image.value.tags
    });

    getImageDetail(image.value.id).then((res) => {
      if (image.value) {
        image.value.tags = res.tags;
        image.value.updated_at = res.updated_at;
        image.value.updated_by = res.updated_by;
      }
    });

    ElMessage.success("更新完成");
  } catch {
    ElMessage.error("更新失败");
  } finally {
    state.submitting = false;
  }
};

// 下载图片
const handleDownload = async (format?: "webp" | "jpg" | "png"): Promise<void> => {
  if (image.value === null) return;
  state.downloading = true;
  try {
    const response = await downloadImageFile(image.value.id, format);
    const a = document.createElement("a");
    a.download = `${image.value.hash}.${format ?? image.value.format}`;
    a.href = window.URL.createObjectURL(response);
    a.click();
    a.remove();
  } catch {
    ElMessage.error("下载失败");
  } finally {
    state.downloading = false;
  }
};

// 删除图片
const handleDelete = async (): Promise<void> => {
  if (!image.value) return;

  try {
    state.deleting = true;

    await deleteImageFile(image.value.id);

    emits("deleted", image.value.id);

    ElMessage.success("删除成功");
    state.visible = false;
  } catch {
    ElMessage.error("删除失败");
  } finally {
    state.deleting = false;
  }
};

// 计算预览图片大小
const calcPreviewSize = (width: number, height: number): void => {
  let w = width;

  if (height > preview.containerHeight) {
    w = (preview.containerHeight / height) * width;
  }

  if (w > preview.containerWidth) {
    w = preview.containerWidth;
  }

  preview.width = w;
  preview.left = (preview.containerWidth - w) / 2;
  preview.top = (preview.containerHeight - (w / width) * height) / 2;
};

onMounted(() => {
  state.url = window.location.origin;
});

const show = (e: ImageItem): void => {
  state.visible = true;
  state.loading = true;
  preview.width = 600;
  preview.top = 0;
  preview.left = 0;

  getImageDetail(e.id).then((res) => {
    image.value = res;

    calcPreviewSize(image.value.width, image.value.height);

    state.loading = false;
  });
};

defineExpose({ show });
</script>

<template>
  <BasicModal
    :visible="state.visible"
    title="原图预览"
    destroy-on-close
    body-class="image-preview-modal"
    :width="1080"
    @cancel="handleCancel"
  >
    <div v-if="state.loading">
      <el-skeleton style="width: 100%; height: 300px" animated loading>
        <template #template>
          <div class="flex">
            <el-skeleton-item variant="image" style="width: 380px; height: 280px" />
            <div class="flex-1 ml-4">
              <el-skeleton :rows="6" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
    <div v-else-if="image" class="image-preview-content">
      <div
        class="image-wrap"
        :style="{
          width: preview.containerWidth + 'px',
          height: preview.containerHeight + 'px'
        }"
        ondragstart="return false"
        @mousewheel="scalePreview"
        @mousemove="movePreview"
        @mousedown="preview.allowMove = true"
        @mouseup="preview.allowMove = false"
        @mouseleave="preview.allowMove = false"
        @mouseenter="preview.allowMove = false"
      >
        <img
          :style="{
            width: preview.width + 'px',
            top: preview.top + 'px',
            left: preview.left + 'px'
          }"
          :src="`/api/image/${image.hash}`"
          alt="preview"
        />
      </div>
      <div class="flex-1 ml-4">
        <el-descriptions :column="1" border class="label-nowrap">
          <el-descriptions-item label="图片ID">
            {{ image.id }}
          </el-descriptions-item>
          <el-descriptions-item label="图片像素">
            {{ image.width }} x {{ image.height }}
          </el-descriptions-item>
          <el-descriptions-item label="图片标签">
            <InputTagArea v-model:value="image.tags" />
          </el-descriptions-item>
          <el-descriptions-item label="所属图库">
            {{ image.folder_id }}
          </el-descriptions-item>
          <el-descriptions-item label="上传日期">
            {{ image.created_at ? dayjs.unix(image.created_at).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </el-descriptions-item>
          <el-descriptions-item label="更新日期">
            {{ image.updated_at ? dayjs.unix(image.updated_at).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </el-descriptions-item>
          <el-descriptions-item label="原图大小">
            {{ numeral(image.size).format("0.00b") }}
          </el-descriptions-item>
          <el-descriptions-item label="原图哈希">
            {{ image.hash }}
          </el-descriptions-item>
          <el-descriptions-item label="原图链接">
            <Copyable :text="`${state.url}/api/image/${image.hash}`" />
          </el-descriptions-item>
          <el-descriptions-item label="图片下载">
            <el-dropdown split-button type="primary" @click="handleDownload()">
              下载原图
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleDownload('jpg')"> .jpg </el-dropdown-item>
                  <el-dropdown-item @click="handleDownload('png')"> .png </el-dropdown-item>
                  <el-dropdown-item @click="handleDownload('webp')"> .webp </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleCancel">关闭</el-button>
      <client-only>
        <el-popconfirm
          v-if="!state.loading"
          title="确认删除?"
          placement="top"
          :hide-after="0"
          @confirm="handleDelete"
        >
          <template #reference>
            <el-button type="danger" :loading="state.deleting" :disabled="state.submitting">
              删除
            </el-button>
          </template>
        </el-popconfirm>
      </client-only>
      <el-button
        v-if="!state.loading"
        type="primary"
        :loading="state.submitting"
        :disabled="state.deleting"
        @click="handleUpdateTags"
      >
        更新标签
      </el-button>
    </template>
  </BasicModal>
</template>

<style scoped lang="scss">
.image-preview-content {
  display: flex;

  .image-wrap {
    overflow: hidden;
    position: relative;
    background-image:
      linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%),
      linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%);
    background-size: 40px 40px;
    background-position:
      0 0,
      20px 20px;
    border-radius: 3px;
    user-select: none;
    flex-shrink: 0;

    > img {
      position: absolute;
    }
  }
}
</style>
