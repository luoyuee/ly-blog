import { clamp, cloneContent, connectionExists, getContentBounds, getNote, screenToWorld, strokeContainsPoint } from "../utils/geometry";
import { processStrokePoints, shouldSamplePoint } from "../utils/stroke-processing";
import { useWhiteboardHistory } from "./useWhiteboardHistory";
import { DEFAULT_NOTE_SIZE, ERASER_RADIUS, MAX_SCALE, MIN_NOTE_SIZE, MIN_SCALE, NOTE_COLORS, PEN_COLORS, PEN_COORDINATE_PRECISION, PEN_RDP_SCREEN_TOLERANCE, PEN_SAMPLE_SCREEN_DISTANCE, WHITEBOARD_TOOLS } from "../types";
import type { Point, StickyNote, ViewportTransform, WhiteboardContent, WhiteboardDocument, WhiteboardTool } from "../types";
type Gesture = { readonly kind: "pan"; readonly point: Point; readonly view: ViewportTransform } | { readonly kind: "drag"; readonly id: string; readonly point: Point; readonly note: StickyNote; readonly moved: boolean } | { readonly kind: "resize"; readonly id: string; readonly point: Point; readonly note: StickyNote } | { readonly kind: "pen"; readonly points: readonly Point[]; readonly sampleDistance: number; readonly simplifyTolerance: number } | { readonly kind: "erase"; readonly content: WhiteboardContent; readonly erased: boolean };
export const useWhiteboard = (initialContent: WhiteboardContent, onContentChange: (content: WhiteboardContent) => void) => {
  const tool = ref<WhiteboardTool>(WHITEBOARD_TOOLS.select), view = ref<ViewportTransform>({ x: 0, y: 0, scale: 1 });
  const content = ref<WhiteboardContent>(cloneContent(initialContent)), selectedId = ref<string | null>(null), editingId = ref<string | null>(null);
  const pendingConnection = ref<{ readonly from: string; readonly point: Point } | null>(null), noteColor = ref<string>(NOTE_COLORS[0]), penColor = ref<string>(PEN_COLORS[0]), penWidth = ref(4);
  const viewportSize = ref<Point>({ x: 0, y: 0 });
  const gesture = ref<Gesture | null>(null);
  const spaceHeld = ref(false);
  const hasInitialFit = ref(false);
  const editingBaseline = ref<string | null>(null);
  const history = useWhiteboardHistory(content.value);
  const selectedNote = computed(() => selectedId.value ? getNote(content.value.notes, selectedId.value) : undefined);
  const displayContent = computed<WhiteboardContent>(() => {
    const current = gesture.value;
    if (!current || current.kind !== "pen") return content.value;
    return {
      ...content.value,
      strokes: [...content.value.strokes, { id: "current", color: penColor.value, width: penWidth.value, points: current.points }]
    };
  });
  const replaceContent = (nextContent: WhiteboardContent): void => {
    const committedContent = cloneContent(nextContent);
    content.value = committedContent;
    onContentChange(committedContent);
  };
  const worldPoint = (point: Point): Point => screenToWorld(point, view.value);
  const save = (): void => history.push(content.value);
  const commitActiveEdit = (): void => {
    const id = editingId.value;
    const baseline = editingBaseline.value;
    if (!id) return;
    editingId.value = null;
    editingBaseline.value = null;
    if (getNote(content.value.notes, id)?.text !== baseline) save();
  };
  const exportDocument = (): WhiteboardDocument => {
    commitActiveEdit();
    const current = gesture.value;
    const exportContent = current?.kind === "pen" ? { ...content.value, strokes: [...content.value.strokes, { id: "current", color: penColor.value, width: penWidth.value, points: processStrokePoints(current.points, current.simplifyTolerance, PEN_COORDINATE_PRECISION) }] } : content.value;
    return { version: 1, content: cloneContent(exportContent), view: { ...view.value }, tool: tool.value, noteColor: noteColor.value, penColor: penColor.value, penWidth: penWidth.value };
  };
  const importDocument = (document: WhiteboardDocument): void => {
    const importedContent = cloneContent(document.content);
    replaceContent(importedContent);
    view.value = { ...document.view }; tool.value = document.tool;
    noteColor.value = document.noteColor; penColor.value = document.penColor; penWidth.value = document.penWidth;
    selectedId.value = null; editingId.value = null; editingBaseline.value = null;
    pendingConnection.value = null; gesture.value = null; spaceHeld.value = false;
    hasInitialFit.value = true;
    history.reset(importedContent);
  };
  const replaceFromExternal = (nextContent: WhiteboardContent): void => {
    const externalContent = cloneContent(nextContent);
    content.value = externalContent;
    selectedId.value = null; editingId.value = null; editingBaseline.value = null;
    pendingConnection.value = null; gesture.value = null; spaceHeld.value = false;
    history.reset(externalContent);
  };
  const select = (id: string | null): void => {
    if (editingId.value !== id) commitActiveEdit();
    selectedId.value = id;
  };
  const updateNotes = (update: (notes: readonly StickyNote[]) => readonly StickyNote[]): void => {
    replaceContent({ ...content.value, notes: update(content.value.notes) });
  };
  const eraseStrokesAt = (point: Point): boolean => {
    for (let index = content.value.strokes.length - 1; index >= 0; index -= 1) {
      const stroke = content.value.strokes[index];
      if (!stroke || !strokeContainsPoint(stroke, point, ERASER_RADIUS)) continue;
      replaceContent({ ...content.value, strokes: content.value.strokes.filter((_, strokeIndex) => strokeIndex !== index) });
      return true;
    }
    return false;
  };
  const setTool = (nextTool: WhiteboardTool): void => {
    if (tool.value !== nextTool) commitActiveEdit();
    if (tool.value === WHITEBOARD_TOOLS.connect || nextTool === WHITEBOARD_TOOLS.connect) pendingConnection.value = null;
    tool.value = nextTool;
    if (nextTool !== WHITEBOARD_TOOLS.select) select(null);
  };
  const setPenColor = (color: string): void => { penColor.value = color; };
  const setPenWidth = (width: number): void => { penWidth.value = width; };
  const startEdit = (id: string): void => {
    const note = getNote(content.value.notes, id);
    editingBaseline.value = note?.text ?? null;
    editingId.value = id;
  };
  const resetZoom = (): void => { view.value = { ...view.value, scale: 1 }; };
  const setNoteText = (id: string, text: string): void => {
    updateNotes((notes) => notes.map((note) => note.id === id ? { ...note, text } : note));
  };
  const addNote = (point: Point): void => {
    const id = `note-${Date.now()}`;
    updateNotes((notes) => [...notes, {
      id,
      x: point.x - DEFAULT_NOTE_SIZE / 2,
      y: point.y - DEFAULT_NOTE_SIZE / 2,
      width: DEFAULT_NOTE_SIZE,
      height: DEFAULT_NOTE_SIZE,
      text: "",
      color: noteColor.value
    }]);
    save();
    selectedId.value = id;
    tool.value = WHITEBOARD_TOOLS.select;
    editingBaseline.value = "";
    editingId.value = id;
  };
  const deleteNote = (id: string): void => {
    replaceContent({ notes: content.value.notes.filter((note) => note.id !== id), strokes: content.value.strokes, connections: content.value.connections.filter((connection) => connection.from !== id && connection.to !== id) });
    if (selectedId.value === id) selectedId.value = null;
    if (editingId.value === id) editingId.value = null;
    save();
  };
  const finishEdit = (id: string): void => { if (editingId.value === id) commitActiveEdit(); };
  const changeNoteColor = (color: string): void => {
    noteColor.value = color;
    const note = selectedNote.value;
    if (!note) return;
    updateNotes((notes) => notes.map((item) => item.id === note.id ? { ...item, color } : item));
    save();
  };
  const setViewAt = (scale: number, screen: Point): void => {
    const world = worldPoint(screen);
    view.value = { x: screen.x - world.x * scale, y: screen.y - world.y * scale, scale };
  };
  const zoomBy = (factor: number): void => {
    setViewAt(clamp(view.value.scale * factor, MIN_SCALE, MAX_SCALE), {
      x: viewportSize.value.x / 2,
      y: viewportSize.value.y / 2
    });
  };
  const fit = (): void => {
    const bounds = getContentBounds(content.value);
    if (!bounds) {
      view.value = { x: viewportSize.value.x / 2, y: viewportSize.value.y / 2, scale: 1 };
      return;
    }
    const scale = clamp(Math.min((viewportSize.value.x - 160) / (bounds.maxX - bounds.minX || 1), (viewportSize.value.y - 160) / (bounds.maxY - bounds.minY || 1)), MIN_SCALE, 2);
    view.value = { x: viewportSize.value.x / 2 - (bounds.minX + bounds.maxX) / 2 * scale, y: viewportSize.value.y / 2 - (bounds.minY + bounds.maxY) / 2 * scale, scale };
  };
  const onViewportResize = (size: Point): void => {
    viewportSize.value = size;
    if (!hasInitialFit.value && size.x > 0 && size.y > 0) {
      hasInitialFit.value = true;
      fit();
    }
  };
  const restore = (nextContent: WhiteboardContent | null): void => {
    if (!nextContent) return;
    replaceContent(nextContent);
    select(null);
    pendingConnection.value = null;
  };
  const undo = (): void => restore(history.previous());
  const redo = (): void => restore(history.next());
  const onPointer = (event: PointerEvent, point: Point): void => {
    const world = worldPoint(point);
    if (event.button === 1 || tool.value === WHITEBOARD_TOOLS.pan || spaceHeld.value) { gesture.value = { kind: "pan", point, view: view.value }; return; }
    if (tool.value === WHITEBOARD_TOOLS.pen) { gesture.value = { kind: "pen", points: [world], sampleDistance: PEN_SAMPLE_SCREEN_DISTANCE / view.value.scale, simplifyTolerance: PEN_RDP_SCREEN_TOLERANCE / view.value.scale }; return; }
    if (tool.value === WHITEBOARD_TOOLS.eraser) {
      const contentAtStart = content.value;
      gesture.value = { kind: "erase", content: contentAtStart, erased: eraseStrokesAt(world) };
      return;
    }
    if (tool.value === WHITEBOARD_TOOLS.note) { addNote(world); return; }
    if (tool.value === WHITEBOARD_TOOLS.select) select(null);
    if (tool.value === WHITEBOARD_TOOLS.connect) pendingConnection.value = null;
  };
  const onMove = (event: PointerEvent, point: Point): void => {
    const world = worldPoint(point); const current = gesture.value;
    if (pendingConnection.value) pendingConnection.value = { ...pendingConnection.value, point: world };
    if (!current) return;
    if (current.kind === "pan") view.value = { ...current.view, x: current.view.x + point.x - current.point.x, y: current.view.y + point.y - current.point.y };
    if (current.kind === "drag") { updateNotes((notes) => notes.map((note) => note.id === current.id ? { ...note, x: current.note.x + world.x - current.point.x, y: current.note.y + world.y - current.point.y } : note)); gesture.value = { ...current, moved: true }; }
    if (current.kind === "resize") updateNotes((notes) => notes.map((note) => note.id === current.id ? { ...note, width: Math.max(MIN_NOTE_SIZE, current.note.width + world.x - current.point.x), height: Math.max(MIN_NOTE_SIZE, current.note.height + world.y - current.point.y) } : note));
    if (current.kind === "pen" && shouldSamplePoint(current.points[current.points.length - 1] ?? world, world, current.sampleDistance)) gesture.value = { ...current, points: [...current.points, world] };
    if (current.kind === "erase" && eraseStrokesAt(world)) gesture.value = { ...current, erased: true };
  };
  const onRelease = (point: Point): void => {
    const current = gesture.value;
    if (!current) return;
    if (current.kind === "drag") {
      const note = getNote(content.value.notes, current.id);
      if (note && (note.x !== current.note.x || note.y !== current.note.y)) save();
    }
    if (current.kind === "resize") {
      const note = getNote(content.value.notes, current.id);
      if (note && (note.width !== current.note.width || note.height !== current.note.height)) save();
    }
    if (current.kind === "pen" && current.points.length > 0) {
      const finalPoint = worldPoint(point);
      const lastPoint = current.points[current.points.length - 1];
      const acceptedPoints = lastPoint && lastPoint.x === finalPoint.x && lastPoint.y === finalPoint.y ? current.points : [...current.points, finalPoint];
      const points = processStrokePoints(acceptedPoints, current.simplifyTolerance, PEN_COORDINATE_PRECISION);
      replaceContent({ ...content.value, strokes: [...content.value.strokes, { id: `stroke-${Date.now()}`, color: penColor.value, width: penWidth.value, points }] });
      save();
    }
    if (current.kind === "erase" && current.erased) save();
    gesture.value = null;
  };
  const onCancel = (): void => {
    const current = gesture.value; if (!current) return;
    if (current.kind === "pan") view.value = current.view;
    if (current.kind === "drag") {
      updateNotes((notes) => notes.map((note) => note.id === current.id ? current.note : note));
    }
    if (current.kind === "resize") {
      updateNotes((notes) => notes.map((note) => note.id === current.id ? current.note : note));
    }
    if (current.kind === "erase") replaceContent(current.content);
    gesture.value = null;
  };
  const onNotePointer = (id: string, point: Point): void => {
    const note = getNote(content.value.notes, id); if (!note) return;
    if (tool.value === WHITEBOARD_TOOLS.connect) {
      if (!pendingConnection.value) { pendingConnection.value = { from: id, point: worldPoint(point) }; return; }
      const from = pendingConnection.value.from;
      if (from !== id && !connectionExists(content.value.connections, from, id)) { replaceContent({ ...content.value, connections: [...content.value.connections, { id: `connection-${Date.now()}`, from, to: id }] }); save(); }
      pendingConnection.value = null; return;
    }
    if (tool.value !== WHITEBOARD_TOOLS.select || editingId.value === id) return;
    select(id); gesture.value = { kind: "drag", id, point: worldPoint(point), note, moved: false };
  };
  const onNoteResize = (id: string, point: Point): void => { const note = getNote(content.value.notes, id); if (note) gesture.value = { kind: "resize", id, point: worldPoint(point), note }; };
  const onWheel = (event: WheelEvent, point: Point): void => setViewAt(clamp(view.value.scale * Math.exp(-event.deltaY * .0015), MIN_SCALE, MAX_SCALE), point);
  const onNavigate = (point: Point): void => { view.value = { ...view.value, x: viewportSize.value.x / 2 - point.x * view.value.scale, y: viewportSize.value.y / 2 - point.y * view.value.scale }; };
  const onKeydown = (event: KeyboardEvent): void => {
    if (editingId.value) { if (event.key === "Escape") finishEdit(editingId.value); return; }
    if (event.code === "Space") { spaceHeld.value = true; event.preventDefault(); return; }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? redo() : undo(); return; }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") { event.preventDefault(); redo(); return; }
    if ((event.key === "Delete" || event.key === "Backspace") && selectedId.value) { event.preventDefault(); deleteNote(selectedId.value); return; }
    if (event.key === "Escape") { pendingConnection.value = null; select(null); return; }
    const shortcuts: Record<string, WhiteboardTool> = { v: WHITEBOARD_TOOLS.select, h: WHITEBOARD_TOOLS.pan, n: WHITEBOARD_TOOLS.note, p: WHITEBOARD_TOOLS.pen, e: WHITEBOARD_TOOLS.eraser, c: WHITEBOARD_TOOLS.connect };
    const shortcut = shortcuts[event.key.toLowerCase()]; if (shortcut) setTool(shortcut);
  };
  const onKeyup = (event: KeyboardEvent): void => { if (event.code === "Space") spaceHeld.value = false; };
  onMounted(() => { window.addEventListener("keydown", onKeydown); window.addEventListener("keyup", onKeyup); });
  onBeforeUnmount(() => { window.removeEventListener("keydown", onKeydown); window.removeEventListener("keyup", onKeyup); });
  return { tool, view, displayContent, selectedId, editingId, pendingConnection, noteColor, penColor, penWidth, canUndo: history.canUndo, canRedo: history.canRedo, setTool, changeNoteColor, setPenColor, setPenWidth, undo, redo, zoomBy, resetZoom, fit, onPointer, onMove, onRelease, onCancel, onWheel, onViewportResize, onNotePointer, onNoteResize, startEdit, finishEdit, setNoteText, deleteNote, onNavigate, exportDocument, importDocument, replaceFromExternal };
};
