<script setup lang="ts">
import type { ImageDashboard } from "@/apis/dashboard/models";
import { getImageDashboard } from "@/apis/dashboard";
import * as echarts from "echarts";
import numeral from "numeral";
import { useResizeObserver } from "@vueuse/core";
import { useNotification } from "@/composables/useNotification";

const $notify = useNotification();
const { t } = useI18n();

const chartRef = ref<HTMLDivElement | null>(null);

let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    chartInstance.setOption({
      backgroundColor: "transparent",
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      xAxis: {
        type: "category",
        data: data.value.x,
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: "value",
        show: false
      },
      series: [
        {
          name: t("components.dashboard.image.countLabel"),
          data: data.value.series[0],
          type: "bar",
          itemStyle: {
            normal: {
              color: "#22a0ff"
            }
          }
        },
        {
          name: t("components.dashboard.image.sizeLabel"),
          data: data.value.series[1],
          type: "bar",
          itemStyle: {
            normal: {
              color: "#fac858"
            }
          }
        }
      ]
    });

    useResizeObserver(chartRef.value, () => {
      if (chartInstance) chartInstance.resize();
    });
  }
};

const state = reactive({
  loading: false
});

const data = ref<ImageDashboard>({
  total: 0,
  x: [],
  series: [],
  storage_size: 0,
  today_upload: 0
});
const loadData = async () => {
  if (state.loading) return;
  try {
    state.loading = true;
    data.value = await getImageDashboard();
  } catch (error) {
    $notify.error({
      title: t("components.dashboard.image.loadError"),
      error
    });
  } finally {
    state.loading = false;
  }
};

const reload = async () => {
  try {
    await loadData();
    if (chartInstance) {
      chartInstance.setOption({
        xAxis: { data: data.value.x },
        series: [
          {
            data: data.value.series[0]
          },
          {
            data: data.value.series[1]
          }
        ]
      });
    } else {
      initChart();
    }
  } catch (error) {
    $notify.error({
      title: t("components.dashboard.common.refreshError"),
      error
    });
  }
};

onMounted(async () => {
  try {
    await loadData();
    initChart();
  } catch (error) {
    $notify.error({
      title: t("components.dashboard.image.initError"),
      error
    });
  }
});
</script>
<template>
  <div
    v-loading="state.loading"
    class="flex h-60 flex-col justify-between gap-2 bg-black/40 shadow-md rounded-md px-4 py-3"
  >
    <div class="flex h-6 items-center justify-between leading-6">
      <span>{{ $t("components.dashboard.image.title") }}</span>
      <UIcon class="cursor-pointer" name="custom:redo" @click="reload" />
    </div>
    <div class="h-10 text-3xl">
      {{ numeral(data.total).format("0,0") }}
      <span class="text-base"> ({{ numeral(data.storage_size).format("0.00 ib") }}) </span>
    </div>
    <div ref="chartRef" class="flex-1"></div>
    <div class="text-sm">
      {{
        data.today_upload
          ? $t("components.dashboard.image.todayUpload", { count: data.today_upload })
          : $t("components.dashboard.image.todayEmpty")
      }}
    </div>
  </div>
</template>
