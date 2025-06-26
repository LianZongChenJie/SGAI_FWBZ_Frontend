<template>
  <div class="cost-analysis-item">
    <div class="form-box">
      <div class="title-box">
        {{'用' + props.title + '成本分析'}}
      </div>
      <div class="form">
        <a-form
          :model="formState"
          ref="formRef"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-row
            :gutter="8"
            style="margin-top: 40px;"
          >
            <a-col :span="22">
              <a-form-item
                name="month"
                label="分析维度："
                :rules="[{ required: true, message: '请选择分析维度' }]"
              >
                <a-date-picker
                  v-model:value="formState.month"
                  @change="handleChange"
                  picker="month"
                  size="large"
                  valueFormat="YYYY-MM-DD"
                  style="width: 100%;"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row
            :gutter="8"
            style="margin-top: 20px;"
          >
            <a-col :span="22">
              <a-form-item
                name="total"
                :label="'用'+ props.title +'总量'"
              >
                <a-input
                  v-model:value="formState.total"
                  size="large"
                  style="width: 100%"
                  :suffix="props.totalSuffix"
                ></a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row
            :gutter="8"
            style="margin-top: 20px;"
          >
            <a-col :span="22">
              <a-form-item
                name="cost"
                :label="'用'+ props.title +'费用'"
              >
                <a-input
                  v-model:value="formState.cost"
                  size="large"
                  style="width: 100%"
                  suffix="元"
                ></a-input>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </div>
    <div class="pie-chart-box">
      <div class="title-box">
        {{'费用-用' + props.title + '业务分析表'}}
      </div>
      <div
        :id='props.pieId'
        class="chart-box"
      >

      </div>
    </div>
    <div class="bar-chart-box">
      <div class="title-box">
        {{'费用-用' + props.title + '日期分析表'}}
      </div>
      <div
        :id='props.barId'
        class="chart-box"
      >

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { 
  getTotalCostApi,
  getSpecialtyPieChartApi,
  getDayCostBarChartApi,
 } from '../Standardized.api';

const props = defineProps({
  title: {
    type: String,
    default: '电',
  },
  pieId: {
    type: String,
    default: 'pieId',
  },
  barId: {
    type: String,
    default: 'barId',
  },
  totalSuffix: {
    type: String,
    default: 'KW.H',
  },
  category: {
    type: String,
    default: 'electricity',
  },
});

const formState = ref({
  month: '',
  total: 0,
  cost: 0
});

let pieChartInstance: any = null;
let barChartInstance: any = null;
// 电费数据
const electricityData = ref<any>([
  { name: '空调', value: 35600 },
  { name: '照明', value: 12800 },
  { name: '动力', value: 24500 },
  { name: '电梯', value: 8700 },
]);

// 模拟每日电费数据（示例数据）
const dailyData = ref([
  { date: '1日', cost: 1250 },
  { date: '2日', cost: 1320 },
  { date: '3日', cost: 1010 },
  { date: '4日', cost: 1530 },
  { date: '5日', cost: 1890 },
  { date: '6日', cost: 1680 },
  { date: '7日', cost: 1430 },
  { date: '8日', cost: 1560 },
  { date: '9日', cost: 1780 },
  { date: '10日', cost: 1650 },
  { date: '11日', cost: 1420 },
  { date: '12日', cost: 1360 },
  { date: '13日', cost: 1290 },
  { date: '14日', cost: 1480 },
  { date: '15日', cost: 1570 },
  { date: '16日', cost: 1630 },
  { date: '17日', cost: 1720 },
  { date: '18日', cost: 1810 },
  { date: '19日', cost: 1650 },
  { date: '20日', cost: 1430 },
  { date: '21日', cost: 1380 },
  { date: '22日', cost: 1520 },
  { date: '23日', cost: 1670 },
  { date: '24日', cost: 1760 },
  { date: '25日', cost: 1840 },
  { date: '26日', cost: 1720 },
  { date: '27日', cost: 1630 },
  { date: '28日', cost: 1580 },
  { date: '29日', cost: 1460 },
  { date: '30日', cost: 1390 },
]);

