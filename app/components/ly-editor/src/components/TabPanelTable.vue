<script setup lang="ts" generic="T">
import type { TableColumn, TableProps } from "@nuxt/ui";
import type { PropType } from "vue";
import { Pagination } from "@/components/pagination";
import TabPanelHeader from "./TabPanelHeader.vue";

/** 获取插槽实例。 */
const slots = useSlots();

/** 是否存在自定义头部插槽。 */
const hasHeaderSlot = computed(() => !!slots.header);

const props = defineProps({
  data: {
    type: Array as PropType<T[]>,
    required: true
  },
  columns: {
    type: Array as PropType<TableColumn<T>[]>,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  page: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default: undefined
  }
});

const emit = defineEmits<{
  "update:page": [value: number];
  "update:pageSize": [value: number];
  refresh: [];
}>();

const tableUi: TableProps["ui"] = {
  th: "bg-white/8 py-2.5 px-2",
  tr: "hover:bg-white/5",
  td: "whitespace-normal py-1.5 px-2"
};

const handleUpdatePage = (value: number) => {
  emit("update:page", value);
  emit("refresh");
};

const handleUpdatePageSize = (value: number) => {
  emit("update:pageSize", value);
  emit("refresh");
};
</script>

<template>
  <div class="flex h-full flex-col gap-4 overflow-hidden p-4">
    <TabPanelHeader v-if="hasHeaderSlot">
      <slot name="header"></slot>
    </TabPanelHeader>

    <TabPanelHeader v-else>
      <template #left>
        <slot name="header-left"></slot>
      </template>

      <template #right>
        <slot name="header-right"></slot>
      </template>
    </TabPanelHeader>

    <slot name="extra"></slot>

    <div class="flex-1 overflow-hidden rounded-md border border-muted">
      <slot
        name="table"
        :data="props.data"
        :columns="props.columns"
        :loading="props.loading"
        :table-ui="tableUi"
      >
        <UTable
          sticky
          class="max-h-full flex-1"
          :loading="props.loading"
          :data="props.data"
          :columns="props.columns"
          :ui="tableUi"
        />
      </slot>
    </div>

    <slot
      name="pagination"
      :page="props.page"
      :page-size="props.pageSize"
      :page-sizes="props.pageSizes"
      :total="props.total"
      :handle-update-page="handleUpdatePage"
      :handle-update-page-size="handleUpdatePageSize"
    >
      <Pagination
        :page="props.page"
        :page-size="props.pageSize"
        :page-sizes="props.pageSizes"
        :total="props.total"
        @update:page="handleUpdatePage"
        @update:page-size="handleUpdatePageSize"
      />
    </slot>
  </div>
</template>
