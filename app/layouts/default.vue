<script setup lang="ts">
import Lenis from "lenis";
import { onMounted, watch } from "vue";
import { useAppStore } from "@/stores";
import Header from "@/components/header";
import { useParticleAnimation } from "@/composables/useParticleAnimation";

const appStore = useAppStore();

const particleCanvasRef = useTemplateRef("particleCanvasRef");
const layoutRef = useTemplateRef("layoutRef");
onMounted(() => {
  const lenis = new Lenis({
    smoothWheel: true,
    allowNestedScroll: true,
    autoRaf: true
  });

  watch(
    () => appStore.lockScroll,
    (newVal) => {
      if (newVal) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
  );

  if (particleCanvasRef.value) {
    useParticleAnimation(particleCanvasRef.value);
  }
});
</script>
<template>
  <div ref="layoutRef" class="default-layout">
    <Header />
    <canvas
      ref="particleCanvasRef"
      class="fixed top-0 left-0 -z-0 select-none pointer-events-none"
    ></canvas>
    <slot></slot>
  </div>
</template>
<style scoped lang="scss">
.default-layout {
  --content-padding-left: 16px;
  --content-padding-right: 16px;

  color: var(--text-color);

  :deep(.container) {
    padding-top: 24px;
    padding-left: var(--content-padding-left);
    padding-right: var(--content-padding-right);
    display: flex;
    justify-content: center;
    gap: var(--box-gap);
    transition: all 0.35s;

    .content {
      flex: 1;
      min-width: 0;
      flex-grow: 1;
    }

    .aside {
      width: 260px;
      flex-shrink: 0;
    }
  }
}

@media screen and (max-width: 1024px) {
  .default-layout {
    :deep(.container) {
      .content {
        max-width: calc(100vw - var(--content-padding-left) - var(--content-padding-right));
      }
      .aside {
        display: none;
      }
    }
  }
}
</style>
