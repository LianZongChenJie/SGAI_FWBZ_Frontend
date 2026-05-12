<template>
  <div class="task-manage-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">任务管理</h2>
      <a-button type="primary" class="new-task-btn" @click="handleAddTask">新建任务项</a-button>
    </div>

    <!-- 任务项列表 -->
    <a-card class="task-list-card">
      <a-form :model="queryParams" class="search-form" layout="inline">
        <a-form-item label="任务项名称" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
          <a-input v-model:value="queryParams.taskItemName" allow-clear placeholder="请输入任务项名称" />
        </a-form-item>
        <a-form-item label="周期类型" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
          <a-select v-model:value="queryParams.cycleType" allow-clear placeholder="请选择周期类型" class="search-select">
            <a-select-option value="日">日</a-select-option>
            <a-select-option value="周">周</a-select-option>
            <a-select-option value="月">月</a-select-option>
            <a-select-option value="季">季</a-select-option>
            <a-select-option value="年">年</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="能源类型" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
          <a-tree-select
            v-model:value="queryParams.energyType"
            :tree-data="deviceType"
            :field-names="treeFieldNames"
            allow-clear
            placeholder="请选择能源类型"
            class="search-select"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table
        :columns="taskColumns"
        :data-source="taskList"
        :loading="loading"
        :pagination="pagination"
        :bordered="true"
        row-key="id"
        v-model:expandedRowKeys="expandedRowKeys"
        :show-expand-column="false"
      >
        <!-- 主表操作列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-button
              v-if="record.status == '0'"
              type="primary"
              size="small"
              class="action-btn generate-btn"
              :loading="generateLoadingMap[String(record.id)]"
              @click="handleGenerateTask(record)"
            >
              生成任务
            </a-button>
            <a-button
              v-else
              type="success"
              size="small"
              class="action-btn view-btn"
              :loading="detailLoadingMap[String(record.id)]"
              @click="handleViewDetail(record)"
            >
              {{ expandedRowKeys.includes(record.id) ? '收起任务' : '查看任务' }}
            </a-button>
            <a-button type="warning" size="small" class="action-btn edit-btn" @click="handleEditTask(record)"> 修改 </a-button>

            <a-popconfirm title="确定要删除此任务吗？" ok-text="Yes" cancel-text="No" @confirm="handleDeleteTask(record)">
              <a-button type="danger" size="small" class="action-btn delete-btn"> 删除 </a-button>
            </a-popconfirm>
          </template>
        </template>

        <!-- 展开行内容 -->
        <template #expandedRowRender="{ record: taskItem }">
          <div class="expanded-content">
            <!-- 头部信息 -->
            <div class="detail-header">
              <h3 class="detail-title">任务细项预览</h3>

              <div class="detail-info">
                <span>主任务：{{ taskItem.taskItemName }}</span>
                <span>周期：{{ taskItem.cycleType }}</span>
                <span>执行时间：{{ taskItem.startDate || '-' }} 至 {{ taskItem.endDate || '-' }}</span>
                <span>任务数：{{ getDetailPagination(taskItem.id).total }}条</span>
                <span>抄表人：{{ taskItem.executor || '-' }}</span>
              </div>
            </div>

            <!-- 子表格 -->
            <a-table
              :columns="detailColumns"
              :data-source="getDetailList(taskItem.id)"
              :loading="detailLoadingMap[String(taskItem.id)]"
              :pagination="getDetailPagination(taskItem.id)"
              :bordered="true"
              row-key="id"
              :scroll="{ y: 300 }"
              size="small"
            >
              <template #bodyCell="{ column, record: taskRecord }">
                <template v-if="column.key === 'energyType'">
                  {{ formatEnergyType(taskRecord.energyType) }}
                </template>
                <template v-if="column.key === 'taskStatus'">
                  <span>
                    <a-tag v-if="taskRecord.taskStatus == 0" color="red">待抄表</a-tag>
                    <a-tag v-if="taskRecord.taskStatus == 2" color="orange">已暂停</a-tag>
                    <a-tag v-if="taskRecord.taskStatus == 1" color="green">已完成</a-tag>
                  </span> </template
                ><template v-if="column.key === 'action'">
                  <a-button
                    size="small"
                    v-if="taskRecord.taskStatus == 2"
                    @click="handleStartTask(taskRecord, taskItem)"
                    class="action-btn start-btn"
                  >
                    开启
                  </a-button>
                  <a-button
                    size="small"
                    v-if="taskRecord.taskStatus == 0"
                    @click="handlePauseTask(taskRecord, taskItem)"
                    class="action-btn pause-btn"
                  >
                    暂停
                  </a-button>
                </template>
              </template></a-table
            >
          </div>
        </template>
      </a-table>
    </a-card>
  </div>

  <!-- 新建任务弹出框 -->
  <add-task ref="addTaskRef" :device-type="deviceType" @success="handleAddSuccess" />
