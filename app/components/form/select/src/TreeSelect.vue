<script setup lang="ts">
/**
 * TreeSelect 树形选择器组件
 * 支持单选/多选模式，提供树形结构数据的选择功能
 */
import type { TreeItemSelectEvent } from "reka-ui";
import type { TreeItem } from "@nuxt/ui";
import type { PropType } from "vue";
import { computed, ref, watch } from "vue";
import { isArray, isEmpty } from "#shared/utils/typed";
import { flattenTreeItems, findParentChain } from "#shared/utils/tree";

// ==================== 类型定义 ====================

// 外部值类型：组件与父组件通信使用的数据格式
type ExternalValue = string | number | Array<string | number> | null;

// 内部值类型：组件内部树形结构使用的数据格式
type InternalValue = TreeItem | TreeItem[] | undefined;

// 字段名映射配置
type FieldNames = {
  label?: string; // 标签字段名
  value?: string; // 值字段名
  children?: string; // 子节点字段名
  parent?: string; // 父节点字段名
};

// ==================== Props & Model ====================

const modelValue = defineModel<ExternalValue>({});

const props = defineProps({
  // 树形数据源
  items: {
    type: Array as PropType<object[]>,
    default: () => []
  },
  // 是否开启多选模式
  multiple: {
    type: Boolean,
    default: false
  },
  // 占位符文本
  placeholder: {
    type: String,
    default: "请选择"
  },
  // 是否禁用组件
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否显示清除按钮
  clearable: {
    type: Boolean,
    default: true
  },
  // 多选模式下显示的最大标签数量，超出部分以 "+N" 形式显示
  maxTagCount: {
    type: Number,
    default: 3
  },
  // 控制父子节点选中关联性：true 表示父子节点独立选择，false 表示父子节点联动选择
  checkStrictly: {
    type: Boolean,
    default: true
  },
  // 字段名映射配置
  fieldNames: {
    type: Object as PropType<FieldNames>,
    default: () => ({})
  }
});

// ==================== 计算属性 ====================

// 合并后的字段名配置（带默认值）
const mergedFieldNames = computed<Required<FieldNames>>(() => ({
  label: props.fieldNames.label || "label",
  value: props.fieldNames.value || "value",
  children: props.fieldNames.children || "children",
  parent: props.fieldNames.parent || "parentId"
}));

// 计算是否为关联选择模式（多选且非严格模式时，父子节点选中状态会相互影响）
const isRelated = computed(() => !props.checkStrictly && props.multiple);

// 判断是否有选中值
const hasSelected = computed(() => {
  if (!internalValue.value) return false;
  return isArray(internalValue.value) ? internalValue.value.length > 0 : true;
});

// 获取所有选中项的标签
const selectedLabels = computed(() => {
  if (!internalValue.value) return [];
  return isArray(internalValue.value)
    ? (internalValue.value as TreeItem[]).map((item) => item.label)
    : [internalValue.value.label];
});

// 获取要显示的标签（根据 maxTagCount 截断）
const displayedLabels = computed(() => {
  if (selectedLabels.value.length <= props.maxTagCount) {
    return selectedLabels.value;
  }
  return selectedLabels.value.slice(0, props.maxTagCount);
});

// 单选模式下获取当前选中的节点标签
const selectedLabel = computed(() => {
  if (!internalValue.value) return "";
  if (isArray(internalValue.value) && internalValue.value.length > 0) {
    return (internalValue.value as TreeItem[])[0]?.label || "";
  }
  return (internalValue.value as TreeItem).label || "";
});

// ==================== 数据转换 ====================

/**
 * 标准化树形数据
 * 将用户传入的数据格式转换为组件内部统一格式
 */
const normalizeItems = (items: object[]): TreeItem[] => {
  const { label: labelKey, value: valueKey, children: childrenKey } = mergedFieldNames.value;

  return items.map((item) => {
    const record = item as Record<string, unknown>;
    const normalized: TreeItem = {
      ...item,
      label: record[labelKey] as string,
      value: record[valueKey] as string | number
    };

    const children = record[childrenKey] as object[] | undefined;
    if (children && children.length > 0) {
      normalized.children = normalizeItems(children);
    }

    return normalized;
  });
};

// 标准化后的树形数据
const normalizedItems = computed<TreeItem[]>(() => normalizeItems(props.items));

// 监听 items 变化，通过 key 强制 UTree 重建以刷新内部状态
const itemsKey = ref(0);
watch(
  () => props.items,
  () => {
    itemsKey.value++;
  }
);

/**
 * 扁平化树形数据
 * 将嵌套的树形结构转换为平铺数组
 */
const flattenNormalizedItems = (items: TreeItem[]): TreeItem[] => {
  const result: TreeItem[] = [];
  const childrenKey = mergedFieldNames.value.children;

  for (const item of items) {
    result.push(item);
    const children = item[childrenKey] as TreeItem[] | undefined;
    if (children && children.length > 0) {
      result.push(...flattenNormalizedItems(children));
    }
  }

  return result;
};

/**
 * 将内部值转换为外部值
 * 从 TreeItem 对象中提取 value 字段
 */
const convertToExternalValue = (internal: InternalValue): ExternalValue => {
  if (!internal) return null;

  if (props.multiple) {
    return isArray(internal) ? internal.map((item) => item.value).filter(Boolean) : [];
  }

  return isArray(internal) ? internal[0]?.value : internal?.value;
};

/**
 * 将外部值转换为内部值
 * 根据外部值匹配对应的 TreeItem 对象
 */
