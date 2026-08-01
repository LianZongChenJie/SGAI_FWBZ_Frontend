<template>
  <div class="alert-page">
    <div class="stats-row">
      <StatCard label="报警规则数" :value="statData.totalRules" change-text="↑ 34 新增" trend="up" color="blue" :icon="FileTextOutlined" />
      <StatCard label="启用规则" :value="statData.activeRules" change-text="94.9% 启用" trend="up" color="green" :icon="CheckCircleOutlined" />
      <StatCard label="报警类型" :value="statData.alertTypes" change-text="↑ 3 新增" trend="up" color="orange" :icon="TagsOutlined" />
      <StatCard label="通知渠道" :value="statData.channels" change-text="全渠道" trend="up" color="purple" :icon="SoundOutlined" />
    </div>

    <div class="card">
      <div class="card-header">
        <h3><FileTextOutlined /> 报警规则配置</h3>
        <a-button type="primary">+ 新增规则</a-button>
      </div>
      <div class="card-body">
        <a-table :columns="columns" :data-source="tableData" :pagination="{ pageSize: 10 }" row-key="id" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'level'">
              <span class="status-text" :class="record.level === '紧急' ? 'danger' : record.level === '重要' ? 'warning' : 'info'">{{ record.level }}</span>
            </template>
            <template v-if="column.key === 'status'">
              <span class="status-text normal">{{ record.status }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">编辑</a-button>
              <a-button type="link" size="small" danger>删除</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { StatCard } from '/@/views/bems-web/components'
import {
  FileTextOutlined, CheckCircleOutlined, TagsOutlined, SoundOutlined, InfoCircleOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'AlertSettingPage' })

const statData = { totalRules: 156, activeRules: 148, alertTypes: 12, channels: 5 }

const columns = [
  { title: '规则名称', dataIndex: 'name', key: 'name' },
  { title: '报警类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '监控对象', dataIndex: 'target', key: 'target' },
  { title: '触发条件', dataIndex: 'condition', key: 'condition', width: 130 },
  { title: '报警等级', dataIndex: 'level', key: 'level', width: 80 },
  { title: '通知方式', dataIndex: 'notify', key: 'notify' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 70 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' },
]

const tableData = [
  { id: 1, name: '空调机组高温告警', type: '阈值告警', target: '空调机组出水温度', condition: '> 12°C', level: '紧急', notify: '短信+APP+语音', status: '启用' },
  { id: 2, name: '照明回路离线告警', type: '故障告警', target: '照明回路通信状态', condition: '离线 > 5分钟', level: '重要', notify: 'APP+邮件', status: '启用' },
  { id: 3, name: '能耗异常偏高告警', type: '数据告警', target: '场馆日用电量', condition: '> 基准值 20%', level: '重要', notify: 'APP+邮件', status: '启用' },
  { id: 4, name: '消防设备信号异常', type: '故障告警', target: '烟感探测器信号强度', condition: '< 50%', level: '紧急', notify: '短信+APP+语音', status: '启用' },
  { id: 5, name: '系统接口离线告警', type: '系统告警', target: '子系统接口状态', condition: '离线 > 10分钟', level: '重要', notify: 'APP+邮件', status: '启用' },
  { id: 6, name: '场馆客流超限告警', type: '阈值告警', target: '场馆实时客流', condition: '> 额定容量 80%', level: '一般', notify: 'APP', status: '停用' },
]
</script>

<style scoped lang="less">
.alert-page { padding: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px; }
.card {
  background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 20px; overflow: hidden;
  .card-header { padding: 18px 22px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    h3 { font-size: 16px; font-weight: 600; color: #2d3748; display: flex; align-items: center; gap: 10px; margin: 0; }
  }
  .card-body { padding: 22px; }
}
.status-text { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;
  &.normal { background: #c6f6d5; color: #22543d; }
  &.warning { background: #feebc8; color: #744210; }
  &.danger { background: #fed7d7; color: #742a2a; }
  &.info { background: #bee3f8; color: #2a4365; }
}
.feature-panel {
  background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%); border-radius: 12px; padding: 24px; margin-top: 20px; border: 1px solid #e8e0f0;
  h4 { font-size: 15px; font-weight: 600; color: #2d3748; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  p { font-size: 13px; color: #4a5568; line-height: 1.8; margin-bottom: 16px; }
  .feature-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    .feature-list-item { font-size: 12px; color: #5a6a8a; padding: 8px 12px; background: rgba(255,255,255,0.7); border-radius: 6px;
      &::before { content: '✓'; color: #52c41a; font-weight: 700; margin-right: 6px; }
    }
  }
}
</style>