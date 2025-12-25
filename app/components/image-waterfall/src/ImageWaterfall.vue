<script setup lang="ts">
import type { ImageItem } from "./types";
import type { PropType } from "vue";
import { useDebounceFn, useElementSize } from "@vueuse/core";
import { reactive, onMounted, onUnmounted, watch, ref, computed, nextTick } from "vue";

const props = defineProps({
  data: {
    type: Array as PropType<ImageItem[]>,
    default: () => []
  },
  gap: {
    type: Number,
    default: 12
  },
  breakpoint: {
    type: Object as PropType<Record<number, number>>,
    default: () => ({
      1280: 5,
      1024: 4,
      768: 3,
      640: 2,
      0: 1 // 默认值，确保在任何屏幕尺寸下都有列数
    })
  },
  loadingColor: {
    type: String,
    default: "#f3f4f6"
  },
  hoverEffect: {
    type: Boolean,
    default: true
  },
  borderRadius: {
    type: String,
    default: "0.375rem"
  },
  lazyLoad: {
    type: Boolean,
    default: true
  },
  transitionDuration: {
    type: Number,
    default: 300 // 毫秒
  }
});

const emits = defineEmits(["click-image", "load-image", "error-image"]);

const imageWaterfallRef = ref<HTMLDivElement | null>(null);
const { width } = useElementSize(imageWaterfallRef);

interface RenderImageData {
  top: number;
  left: number;
  width: number;
  height: number;
  loaded: boolean;
  error: boolean;
  visible: boolean;
}

const renderData = reactive<{
  images: RenderImageData[];
  height: number;
}>({
  images: [],
  height: 0
});

// 计算列数
const columnCount = computed(() => {
  if (!width.value) return 1;

  const breakpoint: number[] = Object.keys(props.breakpoint)
    .map((i) => Number(i))
    .sort((a, b) => b - a);

  for (const bp of breakpoint) {
    if (width.value >= bp) {
      return props.breakpoint[bp] as number;
    }
  }

  return props.breakpoint[0] || 1;
});

// 计算每列宽度
const columnWidth = computed(() => {
  return (width.value - (columnCount.value - 1) * props.gap) / columnCount.value;
});

// 防抖计算布局
const calcRenderData = useDebounceFn(() => {
  if (!props.data.length || !width.value) {
    renderData.images = [];
    renderData.height = 0;
    return;
  }

  const imageWidth = columnWidth.value;
  const columnHeight: number[] = new Array(columnCount.value).fill(0);
  const data: RenderImageData[] = [];

  for (const item of props.data) {
    // 计算图片高度，保持宽高比
    const imageHeight = Math.round((imageWidth / item.width) * item.height);

    // 找出最短的列
    const minHeight = Math.min(...columnHeight);
    const currentCol = columnHeight.indexOf(minHeight);

    data.push({
      width: imageWidth,
      height: imageHeight,
      top: minHeight,
      left: currentCol * (imageWidth + props.gap),
      loaded: false,
      error: false,
      visible: false
    });

    // 更新列高度
    columnHeight[currentCol]! += imageHeight + props.gap;
  }

  renderData.height = Math.max(...columnHeight) || 0;
  renderData.images = data;

  // 在下一个tick检查可见性
  if (props.lazyLoad) {
    nextTick(() => {
      checkImagesVisibility();
    });
  }
}, 100);

// 监听窗口大小变化
watch(width, calcRenderData);

// 监听数据变化
watch(() => props.data, calcRenderData, { deep: true });

// 图片加载处理
const handleImageLoad = (index: number) => {
  if (!renderData.images[index]) return;

  renderData.images[index].loaded = true;
  emits("load-image", props.data[index]);
};

// 图片加载错误处理
const handleImageError = (index: number) => {
  if (!renderData.images[index]) return;

  renderData.images[index].error = true;
  emits("error-image", props.data[index]);
};

// 检查图片是否在视口中
const checkImagesVisibility = () => {
  if (!imageWaterfallRef.value) return;

  const imageElements = imageWaterfallRef.value.querySelectorAll(".image-waterfall-item");
  const viewportHeight = window.innerHeight;
  // const scrollTop = window.scrollY;

  imageElements.forEach((el, index) => {
    if (index >= renderData.images.length) return;

    const rect = el.getBoundingClientRect();
    const isVisible =
      rect.top < viewportHeight + 300 && // 预加载视口下方300px
      rect.bottom > -300; // 预加载视口上方300px

    renderData.images[index]!.visible = isVisible;
  });
};

// 滚动事件处理
const handleScroll = useDebounceFn(() => {
  if (props.lazyLoad) {
    checkImagesVisibility();
  }
}, 100);

// 组件挂载后计算布局
onMounted(() => {
  calcRenderData();

  if (props.lazyLoad) {
    window.addEventListener("scroll", handleScroll);
  }
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  if (props.lazyLoad) {
    window.removeEventListener("scroll", handleScroll);
  }
});

// 图片点击处理
const handleImageClick = (item: ImageItem, index: number) => {
  emits("click-image", item, index);
};
</script>

<template>
  <div
    ref="imageWaterfallRef"
    class="image-waterfall"
    :style="{ height: renderData.height + 'px' }"
  >
    <div
      v-for="(item, index) in props.data"
      :key="item.id"
      class="image-waterfall-item"
      :class="{
        'image-loaded': renderData.images[index]?.loaded,
        'image-error': renderData.images[index]?.error,
        'hover-effect': hoverEffect
      }"
      :style="{
        top: renderData.images[index]?.top + 'px',
        left: renderData.images[index]?.left + 'px',
        width: renderData.images[index]?.width + 'px',
        height: renderData.images[index]?.height + 'px',
        borderRadius: borderRadius,
        transitionDuration: transitionDuration + 'ms',
        backgroundColor: loadingColor
      }"
      @click="handleImageClick(item, index)"
    >
      <img
        v-if="renderData.images[index] && (!lazyLoad || renderData.images[index].visible)"
        :src="`/static/image/${item.preview}.${item.format}`"
        :alt="item.id.toString()"
        @load="handleImageLoad(index)"
        @error="handleImageError(index)"
      />
      <div
        v-if="!renderData.images[index]?.loaded && !renderData.images[index]?.error"
        class="image-loading"
      >
        <div class="loading-spinner"></div>
      </div>
      <div v-if="renderData.images[index]?.error" class="image-error-overlay">
        <span>加载失败</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.image-waterfall {
  width: 100%;
  height: fit-content;
  position: relative;

  .image-waterfall-item {
    position: absolute;
    overflow: hidden;
    cursor: pointer;
    transition:
      opacity var(--transition-duration, 300ms) ease,
      transform var(--transition-duration, 300ms) ease;
    opacity: 0.6;

    &.image-loaded {
      opacity: 1;
    }

    &.hover-effect:hover {
      z-index: 1;
      transform: translateY(-4px) scale(1.02);
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease;
    }

    .image-loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s linear infinite;
      }
    }

    .image-error-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.1);

      span {
        padding: 4px 8px;
        background-color: rgba(0, 0, 0, 0.6);
        color: #fff;
        border-radius: 4px;
        font-size: 12px;
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .image-waterfall .image-waterfall-item {
    background-color: rgba(255, 255, 255, 0.05);

    .image-error-overlay span {
      background-color: rgba(255, 255, 255, 0.2);
      color: #e2e8f0;
    }
  }
}
</style>
