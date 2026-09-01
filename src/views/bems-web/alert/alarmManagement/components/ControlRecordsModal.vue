<template>
  <div class="device-box-modal">
    <a-modal v-model:open="open" :title="props.targetItem.name + '执行详情'" width="1000px">
      <template #footer>
        <a-button key="back" @click="closeModal">关闭</a-button>
      </template>
      <div class="table-box">
        <a-table class="custom-hover-table" :dataSource="dataSource" :columns="columns" :pagination="pagination" bordered :customRow="rowClick">
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
import { selectDevice, spaceTree, categoryTree } from '../Standardized.api'

const props = defineProps({
  targetItem: {
    type: Object,
    default: {
      name: '测试name'
    }
  }
})

const open = ref<boolean>(false);

interface FormState {
  deviceName: string;
  spaceId: Array<String>; 
  categoryId: Array<String>; 
}

const formState = reactive<FormState>({
  deviceName: '',
  spaceId: [],
  categoryId: []
});

const columns = [
  {
    title: '序号',
    dataIndex: 'idex',
    key: 'idex',
    width:'80px',
    slots: { customRender: 'index' }
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    key: 'deviceName',
  },
  {
    title: '点位名称',
    dataIndex: 'categoryId',
    key: 'categoryId',
    width: '120px',
  },
  {
    title: '点位路径',
    dataIndex: 'spaceId',
    key: 'spaceId',
  },
  {
    title: '执行时间',
    dataIndex: 'spaceId',
    key: 'spaceId',
  },
  {
    title: '执行状态',
    dataIndex: 'spaceId',
    key: 'spaceId',
    width: '120px',
  },
]

let dataSource = ref([])

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 10,
})

let spaceTreeData = reactive([])
const spaceOptions = computed(() => {
  return transformToCascaderFormat(spaceTreeData)
});
let categoryTreeData = reactive([])
const categoryOptions = computed(() => {
  return transformToCascaderFormat(categoryTreeData)
});

// 打开弹框
const showModal = async () => {
  await loadData()
  open.value = true
}

const handleOk = (e: MouseEvent) => {
  console.log(e);
  formState.deviceName = ''
  formState.spaceId = []
  formState.categoryId = []
  open.value = false;
};

const closeModal = () => {
  formState.deviceName = ''
  formState.spaceId = []
  formState.categoryId = []
  open.value = false;
}

// 加载数据
const loadData = async () => {
  try {
    const params = {
      pageNo: pagination.pageNo,
      pageSize: 9999999,
      deviceName: formState.deviceName ? formState.deviceName : undefined,
      spaceId: formState.spaceId ? formState.spaceId : undefined,
      categoryId: formState.categoryId ? formState.categoryId : undefined,
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
    const res = await spaceTree();
    spaceTreeData = res;
  } catch (error) {
    console.error('获取设备位置失败:', error);
  }
};

// 获取设备类别树数据
const getCategoryTree = async () => {
  try {
    const res = await categoryTree({});
    categoryTreeData = res;
  } catch (error) {
    console.error('获取设备类别失败:', error);
  }
};


const transformToCascaderFormat = (treeData) => {
  return treeData.map(item => {
    const cascaderItem = {
      value: item.key, // 使用 id 作为 value
      label: item.title,
      children: []
    }
    if (item.children && item.children.length > 0) {
      cascaderItem.children = transformToCascaderFormat(item.children)
    }
    return cascaderItem
  })
}

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
      props.setDeviceName(record)
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
  await getCategoryTree()
  await getSpaceTree()
})

defineExpose({
  showModal,
  closeModal
})
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
    .table-box{
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