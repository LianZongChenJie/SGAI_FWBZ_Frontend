<template>
  <a-modal
    v-model:open="open"
    title="提示"
    :footer="null"
    :width="modalWidth"
    :zIndex="92000"
    :destroyOnClose="true"
    :maskClosable="false"
    :getContainer="container"
    wrapClassName="scene-confirm-modal"
   :class="themeClass">
    <!-- 顶部提示条 -->
    <div class="modal-content-scroll">
      <div class="modal-tip">
        <svg
          class="tip-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span v-html="tipHtml"></span>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="modal-footer">
      <a-button class="btn-cancel" @click="closeModal">取消</a-button>
      <a-button class="btn-confirm" type="primary" :loading="loading" @click="onSubmit">{{ okText }}</a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref } from 'vue'

/**
 * 弹框挂载容器（可选）：地图全屏时传入地图卡片元素，避免原生全屏/CSS 固定定位全屏
 * 下挂载到 body 的弹框不可见；不传时默认挂载到 body（与原先行为一致）。
 */
defineProps<{
  container?: any
}>()

const open = ref(false)
const loading = ref(false)
const tipHtml = ref('')
const okText = ref('确定')
// 默认宽度用 max() 兼容两种环境：大屏页面（useScreenScale，1rem=100px）按 5rem 缩放；
// 无 rem 基准页面（如设备监控页，1rem=16px）兜底到 500px，避免弹框过小
const modalWidth = ref<string | number>('max(5rem, 500px)')
let onOkHandler: (() => void | Promise<void>) | null = null
let onCancelHandler: (() => void) | null = null

/**
 * 打开确认弹框：content 支持 HTML（动作词用 <strong class="tip-action"> 高亮）；
 * width 可自定义弹框宽度（默认 5rem，兼容大屏 rem 布局；内容较长时建议传固定 px 值）；
 * onCancel 在点击取消/关闭时触发（确认成功后不触发）
 */
function showModal(opts: {
  content: string
  okText?: string
  width?: string | number
  onOk: () => void | Promise<void>
  onCancel?: () => void
}) {
  tipHtml.value = opts.content
  okText.value = opts.okText || '确定'
  modalWidth.value = opts.width ?? 'max(5rem, 500px)'
  onOkHandler = opts.onOk
  onCancelHandler = opts.onCancel || null
  loading.value = false
  open.value = true
}

function closeModal() {
  open.value = false
  onCancelHandler?.()
  onCancelHandler = null
}

async function onSubmit() {
  if (loading.value) return
  loading.value = true
  try {
    await onOkHandler?.()
    open.value = false
    onCancelHandler = null
  } finally {
    loading.value = false
  }
}

defineExpose({
  showModal,
  closeModal,
})
</script>

<style scoped lang="less">
/* ==================== 内容滚动区 ==================== */
/* 尺寸用 max(rem, px) 兜底：大屏（1rem=100px）保持原缩放，无 rem 基准页面（1rem=16px）
   兜底到设计稿尺寸，避免弹框过小（负值用 min() 取更小值） */
.modal-content-scroll {
  min-height: max(1.6rem, 120px);
  max-height: max(2.8rem, 260px);
  overflow-y: auto;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    width: max(0.05rem, 5px);
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.06);
    border-radius: max(0.03rem, 3px);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 194, 255, 0.5);
    border-radius: max(0.03rem, 3px);
  }
}

/* ==================== 提示条（科技感） ==================== */
.modal-tip {
  display: flex;
  align-items: center;
  gap: max(0.1rem, 10px);
  padding: max(0.1rem, 10px) max(0.14rem, 14px);
  margin-bottom: 0;
  background: rgba(0, 162, 232, 0.06);
  border-left: max(0.03rem, 3px) solid #00a2e8;
  border-radius: 0 max(0.04rem, 4px) max(0.04rem, 4px) 0;
  font-size: max(0.17rem, 15px);
  line-height: 1.6;
  color: #8a9ab0;

  .tip-icon {
    width: max(0.22rem, 22px);
    height: max(0.22rem, 22px);
    color: #00a2e8;
    flex-shrink: 0;
  }
}

/* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: max(0.1rem, 10px);
  padding: max(0.16rem, 16px) max(0.24rem, 24px) max(0.12rem, 12px);
  margin: max(0.24rem, 24px) min(-0.24rem, -24px) min(-0.24rem, -24px);
  border-top: 1px dashed rgba(0, 212, 255, 0.25);
  background: rgba(6, 18, 36, 0.55);
  border-radius: 0 0 max(0.06rem, 6px) max(0.06rem, 6px);

  :deep(.ant-btn) {
    height: max(0.32rem, 32px);
    padding: 0 max(0.18rem, 18px);
    border-radius: max(0.04rem, 4px);
    font-size: max(0.13rem, 13px);
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

  .btn-confirm {
    background: linear-gradient(135deg, #00d4ff, #0088cc) !important;
    border: none !important;
    color: #061224 !important;
    font-weight: 600;

    &:hover {
      opacity: 0.9;
      box-shadow: 0 0 0.12rem rgba(0, 212, 255, 0.3);
    }
  }
}
</style>

/* ==================== scene-confirm-modal 弹框样式（通过唯一类名隔离，不污染全局） ==================== */
<style lang="less">
.scene-confirm-modal {
  background: rgba(2, 8, 23, 0.78) !important;
  backdrop-filter: blur(0.02rem);

  .ant-modal {
    overflow: visible !important;
  }

  .ant-modal-content {
    position: relative;
    background: linear-gradient(180deg, #143358 0%, #0f2845 100%) !important;
    border-radius: 0.06rem !important;
    border: none !important;
    box-shadow:
      0 0 0 0.01rem rgba(0, 212, 255, 0.45),
      0 0 0.24rem rgba(0, 212, 255, 0.25),
      0 0 0.6rem rgba(0, 212, 255, 0.1),
      0 0.12rem 0.4rem rgba(0, 0, 0, 0.7) !important;
    overflow: visible !important;
  }

  .ant-modal-content::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 0.06rem;
    padding: 0.015rem;
    background: linear-gradient(
      135deg,
      rgba(0, 212, 255, 0.7),
      rgba(0, 180, 240, 0.4) 25%,
      rgba(0, 140, 220, 0.6) 50%,
      rgba(0, 224, 160, 0.3) 75%,
      rgba(0, 212, 255, 0.7)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
  }

  .ant-modal-content::after {
    content: '';
    position: absolute;
    inset: -0.02rem;
    border-radius: 0.06rem;
    background:
      linear-gradient(to right, rgba(0, 212, 255, 0.85), rgba(0, 212, 255, 0)) 0.02rem 0 / 0.18rem 0.02rem no-repeat,
      linear-gradient(to bottom, rgba(0, 212, 255, 0.85), rgba(0, 212, 255, 0)) 0 0.02rem / 0.02rem 0.18rem no-repeat,
      linear-gradient(to left, rgba(0, 212, 255, 0.85), rgba(0, 212, 255, 0)) calc(100% - 0.02rem) 0 / 0.18rem 0.02rem no-repeat,
      linear-gradient(to bottom, rgba(0, 212, 255, 0.85), rgba(0, 212, 255, 0)) 100% 0.02rem / 0.02rem 0.18rem no-repeat,
      linear-gradient(to right, rgba(0, 212, 255, 0.85), rgba(0, 212, 255, 0)) 0.02rem 100% / 0.18rem 0.02rem no-repeat,
      linear-gradient(to top, rgba(0, 212, 255, 0.85), rgba(0, 212, 255, 0)) 0 calc(100% - 0.02rem) / 0.02rem 0.18rem no-repeat,
      linear-gradient(to left, rgba(0, 212, 255, 0.85), rgba(0, 212, 255, 0)) calc(100% - 0.02rem) 100% / 0.18rem 0.02rem no-repeat,
      linear-gradient(to top, rgba(0, 212, 255, 0.85), rgba(0, 212, 255, 0)) 100% calc(100% - 0.02rem) / 0.02rem 0.18rem no-repeat;
    filter: drop-shadow(0 0 0.04rem rgba(0, 212, 255, 0.4));
    pointer-events: none;
    z-index: 0;
  }

  .ant-modal-header {
    position: relative;
    background: linear-gradient(180deg, rgba(0, 30, 55, 0.02) 0%, rgba(0, 30, 55, 0.35) 100%) !important;
    border-bottom: 1px solid rgba(0, 212, 255, 0.18) !important;
    padding: max(0.16rem, 16px) max(0.24rem, 24px) !important;
    border-radius: max(0.06rem, 6px) max(0.06rem, 6px) 0 0 !important;
    margin-bottom: 0 !important;
  }

  .ant-modal-title {
    position: relative;
    color: #e8f4ff;
    font-size: max(0.16rem, 16px);
    font-weight: 600;
    letter-spacing: 0.5px;
    padding-left: max(0.12rem, 12px);
    text-shadow: 0 0 max(0.12rem, 12px) rgba(0, 212, 255, 0.4);
  }

  .ant-modal-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: max(0.03rem, 3px);
    height: max(0.18rem, 18px);
    background: linear-gradient(180deg, #00d4ff, #0088cc);
    border-radius: max(0.02rem, 2px);
    box-shadow: 0 0 max(0.08rem, 8px) rgba(0, 212, 255, 0.5);
  }

  .ant-modal-close {
    top: max(0.16rem, 16px) !important;
    right: max(0.2rem, 20px) !important;

    .ant-modal-close-x {
      color: #7fa6d4 !important;
      font-size: max(0.18rem, 18px) !important;
      line-height: 1 !important;
      transition: transform 0.3s ease, color 0.2s;

      &:hover {
        color: #00d4ff !important;
        transform: rotate(90deg);
      }
    }
  }

  .ant-modal-body {
    min-height: max(1.8rem, 120px);
    padding: max(0.24rem, 24px) !important;
    background: linear-gradient(180deg, rgba(15, 40, 69, 0.3) 0%, rgba(15, 40, 69, 0.05) 100%) !important;
  }

  .ant-modal-footer {
    display: none;
  }
}

/* v-html 注入的动作词高亮（不受 scoped 影响，全局兜底） */
.modal-tip .tip-action {
  font-weight: 700;
  color: #00a2e8;
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped lang="less">
.theme-white /* ==================== 内容滚动区 ==================== */
/* 尺寸用 max(rem,
.theme-white px) 兜底：大屏（1rem=100px）保持原缩放，无 rem 基准页面（1rem=16px）
   兜底到设计稿尺寸，避免弹框过小（负值用 min() 取更小值） */
.modal-content-scroll {
  min-height: max(1.6rem, 120px);
  max-height: max(2.8rem, 260px);
  overflow-y: auto;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar  {
    width: max(0.05rem, 5px);
  }
  &::-webkit-scrollbar-track  {
    background: rgba(0, 0, 0, 0.04);
    border-radius: max(0.03rem, 3px);
  }
  &::-webkit-scrollbar-thumb  {
    background: rgba(0, 0, 0, 0.2);
    border-radius: max(0.03rem, 3px);
  }}.theme-white /* ==================== 提示条（科技感） ==================== */
.modal-tip {
  display: flex;
  align-items: center;
  gap: max(0.1rem, 10px);
  padding: max(0.1rem, 10px) max(0.14rem, 14px);
  margin-bottom: 0;
  background: rgba(24, 144, 255, 0.08);
  border-left: max(0.03rem, 3px) solid #1890ff;
  border-radius: 0 max(0.04rem, 4px) max(0.04rem, 4px) 0;
  font-size: max(0.17rem, 15px);
  line-height: 1.6;
  color: #606266;

  .tip-icon  {
    width: max(0.22rem, 22px);
    height: max(0.22rem, 22px);
    color: #1890ff;
    flex-shrink: 0;
  }}.theme-white /* ==================== 底部按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: max(0.1rem, 10px);
  padding: max(0.16rem, 16px) max(0.24rem, 24px) max(0.12rem, 12px);
  margin: max(0.24rem, 24px) min(-0.24rem, -24px) min(-0.24rem, -24px);
  border-top: 1px dashed rgba(24, 144, 255, 0.2);
  background: #fafbfc;
  border-radius: 0 0 max(0.06rem, 6px) max(0.06rem, 6px);

  :deep(.ant-btn)  {
    height: max(0.32rem, 32px);
    padding: 0 max(0.18rem, 18px);
    border-radius: max(0.04rem, 4px);
    font-size: max(0.13rem, 13px);
    transition: all 0.2s;
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
      box-shadow: 0 0 0.12rem rgba(24, 144, 255, 0.3);
    }}}
</style>

<style lang="less">
.theme-white .scene-confirm-modal {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(0.02rem);

  .ant-modal  {
    overflow: visible !important;
  }

  .ant-modal-content  {
    position: relative;
    background: #ffffff !important;
    border-radius: 0.06rem !important;
    border: 1px solid #e4e7ed !important;
    box-shadow: 0 0.06rem 0.24rem rgba(0, 0, 0, 0.15) !important;
    overflow: visible !important;
  }

  .ant-modal-content::before  {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 0.06rem;
    padding: 0.015rem;
    background: linear-gradient(
      135deg,
      rgba(24, 144, 255, 0.7),
      rgba(64, 169, 255, 0.4) 25%,
      rgba(9, 109, 217, 0.6) 50%,
      rgba(24, 144, 255, 0.3) 75%,
      rgba(24, 144, 255, 0.7)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 1;
  }

  .ant-modal-content::after  {
    content: '';
    position: absolute;
    inset: -0.02rem;
    border-radius: 0.06rem;
    background:
      linear-gradient(to right, rgba(24, 144, 255, 0.85), rgba(24, 144, 255, 0)) 0.02rem 0 / 0.18rem 0.02rem no-repeat,
      linear-gradient(to bottom, rgba(24, 144, 255, 0.85), rgba(24, 144, 255, 0)) 0 0.02rem / 0.02rem 0.18rem no-repeat,
      linear-gradient(to left, rgba(24, 144, 255, 0.85), rgba(24, 144, 255, 0)) calc(100% - 0.02rem) 0 / 0.18rem 0.02rem no-repeat,
      linear-gradient(to bottom, rgba(24, 144, 255, 0.85), rgba(24, 144, 255, 0)) 100% 0.02rem / 0.02rem 0.18rem no-repeat,
      linear-gradient(to right, rgba(24, 144, 255, 0.85), rgba(24, 144, 255, 0)) 0.02rem 100% / 0.18rem 0.02rem no-repeat,
      linear-gradient(to top, rgba(24, 144, 255, 0.85), rgba(24, 144, 255, 0)) 0 calc(100% - 0.02rem) / 0.02rem 0.18rem no-repeat,
      linear-gradient(to left, rgba(24, 144, 255, 0.85), rgba(24, 144, 255, 0)) calc(100% - 0.02rem) 100% / 0.18rem 0.02rem no-repeat,
      linear-gradient(to top, rgba(24, 144, 255, 0.85), rgba(24, 144, 255, 0)) 100% calc(100% - 0.02rem) / 0.02rem 0.18rem no-repeat;
    filter: drop-shadow(0 0 0.04rem rgba(24, 144, 255, 0.3));
    pointer-events: none;
    z-index: 0;
  }

  .ant-modal-header  {
    position: relative;
    background: #fafbfc !important;
    border-bottom: 1px solid #e4e7ed !important;
    padding: max(0.16rem, 16px) max(0.24rem, 24px) !important;
    border-radius: max(0.06rem, 6px) max(0.06rem, 6px) 0 0 !important;
    margin-bottom: 0 !important;
  }

  .ant-modal-title  {
    position: relative;
    color: #303133;
    font-size: max(0.16rem, 16px);
    font-weight: 600;
    letter-spacing: 0.5px;
    padding-left: max(0.12rem, 12px);
    text-shadow: none;
  }

  .ant-modal-title::before  {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: max(0.03rem, 3px);
    height: max(0.18rem, 18px);
    background: linear-gradient(180deg, #1890ff, #096dd9);
    border-radius: max(0.02rem, 2px);
    box-shadow: 0 0 max(0.08rem, 8px) rgba(24, 144, 255, 0.3);
  }

  .ant-modal-close  {
    top: max(0.16rem, 16px) !important;
    right: max(0.2rem, 20px) !important;

    .ant-modal-close-x  {
      color: #909399 !important;
      font-size: max(0.18rem, 18px) !important;
      line-height: 1 !important;
      transition: transform 0.3s ease, color 0.2s;

      &:hover  {
        color: #1890ff !important;
        transform: rotate(90deg);
      }}}

  .ant-modal-body  {
    min-height: max(1.8rem, 120px);
    padding: max(0.24rem, 24px) !important;
    background: #ffffff !important;
  }

  .ant-modal-footer  {
    display: none;
  }}.theme-white /* v-html 注入的动作词高亮（不受 scoped 影响，全局兜底） */
.modal-tip .tip-action {
  font-weight: 700;
  color: #1890ff;
}
</style>
