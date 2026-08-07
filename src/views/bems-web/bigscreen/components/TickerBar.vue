<template>
  <div class="ticker-bar">
    <div class="ticker-content">
      <div class="ticker-item" v-for="(item, i) in items" :key="i">
        <span class="dot" :class="item.dotColor"></span>
        {{ item.text }}
      </div>
      <!-- 重复一遍以实现无缝滚动 -->
      <div class="ticker-item" v-for="(item, i) in items" :key="'dup-' + i">
        <span class="dot" :class="item.dotColor"></span>
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TickerItem } from '../data/index';

defineOptions({ name: 'TickerBar' });

defineProps<{ items: TickerItem[] }>();
</script>

<style scoped>
.ticker-bar {
  height: 28px;
  background: rgba(8, 25, 50, 0.8);
  border-top: 1px solid rgba(56, 189, 248, 0.1);
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
}
.ticker-content {
  display: flex;
  gap: 36px;
  white-space: nowrap;
  animation: ticker-scroll 40s linear infinite;
  padding-left: 100%;
}
.ticker-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #94a3b8;
}
.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot.green { background: #4ade80; }
.dot.orange { background: #fb923c; }
.dot.red { background: #f87171; }
@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
