<script setup lang="ts">
import type { PropType } from "vue";
import { getPaginatedImages } from "@/apis/image";
import type { ImageItem } from "#shared/types/image";
import type { EditorTabItem, ImageManagerData } from "#shared/types/ly-editor";
import { ImageUploadModal, ImageDetailModal } from "@/components/image";
import ImageWaterfall from "@/components/image-waterfall";
import Scrollbar from "@/components/scrollbar";

const props = defineProps({
  tab: {
    type: Object as PropType<EditorTabItem & { type: "image-manager"; data: ImageManagerData }>,
    required: true,
    validator: (value: EditorTabItem) => value.type === "image-manager"
  }
});

const data = ref<ImageItem[]>([]);

const state = reactive<{
  page: number;
  per_page: number;
  total: number;
  keyword?: string;
  loading: boolean;
}>({
  page: 1,
  per_page: 50,
  total: 0,
  keyword: undefined,
  loading: false
});

const handleSearch = () => {};

const loadData = async () => {
  try {
    state.loading = true;

    const res = await getPaginatedImages({
      page: state.page,
      per_page: state.per_page,
      folder: props.tab.data.id
    });

    data.value = res.data;
  } catch (error) {
    console.error(error);
  } finally {
    state.loading = false;
  }
};

const imageUploadModalRef = useTemplateRef("imageUploadModalRef");
const imageDetailModalRef = useTemplateRef("imageDetailModalRef");

const handleOpenUploadModal = () => {
  imageUploadModalRef.value?.open();
};

onMounted(() => {
  loadData();
});

const handleShowImageDetail = (image: ImageItem) => {
  imageDetailModalRef.value?.show(image);
};
</script>
<template>
  <div class="p-4 h-full overflow-hidden flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-4">
        <UButton icon="ep:plus" @click="handleOpenUploadModal()"> 上传 </UButton>
      </div>

      <UFieldGroup>
        <UInput v-model.trim="state.keyword" class="w-64" placeholder="请输入关键词" />

        <UButton icon="ep:search" @click="handleSearch">搜索</UButton>
      </UFieldGroup>
    </div>

    <Scrollbar class="flex-1">
      <ImageWaterfall :data="data" @click-image="handleShowImageDetail" />
    </Scrollbar>

    <ImageUploadModal ref="imageUploadModalRef" :folder="props.tab.data" @submit="loadData" />

    <ImageDetailModal ref="imageDetailModalRef" />
  </div>
</template>
