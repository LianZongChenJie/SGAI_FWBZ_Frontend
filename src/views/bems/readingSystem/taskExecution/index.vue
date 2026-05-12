<template>
  <div class="task-execution-page">
    <a-card class="toolbar-card" :bordered="false">
      <a-space :size="12" wrap>
        <a-button
          v-for="item in cycleOptions"
          :key="item.value"
          :type="activeCycle === item.value ? 'primary' : 'default'"
          class="cycle-btn"
          @click="handleCycleChange(item.value)"
        >
          {{ item.label }}
        </a-button>
      </a-space>
    </a-card>

    <a-card class="content-card" :bordered="false">
      <div class="section-title">{{ activeCycleLabel }}任务</div>

      <div class="task-filter">
        <div class="date-filter">
          <div class="field-label">选择{{ shortCycleLabel }}</div>
          <a-date-picker v-model:value="selectedDate" :picker="datePickerType" :format="dateFormat" :allow-clear="false" class="period-picker" />
        </div>

        <a-space :size="12" class="operation-bar">
          <a-button type="primary" class="query-btn" :loading="loading" @click="handleSearch">查询任务</a-button>
          <!-- <a-button class="export-btn">导出模板</a-button>
          <a-button class="import-btn">批量导入</a-button> -->
        </a-space>
      </div>

      <div class="table-wrap">
        <table v-if="taskList.length" class="execution-table">
          <thead>
            <tr>
              <th>周期类型</th>
              <th>仪表编号</th>
              <th>仪表名称</th>
              <th>能源类型</th>
              <th>本期读数</th>
              <th>抄表人</th>
              <th>任务状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in taskList" :key="record.id">
              <td>{{ record.cycleType || activeCycle }}</td>
              <td>{{ getMeterCode(record) }}</td>
              <td>{{ getMeterName(record) }}</td>
              <td align="center">{{ formatEnergyType(record.energyType) }}</td>
              <td>
                <a-input
                  v-model:value="record.currentReading"
                  type="number"
                  :disabled="isReadingDisabled(record)"
                  class="reading-input"
                  placeholder="读数"
                />
              </td>
              <td>{{ record.reader || record.executor || '-' }}</td>
              <td>{{ getTaskStatusText(record.taskStatus ?? record.status) }}</td>
              <td>
                <a-button
                  :type="isCompleted(record) && !record.isEditing ? 'default' : 'primary'"
                  size="small"
                  class="complete-btn"
                  :loading="completeLoadingMap[String(record.id)]"
                  @click="handleTaskAction(record)"
                >
                  {{ isCompleted(record) && !record.isEditing ? '修改' : '完成' }}
                </a-button>
              </td>
            </tr>
          </tbody>
        </table>
        <a-empty v-else-if="!loading" />
        <div class="table-loading" v-else>加载中...</div>
      </div>
    </a-card>

    <a-card class="content-card log-card" :bordered="false">
      <div class="section-title">抄表日志</div>

      <div class="table-wrap">
        <table class="execution-table log-table" v-loading="logLoading">
          <thead>
            <tr>
              <th>周期</th>
              <th>计量周期</th>
              <th>仪表编号</th>
              <th>仪表名称</th>
              <th>本期读数</th>
              <th>当期用量</th>
              <th>抄表人</th>
              <th>操作时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in logList" :key="record.id">
              <td>{{ record.cycleType }}</td>
              <td>{{ record.taskDate }}</td>
              <td>{{ record.deviceCode }}</td>
              <td>{{ record.deviceName }}</td>
              <td>{{ record.newReading }}</td>
              <td class="usage-cell">{{ record.dosage }}</td>
              <td>{{ record.reader }}</td>
              <td class="time-cell">{{ record.createTime }}</td>
            </tr>
          </tbody>
        </table>
        <!-- 分页组件 -->
        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :size="size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, reactive, ref } from 'vue';
  import type { Dayjs } from 'dayjs';
  import dayjs from 'dayjs';
  import weekOfYear from 'dayjs/plugin/weekOfYear';
  import isoWeek from 'dayjs/plugin/isoWeek';
  import quarterOfYear from 'dayjs/plugin/quarterOfYear';
  import { message } from 'ant-design-vue';
  import { getDeviceType, getManualTaskListByCycle, updateReading, getLogList } from './taskExe.api';
  import type { ComponentSize } from 'element-plus';
  dayjs.extend(weekOfYear);
  dayjs.extend(isoWeek);
  dayjs.extend(quarterOfYear);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const size = ref<ComponentSize>('default');
  type CycleType = '日' | '周' | '月' | '季' | '年';

  interface TaskRecord {
    id: string | number;
    meterCode?: string;
    meterName?: string;
    deviceCode?: string;
    deviceName?: string;
    meterInfo?: {
      deviceCode?: string;
      deviceName?: string;
    };
    cycleType?: string;
    energyType?: string | number;
    currentReading?: string;
    reader?: string;
    executor?: string;
    status?: string | number;
    taskStatus?: string | number;
    isEditing?: boolean;
  }

  interface LogRecord {
    id: string;
    cycleType: string;
    taskDate: string;
    deviceCode: string;
    deviceName: string;
    newReading: string;
    dosage: string;
    reader: string;
    createTime: string;
  }

  const cycleOptions: Array<{ label: string; value: CycleType; shortLabel: string }> = [
    { label: '日抄表', value: '日', shortLabel: '日期' },
    { label: '周抄表', value: '周', shortLabel: '周' },
    { label: '月抄表', value: '月', shortLabel: '月' },
    { label: '季度抄表', value: '季', shortLabel: '季度' },
    { label: '年抄表', value: '年', shortLabel: '年' },
  ];

  const activeCycle = ref<CycleType>('日');
  const selectedDate = ref<Dayjs>(dayjs());
  const loading = ref(false);
  const taskList = ref<TaskRecord[]>([]);
  const deviceType = ref<any[]>([]);
  const completeLoadingMap = reactive<Record<string, boolean>>({});

  // 抄表日志分页相关
  const logList = ref<LogRecord[]>([]);
  const logLoading = ref(false);
  const activeCycleConfig = computed(() => {
    return cycleOptions.find((item) => item.value === activeCycle.value) || cycleOptions[1];
  });

  const activeCycleLabel = computed(() => activeCycleConfig.value.label);
  const shortCycleLabel = computed(() => activeCycleConfig.value.shortLabel);

  const datePickerType = computed(() => {
    const pickerMap: Record<CycleType, 'date' | 'week' | 'month' | 'quarter' | 'year'> = {
      日: 'date',
      周: 'week',
      月: 'month',
      季: 'quarter',
      年: 'year',
    };

    return pickerMap[activeCycle.value];
  });

  const dateFormat = computed(() => {
    const formatMap: Record<CycleType, string | ((value: Dayjs) => string)> = {
      日: 'YYYY-MM-DD',
      周: (value: Dayjs) => `${value.year()} 年第 ${value.isoWeek()} 周`,
      月: 'YYYY 年 MM 月',
      季: (value: Dayjs) => `${value.year()} 年第 ${value.quarter()} 季度`,
      年: 'YYYY 年',
    };

    return formatMap[activeCycle.value];
  });

  function handleCycleChange(value: CycleType) {
    activeCycle.value = value;
    loadTaskList();
  }

  function buildQueryParams() {
    const value = selectedDate.value;
    const params: Record<string, any> = {
      cycleType: activeCycle.value,
    };

    switch (activeCycle.value) {
      case '日':
        params.date = value.format('YYYY-MM-DD');
        break;
      case '周':
        params.year = value.year();
        params.week = value.isoWeek();
        break;
      case '月':
        params.year = value.year();
        params.month = value.month() + 1;
        break;
      case '季':
        params.year = value.year();
        params.quarter = value.quarter();
        break;
      case '年':
        params.year = value.year();
        break;
    }

    return params;
  }

  async function loadTaskList() {
    loading.value = true;
    try {
      const res = await getManualTaskListByCycle(buildQueryParams());
      const pageResult = res?.result || res || {};
      taskList.value = pageResult.records || [];
    } catch (error) {
      taskList.value = [];
      message.error('任务查询失败');
    } finally {
      loading.value = false;
    }
  }

  function handleSearch() {
    loadTaskList();
  }
  function handleTaskAction(record: TaskRecord) {
    if (isCompleted(record) && !record.isEditing) {
      record.isEditing = true;
      return;
    }

    handleComplete(record);
  }

  function handleComplete(record: TaskRecord) {
    if (!record.currentReading) {
      message.warning('请输入本期读数');
      return;
    }
    const recordId = String(record.id);
    completeLoadingMap[recordId] = true;
    updateReading({
      id: record.id,
      currentReading: Number(record.currentReading),
    })
      .then(() => {
        record.taskStatus = 1;
        record.status = 1;
        record.isEditing = false;
        loadLogList();
      })
      .catch(() => {
        message.error('抄表任务完成失败');
      })
      .finally(() => {
        completeLoadingMap[recordId] = false;
      });
  }

  function isCompleted(record: TaskRecord) {
    return String(record.taskStatus ?? record.status) === '1' || record.status === '已完成';
  }

  function isReadingDisabled(record: TaskRecord) {
    return isCompleted(record) && !record.isEditing;
  }

  function getMeterCode(record: TaskRecord) {
    return record.meterCode || record.deviceCode || record.meterInfo?.deviceCode || '-';
  }

  function getMeterName(record: TaskRecord) {
    return record.meterName || record.deviceName || record.meterInfo?.deviceName || '-';
  }

  function getTaskStatusText(status: string | number | undefined) {
    const statusMap: Record<string, string> = {
      '0': '待抄表',
      '1': '已完成',
      '2': '已暂停',
    };

    return statusMap[String(status)] || status || '-';
  }

  function formatEnergyType(value: number | string | undefined) {
    const node = findTreeNode(deviceType.value, value);
    if (node) {
      return node.title || node.name || node.label || value || '-';
    }

    const energyTypeMap: Record<string, string> = {
      '1': '电力',
      '2': '水',
      '3': '燃气',
    };

    return energyTypeMap[String(value)] || value || '-';
  }

  function findTreeNode(tree: any[], value: string | number | undefined): any {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    for (const node of tree || []) {
      if (String(getNodeValue(node)) === String(value)) {
        return node;
      }

      const childNode = findTreeNode(node.children || [], value);
      if (childNode) {
        return childNode;
      }
    }
    return null;
  }

  function getNodeValue(node: any) {
    return node?.key ?? node?.value ?? node?.id;
  }

  async function loadDeviceType() {
    deviceType.value = await getDeviceType();
  }

  // 加载抄表日志列表（带分页）
  async function loadLogList() {
    logLoading.value = true;
    try {
      const params = {
        pageNo: currentPage.value,
        pageSize: pageSize.value,
      };
      const res = await getLogList(params);
      const pageResult = res?.result || res || {};
      logList.value = pageResult.records || [];
      logList.value.forEach((item) => {
        item.deviceCode = item.meterInfo?.deviceCode || '-';
        item.deviceName = item.meterInfo?.deviceName || '-';
      });
      total.value = pageResult.total || 0;
    } catch (error) {
      logList.value = [];
      total.value = 0;
      message.error('抄表日志查询失败');
    } finally {
      logLoading.value = false;
    }
  }
  const handleSizeChange = (val: number) => {
    pageSize.value = val;
    loadLogList();
  };
  const handleCurrentChange = (val: number) => {
    currentPage.value = val;
    loadLogList();
  };
  onMounted(() => {
    loadDeviceType();
    loadTaskList();
    loadLogList();
  });
