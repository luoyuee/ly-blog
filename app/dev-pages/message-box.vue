<script setup lang="ts">
import type { MessageBoxResult, MessageBoxType } from "@/components/message-box";

interface TypeItem {
  type: MessageBoxType;
  label: string;
  message: string;
}

const $msgBox = useMessageBox();
const log = ref<string[]>([]);

/** MessageBox 类型测试项 */
const typeList: TypeItem[] = [
  { type: "primary", label: "Primary", message: "这是一条主要操作提示" },
  { type: "success", label: "Success", message: "操作已成功完成" },
  { type: "warning", label: "Warning", message: "该操作可能产生风险" },
  { type: "info", label: "Info", message: "这是一条普通信息" },
  { type: "question", label: "Question", message: "确定要继续执行吗？" },
  { type: "error", label: "Error", message: "操作执行失败" }
];

/** 追加事件日志 */
const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  log.value.unshift(`[${time}] ${message}`);

  if (log.value.length > 30) {
    log.value.pop();
  }
};

/** 清空事件日志 */
const clearLog = () => {
  log.value = [];
};

/** 打开对应类型的基础消息框 */
const openType = (item: TypeItem) => {
  $msgBox[item.type]({
    title: `${item.label} 消息框`,
    message: item.message,
    onConfirm: () => addLog(`${item.label}：confirm`),
    onCancel: () => addLog(`${item.label}：cancel`),
    onClose: (result: MessageBoxResult) => addLog(`${item.label}：close action=${result.action}`)
  });
};

/** 测试仅展示确定按钮 */
const openOnlyConfirm = () => {
  $msgBox.info({
    title: "仅确定按钮",
    message: "隐藏取消按钮与右上角关闭按钮，只能通过确定按钮关闭。",
    showCancelButton: false,
    showCloseButton: false,
    onClose: (result: MessageBoxResult) => addLog(`仅确定按钮：action=${result.action}`)
  });
};

/** 测试按钮文案与属性覆盖 */
const openCustomButtons = () => {
  $msgBox.question({
    title: "自定义按钮",
    message: "验证按钮文案、颜色和变体配置。",
    confirmButtonText: "继续执行",
    cancelButtonText: "暂不执行",
    confirmButtonProps: { color: "success" },
    cancelButtonProps: { color: "error", variant: "soft" },
    onConfirm: () => addLog("自定义按钮：confirm"),
    onCancel: () => addLog("自定义按钮：cancel")
  });
};

/** 测试确定按钮不自动关闭 */
const openManualClose = () => {
  $msgBox.warning({
    title: "确定后不关闭",
    message: "closeOnConfirm=false，点击确定只触发事件，可通过取消或右上角按钮关闭。",
    closeOnConfirm: false,
    onConfirm: () => addLog("确定后不关闭：confirm，弹窗保持打开"),
    onClose: (result: MessageBoxResult) => addLog(`确定后不关闭：close action=${result.action}`)
  });
};

/** 测试 Promise 返回的关闭结果 */
const openPromiseResult = async () => {
  const { instance } = $msgBox.question({
    title: "Promise 结果",
    message: "关闭消息框后，通过 instance 获取 close 事件返回的 action。"
  });
  const result = await instance.result;
  addLog(`Promise：result=${JSON.stringify(result)}`);
};

/** 测试生命周期事件 */
const openLifecycle = () => {
  $msgBox.success({
    title: "生命周期事件",
    message: "关闭后记录 confirm/cancel、close 与 afterLeave 事件。",
    onConfirm: () => addLog("生命周期：confirm"),
    onCancel: () => addLog("生命周期：cancel"),
    onClose: (result: MessageBoxResult) => addLog(`生命周期：close action=${result.action}`),
    onAfterLeave: () => addLog("生命周期：afterLeave")
  });
};
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        MessageBox 测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        验证 MessageBox 的类型、按钮配置、关闭策略、提交状态、事件回调及 Promise 返回结果。
      </p>
    </section>

    <section
      class="mx-auto mb-4 grid max-w-240 grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]"
    >
      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">基础类型</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            打开六种内置类型，验证默认图标与颜色。
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="item in typeList"
              :key="item.type"
              color="neutral"
              variant="outline"
              size="sm"
              @click="openType(item)"
            >
              {{ item.label }}
            </UButton>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">仅确定按钮</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            隐藏取消和关闭按钮。
          </p>
          <UButton color="primary" variant="outline" @click="openOnlyConfirm">打开</UButton>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义按钮</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            自定义按钮文案、颜色与变体。
          </p>
          <UButton color="primary" variant="outline" @click="openCustomButtons">打开</UButton>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">确定后不关闭</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            验证 closeOnConfirm=false。
          </p>
          <UButton color="primary" variant="outline" @click="openManualClose">打开</UButton>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">Promise 结果</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            await instance 获取关闭动作。
          </p>
          <UButton color="primary" variant="outline" @click="openPromiseResult">打开</UButton>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">生命周期事件</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            验证操作、关闭和离场事件顺序。
          </p>
          <UButton color="primary" variant="outline" @click="openLifecycle">打开</UButton>
        </div>
      </UCard>
    </section>

    <UCard class="mx-auto max-w-240">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="font-semibold text-(--text-color-primary)">事件日志</h2>
        <UButton size="sm" variant="ghost" @click="clearLog">清空</UButton>
      </div>
      <ul class="m-0 max-h-80 list-none space-y-0 overflow-y-auto p-0">
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
