<script setup lang="ts">
import { Placeholder } from "@/components/placeholder";
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        Placeholder 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        用于验证 Placeholder 的虚线边框、斜纹背景、默认插槽内容渲染，以及通过 ui prop
        覆写主题样式的能力。
      </p>
    </section>

    <section
      class="mx-auto mb-4 grid max-w-240 grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
    >
      <!-- 1. 基础用法 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">基础用法</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            默认渲染虚线边框与斜纹背景，通过默认插槽填充内容。
          </p>
          <Placeholder class="h-32">
            <span class="text-sm text-(--text-color-secondary)">基础占位内容</span>
          </Placeholder>
        </div>
      </UCard>

      <!-- 2. 空插槽 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">空插槽</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            不传入插槽内容时，仅展示边框与背景图案，不渲染内容层。
          </p>
          <Placeholder class="h-32" />
        </div>
      </UCard>

      <!-- 3. 自定义高度 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义高度</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            通过外部 class 控制占位区域尺寸。
          </p>
          <Placeholder class="h-64">
            <span class="text-sm text-(--text-color-secondary)">h-64 高度</span>
          </Placeholder>
        </div>
      </UCard>

      <!-- 4. 嵌套组件 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">嵌套组件</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            插槽内可放置任意组件，验证内容居中表现。
          </p>
          <Placeholder class="h-40">
            <UIcon name="lucide:image" class="size-8 text-(--text-color-tertiary)" />
            <UButton
              color="primary"
              size="sm"
              @click="
                () => {
                  console.log('上传图片');
                }
              "
              >上传图片</UButton
            >
          </Placeholder>
        </div>
      </UCard>

      <!-- 5. 富文本内容 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">富文本内容</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            插槽内放入多行文本与图标组合。
          </p>
          <Placeholder class="h-40">
            <div class="flex flex-col items-center gap-2 text-center">
              <UIcon name="lucide:package-open" class="size-7 text-(--text-color-tertiary)" />
              <p class="m-0 text-sm font-medium text-(--text-color-secondary)">暂无数据</p>
              <p class="m-0 text-xs text-(--text-color-tertiary)">新增后将在此处展示</p>
            </div>
          </Placeholder>
        </div>
      </UCard>

      <!-- 6. ui 主题覆写 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">ui 覆写</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            通过 ui prop 覆写 container / pattern / content 样式，与 Nuxt UI 主题系统一致。
          </p>
          <Placeholder
            class="h-40"
            :ui="{
              container: 'border-primary border-2 rounded-lg opacity-100 bg-primary/5',
              pattern: 'stroke-primary/20',
              content: 'gap-1'
            }"
          >
            <UIcon name="lucide:sparkles" class="size-7 text-primary" />
            <span class="text-sm font-medium text-primary">自定义主题</span>
          </Placeholder>
        </div>
      </UCard>
    </section>
  </main>
</template>
