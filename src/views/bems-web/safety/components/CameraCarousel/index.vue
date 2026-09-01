<template>
  <div class="camera-carousel">
    <a-carousel
      :autoplay="isPlaying"
      :autoplay-speed="10000"
      :dots="true"
      :arrow="'hover'"
      :before-change="handleBeforeChange"
      :after-change="handleAfterChange"
    >
      <template #prevArrow>
        <div class="custom-arrow prev">
          <left-outlined />
        </div>
      </template>

      <template #nextArrow>
        <div class="custom-arrow next">
          <right-outlined />
        </div>
      </template>

      <div v-for="(page, pageIndex) in paginatedCameras" :key="pageIndex" class="camera-page">
        <div class="camera-grid" :style="gridStyle">
          <div
            v-for="(camera, cameraIndex) in page"
            :key="camera?.id || `empty-${cameraIndex}`"
            class="camera-item"
            :class="{ 'empty-slot': !camera }"
          >
            <template v-if="camera">
              <div class="camera-preview">
                <VideoPlayer
                  v-if="visitedPages.includes(pageIndex) && camera.url"
                  :key="`${camera.id}-${refreshTickMap[camera.id] || 0}`"
                  :url="camera.url"
                />
                <div v-else class="camera-preview-fallback">
                  <video-camera-outlined class="fallback-icon" />
                </div>
                <!-- 刷新按钮 -->
                <div class="refresh-btn" @click.stop="refreshCamera(camera)">
                  <reload-outlined />
                </div>
                <!-- 全屏查看按钮 -->
                <div class="fullscreen-btn" @click.stop="handleFullscreen(camera)">
                  <fullscreen-outlined />
                </div>
              </div>
            </template>
            <template v-else>
              <div class="empty-preview">
                <div class="empty-icon">
                  <video-camera-outlined />
                </div>
                <div class="empty-text">无信号</div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </a-carousel>

    <!-- 全屏查看 overlay -->
    <div v-if="fullscreenCamera" class="fullscreen-overlay">
      <div class="fullscreen-container">
        <div class="fullscreen-video-wrap">
          <VideoPlayer
            v-if="fullscreenCamera.url"
            :url="fullscreenCamera.url"
            :controls="true"
          />
          <div v-else class="video-placeholder">
            <video-camera-outlined class="video-icon" />
            <div class="video-text">暂无视频流</div>
          </div>
        </div>
        <!-- 关闭按钮 -->
        <div class="fullscreen-close" @click="handleCloseFullscreen">
          <close-outlined />
        </div>
        <!-- 摄像头名称 -->
        <div class="fullscreen-title">
          {{ fullscreenCamera.cameraName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  VideoCameraOutlined,
  LeftOutlined,
  RightOutlined,
  FullscreenOutlined,
  CloseOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'
import VideoPlayer from './VideoPlayer.vue'

interface Camera {
  id: number | string
  cameraName: string
  url?: string
  indexCode?: string
  planId?: number
}

const props = withDefaults(
  defineProps<{
    cameras: Camera[]
    layout?: number
  }>(),
  {
    layout: 2,
  },
)

const emit = defineEmits<{
  cameraClick: [camera: Camera]
}>()

const isPlaying = ref(true)
const currentPage = ref(0)
/** 已访问过的页码集合：一旦页面被激活，其 VideoPlayer 持续保持挂载，避免轮播切换后视频不播放 */
const visitedPages = ref<number[]>([0])
const fullscreenCamera = ref<Camera | null>(null)

// 根据布局计算每页数量
const itemsPerPage = computed(() => props.layout * props.layout)

// 动态网格样式
const gridStyle = computed(() => ({
  'grid-template-columns': `repeat(${props.layout}, 1fr)`,
}))

// 计算分页后的摄像头数据
const paginatedCameras = computed(() => {
  const perPage = itemsPerPage.value
  const pages: (Camera | null)[][] = []
  if (props.cameras.length === 0) {
    pages.push(Array.from({ length: perPage }, () => null))
    return pages
  }
  const totalPages = Math.ceil(props.cameras.length / perPage)

  for (let i = 0; i < totalPages; i++) {
    const start = i * perPage
    const end = start + perPage
    const pageCameras: (Camera | null)[] = props.cameras.slice(start, end)

    while (pageCameras.length < perPage) {
      pageCameras.push(null)
    }

    pages.push(pageCameras)
  }

  return pages
})

// 布局切换时重置到第一页并清空已访问页记录，同时刷新所有摄像头使其重新加载
watch(
  () => props.layout,
  () => {
    currentPage.value = 0
    visitedPages.value = [0]
    // 强制所有摄像头重新加载
    refreshAllCameras()
  },
)

// 处理页面切换前：提前激活目标页，让 VideoPlayer 在过渡动画期间就开始加载
const handleBeforeChange = (_from: number, to: number) => {
  currentPage.value = to
  if (!visitedPages.value.includes(to)) {
    visitedPages.value = [...visitedPages.value, to]
  }
  // 切换到目标页时，刷新该页所有摄像头，确保 iframe 重新加载并自动播放
  refreshPageCameras(to)
}

// 页面切换完成后：作为兜底，确保 currentPage 和 visitedPages 正确更新
const handleAfterChange = (current: number) => {
  currentPage.value = current
  if (!visitedPages.value.includes(current)) {
    visitedPages.value = [...visitedPages.value, current]
  }
  // 切换完成后再刷新一次，确保视频在页面可见后开始播放
  refreshPageCameras(current)
}

// 每路摄像头的刷新计数：变化时通过 :key 让 VideoPlayer 重新挂载、iframe 重新加载
const refreshTickMap = reactive<Record<string | number, number>>({})
const refreshCamera = (camera: Camera) => {
  refreshTickMap[camera.id] = (refreshTickMap[camera.id] || 0) + 1
}

/** 刷新指定页的所有摄像头，强制 VideoPlayer 重新挂载以确保视频自动播放 */
const refreshPageCameras = (pageIndex: number) => {
  const page = paginatedCameras.value[pageIndex]
  if (!page) return
  page.forEach((camera) => {
    if (camera) {
      refreshCamera(camera)
    }
  })
}

/** 刷新所有已挂载的摄像头（用于布局切换等场景） */
const refreshAllCameras = () => {
  props.cameras.forEach((camera) => {
    refreshCamera(camera)
  })
}

// 全屏查看
const handleFullscreen = (camera: Camera) => {
  fullscreenCamera.value = camera
  isPlaying.value = false
  emit('cameraClick', camera)
}

// 关闭全屏
const handleCloseFullscreen = () => {
  fullscreenCamera.value = null
  setTimeout(() => {
    isPlaying.value = true
  }, 500)
}

// ESC 关闭全屏
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && fullscreenCamera.value) {
    handleCloseFullscreen()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="less">
.camera-carousel {
  position: relative;

  :deep(.ant-carousel) {
    .slick-slider {
      .slick-dots {
        bottom: -25px;

        li button {
          background: #d9d9d9;
          opacity: 1;
        }

        li.slick-active button {
          background: #1677ff;
        }
      }
    }
  }
}

.custom-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size:16px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }

  &.prev {
    left: 10px;
  }

  &.next {
    right: 10px;
  }
}

