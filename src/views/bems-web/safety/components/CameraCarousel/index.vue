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
        <div class="camera-grid">
          <div
            v-for="(camera, cameraIndex) in page"
            :key="camera?.id || `empty-${cameraIndex}`"
            class="camera-item"
            :class="{ 'empty-slot': !camera }"
            @click="camera && handleCameraClick(camera)"
          >
            <template v-if="camera">
              <!-- 仅当前可见页播放视频，其余页显示名称占位以节省性能 -->
              <div class="camera-preview">
                <VideoPlayer
                  v-if="pageIndex === currentPage && camera.url"
                  :url="camera.url"
                />
                <div v-else class="camera-preview-fallback">
                  <video-camera-outlined class="fallback-icon" />
                </div>
              </div>
              <div class="camera-name-bar">
                <span class="status-dot online"></span>
                <span class="camera-name-text">{{ camera.cameraName }}</span>
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


    <!-- 摄像头详情弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="selectedCamera?.cameraName"
      :footer="null"
      width="850px"
      @cancel="handleModalClose"
    >
      <div v-if="selectedCamera" class="camera-detail">
        <div class="detail-video">
          <!-- 加载中 -->
          <div v-if="modalLoading" class="video-placeholder">
            <a-spin size="large" />
            <div class="video-text">正在获取视频流...</div>
          </div>
          <!-- 播放视频 -->
          <VideoPlayer
            v-else-if="playUrl"
            :url="playUrl"
            :controls="true"
          />
          <!-- 获取失败 -->
          <div v-else class="video-placeholder">
            <video-camera-outlined class="video-icon" />
            <div class="video-text">暂无视频流</div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  VideoCameraOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'
import VideoPlayer from './VideoPlayer.vue'
import { getCameraPlayUrls } from '../../security/index.api'

interface Camera {
  id: number | string
  cameraName: string
  url?: string
  indexCode?: string
  planId?: number
}

const props = defineProps<{
  cameras: Camera[]
  itemsPerPage?: number
}>()

const emit = defineEmits<{
  cameraClick: [camera: Camera]
}>()

const itemsPerPage = props.itemsPerPage || 8
const isPlaying = ref(true)
const currentPage = ref(0)
const modalVisible = ref(false)
const selectedCamera = ref<Camera | null>(null)
const modalLoading = ref(false)
const playUrl = ref('')

// 计算分页后的摄像头数据
const paginatedCameras = computed(() => {
  const pages: (Camera | null)[][] = []
  if (props.cameras.length === 0) {
    // 无数据时展示一页空位
    pages.push(Array.from({ length: itemsPerPage }, () => null))
    return pages
  }
  const totalPages = Math.ceil(props.cameras.length / itemsPerPage)
  
  for (let i = 0; i < totalPages; i++) {
    const start = i * itemsPerPage
    const end = start + itemsPerPage
    const pageCameras: (Camera | null)[] = props.cameras.slice(start, end)
    
    // 如果最后一页不满，用 null 填充
    while (pageCameras.length < itemsPerPage) {
      pageCameras.push(null)
    }
    
    pages.push(pageCameras)
  }
  
  return pages
})


// 处理页面切换
const handleBeforeChange = (_from: number, to: number) => {
  currentPage.value = to
}

// 处理摄像头点击 — 调用 playUrls 接口获取播放地址
const handleCameraClick = async (camera: Camera) => {
  selectedCamera.value = camera
  modalVisible.value = true
  isPlaying.value = false // 停止轮播
  playUrl.value = ''
  modalLoading.value = true
  emit('cameraClick', camera)

  try {
    const res: any = await getCameraPlayUrls({
      cameraIndexCode: [camera.indexCode],
    })
    // result 为数组，取匹配 cameraIndexCode 的 url
    const match = (res || []).find(
      (item: any) => item.cameraIndexCode === camera.indexCode,
    )
    playUrl.value = match?.url || (res?.[0]?.url ?? '')
  } catch (error) {
    console.error('获取摄像头播放地址失败:', error)
    playUrl.value = ''
  } finally {
    modalLoading.value = false
  }
}

// 关闭弹窗时恢复播放
const handleModalClose = () => {
  modalVisible.value = false
  selectedCamera.value = null
  playUrl.value = ''
  modalLoading.value = false
  setTimeout(() => {
    isPlaying.value = true // 延迟恢复播放，避免闪烁
  }, 500)
}
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
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  
  .camera-item {
    background: #1a1a2e;
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    border: 2px solid #2d2d4e;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    
    &:hover {
      border-color: #1677ff;
      transform: translateY(-2px);
    }
    
    &.empty-slot {
      cursor: default;
      
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
    }
    
    .camera-name-bar {
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.65);
      font-size: 11px;
      color: rgba(255, 255, 255, 0.85);
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-height: 22px;

      .camera-name-text {
        overflow: hidden;
        text-overflow: ellipsis;
      }
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

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  
  &.online {
    background: #52c41a;
  }
  
  &.offline {
    background: #ff4d4f;
  }
}

.camera-detail {
  .detail-video {
    margin-bottom: 20px;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    
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
  
  .detail-info {
    .info-item {
      display: flex;
      margin-bottom: 12px;
      
      .info-label {
        width: 90px;
        color: #666;
        font-size: 14px;
      }
      
      .info-value {
        flex: 1;
        color: #333;
        font-size: 14px;
      }
    }
  }
}
</style>
