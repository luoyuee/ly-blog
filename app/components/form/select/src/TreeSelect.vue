<script setup lang="ts">
/**
 * TreeSelect 树形选择器组件
 *
 * 功能特性：
 * - 支持单选/多选模式
 * - 支持父子节点联动选择（关联模式）
 * - 支持自定义字段名映射
 * - 支持只选择叶子节点
 * - 支持三种父节点输出模式：auto/always/never
 *
 * @example
 * // 基础用法
 * <TreeSelect v-model="value" :items="treeData" />
 *
 * // 多选模式
 * <TreeSelect v-model="values" :items="treeData" multiple />
 *
 * // 父子联动选择
 * <TreeSelect v-model="values" :items="treeData" multiple :check-strictly="false" />
 */
import type { TreeItemSelectEvent } from "reka-ui";
import type { TreeItem } from "@nuxt/ui";
import type { PropType } from "vue";
import { flattenTreeItems, findParentChain, sortByDepth } from "#shared/utils/tree";
import { isArray, isNil } from "@/utils/typed";
import { computed, ref, watch } from "vue";

// ============================================================
// 类型定义
// ============================================================

/**
 * 外部值类型
 * 组件与父组件通信时使用的数据格式
 * - 单选模式：string | number | null
 * - 多选模式：Array<string | number> | null
 */
type ExternalValue = string | number | Array<string | number> | null;

/**
 * 内部值类型
 * 组件内部树形结构使用的数据格式
 * - 单选模式：TreeItem | undefined
 * - 多选模式：TreeItem[] | undefined
 */
type InternalValue = TreeItem | TreeItem[] | undefined;

/**
 * 字段名映射配置
 * 用于将用户自定义的字段名映射为组件内部统一格式
 */
type FieldNames = {
  label?: string;
  value?: string;
  children?: string;
  parent?: string;
};

// ============================================================
// Props & Model
// ============================================================

/**
 * 组件双向绑定值
 * 外部通过 v-model 传入和接收选中值
 */
const modelValue = defineModel<ExternalValue>({ default: null });

/**
 * 组件属性配置
 */
const props = defineProps({
  /**
   * 树形数据源
   * 支持自定义字段名，通过 fieldNames 配置
   */
  items: {
    type: Array as PropType<object[]>,
    default: () => []
  },

  /**
   * 是否开启多选模式
   * - true: 可选择多个节点
   * - false: 只能选择一个节点
   */
  multiple: {
    type: Boolean,
    default: false
  },

  /**
   * 占位符文本
   * 无选中值时显示
   */
  placeholder: {
    type: String,
    default: "请选择"
  },

  /**
   * 是否禁用组件
   */
  disabled: {
    type: Boolean,
    default: false
  },

  /**
   * 是否显示清除按钮
   * 有选中值时显示清除图标
   */
  clearable: {
    type: Boolean,
    default: true
  },

  /**
   * 多选模式下显示的最大标签数量
   * 超出部分以 "+N" 形式显示
   */
  maxTagCount: {
    type: Number,
    default: 999
  },

  /**
   * 控制父子节点选中关联性
   * - true: 父子节点独立选择（严格模式）
   * - false: 父子节点联动选择（关联模式）
   *
   * 注意：仅在多选模式下生效
   */
  checkStrictly: {
    type: Boolean,
    default: true
  },

  /**
   * 字段名映射配置
   * 用于适配不同数据源的字段命名
   *
   * @example
   * fieldNames: { label: 'name', value: 'id', children: 'nodes' }
   */
  fieldNames: {
    type: Object as PropType<FieldNames>,
    default: () => ({})
  },

  /**
   * 是否只允许选择叶子节点
   * - true: 只能选择没有子节点的节点
   * - false: 可以选择任意节点
   */
  leafOnly: {
    type: Boolean,
    default: false
  },

  /**
   * 多选父子关联模式下，结果是否包含父节点
   *
   * - 'auto': 子节点全选时自动包含父节点（默认）
   * - 'always': 始终包含所有祖先节点
   * - 'never': 从不包含父节点（仅 UI 展示联动效果）
   *
   * 注意：仅在关联模式（checkStrictly=false）下生效
   */
  includeParentMode: {
    type: String as PropType<"auto" | "always" | "never">,
    default: "auto"
  }
});

