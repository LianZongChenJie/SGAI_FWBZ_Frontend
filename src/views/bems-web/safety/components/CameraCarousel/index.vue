<template>
  <div class="camera-carousel">
    <a-carousel
      ref="carouselRef"
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
              <div class="camera-preview">
                <div class="camera-icon">
                  <video-camera-outlined />
                </div>
                <div class="camera-name">{{ camera.name }}</div>
              </div>
              <div class="camera-info">
                <span class="status-dot" :class="camera.status"></span>
                <span>{{ camera.location }}</span>
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
      :title="selectedCamera?.name"
      :footer="null"
      width="800px"
      @cancel="handleModalClose"
    >
      <div v-if="selectedCamera" class="camera-detail">
        <div class="detail-video">
          <div class="video-placeholder">
            <video-camera-outlined class="video-icon" />
            <div class="video-text">{{ selectedCamera.name }} 实时画面</div>
          </div>
        </div>
        <div class="detail-info">
          <div class="info-item">
            <span class="info-label">设备位置：</span>
            <span class="info-value">{{ selectedCamera.location }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">设备状态：</span>
            <span class="info-value" :class="selectedCamera.status">
              <span class="status-dot" :class="selectedCamera.status"></span>
              {{ selectedCamera.status === 'online' ? '在线' : '离线' }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">IP地址：</span>
            <span class="info-value">{{ selectedCamera.ip || '192.168.1.100' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">分辨率：</span>
            <span class="info-value">1920×1080</span>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  VideoCameraOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'

interface Camera {
  id: number | string
  name: string
  location: string
  status: 'online' | 'offline'
  ip?: string
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
const carouselRef = ref()
const modalVisible = ref(false)
const selectedCamera = ref<Camera | null>(null)

// 计算分页后的摄像头数据
const paginatedCameras = computed(() => {
  const pages = []
  const totalPages = Math.ceil(props.cameras.length / itemsPerPage)
  
  for (let i = 0; i < totalPages; i++) {
    const start = i * itemsPerPage
    const end = start + itemsPerPage
    const pageCameras = props.cameras.slice(start, end)
    
    // 如果最后一页不满，用 null 填充
    while (pageCameras.length < itemsPerPage) {
      pageCameras.push(null)
    }
    
    pages.push(pageCameras)
  }
  
  return pages
})


// 处理页面切换
const handleBeforeChange = (from: number, to: number) => {
  currentPage.value = to
}

// 处理摄像头点击
const handleCameraClick = (camera: Camera) => {
  selectedCamera.value = camera
  modalVisible.value = true
  isPlaying.value = false // 停止轮播
  emit('cameraClick', camera)
}

// 关闭弹窗时恢复播放
const handleModalClose = () => {
  modalVisible.value = false
  selectedCamera.value = null
  setTimeout(() => {
    isPlaying.value = true // 延迟恢复播放，避免闪烁
  }, 500)
}

// 生命周期管理
onMounted(() => {
  // 组件挂载时的初始化逻辑
})

onBeforeUnmount(() => {
  // 清理定时器等资源
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
    
    &:hover {
      border-color: #1677ff;
      transform: translateY(-2px);
      
      .camera-icon {
        color: #1677ff;
      }
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
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.7);
      padding: 8px;
      
      .camera-icon {
        font-size: 24px;
        margin-bottom: 4px;
        transition: color 0.3s;
      }
      
      .camera-name {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
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
    
    .camera-info {
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.5);
      font-size: 10px;
      color: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  
  &.online {
    background: #52c41a;
  }
  
  &.offline {
    background: #ff4d4f;
  }
}

.carousel-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 0 10px;
  
  .page-info {
    font-size: 12px;
    color: #666;
  }
}

.camera-detail {
  .detail-video {
    margin-bottom: 20px;
    
    .video-placeholder {
      width: 100%;
      height: 400px;
      background: #000;
      border-radius: 8px;
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
        width: 80px;
        color: #666;
        font-size: 14px;
      }
      
      .info-value {
        flex: 1;
        color: #333;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
        
        &.online {
          color: #52c41a;
        }
        
        &.offline {
          color: #ff4d4f;
        }
      }
    }
  }
}
</style>