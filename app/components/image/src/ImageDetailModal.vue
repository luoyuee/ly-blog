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
const { t } = useI18n();

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
      title: t("message.update.success")
    });
  } catch {
    $notify.error({
      title: t("message.update.error")
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
      title: t("message.download.error")
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
      title: t("message.delete.success")
    });
    state.visible = false;
  } catch {
    $notify.error({
      title: t("message.delete.error")
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
  <BasicModal
    v-model:open="state.visible"
    :title="$t('components.image.detailModal.title')"
    content-class="max-w-[1080px]"
  >
    <div v-if="image" class="image-preview-content">
      <div style="width: 600px; height: 500px">
        <ImagePreview v-if="state.visible" :src="`/static/image/${image.hash}.${image.format}`" />
      </div>

      <div class="flex-1 ml-4">
        <Descriptions :column="1">
          <DescriptionsItem :label="$t('components.image.detailModal.fieldImageId')">
            {{ image.id }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('components.image.detailModal.fieldPixel')">
            {{ image.width + " x " + image.height }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('components.image.detailModal.fieldTags')">
            <InputTagArea v-model:value="image.tags" />
          </DescriptionsItem>
          <DescriptionsItem :label="$t('components.image.detailModal.fieldFolder')">
            {{ image.folder_id }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('components.image.detailModal.fieldCreatedAt')">
            {{ image.created_at }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('components.image.detailModal.fieldUpdatedAt')">
            {{ image.updated_at }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('components.image.detailModal.fieldSize')">
            {{ numeral(image.size).format("0.00b") }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('components.image.detailModal.fieldHash')">
            {{ image.hash }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('components.image.detailModal.fieldLink')">
            <Copyable :text="`${state.url}/api/image/${image.hash}`" />
          </DescriptionsItem>
          <DescriptionsItem :label="$t('components.image.detailModal.fieldDownload')">
            <UFieldGroup>
              <UButton
                variant="subtle"
                :label="$t('components.image.detailModal.downloadOriginal')"
                @click="handleDownload()"
              />

              <UDropdownMenu :items="items">
                <UButton color="neutral" variant="outline" icon="lucide:chevron-down" />
              </UDropdownMenu>
            </UFieldGroup>
          </DescriptionsItem>
        </Descriptions>
      </div>
    </div>

    <template #footer>
      <UButton color="neutral" variant="outline" @click="handleCancel">
        {{ $t("common.close") }}
      </UButton>

      <UButton
        color="error"
        :loading="state.deleting"
        :disabled="state.submitting"
        @click="handleDelete"
      >
        {{ $t("common.delete") }}
      </UButton>

      <UButton
        v-if="!state.loading"
        color="primary"
        :loading="state.submitting"
        :disabled="state.deleting"
        @click="handleUpdateTags"
      >
        {{ $t("components.image.detailModal.updateTags") }}
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
