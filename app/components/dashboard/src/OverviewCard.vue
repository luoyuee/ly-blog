<script setup lang="ts">
import type { OverviewDashboard } from "@/apis/dashboard/models";
import { useNotification } from "@/composables/useNotification";
import { getOverViewDashboard } from "@/apis/dashboard";
import { useResizeObserver } from "@vueuse/core";
import * as echarts from "echarts";

const $notify = useNotification();

const chartRef = ref<HTMLDivElement | null>(null);

let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    chartInstance.setOption({
      backgroundColor: "transparent",
      grid: {
        left: 60,
        right: 60
      },
      legend: {
        show: true
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross"
        }
      },
      xAxis: {
        type: "category",
        data: data.value.x,
        boundaryGap: false,
        axisLabel: {
          interval: 23
        }
      },
      yAxis: {
        type: "value",
        boundaryGap: false
      },
      series: [
        {
          name: "API请求",
          data: data.value.series[0],
          type: "line",
          smooth: true
        },
        {
          name: "页面请求",
          data: data.value.series[1],
          type: "line",
          smooth: true
        },
        {
          name: "静态资源请求",
          data: data.value.series[2],
          type: "line",
          smooth: true
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

const data = ref<OverviewDashboard>({
  x: [],
  series: []
});

const loadData = async () => {
  if (state.loading) return;
  try {
    state.loading = true;
    data.value = await getOverViewDashboard();
  } catch (error) {
    $notify.error({
      title: "加载统计数据失败",
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
          },
          {
            data: data.value.series[2]
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
      title: "初始化阅读卡片失败",
      error
    });
  }
});
</script>
<template>
  <div
    v-loading="state.loading"
    class="flex h-125 flex-col justify-between gap-2 bg-black/40 shadow-md rounded-md px-4 py-3"
  >
    <div class="flex h-6 items-center justify-between leading-6">
      <span>总览</span>
      <UIcon class="cursor-pointer" name="custom:redo" @click="reload" />
    </div>
    <div ref="chartRef" class="flex-1"></div>
  </div>
</template>
