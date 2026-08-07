<template>
  <div class="kpi-banner">
    <div
      class="kpi-card"
      v-for="(item, index) in kpiData"
      :key="item.key"
      :style="{ '--accent': accentColors[index] }"
      @click="$emit('open', item.key)"
    >
      <div class="kpi-icon">{{ item.icon }}</div>
      <div class="kpi-number">{{ displayNumbers[index] }}</div>
      <div class="kpi-label">{{ item.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { KpiData } from '../data/index';

defineOptions({ name: 'KpiBanner' });

const props = defineProps<{ kpiData: KpiData[] }>();
defineEmits<{ (e: 'open', key: string): void }>();

const accentColors = ['#38bdf8', '#4ade80', '#fb923c', '#c084fc'];
const displayNumbers = ref<string[]>(props.kpiData.map(() => '0'));

let rafId: number | null = null;

function animateNumber(target: number, index: number, duration: number) {
  const start = 0;
  const diff = target - start;
  const startTime = performance.now();
  function step(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = start + diff * ease;
    displayNumbers.value[index] = Number.isInteger(target)
      ? Math.floor(current).toLocaleString()
      : current.toFixed(1);
    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    }
  }
  rafId = requestAnimationFrame(step);
}

onMounted(() => {
  setTimeout(() => {
    props.kpiData.forEach((item, i) => {
      animateNumber(item.number, i, 2500);
    });
  }, 500);
});

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<style scoped>
.kpi-banner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.kpi-card {
  background: rgba(8, 20, 40, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.12);
  border-radius: 4px;
  padding: 10px 6px;
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: fade-in-up 0.7s ease-out;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.kpi-card:hover {
  border-color: rgba(56, 189, 248, 0.3);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.1);
}
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
}
.kpi-icon { font-size: 18px; margin-bottom: 2px; }
.kpi-number {
  font-size: 22px;
  font-weight: 800;
  font-family: 'DIN Alternate', 'Arial Black', sans-serif;
  color: #f1f5f9;
  line-height: 1.2;
}
.kpi-label { font-size: 10px; color: #94a3b8; margin-top: 2px; }
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
