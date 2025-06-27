<template>
  <div class="right-data-component">
    <div class="exception-prompt">
      <div class="title">
        耗能异常提示
      </div>
      <div class="info-box">
        <!-- <p>总能耗</p> -->
        <p
          v-for="(item,index) in exceptionPrompt"
          :key="index"
        >{{ index + 1 }}.{{ item }}</p>
      </div>
      <div class="info-box">
        <!-- <p>暖通用电</p> -->
      </div>
    </div>
    <div class="content-settings">
      <a-tabs
        v-model:activeKey="activeKey"
        :centered="true"
      >
        <a-tab-pane
          key="1"
          tab="年分析"
        ></a-tab-pane>
        <a-tab-pane
          key="2"
          tab="月分析"
          force-render
        ></a-tab-pane>
        <a-tab-pane
          key="3"
          tab="日分析"
        ></a-tab-pane>
      </a-tabs>
      <div>
        <a-form
          layout="vertical"
          :model="formState"
          ref="formRef"
        >
          <a-form-item name="analysisTime" label="分析起止时间：" :rules="[{ required: true, message: '请选择分析起止时间' }]">
            <a-range-picker
              v-model:value="formState.analysisTime"
              style="width: 100%"
              :picker="(activeKey === '1' ? 'year' : (activeKey === '2' ? 'month' : 'date'))"
              valueFormat="YYYY-MM-DD"
              @change="handleAnalysisTimeChange"
              :allowClear="false"
            />
          </a-form-item>
          <a-form-item name="compare" label="对比基准类型：" :rules="[{ required: true, message: '请选择对比基准类型' }]">
            <a-select
              v-model:value="formState.compare"
              style="width: 100%"
              :options="options2"
            ></a-select>
          </a-form-item>
          <a-form-item name="referenceTime" label="基准起止时间：" :rules="[{ required: true, message: '请选择基准起止时间' }]">
            <a-range-picker
              v-model:value="formState.referenceTime"
              style="width: 100%"
              :picker="(activeKey === '1' ? 'year' : (activeKey === '2' ? 'month' : ''))"
              valueFormat="YYYY-MM-DD"
              :disabled="(formState.compare === '自定义时间区段' && formState.analysisTime.length) ? false : true"
              :disabled-date="disabledDateReferenceTime"
              @calendarChange="changeReferenceTime"
              :allowClear="false"
            />
          </a-form-item>
          <a-form-item name="abnormal" label="较基准异常条件配置：" :rules="[{ required: true, message: '请选择较基准异常条件配置' }]">
            <a-select
              v-model:value="formState.abnormal"
              style="width: 100%"
              :options="props.benchmarkOptions"
              :fieldNames="fieldNames"
              @change="handleIncreaseContent"
              :disabled="formState.compare === '自定义时间区段' ? false : true"
            ></a-select>
          </a-form-item>
        </a-form>
        <div class="button-box">
          <a-button @click="onSubmit">分析查询</a-button>
        </div>
      </div>
      <div class="note-box">
        <p>备注:</p>
        <p>1.年分析时，时间框可以选择到年份；
          例如2010至2022</p>
        <p>2.月分析时，时间框可以选择到月份：
          例如2021-1至2021-6</p>
        <p>1.日分析时，时间框可以选择到日：
          例如2021-1-1至2021-6-30</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';
import { getBarChartDataApi } from '../Standardized.api';
import { message } from 'ant-design-vue';
import type { UnwrapRef } from 'vue';

const props = defineProps({
  benchmarkOptions: {
    type: Array,
    default: [],
  },
  searchChartData: {
    type: Function,
    default: () => {}
  },
  point: {
    type: Number,
    default: 5
  }
});

const activeKey = ref('1');

const formRef = ref()
const exceptionPrompt = ref([]);

const formState = ref({
  analysisTime: [],
  referenceTime: [],
  compare: '自定义时间区段',
  abnormal: '',
  increase: '',
  increaseContent: '',
  dateType: '',
});

const firstTime = ref<any>([]);

const dayDiff = ref<any>(null);

