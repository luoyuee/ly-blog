<script setup lang="ts">
import { Spin } from "@/components/spin";

/** 局部遮罩开关 */
const localLoading = ref(false);

/** 自定义 spinner 局部遮罩开关 */
const customSpinnerLoading = ref(false);

/** 全屏遮罩开关 */
const fullscreenLoading = ref(false);

/** 不锁滚动的全屏遮罩开关 */
const fullscreenNoLockLoading = ref(false);

/** 长文本演示 */
const longTextLoading = ref(false);

/** 自定义样式演示 */
const customStyleLoading = ref(false);

/**
 * 生成一个 2 秒后自动关闭的加载触发器。
 *
 * 模板中 ref 会被自动解包为 boolean，无法直接传入按 ref 操作的函数，
 * 因此这里在 setup 内部闭包绑定对应的 ref（setup 内不会解包），
 * 返回无参函数供模板调用，同时保证类型安全。
 */
const createLoadTrigger = (target: Ref<boolean>) => () => {
  target.value = true;
  setTimeout(() => {
    target.value = false;
  }, 2000);
};

const triggerLocal = createLoadTrigger(localLoading);
const triggerLongText = createLoadTrigger(longTextLoading);
const triggerCustomSpinner = createLoadTrigger(customSpinnerLoading);
const triggerCustomStyle = createLoadTrigger(customStyleLoading);
const triggerFullscreen = createLoadTrigger(fullscreenLoading);
const triggerFullscreenNoLock = createLoadTrigger(fullscreenNoLockLoading);
</script>

