<template>
  <a-modal
    v-model:open="open"
    title="节能项目评价报告"
    width="60vw"
    @cancel="closeModal"
  >
    <div class="project-mvaluation-modal">
      <div class="base-info">
        <div>项目名称：<span>{{ projectData.projectName }}</span></div>
        <div>计量对象：<span>{{ projectData.pointName }}</span></div>
      </div>
      <div class="form-box">
        <div class="form-item-box">
          <a-form
            :model="formState"
            ref="formRef"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 14 }"
            labelAlign="left"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item
                  name="dateType"
                  label="对标颗粒度："
                  :rules="[{ required: true, message: '请选择对比基准类型' }]"
                >
                  <a-select
                    v-model:value="formState.dateType"
                    style="width: 100%"
                  >
                    <a-select-option value="hour">小时</a-select-option>
                    <a-select-option value="date">日</a-select-option>
                    <a-select-option value="month">月</a-select-option>
                    <a-select-option
                      value="year"
                      v-if="formState.benchmarkingMethod !== '1'"
                    >年</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="16">
                <a-form-item
                  name="analysisTime"
                  label="评估时间跨度："
                  :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 18 }"
                  :rules="[{ required: true, message: '请选择分析起止时间' }]"
                >
                  <a-range-picker
                    v-model:value="formState.analysisTime"
                    style="width: 100%"
                    :picker="(formState.dateType === 'hour' ? 'date' : formState.dateType)"
                    valueFormat="YYYY-MM-DD HH:mm:ss"
                    @change="handleAnalysisTimeChange"
                    :allowClear="false"
                    :show-time="formState.dateType === 'hour'"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item
                  name="benchmarkingMethod"
                  label="对标方式："
                  :rules="[{ required: true, message: '请选择较基准异常条件配置' }]"
                >
                  <a-select
                    v-model:value="formState.benchmarkingMethod"
                    style="width: 100%"
                    :options="options1"
                    @change="handleIncreaseContent"
                  ></a-select>
                </a-form-item>
              </a-col>
              <a-col :span="16">
                <a-form-item
                  name="referenceTime"
                  :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 18 }"
                  label="基准时间跨度："
                  :rules="[{ required: true, message: '请选择基准起止时间' }]"
                >
                  <a-range-picker
                    v-model:value="formState.referenceTime"
                    style="width: 100%"
                    :picker="(formState.dateType === 'hour' ? 'date' : formState.dateType)"
                    valueFormat="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="disabledDateReferenceTime"
                    :disabled="formState.benchmarkingMethod !== '3' || formState.analysisTime.length !== 2"
                    @calendarChange="changeReferenceTime"
                    :allowClear="false"
                    :show-time="formState.dateType === 'hour'"
                    @focus="focusRangePicker"
                    @openChange="openChange"
                    :open="openDate"
                  />
                </a-form-item>
              </a-col>
            </a-row>

          </a-form>
        </div>
        <div
          class="submit-button"
          @click="searchData"
        >
          <!-- <a-button type="primary" size="large">
            查询
          </a-button> -->
          <SearchOutlined style="color: #fff;font-size: 36px;" />
        </div>
      </div>

      <div class="project-statistics">
        <div
          class="statistics-item"
          v-for="(item,index) in statisticsList"
          :key="index"
        >
          <div class="statistics-title">
            {{ item.title }}
          </div>
          <div class="statistics-info">
            <div
              class="icon-box"
              :id="'icon' + (index + 1)"
            ></div>
            <div class="data-box">
              <div>{{ item.dataYiyle }}</div>
              <div>
                {{ item.value }}{{ item.unit }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="energy-consumption-chart"
        ref="energyConsumptionChartRef"
      >

      </div>

      <div class="table-box">
        <a-table
          :dataSource="dataSource"
          :columns="columns"
          bordered
          size="middle"
          :pagination="false"
          :scroll="{ y: '30vh' }"
        >
        </a-table>
      </div>
    </div>
  </a-modal>

</template>

<script setup lang="ts">
import { ref, nextTick, toRaw, onMounted } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { getProjectEvaluationApi,getProjectNameApi } from '../Standardized.api';
import * as echarts from 'echarts';

const props = defineProps({
  benchmarkOptions: {
    type: Array,
    default: [],
  },
});

const open = ref<boolean>(false);
const openDate = ref<boolean>(false);

const projectData = ref({
  projectName: '',
  pointName: '',
})

const formState = ref<any>({
  id: '',
  analysisTime: [],
  referenceTime: [],
  dateType: 'date',
  benchmarkingMethod: '1',
  increase: '',
  increaseContent: '',
});

const firstTime = ref<any>([]);

const dayDiff = ref<any>(null);

const options1 = ref([
  {
    value: '1',
    label: '同比对标',
  },
  {
    value: '2',
    label: '环比对标',
  },
  {
    value: '3',
    label: '基准自定义对标',
  },
]);

const options2 = ref([
  {
    value: 'hour',
    label: '小时',
  },
  {
    value: 'date',
    label: '日',
  },
  {
    value: 'month',
    label: '月',
  },
  {
    value: 'year',
    label: '年',
  },
]);

const statisticsList = ref([
  {
    title: '累计节约能耗',
    dataYiyle: '节约耗能',
    value: '286kWh',
    unit: 'kWh',
  },
  {
    title: '累计节约成本',
    dataYiyle: '节约成本',
    value: '286',
    unit: '元',
  },
  {
    title: '累计减碳',
    dataYiyle: '减少CO2碳排放',
    value: '286',
    unit: 'kg',
  },
]);

const dataSource = ref([
  // 后续行：实际数据行
  {
    key: '1',
    assessmentTime: '2024-01',
    energyAfter: 950,
    benchmarkTime: '2023-12',
    energyBefore: 1200,
    saving: 250,
  },
  {
    key: '2',
    assessmentTime: '2024-02',
    energyAfter: 890,
    benchmarkTime: '2023-11',
    energyBefore: 1150,
    saving: 260,
  },
  // 后续行：实际数据行
  {
    key: '1',
    assessmentTime: '2024-01',
    energyAfter: 950,
    benchmarkTime: '2023-12',
    energyBefore: 1200,
    saving: 250,
  },
  {
    key: '2',
    assessmentTime: '2024-02',
    energyAfter: 890,
    benchmarkTime: '2023-11',
    energyBefore: 1150,
    saving: 260,
  },
  // 后续行：实际数据行
  {
    key: '1',
    assessmentTime: '2024-01',
    energyAfter: 950,
    benchmarkTime: '2023-12',
    energyBefore: 1200,
    saving: 250,
  },
  {
    key: '2',
    assessmentTime: '2024-02',
    energyAfter: 890,
    benchmarkTime: '2023-11',
    energyBefore: 1150,
    saving: 260,
  },
  // 后续行：实际数据行
  {
    key: '1',
    assessmentTime: '2024-01',
    energyAfter: 950,
    benchmarkTime: '2023-12',
    energyBefore: 1200,
    saving: 250,
  },
  {
    key: '2',
    assessmentTime: '2024-02',
    energyAfter: 890,
    benchmarkTime: '2023-11',
    energyBefore: 1150,
    saving: 260,
  },
  // 后续行：实际数据行
  {
    key: '1',
    assessmentTime: '2024-01',
    energyAfter: 950,
    benchmarkTime: '2023-12',
    energyBefore: 1200,
    saving: 250,
  },
  {
    key: '2',
    assessmentTime: '2024-02',
    energyAfter: 890,
    benchmarkTime: '2023-11',
    energyBefore: 1150,
    saving: 260,
  },
  // 后续行：实际数据行
  {
    key: '1',
    assessmentTime: '2024-01',
    energyAfter: 950,
    benchmarkTime: '2023-12',
    energyBefore: 1200,
    saving: 250,
  },
  {
    key: '2',
    assessmentTime: '2024-02',
    energyAfter: 890,
    benchmarkTime: '2023-11',
    energyBefore: 1150,
    saving: 260,
  },
  // 后续行：实际数据行
  {
    key: '1',
    assessmentTime: '2024-01',
    energyAfter: 950,
    benchmarkTime: '2023-12',
    energyBefore: 1200,
    saving: 250,
  },
  {
    key: '2',
    assessmentTime: '2024-02',
    energyAfter: 890,
    benchmarkTime: '2023-11',
    energyBefore: 1150,
    saving: 260,
  },
]);

const columns = ref([
  {
    title: '照明定时群控项目能耗对标数据', // 这个表头将横跨后续列
    children: [
      // 使用 children 定义分组列
      {
        title: '评估时间', // 第二行表头内容
        dataIndex: 'evaluationTime',
        key: 'evaluationTime',
        align: 'center',
      },
      {
        title: '项目实施后能耗（KWh）',
        dataIndex: 'energyConsumption',
        key: 'energyConsumption',
        align: 'center',
      },
      {
        title: '对标时间',
        dataIndex: 'baseTime',
        key: 'baseTime',
        align: 'center',
      },
      {
        title: '项目实施前能耗（KWh）',
        dataIndex: 'baseEnergyConsumption',
        key: 'baseEnergyConsumption',
        align: 'center',
      },
      {
        title: '节能量（KWh）在线数据',
        dataIndex: 'energySavings',
        key: 'energySavings',
        align: 'center',
      },
    ],
  },
]);
const energyConsumptionChartRef = ref(null);
let myChart: any = null;

const millDiff = ref(0);

const showModal = async (record) => {
  console.log('showModal------------->', record.measurementTime);
  
  formState.value.id = record.pointId;
  open.value = true;
  setDefaultDate(record.measurementTime);
  await getProjectName(record.id)
  await getProjectEvaluation();
};

// 获取项目名称
const getProjectName = async(id) => {
  let res = await getProjectNameApi({
    id: id
  })
  projectData.value.pointName = res.pointName
  projectData.value.projectName = res.projectName
}

const setDefaultDate = (startTime) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // 设置开始日期时间为今年1月1日00:00:00
  let startDateInput = `${currentYear}-01-01`;
  let startHourSelect = '00';
  let startMinuteSelect = '00';
  let startSecondSelect = '00';

  // 设置结束日期时间为当前日期时间
  const formattedDate = formatDate(currentDate);
  const formattedTime = formatTime(currentDate);

  let endDateInput = formattedDate;
  let endHourSelect = formattedTime.hours;
  let endMinuteSelect = formattedTime.minutes;
  let endSecondSelect = formattedTime.seconds;
  formState.value.analysisTime = [
    startTime,
    endDateInput + ' ' + endHourSelect + ':' + endMinuteSelect + ':' + endSecondSelect,
  ];
  getBenchmarkingMethod(formState.value.analysisTime);
};