const fieldNames = {
  label: 'label',
  value: 'id',
};

const options2 = ref([
  {
    value: '额定能耗',
    label: '额定能耗',
  },
  {
    value: '自定义时间区段',
    label: '自定义时间区段',
  },
]);

// 获取选中的时间
const changeReferenceTime = (value) => {
  firstTime.value = value;
};

let timeout: any = null;

// 获取异常提示信息
const getExceptionPromptData = async () => {
  let params = {
    pointId: props.point ? props.point : 5,
    dateType: formState.value.dateType ? formState.value.dateType : 'day',
    baseStartDate: formState.value.referenceTime[0] ? formState.value.referenceTime[0] : '2025-03-11',
    baseEndDate: formState.value.referenceTime[0] ? formState.value.referenceTime[1] : '2025-03-15',
    startDate: formState.value.analysisTime[0] ? formState.value.analysisTime[0] : '2025-04-11',
    endDate: formState.value.analysisTime[0] ? formState.value.analysisTime[1] : '2025-04-15',
    increase: formState.value.increase ? formState.value.increase : '0.1',
    increaseContent:formState.value.increaseContent ? formState.value.increase : '{0}较基准超过10%',
  };
  let res = await getBarChartDataApi(params);
  exceptionPrompt.value = res.errorMessage;
};

// 将 YYYY-MM-DD 字符串转换为 Date 对象
const parseDate = (dateStr) => {
  const parts = dateStr.split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

// 计算两个日期之间的天数差
const calculateDayDiff = (dateStr1, dateStr2) => {
  const date1 = parseDate(dateStr1);
  const date2 = parseDate(dateStr2);
  const timeDiff = date2.getTime() - date1.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
};

const handleAnalysisTimeChange = (dates) => {
  if (dates && dates.length === 2) {
    // 计算选择的天数差
    dayDiff.value = calculateDayDiff(dates[0], dates[1]);
  } else {
    dayDiff.value = null;
  }
};

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
      const currentNumber = msToDays(new Date(current).getTime())
      if (selectedDates[0]) {
        startDate = selectedDates[0];
        const startNumber = msToDays(new Date(startDate).getTime());
        return (currentNumber < startNumber) ? (startNumber - currentNumber >= dayDiff.value) : (currentNumber - startNumber >= dayDiff.value)
      } else {
        endDate = selectedDates[1];
        const endNumber = msToDays(new Date(endDate).getTime());
        return (currentNumber < endNumber) ? (endNumber - currentNumber >= dayDiff.value) : (currentNumber - endNumber >= dayDiff.value)
      }
    }
    return false;
};

// 选择异常基准
const handleIncreaseContent = (value) => {
  const targetItem: any = props.benchmarkOptions.find((item: any) => item.id === value);
  formState.value.increase = targetItem.value;
  formState.value.increaseContent = targetItem.content;
};

// 提交查询
const onSubmit = () => {
  formRef.value
    .validate()
    .then(async () => {
      if(activeKey.value === '1') {
        formState.value.dateType = 'year'
      } else if(activeKey.value === '2') {
        formState.value.dateType = 'month'
      } else {
        formState.value.dateType = 'day'
      }
      props.searchChartData(formState.value)
    }).catch((error) => {
      console.log('error', error);
    });
};

// 将毫秒数转换为天数
const msToDays = (ms) => {
  return ms / (1000 * 60 * 60 * 24);
}

onMounted(async () => {
  await getExceptionPromptData();
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>

<style scoped lang="less">
.right-data-component {
  height: 100%;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;

  .exception-prompt {
    width: 100%;
    height: 32%;
    background-color: #fff;
    padding: 0 20px;
    .title {
      height: 40px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: #000;
      line-height: 40px;
    }
    .info-box {
      p {
        font-size: 16px;
        color: #5c5b5b;
      }
    }
  }

  .content-settings {
    width: 100%;
    height: 65%;
    background-color: #fff;
    padding: 0 20px;
    .button-box {
      text-align: center;
    }
    .note-box {
      margin-top: 40px;
      font-size: 14px;
    }
  }
}
</style>