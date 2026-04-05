<script setup lang="ts">
import Lenis from "lenis";
import { onMounted, watch } from "vue";
import { useAppStore, useConfigStore } from "@/stores";
import Header from "@/components/header";
import { WebsiteNotice } from "@/components/notice";
import { useParticleAnimation } from "@/composables/useParticleAnimation";
import { useLive2d } from "@/composables/useLive2d";

const appStore = useAppStore();
const configStore = useConfigStore();

const particleCanvasRef = useTemplateRef("particleCanvasRef");
const layoutRef = useTemplateRef("layoutRef");

/**
 * 初始化 Live2D composable
 */
const { init: initLive2d } = useLive2d();

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

  if (configStore.live2d.enabled && configStore.live2d.models?.length) {
    /**
     * 初始化 Live2D，只有主动调用才会加载
     */

    // [
    //   {
    //     path: "https://live2d-1259037473.cos.ap-chengdu.myqcloud.com/models/Pio/model.json",
    //     scale: 0.4,
    //     position: [0, 50],
    //     stageStyle: {
    //       height: 300
    //     }
    //   }
    // ]
    initLive2d({
      models: configStore.live2d.models,
      hideRoutes: ["^/about$"],
      scrollShow: [
        {
          threshold: window.innerHeight / 2,
          routes: ["^/$"]
        }
      ]
    });
  }
});
</script>
<template>
  <div ref="layoutRef" class="default-layout">
    <Header />
    <canvas
      ref="particleCanvasRef"
      class="fixed top-0 left-0 z-0 select-none pointer-events-none"
    ></canvas>
    <slot></slot>

    <WebsiteNotice />
  </div>
</template>
<style scoped lang="scss">
.default-layout {
  // --content-padding-left: 16px;
  // --content-padding-right: 16px;

  color: var(--text-color);

  :deep(main .container.mx-auto) {
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
    :deep(main .container.mx-auto) {
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
