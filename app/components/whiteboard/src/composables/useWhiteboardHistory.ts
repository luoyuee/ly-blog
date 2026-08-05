import { cloneContent } from "../utils/geometry";
import type { WhiteboardContent } from "../types";

export const useWhiteboardHistory = (initialContent: WhiteboardContent) => {
  const entries = ref<readonly WhiteboardContent[]>([cloneContent(initialContent)]);
  const index = ref(0);
  const canUndo = computed(() => index.value > 0);
  const canRedo = computed(() => index.value < entries.value.length - 1);

  const push = (content: WhiteboardContent): void => {
    const nextEntries = [
      ...entries.value.slice(0, index.value + 1),
      cloneContent(content)
    ];
    entries.value = nextEntries;
    index.value = nextEntries.length - 1;
  };

  const reset = (content: WhiteboardContent): void => {
    entries.value = [cloneContent(content)];
    index.value = 0;
  };

  const previous = (): WhiteboardContent | null => {
    if (!canUndo.value) return null;
    index.value -= 1;
    const entry = entries.value[index.value];
    return entry ? cloneContent(entry) : null;
  };

  const next = (): WhiteboardContent | null => {
    if (!canRedo.value) return null;
    index.value += 1;
    const entry = entries.value[index.value];
    return entry ? cloneContent(entry) : null;
  };

  return { canUndo, canRedo, push, reset, previous, next };
};
