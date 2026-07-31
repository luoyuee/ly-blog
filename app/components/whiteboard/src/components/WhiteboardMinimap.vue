<script setup lang="ts">
import type { PropType } from "vue";
import { getContentBounds, screenToWorld } from "../utils/geometry";
import type { Point, ViewportTransform, WhiteboardContent } from "../types";

type Projection = {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
};

const props = defineProps({
  content: { type: Object as PropType<WhiteboardContent>, required: true },
  view: { type: Object as PropType<ViewportTransform>, required: true },
  size: { type: Object as PropType<Point>, required: true }
});

const emit = defineEmits<{ navigate: [point: Point] }>();
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef");
const projection = ref<Projection>({ scale: 1, offsetX: 0, offsetY: 0 });
const dragOffset = ref<Point | null>(null);

const createProjection = (width: number, height: number): Projection => {
  const topLeft = screenToWorld({ x: 0, y: 0 }, props.view);
  const bottomRight = screenToWorld(props.size, props.view);
  const contentBounds = getContentBounds(props.content);
  const minX = Math.min(contentBounds?.minX ?? topLeft.x, topLeft.x);
  const minY = Math.min(contentBounds?.minY ?? topLeft.y, topLeft.y);
  const maxX = Math.max(contentBounds?.maxX ?? bottomRight.x, bottomRight.x);
  const maxY = Math.max(contentBounds?.maxY ?? bottomRight.y, bottomRight.y);
  const scale = Math.min((width - 28) / Math.max(maxX - minX, 1), (height - 28) / Math.max(maxY - minY, 1));

  return {
    scale,
    offsetX: (width - (maxX - minX) * scale) / 2 - minX * scale,
    offsetY: (height - (maxY - minY) * scale) / 2 - minY * scale
  };
};

const project = (point: Point): Point => ({
  x: point.x * projection.value.scale + projection.value.offsetX,
  y: point.y * projection.value.scale + projection.value.offsetY
});

const unproject = (point: Point): Point => ({
  x: (point.x - projection.value.offsetX) / projection.value.scale,
  y: (point.y - projection.value.offsetY) / projection.value.scale
});

const drawStroke = (context: CanvasRenderingContext2D, points: readonly Point[], color: string): void => {
  const first = points[0];
  if (!first) return;
  const start = project(first);
  context.beginPath();
  context.moveTo(start.x, start.y);
  points.slice(1).forEach((point) => {
    const current = project(point);
    context.lineTo(current.x, current.y);
  });
  context.strokeStyle = color;
  context.lineWidth = 1;
  context.stroke();
};

const redraw = (): void => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const context = canvas.getContext("2d");
  if (!context) return;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  projection.value = createProjection(rect.width, rect.height);
  const tokens = getComputedStyle(canvas);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.fillStyle = tokens.getPropertyValue("--whiteboard-minimap").trim();
  context.fillRect(0, 0, rect.width, rect.height);
  props.content.notes.forEach((note) => {
    const point = project(note);
    context.fillStyle = note.color;
    context.fillRect(point.x, point.y, Math.max(3, note.width * projection.value.scale), Math.max(3, note.height * projection.value.scale));
  });
  props.content.strokes.forEach((stroke) => drawStroke(context, stroke.points, stroke.color));
  const topLeft = project(screenToWorld({ x: 0, y: 0 }, props.view));
  const bottomRight = project(screenToWorld(props.size, props.view));
  context.strokeStyle = tokens.getPropertyValue("--whiteboard-accent").trim();
  context.lineWidth = 1.5;
  context.strokeRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
};

const pointerPoint = (event: PointerEvent): Point => {
  const rect = canvasRef.value?.getBoundingClientRect();
  return rect ? { x: event.clientX - rect.left, y: event.clientY - rect.top } : { x: 0, y: 0 };
};

const viewportCenter = (): Point => screenToWorld({ x: props.size.x / 2, y: props.size.y / 2 }, props.view);

const onPointerDown = (event: PointerEvent): void => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const point = pointerPoint(event);
  const topLeft = project(screenToWorld({ x: 0, y: 0 }, props.view));
  const bottomRight = project(screenToWorld(props.size, props.view));
  const isInside = point.x >= topLeft.x && point.x <= bottomRight.x && point.y >= topLeft.y && point.y <= bottomRight.y;
  const world = unproject(point);
  dragOffset.value = isInside ? { x: world.x - viewportCenter().x, y: world.y - viewportCenter().y } : { x: 0, y: 0 };
  if (!isInside) emit("navigate", world);
  canvas.setPointerCapture(event.pointerId);
};

const onPointerMove = (event: PointerEvent): void => {
  const offset = dragOffset.value;
  if (!offset) return;
  const world = unproject(pointerPoint(event));
  emit("navigate", { x: world.x - offset.x, y: world.y - offset.y });
};

const stopDragging = (): void => {
  dragOffset.value = null;
};

watch(() => [props.content, props.view, props.size], redraw, { deep: true, flush: "post" });
onMounted(redraw);
</script>

<template>
  <aside class="whiteboard-minimap">
    <canvas
      ref="canvasRef"
      aria-label="白板缩略图"
      @pointerdown.stop="onPointerDown"
      @pointermove.stop="onPointerMove"
      @pointerup="stopDragging"
      @pointercancel="stopDragging"
    ></canvas>
  </aside>
</template>

<style scoped>
.whiteboard-minimap {
  position: absolute;
  right: var(--whiteboard-space-16);
  bottom: var(--whiteboard-space-16);
  z-index: 5;
  width: 208px;
  height: 140px;
  overflow: hidden;
  border: 1px solid var(--whiteboard-panel-line);
  border-radius: var(--whiteboard-radius-12);
  background: var(--whiteboard-minimap);
  box-shadow: var(--whiteboard-shadow-panel);
}

.whiteboard-minimap canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
  touch-action: none;
}

.whiteboard-minimap canvas:active {
  cursor: grabbing;
}
</style>