// 格式化为YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 格式化为时间部分
const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return { hours, minutes, seconds };
};

const getProjectEvaluation = async () => {
  let parmas = {
    pointId: formState.value.id,
    startTime: formState.value.analysisTime[0].split(' ')[1] !== '' ? formState.value.analysisTime[0] : formState.value.analysisTime[0] + '00:00:00',
    endTime: formState.value.analysisTime[1].split(' ')[1] !== '' ? formState.value.analysisTime[1] : formState.value.analysisTime[1] + '00:00:00',
    baseStartTime:
      formState.value.referenceTime[0].split(' ').length === 2 && formState.value.referenceTime[0].split(' ')[1] !== ''
        ? formState.value.referenceTime[0]
        : formState.value.referenceTime[0] + ' 00:00:00',
    baseEndTime:
      formState.value.referenceTime[1].split(' ').length === 2 && formState.value.referenceTime[1].split(' ')[1] !== ''
        ? formState.value.referenceTime[1]
        : formState.value.referenceTime[1] + ' 00:00:00',
    dateType: formState.value.dateType,
  };
  let res = await getProjectEvaluationApi(parmas);
  columns.value[0].children[1].title = '项目实施后能耗（' + res.energyUnit + '）';
  columns.value[0].children[3].title = '项目实施前能耗（' + res.energyUnit + '）';
  columns.value[0].children[4].title = '节能量（' + res.energyUnit + '）在线数据';
  statisticsList.value[0].value = res.energySavings;
  statisticsList.value[0].unit = res.energyUnit;
  statisticsList.value[1].value = res.saveCosts;
  if (!res.carbonReductionAmount && statisticsList.value.length === 3) {
    statisticsList.value.pop();
  } else {
    statisticsList.value[2].value = res.carbonReductionAmount;
  }

  timeData.value = res.energyCurve.xaxis;
  benchmarkData.value = res.energyCurve.chatSeriesList.find((item) => item.name === '对标基准').data[0];
  evaluationData.value = res.energyCurve.chatSeriesList.find((item) => item.name === '评估对象').data[0];

  dataSource.value = res.energyMarket;

  await nextTick();
  initChart();
};

