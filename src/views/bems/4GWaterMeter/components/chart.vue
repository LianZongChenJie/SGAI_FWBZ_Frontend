<template>
  <div style="width: 100%; height: 100%">
    <div class="button-box">
      <div>
        <a-radio-group v-model:value="type" @change="changeType">
          <a-radio-button value="hour">小时</a-radio-button>
          <a-radio-button value="day">日</a-radio-button>
          <a-radio-button value="month">月</a-radio-button>
        </a-radio-group>
        <template v-if="type !== 'hour'">
          &emsp;
          日期：<a-date-picker v-model:value="date" :picker="dateType" valueFormat="YYYY-MM-DD"
            @change="handleDateChange" />
          &emsp;
          <a-button type="primary" @click="submit">查询</a-button>
          &emsp;
          <a-button @click="reset">重置</a-button>
        </template>

      </div>
      <a-radio-group v-model:value="chartType" @change="changeChartType">
        <a-radio-button value="line">
          <LineChartOutlined style="font-size: 18px;" />
        </a-radio-button>
        <a-radio-button value="bar">
          <BarChartOutlined style="font-size: 18px;" />
        </a-radio-button>
      </a-radio-group>
    </div>
    <div id="chart" style="width: 100%; height: calc(100% - 40px);">

    </div>
  </div>
</template>
<script lang="ts" setup>
import * as echarts from 'echarts';
import { onMounted, ref, shallowRef } from 'vue';
import { findHourData, getChartDataDayApi, getChartDataMonthApi } from '../index.api';
import { LineChartOutlined, BarChartOutlined } from '@ant-design/icons-vue';
import { time } from 'console';

const props = defineProps({
  params: {
    type: Object,
    required: true,
  },
});

const date = ref<string>();
const dateType = ref<string>('date');
const selectTimeArr: any = ref([])

const type = ref('hour');
const chartType = ref('line');

const showEmpty = ref<boolean>(false); // 用于存储错误消息

const chartInstance = shallowRef(null);

const handleDateChange = (date, dateString) => {
  selectTimeArr.value = []
  if (type.value === 'day') {
    selectTimeArr.value = getSelectTimeArr(date)
  } else {
    selectTimeArr.value.push({ date: dateString + '-01' })
    selectTimeArr.value.push({ date: dateString + '-12' })
  }
}

const getSelectTimeArr = (date) => {
  // 创建日期对象
  const time = new Date(date)

  // 获取年份和月份
  const year = time.getFullYear()
  const month = time.getMonth() // 注意：0表示1月，11表示12月

  // 获取当月第一天
  const firstDay = new Date(year, month, 1)

  // 获取当月最后一天：下个月的第0天
  const lastDay = new Date(year, month + 1, 0)

  // 格式化输出（可选）
  const formatDate = (date) => {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return [{ date: formatDate(firstDay) }, { date: formatDate(lastDay) }]
}

const submit = async () => {
  await getData()
}

const reset = async () => {
  date.value = ''
  await getData()
}

const loadData = async (res) => {
  // const res = await findHourData(props.params);
  if (res.length === 0) {
    showEmpty.value = true;
    return;
  }
  const option = {
    xAxis: {
      type: 'category',
      data: [],
    },
    tooltip: {
      trigger: 'axis',
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [],
        type: chartType.value,
      },
    ],
  };
  res.forEach((item: any) => {
    option.xAxis.data.push(item.time);
    option.series[0].data.push(item.value);
  });
  chartInstance.value.setOption(option);
};

const changeType = async (val) => {
  if (val.target.value === 'hour') {
    dateType.value = 'date'
  } else if (val.target.value === 'day') {
    dateType.value = 'month'
    selectTimeArr.value = []
    selectTimeArr.value = getSelectTimeArr(date.value)
  } else {
    dateType.value = 'year'
    selectTimeArr.value = []
    selectTimeArr.value.push({ date: date.value?.split('-')[0] + '-01' })
    selectTimeArr.value.push({ date: date.value?.split('-')[0] + '-12' })
  }
  await getData();
};

const changeChartType = async () => {
  await getData();
}

const getData = async () => {
  let res: any;
  if (type.value === 'hour') {
    res = await findHourData(props.params);
    loadData(res)
  } else if (type.value === 'day') {
    let timeArr: any
    if (date.value) {
      timeArr = selectTimeArr.value
    } else {
      timeArr = getPrevious30Days();
    }
    res = await getChartDataDayApi({
      deviceId: props.params.deviceId,
      startTime: timeArr[0].date + ' 00:00:00',
      endTime: timeArr[timeArr.length - 1].date + ' 00:00:00',
      pageNo: 1,
      pageSize: 999,
    });
    loadData(res.records.reverse())
  } else {
    let timeArr: any
    if (date.value) {
      timeArr = selectTimeArr.value
    } else {
      timeArr = getPrevious12Months();
    }
    res = await getChartDataMonthApi({
      deviceId: props.params.deviceId,
      startTime: timeArr[0].date + '-01 00:00:00',
      endTime: timeArr[timeArr.length - 1].date + '-01 00:00:00',
      pageNo: 1,
      pageSize: 999,
    });
    loadData(res.records.reverse())
  }


};

// 获取前30天的日期
const getPrevious30Days = () => {
  const dates = [];
  const today = new Date();

  for (let i = 30; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD 格式
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      week: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
      fullDate: date,
    });
  }

  return dates;
};

// 获取前12个月的日期
const getPrevious12Months = () => {
  const months = [];
  const today = new Date();

  for (let i = 12; i > 0; i--) {
    const date = new Date(today);
    date.setMonth((today.getMonth() + 1) - i);

    months.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      monthName: `${date.getMonth() + 1}月`,
      yearMonth: `${date.getFullYear()}年${date.getMonth() + 1}月`,
      fullDate: date,
    });
  }

  return months;
};

onMounted(async () => {
  const chartDom = document.getElementById('chart');
  if (chartDom) {
    chartInstance.value = echarts.init(chartDom);
  }
  await getData();
});
</script>
<style lang="less" scoped>
.button-box {
  height: 40px;
  width: 100%;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
