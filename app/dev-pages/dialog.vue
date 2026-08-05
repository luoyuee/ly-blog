<script setup lang="ts">
import type { DialogResult } from "@/components/dialog";
import { useDialog } from "@/composables/useDialog";
import { h } from "vue";

/** 事件日志，最近的交互记录置顶 */
const log = ref<string[]>([]);

/** 追加一条日志，超过 30 条自动裁剪 */
const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  log.value.unshift(`[${time}] ${message}`);
  if (log.value.length > 30) {
    log.value.pop();
  }
};

/** 清空日志 */
const clearLog = () => {
  log.value = [];
};

// 1. 基础对话框：验证默认结构
const basicDialog = useDialog({
  title: "基础对话框",
  description: "展示默认结构。closeOnConfirm 默认为 false，点击确定不会关闭，需手动取消或关闭。",
  onConfirm: () => addLog("基础对话框：onConfirm"),
  onCancel: () => addLog("基础对话框：onCancel"),
  onClose: (result: DialogResult) => addLog(`基础对话框：onClose action=${result.action}`)
});

// 2. 确认即关闭
const confirmCloseDialog = useDialog({
  title: "确认即关闭",
  description: "closeOnConfirm = true，点击确定后弹窗自动关闭。",
  closeOnConfirm: true,
  onConfirm: () => addLog("确认即关闭：onConfirm"),
  onClose: (result: DialogResult) => addLog(`确认即关闭：onClose action=${result.action}`)
});

// 3. 仅确定按钮
const onlyConfirmDialog = useDialog({
  title: "仅确定按钮",
  description: "showCancelButton = false，隐藏取消按钮，配合 closeOnConfirm 关闭。",
  showCancelButton: false,
  closeOnConfirm: true,
  onConfirm: () => addLog("仅确定按钮：onConfirm")
});

// 4. 无底部 + 自定义内容：通过 content 渲染函数提供关闭入口
const noFooterDialog = useDialog({
  title: "无底部按钮",
  description: "showFooter = false，通过 content 渲染函数提供关闭入口。",
  showFooter: false,
  content: (actions) =>
    h("div", { class: "flex flex-col gap-3" }, [
      h("p", { class: "text-sm" }, "正文通过 content 渲染函数生成，可调用 actions 主动关闭。"),
      h("div", { class: "flex gap-2" }, [
        h(
          "button",
          {
            class: "px-3 py-1.5 text-sm rounded bg-primary text-white cursor-pointer",
            onClick: () => actions.confirm()
          },
          "调用 confirm"
        ),
        h(
          "button",
          {
            class: "px-3 py-1.5 text-sm rounded border border-default cursor-pointer",
            onClick: () => actions.close()
          },
          "调用 close"
        )
      ])
    ])
});

// 5. 自定义按钮文案与样式
const customButtonDialog = useDialog({
  title: "自定义按钮",
  description: "通过 confirmButtonText / cancelButtonText / 按钮 props 自定义文案与样式。",
  confirmButtonText: "保存修改",
  cancelButtonText: "放弃",
  confirmButtonProps: { color: "success" },
  cancelButtonProps: { color: "neutral", variant: "solid" },
  closeOnConfirm: true,
  onConfirm: () => addLog("自定义按钮：onConfirm"),
  onCancel: () => addLog("自定义按钮：onCancel")
});

// 6. beforeClose 拦截：需手动调用 done 才会真正关闭
const beforeCloseDialog = useDialog({
  title: "关闭拦截",
  description: "beforeClose 拦截所有关闭动作，需手动调用 done 才会真正关闭。",
  beforeClose: (e) => {
    addLog(`关闭拦截：收到 action=${e.action}，延迟 800ms 放行`);
    setTimeout(() => {
      e.done();
      addLog("关闭拦截：done 已调用");
    }, 800);
  }
});

// 7. 全屏
const fullscreenDialog = useDialog({
  title: "全屏对话框",
  description: "fullscreen = true，弹窗铺满视口。",
  fullscreen: true,
  closeOnConfirm: true,
  onConfirm: () => addLog("全屏：onConfirm")
});

