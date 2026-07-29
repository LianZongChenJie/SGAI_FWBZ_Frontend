<template>
  <div class="device-box-modal">
    <a-modal v-model:open="open" title="选择引用模式" @ok="handleOk" @cancel="closeModal" width="1000px">
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
import { getStandardizedManagementtApi } from '../Standardized.api'

const props = defineProps({
  setReferenceName: {
    type: Function,
    default: () => {}
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
    slots: { customRender: 'index' }
  },
  {
    title: '策略名称',
    dataIndex: 'strategyName',
    key: 'strategyName',
  },
  {
    title: '应用场景',
    dataIndex: 'strategyScene',
    key: 'strategyScene',
  },
  {
    title: '策略目标',
    dataIndex: 'strategyTarget',
    key: 'strategyTarget',
  },
  {
    title: '相关设备',
    dataIndex: 'executeDevice',
    key: 'executeDevice',
  },
  {
    title: '定义时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '定义人',
    dataIndex: 'createBy',
    key: 'createBy',
  },
]

let dataSource = ref([])

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 10,
})

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
    };
    console.log('request params:', params); // 调试日志
    const res = await getStandardizedManagementtApi(params);
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
      props.setReferenceName(record)
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