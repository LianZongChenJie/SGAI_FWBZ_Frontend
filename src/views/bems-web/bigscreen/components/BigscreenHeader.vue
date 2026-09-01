<template>
  <div class="header">
    <div class="header-title">会展小镇服务保障平台</div>
    <div class="header-sub" @dblclick="toggleFullscreen">
      <span class="live-dot"></span>
      <span>实时数据监控中</span>
      <span>{{ clock }}</span>
    </div>
    <button class="btn-console" @click="goConsole">
      <svg viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>
      操作台
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineOptions({ name: 'BigscreenHeader' });

const clock = ref('--:--:--');

let clockTimer: ReturnType<typeof setInterval> | null = null;

function updateClock() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
  clock.value = dateStr + ' ' + timeStr;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

async function goConsole() {
  // 如果当前处于全屏模式，先退出全屏再跳转
  if (document.fullscreenElement) {
    await document.exitFullscreen().catch(() => {});
  }
  // 直接通过 location 跳转并重新加载页面，彻底清除大屏残留的样式状态
  window.location.href = '/fwbz';
}

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
});
</script>

<style scoped>
.header {
  position: relative;
  z-index: 10;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(8, 25, 50, 0.95) 0%, rgba(8, 25, 50, 0.4) 100%);
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
}
.header::before {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #0ea5e9, #38bdf8, #0ea5e9, transparent);
}
.header-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 6px;
  color: #f1f5f9;
  text-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
}
.header-sub {
  position: absolute;
  right: 110px;
  top: 50%;
  transform: translateY(-50%);
  font-size:14px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s ease;
}
.header-sub:hover {
  background: rgba(56, 189, 248, 0.08);
}
.live-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: blink 2s ease-in-out infinite;
}
.btn-console {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  background: rgba(8, 25, 50, 0.8);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  padding: 6px 14px;
  border-radius: 4px;
  font-size:14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}
.btn-console:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.5);
}
.btn-console svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