// ============================================================
// 计算属性 - 配置相关
// ============================================================

/**
 * 合并后的字段名配置
 * 将用户配置与默认值合并，确保所有字段都有值
 */
const mergedFieldNames = computed<Required<FieldNames>>(() => ({
  label: props.fieldNames.label || "label",
  value: props.fieldNames.value || "value",
  children: props.fieldNames.children || "children",
  parent: props.fieldNames.parent || "parentId"
}));

/**
 * 是否为关联选择模式
 * 满足以下条件时启用：
 * 1. 多选模式
 * 2. 非严格模式（checkStrictly = false）
 * 3. 非仅叶子节点模式（leafOnly = false）
 * 4. 所有节点都未禁用（disabled = false）
 *
 * 关联模式下：
 * - 选中父节点会自动选中所有子节点
 * - 选中所有子节点会自动选中父节点
 * - 部分选中子节点时父节点显示半选状态
 */
const isRelated = computed(
  () =>
    props.multiple &&
    normalizedFlatItems.value.every((item) => !item.disabled) &&
    !props.checkStrictly &&
    !props.leafOnly
);

/**
 * 空值配置
 * 根据单选/多选模式返回对应的空值
 */
const emptyVal = computed(() => ({
  internal: props.multiple ? [] : undefined,
  external: props.multiple ? [] : null
}));

/**
 * 判断外部选中值是否为空
 * 空字符串在本组件中与 null/undefined 一样视为无值，0 仍为有效值
 */
const isEmptyValue = (value: string | number | null | undefined) => {
  return isNil(value) || value === "";
};

/** 将外部值统一转换为有效值数组，集中处理单选/多选和空字符串 */
const getValidValues = (value?: ExternalValue) => {
  if (isNil(value)) return [];
  const values = isArray(value) ? value : [value];
  return values.filter((item) => !isEmptyValue(item));
};

/** 将内部选中项统一转换为有效节点数组，避免空字符串节点回写为有效值 */
const getSelectedItems = (value: InternalValue) => {
  if (isNil(value)) return [];
  const items = isArray(value) ? value : [value];
  return items.filter((item) => !isEmptyValue(item.value));
};

// ============================================================
// 计算属性 - 数据转换
// ============================================================

/**
 * 标准化树形数据
 * 将用户传入的数据格式转换为组件内部统一格式
 *
 * 转换内容：
 * 1. 字段名映射（label, value, children）
 * 2. 注入 parentId 字段，用于快速查找父节点
 * 3. 递归处理子节点
 *
 * @param items - 原始数据数组
 * @param parentValue - 父节点 value，用于注入 parentId
 * @returns 标准化后的 TreeItem 数组
 */
const normalizeItems = (items: object[], parentValue?: string | number): TreeItem[] => {
  const {
    label: labelKey,
    value: valueKey,
    children: childrenKey,
    parent: parentKey
  } = mergedFieldNames.value;

  return items.map((item) => {
    const record = item as Record<string, unknown>;
    const itemValue = record[valueKey] as string | number;

    const normalized: TreeItem = {
      ...item,
      label: record[labelKey] as string,
      value: itemValue,
      parentId: !isNil(parentValue) ? parentValue : record[parentKey]
    };

    const children = record[childrenKey] as object[] | undefined;
    if (children && children.length > 0) {
      normalized.children = normalizeItems(children, itemValue);
    }

    return normalized;
  });
};

/** 标准化后的树形数据（保持树形结构） */
const normalizedItems = computed<TreeItem[]>(() => normalizeItems(props.items));

/**
 * 扁平化后的树形数据
 * 将树形结构展开为一维数组，便于遍历和查找
 */
const normalizedFlatItems = computed(() =>
  flattenTreeItems(normalizedItems.value, {
    childrenKey: mergedFieldNames.value.children
  })
);

/**
 * 节点映射表
 * key: node.value, value: node
 * 用于通过 value 快速查找对应节点
 */
