<template>
  <a-modal
    v-model:open="visible"
    :title="'场景详情 - ' + currentScene?.name"
    width="650px"
    wrapClassName="scene-detail-modal"
    :footer="null"
    :maskClosable="true"
    @cancel="onCancel"
  >
    <div class="modal-content">
      <!-- 详情表格 -->
      <div class="table-section">
        <div class="table-scroll">
          <table class="device-table">
            <thead>
              <tr>
                <th>地块名称</th>
                <th>区域名称</th>
                <th>回路名称</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in tableData" :key="idx">
                <td>{{ row.spaceName || '-' }}</td>
                <td>{{ row.areaName || '-' }}</td>
                <td>{{ row.circuitName || row.name || '-' }}</td>
                <td>
                  <span class="status-text" :class="row.status === '开启' ? 'status-on' : 'status-off'">
                    {{ row.status || '关闭' }}
                  </span>
                </td>
                <td>
                  <div class="row-btn-group">
                    <button class="row-btn on-btn" @click="handleRowAction(row, '开启')">开启</button>
                    <button class="row-btn off-btn" @click="handleRowAction(row, '关闭')">关闭</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!tableData || tableData.length === 0">
                <td colspan="5" class="empty-row">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { planDetailApiNew, postSceneSwitchApi } from '@/api/equipmentMonitoring'
import { message, Modal } from 'ant-design-vue'

// 状态
const visible = ref(false)
const currentScene = ref<any>(null)
const tableData = ref<any[]>([])

/** 打开详情弹窗 */
async function showDetail(scene: any) {
  console.log('打开场景详情:', scene)
  
  // 验证 id 是否存在
  if (!scene?.id) {
    console.error('场景 ID 不存在:', scene)
    message.error('场景数据不完整，无法查看详情')
    return
  }
  
  currentScene.value = scene
  visible.value = true
  
  // 获取详情数据
  try {
    const params = { id: scene.id }
    console.log('请求参数:', params)
    const data = await planDetailApiNew(params)
    console.log('场景详情数据:', data)
    
    if (data) {
      // 根据控制类型显示不同数据
      if (scene.relType === '区域') {
        tableData.value = Array.isArray(data.areaList) ? data.areaList : []
      } else if (scene.relType === '回路') {
        tableData.value = Array.isArray(data.circuitList) ? data.circuitList : []
      }
    }
  } catch (err: any) {
    console.error('获取场景详情失败:', err)
    message.error(err?.message || '获取场景详情失败')
  }
}

/** 行操作：开启/关闭 */
function handleRowAction(row: any, action: '开启' | '关闭') {
  const actionText = action === '开启' ? '开启' : '关闭'
  Modal.confirm({
    title: '确认操作',
    content: `确定要${actionText}该回路吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await postSceneSwitchApi({
          operationType: action,
          relIds: row.circuitId || row.id,
          relType: '回路'
        })
        message.success(`${actionText}成功`)
        row.status = action
      } catch (error) {
        console.error(`回路${actionText}失败:`, error)
        message.error('操作失败，请重试')
      }
    }
  })
}

/** 关闭弹窗 */
function onCancel() {
  visible.value = false
  currentScene.value = null
  tableData.value = []
}

defineExpose({ showDetail })
</script>

<style scoped lang="less">
.modal-content {
  padding: 8px 0;
}

/* 详情表格 */
.table-section {
  background: rgba(10, 22, 40, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 6px;
  overflow: hidden;
}

.table-scroll {
  max-height: 400px;
  overflow-y: auto;
}

.device-table {
  width: 100%;
  border-collapse: collapse;
}

.device-table th,
.device-table td {
  padding: 12px;
  text-align: left;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-table thead th {
  background: rgba(27, 37, 51, 0.85);
  color: #a0aabf;
  font-weight: 500;
  border-bottom: 1px solid rgba(48, 61, 80, 0.8);
  position: sticky;
  top: 0;
  z-index: 1;
}

.device-table tbody td {
  color: #ffffff;
  border-bottom: 1px solid #303d50;
}

.device-table tbody tr {
  transition: background 0.2s;
}

.device-table tbody tr:hover {
  background: rgba(0, 162, 232, 0.04);
}

.empty-row {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  padding: 40px 0;
}

/* 状态文字 */
.status-text {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}

/* 行操作按钮 */
.row-btn-group {
  display: flex;
  gap: 4px;
}

.row-btn {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.row-btn.on-btn {
  background: rgba(0, 200, 120, 0.15);
  border: 1px solid rgba(0, 200, 120, 0.4);
  color: #00e676;
}

.row-btn.on-btn:hover {
  background: rgba(0, 200, 120, 0.3);
  border-color: rgba(0, 200, 120, 0.6);
}

.row-btn.off-btn {
  background: rgba(255, 80, 80, 0.15);
  border: 1px solid rgba(255, 80, 80, 0.4);
  color: #ff5252;
}

.row-btn.off-btn:hover {
  background: rgba(255, 80, 80, 0.3);
  border-color: rgba(255, 80, 80, 0.6);
}
</style>

<style lang="less">
/* 全局 Modal 样式 - 高透深色科技风（30%不透明度） */
.scene-detail-modal {
  .ant-modal-content {
    background: rgba(10, 22, 40, 0.85) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(56, 189, 248, 0.35) !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(56, 189, 248, 0.1) !important;
  }

  .ant-modal-header {
    background: rgba(27, 37, 51, 0.9) !important;
    border-bottom: 1px solid rgba(56, 189, 248, 0.25) !important;
    border-radius: 8px 8px 0 0 !important;
  }

  .ant-modal-title {
    color: #38bdf8 !important;
    font-weight: 600 !important;
  }

  .ant-modal-body {
    padding: 20px 24px !important;
    color: rgba(255, 255, 255, 0.85);
  }
}
</style>
