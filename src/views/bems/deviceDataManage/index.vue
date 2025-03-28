<template>
  <div class="jeecg-basic-table jeecg-basic-table-form-container">
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
          v-model:value="searchParams.categoryId"
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
          v-model:value="searchParams.spaceId"
          :tree-data="spaceTreeData"
          placeholder="请选择空间位置"
          :fieldNames="treeSelect"
          show-search
          allowClear
          style="width: 200px"
        />
      </a-form-item>
      <a-form-item label="仪表状态">
        <a-select v-model:value="searchParams.runState" placeholder="请选择仪表状态" style="width: 200px" allow-clear>
          <a-select-option value="在线">在线</a-select-option>
          <a-select-option value="离线">离线</a-select-option>
        </a-select>
      </a-form-item>
      <!-- 新增起始时间查询条件 -->
      <a-form-item label="起始时间">
        <a-date-picker
          v-model:value="searchParams.startTime"
          placeholder="请选择起始时间"
          :showTime="{ format: 'HH' }"
          valueFormat="YYYY-MM-DD HH"
          format="YYYY-MM-DD HH"
          style="width: 200px"
        />
      </a-form-item>
      <!-- 新增结束时间查询条件 -->
      <a-form-item label="结束时间">
        <a-date-picker
          v-model:value="searchParams.endTime"
          placeholder="请选择结束时间"
          :showTime="{ format: 'HH' }"
          valueFormat="YYYY-MM-DD HH"
          format="YYYY-MM-DD HH"
          style="width: 200px"
        />
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
  <a-modal v-model:visible="chartVisible" title="设备数据图表" width="500px" :footer="null" @cancel="handleChartClose" destroyOnClose>
    <Chart :params="chartParams" style="height: 300px" />
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, onMounted, h } from 'vue';
  import { BarChartOutlined } from '@ant-design/icons-vue';
  import { getCategoryTree, getSpaceTree, getList } from './index.api';
  import Chart from './components/chart.vue';

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
      title: '设备类型',
      dataIndex: 'categoryId',
      key: 'categoryId',
      customRender: ({ text }) => {
        if (!text) return '';
        return findTreeNodeTitle(categoryTreeData.value, text) || text;
      },
      width: 100,
    },
    {
      title: '设备位置',
      dataIndex: 'spaceId',
      key: 'spaceId',
      customRender: ({ text }) => {
        if (!text) return '';
        return findTreeNodeTitle(spaceTreeData.value, text) || text;
      },
    },
    // {
    //   title: '计量单位',
    //   dataIndex: 'unit',
    //   key: 'unit',
    // },
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
      title: '运行状态',
      dataIndex: 'runState',
      key: 'runState',
    },
    {
      title: '操作',
      key: 'action',
    },
  ];

  // 定义表格数据
  const dataSource = ref([]);

  const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

  const chartVisible = ref(false);

  const chartParams = ref({
    deviceId: null,
    startTime: null,
    endTime: null,
  });

  const defaultSearchParams = {
    deviceName: '',
    deviceCode: '',
    categoryId: null,
    spaceId: null,
    runState: null,
    // 获取上一天日期
    startTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0] + ' 00',
    endTime: new Date().toISOString().split('T')[0] + ' 00',
  };

  // 查询参数
  const searchParams = ref(defaultSearchParams);

  // 设备类别和空间位置的下拉树数据
  const categoryTreeData = ref([]);
  const spaceTreeData = ref([]);
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
      pagination.value.current = page;
      pagination.value.pageSize = pageSize;
      loadData();
    },
  });

  const loadData = async () => {
    //分页查询
    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ...searchParams.value,
      startTime: searchParams.value.startTime ? searchParams.value.startTime + ':00:00' : null,
      endTime: searchParams.value.endTime ? searchParams.value.endTime + ':59:59' : null,
    };
    const res = await getList(params);
    dataSource.value = res.records;
    pagination.value.total = res.total;
    pagination.value.pageSize = res.size;
  };

  // 处理查询
  const handleSearch = () => {
    // 这里可以添加实际的查询逻辑，根据 searchParams 过滤 dataSource
    pagination.value.total = 1;
    loadData();
  };

  const handleChart = (record: any) => {
    // 这里可以添加实际的图表逻辑
    console.log('显示图表', record);
    chartParams.value = {
      deviceId: record.deviceId,
      startTime: searchParams.value.startTime ? searchParams.value.startTime + ':00:00' : null,
      endTime: searchParams.value.endTime ? searchParams.value.endTime + ':59:59' : null,
    };
    chartVisible.value = true;
  };

  const handleChartClose = () => {
    chartVisible.value = false;
  };
  // 查找树节点的标题
  const findTreeNodeTitle = (treeData: any[], key: string | number): string => {
    if (!treeData || !Array.isArray(treeData)) {
      return '';
    }

    const find = (nodes: any[]): string => {
      for (const node of nodes) {
        if (String(node.key) === String(key)) {
          return node.value;
        }
        if (node.children && Array.isArray(node.children)) {
          const title = find(node.children);
          if (title) return title;
        }
      }
      return '';
    };
    return find(treeData);
  };

  // 重置查询
  const resetSearch = () => {
    searchParams.value = defaultSearchParams;
    pagination.value.current = 1;
    loadData();
  };

  // 组件挂载时获取数据
  onMounted(async () => {
    try {
      const categoryRes = await getCategoryTree();
      categoryTreeData.value = categoryRes;

      const spaceRes = await getSpaceTree();
      spaceTreeData.value = spaceRes;
      loadData();
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  });
</script>

<style scoped>
  /* 可以添加自定义样式 */
</style>
