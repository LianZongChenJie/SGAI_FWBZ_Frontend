<!-- 报警设置 -->
<template>
  <div class="alert-page">
    <div class="stats-row">
      <StatCard label="报警规则数" :value="statData.count" change-text="" trend="" color="blue" :icon="AlertRulesIcon" />
      <StatCard label="启用规则" :value="statData.enableCount" change-text="" trend="" color="green" :icon="ActiveRulesIcon" />
      <StatCard label="报警类型数" :value="statData.categoryCount" change-text="" trend="" color="orange" :icon="AlertTypesIcon" />
      <StatCard label="报警等级数" :value="statData.levelCount" change-text="" trend="" color="purple" :icon="NotifyChannelIcon" />
    </div>

    <div class="card">
      <div class="card-header">
        <h3>📋报警规则配置</h3>
        <div style="display: flex; gap: 8px; align-items: center;">
          <a-button type="primary" :loading="ruleExportLoading" @click="handleRuleExport">
            <DownloadOutlined v-if="!ruleExportLoading" />
            导出
          </a-button>
          <!-- <a-button v-if="hasPermission('bems:alarmRule:add')" type="primary" @click="addRuleStrategy"> 新增 </a-button> -->
          <a-button type="primary" @click="addRuleStrategy"> 新增 </a-button>
          <button class="collapse-btn" @click="ruleCollapsed = !ruleCollapsed">
            <CaretDownOutlined v-if="!ruleCollapsed" />
            <CaretUpOutlined v-else />
          </button>
        </div>
      </div>
      <div v-show="!ruleCollapsed" class="card-body">
        <a-table
          :columns="ruleColumns2"
          :data-source="ruleTableData"
          :pagination="rulePagination"
          :loading="ruleLoading"
          row-key="id"
          @change="handleRuleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'index'">
              {{ record._index }}
            </template>
            <template v-if="column.key === 'alarmLevelName'">
              <span class="status-text" :class="record.alarmLevelName === '非常紧急' ? 'danger' : record.alarmLevelName === '紧急' ? 'warning' : 'info'">{{ record.alarmLevelName }}</span>
            </template>
            <template v-if="column.key === 'frequency'">
              {{ getRuleFrequency(record) }}
            </template>
            <template v-if="column.key === 'switchStatus'">
              <!-- <a-switch
                :checked="record.enabledStatus == '1'"
                :disabled="(record.enabledStatus == '1') ? !hasPermission('bems:alarmRule:startRule') : !hasPermission('bems:alarmRule:stopRule')"
                @change="(checked) => handleRuleStatusChange(record, checked)"
              /> -->
              <a-switch
                :checked="record.enabledStatus == '1'"
                @change="(checked) => handleRuleStatusChange(record, checked)"
              />
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <!-- <a-button type="link" size="small" v-if="hasPermission('bems:alarmRule:edit')" @click="handleRuleEdit(record)">编辑</a-button> -->
                <a-button type="link" size="small" @click="handleRuleEdit(record)">编辑</a-button>
                <a-button type="link" size="small" @click="checkRuleDetail(record)">详情</a-button>
                <a-popconfirm title="确认删除该条数据？" ok-text="确定" cancel-text="取消" @confirm="handleRuleDelete(record)">
                  <a-button type="link" size="small" danger>删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <AlarmRulesModal ref="ruleModalRef" :type="ruleModalType" :editItem="ruleEditItem" :closeModal="closeRuleModal" />

    <div class="card">
      <div class="card-header">
        <h3>📋报警类别</h3>
        <div style="display: flex; gap: 8px; align-items: center;">
          <a-button type="primary" :loading="categoryExportLoading" @click="handleCategoryExport">
            <DownloadOutlined v-if="!categoryExportLoading" />
            导出
          </a-button>
          <!-- <a-button
            v-if="hasPermission('bems:device_data:amend')"
            type="primary"
            @click="addAlarmCategory"
          > 新增 </a-button> -->
          <a-button
            type="primary"
            @click="addAlarmCategory"
          > 新增 </a-button>
          <button class="collapse-btn" @click="categoryCollapsed = !categoryCollapsed">
            <CaretDownOutlined v-if="!categoryCollapsed" />
            <CaretUpOutlined v-else />
          </button>
        </div>
      </div>
      <div v-show="!categoryCollapsed" class="card-body">
        <a-table
          :columns="categoryColumns"
          :data-source="categoryTableData"
          :pagination="categoryPagination"
          :loading="categoryLoading"
          row-key="id"
          @change="handleCategoryTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'index'">
              {{ record._index }}
            </template>
            <template v-if="column.key === 'active'">
              <a-space>
                <a-button type="link" size="small" @click="handleCategoryEdit(record)">编辑</a-button>
                <!-- <a-popconfirm
                  v-if="!Number(record.status) && hasPermission('bems:alarmCategory:startCategory')"
                  title="是否启用？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleCategoryEnable(record)"
                >
                  <a-button type="link" size="small">启用</a-button>
                </a-popconfirm> -->
                <a-popconfirm
                  v-if="!Number(record.status)"
                  title="是否启用？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleCategoryEnable(record)"
                >
                  <a-button type="link" size="small">启用</a-button>
                </a-popconfirm>
                <!-- <a-popconfirm
                  v-if="Number(record.status) && hasPermission('bems:alarmCategory:stopCategory')"
                  title="是否停用？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleCategoryDisable(record)"
                >
                  <a-button type="link" size="small" danger>停用</a-button>
                </a-popconfirm> -->
                <a-popconfirm
                  v-if="Number(record.status)"
                  title="是否停用？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleCategoryDisable(record)"
                >
                  <a-button type="link" size="small" danger>停用</a-button>
                </a-popconfirm>
                <!-- <a-popconfirm
                  v-if="hasPermission('bems:alarmCategory:delete')"
                  title="是否删除？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleCategoryDelete(record)"
                >
                  <a-button type="link" size="small" danger>删除</a-button>
                </a-popconfirm> -->
                <a-popconfirm
                  title="是否删除？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleCategoryDelete(record)"
                >
                  <a-button type="link" size="small" danger>删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>📋报警级别</h3>
        <div style="display: flex; gap: 8px; align-items: center;">
          <a-button type="primary" :loading="levelExportLoading" @click="handleLevelExport">
            <DownloadOutlined v-if="!levelExportLoading" />
            导出
          </a-button>
          <!-- <a-button
            v-if="hasPermission('bems:alarmLevel:add')"
            type="primary"
            @click="addAlarmLevel"
          > 新增 </a-button> -->
          <a-button
            type="primary"
            @click="addAlarmLevel"
          > 新增 </a-button>
          <button class="collapse-btn" @click="levelCollapsed = !levelCollapsed">
            <CaretDownOutlined v-if="!levelCollapsed" />
            <CaretUpOutlined v-else />
          </button>
        </div>
      </div>
      <div v-show="!levelCollapsed" class="card-body">
        <a-table
          :columns="levelColumns"
          :data-source="levelTableData"
          :pagination="levelPagination"
          :loading="levelLoading"
          row-key="id"
          @change="handleLevelTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'index'">
              {{ record._index }}
            </template>
            <template v-if="column.key === 'active'">
              <a-space>
                <a-button type="link" size="small" @click="handleLevelEdit(record)">编辑</a-button>
                <!-- <a-popconfirm
                  v-if="!Number(record.status) && hasPermission('bems:alarmLevel:startLevel')"
                  title="是否启用？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleLevelEnable(record)"
                >
                  <a-button type="link" size="small">启用</a-button>
                </a-popconfirm> -->
                <a-popconfirm
                  v-if="!Number(record.status)"
                  title="是否启用？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleLevelEnable(record)"
                >
                  <a-button type="link" size="small">启用</a-button>
                </a-popconfirm>
                <!-- <a-popconfirm
                  v-if="Number(record.status) && hasPermission('bems:alarmLevel:stopLevel')"
                  title="是否停用？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleLevelDisable(record)"
                >
                  <a-button type="link" size="small" danger>停用</a-button>
                </a-popconfirm> -->
                <a-popconfirm
                  v-if="Number(record.status)"
                  title="是否停用？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleLevelDisable(record)"
                >
                  <a-button type="link" size="small" danger>停用</a-button>
                </a-popconfirm>
                <!-- <a-popconfirm
                  v-if="hasPermission('bems:alarmLevel:delete')"
                  title="是否删除？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleLevelDelete(record)"
                >
                  <a-button type="link" size="small" danger>删除</a-button>
                </a-popconfirm> -->
                <a-popconfirm
                  title="是否删除？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleLevelDelete(record)"
                >
                  <a-button type="link" size="small" danger>删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <add-alarm-category-modal ref="categoryModalRef" :reload="reloadCategory" />
    <add-alarm-level-modal ref="levelModalRef" :reload="reloadLevel" />
  </div>
