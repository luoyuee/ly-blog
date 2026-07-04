<script setup lang="ts">
import { ToolTipButton } from "@/components/tooltip-button";

definePageMeta({
  layout: "blank"
});

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
  <main class="tooltip-button-demo">
    <section class="tooltip-button-demo__hero">
      <p class="tooltip-button-demo__eyebrow">Development Only</p>
      <h1 class="tooltip-button-demo__title">ToolTipButton 组件测试页</h1>
      <p class="tooltip-button-demo__subtitle">
        用于验证 ToolTipButton 的 tooltip 文案、箭头配置、弹出方向、 UButton props 透传、disabled
        状态以及 click 事件。
      </p>
    </section>

    <section class="tooltip-button-demo__grid">
      <!-- 1. 基础用法 -->
      <div class="tooltip-button-demo__card">
        <h2 class="tooltip-button-demo__card-title">基础用法</h2>
        <p class="tooltip-button-demo__card-desc">默认 side=top，悬停显示 tooltip。</p>
        <div class="tooltip-button-demo__preview">
          <ToolTipButton
            tooltip="顶部提示"
            icon="i-mdi-home"
            color="primary"
            @click="handleClick('基础用法')"
          >
            基础按钮
          </ToolTipButton>
        </div>
      </div>

      <!-- 2. 四个方向 -->
      <div class="tooltip-button-demo__card">
        <h2 class="tooltip-button-demo__card-title">弹出方向</h2>
        <p class="tooltip-button-demo__card-desc">通过 side 控制 tooltip 出现方向。</p>
        <div class="tooltip-button-demo__preview tooltip-button-demo__preview--center">
          <ToolTipButton tooltip="top" side="top" color="primary" variant="outline" size="sm">
            上
          </ToolTipButton>
          <ToolTipButton tooltip="right" side="right" color="primary" variant="outline" size="sm">
            右
          </ToolTipButton>
          <ToolTipButton tooltip="bottom" side="bottom" color="primary" variant="outline" size="sm">
            下
          </ToolTipButton>
          <ToolTipButton tooltip="left" side="left" color="primary" variant="outline" size="sm">
            左
          </ToolTipButton>
        </div>
      </div>

      <!-- 3. 箭头配置 -->
      <div class="tooltip-button-demo__card">
        <h2 class="tooltip-button-demo__card-title">箭头配置</h2>
        <p class="tooltip-button-demo__card-desc">arrow=true 显示箭头，也可传配置对象。</p>
        <div class="tooltip-button-demo__preview">
          <ToolTipButton
            tooltip="无箭头"
            :arrow="false"
            color="neutral"
            variant="outline"
            size="sm"
          >
            无箭头
          </ToolTipButton>
          <ToolTipButton tooltip="有箭头" :arrow="true" color="neutral" variant="outline" size="sm">
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

      <!-- 4. 按钮 props 透传 -->
      <div class="tooltip-button-demo__card">
        <h2 class="tooltip-button-demo__card-title">Props 透传</h2>
        <p class="tooltip-button-demo__card-desc">所有 UButton props 均可透传。</p>
        <div class="tooltip-button-demo__preview">
          <ToolTipButton
            tooltip="primary 实心"
            color="primary"
            variant="solid"
            icon="i-mdi-check"
            @click="handleClick('primary solid')"
          >
            Solid
          </ToolTipButton>
          <ToolTipButton
            tooltip="error 描边"
            color="error"
            variant="outline"
            icon="i-mdi-close"
            @click="handleClick('error outline')"
          >
            Outline
          </ToolTipButton>
          <ToolTipButton
            tooltip="ghost 虚化"
            color="neutral"
            variant="ghost"
            icon="i-mdi-dots-horizontal"
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

      <!-- 5. 无 tooltip -->
      <div class="tooltip-button-demo__card">
        <h2 class="tooltip-button-demo__card-title">无 tooltip</h2>
        <p class="tooltip-button-demo__card-desc">不传 tooltip 时禁用提示，仅作为普通按钮。</p>
        <div class="tooltip-button-demo__preview">
          <ToolTipButton
            color="primary"
            variant="soft"
            icon="i-mdi-star"
            @click="handleClick('无 tooltip')"
          >
            无提示按钮
          </ToolTipButton>
        </div>
      </div>

      <!-- 6. disabled 状态 -->
      <div class="tooltip-button-demo__card">
        <h2 class="tooltip-button-demo__card-title">Disabled 状态</h2>
        <p class="tooltip-button-demo__card-desc">disabled 时 tooltip 仍可显示，但按钮不可点击。</p>
        <div class="tooltip-button-demo__preview">
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

      <!-- 7. 仅图标按钮 -->
      <div class="tooltip-button-demo__card">
        <h2 class="tooltip-button-demo__card-title">仅图标</h2>
        <p class="tooltip-button-demo__card-desc">无文字时 tooltip 提供操作说明。</p>
        <div class="tooltip-button-demo__preview">
          <ToolTipButton
            tooltip="编辑"
            icon="i-mdi-pencil"
            color="primary"
            variant="ghost"
            size="sm"
            @click="handleClick('仅图标-编辑')"
          />
          <ToolTipButton
            tooltip="删除"
            icon="i-mdi-delete"
            color="error"
            variant="ghost"
            size="sm"
            @click="handleClick('仅图标-删除')"
          />
          <ToolTipButton
            tooltip="分享"
            icon="i-mdi-share"
            color="success"
            variant="ghost"
            size="sm"
            @click="handleClick('仅图标-分享')"
          />
        </div>
      </div>
    </section>

    <section class="tooltip-button-demo__log">
      <div class="tooltip-button-demo__log-header">
        <h2 class="tooltip-button-demo__log-title">点击日志（累计 {{ clickCount }}）</h2>
        <UButton size="sm" variant="ghost" @click="clearLog">清空</UButton>
      </div>
      <ul class="tooltip-button-demo__log-list">
        <li v-for="item in log" :key="item" class="tooltip-button-demo__log-item">{{ item }}</li>
        <li v-if="!log.length" class="tooltip-button-demo__log-empty">暂无日志</li>
      </ul>
    </section>
  </main>
