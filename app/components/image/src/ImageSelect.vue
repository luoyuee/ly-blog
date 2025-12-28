<script lang="ts" setup>
import ImageSelectModal from "./ImageSelectModal.vue";
import { useViewer } from "@/composables/useViewer";

const modelValue = defineModel<string | string[] | null>({
  default: null
});

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: 3
  },
  title: {
    type: String,
    default: "选择图片"
  }
});

const modalVisible = ref(false);

const handleShowModal = () => {
  modalVisible.value = true;
};

const handleConfirm = (item: ImageItem) => {
  const url = `/static/image/${item.hash}.${item.format}`;

  if (props.multiple) {
    if (Array.isArray(modelValue.value)) {
      modelValue.value = [...modelValue.value, url];
    } else {
      modelValue.value = [url];
    }
  } else {
    modelValue.value = url;
  }

  console.log(modelValue.value);
};

const canAddItem = computed(() => {
  if (props.multiple) {
    if (Array.isArray(modelValue.value)) {
      return modelValue.value.length < props.limit;
    }
    return true;
  }
  return !modelValue.value;
});

const imageItems = computed(() => {
  if (Array.isArray(modelValue.value)) {
    return modelValue.value;
  }
  return modelValue.value ? [modelValue.value] : [];
});

const handleDelete = (index: number) => {
  if (Array.isArray(modelValue.value)) {
    modelValue.value.splice(index, 1);
  } else {
    modelValue.value = null;
  }
};

const imageListRef = useTemplateRef("imageListRef");
const handlePreview = (index: number) => {
  if (!imageListRef.value) return;
  const { viewer, show } = useViewer(imageListRef.value);
  viewer.view(index);
  show();
};
</script>
<template>
  <div class="image-select">
    <div ref="imageListRef" class="image-select__list">
      <div
        v-for="(img, index) in imageItems"
        :key="index"
        class="image-select__list-item"
        @click="handlePreview(index)"
      >
        <img class="image-select__list-item__img" :src="img" :alt="img" />
        <span class="image-select__list-item__del" @click.stop="handleDelete(index)">
          <UIcon name="ep:delete-filled" />
        </span>
      </div>

      <div v-if="canAddItem" class="image-select__add" @click="handleShowModal">
        <UIcon name="ep:plus" />
      </div>
    </div>

    <ImageSelectModal
      v-model:visible="modalVisible"
      :title="props.title"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style scoped lang="scss">
.image-select {
  user-select: none;

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    &-item {
      width: 180px;
      height: 120px;
      border-radius: 6px;
      position: relative;
      overflow: hidden;
      cursor: pointer;

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
        .image-select__list-item__del {
          transform: translateY(0);
        }
      }
    }

    .image-select__add {
      width: 180px;
      height: 120px;
      border-radius: 6px;
      border: 1px dashed #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: #ccc;
      transition: all 0.3s ease-in-out;
      cursor: pointer;

      &:hover {
        border-color: #999;
        color: #999;
      }
    }
  }
}
</style>
