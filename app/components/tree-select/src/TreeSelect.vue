<template>
  <UPopover
    v-model:open="open"
    class="min-w-[200px]"
    modal
    :disabled="props.disabled"
    :content="{
      collisionPadding: {
        left: 0,
        right: 0
      }
    }"
    :ui="{ content: 'w-(--reka-popper-anchor-width)' }"
  >
    <template #anchor>
      <UButton
        color="neutral"
        variant="outline"
        class="w-full justify-between"
        :disabled="props.disabled"
        @click="handleClick"
      >
        <div class="truncate pointer-events-none">
          <template v-if="props.multiple && selectedLabels.length > 0">
            <div class="flex flex-wrap gap-1 overflow-hidden">
              <div v-for="(label, index) in displayedLabels" :key="index" class="truncate">
                {{ label }}{{ index < displayedLabels.length - 1 ? "," : "" }}
              </div>
              <div v-if="selectedLabels.length > displayedLabels.length" class="opacity-50">
                +{{ selectedLabels.length - displayedLabels.length }}
              </div>
            </div>
          </template>
          <template v-else-if="selectedLabel">
            {{ selectedLabel }}
          </template>
          <template v-else>
            <span class="text-dimmed">{{ placeholder }}</span>
          </template>
        </div>

        <template #trailing>
          <UIcon
            v-if="hasSelected"
            name="lucide:x"
            class="cursor-pointer"
            :class="{ 'opacity-50': props.disabled }"
            @click.stop="handleClear"
          />
          <UIcon
            v-else
            :name="open ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            :class="{ 'opacity-50': props.disabled }"
          />
        </template>
      </UButton>
    </template>

    <template #content>
      <div class="w-full">
        <div v-if="searchable" class="p-2 border-b border-gray-200 dark:border-gray-700">
          <UInput
            v-model="searchQuery"
            class="w-full"
            placeholder="搜索..."
            autofocus
            icon="lucide:search"
            @focus="handleSearchFocus"
          />
        </div>

        <div class="max-h-[300px] overflow-y-auto">
          <ul v-if="filteredNodes.length" class="space-y-1 p-1">
            <TreeNode
              v-for="node in filteredNodes"
              :key="node[props.valueKey]"
              :node="node"
              :selected="selectedIds"
              :expanded="expandedIds"
              :depth="0"
              :label-key="props.labelKey"
              :value-key="props.valueKey"
              :multiple="multiple"
              :indeterminate="indeterminateIds"
              @select="handleSelect"
              @toggle="handleToggle"
            />
          </ul>
          <div v-else class="p-4 text-center text-gray-500">
            {{ searchQuery ? "未找到匹配项" : "无数据" }}
          </div>
        </div>

        <!-- 多选模式底部操作区 -->
        <div
          v-if="multiple && filteredNodes.length"
          class="p-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center"
        >
          <div class="text-sm text-gray-500"> 已选择 {{ selectedIds.length }} 项 </div>
          <button
            class="text-sm cursor-pointer"
            :class="
              isAllSelected
                ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
                : 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'
            "
            @click="handleToggleSelectAll"
          >
            {{ isAllSelected ? "清除" : "全选" }}
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { ITreeNode, IndeterminateState, TreeSelectValue } from "./types";
import TreeNode from "./TreeNode.vue";
import { ref, computed, watch, type PropType } from "vue";

// 使用defineModel定义支持多选的模型值
const modelValue = defineModel<TreeSelectValue>();

const props = defineProps({
  options: {
    type: Array as PropType<ITreeNode[]>,
    default: () => []
  },
  placeholder: {
    type: String,
    default: "请选择"
  },
  searchable: {
    type: Boolean,
    default: false
  },
  labelKey: {
    type: String,
    default: "label"
  },
  valueKey: {
    type: String,
    default: "id"
  },
  disabled: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  },
  // 控制父子节点选中关联性
  checkStrictly: {
    type: Boolean,
    default: false
  },
  // 多选模式下显示的标签数量
  maxTagCount: {
    type: Number,
    default: 3
  }
});

const open = ref(false);
// 用数组保存选中的ID，支持单选和多选
const selectedIds = ref<(string | number)[]>([]);
// 半选状态的节点ID
const indeterminateIds = ref<IndeterminateState>(new Set());
const expandedIds = ref<(string | number)[]>([]);
const searchQuery = ref("");

