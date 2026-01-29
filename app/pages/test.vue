<script lang="ts" setup>
import { useMessage } from "@/composables/useMessage";
import { ImageSelectModal, ImageSelect } from "@/components/image";
import { TreeSelect } from "@/components/tree-select";
import type { ITreeNode } from "@/components/tree-select/src/types";
import { DatePicker } from "@/components/form/date-picker";
import { FakeAvatar } from "@/components/avatar";

const $notify = useNotification();
const $msgBox = useMessageBox();

const { primary, success, warning, info, error } = useMessage({
  // duration: 0,
  showClose: true
});

const mes1 = () => {
  primary("这是一条primary消息");
};

const mes2 = () => {
  success("这是一条success消息");
};

const mes3 = () => {
  warning("这是一条warning消息");
};

const mes4 = () => {
  info("这是一条info消息");
};

const mes5 = () => {
  error("这是一条error消息");

  const err = new Error("这是一条error消息");
  error("这是一条error消息", err);
};

const msg1 = () => {
  $msgBox.question({
    title: "确认删除吗？",
    message: "删除后将无法恢复",
    showCancelButton: true,
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    onConfirm: () => {
      success("删除成功");
    },
    onCancel: () => {
      info("已取消删除");
    }
  });
};

const notf1 = () => {
  $notify.success({
    title: "这是一条success消息"
  });
};

const visible = ref(false);
const t1 = () => {
  visible.value = true;
};

// TreeSelect 示例数据
const treeOptions: ITreeNode[] = [
  {
    id: 1,
    label: "前端",
    children: [
      { id: 11, label: "Vue" },
      { id: 12, label: "React" },
      { id: 13, label: "Svelte", selectable: false },
      { id: 14, label: "Angular", disabled: true }
    ]
  },
  {
    id: 2,
    label: "后端",
    children: [
      { id: 21, label: "Node.js" },
      { id: 22, label: "Go" },
      { id: 23, label: "Rust" }
    ]
  },
  {
    id: 3,
    label: "数据库",
    children: [
      { id: 31, label: "PostgreSQL" },
      { id: 32, label: "MySQL" },
      { id: 33, label: "SQLite" }
    ]
  }
];

const treeValueSingle = ref<string | number | null>(null);
const treeValueMultiple = ref<(string | number)[]>([]);

const d = ref("2025-10-12");
const d2 = ref([]);

const img = ref([]);

const loading = ref(true);
</script>
<template>
  <div>
    <DatePicker v-model="d" format="YYYY-MM-DD HH:mm:ss" value-format="timestamp" />
    <DatePicker v-model="d2" format="YYYY-MM-DD HH:mm:ss" range value-format="timestamp" />
    <UButton @click="mes1">按钮1</UButton>
    <UButton @click="mes2">按钮2</UButton>
    <UButton @click="mes3">按钮3</UButton>
    <UButton @click="mes4">按钮4</UButton>
    <UButton @click="mes5">按钮5</UButton>

    <div>
      <UButton @click="msg1">msg按钮1</UButton>
      <UButton @click="mes2">msg按钮2</UButton>
      <UButton @click="mes3">msg按钮3</UButton>
      <UButton @click="mes4">msg按钮4</UButton>
      <UButton @click="notf1">msg按钮5</UButton>
    </div>

    <div>
      <UButton @click="t1">打开图片选择器</UButton>
    </div>
    <ImageSelectModal destroyOnClose v-model:visible="visible" multiple />

    <ImageSelect multiple :limit="3" v-model="img" />

    <div class="mt-6 space-y-4">
      <div>
        <h3 class="font-medium mb-2">树选择（单选）</h3>
        <TreeSelect
          :options="treeOptions"
          v-model="treeValueSingle"
          placeholder="请选择（单选）"
          searchable
        />
        <div class="text-sm text-gray-500 mt-1">当前选中：{{ treeValueSingle }}</div>
      </div>

      <div>
        <h3 class="font-medium mb-2">树选择（多选）</h3>
        <TreeSelect
          :options="treeOptions"
          v-model="treeValueMultiple"
          multiple
          searchable
          :max-tag-count="3"
          placeholder="请选择（多选）"
        />
        <div class="text-sm text-gray-500 mt-1">当前选中：{{ treeValueMultiple }}</div>
      </div>

      <div>
        <h3 class="font-medium mb-2">FakeAvatar 预览</h3>
        <div class="flex items-center gap-4">
          <FakeAvatar username="李白" shape="circle" :size="48" />
          <FakeAvatar username="张三丰" shape="square" :size="48" />
          <FakeAvatar username="John Doe" shape="circle" :size="48" />
          <FakeAvatar username="A.B" shape="square" :size="48" />
          <FakeAvatar username="luoyue" shape="square" :size="48" />
          <FakeAvatar username="洛月" shape="square" :size="48" />
          <FakeAvatar username="有图片时不显示假头像" :size="48" src="/images/avatar.webp" />
        </div>
      </div>
    </div>

    <UPopover>
      <UButton label="Open" color="neutral" variant="subtle" />

      <template #content>
        <UInput placeholder="请输入" />
        <UButton label="确认" color="primary" variant="solid" />
      </template>
    </UPopover>

    <div
      v-loading="loading"
      custom-loading-text="自定义加载中文案"
      class="m-6 w-100 h-50 bg-red-500"
    >
    </div>
  </div>
</template>

<style></style>
