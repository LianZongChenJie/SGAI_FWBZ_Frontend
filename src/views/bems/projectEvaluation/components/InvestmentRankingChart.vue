<template>
  <div class="investment-ranking">
    <div class="title-box">
      项目投资前五排名
    </div>
    <div class="investment-ranking-chart" ref="investmentRankingRef"> 

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts';
import { getInvestmentRankingApi, } from '../Standardized.api'

const investmentRankingRef = ref()
let chartInstance:any = null;

const data = ref([
  { name: "灯光改造", value: 100 },
  { name: "空调优化", value: 80 },
  { name: "窗帘控制", value: 90 },
  { name: "新风优化", value: 40 },
  { name: "机组调节", value: 50 },
]);

onMounted(async () => {
  await getInvestmentRanking()
  initChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    window.removeEventListener("resize", chartInstance.resize);
  }
});

// 获取排名数据
const getInvestmentRanking = async () => {
  let res = await getInvestmentRankingApi()
  data.value = res.map(item => {
    return {
      name: item.projectName,
      value: item.projectBudget
    }
  })
}

const initChart = () => {
  if (!investmentRankingRef.value) return;
  chartInstance = echarts.init(investmentRankingRef.value);

  const option = {
    // title: {
    //   text: "节能改造数据漏斗图",
    //   left: "center",
    // },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b} : {c}",
    },
    legend: {
      data: data.value.map((item) => item.name),
      left: "left", // 图例放在左侧
      top: 'center',
      orient: "vertical", // 垂直排列
    },
    series: [
      {
        name: "节能改造",
        type: "funnel",
        left: "20%", // 调整图表位置，避免和图例重叠
        top: 20,
        bottom: 20,
        width: "70%",
        min: 0,
        max: 100,
        minSize: "0%",
        maxSize: "100%",
        sort: "descending", // 数据从大到小排序
        gap: 2,
        label: {
          show: true,
          position: "inside", // 数据标签显示在内部
          formatter: "{b}: {c}", // 显示名称、数值
        },
        labelLine: {
          show: true, // 显示连接线
          length: 10,
          lineStyle: {
            width: 1,
            type: "solid",
          },
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 18,
          },
        },
        data: data.value,
      },
    ],
  };

  chartInstance.setOption(option);
  window.addEventListener("resize", chartInstance.resize);
};
</script>

<style lang="less" scoped>
 .investment-ranking{
  height: 100%;
  width: 100%;
  padding: 15px;
  .title-box{
    height: 30px;
    font-size: 20px;
    font-weight: 600;
    color: #000;
  }
  .investment-ranking-chart{
    height: calc(100% - 30px);
    width: 100%;
  }
 }
</style>