const convertToInternalValue = (external?: ExternalValue): InternalValue => {
  if (!external || (isArray(external) && external.length === 0)) {
    return undefined;
  }

  const allItems = flattenNormalizedItems(normalizedItems.value);

  if (props.multiple) {
    return isArray(external)
      ? allItems.filter((item) => external.includes(item.value))
      : allItems.filter((item) => item.value === external);
  }

  const v = isArray(external) ? external[0] : external;
  return allItems.find((i) => i.value === v);
};

// ==================== 响应式状态 ====================

// 控制下拉面板的展开/收起状态
const popoverOpen = ref(false);

// 内部值，存储树形组件的选中状态
const internalValue = ref<InternalValue>(undefined);

// 展开的节点列表（存储节点的 value 值）
const expanded = ref<string[]>([]);

// 监听外部值变化，同步到内部值
watch(
  modelValue,
  (newValue) => {
    internalValue.value = convertToInternalValue(newValue);
  },
  { immediate: true, deep: true }
);

// ==================== 事件处理 ====================

/**
 * 处理树节点选择事件
 * 阻止默认点击行为，避免重复触发
 */
const onSelect = (e: TreeItemSelectEvent<TreeItem>) => {
  if (e.detail.originalEvent.type === "click") {
    e.preventDefault();
  }
};

/**
 * 同步内部值到外部值
 * 当树形组件的选中状态变化时，转换并更新 modelValue
 */
const syncModelValue = () => {
  modelValue.value = convertToExternalValue(internalValue.value);

  // 单选模式下选中后自动关闭下拉面板
  if (!props.multiple && hasSelected.value) {
    popoverOpen.value = false;
  }
};

/**
 * 处理点击事件
 * 切换下拉面板的展开/收起状态，并计算需要展开的父节点
 */
const handleClick = () => {
  if (props.disabled) return;

  // 展开下拉面板时，计算选中项的父节点链用于自动展开
  if (popoverOpen.value === false && !isEmpty(modelValue.value)) {
    const list = flattenTreeItems(normalizedItems.value);
    const v = Array.isArray(modelValue.value) ? modelValue.value : [modelValue.value];

    const expandedItems: string[] = [];

    for (const item of v) {
      const chain = findParentChain(list, item, {
        idKey: mergedFieldNames.value.value,
        parentKey: mergedFieldNames.value.parent,
        includeSelf: false
      });
      expandedItems.push(...chain.map((node) => String(node.value)).filter(Boolean));
    }

    expanded.value = expandedItems;
  }

  popoverOpen.value = !popoverOpen.value;
};

/**
 * 清除选择
 * 重置内部值和外部值
 */
const handleClear = (e?: MouseEvent) => {
  e?.stopPropagation();

  if (props.disabled) return;

  internalValue.value = [];
  modelValue.value = props.multiple ? [] : null;
  popoverOpen.value = false;
};
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
      }
    }"
    :ui="{ content: 'w-(--reka-popper-anchor-width)' }"
  >
    <!-- 触发器：按钮 -->
    <template #anchor>
      <UButton
        color="neutral"
        variant="outline"
        class="w-full justify-between"
        :disabled="props.disabled"
        @click="handleClick"
      >
        <!-- 显示区域 -->
        <div class="truncate pointer-events-none">
          <!-- 多选模式：显示标签列表 -->
          <template v-if="props.multiple && selectedLabels.length > 0">
            <div class="flex flex-wrap gap-1 overflow-hidden">
              <UBadge
                v-for="(label, index) in displayedLabels"
                :key="`${label}${index}`"
                color="neutral"
                variant="outline"
                size="sm"
              >
                {{ label }}
              </UBadge>
              <div v-if="selectedLabels.length > displayedLabels.length" class="opacity-50">
                +{{ selectedLabels.length - displayedLabels.length }}
              </div>
            </div>
          </template>

          <!-- 单选模式：显示单个标签 -->
          <template v-else-if="selectedLabel">
            {{ selectedLabel }}
          </template>

          <!-- 无选中值：显示占位符 -->
          <template v-else>
            <span class="text-dimmed">{{ placeholder }}</span>
          </template>
        </div>

        <!-- 后缀图标 -->
        <template #trailing>
          <!-- 清除按钮 -->
          <UIcon
            v-if="hasSelected && !props.disabled"
            name="lucide:x"
            class="cursor-pointer"
            @click.stop="handleClear"
          />
          <!-- 展开/收起箭头 -->
          <UIcon
            v-else-if="!hasSelected"
            :name="popoverOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            :class="{ 'opacity-50': props.disabled }"
          />
        </template>
      </UButton>
    </template>

    <!-- 下拉内容：树形选择器 -->
    <template #content>
      <div class="p-2 min-w-[200px] max-h-[400px] overflow-y-auto">
        <UTree
          :key="itemsKey"
          v-model="internalValue"
          v-model:expanded="expanded"
          :items="normalizedItems"
          :multiple="props.multiple"
          :bubble-select="isRelated"
          :propagate-select="isRelated"
          :get-key="(item) => item.value"
          :as="{ link: 'div' }"
          @select="onSelect"
          @update:model-value="syncModelValue"
        >
          <!-- 自定义节点前缀：复选框 -->
          <template #item-leading="{ selected, indeterminate, handleSelect }">
            <UCheckbox
              :model-value="indeterminate ? 'indeterminate' : selected"
              tabindex="-1"
              @change="handleSelect"
              @click.stop
            />
          </template>
        </UTree>
      </div>
    </template>
  </UPopover>
</template>
