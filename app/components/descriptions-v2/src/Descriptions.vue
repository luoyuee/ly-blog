<script setup lang="ts">
import { useEventListener, useMutationObserver } from "@vueuse/core";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useSlotsExist } from "@/composables/useSlots";

export interface Responsive {
  xs?: number; // <576px 响应式栅格
  sm?: number; // ≥576px 响应式栅格
  md?: number; // ≥768px 响应式栅格
  lg?: number; // ≥992px 响应式栅格
  xl?: number; // ≥1200px 响应式栅格
  xxl?: number; // ≥1600px 响应式栅格
}
export interface Props {
  title?: string; // 描述列表的标题，支持 string 或 title 插槽
  extra?: string; // 描述列表的操作区域，支持 string 或 extra 插槽
  vertical?: boolean; // 是否使用垂直描述列表
  size?: "xs" | "sm" | "md" | "lg" | "xl"; // 设置列表的大小，遵循 Nuxt UI 尺寸体系
  column?: number | Responsive; // 一行的 DescriptionItems 数量，可以写成数值或支持响应式的对象写法 { xs: 8, sm: 16, md: 24 }
}

interface DescriptionItemNode {
  span: number;
  element: HTMLTableRowElement;
}

type DescriptionGroup = DescriptionItemNode[];

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  extra: undefined,
  vertical: false,
  size: "md",
  column: () => ({ xs: 1, sm: 2, md: 3 })
});
const sizeClassMap: Record<NonNullable<Props["size"]>, string> = {
  xs: "px-2 py-1 text-xs leading-4",
  sm: "px-2.5 py-1.5 text-sm leading-5",
  md: "px-3 py-2 text-sm leading-5",
  lg: "px-4 py-3 text-base leading-6",
  xl: "px-5 py-4 text-base leading-6"
};
const defaultSlotsRef = ref<HTMLTableSectionElement | null>(null); // 所有渲染的 DescriptionsItems 节点引用
const defaultSlots = ref(true); // 用于刷新 <slot></slot>
const stopObservation = ref(true); // 停止观察器
const trBorderedRows = ref<HTMLTableRowElement[]>([]); // 放置 DescriptionsItems 节点的模板引用数组（带边框）
const thVerticalBorderedRows = ref<HTMLTableRowElement[]>([]); // 放置垂直列表的 DescriptionsItems 节点的 th 模板引用数组（带边框）
const tdVerticalBorderedRows = ref<HTMLTableRowElement[]>([]); // 放置垂直列表的 DescriptionsItems 节点的 td 模板引用数组（带边框）
const groupItems = ref<DescriptionGroup[]>([]); // 处理后的 DescriptionsItems 节点数组
const viewportWidth = ref(0);
const isMounted = ref(false);
const slotsExist = useSlotsExist(["title", "extra"]);
const responsiveColumn = computed(() => {
  if (typeof props.column === "object") {
    if (viewportWidth.value >= 1600 && props.column.xxl !== undefined) {
      return props.column.xxl;
    }
    if (viewportWidth.value >= 1200 && props.column.xl !== undefined) {
      return props.column.xl;
    }
    if (viewportWidth.value >= 992 && props.column.lg !== undefined) {
      return props.column.lg;
    }
    if (viewportWidth.value >= 768 && props.column.md !== undefined) {
      return props.column.md;
    }
    if (viewportWidth.value >= 576 && props.column.sm !== undefined) {
      return props.column.sm;
    }
    if (viewportWidth.value < 576 && props.column.xs !== undefined) {
      return props.column.xs;
    }
    return 1;
  }
  return props.column;
});
const sizeClass = computed(() => sizeClassMap[props.size]);
const showHeader = computed(() =>
  Boolean(slotsExist.title || slotsExist.extra || props.title || props.extra)
);
watch(
  () => [props.vertical, responsiveColumn.value, props.size],
  () => {
    if (!isMounted.value) {
      return;
    }

    if (!stopObservation.value) {
      stopObservation.value = true;
    }
    refreshDefaultSlots();
  }
);
// 监听 defaultSlotsRef DOM 节点数量变化，重新渲染 Descriptions
useMutationObserver(
  defaultSlotsRef,
  (mutationRecords: MutationRecord[]) => {
    if (!stopObservation.value) {
      stopObservation.value = true;
      const mutation = mutationRecords.some(
        (mutation: MutationRecord) => mutation.type === "childList"
      );
      if (mutation) {
        refreshDefaultSlots();
      }
    }
  },
  { subtree: true, childList: true }
);
onMounted(async () => {
  isMounted.value = true;
  getViewportWidth();
  useEventListener(window, "resize", getViewportWidth);
  await nextTick();
  getGroupItems();
});

const getViewportWidth = (): void => {
  if (!import.meta.client) {
    return;
  }

  viewportWidth.value = window.innerWidth;
};

const refreshDefaultSlots = async (): Promise<void> => {
  if (!isMounted.value) {
    return;
  }

  defaultSlots.value = !defaultSlots.value;
  await nextTick();
  getGroupItems();
};

// 计算当前 group 中所有 span 之和
const getTotalSpan = (group: DescriptionGroup): number =>
  group.reduce(
    (accumulator: number, currentValue: DescriptionItemNode) => accumulator + currentValue.span,
    0
  );

