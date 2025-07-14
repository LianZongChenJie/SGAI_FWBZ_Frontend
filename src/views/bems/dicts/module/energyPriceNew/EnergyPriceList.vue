<template>
  <div>
    <!--引用表格-->
    <BasicTable
      @register="registerTable"
      :rowSelection="rowSelection"
    >
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button
          type="primary"
          v-auth="'bems:energy_price:add'"
          @click="handleAdd"
          preIcon="ant-design:plus-outlined"
        > 新增</a-button>
        <!-- <a-button  type="primary" v-auth="'bems:energy_price:exportXls'" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button> -->
        <!-- <j-upload-button type="primary" v-auth="'bems:energy_price:importExcel'" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button> -->
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item
                key="1"
                @click="batchHandleDelete"
              >
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button v-auth="'bems:energy_price:deleteBatch'">批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
        <!-- 高级查询 -->
        <!-- <super-query :config="superQueryConfig" @search="handleSuperQuery" /> -->
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <!-- <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" /> -->
        <div>
          <a @click="handleEdit(record)">编辑</a>
          &nbsp;
          <a @click="handleDetail(record)">详情</a>
          &nbsp;
          <a-popconfirm
            title="确认删除该条数据？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="handleDelete(record)"
          >
            <a style="color: red;">删除</a>
          </a-popconfirm>
        </div>
      </template>
      <!--字段回显插槽-->
      <!-- <template v-slot:bodyCell="{ column, record, index, text }"> </template> -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'categoryId'">
          {{ getCategory(record.categoryId) }}
        </template>
        <template v-if="column.key === 'billingWay'">
          {{ getBillingWay(record.billingWay) }}
        </template>
        <!-- <template v-if="column.key === 'status'">
          {{ Number(record.status) ? '已启用' : '已禁用' }}
        </template> -->
        <template v-if="column.key === 'status'">
          <!-- 自动算法 -->
          <a-switch
            :checked="record.status == '1'"
            :disabled="false"
            @change="(checked) => handleStatusChange(record, checked)"
          />
        </template>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <!-- <EnergyPriceModal @register="registerModal" @success="handleSuccess"></EnergyPriceModal> -->
    <AddEnerPriceModal
      ref="enerPriceModalRef"
      :reload="reload"
    />
  </div>
</template>

<script lang="ts" name="bems-energyPrice" setup>
import { ref, reactive, computed, onMounted, unref } from 'vue';
import { BasicColumn,FormSchema, BasicTable, useTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useListPage } from '/@/hooks/system/useListPage';
import EnergyPriceModal from './components/EnergyPriceModal.vue';
import AddEnerPriceModal from './components/AddEnerPriceModal.vue';
import { columns, searchFormSchema, superQuerySchema } from './EnergyPrice.data';
import { list, deleteOne, batchDelete, getImportUrl, getExportUrl, categoryTree, enableEnergyPriceApi, disableEnergyPriceApi } from './EnergyPrice.api';
import { downloadFile } from '/@/utils/common/renderUtils';
import { useUserStore } from '/@/store/modules/user';
import { message } from 'ant-design-vue';
const queryParam = reactive<any>({});
const checkedKeys = ref<Array<string | number>>([]);
const userStore = useUserStore();

// 表格columns
const myColumns: BasicColumn[] = [
  {
    title: '仪表类别',
    key: 'categoryId',
    dataIndex: 'categoryId',
  },
  {
    title: '计费方式',
    key: 'billingWay',
    dataIndex: 'billingWay',
  },
  {
    title: '状态',
    key: 'status',
    dataIndex: 'status',
  },
  {
    title: '创建人',
    key: 'createBy',
    dataIndex: 'createBy',
  },
  {
    title: '创建日期',
    key: 'createTime',
    dataIndex: 'createTime',
  },
];
const searchForm:FormSchema[] = [
{
    label: '仪表类别',
    field: 'categoryId',
    component: 'ApiSelect',
    componentProps: {
      api: categoryTree,
      labelField: 'title',
      valueField: 'key',
      immediate: true,
      resultField: 'records',
    }
  },
]
//注册model
const [registerModal, { openModal }] = useModal();
//注册table数据
const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
  tableProps: {
    title: '能源价格管理',
    api: list,
    columns: myColumns,
    canResize: false,
    formConfig: {
      //labelWidth: 120,
      schemas: searchForm,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    actionColumn: {
      title: '操作',
      width: 160,
      fixed: 'right',
    },
    beforeFetch: (params) => {
      return Object.assign(params, queryParam);
    },
  },
  exportConfig: {
    name: '能源价格管理',
    url: getExportUrl,
    params: queryParam,
  },
  importConfig: {
    url: getImportUrl,
    success: handleSuccess,
  },
});

// 弹框ref
const enerPriceModalRef = ref();

const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

// 高级查询配置
const superQueryConfig = reactive(superQuerySchema);

/**
 * 高级查询事件
 */
function handleSuperQuery(params) {
  Object.keys(params).map((k) => {
    queryParam[k] = params[k];
  });
  reload();
}
/**
 * 新增事件
 */
function handleAdd() {
  // openModal(true, {
  //   isUpdate: false,
  //   showFooter: true,
  // });
  enerPriceModalRef.value.showModal(0);
}
/**
 * 编辑事件
 */
function handleEdit(record: Recordable) {
  // openModal(true, {
  //   record,
  //   isUpdate: true,
  //   showFooter: true,
  // });
  enerPriceModalRef.value.showModal(1, record);
}
/**
 * 详情
 */
function handleDetail(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: false,
  });
}
/**
 * 删除事件
 */
async function handleDelete(record) {
  await deleteOne({ id: record.id }, handleSuccess);
}
/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  await batchDelete({ ids: selectedRowKeys.value }, handleSuccess);
}
/**
 * 成功回调
 */
function handleSuccess() {
  (selectedRowKeys.value = []) && reload();
}

const categoryTreeData = ref<any>([]);
// 获取计费分类数据
const getCategoryTreeData = async () => {
  let res = await categoryTree({});
  categoryTreeData.value = [...res];
};

const getCategory = (id) => {
  const target = categoryTreeData.value.find(item => item.key === id + '')
  return target.title
};

// 电计费方式options
const methodOptions = [
  {
    label: '峰谷分时计价',
    value: '1',
  },
  {
    label: '固定计价',
    value: '2',
  },
  {
    label: '阶梯计价',
    value: '3',
  },
];
const getBillingWay = (id) => {
  const target = methodOptions.find(item => item.value === id + '')
  return target?.label
};


// 启用禁用
const handleStatusChange = async (record, checked) => {
  let res
  if(checked) {
    res = await enableEnergyPriceApi({id: record.id})
    reload()
    if(!res) message.success('启用成功！')
  } else {
    res = await disableEnergyPriceApi({id: record.id})
    reload()
    if(!res) message.success('禁用成功！')
  }
}


onMounted(async () => {
  await getCategoryTreeData()
})
</script>

<style lang="less" scoped>
:deep(.ant-picker),
:deep(.ant-input-number) {
  width: 100%;
}
</style>
