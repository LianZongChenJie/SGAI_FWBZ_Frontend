<template>
  <div class="energy-safety">
    <div class="trend-box">
      <EnergyConsumptionStatistics />
    </div>
    <div class="energy-box">
      <div class="enery-title">
        能源趋势分析
      </div>
      <div class="data-change-box">
        <div class="type-change">
          <div
            :id="eneryType ? '' : 'isAcitve'"
            @click="switchEneryType(0)"
          >
            电
          </div>
          <div
            :id="eneryType ? 'isAcitve' : ''"
            @click="switchEneryType(1)"
          >
            水
          </div>
        </div>
        <div class="time-change">
          <a-select
            ref="select"
            v-model:value="timeType"
            style="width: 120px"
            @change="handleChange"
          >
            <a-select-option value="1">当日</a-select-option>
            <a-select-option value="2">当月</a-select-option>
            <a-select-option value="3">当年</a-select-option>
          </a-select>
        </div>
      </div>
      <div
        v-if="!eneryType"
        class="use-electricity"
        ref="useElectricityRef"
      >

      </div>
      <div
        v-else
        class="use-water"
        ref="useWaterRef"
      >

      </div>
    </div>
    <div class="energy-saving-statistics">
      <div class="energy-saving-statistics-title">
        <div class="title-text">
          <!-- <div class="icon-box"></div> -->
          节能统计
        </div>
      </div>
      <div class="statistics-box">
        <!-- <div class="tabs-box">
          <a-tabs
            v-model:activeKey="activeKey"
            :tabBarGutter="20"
            @change="handleChangeTabs"
          >
            <a-tab-pane
              :key="1"
              tab="当日"
            >
            </a-tab-pane>
            <a-tab-pane
              :key="2"
              tab="当月"
            >
            </a-tab-pane>
            <a-tab-pane
              :key="3"
              tab="历史总量"
            >
            </a-tab-pane>
          </a-tabs>
        </div> -->
        <!-- <div class="statistics-data-box">
          <MyStatistics />
        </div> -->
        <div class="title-box">
          总节约电量：{{ total.electricityTotal }}kWh
        </div>
        <div class="title-box">
          总节约水量：{{ total.waterTotal }}吨
        </div>
        <div
          class="electricity-chart"
          ref="electricityChartRef"
        >

        </div>
        <div
          class="water-chart"
          ref="waterChartRef"
        >

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import MyStatistics from './MyStatistics.vue';
import EnergyConsumptionStatistics from './EnergyConsumptionStatistics.vue';
import * as echarts from 'echarts';
import {
  getEnergyUseSafetyApi,
  getCarbonFootprintApi,
  getEnergyConsumptionElectricityForDayApi,
  getEnergyConsumptionElectricityForMonthApi,
  getEnergyConsumptionElectricityForYearApi,
  getEnergyConsumptionWaterForDayApi,
  getEnergyConsumptionWaterForMonthApi,
  getEnergyConsumptionWaterForYearApi,
  getEnergyConservationStatisticsApi,
} from '../Standardized.api';

const placeList = ref([
  {
    name: '测试数据1',
    ratedLoad: '123',
    currentLoad: '68',
    loadRate: '50%',
  },
]);

const total = ref({
  electricityTotal: 0,
  waterTotal: 0,
})

// 获取图表DOM引用
const electricityChartRef = ref<HTMLDivElement>();
const waterChartRef = ref<HTMLDivElement>();
let electricityEneryChart: echarts.ECharts | null = null;
let waterEneryChart: echarts.ECharts | null = null;

// 节能数据
const electricityEnergySavingData = ref([
  { value: 1250, name: '管理节能' },
  { value: 980, name: '工业节能' },
  { value: 1560, name: '算法控制' },
  { value: 1120, name: '综合节能' },
]);

// 节能数据
const waterEnergySavingData = ref([
  { value: 1250, name: '管理节能' },
  { value: 980, name: '工业节能' },
  { value: 1560, name: '算法控制' },
  { value: 1120, name: '综合节能' },
]);

const eneryType = ref(0);
const timeType = ref('1');
const useElectricityRef = ref(null);
const useWaterRef = ref(null);
let electricityChart: any = null;
let waterChart: any = null;

