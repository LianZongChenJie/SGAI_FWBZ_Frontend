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
        <template v-if="column.key === 'status'">
          {{ getStatus(record.status) }}
        </template>
        <template v-if="column.key === 'spaceId'">
          {{ getSpace(record.spaceId) }}
        </template>
        <template v-if="column.key === 'active'">
          <a-space>

            <a-popconfirm
              title="确认开启/关闭吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleCircuitChange(record)"
            >
              <a-switch
                :checked="record.status == '1'"
                :disabled="false"
              />
            </a-popconfirm>
            &emsp;
            <a @click.stop="handelDetail(record)">详情</a>
          </a-space>
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
import { spaceTree, getCircuitListApi, startCircuitApi, closeCircuitApi } from './Standardized.api';
import { message } from 'ant-design-vue';
import AddModal from './components/AddModal.vue';
import DetailModal from './components/DetailModal.vue';

const pagination = ref({
  pageNo: 1,
  pageSize: 10,
});

const addModalRef = ref();
const detailModalRef = ref();

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
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '操作',
    dataIndex: 'active',
    key: 'active',
    width: '200px',
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
const getData = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    name: searchData.spaceId ? searchData.spaceId : undefined,
    num: searchData.alarmLevelId ? searchData.alarmLevelId : undefined,
    space: searchData.alarmCategoryId ? searchData.alarmCategoryId : undefined,
    status: searchData.deviceIds ? searchData.deviceIds.split('*')[1] : undefined,
  };
  let res = await getCircuitListApi(params);
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
    //定义rowSelection的类型，默认是checkbox多选，可以设置成radio单选
    rowSelection: { type: 'checkbox' },
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
const getStatus = (status) => {
  let statueStr = '';
  switch (status) {
    case '1':
      statueStr = '开启';
      break;
    case '2':
      statueStr = '关闭';
      break;
    case '3':
      statueStr = '故障';
      break;
    case '4':
      statueStr = '离线';
      break;
  }
  return statueStr;
};

// 新增
const addConfig = () => {
  addModalRef.value.showModal(0);
};

// 开启/关闭
const handleCircuitChange = async (record) => {
  let res;
  if (record.status !== '1') {
    res = await startCircuitApi({ id: record.id });
    if (!res) message.success('开启成功！');
  } else {
    res = await closeCircuitApi({ id: record.id });
    if (!res) message.success('关闭成功！');
  }
  reload();
};

// 详情
const handelDetail = (record) => {
  detailModalRef.value.showModal(record);
};

onMounted(async () => {
  const spaceRes = await spaceTree();
  spaceTreeData.value = spaceRes;
});
</script>

<style scoped lang="less">
</style>