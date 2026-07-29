<template>
  <div class="yield-ranking">
    <div class="title-box">
      收益率前五排名
    </div>
    <div class="yield-ranking-chart" ref="yieldRankingRef"> 

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts';

const yieldRankingRef = ref()
let chartInstance:any = null;

// 收益率前五数据
const data = [
  { name: "机组调节", value: 26 },
  { name: "新风优化", value: 35 },
  { name: "窗帘控制", value: 65 },
  { name: "空调优化", value: 80 },
  { name: "灯光改造", value: 150 },
];

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
  if (!yieldRankingRef.value) return;
  chartInstance = echarts.init(yieldRankingRef.value);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: "{b}<br/>收益率: {c}"
    },
    grid: {
      left: "10%",
      right: "10%",
      bottom: "10%",
      top: "10%",
      containLabel: true
    },
    xAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}"
      },
    },
    yAxis: {
      type: "category",
      data: data.map(item => item.name),
      axisLabel: {
        rich: {
          // 前三名样式
          top3: {
            backgroundColor: '#edae5d', // 红色
            color: '#fff',
            width: 24,
            height: 24,
            align: 'center',
            // borderRadius: 12,
            lineHeight: 24
          },
          // 后两名样式
          others: {
            backgroundColor: '#02a9ec', // 青色
            color: '#fff',
            width: 24,
            height: 24,
            align: 'center',
            // borderRadius: 12,
            lineHeight: 24
          },
          name: {
            // backgroundColor: '#2f4554', // 名称统一背景色
            color: '#000',
            padding: [0, 10],
            height: 24,
            lineHeight: 24,
            borderRadius: [0, 12, 12, 0]
          }
        },
        formatter: (value, index) => {
          // 根据排名使用不同样式
          const rankStyle = index > 1 ? 'top3' : 'others';
          return [
            `{${rankStyle}|${5 - index}}`,
            `{name|${value}}`
          ].join(' ');
        }
      },
      axisLine: { show: false },
      axisTick: { show: false },
      // axisLabel: { show: false },
      splitLine: { show: false }
    },
    series: [
      {
        name: "收益率",
        type: "bar",
        barWidth: 15,
        data: data.map(item => item.value),
        itemStyle: {
          color: '#1ecdd4',
          borderRadius: [20, 20, 20, 20]
        },
        label: {
          show: true,
          position: "right",
          formatter: "{c}"
        }
      }
    ]
  };

  chartInstance.setOption(option);
  window.addEventListener("resize", chartInstance.resize);
};
</script>

<style lang="less" scoped>
 .yield-ranking{
  height: 100%;
  width: 100%;
  padding: 15px;
  .title-box{
    height: 30px;
    font-size: 20px;
    font-weight: 600;
    color: #000;
  }
  .yield-ranking-chart{
    height: calc(100% - 30px);
    width: 100%;
  }
 }
</style>