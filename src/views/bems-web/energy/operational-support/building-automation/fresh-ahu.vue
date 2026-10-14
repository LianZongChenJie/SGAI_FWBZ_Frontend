<template>
  <div class="ba-page fresh-ahu">
    <main>
      <header>
        <h1>{{ deviceName || '新风机组工艺图' }}</h1>
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
          <div class="ba-schematic fresh-ahu" :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: '0 0' }">
            <div class="fresh-ahu-wrap device" @click="$emit('select-device', 'fresh.ahu')">
              <img class="fresh-asset" src="/equipment/fresh_air_unit_transparent.png" alt="" />
              <!-- 空气流动动画 -->
              <div class="air-stream supply-flow" :class="{ active: isFanRunning() }"><i v-for="x in 12" :key="`s${x}`"></i></div>
              <!-- 风机转子动画 -->
              <!-- <div class="fan-rotor fresh-supply-rotor" :class="{ running: isFanRunning() }"><i></i></div> -->
              <div class="fan-rotor fresh-exhaust-rotor" :class="{ running: isFanRunning() }"><i></i></div>
              <!-- 风阀动效 -->
              <div class="damper-motion fresh-damper" :class="{ closed: !isFanRunning() }"><i v-for="x in 5" :key="`d${x}`"></i></div>

              <!-- 上部标注点 - 从左到右 -->
              <PointBadge class="pt filter-one-fb" label="初效" :value="getParamValue('初效')" />
              <PointBadge class="pt filter-two-fb" label="中效" :value="getParamValue('中效')" />
              <PointBadge class="pt valve-feedback-fb" label="水阀反馈" :value="getParamValue('水阀开度反馈')" />
              <PointBadge class="pt humidifier-fb" label="加湿控制" :value="getParamValue('湿膜加湿')" />
              <PointBadge class="pt fan-status" label="送风机组状态" :value="getParamValue('送风机运行状态')" />

              <!-- 下部标注点 - 从左到右 -->
              <PointBadge class="pt fresh-air-temp" label="新风温度" :value="getParamValue('新风温度')" />
              <PointBadge class="pt frost-alarm" label="防冻" :value="getParamValue('防冻')" />
              <PointBadge class="pt fan-fault" label="送风机故障报警" :value="getParamValue('送风机故障')" />
              <PointBadge class="pt fan-auto" label="送风机手自动" :value="getParamValue('送风机/自动')" />
              <PointBadge class="pt supply-air-temp" label="送风温度" :value="getParamValue('送风温度')" />

              <!-- 其他标注点（接口有数据时展示） -->
              <PointBadge class="pt fresh-air-humidity" label="新风湿度" :value="getParamValue('新风湿度')" />
              <PointBadge class="pt pm25-sensor" label="PM2.5传感器" :value="getParamValue('PM2.5')" />
              <PointBadge class="pt valve-control-fb" label="水阀控制" :value="getParamValue('水阀控制')" />
              <PointBadge class="pt supply-water-temp" label="供水温度" :value="getParamValue('供水温度')" />
              <PointBadge class="pt return-water-temp" label="回水温度" :value="getParamValue('回水温度')" />
              <PointBadge class="pt fan-control" label="送风机控制" :value="getParamValue('送风机启停控制')" />
              <PointBadge class="pt supply-air-humidity" label="送风湿度" :value="getParamValue('送风湿度')" />
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
    // fresh-device 的 aspect-ratio 大约是 1.5
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

  /** 判断送风机是否运行 */
  function isFanRunning() {
    return isParamValueIncludes('送风机运行状态', '运行') || isParamOn('送风机启停');
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

  /* 对齐 ahu-1.vue 的设备层：device 负责 hover，ahu-wrap 负责定位与尺寸 */
  .device {
    cursor: pointer;
    transition: 0.2s;
  }
  .device:hover {
    filter: brightness(1.2);
  }
  .fresh-ahu-wrap {
    position: absolute;
    left: 2%;
    right: auto;
    top: -20%;
    bottom: auto;
    width: 96%;
    aspect-ratio: 1.5;
    overflow: hidden;
  }
  .fresh-asset {
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
    top: 58%;
    height: 24px;
    transform: rotate(8deg);
  }
  .exhaust-flow {
    left: 15%;
    right: 15%;
    top: 62%;
    height: 20px;
    transform: rotate(-2deg);
  }

  /* 风机转子 */
  .fan-rotor {
    position: absolute;
    width: 95px;
    height: 95px;
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
  .fresh-supply-rotor {
    right: 18%;
    top: 42%;
  }
  .fresh-exhaust-rotor {
    right: 25%;
    top: 59%;
  }

  /* 风阀 */
  .damper-motion {
    position: absolute;
    display: flex;
    justify-content: space-around;
    pointer-events: none;
  }
  .damper-motion i {
    width: 3px;
    background: #62d9df;
    transform: rotate(var(--open, 42deg));
    transform-origin: center;
    transition:
      transform 0.65s ease,
      background 0.3s;
  }
  .damper-motion.closed i {
    transform: rotate(5deg);
    background: #ff9477;
  }
  .fresh-damper {
    left: 18%;
    top: 49%;
    width: 7%;
    height: 8%;
  }

  /* 参数标注位置 - 参考 index.html 布局定位 */
  .pt {
    position: absolute;
    z-index: 10;
  }
  /* ===== 上部标注点（index.html top: 160~255） ===== */
  /* 送风机频率反馈 - index.html: left:125px, top:160px → 6.8%, 23.2% */
  .fan-freq-fb {
    left: 6%;
    top: 23%;
  }
  /* 初效 - index.html: left:265px, top:200px → 19.5%, 29.6% */
  .filter-one-fb {
    left: 19%;
    top: 30%;
  }
  /* 中效 - index.html: left:360px, top:200px → 28.2%, 29.6% */
  .filter-two-fb {
    left: 28%;
    top: 30%;
  }
  /* 水阀反馈 - index.html: left:470px, top:180px → 38.2%, 26.4% */
  .valve-feedback-fb {
    left: 58%;
    top: 42%;
  }
  /* 加湿控制 - index.html: left:585px, top:255px → 48.6%, 38.4% */
  .humidifier-fb {
    left: 48%;
    top: 38%;
  }
  /* 送风机组状态 - index.html: left:700px, top:215px → 59.1%, 32.0% */
  .fan-status {
    left: 59%;
    top: 32%;
  }
  /* 送风频率反馈 - index.html: left:830px, top:175px → 70.9%, 25.6% */
  .fan-freq-adj {
    left: 71%;
    top: 25%;
  }

  /* ===== 下部标注点（index.html top: 245~530） ===== */
  /* 新风温度 - index.html: left:175px, top:415px → 11.4%, 65.6% */
  .fresh-air-temp {
    left: 11%;
    top: 65%;
  }
  /* 防火阀 - index.html: left:300px, top:415px → 22.7%, 65.6% */
  .fire-damper {
    left: 22%;
    top: 65%;
  }
  /* 防冻 - index.html: left:470px, top:530px → 38.2%, 82.4% */
  .frost-alarm {
    left: 38%;
    top: 75%;
  }
  /* 加湿状态 - index.html: left:660px, top:470px → 55.5%, 74.4% */
  .humidifier-status {
    left: 59%;
    top: 70%;
  }
  /* 送风机故障报警 - index.html: left:895px, top:465px → 76.8%, 73.6% */
  .fan-fault {
    left: 76%;
    top: 73%;
  }
  /* 送风机手自动 - index.html: left:895px, top:530px → 76.8%, 82.4% */
  .fan-auto {
    left: 76%;
    top: 82%;
  }
  /* 送风温度 - index.html: left:1000px, top:245px → 86.4%, 36.8% */
  .supply-air-temp {
    left: 86%;
    top: 37%;
  }

  /* ===== 其他标注点（接口有数据时使用，放在边缘位置不遮挡主视图） ===== */
  .fresh-air-humidity {
    left: 3%;
    top: 45%;
  }
  .fresh-damper-fb {
    left: 3%;
    top: 55%;
  }
  .pm25-sensor {
    left: 35%;
    top: 35%;
  }
  .valve-control-fb {
    left: 56%;
    top: 68%;
  }
  .supply-water-temp {
    left: 43%;
    top: 75%;
  }
  .return-water-temp {
    left: 50%;
    top: 75%;
  }
  .fan-control {
    left: 88%;
    top: 50%;
  }
  .supply-air-humidity {
    left: 88%;
    top: 60%;
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
