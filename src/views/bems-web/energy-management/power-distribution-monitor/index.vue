<template>
  <div class="power-page">
    <!-- 统计卡片行 -->
    <div class="stat-cards">
      <StatCard
        label="实时总负荷"
        :value="formatNumber(value('power.station.totalLoad'), 1)"
        change-text="kW · 两段低压母线合计"
        trend=""
        color="cyan"
        :icon="BoltIcon"
      />
      <StatCard
        label="今日累计用电"
        :value="formatNumber(value('power.station.dailyEnergy'), 0)"
        change-text="kWh · 高压计量口径"
        trend=""
        color="blue"
        :icon="EnergyIcon"
      />
      <StatCard
        label="本月最大需量"
        :value="formatNumber(value('power.station.maxDemand'), 0)"
        change-text="kW · 需量越限预警已启用"
        trend=""
        color="orange"
        :icon="DashboardIcon"
      />
      <StatCard
        label="综合功率因数"
        :value="formatNumber(value('power.station.powerFactor'), 2)"
        change-text="无功补偿联动监测"
        trend=""
        color="green"
        :icon="CheckCircleIcon"
      />
    </div>

    <!-- 服贸会核心区总配电室实时一次系统图 -->
    <div class="card topology-card" :class="{ 'fullscreen-mode': schematicFullscreen }">
      <div class="card-header">
        <h3>
          <ApartmentOutlined />
          服贸会核心区总配电室实时一次系统图
        </h3>
        <div class="header-right">
          <span class="bus-info">
            <i class="dot dot-hv"></i>
            10kV 4#母线 {{ display('power.hv.bus.4.voltage') }}
          </span>
          <span class="bus-info">
            <i class="dot dot-hv"></i>
            10kV 5#母线 {{ display('power.hv.bus.5.voltage') }}
          </span>
          <a-button size="small" @click="toggleSchematicFullscreen">
            <FullscreenExitOutlined v-if="schematicFullscreen" />
            <FullscreenOutlined v-else />
          </a-button>
        </div>
      </div>
      <div class="card-body">
        <!-- 缩放控制条 -->
        <div class="zoom-toolbar">
          <button class="zoom-tool-btn" title="放大" @click="zoomIn">＋</button>
          <span class="zoom-level">{{ Math.round(schematicScale * 100) }}%</span>
          <button class="zoom-tool-btn" title="缩小" @click="zoomOut">－</button>
          <button class="zoom-tool-btn reset-btn" title="重置" @click="resetZoom">↺</button>
          <span class="zoom-tip">滚轮缩放· 拖拽平移</span>
        </div>

        <!-- 可缩放/拖拽的示意图容器 -->
        <div
          ref="schematicViewportRef"
          class="schematic-viewport"
          @wheel.prevent="handleWheel"
          @mousedown="onDragStart"
        >
          <PowerSingleLineSchematic
            ref="schematicRef"
            :values="values"
            :scale="schematicScale"
            :translate-x="schematicTranslate.x"
            :translate-y="schematicTranslate.y"
            @select-device="openDevice"
          />
        </div>

        <!-- 设备详情面板 -->
        <transition name="device-panel">
          <section v-if="selectedDevice" class="device-inspector" @click.stop>
            <div class="device-inspector-header">
              <h3>{{ selectedDevice.title }}</h3>
              <button class="close-btn" @click="closeDevice">×</button>
            </div>
            <div class="device-summary" :class="deviceState.tone">
              <i class="state-dot"></i>
              <div>
                <span>当前状态</span>
                <strong>{{ deviceState.label }}</strong>
              </div>
              <button class="test-btn" @click="nudgeSelected">动效测试</button>
            </div>
            <div class="device-data-list">
              <div v-for="row in selectedDevice.fields" :key="row.key" :class="deviceRowTone(row)">
                <span>{{ row.label }}</span>
                <strong>{{ deviceRowValue(row) }}</strong>
              </div>
            </div>
            <div class="device-footer">
              <i class="live-dot"></i>
              <span>后台点位实时推送</span>
              <code>{{ selectedDevice.fields[0]?.key }}</code>
            </div>
          </section>
        </transition>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <span><i :class="['status-light', { online: connected }]"></i>更新时间 {{ lastUpdate }}</span>
      <span>点位目录 <b>{{ catalog.length }}</b></span>
      <span>设备及回路 <b>{{ deviceIds.length }}</b></span>
    </div>

    <!-- 数据接入说明弹窗 -->
    <a-modal
      v-model:open="showApi"
      title="变配电实时数据接入"
      :footer="null"
      width="600px"
    >
      <p>按点位编码推送即可。页面收到数据后会同步刷新母线、开关、变压器、馈线状态及弹窗测量值。</p>
      <pre class="api-pre">POST /api/power-distribution/points
