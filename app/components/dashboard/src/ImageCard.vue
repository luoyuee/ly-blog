<script setup lang="ts">
import type { ImageDashboard } from "@/apis/dashboard/models";
import { getImageDashboard } from "@/apis/dashboard";
import * as echarts from "echarts";
import numeral from "numeral";
import { useResizeObserver } from "@vueuse/core";
import { useNotification } from "@/composables/useNotification";

const $notify = useNotification();

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
          name: "图片数量",
          data: data.value.series[0],
          type: "bar",
          itemStyle: {
            normal: {
              color: "#22a0ff"
            }
          }
        },
        {
          name: "存储大小",
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
      title: "加载图库数据失败",
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
      title: "刷新失败",
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
      title: "初始化图库卡片失败",
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
      <span>图库统计</span>
      <UIcon class="cursor-pointer" name="custom:redo" @click="reload" />
    </div>
    <div class="h-10 text-3xl">
      {{ numeral(data.total).format("0,0") }}
      <span class="text-base"> ({{ numeral(data.storage_size).format("0.00 ib") }}) </span>
    </div>
    <div ref="chartRef" class="flex-1"></div>
    <div class="text-sm">
      {{ data.today_upload ? `今日上传${data.today_upload}张图片` : "今日无新增图片" }}
    </div>
  </div>
</template>