</template>

<script setup lang="ts">
import { StatCard } from '/@/views/bems-web/components'
import { ref, computed, h, onMounted } from 'vue'
import { defHttp } from '/@/utils/http/axios'
import { DownloadOutlined, CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons-vue'
import { usePermissionStore } from '/@/store/modules/permission'
import AddAlarmCategoryModal from '/@/views/bems-web/alert/alarmManagement/components/AddAlarmCategoryModal.vue'
import AddAlarmLevelModal from '/@/views/bems-web/alert/alarmManagement/components/AddAlarmLevelModal.vue'
import AlarmRulesModal from '/@/views/bems-web/alert/alarmManagement/components/AlarmRulesModal.vue'
import {
  getAlarmCategoryPageListApi,
  deleteAlarmCategoryApi,
  enableAlarmCategoryApi,
  disableAlarmCategoryApi,
} from '/@/views/bems-web/alert/alarmManagement/Standardized.api'
import {
  getAlarmLevelPageListApi,
  deleteAlarmLevelApi,
  enableAlarmLevelApi,
  disableAlarmLevelApi,
} from '/@/views/bems-web/alert/alarmManagement/Standardized.api'
import {
  getAlarmRuleStatisticsApi,
  getAlarmRulesListApi,
  enableAlarmRuleslApi,
  disableAlarmRuleslApi,
  deleteAlarmRulesApi,
} from '/@/views/bems-web/alert/alarmManagement/Standardized.api'

// 自定义 emoji 图标组件
const AlertRulesIcon = () => h('span', { style: 'font-size: 20px;' }, '📋')
const ActiveRulesIcon = () => h('span', { style: 'font-size: 20px;' }, '✅')
const AlertTypesIcon = () => h('span', { style: 'font-size: 20px;' }, '🏷️')
const NotifyChannelIcon = () => h('span', { style: 'font-size: 20px;' }, '📢')

defineOptions({ name: 'AlertSettingPage' })

// 折叠状态
const ruleCollapsed = ref(false)
const categoryCollapsed = ref(false)
const levelCollapsed = ref(false)

const statData = ref({ count: "--", enableCount: "--", categoryCount: "--", levelCount: "--" })

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await getAlarmRuleStatisticsApi()
    if (res) {
      statData.value = {
        count: res.count ?? "--",
        enableCount: res.enableCount ?? "--",
        categoryCount: res.categoryCount ?? res.categoryCount ?? "--",
        levelCount: res.levelCount ?? res.channelCount ?? "--",
      }
    }
  } catch {
    // 静默处理
  }
}

