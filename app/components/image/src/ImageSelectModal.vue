<script setup lang="ts">
import type { ImageFolder, ImageItem, ImageSelectItem } from "#shared/types/image";
import { getAllImageFolder, getPaginatedImages } from "@/apis/image";
import { BasicModal } from "@/components/basic-modal";
import { Scrollbar } from "@/components/scrollbar";
import ImageUploadModal from "./ImageUploadModal.vue";

const $message = useMessage();

const emits = defineEmits(["cancel", "confirm", "closed"]);

const visible = defineModel("visible", {
  type: Boolean,
  default: false
});

defineExpose({
  open: () => {
    visible.value = true;
  }
});

const props = defineProps({
  defaultSelected: {
    type: Array as PropType<ImageSelectItem[]>,
    default: () => []
  },
  multiple: {
    type: Boolean
  },
  limit: {
    type: Number
  },
  title: {
    type: String,
    default: "选择图片"
  }
});

const state = reactive<{
  keyword?: string;
  type?: number;
  uploadModalVisible: boolean;
  currentFolder: number;
  page: number;
  per_page: number;
  total: number;
  more: boolean;
  loading: boolean;
}>({
  uploadModalVisible: false,
  currentFolder: 0,
  page: 1,
  per_page: 20,
  total: 0,
  more: true,
  loading: false
});

const imageFolder = ref<ImageFolder[]>([]);
const imageList = ref<ImageItem[]>([]);

const selectedList = ref<ImageSelectItem[]>([]);
const selectedMap = computed(() => {
  return selectedList.value.reduce(
    (acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    },
    {} as Record<number, ImageSelectItem>
  );
});

watch(visible, async (newVal) => {
  if (newVal) {
    state.loading = true;
    selectedList.value = props.defaultSelected ?? [];
    await loadFolders();
    await loadImages();
    state.loading = false;
  }
});

const loadFolders = async () => {
  try {
    imageFolder.value = await getAllImageFolder();
    if (imageFolder.value && imageFolder.value.length > 1) {
      state.currentFolder = imageFolder.value[0]!.id;
    }
  } catch (error) {
    $message.error("获取文件夹失败", error);
  }
};

const loadImages = async (): Promise<void> => {
  if (!state.currentFolder) return;

  try {
    state.loading = true;
    const response = await getPaginatedImages({
      folder: state.currentFolder,
      page: state.page,
      per_page: state.per_page
    });

    imageList.value = imageList.value.concat(response.data);
    console.log(imageList.value);
    state.total = response.total;

    state.more = state.page < Math.ceil(response.total / state.per_page);
    state.page += 1;
  } catch (error) {
    $message.error("获取图片失败", error);
  } finally {
    state.loading = false;
  }
};

const handleChangeFolder = (id: number) => {
  imageList.value = [];
  state.currentFolder = id;
  state.page = 1;
  state.total = 0;
  state.more = true;
  loadImages();
};

const handleSelectIamge = (e: ImageItem) => {
  if (props.multiple && props.limit) {
    if (selectedList.value.length >= props.limit) return;
  }

  const index = selectedList.value.findIndex((item) => item.id === e.id);

  if (index !== -1) {
    selectedList.value.splice(index, 1);
  } else {
    if (!props.multiple) selectedList.value = [];
    selectedList.value.push({
      id: e.id,
      hash: e.hash,
      format: e.format,
      preview: e.preview
    });
  }
};

const handleDelete = (e: ImageSelectItem) => {
  const index = selectedList.value.findIndex((item) => item.id === e.id);
  if (index !== -1) {
    selectedList.value.splice(index, 1);
  }
};

const handleConfirm = () => {
  if (props.multiple) {
    emits("confirm", unref(selectedList.value));
  } else {
    emits("confirm", unref(selectedList.value));
  }
  visible.value = false;
};

const handleCancel = () => {
  emits("cancel");
  visible.value = false;
};

// 上传图片
const uploadVisible = ref(false);
const currentFolder = computed(() => {
  return imageFolder.value.find((item) => item.id === state.currentFolder);
});
const handleUploadClick = () => {
  uploadVisible.value = true;
};

