<template>
  <a-modal
    v-model:open="visible"
    :title="'场景详情 - ' + currentScene?.name"
    width="1100px"
    wrapClassName="scene-detail-modal"
    :zIndex="91000"
    :footer="null"
    :maskClosable="true"
    :getContainer="props.container"
    top="20px"
    @cancel="onCancel"
   :class="themeClass">
    <!-- ==================== Tab：场景 / 节目（参考 createNewSceneModal 展示场景详情） ==================== -->
    <a-tabs v-model:activeKey="activeTab" class="scene-detail-tabs">
      <!-- ==================== Tab 1：场景（详情表格，样式风格保持原样） ==================== -->
      <a-tab-pane key="scene" tab="场景">
        <div class="modal-content">
          <!-- 详情表格 -->
          <div class="table-section">
            <div class="table-scroll" :style="tableScrollStyle">
              <table class="device-table">
                <thead>
                  <tr>
                    <th>地块名称</th>
                    <th>区域名称</th>
                    <th>回路名称</th>
                    <th>电流</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in tableData" :key="idx">
                    <td :title="row.spaceName || '-'">{{ row.spaceName || '-' }}</td>
                    <td :title="row.areaName || '-'">{{ row.areaName || '-' }}</td>
                    <td :title="row.circuitName || row.name || '-'">{{ row.circuitName || row.name || '-' }}</td>
                    <td :title="row.electricCurrent || ''">{{ row.electricCurrent || '' }}</td>
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
                    <td colspan="6" class="empty-row">暂无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <!-- ==================== Tab 2：节目（参考 createNewSceneModal：节目名称/所属区域/上次操作时间） ==================== -->
      <a-tab-pane key="program" tab="节目" v-if="showProgramTab">
        <div class="table-wrapper">
          <vxe-table
            :data="displayProgramSceneList"
            :loading="programLoading"
            :row-config="{ keyField: 'id', height: 38 }"
            max-height="420"
            border="none"
          >
            <vxe-column type="seq" title="序号" width="60" fixed="left"></vxe-column>
            <vxe-column field="programName" title="节目名称" min-width="240" show-overflow></vxe-column>
            <vxe-column field="sysOrgCode" title="所属区域" width="140" align="center"></vxe-column>
            <vxe-column field="updateTime" title="上次操作时间" width="200" align="center"></vxe-column>
          </vxe-table>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 统一二次确认弹框（提示样式：标题栏 + 信息图标 + 动作词高亮） -->
    <ConfirmModal ref="confirmModalRef" />
  </a-modal>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, computed } from 'vue'
import { planDetailApiNew, postSceneSwitchApi, getLightingProgramList } from '@/api/equipmentMonitoring'
import { message } from 'ant-design-vue'
import ConfirmModal from '../../equipmentMonitoring/components/ConfirmModal.vue'

// 可选 props：container 用于将弹框挂载到指定容器（如全屏地图卡片内部，兼容原生全屏）；不传时保持默认挂 body（bigGis 原行为）
const props = defineProps({
  mapViewRef: { type: Object, default: null },
  container: { type: [String, Object, Function, Boolean], default: undefined },
})

// 状态
const confirmModalRef = ref<InstanceType<typeof ConfirmModal> | null>(null)
const visible = ref(false)
const currentScene = ref<any>(null)
const tableData = ref<any[]>([])
const activeTab = ref<'scene' | 'program'>('scene')

/** 表格滚动条动态控制：数据条数 > 6 时限制为表头 + 6 行高度并展示右侧滚动条，否则完整展示全部内容 */
const tableScrollStyle = computed(() => {
  const len = tableData.value?.length || 0
  // 行高：th/td 上下 padding 24px + line-height 20px + border 1px = 45px；表头 + 6 行 = 7 * 45 = 315px，留出余量提示可滚动
  return len > 6 ? { maxHeight: '320px' } : { maxHeight: 'none' }
})

