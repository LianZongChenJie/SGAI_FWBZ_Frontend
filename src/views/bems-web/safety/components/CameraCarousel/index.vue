<template>
  <div class="camera-carousel">
    <a-carousel
      :autoplay="isPlaying"
      :autoplay-speed="10000"
      :interval="true"
      :dots="true"
      :arrow="'hover'"
      @before-change="handleBeforeChange"
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
                  v-if="pageIndex === currentPage && camera.url"
                  :url="camera.url"
                />
                <div v-else class="camera-preview-fallback">
                  <video-camera-outlined class="fallback-icon" />
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  VideoCameraOutlined,
  LeftOutlined,
  RightOutlined,
  FullscreenOutlined,
  CloseOutlined,
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

// 布局切换时重置到第一页
watch(
  () => props.layout,
  () => {
    currentPage.value = 0
  },
)

// 处理页面切换
const handleBeforeChange = (_from: number, to: number) => {
  currentPage.value = to
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
  font-size: 14px;
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

      .fullscreen-btn {
        position: absolute;
        right: 8px;
        bottom: 8px;
        width: 28px;
        height: 28px;
        background: rgba(0, 0, 0, 0.55);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.85);
        font-size: 14px;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s;
        z-index: 5;

        &:hover {
          background: rgba(0, 0, 0, 0.75);
          color: #fff;
        }
      }
    }

    &:hover .fullscreen-btn {
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
        font-size: 11px;
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