.camera-page {
  padding: 10px;
}

.camera-grid {
  display: grid;
  gap: 12px;

  .camera-item {
    background: #1a1a2e;
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    border: 2px solid #2d2d4e;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;

    &:hover {
      border-color: #1677ff;
      transform: translateY(-2px);
    }

    &.empty-slot {
      &:hover {
        border-color: #2d2d4e;
        transform: none;
      }
    }

    .camera-preview {
      flex: 1;
      position: relative;
      overflow: hidden;
      background: #000;

      .camera-preview-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.3);

        .fallback-icon {
          font-size: 28px;
        }
      }

      .fullscreen-btn,
      .refresh-btn {
        position: absolute;
        bottom: 8px;
        width: 32px;
        height: 32px;
        background: rgba(0, 0, 0, 0.55);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.85);
        font-size:16px;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s;
        z-index: 5;

        &:hover {
          background: rgba(0, 0, 0, 0.75);
          color: #fff;
        }
      }

      .fullscreen-btn {
        right: 8px;
      }

      .refresh-btn {
        right: 44px;
      }
    }

    &:hover .fullscreen-btn,
    &:hover .refresh-btn {
      opacity: 1;
    }

    .empty-preview {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.3);
      padding: 8px;

      .empty-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }

      .empty-text {
        font-size:13px;
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }
}

/* 全屏 overlay */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;

  .fullscreen-container {
    position: relative;
    width: 90vw;
    height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;

    .fullscreen-video-wrap {
      width: 100%;
      height: 100%;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
    }

    .fullscreen-close {
      position: absolute;
      top: -40px;
      right: 0;
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.3s;
      z-index: 10;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }

    .fullscreen-title {
      position: absolute;
      top: -40px;
      left: 0;
      color: rgba(255, 255, 255, 0.85);
      font-size: 16px;
      font-weight: 500;
      line-height: 36px;
    }

    .video-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.5);

      .video-icon {
        font-size: 48px;
        margin-bottom: 12px;
      }

      .video-text {
        font-size: 16px;
      }
    }
  }
}
</style>
