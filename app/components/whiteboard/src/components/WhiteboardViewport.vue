<script setup lang="ts">
import type { PropType } from "vue";
import { getEdgePoint, getNote, screenToWorld, worldToScreen } from "../utils/geometry";
import { GRID_SIZE } from "../types";
import type { Point, ViewportTransform, WhiteboardContent, WhiteboardTool } from "../types";
import WhiteboardMinimap from "./WhiteboardMinimap.vue";
import WhiteboardStickyNote from "./WhiteboardStickyNote.vue";

const props = defineProps({
  content: { type: Object as PropType<WhiteboardContent>, required: true },
  view: { type: Object as PropType<ViewportTransform>, required: true },
  tool: { type: String as PropType<WhiteboardTool>, required: true },
  selectedId: { type: String, default: null },
  editingId: { type: String, default: null },
  pendingConnection: { type: Object as PropType<{ readonly from: string; readonly point: Point } | null>, default: null }
});

const emit = defineEmits<{
  pointer: [event: PointerEvent, point: Point];
  move: [event: PointerEvent, point: Point];
  release: [point: Point];
  cancel: [event: PointerEvent];
  wheel: [event: WheelEvent, point: Point];
  resize: [size: Point];
  notePointer: [id: string, point: Point];
  noteResize: [id: string, point: Point];
  edit: [id: string];
  finishEdit: [id: string];
  text: [id: string, text: string];
  remove: [id: string];
  navigate: [point: Point];
}>();

const viewportRef = useTemplateRef<HTMLElement>("viewportRef");
const backgroundRef = useTemplateRef<HTMLCanvasElement>("backgroundRef");
const foregroundRef = useTemplateRef<HTMLCanvasElement>("foregroundRef");
const viewportSize = ref<Point>({ x: 0, y: 0 });

const getPoint = (event: PointerEvent | WheelEvent): Point => {
  const rect = viewportRef.value?.getBoundingClientRect();
  return rect ? { x: event.clientX - rect.left, y: event.clientY - rect.top } : { x: 0, y: 0 };
};

const canvasColor = (name: string): string => {
  const viewport = viewportRef.value;
  return viewport ? getComputedStyle(viewport).getPropertyValue(name).trim() : "";
};

const setupCanvas = (canvas: HTMLCanvasElement): CanvasRenderingContext2D | null => {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(viewportSize.value.x * ratio);
  canvas.height = Math.round(viewportSize.value.y * ratio);
  const context = canvas.getContext("2d");
  if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return context;
};