// 8. 不可遮罩关闭：dismissible = false
const nonDismissDialog = useDialog({
  title: "不可遮罩关闭",
  description: "dismissible = false，点击遮罩与 ESC 不关闭，仅能通过按钮关闭。",
  dismissible: false,
  closeOnConfirm: true,
  closeOnCancel: true
});

// 9. Promise 结果：open() 返回 Promise，关闭时 resolve 出 close 事件 payload
const promiseDialog = useDialog({
  title: "Promise 结果",
  description: "open() 返回 Promise，关闭时 resolve 出 close 事件的 payload。",
  closeOnConfirm: true,
  onClose: (result: DialogResult) => addLog(`Promise：onClose action=${result.action}`)
});

const openPromise = async () => {
  const result = await promiseDialog.open();
  addLog(`Promise：await 解析 result=${JSON.stringify(result)}`);
};

// 10. destroyOnClose：关闭后实例销毁，无法再次 open，因此每次点击都新建实例
const openDestroy = () => {
  const dialog = useDialog({
    title: "destroyOnClose",
    description: "关闭后实例被销毁，无法再次 open。每次点击都会创建新实例。",
    destroyOnClose: true,
    closeOnConfirm: true,
    onAfterLeave: () => addLog("destroyOnClose：onAfterLeave，实例已销毁")
  });
  dialog.open();
};
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        useDialog 测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        用于验证 useDialog 组合式函数的各项配置：按钮显隐、关闭策略、 beforeClose
        拦截、自定义内容、全屏、Promise 结果与 destroyOnClose。
      </p>
    </section>

    <section
      class="mx-auto mb-4 grid max-w-240 grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]"
    >
      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">基础对话框</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            默认结构，closeOnConfirm=false，点击确定不关闭。
          </p>
          <UButton
            color="primary"
            variant="outline"
            @click="
              () => {
                basicDialog.open();
              }
            "
          >
            打开
          </UButton>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">确认即关闭</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            closeOnConfirm=true，确定后自动关闭。
          </p>
          <UButton
            color="primary"
            variant="outline"
            @click="
              () => {
                confirmCloseDialog.open();
              }
            "
          >
            打开
          </UButton>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">仅确定按钮</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            showCancelButton=false。
          </p>
          <UButton
            color="primary"
            variant="outline"
            @click="
              () => {
                onlyConfirmDialog.open();
              }
            "
          >
            打开
          </UButton>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">无底部 + 自定义内容</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            showFooter=false，content 渲染函数提供按钮。
          </p>
          <UButton
            color="primary"
            variant="outline"
            @click="
              () => {
                noFooterDialog.open();
              }
            "
          >
            打开
          </UButton>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义按钮</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            文案、颜色、变体自定义。
          </p>
          <UButton
            color="primary"
            variant="outline"
            @click="
              () => {
                customButtonDialog.open();
              }
            "
          >
            打开
          </UButton>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">beforeClose 拦截</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            延迟 800ms 后才放行关闭。
          </p>
          <UButton
            color="primary"
            variant="outline"
            @click="
              () => {
                beforeCloseDialog.open();
              }
            "
          >
            打开
          </UButton>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">全屏</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            fullscreen=true。
          </p>
          <UButton
            color="primary"
            variant="outline"
            @click="
              () => {
                fullscreenDialog.open();
              }
            "
          >
            打开
          </UButton>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">不可遮罩关闭</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            dismissible=false。
          </p>
          <UButton
            color="primary"
            variant="outline"
            @click="
              () => {
                nonDismissDialog.open();
              }
            "
            >打开</UButton
          >
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">Promise 结果</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            await open() 获取关闭结果。
          </p>
          <UButton color="primary" variant="outline" @click="openPromise">打开</UButton>
        </div>
      </UCard>

      <UCard>
        <div class="flex h-full flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">destroyOnClose</h2>
          <p class="flex-1 text-sm leading-[1.6] text-(--text-color-secondary)">
            关闭后销毁实例，每次新建。
          </p>
          <UButton color="primary" variant="outline" @click="openDestroy">打开</UButton>
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
