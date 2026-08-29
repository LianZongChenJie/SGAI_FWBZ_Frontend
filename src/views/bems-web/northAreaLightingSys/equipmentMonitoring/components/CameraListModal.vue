<template>
  <a-modal
    v-model:open="open"
    title="视频列表"
    :footer="null"
    width="600px"
    :destroyOnClose="true"
    :maskClosable="false"
    wrapClassName="camera-list-modal"
    @cancel="closeModal"
   :class="themeClass">
    <!-- 提示 -->
    <div class="modal-tip">
      <svg class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
      <span>请选择摄像头视频流（最多选择 <strong>2</strong> 个）</span>
    </div>

    <!-- 摄像头列表 -->
    <div class="camera-list">
      <div
        v-for="item in cameraList"
        :key="item.id"
        class="camera-item"
        :class="{ selected: selectedIds.includes(item.id), disabled: !selectedIds.includes(item.id) && selectedIds.length >= 2 }"
        @click="toggleSelect(item)"
      >
        <div class="camera-check">
          <span class="check-box" :class="{ checked: selectedIds.includes(item.id) }">
            <svg v-if="selectedIds.includes(item.id)" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </div>
        <div class="camera-info">
          <div class="camera-name">{{ item.name }}</div>
          <div class="camera-meta">
            <span v-if="item.areaName" class="camera-area">{{ item.areaName }}</span>
            <span class="camera-status" :class="{ online: item.status === '在线', offline: item.status !== '在线' }">
              {{ item.status || '未知' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="modal-footer">
      <a-button class="btn-cancel" @click="closeModal">取消</a-button>
      <a-button class="btn-confirm" type="primary" :disabled="selectedIds.length === 0" @click="handleConfirm">
        确定 ({{ selectedIds.length }})
      </a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, computed, type PropType } from 'vue';

interface CameraItem {
  id: number;
  name: string;
  url: string;
  areaName?: string;
  status?: string;
}

const props = defineProps({
  cameraList: {
    type: Array as PropType<CameraItem[]>,
    default: () => [],
  },
});

const emit = defineEmits<{
  confirm: [cameras: CameraItem[]];
}>();

/* ==================== 弹框状态 ==================== */
const open = ref(false);
const selectedIds = ref<number[]>([]);

const cameraList = computed(() => props.cameraList);

function toggleSelect(item: CameraItem) {
  const idx = selectedIds.value.indexOf(item.id);
  if (idx > -1) {
    selectedIds.value.splice(idx, 1);
  } else if (selectedIds.value.length < 2) {
    selectedIds.value.push(item.id);
  }
}

function handleConfirm() {
  const selected = cameraList.value.filter((c) => selectedIds.value.includes(c.id));
  emit('confirm', selected);
  open.value = false;
}

function showModal() {
  selectedIds.value = [];
  open.value = true;
}

function closeModal() {
  open.value = false;
}

defineExpose({ showModal, closeModal });
</script>

<style lang="less" scoped>
.modal-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: rgba(0, 212, 255, 0.06);
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-radius: 4px;
  font-size: 13px;
  color: #7fa6d4;

  strong {
    color: #00d4ff;
  }

  .tip-icon {
    width: 16px;
    height: 16px;
    color: #00d4ff;
    flex-shrink: 0;
    filter: drop-shadow(0 0 3px rgba(0, 212, 255, 0.3));
  }
}

/* ==================== 摄像头列表 ==================== */
.camera-list {
  max-height: 340px;
  overflow-y: auto;
  margin-bottom: 16px;
  border: 1px solid rgba(0, 212, 255, 0.12);
  border-radius: 4px;
  background: rgba(10, 30, 55, 0.35);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.4);
    border-radius: 6px;

    &:hover {
      background: rgba(0, 212, 255, 0.7);
    }
  }
}