Content-Type: application/json

{
  "points": {
    "power.station.totalLoad": 2520.6,
    "power.transformer.1.loadRate": 53.2,
    "power.lv.feeder.cold-1.breakerClosed": true
  }
}</pre>
      <div class="api-notes">
        <div class="api-note-item"><b>点位目录</b><small>GET /api/power-distribution/catalog</small></div>
        <div class="api-note-item"><b>WebSocket</b><small>/ws · 消息类型 power-points</small></div>
        <div class="api-note-item"><b>设备动效</b><small>POST /api/power-distribution/device-motion</small></div>
        <div class="api-note-item"><b>浏览器 API</b><small>window.PowerDistribution</small></div>
      </div>
      <a-button type="primary" block @click="copyExample">{{ copied ? '已复制示例' : '复制 curl 示例' }}</a-button>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, h } from 'vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  ApartmentOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'
import { bindingStore } from '/@/views/bems-web/energy-monitor/stores/bindingStore.js'
import PowerSingleLineSchematic from './components/PowerSingleLineSchematic.vue'
import { POWER_DISTRIBUTION_DEFAULTS, POWER_DISTRIBUTION_POINTS } from './data/powerDistributionPoints.js'
import { POWER_DEVICE_IDS, getPowerDeviceProfile } from './data/powerDistributionDevices.js'

// 自定义 emoji 图标
const BoltIcon = () => h('span', { style: 'font-size: 20px;' }, '⚡')
const EnergyIcon = () => h('span', { style: 'font-size: 20px;' }, '🔋')
const DashboardIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')
const CheckCircleIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')

const values = reactive({ ...POWER_DISTRIBUTION_DEFAULTS })
const quality = reactive({})
const lastUpdate = ref('--:--:--')
const selectedDeviceId = ref('')
const showApi = ref(false)
const copied = ref(false)
const catalog = POWER_DISTRIBUTION_POINTS
const deviceIds = POWER_DEVICE_IDS
const pointMap = Object.fromEntries(catalog.map((item) => [item.key, item]))
const connected = computed(() => bindingStore.state.socketConnected)
const selectedDevice = computed(() => getPowerDeviceProfile(selectedDeviceId.value))

const deviceState = computed(() => {
  const device = selectedDevice.value
  if (!device) return { label: '正常', tone: 'normal' }
  if (device.faultKey && Boolean(value(device.faultKey))) return { label: '故障', tone: 'fault' }
  const running = device.runningKey ? Boolean(value(device.runningKey)) : true
  if (device.type.includes('母线')) return running ? { label: '带电', tone: 'running' } : { label: '失电', tone: 'stopped' }
  if (device.type.includes('断路器') || device.type.includes('开关柜') || device.type.includes('进线柜') || device.type.includes('馈线')) return running ? { label: '合闸', tone: 'running' } : { label: '分闸', tone: 'stopped' }
  if (device.type.includes('补偿')) return running ? { label: '投入', tone: 'running' } : { label: '退出', tone: 'stopped' }
  return running ? { label: '运行', tone: 'running' } : { label: '停止', tone: 'stopped' }
})