// 模拟数据 - 实际应用中替换为API获取的数据
const electricityChartData = ref({
  dates: ['5/1', '5/2', '5/3', '5/4', '5/5', '5/6', '5/7'],
  actualUsage: [320, 340, 365, 380, 400, 390, 410],
  predictedUsage: [330, 350, 370, 390, 410, 400, 420],
  temperatures: [22, 24, 26, 28, 25, 23, 21],
});

// 水数据
const waterData = ref({
  dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  actualUsage: [120, 132, 145, 160, 172, 190, 210],
  predictedUsage: [115, 130, 150, 165, 180, 195, 215],
});

const unit = ref('吨');

const switchEneryType = async (type) => {
  eneryType.value = type;
  if (!type) {
    await getElectricityData();
    nextTick(() => {
      initElectricityChart();
    });
  } else {
    await getWaterData();
    nextTick(() => {
      initWaterChart();
    });
  }
};

const handleChange = async (value) => {
  if (!eneryType.value) {
    await getElectricityData();
  } else {
    await getWaterData();
  }
};

// 获取电能耗数据
const getElectricityData = async () => {
  let res: any;
  if (timeType.value === '1') {
    res = await getEnergyConsumptionElectricityForDayApi();
  } else if (timeType.value === '2') {
    res = await getEnergyConsumptionElectricityForMonthApi();
  } else {
    res = await getEnergyConsumptionElectricityForYearApi();
  }
  electricityChartData.value.dates = res.xaxis ? [...res.xaxis] : [];
  electricityChartData.value.temperatures = res.chatSeriesList ? [...res.chatSeriesList[0].data] : [];
  initElectricityChart();
};

// 获取水能耗数据
const getWaterData = async () => {
  let res: any;
  if (timeType.value === '1') {
    res = await getEnergyConsumptionWaterForDayApi();
  } else if (timeType.value === '2') {
    res = await getEnergyConsumptionWaterForMonthApi();
  } else {
    res = await getEnergyConsumptionWaterForYearApi();
  }
  waterData.value.dates = res.xaxis ? [...res.xaxis] : [];
  waterData.value.actualUsage = res.chatSeriesList ? [...res.chatSeriesList[0].data] : [];
  console.log('getWaterData---------------->', res, waterData.value);

  initWaterChart();
};

const initElectricityChart = () => {
  if (!useElectricityRef.value) return;

  electricityChart = echarts.init(useElectricityRef.value);

  const option = {
    title: {
      text: '近七日用电趋势及预测',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
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
      formatter: (params) => {
        let result = `${params[0].axisValue}<br>`;
        params.forEach((item) => {
          const unit = item.seriesName.includes('温度') ? '°C' : 'kWh';
          result += `${item.marker} ${item.seriesName}: ${item.value}${unit}<br>`;
        });
        return result;
      },
    },
    legend: {
      // data: ['实际用电量', '预测用电量', '温度'],
      data: ['用电量'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '20%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: electricityChartData.value.dates,
        axisPointer: {
          type: 'shadow',
        },
        axisLabel: {
          interval: 0,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '用电量 (kWh)',
        min: 0,
        axisLabel: {
          formatter: '{value}',
        },
      },
      // {
      //   type: 'value',
      //   name: '温度 (°C)',
      //   min: 0,
      //   axisLabel: {
      //     formatter: '{value}',
      //   },
      //   splitLine: {
      //     show: false,
      //   },
      // },
    ],
    series: [
      // {
      //   name: '实际用电量',
      //   type: 'bar',
      //   barWidth: '30%',
      //   data: electricityChartData.value.actualUsage,
      //   itemStyle: {
      //     color: '#5470C6',
      //   },
      //   label: {
      //     show: true,
      //     position: 'top',
      //     formatter: '{c}kWh',
      //   },
      // },
      // {
      //   name: '预测用电量',
      //   type: 'bar',
      //   barWidth: '30%',
      //   data: electricityChartData.value.predictedUsage,
      //   itemStyle: {
      //     color: '#91CC75',
      //   },
      //   label: {
      //     show: true,
      //     position: 'top',
      //     formatter: '{c}kWh',
      //   },
      // },
      {
        name: '用电量',
        type: 'line',
        yAxisIndex: 0,
        data: electricityChartData.value.temperatures,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#EE6666',
        },
        lineStyle: {
          width: 3,
        },
        label: {
          show: true,
          formatter: '{c}',
        },
      },
    ],
  };

  electricityChart.setOption(option);
};

