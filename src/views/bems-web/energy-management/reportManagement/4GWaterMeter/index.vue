<template>
  <div class="jeecg-basic-table jeecg-basic-table-form-container">
    <a-form class="water-meter-form" ref="formSateRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-row>
        <a-col :span="8">
          <a-form-item label="设备名称" name="deviceName">
            <a-input placeholder="请输入设备名称" v-model:value="formState.deviceName" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="设备编号" name="deviceCode">
            <a-input placeholder="请输入设备编号" v-model:value="formState.deviceCode" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="空间位置" name="spaceId">
            <a-tree-select
              v-model:value="formState.spaceId"
              :tree-data="spaceTreeData"
              placeholder="请选择空间位置"
              :fieldNames="treeSelect"
              show-search
              allowClear
              @change="handleSpaceChange"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="仪表状态" name="runState">
            <a-select v-model:value="formState.runState" placeholder="请选择仪表状态" allow-clear>
              <a-select-option value="在线">在线</a-select-option>
              <a-select-option value="离线">离线</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="起始时间" name="startTime">
            <a-date-picker
              style="width: 100%"
              placeholder="选择开始时间"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              v-model:value="formState.startTime"
            ></a-date-picker>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="结束时间" name="endTime">
            <a-date-picker
              style="width: 100%"
              placeholder="选择开始时间"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              v-model:value="formState.endTime"
            ></a-date-picker>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        
        <a-col :span="12">
          <a-form-item>
            &emsp;
            <a-button type="primary" :icon="h(SearchOutlined)" @click="reload">查询</a-button>
            &nbsp;
            <a-button :icon="h(RedoOutlined)" @click="resetSearch">重置</a-button>
            &nbsp;
            <a-button type="primary" :icon="h(VerticalAlignBottomOutlined)" @click="handleExport">导出</a-button>
            &nbsp;
            <a-button v-if="props.categoryId === '45'" type="primary" :icon="h(VerticalAlignBottomOutlined)" @click="downloadReport">报表</a-button>
            <a-button v-if="props.categoryId !== '45'" type="primary" :icon="h(VerticalAlignBottomOutlined)" @click="downloadReportDian('2')"
              >报表</a-button
            >
            &nbsp;
            <a-button v-if="props.categoryId !== '45'" type="primary" :icon="h(VerticalAlignBottomOutlined)" @click="downloadReportDian('3')"
              >配电室报表</a-button
            >
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <!-- 表格 -->
    <BasicTable @register="registerTable">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <!-- <a-button
            :icon="h(BarChartOutlined)"
            @click="handleChart(record)"
          /> -->

          <a-space>
            <a @click="handleChart(record)">查看</a>
            <a @click="handleHistory(record)">历史数据</a>
          </a-space>
        </template>
      </template>
    </BasicTable>
  </div>
  <a-modal v-model:visible="chartVisible" title="设备数据图表" width="800px" :footer="null" @cancel="handleChartClose" destroyOnClose>
    <Chart :params="chartParams" style="height: 540px" />
  </a-modal>
  <HistoryRecordsModal ref="historyRecordsModalRef" />
</template>

