<template>
  <div class="item-quantity">
    <div class="title-box">
      项目数量占比
    </div>
    <div class="item-quantity-chart" ref="itemQuantityChartRef"> 

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts';

const itemQuantityChartRef = ref()
let chartInstance:any = null;

// 占比数据
const data = [
  { name: '电', value: 45 },
  { name: '水', value: 25 },
  { name: '热', value: 20 },
  { name: '其他', value: 10 }
];

// 颜色配置
const colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666'];

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
  if (!itemQuantityChartRef.value) return;
  chartInstance = echarts.init(itemQuantityChartRef.value);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal', // 横向排列
      top: 10,            // 距离顶部位置
      left: 'center',      // 水平居中
      itemWidth: 20,      // 图例标记宽度
      itemHeight: 12,     // 图例标记高度
      textStyle: {
        padding: [0, 5, 0, 0] // 调整文字与图例间距
      },
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '能源占比',
        type: 'pie',
        radius: ['40%', '65%'], // 调整半径适应新布局
        center: ['50%', '55%'], // 调整圆心位置
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%', // 显示名称和百分比
          fontSize: 14
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: data.map((item, index) => ({
          ...item,
          itemStyle: { color: colors[index] } // 为每项分配颜色
        }))
      }
    ]
  };

  chartInstance.setOption(option);
  window.addEventListener('resize', chartInstance.resize);
};
</script>

<style lang="less" scoped>
 .item-quantity{
  height: 100%;
  width: 100%;
  padding: 15px;
  .title-box{
    height: 30px;
    font-size: 20px;
    font-weight: 600;
    color: #000;
  }
  .item-quantity-chart{
    height: calc(100% - 30px);
    width: 100%;
  }
 }
</style>