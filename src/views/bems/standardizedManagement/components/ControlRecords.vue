<template>
  <div>
    <BasicTable @register="registerTable">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'enabledStatus'">
          {{ Number(record.enabledStatus) ? '已启用' : '已禁用' }}
        </template>
        <template v-if="column.key === 'active'">
          <a-space>
            <a @click.stop="checkDetail(record)">查看</a>
          </a-space>
        </template>
      </template>
    </BasicTable>
    <control-records-modal ref="detailRef" />
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
import { getLinkageControlListApi, deleteLinkageControlApi, enableLinkageControlApi, disableLinkageControlApi } from '../Standardized.api'
import { message } from 'ant-design-vue';
import ControlRecordsModal from './ControlRecordsModal.vue'

const showForm = ref<boolean>(false);

const detailRef = ref()

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
    title: '策略名称',
    dataIndex: 'strategyCode',
    key: 'strategyCode',
  },
  {
    title: '执行状态',
    dataIndex: 'strategyName',
    key: 'strategyName',
    width: '120px'
  },
  {
    title: '执行详情',
    dataIndex: 'active',
    key: 'active',
    width: '120px'
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
    label: '执行时间', //显示label
    field: 'name', //查询字段
    component: 'RangePicker', //渲染的组件
    // slot: 'name', //设置默认值
    componentProps: {
      placeholder: ['开始时间', '结束时间'],
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
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

// 查看
const checkDetail = (record) => {
  detailRef.value.showModal()
}

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