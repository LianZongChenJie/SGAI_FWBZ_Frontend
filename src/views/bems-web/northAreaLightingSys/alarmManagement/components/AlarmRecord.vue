<template>
  <div class="alarm-record" :class="themeClass">
    <div class="record-header">
      <div class="record-title">
        <span class="title-icon">🔔</span>
        <span>报警记录</span>
      </div>
      <div class="record-actions">
        <template v-if="batchMode">
          <a-button class="btn-batch" :disabled="selectedIds.size === 0" @click="handleBatchClose">
            {{ selectedIds.size > 0 ? '批量关闭' : '批量处置' }}{{ selectedIds.size > 0 ? `(${selectedIds.size})` : '' }}
          </a-button>
          <a-button class="btn-cancel" @click="handleCancelBatch">取消</a-button>
        </template>
        <a-button v-else class="btn-batch" @click="handleEnterBatch">批量处置</a-button>
      </div>
    </div>

    <div class="record-list" ref="listRef" @scroll="handleScroll">
      <div
        v-for="item in alarmList"
        :key="item.id"
        class="record-item"
        :class="[`level-${item.level}`, { selected: selectedIds.has(item.id) }]"
      >
        <a-checkbox
          v-if="batchMode"
          class="item-checkbox"
          :checked="selectedIds.has(item.id)"
          :disabled="item.alarmStatus === '3'"
          @change="() => toggleSelect(item.id)"
        />
        <div class="item-left">
          <span class="level-dot" :class="`dot-${item.level}`"></span>
          <div class="item-content">
            <div class="item-title">
              <span class="level-tag">【{{ item.levelText }}】</span>
              <span>{{ item.location }} {{ item.circuit }} {{ item.type }}</span>
            </div>
            <div class="item-desc">
              {{ item.time }} | {{ item.description }}
            </div>
          </div>
        </div>
        <div class="item-actions">
          <template v-if="item.alarmStatus === '1'">
            <template v-if="item.level !== '一般'">
              <a-button size="small" class="btn-cyan" @click="handleTransfer(item)">转工单</a-button>
            </template>
            <template v-else>
              <a-button size="small" class="btn-cyan" @click="handleRetry(item)">重试</a-button>
            </template>
            <a-button size="small" class="btn-close" @click="handleClose(item)">关闭</a-button>
          </template>
          <template v-else-if="item.alarmStatus === '3'">
            <a-button size="small" class="btn-cyan" disabled>转单中</a-button>
          </template>
        </div>
      </div>
      <div v-if="loading" class="load-more">加载中...</div>
      <div v-else-if="noMore && alarmList.length > 0" class="load-more">没有更多了</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, onMounted, onUnmounted, computed } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { getAlarmListApi, batchDisposeApi, transferWorkOrderApi, closeAlarmApi, retryAlarmApi } from '../alarmManagement.api';

interface AlarmItem {
  id: number;
  level: string;
  levelText: string;
  location: string;
  circuit: string;
  type: string;
  time: string;
  description: string;
  alarmStatus: string;
}

const alarmList = ref<AlarmItem[]>([]);
const selectedIds = ref<Set<number>>(new Set());
const batchMode = ref(false);
const listRef = ref<HTMLElement>();
const currentPage = ref(1);
const pageSize = 10;
const total = ref(0);
const loading = ref(false);
const noMore = computed(() => alarmList.value.length >= total.value && total.value > 0);

const loadAlarmList = async (append = false) => {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await getAlarmListApi({ pageNo: currentPage.value, pageSize });
    const records = res?.result?.records || res?.records || [];
    total.value = res?.result?.total ?? res?.total ?? 0;
    const mapped = records.map((item: any) => ({
      id: item.id,
      level: item.alarmLevelName,
      levelText: item.alarmLevelName,
      location: item.spaceName || '',
      circuit: item.deviceName || '',
      type: item.alarmCategoryName || '',
      time: item.alarmTime,
      description: item.alarmContent,
      alarmStatus: String(item.alarmStatus ?? '1'),
    }));
    alarmList.value = append ? [...alarmList.value, ...mapped] : mapped;
    if (!append) {
      selectedIds.value = new Set();
    }
    if (records.length > 0) {
      currentPage.value++;
    }
  } finally {
    loading.value = false;
  }
};

const handleScroll = (e: Event) => {
  const el = e.target as HTMLElement;
  const { scrollTop, scrollHeight, clientHeight } = el;
  if (scrollHeight - scrollTop - clientHeight < 60 && !loading.value && !noMore.value) {
    loadAlarmList(true);
  }
};

const resetAndLoad = () => {
  currentPage.value = 1;
  alarmList.value = [];
  stopPolling();
  loadAlarmList().then(() => {
    if (currentPage.value <= 1) {
      startPolling();
    }
  });
};

