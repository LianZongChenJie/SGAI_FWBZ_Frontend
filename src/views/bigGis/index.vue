<template>
  <div class="big-gis-page">
    <MapView ref="mapViewRef" />
    
    <!-- 左上角控制面板 -->
    <div class="top-left-controls">
      <!-- 控制开关按钮 - 带指示灯 -->
      <button 
        class="control-toggle-btn" 
        :class="{ 'is-active': showControlPanel }"
        @click="showControlPanel = !showControlPanel"
      >
        <!-- 小图标 -->
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke-linejoin="round" stroke-linecap="round"></path>
        </svg>
        <span class="toggle-text">整体管控</span>
      </button>
      
      <!-- 控制面板面板 -->
      <div v-if="showControlPanel" class="control-panel">
        <div class="panel-body">
          <!-- 回路模块 -->
          <div class="module-card stat-section">
            <div class="section-title">回路</div>
            <div class="stat-row">
              <span class="stat-label">回路已开/回路总数</span>
              <span class="stat-value">
                <span class="number highlight-text">{{ circuitStats.active }}</span> 
                / 
                <span class="number">{{ circuitStats.total }}</span>
              </span>
            </div>
          </div>
          
          <!-- 一键开关模块 -->
          <div class="module-card action-section">
            <div class="section-title">一键开关</div>
            <div class="mini-action-group">
              <button class="icon-btn with-text" @click="handleAllOn" title="全开">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                <span class="btn-text">全开</span>
              </button>
              <button class="icon-btn dark-btn with-text" @click="handleAllOff" title="全关">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <span class="btn-text">全关</span>
              </button>
            </div>
          </div>
          
          <!-- 场景列表模块 -->
          <div class="module-card space-section">
            <div class="section-title">场景列表</div>
            <div class="space-list-scroll-container">
              <div class="space-list">
                <div 
                  v-for="(scene, index) in sceneList" 
                  :key="index"
                  class="space-item-row"
                  @click="selectScene(scene.id)"
                >
                  <span class="scene-indicator-icon" :style="{ backgroundColor: scene.color }"></span>
                  <div class="item-info">
                    <span class="item-name">{{ scene.name }}</span>
                  </div>
                  <button class="detail-btn" @click.stop="showSceneDetail(scene)">详情</button>
                  <div class="scene-btn-group">
                    <button class="scene-action-btn on-btn" @click.stop="handleSceneOn(scene)">开</button>
                    <button class="scene-action-btn off-btn" @click.stop="handleSceneOff(scene)">关</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 场景详情弹窗 -->
    <SceneDetailModal ref="sceneDetailModalRef" :map-view-ref="mapViewRef" />
    
    <!-- 右上角统计面板 -->
    <div class="top-right-controls">
      <button class="stats-toggle-btn" @click="toggleStatsPanel" title="查看统计数据">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="12" width="4" height="9" rx="1"/>
          <rect x="10" y="8" width="4" height="13" rx="1"/>
          <rect x="17" y="3" width="4" height="18" rx="1"/>
        </svg>
        <span class="toggle-label">统计</span>
      </button>
      
      <div v-if="showStatsPanel" class="stats-panel">
        <!-- 各地块运行时长（本月）- 柱状图 -->
        <div class="chart-section bar-chart-section">
          <h4>🎯 各地块运行时长（本月）</h4>
          <div class="bar-chart-container">
            <div class="bar-item" v-for="(item, idx) in runtimeData" :key="idx">
              <div class="bar-wrapper">
                <div 
                  class="bar-fill" 
                  :style="{ height: item.height + '%', backgroundColor: item.color }"
                ></div>
                <span class="bar-value">{{ item.value }}</span>
              </div>
              <span class="bar-label">{{ item.label }}</span>
            </div>
          </div>
        </div>
        
        <!-- 运行时长按对拜 - 数据表格 -->
        <div class="table-section runtime-table">
          <h4>📊 运行时长按对比</h4>
          <table>
            <thead>
              <tr>
                <th>地块</th>
                <th>回路数</th>
                <th>总运行时久</th>
                <th>平均时长</th>
                <th>同比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in runtimeTableData" :key="idx">
                <td>{{ item.area }}</td>
                <td>{{ item.circuits }}</td>
                <td>{{ item.total }} h</td>
                <td>{{ item.avg }}</td>
                <td :class="item.change >= 0 ? 'change-positive' : 'change-negative'">
                  {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 地块列表面板 -->
    <div v-if="showSpacePanel" class="space-panel">
      <div class="panel-header">
        <h3>地块列表</h3>
        <button class="close-btn" @click="showSpacePanel = false">✕</button>
      </div>
      <div class="panel-body">
        <div 
          v-for="(space, index) in spaceList" 
          :key="index"
          class="space-item"
          @click="selectSpace(space.name)"
        >
          <span class="space-color" :style="{ backgroundColor: space.color }"></span>
          <span class="space-name">{{ space.name }}</span>
        </div>
      </div>
    </div>
    
    <!-- 底部控制按钮组 -->
    <div class="bottom-controls">
      <button 
        class="ctrl-btn"
        :class="{ 'is-active': activeMode === 'area' }"
        @click="handleShowArea"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>地块模式</span>
      </button>
      
      <button 
        class="ctrl-btn"
        :class="{ 'is-active': activeMode === 'detail' }"
        @click="handleShowDetails"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>详情模式</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MapView from './map.vue'
import SceneDetailModal from './components/SceneDetailModal.vue'
import { getAllCircuitApi, getAreaRunStatusApi, getAllSpaceApi, getRunTimeCompareApi } from '../comprehensivePreview/comprehensivePreview.api'
import { getLightingPlanAPiNew, postSceneSwitchApi } from '@/api/equipmentMonitoring'
import { message, Modal } from 'ant-design-vue'

const mapViewRef = ref<any>(null)
const sceneDetailModalRef = ref<any>(null)
const showSpacePanel = ref(false)
const showControlPanel = ref(false)
const showStatsPanel = ref(false)  // 统计面板开关
const activeMode = ref<'area' | 'detail' | null>(null)  // 当前激活模式

// 统计数据 - 各地块运行时长（本月）柱状图 - 科技蓝主题（由接口填充）
const runtimeData = ref<any[]>([])

// 运行时按下对拜 - 数据表格（由接口填充）
const runtimeTableData = ref<any[]>([])

// 所有地块 ID 列表（用于运行时长查询）
const allSpaceIdList = ref<string[]>([])
const spaceList = ref<any[]>([])
const sceneList = ref<any[]>([])  // 场景配置列表

// 照明控制相关数据
const circuitStats = ref({
  total: 0,      // 总回路数
  active: 0,     // 已开启回路数
  offline: 0,    // 离线回路数
  alert: 0       // 告警回路数
})

// "地块模式"按钮 - 绘制地块边框，清除标点
function handleShowArea() {
  console.log('地块模式按钮点击')
  
  // 切换激活状态（再点一次取消）
  activeMode.value = activeMode.value === 'area' ? null : 'area'
  
  // 先清除所有绘制（包括标点、地块边框、标记点等）
  if (mapViewRef.value?.clearAllDrawings) {
    mapViewRef.value.clearAllDrawings()
    console.log('已清除地图上的所有绘制')
  }
  
  // 激活时绘制地块边框
  if (activeMode.value === 'area' && mapViewRef.value?.drawAllSpacesExceptNorth) {
    mapViewRef.value.drawAllSpacesExceptNorth()
    console.log('已添加地块边框')
  }
}

// 一键全开
function handleAllOn() {
  console.log('一键全开')
  spaceList.value.forEach(space => {
    space.enabled = true
  })
  // TODO: 调用 API 实现一键全开
  fetchCircuitStats() // 刷新数据
}

// 一键全关
function handleAllOff() {
  console.log('一键全关')
  spaceList.value.forEach(space => {
    space.enabled = false
  })
  // TODO: 调用 API 实现一键全关
  fetchCircuitStats() // 刷新数据
}

// 获取回路统计数据 - 参考综合预览逻辑
async function fetchCircuitStats() {
  try {
    const circuitData = await getAllCircuitApi()
    
    console.log('回路数据:', circuitData)
    
    // 解析回路总数
    if (circuitData && Array.isArray(circuitData)) {
      circuitStats.value.total = circuitData.length
      
      // 参考综合预览：统计 status === '开启' 的回路数
      const openCircuits = circuitData.filter((c: any) => c.status === '开启')
      circuitStats.value.active = openCircuits.length
      
      console.log(`回路初始化完成 - 总数: ${circuitStats.value.total}, 开启: ${circuitStats.value.active}`)
    } else if (circuitData && typeof circuitData === 'object') {
      circuitStats.value.total = circuitData.total || circuitData.count || circuitData.length || 0
      // 如果对象中有 status 字段，也可以尝试解析
      circuitStats.value.active = circuitData.open || circuitData.active || 0
    }
    
    console.log('最终回路统计:', circuitStats.value)
  } catch (error) {
    console.error('获取回路统计数据失败:', error)
    // 设置默认值
    circuitStats.value = {
      total: 0,
      active: 0,
      offline: 0,
      alert: 0
    }
  }
}

// 初始化地块列表（从 JSON 文件读取并分配颜色）
function initSpaceList() {
  import('./space-boundaries.json').then((module) => {
    const data = module.default || module
    const colors = [
      'rgba(251, 146, 60, 0.9)',   // 橙色 - 大跳台区域
      'rgba(104, 211, 145, 0.9)',  // 绿色 - 服贸会区域
      'rgba(245, 158, 11, 0.9)',   // 黄色 - 六工汇区域
      'rgba(167, 139, 250, 0.9)',  // 紫色 - 秀池及周边区域
      'rgba(244, 63, 94, 0.9)',    // 玫红色 - 永定河
    ]
    
    // 过滤掉“首钢园北区”（总面积块，无意义）
    const filteredData = (data as any[]).filter((space: any) => space.name !== '首钢园北区')
    
    spaceList.value = filteredData.map((space: any, index: number) => ({
      name: space.name,
      path: space.path,
      color: colors[index % colors.length],
      enabled: false  // 默认关闭
    }))
    
    console.log('地块列表已初始化:', spaceList.value.length, '个地块（已过滤首钢园北区）')
  }).catch(error => {
    console.error('加载地块数据失败:', error)
  })
}

// 获取所有地块 ID（用于运行时长查询）
async function fetchAllSpaceIds() {
  try {
    const res: any = await getAllSpaceApi()
    const list = Array.isArray(res) ? res : []
    allSpaceIdList.value = list.map((item: any) => item.spaceId || item.id).filter(Boolean)
    console.log('所有地块 ID:', allSpaceIdList.value)
    return allSpaceIdList.value
  } catch (error) {
    console.error('获取地块 ID 失败:', error)
    return []
  }
}

// 获取各地块运行时长对比（本月）
async function fetchRunTimeCompare() {
  try {
    // 确保地块 ID 已加载
    if (allSpaceIdList.value.length === 0) {
      await fetchAllSpaceIds()
    }
    if (allSpaceIdList.value.length === 0) {
      console.warn('无地块 ID，跳过运行时长查询')
      return
    }

    // 计算本月起止时间
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const lastDay = new Date(year, month + 1, 0).getDate()
    const startTime = `${year}-${String(month + 1).padStart(2, '0')}-01 00:00:00`
    const endTime = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay} 23:59:59`

    // 手动拼接查询字符串，避免 axios 数组序列化为 areaIds[] 导致 Tomcat 报错
    const areaQuery = allSpaceIdList.value.map((id) => `areaIds=${encodeURIComponent(id)}`).join('&')
    const queryStr =
      `?${areaQuery}` +
      `&startTime=${encodeURIComponent(startTime)}` +
      `&endTime=${encodeURIComponent(endTime)}`

    const res: any = await getRunTimeCompareApi(queryStr)

    console.log('运行时长对比数据:', res)

    const data = Array.isArray(res) ? res : res?.result || res?.data || []
    if (!Array.isArray(data)) {
      console.warn('运行时长返回数据格式异常:', data)
      return
    }

    // 柱状图颜色
    const colors = [
      'rgba(0, 200, 255, 0.85)',
      'rgba(0, 180, 255, 0.85)',
      'rgba(0, 160, 255, 0.85)',
      'rgba(0, 140, 255, 0.85)',
      'rgba(0, 120, 255, 0.85)'
    ]

    // 计算最大时长用于柱状图高度
    const totals = data.map((item: any) => Number(item.totalRunTime ?? item.total ?? item.runTime ?? 0))
    const maxTotal = Math.max(...totals, 1)

    // 填充柱状图数据
    runtimeData.value = data.map((item: any, index: number) => {
      const total = Number(item.totalRunTime ?? item.total ?? item.runTime ?? 0)
      const height = Math.round((total / maxTotal) * 98)
      return {
        label: item.spaceName || item.areaName || item.name || '未知',
        value: formatRuntime(total),
        height,
        color: colors[index % colors.length]
      }
    })

    // 填充表格数据
    runtimeTableData.value = data.map((item: any) => ({
      area: item.spaceName || item.areaName || item.name || '-',
      circuits: item.circuitCount ?? item.circuits ?? 0,
      total: formatRuntime(Number(item.totalRunTime ?? item.total ?? item.runTime ?? 0)),
      avg: item.avgRunTime != null ? `${item.avgRunTime} h/日` : '-',
      change: Number(item.yoy ?? item.change ?? item.changeRate ?? 0)
    }))
  } catch (error) {
    console.error('获取运行时长对比失败:', error)
  }
}

// 格式化运行时长：小时转 "x.yk" 或 "x,xxx"
function formatRuntime(hours: number) {
  if (!hours && hours !== 0) return '0'
  if (hours >= 1000) return (hours / 1000).toFixed(1) + 'k'
  return hours.toLocaleString()
}

// 统计面板开关（展开时刷新数据）
function toggleStatsPanel() {
  showStatsPanel.value = !showStatsPanel.value
  if (showStatsPanel.value) {
    fetchRunTimeCompare()
  }
}

// 选择地块并绘制边框（粗红线）
function selectSpace(spaceName: string) {
  console.log('选择地块:', spaceName)
  
  // 调用地图组件，用粗红线绘制该地块边框
  mapViewRef.value?.highlightSpaceBySelected?.(spaceName)
  
  // 关闭面板
  showSpacePanel.value = false
}

// 选择场景并绘制边框
function selectScene(sceneId: string) {
  console.log('选择场景:', sceneId)
  const scene = sceneList.value.find(s => s.id === sceneId)
  if (scene) {
    // TODO: 根据场景ID绘制对应的地块边框
    console.log('场景信息:', scene)
  }
}

// 显示场景详情
async function showSceneDetail(scene: any) {
  console.log('查看场景详情:', scene)
  console.log('场景 ID:', scene.id)
  
  // 先清除地图上的所有绘制（包括地块边框、标点等）
  if (mapViewRef.value?.clearAllDrawings) {
    mapViewRef.value.clearAllDrawings()
    console.log('✓ 已清除地图上的所有绘制')
  } else {
    console.warn('⚠️ mapViewRef 或 clearAllDrawings 不存在')
  }
  
  // 额外检查：直接调用 clearLightingMarkers 确保标点也被清除
  if (mapViewRef.value?.clearLightingMarkers) {
    mapViewRef.value.clearLightingMarkers()
    console.log('✓ 已额外清除灯光标点')
  }
  
  // 打开详情弹窗（显示表格数据）
  sceneDetailModalRef.value?.showDetail(scene)
}

// 场景开/关通用操作
async function handleSceneAction(scene: any, action: '开启' | '关闭') {
  const actionText = action === '开启' ? '开' : '关'
  return new Promise<void>((resolve, reject) => {
    Modal.confirm({
      title: '确认操作',
      content: `确定要${actionText}场景“${scene.name}”吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await postSceneSwitchApi({
            operationType: action,
            relIds: scene.relIds || scene.id,
            relType: scene.relType || '回路'
          })
          message.success(`${actionText}成功`)
          scene.enabled = action === '开启'
          await fetchCircuitStats()
          resolve()
        } catch (error) {
          console.error(`场景${actionText}失败:`, error)
          message.error('操作失败，请重试')
          reject(error)
        }
      },
      onCancel: () => {
        resolve()
      }
    })
  })
}

