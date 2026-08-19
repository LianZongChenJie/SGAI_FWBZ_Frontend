import { reactive } from 'vue'
import { ENERGY_STATION_DEFAULTS, ENERGY_STATION_POINTS } from '../data/energyStationPoints.js'

const LOCAL_KEY = 'scene-editor-binding-configs'

function localConfigs() {
  return []
}

const state = reactive({
  configs: localConfigs(),
  serviceOnline: false,
  socketConnected: false,
  loading: false,
  lastError: ''
})

function persistLocal() {
  // MySQL is now the source of truth; no browser-local persistence here.
}

function applyRealtimeValue(message) {
  if (message?.type === 'energy-points') {
    window.dispatchEvent(new CustomEvent('energy-point-values', { detail: message.points || [] }))
    return
  }
  if (message?.type === 'energy-device-motion') {
    window.dispatchEvent(new CustomEvent('energy-device-motion', { detail: message }))
    return
  }
  if (message?.type === 'energy-optimization-points') {
    window.dispatchEvent(new CustomEvent('energy-optimization-values', { detail: message.points || [] }))
    return
  }
  if (message?.type === 'energy-optimization-dispatch' || message?.type === 'energy-optimization-rollback' || message?.type === 'energy-optimization-manual-actions') {
    window.dispatchEvent(new CustomEvent('energy-optimization-command', { detail: message }))
    return
  }
  window.dispatchEvent(new CustomEvent('binding-value', { detail: message }))
  const sceneStore = window.__SCENE?.sceneStore
  if (!sceneStore || !message?.bindingId) return
  sceneStore.state.objects
    .filter(item => item.pointDisplay && item.bindingConfigId === message.bindingId)
    .forEach(item => {
      item.displayValue = message.value ?? '--'
      item.dataQuality = message.quality || 'good'
      item.dataTimestamp = message.timestamp || new Date().toISOString()
    })
}

let socket = null
let reconnectTimer = null

function connectWebSocket() {
  if (socket && socket.readyState <= 1) return
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  socket = new WebSocket(`${protocol}//${location.host}/ws`)
  socket.onopen = () => {
    state.socketConnected = true
    state.serviceOnline = true
    state.lastError = ''
  }
  socket.onmessage = event => {
    try { applyRealtimeValue(JSON.parse(event.data)) } catch {}
  }
  socket.onerror = () => {
    state.socketConnected = false
    state.serviceOnline = false
  }
  socket.onclose = () => {
    state.socketConnected = false
    clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(connectWebSocket, 3000)
  }
}

// ===== 冷源实时数据 WebSocket（独立于同源 /ws） =====
const COLD_SOURCE_WS_URL = 'ws://192.168.204.51:9999/sgai-tp/fwbz/coldSource/ws'

let coldSocket = null
let coldPollTimer = null

// ENERGY_STATION_POINTS 目录 key 集合，用于匹配统计
const COLD_POINT_KEYS = new Set(ENERGY_STATION_POINTS.map(item => item.key))
// 消息中非点位元数据字段（提取点位时排除）
const META_KEYS = new Set(['type', 'status', 'code', 'msg', 'message', 'msgId', 'requestId', 'timestamp', 'ts', 'time', 'success'])

/** 文本/二进制消息统一转字符串（Blob 异步读取） */
function decodeWsData(raw, onDone) {
  if (typeof raw === 'string') return onDone(raw)
  if (raw instanceof ArrayBuffer) return onDone(new TextDecoder().decode(raw))
  if (raw instanceof Blob) {
    raw.arrayBuffer().then(buf => onDone(new TextDecoder().decode(buf))).catch(() => onDone(null))
    return
  }
  onDone(raw == null ? null : String(raw))
}

/** 递归扁平化嵌套对象为 a.b.c 点分 key（数组按 0-based 索引展开） */
function flattenPoints(obj, prefix = '', out = {}) {
  if (obj === null || typeof obj !== 'object') return out
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const path = prefix ? `${prefix}.${index}` : String(index)
      if (item !== null && typeof item === 'object') flattenPoints(item, path, out)
      else out[path] = item
    })
    return out
  }
  Object.entries(obj).forEach(([key, value]) => {
    if (META_KEYS.has(key)) return
    const path = prefix ? `${prefix}.${key}` : key
    // 点位包装格式 { value, quality, dataType, timestamp }：直接取 value 标量覆盖到对应 key
    if (value !== null && typeof value === 'object' && 'value' in value) {
      const v = value.value
      if (v === null || typeof v !== 'object') {
        out[path] = v
        return
      }
    }
    if (value !== null && typeof value === 'object') flattenPoints(value, path, out)
    else out[path] = value
  })
  return out
}

/** 从任意返回结构中提取点位数据：{points} / {data} / {data:{points}} / 扁平对象 / 数组 */
function extractPoints(data) {
  if (!data || typeof data !== 'object') return data
  if (Array.isArray(data)) return data
  if (data.points !== undefined) return data.points
  if (data.data && typeof data.data === 'object') {
    const inner = data.data
    if (inner.points !== undefined) return inner.points
    return inner
  }
  return data
}

// 冷源最近一次覆盖后的点位最新值快照（key 与 ENERGY_STATION_POINTS 目录一致）
const coldLatestValues = {}

/** payload（数组或扁平对象）归一化为 { key: value } */
function toPointMap(payload) {
  const map = {}
  if (Array.isArray(payload)) {
    payload.forEach(item => {
      if (!item || typeof item !== 'object') return
      const key = item.key || item.pointKey || item.id
      if (!key) return
      const val = item.value !== undefined ? item.value : item.pointValue
      if (val !== undefined) map[key] = val
    })
  } else if (payload && typeof payload === 'object') {
    Object.assign(map, payload)
  }
  return map
}

