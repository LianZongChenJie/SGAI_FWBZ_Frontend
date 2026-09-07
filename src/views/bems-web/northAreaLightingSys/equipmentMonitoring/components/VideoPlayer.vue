<template>
  <div
    ref="wrapRef"
    class="video-player-wrap"
    :class="[themeClass, { 'is-css-fullscreen': cssFullscreen }]"
    @dblclick="onWrapDblclick"
  >
    <iframe
      :src="url"
      class="video-player"
      frameborder="0"
      allow="autoplay; fullscreen; camera; microphone"
      @load="onIframeLoad"
      @error="onIframeError"
    />
    <div v-if="loading" class="video-loading">
      <a-spin size="small" />
    </div>
    <div v-if="error" class="video-error">
      <span class="error-text">视频加载失败</span>
    </div>
    <!-- 视频右下角：全屏观看 / 退出全屏（全屏后按钮变为"退出全屏"；由 FULLSCREEN_ENABLED 控制暂时隐藏） -->
    <button
      v-if="FULLSCREEN_ENABLED && !loading && !error"
      class="video-fullscreen-btn"
      :class="{ 'is-fullscreen': isFullscreen }"
      :title="isFullscreen ? '退出全屏（Esc）' : '全屏观看'"
      @click.stop="toggleFullscreen"
    >
      <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
      </svg>
      <span class="btn-text">{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  url: string
}>()

// 全屏功能总开关：false = 暂时隐藏右下角"全屏"按钮并禁用双击全屏等入口
//（保留全部实现代码，需要恢复时改回 true 即可）
const FULLSCREEN_ENABLED = false

const wrapRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref(false)
// 全屏状态（原生 Fullscreen API 或 CSS 铺屏降级都视为全屏，用于切换按钮文案）
const isFullscreen = ref(false)
// 是否为 CSS 降级全屏（iframe 无全屏权限/浏览器不支持时 fixed 铺满视口兜底）
const cssFullscreen = ref(false)

function onIframeLoad() {
  loading.value = false
  error.value = false
}

function onIframeError() {
  loading.value = false
  error.value = true
}

// URL 变化时重置状态
watch(
  () => props.url,
  () => {
    loading.value = true
    error.value = false
  },
)

/* ==================== 全屏观看（视频右下角按钮） ==================== */
/** 进入全屏：优先原生 Fullscreen API，被拒绝/不支持时降级为 CSS 铺屏 */
function enterFullscreen() {
  const el = wrapRef.value
  if (!el) return
  if (el.requestFullscreen) {
    el.requestFullscreen().catch(() => enableCssFullscreen())
  } else {
    enableCssFullscreen()
  }
}

function enableCssFullscreen() {
  cssFullscreen.value = true
  isFullscreen.value = true
}

function exitFullscreen() {
  // CSS 降级态：直接移除铺屏类
  if (cssFullscreen.value) {
    cssFullscreen.value = false
    isFullscreen.value = false
    return
  }
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  }
}

function toggleFullscreen() {
  if (isFullscreen.value) exitFullscreen()
  else enterFullscreen()
}

/** 双击视频区域切换全屏（尽力兜底，配合右下角按钮使用）。
 * 注意：监控页面为跨域 iframe 时，浏览器安全隔离使 iframe 内部画面的双击事件
 * 无法冒泡到本页面，本监听不会触发；仅在以下场景生效：
 *  1) 监控地址与前端同源；
 *  2) 双击落在 iframe 未覆盖区域 / 加载层 / 错误层。
 * 跨域画面内的双击全屏由监控平台播放器自身实现决定。 */
function onWrapDblclick(e: MouseEvent) {
  // 全屏功能暂时隐藏期间，双击不触发全屏
  if (!FULLSCREEN_ENABLED) return
  // 排除右下角全屏按钮自身的双击（避免双击按钮误触发退出全屏）
  if ((e.target as HTMLElement).closest('.video-fullscreen-btn')) return
  toggleFullscreen()
}

/** 原生全屏切换（进入/退出/ESC）同步按钮态 */
function handleFsChange() {
  if (document.fullscreenElement !== wrapRef.value && !cssFullscreen.value) {
    isFullscreen.value = false
  } else if (document.fullscreenElement === wrapRef.value) {
    isFullscreen.value = true
  }
}

/** CSS 降级全屏下按 Esc 退出 */
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && cssFullscreen.value) {
    exitFullscreen()
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFsChange)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFsChange)
  document.removeEventListener('keydown', handleKeydown)
  // 卸载时若处于 CSS 降级全屏态，清理铺屏类
  if (cssFullscreen.value) {
    cssFullscreen.value = false
    isFullscreen.value = false
  }
})
</script>

<style scoped lang="less">
.video-player-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.video-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}

.video-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: rgba(255, 255, 255, 0.5);

  .error-text {
    font-size: 13px;
  }
}

/* 右下角全屏按钮（视频加载完成后显示；全屏态自动变为"退出全屏"） */
.video-fullscreen-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(0, 10, 24, 0.55);
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  backdrop-filter: blur(2px);
  transition: border-color 0.2s, background 0.2s, color 0.2s;

  &:hover {
    border-color: rgba(0, 212, 255, 0.9);
    background: rgba(0, 140, 220, 0.35);
    color: #fff;
  }
}

/* CSS 降级全屏：固定铺满视口（原生全屏不可用时兜底） */
.video-player-wrap.is-css-fullscreen {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 999999 !important;
  background: #000;
  border-radius: 0 !important;
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped lang="less">
.theme-white.video-player-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}.theme-white .video-player {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}.theme-white .video-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}.theme-white .video-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: rgba(255, 255, 255, 0.5);

  .error-text  {
    font-size: 13px;
  }}
.theme-white .video-fullscreen-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid rgba(24, 144, 255, 0.45);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.92);
  color: #1f2d3d;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  transition: border-color 0.2s, color 0.2s, background 0.2s;

  &:hover  {
    border-color: #1890ff;
    color: #1890ff;
    background: #fff;
  }
}.theme-white .video-player-wrap.is-css-fullscreen {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 999999 !important;
  background: #000;
  border-radius: 0 !important;
}
</style>
