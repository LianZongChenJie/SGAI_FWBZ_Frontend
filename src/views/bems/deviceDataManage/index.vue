<template>
  <div>
    <!-- 查询条件表单 -->
    <a-form layout="inline" @submit="handleSearch" :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }">
      <a-form-item label="设备名称">
        <a-input v-model:value="searchParams.deviceName" placeholder="请输入设备名称" allow-clear style="width: 200px" />
      </a-form-item>
      <a-form-item label="设备编号">
        <a-input v-model:value="searchParams.deviceCode" placeholder="请输入设备编号" allow-clear style="width: 200px" />
      </a-form-item>
      <a-form-item label="设备类别">
        <a-tree-select
          v-model:value="searchParams.category"
          :tree-data="categoryTreeData"
          placeholder="请选择设备类别"
          :fieldNames="treeSelect"
          show-search
          allowClear
          style="width: 200px"
        />
      </a-form-item>
      <a-form-item label="空间位置">
        <a-tree-select
          v-model:value="searchParams.space"
          :tree-data="spaceTreeData"
          placeholder="请选择空间位置"
          :fieldNames="treeSelect"
          show-search
          allowClear
          style="width: 200px"
        />
      </a-form-item>
      <!-- 新增起始时间查询条件 -->
      <a-form-item label="起始时间">
        <a-date-picker v-model:value="searchParams.startTime" placeholder="请选择起始时间" valueFormat="YYYY-MM-DD" style="width: 200px" />
      </a-form-item>
      <!-- 新增结束时间查询条件 -->
      <a-form-item label="结束时间">
        <a-date-picker v-model:value="searchParams.endTime" placeholder="请选择结束时间" valueFormat="YYYY-MM-DD" style="width: 200px" />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button @click="resetSearch">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <!-- 表格 -->
    <a-table :columns="columns" :data-source="dataSource" :pagination="pagination">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button :icon="h(BarChartOutlined)" @click="handleChart(record)" />
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, h } from 'vue';
  import { Table, Form, Input, TreeSelect, Button, DatePicker } from 'ant-design-vue';
  import { BarChartOutlined } from '@ant-design/icons-vue';
  import { getCategoryTree, getSpaceTree } from './index.api';

  // 定义表格列
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      customRender: ({ index }) => index + 1, // 显示序号，从 1 开始
    },
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: '计量单位',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: '起始值',
      dataIndex: 'startValue',
      key: 'startValue',
    },
    {
      title: '结束值',
      dataIndex: 'endValue',
      key: 'endValue',
    },
    {
      title: '计算值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '操作',
      key: 'action',
    },
  ];

  // 定义表格数据
  const dataSource = ref([
    {
      key: '1',
      deviceCode: 'D001',
      deviceName: '设备1',
      unit: '个',
      startValue: 0,
      endValue: 100,
      value: 50,
    },
    {
      key: '2',
      deviceCode: 'D002',
      deviceName: '设备2',
      unit: '米',
      startValue: 10,
      endValue: 20,
      value: 15,
    },
    // 可以添加更多数据
  ]);

  const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

  // 查询参数
  const searchParams = ref({
    deviceName: '',
    deviceCode: '',
    category: null,
    space: null,
    // 新增起始时间和结束时间参数
    startTime: null,
    endTime: null,
  });

  // 设备类别和空间位置的下拉树数据
  const categoryTreeData = ref([]);
  const spaceTreeData = ref([]);

  // 处理查询
  const handleSearch = () => {
    // 这里可以添加实际的查询逻辑，根据 searchParams 过滤 dataSource
    console.log('查询参数:', searchParams.value);
  };

  const handleChart = () => {
    // 这里可以添加实际的图表逻辑
    console.log('显示图表');
  };

  // 重置查询
  const resetSearch = () => {
    searchParams.value = {
      deviceName: '',
      deviceCode: '',
      category: null,
      space: null,
      // 重置起始时间和结束时间
      startTime: null,
      endTime: null,
    };
  };

  // 分页配置
  const pagination = ref({
    current: 1, // 当前页码，初始为第 1 页
    pageSize: 10, // 每页显示的记录数
    total: dataSource.value.length, // 数据总条数
    showTotal: (total: number) => `共 ${total} 条记录`, // 显示总记录数
    onChange: (page: number, pageSize: number) => {
      // 当页码或每页记录数改变时的回调函数
      // 这里可以添加实际的分页查询逻辑
      console.log(`当前页码: ${page}, 每页记录数: ${pageSize}`);
    },
  });

  // 组件挂载时获取数据
  onMounted(async () => {
    try {
      const categoryRes = await getCategoryTree();
      categoryTreeData.value = categoryRes;

      const spaceRes = await getSpaceTree();
      spaceTreeData.value = spaceRes;
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  });
</script>

<style scoped>
  /* 可以添加自定义样式 */
</style>
