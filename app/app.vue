<script setup lang="ts">
import type { ToasterProps } from "@nuxt/ui";
import { useConfigStore, useUserStore, useNoticeStore } from "@/stores";

const configStore = useConfigStore();
const userStore = useUserStore();
const noticeStore = useNoticeStore();
const { $pwa } = useNuxtApp();
const toast = useToast();

const route = useRoute();

await configStore.fetch();
await userStore.fetchProfile();

const meta = [{ name: "description", content: configStore.basic.description }];
if (configStore.basic.keywords) {
  meta.push({
    name: "keywords",
    content: configStore.basic.keywords.join(",")
  });
}
useHead({
  title: configStore.basic.title,
  meta
});

const toaster = computed<ToasterProps>(() => {
  const isAdminRoute = route.path.includes("/admin");

  return {
    position: (isAdminRoute
      ? "bottom-right"
      : noticeStore.toast.content
        ? noticeStore.toast.position
        : undefined) as ToasterProps["position"]
  };
});

/**
 * PWA 更新提示
 * dev 下 devOptions.enabled=false,$pwa 为 undefined,可选链做空值保护
 * needRefresh:新 SW 已就绪等待激活,用户确认后调用 updateServiceWorker 触发激活并刷新页面
 */
watch(
  () => $pwa?.needRefresh,
  (newVal) => {
    if (!newVal) return;
    toast.add({
      title: "发现新版本",
      description: "检测到站点有更新,刷新后即可使用最新版本。",
      color: "primary",
      icon: "lucide:refresh-cw",
      // 常驻不自动关闭,避免用户错过更新入口
      duration: 0,
      actions: [
        {
          label: "刷新",
          color: "primary",
          variant: "solid",
          onClick: () => $pwa?.updateServiceWorker(true)
        }
      ]
    });
  }
);
</script>
<template>
  <UApp :toaster="toaster">
    <NuxtPwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