const normalizedMap = computed(() => {
  const map = new Map<string | number, TreeItem>();
  normalizedFlatItems.value.forEach((item) => {
    map.set(item.value, item);
  });
  return map;
});

// ============================================================
// 计算属性 - 选中状态
// ============================================================

/**
 * 是否有选中值
 * 基于归一后的外部值判断，兼容单选/多选和 0 值
 */
const hasSelected = computed(() => {
  return getValidValues(modelValue.value).length > 0;
});

/**
 * 获取选中项对应的展示标签
 * 只处理有效外部值；找不到对应节点时返回空字符串，交给 hasVisibleLabel 判断是否展示
 */
const selectedLabels = computed(() => {
  const values = getValidValues(modelValue.value);

  if (values.length === 0) {
    return [];
  }

  return props.multiple
    ? values.map((item) => normalizedMap.value.get(item)?.label || "")
    : [normalizedMap.value.get(values[0] as string | number)?.label || ""];
});

/** 是否存在可见的展示标签，避免有值但无匹配标签时按钮显示为空白 */
const hasVisibleLabel = computed(() => selectedLabels.value.some((label) => label.trim() !== ""));

// ============================================================
// 值转换函数
// ============================================================

/**
 * 将内部值转换为外部值
 *
 * 转换逻辑：
 * 1. 从 TreeItem 对象中提取 value 字段
 * 2. 根据 includeParentMode 决定是否包含祖先节点
 *
 * @param internal - 内部值（TreeItem 或 TreeItem[]）
 * @returns 外部值（value 或 value[]）
 */
const convertToExternalValue = (internal: InternalValue): ExternalValue => {
  // 空值处理：内部空节点或空字符串节点都不回写为有效值
  const selectedItems = getSelectedItems(internal);

  if (selectedItems.length === 0) {
    return null;
  }

  // 多选模式
  if (props.multiple) {
    // 去重并过滤 null/undefined（保留 0 等 falsy 值）
    const uniqueValues = Array.from(new Set(selectedItems.map((item) => item.value)));

    // 关联模式下的特殊处理
    if (isRelated.value) {
      // never 模式：只输出叶子节点值
      if (props.includeParentMode === "never") {
        return uniqueValues.filter((val) => {
          const item = normalizedMap.value.get(val);
          if (!item) return false;
          return !item?.children || item?.children.length === 0;
        });
      }

      // always 模式：包含所有祖先节点值
      if (props.includeParentMode === "always") {
        const result = new Set(uniqueValues);

        for (const val of uniqueValues) {
          const chain = findParentChain(normalizedFlatItems.value, val, {
            idKey: "value",
            parentKey: "parentId",
            includeSelf: false
          });
          chain.forEach((node) => result.add(node.value));
        }

        return [...result].filter((v) => !isEmptyValue(v));
      }
    }

    // auto 模式或非关联模式：直接返回去重后的值数组
    return uniqueValues;
  }

  // 单选模式：直接返回第一个值
  return selectedItems[0]?.value;
};

/**
 * 将外部值转换为内部值
 *
 * 转换逻辑：
 * 1. 根据外部值匹配对应的 TreeItem 对象
 * 2. 关联模式下，需要计算哪些父节点应该被选中
 *
 * 关联模式特殊处理：
 * - always 模式：外部值包含祖先节点，需过滤掉子节点未全选的父节点
 * - never 模式：外部值只包含叶子节点，内部值也只匹配叶子节点
 * - auto 模式：根据子节点选中状态自动判断父节点是否选中
 *
 * @param external - 外部值（value 或 value[]）
 * @returns 内部值（TreeItem 或 TreeItem[]）
 */
