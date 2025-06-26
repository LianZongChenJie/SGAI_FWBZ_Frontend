<template>
  <div class="overview-and-trends-box">
    <div class="overview-box">
      <div class="title-box">
        <MyCarbonTitle :title="'总览'" />
      </div>
      <div class="overview-item-box">
        <div class="overview-item">
          <div class="overview-title">当月用能(KWh)</div>
          <div class="overview-number">{{overviewData.monthConsumption}}</div>
          <div class="overview-trends">较上月&nbsp;<p>{{overviewData.monthConsumptionCompare}}
              <ArrowUpOutlined />
            </p>
          </div>
        </div>
        <div class="overview-item">
          <div class="overview-title">本季度用能(KWh)</div>
          <div class="overview-number">{{overviewData.quarterConsumption}}</div>
          <div class="overview-trends">较上月&nbsp;<p>{{overviewData.quarterConsumptionCompare}}
              <ArrowUpOutlined />
            </p>
          </div>
        </div>
        <div class="overview-item">
          <div class="overview-title">本年用能(KWh)</div>
          <div class="overview-number">{{overviewData.yearConsumption}}</div>
          <div class="overview-trends">较上月&nbsp;<p>{{overviewData.yearConsumptionCompare}}
              <ArrowUpOutlined />
            </p>
          </div>
        </div>
        <div class="overview-item">
          <div class="overview-title">上月碳排(t)</div>
          <div class="overview-number carcon-bumber">{{overviewData.monthCarbonEmission}}</div>
          <div class="overview-trends">较上月&nbsp;<p>{{overviewData.monthCarbonEmissionCompare}}
              <ArrowUpOutlined />
            </p>
          </div>
        </div>
        <div class="overview-item">
          <div class="overview-title">本季度碳排(t)</div>
          <div class="overview-number carcon-bumber">{{overviewData.quarterCarbonEmission}}</div>
          <div class="overview-trends">较上月&nbsp;<p>{{overviewData.quarterCarbonEmissionCompare}}
              <ArrowUpOutlined />
            </p>
          </div>
        </div>
        <div class="overview-item">
          <div class="overview-title">本年碳排(t)</div>
          <div class="overview-number carcon-bumber">{{overviewData.yearCarbonEmission}}</div>
          <div class="overview-trends">较上月&nbsp;<p>{{overviewData.yearCarbonEmissionCompare}}
              <ArrowUpOutlined />
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="trends-box">
      <div class="title-box">
        <MyCarbonTitle :title="'整体碳排放趋势对比'" />
        <div class="form-box">
          <a-button
            :type="timeType === 1 ? 'primary' : 'default'"
            @click="handleTimeType(1)"
          >日</a-button>
          &emsp;
          <a-button
            :type="timeType === 2 ? 'primary' : 'default'"
            @click="handleTimeType(2)"
          >月</a-button>
          &emsp;
          <a-button
            :type="timeType === 3 ? 'primary' : 'default'"
            @click="handleTimeType(3)"
          >年</a-button>
          &emsp;
          <a-date-picker
            v-if="timeType === 3"
            v-model:value="date1"
            picker="year"
            valueFormat="YYYY-MM-DD"
          />
          <a-date-picker
            v-else-if="timeType === 2"
            v-model:value="date1"
            picker="month"
            valueFormat="YYYY-MM-DD"
          />
          <a-date-picker
            v-else
            v-model:value="date1"
            valueFormat="YYYY-MM-DD"
          />
          &emsp;
          <div>VS</div>
          &emsp;
          <a-date-picker
            v-if="timeType === 3"
            v-model:value="date2"
            picker="year"
            valueFormat="YYYY-MM-DD"
          />
          <a-date-picker
            v-else-if="timeType === 2"
            v-model:value="date2"
            picker="month"
            valueFormat="YYYY-MM-DD"
          />
          <a-date-picker
            v-else
            v-model:value="date2"
            valueFormat="YYYY-MM-DD"
          />
          &emsp;
          <a-button
            type="primary"
            @click="serachTrendsData"
          >查询</a-button>
        </div>
      </div>
      <div
        class="trends-chart"
        ref="trendsChart"
      >

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MyCarbonTitle from './MyCarbonTitle.vue';
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { ArrowUpOutlined } from '@ant-design/icons-vue';
import { getOverviewDataApi, getTrendsDayDataApi, getTrendsMonthDataApi, getTrendsYearDataApi } from '../standardized.api';

// 总览数据
const overviewData = ref({
  monthConsumption: 0,
  monthConsumptionCompare: '',
  quarterConsumption: 0,
  quarterConsumptionCompare: '',
  yearConsumption: 0,
  yearConsumptionCompare: '',
  monthCarbonEmission: 0,
  monthCarbonEmissionCompare: '',
  quarterCarbonEmission: 0,
  quarterCarbonEmissionCompare: '',
  yearCarbonEmission: 0,
  yearCarbonEmissionCompare: '',
});

const trendsChart = ref(null);

let trendsChartInstance: any = null;

// 时间类型
const timeType = ref(2);

// 对比时间
const date1 = ref();
const date2 = ref();

// 切换时间类型
const handleTimeType = (type) => {
  timeType.value = type;
};

// 拆查询对比数据
const serachTrendsData = async () => {
  getLineChartData();
};

// 当前数据
const currentData = ref([]);

