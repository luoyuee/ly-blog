<script setup lang="ts">
import type { PropType } from "vue";
import { NOTE_COLORS, PEN_COLORS, WHITEBOARD_TOOLS } from "../types";
import type { WhiteboardTool } from "../types";

const props = defineProps({
  tool: {
    type: String as PropType<WhiteboardTool>,
    required: true
  },
  noteColor: {
    type: String,
    required: true
  },
  penColor: {
    type: String,
    required: true
  },
  penWidth: {
    type: Number,
    required: true
  },
  zoom: {
    type: Number,
    required: true
  },
  canUndo: {
    type: Boolean,
    required: true
  },
  canRedo: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits<{
  "update:tool": [tool: WhiteboardTool];
  "update:noteColor": [color: string];
  "update:penColor": [color: string];
  "update:penWidth": [width: number];
  undo: [];
  redo: [];
  zoomIn: [];
  zoomOut: [];
  resetZoom: [];
  fit: [];
  open: [];
  save: [];
}>();

const tools = [
  { value: WHITEBOARD_TOOLS.select, icon: "lucide:mouse-pointer-2", title: "选择 (V)" },
  { value: WHITEBOARD_TOOLS.pan, icon: "lucide:hand", title: "抓手平移 (H / 空格)" },
  { value: WHITEBOARD_TOOLS.note, icon: "lucide:sticky-note", title: "便签 (N)" },
  { value: WHITEBOARD_TOOLS.pen, icon: "lucide:pen-line", title: "画笔 (P)" },
  { value: WHITEBOARD_TOOLS.eraser, icon: "lucide:eraser", title: "橡皮擦 (E)" },
  { value: WHITEBOARD_TOOLS.connect, icon: "lucide:waypoints", title: "连线 (C)" }
] as const;

const zoomLabel = computed(() => `${Math.round(props.zoom * 100)}%`);
const contextualHint = computed(() => {
  if (props.tool === WHITEBOARD_TOOLS.connect) return "依次点击两个便签以连线";
  if (props.tool === WHITEBOARD_TOOLS.pan) return "拖拽以平移画布";
  if (props.tool === WHITEBOARD_TOOLS.eraser) return "拖动以擦除画笔笔迹";
  return "选中便签可拖拽、缩放或删除";
});

const onPenWidthInput = (event: Event): void => {
  const input = event.currentTarget;
  if (input instanceof HTMLInputElement) {
    emit("update:penWidth", Number(input.value));
  }
};
</script>

<template>
  <header class="whiteboard-toolbar">
    <div class="whiteboard-toolbar__brand">
      <strong>未命名白板</strong>
    </div>

    <div class="whiteboard-toolbar__tools" aria-label="白板工具">
      <button
        v-for="item in tools"
        :key="item.value"
        class="whiteboard-toolbar__icon-button"
        :class="{ 'whiteboard-toolbar__icon-button--active': tool === item.value }"
        type="button"
        :title="item.title"
        :aria-label="item.title"
        :aria-pressed="tool === item.value"
        @click="emit('update:tool', item.value)"
      >
        <UIcon :name="item.icon" class="size-5" />
      </button>
    </div>

    <span class="whiteboard-toolbar__separator" aria-hidden="true"></span>

    <div class="whiteboard-toolbar__context">
      <template v-if="tool === WHITEBOARD_TOOLS.note">
        <span class="whiteboard-toolbar__context-label">便签颜色</span>
        <button
          v-for="color in NOTE_COLORS"
          :key="color"
          class="whiteboard-toolbar__swatch"
          :class="{ 'whiteboard-toolbar__swatch--selected': noteColor === color }"
          type="button"
          :style="{ backgroundColor: color }"
          :aria-label="`选择便签颜色 ${color}`"
          :title="`选择便签颜色 ${color}`"
          @click="emit('update:noteColor', color)"
        ></button>
      </template>
      <template v-else-if="tool === WHITEBOARD_TOOLS.pen">
        <span class="whiteboard-toolbar__context-label">画笔</span>
        <button
          v-for="color in PEN_COLORS"
          :key="color"
          class="whiteboard-toolbar__swatch"
          :class="{ 'whiteboard-toolbar__swatch--selected': penColor === color }"
          type="button"
          :style="{ backgroundColor: color }"
          :aria-label="`选择画笔颜色 ${color}`"
          :title="`选择画笔颜色 ${color}`"
          @click="emit('update:penColor', color)"
        ></button>
        <input
          class="whiteboard-toolbar__range"
          type="range"
          min="1"
          max="20"
          :value="penWidth"
          :aria-label="`画笔粗细 ${penWidth}`"
          @input="onPenWidthInput"
        />
      </template>
      <span v-else class="whiteboard-toolbar__context-label">{{ contextualHint }}</span>
    </div>

    <div class="whiteboard-toolbar__actions">
      <button class="whiteboard-toolbar__icon-button" type="button" title="撤销 (Ctrl+Z)" aria-label="撤销" :disabled="!canUndo" @click="emit('undo')">
        <UIcon name="lucide:undo-2" class="size-5" />
      </button>
      <button class="whiteboard-toolbar__icon-button" type="button" title="重做 (Ctrl+Shift+Z)" aria-label="重做" :disabled="!canRedo" @click="emit('redo')">
        <UIcon name="lucide:redo-2" class="size-5" />
      </button>
      <div class="whiteboard-toolbar__zoom">
        <button class="whiteboard-toolbar__zoom-button" type="button" title="缩小" aria-label="缩小" @click="emit('zoomOut')"><UIcon name="lucide:zoom-out" class="size-4" /></button>
        <button class="whiteboard-toolbar__zoom-label" type="button" title="重置为 100%" aria-label="重置缩放" @click="emit('resetZoom')">{{ zoomLabel }}</button>
        <button class="whiteboard-toolbar__zoom-button" type="button" title="放大" aria-label="放大" @click="emit('zoomIn')"><UIcon name="lucide:zoom-in" class="size-4" /></button>
        <button class="whiteboard-toolbar__zoom-button" type="button" title="适应内容" aria-label="适应内容" @click="emit('fit')"><UIcon name="lucide:scan" class="size-4" /></button>
      </div>
      <button class="whiteboard-toolbar__ghost" type="button" title="打开白板 JSON 文件" aria-label="打开白板" @click="emit('open')">
        <UIcon name="lucide:folder-open" class="size-4" />
        打开
      </button>
      <button class="whiteboard-toolbar__primary" type="button" title="保存白板 JSON 文件" aria-label="保存白板" @click="emit('save')">
        <UIcon name="lucide:download" class="size-4" />
        保存
      </button>
    </div>
  </header>
</template>

<style scoped src="../styles/whiteboard-toolbar.css"></style>
