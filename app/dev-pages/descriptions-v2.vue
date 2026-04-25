<script setup lang="ts">
import { Descriptions, DescriptionsItem } from "@/components/descriptions-v2";

definePageMeta({
  layout: "blank"
});
</script>

<template>
  <main class="descriptions-v2-demo">
    <section class="descriptions-v2-demo__hero">
      <p class="descriptions-v2-demo__eyebrow">Development Only</p>
      <h1 class="descriptions-v2-demo__title">Descriptions 组件测试页</h1>
      <p class="descriptions-v2-demo__subtitle">
        该页面仅在开发环境注入，用于手动验证 descriptions-v2
        当前版本的插槽结构、横向布局、纵向布局和边框表现。
      </p>
    </section>

    <section class="descriptions-v2-demo__section">
      <Descriptions title="基础横向布局" extra="column 响应式" :column="1">
        <DescriptionsItem label="站点名称">Ly Blog</DescriptionsItem>
        <DescriptionsItem label="Nuxt 版本">4</DescriptionsItem>
        <DescriptionsItem label="状态">开发专用</DescriptionsItem>
        <DescriptionsItem label="最近更新">2026-04-25 10:30</DescriptionsItem>
        <DescriptionsItem label="技术栈" :span="3">
          Nuxt 4、Vue 3、TypeScript、Tailwind CSS V4
        </DescriptionsItem>
      </Descriptions>
    </section>

    <section class="descriptions-v2-demo__section">
      <Descriptions title="垂直布局" extra="vertical" vertical :column="2">
        <DescriptionsItem label="作者">Sisyphus</DescriptionsItem>
        <DescriptionsItem label="组件导出">Descriptions / DescriptionsItem</DescriptionsItem>
        <DescriptionsItem label="当前目标" :span="2">
          验证固定边框模式下的垂直双行结构、跨列行为以及默认内容插槽渲染是否正常。
        </DescriptionsItem>
        <DescriptionsItem label="备注">生产构建不会注册该页面路由。</DescriptionsItem>
      </Descriptions>
    </section>

    <section class="descriptions-v2-demo__section">
      <Descriptions size="sm" :column="1">
        <template #title>自定义标题插槽</template>
        <template #extra>
          <UButton>自定义按钮插槽</UButton>
        </template>

        <DescriptionsItem>
          <template #label>
            <span class="descriptions-v2-demo__label">自定义标签</span>
          </template>
          <span class="descriptions-v2-demo__content">通过 label 插槽替换默认标题文本。</span>
        </DescriptionsItem>

        <DescriptionsItem label="内容插槽">
          验证简化后仅保留表格主体和默认内容插槽。
        </DescriptionsItem>
      </Descriptions>
    </section>
  </main>
</template>

<style scoped lang="scss">
.descriptions-v2-demo {
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

  &__section {
    max-width: 960px;
    margin: 0 auto 1rem;
    padding: 1.25rem;
    border: 1px solid var(--text-color-5);
    border-radius: var(--radius-wrap);
    background: var(--background-color-box);
  }

  &__label {
    color: var(--text-color-primary);
    font-weight: 600;
  }

  &__content {
    color: var(--text-color-secondary);
  }

  &__extra {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .descriptions-v2-demo {
    padding: 1rem;

    &__section {
      padding: 1rem;
    }
  }
}
</style>