// 搜索数据
const searchData = async () => {
  await getProjectEvaluation();
};

onMounted(() => {
  // initChart();
});

const focusRangePicker = () => {
  openDate.value = true;
};

const openChange = (value, data) => {
  if (value) {
    formState.value.referenceTime = [];
  }
};

// 获取选中的时间
const changeReferenceTime = (value, dateStrings, info) => {
  firstTime.value = value;
  if (info.range === 'start') {
    const startDate = value[0].split(' ')[0];
    const startTime = value[0].split(' ')[1];
    const startMill = dateToMilliseconds(
      startDate.split('-')[0],
      startDate.split('-')[1],
      startDate.split('-')[2],
      startTime.split(':')[0],
      startTime.split(':')[1],
      startTime.split(':')[2]
    );
    const date = millisecondsToDate(startMill + millDiff.value);
    formState.value.referenceTime = [value[0], date];
  } else if (info.range === 'end') {
    formState.value.referenceTime[0] = '';
    const endDate = value[1].split(' ')[0];
    const endTime = value[1].split(' ')[1];
    const endMill = dateToMilliseconds(
      endDate.split('-')[0],
      endDate.split('-')[1],
      endDate.split('-')[2],
      endTime.split(':')[0],
      endTime.split(':')[1],
      endTime.split(':')[2]
    );
    const date = millisecondsToDate(endMill - millDiff.value);
    formState.value.referenceTime = [date, value[1]];
  }
  setTimeout(() => {
    openDate.value = false;
  }, 100);
};

