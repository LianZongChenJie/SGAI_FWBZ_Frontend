<template>
  <div class="map-area">
    <iframe :src="mapIframeSrc" allowfullscreen></iframe>
    <div class="map-overlay">
      <div class="scan-line"></div>
      <!-- 方框标记 -->
      <div
        v-for="(box, i) in mapBoxes"
        :key="'box-' + i"
        class="map-box"
        :class="box.color"
        :style="{ top: box.top, left: box.left, width: box.width, height: box.height }"
      ></div>
      <!-- 点标记 -->
      <div
        v-for="(marker, i) in mapMarkers"
        :key="'marker-' + i"
        class="map-marker"
        :class="marker.color"
        :style="{ top: marker.top, left: marker.left }"
      >
        <div class="map-marker-label">{{ marker.label }}</div>
      </div>
      <!-- 底部按钮 -->
      <div class="map-bottom-btns">
        <div class="map-btn" v-for="btn in mapBtns" :key="btn.modalKey" @click="$emit('open', btn.modalKey)">
          <span class="map-btn-icon">{{ btn.icon }}</span>
          <span class="map-btn-text">{{ btn.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mapIframeSrc, mapMarkers, mapBoxes, mapBtns } from '../data/index';

defineOptions({ name: 'MapArea' });
defineEmits<{ (e: 'open', key: string): void }>();
</script>

<style scoped>
.map-area {
  flex: 1;
  background: rgba(8, 20, 40, 0.5);
  border: 1px solid rgba(56, 189, 248, 0.18);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}
.map-area iframe {
  width: 100%;
  height: 100%;
  border: none;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
.map-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 2;
}
.scan-line {
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.5), transparent);
  animation: scan-line 6s ease-in-out infinite;
}
.map-marker {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  animation: pulse-glow 2s ease-in-out infinite;
}
.map-marker::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid currentColor;
  animation: pulse-glow 2s ease-in-out infinite;
}
.map-marker.blue { background: #38bdf8; color: #38bdf8; }
.map-marker.green { background: #4ade80; color: #4ade80; }
.map-marker.orange { background: #fb923c; color: #fb923c; }
.map-marker.red { background: #f87171; color: #f87171; }
.map-marker.purple { background: #c084fc; color: #c084fc; }
.map-marker-label {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 10px;
  color: #e2e8f0;
  background: rgba(6, 25, 50, 0.9);
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}
.map-box {
  position: absolute;
  border: 2px solid;
  border-radius: 3px;
  background: rgba(0,0,0,0.1);
  animation: pulse-glow 3s ease-in-out infinite;
}
.map-box.red { border-color: #f87171; box-shadow: 0 0 8px rgba(248, 113, 113, 0.3); }
.map-box.blue { border-color: #38bdf8; box-shadow: 0 0 8px rgba(56, 189, 248, 0.3); }
.map-box.orange { border-color: #fb923c; box-shadow: 0 0 8px rgba(251, 146, 60, 0.3); }
.map-bottom-btns {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
  pointer-events: auto;
}
.map-btn {
  background: rgba(8, 20, 40, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 6px;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}
.map-btn:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.5);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
}
.map-btn-icon { font-size: 16px; }
.map-btn-text { font-size: 13px; font-weight: 600; color: #e2e8f0; }
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 4px rgba(56, 189, 248, 0.3); }
  50% { box-shadow: 0 0 12px rgba(56, 189, 248, 0.6); }
}
@keyframes scan-line {
  0% { top: 0%; opacity: 0; }
  5% { opacity: 1; }
  95% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
</style>
