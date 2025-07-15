<template>
  <a-modal
    v-model:open="open"
    title="回路详情"
    :footer="null"
    width="1000px"
  >
    <div class="circuit-form-box">
      <a-form
        ref="formSateRef"
        :model="formState"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 14 }"
        autocomplete="off"
      >
        <a-row :gutter="8">
          <a-col :span="6">
            <a-form-item
              label="回路名称"
              name="name"
            >
              <a-input
                v-model:value="formState.name"
                :bordered="false"
                disabled
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item
              label="回路编号"
              name="num"
            >
              <a-input
                v-model:value="formState.num"
                :bordered="false"
                disabled
              />
            </a-form-item>
          </a-col>
          <!-- <a-col :span="6">
            <a-form-item
              label="安装位置"
              name="position"
            >
              <a-input
                v-model:value="formState.position"
                :bordered="false"
                disabled
              />
            </a-form-item>
          </a-col> -->
          <a-col :span="6">
            <a-form-item
              label="所在区域"
              name="spaceId"
            >
              <!-- <a-tree-select
                v-model:value="formState.spaceId"
                :tree-data="spaceTreeData"
                placeholder="请选择所在区域"
                :fieldNames="treeSelect"
                @change="searchData"
                show-search
                allowClear
                :bordered="false"
                disabled
              /> -->
              <a-input
                v-model:value="formState.spaceName"
                :bordered="false"
                disabled
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="ciruit-table-box">
      <a-table :dataSource="dataSource" :columns="columns"
          size="middle" bordered>
          <template #index="{ text, record, index }">
            {{ index + 1 }}
          </template>
          <template #spaceId="{ text, record, index }">
            {{ findTreeNodeTitle(spaceTreeData, record.spaceId) }}
          </template>
        </a-table>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, toRaw, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { getCircuitDetailApi, editCircuitApi, spaceTree, categoryTree } from '../Standardized.api';

const props = defineProps({
  reload: {
    type: Function,
    default: () => {},
  },
});

const open = ref<boolean>(false);

const formSateRef = ref();

interface FormState {
  id: string | null;
  name: string | null;
  spaceId: string | null;
  spaceName: string | null;
  num: string | null;
  position: string | null;
}

const formState = ref<FormState>({
  id: '',
  name: '',
  spaceId: null,
  spaceName: null,
  num: '',
  position: '',
});

// 空间位置树数据
const spaceTreeData = ref([]);
const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

const categoryTreeData = ref([]);

const columns = [
  {
    title: '序号',
    dataIndex: 'idex',
    key: 'idex',
    slots: { customRender: 'index' }
  },
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
    title: '生产厂家',
    dataIndex: 'categoryId',
    key: 'categoryId',
  },
  {
    title: '所在区域',
    dataIndex: 'spaceId',
    key: 'spaceId',
    slots: { customRender: 'spaceId' }
  },
]

let dataSource = ref<any>([])

// 打开弹框
const showModal = async (record) => {
  formState.value.id = record.id;
  formState.value.name = record.name;
  formState.value.num = record.num;
  formState.value.position = record.position;
  formState.value.spaceId = record.spaceId;
  formState.value.spaceName = findTreeNodeTitle(spaceTreeData.value, record.spaceId);
  await getDetailTableData()
  open.value = true;
};

// 获取表格数据
const getDetailTableData = async () => {
  let res = await getCircuitDetailApi({ id: formState.value.id, spaceId: formState.value.spaceId ? formState.value.spaceId : undefined });
  dataSource.value = [...res.devices]
}

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

// 筛选数据
const searchData = (value) => {
  getDetailTableData()
  
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
.circuit-form-box {
  width: 100%;
  padding: 5px 10px;
  padding-right: 0px;
}

.ciruit-table-box{
  width: 100%;
  padding: 0 12px 12px 12px;
}
</style>
<style lang="less">
.circuit-form-box {
  .ant-input {
    color: #333333;
  }
}
</style>