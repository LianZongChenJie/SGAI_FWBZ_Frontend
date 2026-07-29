<template>
  <div class="cycle-data">
    <div class="title-box">
      项目施工周期与收益周期
    </div>
    <div class="cycle-data-chart" ref="cycleDataChartRef"> 

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts';

const cycleDataChartRef = ref()
let chartInstance:any = null;

// 数据
const months = ['一月', '二月', '三月', '四月', '五月', '六月'];
const constructionData = [45, 60, 75, 90, 65, 40]; // 施工周期（柱状图）
const revenueData = [20, 40, 60, 80, 75, 90];     // 收益周期（折线图）

onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    window.removeEventListener("resize", chartInstance.resize);
  }
});

const initChart = () => {
  if (!cycleDataChartRef.value) return;
  chartInstance = echarts.init(cycleDataChartRef.value);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    legend: {
      data: ['施工周期', '收益周期'],
      bottom: 10
    },
    grid: {
      top: 40,
      bottom: 60
    },
    xAxis: {
      type: 'category',
      data: months,
      axisPointer: {
        type: 'shadow'
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '施工周期（天）',
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '收益（万元）',
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '施工周期',
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#0078ff' }
          ])
        },
        data: constructionData,
        label: {
          show: true,
          position: 'top'
        }
      },
      {
        name: '收益周期',
        type: 'line',
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#ee6666'
        },
        itemStyle: {
          color: '#ee6666',
          borderWidth: 2
        },
        data: revenueData,
        label: {
          show: true,
          formatter: '{c}万'
        }
      }
    ]
  };

  chartInstance.setOption(option);
  window.addEventListener('resize', chartInstance.resize);
};
</script>

<style lang="less" scoped>
 .cycle-data{
  height: 100%;
  width: 100%;
  padding: 15px;
  .title-box{
    height: 30px;
    font-size: 20px;
    font-weight: 600;
    color: #000;
  }
  .cycle-data-chart{
    height: calc(100% - 30px);
    width: 100%;
  }
 }
</style>