<script setup lang="ts">
import { toRaw } from "vue";
import { cloneContent } from "./utils/geometry";
import { parseWhiteboardDocument, serializeWhiteboardDocument } from "./utils/whiteboard-document";
import { useWhiteboard } from "./composables/useWhiteboard";
import type { WhiteboardContent, WhiteboardDocument } from "./types";
import WhiteboardToolbar from "./components/WhiteboardToolbar.vue";
import WhiteboardViewport from "./components/WhiteboardViewport.vue";

const model = defineModel<WhiteboardContent>({
  default: () => ({ notes: [], strokes: [], connections: [] })
});
let lastEmittedContent: WhiteboardContent | null = null;

/**
 * 保存到后端事件。
 * @description 父组件监听后调用接口持久化白板数据
 */
const emit = defineEmits<{
  save: [document: WhiteboardDocument];
}>();

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

/** 导入：选择本地 JSON 文件并加载到白板 */
const openFilePicker = (): void => {
  fileInput.value?.click();
};
/** 导出：将白板数据序列化为 JSON 文件下载 */
const exportToFile = (): void => {
  const blob = new Blob([serializeWhiteboardDocument(exportDocument())], {
    type: "application/json"
  });
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
/** 保存：触发 save 事件，由父组件调用后端接口持久化 */
const saveToBackend = (): void => {
  emit("save", exportDocument());
};
const importFromFile = async (event: Event): Promise<void> => {
  const input = event.currentTarget;
  if (!(input instanceof HTMLInputElement)) return;
  const file = input.files?.item(0);
  if (!file) return;
  try {
    importDocument(parseWhiteboardDocument(await file.text()));
  } catch (error) {
    if (error instanceof Error) {
      window.alert("导入白板失败，请确认文件为有效 JSON");
    } else {
      throw error;
    }
  } finally {
    input.value = "";
  }
};

// 暴露导出方法，供父组件直接获取白板数据
defineExpose({
  exportDocument
});
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
      @import="openFilePicker"
      @export="exportToFile"
      @save="saveToBackend"
    />
    <input
      ref="fileInput"
      hidden
      type="file"
      accept="application/json,.json"
      aria-label="选择白板 JSON 文件"
      @change="importFromFile"
    />
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
