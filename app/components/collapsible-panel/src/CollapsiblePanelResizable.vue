<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type PropType,
  type Ref
} from "vue";

const HEADER_HEIGHT = 40;

const normalizeModelValue = (value: string[] | null | undefined): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item) => typeof item === "string" && item))];
};

const isSameKeys = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => item === right[index]);
};

const clamp = (value: number, min: number, max: number): number => {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
};

const roundHeights = (heights: number[], total: number): number[] => {
  if (!heights.length) {
    return [];
  }

  const rounded = heights.map((item) => Math.round(item));
  const diff = total - rounded.reduce((sum, item) => sum + item, 0);
  const lastIndex = rounded.length - 1;

  rounded[lastIndex] = (rounded[lastIndex] ?? 0) + diff;

  return rounded;
};

const distributeHeights = (
  keys: string[],
  source: Record<string, number>,
  total: number,
  minPanelHeight: number
): Record<string, number> => {
  const nextHeights: Record<string, number> = {};

  if (!keys.length || total <= 0) {
    return nextHeights;
  }

  const safeMin = Math.min(minPanelHeight, Math.floor(total / keys.length));
  const sourceValues = keys.map((key) => Math.max(source[key] ?? 0, 0));
  const sourceTotal = sourceValues.reduce((sum, item) => sum + item, 0);
  const availableRemainder = total - safeMin * keys.length;

  if (availableRemainder <= 0) {
    keys.forEach((key, index) => {
      nextHeights[key] = safeMin + (index === keys.length - 1 ? total - safeMin * keys.length : 0);
    });
    return nextHeights;
  }

  const weights = sourceTotal > 0 ? sourceValues : keys.map(() => 1);
  const weightTotal = weights.reduce((sum, item) => sum + item, 0);
  const distributed = roundHeights(
    weights.map((item) => (item / weightTotal) * availableRemainder),
    availableRemainder
  );

  keys.forEach((key, index) => {
    nextHeights[key] = safeMin + (distributed[index] ?? 0);
  });

  return nextHeights;
};

export interface CollapsiblePanelResizableContext {
  openKeys: Ref<string[]>;
  isDragging: Ref<boolean>;
  toggle: (key: string) => void;
  register: (key: string) => void;
  unregister: (key: string) => void;
  openByDefault: (key: string) => void;
  getBodyHeight: (key: string) => number;
  hasResizeHandle: (key: string) => boolean;
  startResize: (key: string, event: MouseEvent) => void;
}

const props = defineProps({
  modelValue: {
    type: Array as PropType<string[] | null>,
    default: null
  },
  minPanelHeight: {
    type: Number,
    default: 120
  }
});

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const openKeys = ref<string[]>(normalizeModelValue(props.modelValue));
const orderedKeys = ref<string[]>([]);
const bodyHeights = ref<Record<string, number>>({});
const containerHeight = ref(0);
const isDragging = ref(false);

let resizeObserver: ResizeObserver | null = null;
let dragCurrentKey = "";
let dragNextKey = "";
let dragStartCurrentHeight = 0;
let dragStartNextHeight = 0;
let dragStartY = 0;

const orderedOpenKeys = computed(() => {
  return orderedKeys.value.filter((key) => openKeys.value.includes(key));
});

const contentAreaHeight = computed(() => {
  return Math.max(containerHeight.value - orderedKeys.value.length * HEADER_HEIGHT, 0);
});

const syncHeights = (source: Record<string, number>) => {
  bodyHeights.value = distributeHeights(
    orderedOpenKeys.value,
    source,
    contentAreaHeight.value,
    props.minPanelHeight
  );
};

watch(
  () => props.modelValue,
  (value) => {
    const nextKeys = normalizeModelValue(value).filter((key) => orderedKeys.value.includes(key));

    if (!isSameKeys(openKeys.value, nextKeys)) {
      openKeys.value = nextKeys;
    }
  }
);

watch(
  openKeys,
  (value) => {
    const nextValue = [...value];

    if (!isSameKeys(normalizeModelValue(props.modelValue), nextValue)) {
      emit("update:modelValue", nextValue);
    }

    syncHeights(bodyHeights.value);
  },
  { deep: true }
);

watch(contentAreaHeight, () => {
  syncHeights(bodyHeights.value);
});

const updateContainerHeight = () => {
  containerHeight.value = containerRef.value?.clientHeight ?? 0;
};

const toggle = (key: string) => {
  const isOpen = openKeys.value.includes(key);

  openKeys.value = isOpen
    ? openKeys.value.filter((item) => item !== key)
    : [...openKeys.value, key];
};

const register = (key: string) => {
  if (!orderedKeys.value.includes(key)) {
    orderedKeys.value.push(key);
    syncHeights(bodyHeights.value);
  }
};

const unregister = (key: string) => {
  orderedKeys.value = orderedKeys.value.filter((item) => item !== key);
  openKeys.value = openKeys.value.filter((item) => item !== key);

  const { [key]: _removedHeight, ...nextHeights } = bodyHeights.value;
  bodyHeights.value = nextHeights;
  syncHeights(nextHeights);
};

const openByDefault = (key: string) => {
  if (!openKeys.value.includes(key)) {
    openKeys.value = [...openKeys.value, key];
  }
};

const getBodyHeight = (key: string): number => {
  return bodyHeights.value[key] ?? 0;
};

const hasResizeHandle = (key: string): boolean => {
  const index = orderedOpenKeys.value.indexOf(key);
  return index !== -1 && index < orderedOpenKeys.value.length - 1;
};

const handleResize = (event: MouseEvent) => {
  if (!dragCurrentKey || !dragNextKey) {
    return;
  }

  const total = dragStartCurrentHeight + dragStartNextHeight;
  const safeMin = Math.min(props.minPanelHeight, Math.floor(total / 2));
  const delta = event.clientY - dragStartY;
  const nextCurrentHeight = clamp(dragStartCurrentHeight + delta, safeMin, total - safeMin);
  const nextNextHeight = total - nextCurrentHeight;

  bodyHeights.value = {
    ...bodyHeights.value,
    [dragCurrentKey]: nextCurrentHeight,
    [dragNextKey]: nextNextHeight
  };
};

const stopResize = () => {
  isDragging.value = false;
  dragCurrentKey = "";
  dragNextKey = "";
  document.body.style.cursor = "";
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
};

const startResize = (key: string, event: MouseEvent) => {
  const index = orderedOpenKeys.value.indexOf(key);
  const nextKey = orderedOpenKeys.value[index + 1];

  if (!nextKey) {
    return;
  }

  dragCurrentKey = key;
  dragNextKey = nextKey;
  dragStartCurrentHeight = getBodyHeight(key);
  dragStartNextHeight = getBodyHeight(nextKey);
  dragStartY = event.clientY;
  isDragging.value = true;

  document.body.style.cursor = "ns-resize";
  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);
};

provide<CollapsiblePanelResizableContext>("collapsiblePanelResizable", {
  openKeys,
  isDragging,
  toggle,
  register,
  unregister,
  openByDefault,
  getBodyHeight,
  hasResizeHandle,
  startResize
});

onMounted(() => {
  updateContainerHeight();

  resizeObserver = new ResizeObserver(() => {
    updateContainerHeight();
  });

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  stopResize();
});
</script>

<template>
  <div ref="containerRef" class="collapsible-panel-resizable" :class="{ dragging: isDragging }">
    <slot></slot>
  </div>
</template>

<style scoped>
.collapsible-panel-resizable {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.collapsible-panel-resizable.dragging {
  user-select: none;
}
</style>
