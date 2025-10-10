<template>
  <div
    class="total-power-consumption"
    ref='totalPowerConsumption'
  >

  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, onBeforeUnmount, onMounted } from 'vue';
import { getBarChartDataApi } from '../Standardized.api';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';

const props = defineProps({
  point: {
    type: Number,
    default: 5
  },
  title: {
    type: String,
    default: '电能分布图'
  },
  formData: {
    type: Object,
    default: {}
  }
})

// 深度监听profile对象
watch(
  () => props.formData,
  (newProfile) => {
    initChart()
  },
  { deep: true }
);

// 定义容器ref
const totalPowerConsumption = ref();

let chartInstance: any = null;

// 模拟数据
const getData = async () => {
  let params = {
    pointId: props.point ? props.point : 5,
    dateType: props.formData.dateType ? props.formData.dateType : 'day',
    baseStartDate: props.formData.referenceTime ? props.formData.referenceTime[0] : '2025-03-11',
    baseEndDate: props.formData.referenceTime ? props.formData.referenceTime[1] : '2025-03-15',
    startDate: props.formData.analysisTime ? props.formData.analysisTime[0] : '2025-04-11',
    endDate: props.formData.analysisTime ? props.formData.analysisTime[1] : '2025-04-15',
    increase: props.formData.increase ? props.formData.increase : '0.1',
    increaseContent:props.formData.increaseContent ? props.formData.increaseContent : '{0}较基准超过10%',
  }
  let res = await getBarChartDataApi(params)
  return {
    months: res.xaxis,
    actualData: res.chatSeriesList.find(item => item.name === '实际').data   ,
    benchmarkData: res.chatSeriesList.find(item => item.name === '基准').data,
    // notes: '备注：点击对应年份的时候，切换到该年每个月视角；点击对应月份时，切换到对应月份下的日视角',
  };
};

const initChart = async () => {
  if (!totalPowerConsumption.value) return;

  chartInstance = echarts.init(totalPowerConsumption.value);
  const data = await getData();

  // 找出实际数据中的最大值和索引
  const maxValue1 = Math.max(...data.actualData);
  const maxValue2 = Math.max(...data.benchmarkData);

  const option = {
    title: {
      text: props.title,
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
      data: ['实际', '基准'],
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
        name: '实际',
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
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.value === maxValue1 ? '⚡' : '';
          },
        },
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
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.value === maxValue2 ? '⚡' : '';
          },
        },
      },
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        bottom: 20,
        style: {
          // text: data.notes,
          fill: '#666',
          fontSize: 12,
          fontWeight: 'normal',
        },
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
.total-power-consumption {
  height: 100%;
  width: 100%;
}
</style>