<template>
  <div class="">
    <BasicTable @register="registerTable">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'content'">
          <a-popover>
                <template #content>
                  <p>{{ record.content }}</p>
                </template>
                <div class="content-box">{{ record.content }}</div>
              </a-popover>
        </template>
        <template v-if="column.key === 'action'">
          <a @click.stop="getHistory(record)">查看历史</a>
        </template>
      </template>
    </BasicTable>
    <HistoryModal ref="historyModalRef"/>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { usePermissionStore } from '/@/store/modules/permission';
import {
  getBuildingControlPointListApi,
} from './Standardized.api';
import { message } from 'ant-design-vue';
import HistoryModal from './components/HistoryModal.vue'

const historyModalRef = ref()

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
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 120,
  },
  {
    title: '网关地址',
    dataIndex: 'gatewayAdr',
    key: 'gatewayAdr',
  },
  {
    title: '通信地址',
    dataIndex: 'bacnetAdr',
    key: 'bacnetAdr',
  },
  {
    title: '值',
    dataIndex: 'value',
    key: 'value',
    width: 120,
  },
  {
    title: '采集时间',
    dataIndex: 'collectionTime',
    key: 'collectionTime',
    width: 240,
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 120,
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
  },
];

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '网关地址', //显示label
    field: 'gatewayAdr', //查询字段
    component: 'JInput', //渲染的组件
  },
  {
    label: '通信地址', //显示label
    field: 'bacnetAdr', //查询字段
    component: 'JInput', //渲染的组件
  }
];

// 获取表格数据
const getBuildingControlPointList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    gatewayAdr: searchData.gatewayAdr ? searchData.gatewayAdr.split('*')[1] : undefined,
    bacnetAdr: searchData.bacnetAdr ? searchData.bacnetAdr.split('*')[1] : undefined,
  };
  let res = await getBuildingControlPointListApi(params);
  return {
    records: res.records, // 当前页数据
    total: res.total, // 总记录数
  };
};

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    // dataSource: dataSource.value,
    api: getBuildingControlPointList,
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

// 查看历史
const getHistory = (record) => {
  historyModalRef.value.showModal(record)
}

onMounted(async () => {
});
</script>

<style scoped lang="less">
.checked-box {
  display: flex;
  justify-content: flex-start;
  align-content: center;
}

.content-box{
  white-space: nowrap;      /* 禁止换行 */
  overflow: hidden;         /* 隐藏溢出内容 */
  text-overflow: ellipsis;  /* 显示省略号 */
  width: 120px; 
}
</style>