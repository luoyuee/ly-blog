<template>
  <li>
    <div
      class="flex items-center gap-1 py-1 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
      :class="{
        'bg-gray-50 dark:bg-gray-800/50': isSelected && !multiple,
        'opacity-50 cursor-not-allowed': node.disabled
      }"
      :style="{
        'padding-left': `calc(${depth}rem + 0.5rem)`,
        'padding-right': '0.5rem'
      }"
      @click.stop="handleNodeClick"
    >
      <!-- 折叠图标 -->
      <UIcon
        v-if="hasChildren"
        class="w-4 h-4 text-gray-400 cursor-pointer flex-shrink-0"
        :class="{ 'pointer-events-none': node.disabled }"
        :name="isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
        @click.stop="handleIconToggle"
      />
      <span v-else class="w-4 flex-shrink-0"></span>

      <!-- 复选框 (多选模式，移动到折叠按钮后面) -->
      <UCheckbox
        v-if="multiple"
        :model-value="checkboxState"
        class="mr-1 flex-shrink-0"
        :disabled="node.disabled"
        @click.stop="handleCheckboxClick"
      />

      <!-- 节点图标 -->
      <UIcon v-if="node.icon" :name="node.icon" class="w-4 h-4 mr-1 flex-shrink-0" />

      <span
        class="truncate"
        :class="{ 'text-blue-600 dark:text-blue-400 font-medium': isSelected }"
      >
        {{ node[props.labelKey] }}
      </span>
    </div>

    <UCollapsible v-if="hasChildren" :open="isExpanded" :transition="false">
      <template #content>
        <ul class="space-y-1">
          <TreeNode
            v-for="child in node.children"
            :key="child[props.valueKey]"
            :node="child"
            :selected="selected"
            :expanded="expanded"
            :depth="depth + 1"
            :label-key="props.labelKey"
            :value-key="props.valueKey"
            :multiple="multiple"
            :indeterminate="indeterminate"
            @select="$emit('select', $event)"
            @toggle="$emit('toggle', $event)"
          />
        </ul>
      </template>
    </UCollapsible>
  </li>
</template>

<script setup lang="ts">
import type { ITreeNode, IndeterminateState } from "./types";
import { computed, type PropType } from "vue";

const props = defineProps({
  node: {
    type: Object as PropType<ITreeNode>,
    required: true
  },
  selected: {
    type: [String, Number, Array] as PropType<string | number | null | (string | number)[]>,
    default: null
  },
  expanded: {
    type: Array as PropType<(string | number)[]>,
    default: () => []
  },
  depth: {
    type: Number,
    default: 0
  },
  labelKey: {
    type: String,
    default: "label"
  },
  valueKey: {
    type: String,
    default: "id"
  },
  multiple: {
    type: Boolean,
    default: false
  },
  indeterminate: {
    type: Object as PropType<IndeterminateState>,
    default: () => new Set()
  }
});

const emits = defineEmits(["select", "toggle"]);

// 统一类型：动态valueKey索引为 string | number
const nodeId = computed(() => props.node[props.valueKey] as string | number);

const hasChildren = computed(() => !!props.node.children?.length);
const isExpanded = computed(() => props.expanded.includes(nodeId.value));

// 判断节点是否被选中
const isSelected = computed(() => {
  // 无论单选还是多选，只要传入的是数组都按包含判断
  if (Array.isArray(props.selected)) {
    return props.selected.includes(nodeId.value);
  }
  return props.selected === nodeId.value;
});

// 判断是否为半选状态
const isIndeterminate = computed(() => props.indeterminate.has(nodeId.value));

// Nuxt UI 的 UCheckbox 不支持 indeterminate 布尔属性，
// 需通过 v-model 传入字符串 'indeterminate' 以显示不确定状态。
// 当为半选时返回 'indeterminate'，否则返回选中布尔值。
const checkboxState = computed<true | false | "indeterminate">(() => {
  return isIndeterminate.value ? "indeterminate" : isSelected.value;
});

// 点击节点
const handleNodeClick = () => {
  if (props.node.disabled) return;
  // 选择任意节点（禁用除外）
  emits("select", nodeId.value);
};

// 点击复选框
const handleCheckboxClick = (e: Event) => {
  e.stopPropagation();
  if (props.node.disabled) return;
  emits("select", nodeId.value);
};

// 点击图标展开/折叠
const handleIconToggle = (e: MouseEvent) => {
  e.stopPropagation();
  if (props.node.disabled) return;
  emits("toggle", nodeId.value);
};
</script>
