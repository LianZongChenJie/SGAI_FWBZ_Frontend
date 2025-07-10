<template>
  <a-modal
    v-model:open="open"
    title="回路详情"
    :footer="null"
    width="1000px"
  >
    <div class="config-modal-form-box">
      <a-form
        ref="formSateRef"
        :model="formState"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <a-row :gutter="8">
          <a-col :span="6">
            <a-form-item
              label="设备编号"
              name="name"
            >
              <a-input v-model:value="formState.deviceCode" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item
              label="所在区域"
              name="spaceId"
            >
              <a-tree-select
                v-model:value="formState.spaceId"
                :tree-data="spaceTreeData"
                placeholder="请选择所在区域"
                :fieldNames="treeSelect"
                show-search
                allowClear
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-button type="primary" @click="getNotConfigTableData()">查询</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="config-modal-table-box">
      <a-transfer
        :data-source="formattedData"
        :target-keys="selectedIds"
        @change="handleChange"
        :list-style="{
        width: '100%',
        height: '500px'
      }"
        :render="item => item.title"
      >
        <template #children="{ direction, selectedKeys, onItemSelect }">
          <div class="transfer-table-wrapper">
            <a-table
              :columns="columns"
              :data-source="direction === 'left' ? leftTableData : rightTableData"
              :row-selection="getRowSelection(direction, selectedKeys, onItemSelect)"
              :pagination="false"
              size="middle"
              :scroll="{ y: 420 }"
              rowKey="id"
              bordered
            >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'spaceId'">
                {{ findTreeNodeTitle(spaceTreeData, record.spaceId) }}
              </template>
            </template>
            </a-table>
          </div>
        </template>
      </a-transfer>
      <div class="button-box">
        <a-button @click="closeModal">
          取消
        </a-button>
        &emsp;
        <a-button
          type="primary"
          @click="onSubmit"
        >
          保存
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, toRaw, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { getCircuitDetailApi, getNotConfiguredListApi, spaceTree, categoryTree, saveCircuitRelApi } from '../Standardized.api';

const open = ref<boolean>(false);

const formSateRef = ref();

interface FormState {
  id: string;
  deviceCode: string;
  spaceId: string;
}

const formState = ref<FormState>({
  id: '',
  deviceCode: '',
  spaceId: '',
});

// 空间位置树数据
const spaceTreeData = ref([]);
const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

const categoryTreeData = ref([]);

let notConfigDataSource = ref<any>([]);
let configuredDataSource = ref<any>([]);

// 打开弹框
const showModal = async (record) => {
  formState.value.id = record.id;
  await getNotConfigTableData();
  await getConfiguredTableData();
  open.value = true;
};

// 获取表格未配置数据
const getNotConfigTableData = async () => {
  let params = {
    deviceCode: formState.value.deviceCode ? formState.value.deviceCode : undefined,
    spaceId: formState.value.spaceId ? formState.value.spaceId : undefined,
  };
  let res = await getNotConfiguredListApi(params);
  notConfigDataSource.value = [...res.records];
  notConfigDataSource.value.forEach((item) => {
    item['key'] = item.id;
  });
};

// 获取表格已配置数据
const getConfiguredTableData = async () => {
  let res = await getCircuitDetailApi({ id: formState.value.id });
  configuredDataSource.value = [...res.devices];
  if(!configuredDataSource.value.length) selectedIds.value = []
  configuredDataSource.value.forEach((item) => {
    selectedIds.value.push(item.id);
    item['key'] = item.id;
  });
};

// 已选择的ID数组
const selectedIds = ref<any>([]);

// 格式化数据，适配Transfer组件要求（必须有key字段）
const formattedData = computed(() => {
  return notConfigDataSource.value.map((item) => ({
    ...item,
    key: item.id, // 将id映射为key
  }));
});

// 表格列定义
const columns = [
  {
    title: '设备编号',
    dataIndex: 'deviceCode',
    key: 'deviceCode',
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    key: 'deviceName',
  },
  {
    title: '安装位置',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '所在区域',
    dataIndex: 'spaceId',
    key: 'spaceId',
    lots: { customRender: 'spaceId' },
  },
];

// 计算左侧表格数据（未选择的项目）
const leftTableData = computed(() => {
  return formattedData.value.filter((item) => !selectedIds.value.includes(item.id));
});

// 计算右侧表格数据（已选择的项目）
const rightTableData = computed(() => {
  return formattedData.value.filter((item) => selectedIds.value.includes(item.id));
});

// 处理穿梭框变化
const handleChange = (newTargetKeys) => {
  selectedIds.value = newTargetKeys;
};

// 获取表格的行选择配置
const getRowSelection = (direction, selectedKeys, onItemSelect) => {
  return {
    selectedRowKeys: selectedKeys,
    onChange: (_, selectedRows) => {
      const selectedRowIds = selectedRows.map((row) => row.id);
      const isSelected = selectedRows.some((row) => (direction === 'left' ? leftTableData : rightTableData).value.some((item) => item.id === row.id));
      onItemSelect(selectedRowIds[selectedRowIds.length - 1], isSelected);
    },
    getCheckboxProps: (record) => ({
      disabled: record.disabled,
    }),
  };
};

const closeModal = () => {
  open.value = false;
};

// 获取设备位置树数据
const getSpaceTree = async () => {
  try {
    const res = await spaceTree({});
    spaceTreeData.value = res;
  } catch (error) {
    console.error('获取设备位置失败:', error);
  }
};

// 获取设备类别树数据
const getCategoryTree = async () => {
  try {
    const res = await categoryTree({});
    categoryTreeData.value = res;
  } catch (error) {
    console.error('获取设备类别失败:', error);
  }
};

const transformToCascaderFormat = (treeData) => {
  return treeData.map((item) => {
    const cascaderItem = {
      value: item.key, // 使用 id 作为 value
      label: item.title,
      children: [],
    };
    if (item.children && item.children.length > 0) {
      cascaderItem.children = transformToCascaderFormat(item.children);
    }
    return cascaderItem;
  });
};

// 查找树节点的标题
const findTreeNodeTitle = (treeData: any[], key: string | number): string => {
  if (!treeData || !Array.isArray(treeData)) {
    return '';
  }
  const find = (nodes: any[]): string => {
    for (const node of nodes) {
      if (String(node.key) === String(key)) {
        return node.value;
      }
      if (node.children && Array.isArray(node.children)) {
        const title = find(node.children);
        if (title) return title;
      }
    }
    return '';
  };
  return find(treeData);
};

const onSubmit = async () => {
  let params = {
    circuitId: formState.value.id,
    deviceIds: selectedIds.value,
  }
  let res = await saveCircuitRelApi(params)
  message.success('保存成功！');
  open.value = false;
}

onMounted(async () => {
  await getCategoryTree();
  await getSpaceTree();
});

defineExpose({
  showModal,
  closeModal,
});
</script>

<style scoped lang="less">
.config-modal-form-box {
  width: 100%;
  padding: 5px 10px;
  padding-right: 0px;
}

.config-modal-table-box {
  width: 100%;
  padding: 0 12px 12px 12px;

  .custom-transfer {
    padding: 16px;
  }
  .transfer-table-container {
    width: 100%;
    height: 400px;
    display: flex;
    flex-direction: column;
  }
  .ant-transfer-list {
    width: 48% !important;
  }
  .ant-transfer-list-body {
    height: 100% !important;
  }
}

.button-box {
  padding: 0 12px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
