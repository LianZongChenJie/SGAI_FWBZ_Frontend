<template>
  <div class="add-modal-wrapper" :class="themeClass">
    <a-modal
      v-model:open="open"
      title="提示"
      :footer="null"
      width="500px"
      :destroyOnClose="true"
      :maskClosable="false"
      wrapClassName="config-open-modal"
      :getContainer="false"
    >
      <!-- 顶部提示条 -->
      <div class="modal-content-scroll">
        <div class="modal-tip">
          <svg class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span v-html="contenMessage"></span>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="modal-footer">
        <a-button class="btn-cancel" @click="closeModal">取消</a-button>
        <a-button class="btn-confirm" type="primary" :loading="loading" @click="onSubmit">确定</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, computed, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { dataCollectAddApi, dataCollectEditApi } from '@/api/dataCollect';

const emit = defineEmits<{
  success: [];
}>();

/* ==================== 弹框状态 ==================== */
const open = ref(false);
const type = ref<'open' | 'close'>('open');
const loading = ref(false);
const checkedRows = ref<any[]>([]);

const contenMessage = computed(() => {
  const names = checkedRows.value.map((r: any) => r.areaName).filter(Boolean).join('，');
  const prefix = names ? `所选区域【${names}】` : '所选区域';
  if (type.value === 'open') {
    return `确定要将${prefix}设置为<span class="keyword-open">开启</span>状态吗？`;
  }
  return `确定要将${prefix}设置为<span class="keyword-close">关闭</span>状态吗？`;
});



function showModal(mode: 'open' | 'close', rows: any[] = []) {
  type.value = mode;
  checkedRows.value = rows;
  open.value = true;
}

function closeModal() {
  open.value = false;
}


async function onSubmit() {
   emit('success', type.value);
  closeModal();
}

defineExpose({
  showModal,
  closeModal,
});
</script>

<style scoped lang="less">
/* ==================== 内容滚动区 ==================== */
.modal-content-scroll {
  min-height: 160px;
  max-height: 280px;
  overflow-y: auto;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 194, 255, 0.5);
    border-radius: 3px;
  }
}

/* ==================== 提示条（科技感） ==================== */
.modal-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 0;
  background: rgba(0, 162, 232, 0.06);
  border-left: 3px solid #00a2e8;
  border-radius: 0 4px 4px 0;
  font-size: 16px;
  color: #8a9ab0;

  .tip-icon {
    width: 18px;
    height: 18px;
    color: #00a2e8;
    flex-shrink: 0;
  }

  :deep(.keyword-open) {
    color: #22c55e;
    font-weight: 600;
  }

  :deep(.keyword-close) {
    color: #ef4444;
    font-weight: 600;
  }
}

/* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 12px;
  margin: 24px -24px -24px;
  border-top: 1px dashed rgba(0, 212, 255, 0.25);
  background: rgba(6, 18, 36, 0.55);
  border-radius: 0 0 6px 6px;

  :deep(.ant-btn) {
    height: 32px;
    padding: 0 18px;
    border-radius: 4px;
    font-size: 13px;
    transition: all 0.2s;
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

  .btn-reset {
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
  }
}
</style>

/* ==================== config-open-modal 弹框样式（通过唯一类名隔离，不污染全局） ==================== */
<style lang="less">
.config-open-modal {
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
    min-height: 180px;
    padding: 24px !important;
    background: linear-gradient(180deg, rgba(15,40,69,0.30) 0%, rgba(15,40,69,0.05) 100%) !important;
  }

  .ant-modal-footer {
    display: none;
  }
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped lang="less">
.theme-white /* ==================== 内容滚动区 ==================== */
.modal-content-scroll {
  min-height: 160px;
  max-height: 280px;
  overflow-y: auto;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar  {
    width: 5px;
  }
  &::-webkit-scrollbar-track  {
    background: rgba(0, 0, 0, 0.04);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb  {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }}.theme-white /* ==================== 提示条（科技感） ==================== */
.modal-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 0;
  background: rgba(24, 144, 255, 0.06);
  border-left: 3px solid #1890ff;
  border-radius: 0 4px 4px 0;
  font-size: 16px;
  color: #909399;

  .tip-icon  {
    width: 18px;
    height: 18px;
    color: #1890ff;
    flex-shrink: 0;
  }

  :deep(.keyword-open)  {
    color: #52c41a;
    font-weight: 600;
  }

  :deep(.keyword-close)  {
    color: #ff4d4f;
    font-weight: 600;
  }}.theme-white /* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 12px;
  margin: 24px -24px -24px;
  border-top: 1px dashed rgba(24, 144, 255, 0.25);
  background: #fafbfc;
  border-radius: 0 0 6px 6px;

  :deep(.ant-btn)  {
    height: 32px;
    padding: 0 18px;
    border-radius: 4px;
    font-size: 13px;
    transition: all 0.2s;
  }

  .btn-cancel  {
    background: transparent !important;
    border: 1px solid rgba(24, 144, 255, 0.25) !important;
    color: #606266 !important;

    &:hover  {
      border-color: #1890ff !important;
      color: #1890ff !important;
      background: rgba(24, 144, 255, 0.06) !important;
    }}

  .btn-reset  {
    background: transparent !important;
    border: 1px solid rgba(24, 144, 255, 0.25) !important;
    color: #606266 !important;

    &:hover  {
      border-color: #1890ff !important;
      color: #1890ff !important;
      background: rgba(24, 144, 255, 0.06) !important;
    }}

  .btn-confirm  {
    background: linear-gradient(135deg, #1890ff, #096dd9) !important;
    border: none !important;
    color: #ffffff !important;
    font-weight: 600;

    &:hover  {
      opacity: 0.9;
      box-shadow: 0 0 12px rgba(24, 144, 255, 0.3);
    }}}
</style>

<style lang="less">
.theme-white .config-open-modal {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(2px);

  .ant-modal  {
    overflow: visible !important;
  }

  .ant-modal-content  {
    position: relative;
    background: #ffffff !important;
    border-radius: 6px !important;
    border: none !important;
    box-shadow:
      0 0 0 1px rgba(24, 144, 255, 0.45),
      0 0 24px rgba(24, 144, 255, 0.12),
      0 0 60px rgba(24, 144, 255, 0.05),
      0 12px 40px rgba(0, 0, 0, 0.15) !important;
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
        rgba(24, 144, 255, 0.4) 25%,
        rgba(24, 144, 255, 0.6) 50%,
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
    filter: drop-shadow(0 0 4px rgba(24, 144, 255, 0.4));
    pointer-events: none;
    z-index: 0;
  }

  .ant-modal-header  {
    position: relative;
    background: #fafbfc !important;
    border-bottom: 1px solid rgba(24, 144, 255, 0.12) !important;
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
    text-shadow: 0 0 12px rgba(24, 144, 255, 0.25);
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
    box-shadow: 0 0 8px rgba(24, 144, 255, 0.5);
  }

  .ant-modal-close  {
    top: 16px !important;
    right: 20px !important;

    .ant-modal-close-x  {
      color: #606266 !important;
      font-size: 18px !important;
      line-height: 1 !important;
      transition: transform 0.3s ease, color 0.2s;

      &:hover  {
        color: #1890ff !important;
        transform: rotate(90deg);
      }}}

  .ant-modal-body  {
    min-height: 180px;
    padding: 24px !important;
    background: linear-gradient(180deg, rgba(24,144,255,0.03) 0%, rgba(24,144,255,0.01) 100%) !important;
  }

  .ant-modal-footer  {
    display: none;
  }}
</style>