// ===== 报警规则配置 =====
const ruleModalRef = ref()
const ruleModalType = ref('')
const ruleEditItem = ref<any>()

// 频率单位数据
const ruleUnitOption = [
  { label: '秒', value: 's' },
  { label: '分', value: 'm' },
  { label: '时', value: 'h' },
  { label: '天', value: 'd' },
]
const getRuleFrequency = (record) => {
  return record.frequency + '' + ruleUnitOption.find((item) => record.frequencyUnit === item.value)?.label
}

// 表格列配置
const ruleColumns2 = [
  { title: '编号', key: 'index', width: 80 },
  { title: '规则编号', dataIndex: 'ruleCode', key: 'ruleCode', sorter: (a, b) => (a.ruleCode || '').localeCompare(b.ruleCode || ''), sortDirections: ['ascend', 'descend'] },
  { title: '规则名称', dataIndex: 'ruleName', key: 'ruleName', sorter: (a, b) => (a.ruleName || '').localeCompare(b.ruleName || ''), sortDirections: ['ascend', 'descend'] },
  { title: '报警类型', dataIndex: 'alarmCategoryName', key: 'alarmCategoryName', sorter: (a, b) => (a.alarmCategoryName || '').localeCompare(b.alarmCategoryName || ''), sortDirections: ['ascend', 'descend'] },
  { title: '报警等级', dataIndex: 'alarmLevelName', key: 'alarmLevelName' },
  { title: '报警频率', dataIndex: 'frequency', key: 'frequency' },
  { title: '状态', dataIndex: 'enabledStatus', key: 'switchStatus', width: 80 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' },
]

// 表格数据
const ruleTableData = ref<any[]>([])
const ruleLoading = ref(false)
const ruleTotal = ref(0)
const ruleCurPage = ref(1)
const ruleCurSize = ref(10)
const rulePagination = computed(() => ruleTotal.value <= 10 ? false : { current: ruleCurPage.value, pageSize: ruleCurSize.value, total: ruleTotal.value, showSizeChanger: true })

// 加载数据
const loadRuleList = async (pageNo = 1, pageSize = 10) => {
  ruleLoading.value = true
  try {
    const params = { pageNo, pageSize }
    const res = await getAlarmRulesListApi(params)
    ruleTableData.value = (res.records || []).map((item, i) => ({ ...item, _index: (pageNo - 1) * pageSize + i + 1 }))
    ruleTotal.value = res.total || 0
    ruleCurPage.value = pageNo
    ruleCurSize.value = pageSize
  } catch (e) {
    console.error('加载报警规则失败:', e)
  } finally {
    ruleLoading.value = false
  }
}

const handleRuleTableChange = (pag: any) => {
  loadRuleList(pag.current, pag.pageSize)
}

// 新增
const addRuleStrategy = () => {
  ruleModalType.value = 'create'
  ruleModalRef.value.showModal()
}
// 编辑
const handleRuleEdit = (record) => {
  ruleEditItem.value = record
  ruleModalType.value = 'edit'
  ruleModalRef.value.showModal()
}
// 详情
const checkRuleDetail = (record) => {
  ruleEditItem.value = record
  ruleModalType.value = 'check'
  ruleModalRef.value.showModal()
}
// 关闭弹窗
const closeRuleModal = () => {
  loadRuleList(ruleCurPage.value, ruleCurSize.value)
}
// 状态切换
const handleRuleStatusChange = async (record, checked) => {
  if (checked) {
    await enableAlarmRuleslApi({ id: record.id })
  } else {
    await disableAlarmRuleslApi({ id: record.id })
  }
  loadRuleList(ruleCurPage.value, ruleCurSize.value)
}
// 删除
const handleRuleDelete = async (record) => {
  await deleteAlarmRulesApi({ id: record.id })
  loadRuleList(ruleCurPage.value, ruleCurSize.value)
}

/** 导出报警规则 */
const ruleExportLoading = ref(false)
const handleRuleExport = async () => {
  ruleExportLoading.value = true
  try {
    const res = await defHttp.get({
      url: '/sgai-fwbz-dev/fwbz/alarm/rule/export',
      responseType: 'blob',
    }, { isTransformResponse: false })
    const blobOptions = { type: 'application/vnd.ms-excel' }
    const fileSuffix = '.xlsx'
    const url = window.URL.createObjectURL(new Blob([res], blobOptions))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '报警规则配置' + fileSuffix)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出失败:', error)
  } finally {
    ruleExportLoading.value = false
  }
}

