<template>
  <div class="video-player-wrap">
    <video
      ref="videoRef"
      class="video-player"
      :muted="muted"
      :autoplay="autoplay"
      :loop="loop"
      :controls="controls"
      playsinline
      webkit-playsinline
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
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Hls from 'hls.js'
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

const videoRef = ref<HTMLVideoElement | null>(null)
const loading = ref(true)
const error = ref(false)
let hls: Hls | null = null

const destroyHls = () => {
  if (hls) {
    hls.destroy()
    hls = null
  }
}

const play = () => {
  if (!videoRef.value || !props.url) {
    loading.value = false
    error.value = true
    return
  }

  destroyHls()
  loading.value = true
  error.value = false
  const video = videoRef.value

  // 原生 HLS 支持（Safari / iOS）
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = props.url
    video.addEventListener('loadedmetadata', () => {
      loading.value = false
      video.play().catch(() => {})
    })
    video.addEventListener('error', () => {
      loading.value = false
      error.value = true
    })
    return
  }

  // 使用 hls.js 播放
  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    })
    hls.loadSource(props.url)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      loading.value = false
      video.play().catch(() => {})
    })
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        loading.value = false
        error.value = true
        destroyHls()
      }
    })
  } else {
    loading.value = false
    error.value = true
  }
}

watch(
  () => props.url,
  () => {
    play()
  },
)

onMounted(() => {
  play()
})

onBeforeUnmount(() => {
  destroyHls()
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
  object-fit: cover;
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

  .error-icon {
    font-size: 28px;
    margin-bottom: 6px;
  }

  .error-text {
    font-size: 11px;
  }
}
</style>
