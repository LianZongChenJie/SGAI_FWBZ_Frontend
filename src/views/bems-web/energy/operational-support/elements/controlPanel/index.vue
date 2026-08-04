<template>
  <div class="control-panel">
    <a-card :title="title" :bordered="false">
      <template #extra>
        <span class="panel-tag">{{ tag }}</span>
      </template>

      <div class="control-grid">
        <!-- 空调机组控制 -->
        <div class="control-section">
          <h4 class="section-title">❄️ 空调机组控制</h4>
          <a-table
            :columns="acColumns"
            :data-source="acData"
            :pagination="false"
            size="small"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === '运行' ? 'green' : 'orange'">
                  {{ record.status }}
                </a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click="handleControl('ac', record)">
                  控制
                </a-button>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 照明回路控制 -->
        <div class="control-section">
          <h4 class="section-title">💡 照明回路控制</h4>
          <a-table
            :columns="lightingColumns"
            :data-source="lightingData"
            :pagination="false"
            size="small"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === '开启' ? 'green' : 'orange'">
                  {{ record.status }}
                </a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click="handleControl('lighting', record)">
                  控制
                </a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import type { AcControlItem, LightingControlItem } from './index.api'

// ===== Props =====
withDefaults(
  defineProps<{
    title?: string
    tag?: string
    acData?: AcControlItem[]
    lightingData?: LightingControlItem[]
  }>(),
  {
    title: '🎮 远程控制面板',
    tag: '实时控制',
    acData: () => [],
    lightingData: () => []
  }
)

// ===== Emits =====
const emit = defineEmits<{
  control: [type: 'ac' | 'lighting', record: any]
}>()

// ===== 表格列定义 =====
const acColumns = [
  { title: '机组编号', dataIndex: 'code', key: 'code', width: 130 },
  { title: '位置', dataIndex: 'location', key: 'location' },
  { title: '当前状态', key: 'status', width: 100 },
  { title: '设定温度', dataIndex: 'setTemp', key: 'setTemp', width: 100 },
  { title: '操作', key: 'action', width: 80 }
]

const lightingColumns = [
  { title: '回路编号', dataIndex: 'code', key: 'code', width: 130 },
  { title: '位置', dataIndex: 'location', key: 'location' },
  { title: '当前状态', key: 'status', width: 100 },
  { title: '亮度', dataIndex: 'brightness', key: 'brightness', width: 80 },
  { title: '操作', key: 'action', width: 80 }
]

// ===== 事件处理 =====
const handleControl = (type: 'ac' | 'lighting', record: any) => {
  emit('control', type, record)
}
</script>

<style scoped lang="less">
    .control-panel {
    width: 100%;
    }

    .control-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    }

    .control-section {
    .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #1d2129;
        margin-bottom: 12px;
    }
    }

    .panel-tag {
    font-size: 12px;
    color: #1677ff;
    background: #e6f4ff;
    padding: 2px 12px;
    border-radius: 12px;
    }


</style>