// 选择评估时间
const handleAnalysisTimeChange = (dates) => {
  if (formState.value.benchmarkingMethod === '1') {
    // 同比对标方式
    yearOnYearTime(dates);
  } else if (formState.value.benchmarkingMethod === '2') {
    // 环比对标方式
    monthOnMonthTime(dates);
  } else {
    // 自由基准方式
    if (dates && dates.length === 2) {
      // 计算选择的天数差
      getMillDIff(dates);
    } else {
      dayDiff.value = null;
    }
  }
};

// 同比时间处理
const yearOnYearTime = (dates) => {
  const startArr = dates[0].split(' ')[0].split('-');
  const endArr = dates[1].split(' ')[0].split('-');
  let startStr = dates[0].split(' ')[0].split('-')[0];
  let endStr = dates[1].split(' ')[0].split('-')[0];
  startArr[0] = startStr - 1;
  endArr[0] = endStr - 1;

  formState.value.referenceTime = [startArr.join('-') + ' ' + dates[0].split(' ')[1], endArr.join('-') + ' ' + dates[1].split(' ')[1]];
};

// 环比时间处理
const monthOnMonthTime = (dates) => {
  const startDate = dates[0].split(' ')[0];
  const startTime = dates[0].split(' ')[1];
  const endDate = dates[1].split(' ')[0];
  const endTime = dates[1].split(' ')[1];
  const startMill = dateToMilliseconds(
    startDate.split('-')[0],
    startDate.split('-')[1],
    startDate.split('-')[2],
    startTime.split(':')[0],
    startTime.split(':')[1],
    startTime.split(':')[2]
  );
  const endMill = dateToMilliseconds(
    endDate.split('-')[0],
    endDate.split('-')[1],
    endDate.split('-')[2],
    endTime.split(':')[0],
    endTime.split(':')[1],
    endTime.split(':')[2]
  );

  const millDiff = endMill - startMill;

  millisecondsToDate(startMill - millDiff);
  millisecondsToDate(endMill - millDiff);
  formState.value.referenceTime = [millisecondsToDate(startMill - millDiff), millisecondsToDate(endMill - millDiff)];
  return;
};

// 获取毫秒数差
const getMillDIff = (dates) => {
  const startDate = dates[0].split(' ')[0];
  const startTime = dates[0].split(' ')[1];
  const endDate = dates[1].split(' ')[0];
  const endTime = dates[1].split(' ')[1];
  const startMill = dateToMilliseconds(
    startDate.split('-')[0],
    startDate.split('-')[1],
    startDate.split('-')[2],
    startTime.split(':')[0],
    startTime.split(':')[1],
    startTime.split(':')[2]
  );
  const endMill = dateToMilliseconds(
    endDate.split('-')[0],
    endDate.split('-')[1],
    endDate.split('-')[2],
    endTime.split(':')[0],
    endTime.split(':')[1],
    endTime.split(':')[2]
  );
  millDiff.value = endMill - startMill;
};