const parseSpan = (span: string | undefined): number => {
  if (!span) {
    return 1;
  }

  const parsedSpan = Number(span);
  return Number.isFinite(parsedSpan) && parsedSpan > 0 ? parsedSpan : 1;
};

const getSlotRows = (): HTMLTableRowElement[] => {
  if (!defaultSlotsRef.value) {
    return [];
  }

  return Array.from(defaultSlotsRef.value.children).filter(
    (element: Element): element is HTMLTableRowElement => element instanceof HTMLTableRowElement
  );
};

// 根据不同 column 处理 DescriptionsItems 节点
const getGroupItems = async (): Promise<void> => {
  const slotRows = getSlotRows();

  if (groupItems.value.length) {
    groupItems.value = []; // 清空列表
    await nextTick();
  }

  if (slotRows.length) {
    const len = slotRows.length;
    let group: DescriptionGroup = [];
    for (const slotRow of slotRows) {
      const item = {
        span: Math.min(parseSpan(slotRow.dataset.span), responsiveColumn.value),
        element: slotRow
      };
      if (getTotalSpan(group) < responsiveColumn.value) {
        // 已有 items 的 totalSpan ＜ column
        item.span = Math.min(item.span, responsiveColumn.value - getTotalSpan(group));
        group.push(item);
      } else {
        groupItems.value.push(group);
        group = [item];
      }
    }
    const lastSlotRow = slotRows[len - 1];
    const lastGroupItem = group[group.length - 1];

    // 当使用水平列表且未设置 span 时等效于 span: 1，但最后一行的最后一项，会包含该行剩余的所有列数
    if (
      !props.vertical &&
      lastSlotRow &&
      lastGroupItem &&
      !lastSlotRow.dataset.span &&
      getTotalSpan(group) < responsiveColumn.value
    ) {
      lastGroupItem.span = lastGroupItem.span + responsiveColumn.value - getTotalSpan(group);
    }
    groupItems.value.push(group);
    await nextTick();
    updateDescriptions();
  } else {
    stopObservation.value = false;
  }
};

const updateDescriptions = async (): Promise<void> => {
  // 带边框列表
  groupItems.value.forEach((items: DescriptionGroup, index: number) => {
    // 每一行 tr
    items.forEach((item: DescriptionItemNode) => {
      const itemChildren = Array.from(item.element.children).filter(
        (element: Element): element is HTMLTableCellElement =>
          element instanceof HTMLTableCellElement
      );
      // 创建节点副本，否则原节点将先被移除，后插入到新位置，影响后续响应式布局计算
      const th = itemChildren[0];
      const td = itemChildren[1];

      if (!th || !td) {
        return;
      }

      setSizeClass(th);
      setSizeClass(td);
      if (props.vertical) {
        const thTargetRow = thVerticalBorderedRows.value[index];
        const tdTargetRow = tdVerticalBorderedRows.value[index];

        if (!thTargetRow || !tdTargetRow) {
          return;
        }

        // 垂直列表
        th.colSpan = item.span;
        td.colSpan = item.span;
        thTargetRow.appendChild(th);
        tdTargetRow.appendChild(td);
      } else {
        const targetRow = trBorderedRows.value[index];

        if (!targetRow) {
          return;
        }

        th.colSpan = 1;
        td.colSpan = item.span * 2 - 1;
        targetRow.appendChild(th);
        targetRow.appendChild(td);
      }
    });
  });
  await nextTick();
  stopObservation.value = false;
};

// 为被移动的单元格补充尺寸类，避免依赖父组件样式选择器。
const setSizeClass = (element: HTMLElement): void => {
  element.classList.remove(
    ...Object.values(sizeClassMap).flatMap((className: string) => className.split(" "))
  );
  element.classList.add(...sizeClass.value.split(" "));
};
</script>
<template>
  <div class="text-sm leading-6 text-gray-900">
    <div v-if="showHeader" class="mb-4 flex items-center gap-3">
      <div class="min-w-0 flex-1 truncate text-base font-semibold leading-6 text-gray-900">
        <slot name="title">{{ title }}</slot>
      </div>
      <div class="shrink-0 text-sm leading-5 text-gray-600">
        <slot name="extra">{{ extra }}</slot>
      </div>
    </div>

    <div v-if="vertical" class="w-full overflow-hidden rounded-md border border-gray-200">
      <table class="m-0 w-full table-auto border-collapse">
        <tbody>
          <template v-for="row in groupItems.length" :key="row">
            <tr ref="thVerticalBorderedRows" class="border-b border-gray-200 last:border-b-0"></tr>
            <tr ref="tdVerticalBorderedRows" class="border-b border-gray-200 last:border-b-0"></tr>
          </template>
        </tbody>
      </table>
    </div>
    <div v-else class="w-full overflow-hidden rounded-md border border-gray-200">
      <table class="m-0 w-full table-auto border-collapse">
        <tbody>
          <tr
            v-for="row of groupItems.length"
            :key="row"
            ref="trBorderedRows"
            class="border-b border-gray-200 last:border-b-0"
          ></tr>
        </tbody>
      </table>
    </div>

    <table v-if="isMounted" v-show="false">
      <tbody ref="defaultSlotsRef">
        <slot v-if="defaultSlots"></slot>
        <slot v-else></slot>
      </tbody>
    </table>
  </div>
</template>
