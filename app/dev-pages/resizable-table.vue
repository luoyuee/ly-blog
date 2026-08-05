<script setup lang="ts">
import { ResizableTable } from "@/components/resizable-table";
import type { ResizableTableColumn } from "@/components/resizable-table";
import type { TableRow } from "@nuxt/ui";
import { h, ref } from "vue";

interface UserRecord extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

/** 模拟数据 */
const data = ref<UserRecord[]>([
  {
    id: 1,
    name: "张三",
    email: "zhangsan@example.com",
    role: "管理员",
    status: "活跃",
    createdAt: "2026-01-12"
  },
  {
    id: 2,
    name: "李四",
    email: "lisi@example.com",
    role: "编辑",
    status: "禁用",
    createdAt: "2026-02-03"
  },
  {
    id: 3,
    name: "王五",
    email: "wangwu@example.com",
    role: "访客",
    status: "活跃",
    createdAt: "2026-03-21"
  },
  {
    id: 4,
    name: "赵六",
    email: "zhaoliu@example.com",
    role: "编辑",
    status: "待审核",
    createdAt: "2026-04-15"
  },
  {
    id: 5,
    name: "孙七",
    email: "sunqi@example.com",
    role: "管理员",
    status: "活跃",
    createdAt: "2026-05-08"
  }
]);

/** 状态对应色块 class */
const statusClass: Record<string, string> = {
  活跃: "bg-green-500/15 text-green-500",
  禁用: "bg-red-500/15 text-red-500",
  待审核: "bg-yellow-500/15 text-yellow-500"
};

/** 全列可拖拽列定义 */
const resizableColumns: ResizableTableColumn<UserRecord>[] = [
  {
    accessorKey: "id",
    header: "ID",
    resizable: true,
    minSize: 60,
    size: 80
  },
  {
    accessorKey: "name",
    header: "姓名",
    resizable: true,
    minSize: 100
  },
  {
    accessorKey: "email",
    header: "邮箱",
    resizable: true,
    minSize: 160
  },
  {
    accessorKey: "role",
    header: "角色",
    resizable: true,
    minSize: 100
  },
  {
    accessorKey: "status",
    header: "状态",
    resizable: true,
    minSize: 100,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const badgeClass = statusClass[value] ?? "bg-gray-500/15 text-gray-500";
      return h(
        "span",
        {
          class: `inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badgeClass}`
        },
        value
      );
    }
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    resizable: true,
    minSize: 120
  }
];

/** 部分列不可拖拽列定义 */
const mixedColumns: ResizableTableColumn<UserRecord>[] = [
  {
    accessorKey: "id",
    header: "ID（固定）",
    resizable: false,
    size: 80
  },
  {
    accessorKey: "name",
    header: "姓名（可调）",
    resizable: true,
    minSize: 100
  },
  {
    accessorKey: "email",
    header: "邮箱（可调）",
    resizable: true,
    minSize: 160
  },
  {
    accessorKey: "status",
    header: "状态（固定）",
    resizable: false,
    size: 100
  }
];

/** 选中行日志 */
const log = ref<string[]>([]);

/** 处理行选中 */
const handleSelect = (event: Event, row: TableRow<UserRecord>) => {
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  log.value.unshift(`[${time}] 选中：${row.original.name}（ID: ${row.original.id}）`);
  if (log.value.length > 10) {
    log.value.pop();
  }
};

/** 清空日志 */
const clearLog = () => {
  log.value = [];
};
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        ResizableTable 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        用于验证 ResizableTable 的列宽拖拽、最小宽度限制、拖拽指示线、部分列禁用拖拽以及行选中事件。
      </p>
    </section>

    <!-- 1. 全列可拖拽 -->
    <UCard class="mx-auto mb-4 max-w-240">
      <div class="mb-3 flex flex-col gap-1">
        <h2 class="font-semibold text-(--text-color-primary)">全列可拖拽</h2>
        <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
          所有列声明 resizable，拖拽表头边缘调整列宽，松开后写入尺寸，拖拽中显示指示线。
        </p>
      </div>
      <div class="h-80 overflow-hidden rounded-lg border border-default">
        <ResizableTable :data="data" :columns="resizableColumns" @select="handleSelect" />
      </div>
    </UCard>

    <!-- 2. 部分列固定 -->
    <UCard class="mx-auto mb-4 max-w-240">
      <div class="mb-3 flex flex-col gap-1">
        <h2 class="font-semibold text-(--text-color-primary)">部分列固定</h2>
        <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
          ID 与状态列未声明 resizable，拖拽手柄不渲染；仅姓名、邮箱列可调整宽度。
        </p>
      </div>
      <div class="h-80 overflow-hidden rounded-lg border border-default">
        <ResizableTable :data="data" :columns="mixedColumns" />
      </div>
    </UCard>

    <!-- 3. 自定义单元格 -->
    <UCard class="mx-auto mb-4 max-w-240">
      <div class="mb-3 flex flex-col gap-1">
        <h2 class="font-semibold text-(--text-color-primary)">自定义单元格</h2>
        <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
          状态列通过 cell 渲染函数输出带色块的标签；验证可调列与自定义渲染并存。
        </p>
      </div>
      <div class="h-80 overflow-hidden rounded-lg border border-default">
        <ResizableTable :data="data" :columns="resizableColumns" @select="handleSelect" />
      </div>
    </UCard>

    <UCard class="mx-auto max-w-240">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="font-semibold text-(--text-color-primary)">选中日志</h2>
        <UButton size="sm" variant="ghost" @click="clearLog">清空</UButton>
      </div>
      <ul class="m-0 max-h-70 list-none space-y-0 overflow-y-auto p-0">
        <li
          v-for="item in log"
          :key="item"
          class="border-b border-dashed border-(--text-color-5) py-1.5 font-mono text-[0.8125rem] text-(--text-color-secondary)"
        >
          {{ item }}
        </li>
        <li v-if="!log.length" class="py-2 text-sm text-(--text-color-tertiary)">暂无日志</li>
      </ul>
    </UCard>
  </main>
</template>