// 对比数据
const previousData = ref([]);

// x轴数据
const dateLabels = ref([]);

// 初始化图表
const initChart = () => {
  if (trendsChartInstance) {
    trendsChartInstance.dispose(); // 先清除旧实例
  }
  trendsChartInstance = echarts.init(trendsChart.value);

  let currentMonth = '';
  let previousMonth = '';
  switch (timeType.value) {
    case 1:
      currentMonth = date1.value;
      previousMonth = date2.value;
      break;
    case 2:
      currentMonth = date1.value.split('-')[0] + '-' + date1.value.split('-')[1];
      previousMonth = date2.value.split('-')[0] + '-' + date2.value.split('-')[1];
      break;
    case 3:
      currentMonth = date1.value.split('-')[0];
      previousMonth = date2.value.split('-')[0];
      break;
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params) {
        let result = `日期: ${params[0].axisValue}${timeType.value === 1 ? '日' : (timeType.value === 2 ? '日' : '月')}<br/>`;
        params.forEach((item) => {
          result += `${item.marker}<strong>${item.value}</strong> t<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: [`${currentMonth} 排放量`, `${previousMonth} 排放量`],
      top: 10,
      itemGap: 20,
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
      data: dateLabels.value,
      axisLabel: {
        interval: 4, // 每4天显示一个标签
        rotate: 30, // 倾斜30度
        formatter: function (value) {
          // 只显示日期部分
          return value.split('/')[1];
        },
      },
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      name: '碳排放量 (tCO₂e)',
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
      min: function (value) {
        return Math.max(0, value.min - 20);
      },
    },
    series: [
      {
        name: `${currentMonth} 排放量`,
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(166,197,252,1)' },
            { offset: 1, color: 'rgba(248,250,255,0.5)' },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#a6c5fc',
        },
        itemStyle: {
          color: '#a6c5fc',
        },
        data: currentData.value,
      },
      {
        name: `${previousMonth} 排放量`,
        type: 'line',
        smooth: true,
        emphasis: {
          focus: 'series',
        },
        symbol: 'emptyCircle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: '#f5bd2a',
        },
        itemStyle: {
          color: '#f5bd2a',
        },
        data: previousData.value,
      },
    ],
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        bottom: 30,
        height: 20,
        handleSize: '100%',
        start: 0,
        end: 50, // 初始显示50%的数据
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        zoomOnMouseWheel: false,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
      },
    ],
  };

  trendsChartInstance.setOption(option);

  window.addEventListener('resize', function () {
    trendsChartInstance.resize();
  });
};

// 获取总览数据
const getOverviewData = async () => {
  let res = await getOverviewDataApi();
  overviewData.value = { ...res };
};

// 获取图表数据
const getLineChartData = async () => {
  let params: any = {};
  let dataApi: any = null;
  let name1 = date1.value
  let name2 = date2.value
  switch (timeType.value) {
    case 1:
      dataApi = getTrendsDayDataApi;
      params = {
        date: date1.value,
        compareDate: date2.value,
      };
      break;
    case 2:
      dataApi = getTrendsMonthDataApi;
      params = {
        year: date1.value.split('-')[0],
        month: Number(date1.value.split('-')[1]),
        compareYear: date2.value.split('-')[0],
        compareMonth: Number(date2.value.split('-')[1]),
      };
      name1 = date1.value.split('-')[0] + '-' + date1.value.split('-')[1]
      name2 = date2.value.split('-')[0] + '-' + date2.value.split('-')[1]
      break;
    case 3:
      dataApi = getTrendsYearDataApi;
      params = {
        year: date1.value.split('-')[0],
        compareYear: date2.value.split('-')[0],
      };
      name1 = date1.value.split('-')[0]
      name2 = date2.value.split('-')[0]
      break;
  }
  let res = await dataApi(params);
  currentData.value = res.chatSeriesList.find((item) => item.name === name1).data;
  previousData.value = res.chatSeriesList.find((item) => item.name === name2).data;
  dateLabels.value = res.xaxis;
  initChart();
};

onMounted(async () => {
  // 获取当前时间
  const now = new Date();

  // 获取上月
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  date1.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  date2.value = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-01`;

  await getOverviewData();
  await getLineChartData();
});
</script>

<style lang="less" scoped>
.overview-and-trends-box {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .overview-box,
  .trends-box {
    height: 100%;
    background-color: #fff;
    border-radius: 5px;
    padding: 5px;
  }

  .overview-box {
    height: 100%;
    width: 40%;

    .overview-item-box {
      height: calc(100% - 30px);
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      align-content: space-around;

      .overview-item {
        height: 45%;
        width: 32%;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-content: center;

        div {
          width: 100%;
          text-align: center;
        }

        .overview-title {
          font-size: 18px;
          font-weight: 600;
          color: #000;
        }
        .overview-number {
          font-size: 36px;
          color: #f34040;
        }
        .carcon-bumber {
          color: #f3c940;
        }
        .overview-trends {
          display: flex;
          font-size: 16px;
          justify-content: center;
          color: #8a8989;

          p {
            color: #f34040;
          }
        }
      }
    }
  }

  .trends-box {
    height: 100%;
    width: 59%;

    .title-box {
      display: flex;
      justify-content: space-between;

      .form-box {
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
    }

    .trends-chart {
      height: calc(100% - 30px);
      width: 100%;
    }
  }
}
</style>