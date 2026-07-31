<script setup lang="ts">
import type { PropType } from "vue";
import { WHITEBOARD_TOOLS } from "../types";
import type { StickyNote, WhiteboardTool } from "../types";

const props = defineProps({
  note: { type: Object as PropType<StickyNote>, required: true },
  selected: { type: Boolean, required: true },
  editing: { type: Boolean, required: true },
  tool: { type: String as PropType<WhiteboardTool>, required: true }
});

const emit = defineEmits<{
  pointerdown: [event: PointerEvent, id: string];
  resize: [event: PointerEvent, id: string];
  edit: [id: string];
  finishEdit: [id: string];
  text: [text: string];
  remove: [id: string];
}>();

const textareaRef = useTemplateRef<HTMLTextAreaElement>("textareaRef");

const onNotePointerDown = (event: PointerEvent): void => {
  if ((props.tool === WHITEBOARD_TOOLS.pen || props.tool === WHITEBOARD_TOOLS.eraser) && !props.editing) return;
  const note = event.currentTarget;
  if (note instanceof HTMLElement) note.setPointerCapture(event.pointerId);
  event.stopPropagation();
  emit("pointerdown", event, props.note.id);
};

const onResizePointerDown = (event: PointerEvent): void => {
  const handle = event.currentTarget;
  if (handle instanceof HTMLElement) handle.setPointerCapture(event.pointerId);
  emit("resize", event, props.note.id);
};

const onTextareaPointerDown = (event: PointerEvent): void => {
  if (props.editing) event.stopPropagation();
};

const onTextInput = (event: Event): void => {
  const textarea = event.currentTarget;
  if (textarea instanceof HTMLTextAreaElement) {
    emit("text", textarea.value);
  }
};

const finishEdit = (): void => emit("finishEdit", props.note.id);

watch(
  () => props.editing,
  (newVal) => {
    if (!newVal) return;
    nextTick(() => {
      textareaRef.value?.focus();
      textareaRef.value?.select();
    });
  }
);
</script>

<template>
  <article
    class="whiteboard-note"
    :class="{
      'whiteboard-note--selected': selected,
      'whiteboard-note--editing': editing
    }"
    :style="{
      left: `${note.x}px`,
      top: `${note.y}px`,
      width: `${note.width}px`,
      height: `${note.height}px`,
      backgroundColor: note.color
    }"
    @pointerdown="onNotePointerDown"
    @dblclick.stop="emit('edit', note.id)"
    @contextmenu.prevent.stop="emit('remove', note.id)"
  >
    <textarea
      ref="textareaRef"
      class="whiteboard-note__text"
      :value="note.text"
      :readonly="!editing"
      spellcheck="false"
      aria-label="便签内容"
      @pointerdown="onTextareaPointerDown"
      @input="onTextInput"
      @keydown.escape.prevent="finishEdit"
      @blur="finishEdit"
    ></textarea>

    <button
      v-if="selected"
      class="whiteboard-note__delete"
      type="button"
      aria-label="删除便签"
      title="删除便签"
      @pointerdown.stop
      @click="emit('remove', note.id)"
    >
      <UIcon name="lucide:x" class="size-3.5" />
    </button>

    <button
      v-if="selected"
      class="whiteboard-note__resize"
      type="button"
      aria-label="调整便签大小"
      title="拖拽调整大小"
      @pointerdown.stop="onResizePointerDown"
    ></button>
  </article>
</template>

<style scoped src="../styles/whiteboard-sticky-note.css"></style>