const initWaterChart = () => {
  if (!useWaterRef.value) return;

  waterChart = echarts.init(useWaterRef.value);
  updateChart();
};

const updateChart = () => {
  if (!waterChart) return;

  const option = {
    title: {
      text: '近七日用水趋势及预测',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
      formatter: (params) => {
        let result = `${params[0].axisValue}<br>`;
        params.forEach((item) => {
          result += `${item.marker} ${item.seriesName}: ${item.value}${unit.value}<br>`;
        });
        return result;
      },
    },
    legend: {
      data: ['用水量趋势'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: waterData.value.dates,
      axisLabel: {
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: `用水量(${unit.value})`,
      axisLine: {
        show: true,
      },
      axisLabel: {
        formatter: `{value}${unit.value}`,
      },
    },
    series: [
      {
        name: '用水量趋势',
        type: 'line',
        data: waterData.value.actualUsage,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#5470C6',
        },
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
            { offset: 1, color: 'rgba(84, 112, 198, 0.1)' },
          ]),
        },
        label: {
          show: true,
          formatter: `{c}${unit.value}`,
          position: 'top',
        },
      },
      // {
      //   name: '预测用水量',
      //   type: 'line',
      //   data: waterData.value.predictedUsage,
      //   symbol: 'circle',
      //   symbolSize: 8,
      //   itemStyle: {
      //     color: '#91CC75',
      //   },
      //   lineStyle: {
      //     width: 3,
      //     type: 'dashed',
      //   },
      //   label: {
      //     show: true,
      //     formatter: `{c}${unit.value}`,
      //     position: 'top',
      //   },
      // },
    ],
  };

  waterChart.setOption(option);
};

// 初始化图表
const initPieChart = () => {
  if (!electricityChartRef.value || !waterChartRef.value) return;
  if (electricityChartRef.value) {
    // 初始化echarts实例
    electricityEneryChart = echarts.init(electricityChartRef.value);
    // 配置项
    const option1: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          // 自定义提示框内容:cite[4]
          const data = params.data;
          const total = electricityEnergySavingData.value.reduce((sum, item) => sum + item.value, 0);
          const percentage = ((data.value / total) * 100).toFixed(2);
          return `
          ${data.name}<br/>
          节能量: ${data.value} kWh<br/>
          占比: ${percentage}%
        `;
        },
        backgroundColor: 'rgba(50, 50, 50, 0.7)',
        borderColor: '#777',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
        },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
        data: electricityEnergySavingData.value.map((item) => item.name),
        textStyle: {
          fontSize: 12,
        },
      },
      series: [
        {
          name: '节能量',
          type: 'pie',
          radius: [0, '70%'], // 环形图效果:cite[4]
          center: ['60%', '50%'],
          data: electricityEnergySavingData.value,
          label: {
            show: true,
            formatter: '{b}: {c} kWh',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold',
            },
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            // 自定义颜色
            color: function (params: any) {
              const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666'];
              return colors[params.dataIndex % colors.length];
            },
          },
        },
      ],
    };
    // 设置配置项并渲染图表
    electricityEneryChart.setOption(option1);
  }

  if (waterChartRef.value) {
    waterEneryChart = echarts.init(waterChartRef.value);

    // 配置项
    const option2: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          // 自定义提示框内容:cite[4]
          const data = params.data;
          const total = waterEnergySavingData.value.reduce((sum, item) => sum + item.value, 0);
          const percentage = ((data.value / total) * 100).toFixed(2);
          return `
          ${data.name}<br/>
          节能量: ${data.value} kWh<br/>
          占比: ${percentage}%
        `;
        },
        backgroundColor: 'rgba(50, 50, 50, 0.7)',
        borderColor: '#777',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
        },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
        data: waterEnergySavingData.value.map((item) => item.name),
        textStyle: {
          fontSize: 12,
        },
      },
      series: [
        {
          name: '节能量',
          type: 'pie',
          radius: [0, '70%'], // 环形图效果:cite[4]
          center: ['60%', '50%'],
          data: waterEnergySavingData.value,
          label: {
            show: true,
            formatter: '{b}: {c} kWh',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold',
            },
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            // 自定义颜色
            color: function (params: any) {
              const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666'];
              return colors[params.dataIndex % colors.length];
            },
          },
        },
      ],
    };

    waterEneryChart.setOption(option2);
  }
};