const convertToInternalValue = (external?: ExternalValue): InternalValue => {
  // 空值处理：空字符串视为无值，0 仍为有效值
  const values = getValidValues(external);

  if (values.length === 0) {
    return undefined;
  }

  // 多选模式
  if (props.multiple) {
    const uniqueValues = new Set(values);

    // 关联模式下的特殊处理
    if (isRelated.value) {
      /**
       * 按深度从深到浅排序
       * 确保子节点先于父节点处理，这样才能正确判断父节点是否应该被选中
       *
       * 示例：三级结构 A -> B -> C
       * 排序后：C, B, A
       * 处理顺序：先判断 C 是否选中，再根据 C 的状态判断 B，最后根据 B 的状态判断 A
       */
      const sortedByDepth = sortByDepth(normalizedFlatItems.value, {
        idKey: "value",
        parentKey: "parentId",
        order: "desc"
      });

      // 从叶子节点向上遍历，确定哪些节点应该被选中
      const selectedValueSet = new Set<string | number>();

      for (const item of sortedByDepth) {
        const children = item.children;

        // 叶子节点：直接根据外部值判断是否选中
        if (!children || children.length === 0) {
          if (uniqueValues.has(item.value)) {
            selectedValueSet.add(item.value);
          }
        } else {
          // 父节点：检查所有直接子节点是否全部被选中
          const allChildrenSelected = children.every((child) => selectedValueSet.has(child.value));
          if (allChildrenSelected) {
            selectedValueSet.add(item.value);
          }
        }
      }

      // 根据计算出的选中集合获取对应的 TreeItem 对象
      return Array.from(selectedValueSet)
        .map((val) => normalizedMap.value.get(val))
        .filter((item): item is TreeItem => !isNil(item));
    }

    // 非关联模式：直接根据外部值获取对应的 TreeItem 对象
    return Array.from(uniqueValues)
      .map((val) => normalizedMap.value.get(val))
      .filter((item): item is TreeItem => !isNil(item));
  }

  // 单选模式：直接返回对应的 TreeItem 对象
  return normalizedMap.value.get(values[0] as string | number);
};

// ============================================================
// 响应式状态
// ============================================================

/** 下拉面板展开/收起状态 */
const popoverOpen = ref(false);

/** 内部选中值，存储 UTree 组件的选中状态 */
const internalValue = ref<InternalValue>(undefined);

/** 展开的节点列表，存储需要展开的节点 value 值 */
const expanded = ref<string[]>([]);

// ============================================================
// 事件处理函数
// ============================================================

/**
 * 处理树节点选择事件
 * 阻止默认点击行为，避免重复触发选择
 */
const onSelect = (e: TreeItemSelectEvent<TreeItem>) => {
  if (e.detail.originalEvent.type === "click") {
    e.preventDefault();
  }
};

/**
 * 更新选中值
 * 当 UTree 组件选中状态变化时调用
 *
 * 处理流程：
 * 1. 更新内部值
 * 2. 转换为外部值并更新 modelValue
 * 3. 单选模式下自动关闭下拉面板
 */
const updateModelValue = (val: TreeItem | TreeItem[] | undefined) => {
  internalValue.value = val || emptyVal.value.internal;

  modelValue.value = convertToExternalValue(internalValue.value) || emptyVal.value.external;

  // 单选模式下选中后自动关闭下拉面板
  if (!props.multiple && val) {
    popoverOpen.value = false;
  }
};

/**
 * 处理下拉面板展开/收起
 *
 * 展开时的处理：
 * 1. 计算选中项的父节点链
 * 2. 自动展开这些父节点，使选中项可见
 */
const handlePopover = () => {
  if (props.disabled) return;

  // 展开下拉面板时，计算需要展开的父节点
  if (popoverOpen.value === false && normalizedFlatItems.value.length > 0 && hasSelected.value) {
    const values = getValidValues(modelValue.value);
    const expandedItems: Set<string> = new Set();

    // 遍历所有选中值，查找其父节点链
    for (const val of values) {
      const chain = findParentChain(normalizedFlatItems.value, val, {
        idKey: mergedFieldNames.value.value,
        parentKey: mergedFieldNames.value.parent,
        includeSelf: true
      });

      chain.forEach((node) => {
        if (node.value) {
          expandedItems.add(node.value);
        }
      });
    }

    expanded.value = Array.from(expandedItems);
  }

  popoverOpen.value = !popoverOpen.value;
};

/**
 * 清除选中值
 * 重置内部值和外部值，关闭下拉面板
 */
const handleClear = (e?: MouseEvent) => {
  e?.stopPropagation();

  if (props.disabled) return;

  internalValue.value = emptyVal.value.internal;
  modelValue.value = emptyVal.value.external;
  popoverOpen.value = false;
  expanded.value = [];
};