// ==================== 系统图全屏 & 缩放 ====================
const schematicFullscreen = ref(false)
const schematicScale = ref(1)
const schematicTranslate = reactive({ x: 0, y: 0 })
const schematicRef = ref(null)
const schematicViewportRef = ref(null)
let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragStartTransX = 0
let dragStartTransY = 0

const SCALE_MIN = 0.2
const SCALE_MAX = 4

function toggleSchematicFullscreen() {
  schematicFullscreen.value = !schematicFullscreen.value
  if (!schematicFullscreen.value) {
    resetZoom()
  }
}

function zoomIn() {
  schematicScale.value = Math.min(SCALE_MAX, schematicScale.value + 0.2)
}
function zoomOut() {
  schematicScale.value = Math.max(SCALE_MIN, schematicScale.value - 0.2)
}
function resetZoom() {
  schematicScale.value = 1
  schematicTranslate.x = 0
  schematicTranslate.y = 0
}

// 跟随鼠标缩放
function handleWheel(e) {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, schematicScale.value + delta))
  if (newScale === schematicScale.value) return

  const rect = schematicViewportRef.value?.getBoundingClientRect()
  if (!rect) return

  // 鼠标相对于 viewport 的偏移
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // 鼠标在画布坐标系中的位置（缩放前）
  const canvasX = (mouseX - schematicTranslate.x) / schematicScale.value
  const canvasY = (mouseY - schematicTranslate.y) / schematicScale.value

  // 缩放后调整 translate，使鼠标对应的画布点保持在屏幕同一位置
  schematicTranslate.x = mouseX - canvasX * newScale
  schematicTranslate.y = mouseY - canvasY * newScale
  schematicScale.value = newScale
}

// 拖拽平移
function onDragStart(e) {
  if (e.button !== 0) return
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragStartTransX = schematicTranslate.x
  dragStartTransY = schematicTranslate.y
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
}

function onDragMove(e) {
  if (!isDragging) return
  schematicTranslate.x = dragStartTransX + (e.clientX - dragStartX)
  schematicTranslate.y = dragStartTransY + (e.clientY - dragStartY)
}

function onDragEnd() {
  isDragging = false
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
}

// ==================== 数据工具函数 ====================
function value(key) {
  return values[key] ?? '--'
}
function formatNumber(input, digits = 1) {
  const number = Number(input)
  return Number.isFinite(number) ? number.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '--'
}
function display(key) {
  const meta = pointMap[key]
  if (!meta) return String(value(key))
  if (meta.type === 'boolean') return Boolean(value(key)) ? '是' : '否'
  const raw = Number(value(key))
  const digits = Number.isFinite(raw) && Math.abs(raw) < 10 ? 2 : 1
  return `${formatNumber(raw, digits)}${meta.unit ? ` ${meta.unit}` : ''}`
}
function deviceRowValue(row) {
  if (row.kind === 'breaker') return Boolean(value(row.key)) ? '合闸' : '分闸'
  if (row.kind === 'fault') return Boolean(value(row.key)) ? '故障' : '正常'
  if (row.kind === 'remote') return Boolean(value(row.key)) ? '远方' : '就地'
  if (row.kind === 'energized') return Boolean(value(row.key)) ? '带电' : '失电'
  if (row.kind === 'running') return Boolean(value(row.key)) ? '运行 / 投入' : '停止 / 退出'
  return display(row.key)
}
function deviceRowTone(row) {
  if (row.kind === 'fault') return Boolean(value(row.key)) ? 'bad' : 'good'
  if (['breaker', 'energized', 'running'].includes(row.kind)) return Boolean(value(row.key)) ? 'good' : 'idle'
  if (row.kind === 'remote') return 'control'
  return ''
}
function normalizePoints(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  const source = payload.points || payload
  if (Array.isArray(source)) return source
  return Object.entries(source).map(([key, item]) => (item && typeof item === 'object' && !Array.isArray(item) ? { key, ...item } : { key, value: item }))
}
function applyPoints(payload) {
  normalizePoints(payload).forEach((item) => {
    const key = item.key || item.pointKey || item.id
    if (!key || !(key in pointMap)) return
    values[key] = item.value
    quality[key] = item.quality || 'good'
  })
  lastUpdate.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
}
function openDevice(id) {
  if (!POWER_DEVICE_IDS.includes(id)) return false
  selectedDeviceId.value = id
  return true
}
function closeDevice() {
  selectedDeviceId.value = ''
}
function triggerDeviceMotion(deviceId, duration = 900) {
  if (!POWER_DEVICE_IDS.includes(deviceId)) return false
  window.dispatchEvent(new CustomEvent('power-device-motion', { detail: { deviceId, duration } }))
  return true
}
function nudgeSelected() {
  if (selectedDeviceId.value) triggerDeviceMotion(selectedDeviceId.value)
}
function onPowerPoints(event) {
  applyPoints(event.detail)
}
async function loadSnapshot() {
  try {
    const response = await fetch('/api/power-distribution/points')
    if (response.ok) applyPoints(await response.json())
  } catch {}
}
async function copyExample() {
  const text = `curl -X POST ${location.origin}/api/power-distribution/points -H "Content-Type: application/json" -d '{"points":{"power.station.totalLoad":2520.6,"power.transformer.1.loadRate":53.2,"power.lv.feeder.cold-1.breakerClosed":true}}'`
  await navigator.clipboard?.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1600)
}

