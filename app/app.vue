<script setup lang="ts">
import type { ToasterProps } from "@nuxt/ui";
import { useConfigStore, useUserStore, useNoticeStore } from "@/stores";

const configStore = useConfigStore();
const userStore = useUserStore();
const noticeStore = useNoticeStore();

const route = useRoute();

await configStore.fetch();
await userStore.fetchUserInfo();

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
</script>
<template>
  <UApp :toaster="toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
