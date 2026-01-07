<template>
  <div class="">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <div class="checked-box">
          <a-checkbox
            v-for="option in options"
            :key="option.value"
            :checked="selectedValue === option.value"
            @change="(e) => handleChange(e, option.value)"
          >
            {{ option.label }}&emsp;
          </a-checkbox>
        </div>
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
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'alarmLevelName'">
          <p :style="record.backgroundColor">{{ record.alarmLevelName }}</p>
        </template>
        <template v-if="column.key === 'alarmStatus'">
          {{ getStatus(record.alarmStatus) }}
        </template>
        <template v-if="column.key === 'active'">
          <a-space>
            <a @click.stop="handelDetail(record)">详情</a>
            &emsp;
            <a v-if="record.alarmStatus === '3' || record.alarmStatus === '4'" @click.stop="handelWorkOrderDetail(record)">工单详情</a>
            <!-- &emsp;
            <a @click.stop="eliminateAlarmRecords(record)">报警消除</a> -->
            &emsp;
            <a v-if="record.alarmStatus === '1'" @click.stop="transferAlarmRecords(record)">转事件工单</a>
            &emsp;
            <a v-if="record.alarmStatus === '1'" @click.stop="transferAlarmRecords(record)">误报</a>
          </a-space>
        </template>
      </template>
    </BasicTable>
    <device-table-modal ref="deviceRef" />
    <detail-modal ref="detailRef" />
    <WorkOrderModal ref="workOrderModalRef"/>
    <TransferEventWorkOrder ref="transferEventWorkOrderRef" :reload="reload"/>
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
} from './Standardized.api';
import { message } from 'ant-design-vue';
import DeviceTableModal from './components/DeviceTableModal.vue';
import DetailModal from './components/DetailModal.vue';
import WorkOrderModal from './components/WorkOrderModal.vue';
import TransferEventWorkOrder from './components/TransferEventWorkOrder.vue';

const deviceRef = ref();
// 详情弹框
const detailRef = ref();
const workOrderModalRef = ref();
const transferEventWorkOrderRef = ref();

const statisticsData = ref<any>([]);


// 打开类型
const type = ref('');
const editItem = ref<any>();

// 等级数据
const levelOption = ref([]);
// 类别数据
const categoryOption = ref([]);

// 颜色
const backgroundColorArr = ref<any>([]);

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
  },
  {
    title: '报警信息',
    dataIndex: 'alarmContent',
    key: 'alarmContent',
    width: '300px',
  },
  {
    title: '报警时间',
    dataIndex: 'alarmTime',
    key: 'alarmTime',
  },
  {
    title: '报警设备',
    dataIndex: 'deviceName',
    key: 'deviceName',
  },
  {
    title: '报警位置',
    dataIndex: 'spaceName',
    key: 'spaceName',
  },
  {
    title: '报警类型',
    dataIndex: 'alarmCategoryName',
    key: 'alarmCategoryName',
  },
  {
    title: '报警等级',
    dataIndex: 'alarmLevelName',
    key: 'alarmLevelName',
  },
  {
    title: '负责人',
    dataIndex: 'createBy',
    key: 'createBy',
  },
  {
    title: '响应状态',
    dataIndex: 'alarmStatus',
    key: 'alarmStatus',
    width: '120px'
  },
  {
    title: '操作',
    dataIndex: 'active',
    key: 'active',
    width: '260px',
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
      // defaultValue: [formatDate(getFirstDayOfMonth()), formatDate(getToday())],
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
];

// 时间快捷键
const options = [
  { value: '1', label: '近三天' },
  { value: '2', label: '近一周' },
  { value: '3', label: '近一月' },
];
const searchTime = ref({
  startTime: '',
  endTime: '',
});
const selectedValue = ref<string | null>(null);
const handleChange = (e, value) => {
  selectedValue.value = e.target.checked ? value : null;
  const endDate = new Date();
  const startDate = new Date();
  searchTime.value.endTime = formatDate(endDate);
  if (selectedValue.value) {
    switch (selectedValue.value) {
      case '1':
        startDate.setDate(endDate.getDate() - 2);
        break;
      case '2':
        startDate.setDate(endDate.getDate() - 6);
        break;
      case '3':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
    }
    searchTime.value.startTime = formatDate(startDate);
  } else {
    searchTime.value.startTime = formatDate(getFirstDayOfMonth());
  }
  const { setFieldsValue } = getForm();
   setFieldsValue({
      time: [ searchTime.value.startTime, searchTime.value.endTime ]
    });
  getAlarmRecordsStatistics();
  reload();
};