// ==================== 节目 tab（独立节目接口数据，参考 createNewSceneModal） ====================
const programSceneList = ref<any[]>([])
const programLoading = ref(false)
// detail 接口返回的 programSceneIds（兼容字符串逗号分隔 / 数组），驱动节目 tab 显隐
const detailProgramSceneIds = ref<string[]>([])

/** 节目 tab 是否展示：仅当 detail 接口返回的 programSceneIds 非空时才展示 */
const showProgramTab = computed(() => detailProgramSceneIds.value.length > 0)

// 接口业务失败（success=false）时全局拦截器仍会正常 resolve（return data），这里统一抛错，
// 避免出现“接口已报错（500/业务失败）却提示指令下发成功”的假成功问题
function throwIfControlFailed(res: any) {
  if (res && res.success === false) {
    throw new Error(res.message || '操作失败')
  }
  return res
}

/** 节目 tab 展示列表：仅展示 detail 接口 programSceneIds 关联的节目 */
const displayProgramSceneList = computed(() => {
  if (!detailProgramSceneIds.value.length) return []
  const idSet = new Set(detailProgramSceneIds.value.map(String))
  return programSceneList.value.filter((item) => idSet.has(String(item.id)))
})

/** 加载节目列表（独立节目接口 /bems/lighting/program/list） */
async function loadProgramSceneList() {
  programLoading.value = true
  try {
    const data: any = await getLightingProgramList({ pageNo: 1, pageSize: 999 })
    // 兼容分页结构（records/list/result/data）与纯数组返回
    const records = Array.isArray(data) ? data : (data?.records || data?.list || data?.result || data?.data || [])
    programSceneList.value = (records as any[]).map((item) => ({
      ...item,
      // 时间字段兼容：接口可能返回 updateDate / createTime
      updateTime: item.updateTime || item.updateDate || item.createTime || '',
    }))
  } catch (err) {
    console.error('加载节目列表失败:', err)
    programSceneList.value = []
  } finally {
    programLoading.value = false
  }
}

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
  activeTab.value = 'scene'
  detailProgramSceneIds.value = []
  programSceneList.value = []

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
      } else {
        tableData.value = Array.isArray(data.circuitList) ? data.circuitList : []
      }
      // 解析 detail 接口返回的 programSceneIds，驱动节目 tab 显隐与过滤
      const rawIds = data.programSceneIds ?? ''
      detailProgramSceneIds.value = Array.isArray(rawIds)
        ? rawIds.map(String)
        : String(rawIds).split(',').filter(Boolean)
    }
    // 节目 tab 数据源：全量节目（按 programSceneIds 过滤展示）
    await loadProgramSceneList()
  } catch (err: any) {
    // 全局拦截器已统一弹出错误提示，这里只记录日志
    console.error('获取场景详情失败:', err)
  }
}

/** 行操作：开启/关闭 */
function handleRowAction(row: any, action: '开启' | '关闭') {
  const actionText = action === '开启' ? '开启' : '关闭'
  confirmModalRef.value?.showModal({
    content: `确定要 <strong class="tip-action">${actionText}</strong> 该回路吗？`,
    onOk: async () => {
      try {
        await throwIfControlFailed(
          await postSceneSwitchApi({
            operationType: action,
            relIds: row.circuitId || row.id,
            relType: '回路'
          })
        )
        message.success(`${actionText}成功`)
        row.status = action
      } catch (error) {
        // 全局拦截器已统一弹出错误提示，这里只记录日志
        console.error(`回路${actionText}失败:`, error)
      }
    }
  })
}

/** 关闭弹窗 */
function onCancel() {
  visible.value = false
  currentScene.value = null
  tableData.value = []
  detailProgramSceneIds.value = []
  programSceneList.value = []
}

defineExpose({ showDetail })
</script>

<style scoped lang="less">
.modal-content {
  padding: 8px 0;
}

