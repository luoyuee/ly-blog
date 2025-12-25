<script setup lang="ts">
import type { Image, ImageItem } from "#shared/types/image";
import type { DropdownMenuItem } from "@nuxt/ui";
import { downloadImageFile, deleteImageFile, updateImageTags, getImageDetail } from "@/apis/image";
import { Descriptions, DescriptionsItem } from "@/components/descriptions";
import { InputTagArea } from "@/components/form/input";
import { BasicModal } from "@/components/basic-modal";
import { Copyable } from "@/components/typography";
import { ref, reactive } from "vue";
import ImagePreview from "./ImagePreview.vue";
import numeral from "numeral";

const $notify = useNotification();

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

const image = ref<Image | null>(null);

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

    $notify.success({
      title: "更新成功"
    });
  } catch {
    $notify.error({
      title: "更新失败"
    });
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
    $notify.error({
      title: "下载失败"
    });
  } finally {
    state.downloading = false;
  }
};

const items: DropdownMenuItem[] = [
  {
    label: ".jpg",
    onSelect: () => {
      handleDownload("jpg");
    }
  },
  {
    label: ".png",
    onSelect: () => {
      handleDownload("png");
    }
  },
  {
    label: ".webp",
    onSelect: () => {
      handleDownload("webp");
    }
  }
];

// 删除图片
const handleDelete = async (): Promise<void> => {
  if (!image.value) return;

  try {
    state.deleting = true;

    await deleteImageFile(image.value.id);

    emits("deleted", image.value.id);

    $notify.success({
      title: "删除成功"
    });
    state.visible = false;
  } catch {
    $notify.error({
      title: "删除失败"
    });
  } finally {
    state.deleting = false;
  }
};

onMounted(() => {
  state.url = window.location.origin;
});

const show = (e: ImageItem): void => {
  state.visible = true;
  state.loading = true;

  getImageDetail(e.id).then((res) => {
    image.value = res;

    state.loading = false;
  });
};

defineExpose({ show });
</script>

<template>
  <BasicModal v-model:visible="state.visible" title="原图预览" content-class="max-w-[1080px]">
    <div v-if="image" class="image-preview-content">
      <div style="width: 600px; height: 500px">
        <ImagePreview v-if="state.visible" :src="`/static/image/${image.hash}.${image.format}`" />
      </div>

      <div class="flex-1 ml-4">
        <Descriptions>
          <DescriptionsItem label="图片ID">{{ image.id }}</DescriptionsItem>
          <DescriptionsItem label="图片像素">
            {{ image.width + " x " + image.height }}
          </DescriptionsItem>
          <DescriptionsItem label="图片标签">
            <InputTagArea v-model:value="image.tags" />
          </DescriptionsItem>
          <DescriptionsItem label="所属图库">{{ image.folder_id }}</DescriptionsItem>
          <DescriptionsItem label="上传日期">{{ image.created_at }}</DescriptionsItem>
          <DescriptionsItem label="更新日期">{{ image.updated_at }}</DescriptionsItem>
          <DescriptionsItem label="原图大小">
            {{ numeral(image.size).format("0.00b") }}
          </DescriptionsItem>
          <DescriptionsItem label="原图哈希">{{ image.hash }}</DescriptionsItem>
          <DescriptionsItem label="原图链接">
            <Copyable :text="`${state.url}/api/image/${image.hash}`" />
          </DescriptionsItem>
          <DescriptionsItem label="图片下载">
            <UFieldGroup>
              <UButton variant="subtle" label="下载原图" @click="handleDownload()" />

              <UDropdownMenu :items="items">
                <UButton color="neutral" variant="outline" icon="i-lucide-chevron-down" />
              </UDropdownMenu>
            </UFieldGroup>
          </DescriptionsItem>
        </Descriptions>
      </div>
    </div>

    <template #footer>
      <UButton color="neutral" variant="outline" @click="handleCancel"> 关闭 </UButton>

      <UButton
        color="error"
        :loading="state.deleting"
        :disabled="state.submitting"
        @click="handleDelete"
      >
        删除
      </UButton>

      <UButton
        v-if="!state.loading"
        color="primary"
        :loading="state.submitting"
        :disabled="state.deleting"
        @click="handleUpdateTags"
      >
        更新标签
      </UButton>
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
