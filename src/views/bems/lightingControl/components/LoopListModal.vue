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

        <a-popconfirm
          :title="'确认全开'+ title +'？'"
          ok-text="确定"
          cancel-text="取消"
          @confirm="handleOpen()"
        >
          <a-button
            type="primary"
            v-if="hasPermission('bems:areafullyopen')"
          >
            全开
          </a-button>
        </a-popconfirm>
        &emsp;

        <a-popconfirm
          :title="'确认全关'+ title +'？'"
          ok-text="确定"
          cancel-text="取消"
          @confirm="handleClose()"
        >
          <a-button v-if="hasPermission('bems:areafullyclose')">
            全关
          </a-button>
        </a-popconfirm>
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
              <a-popconfirm
                :title="'确认开启'+ record.circuitName +'？'"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleCircuitOpen(record)"
              >
                <a v-if="hasPermission('bems:circuitopen')">开启</a>
              </a-popconfirm>
              &emsp;
              <a-popconfirm
                :title="'确认关闭'+ record.circuitName +'？'"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleCircuitClose(record)"
              >
                <a
                  style="color: red;"
                  v-if="hasPermission('bems:circuitclose')"
                >关闭</a>
              </a-popconfirm>

            </a-space>
          </template>
          <template #allDuration="{ text, record, index }">
            {{ formatSeconds(record.allDuration, { showHoursAlways: true }) }}
          </template>
          <template #status="{ text, record, index }">
            <img v-if="record.status === '关闭'" style="width: 20px; height: 20px;" src="@/assets/images/lightClose.png"
              alt="">
            <img v-else style="width: 20px; height: 20px;" src="@/assets/images/lightOpen.png" alt="">
            &nbsp;{{ record.status }}
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
import { usePermission } from '/@/hooks/web/usePermission';
const { hasPermission } = usePermission();

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
    slots: { customRender: 'allDuration' },
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

function formatSeconds(totalSeconds, options:any = {}) {
  // 参数校验
  if (typeof totalSeconds !== 'number' || totalSeconds < 0) {
    console.warn('formatSeconds: 参数必须为非负数字');
    return '00:00';
  }
  
  // 默认配置
  const {
    showHoursAlways = false,
    padZero = true,
    separator = ':',
    showUnit = false
  } = options;
  
  // 计算时分秒
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  // 补零函数
  const pad:any = (num) => padZero ? num.toString().padStart(2, '0') : num.toString();
  
  // 根据配置返回不同格式
  if (showUnit) {
    // 显示单位格式：1时02分03秒
    const parts:any = [];
    if (hours > 0 || showHoursAlways) {
      parts.push(`${hours}时`);
    }
    parts.push(`${pad(minutes)}分`);
    parts.push(`${pad(seconds)}秒`);
    return parts.join('');
  } else {
    // 标准格式：HH:MM:SS 或 MM:SS
    if (hours > 0 || showHoursAlways) {
      return `${pad(hours)}${'小时'}${pad(minutes)}${'分钟'}${pad(seconds)}秒`;
    } else {
      return `${pad(minutes)}${separator}${pad(seconds)}`;
    }
  }
}

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