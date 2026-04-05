<script setup lang="ts">
import type { PropType } from "vue";
import { computed, ref, watch, nextTick, useTemplateRef, onUnmounted } from "vue";
import { useSortable } from "@vueuse/integrations/useSortable";

export interface TransferOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  [key: string]: unknown;
}

// ===================== Props & Models =====================

const leftValues = defineModel<Array<string | number>>("leftValues", {
  default: () => []
});
const rightValues = defineModel<Array<string | number>>("rightValues", {
  default: () => []
});

const props = defineProps({
  data: { type: Array as PropType<object[]>, default: () => [] },
  labelKey: { type: String, default: "label" },
  valueKey: { type: String, default: "value" },
  titles: {
    type: Array as unknown as PropType<[string, string]>,
    default: () => ["列表 1", "列表 2"]
  }
});

// ===================== Data =====================

const normalizedData = computed<TransferOption[]>(() => {
  return props.data.map((item) => ({
    ...item,
    label: String(item[props.labelKey as keyof object] ?? ""),
    value: item[props.valueKey as keyof object] as string | number
  }));
});

const leftChecked = ref<Set<string | number>>(new Set());
const rightChecked = ref<Set<string | number>>(new Set());
const leftData = ref<TransferOption[]>([]);
const rightData = ref<TransferOption[]>([]);

// ===================== Sortable =====================

const leftContainerRef = useTemplateRef("leftContainer");
const rightContainerRef = useTemplateRef("rightContainer");
let stopLeftSortable: (() => void) | null = null;
let stopRightSortable: (() => void) | null = null;
let stopInternalWatch: (() => void) | null = null;
let isExternalUpdate = false;

const initSortable = () => {
  if (leftContainerRef.value) {
    const { stop } = useSortable(leftContainerRef, leftData, {
      animation: 150
    });
    stopLeftSortable = stop;
  }
  if (rightContainerRef.value) {
    const { stop } = useSortable(rightContainerRef, rightData, {
      animation: 150
    });
    stopRightSortable = stop;
  }
};

const destroySortable = () => {
  stopLeftSortable?.();
  stopLeftSortable = null;
  stopRightSortable?.();
  stopRightSortable = null;
};

// ===================== Computed =====================

const leftCheckAll = computed({
  get: (): boolean | "indeterminate" => {
    const size = leftChecked.value.size;
    const total = leftData.value.filter((item) => !item.disabled).length;
    if (size > 0 && size < total) return "indeterminate";
    return size === total && total > 0;
  },
  set: (val: boolean | "indeterminate") => {
    if (val === "indeterminate") return;
    leftChecked.value = val
      ? new Set(leftData.value.filter((item) => !item.disabled).map((item) => item.value))
      : new Set();
  }
});

const rightCheckAll = computed({
  get: (): boolean | "indeterminate" => {
    const size = rightChecked.value.size;
    const total = rightData.value.filter((item) => !item.disabled).length;
    if (size > 0 && size < total) return "indeterminate";
    return size === total && total > 0;
  },
  set: (val: boolean | "indeterminate") => {
    if (val === "indeterminate") return;
    rightChecked.value = val
      ? new Set(rightData.value.filter((item) => !item.disabled).map((item) => item.value))
      : new Set();
  }
});

// ===================== Methods =====================

const handleMoveToRight = () => {
  const itemsToMove = leftData.value.filter((item) => leftChecked.value.has(item.value));
  leftData.value = leftData.value.filter((item) => !leftChecked.value.has(item.value));
  rightData.value = [...rightData.value, ...itemsToMove];
  leftChecked.value = new Set();
};

const handleMoveToLeft = () => {
  const itemsToMove = rightData.value.filter((item) => rightChecked.value.has(item.value));
  rightData.value = rightData.value.filter((item) => !rightChecked.value.has(item.value));
  leftData.value = [...leftData.value, ...itemsToMove];
  rightChecked.value = new Set();
};

const handleLeftItemCheck = (value: string | number, checked: boolean | "indeterminate") => {
  if (checked === "indeterminate") return;
  if (checked) {
    leftChecked.value.add(value);
  } else {
    leftChecked.value.delete(value);
  }
};

const handleRightItemCheck = (value: string | number, checked: boolean | "indeterminate") => {
  if (checked === "indeterminate") return;
  if (checked) {
    rightChecked.value.add(value);
  } else {
    rightChecked.value.delete(value);
  }
};

// ===================== Watch =====================