const powerApi = {
  updatePoint: (key, nextValue, options = {}) => applyPoints([{ key, value: nextValue, ...options }]),
  updatePoints: applyPoints,
  getSnapshot: () => ({ ...values }),
  getPointCatalog: () => catalog.map((item) => ({ ...item })),
  getDeviceCatalog: () => POWER_DEVICE_IDS.map((id) => ({ ...getPowerDeviceProfile(id) })),
  openDevicePanel: openDevice,
  closeDevicePanel: closeDevice,
  triggerDeviceMotion,
}

onMounted(() => {
  window.addEventListener('power-point-values', onPowerPoints)
  window.PowerDistribution = powerApi
  loadSnapshot()
})
onUnmounted(() => {
  window.removeEventListener('power-point-values', onPowerPoints)
  if (window.PowerDistribution === powerApi) delete window.PowerDistribution
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
})
</script>

<style scoped lang="less">
.power-page {
  padding: 0;
  background: #f0f2f5;
  min-height: calc(100vh - 120px);

  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
  }

  .card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
    overflow: hidden;

    .card-header {
      padding: 18px 22px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #2d3748;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;

        .bus-info {
          font-size: 13px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 6px;

          .dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;

            &.dot-hv {
              background: #f59e0b;
              box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
            }
          }
        }
      }
    }

    .card-body {
      padding: 16px;
      position: relative;
    }
  }

  // 系统图全屏模式
  .topology-card.fullscreen-mode {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    margin: 0;
    border-radius: 0;
    display: flex;
    flex-direction: column;

    .card-body {
      flex: 1;
      overflow: hidden;
      padding: 0;
    }
  }

  // 缩放工具条
  .zoom-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafbfc;

    .zoom-tool-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #fff;
      color: #475569;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        border-color: #0ea5e9;
        color: #0ea5e9;
      }

      &.reset-btn {
        font-size: 18px;
      }
    }

    .zoom-level {
      min-width: 50px;
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }

    .zoom-tip {
      margin-left: auto;
      font-size: 12px;
      color: #94a3b8;
    }
  }

  // 可缩放/拖拽视口
  .schematic-viewport {
    position: relative;
    width: 100%;
    height: 600px;
    overflow: hidden;
    background: #eef2f6;
    cursor: grab;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }

  .fullscreen-mode .schematic-viewport {
    height: calc(100vh - 120px);
  }

  // 设备详情面板
  .device-inspector {
    position: absolute;
    z-index: 18;
    right: 16px;
    top: 16px;
    width: 292px;
    max-height: calc(100% - 32px);
    display: flex;
    flex-direction: column;
    border: 1px solid #e2e8f0;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.22);
    overflow: hidden;

    .device-inspector-header {
      padding: 14px 15px 11px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        font-size: 14px;
        color: #1e293b;
        margin: 0;
      }

      .close-btn {
        border: 0;
        background: transparent;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
        line-height: 1;

        &:hover {
          color: #ef4444;
        }
      }
    }

    .device-summary {
      margin: 11px 13px 8px;
      padding: 8px 9px;
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 8px;

      .state-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #94a3b8;
        flex-shrink: 0;
      }

      div {
        display: flex;
        flex-direction: column;

        span {
          font-size: 11px;
          color: #94a3b8;
        }

        strong {
          font-size: 13px;
          color: #334155;
        }
      }

      .test-btn {
        margin-left: auto;
        padding: 4px 8px;
        border: 1px solid #bae6fd;
        background: #f0f9ff;
        color: #0284c7;
        font-size: 11px;
        border-radius: 6px;
        cursor: pointer;
      }

      &.running {
        border-color: rgba(34, 197, 94, 0.4);

        .state-dot {
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
        }
      }

      &.fault {
        border-color: rgba(239, 68, 68, 0.5);
        background: rgba(239, 68, 68, 0.06);

        .state-dot {
          background: #ef4444;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
        }
      }
    }

    .device-data-list {
      margin: 0 13px 11px;
      overflow: auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;

      & > div {
        min-height: 36px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #f0f0f0;
        background: #fff;

        &:last-child {
          border-bottom: 0;
        }

        span {
          font-size: 12px;
          color: #64748b;
        }

        strong {
          min-width: 86px;
          padding: 3px 8px;
          text-align: center;
          color: #475569;
          background: #f1f5f9;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        &.good strong {
          color: #16a34a;
          background: rgba(34, 197, 94, 0.1);
        }

        &.idle strong {
          color: #64748b;
          background: rgba(148, 163, 184, 0.14);
        }

        &.bad strong {
          color: #dc2626;
          background: rgba(239, 68, 68, 0.1);
        }

        &.control strong {
          color: #0284c7;
          background: rgba(14, 165, 233, 0.1);
        }
      }
    }

    .device-footer {
      padding: 8px 13px 9px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-top: 1px solid #f0f0f0;
      font-size: 11px;
      color: #94a3b8;

      .live-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #22c55e;
        flex-shrink: 0;
      }

      code {
        margin-left: auto;
        color: #0ea5e9;
        font-size: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 120px;
      }
    }
  }

  .device-panel-enter-active,
  .device-panel-leave-active {
    transition: 0.22s ease;
  }

  .device-panel-enter-from,
  .device-panel-leave-to {
    opacity: 0;
    transform: translateX(18px);
  }

  // 状态栏
  .status-bar {
    display: flex;
    align-items: center;
    gap: 22px;
    padding: 12px 0;
    color: #94a3b8;
    font-size: 12px;

    .status-light {
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 5px;
      border-radius: 50%;
      background: #f59e0b;

      &.online {
        background: #22c55e;
        box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
      }
    }

    b {
      color: #475569;
    }
  }

  // API 弹窗
  .api-pre {
    margin: 13px 0;
    padding: 13px;
    overflow: auto;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 8px;
    color: #0284c7;
    font-size: 12px;
    line-height: 1.55;
  }

  .api-notes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 13px;

    .api-note-item {
      padding: 9px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 8px;

      b {
        display: block;
        font-size: 13px;
        color: #334155;
      }

      small {
        display: block;
        margin-top: 3px;
        color: #94a3b8;
        font-size: 11px;
      }
    }
  }
}
</style>
