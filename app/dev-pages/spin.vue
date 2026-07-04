<script setup lang="ts">
import { Spin } from "@/components/spin";

definePageMeta({
  layout: "blank"
});

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
  <main class="spin-demo">
    <section class="spin-demo__hero">
      <p class="spin-demo__eyebrow">Development Only</p>
      <h1 class="spin-demo__title">Spin 组件测试页</h1>
      <p class="spin-demo__subtitle">
        用于验证 Spin 组件的局部遮罩、全屏遮罩、滚动锁、自定义文案、 自定义 spinner
        插槽以及各类样式覆写入口。
      </p>
    </section>

    <section class="spin-demo__grid">
      <!-- 1. 局部遮罩 + 默认文案 -->
      <div class="spin-demo__card">
        <h2 class="spin-demo__card-title">局部遮罩</h2>
        <p class="spin-demo__card-desc">包裹内容区域，loading=true 时显示遮罩。</p>
        <div class="spin-demo__preview">
          <Spin :loading="localLoading" wrapper-class="h-40">
            <div class="spin-demo__content">
              这里是被遮罩的内容区域，点击下方按钮触发 loading。
            </div>
          </Spin>
        </div>
        <UButton color="primary" variant="outline" size="sm" @click="triggerLocal">
          触发加载（2s）
        </UButton>
      </div>

      <!-- 2. 主副文案 -->
      <div class="spin-demo__card">
        <h2 class="spin-demo__card-title">主副文案</h2>
        <p class="spin-demo__card-desc">通过 text / description 自定义文案。</p>
        <div class="spin-demo__preview">
          <Spin
            :loading="longTextLoading"
            text="正在拉取数据"
            description="预计需要 2 秒，请稍候..."
            wrapper-class="h-40"
          >
            <div class="spin-demo__content">自定义文案演示。</div>
          </Spin>
        </div>
        <UButton color="primary" variant="outline" size="sm" @click="triggerLongText">
          触发加载（2s）
        </UButton>
      </div>

      <!-- 3. 自定义 spinner 插槽 -->
      <div class="spin-demo__card">
        <h2 class="spin-demo__card-title">自定义 spinner</h2>
        <p class="spin-demo__card-desc">通过 spinner 插槽替换默认图标。</p>
        <div class="spin-demo__preview">
          <Spin :loading="customSpinnerLoading" text="处理中" wrapper-class="h-40">
            <div class="spin-demo__content">自定义 spinner 插槽演示。</div>
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

      <!-- 4. 自定义样式覆写 -->
      <div class="spin-demo__card">
        <h2 class="spin-demo__card-title">样式覆写</h2>
        <p class="spin-demo__card-desc">通过 overlayClass / panelClass / spinnerClass 覆写。</p>
        <div class="spin-demo__preview">
          <Spin
            :loading="customStyleLoading"
            text="自定义样式"
            wrapper-class="h-40"
            overlay-class="bg-primary/20"
            panel-class="bg-white rounded-lg shadow-lg"
            spinner-class="size-10 text-error"
          >
            <div class="spin-demo__content">样式覆写演示。</div>
          </Spin>
        </div>
        <UButton color="primary" variant="outline" size="sm" @click="triggerCustomStyle">
          触发加载（2s）
        </UButton>
      </div>

      <!-- 5. 无插槽独立占位 -->
      <div class="spin-demo__card">
        <h2 class="spin-demo__card-title">独立占位</h2>
        <p class="spin-demo__card-desc">无默认插槽时，非 fullscreen 作为独立加载占位。</p>
        <div class="spin-demo__preview">
          <Spin :loading="true" text="永久加载态" />
        </div>
      </div>

      <!-- 6. 全屏遮罩 + 锁滚动 -->
      <div class="spin-demo__card">
        <h2 class="spin-demo__card-title">全屏遮罩（锁滚动）</h2>
        <p class="spin-demo__card-desc"
          >fullscreen=true，lockScroll=true，遮罩 Teleport 到 body。</p
        >
        <div class="spin-demo__preview spin-demo__preview--hint">
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

      <!-- 7. 全屏遮罩 + 不锁滚动 -->
      <div class="spin-demo__card">
        <h2 class="spin-demo__card-title">全屏遮罩（不锁滚动）</h2>
        <p class="spin-demo__card-desc">fullscreen=true，lockScroll=false，可滚动查看底层内容。</p>
        <div class="spin-demo__preview spin-demo__preview--hint">
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
    </section>

    <!-- 撑高页面以便验证滚动锁 -->
    <section class="spin-demo__spacer">
      <p>↓ 下方为占位内容，用于验证 fullscreen 模式下的滚动锁效果 ↓</p>
      <div v-for="n in 10" :key="n" class="spin-demo__spacer-item">占位行 {{ n }}</div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.spin-demo {
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
    min-height: 10rem;
    border: 1px dashed var(--text-color-5);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  &__preview--hint {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    color: var(--text-color-secondary);
    font-size: 0.8125rem;
    text-align: center;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 1rem;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    text-align: center;
  }

  &__spacer {
    max-width: 960px;
    margin: 2rem auto 0;
    padding: 1.25rem;
    border: 1px solid var(--text-color-5);
    border-radius: var(--radius-wrap);
    background: var(--background-color-box);
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    text-align: center;

    p {
      margin-bottom: 0.75rem;
    }
  }

  &__spacer-item {
    padding: 0.5rem 0;
    border-bottom: 1px dashed var(--text-color-5);

    &:last-child {
      border-bottom: none;
    }
  }
}

@media (max-width: 768px) {
  .spin-demo {
    padding: 1rem;

    &__grid {
      grid-template-columns: 1fr;
    }

    &__card,
    &__spacer {
      padding: 1rem;
    }
  }
}
</style>
