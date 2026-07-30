<script setup lang="ts" generic="TData extends Record<string, unknown>">
import type { TableRow } from "@nuxt/ui";
import type { CSSProperties, PropType, VNodeChild } from "vue";
import type {
  ResizableCellContext,
  ResizableCellRenderer,
  ResizableColumnMeta,
  ResizableHeader,
  ResizableHeaderContext,
  ResizableHeaderRenderer,
  ResizeState,
  ResizableTableColumn
} from "./types";
import { computed, h, onUnmounted, ref, useAttrs, useTemplateRef } from "vue";

defineOptions({
  inheritAttrs: false
});

const MIN_COLUMN_WIDTH = 32;
const RESIZE_HANDLE_CLASS = [
  "resize-handle absolute -right-[5px] top-0 bottom-0 w-[11px] cursor-col-resize select-none z-10",
  "before:absolute before:right-[4px] before:top-0 before:bottom-0 before:w-[2px]",
  "before:bg-transparent before:transition-colors before:duration-150",
  "hover:before:bg-primary-500"
];

const props = defineProps({
  data: {
    type: Array as PropType<TData[]>,
    default: () => []
  },
  columns: {
    type: Array as PropType<ResizableTableColumn<TData>[]>,
    required: true
  }
});

const emit = defineEmits<{
  select: [event: Event, row: TableRow<TData>];
}>();

const attrs = useAttrs();
const isResizing = ref(false);
const resizingHeaderId = ref<string | null>(null);
const resizeIndicatorX = ref(0);
const tableContainerRef = useTemplateRef("tableContainerRef");
const tableRef = useTemplateRef("tableRef");
let resizeState: ResizeState | null = null;

const setResizing = (value: boolean) => {
  isResizing.value = value;
  document.body.style.cursor = value ? "col-resize" : "";
  document.body.style.userSelect = value ? "none" : "";
};

const clearResizeState = () => {
  if (resizeState) {
    document.removeEventListener("mousemove", resizeState.move);
    document.removeEventListener("mouseup", resizeState.up);
    resizeState = null;
  }

  setResizing(false);
  resizingHeaderId.value = null;
};

const mergeClassName = (currentClass: string | undefined, appendClass: string): string => {
  return currentClass ? `${currentClass} ${appendClass}` : appendClass;
};

const renderContent = <TContext,>(renderer: unknown, context: TContext): VNodeChild => {
  if (typeof renderer === "function") {
    return (renderer as (ctx: TContext) => VNodeChild)(context);
  }

  return (renderer ?? "") as VNodeChild;
};

const getColumnSizeStyle = (size: number): CSSProperties => ({
  width: `${size}px`,
  minWidth: `${size}px`,
  maxWidth: `${size}px`
});

const getMinColumnWidth = (header: ResizableHeader<TData>) => {
  return Math.max(header.column.columnDef.minSize ?? MIN_COLUMN_WIDTH, MIN_COLUMN_WIDTH);
};

const updateColumnWidth = (columnId: string, width: number) => {
  const tableApi = tableRef.value?.tableApi;

  if (!tableApi) {
    return;
  }

  tableApi.setColumnSizing({
    ...tableApi.getState().columnSizing,
    [columnId]: width
  });
};

const renderCellContent = (
  context: ResizableCellContext<TData>,
  cellRenderer: ResizableCellRenderer<TData>
): VNodeChild => {
  if (cellRenderer) {
    // 使用保存下来的原始 cell 渲染内容，避免包装后的 cell 再次回调自身形成递归。
    return renderContent(cellRenderer, context);
  }

  return (context.getValue() ?? "") as VNodeChild;
};

const getColumnMeta = (column: ResizableTableColumn<TData>): ResizableColumnMeta => {
  return (column.meta as ResizableColumnMeta | undefined) ?? {};
};

const getResizeMetrics = (event: MouseEvent, header: ResizableHeader<TData>) => {
  const tableRect = tableContainerRef.value?.getBoundingClientRect();
  const tableLeft = tableRect?.left ?? 0;
  const initialX = event.pageX - tableLeft;
  const resizeHandle = event.target as HTMLElement;
  const headerCell = resizeHandle.closest("th");
  const headerRect = headerCell?.getBoundingClientRect();
  const columnLeft = headerRect ? headerRect.left - tableLeft : 0;
  const minColumnWidth = getMinColumnWidth(header);

  return {
    tableLeft,
    initialX,
    columnLeft,
    minColumnWidth,
    minIndicatorX: columnLeft + minColumnWidth,
    initialWidth: header.column.getSize()
  };
};

