<script setup lang="ts">
import { Descriptions, DescriptionsItem } from "@/components/descriptions";
</script>

<template>
  <main class="min-h-screen p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>

      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        Descriptions 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        该页面仅在开发环境注入，用于手动验证 descriptions
        当前版本的插槽结构、横向布局、纵向布局和边框表现。
      </p>
    </section>

    <UCard class="mx-auto mb-4 max-w-240">
      <Descriptions title="基础横向布局" extra="column 响应式" :column="1">
        <DescriptionsItem label="站点名称">Ly Blog</DescriptionsItem>
        <DescriptionsItem label="Nuxt 版本">4</DescriptionsItem>
        <DescriptionsItem label="状态">开发专用</DescriptionsItem>
        <DescriptionsItem label="最近更新">2026-04-25 10:30</DescriptionsItem>
        <DescriptionsItem label="技术栈" :span="3">
          Nuxt 4、Vue 3、TypeScript、Tailwind CSS V4
        </DescriptionsItem>
      </Descriptions>
    </UCard>

    <UCard class="mx-auto mb-4 max-w-240">
      <Descriptions title="垂直布局" extra="vertical" vertical :column="2">
        <DescriptionsItem label="作者">Sisyphus</DescriptionsItem>
        <DescriptionsItem label="组件导出">Descriptions / DescriptionsItem</DescriptionsItem>
        <DescriptionsItem label="当前目标" :span="2">
          验证固定边框模式下的垂直双行结构、跨列行为以及默认内容插槽渲染是否正常。
        </DescriptionsItem>
        <DescriptionsItem label="备注">生产构建不会注册该页面路由。</DescriptionsItem>
      </Descriptions>
    </UCard>

    <UCard class="mx-auto mb-4 max-w-240">
      <Descriptions size="sm" :column="1">
        <template #title>自定义标题插槽</template>
        <template #extra>
          <UButton>自定义按钮插槽</UButton>
        </template>

        <DescriptionsItem>
          <template #label>
            <span class="font-semibold text-(--text-color-primary)">自定义标签</span>
          </template>
          <span class="text-(--text-color-secondary)">通过 label 插槽替换默认标题文本。</span>
        </DescriptionsItem>

        <DescriptionsItem label="内容插槽">
          验证简化后仅保留表格主体和默认内容插槽。
        </DescriptionsItem>
      </Descriptions>
    </UCard>
  </main>
</template>
