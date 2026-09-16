<script setup lang="ts">
import type { VisitsStats } from "@/apis/stats/models";
import { useConfigStore } from "@/stores";
import numeral from "numeral";
import dayjs from "dayjs";

const { t } = useI18n();
const configStore = useConfigStore();

const { data: visitsStats } = await useFetch<VisitsStats>("/api/stats/visits", {
  method: "get"
});

const copyright = computed(() => {
  return `Copyright © ${
    configStore.created_at ? dayjs(configStore.created_at).format("YYYY") : dayjs().format("YYYY")
  } ~ ${dayjs().year()} ${t("components.pageFooter.copyright")} `;
});
</script>
<template>
  <footer class="page-footer space-y-1">
    <div>
      {{ copyright }}
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
      {{ $t("components.pageFooter.poweredByPrefix") }}
      <a
        class="hover:text-primary-400 flex items-center no-underline px-1"
        href="https://nuxt.com"
        target="_blank"
      >
        <UIcon name="colorful:nuxt" :size="20" />
        Nuxt
      </a>
      {{ $t("components.pageFooter.poweredBySuffix") }}
    </div>
    <div class="flex items-center" :title="$t('components.pageFooter.updateTitle')">
      {{
        $t("components.pageFooter.visits", { count: numeral(visitsStats?.page || 0).format("0,0") })
      }}
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