const handleResize = () => {
  if (electricityChart) {
    electricityChart.resize();
  }
  if (waterChart) {
    waterChart.resize();
  }
  if (electricityEneryChart) {
    electricityEneryChart.resize();
  }
  if (waterEneryChart) {
    waterEneryChart.resize();
  }
};

const getEnergyConservationStatistics = async () => {
  let res = await getEnergyConservationStatisticsApi();
  if (res.electricity) {
    electricityEnergySavingData.value = res.electricity.list.map((item) => {
      return {
        value: item.value,
        name: item.projectType,
      };
    });
    total.value.electricityTotal = res.electricity.total
  }
  if (res.water) {
    waterEnergySavingData.value = res.water.list.map((item) => {
      return {
        value: item.value,
        name: item.projectType,
      };
    });
    total.value.waterTotal = res.water.total
  }
};

onMounted(async () => {
  let res = await getEnergyUseSafetyApi();
  placeList.value = [...res];
  await getEnergyConservationStatistics();
  initPieChart();
  switchEneryType(0);
  window.addEventListener('resize', handleResize);
});
</script>

<style lang="less" scoped>
.energy-safety {
  height: 100%;
  width: 100%;
  border-radius: 10px;
  padding: 0px 6px;
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;

  .safety-box {
    border-radius: 10px;
    padding: 12px;
    height: 32%;
    border: 1px solid red;
    width: 100%;
    .title {
      height: 30px;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .place-list {
      padding: 0 24px;
      height: calc(100% - 30px);
      width: 100%;

      .data-title {
        height: 40px;
        width: 100%;
        display: flex;
        align-items: center;

        div {
          display: flex;
          height: 100%;
          width: 25%;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
      }
      .data-box {
        height: calc(100% - 40px);
        overflow: auto;
        .data-item {
          height: 40px;
          width: 100%;
          display: flex;
          align-items: center;

          div {
            display: flex;
            height: 100%;
            width: 25%;
            align-items: center;
            justify-content: center;
            font-size: 16px;
          }
        }
      }
    }
  }

  .energy-saving-statistics {
    border-radius: 10px;
    // box-shadow: 5px 5px 15px #dfe0e0;
    padding: 12px 0;
    margin-top: 3%;
    height: 32%;
    border: 1px solid #f7faff;
    width: 100%;
    .energy-saving-statistics-title {
      padding: 0 12px;
      background-color: #eaf0fc;
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      // padding: 0 16px;
      font-size: 16px;
      font-weight: 600;
      .title-text {
        display: flex;
        .icon-box {
          width: 0;
          height: 26px;
          border: 2px solid #5990d8;
          margin-right: 6px;
        }
      }
    }

    .statistics-box {
      height: calc(100% - 40px);
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      align-items: center;

      .tabs-box {
        height: 40px;
        padding: 0 16px;
      }

      .statistics-data-box {
        margin-top: 5px;
        padding-top: 10px;
        height: calc(100% - 45px);
        width: 100%;
      }

      .title-box {
          height: 30px;
          font-size: 16px;
          font-weight: 600;
        }

      > div {
        height: calc(100% - 30px);
        width: 50%;

        
      }
    }
  }

  .trend-box {
    border-radius: 10px;
    padding: 6px 0;
    height: 32%;
    width: 100%;
    // box-shadow: 5px 5px 15px #dfe0e0;
  }

  .energy-box {
    border-radius: 10px;
    width: 100%;
    height: 32%;
    padding: 6px 0;
    margin-top: 3%;
    border: 1px solid #f7faff;
    // box-shadow: 5px 5px 15px #dfe0e0;

    .enery-title {
      height: 40px;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 12px;
      background-color: #eaf0fc;
    }

    .data-change-box {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .type-change {
        height: 100%;
        width: 20%;
        display: flex;
        justify-content: space-around;
        align-items: center;

        > div {
          font-size: 16px;
          &:hover {
            cursor: pointer;
          }
        }

        #isAcitve {
          color: #399dfa;
        }
      }

      .time-change {
        height: 100%;
        width: 70%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
    }

    .use-water,
    .use-electricity {
      height: calc(100% - 70px);
      width: 100%;
    }
  }
}
</style>
<style lang="less">
.energy-safety {
  .energy-saving-statistics {
    .statistics-box {
      .tabs-box {
        .ant-tabs-nav-wrap {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>