/* ==================== Tab（场景 / 节目）深色科技风（参考 createNewSceneModal） ==================== */
.scene-detail-tabs {
  margin-bottom: 4px;

  :deep(.ant-tabs-nav) {
    margin-bottom: 12px;
    width: 100%;

    &::before {
      border-bottom: 1px solid rgba(0, 212, 255, 0.15);
    }
  }

  /* tab 导航占满整行，两个 tab 平分 */
  :deep(.ant-tabs-nav-list) {
    width: 100%;
    display: flex;
  }

  :deep(.ant-tabs-tab) {
    flex: 1;
    margin: 0;
    padding: 8px 0;
    justify-content: center;
    color: #7fa6d4;
    font-size: 13px;
    letter-spacing: 0.5px;
    transition: all 0.2s;

    &:hover {
      color: #00d4ff;
    }
  }

  /* 文字水平居中 */
  :deep(.ant-tabs-tab-btn) {
    display: block;
    width: 100%;
    text-align: center;
  }

  :deep(.ant-tabs-tab.ant-tabs-tab-active) {
    background: linear-gradient(180deg, rgba(0, 212, 255, 0.25), rgba(0, 212, 255, 0.06));
    box-shadow:
      inset 0 1.5px 0 rgba(0, 212, 255, 0.9),
      inset 1px 0 0 rgba(0, 212, 255, 0.3),
      inset -1px 0 0 rgba(0, 212, 255, 0.3);
    border-radius: 6px 6px 0 0;
  }

  :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
    color: #00eaff !important;
    font-weight: 700;
    text-shadow: 0 0 10px rgba(0, 234, 255, 0.6);
  }

  :deep(.ant-tabs-ink-bar) {
    background: linear-gradient(90deg, #00d4ff, #00ffd1) !important;
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
    border-radius: 2px;
  }
}

/* ==================== 节目表格区域 —— vxe-table 深色主题（参考 createNewSceneModal） ==================== */
.table-wrapper {
  overflow: hidden;
  margin-bottom: 4px;
  background: #0d243c;
  border: 1px solid rgba(0, 212, 255, 0.12);
  border-radius: 4px;
  box-shadow: inset 0 0 16px rgba(0, 212, 255, 0.04);
}

.table-wrapper :deep(.vxe-table) {
  background: transparent;
  color: #ffffff;
  border: 0;
  outline: 0;
  box-shadow: none;

  --vxe-ui-table-border-color: #1f2b3d;
  --vxe-ui-table-border-width: 0;
  --vxe-ui-table-checkbox-range-border-color: #00d4ff;
  --vxe-ui-table-cell-area-border-color: #00d4ff;
  --vxe-ui-table-cell-main-area-extension-border-color: #00d4ff;
  --vxe-ui-table-cell-extend-area-border-color: #00d4ff;
  --vxe-ui-table-cell-copy-area-border-color: #00d4ff;
  --vxe-ui-table-fixed-right-scrolling-box-shadow: none;
  --vxe-ui-table-fixed-left-scrolling-box-shadow: none;
  --vxe-ui-layout-background-color: transparent;
  --vxe-ui-table-header-background-color: #1b2533;
  --vxe-ui-table-footer-background-color: #141d2b;
  --vxe-ui-table-row-hover-background-color: rgba(0, 212, 255, 0.06);
  --vxe-ui-table-row-striped-background-color: transparent;
  --vxe-ui-table-row-current-background-color: rgba(0, 162, 232, 0.18);
  --vxe-ui-table-row-hover-current-background-color: rgba(0, 162, 232, 0.22);

  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}

