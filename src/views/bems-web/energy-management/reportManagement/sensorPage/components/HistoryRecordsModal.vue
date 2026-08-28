<template>
  <a-modal v-model:visible="open" title="历史数据" width="1000px" :footer="null" destroyOnClose>
    <div style="padding: 12px;">
      <a-tabs v-model:activeKey="activeKey" @change="handleTabsChange">
        <a-tab-pane v-for="(item, index) in deviceAttributeArr" :key="item.id" :tab="item.attributeName"></a-tab-pane>
      </a-tabs>
      <div style="width: 100%;margin-bottom: 6px;">
        <a-form :model="formState" layout="inline" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-form-item name="time" label="起止时间">
            <a-range-picker v-model:value="formState.time" show-time format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="searchData">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="radio-box">
        <a-radio-group v-model:value="chartType" @change="changeChartType">
          <a-radio-button value="table">
            <InsertRowAboveOutlined style="font-size: 18px;" />
          </a-radio-button>
          <a-radio-button value="line">
            <LineChartOutlined style="font-size: 18px;" />
          </a-radio-button>
          <a-radio-button value="bar">
            <BarChartOutlined style="font-size: 18px;" />
          </a-radio-button>
        </a-radio-group>
      </div>
      <div v-show="isChart" id="chart">

      </div>
      <a-table v-show="!isChart" :columns="columns" :data-source="dataSource" small="small" :pagination="false"
        @change="handleChange" :scroll="{ y: 500 }" bordered>
        <template #index="{ text, record, index }">
          {{ index + 1 }}
        </template>

      </a-table>

    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue';
import * as echarts from 'echarts';
import { InsertRowAboveOutlined, LineChartOutlined, BarChartOutlined } from '@ant-design/icons-vue';
import { getHistoryDataApi, getDeviceAttributeByDeviceIdApi } from '../index.api';

const open = ref(false);
const isChart = ref(false);

const activeKey = ref('1')

const formState = ref<any>({
  time: [],
})

const chartInstance = ref()
const chartType = ref('table')

const deviceAttributeArr = ref<any[]>([])

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0,
});

const columns = [
  {
    title: '序号',
    dataIndex: 'idex',
    key: 'idex',
    slots: { customRender: 'index' },
    width: '80px',
    align: 'center',
  },
  {
    title: '采集时间',
    dataIndex: 'collectionTime',
    key: 'collectionTime',
    align: 'center',
  },
  {
    title: '采集值',
    dataIndex: 'value',
    key: 'value',
    align: 'center',
  },
];

const dataSource = ref([]);

const searchForm = ref({
  deviceId: '',
  startTime: '',
  endTime: '',
});

const openModal = async (params) => {
  formState.value.time = [formatTime(new Date().getTime() - 24 * 60 * 60 * 1000), formatTime(new Date().getTime())]
  searchForm.value.deviceId = params.deviceId;
  searchForm.value.startTime = params.startTime;
  searchForm.value.endTime = params.endTime;
  await getDeviceAttributeByDeviceId()
  open.value = true;
};

// 毫秒数转换为日期
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const searchData = async () => {
  // chartType.value = 'table'
  // isChart.value = false
  await getData()
}

const getData = async () => {
  try {
    const params = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      deviceAttributeId: activeKey.value,
      startTime: formState.value.time.length ? formState.value.time[0] : undefined,
      endTime: formState.value.time.length ? formState.value.time[1] : undefined,
    };

    const res = await getHistoryDataApi(params);
    dataSource.value = res.reverse();
    if(chartType.value !== 'table') initEchart(dataSource.value)
    // pagination.total = res.total;
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

const getDeviceAttributeByDeviceId = async () => {
  let res = await getDeviceAttributeByDeviceIdApi({
    deviceId: searchForm.value.deviceId
  })
  deviceAttributeArr.value = [...res]
  activeKey.value = deviceAttributeArr.value[0].id
  await getData()
}

const handleChange = (page) => {
  pagination.pageNo = page.current;
  pagination.pageSize = page.pageSize;
  getData();
};

const handleTabsChange = async (key) => {
  chartType.value = 'table'
  await getData()
}

const initEchart = async (chartData) => {
  // if (!chartData.length) return
  await nextTick(() => {
    const chartDom = document.getElementById('chart');
    if (chartDom) {
      chartInstance.value = echarts.init(chartDom);
    }
    const option: any = {
      xAxis: {
        type: 'category',
        data: [],
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}：{c}',
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
    option.xAxis.data = []
    option.series[0].data = []
    chartData.forEach((item: any) => {
      option.xAxis.data.push(item.collectionTime);
      option.series[0].data.push(item.value);
    });
    chartInstance.value.setOption(option);
  })

}

const changeChartType = (val) => {

  if (chartType.value === 'table') {
    isChart.value = false
  } else {
    // chartType.value = val
    initEchart(dataSource.value)
    isChart.value = true
  }
}

defineExpose({
  openModal,
});
</script>

<style lang="less" scoped>
.radio-box {
  height: 40px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

#chart {
  height: 500px;
  width: 100%;
}
</style>