export const WHITEBOARD_TOOLS = {
  select: "select",
  pan: "pan",
  note: "note",
  pen: "pen",
  eraser: "eraser",
  connect: "connect"
} as const;

export type WhiteboardTool = (typeof WHITEBOARD_TOOLS)[keyof typeof WHITEBOARD_TOOLS];

export type Point = {
  readonly x: number;
  readonly y: number;
};

export type ViewportTransform = Point & {
  readonly scale: number;
};

export type StickyNote = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly text: string;
  readonly color: string;
};

export type PenStroke = {
  readonly id: string;
  readonly color: string;
  readonly width: number;
  readonly points: readonly Point[];
};

export type NoteConnection = {
  readonly id: string;
  readonly from: string;
  readonly to: string;
};

export type WhiteboardContent = {
  readonly notes: readonly StickyNote[];
  readonly strokes: readonly PenStroke[];
  readonly connections: readonly NoteConnection[];
};

export type WhiteboardDocument = {
  readonly version: 1;
  readonly content: WhiteboardContent;
  readonly view: ViewportTransform;
  readonly tool: WhiteboardTool;
  readonly noteColor: string;
  readonly penColor: string;
  readonly penWidth: number;
};

export const NOTE_COLORS = ["#FFE08A", "#C9F0CA", "#BFE3FF", "#FFC9DE", "#E3CFFF", "#FFD8A8"] as const;
export const PEN_COLORS = ["#1f2937", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"] as const;
export const GRID_SIZE = 40;
export const ERASER_RADIUS = 12;
export const MIN_NOTE_SIZE = 120;
export const DEFAULT_NOTE_SIZE = 190;
export const MIN_SCALE = 0.15;
export const MAX_SCALE = 5;
export const PEN_SAMPLE_SCREEN_DISTANCE = 0.75;
export const PEN_RDP_SCREEN_TOLERANCE = 0.35;
export const PEN_COORDINATE_PRECISION = 4;
