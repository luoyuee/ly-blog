<script setup lang="ts">
import type { ArticleDashboard } from "@/apis/dashboard/models";
import { useNotification } from "@/composables/useNotification";
import { getArticleDashboard } from "@/apis/dashboard";
import { useResizeObserver } from "@vueuse/core";
import * as echarts from "echarts";
import numeral from "numeral";

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
          data: data.value.y,
          type: "bar",
          itemStyle: {
            normal: {
              color: "#22a0ff"
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

const data = ref<ArticleDashboard>({
  total: 0,
  x: [],
  y: [],
  today_created: 0,
  today_updated: 0
});
const loadData = async () => {
  if (state.loading) return;
  try {
    state.loading = true;
    data.value = await getArticleDashboard();
  } catch (error) {
    $notify.error({
      title: "加载文章数据失败",
      error
    });
  } finally {
    state.loading = false;
  }
};

const tipsText = computed(() => {
  const text = [];

  if (data.value.today_created && data.value.today_created > 0) {
    text.push(`新增${data.value.today_created}篇文章`);
  }

  if (data.value.today_updated && data.value.today_updated > 0) {
    text.push(`更新${data.value.today_updated}篇文章`);
  }

  if (text.length > 0) {
    return "今日" + text.join("，");
  }

  return "暂无更新";
});

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
      title: "初始化文章卡片失败",
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
      <span>文章统计</span>
      <UIcon class="cursor-pointer" name="custom:redo" @click="reload" />
    </div>
    <div class="h-10 text-3xl">
      {{ numeral(data.total).format("0,0") }}
    </div>
    <div ref="chartRef" class="flex-1"></div>
    <div class="text-sm">
      {{ tipsText }}
    </div>
  </div>
</template>
