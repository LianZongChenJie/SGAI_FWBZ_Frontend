<template>
  <div class="cooling-efficiency-chart" ref="coolingEfficiencyChartRef">

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const coolingEfficiencyChartRef = ref(null);
let chartInstance:any = null;

// 模拟数据 - 每个主机的冷机效率分布数据
const efficiencyData = {
  'CH-1': [65, 68, 70, 72, 75, 78, 80, 82, 85],
  'CH-2': [60, 65, 68, 70, 72, 75, 78, 80, 82],
  'CH-3': [70, 72, 75, 78, 80, 82, 85, 88, 90],
  'CH-4': [68, 70, 72, 75, 78, 80, 82, 85, 88],
  'CH-5': [62, 65, 68, 70, 72, 75, 78, 80, 82],
  'CH-6': [72, 75, 78, 80, 82, 85, 88, 90, 92],
  'CH-7': [65, 68, 70, 72, 75, 78, 80, 82, 85],
  'CH-8': [75, 78, 80, 82, 85, 88, 90, 92, 95]
};

// 计算盒须图所需的数据统计量
function calculateBoxPlotData(data) {
  return Object.entries(data).map(([name, values]) => {
    values.sort((a, b) => a - b);
    
    const q1 = calculatePercentile(values, 25);
    const median = calculatePercentile(values, 50);
    const q3 = calculatePercentile(values, 75);
    
    const iqr = q3 - q1;
    const lowerWhisker = Math.max(values[0], q1 - 1.5 * iqr);
    const upperWhisker = Math.min(values[values.length - 1], q3 + 1.5 * iqr);
    
    return {
      name,
      value: [
        lowerWhisker,
        q1,
        median,
        q3,
        upperWhisker
      ],
      // 异常值数据
      outliers: values.filter(v => v < lowerWhisker || v > upperWhisker)
    };
  });
}

// 计算百分位数
function calculatePercentile(sortedValues, percentile) {
  const index = (percentile / 100) * (sortedValues.length - 1);
  if (Math.floor(index) === index) {
    return sortedValues[index];
  }
  const lower = Math.floor(index);
  const upper = lower + 1;
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (index - lower);
}

// 初始化图表
const initChart = () => {
  if (!coolingEfficiencyChartRef.value) return;
  
  chartInstance = echarts.init(coolingEfficiencyChartRef.value);
  
  const boxPlotData = calculateBoxPlotData(efficiencyData);
  
  const option = {
    title: {
      text: '冷机效率分布',
      left: 'center',
      top: '5%',
    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const data = params.value;
        return `
          <strong>${params.name}</strong><br/>
          最小值: ${data[0]}%<br/>
          下四分位数(Q1): ${data[1]}%<br/>
          中位数: ${data[2]}%<br/>
          上四分位数(Q3): ${data[3]}%<br/>
          最大值: ${data[4]}%
        `;
      }
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: boxPlotData.map(item => item.name),
      axisLabel: {
        interval: 0,
        rotate: 0
      },
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: 'COP',
      min: 50,
      max: 100,
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '箱线图',
        type: 'boxplot',
        data: boxPlotData.map(item => item.value),
        itemStyle: {
          color: '#1890ff',
          borderColor: '#096dd9'
        },
        emphasis: {
          itemStyle: {
            color: '#40a9ff',
            borderColor: '#1890ff'
          }
        }
      },
      {
        name: '异常值',
        type: 'scatter',
        data: boxPlotData.flatMap(item => 
          item.outliers.map(value => [item.name, value])
        ),
        symbolSize: 8,
        itemStyle: {
          color: '#f5222d'
        }
      }
    ]
  };
  
  chartInstance.setOption(option);
  
  // 响应式调整
  window.addEventListener('resize', function() {
    chartInstance && chartInstance.resize();
  });
};

onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', function() {
    chartInstance && chartInstance.resize();
  });
});
</script>

<style lang="less" scoped>
.cooling-efficiency-chart{
  height: 100%;
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
}
</style>