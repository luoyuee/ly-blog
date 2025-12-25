<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";

const width = defineModel<number>("width", { default: 200 });
const height = defineModel<number>("height", { default: 200 });

const props = defineProps({
  minWidth: {
    type: Number
  },
  maxWidth: {
    type: Number
  },
  minHeight: {
    type: Number
  },
  maxHeight: {
    type: Number
  },
  position: {
    type: String as PropType<"top" | "right" | "bottom" | "left">,
    default: "right"
  },
  always: {
    type: Boolean,
    default: false
  }
});

const containerStyle = computed(() => {
  switch (props.position) {
    case "top":
    case "bottom":
      return { height: `${height.value}px` };
    case "left":
    case "right":
      return { width: `${width.value}px` };
    default:
      return {};
  }
});

const emits = defineEmits(["resize", "resize-start", "resize-end"]);

const resizing = ref(false);

// eslint-disable-next-line
let originalOnSelectStart: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;

let originalCursor: string = "default";

const startResize = () => {
  originalCursor = document.body.style.cursor;
  resizing.value = true;

  switch (props.position) {
    case "top":
    case "bottom":
      document.body.style.cursor = "ns-resize";
      break;
    case "left":
    case "right":
      document.body.style.cursor = "ew-resize";
      break;
    default:
      document.body.style.cursor = "default";
      break;
  }

  originalOnSelectStart = document.onselectstart;
  document.onselectstart = () => false;

  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);

  emits("resize-start");
};

const handleResize = (e: MouseEvent) => {
  e.stopImmediatePropagation();

  if (!resizing.value) return;

  const setWidth = (w: number) => {
    if (props.minWidth && w < props.minWidth) {
      width.value = props.minWidth;
      return;
    }

    if (props.maxWidth && w > props.maxWidth) {
      width.value = props.maxWidth;
      return;
    }

    width.value = w;

    emits("resize", w);
  };

  const setHeight = (h: number) => {
    if (props.minHeight && h < props.minHeight) {
      height.value = props.minHeight;
      return;
    }

    if (props.maxHeight && h > props.maxHeight) {
      height.value = props.maxHeight;
      return;
    }

    height.value = h;

    emits("resize", h);
  };

  switch (props.position) {
    case "top":
      setHeight(height.value - e.movementY);
      break;
    case "bottom":
      setHeight(height.value + e.movementY);
      break;
    case "left":
      setWidth(width.value - e.movementX);
      break;
    case "right":
      setWidth(width.value + e.movementX);
      break;
    default:
      break;
  }
};

const stopResize = () => {
  resizing.value = false;
  document.body.style.cursor = originalCursor;
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);

  if (document.onselectstart !== originalOnSelectStart) {
    document.onselectstart = originalOnSelectStart;
  }

  emits("resize-end");
};

onMounted(() => {});

onUnmounted(() => {
  // 清理事件监听
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
});
</script>
<template>
  <div class="resize-area" :style="containerStyle">
    <slot></slot>
    <div class="resize-handle" :class="[position]" @mousedown="startResize"></div>
  </div>
</template>
<style scoped lang="scss">
.resize-area {
  position: relative;

  --handle-size: 8px;

  .resize-handle {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .resize-handle.left,
  .resize-handle.right {
    width: var(--handle-size);
    height: 100%;
    top: 0;
    cursor: ew-resize;

    &::after {
      content: "";
      width: calc(var(--handle-size) / 2);
      height: 100%;
      display: none;
      background-color: var(--mdc-editor-active-color);
    }
  }

  .resize-handle.left {
    left: calc(var(--handle-size) / -2);
  }

  .resize-handle.right {
    right: calc(var(--handle-size) / -2);
  }

  .resize-handle.top,
  .resize-handle.bottom {
    width: 100%;
    height: var(--handle-size);
    left: 0;
    cursor: ns-resize;

    &::after {
      content: "";
      width: 100%;
      height: calc(var(--handle-size) / 2);
      display: none;
      background-color: var(--mdc-editor-active-color);
    }
  }

  .resize-handle.top {
    top: calc(var(--handle-size) / -2);
  }

  .resize-handle.bottom {
    bottom: calc(var(--handle-size) / -2);
  }

  .resize-handle:hover {
    &::after {
      display: block;
    }
  }
}
</style>