/**
 * 判断节点是否显示复选框
 * leafOnly 模式下只在叶子节点显示复选框
 */
const showCheckbox = (item: TreeItem) => {
  return !props.leafOnly || (props.leafOnly && (!item.children || item.children.length === 0));
};

// ============================================================
// 监听器 - 双向绑定同步
// ============================================================

/**
 * 监听外部值变化，同步到内部值
 * 实现双向绑定的核心逻辑
 */
watch(
  modelValue,
  (newValue) => {
    internalValue.value = convertToInternalValue(newValue) || emptyVal.value.internal;
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <UPopover
    v-model:open="popoverOpen"
    class="min-w-50"
    :disabled="disabled"
    :content="{
      collisionPadding: {
        left: 0,
        right: 0
      }
    }"
    :ui="{ content: 'w-(--reka-popper-anchor-width)' }"
  >
    <!-- 触发器：选择按钮 -->
    <template #anchor>
      <UButton
        color="neutral"
        variant="outline"
        class="w-full justify-between"
        :disabled="props.disabled"
        @click="handlePopover"
      >
        <!-- 显示区域 -->
        <div class="truncate pointer-events-none">
          <!-- 多选模式：显示标签列表 -->
          <template v-if="props.multiple && hasVisibleLabel">
            <div class="flex flex-wrap gap-1 overflow-hidden">
              <UBadge
                v-for="(label, index) in selectedLabels.slice(0, props.maxTagCount)"
                :key="`${label}${index}`"
                color="neutral"
                variant="outline"
                size="sm"
                :ui="{
                  base: 'py-0 text-sm'
                }"
              >
                {{ label }}
              </UBadge>
              <!-- 超出最大显示数量的标签 -->
              <div v-if="selectedLabels.length > props.maxTagCount" class="text-muted">
                +{{ selectedLabels.length - props.maxTagCount }}
              </div>
            </div>
          </template>

          <!-- 单选模式：显示单个标签 -->
          <template v-else-if="hasVisibleLabel">
            {{ selectedLabels[0] }}
          </template>

          <!-- 无选中值：显示占位符 -->
          <template v-else>
            <span class="text-dimmed">{{ placeholder }}</span>
          </template>
        </div>

        <!-- 后缀图标 -->
        <template #trailing>
          <!-- 清除按钮：有选中值且可清除时显示 -->
          <UIcon
            v-if="props.clearable && hasSelected && !props.disabled"
            name="lucide:x"
            class="cursor-pointer shrink-0 text-muted size-5"
            @click.stop="handleClear"
          />
          <!-- 展开/收起箭头 -->
          <UIcon
            v-else
            class="shrink-0 text-dimmed size-5 transition-transform duration-200"
            name="lucide:chevron-down"
            :class="{
              'rotate-180': popoverOpen,
              'opacity-75': props.disabled
            }"
          />
        </template>
      </UButton>
    </template>

    <!-- 下拉内容：树形选择器 -->
    <template #content>
      <!-- 有数据时显示树形结构 -->
      <div v-if="normalizedItems.length > 0" class="p-2 min-w-50 max-h-100 overflow-y-auto">
        <UTree
          :key="normalizedFlatItems.length"
          v-model:expanded="expanded"
          :model-value="internalValue"
          :items="normalizedItems"
          :multiple="props.multiple"
          :bubble-select="isRelated"
          :propagate-select="isRelated"
          :get-key="(item) => item.value"
          @select="onSelect"
          @update:model-value="updateModelValue"
        >
          <!-- 自定义节点前缀：复选框 -->
          <template #item-leading="{ item, selected, indeterminate, handleSelect }">
            <UCheckbox
              v-if="showCheckbox(item)"
              :model-value="indeterminate ? 'indeterminate' : selected"
              :disabled="item.disabled"
              tabindex="-1"
              @change="handleSelect"
              @click.stop
            />
          </template>
        </UTree>
      </div>

      <!-- 无数据时显示空状态 -->
      <div v-else>
        <div class="text-center text-muted p-2.5 text-sm">暂无数据</div>
      </div>
    </template>
  </UPopover>
</template>
