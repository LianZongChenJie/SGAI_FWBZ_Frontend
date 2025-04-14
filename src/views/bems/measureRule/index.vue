<template>
  <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="menuClick"
    style="justify-content: center" />
  <div class="measure-rule">
    <div class="rule-tree">
      <a-button @click="showAddModal">新增</a-button>
      &nbsp;
      <a-button @click="showEditModal">编辑</a-button>
      &nbsp;
      <a-button @click="handleDelete">删除</a-button>
      <a-tree v-model:selectedKeys="selectKeys" :tree-data="treeData" show-icon :default-expand-all="true"
        :field-names="{ title: 'nodeName', key: 'id' }" :autoExpandParent="true" @select="handleSelect" />
    </div>
    <div class="rule-table">
      <BasicTable @register="registerTable">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="handleFormula(record)">编辑公式</a>
            </a-space>
          </template>
        </template>
      </BasicTable>
      <!-- <a-table :columns="columns" :data-source="dataSource" :loading="loading" :pagination="{
          total: total,
          current: pagination.current,
          pageSize: pagination.pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleFormula(record)">编辑公式</a-button>
            </a-space>
          </template>
        </template>
      </a-table> -->
    </div>
  </div>
  <MeasureRuleModal ref="ruleModalRef" :category-tree="categoryTreeData" :space-tree="spaceTreeData"
    :unit-list="unitList" :rule-tree="treeData" :type="energyFlowTreeType.type" @success="handleSuccess" />
  <FormulaModal ref="formulaModalRef" :category-tree="categoryTreeData" :space-tree="spaceTreeData"
    @success="findTableData" />
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import type { MenuProps, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { energyFlowType, energyFlowTree, categoryTree, spaceTree, unitList as getUnitList, deleteMeasureRule, ruleList } from './index.api';
  import { message, Modal } from 'ant-design-vue';
  import MeasureRuleModal from './components/MeasureRuleModal.vue';
  import FormulaModal from './components/FormulaModal.vue';
  import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';

  const current = ref<string[]>([]);
  const items = ref<MenuProps['items']>([]);
  const energyFlowTreeType = ref<any>({
    type: '',
    name: '',
  });

  const treeData = ref<any[]>([]);
  const selectKeys = ref<any[]>([]);

  // 添加树形数据
  const categoryTreeData = ref<any[]>([]);
  const spaceTreeData = ref<any[]>([]);
  // 添加计量单位数据
  const unitList = ref<any[]>([]);

  const ruleModalRef = ref();

  const columns: TableColumnsType | BasicColumn[] = [
    {
      title: '项目编号',
      dataIndex: 'nodeCode',
      key: 'nodeCode',
    },
    {
      title: '项目名称',
      dataIndex: 'nodeName',
      key: 'nodeName',
    },
    {
      title: '设备类别',
      dataIndex: 'categoryId',
      key: 'categoryId',
      customRender: ({ text }) => {
        const node = findNodeInTree(categoryTreeData.value, text);
        return node?.title || text;
      },
    },
    {
      title: '空间位置',
      dataIndex: 'spaceId',
      key: 'spaceId',
      customRender: ({ text }) => {
        const node = findNodeInTree(spaceTreeData.value, text);
        return node?.value || text;
      },
    },
    {
      title: '计量单位',
      dataIndex: 'meteringUnit',
      key: 'meteringUnit',
      customRender: ({ text }) => {
        const unit = unitList.value.find((item) => item.id === text);
        return unit?.name || text;
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
    },
  ];

  const dataSource = ref<any[]>([]);
  const loading = ref(false);
  const total = ref<number>(0);
  const pagination = ref<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });

  // 表格变化处理（分页、排序、筛选）
  const handleTableChange = (pag: TablePaginationConfig) => {
    pagination.value.current = pag.current;
    pagination.value.pageSize = pag.pageSize;
    findTableData();
  };

  // 显示弹窗
  const showAddModal = () => {
    ruleModalRef.value.openModal();
  };

  // 编辑弹窗
  const showEditModal = () => {
    if (selectKeys.value.length === 0) {
      // 弹窗提醒用户未选择节点
      message.warning('请选择要编辑的节点');
      return;
    }
    ruleModalRef.value.openModal(findNodeInTree(treeData.value, selectKeys.value[0]));
  };

  // 编辑公式
  const formulaModalRef = ref();
  const handleFormula = (record: any) => {
    formulaModalRef.value?.openModal(record);
  };

  const handleSuccess = () => {
    findTreeData();
    findTableData();
  };
  // 删除节点
  const handleDelete = () => {
    // 这里添加删除逻辑
    if (selectKeys.value.length === 0) {
      message.warning('请选择要编辑的节点');
    }
    const info = findNodeInTree(treeData.value, selectKeys.value[0]);
    rowDelete({ id: selectKeys.value[0], nodeName: info.nodeName });
  };

  const rowDelete = (record: { id: number; nodeName: string }) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除节点【' + record.nodeName + '】吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        // 这里添加删除逻辑
        await deleteMeasureRule({ id: record.id }, findTreeData);
        // 判断删除的节点是否为当前选中节点
        if (selectKeys.value.includes(record.id)) {
          // 如果是当前选中节点，则清空选中节点
          selectKeys.value = [];
        }
        findTableData();
      },
    });
  };

  const handleSelect = () => {
    findTableData();
    reload()
  };

  const findNodeInTree = (tree: any[], id: string): any => {
    for (const node of tree) {
      if (node.id == id || node.key == id) return node;
      if (node.children) {
        const found = findNodeInTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const findTreeData = async () => {
    if (energyFlowTreeType.value.type != '') {
      treeData.value = await energyFlowTree({ type: energyFlowTreeType.value.type });
    }
  };

  const findTableData = async () => {
    loading.value = true;
    try {
      const res = await ruleList({
        type: energyFlowTreeType.value.type,
        parentId: selectKeys.value.length > 0 ? selectKeys.value[0] : null,
        pageNo: pagination.value.current,
        pageSize: 99999999,
      });
      dataSource.value = res.records;
      total.value = res.total;
      return dataSource.value
    } catch (error) {
      console.error('获取数据失败', error);
      message.error('获取数据失败');
    } finally {
      loading.value = false;
    }
  };

  const findEnergyFlowType = async () => {
    const result = await energyFlowType();
    items.value = result.map((item) => ({
      label: item.label,
      key: item.value,
    }));
    energyFlowTreeType.value.type = result[0].value;
    energyFlowTreeType.value.name = result[0].label;
    current.value.push(result[0].value);
  };

  // 获取所有下拉数据
  const fetchTreeData = async () => {
    try {
      const [categoryRes, spaceRes, unitRes] = await Promise.all([categoryTree(), spaceTree(), getUnitList()]);
      categoryTreeData.value = categoryRes;
      spaceTreeData.value = spaceRes;
      unitList.value = unitRes;
    } catch (error) {
      console.error('获取数据失败', error);
      message.error('获取数据失败');
    }
  };

  const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    api: findTableData,
    columns: columns as BasicColumn[],
    showActionColumn: false,
    size: 'middle',
    pagination: {
      current: pagination.value.current,
      pageSize: pagination.value.pageSize,
      pageSizeOptions: ['10', '20', '30', '50'],
    }
  },
  });

  // BasicTable绑定注册
  const [registerTable, { reload }] = tableContext;

  const menuClick: MenuProps['onClick'] = ({ item }) => {
    const { key, label } = item.originItemValue;
    energyFlowTreeType.value = { type: key, name: label };
    selectKeys.value = [];
  };
  findEnergyFlowType();
  fetchTreeData();

  watch(
    () => energyFlowTreeType.value.type,
    () => {
      findTreeData();
      findTableData();
      reload()
    }
  );
</script>

<style lang="less" scoped>
  .measure-rule {
    display: flex;
    width: 100%;
    height: 100%;
    .rule-tree {
      flex: 1;
      padding: 3px;
      background-color: #fff;
      border-radius: 8px;
      margin-right: 5px;
      .ant-tree {
        height: 100%;
      }
    }
    .rule-table {
      flex: 4;
      padding: 3px;
      background-color: #fff;
      border-radius: 8px;
      .ant-table {
        height: 100%;
      }
    }
  }
</style>
