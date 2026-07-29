<template>
  <div class="scatter-plot" :id="props.refName">

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  refName: {
    type: String,
    default: 'easternCoolingTowerRef'
  },
  title: {
    type: String,
    default: ''
  }
})

let chartInstance:any = null;

// 模拟数据 - 实际应用中应从API获取
const generateData = () => {
  const data = [];
  for (let i = 0; i < 50; i++) {
    // 湿球温度范围：15-35°C
    const wetBulbTemp = (Math.random() * 20 + 15).toFixed(1);
    // 冷却水温度范围：湿球温度+3到湿球温度+10
    const coolingWaterTemp = (parseFloat(wetBulbTemp) + Math.random() * 7 + 3).toFixed(1);
    data.push([wetBulbTemp, coolingWaterTemp]);
  }
  return data;
};

const initChart = () => {
  const chartDom = document.getElementById(props.refName);
  if (!chartDom) return;

  chartInstance = echarts.init(chartDom);

  const option = {
    title: {
      text: props.title,
      left: 'center',
      top: '5%',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      formatter: (params) => {
        return `湿球温度: ${params[0].value[0]}°C<br/>供水温度: ${params[0].value[1]}°C`;
      },
    },
    xAxis: {
      name: '室外湿球温度 (°C)',
      nameLocation: 'middle',
      nameGap: 30,
      type: 'value',
      min: 15,
      max: 35,
      axisLine: {
        lineStyle: {
          color: '#333',
        },
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    yAxis: {
      name: '冷却水总管供水温度 (°C)',
      nameLocation: 'middle',
      nameGap: 30,
      type: 'value',
      min: 18,
      max: 45,
      axisLine: {
        lineStyle: {
          color: '#333',
        },
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: '冷却塔性能',
        type: 'scatter',
        symbolSize: 10,
        data: generateData(),
        itemStyle: {
          color: '#5470C6',
        },
        markLine: {
          silent: true,
          lineStyle: {
            color: '#FF0000',
            width: 1,
            type: 'solid',
          },
          data: [
            {
              type: 'average',
              name: '平均线',
            },
          ],
        },
      },
    ],
  };

  chartInstance.setOption(option);
};

const handleResize = () => {
  chartInstance && chartInstance.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance && chartInstance.dispose();
});
</script>

<style lang="less" scoped>
.scatter-plot{
  height: 100%;
  width: 100%;
}
</style>