// 时间转换为毫秒数
const dateToMilliseconds = (year, month, day, hour, minute, second) => {
  // 注意：JavaScript中月份是从0开始的（0=1月，1=2月...11=12月）
  const date = new Date(year, month, day, hour, minute, second);
  return date.getTime();
};

// 毫秒数转换为日期时间
const millisecondsToDate = (milliseconds) => {
  const date = new Date(milliseconds);
  // 格式化日期时间
  let year = date.getFullYear();
  let month = String(date.getMonth()).padStart(2, '0'); // 月份+1并补零
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  if(month==='00') {
    month = '12'
    year = year - 1
  }
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 补全日期格式
const getBenchmarkingMethod = (dates) => {
  let startArr = dates[0].split('-');
  let startStr = dates[0].split('-')[0] - 1;
  let endArr = dates[1].split('-');
  let endStr = dates[1].split('-')[0] - 1;
  startArr[0] = startStr;
  endArr[0] = endStr;
  formState.value.referenceTime = [startArr.join('-'), endArr.join('-')];
};

/**
 * 同比：跟上一年的同一时间比
 * 环比：往前推相同的时间跨度
 *
 * **/

const disabledDateReferenceTime = (current) => {
  if (!dayDiff.value) return false;
  // 获取第二个选择器当前已选日期
  const selectedDates = firstTime.value;
  if (selectedDates.length === 0) {
    // 如果还没选任何日期，不禁用
    return false;
  } else if (selectedDates[0] || selectedDates[1]) {
    // 如果已选一个日期，禁用不符合天数差的日期
    let startDate = '';
    let endDate = '';
    const currentNumber = msToDays(new Date(current).getTime());
    if (selectedDates[0]) {
      startDate = selectedDates[0];
      const startNumber = msToDays(new Date(startDate).getTime());
      return currentNumber < startNumber ? startNumber - currentNumber >= dayDiff.value : currentNumber - startNumber >= dayDiff.value;
    } else {
      endDate = selectedDates[1];
      const endNumber = msToDays(new Date(endDate).getTime());
      return currentNumber < endNumber ? endNumber - currentNumber >= dayDiff.value : currentNumber - endNumber >= dayDiff.value;
    }
  }
  return false;
};

// 将毫秒数转换为天数
const msToDays = (ms) => {
  return ms / (1000 * 60 * 60 * 24);
};

// 选择异常基准
const handleIncreaseContent = (value) => {
  if (formState.value.analysisTime.length === 2) {
    handleAnalysisTimeChange(formState.value.analysisTime);
  }
  if (value === '3') {
    formState.value.referenceTime = [];
  }
  // const targetItem: any = props.benchmarkOptions.find((item: any) => item.id === value);
  // formState.value.increase = targetItem.value;
  // formState.value.increaseContent = targetItem.content;
};

const timeData = ref([
  '2024-01-01',
  '2024-01-02',
  '2024-01-03',
  '2024-01-04',
  '2024-01-05',
  '2024-01-06',
  '2024-01-07',
  '2024-01-08',
  '2024-01-09',
  '2024-01-10',
  '2024-01-11',
  '2024-01-12',
  '2024-01-13',
  '2024-01-14',
  '2024-01-15',
  '2024-01-16',
  '2024-01-17',
  '2024-01-18',
  '2024-01-19',
  '2024-01-20',
  '2024-01-21',
  '2024-01-22',
  '2024-01-23',
  '2024-01-24',
  '2024-01-25',
  '2024-01-26',
  '2024-01-27',
  '2024-01-28',
  '2024-01-29',
  '2024-01-30',
  '2024-01-31',
]);

const benchmarkData = ref([
  125, 130, 118, 135, 142, 138, 145, 132, 128, 140, 136, 142, 139, 145, 148, 135, 130, 142, 138, 145, 140, 135, 148, 142, 138, 145, 150, 142, 138,
  135, 140,
]);

const evaluationData = ref([
  118, 125, 112, 128, 135, 130, 138, 125, 120, 132, 128, 135, 130, 138, 142, 128, 122, 135, 130, 138, 132, 128, 140, 135, 130, 138, 145, 135, 130,
  128, 132,
]);
const initChart = () => {
  // 初始化图表
  myChart = echarts.init(energyConsumptionChartRef.value);

  // 配置项
  const option = {
    title: {
      text: '能耗对比分析',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params) {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((param) => {
          result += `${param.seriesName}: ${param.value} kWh<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ['对标基准', '评估对象'],
      bottom: 20,
      left: 'center',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: timeData.value,
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        rotate: 45,
        formatter: function (value) {
          // 只显示日期中的天
          return value.split('-')[2];
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '能耗 (kWh)',
      nameLocation: 'end',
      nameGap: 20,
      nameTextStyle: {
        align: 'right',
      },
      axisLine: {
        show: true,
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: '对标基准',
        type: 'line',
        data: benchmarkData.value,
        // smooth: true,
        lineStyle: {
          width: 3,
          color: '#5470c6',
        },
        itemStyle: {
          color: '#5470c6',
        },
        symbol: 'circle',
        symbolSize: 6,
        // areaStyle: {
        //   color: {
        //     type: 'linear',
        //     x: 0,
        //     y: 0,
        //     x2: 0,
        //     y2: 1,
        //     colorStops: [
        //       {
        //         offset: 0,
        //         color: 'rgba(84, 112, 198, 0.3)',
        //       },
        //       {
        //         offset: 1,
        //         color: 'rgba(84, 112, 198, 0.1)',
        //       },
        //     ],
        //   },
        // },
      },
      {
        name: '评估对象',
        type: 'line',
        data: evaluationData.value,
        // smooth: true,
        lineStyle: {
          width: 3,
          color: '#91cc75',
        },
        itemStyle: {
          color: '#91cc75',
        },
        symbol: 'circle',
        symbolSize: 6,
        // areaStyle: {
        //   color: {
        //     type: 'linear',
        //     x: 0,
        //     y: 0,
        //     x2: 0,
        //     y2: 1,
        //     colorStops: [
        //       {
        //         offset: 0,
        //         color: 'rgba(145, 204, 117, 0.3)',
        //       },
        //       {
        //         offset: 1,
        //         color: 'rgba(145, 204, 117, 0.1)',
        //       },
        //     ],
        //   },
        // },
      },
    ],
    // dataZoom: [
    //   {
    //     type: 'inside',
    //     start: 0,
    //     end: 100,
    //   },
    //   {
    //     type: 'slider',
    //     start: 0,
    //     end: 100,
    //     bottom: 10,
    //   },
    // ],
  };

  myChart.setOption(option);

  // 响应式调整
  window.addEventListener('resize', handleResize);
};

const handleResize = () => {
  if (myChart) {
    myChart.resize();
  }
};

const closeModal = () => {
  if (myChart) {
    myChart.dispose();
    window.removeEventListener('resize', handleResize);
  }
  openDate.value = false
};

defineExpose({
  showModal,
});
</script>

<style lang="less" scoped>
.project-mvaluation-modal {
  height: 70vh;
  width: 60vw;
  padding: 0 16px;
  overflow: auto;
  padding: 12px 48px;

  .base-info {
    height: 80px;
    width: 100%;

    > div {
      height: 40px;
      width: 100%;
      font-size: 18px;
    }
  }

  .form-box {
    width: 100%;
    height: 94px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .form-item-box {
      flex: 1;
      height: 100%;
    }

    .submit-button {
      height: 60px;
      width: 60px;
      background-color: #8080ff;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        cursor: pointer;
        background-color: #8080ffb7;
      }
    }
  }

  .project-statistics {
    margin-top: 24px;
    height: 200px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .statistics-item {
      height: 100%;
      width: 25%;
      box-shadow: 5px 5px 5px 5px #888888;

      .statistics-title {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        // font-weight: 600;
        height: 50px;
        color: #fff;
        background-color: #70b503;
      }
      .statistics-info {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 150px;
        width: 100%;
        padding: 16px;

        .icon-box {
          height: 80px;
          width: 80px;
          border-radius: 80px;
          background-image: url('@/assets/images/consumptionIcon.png');
          background-size: 100% 100%;
          margin-right: 4%;
        }
        #icon2 {
          background-image: url('@/assets/images/costIcon.png');
        }
        #icon3 {
          background-image: url('@/assets/images/carbonIcon.png');
        }
        .data-box {
          display: flex;
          align-content: center;
          flex-wrap: wrap;
          align-items: center;
          width: 60%;
          height: 100%;

          > div {
            width: 100%;
            color: #000;
            font-size: 18px;
          }
        }
      }
    }
  }

  .energy-consumption-chart {
    height: 40vh;
    width: 100%;
    margin-top: 24px;
  }

  .table-box {
    height: 40vh;
    width: 100%;
  }
}
</style>