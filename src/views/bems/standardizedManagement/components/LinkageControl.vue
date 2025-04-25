<template>
  <div>
    <BasicTable v-if="!showForm" @register="registerTable">
      <!-- 表格顶部按钮 -->
      <template #tableTitle>
        <a-button v-if="hasPermission('bems:device_data:amend')" type="primary" :icon="h(EditOutlined)"
          @click="addStrategy"> 新增 </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'strategyName'">
          <a>{{ record.strategyName }}</a>
        </template>
        <template v-if="column.key === 'enabledStatus'">
          {{ record.enabledStatus ? '已启用' : '已禁用' }}
        </template>
        <template v-if="column.key === 'active'">
          <a-space>
            <a @click.stop="handleStart(record)">启用</a>
            <a @click.stop="handleEdit(record)">编辑</a>
            <a @click.stop="handleDelete(record)" style="color: red;">删除</a>
          </a-space>
        </template>
        <template v-if="column.key === 'name'">
          <a @click="handleStart(record)">{{ record.name }}</a>
        </template>
        <template v-if="column.key === 'history'">
          <a @click="handleStart(record)">查看</a>
        </template>
      </template>
      <template #expandedRowRender="{ record }">
        <div class="expand-box">前置设备：{{ record.frontDevice }} </div>
        <div class="expand-box">联动设备：{{ record.rearDevice }} </div>
      </template>
    </BasicTable>
    <div class="info-box" v-else>
      <linkage-control-strategy-list ref="linkageFormRef" :closeStrategy="closeStrategy" :type="type" :editItem="editItem"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { h } from 'vue';
import { EditOutlined } from '@ant-design/icons-vue';
import { usePermissionStore } from '/@/store/modules/permission';
import LinkageControlStrategyList from './LinkageControlStrategyList.vue'
import { getLinkageControlListApi } from '../Standardized.api'


const dataSource = ref([
  {
    code: 'test1',
    name: '测试名称1',
    target: '测试处理目标1',
    time: '2025-04-23 14:48:00',
    person: '测试设置人1',
    status: '测试策略状态1',
    history: '测试执行历史1'
  },
  {
    code: 'test2',
    name: '测试名称2',
    target: '测试处理目标2',
    time: '2025-04-23 14:48:00',
    person: '测试设置人2',
    status: '测试策略状态2',
    history: '测试执行历史2'
  },
  {
    code: 'test3',
    name: '测试名称3',
    target: '测试处理目标3',
    time: '2025-04-23 14:48:00',
    person: '测试设置人3',
    status: '测试策略状态3',
    history: '测试执行历史3'
  },
  {
    code: 'test4',
    name: '测试名称4',
    target: '测试处理目标4',
    time: '2025-04-23 14:48:00',
    person: '测试设置人4',
    status: '测试策略状态4',
    history: '测试执行历史4'
  },
])

const showForm = ref<boolean>(false);

const linkageFormRef = ref()

// 打开类型
const type = ref('')
const editItem = ref<any>()

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
    title: '策略编号',
    dataIndex: 'strategyCode',
    key: 'strategyCode',
  },
  {
    title: '策略名称',
    dataIndex: 'strategyName',
    key: 'strategyName',
  },
  {
    title: '处理目标',
    dataIndex: 'strategyTarget',
    key: 'strategyTarget',
  },
  {
    title: '设置时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '设置人',
    dataIndex: 'createBy',
    key: 'createBy',
  },
  {
    title: '策略状态',
    dataIndex: 'enabledStatus',
    key: 'enabledStatus',
  },
  {
    title: '执行历史',
    key: 'history',
    dataIndex: 'history',
    width: '80px',
  },
  {
    title: '操作',
    dataIndex: 'active',
    key: 'active',
  }
];

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '策略名称', //显示label
    field: 'name', //查询字段
    component: 'JInput', //渲染的组件
    // slot: 'name', //设置默认值
  },
  {
    label: '前置设置', 
    field: 'seting', 
    component: 'JInput', 
  },
  {
    label: '联动设备', 
    field: 'device', 
    component: 'JInput', 
  }
];

// 获取表格数据
const getLinkageControlList = async () => {
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    // pageNo: '',
    pageSize: 999999999,
    strategyName: searchData.strategyName ? searchData.strategyName : undefined,
    frontDevice: searchData.frontDevice ? searchData.frontDevice : undefined,
    rearDevice: searchData.rearDevice ? searchData.rearDevice : undefined,
  }
  let res = await getLinkageControlListApi(params)
  return res.records
}

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    // dataSource: dataSource.value,
    api: getLinkageControlList,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
    expandRowByClick: true,
    rowKey: 'id',
    pagination: {
      current: pagination.value.pageNo,
      pageSize: pagination.value.pageSize,
      pageSizeOptions: ['10', '20', '30', '50'],
    },
    formConfig: {
      schemas: searchFormSchema,
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
const hasPermission = (permission:string) => {
  if (!permission) return true;

  const currentPermissions = permissionList.value;

  if (Array.isArray(permission)) {
    return permission.some((perm) => currentPermissions.includes(perm));
  }

  return currentPermissions.includes(permission);
};

// 新增
const addStrategy = () => {
  showForm.value = true
  type.value = 'create'
}

// 关闭form表单
const closeStrategy = () => {
  showForm.value = false
}

// 启用
const handleStart = (record) => {
  console.log('启用----------->', record);
}

// 编辑
const handleEdit = (record) => {
  editItem.value = record
  type.value = 'edit'
  console.log('edit-----------1---------->', editItem.value, record);
  showForm.value = true
}

// 删除
const handleDelete = (record) => {
  console.log('删除----------->', record);
}

// 表单数据
const formState = reactive({
  name: '',
  age: undefined,
  email: '',
  phone: '',
  address: ''
});

// 提交表单
const onFinish = values => {
  console.log('Received values:', values);
};
</script>

<style scoped lang="less">
.expand-box{
  margin-left: 10px;
  font-size: 16px;
}
.info-box{
  .info-title{
    height: 40px;
    display: flex;
    align-items: center;
    padding-left: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    background-color: #374352;
    border-radius: 5px 5px 0 0;
  }
  .info-list{
    padding: 16px;
    .list-title{
      width: 100%;
      height: 40px;
      padding-left: 10px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #d4d0d0;
    }
    .list-form{
      width: 100%;
      margin-top: 16px;
    }
  }
}
</style>