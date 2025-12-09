<template>
  <div class="jeecg-basic-table jeecg-basic-table-form-container">
    <div class="status-data-device-status">
      <a-button @click="filterTableData(undefined)">
        全部({{ statusData.count }})
      </a-button>
      &emsp;
      <a-button type="primary" @click="filterTableData('在线')">
        在线({{ statusData.online }})
      </a-button>
      &emsp;
      <a-button type="primary" danger @click="filterTableData('离线')">
        离线({{ statusData.offline }})
      </a-button>
    </div>
    <!-- 表格 -->
    <BasicTable @register="registerTable">
      <template #form-categoryId="{ model, field }">
        <a-tree-select
          v-model:value="model[field]"
          :tree-data="categoryTreeData"
          placeholder="请选择设备类别"
          :fieldNames="treeSelect"
          show-search
          allowClear
        />
      </template>
      <template #form-spaceId="{ model, field }">
        <a-tree-select
          v-model:value="model[field]"
          :tree-data="spaceTreeData"
          placeholder="请选择空间位置"
          :fieldNames="treeSelect"
          show-search
          allowClear
        />
      </template>
      <template #form-runState="{ model, field }">
        <a-select
          v-model:value="model[field]"
          placeholder="请选择仪表状态"
          allow-clear
        >
          <a-select-option value="在线">在线</a-select-option>
          <a-select-option value="离线">离线</a-select-option>
        </a-select>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <!-- <a-button
            :icon="h(BarChartOutlined)"
            @click="handleChart(record)"
          /> -->
          <a @click="handleChart(record)">查看</a>
        </template>
      </template>
    </BasicTable>
  </div>
  <a-modal
    v-model:visible="chartVisible"
    title="设备数据图表"
    width="500px"
    :footer="null"
    @cancel="handleChartClose"
    destroyOnClose
  >
    <Chart
      :params="chartParams"
      style="height: 300px"
    />
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onMounted, h } from 'vue';
import { BarChartOutlined } from '@ant-design/icons-vue';
import { getCategoryTree, getSpaceTree, getList, getDeviceNumberDataApi } from './index.api';
import Chart from './components/chart.vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';

// 定义表格列
const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: '80px',
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
    title: '起始时间',
    dataIndex: 'startTime',
    key: 'startTime',
  },
  {
    title: '起始值',
    dataIndex: 'startValue',
    key: 'startValue',
    width: '90px',
  },
  {
    title: '结束值',
    dataIndex: 'endValue',
    key: 'endValue',
    width: '90px',
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    key: 'endTime',
  },
  {
    title: '计算值',
    dataIndex: 'value',
    key: 'value',
    width: '90px',
  },
  {
    title: '运行状态',
    dataIndex: 'runState',
    key: 'runState',
    width: '80px'
  },
  {
    title: '操作',
    key: 'action',
    width: '80px'
  },
];

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '设备名称', //显示label
    field: 'deviceName', //查询字段
    component: 'JInput', //渲染的组件
  },
  {
    label: '设备编号',
    field: 'deviceCode',
    component: 'JInput',
  },
  {
    label: '设备类别',
    field: 'categoryId',
    component: 'JDictSelectTag',
    slot: 'categoryId',
  },
  {
    label: '空间位置',
    field: 'spaceId',
    component: 'JDictSelectTag',
    slot: 'spaceId',
  },
  {
    label: '仪表状态',
    field: 'runState',
    component: 'JDictSelectTag',
    slot: 'runState',
  },
  {
    label: '起始时间',
    field: 'startTime',
    component: 'DatePicker',
    defaultValue: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    label: '结束时间',
    field: 'endTime',
    component: 'DatePicker',
    defaultValue: new Date().toISOString(),
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
];

// 定义表格数据
const dataSource = ref([]);

const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

const chartVisible = ref(false);

const chartParams = ref<any>({
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
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    reload();
  },
});

const loadData = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  //分页查询
  const params = {
    pageNo: pageNo,
    pageSize: pageSize,
    ...searchData,
    startTime: searchData.startTime ? searchData.startTime.split(' ')[0] + ' 00:00:00' : null,
    endTime: searchData.endTime ? searchData.endTime.split(' ')[0] + ' 00:00:00' : null,
  };
  if (searchData.deviceName) {
    params.deviceName = searchData.deviceName.split('*')[1];
  }
  if (searchData.deviceCode) {
    params.deviceCode = searchData.deviceCode.split('*')[1];
  }
  const res = await getList(params);
  dataSource.value = res.records;
  pagination.value.total = res.total;
  pagination.value.pageSize = res.size;
  return {
    records: res.records, // 当前页数据
    total: res.total, // 总记录数
  };
};

// 处理查询
const handleSearch = () => {
  // 这里可以添加实际的查询逻辑，根据 searchParams 过滤 dataSource
  pagination.value.total = 1;
  reload();
};

const handleChart = (record: any) => {
  // 这里可以添加实际的图表逻辑
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
const resetSearch = async () => {
  searchParams.value = defaultSearchParams;
  pagination.value.current = 1;
  reload();
};

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    api: loadData,
    columns: columns as BasicColumn[],
    showActionColumn: false,
    size: 'middle',
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
    },
    showTableSetting:false,
    formConfig: {
      schemas: searchFormSchema,
      showAdvancedButton: false,
      submitOnReset: true,
      //重置按钮的自定义事件
      resetFunc: resetSearch,
      //默认row行配置,当 layout 为 horizontal 生效
      rowProps: { gutter: 24, justify: 'start', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      baseColProps: { span: 6 },
      //row行的样式
      baseRowStyle: { width: '100%' },
      labelCol: { style: { width: '130px' } },
    },
  },
});

// BasicTable绑定注册
const [registerTable, { reload, getForm }] = tableContext;

const statusData = ref({
  count: 0,
  online: 0,
  offline: 0,
})

const getDeviceNumberData = async() => {
  let res = await getDeviceNumberDataApi()
  statusData.value.count = res.count
  statusData.value.online = res.online
  statusData.value.offline = res.offline
}

const filterTableData = (status) => {
  searchParams.value.runState = status
  let { setFieldsValue } = getForm();
  setFieldsValue({
    runState: status, // 将 'fixed_value' 替换为你需要的固定值
  });
  reload()
}

// 组件挂载时获取数据
onMounted(async () => {
  try {
    const categoryRes = await getCategoryTree();
    categoryTreeData.value = categoryRes;

    const spaceRes = await getSpaceTree();
    spaceTreeData.value = spaceRes;
    reload();
  } catch (error) {
    console.error('获取数据失败:', error);
  }
  await getDeviceNumberData()
});
</script>

<style lang="less" scoped>
/* 可以添加自定义样式 */

.status-data-device-status{
  padding-left: 12px;
  height: 40px;
  margin: 4px 10px 0 10px;
  background-color: #fff;
  display: flex;
  align-items: center;
}
</style>