let pollTimer: ReturnType<typeof setInterval> | null = null;

const startPolling = () => {
  stopPolling();
  pollTimer = setInterval(() => {
    if (currentPage.value <= 1) {
      currentPage.value = 1;
      alarmList.value = [];
      loadAlarmList();
    }
  }, 60000);
};

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
};

onMounted(() => {
  loadAlarmList().then(() => {
    if (currentPage.value <= 1) {
      startPolling();
    }
  });
});

onUnmounted(() => {
  stopPolling();
});

const handleMarkAllRead = () => {
  message.success('已全部标记为已读');
};

const handleEnterBatch = () => {
  batchMode.value = true;
  selectedIds.value = new Set();
};

const handleCancelBatch = () => {
  batchMode.value = false;
  selectedIds.value = new Set();
};

const toggleSelect = (id: number) => {
  const next = new Set(selectedIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  selectedIds.value = next;
};

const handleBatchClose = () => {
  if (selectedIds.value.size === 0) return;
  Modal.confirm({
    title: '确认操作',
    content: `确认要关闭选中的 ${selectedIds.value.size} 条报警记录吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const ids = Array.from(selectedIds.value);
      await batchDisposeApi(ids);
      message.success('批量关闭成功');
      batchMode.value = false;
      selectedIds.value = new Set();
      resetAndLoad();
    },
  });
};

const handleTransfer = async (item: AlarmItem) => {
  await transferWorkOrderApi({ recordId: item.id });
  message.success(`已将【${item.type}】报警转为工单`);
  resetAndLoad();
};

const handleRetry = async (item: AlarmItem) => {
  await retryAlarmApi({ id: item.id });
  message.success(`已重试【${item.location} ${item.circuit}】`);
  resetAndLoad();
};

const handleClose = async (item: AlarmItem) => {
  await closeAlarmApi(item.id);
  message.success('报警已关闭');
  resetAndLoad();
};
</script>

<style scoped lang="less">
.alarm-record {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 24px;

  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .record-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #fff;

      .title-icon {
        font-size: 20px;
      }
    }

    .record-actions {
      display: flex;
      gap: 12px;

      .btn-batch {
        background: #ff4d4f !important;
        border-color: #ff4d4f !important;
        color: #fff !important;

        &:hover {
          background: #ff7875 !important;
          border-color: #ff7875 !important;
          color: #fff !important;
        }

        &:disabled {
          background: rgba(255, 77, 79, 0.3) !important;
          border-color: rgba(255, 77, 79, 0.3) !important;
          color: rgba(255, 255, 255, 0.45) !important;
          cursor: not-allowed;
        }
      }

      .btn-cancel {
        background: rgba(255, 255, 255, 0.08) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
        color: rgba(255, 255, 255, 0.85) !important;

        &:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: rgba(255, 255, 255, 0.35) !important;
          color: #fff !important;
        }
      }
    }
  }

  .record-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 520px;
    overflow-y: auto;
    padding-right: 4px;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 2px;
    }

    .load-more {
      text-align: center;
      padding: 12px 0;
      color: rgba(255, 255, 255, 0.45);
      font-size: 13px;
    }

    .record-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-radius: 8px;
      border-left: 4px solid transparent;
      background: rgba(255, 255, 255, 0.03);
      transition: background 0.3s;
      gap: 12px;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      &.selected {
        background: rgba(24, 144, 255, 0.08);
      }

      &.level-紧急 {
        border-left-color: #ff4d4f;
        background: rgba(255, 77, 79, 0.06);
      }

      &.level-重要 {
        border-left-color: #fa8c16;
        background: rgba(250, 140, 22, 0.06);
      }

      &.level-一般 {
        border-left-color: #1890ff;
        background: rgba(24, 144, 255, 0.06);
      }

      .item-checkbox {
        flex-shrink: 0;

        :deep(.ant-checkbox-inner) {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.25);
        }

        :deep(.ant-checkbox-checked .ant-checkbox-inner) {
          background: #1890ff;
          border-color: #1890ff;
        }

        :deep(.ant-checkbox-wrapper) {
          color: rgba(255, 255, 255, 0.85);
        }

        :deep(.ant-checkbox-disabled .ant-checkbox-inner) {
          background: rgba(255, 255, 255, 0.03) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          cursor: not-allowed;
        }

        :deep(.ant-checkbox-disabled .ant-checkbox-inner::after) {
          display: none;
        }
      }

      .item-left {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        flex: 1;

        .level-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;

          &.dot-紧急 {
            background: #ff4d4f;
            box-shadow: 0 0 6px rgba(255, 77, 79, 0.5);
          }

          &.dot-重要 {
            background: #fa8c16;
            box-shadow: 0 0 6px rgba(250, 140, 22, 0.5);
          }

          &.dot-一般 {
            background: #1890ff;
            box-shadow: 0 0 6px rgba(24, 144, 255, 0.5);
          }
        }

        .item-content {
          .item-title {
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            margin-bottom: 6px;

            .level-tag {
              margin-right: 4px;
            }
          }

          .item-desc {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.55);
          }
        }
      }

      .item-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;

        .btn-cyan {
          background: #1890ff !important;
          border-color: #1890ff !important;
          color: #fff !important;

          &:hover {
            background: #40a9ff !important;
            border-color: #40a9ff !important;
            color: #fff !important;
          }
        }

        .btn-close {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(255, 255, 255, 0.3);
          color: #333;

          &:hover {
            background: #fff;
            border-color: #fff;
            color: #333;
          }
        }
      }
    }
  }
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped lang="less">
.theme-white.alarm-record {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 24px;

  .record-header  {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .record-title  {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;

      .title-icon  {
        font-size: 20px;
      }}

    .record-actions  {
      display: flex;
      gap: 12px;

      .btn-batch  {
        background: #ff4d4f !important;
        border-color: #ff4d4f !important;
        color: #fff !important;

        &:hover  {
          background: #ff7875 !important;
          border-color: #ff7875 !important;
          color: #fff !important;
        }

        &:disabled  {
          background: rgba(255, 77, 79, 0.3) !important;
          border-color: rgba(255, 77, 79, 0.3) !important;
          color: rgba(255, 255, 255, 0.45) !important;
          cursor: not-allowed;
        }}

      .btn-cancel  {
        background: #ffffff !important;
        border-color: #dcdfe6 !important;
        color: #606266 !important;

        &:hover  {
          background: #f0f2f5 !important;
          border-color: #40a9ff !important;
          color: #1890ff !important;
        }}}}

  .record-list  {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 520px;
    overflow-y: auto;
    padding-right: 4px;

    &::-webkit-scrollbar  {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb  {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 2px;
    }

    .load-more  {
      text-align: center;
      padding: 12px 0;
      color: #909399;
      font-size: 13px;
    }

    .record-item  {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-radius: 8px;
      border-left: 4px solid transparent;
      background: #fafbfc;
      transition: background 0.3s;
      gap: 12px;

      &:hover  {
        background: #f0f2f5;
      }

      &.selected  {
        background: rgba(24, 144, 255, 0.08);
      }

      &.level-紧急  {
        border-left-color: #ff4d4f;
        background: rgba(255, 77, 79, 0.06);
      }

      &.level-重要  {
        border-left-color: #fa8c16;
        background: rgba(250, 140, 22, 0.06);
      }

      &.level-一般  {
        border-left-color: #1890ff;
        background: rgba(24, 144, 255, 0.06);
      }

      .item-checkbox  {
        flex-shrink: 0;

        :deep(.ant-checkbox-inner)  {
          background: #ffffff;
          border-color: #dcdfe6;
        }

        :deep(.ant-checkbox-checked .ant-checkbox-inner)  {
          background: #1890ff;
          border-color: #1890ff;
        }

        :deep(.ant-checkbox-wrapper)  {
          color: #303133;
        }

        :deep(.ant-checkbox-disabled .ant-checkbox-inner)  {
          background: #f0f2f5 !important;
          border-color: #dcdfe6 !important;
          cursor: not-allowed;
        }

        :deep(.ant-checkbox-disabled .ant-checkbox-inner::after)  {
          display: none;
        }}

      .item-left  {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        flex: 1;

        .level-dot  {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;

          &.dot-紧急  {
            background: #ff4d4f;
            box-shadow: 0 0 6px rgba(255, 77, 79, 0.5);
          }

          &.dot-重要  {
            background: #fa8c16;
            box-shadow: 0 0 6px rgba(250, 140, 22, 0.5);
          }

          &.dot-一般  {
            background: #1890ff;
            box-shadow: 0 0 6px rgba(24, 144, 255, 0.5);
          }}

        .item-content  {
          .item-title  {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 6px;

            .level-tag  {
              margin-right: 4px;
            }}

          .item-desc  {
            font-size: 13px;
            color: #909399;
          }}}

      .item-actions  {
        display: flex;
        gap: 8px;
        flex-shrink: 0;

        .btn-cyan  {
          background: #1890ff !important;
          border-color: #1890ff !important;
          color: #fff !important;

          &:hover  {
            background: #40a9ff !important;
            border-color: #40a9ff !important;
            color: #fff !important;
          }}

        .btn-close  {
          background: #f0f2f5;
          border-color: #dcdfe6;
          color: #303133;

          &:hover  {
            background: #ffffff;
            border-color: #40a9ff;
            color: #1890ff;
          }}}}}}
</style>