// 监听 props.data 和外部 values 变化，更新内部数据
watch(
  [() => props.data, leftValues, rightValues],
  async () => {
    // 跳过自己触发的更新
    if (isExternalUpdate) {
      isExternalUpdate = false;
      return;
    }

    // 停止内部监听器，避免循环触发
    stopInternalWatch?.();
    stopInternalWatch = null;

    destroySortable();

    // 根据右侧 values 计算左右数据
    const rightValueSet = new Set(rightValues.value);
    const leftItems = normalizedData.value.filter((item) => !rightValueSet.has(item.value));
    const rightItems = normalizedData.value.filter((item) => rightValueSet.has(item.value));

    // 根据 values 顺序排序
    const leftOrderMap = new Map(leftValues.value.map((v, i) => [v, i]));
    const rightOrderMap = new Map(rightValues.value.map((v, i) => [v, i]));

    leftData.value = leftItems.sort(
      (a, b) => (leftOrderMap.get(a.value) ?? 0) - (leftOrderMap.get(b.value) ?? 0)
    );
    rightData.value = rightItems.sort(
      (a, b) => (rightOrderMap.get(a.value) ?? 0) - (rightOrderMap.get(b.value) ?? 0)
    );

    // 当 values 与 data 长度不匹配时，使用 data 更新 values
    if (
      leftValues.value.length !== leftData.value.length ||
      rightValues.value.length !== rightData.value.length
    ) {
      // 设置标志位，跳过自己触发的更新
      isExternalUpdate = true;
      leftValues.value = leftData.value.map((item) => item.value);
      rightValues.value = rightData.value.map((item) => item.value);
    }

    await nextTick();
    initSortable();

    // 重新启动内部监听器
    startInternalWatch();
  },
  { immediate: true, deep: true }
);

// 启动内部监听器
const startInternalWatch = () => {
  if (stopInternalWatch) stopInternalWatch();
  stopInternalWatch = watch(
    [leftData, rightData],
    () => {
      leftValues.value = leftData.value.map((item) => item.value);
      rightValues.value = rightData.value.map((item) => item.value);
    },
    { deep: true }
  );
};

// ===================== Lifecycle =====================

onUnmounted(() => {
  destroySortable();
  stopInternalWatch?.();
});
</script>

<template>
  <div class="flex gap-4 h-[320px]">
    <!-- 左侧列表 -->
    <div class="flex-1 flex flex-col border border-gray-200 rounded overflow-hidden">
      <div class="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <UCheckbox v-model="leftCheckAll" :label="titles[0]" />
        <span class="text-xs text-gray-500">{{ leftChecked.size }}/{{ leftData.length }}</span>
      </div>

      <div ref="leftContainer" class="flex-1 overflow-y-auto p-1">
        <div
          v-for="item in leftData"
          :key="item.value"
          class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50"
        >
          <UCheckbox
            :model-value="leftChecked.has(item.value)"
            :disabled="item.disabled"
            :label="item.label"
            :ui="{ root: 'w-full' }"
            @update:model-value="handleLeftItemCheck(item.value, $event)"
          />
        </div>
        <div v-if="leftData.length === 0" class="text-center text-gray-400 text-sm py-8">
          暂无数据
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex flex-col items-center justify-center gap-2">
      <UButton
        color="primary"
        variant="soft"
        size="sm"
        icon="lucide:chevron-right"
        :disabled="leftChecked.size === 0"
        @click="handleMoveToRight"
      />
      <UButton
        color="primary"
        variant="soft"
        size="sm"
        icon="lucide:chevron-left"
        :disabled="rightChecked.size === 0"
        @click="handleMoveToLeft"
      />
    </div>

    <!-- 右侧列表 -->
    <div class="flex-1 flex flex-col border border-gray-200 rounded overflow-hidden">
      <div class="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <UCheckbox v-model="rightCheckAll" :label="titles[1]" />
        <span class="text-xs text-gray-500">{{ rightChecked.size }}/{{ rightData.length }}</span>
      </div>

      <div ref="rightContainer" class="flex-1 overflow-y-auto p-1">
        <div
          v-for="item in rightData"
          :key="item.value"
          class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50"
        >
          <UCheckbox
            :model-value="rightChecked.has(item.value)"
            :disabled="item.disabled"
            :label="item.label"
            :ui="{ root: 'w-full' }"
            @update:model-value="handleRightItemCheck(item.value, $event)"
          />
        </div>
        <div v-if="rightData.length === 0" class="text-center text-gray-400 text-sm py-8">
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>