/* 表头：加底部青光描边 + 列首左侧装饰 */
.table-wrapper :deep(.vxe-table .vxe-header--wrapper),
.table-wrapper :deep(.vxe-header--row) {
  background: linear-gradient(180deg, #1f2b3d 0%, #1b2533 100%) !important;
}

.table-wrapper :deep(.vxe-table .vxe-header--wrapper) {
  position: relative;
  border-bottom: 1px solid #2a3a52;
  box-shadow: 0 1px 0 0 rgba(0, 212, 255, 0.1);
}

.table-wrapper :deep(.vxe-table .vxe-header--column) {
  font-weight: 500 !important;
  font-size: 12px !important;
  color: #8fa3bf !important;
  letter-spacing: 0.3px;
}

/* 表体行：hover 青色高亮 + 左侧条 */
.table-wrapper :deep(.vxe-table .vxe-body--row) {
  transition: background 0.2s;
  position: relative;
}

.table-wrapper :deep(.vxe-table .vxe-body--row:hover) {
  background: rgba(0, 212, 255, 0.06) !important;
  box-shadow: inset 2px 0 0 0 rgba(0, 212, 255, 0.6);
}

/* 行内单元格字号、行高紧凑 */
.table-wrapper :deep(.vxe-table .vxe-body--column) {
  font-size: 12px !important;
  color: #d6e0ee !important;
}

/* 自定义滚动条 */
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar,
.table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar,
.table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar-track,
.table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-track,
.table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-track {
  background: transparent;
}
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar-thumb,
.table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-thumb,
.table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
}
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar-thumb:hover,
.table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-thumb:hover,
.table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* 表头行：去掉右边线 */
.table-wrapper :deep(.vxe-header--row),
.table-wrapper :deep(.vxe-header--row .vxe-header--column),
.table-wrapper :deep(.vxe-header--row .vxe-header--column:last-child),
.table-wrapper :deep(.vxe-header--row .col--fixed-right) {
  border-right: 0 !important;
  background-image: none !important;
}

/* Gutter 列：去掉所有边界线、背景色 */
.table-wrapper :deep(.vxe-table--header-wrapper .vxe-header--row .vxe-header--gutter),
.table-wrapper :deep(.vxe-table--body-wrapper .vxe-body--row .vxe-body--gutter),
.table-wrapper :deep(.vxe-header--gutter),
.table-wrapper :deep(.vxe-body--gutter),
.table-wrapper :deep(.col--gutter) {
  border: 0 !important;
  background-image: none !important;
  background-color: transparent !important;
  box-shadow: none !important;
  outline: none !important;
}

/* ==================== 详情表格（样式风格保持原样） ==================== */
.table-section {
  background: #0d243c;
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 6px;
  overflow: hidden;
}

.table-scroll {
  overflow-y: auto;
  /* Firefox：深色滚动条（全局滚动条为浅灰半透明，在深色背景下不可见） */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 150, 255, 0.5) rgba(0, 30, 60, 0.2);
}

/* Chrome/Edge：深色青色滚动条，覆盖全局暗淡滚动条样式 */
.table-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-scroll::-webkit-scrollbar-track {
  background: rgba(0, 30, 60, 0.2);
  border-radius: 4px;
}

.table-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.5);
  border-radius: 4px;
}

.table-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 200, 255, 0.7);
}

.device-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

/* 列宽分配：名称列占剩余空间，长内容省略号截断，状态/操作列固定 */
.device-table th:nth-child(1),
.device-table td:nth-child(1) {
  width: 20%;
}

.device-table th:nth-child(2),
.device-table td:nth-child(2) {
  width: 24%;
}

.device-table th:nth-child(3),
.device-table td:nth-child(3) {
  width: 24%;
}

.device-table th:nth-child(4),
.device-table td:nth-child(4) {
  width: 10%;
}

.device-table th:nth-child(5),
.device-table td:nth-child(5) {
  width: 22%;
}

