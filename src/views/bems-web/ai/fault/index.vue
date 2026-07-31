<template>
  <div class="ai-page">
    <div class="stats-row">
      <StatCard label="故障分析总数" :value="statData.totalAnalysis" change-text="↑ 15 本月" trend="up" color="blue" :icon="FileTextOutlined" />
      <StatCard label="设备故障率" :value="statData.faultRate" change-text="↓ 2.5% 较上月" trend="down" color="green" :icon="CheckCircleOutlined" />
      <StatCard label="平均修复时间" :value="statData.mttr" change-text="↓ 1.5h 较上月" trend="down" color="orange" :icon="ClockCircleOutlined" />
      <StatCard label="故障预测准确率" :value="statData.predictAccuracy" change-text="↑ 3.8% 较上月" trend="up" color="purple" :icon="FundOutlined" />
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3><BarChartOutlined /> 故障分类统计</h3>
          <div class="btn-group">
            <a-button type="primary" size="small">本周</a-button>
            <a-button size="small">本月</a-button>
            <a-button size="small">本年</a-button>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 280px;">
            <div class="chart-icon"><BarChartOutlined /></div>
            <div class="chart-text">各类设备故障数量统计图</div>
            <div class="chart-sub">空调 | 照明 | 配电 | 消防 | 安防</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3><PieChartOutlined /> 故障原因分析</h3></div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 280px;">
            <div class="chart-icon"><PieChartOutlined /></div>
            <div class="chart-text">故障原因占比分析图</div>
            <div class="chart-sub">硬件老化 35% | 通信故障 25% | 软件异常 20% | 人为因素 12% | 其他 8%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3><WarningOutlined /> 故障分析报告列表</h3>
        <div class="filter-bar">
          <a-select v-model:value="systemFilter" style="width: 140px" placeholder="全部系统">
            <a-select-option value="">全部系统</a-select-option>
            <a-select-option value="空调系统">空调系统</a-select-option>
            <a-select-option value="照明系统">照明系统</a-select-option>
            <a-select-option value="配电系统">配电系统</a-select-option>
            <a-select-option value="消防系统">消防系统</a-select-option>
            <a-select-option value="安防系统">安防系统</a-select-option>
          </a-select>
          <a-select v-model:value="levelFilter" style="width: 120px" placeholder="全部等级">
            <a-select-option value="">全部等级</a-select-option>
            <a-select-option value="紧急">紧急</a-select-option>
            <a-select-option value="重要">重要</a-select-option>
            <a-select-option value="一般">一般</a-select-option>
          </a-select>
          <a-button type="primary"><SearchOutlined /> 查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table :columns="columns" :data-source="tableData" :pagination="{ pageSize: 8 }" row-key="id" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'level'">
              <span class="status-text" :class="record.level === '紧急' ? 'danger' : record.level === '重要' ? 'warning' : 'info'">{{ record.level }}</span>
            </template>
            <template v-if="column.key === 'status'">
              <span class="status-text" :class="record.status === '已修复' ? 'normal' : record.status === '处理中' ? 'warning' : 'danger'">{{ record.status }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">查看报告</a-button>
              <a-button type="link" size="small">诊断分析</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, FundOutlined,
  BarChartOutlined, PieChartOutlined, WarningOutlined,
  SearchOutlined, InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'AiFaultPage' })

const statData = { totalAnalysis: 128, faultRate: '3.2%', mttr: '4.5h', predictAccuracy: '92.5%' }
const systemFilter = ref('')
const levelFilter = ref('')

const columns = [
  { title: '报告编号', dataIndex: 'id', key: 'id', width: 90 },
  { title: '设备名称', dataIndex: 'device', key: 'device' },
  { title: '所属系统', dataIndex: 'system', key: 'system', width: 90 },
  { title: '故障描述', dataIndex: 'desc', key: 'desc' },
  { title: '故障等级', dataIndex: 'level', key: 'level', width: 70 },
  { title: '发生时间', dataIndex: 'time', key: 'time', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 70 },
  { title: '操作', key: 'action', width: 130, fixed: 'right' },
]

const tableData = [
  { id: 'F-001', device: 'AHU-01 空调机组', system: '空调系统', desc: '送风机轴承温度异常升高，振动值超标', level: '紧急', time: '2024-03-25 14:30', status: '处理中' },
  { id: 'F-002', device: 'LP-05 照明回路', system: '照明系统', desc: 'A馆东区照明回路通信中断，灯具无法控制', level: '重要', time: '2024-03-25 10:15', status: '已修复' },
  { id: 'F-003', device: 'PD-03 配电柜', system: '配电系统', desc: 'B馆配电柜三相不平衡，B相电流偏高15%', level: '重要', time: '2024-03-24 16:45', status: '已修复' },
  { id: 'F-004', device: 'FS-08 烟感探测器', system: '消防系统', desc: 'C馆烟感探测器信号强度低于阈值50%', level: '一般', time: '2024-03-24 09:20', status: '已修复' },
  { id: 'F-005', device: 'CH-02 冷机', system: '空调系统', desc: '冷机冷凝器制冷剂泄漏，制冷效率下降', level: '紧急', time: '2024-03-23 11:00', status: '待处理' },
  { id: 'F-006', device: 'SG-01 安防网关', system: '安防系统', desc: '安防网关与平台通信频繁断连', level: '重要', time: '2024-03-23 08:30', status: '处理中' },
  { id: 'F-007', device: 'VFD-02 变频器', system: '配电系统', desc: '变频器过载保护频繁触发，参数异常', level: '一般', time: '2024-03-22 15:10', status: '已修复' },
  { id: 'F-008', device: 'CT-03 冷却塔', system: '空调系统', desc: '冷却塔风扇电机异常噪音，轴承磨损', level: '重要', time: '2024-03-22 09:45', status: '待处理' },
]
</script>

<style scoped lang="less">
.ai-page { padding: 0; }
</style>