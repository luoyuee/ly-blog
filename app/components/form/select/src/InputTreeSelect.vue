<script setup lang="ts">
/**
 * InputTreeSelect 可输入树形选择器组件
 *
 * 在 TreeSelect 基础上扩展了自定义输入功能：
 * - 单选模式：支持从下拉框选择或手动输入值
 * - 多选模式：支持从下拉框多选 + 自定义输入标签
 *
 * 功能特性：
 * - 支持单选/多选模式
 * - 支持自定义输入（非下拉框选项）
 * - 支持父子节点联动选择（关联模式）
 * - 支持自定义字段名映射
 * - 支持只选择叶子节点
 * - 支持三种父节点输出模式：auto/always/never
 *
 * @example
 * // 单选 + 自定义输入
 * <InputTreeSelect v-model="value" :items="treeData" />
 *
 * // 多选 + 自定义输入
 * <InputTreeSelect v-model="values" :items="treeData" multiple />
 *
 * // 多选 + 父子联动
 * <InputTreeSelect v-model="values" :items="treeData" multiple :check-strictly="false" />
 */
import type { TreeItemSelectEvent } from "reka-ui";
import type { TreeItem } from "@nuxt/ui";
import type { PropType } from "vue";
import { flattenTreeItems, findParentChain, sortByDepth } from "#shared/utils/tree";
import { isArray, isEmpty, isNil } from "@/utils/typed";
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

/**
 * 自定义输入项类型
 * 多选模式下，用户手动输入的标签数据结构
 */