// 判断是否有选中值
const hasSelected = computed(() => {
  return props.multiple ? selectedIds.value.length > 0 : !!selectedIds.value[0];
});

// 判断是否全部选中
const isAllSelected = computed(() => {
  const allSelectableIds = getAllSelectableIds(props.options);
  const selectedSet = new Set(selectedIds.value);

  // 检查是否所有可选择的ID都已被选中
  return (
    allSelectableIds.every((id) => selectedSet.has(id)) &&
    allSelectableIds.length === selectedIds.value.length &&
    allSelectableIds.length > 0
  );
});

// 处理点击事件
const handleClick = () => {
  if (props.disabled) return;
  open.value = !open.value;
};

// 清除选择
const handleClear = (e?: MouseEvent) => {
  if (e) {
    e.stopPropagation();
  }

  if (props.disabled) return;

  selectedIds.value = [];
  indeterminateIds.value = new Set();

  if (props.multiple) {
    modelValue.value = [];
  } else {
    modelValue.value = null;
  }

  open.value = false;
};

// 递归查找节点
const findNode = <T,>(
  nodes: ITreeNode[],
  predicate: (node: ITreeNode) => boolean,
  mapper: (node: ITreeNode) => T | undefined
): T | undefined => {
  for (const node of nodes) {
    if (predicate(node)) return mapper(node);
    if (node.children?.length) {
      const result = findNode(node.children, predicate, mapper);
      if (result !== undefined) return result;
    }
  }
  return undefined;
};

/**
 * 获取节点的所有子孙节点ID（仅返回子孙，不包含自身；忽略禁用节点及其子孙）
 * 说明：之前的实现会把自身ID也加入，导致父节点在选择/取消选择时重复处理，
 * 在非严格模式下引发父节点半选状态判断混乱。这里改为只返回子孙节点。
 */
const getAllChildrenIds = (
  node: ITreeNode,
  result: (string | number)[] = []
): (string | number)[] => {
  if (node.disabled) return result;
  if (node.children?.length) {
    for (const child of node.children) {
      if (child.disabled) continue;
      // 先加入直接子节点，再递归其子孙
      result.push(child[props.valueKey] as string | number);
      getAllChildrenIds(child, result);
    }
  }
  return result;
};

/**
 * 获取所有可选的节点ID（排除禁用节点）
 */
const getAllSelectableIds = (
  nodes: ITreeNode[],
  result: (string | number)[] = []
): (string | number)[] => {
  for (const node of nodes) {
    if (!node.disabled) {
      result.push(node[props.valueKey] as string | number);
    }
    if (node.children?.length) {
      getAllSelectableIds(node.children, result);
    }
  }
  return result;
};

/**
 * 构建父子映射（仅直接子节点，忽略禁用）
 * 返回 Map<parentId, childIds[]>
 */
const buildParentToChildrenMap = (
  nodes: ITreeNode[]
): Map<string | number, (string | number)[]> => {
  const map = new Map<string | number, (string | number)[]>();
  const walk = (node: ITreeNode) => {
    if (node.disabled) return;
    const id = node[props.valueKey] as string | number;
    const childrenIds: (string | number)[] = [];
    if (node.children?.length) {
      for (const child of node.children) {
        if (child.disabled) continue;
        const cid = child[props.valueKey] as string | number;
        childrenIds.push(cid);
        walk(child);
      }
    }
    map.set(id, childrenIds);
  };
  for (const n of nodes) walk(n);
  return map;
};

/**
 * 更新半选状态（非严格模式下：基于“直接子节点”的选中情况计算）
 * 规则：
 * - 至少有一个直接子节点被选中，且未全部选中 => 父节点半选
 * - 全未选中或全选中 => 父节点不半选
 * 注：不考虑跨层汇总，保持逻辑直觉与实现简单。
 */
