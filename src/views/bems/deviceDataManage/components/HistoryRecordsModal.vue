<template>
  <a-modal
    v-model:visible="open"
    title="历史数据"
    width="600px"
    :footer="null"
    destroyOnClose
  >
    <div style="padding: 12px;">
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
  startTime: '',
  endTime: '',
});

const openModal = async (params) => {
  searchForm.value.deviceId = params.deviceId;
  searchForm.value.startTime = params.startTime;
  searchForm.value.endTime = params.endTime;
  await getData();
  open.value = true;
};

const getData = async () => {
  try {
    const params = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
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