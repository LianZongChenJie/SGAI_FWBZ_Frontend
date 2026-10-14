<template>
  <div class="ba-page heat-recovery">
    <main>
      <header>
        <h1>{{ deviceName || '热回收机组工艺图' }}</h1>
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
          <div class="ba-schematic heat-recovery" :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: '0 0' }">
            <div class="heat-recovery-wrap device" @click="$emit('select-device', 'heat.recovery')">
              <img class="heat-asset" src="/equipment/heat_recovery_dark_clean_v11_transparent.png" alt="" />
              <!-- 空气流动动画 -->
              <div class="air-stream supply-flow" :class="{ active: isFanRunning() }"><i v-for="x in 12" :key="`s${x}`"></i></div>
              <div class="air-stream exhaust-flow" :class="{ active: isFanRunning() }"><i v-for="x in 12" :key="`e${x}`"></i></div>
              <!-- 风机转子动画（heat-supply-rotor 对应排风阀开关，heat-exhaust-rotor 对应送风机开关） -->
              <div class="fan-rotor heat-supply-rotor" :class="{ running: isExhaustDamperOpen() }"><i></i></div>
              <div class="fan-rotor heat-exhaust-rotor" :class="{ running: isSupplyFanOn() }"><i></i></div>

              <!-- 上部标注点 - 新风侧 -->
              <PointBadge class="pt fresh-air-temp" label="新风温度" :value="getParamValue('新风温度')" />
              <PointBadge class="pt fresh-air-humidity" label="新风湿度" :value="getParamValue('新风湿度')" />
              <PointBadge class="pt fresh-air-damper" label="新风密闭阀" :value="getParamValue('新风密闭阀开关状态反馈')" />
              <PointBadge class="pt supply-air-temp" label="回风PM2.5" :value="getParamValue('回风PM2.5')" />
              <PointBadge class="pt return-air-temp-jc" label="回风温度" :value="getParamValue('回风温度')" />
              <PointBadge class="pt return-air-humidity-jc" label="回风湿度" :value="getParamValue('回风湿度')" />
              <PointBadge class="pt supply-water-temp" label="供水温度" :value="getParamValue('供水温度')" />
              <PointBadge class="pt return-water-temp" label="回水温度" :value="getParamValue('回水温度')" />
              <!-- <PointBadge class="pt fan-status" label="送风机状态" :value="getParamValue('送风机运行状态')" /> -->
              <!-- <PointBadge class="pt fan-status-ctl" label="送风机控制" :value="getParamValue('送风机控制')" /> -->

              <!-- 下部标注点 - 排风侧 -->
              <PointBadge class="pt exhaust-air-temp" label="排风温度" :value="getParamValue('排风温度')" />
              <PointBadge class="pt exhaust-damper-status" label="排风阀状态" :value="getParamValue('排风阀状态')" />
              <PointBadge class="pt exhaust-air-humidity" label="排风湿度" :value="getParamValue('排风湿度')" />
              <!-- <PointBadge class="pt return-air-temp" label="回风温度" :value="getParamValue('回风温度')" /> -->
              <PointBadge class="pt exhaust-fan-status" label="送风机状态" :value="getParamValue('送风机运行状态')" />
              <PointBadge class="pt heat-efficiency" label="供水流量" :value="getParamValue('供水流量')" />

              <!-- 中部标注点 - 过滤/换热芯相关 -->
              <PointBadge class="pt filter-fb" label="排风阀开关" :value="getParamValue('排风阀开关')" />
              <PointBadge class="pt wheel-run-status" label="转轮运行状态" :value="getParamValue('转轮运行状态')" />
              <PointBadge class="pt exhaust-air-flow" label="排风流量" :value="getParamValue('排风流量')" />
              <PointBadge class="pt co2-sensor" label="CO₂传感器" :value="getParamValue('CO2')" />
              <PointBadge class="pt supply-air-humidity" label="送风湿度" :value="getParamValue('送风湿度')" />
              <PointBadge class="pt fan-fault" label="送风温度" :value="getParamValue('送风温度')" />
              <PointBadge class="pt pm25-sensor" label="新风流量" :value="getParamValue('新风流量')" />
              <PointBadge class="pt damper-fb" label="水阀开度反馈" :value="getParamValue('水阀开度反馈')" />
              <!-- <PointBadge class="pt frost-alarm" label="防冻" :value="getParamValue('防冻')" /> -->
              <!-- <PointBadge class="pt fan-control" label="风机控制" :value="getParamValue('风机控制')" /> -->
            </div>
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
  import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
  import PointBadge from './components/PointBadge.vue';
  import { formatSystemParam } from './components/systemParamFormat.js';

  const props = defineProps({
    values: { type: Object, default: () => ({}) },
    systemParams: { type: Array, default: () => [] },
    deviceName: { type: String, default: '' },
  });
  defineEmits(['select-device']);

  const showPanel = ref(false);

  // === 缩放与平移 ===
  const zoom = ref(1);
  const panX = ref(0);
  const panY = ref(0);
  const panning = ref(false);
  const userAdjustedZoom = ref(false);
  const schematicCardRef = ref(null);
  let panStartX = 0;
  let panStartY = 0;
  let panOriginX = 0;
  let panOriginY = 0;

  /** 根据容器高度自动调整缩放比例 */
  const autoFitZoom = () => {
    if (userAdjustedZoom.value) return;
    const card = schematicCardRef.value;
    if (!card) return;
    const cardWidth = card.clientWidth;
    const cardHeight = card.clientHeight;
    if (cardWidth <= 0 || cardHeight <= 0) return;
    // heat-device 的 aspect-ratio 大约是 1.5
    const contentNaturalHeight = cardWidth / 1.5;
    if (contentNaturalHeight <= 0) return;
    const fitZoom = +(cardHeight / contentNaturalHeight).toFixed(2);
    zoom.value = Math.min(3, Math.max(0.5, fitZoom));
  };

  const resetZoom = () => {
    userAdjustedZoom.value = false;
    zoom.value = 1;
    panX.value = 0;
    panY.value = 0;
    setTimeout(autoFitZoom, 0);
  };

  let resizeObserver = null;
  let isInitialResize = true;

  onMounted(() => {
    const card = schematicCardRef.value;
    if (card) {
      resizeObserver = new ResizeObserver(() => {
        if (isInitialResize) {
          isInitialResize = false;
          return;
        }
        autoFitZoom();
      });
      resizeObserver.observe(card);
    }
  });

  onBeforeUnmount(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  const handleZoom = (e) => {
    userAdjustedZoom.value = true;
    if (!schematicCardRef.value) return;
    const rect = schematicCardRef.value.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const oldZoom = zoom.value;
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(3, Math.max(0.5, +(oldZoom + delta).toFixed(2)));
    if (newZoom === oldZoom) return;
    const ratio = newZoom / oldZoom;
    panX.value = mouseX - (mouseX - panX.value) * ratio;
    panY.value = mouseY - (mouseY - panY.value) * ratio;
    zoom.value = newZoom;
  };
  const zoomInFn = () => {
    userAdjustedZoom.value = true;
    zoom.value = Math.min(3, +(zoom.value + 0.2).toFixed(2));
  };
  const zoomOutFn = () => {
    userAdjustedZoom.value = true;
    zoom.value = Math.max(0.5, +(zoom.value - 0.2).toFixed(2));
  };
  const startPan = (e) => {
    panning.value = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    panOriginX = panX.value;
    panOriginY = panY.value;
    window.addEventListener('mousemove', onPan);
    window.addEventListener('mouseup', stopPan);
  };
  const onPan = (e) => {
    if (!panning.value) return;
    panX.value = panOriginX + (e.clientX - panStartX);
    panY.value = panOriginY + (e.clientY - panStartY);
  };
  const stopPan = () => {
    panning.value = false;
    window.removeEventListener('mousemove', onPan);
    window.removeEventListener('mouseup', stopPan);
  };

  /** 当接口返回了系统参数数组时优先使用 */
  const displaySystemParams = computed(() => {
    return props.systemParams && props.systemParams.length > 0 ? props.systemParams : [];
  });

  /** 从系统参数数组中按 label 关键词查找对应项并格式化值 */
  function getParamValue(keyword) {
    if (!props.systemParams || props.systemParams.length === 0) return '--';
    const item = props.systemParams.find((it) => it.label && it.label.includes(keyword));
    if (!item) return '--';
    return formatSystemParam(item);
  }

  /** 判断风机是否运行（气流动画使用） */
  function isFanRunning() {
    return isExhaustDamperOpen() || isSupplyFanOn();
  }

  /** 排风阀是否开启（控制 heat-supply-rotor 动画） */
  function isExhaustDamperOpen() {
    return isParamValueIncludes('排风阀状态', '开') || isParamOn('排风阀开关');
  }

  /** 送风机是否开启（控制 heat-exhaust-rotor 动画） */
  function isSupplyFanOn() {
    return isParamValueIncludes('送风机运行状态', '运行') || isParamOn('送风机开关');
  }

  /** 判断指定关键词的参数是否为开启状态 */
  function isParamOn(keyword) {
    if (!props.systemParams || props.systemParams.length === 0) return false;
    const item = props.systemParams.find((it) => it.label && it.label.includes(keyword));
    if (!item) return false;
    const str = String(item.value);
    return str === '1' || str === 'true' || str.includes('开') || str.includes('运行');
  }

  /** 判断指定关键词的参数值是否包含指定文本 */
  function isParamValueIncludes(keyword, text) {
    if (!props.systemParams || props.systemParams.length === 0) return false;
    const item = props.systemParams.find((it) => it.label && it.label.includes(keyword));
    if (!item) return false;
    return String(item.value).includes(text);
  }

  function formatParam(item) {
    return formatSystemParam(item);
  }
</script>

<style scoped>
  .ba-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #06131d;
    color: #d9eaf3;
    font-family: 'DIN Alternate', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }
  main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0;
    position: relative;
    background: radial-gradient(circle at 45% 42%, #123148, #07141e 62%);
  }
  main > header {
    flex-shrink: 0;
    height: 44px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(78, 141, 167, 0.25);
    background: rgba(8, 35, 50, 0.6);
  }
  main > header h1 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #d9eaf3;
  }
  .panel-toggle {
    border: 1px solid #3d8197;
    background: rgba(13, 48, 65, 0.8);
    color: #80c7d1;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    padding: 4px 10px;
    transition: all 0.2s;
  }
  .panel-toggle:hover {
    color: #48dfa8;
    border-color: #48dfa8;
  }
  .panel-toggle.active {
    color: #48dfa8;
    border-color: #48dfa8;
    background: rgba(72, 223, 168, 0.1);
  }
  .ba-content {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 0;
    overflow: hidden;
    position: relative;
  }
  .schematic-card {
    flex: 1;
    min-width: 0;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(78, 141, 167, 0.25);
    background: rgba(5, 20, 30, 0.55);
  }
  .ba-schematic {
    position: absolute;
    inset: 0;
    color: #bcd3df;
    background: linear-gradient(rgba(53, 108, 132, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(53, 108, 132, 0.05) 1px, transparent 1px);
    background-size: 18px 18px;
    will-change: transform;
  }
  .system-panel {
    position: absolute;
    right: 16px;
    top: 16px;
    bottom: 14px;
    width: 300px;
    border: 1px solid #234b5e;
    background: #08202e;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 50;
  }
  .system-panel header {
    height: 40px;
    padding: 10px 14px;
    border-bottom: 1px solid #285267;
    background: #0d3041;
    color: #80c7d1;
    font-size: 16px;
    position: sticky;
    top: 0;
    z-index: 2;
  }
  .system-panel > div {
    height: 48px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(52, 91, 109, 0.28);
    font-size: 16px;
  }
  .system-panel span {
    color: #6d8c9d;
  }
  .system-panel strong {
    color: #d6e8f0;
  }
  @media (max-width: 1050px) {
    .system-panel {
      display: none;
    }
  }

  /* 设备层 */
  .device {
    cursor: pointer;
    transition: 0.2s;
  }
  .device:hover {
    filter: brightness(1.2);
  }
  .heat-recovery-wrap {
    position: absolute;
    left: 2%;
    right: auto;
    top: 0%;
    bottom: auto;
    width: 96%;
    aspect-ratio: 1.5;
    overflow: hidden;
  }
  .heat-asset {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 18px 22px rgba(0, 0, 0, 0.28));
  }

  /* 空气流动动画 */
  .air-stream {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: none;
    opacity: 0;
    overflow: hidden;
  }
  .air-stream i {
    position: relative;
    flex: 0 0 34px;
    width: 34px;
    height: 13px;
    border: 0;
    border-top: 2px solid #8bf7f1;
    border-radius: 50%;
    transform: none;
    filter: drop-shadow(0 0 4px #30e7e2);
  }
  .air-stream i::after {
    content: '';
    position: absolute;
    right: -1px;
    top: -4px;
    width: 6px;
    height: 6px;
    border: solid #8bf7f1;
    border-width: 2px 2px 0 0;
    transform: rotate(45deg);
  }
  .air-stream.active {
    opacity: 0.85;
  }
  .air-stream.active i {
    animation: windCurve 1.8s linear infinite;
  }
  .air-stream.active i:nth-child(2n) {
    animation-delay: -0.9s;
    opacity: 0.65;
  }
  .supply-flow {
    left: 15%;
    right: 15%;
    top: 36%;
    height: 24px;
    transform: rotate(365deg);
  }
  .exhaust-flow {
    left: 15%;
    right: 15%;
    top: 63%;
    height: 20px;
    transform: rotate(7deg);
  }

  /* 风机转子 */
  .fan-rotor {
    position: absolute;
    width: 81px;
    height: 81px;
    border-radius: 50%;
    pointer-events: none;
  }
  .fan-rotor i {
    position: absolute;
    inset: 8%;
    border: 2px solid rgba(90, 236, 202, 0.42);
    background: repeating-conic-gradient(from 0deg, rgba(83, 244, 203, 0.92) 0 13deg, transparent 13deg 42deg);
    -webkit-mask: radial-gradient(circle, transparent 0 17%, #000 19% 68%, transparent 70%);
    mask: radial-gradient(circle, transparent 0 17%, #000 19% 68%, transparent 70%);
  }
  .fan-rotor.running i {
    animation: spin 0.7s linear infinite;
    filter: drop-shadow(0 0 6px #34e1ba);
  }
  .heat-supply-rotor {
    left: 23%;
    top: 31%;
  }
  .heat-exhaust-rotor {
    right: 25%;
    top: 63%;
  }

  /* 参数标注位置 */
  .pt {
    position: absolute;
    z-index: 10;
  }
  /* ===== 上部标注点 - 新风侧 ===== */
  .fresh-air-temp {
    left: 23%;
    top: 43%;
  }
  .fresh-air-humidity {
    left: 12%;
    top: 40%;
  }
  .fresh-air-damper {
    left: 12%;
    top: 65%;
  }
  .filter-fb {
    left: 30%;
    top: 18%;
  }
  .wheel-run-status {
    left: 47%;
    top: 18%;
  }
  .exhaust-air-flow {
    left: 37%;
    top: 18%;
  }
  .supply-air-temp {
    left: 62%;
    top: 18%;
  }
  .supply-air-humidity {
    right: 2%;
    top: 56%;
  }
  .return-air-temp-jc {
    left: 72%;
    top: 18%;
  }
  .return-air-humidity-jc {
    left: 82%;
    top: 18%;
  }
  .supply-water-temp {
    left: 60%;
    top: 72%;
  }
  .return-water-temp {
    left: 50%;
    top: 78%;
  }
  .fan-status {
    left: 82%;
    top: 35%;
  }
  .fan-status-ctl {
    left: 72%;
    top: 35%;
  }
  .co2-sensor {
    left: 53%;
    top: 22%;
  }
  .fan-control {
    left: 82%;
    top: 52%;
  }

  /* ===== 下部标注点 - 排风侧 ===== */
  .exhaust-air-temp {
    left: 23%;
    top: 15%;
  }
  .exhaust-damper-status {
    left: 3%;
    top: 27%;
  }
  .exhaust-air-humidity {
    left: 10%;
    top: 16%;
  }
  .return-air-temp {
    left: 30%;
    top: 77%;
  }
  .heat-efficiency {
    left: 52%;
    top: 50%;
  }
  .exhaust-fan-status {
    left: 67%;
    top: 76%;
  }
  .fan-fault {
    left: 82%;
    top: 55%;
  }
  .pm25-sensor {
    left: 22%;
    top: 66%;
  }
  .damper-fb {
    left: 39%;
    top: 70%;
  }
  .frost-alarm {
    left: 82%;
    top: 77%;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes windCurve {
    0% {
      transform: translateX(-46px) scaleX(0.8);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      transform: translateX(46px) scaleX(1.1);
      opacity: 0;
    }
  }

  .zoom-controls {
    position: absolute;
    bottom: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: rgba(8, 35, 50, 0.95);
    border: 1px solid rgba(78, 141, 167, 0.25);
    border-radius: 6px;
    z-index: 20;
  }
  .zoom-btn {
    border: 1px solid #3d8197;
    background: rgba(13, 48, 65, 0.8);
    color: #80c7d1;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 5px 10px;
    transition: all 0.2s;
  }
  .zoom-btn:hover {
    color: #48dfa8;
    border-color: #48dfa8;
    background: rgba(72, 223, 168, 0.1);
  }
  .zoom-label {
    font-size: 14px;
    color: #80c7d1;
    min-width: 40px;
    text-align: center;
  }
</style>