const drawBackground = (): void => {
  const canvas = backgroundRef.value;
  if (!canvas) return;
  const context = setupCanvas(canvas);
  if (!context) return;
  const { x: width, y: height } = viewportSize.value;
  const topLeft = screenToWorld({ x: 0, y: 0 }, props.view);
  const bottomRight = screenToWorld({ x: width, y: height }, props.view);
  let step = GRID_SIZE;
  while (step * props.view.scale < 14) step *= 2;
  context.fillStyle = canvasColor("--whiteboard-grid");
  const radius = Math.max(.7, Math.min(2.2, 1.1 * props.view.scale));
  for (let x = Math.floor(topLeft.x / step) * step; x < bottomRight.x; x += step) {
    for (let y = Math.floor(topLeft.y / step) * step; y < bottomRight.y; y += step) {
      const point = worldToScreen({ x, y }, props.view);
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.strokeStyle = canvasColor("--whiteboard-connection");
  context.lineWidth = Math.max(1.5, 2 * props.view.scale);
  props.content.connections.forEach((connection) => {
    const from = getNote(props.content.notes, connection.from);
    const to = getNote(props.content.notes, connection.to);
    if (!from || !to) return;
    const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
    const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
    const start = worldToScreen(getEdgePoint(from, toCenter), props.view);
    const end = worldToScreen(getEdgePoint(to, fromCenter), props.view);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowSize = 9 * props.view.scale;

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.fillStyle = canvasColor("--whiteboard-connection");
    context.beginPath();
    context.moveTo(end.x, end.y);
    context.lineTo(end.x - arrowSize * Math.cos(angle - .4), end.y - arrowSize * Math.sin(angle - .4));
    context.lineTo(end.x - arrowSize * Math.cos(angle + .4), end.y - arrowSize * Math.sin(angle + .4));
    context.closePath();
    context.fill();
  });
};

const drawForeground = (): void => {
  const canvas = foregroundRef.value;
  if (!canvas) return;
  const context = setupCanvas(canvas);
  if (!context) return;
  props.content.strokes.forEach((stroke) => {
    const first = stroke.points[0];
    if (!first) return;
    context.strokeStyle = stroke.color;
    context.lineWidth = Math.max(1, stroke.width * props.view.scale);
    context.lineJoin = "round";
    context.lineCap = "round";
    context.beginPath();
    const start = worldToScreen(first, props.view);
    context.moveTo(start.x, start.y);
    stroke.points.slice(1).forEach((point) => {
      const current = worldToScreen(point, props.view);
      context.lineTo(current.x, current.y);
    });
    context.stroke();
  });
  const pending = props.pendingConnection;
  if (!pending) return;
  const note = getNote(props.content.notes, pending.from);
  if (!note) return;
  const start = worldToScreen(getEdgePoint(note, pending.point), props.view);
  const end = worldToScreen(pending.point, props.view);
  context.setLineDash([6, 5]);
  context.strokeStyle = canvasColor("--whiteboard-accent");
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
};

const measure = (): void => {
  const rect = viewportRef.value?.getBoundingClientRect();
  if (!rect) return;
  const size = { x: rect.width, y: rect.height };
  viewportSize.value = size;
  emit("resize", size);
};

const capturePointer = (event: PointerEvent): void => {
  const viewport = viewportRef.value;
  if (viewport) viewport.setPointerCapture(event.pointerId);
};

const onNotePointerDown = (event: PointerEvent, id: string): void => emit("notePointer", id, getPoint(event));
const onNoteResizeDown = (event: PointerEvent, id: string): void => emit("noteResize", id, getPoint(event));
const onWindowMove = (event: PointerEvent): void => emit("move", event, getPoint(event));
const onWindowRelease = (event: PointerEvent): void => emit("release", getPoint(event));
const onWindowCancel = (event: PointerEvent): void => emit("cancel", event);
let observer: ResizeObserver | null = null;
onMounted(() => {
  measure();
  observer = new ResizeObserver(measure);
  if (viewportRef.value) observer.observe(viewportRef.value);
  window.addEventListener("pointermove", onWindowMove);
  window.addEventListener("pointerup", onWindowRelease);
  window.addEventListener("pointercancel", onWindowCancel);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  window.removeEventListener("pointermove", onWindowMove);
  window.removeEventListener("pointerup", onWindowRelease);
  window.removeEventListener("pointercancel", onWindowCancel);
});

watch(
  () => [props.content, props.view, props.pendingConnection, viewportSize.value],
  () => {
    drawBackground();
    drawForeground();
  },
  { deep: true, flush: "post" }
);
</script>
<template>
  <main
    ref="viewportRef"
    class="whiteboard-viewport"
    :class="`whiteboard-viewport--${tool}`"
    @pointerdown="capturePointer($event); emit('pointer', $event, getPoint($event))"
    @wheel.prevent="emit('wheel', $event, getPoint($event))"
  >
    <canvas ref="backgroundRef" class="whiteboard-viewport__canvas" aria-hidden="true"></canvas>
    <section
      class="whiteboard-viewport__world"
      :style="{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }"
    >
      <WhiteboardStickyNote
        v-for="note in content.notes"
        :key="note.id"
        :note="note"
        :selected="selectedId === note.id"
        :editing="editingId === note.id"
        :tool="tool"
        @pointerdown="onNotePointerDown($event, note.id)"
        @resize="onNoteResizeDown($event, note.id)"
        @edit="emit('edit', note.id)"
        @finish-edit="emit('finishEdit', note.id)"
        @text="emit('text', note.id, $event)"
        @remove="emit('remove', note.id)"
      />
    </section>
    <canvas ref="foregroundRef" class="whiteboard-viewport__canvas" aria-hidden="true"></canvas>
    <WhiteboardMinimap :content="content" :view="view" :size="viewportSize" @navigate="emit('navigate', $event)" />
    <p class="whiteboard-viewport__hint">
      <b>拖拽</b> 平移 · <b>滚轮</b> 缩放 · <b>双击</b> 编辑便签 · <b>右键</b> 删除 · <b>空格</b> 临时抓手
    </p>
  </main>
</template>

<style scoped src="../styles/whiteboard-viewport.css"></style>
