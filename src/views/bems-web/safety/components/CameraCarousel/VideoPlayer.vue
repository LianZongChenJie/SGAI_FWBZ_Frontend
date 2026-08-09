<template>
  <div class="video-player-wrap">
    <iframe
      v-if="url"
      ref="iframeRef"
      :src="url"
      class="video-player"
      frameborder="0"
      allow="autoplay; fullscreen; encrypted-media"
      allowfullscreen
      @load="handleLoad"
      @error="handleError"
    />
    <div v-if="loading" class="video-loading">
      <a-spin size="small" />
    </div>
    <div v-if="error" class="video-error">
      <video-camera-outlined class="error-icon" />
      <span class="error-text">视频加载失败</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { VideoCameraOutlined } from '@ant-design/icons-vue'

const props = withDefaults(
  defineProps<{
    url: string
    muted?: boolean
    autoplay?: boolean
    loop?: boolean
    controls?: boolean
  }>(),
  {
    muted: true,
    autoplay: true,
    loop: false,
    controls: false,
  },
)

const iframeRef = ref<HTMLIFrameElement | null>(null)
const loading = ref(true)
const error = ref(false)
let loadTimer: ReturnType<typeof setTimeout> | null = null

const startPlay = () => {
  if (!props.url) {
    loading.value = false
    error.value = true
    return
  }

  loading.value = true
  error.value = false

  // 超时保护：15 秒未加载完成则显示错误
  if (loadTimer) clearTimeout(loadTimer)
  loadTimer = setTimeout(() => {
    if (loading.value) {
      loading.value = false
      error.value = true
    }
  }, 15000)
}

const handleLoad = () => {
  if (loadTimer) {
    clearTimeout(loadTimer)
    loadTimer = null
  }
  loading.value = false
  error.value = false
}

const handleError = () => {
  if (loadTimer) {
    clearTimeout(loadTimer)
    loadTimer = null
  }
  loading.value = false
  error.value = true
}

watch(
  () => props.url,
  () => {
    startPlay()
  },
)

onMounted(() => {
  startPlay()
})

onBeforeUnmount(() => {
  if (loadTimer) {
    clearTimeout(loadTimer)
    loadTimer = null
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
  display: block;
  border: none;
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

  .error-icon {
    font-size: 28px;
    margin-bottom: 6px;
  }

  .error-text {
    font-size: 11px;
  }
}
</style>
