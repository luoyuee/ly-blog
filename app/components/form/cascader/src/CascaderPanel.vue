<script setup lang="ts">
import type { PropType } from "vue";
import type {
  CascaderColumn,
  CascaderFieldNames,
  CascaderItems,
  CascaderNode,
  CascaderPrimitive,
  CascaderSelectionState
} from "./types";
import { computed } from "vue";
import {
  getCascaderColumnKey,
  getCascaderDisplayState,
  getCascaderOutputSelection,
  isCascaderSelectable,
  normalizeCascaderItems,
  resolveCascaderSelection
} from "./utils";

const modelValue = defineModel<CascaderPrimitive[]>({ default: () => [] });

const props = defineProps({
  items: {
    type: Array as PropType<CascaderItems>,
    default: () => []
  },
  fieldNames: {
    type: Object as PropType<CascaderFieldNames>,
    default: () => ({
      label: "label",
      value: "value",
      children: "children",
      disabled: "disabled",
      leaf: "leaf"
    })
  },
  disabled: {
    type: Boolean,
    default: false
  },
  checkStrictly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  change: [value: CascaderPrimitive[]];
}>();

const normalizedItems = computed<CascaderColumn>(() => {
  return normalizeCascaderItems(props.items, props.fieldNames);
});

const displayState = computed(() => {
  return getCascaderDisplayState({
    sourceSelection: modelValue.value,
    rootNodes: normalizedItems.value,
    checkStrictly: props.checkStrictly
  });
});

const isNodeActive = (node: CascaderNode, columnIndex: number) => {
  return displayState.value.selection[columnIndex] === node.value;
};

const isNodeDisabled = (node: CascaderNode) => {
  return props.disabled || node.disabled;
};

const syncModelValue = (selection: CascaderSelectionState) => {
  const nextValue = getCascaderOutputSelection(selection);

  modelValue.value = nextValue;
  emit("change", nextValue);
};

const updateExpandedPath = (selection: CascaderSelectionState) => {
  modelValue.value = getCascaderOutputSelection(selection);
};

const handleExpand = (node: CascaderNode, columnIndex: number) => {
  if (isNodeDisabled(node)) {
    return;
  }

  const nextSelection = displayState.value.selection.slice(0, columnIndex);
  nextSelection[columnIndex] = node.value;
  updateExpandedPath(nextSelection);
};

const handleSelect = (node: CascaderNode, columnIndex: number) => {
  if (isNodeDisabled(node)) {
    return;
  }

  if (!isCascaderSelectable(node, props.checkStrictly)) {
    handleExpand(node, columnIndex);
    return;
  }

  const nextSelection = displayState.value.selection.slice(0, columnIndex);
  nextSelection[columnIndex] = node.value;

  const resolvedSelection = resolveCascaderSelection({
    sourceSelection: nextSelection,
    rootNodes: normalizedItems.value,
    checkStrictly: props.checkStrictly
  }).selection;

  syncModelValue(resolvedSelection);
};
</script>

<template>
  <div class="flex bg-default">
    <div
      v-for="(column, columnIndex) in displayState.columns"
      :key="getCascaderColumnKey(column, columnIndex)"
      class="min-w-42 border-r border-default last:border-r-0"
    >
      <div class="max-h-68 overflow-y-auto">
        <div
          v-for="node in column"
          :key="String(node.value)"
          class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors"
          :class="[
            isNodeDisabled(node)
              ? 'cursor-not-allowed text-dimmed'
              : 'cursor-pointer text-default hover:bg-elevated hover:text-primary',
            isNodeActive(node, columnIndex) ? 'bg-elevated text-primary' : ''
          ]"
          @click="
            node.children.length > 0
              ? handleExpand(node, columnIndex)
              : handleSelect(node, columnIndex)
          "
          @keydown.enter="
            node.children.length > 0
              ? handleExpand(node, columnIndex)
              : handleSelect(node, columnIndex)
          "
          @keydown.space.prevent="
            node.children.length > 0
              ? handleExpand(node, columnIndex)
              : handleSelect(node, columnIndex)
          "
        >
          <UCheckbox
            size="sm"
            :model-value="isNodeActive(node, columnIndex)"
            :disabled="isNodeDisabled(node)"
            :ui="{ root: 'shrink-0', base: 'cursor-pointer' }"
            @click.stop="handleSelect(node, columnIndex)"
          />

          <span class="min-w-0 flex-1 truncate">{{ node.label }}</span>

          <UIcon
            v-if="node.children.length > 0"
            name="mdi:chevron-right"
            class="size-4 shrink-0"
            :class="isNodeActive(node, columnIndex) ? 'text-primary' : ''"
          />
        </div>
      </div>
    </div>
  </div>
</template>