</template>

<style scoped lang="scss">
.tooltip-button-demo {
  min-height: 100vh;
  padding: 2rem;
  background: var(--background-color);

  &__hero {
    max-width: 960px;
    margin: 0 auto 1.5rem;
  }

  &__eyebrow {
    margin-bottom: 0.5rem;
    color: var(--text-color-tertiary);
    font-size: 0.875rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__title {
    margin-bottom: 0.75rem;
    color: var(--text-color-primary);
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    font-weight: 700;
    line-height: 1.2;
  }

  &__subtitle {
    color: var(--text-color-secondary);
    font-size: 1rem;
    line-height: 1.75;
  }

  &__grid {
    max-width: 960px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    border: 1px solid var(--text-color-5);
    border-radius: var(--radius-wrap);
    background: var(--background-color-box);
  }

  &__card-title {
    color: var(--text-color-primary);
    font-size: 1rem;
    font-weight: 600;
  }

  &__card-desc {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    line-height: 1.6;
  }

  &__preview {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    min-height: 6rem;
    padding: 1rem;
    border: 1px dashed var(--text-color-5);
    border-radius: 0.5rem;

    &--center {
      justify-content: center;
    }
  }

  &__log {
    max-width: 960px;
    margin: 1.5rem auto 0;
    padding: 1.25rem;
    border: 1px solid var(--text-color-5);
    border-radius: var(--radius-wrap);
    background: var(--background-color-box);
  }

  &__log-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  &__log-title {
    color: var(--text-color-primary);
    font-size: 1rem;
    font-weight: 600;
  }

  &__log-list {
    max-height: 280px;
    overflow-y: auto;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__log-item {
    padding: 0.375rem 0;
    border-bottom: 1px dashed var(--text-color-5);
    color: var(--text-color-secondary);
    font-size: 0.8125rem;
    font-family: ui-monospace, monospace;
  }

  &__log-empty {
    padding: 0.5rem 0;
    color: var(--text-color-tertiary);
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .tooltip-button-demo {
    padding: 1rem;

    &__grid {
      grid-template-columns: 1fr;
    }

    &__card,
    &__log {
      padding: 1rem;
    }
  }
}
</style>
