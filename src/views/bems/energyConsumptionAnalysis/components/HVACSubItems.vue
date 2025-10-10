<template>
  <div
    class="HVAC-sub-items"
    ref="HVACSubItems"
  >

  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, onMounted } from 'vue';
import { getStackingChartDataApi } from '../Standardized.api';
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
const HVACSubItems = ref();

let chartInstance: any = null;

// 示例数据 - 假设是7天的数据
const dates = ref(['1日', '2日', '3日', '4日', '5日', '6日', '7日']);
const chillerData = ref([1200, 1300, 1250, 1400, 1350, 1500, 1450]);
const chilledPumpData = ref([350, 380, 370, 400, 390, 420, 410]);
const coolingPumpData = ref([280, 300, 290, 320, 310, 340, 330]);
const coolingTowerData = ref([150, 170, 160, 180, 170, 190, 180]);
const airConditioningData = ref([500, 550, 520, 580, 560, 600, 590]);
const temperatureData = ref([28, 30, 29, 32, 31, 33, 32]);
const legend = ref<string[]>(['']);
const series = ref<any>([]);

const colorOption = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#FF6B6B'];

const getHVACSubItemsData = async () => {
  let params = {
    pointId: props.point ? props.point : 5,
    dateType: props.formData.dateType ? props.formData.dateType : 'day',
    baseStartDate: props.formData.referenceTime ? props.formData.referenceTime[0] : '2025-03-11',
    baseEndDate: props.formData.referenceTime ? props.formData.referenceTime[1] : '2025-03-15',
    startDate: props.formData.analysisTime ? props.formData.analysisTime[0] : '2025-04-11',
    endDate: props.formData.analysisTime ? props.formData.analysisTime[1] : '2025-04-15',
    increase: props.formData.increase ? props.formData.increase : '0.1',
    increaseContent:props.formData.increaseContent ? props.formData.increaseContent : '{0}较基准超过10%',
  };
  let res = await getStackingChartDataApi(params);
  legend.value = res.chatSeriesList.map((item) => item.name);
  res.chatSeriesList.forEach((item, index) => {
    series.value.push({
      name: item.name,
      type: 'bar',
      stack: 'electricity',
      emphasis: {
        focus: 'series',
      },
      data: item.data,
      itemStyle: {
        color: colorOption[index],
      },
    });
  });
};

const initChart = () => {
  if (!chartInstance) {
    chartInstance = echarts.init(HVACSubItems.value);
  }

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
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
      formatter: function (params) {
        let result = `<div style="font-weight:bold;margin-bottom:5px">${params[0].name}</div>`;
        let total = 0;

        // 处理堆叠柱状图数据
        params.forEach((param) => {
          if (param.seriesType === 'bar') {
            result += `<div style="display:flex;align-items:center;margin-bottom:2px">
              <span style="display:inline-block;width:10px;height:10px;background:${param.color};margin-right:5px"></span>
              ${param.seriesName}: <b>${param.value} kWh</b>
            </div>`;
            total += param.value;
          }
        });

        // 添加总计
        result += `<div style="margin:5px 0;font-weight:bold">总用电量: ${total} kWh</div>`;

        // 处理温度数据
        params.forEach((param) => {
          if (param.seriesType === 'line') {
            result += `<div style="display:flex;align-items:center">
              <span style="display:inline-block;width:10px;height:10px;background:${param.color};margin-right:5px;border-radius:50%"></span>
              ${param.seriesName}: <b>${param.value} °C</b>
            </div>`;
          }
        });

        return result;
      },
    },
    legend: {
      data: legend.value,
      bottom: 10,
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '20%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: dates.value,
        axisPointer: {
          type: 'shadow',
        },
        axisLabel: {
          interval: 0,
          rotate: 30,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '电耗 (kWh)',
        min: 0,
        axisLabel: {
          formatter: '{value}',
        },
      },
      {
        type: 'value',
        name: '室外温度 (°C)',
        min: 0,
        axisLabel: {
          formatter: '{value}',
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: series.value,
  };

  chartInstance.setOption(option);
};

onMounted(async () => {
  await getHVACSubItemsData();
  initChart();
  window.addEventListener('resize', () => chartInstance?.resize());
});

watch(
  () => [dates, chillerData, chilledPumpData, coolingPumpData, coolingTowerData, airConditioningData, temperatureData],
  () => {
    initChart();
  },
  { deep: true }
);
</script>

<style scoped lang="less">
.HVAC-sub-items {
  height: 100%;
  width: 100%;
}
</style>