<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, useTemplateRef } from "vue";
import { usePhysicsScroll } from "@/composables/usePhysicsScroll";

interface ScrollState {
  vertical: { ratio: number; thumbSize: number };
  horizontal: { ratio: number; thumbSize: number };
}

interface ScrollbarTheme {
  trackColor?: string;
  thumbColor?: string;
  thumbHoverColor?: string;
  thumbActiveColor?: string;
}

const props = defineProps({
  // 滚动条尺寸
  barSize: {
    type: Number,
    default: 4
  },
  // 是否始终显示
  always: {
    type: Boolean,
    default: false
  },
  // 主题配置
  theme: {
    type: Object as () => ScrollbarTheme,
    default: () => ({})
  },
  // 是否启用触摸支持
  touchSupport: {
    type: Boolean,
    default: true
  },
  // 是否启用键盘导航
  keyboardSupport: {
    type: Boolean,
    default: true
  }
});

// 是否显示滚动条
const showScrollbar = ref(props.always);
watch(
  () => props.always,
  (val) => {
    showScrollbar.value = val;
  }
);

const containerRef = useTemplateRef("containerRef");
const contentRef = useTemplateRef("contentRef");

const scrollState = ref<ScrollState>({
  vertical: { ratio: 0, thumbSize: 0 },
  horizontal: { ratio: 0, thumbSize: 0 }
});

const isDragging = ref(false);
const dragType = ref<"vertical" | "horizontal" | null>(null);
const startPosition = ref({ x: 0, y: 0 });

// 容器样式
const containerStyle = computed(() => ({
  "--bar-size": `${props.barSize}px`,
  "--track-color": props.theme.trackColor || "rgba(0, 0, 0, 0.1)",
  "--thumb-color": props.theme.thumbColor || "#909399",
  "--thumb-hover-color": props.theme.thumbHoverColor || "#606266",
  "--thumb-active-color": props.theme.thumbActiveColor || "#303133"
}));

// 垂直滚动条相关计算
const verticalThumbStyle = computed(() => ({
  height: `${scrollState.value.vertical.thumbSize}px`,
  transform: `translateY(${scrollState.value.vertical.ratio}px)`
}));

// 水平滚动条相关计算
const horizontalThumbStyle = computed(() => ({
  width: `${scrollState.value.horizontal.thumbSize}px`,
  transform: `translateX(${scrollState.value.horizontal.ratio}px)`
}));

// 是否需要显示滚动条
const showVerticalBar = ref(false);
const showHorizontalBar = ref(false);

// 计算是否需要显示滚动条
const calcScrollDirection = () => {
  if (!containerRef.value || !contentRef.value) return;

  const container = containerRef.value;
  const content = contentRef.value;

  showVerticalBar.value = content.scrollHeight > container.clientHeight;
  showHorizontalBar.value = content.scrollWidth > container.clientWidth;
};

// 初始化滚动条尺寸
const initScrollbar = () => {
  if (!containerRef.value) return;

  const container = containerRef.value;
  const maxThumbSize = props.barSize * 2;

  // 垂直滚动条
  if (container.scrollHeight > container.clientHeight) {
    const verticalRatio = container.clientHeight / container.scrollHeight;
    scrollState.value.vertical.thumbSize = Math.max(
      maxThumbSize,
      verticalRatio * container.clientHeight
    );
  } else {
    scrollState.value.vertical.thumbSize = 0;
  }

  // 水平滚动条
  if (container.scrollWidth > container.clientWidth) {
    const horizontalRatio = container.clientWidth / container.scrollWidth;
    scrollState.value.horizontal.thumbSize = Math.max(
      maxThumbSize,
      horizontalRatio * container.clientWidth
    );
  } else {
    scrollState.value.horizontal.thumbSize = 0;
  }
};

