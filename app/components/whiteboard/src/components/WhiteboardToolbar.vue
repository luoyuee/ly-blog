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
  import: [];
  export: [];
  save: [];
}>();

const { t } = useI18n();

const tools = computed(() => [
  {
    value: WHITEBOARD_TOOLS.select,
    icon: "lucide:mouse-pointer-2",
    title: t("components.whiteboard.toolSelect")
  },
  {
    value: WHITEBOARD_TOOLS.pan,
    icon: "lucide:hand",
    title: t("components.whiteboard.toolPan")
  },
  {
    value: WHITEBOARD_TOOLS.note,
    icon: "lucide:sticky-note",
    title: t("components.whiteboard.toolNote")
  },
  {
    value: WHITEBOARD_TOOLS.pen,
    icon: "lucide:pen-line",
    title: t("components.whiteboard.toolPen")
  },
  {
    value: WHITEBOARD_TOOLS.eraser,
    icon: "lucide:eraser",
    title: t("components.whiteboard.toolEraser")
  },
  {
    value: WHITEBOARD_TOOLS.connect,
    icon: "lucide:waypoints",
    title: t("components.whiteboard.toolConnect")
  }
]);

const zoomLabel = computed(() => `${Math.round(props.zoom * 100)}%`);
const contextualHint = computed(() => {
  if (props.tool === WHITEBOARD_TOOLS.connect) return t("components.whiteboard.hintConnect");
  if (props.tool === WHITEBOARD_TOOLS.pan) return t("components.whiteboard.hintPan");
  if (props.tool === WHITEBOARD_TOOLS.eraser) return t("components.whiteboard.hintEraser");
  return t("components.whiteboard.hintDefault");
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
      <strong>{{ $t("components.whiteboard.untitled") }}</strong>
    </div>

    <div class="whiteboard-toolbar__tools" :aria-label="$t('components.whiteboard.toolsLabel')">
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
        <span class="whiteboard-toolbar__context-label">
          {{ $t("components.whiteboard.noteColor") }}
        </span>
        <button
          v-for="color in NOTE_COLORS"
          :key="color"
          class="whiteboard-toolbar__swatch"
          :class="{ 'whiteboard-toolbar__swatch--selected': noteColor === color }"
          type="button"
          :style="{ backgroundColor: color }"
          :aria-label="$t('components.whiteboard.selectNoteColor', { color })"
          :title="$t('components.whiteboard.selectNoteColor', { color })"
          @click="emit('update:noteColor', color)"
        ></button>
      </template>
      <template v-else-if="tool === WHITEBOARD_TOOLS.pen">
        <span class="whiteboard-toolbar__context-label">{{ $t("components.whiteboard.pen") }}</span>
        <button
          v-for="color in PEN_COLORS"
          :key="color"
          class="whiteboard-toolbar__swatch"
          :class="{ 'whiteboard-toolbar__swatch--selected': penColor === color }"
          type="button"
          :style="{ backgroundColor: color }"
          :aria-label="$t('components.whiteboard.selectPenColor', { color })"
          :title="$t('components.whiteboard.selectPenColor', { color })"
          @click="emit('update:penColor', color)"
        ></button>
        <input
          class="whiteboard-toolbar__range"
          type="range"
          min="1"
          max="20"
          :value="penWidth"
          :aria-label="$t('components.whiteboard.penWidth', { width: penWidth })"
          @input="onPenWidthInput"
        />
      </template>
      <span v-else class="whiteboard-toolbar__context-label">{{ contextualHint }}</span>
    </div>

    <div class="whiteboard-toolbar__actions">
      <button
        class="whiteboard-toolbar__icon-button"
        type="button"
        :title="$t('components.whiteboard.undoTitle')"
        :aria-label="$t('components.whiteboard.undo')"
        :disabled="!canUndo"
        @click="emit('undo')"
      >
        <UIcon name="lucide:undo-2" class="size-5" />
      </button>
      <button
        class="whiteboard-toolbar__icon-button"
        type="button"
        :title="$t('components.whiteboard.redoTitle')"
        :aria-label="$t('components.whiteboard.redo')"
        :disabled="!canRedo"
        @click="emit('redo')"
      >
        <UIcon name="lucide:redo-2" class="size-5" />
      </button>
      <div class="whiteboard-toolbar__zoom">
        <button
          class="whiteboard-toolbar__zoom-button"
          type="button"
          :title="$t('components.whiteboard.zoomOut')"
          :aria-label="$t('components.whiteboard.zoomOut')"
          @click="emit('zoomOut')"
          ><UIcon name="lucide:zoom-out" class="size-4"
        /></button>
        <button
          class="whiteboard-toolbar__zoom-label"
          type="button"
          :title="$t('components.whiteboard.zoomResetTitle')"
          :aria-label="$t('components.whiteboard.zoomReset')"
          @click="emit('resetZoom')"
          >{{ zoomLabel }}</button
        >
        <button
          class="whiteboard-toolbar__zoom-button"
          type="button"
          :title="$t('components.whiteboard.zoomIn')"
          :aria-label="$t('components.whiteboard.zoomIn')"
          @click="emit('zoomIn')"
          ><UIcon name="lucide:zoom-in" class="size-4"
        /></button>
        <button
          class="whiteboard-toolbar__zoom-button"
          type="button"
          :title="$t('components.whiteboard.fit')"
          :aria-label="$t('components.whiteboard.fit')"
          @click="emit('fit')"
          ><UIcon name="lucide:scan" class="size-4"
        /></button>
      </div>
      <button
        class="whiteboard-toolbar__ghost"
        type="button"
        :title="$t('components.whiteboard.importTitle')"
        :aria-label="$t('components.whiteboard.importLabel')"
        @click="emit('import')"
      >
        <UIcon name="lucide:upload" class="size-4" />
        {{ $t("components.whiteboard.import") }}
      </button>
      <button
        class="whiteboard-toolbar__ghost"
        type="button"
        :title="$t('components.whiteboard.exportTitle')"
        :aria-label="$t('components.whiteboard.exportLabel')"
        @click="emit('export')"
      >
        <UIcon name="lucide:download" class="size-4" />
        {{ $t("components.whiteboard.export") }}
      </button>
      <button
        class="whiteboard-toolbar__primary"
        type="button"
        :title="$t('components.whiteboard.saveTitle')"
        :aria-label="$t('components.whiteboard.saveLabel')"
        @click="emit('save')"
      >
        <UIcon name="lucide:save" class="size-4" />
        {{ $t("components.whiteboard.save") }}
      </button>
    </div>
  </header>
</template>

<style scoped src="../styles/whiteboard-toolbar.css"></style>
