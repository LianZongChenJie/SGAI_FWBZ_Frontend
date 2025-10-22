<template>
  <div>
    <BasicTable
      v-if="!showForm"
      @register="registerTable"
    >
      <!-- 表格顶部按钮 -->
      <template #tableTitle>
        <a-button
          v-if="hasPermission('bems:device_data:amend')"
          type="primary"
          :icon="h(EditOutlined)"
          @click="addStrategy"
        > 新增 </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'strategyName'">
          <a @click.stop="checkDetail(record)">{{ record.strategyName }}</a>
        </template>
        <template v-if="column.key === 'enabledStatus'">
          {{ Number(record.enabledStatus) ? '已启用' : '已禁用' }}
        </template>
        <template v-if="column.key === 'active'">
          <a-space>
            <a-popconfirm
              v-if="Number(record.enabledStatus)"
              title="是否禁用？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDisable(record)"
            >
              <a
                @click.stop
                style="color: red;"
              >禁用</a>
            </a-popconfirm>
            <a-popconfirm
              v-else
              title="是否启用？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleEnable(record)"
            >
              <a @click.stop>启用</a>
            </a-popconfirm>
            <a @click.stop="handleEdit(record)">编辑</a>
            <a-popconfirm
              title="删除不可恢复，是否删除？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <a
                @click.stop
                style="color: red;"
              >删除</a>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-if="column.key === 'name'">
          <a @click.stop="handleview(record)">{{ record.name }}</a>
        </template>
        <template v-if="column.key === 'history'">
          <a @click.stop="handleview(record)">查看</a>
        </template>
      </template>
      <template #expandedRowRender="{ record }">
        <div class="expand-box">前置设备：{{ record.frontDevice }} </div>
        <div class="expand-box">联动设备：{{ record.rearDevice }} </div>
      </template>
    </BasicTable>
    <div
      class="info-box"
      v-else
    >
      <linkage-control-strategy-list
        ref="linkageFormRef"
        :closeStrategy="closeStrategy"
        :type="type"
        :editItem="editItem"
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
import LinkageControlStrategyList from './LinkageControlStrategyList.vue';
import { getLinkageControlListApi, deleteLinkageControlApi, enableLinkageControlApi, disableLinkageControlApi } from '../Standardized.api';
import { message } from 'ant-design-vue';
import { log } from 'console';

const props = defineProps({
  checkControlRecords: {
    type: Function,
    default: () => {},
  },
});

const showForm = ref<boolean>(false);

const linkageFormRef = ref();

// 打开类型
const type = ref('');
const editItem = ref<any>();

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
  },
];

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '策略名称', //显示label
    field: 'strategyName', //查询字段
    component: 'JInput', //渲染的组件
    // slot: 'name', //设置默认值
  },
  {
    label: '前置设置',
    field: 'frontDevice',
    component: 'JInput',
  },
  {
    label: '联动设备',
    field: 'rearDevice',
    component: 'JInput',
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
    strategyName: searchData.strategyName ? searchData.strategyName.split('*')[1] : undefined,
    frontDevice: searchData.frontDevice ? searchData.frontDevice.split('*')[1] : undefined,
    rearDevice: searchData.rearDevice ? searchData.rearDevice.split('*')[1] : undefined,
  };
  let res = await getLinkageControlListApi(params);
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
    showTableSetting:false,
    showActionColumn: false,
    size: 'middle',
    expandRowByClick: true,
    rowKey: 'id',
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
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
const hasPermission = (permission: string) => {
  if (!permission) return true;

  const currentPermissions = permissionList.value;

  if (Array.isArray(permission)) {
    return permission.some((perm) => currentPermissions.includes(perm));
  }

  return currentPermissions.includes(permission);
};

// 新增
const addStrategy = () => {
  showForm.value = true;
  type.value = 'create';
};

// 关闭form表单
const closeStrategy = () => {
  showForm.value = false;
};

// 启用
const handleEnable = async (record) => {
  await enableLinkageControlApi({ id: record.id });
  message.success('启用成功！');
  reload();
};

// 禁用
const handleDisable = async (record) => {
  await disableLinkageControlApi({ id: record.id });
  message.success('禁用成功！');
  reload();
};

// 编辑
const handleEdit = (record) => {
  editItem.value = record;
  type.value = 'edit';
  showForm.value = true;
};

// 查看
const checkDetail = (record) => {
  editItem.value = record;
  type.value = 'check';
  showForm.value = true;
};

// 跳转到控制记录
const handleview = (record) => {
  props.checkControlRecords(record);
};

// 删除
const handleDelete = async (record) => {
  await deleteLinkageControlApi({ id: record.id });
  message.success('删除成功！');
  // 刷新表格
  reload();
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
const onFinish = (values) => {
  console.log('Received values:', values);
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