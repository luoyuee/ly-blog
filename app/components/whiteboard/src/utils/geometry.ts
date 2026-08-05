import type { NoteConnection, PenStroke, Point, StickyNote, ViewportTransform, WhiteboardContent } from "../types";

export type Bounds = {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
};

export const clamp = (value: number, minimum: number, maximum: number): number => {
  return Math.max(minimum, Math.min(value, maximum));
};

export const screenToWorld = (point: Point, view: ViewportTransform): Point => ({
  x: (point.x - view.x) / view.scale,
  y: (point.y - view.y) / view.scale
});

export const worldToScreen = (point: Point, view: ViewportTransform): Point => ({
  x: point.x * view.scale + view.x,
  y: point.y * view.scale + view.y
});

/** Returns a new point with numeric world coordinates rounded to the requested decimal precision. */
export const roundPoint = (point: Point, precision: number): Point => {
  const factor = 10 ** precision;
  return { x: Math.round(point.x * factor) / factor, y: Math.round(point.y * factor) / factor };
};

export const getNote = (notes: readonly StickyNote[], id: string): StickyNote | undefined => {
  return notes.find((note) => note.id === id);
};

export const getEdgePoint = (note: StickyNote, target: Point): Point => {
  const center = { x: note.x + note.width / 2, y: note.y + note.height / 2 };
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const ratio = Math.max(Math.abs(dx / (note.width / 2)), Math.abs(dy / (note.height / 2)), 1);

  return { x: center.x + dx / ratio, y: center.y + dy / ratio };
};

/** Returns the shortest world-space distance between a point and a line segment. */
export const pointToSegmentDistance = (point: Point, start: Point, end: Point): number => {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;
  if (lengthSquared === 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const projection = clamp(((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) / lengthSquared, 0, 1);
  return Math.hypot(point.x - (start.x + deltaX * projection), point.y - (start.y + deltaY * projection));
};

/** Detects whether a circular eraser touches any rendered segment of a pen stroke. */
export const strokeContainsPoint = (stroke: PenStroke, point: Point, eraserRadius: number): boolean => {
  const firstPoint = stroke.points[0];
  if (!firstPoint) return false;
  const hitRadius = eraserRadius + stroke.width / 2;
  const remainingPoints = stroke.points.slice(1);
  if (remainingPoints.length === 0) return pointToSegmentDistance(point, firstPoint, firstPoint) <= hitRadius;
  return remainingPoints.some((end, index) => {
    const start = stroke.points[index];
    return start ? pointToSegmentDistance(point, start, end) <= hitRadius : false;
  });
};

export const getContentBounds = (content: WhiteboardContent): Bounds | null => {
  const points: Point[] = [];
  content.notes.forEach((note) => {
    points.push({ x: note.x, y: note.y }, { x: note.x + note.width, y: note.y + note.height });
  });
  content.strokes.forEach((stroke) => points.push(...stroke.points));

  const firstPoint = points[0];
  if (!firstPoint) return null;

  return points.slice(1).reduce<Bounds>(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxX: Math.max(bounds.maxX, point.x),
      maxY: Math.max(bounds.maxY, point.y)
    }),
    { minX: firstPoint.x, minY: firstPoint.y, maxX: firstPoint.x, maxY: firstPoint.y }
  );
};

export const connectionExists = (
  connections: readonly NoteConnection[],
  from: string,
  to: string
): boolean => connections.some((connection) => {
  return (connection.from === from && connection.to === to) || (connection.from === to && connection.to === from);
});

export const cloneContent = (content: WhiteboardContent): WhiteboardContent => ({
  notes: content.notes.map((note) => ({ ...note })),
  strokes: content.strokes.map((stroke) => ({
    ...stroke,
    points: stroke.points.map((point) => ({ ...point }))
  })),
  connections: content.connections.map((connection) => ({ ...connection }))
});
