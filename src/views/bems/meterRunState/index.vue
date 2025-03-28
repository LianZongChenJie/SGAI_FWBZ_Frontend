<template>
  <div class="jeecg-basic-table jeecg-basic-table-form-container">
    <a-form layout="inline" :model="queryParams" :labelCol="{ span: 6 }" :wrapperCol="{ span: 18 }">
      <a-form-item label="设备编号">
        <a-input v-model:value="queryParams.deviceCode" placeholder="请输入设备编号" allow-clear />
      </a-form-item>
      <a-form-item label="设备名称">
        <a-input v-model:value="queryParams.deviceName" placeholder="请输入设备名称" allow-clear />
      </a-form-item>
      <a-form-item label="设备类别">
        <a-tree-select
          v-model:value="queryParams.categoryId"
          :tree-data="categoryTreeData"
          placeholder="请选择设备类别"
          allow-clear
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          style="width: 200px"
          :field-names="{
            children: 'children',
            label: 'title',
            value: 'key',
            key: 'key',
          }"
        />
      </a-form-item>
      <a-form-item label="空间位置">
        <a-tree-select
          v-model:value="queryParams.spaceId"
          :tree-data="spaceTreeData"
          placeholder="请选择空间位置"
          allow-clear
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          style="width: 200px"
          :field-names="{
            children: 'children',
            label: 'title',
            value: 'key',
            key: 'key',
          }"
        />
      </a-form-item>
      <a-form-item label="仪表状态">
        <a-select v-model:value="queryParams.runState" placeholder="请选择仪表状态" style="width: 200px" allow-clear>
          <a-select-option value="在线">在线</a-select-option>
          <a-select-option value="离线">离线</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="handleQuery">查询</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>

    <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" @change="handleTableChange" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { list, categoryTree, spaceTree } from './index.api';

  // 定义表格列
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 80,
      align: 'center',
      customRender: ({ index }) => {
        return (pagination.value.current - 1) * pagination.value.pageSize + index + 1;
      },
    },
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      width: 120,
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 150,
    },
    {
      title: '设备类别',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 120,
      customRender: ({ text }) => {
        const findNode = (nodes) => {
          for (const node of nodes) {
            if (node.key == String(text)) return node.value;
            if (node.children?.length) {
              const value = findNode(node.children);
              if (value) return value;
            }
          }
          return null;
        };
        return findNode(categoryTreeData.value) || text;
      },
    },
    {
      title: '设备位置',
      dataIndex: 'spaceId',
      key: 'spaceId',
      width: 150,
      customRender: ({ text }) => {
        const findNode = (nodes) => {
          for (const node of nodes) {
            if (node.key == String(text)) return node.value;
            if (node.children?.length) {
              const value = findNode(node.children);
              if (value) return value;
            }
          }
          return null;
        };
        return findNode(spaceTreeData.value) || text;
      },
    },
    {
      title: '仪表状态',
      dataIndex: 'runState',
      key: 'runState',
      width: 100,
    },
  ];

  // 表格数据
  const dataSource = ref([]);

  // 分页配置
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
    showSizeChanger: true,
    showQuickJumper: true,
  });

  // 查询参数
  const queryParams = ref({
    deviceCode: '',
    deviceName: '',
    categoryId: undefined,
    spaceId: undefined,
    runState: undefined,
  });

  // 加载表格数据
  const loadData = async (params = {}) => {
    const res = await list({
      ...queryParams.value,
      pageNo: params.current || pagination.value.current,
      pageSize: params.pageSize || pagination.value.pageSize,
    });
    dataSource.value = res.records || [];
    pagination.value.total = res.total || 0;
  };

  // 查询按钮事件
  const handleQuery = () => {
    pagination.value.current = 1;
    loadData();
  };

  // 重置按钮事件
  const handleReset = () => {
    queryParams.value = {
      deviceCode: '',
      deviceName: '',
      categoryId: undefined,
      spaceId: undefined,
      runState: undefined,
    };
    handleQuery();
  };

  // 表格变化事件
  const handleTableChange = (pag) => {
    pagination.value.current = pag.current;
    pagination.value.pageSize = pag.pageSize;
    loadData();
  };

  // 树形数据
  const categoryTreeData = ref([]);
  const spaceTreeData = ref([]);

  // 获取树形数据
  const loadTreeData = async () => {
    const [categoryRes, spaceRes] = await Promise.all([categoryTree({}), spaceTree()]);
    categoryTreeData.value = categoryRes || [];
    spaceTreeData.value = spaceRes || [];
  };

  onMounted(async () => {
    await loadTreeData();
    loadData();
  });
</script>

<style scoped>
  .search-form :deep(.ant-form-item) {
    margin-right: 16px;
    margin-bottom: 16px;
  }
  .search-form :deep(.ant-form-item-label) {
    min-width: 70px;
    text-align: right;
  }
  .ant-table {
    margin-top: 16px;
  }
  .ant-form {
    margin-top: 16px;
    margin-bottom: 16px;
  }
</style>
