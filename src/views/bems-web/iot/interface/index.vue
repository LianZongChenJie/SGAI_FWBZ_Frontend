<template>
  <div class="iot-page">
    <div class="stats-row">
      <StatCard
        v-for="(card, index) in statCards"
        :key="index"
        :label="card.title || '--'"
        :value="card.value ?? '--'"
        :change-text="card.context || ''"
        :color="statCardConfigs[index]?.color || 'blue'"
        :icon="statCardConfigs[index]?.icon"
      />
    </div>

    <div class="card">
      <div class="card-header">
        <h3><ApiOutlined /> 接口状态监控</h3>
        <div class="filter-bar">
          <a-select v-model:value="searchForm.protocolTypeId" style="width: 150px">
            <a-select-option value="">全部协议</a-select-option>
            <a-select-option v-for="item in protocolTypeOptions" :key="item.id" :value="item.id">
              {{ item.typeName }}
            </a-select-option>
          </a-select>
          <a-select v-model:value="searchForm.state" style="width: 130px">
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option :value="1">在线</a-select-option>
            <a-select-option :value="0">离线</a-select-option>
            <a-select-option :value="2">异常</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch"><SearchOutlined /> 查询</a-button>
          <button class="collapse-btn" @click="interfaceCollapsed = !interfaceCollapsed">
            <CaretDownOutlined v-if="!interfaceCollapsed" />
            <CaretUpOutlined v-else />
          </button>
        </div>
      </div>
      <div v-show="!interfaceCollapsed" class="card-body">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          size="middle"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index'">
              {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </template>
            <template v-if="column.key === 'protocolTypeName'">
              {{ getProtocolName(record.protocolTypeId) }}
            </template>
            <template v-if="column.key === 'state'">
              <span class="status-text" :class="getStateClass(record.state)">{{ getStateText(record.state) }}</span>
            </template>
            <template v-if="column.key === 'responseTime'">
              {{ record.responseTime != null ? record.responseTime + 'ms' : '-' }}
            </template>
            <template v-if="column.key === 'action'">
              <a-button v-if="record.state === 2 || record.state === 0" type="link" danger size="small">诊断</a-button>
              <a-button v-else type="link" size="small">详情</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><BarChartOutlined /> 接口调用趋势</h3></div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">各系统接口调用量趋势图</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><ClockCircleOutlined /> 接口响应时间</h3></div>
        <div class="card-body">
          <div class="chart-placeholder">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">接口平均响应时间分布</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { StatCard } from '/@/views/bems-web/components';
import {
  ApiOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  WarningOutlined,
  SearchOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
} from '@ant-design/icons-vue';
import { getSummary, getInterfaceStatusList, getProtocolTypeList } from './index.api';
import type { StatCardVO, InterfaceInfo, ProtocolTypeInfo } from './index.api';

defineOptions({ name: 'IotInterfacePage' });

// 折叠状态
const interfaceCollapsed = ref(false);

// ===== 统计卡片配置（图标/颜色固定，数据来自后端） =====
const statCardConfigs = [
  { color: 'blue' as const, icon: ApiOutlined },
  { color: 'green' as const, icon: CheckCircleOutlined },
  { color: 'orange' as const, icon: InboxOutlined },
  { color: 'red' as const, icon: WarningOutlined },
];
const statCards = ref<StatCardVO[]>([]);

const fetchSummary = async () => {
  try {
    const res = await getSummary();
    statCards.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.error('获取卡片汇总失败:', error);
  }
};

// ===== 协议类型下拉 =====
const protocolTypeOptions = ref<ProtocolTypeInfo[]>([]);
const protocolTypeMap = ref<Map<number, string>>(new Map());

const fetchProtocolTypes = async () => {
  try {
    const res = await getProtocolTypeList();
    const list: ProtocolTypeInfo[] = Array.isArray(res) ? res : res?.records || [];
    protocolTypeOptions.value = list;
    const map = new Map<number, string>();
    list.forEach((item) => {
      if (item.id != null) {
        map.set(item.id, item.typeName || '--');
      }
    });
    protocolTypeMap.value = map;
  } catch (error) {
    console.error('获取协议类型列表失败:', error);
  }
};

const getProtocolName = (id?: number) => {
  if (id == null) return '--';
  return protocolTypeMap.value.get(id) || '--';
};

// ===== 状态映射：0=离线 1=在线 2=异常 =====
const getStateText = (state?: number) => {
  switch (state) {
    case 1:
      return '在线';
    case 0:
      return '离线';
    case 2:
      return '异常';
    default:
      return '--';
  }
};

const getStateClass = (state?: number) => {
  switch (state) {
    case 1:
      return 'normal';
    case 0:
      return 'danger';
    case 2:
      return 'warning';
    default:
      return '';
  }
};

// ===== 列表搜索 =====
const searchForm = reactive({
  protocolTypeId: '' as string | number,
  state: '' as string | number,
});

const loading = ref(false);
const tableData = ref<InterfaceInfo[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
  showSizeChanger: true,
});

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getInterfaceStatusList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      protocolTypeId: searchForm.protocolTypeId === '' ? undefined : (searchForm.protocolTypeId as number),
      state: searchForm.state === '' ? undefined : (searchForm.state as number),
    });
    tableData.value = res?.records || [];
    pagination.total = res?.total || 0;
  } catch (error) {
    console.error('获取接口状态列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchList();
};



const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchList();
};

// ===== 列定义 =====
const columns = [
  { title: '序号', key: 'index', width: 70 },
  { title: '系统名称', dataIndex: 'sysName', key: 'sysName' },
  { title: '接口协议', key: 'protocolTypeName', width: 120 },
  { title: '接口地址', dataIndex: 'interfacePath', key: 'interfacePath' },
  { title: '状态', key: 'state', width: 80 },
  { title: '响应时间', key: 'responseTime', width: 110 },
  { title: '最后心跳', dataIndex: 'requestTime', key: 'requestTime', width: 170 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' },
];

onMounted(() => {
  fetchSummary();
  fetchProtocolTypes();
  fetchList();
});
</script>

<style scoped lang="less">
.iot-page { padding: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 20px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.card {
  background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 20px; overflow: hidden;
  .card-header {
    padding: 18px 22px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    h3 { font-size: 16px; font-weight: 600; color: #2d3748; display: flex; align-items: center; gap: 10px; margin: 0; }
    .filter-bar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  }
  .card-body { padding: 22px; }
}
.chart-placeholder {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #a0aec0; border: 2px dashed #e2e8f0; min-height: 260px; padding: 30px;
  .chart-icon { font-size: 48px; margin-bottom: 12px; }
  .chart-text { font-size: 14px; color: #718096; font-weight: 500; }
}
.status-text { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;
  &.normal { background: #c6f6d5; color: #22543d; }
  &.warning { background: #feebc8; color: #744210; }
  &.danger { background: #fed7d7; color: #742a2a; }
}

.collapse-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}
</style>
