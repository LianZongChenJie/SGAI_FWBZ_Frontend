<template>
  <a-menu
    v-model:selectedKeys="current"
    mode="horizontal"
    :items="items"
    @click="menuClick"
    style="justify-content: center"
  />
  <div class="measure-rule">
    <div class="rule-tree">
      <a-input-search
        v-model:value="searchValue"
        placeholder="请输入关键字"
        allow-clear
        @search="handleSearch"
        @change="handleSearchChange"
      />
      &emsp;
      <a-spin :spinning="treeLoading">
        <a-tree
          v-if="searchTreeData.length"
          :tree-data="filteredTreeData"
          v-model:selectedKeys="selectKeys"
          :expanded-keys="expandedKeys"
          :auto-expand-parent="autoExpandParent"
          @select="handleSelect"
          @expand="handleExpand"
          v-model:checkedKeys="radioCheckedKeys"
          checkable
          :check-strictly="true"
          :selectable="false"
          @check="handleRadioCheck"
        >
          <template #title="{ title, originData }">
            <span v-html="highlightText(title)" />
            <span
              v-if="originData.extra"
              class="node-extra"
            > ({{ originData.extra }}) </span>
          </template>

          <!-- 自定义复选框为单选框样式 -->
          <template #custom-checkbox="{ checked, halfChecked, node }">
            <div
              class="custom-tree-radio"
              :class="{ 'custom-tree-radio-checked': checked }"
              @click.stop="handleRadioClick(node)"
            >
              <div
                v-if="checked"
                class="radio-inner"
              ></div>
            </div>
          </template>
        </a-tree>
      </a-spin>
    </div>
    <div class="rule-table">
      <BasicTable @register="registerTable">
      </BasicTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { MenuProps, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import { energyFlowType, energyFlowTree, categoryTree, spaceTree, unitList as getUnitList, deleteMeasureRule, ruleList } from './index.api';
import { message, Modal } from 'ant-design-vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { h } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { debounce } from 'lodash-es';

const props = defineProps({
  selectKey: {
    type: Function,
    default: () => {},
  },
});

const current = ref<string[]>([]);
const items = ref<MenuProps['items']>([]);
const energyFlowTreeType = ref<any>({
  type: '',
  name: '',
});

const treeData = ref<any[]>([]);
const selectKeys = ref<any[]>([]);

// 单选相关状态
const radioCheckedKeys = ref<any[]>([]);
const lastCheckedKey = ref<string | number>('');

const targetNode: any = ref();

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
];

const dataSource = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
});

const handleSelect = () => {
  reload();
};

// 处理单选框点击
const handleRadioClick = (node: any) => {
  const key = node.key;
  console.log('handleRadioClick---------------->', radioCheckedKeys.value);

  // 如果点击的是已选中的节点，则取消选择
  if (radioCheckedKeys.value.includes(key)) {
    radioCheckedKeys.value = [];
    selectKeys.value = [];
    lastCheckedKey.value = '';
  } else {
    // 单选逻辑：只选中一个
    radioCheckedKeys.value = [key];
    selectKeys.value = [key];
    lastCheckedKey.value = key;
  }

  // 触发数据加载
  reload();
};

// 处理复选框选择事件
const handleRadioCheck = (checkedKeys: any[], { node, checked }: any) => {
  // 单选逻辑：只允许选中一个
  if (checked) {
    // 如果已经选中了一个，先清空
    if (radioCheckedKeys.value.length > 0 && radioCheckedKeys.value[0] !== node.key) {
      radioCheckedKeys.value = [];
    }
    radioCheckedKeys.value = [node.key];
    selectKeys.value = [node.key];
    lastCheckedKey.value = node.key;
    targetNode.value = node;
  } else {
    // 取消选择
    if (radioCheckedKeys.value.checked.includes(node.key)) {
      radioCheckedKeys.value = [];
      selectKeys.value = [];
      lastCheckedKey.value = '';
    }
    targetNode.value = '';
  }
  
  
  props.selectKey(radioCheckedKeys.value, targetNode.value);
  // 触发数据加载
  if (checked) {
    // findTableData();
    reload();
  }
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
    return {
      records: res.records, // 当前页数据
      total: res.total, // 总记录数
    };
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
    showTableSetting: false,
    size: 'middle',
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
    },
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
    reload();
  }
);

// 转换为a-tree需要的格式
const transformTreeData = (data, parentKey = null) => {
  return data.map((item) => {
    const node = {
      key: item.id.toString(),
      title: item.nodeName,
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
const expandedKeys = ref([]);
const autoExpandParent = ref(true);

// 异步加载子节点
const loadData = async (treeNode) => {
  if (!treeNode.dataRef.isLeaf) {
    const response = await api.get(`/tree-data/${treeNode.dataRef.key}/children`);
    treeNode.dataRef.children = transformTreeData(response.data, treeNode.dataRef.key);
    treeData.value = [...treeData.value];
  }
};

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

// 高亮文本
const highlightText = (text) => {
  if (!searchValue.value) return text;
  const reg = new RegExp(searchValue.value, 'gi');
  return text.replace(reg, (match) => `<span class="highlight" style="color: #f50;">${match}</span>`);
};

// 更新展开的节点
const updateExpandedKeys = debounce(() => {
  if (!searchValue.value) {
    expandedKeys.value = [];
    return;
  }

  const keys = new Set();
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
  expandedKeys.value = Array.from(keys);
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
</script>

<style lang="less" scoped>
.measure-rule {
  display: flex;
  width: 100%;
  height: 94%;
  .rule-tree {
    overflow: auto;
    flex: 1;
    padding: 3px;
    background-color: #fff;
    border-radius: 8px;
    margin-right: 5px;
    .ant-tree {
      height: 100%;
    }
  }
  .btton-box {
    display: flex;
    width: 100%;
    height: 60px;
    justify-content: center;
    align-items: center;
  }
  .rule-table {
    flex: 4;
    padding: 3px;
    background-color: #fff;
    border-radius: 8px;
    overflow: auto;
    .ant-table {
      height: 100%;
    }
  }
}

.tree-container {
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  max-height: 600px;
  overflow: auto;
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