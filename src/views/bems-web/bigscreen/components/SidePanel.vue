<template>
  <div class="panel" :style="{ '--accent': data.accent }" @click="$emit('open', data.key)">
    <div class="corner-deco tl"></div>
    <div class="corner-deco tr"></div>
    <div class="corner-deco bl"></div>
    <div class="corner-deco br"></div>
    <div class="panel-title">{{ data.title }}</div>
    <!-- 指标卡片 -->
    <div class="metric-cards">
      <div class="metric-card" v-for="(card, i) in data.metricCards" :key="i">
        <div class="metric-card-icon">{{ card.icon }}</div>
        <div class="metric-card-value" :style="{ color: card.valueColor }">{{ card.value }}</div>
        <div class="metric-card-label">{{ card.label }}</div>
      </div>
    </div>
    <!-- 指标行（最多4项） -->
    <div class="metric-row" v-for="(row, i) in data.metricRows" :key="i">
      <span class="metric-label">{{ row.label }}</span>
      <span class="metric-value" :class="row.valueClass">
        {{ row.value }}<span v-if="row.unit" class="metric-unit">{{ row.unit }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PanelData } from '../data/index';

defineOptions({ name: 'SidePanel' });

defineProps<{ data: PanelData }>();
defineEmits<{ (e: 'open', key: string): void }>();
</script>

<style scoped>
.panel {
  background: rgba(8, 20, 40, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 4px;
  padding: 6px 10px;
  position: relative;
  overflow: hidden;
  animation: fade-in-up 0.4s ease-out;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel:hover {
  border-color: rgba(56, 189, 248, 0.3);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.1);
}
.panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, var(--accent, #38bdf8), transparent);
}
.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent, #38bdf8);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 8px;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}
.panel-title::after {
  content: '点击查看详情';
  margin-left: auto;
  font-size: 10px;
  color: #475569;
  font-weight: 400;
  opacity: 0.7;
}
.metric-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  margin-bottom: 4px;
  flex-shrink: 0;
}
.metric-card {
  background: rgba(15, 35, 65, 0.5);
  border: 1px solid rgba(56, 189, 248, 0.08);
  border-radius: 3px;
  padding:10px 8px;
  text-align: center;
}
.metric-card-icon { font-size: 16px; margin-bottom: 6px; line-height: 1; color: #fff }
.metric-card-value {
  font-size: 16px;
  font-weight: 700;
  font-family: 'DIN Alternate', 'Arial Black', sans-serif;
  color: #f1f5f9;
  line-height: 1.2;
}
.metric-card-label { font-size: 9px; color: #64748b; margin-top: 0; }
.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.05);
  position: relative;
  z-index: 2;
  font-size: 12px;
  flex-shrink: 0;
}
.metric-row:last-of-type { border-bottom: none; }
.metric-label { color: #94a3b8; }
.metric-value {
  font-weight: 700;
  font-family: 'DIN Alternate', 'Arial Black', sans-serif;
}
.metric-value.blue { color: #38bdf8; }
.metric-value.green { color: #4ade80; }
.metric-value.orange { color: #fb923c; }
.metric-value.purple { color: #c084fc; }
.metric-value.red { color: #f87171; }
.metric-value.yellow { color: #facc15; }
.metric-unit { font-size: 10px; color: #64748b; margin-left: 2px; font-weight: 400; }
.corner-deco {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 1px solid rgba(56, 189, 248, 0.25);
}
.corner-deco.tl { top: 2px; left: 2px; border-right: none; border-bottom: none; }
.corner-deco.tr { top: 2px; right: 2px; border-left: none; border-bottom: none; }
.corner-deco.bl { bottom: 2px; left: 2px; border-right: none; border-top: none; }
.corner-deco.br { bottom: 2px; right: 2px; border-left: none; border-top: none; }
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
