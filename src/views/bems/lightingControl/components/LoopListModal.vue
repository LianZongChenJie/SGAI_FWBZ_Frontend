<template>
  <div class="loop-list-modal">
    <a-modal
      v-model:open="open"
      :title="'区域：' + title"
      @ok="handleOk"
      @cancel="closeModal"
      width="1000px"
    >
      <div
        class="button-box"
        style="padding: 8px 10px;display: flex;justify-content: flex-end;align-items: center;"
      >
        <a-button
          type="primary"
          @click="loadData()"
        >
          刷新
        </a-button>
        &emsp;
        <a-button
          type="primary"
          @click="handleOpen"
        >
          全开
        </a-button>
        &emsp;
        <a-button @click="handleClose">
          全关
        </a-button>
      </div>
      <div class="table-box">
        <a-table
          class="custom-hover-table"
          :dataSource="dataSource"
          :columns="columns"
          :pagination="pagination"
          size="middle"
          bordered
          @change="handleChange"
          :scroll="{ y: 500 }"
        >
          <template #index="{ text, record, index }">
            {{ index + 1 }}
          </template>
          <template #active="{ text, record, index }">
            <a-space>
              <a @click.stop="handleCircuitOpen(record)">开启</a>
              &emsp;
              <a
                style="color: red;"
                @click.stop="handleCircuitClose(record)"
              >关闭</a>
            </a-space>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { getCircuitListPageApi, setAreaOpenApi, setAreaCloseApi, setCircuitOpenApi, setCircuitCloseApi } from '../Standardized.api';

const open = ref<boolean>(false);

const title = ref('测试');
const id = ref('');
const apiInterval = ref<NodeJS.Timeout | null>(null);

const columns = [
  {
    title: '序号',
    dataIndex: 'idex',
    key: 'idex',
    slots: { customRender: 'index' },
    align: 'center',
  },
  {
    title: '回路名称',
    dataIndex: 'circuitName',
    key: 'circuitName',
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' },
    align: 'center',
  },
  {
    title: '开启时间',
    dataIndex: 'startTime',
    key: 'startTime',
    align: 'center',
  },
  {
    title: '关闭时间',
    dataIndex: 'closingTime',
    key: 'closingTime',
    align: 'center',
  },
  {
    title: '开启总时长',
    dataIndex: 'allDuration',
    key: 'allDuration',
    align: 'center',
  },
  {
    title: '操作人',
    dataIndex: 'operatorBy',
    key: 'operatorBy',
    align: 'center',
  },
  {
    title: '操作时间',
    dataIndex: 'operatorTime',
    key: 'operatorTime',
    align: 'center',
  },
  {
    title: '操作',
    dataIndex: 'active',
    key: 'active',
    slots: { customRender: 'active' },
    align: 'center',
  },
];

let dataSource = ref([]);

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0,
});

// 打开弹框
const showModal = async (record) => {
  title.value = record.areaName;
  id.value = record.id;
  await loadData();
  // 然后每隔5秒调用一次
  apiInterval.value = setInterval(() => {
    loadData();
  }, 5000); // 5秒
  open.value = true;
};

const handleOpen = async () => {
  await setAreaOpenApi({
    id: id.value,
  });
  message.success('全开成功！');
};

const handleClose = async () => {
  await setAreaCloseApi({
    id: id.value,
  });
  message.success('全关成功！');
};

const handleCircuitOpen = async (record) => {
  await setCircuitOpenApi({
    id: record.id,
  });
  loadData();
  message.success('开启成功！');
};

const handleCircuitClose = async (record) => {
  await setCircuitCloseApi({
    id: record.id,
  });
  loadData();
  message.success('关闭成功！');
};

const handleOk = (e: MouseEvent) => {
  console.log(e);
  open.value = false;
};

const closeModal = () => {
  if (apiInterval.value) {
    clearInterval(apiInterval.value);
    apiInterval.value = null;
  }
  open.value = false;
};

const handleChange = (page) => {
  pagination.pageNo = page.current;
  pagination.pageSize = page.pageSize;
  loadData();
};

// 加载数据
const loadData = async () => {
  try {
    const params = {
      areaId: id.value,
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
    };
    const res = await getCircuitListPageApi(params);
    console.log('loadData------------------------>', params, res); // 调试日志
    dataSource.value = res.records;
    pagination.total = res.total;
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

// 组件卸载时清理定时器
onUnmounted(() => {
  if (apiInterval.value) {
    clearInterval(apiInterval.value);
    apiInterval.value = null;
  }
});

defineExpose({
  showModal,
  closeModal,
});
</script>

<style scoped lang="less">
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