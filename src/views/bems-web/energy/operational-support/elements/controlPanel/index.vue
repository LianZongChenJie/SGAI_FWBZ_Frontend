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
      title="❄️ 空调机组控制"
      width="800px"
      :mask-closable="false"
      @ok="handleAcSave"
      ok-text="保存"
      cancel-text="取消"
    >
      <a-spin :spinning="acAttrLoading">
        <!-- 控制操作区 -->
        <div class="control-actions">
          <div class="control-actions__item">
            <span class="control-actions__label">开关</span>
            <a-switch v-model:checked="acSwitchValue" checked-children="开" un-checked-children="关" />
          </div>
          <div class="control-actions__item">
            <span class="control-actions__label">设定温度</span>
            <a-input-number v-model:value="acTempValue" :min="16" :max="30" :step="1" style="width: 200px" addon-after="°C" />
          </div>
        </div>

        <!-- 实时监测数据（只读） -->
        <a-descriptions bordered :column="2" size="small" style="margin-top: 16px">
          <a-descriptions-item label="机组编号">{{ acCurrentRecord?.deviceCode ?? '--' }}</a-descriptions-item>
          <a-descriptions-item label="位置">{{ findTreeNodePath(spaceTreeData, acCurrentRecord?.spaceId) || acCurrentRecord?.spaceId || '--' }}</a-descriptions-item>
          <a-descriptions-item label="运行状态">
            <a-tag v-if="acCurrentRecord?.runStop === '1'" color="green">运行</a-tag>
            <a-tag v-else color="red">停止</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="设定温度">{{ acCurrentRecord?.setTemperature ? acCurrentRecord.setTemperature + '°C' : '--' }}</a-descriptions-item>
          <template v-for="item in acDisplayAttrs" :key="item.label">
            <a-descriptions-item :label="item.label">{{ item.value ?? '--' }}<span v-if="item.unit">{{ item.unit }}</span></a-descriptions-item>
          </template>
        </a-descriptions>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { AcControlItem, LightingControlItem } from './index.api'
import { getAirList, airControl, getDeviceAttributeList } from './index.api'
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
const acAttrLoading = ref(false)
const acAttrData = ref<{ label: string; value: any; unit?: string }[]>([])

/** 需要展示的属性标签 */
const DISPLAY_ATTR_LABELS = ['送风温度', '回风温度', '新风温度', '新风湿度']

/** 从属性数据中筛选需要展示的项 */
const acDisplayAttrs = computed(() => {
  return acAttrData.value.filter(item => DISPLAY_ATTR_LABELS.includes(item.label))
})

const handleControl = async (type: 'ac' | 'lighting', record: any) => {
  if (type === 'ac') {
    acCurrentRecord.value = record
    acSwitchValue.value = record.runStop === '1'
    acTempValue.value = Number(record.setTemperature) || 22
    acAttrData.value = []
    acModalVisible.value = true

    // 调用接口获取设备属性
    const deviceId = record.deviceId
    if (deviceId) {
      acAttrLoading.value = true
      try {
        const res: any = await getDeviceAttributeList(deviceId)
        const list = res?.data || res?.records || res || []
        acAttrData.value = Array.isArray(list) ? list : []
      } catch (e) {
        console.error('获取设备属性失败:', e)
      } finally {
        acAttrLoading.value = false
      }
    }
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

.control-actions {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 12px 16px;
  background: #f7f9fc;
  border: 1px solid #e5e6eb;
  border-radius: 8px;

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
    flex-shrink: 0;
  }
}


</style>