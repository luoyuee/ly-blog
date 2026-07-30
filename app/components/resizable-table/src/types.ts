import type { CellContext, Header, HeaderContext } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";

export interface ResizableColumnClass {
  th?: string;
  td?: string;
}

export interface ResizableColumnMeta {
  class?: ResizableColumnClass;
}

export interface ResizeState {
  move: (event: MouseEvent) => void;
  up: () => void;
}

export type ResizableTableColumn<T extends Record<string, unknown>> =
  TableColumn<T> & {
    resizable?: boolean;
    minSize?: number;
  };

export type ResizableCellRenderer<T extends Record<string, unknown>> =
  ResizableTableColumn<T>["cell"];

export type ResizableHeaderRenderer<T extends Record<string, unknown>> =
  ResizableTableColumn<T>["header"];

export type ResizableCellContext<T extends Record<string, unknown>> =
  CellContext<T, unknown>;

export type ResizableHeaderContext<T extends Record<string, unknown>> =
  HeaderContext<T, unknown>;

export type ResizableHeader<T extends Record<string, unknown>> = Header<
  T,
  unknown
>;
