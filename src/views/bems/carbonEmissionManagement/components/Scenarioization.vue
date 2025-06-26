<template>
  <div class="scenarioization-box">
    <div class="title-box">
      <MyCarbonTitle :title="'场景化碳排分析'" />
      <div class="form-box">
        <!-- <a-select
          style="width: 200px;"
          v-model:value="type"
          show-search
          :showArrow="true"
          placeholder="请选择对象"
          :options="options"
        ></a-select>
        &emsp; -->
        <a-select
          style="width: 500px;"
          v-model:value="objectArr"
          show-search
          :showArrow="true"
          placeholder="请选择对象"
          mode="multiple"
          :maxTagCount="3"
          :options="options"
        ></a-select>
        &emsp;
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
    <div class="scenarioization-pie-and-bar-box">
      <div
        class="scenarioization-pie-chart-box"
        ref="scenarioizationPieChart"
      >

      </div>
      <div
        class="scenarioization-bar-chart-box"
        ref="scenarioizationBarChart"
      >

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MyCarbonTitle from './MyCarbonTitle.vue';
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import {
  getObjectListApi,
  getScenarioizationPieDataApi,
  getScenarioizationDayDataApi,
  getScenarioizationMonthDataApi,
  getScenarioizationYearDataApi,
} from '../standardized.api'

const options = ref<any>([]);

// 类型
const type = ref();

// 对象数组
const objectArr = ref<any>([]);

// 时间类型
const timeType = ref(2);

// 时间
const date = ref('');

const scenarioizationPieChart = ref(null);
const scenarioizationBarChart = ref(null);
let scenarioizationChartInstance: any = null;

const buildingData = ref<any>([])

// 柱状图数据
const barBuildingData = ref<any>({});
const buildings = ref<any>([]);
const months = ref<any>([]);

// 切换时间类型
const handleTimeType = (type) => {
  timeType.value = type;
};

// 查询
const serachTrendsData = () => {
  getScenarioizationData()
};

// 初始化南丁格尔图
const initPieChart = () => {
  const chart = echarts.init(scenarioizationPieChart.value);

  // 按值排序
  const sortedData = [...buildingData.value].sort((a, b) => b.value - a.value);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} tCO₂e ({d}%)',
    },
    legend: {
      data: buildingData.value.map((item) => item.name),
      bottom: 5,
      orient: 'horizontal',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12,
        width: 120,
        overflow: 'truncate',
        ellipsis: '...',
      },
    },
    series: [
      {
        name: '碳排放量',
        type: 'pie',
        radius: [0, '80%'],
        center: ['50%', '50%'],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: function (params) {
            return `${params.name}\n${params.value}t (${params.percent}%)`;
          },
          fontSize: 12,
          lineHeight: 16,
          color: '#333',
        },
        labelLine: {
          length: 10,
          length2: 20,
          smooth: 0.2,
          lineStyle: {
            width: 1,
          },
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: sortedData,
        color: ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83'],
      },
    ],
  };

  chart.setOption(option);

  window.addEventListener('resize', function () {
    chart.resize();
  });
};

// 初始化柱状图
const initBarChart = () => {
  if (scenarioizationChartInstance) {
    scenarioizationChartInstance.dispose(); // 先清除旧实例
  }
  scenarioizationChartInstance = echarts.init(scenarioizationBarChart.value);

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
          `${timeType.value === 3 ? '月' : timeType.value === 2 ? '日' : ''}<br/>`;
        params.forEach((item) => {
          result += `${item.marker} ${item.seriesName} <strong>${item.value}</strong> t<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: buildings.value,
      bottom: 0,
      itemGap: 15,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12,
      },
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
      data: months.value,
      axisLabel: {
        interval: 0,
        rotate: 45,
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
      name: '碳排放量 (t)',
      nameLocation: 'end',
      nameGap: 20,
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
    series: buildings.value.map((building) => ({
      name: building,
      type: 'bar',
      barWidth: '10',
      data: barBuildingData.value[building],
      itemStyle: {
        color: function (params) {
          // 为每个建筑分配固定颜色
          const colorList = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'];
          return colorList[buildings.value.indexOf(building) % colorList.length];
        },
        borderRadius: [4, 4, 0, 0], // 顶部圆角
      },
      label: {
        show: true,
        position: 'top',
        formatter: function (params) {
          // 只显示较大的数值
          return params.value > 300 ? params.value : '';
        },
        fontSize: 10,
      },
    })),
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        bottom: 30,
        height: 20,
        start: 0,
        end: 50, // 初始显示50%数据
        maxValueSpan: 10,
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        maxValueSpan: 10, // 最大显示10个数据项
      },
    ],
  };

  scenarioizationChartInstance.setOption(option);

  window.addEventListener('resize', function () {
    scenarioizationChartInstance.resize();
  });
};

// 获取对象列表数据
const getObjectList = async () => {
  let res = await getObjectListApi()
  options.value = res.map(item => {
    return {
      label: item.nodeName,
      value: item.id
    }
  })
  objectArr.value.push(options.value[0].value)
}

// 获取饼图数据
const getPieChartData = async () => {
  let res = await getScenarioizationPieDataApi()
  buildingData.value = [...res.seriesData]
  initPieChart();
}

// 获取柱状图数据
const getScenarioizationData = async () => {
  let params: any = {
    pointIds: objectArr.value.join(',')
  };
  let dataApi: any = null;
  switch (timeType.value) {
    case 1:
      dataApi = getScenarioizationDayDataApi;
      params['date'] = date.value
      break;
    case 2:
      dataApi = getScenarioizationMonthDataApi;
      params['year'] = date.value.split('-')[0]
      params['month'] = Number(date.value.split('-')[1])
      break;
    case 3:
      dataApi = getScenarioizationYearDataApi;
      params['year'] = date.value.split('-')[0]
      break;
  }
  let res = await dataApi(params)
  buildings.value = res.chatSeriesList.map((item) => item.name);
  res.chatSeriesList.forEach((item) => {
    barBuildingData.value[item.name] = item.data;
  });
  months.value = [...res.xaxis];
  initBarChart()
}

onMounted(async () => {
  // 获取当前时间
  const now = new Date();
  // 获取当月
  date.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  await getObjectList()
  await getPieChartData()
  await getScenarioizationData()
});
</script>

<style lang="less" scoped>
.scenarioization-box {
  height: 100%;
  width: 100%;
  background-color: #fff;
  padding: 5px;

  .title-box {
    display: flex;
    justify-content: space-between;

    .form-box {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
  }

  .scenarioization-pie-and-bar-box {
    height: calc(100% - 30px);
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .scenarioization-pie-chart-box {
      height: 100%;
      width: 33%;
    }

    .scenarioization-bar-chart-box {
      height: 100%;
      width: 66%;
    }
  }
}
</style>