<template>
  <div
    class="power-consumption"
    ref='powerConsumption'
  >

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onBeforeUnmount, onMounted } from 'vue';
import {} from './Standardized.api';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';

// 定义容器ref
const powerConsumption = ref();

let chartInstance: any = null;

// 模拟数据
const getData = () => {
  return {
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    actualData: [320, 302, 341, 374, 390, 430, 420, 380, 390, 400, 420, 480],
    benchmarkData: [300, 320, 330, 340, 450, 360, 370, 380, 390, 400, 410, 420],
    // notes: '备注：点击对应年份的时候，切换到该年每个月视角；点击对应月份时，切换到对应月份下的日视角',
  };
};

const initChart = () => {
  if (!powerConsumption.value) return;

  chartInstance = echarts.init(powerConsumption.value);
  const data = getData();

  // 找出实际数据中的最大值和索引
  const maxValue1 = Math.max(...data.actualData);
  const maxValue2 = Math.max(...data.benchmarkData);

  const option = {
    title: {
      text: '动力用电同比',
      left: 'start',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        const actual = params[0];
        const benchmark = params[1];
        const diff = actual.value - benchmark.value;
        const diffPercent = ((diff / benchmark.value) * 100).toFixed(1);
        const diffText = diff >= 0 ? `+${diff}` : diff;
        const diffPercentText = diff >= 0 ? `+${diffPercent}%` : `${diffPercent}%`;

        return `
              <div style="font-weight:bold">${actual.name}</div>
              <div style="display:flex;justify-content:space-between">
                <span>${actual.seriesName}:</span>
                <span style="font-weight:bold;color:#5470C6">${actual.value}</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span>${benchmark.seriesName}:</span>
                <span style="font-weight:bold;color:#91CC75">${benchmark.value}</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span>同比变化:</span>
                <span style="font-weight:bold;color:${diff >= 0 ? '#EE6666' : '#73C0DE'}">
                  ${diffText} (${diffPercentText})
                </span>
              </div>
            `;
      },
    },
    legend: {
      data: ['当月实际', '基准'],
      bottom: 40,
    },
    grid: {
      left: '6%',
      right: '6%',
      bottom: 80, // 为备注栏留出空间
      top: 80,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.months,
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisLabel: {
        interval: 0,
        rotate: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '用电量 (kWh)',
      nameLocation: 'middle',
      nameGap: 40,
      axisLine: {
        show: true,
        lineStyle: {
          color: '#999',
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
        name: '当月实际',
        type: 'bar',
        barWidth: '35%',
        data: data.actualData,
        itemStyle: {
          color: '#43c3ab',
        },
        // markPoint: {
        //   data: [{ type: 'max', name: 'Max' }],
        // },
        // 添加标签显示
        // label: {
        //   show: true,
        //   position: 'top',
        //   formatter: (params) => {
        //     return params.value === maxValue1 ? '⚡' : '';
        //   },
        // },
      },
      {
        name: '基准',
        type: 'bar',
        barWidth: '35%',
        data: data.benchmarkData,
        itemStyle: {
          color: '#64a0eb',
        },
        // markPoint: {
        //   data: [{ type: 'max', name: 'Max' }],
        // },
        // 添加标签显示
        // label: {
        //   show: true,
        //   position: 'top',
        //   formatter: (params) => {
        //     return params.value === maxValue2 ? '⚡' : '';
        //   },
        // },
      },
    ],
  };

  chartInstance.setOption(option);
};
// 窗口大小变化时重绘图表
const handleResize = () => {
  chartInstance && chartInstance.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped lang="less">
.power-consumption {
  height: 100%;
  width: 100%;
}
</style>