// 处理内容滚动
const handleContentScroll = (e: Event) => {
  const target = e.currentTarget as HTMLDivElement;
  if (!target) return;

  const scrollTop = target.scrollTop;
  const scrollLeft = target.scrollLeft;

  // 更新滑块位置
  const maxScrollTop = Math.max(0, target.scrollHeight - target.clientHeight);
  const maxScrollLeft = Math.max(0, target.scrollWidth - target.clientWidth);

  if (maxScrollTop > 0) {
    const availableHeight = target.clientHeight - scrollState.value.vertical.thumbSize;
    scrollState.value.vertical.ratio = (scrollTop / maxScrollTop) * availableHeight;
  } else {
    scrollState.value.vertical.ratio = 0;
  }

  if (maxScrollLeft > 0) {
    const availableWidth = target.clientWidth - scrollState.value.horizontal.thumbSize;
    scrollState.value.horizontal.ratio = (scrollLeft / maxScrollLeft) * availableWidth;
  } else {
    scrollState.value.horizontal.ratio = 0;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let originalOnSelectStart: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;

// 开始拖拽
const startDrag = (type: "vertical" | "horizontal", e: MouseEvent | TouchEvent) => {
  e.stopImmediatePropagation();
  e.preventDefault();

  isDragging.value = true;
  dragType.value = type;

  const clientX = "touches" in e ? e.touches[0]!.clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0]!.clientY : e.clientY;

  startPosition.value = { x: clientX, y: clientY };

  if ("touches" in e) {
    document.addEventListener("touchmove", onDrag, { passive: false });
    document.addEventListener("touchend", endDrag);
  } else {
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", endDrag);
  }

  originalOnSelectStart = document.onselectstart;
  document.onselectstart = () => false;
};

// 拖拽中
const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !containerRef.value) return;

  const clientX = "touches" in e ? e.touches[0]!.clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0]!.clientY : e.clientY;

  const delta = {
    x: clientX - startPosition.value.x,
    y: clientY - startPosition.value.y
  };

  const container = containerRef.value;

  if (dragType.value === "vertical") {
    const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
    const availableHeight = container.clientHeight;
    const thumbSize = scrollState.value.vertical.thumbSize;
    const availableTrack = availableHeight - thumbSize;

    if (availableTrack > 0 && maxScrollTop > 0) {
      const scrollRatio = delta.y / availableTrack;
      const newScrollTop = container.scrollTop + scrollRatio * maxScrollTop;
      container.scrollTop = Math.max(0, Math.min(maxScrollTop, newScrollTop));
    }
  } else {
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    const availableWidth = container.clientWidth;
    const thumbSize = scrollState.value.horizontal.thumbSize;
    const availableTrack = availableWidth - thumbSize;

    if (availableTrack > 0 && maxScrollLeft > 0) {
      const scrollRatio = delta.x / availableTrack;
      const newScrollLeft = container.scrollLeft + scrollRatio * maxScrollLeft;
      container.scrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft));
    }
  }

  startPosition.value = { x: clientX, y: clientY };
};

// 结束拖拽
const endDrag = () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", endDrag);
  document.removeEventListener("touchmove", onDrag);
  document.removeEventListener("touchend", endDrag);

  if (document.onselectstart !== originalOnSelectStart) {
    document.onselectstart = originalOnSelectStart;
  }

  if (!isMouseInside.value) {
    showScrollbar.value = props.always;
  }
};

// 点击轨道跳转
const handleTrackClick = (type: "vertical" | "horizontal", e: MouseEvent) => {
  if (!containerRef.value || isDragging.value) return;

  const container = containerRef.value;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

  if (type === "vertical") {
    const clickY = e.clientY - rect.top;
    const availableHeight = rect.height;

    // 防止除零错误
    if (availableHeight <= 0) return;

    // 考虑滑块位置，避免点击滑块时的跳转
    const thumbTop = scrollState.value.vertical.ratio;
    const thumbBottom = thumbTop + scrollState.value.vertical.thumbSize;

    // 如果点击在滑块上，不进行跳转
    if (clickY >= thumbTop && clickY <= thumbBottom) return;

    const scrollRatio = Math.max(0, Math.min(1, clickY / availableHeight));
    const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
    container.scrollTop = scrollRatio * maxScrollTop;
  } else {
    const clickX = e.clientX - rect.left;
    const availableWidth = rect.width;

    // 防止除零错误
    if (availableWidth <= 0) return;

    // 考虑滑块位置，避免点击滑块时的跳转
    const thumbLeft = scrollState.value.horizontal.ratio;
    const thumbRight = thumbLeft + scrollState.value.horizontal.thumbSize;

    // 如果点击在滑块上，不进行跳转
    if (clickX >= thumbLeft && clickX <= thumbRight) return;

    const scrollRatio = Math.max(0, Math.min(1, clickX / availableWidth));
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    container.scrollLeft = scrollRatio * maxScrollLeft;
  }
};
// 初始化物理滚动hook
const physicsScroll = usePhysicsScroll(containerRef, {
  friction: 0.66,
  maxVelocity: 50,
  speedFactor: 0.3,
  direction: "horizontal",
  enableBounce: false
});