const handleSubmit = () => {
  state.page = 1;
  imageList.value = [];
  loadImages();
};
</script>
<template>
  <BasicModal
    v-model:visible="visible"
    :title="props.title"
    class="image-select-modal"
    content-class="max-w-[800px]"
    @cancel="handleCancel"
    @closed="emits('closed')"
  >
    <div class="image-select-modal__body">
      <div class="image-select-modal__toolbar">
        <UButton icon="ep:upload" variant="outline" @click="handleUploadClick"> 上传图片 </UButton>

        <UFieldGroup class="image-select-modal__filters">
          <USelect
            v-model="state.currentFolder"
            class="image-select-modal__folder-select"
            value-key="id"
            label-key="name"
            :items="imageFolder"
            @update:model-value="handleChangeFolder"
          />
          <UInput
            v-model="state.keyword"
            class="image-select-modal__keyword-input"
            placeholder="请输入关键词"
          />
          <UButton icon="ep:search" />
        </UFieldGroup>
      </div>

      <div class="image-select-modal__content">
        <!-- 当已选列表为空时，显示占位图标与提示语 -->
        <div v-if="selectedList.length === 0" class="image-select-modal__placeholder">
          <UIcon name="lucide:image-off" :size="36" />
          <span class="image-select-modal__placeholder-text">暂未选择图片</span>
        </div>

        <Scrollbar v-else class="image-select-modal__scroll">
          <!-- 已选列表不为空时，展示缩略图列表 -->
          <ul class="image-select-modal__selected-list">
            <li
              v-for="(item, index) in selectedList"
              :key="index"
              class="image-select-modal__selected-item"
            >
              <img
                class="image-select-modal__selected-item__img"
                :src="`/static/image/${item.preview}.${item.format}`"
              />
              <span class="image-select-modal__selected-item__del" @click.stop="handleDelete(item)">
                <UIcon name="ep:delete-filled" />
              </span>
            </li>
          </ul>
        </Scrollbar>

        <div class="image-select-modal__divider"></div>

        <Scrollbar
          v-if="imageList.length > 0"
          class="image-select-modal__scroll image-select-modal__scroll--image-list"
        >
          <ul class="image-select-modal__image-list">
            <li
              v-for="item in imageList"
              :key="item.id"
              class="image-select-modal__image-item"
              :class="{ 'image-select-modal__image-item--checked': selectedMap[item.id] }"
              @click="handleSelectIamge(item)"
            >
              <img :src="`/static/image/${item.preview}.${item.format}`" />
            </li>
          </ul>
        </Scrollbar>

        <div v-else class="image-select-modal__empty">
          <img src="/images/no_pictures.svg" alt="empty" width="200" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="image-select-modal__footer">
        <span class="image-select-modal__footer-tip">
          {{ `已选择（${selectedList.length}${props.limit ? "/" + props.limit : ""}）` }}
        </span>
        <div class="image-select-modal__footer-actions">
          <UButton class="image-select-modal__btn-cancel" @click="handleCancel">取消</UButton>
          <UButton color="primary" class="image-select-modal__btn-confirm" @click="handleConfirm"
            >确认</UButton
          >
        </div>
      </div>
    </template>

    <ImageUploadModal
      v-if="currentFolder"
      v-model:visible="uploadVisible"
      :folder="currentFolder"
      @submit="handleSubmit"
    />
  </BasicModal>
</template>
<style scoped lang="scss">
.image-select-modal {
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  &__folder-select {
    width: 120px;
  }

  &__keyword-input {
    min-width: 160px;
  }

  &__scroll {
    height: 100%;
  }

  &__scroll--image-list {
    padding-left: 12px;
  }

  &__placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--text-color-4);
  }

  &__placeholder-text {
    font-size: 0.875rem;
  }

  &__content {
    display: grid;
    grid-template-columns: 1fr 1px 3fr;
    height: 400px;
    margin-top: 1rem;
  }

  &__divider {
    background-color: var(--ui-border);
  }

  &__image-list {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;

    .image-select-modal__image-item {
      position: relative;
      cursor: pointer;
      border-radius: 4px;
      overflow: hidden;
      height: 120px;

      &:hover {
        &::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 2px solid var(--theme-color);
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .image-select-modal__image-item--checked {
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 4px;
        border: 2px solid var(--theme-color);
      }

      &::after {
        border: 10px solid var(--theme-color);
        border-block-end: 10px solid #0000;
        border-inline-start: 10px solid #0000;
        border-start-end-radius: 4px;
        content: "";
        height: 0;
        inset-block-start: 4px;
        inset-inline-end: 4px;
        position: absolute;
        width: 0;
      }
    }
  }

  &__selected-list {
    list-style: none;
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px;
    padding-right: 12px;

    .image-select-modal__selected-item {
      position: relative;
      cursor: pointer;
      border-radius: 4px;
      overflow: hidden;
      height: 120px;

      &__img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      &__del {
        font-size: 16px;
        position: absolute;
        width: 100%;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.3);
        color: #ffffff;
        text-align: center;
        bottom: 0;
        transform: translateY(100%);
        transition:
          transform 0.3s ease,
          background-color 0.3s ease,
          color 0.3s ease;

        &:hover {
          background-color: rgba(0, 0, 0, 0.4);
          color: var(--color-red-400);
        }
      }

      &:hover {
        .image-select-modal__selected-item__del {
          transform: translateY(0);
        }
      }
    }

    .image-select-modal__selected-item--checked {
      border: 2px solid var(--theme-color);

      &::after {
        border: 10px solid var(--theme-color);
        border-block-end: 10px solid #0000;
        border-inline-start: 10px solid #0000;
        border-start-end-radius: 4px;
        content: "";
        height: 0;
        inset-block-start: 2px;
        inset-inline-end: 2px;
        position: absolute;
        width: 0;
      }
    }
  }

  &__empty {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__footer {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__footer-tip {
    font-size: 12px;
  }

  &__footer-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