// 场景开启
function handleSceneOn(scene: any) {
  return handleSceneAction(scene, '开启')
}

// 场景关闭
function handleSceneOff(scene: any) {
  return handleSceneAction(scene, '关闭')
}

// 切换场景状态（开/关）
async function toggleScene(scene: any) {
  console.log('切换场景:', scene.name, scene.enabled ? '开启' : '关闭')
  
  // 二次确认
  const action = scene.enabled ? '开启' : '关闭'
  
  return new Promise<void>((resolve, reject) => {
    Modal.confirm({
      title: '确认操作',
      content: `确定要${action}场景“${scene.name}”吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 调用开关场景API
          await postSceneSwitchApi({
            operationType: scene.enabled ? '开启' : '关闭',
            relIds: scene.relIds || scene.id,
            relType: scene.relType || '回路'
          })
          
          message.success(`${action}成功`)
          
          // 刷新回路统计
          await fetchCircuitStats()
          resolve()
        } catch (error) {
          console.error('场景切换失败:', error)
          message.error('操作失败，请重试')
          // 恢复状态
          scene.enabled = !scene.enabled
          reject(error)
        }
      },
      onCancel: () => {
        // 用户取消，恢复状态
        scene.enabled = !scene.enabled
        resolve()
      }
    })
  })
}

// 获取场景配置列表
async function fetchSceneList() {
  try {
    const params = {
      pageNo: 1,
      pageSize: 999  // 获取所有场景
    }
    
    const data = await getLightingPlanAPiNew(params)
    console.log('场景列表数据:', data)
    
    if (data?.records && Array.isArray(data.records)) {
      const iconMap: Record<string, string> = {
        '开启': '#52c41a',
        '关闭': '#ff4d4f',
      }
      
      sceneList.value = data.records.map((item: any) => {
        const relCount = item.relIds ? item.relIds.split(',').length : 0
        
        // 获取地块/区域名称（使用areaName或spaceName）
        let areaName = '-'
        if (item.areaName) {
          areaName = item.areaName
        } else if (item.spaceName) {
          areaName = item.spaceName
        }
        
        console.log(`场景 [${item.planName}] 数据:`, {
          areaName: item.areaName,
          spaceName: item.spaceName,
          解析后的areaName: areaName
        })
        
        return {
          ...item,
          id: item.id,
          name: item.planName || '',
          color: iconMap[item.operationType] || '#38bdf8',
          circuitCount: relCount,
          desc: `控制类型 · ${item.relType || '-'}`,
          spaceName: areaName,  // 地块/区域名称
          relType: item.relType,
          enabled: false,  // 默认关闭
          relIds: item.relIds,
        }
      })
      
      console.log(`已加载 ${sceneList.value.length} 个场景`, sceneList.value)
    }
  } catch (error) {
    console.error('获取场景列表失败:', error)
    message.error('获取场景列表失败')
  }
}

// "详情模式"按钮 - 显示所有标点，清除地块
function handleShowDetails() {
  console.log('详情模式按钮点击')
  
  // 切换激活状态（再点一次取消）
  activeMode.value = activeMode.value === 'detail' ? null : 'detail'
  
  // 先清除地块绘制（如果存在）
  if (mapViewRef.value?.clearAllDrawings) {
    mapViewRef.value.clearAllDrawings()
    console.log('已清除地图上的地块绘制')
  }
  
  // 激活时添加标点（数据已在初始化时加载）
  if (activeMode.value === 'detail' && mapViewRef.value?.AddLightingMarker) {
    mapViewRef.value.AddLightingMarker()
    console.log('✅ 已添加标点')
  }
}

onMounted(() => {
  console.log('页面已挂载')
  // 初始化时获取回路统计数据
  fetchCircuitStats()
  // 获取场景配置列表
  fetchSceneList()
  // 获取各地块运行时长对比
  fetchRunTimeCompare()
})
</script>

<style scoped>
.big-gis-page {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0f172a;
  /* 修复地图滚动问题：允许滚轮事件穿透 */
  overflow: visible;
}

/* 底部居中控制按钮 */
.bottom-controls {
  position: absolute;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  z-index: 60000;  /* 高于地图标点，确保不被遮挡 */
  display: flex;
  gap: 12px;
}

.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 10px 16px;
  min-width: 104px;
  background: linear-gradient(135deg, rgba(0, 200, 255, 0.6) 0%, rgba(0, 130, 255, 0.55) 100%);
  border: 1.5px solid rgba(0, 240, 255, 0.85);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 
    0 4px 20px rgba(0, 180, 255, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  text-shadow: 0 0 8px rgba(0, 217, 255, 0.7);
}

/* 外边框光晕层 */
.ctrl-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(0, 217, 255, 0.2) 0%,
    rgba(0, 150, 255, 0.1) 100%
  );
  opacity: 0.5;
}

/* 内发光和高光层 */
.ctrl-btn::after {
  content: '';
  position: absolute;
  inset: 1px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15) 0%, 
    rgba(255, 255, 255, 0) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  pointer-events: none;
}

/* 图标样式 */
.ctrl-btn svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 6px rgba(0, 217, 255, 0.5));
}

/* Hover 效果 */
.ctrl-btn:hover {
  background: linear-gradient(135deg, rgba(0, 220, 255, 0.75) 0%, rgba(0, 160, 255, 0.7) 100%);
  border-color: rgba(0, 240, 255, 1);
  transform: translateY(-3px);
  box-shadow: 
    0 8px 28px rgba(0, 180, 255, 0.65),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.ctrl-btn:hover::before {
  opacity: 1;
}

.ctrl-btn:hover svg {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 12px rgba(0, 217, 255, 0.8));
}

/* 激活状态 - 高亮效果 */
.ctrl-btn.is-active {
  background: linear-gradient(135deg, rgba(0, 220, 255, 0.9) 0%, rgba(0, 160, 255, 0.85) 100%);
  border-color: rgba(255, 255, 255, 0.9);
  color: #fff;
  box-shadow: 
    0 6px 26px rgba(0, 220, 255, 0.75),
    0 0 16px rgba(0, 220, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.ctrl-btn.is-active::before {
  opacity: 1;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(0, 220, 255, 0.15) 100%);
}

.ctrl-btn.is-active svg {
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 16px rgba(0, 220, 255, 1));
  transform: scale(1.05);
}

/* 左上角控制按钮 */
.top-left-controls {
  position: absolute;
  left: 20px;
  top: 90px;  /* 调整位置：从20px改为90px */
  z-index: 60000;  /* 高于地图标点（最高50000），确保不被遮挡 */
}

/* 控制开关按钮 - 矩形风格 */
.control-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.85) 0%, rgba(0, 20, 40, 0.75) 100%);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 150, 255, 0.4);
  border-radius: 6px;
  color: #00d9ff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 
    0 4px 16px rgba(0, 100, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.control-toggle-btn .toggle-text {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: 0.5px;
  text-shadow: 0 0 8px rgba(0, 217, 255, 0.6);
}

.control-toggle-btn svg {
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px rgba(0, 217, 255, 0.6));
}

/* 指示灯 - 未激活时暗淡 */
.control-toggle-btn .indicator-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: none;
}

/* Hover效果 */
.control-toggle-btn:hover {
  background: linear-gradient(135deg, rgba(0, 40, 80, 0.9) 0%, rgba(0, 30, 60, 0.85) 100%);
  border-color: rgba(0, 217, 255, 0.6);
  box-shadow: 
    0 6px 24px rgba(0, 150, 255, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* 激活状态 - 指示灯亮起 */
.control-toggle-btn.is-active {
  background: linear-gradient(135deg, rgba(0, 40, 80, 0.9) 0%, rgba(0, 30, 60, 0.85) 100%);
  border-color: rgba(0, 217, 255, 0.7);
  color: #00d9ff;
}

.control-toggle-btn.is-active .indicator-dot {
  background: #00d9ff;
  box-shadow: 0 0 8px rgba(0, 217, 255, 0.8), 0 0 4px rgba(0, 217, 255, 1);
}

/* Click效果 */
.control-toggle-btn:active {
  transform: translateY(0);
}

/* 控制面板面板 */
.control-panel {
  position: absolute;
  left: 0;
  top: 55px;  /* 相对于父容器，确保在图标下方 */
  width: 280px;  /* 缩小宽度 */
  z-index: 60000;  /* 高于地图标点，确保不被遮挡 */
  max-height: calc(100vh - 70px);
  background: rgba(10, 22, 40, 0.7);  /* 提高不透明度 */
  border: 1px solid rgba(56, 189, 248, 0.35);  /* 边框透明度提高 */
  border-radius: 4px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(56, 189, 248, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 紧凑状态栏 - 直接显示统计信息，无标题 */
.stat-bar.compact {
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.05), rgba(16, 185, 129, 0.03));  /* 更低透明度 */
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.stat-bar .stat-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  line-height: 1.4;
  flex: 1;
  white-space: nowrap;
}

.stat-bar .stat-text .highlight {
  color: #38bdf8;
  font-weight: 600;
}

.close-btn-small {
  width: 22px;
  height: 22px;
  min-width: 22px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  color: #ef4444;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-btn-small:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}

.control-panel .panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.control-panel .panel-body::-webkit-scrollbar {
  width: 6px;
}

.control-panel .panel-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.control-panel .panel-body::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.3);
  border-radius: 3px;
}

/* 面板头部 */
.panel-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;  /* 减小内边距 */
  background: transparent;  /* 移除渐变背景 */
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #38bdf8;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.close-btn-small {
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.08);  /* 透明度从 0.05 提高到 0.08 */
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.close-btn-small:hover {
  background: rgba(255, 77, 77, 0.2);
  border-color: rgba(255, 77, 77, 0.4);
  color: #ff6b6b;
}

/* 面板主体 */
.panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  overflow-y: auto;
}

/* 三个独立模块卡片 - 统一风格 */
.module-card {
  background: rgba(0, 30, 60, 0.5);
  border: 1px solid rgba(0, 150, 255, 0.2);
  border-radius: 6px;
  padding: 10px 12px;
  position: relative;
  overflow: hidden;
}

/* 模块顶部高光线 */
.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.4), transparent);
}

/* 覆盖原有的 stat-section / action-section 透明样式 */
.stat-section.module-card {
  background: rgba(0, 30, 60, 0.5);
  border: 1px solid rgba(0, 150, 255, 0.2);
  border-radius: 6px;
  padding: 10px 12px;
}

.action-section.module-card {
  background: rgba(0, 30, 60, 0.5);
  border: 1px solid rgba(0, 150, 255, 0.2);
  border-radius: 6px;
  padding: 10px 12px;
}

.space-section.module-card {
  background: rgba(0, 30, 60, 0.5);
  border: 1px solid rgba(0, 150, 255, 0.2);
  border-radius: 6px;
  padding: 10px 12px;
}

/* 统计区域 */
.stat-section {
  background: transparent;  /* 完全透明 */
  border: none;  /* 移除边框 */
  border-radius: 0;
  padding: 8px 12px;  /* 减小内边距 */
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  color: rgba(0, 217, 255, 0.7);  /* 青色 */
  font-size: 12px;
  font-weight: 500;
}

.stat-value {
  color: #00d9ff;  /* 青色亮色 */
  font-size: 14px;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(0, 217, 255, 0.6);
}

.highlight-text {
  color: #00d9ff;  /* 青色高亮 */
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 217, 255, 0.8);
}

.number {
  font-variant-numeric: tabular-nums;
}

/* 一键操作区域 */
.action-section {
  background: transparent;  /* 完全透明 */
  border: none;  /* 移除边框 */
  border-radius: 0;
  padding: 6px 0;  /* 简化间距 */
}

.mini-action-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.icon-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;  /* 调整内边距 */
  background: rgba(56, 189, 248, 0.15);  /* 稍微提高 */
  border: 1px solid rgba(56, 189, 248, 0.3);  /* 恢复边框 */
  border-radius: 4px;  /* 参考图的小圆角 */
  color: #38bdf8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn.with-text {
  width: auto;
  min-width: 56px;
}

.icon-btn .btn-text {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.icon-btn:hover {
  background: rgba(56, 189, 248, 0.2);
  border-color: rgba(56, 189, 248, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.2);
}

.icon-btn:active {
  transform: translateY(0);
}

.dark-btn {
  background: rgba(100, 100, 100, 0.25);  /* 从 0.2 提高到 0.25 */
  border-color: rgba(100, 100, 100, 0.35);  /* 从 0.3 提高到 0.35 */
  color: rgba(255, 255, 255, 0.8);
}

.dark-btn:hover {
  background: rgba(150, 150, 150, 0.25);
  border-color: rgba(150, 150, 150, 0.4);
}

/* 地块列表区域 */
.space-section {
  flex: 1;
  min-height: 0;
}

.section-title {
  color: #00d9ff;  /* 青色，科技发光 */
  font-size: 13px;
  font-weight: 600;
  padding: 0 0 8px 8px;
  margin-bottom: 8px;
  border-left: 2px solid rgba(0, 150, 255, 0.6);
  text-transform: none;
  letter-spacing: normal;
  text-shadow: 0 0 8px rgba(0, 217, 255, 0.6);
  border-bottom: 1px dashed rgba(0, 150, 255, 0.2);
}

/* 虚拟滚动容器 - 限制高度，支持滚动 */
.space-list-scroll-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  max-height: 320px;  /* 限制最大高度 */
  padding-right: 4px;  /* 留出滚动条空间 */
}

/* 自定义滚动条 - 科技感 */
.space-list-scroll-container::-webkit-scrollbar {
  width: 5px;
}

.space-list-scroll-container::-webkit-scrollbar-track {
  background: rgba(0, 30, 60, 0.2);
  border-radius: 3px;
}

.space-list-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.4);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.space-list-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 200, 255, 0.6);
}

.space-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.space-item-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 6px;  /* 减小高度和左右内边距 */
  background: transparent;  /* 完全透明 */
  border: none;  /* 移除边框 */
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.space-item-row:hover {
  background: rgba(56, 189, 248, 0.15);  /* 更明显的 hover 效果 */
  border-color: transparent;
  transform: translateX(3px);  /* 增强左移效果 */
}

.space-item-row:active {
  transform: translateX(0);
}

.space-indicator {
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.scene-indicator-icon {
  width: 10px;
  height: 10px;
  min-width: 10px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.item-name {
  color: #00d9ff;  /* 青色科技感 */
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 0 6px rgba(0, 217, 255, 0.5);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-space {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-space.empty {
  color: rgba(255, 255, 255, 0.2);
}

.scene-info {
  color: #00d9ff;  /* 青色 */
  font-size: 11px;
  font-weight: 500;
  margin-right: 8px;
  flex-shrink: 0;
  text-shadow: 0 0 4px rgba(0, 217, 255, 0.4);
}

/* 详情按钮 */
.detail-btn {
  padding: 3px 6px;
  height: auto;
  min-width: 30px;
  background: rgba(0, 80, 150, 0.2);
  border: 1px solid rgba(0, 150, 255, 0.4);
  border-radius: 4px;
  color: #00d9ff;  /* 青色 */
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-right: 4px;
  text-shadow: 0 0 6px rgba(0, 217, 255, 0.5);
}

.detail-btn:hover {
  background: rgba(56, 189, 248, 0.2);
  border-color: rgba(56, 189, 248, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.15);
}

/* 场景开/关按钮组 */
.scene-btn-group {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.scene-action-btn {
  padding: 3px 7px;
  height: auto;
  min-width: 24px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.scene-action-btn.on-btn {
  background: rgba(0, 200, 120, 0.15);
  border: 1px solid rgba(0, 200, 120, 0.4);
  color: #00e676;
}

.scene-action-btn.on-btn:hover {
  background: rgba(0, 200, 120, 0.3);
  border-color: rgba(0, 200, 120, 0.6);
  box-shadow: 0 0 10px rgba(0, 200, 120, 0.3);
}

.scene-action-btn.off-btn {
  background: rgba(255, 80, 80, 0.15);
  border: 1px solid rgba(255, 80, 80, 0.4);
  color: #ff5252;
}

.scene-action-btn.off-btn:hover {
  background: rgba(255, 80, 80, 0.3);
  border-color: rgba(255, 80, 80, 0.6);
  box-shadow: 0 0 10px rgba(255, 80, 80, 0.3);
}

/* 现代开关 - 更简洁 */
.toggle-switch {
  position: relative;
  width: 42px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: rgba(255, 255, 255, 0.08);  /* 更低透明度 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-slider:before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background: rgba(255, 255, 255, 0.5);  /* 更淡的滑块 */
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background: rgba(56, 189, 248, 0.3);  /* 更柔和的开启色 */
  border-color: rgba(56, 189, 248, 0.5);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(18px);
  background: #38bdf8;  /* 开启时显示蓝色 */
  box-shadow: 0 2px 8px rgba(56, 189, 248, 0.5);
}

/* 地块列表面板 */
.space-panel {
  position: absolute;
  right: 20px;
  top: 80px;
  width: 280px;
  max-height: calc(100vh - 200px);
  background: rgba(10, 22, 40, 0.95);
  border: 1px solid rgba(56, 189, 248, 0.4);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.2);
  z-index: 60000;  /* 高于地图标点，确保不被遮挡 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(16, 185, 129, 0.1));
  border-bottom: 1px solid rgba(56, 189, 248, 0.3);
}

.panel-header h3 {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.close-btn {
  width: 28px;
  height: 28px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 4px;
  color: #ef4444;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.4);
  transform: scale(1.1);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.panel-body::-webkit-scrollbar {
  width: 6px;
}

.panel-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.panel-body::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.3);
  border-radius: 3px;
}

.panel-body::-webkit-scrollbar-thumb:hover {
  background: rgba(56, 189, 248, 0.5);
}

.space-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px;
  margin-bottom: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.space-item:hover {
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.3);
  transform: translateX(-4px);
  box-shadow: 0 2px 8px rgba(56, 189, 248, 0.15);
}

.space-item:active {
  transform: translateX(-2px);
}

.space-color {
  width: 12px;
  height: 12px;
  min-width: 12px;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.space-name {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
}

/* ========== 右上角统计面板 - 科技蓝主题 ========== */
.top-right-controls {
  position: absolute;
  top: 90px;  /* 与左上角整体管控按钮对齐 */
  right: 24px;
  z-index: 60000;  /* 高于地图标点（最高50000），确保统计面板不被遮挡 */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

/* 统计切换按钮 - 精致科技风 */
.stats-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.85) 0%, rgba(0, 20, 40, 0.75) 100%);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 150, 255, 0.4);
  border-radius: 6px;
  color: #00d9ff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 16px rgba(0, 100, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-shadow: 0 0 8px rgba(0, 217, 255, 0.6);
}

.stats-toggle-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(0, 200, 255, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.stats-toggle-btn:hover {
  background: linear-gradient(135deg, rgba(0, 40, 80, 0.9) 0%, rgba(0, 30, 60, 0.85) 100%);
  border-color: rgba(0, 217, 255, 0.6);
  box-shadow: 
    0 6px 24px rgba(0, 150, 255, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.stats-toggle-btn:hover::before {
  opacity: 1;
}

.stats-toggle-btn:active {
  transform: translateY(0);
}

.stats-toggle-btn svg {
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px rgba(0, 217, 255, 0.6));
}

.toggle-label {
  white-space: nowrap;
  letter-spacing: 0.5px;
}

/* 统计面板 - 高透深蓝主题（15%不透明度） */
.stats-panel {
  width: 400px;  /* 宽度从520px减小到400px */
  max-height: 560px;
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(2, 18, 38, 0.15) 0%, rgba(0, 12, 28, 0.12) 100%);  /* 大幅降低不透明度：85-88% → 12-15% */
  backdrop-filter: blur(6px) saturate(100%);  /* 减弱模糊效果 */
  border: 1px solid rgba(0, 150, 255, 0.2);  /* 降低边框透明度 */
  border-radius: 6px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 150, 255, 0.05);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 滚动条美化 */
.stats-panel::-webkit-scrollbar {
  width: 6px;
}

.stats-panel::-webkit-scrollbar-track {
  background: rgba(0, 30, 60, 0.2);
  border-radius: 3px;
}

.stats-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.4);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.stats-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 200, 255, 0.6);
}

/* 图表区域通用样式 - 科技感 */
.chart-section,
.table-section {
  background: rgba(0, 30, 60, 0.15);
  border: 1px solid rgba(0, 150, 255, 0.15);
  border-radius: 6px;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.chart-section::before,
.table-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.3), transparent);
}

.chart-section h4,
.table-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #00d9ff;
  text-shadow: 0 0 12px rgba(0, 217, 255, 0.5);
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.chart-section h4::before,
.table-section h4::before {
  content: '';
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, #00d9ff, #0088ff);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(0, 217, 255, 0.6);
}

/* 柱状图区域 - 优化宽度 */
.bar-chart-section {
  min-height: 200px;
}

.bar-chart-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 150px;
  padding: 0 4px;
  gap: 8px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 70px;  /* 限制每个条目的最大宽度 */
}

.bar-wrapper {
  position: relative;
  width: 100%;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.bar-fill {
  width: 36px;  /* 柱体宽度从48px减小到36px */
  min-width: 32px;
  background: linear-gradient(180deg, rgba(0, 200, 255, 0.9) 0%, rgba(0, 100, 255, 0.7) 100%);
  border-radius: 4px 4px 0 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 0 12px rgba(0, 150, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
}

.bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  border-radius: 4px 4px 0 0;
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 217, 255, 0.6);
  white-space: nowrap;
}

.bar-label {
  font-size: 12px;  /* 字体从13px减小到12px */
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);  /* 提高一点颜色亮度 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;  /* 不换行 */
}

/* 运行时长按对比表格 - 精致科技风 */
.runtime-table {
  overflow-x: auto;
}

.runtime-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

.runtime-table thead th {
  background: linear-gradient(180deg, rgba(0, 80, 150, 0.4) 0%, rgba(0, 50, 100, 0.25) 100%);
  color: rgba(0, 217, 255, 0.95);
  padding: 12px 10px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid rgba(0, 150, 255, 0.35);
  text-shadow: 0 0 8px rgba(0, 217, 255, 0.4);
  letter-spacing: 0.5px;
}

.runtime-table thead th:first-child {
  border-radius: 4px 0 0 0;
}

.runtime-table thead th:last-child {
  border-radius: 0 4px 0 0;
}

.runtime-table tbody td {
  padding: 11px 10px;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(0, 100, 180, 0.12);
  transition: all 0.2s ease;
}

.runtime-table tbody tr {
  transition: all 0.2s ease;
}

.runtime-table tbody tr:hover {
  background: rgba(0, 150, 255, 0.1);
  box-shadow: inset 0 0 12px rgba(0, 150, 255, 0.1);
}

.runtime-table tbody tr:last-child td {
  border-bottom: none;
}

.runtime-table tbody td:first-child {
  color: #00d9ff;
  font-weight: 600;
  text-shadow: 0 0 6px rgba(0, 217, 255, 0.4);
}

.runtime-table .change-positive {
  color: #00e676;
  font-weight: 700;
  text-shadow: 0 0 6px rgba(0, 230, 118, 0.5);
}

.runtime-table .change-negative {
  color: #ff5252;
  font-weight: 700;
  text-shadow: 0 0 6px rgba(255, 82, 82, 0.5);
}

@media (max-width: 768px) {
  .stats-panel {
    width: calc(100vw - 48px);
    max-height: 480px;
  }
}
</style>
