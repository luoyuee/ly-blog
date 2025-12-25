<script setup lang="ts">
import { useConfigStore } from "@/stores";
import numeral from "numeral";
import dayjs from "dayjs";

const configStore = useConfigStore();
</script>
<template>
  <footer class="page-footer space-y-1">
    <div>
      {{
        `Copyright © ${dayjs(configStore.created_at).format("YYYY")} - ${dayjs().year()} 版权所有 `
      }}
      <a v-if="configStore.author_card.name" class="hover:text-primary-400" href="/me">
        {{ configStore.author_card.name }}
      </a>
    </div>
    <div
      v-if="configStore.beian && (configStore.beian.beian_code || configStore.beian.icp_code)"
      class="flex items-center"
    >
      <a
        v-if="configStore.beian.icp_code"
        class="hover:text-primary-400 no-underline px-1"
        href="https://beian.miit.gov.cn"
        target="_blank"
      >
        {{ configStore.beian.icp_code }}
      </a>
      <span>丨</span>
      <a
        v-if="configStore.beian.beian_code"
        class="hover:text-primary-400 no-underline px-1"
        href="https://beian.mps.gov.cn/#/query/webSearch"
        target="_blank"
      >
        {{ configStore.beian.beian_code }}
      </a>
    </div>
    <div class="flex items-center">
      本站由
      <a
        class="hover:text-primary-400 flex items-center no-underline px-1"
        href="https://nuxt.com"
        target="_blank"
      >
        <UIcon name="custom-color:nuxt" :size="20" />
        Nuxt
      </a>
      强力驱动
    </div>
    <div class="flex items-center">
      {{ `总访问：${numeral(12345).format("0,0")} 次` }}
    </div>
  </footer>
</template>

<style scoped lang="scss">
.page-footer {
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
  color: var(--color-gray-400);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  font-size: 0.75rem;
}
</style>
