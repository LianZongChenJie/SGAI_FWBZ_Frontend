<template>
  <div class="operation-monitoring-table-main-box">
    <div class="table-title">
      <div class="icon-box"></div>
      <span>配电室运行监测</span>
    </div>
    <div class="table-box">
      <a-table
        :columns="columns"
        :data-source="data"
        :pagination="pagination"
        @change="handleTableChange"
        size="middle"
      >
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const columns = [
  {
    title: '配电室',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '总有功电量(kWh)',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '总有功功率(W)',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: '负载率 (%)',
    dataIndex: 'tags',
    key: 'tags',
  },
  {
    title: '功率因数',
    dataIndex: 'test1',
    key: 'test1',
  },
  {
    title: '频率(Hz)',
    dataIndex: 'test2',
    key: 'test2',
  },
];

const data = [
  {
    key: '1',
    name: '戏剧院1#配电室',
    age: 5277.2,
    address: '3000000',
    tags: 50,
    test1: 0.96,
    test2: 50.1,
  },
  {
    key: '2',
    name: '歌剧院2#配电室',
    age: 8366.18,
    address: '4000000',
    tags: 55,
    test1: 0.97,
    test2: 50.2,
  },
  {
    key: '3',
    name: '音乐厅3#配电室',
    age: 7639.27,
    address: '3500000',
    tags: 60,
    test1: 0.95,
    test2: 50.0,
  },
];

const pagination = computed(() => ({
  total: 3,
  current: 1,
  pageSize: 3,
}));

const handleTableChange = (pag,filter,sorter) => {
  console.log('handleTableChange--------------->', pag,filter,sorter);
}
</script>

<style scoped lang="less">
.operation-monitoring-table-main-box {
  height: 100%;
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  padding: 0 24px;
  .table-title {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 40px;
    .icon-box {
      height: 20px;
      border-left: 5px solid #8080ff;
      margin-right: 10px;
    }
    > span {
      font-size: 18px;
      color: #506f8e;
      font-weight: 600;
    }
  }
  .table-box {
    height: calc(100% - 40px);
    margin-top: 10px;
  }
}
</style>