<template>
  <main class="min-h-screen p-4 md:p-8">
    <section class="mx-auto mb-6 max-w-240">
      <p class="mb-2 text-sm uppercase tracking-[0.08em] text-(--text-color-tertiary)">
        Development Only
      </p>
      <h1 class="mb-3 text-2xl font-bold leading-[1.2] text-(--text-color-primary)">
        Spin 组件测试页
      </h1>
      <p class="text-base leading-[1.75] text-(--text-color-secondary)">
        用于验证 Spin 组件的局部遮罩、全屏遮罩、滚动锁、自定义文案、 自定义 spinner
        插槽以及各类样式覆写入口。
      </p>
    </section>

    <section
      class="mx-auto mb-4 grid max-w-240 grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
    >
      <!-- 1. 局部遮罩 + 默认文案 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">局部遮罩</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >包裹内容区域，loading=true 时显示遮罩。</p
          >
          <div
            class="min-h-40 overflow-hidden rounded-lg border border-dashed border-(--text-color-5)"
          >
            <Spin :loading="localLoading" wrapper-class="h-40">
              <div
                class="flex h-full items-center justify-center p-4 text-center text-sm text-(--text-color-secondary)"
              >
                这里是被遮罩的内容区域，点击下方按钮触发 loading。
              </div>
            </Spin>
          </div>
          <UButton color="primary" variant="outline" size="sm" @click="triggerLocal">
            触发加载（2s）
          </UButton>
        </div>
      </UCard>

      <!-- 2. 主副文案 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">主副文案</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >通过 text / description 自定义文案。</p
          >
          <div
            class="min-h-40 overflow-hidden rounded-lg border border-dashed border-(--text-color-5)"
          >
            <Spin
              :loading="longTextLoading"
              text="正在拉取数据"
              description="预计需要 2 秒，请稍候..."
              wrapper-class="h-40"
            >
              <div
                class="flex h-full items-center justify-center p-4 text-center text-sm text-(--text-color-secondary)"
              >
                自定义文案演示。
              </div>
            </Spin>
          </div>
          <UButton color="primary" variant="outline" size="sm" @click="triggerLongText">
            触发加载（2s）
          </UButton>
        </div>
      </UCard>

      <!-- 3. 自定义 spinner 插槽 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">自定义 spinner</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >通过 spinner 插槽替换默认图标。</p
          >
          <div
            class="min-h-40 overflow-hidden rounded-lg border border-dashed border-(--text-color-5)"
          >
            <Spin :loading="customSpinnerLoading" text="处理中" wrapper-class="h-40">
              <div
                class="flex h-full items-center justify-center p-4 text-center text-sm text-(--text-color-secondary)"
              >
                自定义 spinner 插槽演示。
              </div>
              <template #spinner>
                <div class="flex gap-1">
                  <span
                    class="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"
                  ></span>
                  <span
                    class="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"
                  ></span>
                  <span class="size-2 animate-bounce rounded-full bg-primary"></span>
                </div>
              </template>
            </Spin>
          </div>
          <UButton color="primary" variant="outline" size="sm" @click="triggerCustomSpinner">
            触发加载（2s）
          </UButton>
        </div>
      </UCard>

      <!-- 4. 自定义样式覆写 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">样式覆写</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >通过 overlayClass / panelClass / spinnerClass 覆写。</p
          >
          <div
            class="min-h-40 overflow-hidden rounded-lg border border-dashed border-(--text-color-5)"
          >
            <Spin
              :loading="customStyleLoading"
              text="自定义样式"
              wrapper-class="h-40"
              overlay-class="bg-primary/20"
              panel-class="bg-white rounded-lg shadow-lg"
              spinner-class="size-10 text-error"
            >
              <div
                class="flex h-full items-center justify-center p-4 text-center text-sm text-(--text-color-secondary)"
              >
                样式覆写演示。
              </div>
            </Spin>
          </div>
          <UButton color="primary" variant="outline" size="sm" @click="triggerCustomStyle">
            触发加载（2s）
          </UButton>
        </div>
      </UCard>

      <!-- 5. 无插槽独立占位 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">独立占位</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >无默认插槽时，非 fullscreen 作为独立加载占位。</p
          >
          <div
            class="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-(--text-color-5)"
          >
            <Spin :loading="true" text="永久加载态" />
          </div>
        </div>
      </UCard>

      <!-- 6. 全屏遮罩 + 锁滚动 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">全屏遮罩（锁滚动）</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)">
            fullscreen=true，lockScroll=true，遮罩 Teleport 到 body。
          </p>
          <div
            class="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-(--text-color-5) p-4 text-center text-[0.8125rem] text-(--text-color-secondary)"
          >
            点击后整页覆盖遮罩，body 滚动被锁定。
          </div>
          <UButton color="primary" variant="outline" size="sm" @click="triggerFullscreen">
            触发全屏（2s）
          </UButton>
          <Spin
            :loading="fullscreenLoading"
            :fullscreen="true"
            :lock-scroll="true"
            text="全屏加载中"
            description="页面滚动已被锁定"
            :z-index="50"
          />
        </div>
      </UCard>

      <!-- 7. 全屏遮罩 + 不锁滚动 -->
      <UCard>
        <div class="flex flex-col gap-3">
          <h2 class="font-semibold text-(--text-color-primary)">全屏遮罩（不锁滚动）</h2>
          <p class="text-sm leading-[1.6] text-(--text-color-secondary)"
            >fullscreen=true，lockScroll=false，可滚动查看底层内容。</p
          >
          <div
            class="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-(--text-color-5) p-4 text-center text-[0.8125rem] text-(--text-color-secondary)"
          >
            点击后整页覆盖遮罩，但仍可滚动页面。
          </div>
          <UButton color="primary" variant="outline" size="sm" @click="triggerFullscreenNoLock">
            触发全屏（2s）
          </UButton>
          <Spin
            :loading="fullscreenNoLockLoading"
            :fullscreen="true"
            :lock-scroll="false"
            text="全屏加载中"
            description="页面滚动未被锁定"
            :z-index="50"
          />
        </div>
      </UCard>
    </section>

    <!-- 撑高页面以便验证滚动锁 -->
    <UCard class="mx-auto max-w-240">
      <p class="mb-3 text-center text-sm text-(--text-color-secondary)">
        ↓ 下方为占位内容，用于验证 fullscreen 模式下的滚动锁效果 ↓
      </p>
      <div
        v-for="n in 10"
        :key="n"
        class="border-b border-dashed border-(--text-color-5) py-2 text-center text-sm text-(--text-color-secondary) last:border-b-0"
      >
        占位行 {{ n }}
      </div>
    </UCard>
  </main>
</template>
