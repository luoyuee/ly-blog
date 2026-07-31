<script setup lang="ts">
import { toRaw } from "vue";
import { cloneContent } from "./utils/geometry";
import { parseWhiteboardDocument, serializeWhiteboardDocument } from "./utils/whiteboard-document";
import { useWhiteboard } from "./composables/useWhiteboard";
import type { WhiteboardContent } from "./types";
import WhiteboardToolbar from "./components/WhiteboardToolbar.vue";
import WhiteboardViewport from "./components/WhiteboardViewport.vue";

const model = defineModel<WhiteboardContent>({
  default: () => ({ notes: [], strokes: [], connections: [] })
});
let lastEmittedContent: WhiteboardContent | null = null;

const onContentChange = (content: WhiteboardContent): void => {
  const emittedContent = cloneContent(content);
  lastEmittedContent = toRaw(emittedContent);
  model.value = emittedContent;
};

const {
  tool,
  view,
  displayContent,
  selectedId,
  editingId,
  pendingConnection,
  noteColor,
  penColor,
  penWidth,
  canUndo,
  canRedo,
  setTool,
  changeNoteColor,
  setPenColor,
  setPenWidth,
  undo,
  redo,
  zoomBy,
  resetZoom,
  fit,
  onPointer,
  onMove,
  onRelease,
  onCancel,
  onWheel,
  onViewportResize,
  onNotePointer,
  onNoteResize,
  startEdit,
  finishEdit,
  setNoteText,
  deleteNote,
  onNavigate,
  exportDocument,
  importDocument,
  replaceFromExternal
} = useWhiteboard(cloneContent(model.value), onContentChange);

watch(model, (newVal) => {
  const rawContent = toRaw(newVal);
  if (rawContent === lastEmittedContent) return;
  replaceFromExternal(rawContent);
});

const fileInput = ref<HTMLInputElement | null>(null);

const openFilePicker = (): void => {
  fileInput.value?.click();
};
const saveWhiteboard = (): void => {
  const blob = new Blob([serializeWhiteboardDocument(exportDocument())], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  try {
    link.href = url;
    link.download = "whiteboard.json";
    link.click();
  } finally {
    link.remove();
    URL.revokeObjectURL(url);
  }
};
const openWhiteboard = async (event: Event): Promise<void> => {
  const input = event.currentTarget;
  if (!(input instanceof HTMLInputElement)) return;
  const file = input.files?.item(0);
  if (!file) return;
  try {
    importDocument(parseWhiteboardDocument(await file.text()));
  } catch (error) {
    if (error instanceof Error) {
      window.alert("打开白板失败，请确认文件为有效 JSON");
    } else {
      throw error;
    }
  } finally {
    input.value = "";
  }
};
</script>

<template>
  <div class="whiteboard-page">
    <WhiteboardToolbar
      :tool="tool"
      :note-color="noteColor"
      :pen-color="penColor"
      :pen-width="penWidth"
      :zoom="view.scale"
      :can-undo="canUndo"
      :can-redo="canRedo"
      @update:tool="setTool"
      @update:note-color="changeNoteColor"
      @update:pen-color="setPenColor"
      @update:pen-width="setPenWidth"
      @undo="undo"
      @redo="redo"
      @zoom-in="zoomBy(1.2)"
      @zoom-out="zoomBy(1 / 1.2)"
      @reset-zoom="resetZoom"
      @fit="fit"
      @open="openFilePicker"
      @save="saveWhiteboard"
    />
    <input ref="fileInput" hidden type="file" accept="application/json,.json" aria-label="选择白板 JSON 文件" @change="openWhiteboard" />
    <WhiteboardViewport
      :content="displayContent"
      :view="view"
      :tool="tool"
      :selected-id="selectedId"
      :editing-id="editingId"
      :pending-connection="pendingConnection"
      @pointer="onPointer"
      @move="onMove"
      @release="onRelease"
      @cancel="onCancel"
      @wheel="onWheel"
      @resize="onViewportResize"
      @note-pointer="onNotePointer"
      @note-resize="onNoteResize"
      @edit="startEdit"
      @finish-edit="finishEdit"
      @text="setNoteText"
      @remove="deleteNote"
      @navigate="onNavigate"
    />
  </div>
</template>

<style scoped src="./styles/whiteboard-page.css"></style>