.device-table th,
.device-table td {
  padding: 12px;
  text-align: left;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-table thead th {
  background: #1b2533;
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
/* 全局 Modal 样式 - 深色科技风（100% 不透明度） */
.scene-detail-modal {
  .ant-modal {
    top: 20px !important;
  }

  .ant-modal-content {
    background: linear-gradient(180deg, #143358 0%, #0f2845 100%) !important;
    border: 1px solid rgba(56, 189, 248, 0.35) !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(56, 189, 248, 0.1) !important;
  }

  .ant-modal-header {
    background: linear-gradient(90deg, rgba(0, 212, 255, 0.08) 0%, transparent 100%), #1b2533 !important;
    border-bottom: 1px solid rgba(56, 189, 248, 0.25) !important;
    border-radius: 8px 8px 0 0 !important;
  }

  .ant-modal-title {
    color: #38bdf8 !important;
    font-weight: 600 !important;
  }

  .ant-modal-body {
    padding: 20px 24px !important;
    color: #e6f4ff;
  }

  /* 关闭按钮：亮色 X 图标 + 淡青圆形底，hover 旋转发光（深色背景上默认灰色 X 不明显） */
  .ant-modal-close {
    color: rgba(255, 255, 255, 0.9) !important;
    background: rgba(56, 189, 248, 0.1) !important;
    border-radius: 50% !important;
    width: 36px !important;
    height: 36px !important;
    top: 9px !important;
    right: 9px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.25s ease !important;
  }

  .ant-modal-close:hover {
    color: #38bdf8 !important;
    background: rgba(56, 189, 248, 0.28) !important;
    box-shadow: 0 0 12px rgba(56, 189, 248, 0.4) !important;
    transform: rotate(90deg);
  }
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped lang="less">
.theme-white .modal-content {
  padding: 8px 0;
}.theme-white /* ==================== Tab（场景 / 节目）浅色科技风（参考 createNewSceneModal） ==================== */
.scene-detail-tabs {
  margin-bottom: 4px;

  :deep(.ant-tabs-nav)  {
    margin-bottom: 12px;
    width: 100%;

    &::before  {
      border-bottom: 1px solid rgba(24, 144, 255, 0.15);
    }}

  /* tab 导航占满整行，两个 tab 平分 */
  :deep(.ant-tabs-nav-list)  {
    width: 100%;
    display: flex;
  }

  :deep(.ant-tabs-tab)  {
    flex: 1;
    margin: 0;
    padding: 8px 0;
    justify-content: center;
    color: #606266;
    font-size: 13px;
    letter-spacing: 0.5px;
    transition: all 0.2s;

    &:hover  {
      color: #1890ff;
    }}

  /* 文字水平居中 */
  :deep(.ant-tabs-tab-btn)  {
    display: block;
    width: 100%;
    text-align: center;
  }

  :deep(.ant-tabs-tab.ant-tabs-tab-active)  {
    background: linear-gradient(180deg, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.03));
    box-shadow:
      inset 0 1.5px 0 rgba(24, 144, 255, 0.8),
      inset 1px 0 0 rgba(24, 144, 255, 0.25),
      inset -1px 0 0 rgba(24, 144, 255, 0.25);
    border-radius: 6px 6px 0 0;
  }

  :deep(.ant-tabs-tab-active .ant-tabs-tab-btn)  {
    color: #1890ff !important;
    font-weight: 700;
    text-shadow: 0 0 10px rgba(24, 144, 255, 0.35);
  }

  :deep(.ant-tabs-ink-bar)  {
    background: linear-gradient(90deg, #1890ff, #40a9ff) !important;
    box-shadow: 0 0 8px rgba(24, 144, 255, 0.4);
    border-radius: 2px;
  }}.theme-white /* ==================== 节目表格区域 —— vxe-table 浅色主题（参考 createNewSceneModal） ==================== */
.table-wrapper {
  overflow: hidden;
  margin-bottom: 4px;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: inset 0 0 16px rgba(24, 144, 255, 0.03);
}.theme-white .table-wrapper :deep(.vxe-table) {
  background: transparent;
  color: #303133;
  border: 0;
  outline: 0;
  box-shadow: none;

  --vxe-ui-table-border-color: #e4e7ed;
  --vxe-ui-table-border-width: 0;
  --vxe-ui-table-checkbox-range-border-color: #1890ff;
  --vxe-ui-table-cell-area-border-color: #1890ff;
  --vxe-ui-table-cell-main-area-extension-border-color: #1890ff;
  --vxe-ui-table-cell-extend-area-border-color: #1890ff;
  --vxe-ui-table-cell-copy-area-border-color: #1890ff;
  --vxe-ui-table-fixed-right-scrolling-box-shadow: none;
  --vxe-ui-table-fixed-left-scrolling-box-shadow: none;
  --vxe-ui-layout-background-color: #ffffff;
  --vxe-ui-table-header-background-color: #f5f7fa;
  --vxe-ui-table-footer-background-color: #fafbfc;
  --vxe-ui-table-row-hover-background-color: rgba(24, 144, 255, 0.05);
  --vxe-ui-table-row-striped-background-color: #fafbfc;
  --vxe-ui-table-row-current-background-color: rgba(24, 144, 255, 0.08);
  --vxe-ui-table-row-hover-current-background-color: rgba(24, 144, 255, 0.1);

  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}.theme-white /* 表头：加底部青光描边 + 列首左侧装饰 */
.table-wrapper :deep(.vxe-table .vxe-header--wrapper),
.theme-white .table-wrapper :deep(.vxe-header--row) {
  background: #f5f7fa !important;
}.theme-white .table-wrapper :deep(.vxe-table .vxe-header--wrapper) {
  position: relative;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 0 0 rgba(24, 144, 255, 0.12);
}.theme-white .table-wrapper :deep(.vxe-table .vxe-header--column) {
  font-weight: 500 !important;
  font-size: 12px !important;
  color: #1890ff !important;
  letter-spacing: 0.3px;
}.theme-white /* 表体行：hover 青色高亮 + 左侧条 */
.table-wrapper :deep(.vxe-table .vxe-body--row) {
  transition: background 0.2s;
  position: relative;
}.theme-white .table-wrapper :deep(.vxe-table .vxe-body--row:hover) {
  background: rgba(24, 144, 255, 0.05) !important;
  box-shadow: inset 2px 0 0 0 rgba(24, 144, 255, 0.5);
}.theme-white /* 行内单元格字号、行高紧凑 */
.table-wrapper :deep(.vxe-table .vxe-body--column) {
  font-size: 12px !important;
  color: #303133 !important;
}.theme-white /* 自定义滚动条 */
.table-wrapper :deep(.vxe-table)::-webkit-scrollbar,
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}.theme-white .table-wrapper :deep(.vxe-table)::-webkit-scrollbar-track,
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-track,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-track {
  background: transparent;
}.theme-white .table-wrapper :deep(.vxe-table)::-webkit-scrollbar-thumb,
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-thumb,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}.theme-white .table-wrapper :deep(.vxe-table)::-webkit-scrollbar-thumb:hover,
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper)::-webkit-scrollbar-thumb:hover,
.theme-white .table-wrapper :deep(.vxe-table--header-wrapper)::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.35);
}.theme-white /* 表头行：去掉右边线 */
.table-wrapper :deep(.vxe-header--row),
.theme-white .table-wrapper :deep(.vxe-header--row .vxe-header--column),
.theme-white .table-wrapper :deep(.vxe-header--row .vxe-header--column:last-child),
.theme-white .table-wrapper :deep(.vxe-header--row .col--fixed-right) {
  border-right: 0 !important;
  background-image: none !important;
}.theme-white /* Gutter 列：去掉所有边界线、背景色 */
.table-wrapper :deep(.vxe-table--header-wrapper .vxe-header--row .vxe-header--gutter),
.theme-white .table-wrapper :deep(.vxe-table--body-wrapper .vxe-body--row .vxe-body--gutter),
.theme-white .table-wrapper :deep(.vxe-header--gutter),
.theme-white .table-wrapper :deep(.vxe-body--gutter),
.theme-white .table-wrapper :deep(.col--gutter) {
  border: 0 !important;
  background-image: none !important;
  background-color: transparent !important;
  box-shadow: none !important;
  outline: none !important;
}.theme-white /* ==================== 详情表格（样式风格保持原样） ==================== */
.table-section {
  background: #ffffff;
  border: 1px solid rgba(24, 144, 255, 0.25);
  border-radius: 6px;
  overflow: hidden;
}.theme-white .table-scroll {
  overflow-y: auto;
  /* Firefox：浅色滚动条（全局滚动条为浅灰半透明，在白底上不可见） */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.04);
}.theme-white /* Chrome/Edge：浅色滚动条，覆盖全局暗淡滚动条样式 */
.table-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}.theme-white .table-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
}.theme-white .table-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}.theme-white .table-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.35);
}.theme-white .device-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}.theme-white /* 列宽分配：名称列占剩余空间，长内容省略号截断，状态/操作列固定 */
.device-table th:nth-child(1),
.theme-white .device-table td:nth-child(1) {
  width: 20%;
}.theme-white .device-table th:nth-child(2),
.theme-white .device-table td:nth-child(2) {
  width: 24%;
}.theme-white .device-table th:nth-child(3),
.theme-white .device-table td:nth-child(3) {
  width: 24%;
}.theme-white .device-table th:nth-child(4),
.theme-white .device-table td:nth-child(4) {
  width: 10%;
}.theme-white .device-table th:nth-child(5),
.theme-white .device-table td:nth-child(5) {
  width: 22%;
}.theme-white .device-table th,
.theme-white .device-table td {
  padding: 12px;
  text-align: left;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}.theme-white .device-table thead th {
  background: #f5f7fa;
  color: #1890ff;
  font-weight: 500;
  border-bottom: 1px solid #e4e7ed;
  position: sticky;
  top: 0;
  z-index: 1;
}.theme-white .device-table tbody td {
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
}.theme-white .device-table tbody tr {
  transition: background 0.2s;
}.theme-white .device-table tbody tr:hover {
  background: rgba(24, 144, 255, 0.05);
}.theme-white .empty-row {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}.theme-white /* 状态文字 */
.status-text {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}.theme-white /* 行操作按钮 */
.row-btn-group {
  display: flex;
  gap: 4px;
}.theme-white .row-btn {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}.theme-white .row-btn.on-btn {
  background: rgba(82, 196, 26, 0.12);
  border: 1px solid rgba(82, 196, 26, 0.4);
  color: #52c41a;
}.theme-white .row-btn.on-btn:hover {
  background: rgba(82, 196, 26, 0.2);
  border-color: rgba(82, 196, 26, 0.6);
}.theme-white .row-btn.off-btn {
  background: rgba(255, 77, 79, 0.12);
  border: 1px solid rgba(255, 77, 79, 0.4);
  color: #ff4d4f;
}.theme-white .row-btn.off-btn:hover {
  background: rgba(255, 77, 79, 0.2);
  border-color: rgba(255, 77, 79, 0.6);
}
</style>

