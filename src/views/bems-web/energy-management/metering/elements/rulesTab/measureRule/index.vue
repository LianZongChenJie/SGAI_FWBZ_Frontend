<template>
  <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="menuClick" style="display: none" />
  <div class="rule-toolbar">
    <a-button type="primary" :icon="h(PlusOutlined)" @click="showAddModal()">新增</a-button>
    <a-button @click="showEditModal()">编辑</a-button>
    <a-button danger @click="handleDelete()">删除</a-button>
  </div>
  <div class="rule-layout">
    <aside class="rule-sidebar">
      <a-input-search v-model:value="searchValue" placeholder="请输入关键字" allow-clear @search="handleSearch" @change="handleSearchChange" />
      <div class="tree-wrap">
        <a-spin :spinning="treeLoading">
          <a-tree
            v-if="searchTreeData.length"
            :tree-data="filteredTreeData"
            v-model:selectedKeys="selectKeys"
            :expanded-keys="expandedKeys"
            :auto-expand-parent="autoExpandParent"
            @select="handleSelect"
            @expand="handleExpand"
          >
            <template #title="{ title, originData }">
              <span v-html="highlightText(title)" />
              <span v-if="originData.extra" class="node-extra"> ({{ originData.extra }}) </span>
            </template>
          </a-tree>
        </a-spin>
      </div>
    </aside>
    <main class="rule-main">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
        :scroll="{ x: 'max-content' }"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a @click="handleFormula(record)">编辑公式</a>&emsp; <a @click="handleEdit(record)">编辑</a>&emsp;
              <a style="color: red" @click="handleDeleteTable(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
      <div class="pagination-wrap">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="total"
          show-size-changer
          show-total="(total) => `共 ${total} 条`"
          @change="handlePageChange"
          @showSizeChange="handlePageChange"
        />
      </div>
    </main>
  </div>
  <MeasureRuleModal
    ref="ruleModalRef"
    :category-tree="categoryTreeData"
    :space-tree="spaceTreeData"
    :unit-list="unitList"
    :rule-tree="treeData"
    :type="energyFlowTreeType.type"
    @success="handleSuccess"
  />
  <FormulaModal ref="formulaModalRef" :category-tree="categoryTreeData" :space-tree="spaceTreeData" @success="findTableData" />
</template>

