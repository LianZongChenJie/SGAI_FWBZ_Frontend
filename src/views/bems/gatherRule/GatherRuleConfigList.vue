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
          v-auth="'bems:gather_rule_config:add'"
          @click="handleAdd"
          preIcon="ant-design:plus-outlined"
        > 新增</a-button>
        <!-- <a-button type="primary" v-auth="'bems:gather_rule_config:exportXls'" preIcon="ant-design:export-outlined" @click="onExportXls">
          导出</a-button
        >
        <j-upload-button type="primary" v-auth="'bems:gather_rule_config:importExcel'" preIcon="ant-design:import-outlined" @click="onImportXls"
          >导入</j-upload-button
        > -->
        <!-- <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined" />
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button v-auth="'bems:gather_rule_config:deleteBatch'"
            >批量操作
            <Icon icon="mdi:chevron-down" />
          </a-button>
        </a-dropdown> -->
        <!-- 高级查询 -->
        <!-- <super-query :config="superQueryConfig" @search="handleSuperQuery" /> -->
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <!-- <TableAction
          :actions="getTableAction(record)"
          :dropDownActions="getDropDownAction(record)"
        /> -->
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
      <template v-slot:bodyCell="{ column, record, index, text }"> </template>
    </BasicTable>
    <!-- 表单区域 -->
    <GatherRuleConfigModal
      @register="registerModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script lang="ts" name="bems-gatherRuleConfig" setup>
import { ref, reactive, computed, unref, onMounted, onBeforeMount } from 'vue';
import { BasicTable, useTable, TableAction, FormSchema } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useListPage } from '/@/hooks/system/useListPage';
import GatherRuleConfigModal from './components/GatherRuleConfigModal.vue';
import { columns, searchFormSchema, superQuerySchema } from './GatherRuleConfig.data';
import { list, deleteOne, batchDelete, getImportUrl, getExportUrl } from './GatherRuleConfig.api';
import { downloadFile } from '/@/utils/common/renderUtils';
import { useUserStore } from '/@/store/modules/user';
import { spaceTree } from './GatherRuleConfig.api';
const queryParam = reactive<any>({});
const checkedKeys = ref<Array<string | number>>([]);
const userStore = useUserStore();
//注册model
const [registerModal, { openModal }] = useModal();
const searchformSchemaConfig = ref<FormSchema[]>();
//缓存树形数据
const treeDataCache = ref(null);
// 获取并初始化树形数据
const initTreeData = async () => {
  if (!treeDataCache.value) {
    treeDataCache.value = await spaceTree();
    // 初始化查询表单的树选择数据
    const schema = searchFormSchema.find((item) => item.field === 'installAddr');
    if (schema) {
      schema.componentProps.treeData = treeDataCache.value;
    }
  }
  return treeDataCache.value;
};
// 修改 columns 配置
const columnsConfig = columns.map((col) => {
  if (col.dataIndex === 'installAddr') {
    return {
      ...col,
      customRender: ({ text }) => {
        if (!text || !treeDataCache.value) return text;
        const findNodeTitle = (nodes, key) => {
          for (const node of nodes) {
            if (node.key == key) return node.value;
            if (node.children) {
              const value = findNodeTitle(node.children, key);
              if (value) return value;
            }
          }
          return null;
        };
        return findNodeTitle(treeDataCache.value, text) || text;
      },
    };
  }
  return col;
});
const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
  tableProps: {
    title: '采集管理-规则标准',
    api: list,
    columns: columnsConfig,
    canResize: false,
    formConfig: {
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    showTableSetting:false,
    actionColumn: {
      title: '操作',
      width: 160,
      fixed: 'right',
    },
    beforeFetch: async (params) => {
      await initTreeData();
      return Object.assign(params, queryParam);
    },
  },
  exportConfig: {
    name: '采集管理-规则标准',
    url: getExportUrl,
    params: queryParam,
  },
  importConfig: {
    url: getImportUrl,
    success: handleSuccess,
  },
});
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
  openModal(true, {
    isUpdate: false,
    showFooter: true,
  });
}
/**
 * 编辑事件
 */
function handleEdit(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
  });
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
/**
 * 操作栏
 */
function getTableAction(record) {
  return [
    {
      label: '编辑',
      onClick: handleEdit.bind(null, record),
      auth: 'bems:gather_rule_config:edit',
    },
  ];
}
/**
 * 下拉操作栏
 */
function getDropDownAction(record) {
  return [
    {
      label: '详情',
      onClick: handleDetail.bind(null, record),
    },
    {
      label: '删除',
      popConfirm: {
        title: '是否确认删除',
        confirm: handleDelete.bind(null, record),
        placement: 'topLeft',
      },
      auth: 'bems:gather_rule_config:delete',
    },
  ];
}
</script>

<style lang="less" scoped>
:deep(.ant-picker),
:deep(.ant-input-number) {
  width: 100%;
}
</style>
