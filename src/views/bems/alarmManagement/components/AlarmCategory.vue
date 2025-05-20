<template>
  <div>
    <BasicTable @register="registerTable">
      <!-- 表格顶部按钮 -->
      <template #tableTitle>
        <a-button v-if="hasPermission('bems:device_data:amend')" type="primary" :icon="h(EditOutlined)"
          @click="addAlarmLevel"> 新增 </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'active'">
          <a-space>
            <a @click.stop="handleEdit(record)">编辑</a>
            <a-popconfirm v-if="!Number(record.status)" title="是否启用？" ok-text="确定" cancel-text="取消" @confirm="handleEnable(record)">
              <a @click.stop>启用</a>
            </a-popconfirm>
            <a-popconfirm v-else title="是否停用？" ok-text="确定" cancel-text="取消" @confirm="handleDisable(record)">
              <a @click.stop style="color: red;">停用</a>
            </a-popconfirm>
            <a-popconfirm title="是否删除？" ok-text="确定" cancel-text="取消" @confirm="handleDelete(record)">
              <a style="color: red;">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </BasicTable>
    <div class="info-box">
      <add-alarm-category-modal ref="categoryModalRef" :reload="reload"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onBeforeUnmount } from 'vue'
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { h } from 'vue';
import { EditOutlined } from '@ant-design/icons-vue';
import { usePermissionStore } from '/@/store/modules/permission';
import AddAlarmCategoryModal from './AddAlarmCategoryModal.vue'
import { getAlarmCategoryPageListApi, deleteAlarmCategoryApi, editAlarmCategoryApi, enableAlarmCategoryApi, disableAlarmCategoryApi } from '../Standardized.api'
import { message } from 'ant-design-vue';

const showForm = ref<boolean>(false);

const categoryModalRef = ref()

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
    title: '编号',
    dataIndex: 'index',
    key: 'index',
    width: '80px',
    customRender: ({ index }) => index + 1, // 显示序号，从 1 开始
  },
  {
    title: '类别编号',
    dataIndex: 'alarmCategoryCode',
    key: 'alarmCategoryCode',
  },
  {
    title: '类别名称',
    dataIndex: 'alarmCategoryName',
    key: 'alarmCategoryName',
  },
  {
    title: '创建人',
    dataIndex: 'createBy',
    key: 'createBy',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
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
    label: '等级信息', //显示label
    field: 'name', //查询字段
    component: 'JInput', //渲染的组件
    // slot: 'name', //设置默认值
  },
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
  let res = await getAlarmCategoryPageListApi(params)
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
const addAlarmLevel = () => {
  categoryModalRef.value.showModal('create')
}

// 编辑
const handleEdit = (record) => {
  console.log('editAlarmLevel--------->', record);
  categoryModalRef.value.showModal('edit', record)
}

// 关闭form表单
const closeStrategy = () => {
  showForm.value = false
}

// 启用
const handleEnable = async (record) => {
  await enableAlarmCategoryApi({ id: record.id })
  message.success('启用成功！');
  reload()
}

// 停用
const handleDisable = async (record) => {
  await disableAlarmCategoryApi({ id: record.id })
  message.success('停用成功！');
  reload()
}

// 查看
const checkDetail = (record) => {
  editItem.value = record
  type.value = 'check'
  showForm.value = true
}

// 删除
const handleDelete = async (record) => {
  await deleteAlarmCategoryApi({id: record.id})
  message.success('删除成功！');
  // 刷新表格
  reload();
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
const reloadTable = values => {
  // 刷新表格
  reload();
};

onBeforeUnmount(() => {
  showForm.value = false
})
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