// 鼠标滚轮处理
const handleWheel = (e: WheelEvent) => {
  if (!containerRef.value) return;

  // 如果有垂直滚动条，优先垂直滚动
  if (showVerticalBar.value) {
    // 默认行为即为垂直滚动，不需要额外处理
    return;
  }

  // 如果只有水平滚动条，则进行水平滚动
  if (showHorizontalBar.value) {
    physicsScroll.handleWheel(e);
  }
};

// 键盘导航
const handleKeydown = (e: KeyboardEvent) => {
  if (!containerRef.value || !props.keyboardSupport) return;

  const container = containerRef.value;
  const step = 32;

  switch (e.key) {
    case "ArrowUp":
      if (showVerticalBar.value) {
        e.preventDefault();
        container.scrollTop -= step;
      }
      break;
    case "ArrowDown":
      if (showVerticalBar.value) {
        e.preventDefault();
        container.scrollTop += step;
      }
      break;
    case "ArrowLeft":
      if (showHorizontalBar.value) {
        e.preventDefault();
        container.scrollLeft -= step;
      }
      break;
    case "ArrowRight":
      if (showHorizontalBar.value) {
        e.preventDefault();
        container.scrollLeft += step;
      }
      break;
    case "Home":
      e.preventDefault();
      if (e.ctrlKey) {
        container.scrollTop = 0;
        container.scrollLeft = 0;
      } else if (showVerticalBar.value) {
        container.scrollTop = 0;
      } else if (showHorizontalBar.value) {
        container.scrollLeft = 0;
      }
      break;
    case "End":
      e.preventDefault();
      if (e.ctrlKey) {
        container.scrollTop = container.scrollHeight - container.clientHeight;
        container.scrollLeft = container.scrollWidth - container.clientWidth;
      } else if (showVerticalBar.value) {
        container.scrollTop = container.scrollHeight - container.clientHeight;
      } else if (showHorizontalBar.value) {
        container.scrollLeft = container.scrollWidth - container.clientWidth;
      }
      break;
    case "PageUp":
      if (showVerticalBar.value) {
        e.preventDefault();
        container.scrollTop -= container.clientHeight;
      }
      break;
    case "PageDown":
      if (showVerticalBar.value) {
        e.preventDefault();
        container.scrollTop += container.clientHeight;
      }
      break;
  }
};

const isMouseInside = ref(false);

const handleMouseEnter = () => {
  isMouseInside.value = true;
  showScrollbar.value = true;
};

const handleMouseLeave = () => {
  isMouseInside.value = false;

  if (!isDragging.value) {
    showScrollbar.value = props.always;
  }
};

// 使用单个ResizeObserver监听内容变化
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (containerRef.value && contentRef.value) {
    nextTick(() => {
      calcScrollDirection();
      initScrollbar();
    });

    resizeObserver = new ResizeObserver(() => {
      calcScrollDirection();
      initScrollbar();
    });

    // 同时监听内容容器和滚动视图
    resizeObserver.observe(containerRef.value);
    resizeObserver.observe(contentRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  // 停止物理滚动动画
  physicsScroll.stopAnimation();
});

// 暴露方法
defineExpose({
  // 保留wheel方法以保持向后兼容
  wheel: handleWheel,
  // 新增方法
  scrollTo: (options: { top?: number; left?: number; behavior?: ScrollBehavior }) => {
    if (containerRef.value) {
      containerRef.value.scrollTo(options);
    }
  },
  scrollToTop: () => {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0;
    }
  },
  scrollToBottom: () => {
    if (containerRef.value) {
      containerRef.value.scrollTop =
        containerRef.value.scrollHeight - containerRef.value.clientHeight;
    }
  }
});
</script>

