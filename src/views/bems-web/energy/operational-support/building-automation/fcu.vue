<template>
  <div class="ba-page fcu">
    <main>
      <header>
        <h1>{{ deviceName || '风机盘管' }}</h1>
        <button class="panel-toggle" :class="{ active: showPanel }" @click="showPanel = !showPanel">系统参数</button>
      </header>
      <div class="ba-content">
        <section
          class="schematic-card"
          ref="schematicCardRef"
          @wheel.prevent="handleZoom"
          @mousedown.prevent="startPan"
          :style="{ cursor: panning ? 'grabbing' : 'grab' }"
        >
          <div class="ba-schematic"
            :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: '0 0' }">
            <div class="fcu-asset device" @click="$emit('select-device','ba.fcu')">
              <img src="/equipment/fan-coil-v2-2_5d.png" alt="风机盘管" />
              <div class="air-stream fcu-flow" :class="{ active: isFanRunning() }"><i v-for="x in 5" :key="x"></i></div>
              <div v-for="no in [1]" :key="no" :class="['fan-rotor', `fcu-rotor-${no}`, { running: isFanRunning() }]"><i></i></div>
              <b class="fcu-air-label fcu-ra">RA ↑</b>
              <b class="fcu-air-label fcu-da">DA →</b>
              <PointBadge class="fcu-valve-feedback" label="水阀状态" :value="getParamValue('水阀状态')" />
            </div>
            <PointBadge class="fcu-on" label="开关机" :value="getParamValue('开关机')" />
          </div>
        <!-- 缩放控制栏 -->
        <div class="zoom-controls">
          <span class="zoom-label">{{ Math.round(zoom * 100) }}%</span>
          <button class="zoom-btn" @click="zoomOutFn">−</button>
          <button class="zoom-btn" @click="zoomInFn">+</button>
          <button class="zoom-btn" @click="resetZoom">重置</button>
        </div>
        </section>
        <aside class="system-panel" v-show="showPanel">
          <header>系统参数</header>
          <div v-for="item in displaySystemParams" :key="item.code || item.configId">
            <span>{{ item.label }}</span>
            <strong>{{ formatParam(item) }}</strong>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import PointBadge from './components/PointBadge.vue'
import { createHelpers } from './components/utils.js'
import { formatSystemParam } from './components/systemParamFormat.js'
import { BUILDING_AUTOMATION_POINTS, BUILDING_AUTOMATION_DEFAULTS } from '../data/buildingAutomationPoints.js'

const props = defineProps({
  values: { type: Object, default: () => reactive({ ...BUILDING_AUTOMATION_DEFAULTS }) },
  systemParams: { type: Array, default: () => [] },
  deviceName: { type: String, default: '' }
})
defineEmits(['select-device'])

const showPanel = ref(false)

// === 缩放与平移 ===
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const panning = ref(false)
const userAdjustedZoom = ref(false)
const schematicCardRef = ref(null)
let panStartX = 0
let panStartY = 0
let panOriginX = 0
let panOriginY = 0

const handleZoom = (e) => {
  userAdjustedZoom.value = true
  if (!schematicCardRef.value) return
  const rect = schematicCardRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  const oldZoom = zoom.value
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.min(3, Math.max(0.5, +(oldZoom + delta).toFixed(2)))
  if (newZoom === oldZoom) return
  const ratio = newZoom / oldZoom
  panX.value = mouseX - (mouseX - panX.value) * ratio
  panY.value = mouseY - (mouseY - panY.value) * ratio
  zoom.value = newZoom
}
const zoomInFn = () => { userAdjustedZoom.value = true; zoom.value = Math.min(3, +(zoom.value + 0.2).toFixed(2)) }
const zoomOutFn = () => { userAdjustedZoom.value = true; zoom.value = Math.max(0.5, +(zoom.value - 0.2).toFixed(2)) }
const startPan = (e) => {
  panning.value = true
  panStartX = e.clientX
  panStartY = e.clientY
  panOriginX = panX.value
  panOriginY = panY.value
  window.addEventListener('mousemove', onPan)
  window.addEventListener('mouseup', stopPan)
}
const onPan = (e) => {
  if (!panning.value) return
  panX.value = panOriginX + (e.clientX - panStartX)
  panY.value = panOriginY + (e.clientY - panStartY)
}
const stopPan = () => {
  panning.value = false
  window.removeEventListener('mousemove', onPan)
  window.removeEventListener('mouseup', stopPan)
}

/** 重置缩放时允许自动调整 */
const resetZoom = () => {
  userAdjustedZoom.value = false
  zoom.value = 1
  panX.value = 0
  panY.value = 0
  setTimeout(autoFitZoom, 0)
}