<style lang="less">
.theme-white /* 全局 Modal 样式 - 浅色科技风（100% 不透明度） */
.scene-detail-modal {
  .ant-modal  {
    top: 20px !important;
  }

  .ant-modal-content  {
    background: #ffffff !important;
    border: 1px solid rgba(24, 144, 255, 0.25) !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(24, 144, 255, 0.08) !important;
  }

  .ant-modal-header  {
    background: linear-gradient(90deg, rgba(24, 144, 255, 0.06) 0%, transparent 100%), #fafbfc !important;
    border-bottom: 1px solid rgba(24, 144, 255, 0.2) !important;
    border-radius: 8px 8px 0 0 !important;
  }

  .ant-modal-title  {
    color: #303133 !important;
    font-weight: 600 !important;
  }

  .ant-modal-body  {
    padding: 20px 24px !important;
    color: #303133;
  }

  /* 关闭按钮：灰字 + 浅灰圆底，hover 旋转变主蓝（白底上默认灰 X 不明显时兜底） */
  .ant-modal-close  {
    color: #909399 !important;
    background: rgba(0, 0, 0, 0.04) !important;
    border-radius: 50% !important;
    width: 36px !important;
    height: 36px !important;
    top: 9px !important;
    right: 9px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.25s ease !important;
  }

  .ant-modal-close:hover  {
    color: #1890ff !important;
    background: rgba(24, 144, 255, 0.1) !important;
    box-shadow: 0 0 12px rgba(24, 144, 255, 0.3) !important;
    transform: rotate(90deg);
  }}
</style>
