<script setup>
// import { useConfigStore, useUserStore } from "@/stores";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

// const configStore = useConfigStore();
// const userStore = useUserStore();

// await callOnce(async () => {
//   await configStore.fetch();
//   await userStore.fetchUserInfo();

//   let meta = [{ name: "description", content: configStore.basic.description }];

//   if (configStore.basic.keywords) {
//     meta.push({
//       name: "keywords",
//       content: configStore.basic.keywords.join(","),
//     });
//   }

//   useHead({
//     title: configStore.basic.title,
//     meta,
//   });
// });
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
