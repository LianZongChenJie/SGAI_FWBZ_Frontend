<template>
  <div>
    <BasicTable @register="registerTable">
      <!-- 表格顶部按钮 -->
      <!-- <template #tableTitle>
        <a-button
          v-if="hasPermission('bems:device_data:amend')"
          type="primary"
          :icon="h(EditOutlined)"
          @click="addAlarmLevel"
        > 新增 </a-button>
      </template> -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'active'">
          <a-space>
            <a @click.stop="handleEdit(record)">编辑</a>
          </a-space>
        </template>
      </template>
    </BasicTable>
    <div class="info-box">
      <UpdateBusinessConfigurationModal
        ref="configModalRef"
        :reload="reload"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onBeforeUnmount } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { h } from 'vue';
import { EditOutlined } from '@ant-design/icons-vue';
import { usePermissionStore } from '/@/store/modules/permission';
import UpdateBusinessConfigurationModal from './components/UpdateBusinessConfigurationModal.vue';
import {
  getBusinessConfigListApi,
} from './Standardized.api';
import { message } from 'ant-design-vue';

const showForm = ref<boolean>(false);

const configModalRef = ref();

// 打开类型
const type = ref('');
const editItem = ref<any>();

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
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '关键字',
    dataIndex: 'configKey',
    key: 'configKey',
  },
  {
    title: '值',
    dataIndex: 'configValue',
    key: 'configValue',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
  },
  {
    title: '操作',
    dataIndex: 'active',
    key: 'active',
    width: 120,
  },
];

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '关键字', //显示label
    field: 'key', //查询字段
    component: 'JInput', //渲染的组件
    // slot: 'name', //设置默认值
  },
  {
    label: '名称', //显示label
    field: 'name', //查询字段
    component: 'JInput', //渲染的组件
    // slot: 'name', //设置默认值
  },
  {
    label: '备注', //显示label
    field: 'remark', //查询字段
    component: 'JInput', //渲染的组件
    // slot: 'name', //设置默认值
  },
];

// 获取表格数据
const getLinkageControlList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    key: searchData.key ? searchData.key.split('*')[1] : undefined,
    name: searchData.name ? searchData.name.split('*')[1] : undefined, 
    remark: searchData.remark ? searchData.remark.split('*')[1] : undefined,
  };
  let res = await getBusinessConfigListApi(params);
  
  // 返回格式必须包含records和total
  return {
    records: res, // 当前页数据
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
    rowKey: 'id',
    showTableSetting:false,
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
    },
    formConfig: {
      // schemas: searchFormSchema,
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

// 新增
const addAlarmLevel = () => {
  configModalRef.value.showModal('create');
};

// 编辑
const handleEdit = (record) => {
  console.log('editAlarmLevel--------->', record);
  configModalRef.value.showModal('edit', record);
};

// 关闭form表单
const closeStrategy = () => {
  showForm.value = false;
};

// 表单数据
const formState = reactive({
  name: '',
  age: undefined,
  email: '',
  phone: '',
  address: '',
});

// 提交表单
const reloadTable = (values) => {
  // 刷新表格
  reload();
};

onBeforeUnmount(() => {
  showForm.value = false;
});
</script>

<style scoped lang="less">
.expand-box {
  margin-left: 10px;
  font-size: 16px;
}
.info-box {
  .info-title {
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
  .info-list {
    padding: 16px;
    .list-title {
      width: 100%;
      height: 40px;
      padding-left: 10px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #d4d0d0;
    }
    .list-form {
      width: 100%;
      margin-top: 16px;
    }
  }
}
</style>