<template>
  <div class="type-of-income">
    <div class="title-box">
      收益类型占比
    </div>
    <div class="type-of-income-chart" ref="typeOfIncomeChart"> 

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts';

const typeOfIncomeChart = ref()
let chartInstance:any = null;

// 收益类型占比数据
const costData = [
  { name: '人工成本', value: 45 },
  { name: '能耗成本', value: 30 },
  { name: '其他', value: 25 }
];

// 颜色配置（蓝、橙、灰）
const colors = ['#5470C6', '#FF9D45', '#91CC75'];

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
  if (!typeOfIncomeChart.value) return;
  chartInstance = echarts.init(typeOfIncomeChart.value);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}万元 ({d}%)'
    },
    legend: {
      orient: 'horizontal', // 横向图例
      bottom: 10,
      data: costData.map(item => item.name)
    },
    series: [
      {
        name: '收益占比',
        type: 'pie',
        radius: '65%',
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b|{b}}\n{d|{d}%}', // 分行显示名称和百分比
          rich: {
            b: {
              fontSize: 14,
              lineHeight: 26
            },
            d: {
              color: '#333',
              fontSize: 16,
              fontWeight: 'bold',
              padding: [0, 0, 0, 10]
            }
          }
        },
        emphasis: {
          scale: true,
          scaleSize: 5,
          label: {
            show: true,
            fontSize: 18
          }
        },
        labelLine: {
          length: 20,
          length2: 30
        },
        data: costData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index]
          }
        }))
      }
    ]
  };

  chartInstance.setOption(option);
  window.addEventListener("resize", chartInstance.resize);
};
</script>

<style lang="less" scoped>
 .type-of-income{
  height: 100%;
  width: 100%;
  padding: 15px;
  .title-box{
    height: 30px;
    font-size: 20px;
    font-weight: 600;
    color: #000;
  }
  .type-of-income-chart{
    height: calc(100% - 30px);
    width: 100%;
  }
 }
</style>