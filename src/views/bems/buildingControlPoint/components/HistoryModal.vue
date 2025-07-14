<template>
  <div class="device-box-modal">
    <a-modal v-model:open="open" title="查看历史" width="500px">
      <template #footer>
        <a-button key="back" @click="closeModal">确定</a-button>
      </template>
      <div class="table-box">
        <a-table class="custom-hover-table" :dataSource="dataSource" :columns="columns" :pagination="pagination"
          size="middle" bordered :customRow="rowClick">
          <template #index="{ text, record, index }">
            {{ index + 1 }}
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { getBuildingControlPointHistoryApi, spaceTree, categoryTree } from '../Standardized.api'

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
  id: string;
}

const formState = reactive<FormState>({
  id: '',
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
    title: '值',
    dataIndex: 'value',
    key: 'value',
  },
  {
    title: '更新时间',
    dataIndex: 'collectionTime',
    key: 'collectionTime',
  },
]

let dataSource = ref([])

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 10,
})

// 打开弹框
const showModal = async (record) => {
  formState.id = record.id
  await loadData()
  open.value = true
}

const handleOk = (e: MouseEvent) => {
  console.log(e);
  open.value = false;
};

const closeModal = () => {
  open.value = false;
}

// 加载数据
const loadData = async () => {
  try {
    const params = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      pointId: formState.id ? formState.id : undefined,
    };
    const res = await getBuildingControlPointHistoryApi(params);
    console.log('request params:---------------------->', params, res); // 调试日志
    dataSource.value = res.records;
    pagination.total = res.total;
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

const rowClick = (record) => {
  return {
    // 双击事件
    ondblclick: (event) => {
      console.log('双击行:', record);
      // 在这里处理双击逻辑
    },
  };
};


onMounted(async () => {

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