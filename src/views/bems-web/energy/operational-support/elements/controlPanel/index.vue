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
            :loading="acLoading"
            :pagination="false"
            size="small"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'spaceId'">
                {{ findTreeNodePath(spaceTreeData, record.spaceId) || record.spaceId }}
              </template>
              <template v-if="column.key === 'runStop'">
                <a-tag v-if="record.runStop === '1'" color="green">运行</a-tag>
                <a-tag v-else color="red">停止</a-tag>
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

    <!-- 空调机组控制弹窗 -->
    <a-modal
      v-model:open="acModalVisible"
      title="控制"
      :mask-closable="false"
      @ok="handleAcSave"
      ok-text="保存"
      cancel-text="取消"
    >
      <div class="ac-control-form">
        <div class="control-row">
          <span class="control-label">开关</span>
          <a-switch v-model:checked="acSwitchValue" checked-children="开" un-checked-children="关" />
        </div>
        <div class="control-row">
          <span class="control-label">温度</span>
          <a-input-number v-model:value="acTempValue" :min="16" :max="30" :step="1" style="width: 200px" addon-after="°C" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { AcControlItem, LightingControlItem } from './index.api'
import { getAirList, airControl } from './index.api'
import { spaceTree } from '/@/views/bems-web/equipment/equipmentManagement/elements/device/Device.api'

// ===== Props =====
withDefaults(
  defineProps<{
    title?: string
    tag?: string
    lightingData?: LightingControlItem[]
  }>(),
  {
    title: '🎮 远程控制面板',
    tag: '实时控制',
    lightingData: () => [],
  }
)

// ===== Emits =====
const emit = defineEmits<{
  control: [type: 'ac' | 'lighting', record: any]
}>()

// ===== 空调机组数据 =====
const acData = ref<AcControlItem[]>([])
const acLoading = ref(false)

const loadAirList = async () => {
  acLoading.value = true
  try {
    const res = await getAirList()
    const list = res?.records || res?.data?.records || res?.data || res || []
    acData.value = list as AcControlItem[]
  } catch (e) {
    console.error('加载空调机组列表失败:', e)
  } finally {
    acLoading.value = false
  }
}

// ===== 位置树映射 =====
const spaceTreeData = ref<any[]>([])
const loadSpaceTree = async () => {
  try {
    const res = await spaceTree()
    spaceTreeData.value = Array.isArray(res) ? res : (res?.data || res?.records || [])
  } catch (e) {
    console.error('加载空间树数据失败:', e)
  }
}

const findTreeNodePath = (treeData: any[], key: string | number, separator = '-'): string => {
  if (!treeData || !Array.isArray(treeData)) return ''
  const findPath = (nodes: any[], path: string[]): string[] | null => {
    for (const node of nodes) {
      const label = node.title || node.value || node.label || ''
      const currentPath = [...path, label]
      if (String(node.key) === String(key)) {
        return currentPath
      }
      if (node.children && Array.isArray(node.children)) {
        const result = findPath(node.children, currentPath)
        if (result) return result
      }
    }
    return null
  }
  const result = findPath(treeData, [])
  return result ? result.join(separator) : ''
}

// ===== 表格列定义 =====
const acColumns = [
  { title: '机组编号', dataIndex: 'deviceCode', key: 'deviceCode', width: 130 },
  { title: '位置', dataIndex: 'spaceId', key: 'spaceId', width: 130  },
  { title: '当前状态', dataIndex: 'runStop', key: 'runStop', width: 100 },
  { title: '设定温度', dataIndex: 'setTemperature', key: 'setTemperature', width: 100 },
  { title: '操作', key: 'action', width: 80 }
]

const lightingColumns = [
  { title: '回路编号', dataIndex: 'code', key: 'code', width: 130 },
  { title: '位置', dataIndex: 'location', key: 'location' },
  { title: '当前状态', key: 'status', width: 100 },
  { title: '亮度', dataIndex: 'brightness', key: 'brightness', width: 80 },
  { title: '操作', key: 'action', width: 80 }
]

// ===== 空调机组控制弹窗 =====
const acModalVisible = ref(false)
const acSwitchValue = ref(false)
const acTempValue = ref<number>(22)
const acCurrentRecord = ref<any>(null)

const handleControl = (type: 'ac' | 'lighting', record: any) => {
  if (type === 'ac') {
    acCurrentRecord.value = record
    acSwitchValue.value = record.runStop === '1'
    acTempValue.value = Number(record.setTemperature) || 22
    acModalVisible.value = true
  } else {
    emit('control', type, record)
  }
}

const handleAcSave = async () => {
  const deviceId = acCurrentRecord.value?.deviceId
  if (!deviceId) return
  const onOffValue = acSwitchValue.value ? 2 : 1
  const payload = [
    { deviceId, attributeCode: 'UNIT_ON_OFF', value: onOffValue },
    { deviceId, attributeCode: 'SA_TEMP_SETPOINT', value: acTempValue.value },
  ]
  try {
    await airControl(payload)
    message.success('保存成功')
  } catch (e) {
    console.error('空调控制失败:', e)
    message.error('保存失败')
  } finally {
    acModalVisible.value = false
    loadAirList()
  }
}

// ===== 初始化 =====
onMounted(() => {
  loadSpaceTree()
  loadAirList()
})
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

.ac-control-form {
  .control-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }
  .control-label {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    width: 50px;
    flex-shrink: 0;
  }
}


</style>