const updateIndeterminateState = (nodes: ITreeNode[]): void => {
  if (props.checkStrictly) {
    indeterminateIds.value = new Set();
    return;
  }
  const parentToChildren = buildParentToChildrenMap(nodes);
  const selectedSet = new Set(selectedIds.value);
  const nextIndeterminate = new Set<string | number>();

  parentToChildren.forEach((children, parentId) => {
    if (children.length === 0) return;
    const selectedCount = children.reduce(
      (acc: number, cid) => acc + (selectedSet.has(cid) ? 1 : 0),
      0
    );
    if (selectedCount > 0 && selectedCount < children.length) {
      nextIndeterminate.add(parentId);
    }
  });

  indeterminateIds.value = nextIndeterminate;
};

/**
 * 获取当前选中的节点标签
 */
const selectedLabel = computed(() => {
  const selectedId = selectedIds.value[0];
  if (!selectedId) return "";

  return (
    findNode(
      props.options,
      (node) => node[props.valueKey] === selectedId,
      (node) => String(node[props.labelKey] || "")
    ) || ""
  );
});

// 获取所有选中项的标签
const selectedLabels = computed(() => {
  if (!props.multiple || selectedIds.value.length === 0) return [];

  return selectedIds.value
    .map((id) =>
      findNode(
        props.options,
        (node) => node[props.valueKey] === id,
        (node) => String(node[props.labelKey] || "")
      )
    )
    .filter(Boolean) as string[];
});

// 获取要显示的标签
const displayedLabels = computed(() => {
  if (selectedLabels.value.length <= props.maxTagCount) {
    return selectedLabels.value;
  }
  return selectedLabels.value.slice(0, props.maxTagCount);
});