// ===== 报警类别 =====
const categoryModalRef = ref()



// 表格列
const categoryColumns = [
  { title: '编号', key: 'index', width: 80 },
  { title: '类别编号', dataIndex: 'alarmCategoryCode', key: 'alarmCategoryCode' },
  { title: '类别名称', dataIndex: 'alarmCategoryName', key: 'alarmCategoryName' },
  { title: '创建人', dataIndex: 'createBy', key: 'createBy' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', key: 'active', width: 200, fixed: 'right' },
]

// 表格数据
const categoryTableData = ref<any[]>([])
const categoryLoading = ref(false)
const categoryTotal = ref(0)
const categoryCurPage = ref(1)
const categoryCurSize = ref(10)
const categoryPagination = computed(() => categoryTotal.value <= 10 ? false : { current: categoryCurPage.value, pageSize: categoryCurSize.value, total: categoryTotal.value, showSizeChanger: true })

// 加载数据
const loadCategoryList = async (pageNo = 1, pageSize = 10) => {
  categoryLoading.value = true
  try {
    const params = { pageNo, pageSize }
    const res = await getAlarmCategoryPageListApi(params)
    categoryTableData.value = (res.records || []).map((item, i) => ({ ...item, _index: (pageNo - 1) * pageSize + i + 1 }))
    categoryTotal.value = res.total || 0
    categoryCurPage.value = pageNo
    categoryCurSize.value = pageSize
  } catch (e) {
    console.error('加载报警类别失败:', e)
  } finally {
    categoryLoading.value = false
  }
}

const handleCategoryTableChange = (pag: any) => {
  loadCategoryList(pag.current, pag.pageSize)
}

const reloadCategory = () => {
  loadCategoryList(categoryCurPage.value, categoryCurSize.value)
}

// 新增
const addAlarmCategory = () => categoryModalRef.value.showModal('create')
// 编辑
const handleCategoryEdit = (record) => categoryModalRef.value.showModal('edit', record)
// 启用
const handleCategoryEnable = async (record) => {
  await enableAlarmCategoryApi({ id: record.id })
  reloadCategory()
}
// 停用
const handleCategoryDisable = async (record) => {
  await disableAlarmCategoryApi({ id: record.id })
  reloadCategory()
}
// 删除
const handleCategoryDelete = async (record) => {
  await deleteAlarmCategoryApi({ id: record.id })
  reloadCategory()
}

/** 导出报警类别 */
const categoryExportLoading = ref(false)
const handleCategoryExport = async () => {
  categoryExportLoading.value = true
  try {
    const res = await defHttp.get({
      url: '/sgai-fwbz-dev/fwbz/alarm/category/export',
      responseType: 'blob',
    }, { isTransformResponse: false })
    const blobOptions = { type: 'application/vnd.ms-excel' }
    const fileSuffix = '.xlsx'
    const url = window.URL.createObjectURL(new Blob([res], blobOptions))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '报警类别' + fileSuffix)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出失败:', error)
  } finally {
    categoryExportLoading.value = false
  }
}