/** 打印覆盖后目录中所有点位的最新值（未覆盖到的显示默认值） */
function printColdSnapshot() {
  const snapshot = {}
  ENERGY_STATION_POINTS.forEach(item => {
    snapshot[item.key] = Object.prototype.hasOwnProperty.call(coldLatestValues, item.key)
      ? coldLatestValues[item.key]
      : ENERGY_STATION_DEFAULTS[item.key]
  })
  console.log(`[冷源WS] 覆盖后最新点位数据（${Object.keys(snapshot).length} 项）:`, snapshot)
}

function handleColdWsText(text) {
  if (!text) return
  // console.log('[冷源WS] 原始消息:', text)
  let data
  try {
    data = JSON.parse(text)
  } catch (err) {
    console.warn('[冷源WS] 消息解析失败:', err)
    return
  }
  console.log('[冷源WS] 解析数据:', data)
  const raw = extractPoints(data)
  if (raw == null) return
  // 数组格式（[{key,value}]）原样透传，其余做扁平化
  const payload = Array.isArray(raw) ? raw : flattenPoints(raw)
  // 匹配统计，方便确认 key 是否与 ENERGY_STATION_POINTS 目录一致
  const keys = Array.isArray(payload) ? payload.map(item => item.key || item.pointKey || item.id).filter(Boolean) : Object.keys(payload)
  const matched = keys.filter(k => COLD_POINT_KEYS.has(k))
  const unmatched = keys.filter(k => !COLD_POINT_KEYS.has(k)).slice(0, 10)
  console.log(
    `[冷源WS] 点位匹配 ${matched.length}/${keys.length}`,
    unmatched.length ? `，未匹配示例: ${unmatched.join(', ')}（目录中不存在或 key 命名不同）` : '，全部命中 ENERGY_STATION_POINTS 目录'
  )
  if (!matched.length) {
    console.warn('[冷源WS] 无任何 key 命中目录，页面不会更新。请核对返回字段与 data/energyStationPoints.js 中 key 的对应关系')
    return
  }
  // 更新快照并打印覆盖后最新点位数据
  Object.assign(coldLatestValues, toPointMap(payload))
  window.dispatchEvent(new CustomEvent('energy-point-values', { detail: payload }))
  printColdSnapshot()
}

/** 建立一次连接并获取数据，收到数据后立即断开，等待下一轮 */
function openColdSocketOnce() {
  if (coldSocket && coldSocket.readyState <= 1) return
  try {
    coldSocket = new WebSocket(COLD_SOURCE_WS_URL)
  } catch (err) {
    console.warn('[冷源WS] 连接创建失败，等待下一轮重试:', err)
    return
  }
  coldSocket.onopen = () => {
    console.log('[冷源WS] 连接成功:', COLD_SOURCE_WS_URL)
    state.socketConnected = true
    state.serviceOnline = true
    state.lastError = ''
  }
  coldSocket.onmessage = event => {
    decodeWsData(event.data, text => {
      handleColdWsText(text)
      // 取到一次数据后断开，下一分钟再拉取
      closeColdSocket()
    })
  }
  coldSocket.onerror = () => {
    console.warn('[冷源WS] 连接错误')
    state.socketConnected = false
    state.serviceOnline = false
    closeColdSocket()
  }
  coldSocket.onclose = () => {
    coldSocket = null
  }
}

function closeColdSocket() {
  if (!coldSocket) return
  try {
    coldSocket.onclose = null
    coldSocket.close()
  } catch {}
  coldSocket = null
}

/** 冷源数据改为每分钟轮询一次：建立连接 → 取一次数据 → 断开 */
function connectColdSourceWs() {
  openColdSocketOnce()
  clearInterval(coldPollTimer)
  coldPollTimer = setInterval(openColdSocketOnce, 3000)
}

function disconnectColdSourceWs() {
  clearInterval(coldPollTimer)
  coldPollTimer = null
  closeColdSocket()
}

export function useBindingStore() {
  async function loadConfigs() {
    state.loading = true
    try {
      const response = await fetch('/api/bindings')
      if (!response.ok) throw new Error('绑定服务不可用')
      state.configs = await response.json()
      state.serviceOnline = true
      persistLocal()
    } catch (error) {
      state.serviceOnline = false
      state.lastError = error.message
      state.configs = []
    } finally {
      state.loading = false
    }
    return state.configs
  }

  async function saveConfig(config) {
    const payload = { ...config }
    try {
      const response = await fetch(payload.id ? `/api/bindings/${payload.id}` : '/api/bindings', {
        method: payload.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error((await response.json()).error || '保存失败')
      const saved = await response.json()
      const index = state.configs.findIndex(item => item.id === saved.id)
      if (index >= 0) state.configs[index] = saved
      else state.configs.push(saved)
      state.serviceOnline = true
      persistLocal()
      return saved
    } catch (error) {
      state.lastError = error.message || '保存失败'
      throw error
    }
  }

  async function testConfig(config) {
    const response = await fetch('/api/bindings/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || '连接测试失败')
    return result
  }

  function getConfig(id) {
    return state.configs.find(item => item.id === id) || null
  }

  return { state, loadConfigs, saveConfig, testConfig, getConfig, connectWebSocket, connectColdSourceWs, disconnectColdSourceWs, getColdLatestValues }
}

/** 返回最近一次冷源 WS 覆盖后的点位值（key 与 ENERGY_STATION_POINTS 目录一致，仅含已覆盖项） */
export function getColdLatestValues() {
  return { ...coldLatestValues }
}

export const bindingStore = useBindingStore()
