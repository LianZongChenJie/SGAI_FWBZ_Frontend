<template>
  <div class="device-box-modal">
    <a-modal v-model:open="open" title="通知对象选择" @ok="handleOk" @cancel="closeModal" width="1000px">
      <div class="form-box">
        <a-form :model="formState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off"
          @finish="onFinish" @finishFailed="onFinishFailed" layout="horizontal">
          <a-row :gutter="8">
            <a-col :span="6">
              <a-form-item label="用户名称" name="userName">
                <a-input v-model:value="formState.userName" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item>
                <div class='button-box'>
                  <a-button html-type="submit">清空</a-button>
                  &emsp;
                  <a-button type="primary" html-type="submit" @click="loadData">查询</a-button>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="table-box">
        <a-table class="custom-hover-table" @change="handleChange" :dataSource="dataSource" :columns="columns" :pagination="pagination"
          size="middle" bordered :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }">
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
import { userList, spaceTree, categoryTree } from '../Standardized.api'

const props = defineProps({
  setNoticeUser: {
    type: Function,
    default: () => {}
  }
})

const open = ref<boolean>(false);

interface FormState {
  userName: string;
 
}

const formState = reactive<FormState>({
  userName: '',
});

const columns = [
  {
    title: '序号',
    dataIndex: 'idex',
    key: 'idex',
    slots: { customRender: 'index' }
  },
  {
    title: '用户账号',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '用户姓名',
    dataIndex: 'realname',
    key: 'realname',
  },
  {
    title: '状态',
    dataIndex: 'status_dictText',
    key: 'status_dictText',
    width: 80,
  },
]

let dataSource = ref([])

const pagination = reactive({
  current: 1,
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

type Key = string | number;
const state = reactive<{
  selectedRowKeys: Key[];
  loading: boolean;
}>({
  selectedRowKeys: [], 
  loading: false,
});

const onSelectChange = (selectedRowKeys: Key[]) => {
  state.selectedRowKeys = selectedRowKeys;
};

const handleOk = (e: MouseEvent) => {
  console.log(e);
  props.setNoticeUser(state.selectedRowKeys)
  formState.userName = ''
  open.value = false;
};

const closeModal = () => {
  formState.userName = ''
  open.value = false;
}

// 加载数据
const loadData = async () => {
  try {
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      userName: formState.userName ? '*' + formState.userName + '*' : undefined,
    };
    console.log('request params:', params); // 调试日志
    const res = await userList(params);
    dataSource.value = res.records;
    dataSource.value.forEach(item => {
      item.key = item.id
    })
    pagination.total = res.total;
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

const handleChange = async (page) => {
  pagination.current = page.current;
  pagination.pageSize = page.pageSize;
  loadData()
};

// 获取设备位置树数据
const getSpaceTree = async () => {
  try {
    const res = await spaceTree({});
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