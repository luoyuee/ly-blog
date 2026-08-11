<script setup lang="ts">
import type { MessageType } from "@/components/message";
import { h } from "vue";
import { createMessage, closeAllMessage } from "@/components/message";

/** 类型按钮清单 */
const typeList: Array<{ type: MessageType; label: string; message: string }> = [
  { type: "primary", label: "Primary", message: "这是一条主要提示消息" },
  { type: "success", label: "Success", message: "操作成功完成" },
  { type: "info", label: "Info", message: "这是一条普通信息" },
  { type: "warning", label: "Warning", message: "请注意潜在风险" },
  { type: "error", label: "Error", message: "操作执行失败" },
  { type: "loading", label: "Loading", message: "正在加载中..." }
];

/** 当前 loading 实例 handler 集合，用于演示手动关闭 */
const loadingHandlers = ref<Array<{ close: () => void }>>([]);

/** 触发基础类型消息 */
const triggerType = (item: { type: MessageType; message: string }) => {
  createMessage({ type: item.type, message: item.message });
};

/** 触发 loading 并保存 handler，3 秒后自动关闭 */
const triggerLoadingAuto = () => {
  createMessage({
    type: "loading",
    message: "3 秒后自动关闭",
    duration: 3000
  });
};

/** 触发 loading 默认行为（duration=0，需手动关闭） */
const triggerLoadingManual = () => {
  const handler = createMessage({
    type: "loading",
    message: "需手动关闭，点击右侧按钮可关闭全部"
  });
  loadingHandlers.value.push(handler);
};

/** 关闭全部消息 */
const handleCloseAll = () => {
  closeAllMessage();
  loadingHandlers.value = [];
};

/** 触发带关闭按钮的消息 */
const triggerShowClose = () => {
  createMessage({
    type: "info",
    message: "点击右侧 X 可手动关闭",
    showClose: true,
    duration: 0
  });
};

/** 触发自定义图标消息 */
const triggerCustomIcon = () => {
  createMessage({
    type: "success",
    message: "自定义图标演示",
    icon: "lucide:party-popper"
  });
};

/** 触发 VNode 内容消息 */
const triggerVNodeContent = () => {
  createMessage({
    type: "warning",
    message: h("span", { style: { color: "#e6a23c", fontWeight: 600 } }, "VNode 渲染内容")
  });
};

/** 触发函数内容消息 */
const triggerFunctionContent = () => {
  createMessage({
    type: "primary",
    message: () =>
      h("span", {}, [
        h("strong", { style: { marginRight: "4px" } }, "函数渲染:"),
        "支持动态返回 VNode"
      ])
  });
};

/** 触发自定义偏移消息 */
const triggerOffset = () => {
  createMessage({
    type: "success",
    message: "距顶部 80px 偏移",
    offset: 80
  });
};

/** 触发自定义 duration 消息 */
const triggerCustomDuration = () => {
  createMessage({
    type: "info",
    message: "1 秒后消失",
    duration: 1000
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
        Message 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        验证 Message 组件各类型展示、loading 行为、关闭按钮、自定义图标、VNode/函数内容、偏移与持续时间等。
      </p>
    </section>

    <section
      class="mx-auto mb-4 grid max-w-240 grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
    >
      <!-- 1. 基础类型 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">基础类型</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            点击按钮触发对应类型消息，默认 3 秒后关闭。
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="item in typeList"
              :key="item.type"
              :color="item.type === 'error' ? 'error' : item.type === 'success' ? 'success' : item.type === 'warning' ? 'warning' : 'neutral'"
              variant="outline"
              size="sm"
              @click="triggerType(item)"
            >
              {{ item.label }}
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- 2. Loading 自动关闭 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">Loading 自动关闭</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            显式传入 duration=3000，3 秒后自动关闭。
          </p>
          <UButton color="primary" variant="outline" size="sm" @click="triggerLoadingAuto">
            触发 loading（3s）
          </UButton>
        </div>
      </UCard>

      <!-- 3. Loading 手动关闭 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">Loading 手动关闭</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            不传 duration，默认 0 不自动关闭，需手动调用 close。
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton color="primary" variant="outline" size="sm" @click="triggerLoadingManual">
              触发 loading
            </UButton>
            <UButton color="error" variant="outline" size="sm" @click="handleCloseAll">
              关闭全部
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- 4. 关闭按钮 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">关闭按钮</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            showClose=true 显示关闭按钮，duration=0 不自动消失。
          </p>
          <UButton color="primary" variant="outline" size="sm" @click="triggerShowClose">
            显示可关闭消息
          </UButton>
        </div>
      </UCard>

      <!-- 5. 自定义图标 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义图标</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            通过 icon 字段覆盖默认图标。
          </p>
          <UButton color="primary" variant="outline" size="sm" @click="triggerCustomIcon">
            自定义图标
          </UButton>
        </div>
      </UCard>

      <!-- 6. VNode 内容 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">VNode 内容</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            message 传入 VNode，支持自定义渲染。
          </p>
          <UButton color="primary" variant="outline" size="sm" @click="triggerVNodeContent">
            VNode 内容
          </UButton>
        </div>
      </UCard>

      <!-- 7. 函数内容 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">函数内容</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            message 传入函数，动态返回 VNode。
          </p>
          <UButton color="primary" variant="outline" size="sm" @click="triggerFunctionContent">
            函数内容
          </UButton>
        </div>
      </UCard>

      <!-- 8. 自定义偏移 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义偏移</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            offset=80，距顶部 80px 显示。
          </p>
          <UButton color="primary" variant="outline" size="sm" @click="triggerOffset">
            偏移 80px
          </UButton>
        </div>
      </UCard>

      <!-- 9. 自定义 duration -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义 duration</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            duration=1000，1 秒后消失。
          </p>
          <UButton color="primary" variant="outline" size="sm" @click="triggerCustomDuration">
            1 秒消失
          </UButton>
        </div>
      </UCard>
    </section>
  </main>
</template>