<script lang="ts" setup>
  import { ref, onMounted, h } from 'vue';
  import { BarChartOutlined, VerticalAlignBottomOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons-vue';
  import { getCategoryTree, getSpaceTree, getList, getDeviceNumberDataApi, exportData, downloadReportApi } from './index.api';
  import Chart from './components/chart.vue';
  import HistoryRecordsModal from './components/HistoryRecordsModal.vue';
  import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { message } from 'ant-design-vue';

  const props = defineProps({
    categoryId: {
      type: String,
      default: '45',
    },
  });

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

  // 定义表格列
  const columns: BasicColumn[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      minWidth: 80,
      width: 120,
      customRender: ({ index }) => index + 1, // 显示序号，从 1 开始
    },
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      minWidth: 80,
      width: 120,
      resizable: true,
      sorter: (a, b) => a.deviceCode.localeCompare(b.deviceCode), // 自定义排序函数
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      minWidth: 80,
      width: 120,
      resizable: true,
      sorter: (a, b) => a.deviceName.localeCompare(b.deviceName), // 自定义排序函数
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: '设备类型',
      dataIndex: 'categoryId',
      key: 'categoryId',
      customRender: ({ text }) => {
        if (!text) return '';
        return findTreeNodeTitle(categoryTreeData.value, text) || text;
      },
      minWidth: 80,
      width: 120,
    },
    {
      title: '设备位置',
      dataIndex: 'spaceName',
      key: 'spaceName',
      // customRender: ({ text }) => {
      //   if (!text) return '';
      //   return findTreeNodeTitle(spaceTreeData.value, text) || text;
      // },
      sorter: (a, b) => a.spaceName.localeCompare(b.spaceName), // 自定义排序函数
      sortDirections: ['ascend', 'descend'],
      minWidth: 80,
      width: 120,
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
      customRender: ({ text }) => {
        if (!text) return '';
        return text.split(' ')[0];
      },
      sorter: (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(), // 按时间戳排序
      sortDirections: ['ascend', 'descend'],
      minWidth: 80,
      width: 120,
    },
    {
      title: '起始值',
      dataIndex: 'startValue',
      key: 'startValue',
      minWidth: 80,
      width: 120,
    },
    {
      title: '结束值',
      dataIndex: 'endValue',
      key: 'endValue',
      minWidth: 80,
      width: 120,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      customRender: ({ text }) => {
        if (!text) return '';
        return text.split(' ')[0];
      },
      sorter: (a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime(), // 按时间戳排序
      sortDirections: ['ascend', 'descend'],
      minWidth: 80,
      width: 120,
      resizable: true,
    },
    {
      title: '计算值',
      dataIndex: 'value',
      key: 'value',
      minWidth: 80,
      width: 120,
    },
    {
      title: '运行状态',
      dataIndex: 'runState',
      key: 'runState',
      minWidth: 80,
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      minWidth: 80,
      width: 120,
    },
  ];

  const formState = ref({
    deviceName: null,
    deviceCode: null,
    categoryId: null,
    spaceId: null,
    runState: null,
    startTime: formatTime(new Date().getTime() - 24 * 60 * 60 * 1000),
    endTime: formatTime(new Date().getTime()),
  });

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
      defaultValue: formatTime(new Date().getTime() - 24 * 60 * 60 * 1000),
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      label: '结束时间',
      field: 'endTime',
      component: 'DatePicker',
      defaultValue: formatTime(new Date().getTime()),
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD',
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

  const historyRecordsModalRef = ref();

  const loadData = async (pageParams) => {
    const { pageNo, pageSize } = pageParams;
    // let { getFieldsValue } = getForm();
    // const searchData = getFieldsValue();
    //分页查询
    const params = {
      pageNo: pageNo,
      pageSize: pageSize,
      ...formState.value,
      startTime: formState.value.startTime ? formState.value.startTime.split(' ')[0] + ' 00:00:00' : null,
      endTime: formState.value.endTime ? formState.value.endTime.split(' ')[0] + ' 23:59:59' : null,
      categoryId: props.categoryId,
      convertInteger: props.categoryId === '45' ? '1' : undefined,
    };
    let res: any;
    res = await getList(params);
    dataSource.value = res.records;
    pagination.value.total = res.total;
    pagination.value.pageSize = res.size;
    res.records.forEach((item) => {
      item.spaceName = findTreeNodeTitle(spaceTreeData.value, item.spaceId);
    });
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
    let { getFieldsValue } = getForm();
    const searchData = getFieldsValue();
    // 这里可以添加实际的图表逻辑
    chartParams.value = {
      deviceId: record.deviceId,
      startTime: searchData.startTime ? searchData.startTime.split(' ')[0] + ' 00:00:00' : null,
      endTime: searchData.endTime ? searchData.endTime.split(' ')[0] + ' 23:59:59' : null,
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
    formState.value.deviceName = null;
    formState.value.deviceCode = null;
    formState.value.categoryId = null;
    formState.value.spaceId = null;
    formState.value.startTime = formatTime(new Date().getTime() - 24 * 60 * 60 * 1000);
    formState.value.endTime = formatTime(new Date().getTime());
    pagination.value.current = 1;
    reload();
  };

  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      api: loadData,
      columns: columns as BasicColumn[],
      showActionColumn: false,
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
      },
      showTableSetting: false,
      // formConfig: {
      //   schemas: searchFormSchema,
      //   showAdvancedButton: false,
      //   submitOnReset: true,
      //   //重置按钮的自定义事件
      //   resetFunc: resetSearch,
      //   //默认row行配置,当 layout 为 horizontal 生效
      //   rowProps: { gutter: 24, justify: 'start', align: 'middle' },
      //   //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      //   baseColProps: { span: 6 },
      //   //row行的样式
      //   baseRowStyle: { width: '100%' },
      //   labelCol: { style: { width: '130px' } },
      // },
    },
  });

  // BasicTable绑定注册
  const [registerTable, { reload, getForm }] = tableContext;

  const statusData = ref({
    count: 0,
    online: 0,
    offline: 0,
  });

  const getDeviceNumberData = async () => {
    let res = await getDeviceNumberDataApi();
    statusData.value.count = res.count;
    statusData.value.online = res.online;
    statusData.value.offline = res.offline;
  };

  const filterTableData = (status) => {
    searchParams.value.runState = status;
    let { setFieldsValue } = getForm();
    setFieldsValue({
      runState: status, // 将 'fixed_value' 替换为你需要的固定值
    });
    reload();
  };

  const handleExport = async () => {
    // let { getFieldsValue } = getForm();
    // const searchData = getFieldsValue();
    let res = await exportData({
      ...formState.value,
      categoryId: props.categoryId,
      startTime: formState.value.startTime ? formState.value.startTime.split(' ')[0] + ' 00:00:00' : null,
      endTime: formState.value.endTime ? formState.value.endTime.split(' ')[0] + ' 23:59:59' : null,
      convertInteger: props.categoryId === '45' ? '1' : undefined,
    });
    let name = '4G水表';
    let blobOptions = { type: 'application/vnd.ms-excel' };
    let fileSuffix = '.xlsx';
    let url = window.URL.createObjectURL(new Blob([res], blobOptions));
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', name + fileSuffix);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); //下载完成移除元素
    window.URL.revokeObjectURL(url); //释放掉blob对象
  };

  const downloadReport = async () => {
    let res = await downloadReportApi({
      ...formState.value,
      startTime: formState.value.startTime ? formState.value.startTime.split(' ')[0] + ' 00:00:00' : null,
      endTime: formState.value.endTime ? formState.value.endTime.split(' ')[0] + ' 23:59:59' : null,
      convertInteger: props.categoryId === '45' ? '1' : undefined,
      templateId: props.categoryId === '45' ? '1' : '2,3',
    });
    let name = props.categoryId === '45' ? '4G水表报表' : '低压配电报表';
    let blobOptions = { type: 'application/vnd.ms-excel' };
    let fileSuffix = '.xlsx';
    let url = window.URL.createObjectURL(new Blob([res], blobOptions));
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', name + fileSuffix);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); //下载完成移除元素
    window.URL.revokeObjectURL(url); //释放掉blob对象
  };

  const downloadReportDian = async (key) => {
    let res = await downloadReportApi({
      ...formState.value,
      startTime: formState.value.startTime ? formState.value.startTime.split(' ')[0] + ' 00:00:00' : null,
      endTime: formState.value.endTime ? formState.value.endTime.split(' ')[0] + ' 23:59:59' : null,
      convertInteger: props.categoryId === '45' ? '1' : undefined,
      templateId: key,
    });
    let name = '';
    key === '2' ? (name = '金安科幻抄电表记录') : (name = '金安科幻配电室开关抄表记录');
    let blobOptions = { type: 'application/vnd.ms-excel' };
    let fileSuffix = '.xlsx';
    let url = window.URL.createObjectURL(new Blob([res], blobOptions));
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', name + fileSuffix);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); //下载完成移除元素
    window.URL.revokeObjectURL(url); //释放掉blob对象
  };

  const handleHistory = (record) => {
    let { getFieldsValue } = getForm();
    const searchData = getFieldsValue();
    const params = {
      deviceId: record.deviceId,
      startTime: searchData.startTime ? searchData.startTime.split(' ')[0] + ' 00:00:00' : null,
      endTime: searchData.endTime ? searchData.endTime.split(' ')[0] + ' 23:59:59' : null,
    };
    historyRecordsModalRef.value.openModal(params);
  };
  const handleSpaceChange = (value, item, val) => {
    if (val && val.triggerNode && val.triggerNode.props && val.triggerNode.props.disableCheckbox) {
      message.warn('无该节点权限，不可选！');
      formState.value.spaceId = null;
      return;
    }
  };
  // 组件挂载时获取数据
  onMounted(async () => {
    try {
      const categoryRes = await getCategoryTree();
      categoryTreeData.value = categoryRes;
      console.log('getCategoryTree--------------------->', categoryTreeData.value);

      const spaceRes = await getSpaceTree();
      spaceTreeData.value = spaceRes;
      reload();
    } catch (error) {
      console.error('获取数据失败:', error);
    }
    await getDeviceNumberData();
  });
</script>

<style lang="less" scoped>
  /* 可以添加自定义样式 */

  .status-data-device-status {
    padding-left: 12px;
    height: 40px;
    margin: 4px 10px 0 10px;
    background-color: #fff;
    display: flex;
    align-items: center;
  }

  .water-meter-form {
    :deep(.ant-col-18) {
      max-width: 100%;
    }
  }
  .jeecg-basic-table {
    padding: 12px 6px !important;
  }
  
</style>
