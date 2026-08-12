import { reactive } from 'vue'

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

  return { state, loadConfigs, saveConfig, testConfig, getConfig, connectWebSocket }
}

export const bindingStore = useBindingStore()