</script>

<style scoped>
  .task-execution-page {
    min-height: 100vh;
    padding: 16px 14px;
    background: #f5f6f8;
  }

  .toolbar-card,
  .content-card {
    border-radius: 8px;
    box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
  }

  .toolbar-card {
    margin-bottom: 20px;
  }

  .cycle-btn {
    min-width: 76px;
    height: 38px;
  }

  .content-card {
    margin-bottom: 24px;
  }

  .section-title {
    margin: 4px 0 20px;
    color: #000;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
  }

  .task-filter {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 16px;
  }

  .date-filter {
    width: min(640px, 100%);
  }

  .field-label {
    margin-bottom: 6px;
    color: #1f2937;
    font-size: 14px;
    line-height: 1.4;
  }

  .period-picker {
    width: 100%;
    max-width: 638px;
  }

  .period-picker :deep(.ant-picker-input > input) {
    height: 34px;
    color: #000;
    font-size: 16px;
  }

  .operation-bar {
    padding-bottom: 15px;
    white-space: nowrap;
  }

  .query-btn,
  .export-btn,
  .import-btn {
    min-width: 92px;
    height: 36px;
    border-radius: 4px;
  }

  .export-btn {
    border-color: #2ca24d;
    background: #2ca24d;
    color: #fff;
  }

  .export-btn:hover,
  .export-btn:focus {
    border-color: #35b85a;
    background: #35b85a;
    color: #fff;
  }

  .import-btn {
    border-color: #ef6c12;
    background: #ef6c12;
    color: #fff;
  }

  .import-btn:hover,
  .import-btn:focus {
    border-color: #f57b22;
    background: #f57b22;
    color: #fff;
  }

  .table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .table-loading {
    padding: 32px 0;
    color: #666;
    text-align: center;
  }
  .execution-table {
    width: 100%;
    min-width: 980px;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .execution-table th,
  .execution-table td {
    height: 54px;
    padding: 8px 16px;
    color: #000;
    font-size: 14px;
    text-align: left;
    vertical-align: middle;
    border-bottom: 0;
  }

  .execution-table th {
    height: 44px;
    background: #fafafa;
    font-weight: 700;
  }

  .execution-table tbody tr:hover td {
    background: #fbfdff;
  }

  .reading-input {
    width: 96px;
  }

  .complete-btn {
    height: 24px;
    padding: 0 9px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }

  .log-card {
    margin-bottom: 0;
  }

  .log-table th,
  .log-table td {
    height: 52px;
  }

  .usage-cell {
    color: #2857ff !important;
  }

  .time-cell {
    color: #4b5563 !important;
    font-size: 12px !important;
  }

  /* 分页样式 */
  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }

  :deep(.ant-card-body) {
    padding: 24px;
  }

  @media (max-width: 900px) {
    .task-filter {
      align-items: stretch;
      flex-direction: column;
    }

    .operation-bar {
      padding-bottom: 0;
    }

    .operation-bar :deep(.ant-space-item) {
      flex: 1;
    }

    .query-btn,
    .export-btn,
    .import-btn {
      width: 100%;
    }
  }
</style>
