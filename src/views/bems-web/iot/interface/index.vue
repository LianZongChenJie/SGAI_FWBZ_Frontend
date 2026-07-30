<template>
  <div class="iot-page">
    <div class="stats-row">
      <StatCard label="对接系统数" :value="statData.systemCount" change-text="↑ 8 新增" trend="up" color="blue" :icon="ApiOutlined" />
      <StatCard label="接口在线率" :value="statData.onlineRate" change-text="↑ 0.5% 较上周" trend="up" color="green" :icon="CheckCircleOutlined" />
      <StatCard label="今日数据量" :value="statData.todayData" change-text="↑ 15% 条" trend="up" color="orange" :icon="InboxOutlined" />
      <StatCard label="异常接口" :value="statData.errorCount" change-text="↓ 1 较昨日" trend="down" color="red" :icon="WarningOutlined" />
    </div>

    <div class="card">
      <div class="card-header">
        <h3><ApiOutlined /> 接口状态监控</h3>
        <div class="filter-bar">
          <a-select v-model:value="protocolFilter" style="width: 130px" placeholder="全部协议">
            <a-select-option value="">全部协议</a-select-option>
            <a-select-option value="MQTT">MQTT</a-select-option>
            <a-select-option value="Modbus">Modbus</a-select-option>
            <a-select-option value="BACnet">BACnet</a-select-option>
            <a-select-option value="OPC UA">OPC UA</a-select-option>
            <a-select-option value="HTTP API">HTTP API</a-select-option>
          </a-select>
          <a-select v-model:value="statusFilter" style="width: 130px" placeholder="全部状态">
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="online">在线</a-select-option>
            <a-select-option value="offline">离线</a-select-option>
            <a-select-option value="error">异常</a-select-option>
          </a-select>
          <a-button type="primary"><SearchOutlined /> 查询</a-button>
        </div>
      </div>
      <div class="card-body">
        <a-table :columns="columns" :data-source="tableData" :pagination="{ pageSize: 10 }" row-key="id" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span class="status-text" :class="record.status === '在线' ? 'normal' : record.status === '异常' ? 'warning' : 'danger'">{{ record.status }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button v-if="record.status === '异常' || record.status === '离线'" type="link" danger size="small">诊断</a-button>
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

    <div class="feature-panel">
      <h4><InfoCircleOutlined /> 功能说明</h4>
      <p>平台与多系统对接，提供不同的接口方式，并对接口运行状态进行监控。新增多个系统的接口内容，通过接口平台对新增的接口程序运行状态进行监控，保障平台稳定运行。支持MQTT、Modbus、BACnet、OPC UA、HTTP API等多种协议。</p>
      <div class="feature-list">
        <div class="feature-list-item">多协议适配（MQTT/Modbus/BACnet/OPC UA/HTTP）</div>
        <div class="feature-list-item">接口注册与生命周期管理</div>
        <div class="feature-list-item">接口运行状态实时监控</div>
        <div class="feature-list-item">数据格式转换与标准化</div>
        <div class="feature-list-item">接口异常告警与自动恢复</div>
        <div class="feature-list-item">接口调用日志与性能分析</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  ApiOutlined, CheckCircleOutlined, InboxOutlined, WarningOutlined,
  SearchOutlined, BarChartOutlined, ClockCircleOutlined, InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'IotInterfacePage' })

const statData = { systemCount: 28, onlineRate: '99.2%', todayData: '2.8M', errorCount: 2 }
const protocolFilter = ref('')
const statusFilter = ref('')

const columns = [
  { title: '系统名称', dataIndex: 'systemName', key: 'systemName' },
  { title: '接口协议', dataIndex: 'protocol', key: 'protocol', width: 110 },
  { title: '接口地址', dataIndex: 'address', key: 'address' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '今日调用', dataIndex: 'todayCalls', key: 'todayCalls', width: 100 },
  { title: '响应时间', dataIndex: 'responseTime', key: 'responseTime', width: 100 },
  { title: '最后心跳', dataIndex: 'lastHeartbeat', key: 'lastHeartbeat', width: 170 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' },
]

const tableData = [
  { id: 1, systemName: '安防监控系统', protocol: 'HTTP API', address: '192.168.1.10:8080', status: '在线', todayCalls: '45,678', responseTime: '45ms', lastHeartbeat: '13:45:22' },
  { id: 2, systemName: '消防报警系统', protocol: 'MQTT', address: 'mqtt://192.168.1.11:1883', status: '在线', todayCalls: '12,345', responseTime: '23ms', lastHeartbeat: '13:45:20' },
  { id: 3, systemName: '楼控系统', protocol: 'BACnet', address: '192.168.1.12:47808', status: '在线', todayCalls: '89,234', responseTime: '67ms', lastHeartbeat: '13:45:18' },
  { id: 4, systemName: '照明系统', protocol: 'Modbus TCP', address: '192.168.1.13:502', status: '异常', todayCalls: '56,789', responseTime: '2,345ms', lastHeartbeat: '13:30:05' },
  { id: 5, systemName: '能源计量系统', protocol: 'OPC UA', address: 'opc.tcp://192.168.1.14:4840', status: '在线', todayCalls: '234,567', responseTime: '34ms', lastHeartbeat: '13:45:22' },
  { id: 6, systemName: '停车管理系统', protocol: 'HTTP API', address: '192.168.1.15:8081', status: '离线', todayCalls: '0', responseTime: '-', lastHeartbeat: '12:15:33' },
]
</script>

<style scoped lang="less">
.iot-page { padding: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
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
.feature-panel {
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%); border-radius: 12px; padding: 24px; margin-top: 20px; border: 1px solid #e8e0f0;
  h4 { font-size: 15px; font-weight: 600; color: #2d3748; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  p { font-size: 13px; color: #4a5568; line-height: 1.8; margin-bottom: 16px; }
  .feature-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    .feature-list-item { font-size: 12px; color: #5a6a8a; padding: 8px 12px; background: rgba(255,255,255,0.7); border-radius: 6px; display: flex; align-items: center; gap: 6px;
      &::before { content: '✓'; color: #52c41a; font-weight: 700; }
    }
  }
}
</style>