<template>
  <div>
    <div class="card-box">
      <div
        v-for="(item,index) in statisticsData"
        :key="index"
        class="card-item"
        :style="getStyle(index)"
      >
        <div>{{item.alarmLevelName}}</div>
        <div class="number-box">{{ item.quantity }}</div>
      </div>
    </div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary">近三天</a-button>&ensp;
        <a-button type="primary">近一周</a-button>&ensp;
        <a-button type="primary">近一月</a-button>&ensp;
      </template>
      <template #form-deviceIds="{ model, field }">
        <a-input
          placeholder="请选择设备"
          v-model:value="model[field]"
        >
        </a-input>
      </template>
      <template #form-spaceId="{ model, field }">
        <a-tree-select
          v-model:value="model[field]"
          :tree-data="spaceTreeData"
          placeholder="请选择位置"
          :fieldNames="treeSelect"
          show-search
          allowClear
        />
      </template>
      <template #form-alarmCategoryId="{ model, field }">
        <a-select
          placeholder="请选择报警类别"
          v-model:value="model[field]"
          :options="categoryOption"
        >
        </a-select>
      </template>
      <template #form-alarmLevelId="{ model, field }">
        <a-select
          v-model:value="model[field]"
          :options="levelOption"
          placeholder="请选择报警等级"
        >
        </a-select>
      </template>
      <!-- <template #form-alarmStatus="{ model, field }">
        <a-select placeholder="请选择响应状态" v-model:value="model[field]" :options="alarmStatusOptions">
        </a-select>
      </template> -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'alarmStatus'">
          {{ record.alarmStatus === '1' ? '未处理' : '已消除' }}
        </template>
        <template v-if="column.key === 'active'">
          <a-space>
            <a @click.stop="eliminateAlarmRecords(record)">报警消除</a>
            &emsp;
            <a @click.stop="transferAlarmRecords(record)">转事件工单</a>
          </a-space>
        </template>
      </template>
    </BasicTable>
    <device-table-modal ref="deviceRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { usePermissionStore } from '/@/store/modules/permission';
import {
  getAlarmRecordsListApi,
  eliminateAlarmRecordsApi,
  spaceTree,
  getAlarmLevelListApi,
  getAlarmCategoryListApi,
  getAlarmRecordsStatisticsApi,
} from '../Standardized.api';
import DeviceTableModal from './DeviceTableModal.vue';

const deviceRef = ref();

const statisticsData = ref<any>([]);

// 打开类型
const type = ref('');
const editItem = ref<any>();

// 等级数据
const levelOption = ref([]);
// 类别数据
const categoryOption = ref([]);

const pagination = ref({
  pageNo: 1,
  pageSize: 10,
});

// 表格列配置
const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: '80px',
    customRender: ({ index }) => index + 1, // 显示序号，从 1 开始
    resizable: true,
  },
  {
    title: '报警信息',
    dataIndex: 'alarmContent',
    key: 'alarmContent',
    resizable: true,
    sorter: (a, b) => a.alarmContent.localeCompare(b.alarmContent), // 自定义排序函数
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '报警时间',
    dataIndex: 'alarmTime',
    key: 'alarmTime',
    resizable: true,
    sorter: (a, b) => new Date(a.alarmTime).getTime() - new Date(b.alarmTime).getTime(), // 按时间戳排序
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '报警设备',
    dataIndex: 'deviceName',
    key: 'deviceName',
    resizable: true,
    sorter: (a, b) => a.deviceName.localeCompare(b.deviceName), // 自定义排序函数
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '报警位置',
    dataIndex: 'spaceName',
    key: 'spaceName',
    resizable: true,
  },
  {
    title: '报警类型',
    dataIndex: 'alarmCategoryName',
    key: 'alarmCategoryName',
    resizable: true,
    sorter: (a, b) => a.alarmCategoryName.localeCompare(b.alarmCategoryName), // 自定义排序函数
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '报警等级',
    dataIndex: 'alarmLevelName',
    key: 'alarmLevelName',
    resizable: true,
  },
  {
    title: '负责人',
    dataIndex: 'createBy',
    key: 'createBy',
    resizable: true,
  },
  {
    title: '响应状态',
    dataIndex: 'alarmStatus',
    key: 'alarmStatus',
    resizable: true,
    sorter: (a, b) => a.alarmStatus.localeCompare(b.alarmStatus), // 自定义排序函数
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '操作',
    dataIndex: 'active',
    key: 'active',
  },
];

// 获取当月第一天
const getFirstDayOfMonth = (): Date => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
};

// 获取当前日期
const getToday = (): Date => {
  return new Date();
};

// 格式化为 YYYY-MM-DD
const formatDate = (date: any): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '报警日期', //显示label
    field: 'time', //查询字段
    component: 'RangePicker', //渲染的组件
    // slot: 'name', //设置默认值
    componentProps: {
      placeholder: ['开始时间', '结束时间'],
      showTime: true,
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      defaultValue: [formatDate(getFirstDayOfMonth()), formatDate(getToday())],
    },
  },
  {
    label: '报警设备', //显示label
    field: 'deviceIds', //查询字段
    component: 'JInput', //渲染的组件
    slot: 'deviceIds', //设置默认值
  },
  {
    label: '报警位置', //显示label
    field: 'spaceId', //查询字段
    component: 'JInput', //渲染的组件
    slot: 'spaceId', //设置默认值
  },
  {
    label: '报警类型', //显示label
    field: 'alarmCategoryId', //查询字段
    component: 'JInput', //渲染的组件
    slot: 'alarmCategoryId', //设置默认值
  },
  {
    label: '报警等级', //显示label
    field: 'alarmLevelId', //查询字段
    component: 'JInput', //渲染的组件
    slot: 'alarmLevelId', //设置默认值
  },
  {
    label: '响应状态', //显示label
    field: 'alarmStatus', //查询字段
    component: 'JInput', //渲染的组件
    slot: 'alarmStatus', //设置默认值
  },
];

