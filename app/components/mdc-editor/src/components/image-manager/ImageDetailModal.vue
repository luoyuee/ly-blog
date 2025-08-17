<script setup lang="ts">
import type { Image, ImageItem } from "@/types/image";
import type { DropdownMenuItem } from "@nuxt/ui";

import { InputTagArea } from "@/components/form/input";
import { Copyable } from "@/components/typography";
import { ref, reactive } from "vue";
import {
  downloadImageFile,
  deleteImageFile,
  updateImageTags,
  getImageDetail,
} from "@/apis/image";
import dayjs from "dayjs";
import numeral from "numeral";
import { Descriptions, DescriptionsItem } from "@/components/descriptions";

const notify = useNotification();

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
  url: "",
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
  containerHeight: 500,
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
      tags: image.value.tags,
    });

    getImageDetail(image.value.id).then((res) => {
      if (image.value) {
        image.value.tags = res.tags;
        image.value.updated_at = res.updated_at;
        image.value.updated_by = res.updated_by;
      }
    });

    notify.success("更新完成");
  } catch {
    notify.error("更新失败");
  } finally {
    state.submitting = false;
  }
};

// 下载图片
const handleDownload = async (
  format?: "webp" | "jpg" | "png"
): Promise<void> => {
  if (image.value === null) return;
  state.downloading = true;
  try {
    const response = await downloadImageFile(image.value.id, format);
    let a = document.createElement("a");
    a.download = `${image.value.hash}.${format ?? image.value.format}`;
    a.href = window.URL.createObjectURL(response);
    a.click();
    a.remove();
  } catch {
    notify.error("下载失败");
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

    notify.success("删除成功");
    state.visible = false;
  } catch {
    notify.error("删除失败");
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

const items: DropdownMenuItem[] = [
  {
    label: ".jpg",
    onSelect: () => {
      handleDownload("jpg");
    },
  },
  {
    label: ".png",
    onSelect: () => {
      handleDownload("png");
    },
  },
  {
    label: ".webp",
    onSelect: () => {
      handleDownload("webp");
    },
  },
];
</script>

<template>
  <UModal
    title="原图预览"
    v-model:open="state.visible"
    @cancel="handleCancel"
    :ui="{
      content: 'max-w-[1080px]',
      footer: 'justify-end',
      overlay: 'bg-elevated/40',
    }"
  >
    <template #body>
      <div v-if="image" class="image-preview-content">
        <div
          class="image-wrap"
          :style="{
            width: preview.containerWidth + 'px',
            height: preview.containerHeight + 'px',
          }"
          @mousewheel="scalePreview"
          @mousemove="movePreview"
          @mousedown="preview.allowMove = true"
          @mouseup="preview.allowMove = false"
          @mouseleave="preview.allowMove = false"
          @mouseenter="preview.allowMove = false"
          ondragstart="return false"
        >
          <img
            :style="{
              width: preview.width + 'px',
              top: preview.top + 'px',
              left: preview.left + 'px',
            }"
            :src="`/static/image/${image.hash}.${image.format}`"
            alt="preview"
          />
        </div>
        <div class="flex-1 ml-4">
          <Descriptions>
            <DescriptionsItem label="图片ID" :content="image.id" />
            <DescriptionsItem
              label="图片像素"
              :content="image.width + ' x ' + image.height"
            />
            <DescriptionsItem label="图片标签">
              <InputTagArea v-model:value="image.tags" />
            </DescriptionsItem>
            <DescriptionsItem label="所属图库" :content="image.folder_id" />
            <DescriptionsItem label="上传日期" :content="image.created_at" />
            <DescriptionsItem label="更新日期" :content="image.updated_at" />
            <DescriptionsItem
              label="原图大小"
              :content="numeral(image.size).format('0.00b')"
            />
            <DescriptionsItem label="原图哈希" :content="image.hash" />
            <DescriptionsItem label="原图链接">
              <Copyable :text="`${state.url}/api/image/${image.hash}`" />
            </DescriptionsItem>
            <DescriptionsItem label="图片下载">
              <UButtonGroup>
                <UButton
                  variant="subtle"
                  label="下载原图"
                  @click="handleDownload()"
                />

                <UDropdownMenu :items="items">
                  <UButton
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-chevron-down"
                  />
                </UDropdownMenu>
              </UButtonGroup>
            </DescriptionsItem>
          </Descriptions>
        </div>
      </div>
    </template>
    <template #footer>
      <UButton color="neutral" variant="outline" @click="handleCancel">
        关闭
      </UButton>

      <UButton
        color="error"
        :loading="state.deleting"
        :disabled="state.submitting"
      >
        删除
      </UButton>

      <UButton
        v-if="!state.loading"
        :loading="state.submitting"
        :disabled="state.deleting"
        @click="handleUpdateTags"
      >
        更新标签
      </UButton>
    </template>
  </UModal>
</template>

<style scoped lang="scss">
.image-preview-content {
  display: flex;

  .image-wrap {
    overflow: hidden;
    position: relative;
    background-image: linear-gradient(
        45deg,
        #eee 25%,
        transparent 25%,
        transparent 75%,
        #eee 75%
      ),
      linear-gradient(
        45deg,
        #eee 25%,
        transparent 25%,
        transparent 75%,
        #eee 75%
      );
    background-size: 40px 40px;
    background-position: 0 0, 20px 20px;
    border-radius: 3px;
    user-select: none;
    flex-shrink: 0;

    > img {
      position: absolute;
    }
  }
}
</style>