<script lang="ts" setup>
  import { computed, ref, watch, onMounted, h } from 'vue';
  import type { MenuProps, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { energyFlowTree, categoryTree, spaceTree, unitList as getUnitList, deleteMeasureRule, ruleList } from './index.api';
  import { message, Modal } from 'ant-design-vue';
  import MeasureRuleModal from './components/MeasureRuleModal.vue';
  import FormulaModal from './components/FormulaModal.vue';
  import { debounce } from 'lodash-es';
  import { nodeDetail } from './index.api';

  // 防抖版的 loadTableData，避免短时间内重复调用
  const debouncedLoadTableData = debounce(() => {
    loadTableData();
  }, 50);

  const props = defineProps<{
    type: string;
    categoryTree?: any[];
    spaceTree?: any[];
    unitList?: any[];
  }>();

  const current = ref<string[]>([]);
  const items = ref<MenuProps['items']>([]);
  const energyFlowTreeType = ref<any>({
    type: props.type,
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

  const columns: TableColumnsType = [
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

  // 分页变化处理
  const handlePageChange = (page: number, pageSize: number) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    loadTableData();
  };

  // 加载表格数据
  const loadTableData = () => {
    findTableData({
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
    });
  };

  // 显示弹窗
  const showAddModal = () => {
    ruleModalRef.value.openModal();
  };

  // 编辑弹窗
  const showEditModal = () => {
    if (selectKeys.value.length === 0) {
      message.warning('请选择要编辑的节点');
      return;
    }
    // 在treeData中查找选中的节点信息
    const selectedNode = findNodeInTree(treeData.value, selectKeys.value[0]);
    if (selectedNode.disableCheckbox) {
      message.warn('无该节点权限，不可编辑！');
      return;
    }
    nodeDetail({ id: selectKeys.value[0] }).then((res) => {
      ruleModalRef.value.openModal(res);
    });
  };

  // 编辑公式
  const formulaModalRef = ref();
  const handleFormula = (record: any) => {
    formulaModalRef.value?.openModal(record);
  };

  // 编辑
  const handleEdit = (record) => {
    ruleModalRef.value.openModal(record);
  };
  // 删除
  const handleDeleteTable = (record) => {
    rowDelete({ id: record.id, nodeName: record.nodeName });
  };

  const handleSuccess = () => {
    findTreeData();
    loadTableData();
  };
  // 删除节点
  const handleDelete = () => {
    if (selectKeys.value.length === 0) {
      message.warning('请选择要删除的节点');
      return;
    }
    const selectedKey = selectKeys.value[0];
    const info = findNodeInTree(treeData.value, selectedKey);
    if (!info) {
      message.warning('未找到节点信息');
      return;
    }
    if (info.disableCheckbox) {
      message.warn('无该节点权限，不可删除！');
      return;
    }
    // 兼容多种字段名：原始数据可能是 name/title/nodeName
    const nodeName = info.nodeName || info.name || info.title || '未知';
    rowDelete({ id: selectedKey, nodeName });
  };

  const rowDelete = (record: { id: number | string; nodeName: string }) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除节点【' + record.nodeName + '】吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await deleteMeasureRule({ id: record.id }, findTreeData);
        // 判断删除的节点是否为当前选中节点（处理数字/字符串兼容）
        if (selectKeys.value.map(String).includes(String(record.id))) {
          selectKeys.value = [];
        }
        loadTableData();
      },
    });
  };

  const handleSelect = () => {
    loadTableData();
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
      try {
        treeLoading.value = true;
        treeData.value = await energyFlowTree({ type: energyFlowTreeType.value.type });
        searchTreeData.value = transformTreeData(treeData.value);
      } finally {
        treeLoading.value = false;
      }
    }
  };

  const findTableData = async (pageParams) => {
    const { pageNo, pageSize } = pageParams;
    loading.value = true;
    try {
      const res = await ruleList({
        type: energyFlowTreeType.value.type,
        parentId: selectKeys.value.length > 0 ? selectKeys.value[0] : null,
        pageNo: pageNo,
        pageSize: pageSize,
      });
      dataSource.value = res.records;
      total.value = res.total;
    } catch (error) {
      console.error('获取数据失败', error);
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => props.type,
    (newType) => {
      energyFlowTreeType.value.type = newType;
      current.value = [newType];
      // 切换类型时清空选中的节点和搜索
      selectKeys.value = [];
      searchValue.value = '';
      expandedKeys.value = [];
      pagination.value.current = 1;
      // 触发内部 watch 进行数据加载
    }
  );

  // 获取所有下拉数据
  const fetchTreeData = async () => {
    try {
      const [categoryRes, spaceRes, unitRes] = await Promise.all([categoryTree(), spaceTree(), getUnitList()]);
      categoryTreeData.value = categoryRes;
      spaceTreeData.value = spaceRes;
      unitList.value = unitRes;
    } catch (error) {
      console.error('获取数据失败', error);
    }
  };


  const menuClick: MenuProps['onClick'] = ({ item }) => {
    const originItem = item.originItemValue as { key: string; label: string };
    energyFlowTreeType.value = { type: originItem.key, name: originItem.label };
    selectKeys.value = [];
  };
  fetchTreeData();

  // 由于 energyFlowTreeType.type 初始值已设为 props.type，内部 watch 不会自动触发，需要手动初始化数据
  onMounted(() => {
    if (energyFlowTreeType.value.type) {
      findTreeData();
      loadTableData();
    }
  });

  watch(
    () => energyFlowTreeType.value.type,
    () => {
      findTreeData();
      pagination.value.current = 1;
      debouncedLoadTableData();
    }
  );

  watch(
    () => selectKeys.value,
    () => {
      pagination.value.current = 1;
      debouncedLoadTableData();
    }
  );

  // 转换为a-tree需要的格式
  const transformTreeData = (data, parentKey = null) => {
    return data.map((item) => {
      const node: any = {
        key: item.key.toString(),
        title: item.title,
        originData: item, // 保留原始数据
        parentKey: parentKey, // 添加父节点key便于搜索时展开
      };

      if (item.children && item.children.length) {
        node.children = transformTreeData(item.children, node.key);
      }
      return node;
    });
  };

  const searchTreeData = ref([]);
  const treeLoading = ref(false);
  const searchValue = ref('');
  const expandedKeys = ref<string[]>([]);
  const autoExpandParent = ref(true);


  // 过滤树数据
  const filteredTreeData = computed(() => {
    if (!searchValue.value) return searchTreeData.value;
    const filterFn = (node) => {
      const match = node.title.includes(searchValue.value);
      if (node.children) {
        const children = node.children.filter(filterFn);
        if (children.length) {
          return { ...node, children };
        }
      }

      return match ? node : null;
    };

    return searchTreeData.value.map(filterFn).filter(Boolean);
  });

  // <span class="highlight" style="color: #f50;">3AA</span>7-434-1_提升泵站西侧地下一层至地上三层应急照明B1ALE1-F3ALE1(主)

  // 高亮文本
  const highlightText = (text) => {
    let num = 10;
    current.value[0] === 'specialty' ? (num = 17) : 10;
    if (!searchValue.value) return truncateText(text, num);
    // const nameStr = text.replace(reg, (match) => `<span class="highlight" style="color: #f50;">${truncateText(match, 10)}</span>`)
    if (text.includes(searchValue.value)) {
      return `<span class="highlight" style="color: #f50;">${truncateText(text, num)}</span>`;
    } else {
      return truncateText(text, num);
    }
  };

  // 更新展开的节点
  const updateExpandedKeys = debounce(() => {
    if (!searchValue.value) {
      expandedKeys.value = [];
      return;
    }

    const keys = new Set<string>();
    const walkTree = (nodes) => {
      nodes.forEach((node) => {
        if (node.title.includes(searchValue.value)) {
          // 向上查找所有父节点
          let parentKey = node.parentKey;
          while (parentKey) {
            keys.add(parentKey);
            parentKey = getParentKey(parentKey, searchTreeData.value);
          }
        }
        if (node.children) walkTree(node.children);
      });
    };

    walkTree(searchTreeData.value);
    expandedKeys.value = Array.from(keys) as string[];
    autoExpandParent.value = true;
  }, 300);

  // 获取父节点key
  const getParentKey = (key, tree) => {
    for (const node of tree) {
      if (node.key === key) return node.parentKey;
      if (node.children) {
        const found = getParentKey(key, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  // 事件处理
  const handleSearch = (value) => {
    searchValue.value = value;
    updateExpandedKeys();
  };

  const handleSearchChange = (e) => {
    searchValue.value = e.target.value;
    updateExpandedKeys();
  };

  const handleExpand = (keys) => {
    expandedKeys.value = keys;
    autoExpandParent.value = false;
  };

  // 截断文本函数
  const truncateText = (text, length = 10) => {
    const maxLength = length;
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  defineExpose({
    showAddModal,
    showEditModal,
    handleDelete,
  })
</script>

<style lang="less" scoped>
  .rule-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    justify-content: flex-end;
  }

  .rule-layout {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .rule-sidebar {
    width: 240px;
    flex-shrink: 0;
    border-right: 1px solid #f0f0f0;
    padding-right: 12px;

    .tree-wrap {
      height: 650px;
      overflow-y: auto;
      margin-top: 8px;
    }
  }

  .rule-main {
    flex: 1;
    min-width: 0;
    height: 650px;
    display: flex;
    flex-direction: column;

    :deep(.ant-table-wrapper) {
      margin-top: 0 !important;
    }

    :deep(.ant-table-body) {
      overflow-y: visible !important;
      overflow-x: auto !important;
      max-height: none !important;
    }

    .pagination-wrap {
      margin-top: 16px;
      text-align: right;
    }
  }

  .node-extra {
    color: #888;
    font-size: 0.8em;
    margin-left: 8px;
  }

  :deep(.ant-tree-node-content-wrapper) {
    white-space: nowrap;
  }
</style>
