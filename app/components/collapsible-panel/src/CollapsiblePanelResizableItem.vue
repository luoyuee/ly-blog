<script setup lang="ts">
import type { PropType } from "vue";
import type { CollapsiblePanelResizableContext } from "./CollapsiblePanelResizable.vue";
import { computed, inject, onBeforeUnmount, onMounted } from "vue";

const props = defineProps({
  panelKey: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String as PropType<string | undefined>,
    default: undefined
  },
  defaultOpen: {
    type: Boolean,
    default: false
  }
});

const ctx = inject<CollapsiblePanelResizableContext>("collapsiblePanelResizable");

if (!ctx) {
  throw new Error("CollapsiblePanelResizableItem must be used inside CollapsiblePanelResizable");
}

const isOpen = computed(() => ctx.openKeys.value.includes(props.panelKey));
const bodyHeight = computed(() => (isOpen.value ? ctx.getBodyHeight(props.panelKey) : 0));
const isDragging = computed(() => ctx.isDragging.value);
const showResizeHandle = computed(() => isOpen.value && ctx.hasResizeHandle(props.panelKey));

const handleResizeMouseDown = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  ctx.startResize(props.panelKey, event);
};

onMounted(() => {
  ctx.register(props.panelKey);

  if (props.defaultOpen) {
    ctx.openByDefault(props.panelKey);
  }
});

onBeforeUnmount(() => {
  ctx.unregister(props.panelKey);
});
</script>

<template>
  <div
    class="panel-item"
    :class="{ dragging: isDragging }"
    :style="{ height: `${40 + bodyHeight}px` }"
  >
    <div class="panel-head" @click="ctx.toggle(panelKey)">
      <UIcon v-if="icon" :name="icon" class="panel-icon" />
      <span class="panel-title">{{ title }}</span>
      <UIcon name="i-lucide-chevron-right" class="panel-arrow" :class="{ 'rotate-90': isOpen }" />
    </div>

    <div class="panel-body" :style="{ height: `${bodyHeight}px` }">
      <div class="panel-content">
        <slot :is-open="isOpen"></slot>
      </div>
    </div>

    <div
      v-if="showResizeHandle"
      class="panel-resize-handle"
      role="separator"
      aria-orientation="horizontal"
      @mousedown="handleResizeMouseDown"
    ></div>
  </div>
</template>

<style scoped>
.panel-item {
  position: relative;
  overflow: hidden;
  transition: height 0.25s ease;
}

.panel-item.dragging {
  transition: none;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 8px 10px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: #8b8b8b;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
  white-space: nowrap;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.panel-head:hover {
  background: #2a2d2e;
  color: #cccccc;
}

.panel-head:hover .panel-arrow {
  color: #8b8b8b;
}

.panel-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.panel-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel-arrow {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #5a5a5a;
  transition: transform 0.2s ease;
}

.panel-body {
  min-height: 0;
  overflow: hidden;
  transition: height 0.25s ease;
}

.panel-item.dragging .panel-body {
  transition: none;
}

.panel-content {
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding: 4px 10px 10px;
  font-size: 13px;
  line-height: 1.6;
  background: #1e1e1e;
}

.panel-resize-handle {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  z-index: 1;
  height: 8px;
  cursor: ns-resize;
}

.panel-resize-handle::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 3px;
  height: 2px;
  background: transparent;
  transition: background-color 0.15s ease;
}

.panel-resize-handle:hover::after {
  background: var(--ui-primary);
}
</style>
