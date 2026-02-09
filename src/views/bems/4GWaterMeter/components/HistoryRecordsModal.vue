<template>
  <a-modal
    v-model:visible="open"
    title="历史数据"
    width="1000px"
    :footer="null"
    destroyOnClose
  >
    <div style="padding: 12px;">
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
      <a-table
        :columns="columns"
        :data-source="dataSource"
        small="small"
        :pagination="pagination"
        @change="handleChange"
        :scroll="{ y: 400 }"
        bordered
      >
        <template #index="{ text, record, index }">
          {{ index + 1 }}
        </template>

      </a-table>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { getHistoryDataApi } from '../index.api';

const open = ref(false);

const formState = ref<any>({
  time: [],
})

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
    dataIndex: 'time',
    key: 'time',
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
  // startTime: '',
  // endTime: '',
});

const openModal = async (params) => {
  formState.value.time = [formatTime(new Date().getTime() - 24 * 60 * 60 * 1000), formatTime(new Date().getTime())]
  searchForm.value.deviceId = params.deviceId;
  // searchForm.value.startTime = params.startTime;
  // searchForm.value.endTime = params.endTime;
  await getData();
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
  await getData()
}

const getData = async () => {
  try {
    const params = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      startTime: formState.value.time.length ? formState.value.time[0] : undefined,
      endTime: formState.value.time.length ? formState.value.time[1] : undefined,
      ...searchForm.value,
    };
    const res = await getHistoryDataApi(params);
    dataSource.value = res.records;
    pagination.total = res.total;
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

const handleChange = (page) => {
  pagination.pageNo = page.current;
  pagination.pageSize = page.pageSize;
  getData();
};

defineExpose({
  openModal,
});
</script>

<style scoped>
</style>