// 获取左侧基本数据
const getTotalCost = async () => {
  let params = {
    category: props.category,
    date: formState.value.month,
    // date: '2025-04-01'
  }
  let res = await getTotalCostApi(params)
  formState.value.total = res.total
  formState.value.cost = res.cost
}

// 获取饼图数据
const getSpecialtyPieChart = async () => {
  let params = {
    category: props.category,
    date: formState.value.month,
    // date: '2025-04-01',
  }
  let res = await getSpecialtyPieChartApi(params)
  electricityData.value = res.seriesData.map(item => {
    return {
      name: item.name,
      value: item.value,
      unit: item.unit
    }
  })
  initPieChart();
}

// 获取柱状图数据
const getDayCostBarChart = async () => {
  let params = {
    category: props.category,
    date: formState.value.month,
    // date: '2025-04-01'
  }
  let res = await getDayCostBarChartApi(params)
  dailyData.value = res.xaxis.map((item, index) => {
    return {
      date: item + '日',
      cost: res.chatSeriesList[0].data[index]      ,
    }
  })
  initBarChart();
}

// 初始化图表
const initPieChart = () => {
  const chartDom = document.getElementById(props.pieId);
  if (!chartDom) return;

  pieChartInstance = echarts.init(chartDom);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: `{a} <br/>{b}: {c}${electricityData.value[0].unit}`,
    },
    legend: {
      orient: 'horizontal', // 横向显示
      bottom: 0, // 位于底部
      data: electricityData.value.map((item) => item.name),
      itemWidth: 20, // 图例标记的宽度
      itemHeight: 12, // 图例标记的高度
      textStyle: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: '电费金额',
        type: 'pie',
        // radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: `{b}: {c}${electricityData.value[0].unit}`,
          fontSize: 12,
          lineHeight: 18,
        },
        labelLine: {
          show: true,
          length: 10, // 第一段线长度
          length2: 15, // 第二段线长度
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
            formatter: `{b}\n{c}${electricityData.value[0].unit}`,
          },
        },
        data: electricityData.value,
      },
    ],
  };

  pieChartInstance.setOption(option);
};

// 初始化图表
const initBarChart = () => {
  const chartDom = document.getElementById(props.barId);
  if (!chartDom) return;

  barChartInstance = echarts.init(chartDom);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: '{b}<br/>电费: {c}元',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dailyData.value.map((item) => item.date),
      axisLabel: {
        interval: 0, // 显示所有标签
        rotate: 45, // 标签旋转45度防止重叠
        fontSize: 10,
      },
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '电费(元)',
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
        name: '电费',
        type: 'bar',
        barWidth: '60%',
        data: dailyData.value.map((item) => item.cost),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' },
          ]),
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}元',
          fontSize: 10,
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ff7f50' },
              { offset: 0.7, color: '#ff4500' },
              { offset: 1, color: '#ff4500' },
            ]),
          },
        },
      },
    ],
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 30, // 默认显示30天
        bottom: 20,
      },
    ],
  };

  barChartInstance.setOption(option);
};

// 响应式调整
const resizeChart = () => {
  pieChartInstance?.resize();
};

// 更改筛选条件
const handleChange = () => {
  getTotalCost()
  getSpecialtyPieChart()
  getDayCostBarChart()
}

onMounted(async () => {
  const today = new Date();
  let month = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  formState.value.month = month.toISOString().split('T')[0]
  await getTotalCost()
  await getSpecialtyPieChart()
  await getDayCostBarChart()
  window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  pieChartInstance?.dispose();
});
</script>

<style lang="less" scoped>
.cost-analysis-item {
  height: 330px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;

  > div {
    height: 100%;

    .title-box {
      height: 30px;
      width: 100%;
      padding: 0 16px;
      line-height: 30px;
      font-size: 16px;
      font-weight: 600;
    }
  }
  .form-box {
    width: 26%;

    .form {
      height: calc(100% - 10px);
      width: 100%;
    }
  }
  .pie-chart-box,
  .bar-chart-box {
    width: 37%;

    .chart-box {
      height: calc(100% - 30px);
      width: 100%;
    }
  }
}
</style>
<style lang="less">
.cost-analysis-item {
  .form-box {
    width: 27%;

    .form {
      .ant-form-item-label > label {
        font-size: 16px; /* 设置你想要的字体大小 */
      }
    }
  }
}
</style>