// 空间位置树数据
const spaceTreeData = ref([]);
const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

// 获取表格数据
const getLinkageControlList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  console.log('getLinkageControlList-------------->', searchData);
  
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    spaceId: searchData.spaceId ? searchData.spaceId : undefined,
    alarmLevelId: searchData.alarmLevelId ? searchData.alarmLevelId : undefined,
    alarmCategoryId: searchData.alarmCategoryId ? searchData.alarmCategoryId : undefined,
    deviceIds: searchData.deviceIds ? searchData.deviceIds.split('*')[1] : undefined,
    startDate: searchData.time ? searchData.time.split(',')[0] + ' 00:00:00' : formatDate(getFirstDayOfMonth()) + ' 00:00:00',
    endDate: searchData.time ? searchData.time.split(',')[1] + ' 23:59:59' : formatDate(getToday()) + ' 23:59:59',
  };
  let res = await getAlarmRecordsListApi(params);
  return {
    records: res.records, // 当前页数据
    total: res.total, // 总记录数
  };
};

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    // dataSource: dataSource.value,
    api: getLinkageControlList,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
    showTableSetting:false,
    rowKey: 'id',
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
    },
    formConfig: {
      schemas: searchFormSchema,
      // 默认展开
      showAdvancedButton: false,
      submitOnReset: true,
      //重置按钮的自定义事件
      resetFunc: async () => {
        console.log('重置--------------->');
      },
      //默认row行配置,当 layout 为 horizontal 生效
      rowProps: { gutter: 24, justify: 'start', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      baseColProps: { span: 6 },
      //row行的样式
      baseRowStyle: { width: '100%' },
      labelCol: { style: { width: 'auto' } },
    },
  },
});

// BasicTable绑定注册
const [registerTable, { reload, getForm, getPaginationRef, getDataSource }] = tableContext;

/**
 * 检查是否有权限
 * @param {string|Array} permission 权限标识
 * @returns {boolean}
 */
const store = usePermissionStore();
const permissionList = computed(() => store.$state.permCodeList || []);
const hasPermission = (permission: string) => {
  if (!permission) return true;

  const currentPermissions = permissionList.value;

  if (Array.isArray(permission)) {
    return permission.some((perm) => currentPermissions.includes(perm));
  }

  return currentPermissions.includes(permission);
};

const getStyle = (index) => {
  const hue = (50 * index) / Math.max(1, statisticsData.value.length - 1);
  return {
    background: `hsl(${hue}, 100%, 50%)`,
  };
};

const getColor = (index, total) => {
  // 红色(0度)到橙色(30度)

  return;
};

// 选择设备绑定
const selectDevice = (type: number, index: number) => {
  deviceRef.value.showModal();
};

// 消除
const eliminateAlarmRecords = async (record) => {
  await eliminateAlarmRecordsApi({ id: record.id });
  // 刷新表格
  reload();
};

// 转事件工单
const transferAlarmRecords = async (record) => {
  // await eliminateAlarmRecordsApi({id: record.id})
  // message.success('消除成功！');
  // 刷新表格
  reload();
};

// 获取下拉框数据源
const getOptionsData = async () => {
  let res1 = await getAlarmLevelListApi();
  levelOption.value = res1.map((item) => {
    return {
      label: item.alarmLevelName,
      value: item.id,
    };
  });
  let res2 = await getAlarmCategoryListApi();
  categoryOption.value = res2.map((item) => {
    return {
      label: item.alarmCategoryName,
      value: item.id,
    };
  });
};

// 获取统计数据
const getAlarmRecordsStatistics = async () => {
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    // pageNo: '',
    pageSize: 999999999,
    spaceId: searchData.spaceId ? searchData.spaceId : undefined,
    alarmLevelId: searchData.alarmLevelId ? searchData.alarmLevelId : undefined,
    alarmCategoryId: searchData.alarmCategoryId ? searchData.alarmCategoryId : undefined,
    deviceIds: searchData.deviceIds ? searchData.deviceIds.split('*')[1] : undefined,
    startDate: searchData.time ? searchData.time.split(',')[0] : undefined,
    endDate: searchData.time ? searchData.time.split(',')[1] : undefined,
  };
  statisticsData.value = await getAlarmRecordsStatisticsApi(params);
  statisticsData.value.reverse();
};

onMounted(async () => {
  await getOptionsData();
  await getAlarmRecordsStatistics();
  const spaceRes = await spaceTree();
  spaceTreeData.value = spaceRes;
});
</script>

<style scoped lang="less">
.card-box {
  padding: 0 15px;
  display: flex;

  .card-item {
    display: flex;
    justify-content: center;
    color: #fff;
    align-content: center;
    font-weight: 600;
    flex-wrap: wrap;
    width: 200px;
    border-radius: 10px;
    height: 80px;
    > div {
      width: 60%;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 30px;
    }
    .number-box {
      font-size: 20px;
    }
  }
  .very-urgent {
    background-color: #fa121f;
  }
  .emergency {
    background-color: #fa9b2f;
  }
  .general {
    background-color: #fadb2f;
  }
}
.button-box {
  width: 100%;
  display: flex;
  justify-content: flex-start;
}
</style>