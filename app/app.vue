<script setup lang="ts">
import { useConfigStore, useUserStore } from "@/stores";

// @ts-expect-error 忽略后续导入文件可能存在的类型错误
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

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
  <div>
    <NuxtLayout>
      <el-config-provider :locale="zhCn">
        <NuxtPage />
      </el-config-provider>
    </NuxtLayout>
  </div>
</template>