</template>

<script lang="ts" setup>
  import { computed, onMounted, reactive, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import AddTask from './addTask.vue';
  import {
    generateManualTaskItemTasks,
    getManualTaskItemDetail,
    getManualTaskItemList,
    getDeviceType,
    deleteManualTaskItem,
    pauseManualTaskItem,
    startManualTaskItem,
  } from './task.api';

  interface ManualTaskRecord {
    id: string | number;
    collectionDate?: string;
    taskDate?: string;
    readingDate?: string;
    executeDate?: string;
    cycleType?: string;
    meterCode?: string;
    deviceCode?: string;
    meterName?: string;
    deviceName?: string;
    energyType?: number | string;
    deviceType?: number | string;
    reader?: string;
    executor?: string;
    status?: string;
    taskItemId?: string | number;
  }

  interface TaskItemRecord {
    id: string | number;
    taskItemName: string;
    energyType: number | string;
    meterIds: string;
    cycleType: string;
    startDate: string;
    endDate: string;
    executor: string;
    createBy: string;
    createTime: string;
    updateBy?: string | null;
    updateTime?: string | null;
    sysOrgCode?: string;
  }

  interface DetailPageState {
    records: ManualTaskRecord[];
    pageNo: number;
    pageSize: number;
    total: number;
  }

  /**
   * 当前展开行
   */
  const expandedRowKeys = ref<Array<string | number>>([]);
  const btnLoading = ref(false);
  const loading = ref(false);
  const generateLoadingMap = reactive<Record<string, boolean>>({});
  const detailLoadingMap = reactive<Record<string, boolean>>({});
  const detailMap = reactive<Record<string, DetailPageState>>({});

  const queryParams = reactive<{
    taskItemName?: string;
    cycleType?: string;
    energyType?: string | number;
  }>({
    taskItemName: undefined,
    cycleType: undefined,
    energyType: undefined,
  });

  const pagination = computed(() => ({
    current: pageInfo.pageNo,
    pageSize: pageInfo.pageSize,
    total: pageInfo.total,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
    onChange: handlePageChange,
    onShowSizeChange: handlePageChange,
  }));

  const pageInfo = reactive({
    pageNo: 1,
    pageSize: 10,
    total: 0,
  });

  /**
   * 新建任务弹出框引用
   */
  const addTaskRef = ref<InstanceType<typeof AddTask> | null>(null);

  /**
   * 处理新建任务按钮点击
   */
  function handleAddTask() {
    addTaskRef.value?.showModal();
  }

  function handleEditTask(record: TaskItemRecord) {
    addTaskRef.value?.showModal(record);
  }

  function handleAddSuccess() {
    pageInfo.pageNo = 1;
    loadTaskList();
  }

  const taskList = ref<TaskItemRecord[]>([]);

  /**
   * 主表列
   */
  const taskColumns = [
    {
      title: '任务项名称',
      dataIndex: 'taskItemName',
      key: 'taskItemName',
      align: 'center',
    },
    {
      title: '周期类型',
      dataIndex: 'cycleType',
      key: 'cycleType',
      align: 'center',
    },
    {
      title: '能源类型',
      dataIndex: 'energyType',
      key: 'energyType',
      customRender: ({ text }) => formatEnergyType(text),
      align: 'center',
    },
    {
      title: '执行开始时间',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 140,
      align: 'center',
    },
    {
      title: '执行结束时间',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 140,
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      align: 'center',
    },
  ];

  /**
   * 子表列
   */
  const detailColumns = [
    {
      title: '采集跨度',
      key: 'taskDate',
      dataIndex: 'taskDate',
      width: 140,
      align: 'center',
    },
    {
      title: '周期类型',
      dataIndex: 'cycleType',
      key: 'cycleType',
      width: 120,
      align: 'center',
    },
    {
      title: '仪表编号',
      key: 'deviceCode',
      dataIndex: 'deviceCode',
      align: 'center',
    },
    {
      title: '仪表名称',
      key: 'deviceName',
      dataIndex: 'deviceName',
      align: 'center',
    },
    {
      title: '能源类型',
      dataIndex: 'energyType',
      key: 'energyType',
      width: 120,
      align: 'center',
    },
    {
      title: '抄表人',
      key: 'reader',
      dataIndex: 'reader',
      width: 120,
      align: 'center',
    },
    {
      title: '任务状态',
      dataIndex: 'taskStatus',
      key: 'taskStatus',
      width: 120,
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
    },
  ];

  const deviceType = ref<any[]>([]);
  const treeFieldNames = {
    label: 'title',
    value: 'key',
    children: 'children',
  };

  function loadDeviceList() {
    getDeviceType().then((res) => {
      deviceType.value = res;
    });
  }
  function expandRow(recordId: string | number) {
    if (!expandedRowKeys.value.includes(recordId)) {
      expandedRowKeys.value.push(recordId);
    }
  }

  function collapseRow(recordId: string | number) {
    expandedRowKeys.value = expandedRowKeys.value.filter((item) => item !== recordId);
  }

  function formatEnergyType(value: number | string) {
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

  function buildQueryParams() {
    return {
      pageNo: pageInfo.pageNo,
      pageSize: pageInfo.pageSize,
      taskItemName: queryParams.taskItemName || undefined,
      cycleType: queryParams.cycleType || undefined,
      energyType: queryParams.energyType || undefined,
    };
  }

  async function loadTaskList() {
    loading.value = true;
    try {
      const res = await getManualTaskItemList(buildQueryParams());
      taskList.value = res?.records || [];
      pageInfo.total = res?.total || 0;
      pageInfo.pageSize = res?.size || pageInfo.pageSize;
      pageInfo.pageNo = res?.current || pageInfo.pageNo;
      expandedRowKeys.value = [];
      Object.keys(detailMap).forEach((key) => delete detailMap[key]);
    } catch (error) {
      taskList.value = [];
      pageInfo.total = 0;
      message.error('任务项列表查询失败');
    } finally {
      loading.value = false;
    }
  }

  function handleSearch() {
    pageInfo.pageNo = 1;
    loadTaskList();
  }

  function handleReset() {
    queryParams.taskItemName = undefined;
    queryParams.cycleType = undefined;
    queryParams.energyType = undefined;
    pageInfo.pageNo = 1;
    loadTaskList();
  }

  function handlePageChange(pageNo: number, pageSize: number) {
    pageInfo.pageNo = pageNo;
    pageInfo.pageSize = pageSize;
    loadTaskList();
  }

  function getDetailState(recordId: string | number) {
    const key = String(recordId);
    if (!detailMap[key]) {
      detailMap[key] = {
        records: [],
        pageNo: 1,
        pageSize: 10,
        total: 0,
      };
    }

    return detailMap[key];
  }

  async function loadTaskDetail(record: TaskItemRecord, pageNo = 1, pageSize = getDetailState(record.id).pageSize) {
    const recordId = String(record.id);
    const state = getDetailState(record.id);
    detailLoadingMap[recordId] = true;
    try {
      const res = await getManualTaskItemDetail({
        taskItemId: record.id,
        pageNo,
        pageSize,
      });

      const pageResult = res?.result || res || {};
      const records = pageResult.records || [];
      records.forEach((item) => {
        item.deviceCode = item.meterInfo?.deviceCode || '-';
        item.deviceName = item.meterInfo?.deviceName || '-';
      });
      state.records = records;
      state.total = pageResult.total || 0;
      state.pageNo = pageResult.current || pageNo;
      state.pageSize = pageResult.size || pageSize;
      expandRow(record.id);
    } catch (error) {
      message.error('查看任务详情失败');
    } finally {
      detailLoadingMap[recordId] = false;
    }
  }

  async function handleGenerateTask(record: TaskItemRecord) {
    const recordId = String(record.id);
    generateLoadingMap[recordId] = true;
    try {
      await generateManualTaskItemTasks({ id: record.id });
      message.success('生成任务成功');
      record.status = '1';
      await loadTaskDetail(record);
    } catch (error) {
      message.error('生成任务失败');
    } finally {
      generateLoadingMap[recordId] = false;
    }
  }

  function handleViewDetail(record: TaskItemRecord) {
    if (expandedRowKeys.value.includes(record.id)) {
      collapseRow(record.id);
      return;
    }

    loadTaskDetail(record);
  }

  function getDetailList(recordId: string | number) {
    return getDetailState(recordId).records;
  }

  function getDetailPagination(recordId: string | number) {
    const state = getDetailState(recordId);
    return {
      current: state.pageNo,
      pageSize: state.pageSize,
      total: state.total,
      showSizeChanger: true,
      showTotal: (total: number) => `共 ${total} 条`,
      onChange: (pageNo: number, pageSize: number) => {
        const record = taskList.value.find((item) => item.id === recordId);
        if (record) {
          loadTaskDetail(record, pageNo, pageSize);
        }
      },
      onShowSizeChange: (pageNo: number, pageSize: number) => {
        const record = taskList.value.find((item) => item.id === recordId);
        if (record) {
          loadTaskDetail(record, pageNo, pageSize);
        }
      },
    };
  }
  function handleDeleteTask(record: TaskItemRecord) {
    deleteManualTaskItem({ id: record.id }).then(() => {
      loadTaskList();
    });
  }
  async function refreshCurrentDetailPage(taskItem: TaskItemRecord) {
    const state = getDetailState(taskItem.id);
    await loadTaskDetail(taskItem, state.pageNo, state.pageSize);
  }

  async function handlePauseTask(record: ManualTaskRecord, taskItem: TaskItemRecord) {
    btnLoading.value = true;
    try {
      await pauseManualTaskItem({ id: record.id });
      await refreshCurrentDetailPage(taskItem);
    } catch (error) {
      message.error('暂停失败');
    }
  }
  async function handleStartTask(record: ManualTaskRecord, taskItem: TaskItemRecord) {
    btnLoading.value = true;
    try {
      await startManualTaskItem({ id: record.id });
      await refreshCurrentDetailPage(taskItem);
    } catch (error) {
      message.error('开启失败');
    }
  }
  onMounted(() => {
    loadTaskList();
    loadDeviceList();
  });
</script>

<style scoped>
  .task-manage-container {
    padding: 20px;
    background: #f5f5f5;
    min-height: 100vh;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  .task-list-card {
    border-radius: 8px;
  }

  .search-form {
    gap: 8px 0;
    margin-bottom: 16px;
  }

  .search-select {
    width: 180px;
  }

  .action-btn {
    margin-right: 8px;
  }

  .generate-btn {
    background: #1677ff;
    border-color: #1677ff;
  }

  .edit-btn {
    background: #fa8c16;
    border-color: #fa8c16;
    color: #fff;
  }
  .delete-btn {
    background: #fc0c0c;
    border-color: #fc0c0c;
    color: #fff;
  }
  .pause-btn {
    background: #706c6c;
    border-color: #706c6c;
    color: #fff;
  }
  .start-btn {
    background: #09e438;
    border-color: #09e438;
    color: #fff;
  }

  .view-btn {
    background: #52c41a;
    border-color: #52c41a;
    color: #fff;
  }

  .expanded-content {
    padding: 16px;
    background: #fafafa;
    border-radius: 6px;
  }

  .detail-header {
    margin-bottom: 16px;
  }

  .detail-title {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
  }

  .detail-info {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    color: #666;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    font-weight: 600;
  }

  :deep(.ant-table-expanded-row > td) {
    padding: 0 !important;
    background: #fff;
  }
</style>