// 过滤节点（支持搜索）
const filteredNodes = computed(() => {
  if (!searchQuery.value) return props.options;

  const filterNode = (node: ITreeNode): ITreeNode | null => {
    const nodeLabel = String(node[props.labelKey] || "").toLowerCase();
    const query = searchQuery.value.toLowerCase();
    const isMatch = nodeLabel.includes(query);

    if (isMatch) return { ...node, children: undefined };

    if (node.children?.length) {
      const filteredChildren = node.children.map(filterNode).filter(Boolean) as ITreeNode[];

      if (filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
    }

    return null;
  };

  return props.options.map(filterNode).filter(Boolean) as ITreeNode[];
});

// 处理全选/清除按钮点击
const handleToggleSelectAll = () => {
  if (isAllSelected.value) {
    clearSelection();
  } else {
    selectAll();
  }
};

/**
 * 更新父节点选中状态（非严格模式）
 * 简化策略：仅根据“直接子节点”判定父节点选中/取消选中；
 * - 所有直接子节点已选中 => 选中父节点
 * - 所有直接子节点未选中 => 取消父节点
 * - 其他情况 => 保持父节点当前选中状态不变（由半选显示）
 * 为保证祖先链正确，循环至稳定（细但简单）。
 */
const updateParentSelection = () => {
  if (props.checkStrictly) return;
  const parentToChildren = buildParentToChildrenMap(props.options);
  const selectedSet = new Set<string | number>(selectedIds.value);

  let changed = true;
  while (changed) {
    changed = false;
    parentToChildren.forEach((children, parentId) => {
      if (children.length === 0) return;
      const allSelected = children.every((cid) => selectedSet.has(cid));
      const noneSelected = children.every((cid) => !selectedSet.has(cid));
      if (allSelected && !selectedSet.has(parentId)) {
        selectedSet.add(parentId);
        changed = true;
      } else if (noneSelected && selectedSet.has(parentId)) {
        selectedSet.delete(parentId);
        changed = true;
      }
    });
  }

  selectedIds.value = Array.from(selectedSet);
};

/**
 * 处理节点选择事件
 * 支持单选和多选模式
 */
const handleSelect = (id: string | number) => {
  if (props.multiple) {
    const index = selectedIds.value.indexOf(id);

    if (index === -1) {
      // 添加选中
      selectedIds.value = [...selectedIds.value, id];

      // 如果不是严格模式，同时选中子节点
      if (!props.checkStrictly) {
        const targetNode = findNode(
          props.options,
          (node) => node[props.valueKey] === id,
          (node) => node
        );

        if (targetNode && targetNode.children?.length) {
          const childIds = getAllChildrenIds(targetNode);
          // 合并去重
          const uniqueIds = new Set([...selectedIds.value, ...childIds]);
          selectedIds.value = Array.from(uniqueIds);
        }
      }
    } else {
      // 取消选中
      const newSelected = [...selectedIds.value];
      newSelected.splice(index, 1);
      selectedIds.value = newSelected;

      // 如果不是严格模式，同时取消选中子节点
      if (!props.checkStrictly) {
        const targetNode = findNode(
          props.options,
          (node) => node[props.valueKey] === id,
          (node) => node
        );

        if (targetNode && targetNode.children?.length) {
          const childIds = getAllChildrenIds(targetNode);
          selectedIds.value = selectedIds.value.filter((item) => !childIds.includes(item));
        }
      }
    }

    // 更新父节点选中状态
    updateParentSelection();

    // 更新半选状态
    updateIndeterminateState(props.options);

    // 更新模型值
    modelValue.value = [...selectedIds.value];
  } else {
    // 单选模式直接选中并关闭下拉框
    selectedIds.value = [id];
    open.value = false;
    modelValue.value = id;
  }
};

// 处理节点展开/折叠
const handleToggle = (id: string | number) => {
  const index = expandedIds.value.indexOf(id);
  if (index === -1) {
    expandedIds.value.push(id);
  } else {
    expandedIds.value.splice(index, 1);
  }
};

// 查找并展开到指定节点的路径
const expandParents = (
  targetId: string | number,
  nodes: ITreeNode[],
  path: (string | number)[] = []
): boolean => {
  for (const node of nodes) {
    if (node[props.valueKey] === targetId) {
      expandedIds.value = [...path];
      return true;
    }

    if (node.children?.length) {
      const newPath = [...path, node[props.valueKey]];
      if (expandParents(targetId, node.children, newPath)) {
        return true;
      }
    }
  }
  return false;
};

// 全选
const selectAll = () => {
  if (!props.multiple) return;

  const allIds = getAllSelectableIds(props.options);
  selectedIds.value = [...allIds];
  indeterminateIds.value = new Set();
  modelValue.value = [...allIds];
};

// 清除选择
const clearSelection = () => {
  selectedIds.value = [];
  indeterminateIds.value = new Set();

  if (props.multiple) {
    modelValue.value = [];
  } else {
    modelValue.value = null;
  }
};

// 搜索框聚焦时阻止事件冒泡，防止关闭弹出层
const handleSearchFocus = (e: FocusEvent) => {
  e.stopPropagation();
};

// 初始化和同步状态
watch(
  () => modelValue.value,
  (val) => {
    if (props.multiple && Array.isArray(val)) {
      selectedIds.value = [...val];
    } else if (val !== null && val !== undefined) {
      selectedIds.value = [val as string | number];
    } else {
      selectedIds.value = [];
    }

    // 更新半选状态
    updateIndeterminateState(props.options);

    // 如果是单选且有值，展开到该节点
    if (!props.multiple && selectedIds.value.length === 1 && selectedIds.value[0]) {
      expandParents(selectedIds.value[0], props.options);
    }
  },
  { immediate: true }
);

// 监听多选模式变化
watch(
  () => props.multiple,
  (isMultiple) => {
    // 切换到单选模式
    if (!isMultiple && selectedIds.value.length > 1) {
      // 保留第一个选中项
      const firstSelected = selectedIds.value[0];
      if (firstSelected !== null && firstSelected !== undefined) {
        selectedIds.value = [firstSelected];
        modelValue.value = firstSelected;
      }
    }
    // 切换到多选模式
    else if (isMultiple && !Array.isArray(modelValue.value)) {
      const currentValue = modelValue.value;
      if (currentValue !== null && currentValue !== undefined) {
        selectedIds.value = [currentValue as string | number];
        modelValue.value = [...selectedIds.value];
      } else {
        selectedIds.value = [];
        modelValue.value = [];
      }
    }

    // 重置半选状态
    updateIndeterminateState(props.options);
  }
);

// 监听严格模式变化，动态更新父子联动与半选状态
watch(
  () => props.checkStrictly,
  (isStrict) => {
    if (isStrict) {
      // 严格模式下不显示半选
      indeterminateIds.value = new Set();
    } else {
      // 非严格模式下需要根据当前选择重建父子关系与半选
      updateParentSelection();
      updateIndeterminateState(props.options);
    }
  },
  { immediate: true }
);
</script>
