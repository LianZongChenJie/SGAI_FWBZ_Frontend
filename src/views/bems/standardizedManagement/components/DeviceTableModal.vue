<template>
  <div class="device-box-modal">
    <a-modal
      v-model:open="open"
      title="设备绑定"
      @ok="handleOk"
      @cancel="closeModal"
      width="1000px"
    >
      <div class="form-box">
        <a-form
          :model="formState"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
          @finish="onFinish"
          @finishFailed="onFinishFailed"
          layout="horizontal"
        >
          <a-row :gutter="8">
            <a-col :span="6">
              <a-form-item
                label="名称"
                name="deviceName"
              >
                <a-input v-model:value="formState.deviceName" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                label="位置"
                name="spaceId"
              >
                <!-- <a-cascader v-model:value="formState.spaceId" :options="spaceOptions" /> -->
                <a-tree-select
                  v-model:value="formState.spaceId"
                  :tree-data="spaceTreeData"
                  placeholder="请选择位置"
                  :fieldNames="treeSelect"
                  show-search
                  allowClear
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                label="专业"
                name="categoryId"
              >
                <!-- <a-cascader v-model:value="formState.categoryId" :options="categoryOptions" /> -->
                <a-tree-select
                  v-model:value="formState.categoryId"
                  :tree-data="categoryTreeData"
                  placeholder="请选择位置"
                  :fieldNames="treeSelect"
                  show-search
                  allowClear
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item>
                <div class='button-box'>
                  <a-button html-type="submit">清空</a-button>
                  &emsp;
                  <a-button
                    type="primary"
                    html-type="submit"
                    @click="loadData"
                  >查询</a-button>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="table-box">
        <a-table
          class="custom-hover-table"
          :dataSource="dataSource"
          :columns="columns"
          :pagination="pagination"
          size="middle"
          bordered
          :customRow="rowClick"
        >
          <template #index="{ text, record, index }">
            {{ index + 1 }}
          </template>
          <template #spaceId="{ text, record, index }">
            {{ findTreeNodeTitle(spaceTreeData, record.spaceId) }}
          </template>
          <template #categoryId="{ text, record, index }">
            {{ findTreeNodeTitle(categoryTreeData, record.categoryId) }}
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { selectDevice, spaceTree, categoryTree } from '../Standardized.api';

const props = defineProps({
  setDeviceName: {
    type: Function,
    default: () => {},
  },
});

const open = ref<boolean>(false);

interface FormState {
  deviceName: string;
  spaceId: Array<String>;
  categoryId: Array<String>;
}

const formState = reactive<FormState>({
  deviceName: '',
  spaceId: [],
  categoryId: [],
});

const columns = [
  {
    title: '序号',
    dataIndex: 'idex',
    key: 'idex',
    slots: { customRender: 'index' },
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    key: 'deviceName',
  },
  {
    title: '设备专业',
    dataIndex: 'categoryId',
    key: 'categoryId',
    slots: { customRender: 'categoryId' },
  },
  {
    title: '设备位置',
    dataIndex: 'spaceId',
    key: 'spaceId',
    slots: { customRender: 'spaceId' },
  },
];

let dataSource = ref([]);

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 10,
});

// 空间位置树数据
const spaceTreeData = ref([]);
const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

const categoryTreeData = ref([]);

// let spaceTreeData = reactive([])
// const spaceOptions = computed(() => {
//   return transformToCascaderFormat(spaceTreeData)
// });
// let categoryTreeData = reactive([])
// const categoryOptions = computed(() => {
//   return transformToCascaderFormat(categoryTreeData)
// });

// 打开弹框
const showModal = async () => {
  await loadData();
  open.value = true;
};

const handleOk = (e: MouseEvent) => {
  console.log(e);
  formState.deviceName = '';
  formState.spaceId = [];
  formState.categoryId = [];
  open.value = false;
};

const closeModal = () => {
  formState.deviceName = '';
  formState.spaceId = [];
  formState.categoryId = [];
  open.value = false;
};

// 加载数据
const loadData = async () => {
  try {
    const params = {
      pageNo: pagination.pageNo,
      pageSize: 9999999,
      deviceName: formState.deviceName ? formState.deviceName : undefined,
      spaceIds: formState.spaceId ? formState.spaceId : undefined,
      categoryIds: formState.categoryId ? formState.categoryId : undefined,
    };
    console.log('request params:', params); // 调试日志
    const res = await selectDevice(params);
    dataSource.value = res.records;
    pagination.total = res.total;
  } catch (error) {
    console.error('加载数据失败:', error);
  }
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

const rowClick = (record) => {
  return {
    // 双击事件
    ondblclick: (event) => {
      console.log('双击行:', record);
      props.setDeviceName(1, record);
      // 在这里处理双击逻辑
    },
  };
};

const onFinish = (values: any) => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

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
.form-box {
  width: 100%;
  padding: 5px 10px;
  padding-right: 0px;

  .button-box {
    display: flex;
    align-items: center;
  }
}
.table-box {
  padding: 5px 10px;
}

.custom-hover-table {
  --hover-bg-color: #f0f9ff;
  --active-bg-color: #e6f7ff;
}

/* 行 hover 效果 */
.custom-hover-table :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--hover-bg-color) !important;
}

/* 行点击效果 */
.custom-hover-table :deep(.ant-table-tbody > tr:active > td) {
  background: var(--active-bg-color) !important;
}

/* 过渡动画 */
.custom-hover-table :deep(.ant-table-tbody > tr > td) {
  transition: background-color 0.2s ease;
}
</style>