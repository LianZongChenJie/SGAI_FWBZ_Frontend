<template>
  <div class="bigscreen-wrapper" ref="wrapperRef">
    <div class="bigscreen-inner" :style="innerStyle">
      <BigscreenHeader />
      <div class="main">
        <!-- 左侧面板 -->
        <div class="side-col">
          <SidePanel
            v-for="panel in leftPanels"
            :key="panel.key"
            :data="panel"
            @open="handleOpenModal"
          />
        </div>
        <!-- 中间列：KPI + 地图 -->
        <div class="center-col">
          <KpiBanner :kpiData="kpiData" @open="handleOpenModal" />
          <MapArea @open="handleOpenModal" />
        </div>
        <!-- 右侧面板 -->
        <div class="side-col">
          <SidePanel
            v-for="panel in rightPanels"
            :key="panel.key"
            :data="panel"
            @open="handleOpenModal"
          />
        </div>
      </div>
      <!-- 跑马灯 -->
      <TickerBar :items="tickerData" />
    </div>
    <!-- 详情弹窗 -->
    <DetailModal ref="modalRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import BigscreenHeader from './components/BigscreenHeader.vue';
import KpiBanner from './components/KpiBanner.vue';
import SidePanel from './components/SidePanel.vue';
import MapArea from './components/MapArea.vue';
import TickerBar from './components/TickerBar.vue';
import DetailModal from './components/DetailModal.vue';
import { leftPanels as rawLeftPanels, rightPanels, kpiData, tickerData } from './data/index';
import { modalData as rawModalData } from './data/modalData';
import { getTodayCheckCount, getAlarmExceptionCount } from './index.api';
import type { CountVO } from './index.api';

defineOptions({ name: 'BigscreenPage' });

const wrapperRef = ref<HTMLElement | null>(null);
const modalRef = ref<InstanceType<typeof DetailModal> | null>(null);
const innerStyle = ref<Record<string, string>>({});

// 左侧面板数据（响应式，便于接口回填）
const leftPanels = reactive(rawLeftPanels);

// 弹窗数据（响应式，便于接口回填）
const modalData = reactive(rawModalData);

/** 索引 */
const ROW_ZERO = 0;  
const ROW_ONE = 1;

/** 解析 "已完成/未完成" 格式，返回 { completed, uncompleted, total, percent } */
function parseContext(ctx: string): { completed: number; uncompleted: number; total: number; percent: string } | null {
  const parts = ctx.split('/');
  if (parts.length === 2) {
    const completed = parseFloat(parts[0]) || 0;
    const uncompleted = parseFloat(parts[1]) || 0;
    const total = completed + uncompleted;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, uncompleted, total, percent: percent + '%' };
  }
  return null;
}

/** 请求今日巡检完成数量并回填面板和弹窗 */
async function fetchTodayCheck() {
  try {
    const res: CountVO = await getTodayCheckCount();
    if (res?.value != null) {
      // 解析 context（已完成/未完成 格式）
      const parsed = res.context ? parseContext(res.context) : null;

      // === 回填面板 ===
      // 今日巡检完成：显示 value
      leftPanels[ROW_ZERO].metricRows[ROW_ZERO].value = res.value;
      // 巡检完成率：显示百分比
      if (parsed) {
        leftPanels[ROW_ZERO].metricCards[ROW_ONE].value = parsed.percent;
      }

      // === 回填弹窗 ===
      const resilienceModal = modalData['resilience'];
      if (resilienceModal) {
        // stats[1] 巡检完成 → value
        resilienceModal.stats[1].value = res.value;
        if (parsed) {
          // stats[2] 待巡检 → 未完成数
          resilienceModal.stats[2].value = String(parsed.uncompleted);
          // stats[3] 完成率 → 百分比
          resilienceModal.stats[3].value = parsed.percent;
        }
      }
    }
  } catch (error) {
    console.error('获取今日巡检完成数量失败:', error);
  }
}

/** 请求待处理告警异常并回填面板和弹窗 */
async function fetchAlarmException() {
  try {
    const res: CountVO = await getAlarmExceptionCount();
    if (res?.value != null) {
      // === 回填面板 ===
      leftPanels[ROW_ZERO].metricRows[ROW_ONE].value = res.value;
    }
  } catch (error) {
    console.error('获取待处理告警异常失败:', error);
  }
}

function handleOpenModal(key: string) {
  modalRef.value?.open(key, modalData);
}

function calcScale() {
  const targetW = 1920;
  const targetH = 1080;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scaleX = w / targetW;
  const scaleY = h / targetH;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (w - targetW * scale) / 2;
  const offsetY = (h - targetH * scale) / 2;
  innerStyle.value = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: targetW + 'px',
    height: targetH + 'px',
    marginLeft: offsetX + 'px',
    marginTop: offsetY + 'px',
  };
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null;
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(calcScale, 100);
}

onMounted(() => {
  nextTick(calcScale);
  window.addEventListener('resize', onResize);
  // 请求韧性安全实时数据
  fetchTodayCheck();
  fetchAlarmException();
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
  if (resizeTimer) clearTimeout(resizeTimer);
});
</script>

<style scoped>
.bigscreen-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #030712;
  position: relative;
}
.bigscreen-wrapper::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.04) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}
.bigscreen-inner {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}
.main {
  flex: 1;
  display: grid;
  grid-template-columns: 580px 700px 580px;
  gap: 10px;
  padding: 8px 20px;
  min-height: 0;
}
.side-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  min-height: 0;
}
.center-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
