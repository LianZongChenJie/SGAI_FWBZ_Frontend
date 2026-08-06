<template>
  <div class="event-page">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <StatCard
        v-for="(card, index) in statCards"
        :key="index"
        :label="card.title || '--'"
        :value="card.value ?? '--'"
        :change-text="card.context || ''"
        :color="statCardConfigs[index]?.color || 'blue'"
        :icon="statCardConfigs[index]?.icon"
      />
    </div>

    <!-- 对屏指挥 + 对屏控制 -->
    <div class="two-col">
      <div class="card">
        <div class="card-header">
          <h3><DesktopOutlined /> 对屏指挥看板</h3>
          <span class="tag tag-blue">实时</span>
        </div>
        <div class="card-body">
          <div class="chart-placeholder" style="min-height: 350px;">
            <div class="chart-icon"><DesktopOutlined /></div>
            <div class="chart-text">指挥大屏实时数据展示</div>
            <div class="chart-sub">客流/能耗/设备/告警/视频 多维度融合</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><ControlOutlined /> 对屏控制面板</h3>
          <span class="tag tag-green">可控</span>
        </div>
        <div class="card-body">
          <div class="control-grid">
            <div class="control-card" v-for="item in controlPanels" :key="item.title">
              <div class="control-card-header">
                <div class="control-card-icon" :style="{ background: item.bgColor, color: item.iconColor }">
                  <component :is="item.icon" />
                </div>
                <div>
                  <div class="control-card-title">{{ item.title }}</div>
                  <div class="control-card-meta">{{ item.meta }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 投诉建议处理 -->
    <div class="card">
      <div class="card-header">
        <h3><MessageOutlined /> 投诉建议处理</h3>
        <a-button type="primary" @click="handleAdd">+ 新增记录</a-button>
      </div>
      <div class="card-body">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          size="small"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'complaintTime'">
              {{ record.complaintDate || '--' }} {{ record.complaintTime || '' }}
            </template>
            <template v-if="column.key === 'typeName'">
              {{ record.typeName || '--' }}
            </template>
            <template v-if="column.key === 'status'">
              <span class="status-text" :class="getStatusClass(record.status)">{{ record.status || '--' }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <!-- <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button> -->
              <a-button type="link" size="small" @click="handleProcess(record)">处理</a-button>
              <a-button type="link" danger size="small" @click="handleDelete(record)">删除</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 新增投诉弹窗 -->
    <a-modal
      v-model:visible="addModalVisible"
      title="新增投诉记录"
      width="600px"
      :confirm-loading="addModalLoading"
      @ok="handleAddSubmit"
      @cancel="handleAddCancel"
    >
      <a-form ref="addFormRef" :model="addForm" :rules="addRules" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="标题" name="title">
          <a-input v-model:value="addForm.title" placeholder="请输入标题" />
        </a-form-item>
        <a-form-item label="类型" name="typeId">
          <a-select
            v-model:value="addForm.typeId"
            placeholder="请选择类型"
            :options="typeOptions"
            :field-names="{ label: 'typeName', value: 'id' }"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="日期" name="complaintDate">
          <a-date-picker
            v-model:value="addForm.complaintDate"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
          />
        </a-form-item>
        <a-form-item label="时间" name="complaintTime">
          <a-time-picker
            v-model:value="addForm.complaintTime"
            style="width: 100%"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="请选择时间"
          />
        </a-form-item>
        <a-form-item label="投诉内容" name="content">
          <a-textarea
            v-model:value="addForm.content"
            placeholder="请输入投诉内容"
            :rows="3"
            :maxlength="500"
            show-count
          />
        </a-form-item>
        <a-form-item label="投诉来源" name="source">
          <a-input v-model:value="addForm.source" placeholder="请输入投诉来源" />
        </a-form-item>
        <a-form-item label="处理人" name="handler">
          <a-input v-model:value="addForm.handler" placeholder="请输入处理人" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select
            v-model:value="addForm.status"
            placeholder="请选择状态"
            :options="statusOptions"
            :field-names="{ label: 'statusName', value: 'statusName' }"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑弹窗（仅编辑处理人） -->
    <a-modal
      v-model:visible="editModalVisible"
      title="编辑处理人"
      width="480px"
      :confirm-loading="editModalLoading"
      @ok="handleEditSubmit"
      @cancel="handleEditCancel"
    >
      <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="投诉内容">
          <span>{{ editRecord?.content || '--' }}</span>
        </a-form-item>
        <a-form-item label="处理人">
          <a-input v-model:value="editHandler" placeholder="请输入处理人" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 处理弹窗 -->
    <a-modal
      v-model:visible="processModalVisible"
      title="处理投诉"
      width="520px"
      :confirm-loading="processModalLoading"
      @ok="handleProcessSubmit"
      @cancel="handleProcessCancel"
    >
      <a-form ref="processFormRef" :model="processForm" :rules="processRules" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="处理人" name="handler">
          <a-input v-model:value="processForm.handler" placeholder="请输入处理人" />
        </a-form-item>
        <a-form-item label="处理内容" name="handleContent">
          <a-textarea
            v-model:value="processForm.handleContent"
            placeholder="请输入处理内容"
            :rows="4"
            :maxlength="500"
            show-count
          />
        </a-form-item>
        <a-form-item label="处理状态" name="status">
          <a-select
            v-model:value="processForm.status"
            placeholder="请选择处理状态"
            :options="statusOptions"
            :field-names="{ label: 'statusName', value: 'statusName' }"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { StatCard } from '/@/views/bems-web/components'
import {
  PlayCircleOutlined,
  SendOutlined,
  MessageOutlined,
  ToolOutlined,
  DesktopOutlined,
  ControlOutlined,
  CloudOutlined,
  BulbOutlined,
  VideoCameraOutlined,
  AlertOutlined,
} from '@ant-design/icons-vue'
import {
  getSummary,
  getComplaintList,
  getTypeList,
  getStatusList,
  addComplaint,
  editComplaint,
  handleComplaint,
  deleteComplaint,
} from './index.api'
import type {
  StatCardVO,
  ComplaintInfo,
  ComplaintType,
  ComplaintStatus,
} from './index.api'

defineOptions({ name: 'EventDuringPage' })

// ===== 统计卡片配置（图标/颜色固定，数据来自后端） =====
const statCardConfigs = [
  { color: 'blue' as const, icon: PlayCircleOutlined },
  { color: 'green' as const, icon: SendOutlined },
  { color: 'orange' as const, icon: MessageOutlined },
  { color: 'purple' as const, icon: ToolOutlined },
]
const statCards = ref<StatCardVO[]>([])

const fetchSummary = async () => {
  try {
    const res = await getSummary()
    statCards.value = Array.isArray(res) ? res : []
  } catch (error) {
    console.error('获取卡片汇总失败:', error)
  }
}

// ===== 对屏控制面板（静态配置） =====
const controlPanels = [
  { title: '空调控制', meta: '温度/模式/风速', icon: CloudOutlined, bgColor: '#ebf8ff', iconColor: '#3182ce' },
  { title: '照明控制', meta: '开关/亮度/场景', icon: BulbOutlined, bgColor: '#f0fff4', iconColor: '#38a169' },
  { title: '视频切换', meta: '监控画面/广播', icon: VideoCameraOutlined, bgColor: '#fffaf0', iconColor: '#dd6b20' },
  { title: '应急控制', meta: '广播/疏散/联动', icon: AlertOutlined, bgColor: '#fff5f5', iconColor: '#e53e3e' },
]

// ===== 类型 / 状态下拉 =====
const typeOptions = ref<ComplaintType[]>([])
const statusOptions = ref<ComplaintStatus[]>([])

const fetchTypeOptions = async () => {
  try {
    const res = await getTypeList()
    typeOptions.value = Array.isArray(res) ? res : res?.records || []
  } catch (error) {
    console.error('获取类型列表失败:', error)
  }
}

const fetchStatusOptions = async () => {
  try {
    const res = await getStatusList()
    statusOptions.value = Array.isArray(res) ? res : res?.records || []
  } catch (error) {
    console.error('获取状态列表失败:', error)
  }
}

// ===== 状态样式映射 =====
const getStatusClass = (status?: string) => {
  if (!status) return ''
  if (status.includes('已处理') || status.includes('已回复') || status.includes('完成')) return 'normal'
  if (status.includes('处理中') || status.includes('待处理') || status.includes('待')) return 'warning'
  if (status.includes('驳回') || status.includes('关闭') || status.includes('无效')) return 'danger'
  return 'info'
}

// ===== 列表数据 =====
const loading = ref(false)
const tableData = ref<ComplaintInfo[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
  showSizeChanger: true,
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getComplaintList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    })
    if (Array.isArray(res)) {
      tableData.value = res
      pagination.total = res.length
    } else {
      tableData.value = res?.records || []
      pagination.total = res?.total || 0
    }
  } catch (error) {
    console.error('获取投诉建议列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchList()
}

// ===== 列定义 =====
const columns = [
  { title: '标题', dataIndex: 'title', key: 'title', width: 180 },
  { title: '时间', key: 'complaintTime', width: 180 },
  { title: '类型', dataIndex: 'typeName', key: 'typeName', width: 90 },
  { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
  { title: '来源', dataIndex: 'source', key: 'source', width: 150 },
  { title: '处理人', dataIndex: 'handler', key: 'handler', width: 90 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 180 },
]

// ===== 新增弹窗 =====
const addModalVisible = ref(false)
const addModalLoading = ref(false)
const addFormRef = ref<FormInstance>()

const addForm = reactive({
  title: '',
  typeId: undefined as number | undefined,
  complaintDate: undefined as string | undefined,
  complaintTime: undefined as string | undefined,
  content: '',
  source: '',
  handler: '',
  status: undefined as string | undefined,
})

const addRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'change' }],
  typeId: [{ required: true, message: '请选择类型', trigger: 'change' }],
  complaintDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  complaintTime: [{ required: true, message: '请选择时间', trigger: 'change' }],
  content: [{ required: true, message: '请输入投诉内容', trigger: 'blur' }],
  source: [{ required: true, message: '请输入投诉来源', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const resetAddForm = () => {
  addForm.typeId = undefined
  addForm.complaintDate = undefined
  addForm.complaintTime = undefined
  addForm.content = ''
  addForm.source = ''
  addForm.handler = ''
  addForm.status = undefined
  addFormRef.value?.resetFields()
}

const handleAdd = () => {
  resetAddForm()
  addModalVisible.value = true
}

const handleAddSubmit = async () => {
  try {
    await addFormRef.value?.validate()
    addModalLoading.value = true
    await addComplaint({
      title: addForm.title,
      typeId: addForm.typeId,
      complaintDate: addForm.complaintDate,
      complaintTime: addForm.complaintTime,
      content: addForm.content,
      source: addForm.source,
      handler: addForm.handler,
      status: addForm.status,
    })
    message.success('新增成功')
    addModalVisible.value = false
    fetchList()
  } catch (error) {
    console.error('新增投诉失败:', error)
  } finally {
    addModalLoading.value = false
  }
}

const handleAddCancel = () => {
  addModalVisible.value = false
}

// ===== 编辑弹窗（仅编辑处理人） =====
const editModalVisible = ref(false)
const editModalLoading = ref(false)
const editRecord = ref<ComplaintInfo | null>(null)
const editHandler = ref('')

const handleEdit = (record: ComplaintInfo) => {
  editRecord.value = record
  editHandler.value = record.handler || ''
  editModalVisible.value = true
}

const handleEditSubmit = async () => {
  if (!editRecord.value?.id) return
  editModalLoading.value = true
  try {
    await editComplaint({
      id: editRecord.value.id,
      handler: editHandler.value,
    })
    message.success('修改成功')
    editModalVisible.value = false
    fetchList()
  } catch (error) {
    console.error('编辑投诉失败:', error)
  } finally {
    editModalLoading.value = false
  }
}

const handleEditCancel = () => {
  editModalVisible.value = false
}

// ===== 处理弹窗 =====
const processModalVisible = ref(false)
const processModalLoading = ref(false)
const processFormRef = ref<FormInstance>()
const processRecord = ref<ComplaintInfo | null>(null)

const processForm = reactive({
  handler: '',
  handleContent: '',
  status: undefined as string | undefined,
})

const processRules = {
  handler: [{ required: true, message: '请输入处理人', trigger: 'blur' }],
  handleContent: [{ required: true, message: '请输入处理内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择处理状态', trigger: 'change' }],
}

const resetProcessForm = () => {
  processForm.handler = ''
  processForm.handleContent = ''
  processForm.status = undefined
  processFormRef.value?.resetFields()
}

const handleProcess = (record: ComplaintInfo) => {
  processRecord.value = record
  resetProcessForm()
  // 回填当前处理人
  processForm.handler = record.handler || ''
  processModalVisible.value = true
}

const handleProcessSubmit = async () => {
  try {
    await processFormRef.value?.validate()
    if (!processRecord.value?.id) return
    processModalLoading.value = true
    await handleComplaint({
      complaintId: processRecord.value.id,
      handleContent: processForm.handleContent,
      handler: processForm.handler,
      status: processForm.status!,
    })
    message.success('处理成功')
    processModalVisible.value = false
    fetchList()
  } catch (error) {
    console.error('处理投诉失败:', error)
  } finally {
    processModalLoading.value = false
  }
}

const handleProcessCancel = () => {
  processModalVisible.value = false
}

// ===== 删除投诉 =====
const handleDelete = (record: ComplaintInfo) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除该投诉记录吗？`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteComplaint({ id: record.id! })
        message.success('删除成功')
        fetchList()
      } catch (error) {
        console.error('删除投诉失败:', error)
      }
    },
  })
}

// ===== 初始化 =====
onMounted(() => {
  fetchSummary()
  fetchTypeOptions()
  fetchStatusOptions()
  fetchList()
})
</script>

<style scoped lang="less">
.event-page { padding: 0; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;

  .card-header {
    padding: 18px 22px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .tag {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }
    .tag-blue { background: #bee3f8; color: #2a4365; }
    .tag-green { background: #c6f6d5; color: #22543d; }
  }

  .card-body { padding: 22px; }
}

.chart-placeholder {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #a0aec0;
  border: 2px dashed #e2e8f0;
  min-height: 280px;
  padding: 30px;

  .chart-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .chart-text {
    font-size: 14px;
    color: #718096;
    font-weight: 500;
  }

  .chart-sub {
    font-size: 12px;
    color: #a0aec0;
    margin-top: 8px;
  }
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .control-card {
    background: #f7fafc;
    border-radius: 10px;
    padding: 18px;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #3182ce;
      box-shadow: 0 4px 12px rgba(49, 130, 206, 0.1);
    }

    .control-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .control-card-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .control-card-title {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
    }

    .control-card-meta {
      font-size: 12px;
      color: #718096;
      margin-top: 2px;
    }
  }
}

.status-text {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.normal { background: #c6f6d5; color: #22543d; }
  &.warning { background: #feebc8; color: #744210; }
  &.danger { background: #fed7d7; color: #742a2a; }
  &.info { background: #bee3f8; color: #2a4365; }
}
</style>