.camera-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.07);
  cursor: pointer;
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(0, 212, 255, 0.05);
  }

  &.selected {
    background: rgba(0, 212, 255, 0.1);
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.camera-check {
  margin-right: 12px;
  flex-shrink: 0;
}

.check-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 3px;
  transition: all 0.15s;

  &.checked {
    background: linear-gradient(135deg, #00d4ff, #0088cc);
    border-color: #00d4ff;
    box-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
  }

  .check-icon {
    width: 12px;
    height: 12px;
    color: #061224;
  }
}

.camera-info {
  flex: 1;
  min-width: 0;
}

.camera-name {
  font-size: 14px;
  color: #e8f4ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.camera-meta {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.camera-area {
  font-size: 11px;
  color: #6a88a8;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.camera-status {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  line-height: 16px;
  flex-shrink: 0;

  &.online {
    background: rgba(82, 196, 26, 0.12);
    color: #52c41a;
  }

  &.offline {
    background: rgba(255, 77, 79, 0.12);
    color: #ff4d4f;
  }
}

/* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 12px;
  margin: 20px -24px -24px;
  border-top: 1px dashed rgba(0, 212, 255, 0.25);
  background: rgba(6, 18, 36, 0.55);
  border-radius: 0 0 6px 6px;

  :deep(.ant-btn) {
    min-width: 80px;
    border-radius: 4px;
    height: 32px;
    font-size: 13px;
    font-weight: 400;
    transition: all 0.2s;
    padding: 0 18px;
  }

  .btn-cancel {
    background: transparent !important;
    border: 1px solid rgba(0, 212, 255, 0.25) !important;
    color: #7fa6d4 !important;

    &:hover {
      border-color: #00d4ff !important;
      color: #00d4ff !important;
      background: rgba(0, 212, 255, 0.06) !important;
    }
  }

  .btn-confirm {
    background: linear-gradient(135deg, #00d4ff, #0088cc) !important;
    border: none !important;
    color: #061224 !important;
    font-weight: 600;

    &:hover {
      opacity: 0.9;
      box-shadow: 0 0 12px rgba(0, 212, 255, 0.3);
    }

    &:disabled {
      opacity: 0.35 !important;
      cursor: not-allowed !important;
    }
  }
}
</style>

<style lang="less">
.camera-list-modal {
  background: rgba(2, 8, 23, 0.78) !important;
  backdrop-filter: blur(2px);

  .ant-modal {
    overflow: visible !important;
  }

  .ant-modal-content {
    position: relative;
    background: linear-gradient(180deg, #143358 0%, #0f2845 100%) !important;
    border-radius: 6px !important;
    border: none !important;
    box-shadow:
      0 0 0 1px rgba(0, 212, 255, 0.45),
      0 0 24px rgba(0, 212, 255, 0.25),
      0 0 60px rgba(0, 212, 255, 0.10),
      0 12px 40px rgba(0, 0, 0, 0.7) !important;
    overflow: visible !important;
  }

  .ant-modal-content::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 6px;
    padding: 1.5px;
    background: linear-gradient(135deg,
        rgba(0, 212, 255, 0.7),
        rgba(0, 180, 240, 0.4) 25%,
        rgba(0, 140, 220, 0.6) 50%,
        rgba(0, 224, 160, 0.3) 75%,
        rgba(0, 212, 255, 0.7));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
  }

  .ant-modal-content::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 6px;
    background:
      linear-gradient(to right, rgba(0,212,255,0.85), rgba(0,212,255,0)) 2px 0 / 18px 2px no-repeat,
      linear-gradient(to bottom, rgba(0,212,255,0.85), rgba(0,212,255,0)) 0 2px / 2px 18px no-repeat,
      linear-gradient(to left, rgba(0,212,255,0.85), rgba(0,212,255,0)) calc(100% - 2px) 0 / 18px 2px no-repeat,
      linear-gradient(to bottom, rgba(0,212,255,0.85), rgba(0,212,255,0)) 100% 2px / 2px 18px no-repeat,
      linear-gradient(to right, rgba(0,212,255,0.85), rgba(0,212,255,0)) 2px 100% / 18px 2px no-repeat,
      linear-gradient(to top, rgba(0,212,255,0.85), rgba(0,212,255,0)) 0 calc(100% - 2px) / 2px 18px no-repeat,
      linear-gradient(to left, rgba(0,212,255,0.85), rgba(0,212,255,0)) calc(100% - 2px) 100% / 18px 2px no-repeat,
      linear-gradient(to top, rgba(0,212,255,0.85), rgba(0,212,255,0)) 100% calc(100% - 2px) / 2px 18px no-repeat;
    filter: drop-shadow(0 0 4px rgba(0, 212, 255, 0.4));
    pointer-events: none;
    z-index: 0;
  }

  .ant-modal-header {
    position: relative;
    background: linear-gradient(180deg, rgba(0,30,55,0.02) 0%, rgba(0,30,55,0.35) 100%) !important;
    border-bottom: 1px solid rgba(0, 212, 255, 0.18) !important;
    padding: 16px 24px !important;
    border-radius: 6px 6px 0 0 !important;
    margin-bottom: 0 !important;
  }

  .ant-modal-title {
    position: relative;
    color: #e8f4ff;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding-left: 12px;
    text-shadow: 0 0 12px rgba(0, 212, 255, 0.4);
  }

  .ant-modal-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 18px;
    background: linear-gradient(180deg, #00d4ff, #0088cc);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
  }

  .ant-modal-close {
    top: 16px !important;
    right: 20px !important;

    .ant-modal-close-x {
      color: #7fa6d4 !important;
      font-size: 18px !important;
      line-height: 1 !important;
      transition: transform 0.3s ease, color 0.2s;

      &:hover {
        color: #00d4ff !important;
        transform: rotate(90deg);
      }
    }
  }

  .ant-modal-body {
    padding: 24px !important;
    background: linear-gradient(180deg, rgba(15,40,69,0.30) 0%, rgba(15,40,69,0.05) 100%) !important;
  }

  .ant-modal-footer {
    display: none;
  }
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style lang="less" scoped>
.theme-white .modal-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: rgba(24, 144, 255, 0.08);
  border: 1px solid rgba(24, 144, 255, 0.15);
  border-radius: 4px;
  font-size: 13px;
  color: #606266;

  strong  {
    color: #1890ff;
  }

  .tip-icon  {
    width: 16px;
    height: 16px;
    color: #1890ff;
    flex-shrink: 0;
    filter: none;
  }}.theme-white /* ==================== 摄像头列表 ==================== */
.camera-list {
  max-height: 340px;
  overflow-y: auto;
  margin-bottom: 16px;
  border: 1px solid rgba(24, 144, 255, 0.15);
  border-radius: 4px;
  background: #fafbfc;

  &::-webkit-scrollbar  {
    width: 6px;
  }

  &::-webkit-scrollbar-track  {
    background: rgba(0, 0, 0, 0.04);
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb  {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;

    &:hover  {
      background: rgba(0, 0, 0, 0.35);
    }}}.theme-white .camera-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(24, 144, 255, 0.08);
  cursor: pointer;
  transition: background 0.15s;

  &:last-child  {
    border-bottom: none;
  }

  &:hover  {
    background: rgba(24, 144, 255, 0.04);
  }

  &.selected  {
    background: rgba(24, 144, 255, 0.1);
  }

  &.disabled  {
    opacity: 0.4;
    cursor: not-allowed;
  }}.theme-white .camera-check {
  margin-right: 12px;
  flex-shrink: 0;
}.theme-white .check-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(24, 144, 255, 0.3);
  border-radius: 3px;
  transition: all 0.15s;

  &.checked  {
    background: linear-gradient(135deg, #1890ff, #096dd9);
    border-color: #1890ff;
    box-shadow: 0 0 6px rgba(24, 144, 255, 0.3);
  }

  .check-icon  {
    width: 12px;
    height: 12px;
    color: #ffffff;
  }}.theme-white .camera-info {
  flex: 1;
  min-width: 0;
}.theme-white .camera-name {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}.theme-white .camera-meta {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}.theme-white .camera-area {
  font-size: 11px;
  color: #909399;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}.theme-white .camera-status {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  line-height: 16px;
  flex-shrink: 0;

  &.online  {
    background: rgba(82, 196, 26, 0.12);
    color: #52c41a;
  }

  &.offline  {
    background: rgba(255, 77, 79, 0.12);
    color: #ff4d4f;
  }}.theme-white /* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 12px;
  margin: 20px -24px -24px;
  border-top: 1px dashed rgba(24, 144, 255, 0.2);
  background: #fafbfc;
  border-radius: 0 0 6px 6px;

  :deep(.ant-btn)  {
    min-width: 80px;
    border-radius: 4px;
    height: 32px;
    font-size: 13px;
    font-weight: 400;
    transition: all 0.2s;
    padding: 0 18px;
  }

  .btn-cancel  {
    background: transparent !important;
    border: 1px solid rgba(24, 144, 255, 0.35) !important;
    color: #606266 !important;

    &:hover  {
      border-color: #1890ff !important;
      color: #1890ff !important;
      background: rgba(24, 144, 255, 0.08) !important;
    }}

  .btn-confirm  {
    background: linear-gradient(135deg, #1890ff, #096dd9) !important;
    border: none !important;
    color: #ffffff !important;
    font-weight: 600;

    &:hover  {
      opacity: 0.9;
      box-shadow: 0 0 12px rgba(24, 144, 255, 0.3);
    }

    &:disabled  {
      opacity: 0.35 !important;
      cursor: not-allowed !important;
    }}}
</style>

<style lang="less">
.theme-white .camera-list-modal {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(2px);

  .ant-modal  {
    overflow: visible !important;
  }

  .ant-modal-content  {
    position: relative;
    background: #ffffff !important;
    border-radius: 6px !important;
    border: 1px solid #e4e7ed !important;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15) !important;
    overflow: visible !important;
  }

  .ant-modal-content::before  {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 6px;
    padding: 1.5px;
    background: linear-gradient(135deg,
        rgba(24, 144, 255, 0.7),
        rgba(64, 169, 255, 0.4) 25%,
        rgba(9, 109, 217, 0.6) 50%,
        rgba(24, 144, 255, 0.3) 75%,
        rgba(24, 144, 255, 0.7));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
  }

  .ant-modal-content::after  {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 6px;
    background:
      linear-gradient(to right, rgba(24,144,255,0.85), rgba(24,144,255,0)) 2px 0 / 18px 2px no-repeat,
      linear-gradient(to bottom, rgba(24,144,255,0.85), rgba(24,144,255,0)) 0 2px / 2px 18px no-repeat,
      linear-gradient(to left, rgba(24,144,255,0.85), rgba(24,144,255,0)) calc(100% - 2px) 0 / 18px 2px no-repeat,
      linear-gradient(to bottom, rgba(24,144,255,0.85), rgba(24,144,255,0)) 100% 2px / 2px 18px no-repeat,
      linear-gradient(to right, rgba(24,144,255,0.85), rgba(24,144,255,0)) 2px 100% / 18px 2px no-repeat,
      linear-gradient(to top, rgba(24,144,255,0.85), rgba(24,144,255,0)) 0 calc(100% - 2px) / 2px 18px no-repeat,
      linear-gradient(to left, rgba(24,144,255,0.85), rgba(24,144,255,0)) calc(100% - 2px) 100% / 18px 2px no-repeat,
      linear-gradient(to top, rgba(24,144,255,0.85), rgba(24,144,255,0)) 100% calc(100% - 2px) / 2px 18px no-repeat;
    filter: drop-shadow(0 0 4px rgba(24, 144, 255, 0.3));
    pointer-events: none;
    z-index: 0;
  }

  .ant-modal-header  {
    position: relative;
    background: #fafbfc !important;
    border-bottom: 1px solid #e4e7ed !important;
    padding: 16px 24px !important;
    border-radius: 6px 6px 0 0 !important;
    margin-bottom: 0 !important;
  }

  .ant-modal-title  {
    position: relative;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding-left: 12px;
    text-shadow: none;
  }

  .ant-modal-title::before  {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 18px;
    background: linear-gradient(180deg, #1890ff, #096dd9);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(24, 144, 255, 0.3);
  }

  .ant-modal-close  {
    top: 16px !important;
    right: 20px !important;

    .ant-modal-close-x  {
      color: #909399 !important;
      font-size: 18px !important;
      line-height: 1 !important;
      transition: transform 0.3s ease, color 0.2s;

      &:hover  {
        color: #1890ff !important;
        transform: rotate(90deg);
      }}}

  .ant-modal-body  {
    padding: 24px !important;
    background: #ffffff !important;
  }

  .ant-modal-footer  {
    display: none;
  }}
</style>
