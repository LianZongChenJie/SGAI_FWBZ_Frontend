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
        <a-popconfirm
          title="确认删除所选数据？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="batchDelete()"
        >
          <a-button
            type="primary"
            danger
          > 批量删除 </a-button>
        </a-popconfirm>

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
          {{ record.status ? '开启' : '关闭' }}
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
            <a @click.stop="editItem(record)">编辑</a>
            &emsp;
            <a-popconfirm
              title="确认删除该条数据？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="confirmDelete(record)"
            >
              <a style="color: red;">删除</a>
            </a-popconfirm>
            &emsp;
            <a @click.stop="configModal(record)">配置</a>
          </a-space>
        </template>
      </template>
    </BasicTable>
    <AddModal
      ref="addModalRef"
      :reload="reload"
    />
    <ConfigModal ref="configModalRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { usePermissionStore } from '/@/store/modules/permission';
import {
  spaceTree,
  getSituationalControlListApi,
  deleteScenariosByIdApi,
  batchDeleteCircuitApi,
  startSituationalApi,
  closeSituationalApi,
} from './Standardized.api';
import { message } from 'ant-design-vue';
import AddModal from './components/AddModal.vue';
import ConfigModal from './components/ConfigModal.vue';

const addModalRef = ref();
const configModalRef = ref();

// 打开类型
const type = ref('');

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
    title: '空间名称',
    dataIndex: 'spaceName',
    key: 'spaceName',
  },
  {
    title: '节目名称',
    dataIndex: 'groupName',
    key: 'groupName',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
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
    label: '空间名称', //显示label
    field: 'spaceName', //查询字段
    component: 'JInput', //渲染的组件
  },
  {
    label: '节目名称',
    field: 'groupName',
    component: 'JInput',
  },
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
    spaceName: searchData.spaceName ? searchData.spaceName.split('*')[1] : undefined,
    groupName: searchData.groupName ? searchData.groupName.split('*')[1] : undefined,
  };
  let res = await getSituationalControlListApi(params);
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

// 新增
const addConfig = () => {
  addModalRef.value.showModal(0);
};

// 开启/关闭
const handleCircuitChange = async (record) => {
  let res;
  if (record.status !== '1') {
    res = await startSituationalApi({ id: record.id });
    if (!res) message.success('开启成功！');
  } else {
    res = await closeSituationalApi({ id: record.id });
    if (!res) message.success('关闭成功！');
  }
  reload();
};

// 编辑
const editItem = (record) => {
  addModalRef.value.showModal(1, record);
};

// 批量删除
const batchDelete = async () => {
  console.log(selectedRows.value);
  await batchDeleteCircuitApi({ ids: selectedRowKeys.value.join(',') });
  reload();
  message.success('删除成功！');
};

// 配置
const configModal = (record) => {
  configModalRef.value.showModal(record);
};

const confirmDelete = async (record) => {
  await deleteScenariosByIdApi({ id: record.id });
  reload();
  message.success('删除成功！');
};

onMounted(async () => {
  const spaceRes = await spaceTree();
  spaceTreeData.value = spaceRes;
});
</script>

<style scoped lang="less">
</style>