<script setup lang="ts">
import { ToolTipButton } from "@/components/tooltip-button";

/** 点击事件日志 */
const log = ref<string[]>([]);

/** 追加日志 */
const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  log.value.unshift(`[${time}] ${message}`);
  if (log.value.length > 20) {
    log.value.pop();
  }
};

/** 清空日志 */
const clearLog = () => {
  log.value = [];
};

/** 点击计数 */
const clickCount = ref(0);

/** 处理点击 */
const handleClick = (label: string) => {
  clickCount.value += 1;
  addLog(`${label} 被点击（累计 ${clickCount.value} 次）`);
};
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        ToolTipButton 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        用于验证 ToolTipButton 的 tooltip 文案、箭头配置、弹出方向、 UButton props 透传、disabled
        状态以及 click 事件。
      </p>
    </section>

    <section
      class="mx-auto mb-4 grid max-w-240 grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
    >
      <!-- 1. 基础用法 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">基础用法</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >默认 side=top，悬停显示 tooltip。</p
          >
          <div
            class="flex min-h-24 flex-wrap items-center gap-3 rounded-lg border border-dashed border-(--text-color-5) p-4"
          >
            <ToolTipButton
              tooltip="顶部提示"
              icon="mdi:home"
              color="primary"
              @click="handleClick('基础用法')"
            >
              基础按钮
            </ToolTipButton>
          </div>
        </div>
      </UCard>

      <!-- 2. 四个方向 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">弹出方向</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >通过 side 控制 tooltip 出现方向。</p
          >
          <div
            class="flex min-h-24 flex-wrap items-center justify-center gap-3 rounded-lg border border-dashed border-(--text-color-5) p-4"
          >
            <ToolTipButton tooltip="top" side="top" color="primary" variant="outline" size="sm">
              上
            </ToolTipButton>
            <ToolTipButton tooltip="right" side="right" color="primary" variant="outline" size="sm">
              右
            </ToolTipButton>
            <ToolTipButton
              tooltip="bottom"
              side="bottom"
              color="primary"
              variant="outline"
              size="sm"
            >
              下
            </ToolTipButton>
            <ToolTipButton tooltip="left" side="left" color="primary" variant="outline" size="sm">
              左
            </ToolTipButton>
          </div>
        </div>
      </UCard>

      <!-- 3. 箭头配置 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">箭头配置</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >arrow=true 显示箭头，也可传配置对象。</p
          >
          <div
            class="flex min-h-24 flex-wrap items-center gap-3 rounded-lg border border-dashed border-(--text-color-5) p-4"
          >
            <ToolTipButton
              tooltip="无箭头"
              :arrow="false"
              color="neutral"
              variant="outline"
              size="sm"
            >
              无箭头
            </ToolTipButton>
            <ToolTipButton
              tooltip="有箭头"
              :arrow="true"
              color="neutral"
              variant="outline"
              size="sm"
            >
              有箭头
            </ToolTipButton>
            <ToolTipButton
              tooltip="自定义箭头"
              :arrow="{ width: 14, height: 7 }"
              color="neutral"
              variant="outline"
              size="sm"
            >
              自定义箭头
            </ToolTipButton>
          </div>
        </div>
      </UCard>

      <!-- 4. 按钮 props 透传 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">Props 透传</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >所有 UButton props 均可透传。</p
          >
          <div
            class="flex min-h-24 flex-wrap items-center gap-3 rounded-lg border border-dashed border-(--text-color-5) p-4"
          >
            <ToolTipButton
              tooltip="primary 实心"
              color="primary"
              variant="solid"
              icon="mdi:check"
              @click="handleClick('primary solid')"
            >
              Solid
            </ToolTipButton>
            <ToolTipButton
              tooltip="error 描边"
              color="error"
              variant="outline"
              icon="mdi:close"
              @click="handleClick('error outline')"
            >
              Outline
            </ToolTipButton>
            <ToolTipButton
              tooltip="ghost 虚化"
              color="neutral"
              variant="ghost"
              icon="mdi:dots-horizontal"
              @click="handleClick('ghost')"
            />
            <ToolTipButton
              tooltip="loading 状态"
              color="primary"
              :loading="true"
              @click="handleClick('loading')"
            >
              Loading
            </ToolTipButton>
          </div>
        </div>
      </UCard>

      <!-- 5. 无 tooltip -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">无 tooltip</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >不传 tooltip 时禁用提示，仅作为普通按钮。</p
          >
          <div
            class="flex min-h-24 flex-wrap items-center gap-3 rounded-lg border border-dashed border-(--text-color-5) p-4"
          >
            <ToolTipButton
              color="primary"
              variant="soft"
              icon="mdi:star"
              @click="handleClick('无 tooltip')"
            >
              无提示按钮
            </ToolTipButton>
          </div>
        </div>
      </UCard>

      <!-- 6. disabled 状态 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">Disabled 状态</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >disabled 时 tooltip 仍可显示，但按钮不可点击。</p
          >
          <div
            class="flex min-h-24 flex-wrap items-center gap-3 rounded-lg border border-dashed border-(--text-color-5) p-4"
          >
            <ToolTipButton
              tooltip="按钮已被禁用"
              color="neutral"
              variant="solid"
              disabled
              @click="handleClick('disabled（不应触发）')"
            >
              Disabled
            </ToolTipButton>
          </div>
        </div>
      </UCard>

      <!-- 7. 仅图标按钮 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">仅图标</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >无文字时 tooltip 提供操作说明。</p
          >
          <div
            class="flex min-h-24 flex-wrap items-center gap-3 rounded-lg border border-dashed border-(--text-color-5) p-4"
          >
            <ToolTipButton
              tooltip="编辑"
              icon="mdi:pencil"
              color="primary"
              variant="ghost"
              size="sm"
              @click="handleClick('仅图标-编辑')"
            />
            <ToolTipButton
              tooltip="删除"
              icon="mdi:delete"
              color="error"
              variant="ghost"
              size="sm"
              @click="handleClick('仅图标-删除')"
            />
            <ToolTipButton
              tooltip="分享"
              icon="mdi:share"
              color="success"
              variant="ghost"
              size="sm"
              @click="handleClick('仅图标-分享')"
            />
          </div>
        </div>
      </UCard>
    </section>

    <UCard class="mx-auto max-w-240">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="font-semibold text-(--text-color-primary)">点击日志（累计 {{ clickCount }}）</h2>
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
