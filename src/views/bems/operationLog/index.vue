<template>
  <div class="">
    <BasicTable @register="registerTable">
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
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'controlType'">
          {{ getControlType(record.controlType) }}
        </template>
        <template v-if="column.key === 'switchType'">
          {{ record.switchType ? '开' : '关' }}
        </template>
      </template>
    </BasicTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { usePermissionStore } from '/@/store/modules/permission';
import { spaceTree, getOperationLogListApi } from './Standardized.api';
import { message } from 'ant-design-vue';

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
    title: '控制类型',
    dataIndex: 'controlType',
    key: 'controlType',
    width: 120,
  },
  {
    title: '名称',
    dataIndex: 'theName',
    key: 'theName',
  },
  {
    title: '开关类型',
    dataIndex: 'switchType',
    key: 'switchType',
    width: 240,
  },
  {
    title: '操作人姓名',
    dataIndex: 'createBy',
    key: 'createBy',
    width: 120,
  },
  {
    title: '控制时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 240,
  },
];

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '控制类型',
    field: 'controlType',
    component: 'Select',
    componentProps: {
      options: [
        { label: '远程控制', value: '1' },
        { label: '计划模式', value: '2' },
        { label: '情景控制', value: '3' },
        { label: '节目控制', value: '4' },
        // 这里需要根据实际数据补充选项
      ],
    },
  },
  {
    label: '回路名称', //显示label
    field: 'theName', //查询字段
    component: 'JInput', //渲染的组件
  },
  {
    field: 'date',
    label: '开始结束日期',
    //自动触发检验，布尔类型
    component: 'RangePicker', //渲染的组件
    // slot: 'name', //设置默认值
    componentProps: {
      placeholder: ['开始时间', '结束时间'],
      showTime: true,
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      // defaultValue: [formatDate(getFirstDayOfMonth()), formatDate(getToday())]
    },
  },
];

// 空间位置树数据
const spaceTreeData = ref([]);
const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

// 获取表格数据
const getData = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  console.log('searchData------------->', searchData);
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    theName: searchData.theName ? searchData.theName.split('*')[1] : undefined,
    controlType: searchData.controlType ? searchData.controlType : undefined,
    startDate: searchData.date ? searchData.date.split(',')[0] : undefined,
    endDate: searchData.date ? searchData.date.split(',')[1] : undefined,
  };
  let res = await getOperationLogListApi(params);
  return {
    records: res.records, // 当前页数据
    total: res.total, // 总记录数
  };
};

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    // dataSource: dataSource.value,
    api: getData,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
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

// 处理所在区域
const getSpace = (spaceId) => {
  return findTreeNode(spaceTreeData.value, spaceId + '');
};
const findTreeNode = (tree, id) => {
  for (const item of tree) {
    if (item.key === id) {
      return item.title; // 直接返回找到的 title
    }
    if (item.children && item.children.length) {
      const result = findTreeNode(item.children, id);
      if (result) return result; // 如果在子级中找到，直接返回结果
    }
  }
  return null; // 未找到返回 null
};

// 处理状态
const getControlType = (type) => {
  let controlStr = '';
  switch (type) {
    case '1':
      controlStr = '远程控制';
      break;
    case '2':
      controlStr = '计划模式';
      break;
    case '3':
      controlStr = '情景控制';
      break;
    case '4':
      controlStr = '节目控制';
      break;
  }
  return controlStr;
};

onMounted(async () => {
  const spaceRes = await spaceTree();
  spaceTreeData.value = spaceRes;
});
</script>

<style scoped lang="less">
</style>