// 空间位置树数据
const spaceTreeData = ref([]);
const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

// 获取表格数据
const getLinkageControlList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  await getOptionsData();
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  if(!searchData.time) {
    selectedValue.value = null
  }
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    spaceId: searchData.spaceId ? searchData.spaceId : undefined,
    alarmLevelId: searchData.alarmLevelId ? searchData.alarmLevelId : undefined,
    alarmCategoryId: searchData.alarmCategoryId ? searchData.alarmCategoryId : undefined,
    deviceIds: searchData.deviceIds ? searchData.deviceIds : undefined,
    startDateTime: searchData.time ? searchData.time.split(',')[0] : formatDate(getFirstDayOfMonth()) + ' 00:00:00',
    endDateTime: searchData.time ? searchData.time.split(',')[1] : formatDate(getToday()) + ' 23:59:59',
  };
  if (searchTime.value.startTime) {
    params.startDateTime = searchTime.value.startTime + ' 00:00:00';
    params.endDateTime = searchTime.value.endTime + ' 23:59:59';
    searchTime.value.startTime = '';
    searchTime.value.endTime = '';
  } else if (!searchData.time) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 2);
    params.startDateTime = formatDate(startDate) + ' 00:00:00';
    params.endDateTime = formatDate(endDate) + ' 23:59:59';
  }
  let res = await getAlarmRecordsListApi(params);
  res.records.forEach((item, index) => {
    let colorArr = backgroundColorArr.value.filter((user, index, self) => index === self.findIndex((u) => u.level === user.level));
    for (let i = 0; i < colorArr.length; i++) {
      if (colorArr[i].level === item.alarmLevelName) {
        item['backgroundColor'] = colorArr[i].color;
        break;
      }
    }
  });
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
const [registerTable, { reload, getForm }] = tableContext;

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
    color: '#FFF',
  };
};

// 选择设备绑定
const selectDevice = (type: number, index: number) => {
  deviceRef.value.showModal();
};

// 详情
const handelDetail = (record) => {
  detailRef.value.showModal(record);
};

// 消除
const eliminateAlarmRecords = async (record) => {
  await eliminateAlarmRecordsApi({ id: record.id });
  message.success('消除成功！');
  // 刷新表格
  reload();
};

const getStatus = (statusId) => {
  let status = ''
  switch(statusId) {
    case '1' :
    status = '未处理'
    break;
    case '2' :
    status = '误报'
    break;
    case '3' :
    status = '已转工单'
    break;
    case '4' :
    status = '已处理'
    break;
  }
  return status
}

// 转事件工单
const transferAlarmRecords = async (record) => {
  transferEventWorkOrderRef.value.showModal(record)
};

// 获取下拉框数据源
const getOptionsData = async () => {
  let res1 = await getAlarmLevelListApi();
  levelOption.value = res1.map((item, index) => {
    backgroundColorArr.value.push({
      level: item.alarmLevelName,
      color: getStyle(index),
    });
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
    pageNo: 1,
    pageSize: 999999999,
    spaceId: searchData.spaceId ? searchData.spaceId : undefined,
    alarmLevelId: searchData.alarmLevelId ? searchData.alarmLevelId : undefined,
    alarmCategoryId: searchData.alarmCategoryId ? searchData.alarmCategoryId : undefined,
    deviceIds: searchData.deviceIds ? searchData.deviceIds.split('*')[1] : undefined,
    startDateTime: searchData.time ? searchData.time.split(',')[0] + ' 00:00:00' : formatDate(getFirstDayOfMonth()) + ' 00:00:00',
    endDateTime: searchData.time ? searchData.time.split(',')[1] + ' 23:59:59' : formatDate(getToday()) + ' 23:59:59',
  };
  if (searchTime.value.startTime) {
    params.startDateTime = searchTime.value.startTime + ' 00:00:00';
    params.endDateTime = searchTime.value.endTime + ' 23:59:59';
  }
  statisticsData.value = await getAlarmRecordsStatisticsApi(params);
  statisticsData.value.reverse();
};

// 工单详情
const handelWorkOrderDetail = (record) => {
 workOrderModalRef.value.showModal(record)
}

onMounted(async () => {
  // await getOptionsData();
  await getAlarmRecordsStatistics();
  const spaceRes = await spaceTree();
  spaceTreeData.value = spaceRes;
});
</script>

<style scoped lang="less">
.checked-box {
  display: flex;
  justify-content: flex-start;
  align-content: center;
}
</style>