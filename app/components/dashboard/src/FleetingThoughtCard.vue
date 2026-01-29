<script setup lang="ts">
import type { DashboardData } from "@/apis/dashboard/models";
import { getFleetingThoughtDashboard } from "@/apis/dashboard";
import { useResizeObserver } from "@vueuse/core";
import { graphic } from "echarts";
import * as echarts from "echarts";
import numeral from "numeral";
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
        top: 3,
        bottom: 3
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross"
        }
      },
      xAxis: {
        type: "category",
        show: false,
        data: data.value.x,
        boundaryGap: false
      },
      yAxis: {
        type: "value",
        show: false,
        boundaryGap: false
      },
      series: [
        {
          data: data.value.y,
          type: "line",
          symbol: "none",
          smooth: true,
          lineStyle: {
            width: 3,
            showSymbol: false,
            color: new graphic.LinearGradient(0, 0, 1, 0, [
              {
                offset: 0,
                color: "rgba(30, 231, 255, 1)"
              },
              {
                offset: 0.5,
                color: "rgba(36, 154, 255, 1)"
              },
              {
                offset: 1,
                color: "rgba(111, 66, 251, 1)"
              }
            ])
          },
          areaStyle: {
            opacity: 0.8,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(17, 126, 255, 0.16)"
              },
              {
                offset: 1,
                color: "rgba(17, 128, 255, 0)"
              }
            ])
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

const data = ref<DashboardData>({
  total: 0,
  x: [],
  y: [],
  today: 0
});
const loadData = async () => {
  if (state.loading) return;
  try {
    state.loading = true;
    data.value = await getFleetingThoughtDashboard();
  } catch (error) {
    $notify.error({
      title: "加载闪念笔记数据失败",
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
            data: data.value.y
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
      title: "初始化闪念笔记卡片失败",
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
      <span>闪念笔记统计</span>
      <UIcon class="cursor-pointer" name="custom:redo" @click="reload" />
    </div>
    <div class="h-10 text-3xl">{{ numeral(data.total).format("0,0") }}</div>
    <div ref="chartRef" class="flex-1"></div>
    <div class="text-sm">{{ `今日新增闪念笔记${data.today}篇` }}</div>
  </div>
</template>