type InputItem = {
  /** 显示文本 */
  label: string;
  /** 值，与 modelValue 中的值对应 */
  value: string;
  /** 是否为自定义输入项 */
  isCustom?: boolean;
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
 * 基于外部值（modelValue）判断，兼容单选和多选
 * 注意：需兼容值为 0 的情况，不能用 !modelValue 判断
 */
const hasSelected = computed(() => {
  if (isNil(modelValue.value)) return false;
  return isArray(modelValue.value) ? modelValue.value.length > 0 : true;
});

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
  // 空值处理
  if (isNil(internal) || (Array.isArray(internal) && internal.length === 0)) {
    return null;
  }

  const items = isArray(internal) ? internal : [internal];

  // 多选模式
  if (props.multiple) {
    // 去重并过滤 null/undefined（保留 0 等 falsy 值）
    const uniqueValues = Array.from(
      new Set(items.map((item) => item.value).filter((v) => !isNil(v)))
    );

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

        return [...result].filter((v) => !isNil(v));
      }
    }

    // auto 模式或非关联模式：直接返回去重后的值数组
    return uniqueValues;
  }

  // 单选模式：直接返回第一个值
  return items[0]?.value;
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
  // 空值处理（兼容值为 0 的情况）
  if (isNil(external) || (isArray(external) && external.length === 0)) {
    return undefined;
  }

  const items = isArray(external) ? external : [external];

  // 多选模式
  if (props.multiple) {
    const uniqueValues = new Set(items);

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
  return normalizedMap.value.get(items[0] as string | number);
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
// 自定义输入相关状态
// ============================================================

/** 单选模式下输入框的值（手动输入时使用） */
const inputValue = ref<string | undefined>(undefined);

/** 多选模式下自定义输入的标签列表 */
const inputItems = ref<InputItem[]>([]);

/** 多选模式下是否显示标签输入框 */
const showInput = ref(false);

// ============================================================
// 计算属性 - 标签展示
// ============================================================

/**
 * 多选模式下显示的标签列表
 * 合并下拉框选中项和自定义输入项
 */
const showTags = computed(() => {
  const tags: InputItem[] = [];

  if (isArray(modelValue.value)) {
    modelValue.value.forEach((val) => {
      // 优先从下拉框数据中查找
      const item = normalizedMap.value.get(val);
      if (item) {
        tags.push({ label: item.label || "", value: item.value });
        return;
      }

      // 从自定义输入项中查找
      const customItem = inputItems.value.find((tag) => tag.value === val);
      if (customItem) {
        tags.push({ label: customItem.label || "", value: customItem.value, isCustom: true });
      }
    });
  }

  return tags;
});

// ============================================================
// 事件处理函数 - 通用
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
 * 多选模式：
 * 1. 将下拉框选中值转换为外部值
 * 2. 合并自定义输入的值
 * 3. 去重后赋值给 modelValue
 *
 * 单选模式：
 * 1. 更新输入框显示文本
 * 2. 转换为外部值赋值给 modelValue
 * 3. 自动关闭下拉面板
 */
const updateModelValue = (val: TreeItem | TreeItem[] | undefined) => {
  internalValue.value = val || emptyVal.value.internal;

  if (props.multiple) {
    // 将下拉框选中值转换为外部值
    const treeResult = convertToExternalValue(internalValue.value);
    const treeArray = isArray(treeResult) ? treeResult : [];
    // 合并自定义输入的值，去重
    const customValues = inputItems.value.map((item) => item.value);
    modelValue.value = [...new Set([...treeArray, ...customValues])];
  } else {
    const item = isArray(internalValue.value) ? internalValue.value[0] : internalValue.value;
    inputValue.value = item?.label || "";
    modelValue.value = convertToExternalValue(internalValue.value) || emptyVal.value.external;
  }

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
  if (
    popoverOpen.value === false &&
    normalizedFlatItems.value.length > 0 &&
    !isEmpty(modelValue.value)
  ) {
    const values = Array.isArray(modelValue.value) ? modelValue.value : [modelValue.value];
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
 * 清除所有选中值
 * 重置内部值、外部值、自定义输入项，关闭下拉面板
 */
const handleClear = (e?: MouseEvent) => {
  e?.stopPropagation();

  if (props.disabled) return;

  internalValue.value = emptyVal.value.internal;
  modelValue.value = emptyVal.value.external;
  popoverOpen.value = false;
  expanded.value = [];
  inputItems.value = [];
  showInput.value = false;
  inputValue.value = undefined;
};

/**
 * 判断节点是否显示复选框
 * leafOnly 模式下只在叶子节点显示复选框
 */
const showCheckbox = (item: TreeItem) => {
  return !props.leafOnly || (props.leafOnly && (!item.children || item.children.length === 0));
};

// ============================================================
// 事件处理函数 - 自定义输入
// ============================================================

/**
 * 单选模式下输入框值变化处理
 * 用户手动输入时，清空内部选中值，将输入值直接赋给 modelValue
 */
const handleInputChange = () => {
  internalValue.value = undefined;
  modelValue.value = inputValue.value || null;
};

/**
 * 多选模式下标签输入框失焦处理
 * 清空输入框并隐藏
 */
const blurTagInput = () => {
  inputValue.value = undefined;
  showInput.value = false;
};

/**
 * 多选模式下标签输入回车处理
 * 将输入值添加到自定义输入项列表，并更新外部值
 * 已存在的值不会重复添加
 */
const handleTagEnter = () => {
  if (inputValue.value) {
    // 检查是否已存在（同时在 modelValue 和 inputItems 中检查）
    const existingValues = isArray(modelValue.value) ? modelValue.value : [];
    if (existingValues.includes(inputValue.value)) {
      blurTagInput();
      return;
    }

    inputItems.value.push({
      label: inputValue.value,
      value: inputValue.value
    });

    blurTagInput();

    updateModelValue(internalValue.value);
  }
};

/**
 * 多选模式下删除自定义标签
 * 从自定义输入项和 modelValue 中同时移除
 */
const handleDelete = (e: InputItem) => {
  inputItems.value = inputItems.value.filter((item) => item.value !== e.value);

  if (isArray(modelValue.value)) {
    modelValue.value = modelValue.value.filter((item) => item !== e.value);
  }
};

// ============================================================
// 监听器 - 双向绑定同步
// ============================================================

/**
 * 监听外部值变化，同步到内部值
 *
 * 多选模式：
 * 1. 将外部值分为下拉框值和自定义值
 * 2. 下拉框值通过 convertToInternalValue 转换
 * 3. 自定义值直接赋值给 inputItems
 *
 * 单选模式：
 * 1. 下拉框值通过 convertToInternalValue 转换
 * 2. 非下拉框值直接显示在输入框中
 */
watch(
  modelValue,
  (newValue) => {
    if (props.multiple) {
      if (isArray(newValue) && newValue.length > 0) {
        // 将外部值分为下拉框值和自定义值
        const treeValues: Array<string | number> = [];
        const customItems: InputItem[] = [];

        newValue.forEach((val) => {
          if (normalizedMap.value.has(val as string | number)) {
            treeValues.push(val as string | number);
          } else {
            const cVal = val.toString();
            customItems.push({
              value: cVal,
              label: cVal
            });
          }
        });

        // 下拉框值使用 convertToInternalValue 处理
        internalValue.value = convertToInternalValue(treeValues) || emptyVal.value.internal;
        // 自定义值直接赋值给 inputItems
        inputItems.value = customItems;
      } else {
        internalValue.value = emptyVal.value.internal;
        inputValue.value = undefined;
        inputItems.value = [];
      }
    } else {
      const has = normalizedMap.value.has(newValue as string | number);
      if (has) {
        internalValue.value = convertToInternalValue(newValue) || emptyVal.value.internal;
      } else {
        internalValue.value = emptyVal.value.internal;
        inputValue.value = newValue as string;
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <UPopover
    v-model:open="popoverOpen"
    class="min-w-[200px]"
    :disabled="disabled"
    :content="{
      collisionPadding: {
        left: 0,
        right: 0
      },
      onOpenAutoFocus: (e) => e.preventDefault()
    }"
    :ui="{ content: 'w-(--reka-popper-anchor-width)' }"
  >
    <!-- 触发器 -->
    <template #anchor>
      <!-- 多选模式：标签输入区域 -->
      <UButton
        v-if="props.multiple"
        class="flex items-center flex-wrap gap-2 w-full"
        color="neutral"
        variant="outline"
        @click="handlePopover"
      >
        <!-- 已选中标签列表 -->
        <UBadge
          v-for="tag in showTags"
          :key="tag.value"
          :color="tag.isCustom ? 'primary' : 'neutral'"
          :variant="tag.isCustom ? 'subtle' : 'outline'"
          size="sm"
          :ui="{
            base: 'py-0 text-sm'
          }"
        >
          {{ tag.label }}

          <!-- 自定义标签显示删除按钮 -->
          <template #trailing v-if="tag.isCustom">
            <UIcon
              name="mdi:close-thick"
              class="cursor-pointer text-blue-400 hover:text-blue-600"
              @click.stop="handleDelete(tag)"
            />
          </template>
        </UBadge>

        <!-- 占位文本：无选中项时显示 -->
        <span v-if="!showTags || showTags.length === 0" class="text-dimmed">
          {{ placeholder }}
        </span>

        <!-- 自定义输入框：回车添加自定义标签 -->
        <UInput
          v-if="showInput"
          ref="inputRef"
          v-model.trim="inputValue"
          size="xs"
          autofocus
          class="w-32 h-5"
          @blur="blurTagInput"
          @keyup.enter="handleTagEnter"
        />
        <!-- 添加标签按钮 -->
        <UBadge
          v-else
          icon="ep:plus"
          size="sm"
          color="primary"
          variant="subtle"
          class="shrink-0 justify-center"
          @click.stop="showInput = true"
        />

        <!-- 右侧图标区域 -->
        <div class="ml-auto flex items-center shrink-0">
          <!-- 清除按钮：有选中值且可清除时显示 -->
          <UIcon
            v-if="hasSelected && props.clearable && !props.disabled"
            name="lucide:x"
            class="cursor-pointer shrink-0 text-muted size-5"
            @click.stop="handleClear"
          />
          <!-- 展开/收起箭头：无选中值时显示 -->
          <UIcon
            v-else-if="!hasSelected"
            class="shrink-0 text-dimmed size-5"
            :name="popoverOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            :class="{ 'opacity-50': props.disabled }"
          />
        </div>
      </UButton>

      <!-- 单选模式：输入框 -->
      <UInput
        v-else
        v-model.trim="inputValue"
        :placeholder="props.placeholder"
        @click="handlePopover"
        @change="handleInputChange"
        @keyup.enter="popoverOpen = false"
      >
        <!-- 后缀图标 -->
        <template #trailing>
          <!-- 清除按钮：有选中值且可清除时显示 -->
          <UIcon
            v-if="hasSelected && props.clearable && !props.disabled"
            name="lucide:x"
            class="cursor-pointer shrink-0 text-muted size-5"
            @click.stop="handleClear"
          />
          <!-- 展开/收起箭头：无选中值时显示 -->
          <UIcon
            v-else-if="!hasSelected"
            class="shrink-0 text-dimmed size-5"
            :name="popoverOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            :class="{ 'opacity-50': props.disabled }"
          />
        </template>
      </UInput>
    </template>

    <!-- 下拉内容：树形选择器 -->
    <template #content>
      <!-- 有数据时显示树形结构 -->
      <div
        v-if="normalizedItems.length > 0"
        class="p-2 min-w-[200px] max-h-[400px] overflow-y-auto"
      >
        <UTree
          :key="normalizedFlatItems.length"
          v-model:expanded="expanded"
          :model-value="internalValue"
          :items="normalizedItems"
          :multiple="props.multiple"
          :bubble-select="isRelated"
          :propagate-select="isRelated"
          :get-key="(item) => item.value"
          :as="{ link: 'div' }"
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
