<template>
  <div class="trend-forecast-box">
    <div class="title-box">
      <MyCarbonTitle :title="props.title + '碳排放趋势预测'" />
      <div class="form-box">
        <a-button
          v-if="!props.title"
          :type="timeType === 1 ? 'primary' : 'default'"
          @click="handleTimeType(1)"
        >日</a-button>
        &emsp;
        <a-button
          v-if="!props.title"
          :type="timeType === 2 ? 'primary' : 'default'"
          @click="handleTimeType(2)"
        >月</a-button>
        &emsp;
        <a-button
          v-if="!props.title"
          :type="timeType === 3 ? 'primary' : 'default'"
          @click="handleTimeType(3)"
        >年</a-button>
        &emsp;
        <a-date-picker
          v-if="timeType === 3"
          v-model:value="date"
          picker="year"
          valueFormat="YYYY-MM-DD"
        />
        <a-date-picker
          v-else-if="timeType === 2"
          v-model:value="date"
          picker="month"
          valueFormat="YYYY-MM-DD"
        />
        <a-date-picker
          v-else
          v-model:value="date"
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
      :id="props.id"
    >

    </div>
  </div>
</template>

<script setup lang="ts">
import MyCarbonTitle from './MyCarbonTitle.vue';
import * as echarts from 'echarts';
import { ref, onMounted } from 'vue';
import { getTrendsDayDataApi, getTrendsMonthDataApi, getTrendsYearDataApi } from '../standardized.api';

const props = defineProps({
  title: {
    tyep: String,
    default: '',
  },
  id: {
    tyep: String,
    default: '',
  },
});

// 时间类型
const timeType = ref(1);

// 对比时间
const date = ref();

let trendsForecastChartInstance: any = null;

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
  const chartDom = document.getElementById(props.id);
  if (!chartDom) return;
  if (trendsForecastChartInstance) {
    trendsForecastChartInstance.dispose(); // 先清除旧实例
  }
  trendsForecastChartInstance = echarts.init(chartDom);

  let currentMonth = '';
  let previousMonth = '';
  switch (timeType.value) {
    case 1:
      // currentMonth = date.value;
      // previousMonth = getDate(date.value).prevDay;
      currentMonth = '实际排放量';
      previousMonth = '预计排放量';
      break;
    case 2:
      currentMonth = date.value.split('-')[0] + '-' + date.value.split('-')[1];
      previousMonth = getDate(date.value).prevMonth.split('-')[0] + '-' + getDate(date.value).prevMonth.split('-')[1];
      break;
    case 3:
      currentMonth = date.value.split('-')[0];
      previousMonth = getDate(date.value).prevYear.value.split('-')[0];
      break;
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params) {
        let result =
          `${
            timeType.value === 3
              ? date.value.split('-')[0] + '年'
              : timeType.value === 2
              ? date.value.split('-')[0] + '年' + date.value.split('-')[1] + '月'
              : date.value.split('-')[0] + '年' + date.value.split('-')[1] + '月' + date.value.split('-')[2] + '日'
          }` +
          params[0].axisValue +
          `${timeType.value === 3 ? '月' : timeType.value === 2 ? '日' : '时'}<br/>`;
        params.forEach((item) => {
          result += `${item.marker} ${item.seriesName} <strong>${item.value}</strong> t<br/>`;
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

  trendsForecastChartInstance.setOption(option);

  window.addEventListener('resize', function () {
    trendsForecastChartInstance.resize();
  });
};

// 获取图表数据
const getLineChartData = async () => {
  let params: any = {};
  let dataApi: any = null;
  let name1 = date.value;
  let name2 = getDate(date.value).prevDay;
  if (!props.title) {
    switch (timeType.value) {
      case 1:
        dataApi = getTrendsDayDataApi;
        params = {
          date: date.value,
          compareDate: getDate(date.value).prevDay,
        };
        break;
      case 2:
        dataApi = getTrendsMonthDataApi;
        params = {
          year: date.value.split('-')[0],
          month: Number(date.value.split('-')[1]),
          compareYear: date.value.split('-')[0],
          compareMonth: Number(getDate(date.value).prevMonth.split('-')[1]),
        };
        name1 = date.value.split('-')[0] + '-' + date.value.split('-')[1];
        name2 = getDate(date.value).prevMonth.split('-')[0] + '-' + getDate(date.value).prevMonth.split('-')[1];
        break;
      case 3:
        dataApi = getTrendsYearDataApi;
        params = {
          year: date.value.split('-')[0],
          compareYear: getDate(date.value).prevYear.split('-')[0],
        };
        name1 = date.value.split('-')[0];
        name2 = getDate(date.value).prevYear.split('-')[0];
        break;
    }
  } else {
    dataApi = getTrendsDayDataApi;
    params = {
      date: date.value,
      compareDate: getDate(date.value).prevDay,
    };
    name2 = getDate(date.value).prevDay;
  }
  let res = await dataApi(params);
  currentData.value = res.chatSeriesList.find((item) => item.name === name1).data;
  previousData.value = res.chatSeriesList.find((item) => item.name === name2).data;
  dateLabels.value = res.xaxis;
  initChart();
};

const getDate = (dateStr) => {
  // 验证日期格式
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('日期格式应为YYYY-MM-DD');
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error('无效的日期');
  }

  // 前一天
  const prevDay = new Date(date);
  prevDay.setDate(date.getDate() - 1);

  // 前一月（处理不同月份天数问题）
  const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const daysInPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
  prevMonth.setDate(Math.min(date.getDate(), daysInPrevMonth));

  // 前一年（处理闰年2月29日情况）
  const prevYear = new Date(date.getFullYear() - 1, date.getMonth(), 1);
  const daysInPrevYearMonth = new Date(prevYear.getFullYear(), prevYear.getMonth() + 1, 0).getDate();
  prevYear.setDate(Math.min(date.getDate(), daysInPrevYearMonth));

  // 格式化函数
  const format = (d) => d.toISOString().split('T')[0];

  return {
    originalDate: format(date),
    prevDay: format(prevDay),
    prevMonth: format(prevMonth),
    prevYear: format(prevYear),
    prevMonthOnly: format(prevMonth).slice(0, 7), // YYYY-MM
    prevYearOnly: prevYear.getFullYear().toString(), // YYYY
  };
};

onMounted(async () => {
  const today = new Date();
  date.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  await getLineChartData();
});
</script>

<style lang="less" scoped>
.trend-forecast-box {
  height: 100%;
  width: 100%;

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
</style>