/** 根据容器高度自动调整缩放比例，大视口时自动放大填满容器 */
const autoFitZoom = () => {
  if (userAdjustedZoom.value) return
  const card = schematicCardRef.value
  if (!card) return
  const cardWidth = card.clientWidth
  const cardHeight = card.clientHeight
  if (cardWidth <= 0 || cardHeight <= 0) return
  // fcu-asset 的 aspect-ratio 是 1.594
  const contentNaturalHeight = cardWidth / 1.594
  if (contentNaturalHeight <= 0) return
  const fitZoom = +(cardHeight / contentNaturalHeight).toFixed(2)
  zoom.value = Math.min(3, Math.max(0.5, fitZoom))
}

/** 使用 ResizeObserver 监听容器尺寸变化（包括全屏切换） */
let resizeObserver = null
let isInitialResize = true

onMounted(() => {
  const card = schematicCardRef.value
  if (card) {
    resizeObserver = new ResizeObserver(() => {
      if (isInitialResize) {
        isInitialResize = false
        return
      }
      autoFitZoom()
    })
    resizeObserver.observe(card)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

const prefix = 'ba.fcu'
const { p, n, valveStyle, speedText } = createHelpers(props.values)

const devicePoints = computed(() => BUILDING_AUTOMATION_POINTS.filter(pt => pt.key.startsWith(prefix + '.')))
const running = computed(() => Boolean(props.values[`${prefix}.running`]))
const fault = computed(() => Boolean(props.values[`${prefix}.fault`]))
const stateText = computed(() => fault.value ? '故障' : running.value ? '运行' : '停止')
const stateTone = computed(() => fault.value ? 'fault' : running.value ? 'running' : 'stopped')

/** 当接口返回了系统参数数组时优先使用，否则回退到默认点位 */
const displaySystemParams = computed(() => {
  return props.systemParams && props.systemParams.length > 0 ? props.systemParams : devicePoints.value.slice(-6)
})

/** 从系统参数数组中按 label 关键词查找对应项并格式化值 */
function getParamValue(keyword) {
  if (!props.systemParams || props.systemParams.length === 0) return '--'
  const item = props.systemParams.find((it) => it.label && it.label.includes(keyword))
  if (!item) return '--'
  return formatSystemParam(item)
}

/** 判断风机盘管是否运行（开关机=开 或 运行状态=运行） */
function isFanRunning() {
  return isParamOn('开关机') || isParamValueIncludes('运行状态', '运行')
}

/** 判断指定关键词的参数是否为开启状态 */
function isParamOn(keyword) {
  if (!props.systemParams || props.systemParams.length === 0) return false
  const item = props.systemParams.find((it) => it.label && it.label.includes(keyword))
  if (!item) return false
  const str = String(item.value)
  return str === '1' || str === 'true' || str.includes('开') || str.includes('运行')
}

/** 判断指定关键词的参数值是否包含指定文本 */
function isParamValueIncludes(keyword, text) {
  if (!props.systemParams || props.systemParams.length === 0) return false
  const item = props.systemParams.find((it) => it.label && it.label.includes(keyword))
  if (!item) return false
  return String(item.value).includes(text)
}

function formatParam(item) {
  return formatSystemParam(item)
}
</script>

<style scoped>
.ba-page{height:100%;display:flex;flex-direction:column;overflow:hidden;background:#06131d;color:#d9eaf3;font-family:"DIN Alternate","PingFang SC","Microsoft YaHei",sans-serif}
main{flex:1;min-height:0;display:flex;flex-direction:column;padding:0;position:relative;background:radial-gradient(circle at 45% 42%,#123148,#07141e 62%)}
main>header{flex-shrink:0;height:44px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(78,141,167,.25);background:rgba(8,35,50,.6)}
main>header h1{margin:0;font-size:16px;font-weight:600;color:#d9eaf3}
.panel-toggle{border:1px solid #3d8197;background:rgba(13,48,65,.8);color:#80c7d1;border-radius:4px;cursor:pointer;font-size:14px;padding:4px 10px;transition:all .2s}
.panel-toggle:hover{color:#48dfa8;border-color:#48dfa8}
.panel-toggle.active{color:#48dfa8;border-color:#48dfa8;background:rgba(72,223,168,.1)}
.ba-content{flex:1;min-height:0;display:flex;gap:0;overflow:hidden;position:relative}
.schematic-card{flex:1;min-width:0;position:relative;overflow:hidden;border:1px solid rgba(78,141,167,.25);background:linear-gradient(rgba(63,117,142,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(63,117,142,.05) 1px,transparent 1px),rgba(5,20,30,.55);background-size:18px 18px;will-change:transform}
.system-panel{position:absolute;right:16px;top:16px;bottom:14px;width:222px;border:1px solid #234b5e;background:#08202e;overflow-y:auto;overflow-x:hidden;z-index:50}
.system-panel header{height:29px;padding:8px 10px;border-bottom:1px solid #285267;background:#0d3041;color:#80c7d1;font-size:10px;position:sticky;top:0;z-index:2}
.system-panel>div{height:34px;padding:0 9px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(52,91,109,.28);font-size:10px}
.system-panel span{color:#6d8c9d}
.system-panel strong{color:#d6e8f0}
@media(max-width:1050px){.system-panel{display:none}}

.ba-schematic{position:absolute;inset:0;overflow:hidden;color:#bcd3df;background:linear-gradient(rgba(53,108,132,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(53,108,132,.05) 1px,transparent 1px);background-size:18px 18px}
.device{cursor:pointer;transition:.2s}
.device:hover{filter:brightness(1.2);transform:translateY(-4px)}
.fcu-asset{position:absolute;inset:auto;top:5%;width:100%;height:auto;aspect-ratio:1.594;overflow:hidden}
.fcu-asset img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 18px 22px rgba(0,0,0,.28))}
.air-stream{position:absolute;display:flex;align-items:center;gap:12px;pointer-events:none;opacity:0;overflow:hidden}
.air-stream i{position:relative;flex:0 0 34px;width:34px;height:13px;border:0;border-top:2px solid #8bf7f1;border-radius:50%;transform:none;filter:drop-shadow(0 0 4px #30e7e2)}
.air-stream i::after{content:"";position:absolute;right:-1px;top:-4px;width:6px;height:6px;border:solid #8bf7f1;border-width:2px 2px 0 0;transform:rotate(45deg)}
.air-stream.active{opacity:.85}
.air-stream.active i{animation:windCurve 1.8s linear infinite}
.air-stream.active i:nth-child(2n){animation-delay:-.9s;opacity:.65}
.fcu-flow{left:45%;top:35%;height:26px}
.fan-rotor{position:absolute;width:92px;height:92px;border-radius:50%;pointer-events:none}
.fan-rotor i{position:absolute;inset:8%;border:2px solid rgba(90,236,202,.42);background:repeating-conic-gradient(from 0deg,rgba(83,244,203,.92) 0 13deg,transparent 13deg 42deg);-webkit-mask:radial-gradient(circle,transparent 0 17%,#000 19% 68%,transparent 70%);mask:radial-gradient(circle,transparent 0 17%,#000 19% 68%,transparent 70%)}
.fan-rotor.running i{animation:spin .7s linear infinite;filter:drop-shadow(0 0 6px #34e1ba)}
.fcu-rotor-1{left:33.5%;top:34%}
.fcu-rotor-2{left:39.2%;top:39%}
.valve-motion{position:absolute;width:30px;height:30px;border:3px solid #d5a542;border-radius:50%;pointer-events:none}
.valve-motion i{position:absolute;left:47%;top:-20%;width:3px;height:140%;background:#ffe075;transform:rotate(var(--open));transition:transform .7s ease;transform-origin:center}
.fcu-valve{left:59.5%;top:69%}
.fcu-air-label{position:absolute;z-index:8;padding:3px 7px;border:1px solid rgba(102,224,238,.45);background:rgba(5,37,51,.88);color:#aef4f4;font-size:9px}
.fcu-ra{left:22%;bottom:19%}
.fcu-da{right:12%;top:30%}
.fcu-valve-feedback{position:absolute;left:57%;bottom:22%;z-index:9}
.fcu-on{position:absolute;left:25%;top:22%}
.fcu-panel{position:absolute;right:2%;top:9%;width:110px;padding:7px;border:1px solid #2b5a6d;background:#082332}
.fcu-panel h4{padding:5px 7px;background:#0f4257;color:#7bd0db}
.fcu-panel :deep(.point-badge){display:flex;justify-content:space-between;border-width:0 0 1px}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes windCurve{0%{transform:translateX(-46px) scaleX(.8);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateX(46px) scaleX(1.1);opacity:0}}

.zoom-controls{position:absolute;bottom:12px;right:12px;display:flex;align-items:center;gap:4px;padding:6px 12px;background:rgba(8,35,50,.95);border:1px solid rgba(78,141,167,.25);border-radius:6px;z-index:20}
.zoom-btn{border:1px solid #3d8197;background:rgba(13,48,65,.8);color:#80c7d1;border-radius:4px;cursor:pointer;font-size:14px;line-height:1;padding:5px 10px;transition:all .2s}
.zoom-btn:hover{color:#48dfa8;border-color:#48dfa8;background:rgba(72,223,168,.1)}
.zoom-label{font-size:14px;color:#80c7d1;min-width:40px;text-align:center}
</style>
