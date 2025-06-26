<template>
  <div class="lighting-socket" ref="lightingSocket">
    
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, onMounted } from 'vue';
import { getLineChartDataApi } from '../Standardized.api';
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
  async (newProfile) => {
    await getLightingSocketData()
    initChart()
  },
  { deep: true }
);



// 定义容器ref
const lightingSocket = ref()

let chartInstance:any = null;

// 示例数据
const actualData = ref([120, 132, 145, 160, 172, 190, 210, 232, 245, 260, 245, 230]);
const benchmarkData = ref([110, 125, 135, 145, 155, 170, 185, 200, 210, 220, 215, 200]);
const months = ref(['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'])

// 找出最大值和索引
const maxValue1 = ref(0);
const maxValue2 = ref(0)

  const getLightingSocketData = async () => {
    let params = {
      pointId: props.point ? props.point : 5,
    dateType: props.formData.dateType ? props.formData.dateType : 'day',
    baseStartDate: props.formData.referenceTime ? props.formData.referenceTime[0] : '2025-04-01',
    baseEndDate: props.formData.referenceTime ? props.formData.referenceTime[1] : '2025-05-01',
    startDate: props.formData.analysisTime ? props.formData.analysisTime[0] : '2025-04-01',
    endDate: props.formData.analysisTime ? props.formData.analysisTime[1] : '2025-05-01',
    increase: props.formData.increase ? props.formData.increase : '0.1',
    increaseContent:props.formData.increaseContent ? props.formData.increase : '{0}较基准超过10%',
  }
  let res = await getLineChartDataApi(params)
  months.value = res.xaxis
  actualData.value = res.chatSeriesList.find(item => item.name === '实际').data
  benchmarkData.value = res.chatSeriesList.find(item => item.name === '基准').data
  maxValue1.value = Math.max(...actualData.value)
  maxValue2.value = Math.max(...benchmarkData.value);
  }

const initChart = () => {
  if (!chartInstance) {
    chartInstance = echarts.init(lightingSocket.value);
  }

  // 找到实际数据的最大值
  // const maxActualValue = Math.max(...actualData.value);
  // const maxIndex = actualData.value.indexOf(maxActualValue);

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
      formatter: params => {
        const actual = params[0];
        const benchmark = params[1];
        const diff = actual.value - benchmark.value;
        const diffPercent = (diff / benchmark.value * 100).toFixed(2);
        
        return `
          <div style="font-weight:bold">${actual.name}</div>
          <div>${actual.seriesName}: <span style="color:${actual.color}">${actual.value} kWh</span></div>
          <div>${benchmark.seriesName}: <span style="color:${benchmark.color}">${benchmark.value} kWh</span></div>
          <div>同比差异: ${diff > 0 ? '+' : ''}${diff} kWh (${diffPercent}%)</div>
        `;
      }
    },
    legend: {
      data: ['当月实际', '基准数据'],
      bottom: 10
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months.value,
      axisLabel: {
        interval: 6,
        // interval: Math.ceil(dates.length / 10),
      }
    },
    yAxis: {
      type: 'value',
      name: '用电量 (kWh)',
      axisLine: {
        show: true
      },
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '当月实际',
        type: 'line',
        data: actualData.value.map((item, index) => {
          // // 对最大值点进行特殊标记
          // if (index === maxIndex) {
          //   return {
          //     value: item,
          //     symbol: 'circle',
          //     symbolSize: 10,
          //     itemStyle: {
          //       color: '#ff7f50',
          //       borderColor: '#333',
          //       borderWidth: 2,
          //       shadowColor: 'rgba(255, 127, 80, 0.5)',
          //       shadowBlur: 10
          //     },
          //     label: {
          //       show: true,
          //       position: 'top',
          //       formatter: `{c}\n(最高)`,
          //       color: '#ff7f50',
          //       fontWeight: 'bold',
          //       fontSize: 12
          //     }
          //   };
          // }
          return {
            value: item,
            symbolSize: 6,
            itemStyle: {
              color: '#5470C6'
            }
          };
        }),
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.value === maxValue1.value ? '⚡' : '';
          },
        },
        lineStyle: {
          width: 3,
          color: '#5470C6'
          },
      },
      {
        name: '基准数据',
        type: 'line',
        data: benchmarkData.value,
        symbolSize: 6,
        itemStyle: {
          color: '#91CC75'
        },
        lineStyle: {
          width: 3,
          color: '#91CC75'
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return params.value === maxValue2.value ? '⚡' : '';
          },
        },
      }
    ],
    // 添加数据区域颜色
    // visualMap: {
    //   top: 50,
    //   right: 10,
    //   pieces: [
    //     {
    //       gt: 0,
    //       lte: maxActualValue,
    //       seriesIndex: 0,
    //       color: '#ff7f50'
    //     }
    //   ],
    //   outOfRange: {
    //     color: '#5470C6'
    //   }
    // }
  };

  chartInstance.setOption(option);
};

onMounted(async () => {
  await getLightingSocketData()
  initChart();
  window.addEventListener('resize', () => chartInstance?.resize());
});

watch(() => [actualData, benchmarkData], () => {
  initChart();
}, { deep: true });

</script>

<style scoped lang="less">
.lighting-socket {
  height: 100%;
  width: 100%;
}
</style>