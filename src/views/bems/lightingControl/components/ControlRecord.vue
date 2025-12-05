<template>
  <div class="">
    <BasicTable @register="registerTable">
    </BasicTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { usePermissionStore } from '/@/store/modules/permission';
import { controlRecordListApi } from '../Standardized.api';
import { message } from 'ant-design-vue';

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
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: '300px',
  },
  {
    title: '分类',
    dataIndex: 'relType',
    key: 'relType',
  },
  {
    title: '操作类型',
    dataIndex: 'operationType',
    key: 'operationType',
  },
  {
    title: '操作时间',
    dataIndex: 'operationTime',
    key: 'operationTime',
  },
  {
    title: '操作人',
    dataIndex: 'operationBy',
    key: 'operationBy',
  },
];

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '分类', //显示label
    field: 'relType', //查询字段
    component: 'JInput', //渲染的组件
  },
  {
    label: '报警日期', //显示label
    field: 'time', //查询字段
    component: 'RangePicker', //渲染的组件
    // slot: 'name', //设置默认值
    componentProps: {
      placeholder: ['开始时间', '结束时间'],
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      // defaultValue: [formatDate(getFirstDayOfMonth()), formatDate(getToday())],
    },
  },
];


// 获取表格数据
const controlRecordList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    relType: searchData.relType ? searchData.relType.split('*')[1] : undefined,
    startTime: searchData.time ? searchData.time.split(',')[0] : undefined,
    endTime: searchData.time ? searchData.time.split(',')[1] : undefined,
  };

  let res = await controlRecordListApi(params);
  return {
    records: res.records, // 当前页数据
    total: res.total, // 总记录数
  };
};

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    // dataSource: dataSource.value,
    api: controlRecordList,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
    showTableSetting: false,
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

const getStatus = (statusId) => {
  let status = '';
  switch (statusId) {
    case '1':
      status = '未处理';
      break;
    case '2':
      status = '误报';
      break;
    case '3':
      status = '已转工单';
      break;
    case '4':
      status = '已处理';
      break;
  }
  return status;
};

onMounted(async () => {
  // await getOptionsData();
});
</script>

<style scoped lang="less">
.checked-box {
  display: flex;
  justify-content: flex-start;
  align-content: center;
}
</style>