// ===== 报警级别 =====
const levelModalRef = ref()

// 表格列
const levelColumns = [
  { title: '编号', key: 'index', width: 80 },
  { title: '等级编号', dataIndex: 'alarmLevelCode', key: 'alarmLevelCode' },
  { title: '等级名称', dataIndex: 'alarmLevelName', key: 'alarmLevelName' },
  { title: '创建人', dataIndex: 'createBy', key: 'createBy' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', key: 'active', width: 200, fixed: 'right' },
]

// 表格数据
const levelTableData = ref<any[]>([])
const levelLoading = ref(false)
const levelTotal = ref(0)
const levelCurPage = ref(1)
const levelCurSize = ref(10)
const levelPagination = computed(() => levelTotal.value <= 10 ? false : { current: levelCurPage.value, pageSize: levelCurSize.value, total: levelTotal.value, showSizeChanger: true })

// 加载数据
const loadLevelList = async (pageNo = 1, pageSize = 10) => {
  levelLoading.value = true
  try {
    const params = { pageNo, pageSize }
    const res = await getAlarmLevelPageListApi(params)
    levelTableData.value = (res.records || []).map((item, i) => ({ ...item, _index: (pageNo - 1) * pageSize + i + 1 }))
    levelTotal.value = res.total || 0
    levelCurPage.value = pageNo
    levelCurSize.value = pageSize
  } catch (e) {
    console.error('加载报警级别失败:', e)
  } finally {
    levelLoading.value = false
  }
}

const handleLevelTableChange = (pag: any) => {
  loadLevelList(pag.current, pag.pageSize)
}

const reloadLevel = () => {
  loadLevelList(levelCurPage.value, levelCurSize.value)
}

// 新增
const addAlarmLevel = () => levelModalRef.value.showModal('create')
// 编辑
const handleLevelEdit = (record) => levelModalRef.value.showModal('edit', record)
// 启用
const handleLevelEnable = async (record) => {
  await enableAlarmLevelApi({ id: record.id })
  reloadLevel()
}
// 停用
const handleLevelDisable = async (record) => {
  await disableAlarmLevelApi({ id: record.id })
  reloadLevel()
}
// 删除
const handleLevelDelete = async (record) => {
  await deleteAlarmLevelApi({ id: record.id })
  reloadLevel()
}

/** 导出报警级别 */
const levelExportLoading = ref(false)
const handleLevelExport = async () => {
  levelExportLoading.value = true
  try {
    const res = await defHttp.get({
      url: '/sgai-fwbz-dev/fwbz/alarm/level/export',
      responseType: 'blob',
    }, { isTransformResponse: false })
    const blobOptions = { type: 'application/vnd.ms-excel' }
    const fileSuffix = '.xlsx'
    const url = window.URL.createObjectURL(new Blob([res], blobOptions))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '报警级别' + fileSuffix)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出失败:', error)
  } finally {
    levelExportLoading.value = false
  }
}

onMounted(() => {
  fetchStatistics()
  loadRuleList()
  loadCategoryList()
  loadLevelList()
})
</script>

<style scoped lang="less">
.alert-page { padding: 0; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 20px; }
.card {
  background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 20px; overflow: hidden;
  .card-header { padding: 18px 22px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    h3 { font-size:20px; font-weight: 600; color: #2d3748; display: flex; align-items: center; gap: 10px; margin: 0; }
  }
  .card-body { padding: 22px; }
}
.status-text { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 4px; font-size:14px; font-weight: 500;
  &.normal { background: #c6f6d5; color: #22543d; }
  &.warning { background: #feebc8; color: #744210; }
  &.danger { background: #fed7d7; color: #742a2a; }
  &.info { background: #bee3f8; color: #2a4365; }
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size:14px;
  color: #666;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
}
</style>