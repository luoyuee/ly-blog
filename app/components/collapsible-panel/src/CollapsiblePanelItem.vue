<script setup lang="ts">
import type { PropType } from "vue";
import type { CollapsiblePanelContext } from "./CollapsiblePanel.vue";
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

const ctx = inject<CollapsiblePanelContext>("collapsiblePanel");
if (!ctx) {
  throw new Error("CollapsiblePanelItem must be used inside CollapsiblePanel");
}

const isOpen = computed(() => ctx.openKeys.value.includes(props.panelKey));

onMounted(() => {
  ctx.register(props.panelKey);
  if (!props.defaultOpen) {
    return;
  }

  if (ctx.isMultiple || !ctx.openKeys.value.length) {
    ctx.toggle(props.panelKey);
  }
});

onBeforeUnmount(() => {
  ctx.unregister(props.panelKey);
});
</script>

<template>
  <div class="panel-item">
    <div class="panel-head" @click="ctx.toggle(panelKey)">
      <UIcon v-if="icon" :name="icon" class="panel-icon" />
      <span class="panel-title">{{ title }}</span>
      <UIcon name="i-lucide-chevron-right" class="panel-arrow" :class="{ 'rotate-90': isOpen }" />
    </div>
    <div class="panel-body">
      <div class="panel-content">
        <slot :is-open="isOpen"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-item {
  display: contents;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
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
  overflow: hidden;
  min-height: 0;
}

.panel-content {
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding: 4px 10px 10px;
  font-size: 13px;
  line-height: 1.6;
}
</style>