<template>
  <div
    class="virtual-scrollbar"
    :style="containerStyle"
    tabindex="0"
    role="scrollbar"
    :aria-orientation="
      showVerticalBar && showHorizontalBar
        ? 'vertical'
        : showVerticalBar
          ? 'vertical'
          : 'horizontal'
    "
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @wheel="handleWheel"
    @keydown="handleKeydown"
  >
    <!-- 内容容器 -->
    <div ref="containerRef" class="virtual-scrollbar__container" @scroll="handleContentScroll">
      <div ref="contentRef" class="virtual-scrollbar__content">
        <slot></slot>
      </div>
    </div>

    <!-- 垂直滚动条 -->
    <div
      v-if="showVerticalBar"
      class="virtual-scrollbar__track virtual-scrollbar__track--vertical"
      :class="{ 'virtual-scrollbar__track--active': showScrollbar }"
      role="scrollbar"
      aria-orientation="vertical"
      :aria-valuenow="
        Math.round((scrollState.vertical.ratio / (containerRef?.clientHeight || 1)) * 100)
      "
      aria-valuemin="0"
      aria-valuemax="100"
      @click="handleTrackClick('vertical', $event)"
    >
      <div
        class="virtual-scrollbar__thumb"
        :style="verticalThumbStyle"
        role="slider"
        tabindex="0"
        @mousedown="startDrag('vertical', $event)"
        @touchstart="startDrag('vertical', $event)"
      ></div>
    </div>

    <!-- 水平滚动条 -->
    <div
      v-if="showHorizontalBar"
      class="virtual-scrollbar__track virtual-scrollbar__track--horizontal"
      :class="{ 'virtual-scrollbar__track--active': showScrollbar }"
      role="scrollbar"
      aria-orientation="horizontal"
      :aria-valuenow="
        Math.round((scrollState.horizontal.ratio / (containerRef?.clientWidth || 1)) * 100)
      "
      aria-valuemin="0"
      aria-valuemax="100"
      @click="handleTrackClick('horizontal', $event)"
    >
      <div
        class="virtual-scrollbar__thumb"
        :style="horizontalThumbStyle"
        role="slider"
        tabindex="0"
        @mousedown="startDrag('horizontal', $event)"
        @touchstart="startDrag('horizontal', $event)"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.virtual-scrollbar {
  --bar-size: 4px;
  --track-color: rgba(0, 0, 0, 0.1);
  --thumb-color: #909399;
  --thumb-hover-color: #606266;
  --thumb-active-color: #303133;
  position: relative;
  overflow: hidden;
  outline: none;
}

.virtual-scrollbar__container {
  height: 100%;
  width: 100%;
  overflow: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE */
}

.virtual-scrollbar__container::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.virtual-scrollbar__content {
  min-width: 100%;
  min-height: 100%;
}

/* 滚动条轨道基础样式 */
.virtual-scrollbar__track {
  position: absolute;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  background: var(--track-color);
  border-radius: calc(var(--bar-size) / 2);
}

.virtual-scrollbar__track::before {
  content: "";
  position: absolute;
  border-radius: calc(var(--bar-size) / 2);
}

/* 垂直滚动条轨道 */
.virtual-scrollbar__track--vertical {
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--bar-size);
}

.virtual-scrollbar__track--vertical::before {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

/* 水平滚动条轨道 */
.virtual-scrollbar__track--horizontal {
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--bar-size);
}

.virtual-scrollbar__track--horizontal::before {
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

/* 滚动条滑块 */
.virtual-scrollbar__thumb {
  position: absolute;
  background: var(--thumb-color);
  border-radius: calc(var(--bar-size) / 2);
  cursor: pointer;
  transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.5;
  outline: none;
}

.virtual-scrollbar__thumb:hover {
  opacity: 0.8;
  background: var(--thumb-hover-color);
}

.virtual-scrollbar__thumb:active,
.virtual-scrollbar__thumb:focus {
  opacity: 1;
  background: var(--thumb-active-color);
}

/* 垂直滚动条滑块定位 */
.virtual-scrollbar__track--vertical .virtual-scrollbar__thumb {
  width: 100%;
  left: 0;
}

/* 水平滚动条滑块定位 */
.virtual-scrollbar__track--horizontal .virtual-scrollbar__thumb {
  height: 100%;
  top: 0;
}

/* 激活状态 */
.virtual-scrollbar__track--active {
  opacity: 1;
  pointer-events: auto;
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .virtual-scrollbar__thumb {
    opacity: 0.7;
  }

  .virtual-scrollbar__track--active {
    opacity: 0.8;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .virtual-scrollbar__track {
    background: rgba(0, 0, 0, 0.3);
  }

  .virtual-scrollbar__thumb {
    background: #000;
    opacity: 0.8;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .virtual-scrollbar__track,
  .virtual-scrollbar__thumb {
    transition: none;
  }
}
</style>