const startResize = (event: MouseEvent, header: ResizableHeader<TData>) => {
  event.preventDefault();
  event.stopPropagation();

  // 开始新的拖拽前先移除旧的全局监听，避免快速重复按下时残留多份事件处理器。
  clearResizeState();
  setResizing(true);
  resizingHeaderId.value = header.column.id;

  // 统一预计算表格左侧基准线、列起始位置和最小宽度，避免拖拽过程中重复读取布局信息。
  const { tableLeft, initialX, minColumnWidth, minIndicatorX, initialWidth } = getResizeMetrics(
    event,
    header
  );

  // 指示线在按下时立即对齐到当前拖拽点，并确保不会越过该列允许的最小宽度边界。
  resizeIndicatorX.value = Math.max(initialX, minIndicatorX);

  const handleMouseMove = (moveEvent: MouseEvent) => {
    const nextX = moveEvent.pageX - tableLeft;
    resizeIndicatorX.value = Math.max(nextX, minIndicatorX);
  };

  const handleMouseUp = () => {
    const finalDelta = resizeIndicatorX.value - initialX;
    const finalWidth = Math.max(initialWidth + finalDelta, minColumnWidth);

    // Nuxt UI 内部基于 TanStack Table 的 columnSizing 工作，这里只在拖拽结束时写入，
    // 可以减少移动过程中的表格重算与重渲染，保证交互更平滑。
    updateColumnWidth(header.column.id, finalWidth);
    clearResizeState();
  };

  resizeState = {
    move: handleMouseMove,
    up: handleMouseUp
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const createResizableHeader = (
  column: ResizableTableColumn<TData>
): ResizableHeaderRenderer<TData> => {
  const headerRenderer = column.header;

  return (context: ResizableHeaderContext<TData>) => {
    const size = context.header.getSize();

    return h(
      "div",
      {
        class: "resizable-table__header relative",
        style: getColumnSizeStyle(size)
      },
      [
        h(
          "div",
          {
            // 使用保存下来的原始 header 渲染内容，避免包装后的 header 再次回调自身形成递归。
            class: "px-4 py-3.5 truncate"
          },
          [renderContent(headerRenderer, context)]
        ),
        h("div", {
          class: RESIZE_HANDLE_CLASS,
          onMousedown: (mouseEvent: MouseEvent) => startResize(mouseEvent, context.header)
        })
      ]
    );
  };
};

const createResizableCell = (column: ResizableTableColumn<TData>): ResizableCellRenderer<TData> => {
  const cellRenderer = column.cell;

  return (context: ResizableCellContext<TData>) => {
    const size = context.column.getSize();

    return h(
      "div",
      {
        class: "px-4 py-1 truncate",
        style: getColumnSizeStyle(size)
      },
      [renderCellContent(context, cellRenderer)]
    );
  };
};

const resolvedColumns = computed<ResizableTableColumn<TData>[]>(() => {
  return props.columns.map((column) => {
    if (!column.resizable) {
      return column;
    }

    const meta = getColumnMeta(column);
    const minSize = Math.max(column.minSize ?? MIN_COLUMN_WIDTH, MIN_COLUMN_WIDTH);

    // 仅增强显式声明 resizable 的列：
    // 1. 复用调用方已有的列定义；
    // 2. 统一补齐最小宽度限制；
    // 3. 为表头/单元格包裹固定宽度容器；
    // 4. 将 th/td 的默认内边距改为 0，避免容器宽度与单元格内边距叠加后出现错位。
    return {
      ...column,
      minSize,
      header: createResizableHeader(column),
      cell: createResizableCell(column),
      meta: {
        ...meta,
        class: {
          ...meta.class,
          th: mergeClassName(meta.class?.th, "p-0 relative"),
          td: mergeClassName(meta.class?.td, "p-0")
        }
      }
    } as ResizableTableColumn<TData>;
  });
});

const handleSelect = (event: Event, row: TableRow<TData>) => {
  emit("select", event, row);
};

const resetRowSelection = () => {
  tableRef.value?.tableApi?.resetRowSelection();
};

onUnmounted(() => {
  // 组件卸载时必须清理 document 级事件与页面状态，避免拖拽中离开页面后残留光标样式或监听器。
  clearResizeState();
});

defineExpose({
  resetRowSelection
});
</script>

<template>
  <div
    ref="tableContainerRef"
    class="resizable-table flex-1 flex flex-col overflow-hidden"
    :class="{ '[&_.resize-handle]:invisible': isResizing }"
  >
    <div class="relative flex-1 overflow-hidden">
      <UTable
        ref="tableRef"
        v-bind="attrs"
        :data="props.data"
        :columns="resolvedColumns"
        :column-sizing-options="{ columnResizeMode: 'onEnd' }"
        @select="handleSelect"
      />
      <div
        v-show="resizingHeaderId"
        class="absolute top-0 bottom-0 w-0.5 bg-primary-500 pointer-events-none z-50"
        :style="{
          left: `${resizeIndicatorX}px`,
          transform: 'translateX(-50%)'
        }"
      ></div>
    </div>
  </div>
</template>
