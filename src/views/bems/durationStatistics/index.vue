<template>
  <div class="">
    <BasicTable
      @register="registerTable"
      :rowSelection="rowSelection"
    >
      <template #tableTitle>
        <a-button
          type="primary"
          @click="addConfig"
        > 新增 </a-button>
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
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'allDuration'">
          {{ formatDuration(record.allDuration) }}
        </template>
        <template v-if="column.key === 'spaceId'">
          {{ getSpace(record.spaceId) }}
        </template>
      </template>
    </BasicTable>
    <AddModal
      ref="addModalRef"
      :reload="reload"
    />
    <DetailModal ref="detailModalRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { usePermissionStore } from '/@/store/modules/permission';
import { spaceTree, getDurationStatisticsListApi, startCircuitApi, closeCircuitApi } from './Standardized.api';
import { message } from 'ant-design-vue';
import AddModal from './components/AddModal.vue';
import DetailModal from './components/DetailModal.vue';
const addModalRef = ref();
const detailModalRef = ref();

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
    title: '回路名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '回路编号',
    dataIndex: 'num',
    key: 'num',
  },
  {
    title: '安装位置',
    dataIndex: 'deviceName',
    key: 'deviceName',
  },
  {
    title: '所在区域',
    dataIndex: 'spaceId',
    key: 'spaceId',
  },
  {
    title: '累计时长',
    dataIndex: 'allDuration',
    key: 'allDuration',
  },
];

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '回路名称', //显示label
    field: 'deviceIds', //查询字段
    component: 'JInput', //渲染的组件
  },
  {
    label: '回路编号',
    field: 'alarmCategoryId',
    component: 'JInput',
  },
  {
    label: '所在区域',
    field: 'spaceId',
    component: 'JInput',
    slot: 'spaceId',
  },
  // {
  //   label: '回路状态',
  //   field: 'spaceId',
  //   component: 'JInput',
  //   slot: 'spaceId',
  // },
];

// 空间位置树数据
const spaceTreeData = ref([]);
const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

// 获取表格数据
const getData = async () => {
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    pageNo: 1,
    pageSize: 999999999,
    name: searchData.spaceId ? searchData.spaceId : undefined,
    num: searchData.alarmLevelId ? searchData.alarmLevelId : undefined,
    space: searchData.alarmCategoryId ? searchData.alarmCategoryId : undefined,
    status: searchData.deviceIds ? searchData.deviceIds.split('*')[1] : undefined,
  };
  let res = await getDurationStatisticsListApi(params);
  console.log('res.records------------->', res.records);
  return res.records;
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
    //定义rowSelection的类型，默认是checkbox多选，可以设置成radio单选
    rowSelection: { type: 'checkbox' },
    pagination: {
      current: pagination.value.pageNo,
      pageSize: pagination.value.pageSize,
      pageSizeOptions: ['10', '20', '30', '50'],
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
const [registerTable, { reload, getForm }, { rowSelection, selectedRows, selectedRowKeys }] = tableContext;

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
const formatDuration = (ms) => {
  if (isNaN(ms)) return '无效输入';
  if (ms === 0) return '0秒';

  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts: string[] = [];
  parts.push(` ${days} 天`);
  parts.push(` ${hours} 小时`);
  parts.push(` ${minutes} 分钟`);
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(` ${remainingSeconds} 秒`);
  }

  return parts.join('');
};

// 新增
const addConfig = () => {
  addModalRef.value.showModal(0);
};

onMounted(async () => {
  const spaceRes = await spaceTree();
  spaceTreeData.value = spaceRes;
});
</script>

<style scoped lang="less">
</style>