<script setup lang="ts">
import { useConfigStore, useUserStore } from "@/stores";

const configStore = useConfigStore();
const userStore = useUserStore();

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
</script>
<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
