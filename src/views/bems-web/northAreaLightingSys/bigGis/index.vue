<template>
  <div class="big-gis-page" @click="onMapClick" :class="themeClass">
    <MapView ref="mapViewRef" @light-marker-single-click="onLightMarkerSingleClick" />
    
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
          <div class="module-card">
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
          <div class="module-card">
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
            <div class="section-title-row">
              <div class="section-title">场景列表</div>
              <!-- 区域筛选下拉框：展示区域名称，支持模糊搜索，选择后筛选对应场景（写法参考 equipmentMonitoring 场景配置筛选） -->
              <a-select
                v-model:value="selectedAreaFilter"
                placeholder="全部"
                :options="areaFilterOptions"
                :allow-clear="selectedAreaFilter !== 'all'"
                style="width: 140px"
                popup-class-name="scene-area-dropdown"
                class="scene-area-select"
              />
            </div>
            <div class="space-list-scroll-container">
              <div class="space-list">
                <div
                  v-for="(scene, index) in filteredSceneList"
                  :key="index"
                  class="space-item-row"
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
      <button
        class="stats-toggle-btn"
        :class="{ 'is-active': showStatsPanel }"
        @click="toggleStatsPanel"
        title="查看统计数据"
      >
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
          <h4>各地块运行时长（本月）</h4>
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
          <h4>运行时长按对比</h4>
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
    
    <!-- 底部控制按钮组 -->
    <div class="bottom-controls">
      <button 
        class="ctrl-btn"
        :class="{ 'is-active': activeMode === 'area' }"
        :aria-pressed="activeMode === 'area'"
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
        :aria-pressed="activeMode === 'detail'"
        @click="handleShowDetails"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>详情模式</span>
      </button>
    </div>

    <!-- 地块功能浮层（点击地块标点弹出，点击一级菜单项打开对应弹框） -->
    <div
      v-if="spaceMenu.visible"
      class="space-menu"
      :style="{ top: spaceMenu.y + 'px', left: spaceMenu.x + 'px' }"
      @click.stop
    >
      <div class="space-menu-item" :class="{ 'is-active': activeMenuItem === 'all' }" @click="onMenuItemClick('all')">
        <span class="menu-label">一键开关</span>
      </div>

      <div class="space-menu-item" :class="{ 'is-active': activeMenuItem === 'scene' }" @click="onMenuItemClick('scene')">
        <span class="menu-label">场景模式</span>
      </div>

      <div class="space-menu-item" :class="{ 'is-active': activeMenuItem === 'video' }" @click="onMenuItemClick('video')">
        <span class="menu-label">监控视频</span>
      </div>

      <div class="space-menu-item" :class="{ 'is-active': activeMenuItem === 'detail' }" @click="onMenuItemClick('detail')">
        <span class="menu-label">详情</span>
      </div>
    </div>

    <!-- 视频监控弹框（居中，tab 展示多个视频，tab 支持滚动） -->
    <a-modal
      v-model:open="videoModalVisible"
      title="监控视频"
      :footer="null"
      width="820px"
      centered
      class="video-modal"
      wrapClassName="video-modal"
      :bodyStyle="{ padding: '16px', background: '#0b1a2f' }"
      @cancel="onSpaceModalCancel"
    >
      <div class="video-modal-wrap">
        <a-spin :spinning="videoLoading">
          <a-tabs v-if="spaceVideoList.length" type="card" class="video-tabs">
            <a-tab-pane
              v-for="(video, idx) in spaceVideoList"
              :key="video.id || idx"
              :tab="video.videoName || '监控视频 ' + (idx + 1)"
            >
              <div class="video-modal-item">
                <VideoPlayer :url="getVideoPlayUrl(video)" />
              </div>
            </a-tab-pane>
          </a-tabs>
          <div v-else-if="!videoLoading" class="space-submenu-empty">暂无视频</div>
        </a-spin>
      </div>
    </a-modal>

    <!-- 全开全关弹框（居中） -->
    <a-modal
      v-model:open="allModalVisible"
      title="一键开关"
      :footer="null"
      width="360px"
      centered
      class="space-modal"
      wrapClassName="space-modal"
      :bodyStyle="{ padding: '20px', background: '#0b1a2f' }"
      @cancel="onSpaceModalCancel"
    >
      <div class="switch-card-body all-modal-body">
        <button class="switch-btn switch-on" @click="handleSpaceAllOn(currentSpaceName)">
         <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
          全开
        </button>
        <button class="switch-btn switch-off" @click="handleSpaceAllOff(currentSpaceName)">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
          全关
        </button>
      </div>
    </a-modal>

    <!-- 场景模式弹框（居中，场景列表虚拟滚动） -->
    <a-modal
      v-model:open="sceneModalVisible"
      title="场景模式"
      :footer="null"
      width="600px"
      centered
      class="space-modal"
      wrapClassName="space-modal"
      :bodyStyle="{ padding: '16px', background: '#0b1a2f' }"
      @cancel="onSpaceModalCancel"
    >
      <a-spin :spinning="sceneModalLoading">
        <template v-if="spaceSceneList.length">
          <div class="scene-vxe-table-wrap">
          <vxe-table
            :data="spaceSceneList"
            height="480"
            :show-header="false"
            :row-config="{ keyField: 'id', height: 60 }"
            :scroll-y="{ enabled: true, gt: 20 }"
            :virtual-config="{ enabled: true, useY: true }"
          >
            <vxe-column field="sceneName" title="场景名称" min-width="240" show-overflow>
              <template #default="{ row }">
                <div class="scene-cell">
                  <span class="scene-indicator-icon" :style="{ backgroundColor: row.color || '#38bdf8' }"></span>
                  <span class="scene-cell-name">{{ row.sceneName || '-' }}</span>
                  <button class="detail-btn scene-mid-detail" @click.stop="showSpaceSceneDetail(row)">详情</button>
                </div>
              </template>
            </vxe-column>
            <vxe-column title="操作" width="110" align="center">
              <template #default="{ row }">
                <div class="scene-btn-group">
                  <button class="scene-action-btn on-btn" @click.stop="handleSpaceSceneOn(row)">开</button>
                  <button class="scene-action-btn off-btn" @click.stop="handleSpaceSceneOff(row)">关</button>
                </div>
              </template>
            </vxe-column>
          </vxe-table>
          </div>
        </template>
        <div v-else class="space-submenu-empty">暂无场景</div>
      </a-spin>
    </a-modal>

    <!-- 详情弹框：地块回路（getSceneSpaceApi 返回的 circuits，虚拟列表） -->
    <a-modal
      v-model:open="detailModalVisible"
      title="地块回路"
      :footer="null"
      width="540px"
      centered
      class="space-modal"
      wrapClassName="space-modal"
      :bodyStyle="{ padding: '16px', background: '#0b1a2f' }"
      @cancel="onSpaceModalCancel"
    >
      <a-spin :spinning="detailModalLoading">
        <template v-if="spaceCircuitList.length">
          <div class="circuit-vxe-table-wrap">
          <vxe-table
            :data="spaceCircuitList"
            height="360"
            :row-config="{ keyField: '_key', height: 38 }"
            :scroll-y="{ enabled: true, gt: 20 }"
            :virtual-config="{ enabled: true, useY: true }"
          >
            <vxe-column type="seq" title="序号" width="60" align="center"></vxe-column>
            <vxe-column field="name" title="回路名称" min-width="170" show-overflow sortable></vxe-column>
            <vxe-column field="electricCurrent" title="电流" min-width="80" show-overflow sortable></vxe-column>
            <vxe-column field="status" title="状态" width="70" align="center" sortable>
              <template #default="{ row }">
                <span class="circuit-status" :class="row.status === '开启' ? 'is-on' : 'is-off'">
                  {{ row.status || '关闭' }}
                </span>
              </template>
            </vxe-column>
          </vxe-table>
          </div>
        </template>
        <div v-else class="space-submenu-empty">暂无回路</div>
      </a-spin>
    </a-modal>

    <!-- 详情模式标点弹框（点击详情模式标点且仅单条数据时打开：一键开关/监控视频） -->
    <a-modal
      v-model:open="lightTabsModalVisible"
      :footer="null"
      width="400px"
      centered
      :zIndex="90000"
      class="space-modal"
      wrapClassName="space-modal"
      :bodyStyle="{ padding: '16px', background: '#0b1a2f' }"
      @cancel="onSpaceModalCancel"
    >
      <template #title>
        <div class="light-tabs-title">
          <span>{{ currentSpaceName }}-{{ lightAreaName }}</span>
        </div>
      </template>
      <a-tabs type="card" class="video-tabs space-tabs">
        <!-- 1. 灯光控制页签：一键开关（上）→ 回路列表（下，左上侧展示已开启/总回路数） -->
        <a-tab-pane key="control" tab="一键开关">
          <div class="light-pane">
            <!-- 一键开关（最上边） -->
            <div class="pane-switch">
              <button class="icon-btn with-text" @click="handleLightAreaOn" title="全开">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                <span class="btn-text">全开</span>
              </button>
              <button class="icon-btn dark-btn with-text" @click="handleLightAreaOff" title="全关">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <span class="btn-text">全关</span>
              </button>
            </div>
            <!-- 回路列表（最下边，左上侧展示已开启回路数/总回路数） -->
            <!-- 标点 id=477/478 特殊处理：不查回路，分别展示节目列表 / 区域列表 -->
            <div v-if="!lightIsSpecial477 && !lightIsSpecial478" class="pane-table">
              <div class="circuit-count-tag">
                <span class="circuit-count-left">
                  <span class="stat-label">回路已开/回路总数：</span>
                  <span class="stat-value">
                    <span class="number highlight-text">{{ lightCircuitSummary.on }}</span> 
                    / 
                    <span class="number">{{ lightCircuitSummary.total }}</span>
                  </span>
                </span>
                <button class="table-refresh-btn" :disabled="detailModalLoading" @click="refreshLightTabsModal" title="刷新">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                </button>
              </div>
              <a-spin :spinning="detailModalLoading" class="pane-spin">
                <template v-if="lightCircuitList.length">
                  <div class="circuit-vxe-table-wrap">
                    <vxe-table
                      :data="lightCircuitList"
                      max-height="320"
                      :row-config="{ keyField: '_key', height: 32 }"
                      :scroll-y="{ enabled: true }"
                    >
                      <vxe-column type="seq" title="序号" width="60" align="center"></vxe-column>
                      <vxe-column field="name" title="回路名称" min-width="130" show-overflow sortable></vxe-column>
                      <vxe-column field="electricCurrent" title="电流" min-width="50" show-overflow sortable></vxe-column>
                      <vxe-column field="status" title="状态" width="80" align="center" sortable>
                        <template #default="{ row }">
                          <span class="circuit-status" :class="row.status === '开启' ? 'is-on' : 'is-off'">
                            {{ row.status || '关闭' }}
                          </span>
                        </template>
                      </vxe-column>
                    </vxe-table>
                  </div>
                </template>
                <div v-else class="space-submenu-empty">暂无回路</div>
              </a-spin>
            </div>
            <!-- 节目列表（标点 id=477）：节目名称 / 状态 / 操作（播放 停止） -->
            <div v-else-if="lightIsSpecial477" class="pane-table">
              <a-spin :spinning="detailModalLoading" class="pane-spin">
                <template v-if="lightPlanList.length">
                  <div class="circuit-vxe-table-wrap">
                    <vxe-table
                      :data="lightPlanList"
                      max-height="320"
                      :row-config="{ keyField: 'id', height: 32 }"
                      :scroll-y="{ enabled: true }"
                    >
                      <vxe-column field="name" title="节目名称" min-width="150" show-overflow></vxe-column>
                      <vxe-column title="状态" width="70" align="center">
                        <template #default="{ row }">
                          <span class="program-status">{{ row.programState || '' }}</span>
                        </template>
                      </vxe-column>
                      <vxe-column title="操作" width="118" align="center">
                        <template #header>
                          <span class="plan-header-wrap">
                            操作
                            <button class="table-refresh-btn" :disabled="detailModalLoading" @click="refreshLightTabsModal" title="刷新">
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 4 23 10 17 10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                              </svg>
                            </button>
                          </span>
                        </template>
                        <template #default="{ row }">
                          <div class="plan-action-group">
                            <button class="mini-action-btn is-on" @click="handleProgramAction(row, '开启')">播放</button>
                            <button class="mini-action-btn is-off" @click="handleProgramAction(row, '关闭')">停止</button>
                          </div>
                        </template>
                      </vxe-column>
                    </vxe-table>
                  </div>
                </template>
                <div v-else class="space-submenu-empty">暂无节目</div>
              </a-spin>
            </div>
            <!-- 区域列表（标点 id=478）：名称 / 状态 / 操作（开 关） -->
            <div v-else class="pane-table">
              <a-spin :spinning="detailModalLoading" class="pane-spin">
                <template v-if="lightArea478List.length">
                  <div class="circuit-vxe-table-wrap">
                    <vxe-table
                      :data="lightArea478List"
                      max-height="320"
                      :row-config="{ keyField: 'id', height: 32 }"
                      :scroll-y="{ enabled: true }"
                    >
                      <vxe-column field="name" title="名称" min-width="150" show-overflow></vxe-column>
                      <vxe-column title="状态" width="70" align="center">
                        <template #default="{ row }">
                          <span class="program-status">{{ row.status || '' }}</span>
                        </template>
                      </vxe-column>
                      <vxe-column title="操作" width="118" align="center">
                        <template #header>
                          <span class="plan-header-wrap">
                            操作
                            <button class="table-refresh-btn" :disabled="detailModalLoading" @click="refreshLightTabsModal" title="刷新">
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 4 23 10 17 10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                              </svg>
                            </button>
                          </span>
                        </template>
                        <template #default="{ row }">
                          <div class="plan-action-group">
                            <button class="mini-action-btn is-on" @click="handleArea478Action(row, '开启')">开</button>
                            <button class="mini-action-btn is-off" @click="handleArea478Action(row, '关闭')">关</button>
                          </div>
                        </template>
                      </vxe-column>
                    </vxe-table>
                  </div>
                </template>
                <div v-else class="space-submenu-empty">暂无区域</div>
              </a-spin>
            </div>
          </div>
        </a-tab-pane>
        <!-- 2. 监控视频（单独页签，与综合预览页一致：写死地址前缀拼接 monitorAdr，不调接口） -->
        <a-tab-pane key="video" tab="监控视频">
          <div v-if="lightVideoUrl" class="video-modal-item">
            <VideoPlayer :url="lightVideoUrl" />
          </div>
          <div v-else class="space-submenu-empty">暂无监控视频</div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <!-- 统一二次确认弹框（提示样式：标题栏 + 信息图标 + 动作词高亮） -->
    <ConfirmModal ref="confirmModalRef" />
  </div>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../useScreenTheme';
const { themeClass } = useScreenTheme();
// 主题 class 同步到 body：弹窗/浮层（a-modal、el-dialog、ConfirmModal 等）默认 teleport 到 document.body，
// 需在 body 上也能命中 .theme-white 覆盖层才能切换为白色版本
import { onBeforeUnmount } from 'vue';
onMounted(() => {
  document.body.classList.add(themeClass);
});
onBeforeUnmount(() => {
  document.body.classList.remove('theme-white', 'theme-black');
});

import { ref, computed, onMounted } from 'vue'
import MapView from './map.vue'
import SceneDetailModal from './components/SceneDetailModal.vue'
import { useScreenScale } from '../useScreenScale'

// 大屏自适应：动态 rem 基准（1rem = 100px @1920），样式统一 rem + flex + vw/vh；
// teleport 弹窗渲染到 body 后 rem 依然基于 html 根字号，同样随屏缩放
useScreenScale()
import { getAllCircuitApi, getAllSpaceApi, getRunTimeCompareApi, getSceneSpaceApi, getVideoListBySpaceApi, allOnApi, allOffApi } from '../comprehensivePreview/comprehensivePreview.api'
import { getCircuitListApi } from '@/api/baseSettingBqZm'
import { postSceneControlApi, getLightingPlanAPiNew, planDetailApiNew, getLightingProgramList, getLightingProgramControl, postProgramAllControl, getAreaListBySpaceName, postControlBySpaceName } from '@/api/equipmentMonitoring';
import spaceBoundariesData from './space-boundaries.json'
import VideoPlayer from '../equipmentMonitoring/components/VideoPlayer.vue'
import { setAreaOpenApi, setAreaCloseApi } from '@/api/baseSettingBqZm';
import { message } from 'ant-design-vue'
import ConfirmModal from '../equipmentMonitoring/components/ConfirmModal.vue'

const mapViewRef = ref<any>(null)
const sceneDetailModalRef = ref<any>(null)
const showControlPanel = ref(false)
const showStatsPanel = ref(false)  // 统计面板开关
const activeMode = ref<'area' | 'detail' | null>(null)  // 当前激活模式

// 地块功能浮层状态
const spaceMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  spaceName: ''
})
// 当前激活的一级菜单项（all / scene / video / detail），弹框打开时保持高亮
const activeMenuItem = ref<string>('')

// 地块视频列表（点击监控视频时调用 listBySpace 接口获取）
const spaceVideoList = ref<any[]>([])
// 视频加载状态
const videoLoading = ref(false)
// 视频弹框显隐
const videoModalVisible = ref(false)

// 一键开关 / 场景模式 / 详情弹框显隐
const allModalVisible = ref(false)
const sceneModalVisible = ref(false)
const sceneModalLoading = ref(false)
const detailModalVisible = ref(false)
const detailModalLoading = ref(false)
// 详情模式标点四页签弹框显隐（点击标点且仅单条数据时打开）
const lightTabsModalVisible = ref(false)
// 监控平台 iframe 地址前缀（与综合预览页一致），monitorAdr 为监控通道编码
const MONITOR_BASE_URL = 'http://10.168.47.23:4000/index.html?id='
// 四页签弹框监控视频地址（点击标点时按 monitorAdr 拼接，不调接口）
const lightVideoUrl = ref('')
// 四页签弹框回路列表（circuit/listPage 按 areaId 查询）
const lightCircuitList = ref<any[]>([])
// 标点 id=477 特殊弹框标记：下边不查回路，改为展示节目列表
const lightIsSpecial477 = ref(false)
// 标点 id=477 弹框的节目列表（getLightingProgramList 全量）
const lightPlanList = ref<any[]>([])
// 标点 id=478 特殊弹框标记：下边不查回路，改为展示 area/listBySpaceName 区域列表
const lightIsSpecial478 = ref(false)
// 标点 id=478 弹框的区域列表（getAreaListBySpaceName，id 固定传 1）
const lightArea478List = ref<any[]>([])
// 四页签弹框当前标点的 areaId（全开/全关接口参数）
const lightAreaId = ref('')
// 四页签弹框标题展示的区域名（取标点数据 areaName）
const lightAreaName = ref('')
// 当前弹框所属地块名（打开弹框时从浮层带出）
const currentSpaceName = ref('')

// 视频占位地址（暂用，后续接入真实视频）
const SPACE_VIDEO_PLACEHOLDER = 'https://www.w3schools.com/html/mov_bbb.mp4'

// 统计数据 - 各地块运行时长（本月）柱状图 - 科技蓝主题（由接口填充）
const runtimeData = ref<any[]>([])

// 运行时按下对拜 - 数据表格（由接口填充）
const runtimeTableData = ref<any[]>([])

// 所有地块 ID 列表（用于运行时长查询）
const allSpaceIdList = ref<string[]>([])
const spaceList = ref<any[]>([])
// 最终 spaceId 列表：由有 tagId 的场景详情（/scene/detail）areaList.space 去重得到，作为 /scene/space 请求来源
const finalSpaceIdList = ref<number[]>([])

// 场景列表标签筛选：下拉框选项来自 district/listPage 返回的标签数据（取 id / districtName 字段），
// 标签 id 即场景数据中的 tagId（与设备监控页标签体系一致）；第一条固定为「全部」（value='all'，选中即展示所有且不显示清除按钮）
const selectedAreaFilter = ref<string | undefined>(undefined)
const areaFilterOptions = computed(() => {
  const options: { label: string; value: string }[] = [{ label: '全部', value: 'all' }]
  spaceList.value.forEach((s: any) => {
    options.push({ label: s.name || String(s.id), value: String(s.id) })
  })
  return options
})

// 取场景的标签 id（兼容 tagId / tagIds 字段），无标签时返回 undefined
function getSceneTagId(item: any): any {
  const t = item?.tagId ?? item?.tagIds
  return t == null || t === '' ? undefined : t
}

// 筛选后的场景列表：数据直接来自 scene/listPage（allTagScenes），按场景 tagId 与标签 id（district/listPage 的标签 id，同源）对应归属；
// 只展示有 tagId 的场景（无标签场景不展示），并给场景打上归属标签 id（_spaceId）；
// 未选或选「全部」展示所有标签的场景，选中后按场景 tagId 匹配筛选（与场景模式弹框的匹配逻辑一致）
const filteredSceneList = computed(() => {
  const allScenes: any[] = []
  // tagId → 标签映射：spaceList.id（district/listPage）与场景 tagId 同源
  const boardMap = new Map(spaceList.value.map((s: any) => [String(s.id), s]))
  allTagScenes.value.forEach((item: any) => {
    // 只展示有 tagId 的场景
    if (getSceneTagId(item) == null) return
    const space = boardMap.get(String(getSceneTagId(item)))
    allScenes.push({
      ...item,
      id: item.id || item.sceneId,
      name: item.sceneName || item.planName || '-',
      color: item.status === '开启' ? '#52c41a' : item.status === '关闭' ? '#ff4d4f' : '#38bdf8',
      enabled: item.status === '开启',
      _spaceId: space?.id,
      _spaceName: space?.name,
    })
  })
  if (!selectedAreaFilter.value || selectedAreaFilter.value === 'all') return allScenes
  return allScenes.filter((s) => String(getSceneTagId(s)) === String(selectedAreaFilter.value))
})

// 地块默认配色
const DEFAULT_SPACE_COLORS = [
  'rgba(251, 146, 60, 0.9)',   // 橙色
  'rgba(104, 211, 145, 0.9)',  // 绿色
  'rgba(245, 158, 11, 0.9)',   // 黄色
  'rgba(167, 139, 250, 0.9)',  // 紫色
  'rgba(244, 63, 94, 0.9)',    // 玫红色
]

// 本地存储各地块场景接口数据（按 spaceName 索引，保存 getSceneSpaceApi 完整返回：scenes 与 circuits 同级）
const spaceSceneDataMap = ref<Record<string, any>>({})
// 记录正在请求中的地块，防止重复请求
const spaceSceneLoadingMap = ref<Record<string, boolean>>({})

// 照明控制相关数据
const circuitStats = ref({
  total: 0,   // 总回路数
  active: 0,  // 已开启回路数
})

// "地块模式"按钮 - 绘制地块边框和标记点（已处于地块模式时重复点击：不取消、不重绘）
function handleShowArea() {
  // 已处于地块模式：直接返回，避免重复清空/重绘
  if (activeMode.value === 'area') return

  activeMode.value = 'area'

  // 先清除其他模式的绘制（如详情模式的灯光标点）
  mapViewRef.value?.clearAllDrawings?.()

  // 绘制地块边框和标记点
  mapViewRef.value?.drawAllSpacesExceptNorth?.()
  // 标点创建后立即用已缓存的状态点亮/熄灭（数据可能早于标点加载完成，直接更新会因标点不存在而丢失）
  applyAllSpaceMarkerStates()
  // 批量请求所有地块的场景数据，请求完成后按 circuits 状态更新标点亮/灭（任一回路开启=亮灯，否则熄灭）
  fetchAllSpaceSceneData()
}

// ===== 地块标点 hover 功能浮层 =====

// 视口外边距
const VIEWPORT_MARGIN = 8
// 浮层预估尺寸
const MENU_WIDTH = 150
const MENU_HEIGHT_MAX = 360

// 限制浮层位置在视口内（不能超出视图边界）
function clampMenuPosition(x: number, y: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const totalWidth = MENU_WIDTH
  if (x + totalWidth > vw - VIEWPORT_MARGIN) {
    x = vw - totalWidth - VIEWPORT_MARGIN
  }
  if (x < VIEWPORT_MARGIN) {
    x = VIEWPORT_MARGIN
  }
  if (y + MENU_HEIGHT_MAX > vh - VIEWPORT_MARGIN) {
    y = vh - MENU_HEIGHT_MAX - VIEWPORT_MARGIN
  }
  if (y < VIEWPORT_MARGIN) {
    y = VIEWPORT_MARGIN
  }
  return { x, y }
}

// 事件委托：点击地块标点时弹出功能浮层（标点保持 active），点击其他区域时全部关闭
function onMapClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  // 灯光标点（详情模式）：点击行为由 map.vue 内部事件驱动（单条打开四页签弹框），此处不关闭任何弹框，避免弹框刚打开就被冒泡点击关闭
  if (target.closest?.('.light-marker')) return
  const markerEl = target.closest?.('.space-marker')
  if (markerEl) {
    const spaceName = markerEl.getAttribute('data-space-name') || ''
    if (!spaceName) return
    // 切换标点时取消上一个标点的 active 状态
    if (spaceMenu.value.visible && spaceMenu.value.spaceName !== spaceName) {
      mapViewRef.value?.setSpaceMarkerActive?.(spaceMenu.value.spaceName, false)
    }
    const rect = markerEl.getBoundingClientRect()
    let x = Math.round(rect.left + rect.width / 2 + 20)
    let y = Math.round(rect.top - 180)
    // 边界限制
    const clamped = clampMenuPosition(x, y)
    spaceMenu.value = {
      visible: true,
      x: clamped.x,
      y: clamped.y,
      spaceName
    }
    // 一级列表展示时标点保持 active
    mapViewRef.value?.setSpaceMarkerActive?.(spaceName, true)
  } else {
    closeAll()
  }
}

// 点击一级菜单项：浮层保留并保持该项激活，打开对应居中弹框
function onMenuItemClick(key: string) {
  const spaceName = spaceMenu.value.spaceName
  activeMenuItem.value = key  // 记录激活项，弹框打开时一级列表保持高亮
  if (key === 'all') openSpaceAllModal()
  else if (key === 'scene') openSpaceSceneModal(spaceName)
  else if (key === 'video') openVideoModal(spaceName)
  else if (key === 'detail') openSpaceDetailModal(spaceName)
}

// 打开全开全关弹框
function openSpaceAllModal() {
  currentSpaceName.value = spaceMenu.value.spaceName
  allModalVisible.value = true
}

// 打开场景模式弹框（列表数据来自 scene/listPage，按地块 id 匹配 tagId 过滤）
async function openSpaceSceneModal(spaceName: string) {
  currentSpaceName.value = spaceName
  sceneModalVisible.value = true
  sceneModalLoading.value = true
  try {
    // 确保有 tagId 的场景列表已加载（弹框列表数据源）；已加载过则直接复用，为空则重新请求一次
    if (allTagScenes.value.length === 0) {
      await fetchTagSceneList()
      if (allTagScenes.value.length === 0) {
        console.warn('[index] 场景模式弹框：场景列表仍为空（listPage 无有 tagId 的场景或接口失败）')
      }
    }
  } finally {
    sceneModalLoading.value = false
  }
}

// 打开详情弹框（展示 getSceneSpaceApi 返回的 circuits，虚拟列表）
async function openSpaceDetailModal(spaceName: string) {
  currentSpaceName.value = spaceName
  detailModalVisible.value = true
  detailModalLoading.value = true
  try {
    await ensureSpaceSceneData(spaceName)
  } finally {
    detailModalLoading.value = false
  }
}

// 打开视频弹框（加载视频列表并居中展示 tab）
async function openVideoModal(spaceName: string) {
  videoModalVisible.value = true
  await loadSpaceVideoList(spaceName)
}

// 弹框取消：点右上角 X 只关闭弹框（浮层保留）；点击遮罩等其他区域全部关闭
function onSpaceModalCancel(e: any) {
  const isCloseBtn = e?.target instanceof Element && !!e.target.closest('.ant-modal-close')
  if (isCloseBtn) {
    closeAllModals()
  } else {
    closeAll()
  }
}

// 关闭所有弹框（浮层保留，标点仍 active），同时取消一级菜单激活状态
function closeAllModals() {
  videoModalVisible.value = false
  allModalVisible.value = false
  sceneModalVisible.value = false
  detailModalVisible.value = false
  lightTabsModalVisible.value = false
  // 标点 id=477/478 特殊弹框状态重置
  lightIsSpecial477.value = false
  lightPlanList.value = []
  lightIsSpecial478.value = false
  lightArea478List.value = []
  activeMenuItem.value = ''  // 取消对应一级列表的激活状态
  // 详情模式成员列表：弹框关闭后列表保持展开展示，仅清除列表项激活高亮
  mapViewRef.value?.clearMarkerListActive?.()
}

// 全部关闭：弹框 + 浮层（同时取消标点 active）
function closeAll() {
  closeAllModals()
  closeSpaceMenu()
}

// 关闭功能浮层（并取消标点 active）
function closeSpaceMenu() {
  if (spaceMenu.value.visible) {
    mapViewRef.value?.setSpaceMarkerActive?.(spaceMenu.value.spaceName, false)
  }
  spaceMenu.value.visible = false
  activeMenuItem.value = ''  // 重置一级菜单激活状态
}


// 地块显示名（space-boundaries.json 标点名）与 district/listPage 的 districtName 不一致时的映射，
// 用于点击标点（JSON 名）也能匹配到 spaceList 中的 spaceIds；
// 目前 JSON 标点名已与接口 districtName 保持一致，该映射仅作兼容兜底
const SPACE_NAME_ALIAS: Record<string, string> = {
  '通明湖': '群明湖',
  '制氧区域': '制氧区',
  '首钢园服贸会': '服贸会区',
  // 标点/接口写法不一时双向兜底（群明湖=群名湖为同一地块的两种写法）
  '群名湖': '群明湖',
  '群明湖': '群名湖',
}

// 将地块名归一化为 spaceList 中的规范名（districtName）；映射不到时返回原值
function normalizeSpaceName(spaceName: string): string {
  if (!spaceName) return spaceName
  if (spaceList.value.some((s: any) => s.name === spaceName)) return spaceName
  const alias = SPACE_NAME_ALIAS[spaceName]
  if (alias && spaceList.value.some((s: any) => s.name === alias)) return alias
  return spaceName
}

// 获取地块所有可能的标点名（原值 + 归一化名 + SPACE_NAME_ALIAS 反查的 JSON 标点名），
// 用于 updateSpaceMarkerState 匹配 DOM 标点：批量请求传的是 spaceList 的 districtName，标点 DOM 名是 JSON 标点名，两者写法可能不一致
function getSpaceMarkerNames(spaceName: string): string[] {
  const names = new Set<string>()
  const normName = normalizeSpaceName(spaceName)
  names.add(spaceName)
  names.add(normName)
  for (const [jsonName, districtName] of Object.entries(SPACE_NAME_ALIAS)) {
    if (districtName === normName) names.add(jsonName)
  }
  return Array.from(names)
}

// 将接口返回的 spaceIds（逗号分隔字符串，如 "901,902"；或数组；或空字符串/空数组）解析为数字数组
function parseSpaceIds(spaceIds: any): number[] {
  if (spaceIds == null) return []
  const arr = Array.isArray(spaceIds)
    ? spaceIds
    : String(spaceIds)
        .replace(/[\[\]\s]/g, '')
        .split(',')
  return arr.map((v: any) => Number(v)).filter((n: number) => !isNaN(n) && n > 0)
}

// 回路/场景去重键：优先取 id，缺失时用 circuitId（scene/space 返回的回路主键字段为 circuitId）；键统一转字符串避免数字/字符串类型不一致
function getMergeKey(item: any): string {
  const v = item?.id ?? item?.circuitId
  return v != null && v !== '' ? String(v) : ''
}

// 按 id 合并数组（保留顺序，id 相同只保留第一个；无 id 的项直接追加）
function mergeById(list: any[], incoming: any): any[] {
  if (!Array.isArray(incoming)) return list
  const exists = new Set<string>()
  for (const i of list) {
    const k = getMergeKey(i)
    if (k) exists.add(k)
  }
  for (const item of incoming) {
    const k = getMergeKey(item)
    if (!k || !exists.has(k)) {
      list.push(item)
      if (k) exists.add(k)
    }
  }
  return list
}

// 从 getSceneSpaceApi 返回的 result 中取场景列表（scenes 为场景数组）
function getSceneListFromRes(res: any): any[] {
  return Array.isArray(res?.scenes) ? res.scenes : []
}

// 从 getSceneSpaceApi 返回的 result 中取回路列表（circuits 为回路数组）
function getCircuitListFromRes(res: any): any[] {
  return Array.isArray(res?.circuits) ? res.circuits : []
}

// spaceId 级数据缓存（请求成功即写入，含空结果；同一 spaceId 被多个地块引用时只请求一次）
const spaceDataById = ref<Record<string, any>>({})
// spaceId 级请求中的 Promise（并发请求同一 spaceId 时等待同一次请求，避免重复）
const spaceDataPromiseById: Record<string, Promise<any>> = {}

// 获取某个 spaceId 的场景/回路数据（/scene/space），带 spaceId 级缓存与请求中防重；
// 成功（含空结果）返回 { scenes, circuits } 并缓存；失败返回 null（不缓存，可重试）
async function fetchSpaceDataById(sid: number | string): Promise<any> {
  const key = String(sid)
  if (spaceDataById.value[key]) return spaceDataById.value[key]
  if (spaceDataPromiseById[key]) return spaceDataPromiseById[key]
  spaceDataPromiseById[key] = (async () => {
    try {
      const res: any = await getSceneSpaceApi(key)
      if (res) {
        const data = {
          scenes: mergeById([], getSceneListFromRes(res)),
          circuits: mergeById([], getCircuitListFromRes(res)),
          // 【临时验证】记录 spaceName，排查制氧区 spaceId=903 归属问题（验证完可删除）
          spaceName: res?.spaceName,
        }
        // 合并 relType==='回路' 的场景详情暂存回路：遍历所有暂存 tagId，若该 space 属于此 tagId（tagId 包含多个 space），
        // 把暂存回路与 getSceneSpaceApi 按 space 查回的 circuits 合并（重复回路由 mergeById 按 id 去重）
        for (const [tagId, circuits] of tagCircuitMap) {
          if (tagSpaceMap.get(tagId)?.has(Number(key))) {
            data.circuits = mergeById(data.circuits, circuits)
          }
        }
        spaceDataById.value[key] = data
        return data
      }
      return null
    } catch (e) {
      console.error(`[index] spaceId=${key} 场景接口请求失败:`, e)
      return null
    } finally {
      delete spaceDataPromiseById[key]
    }
  })()
  return spaceDataPromiseById[key]
}

// 预加载某个地块的场景/回路数据（按需请求，带缓存；保存完整返回：scenes 与 circuits 同级）
async function fetchSpaceSceneData(spaceName: string) {
  // 名称归一化：JSON 标点名（制氧区域/通明湖/首钢园服贸会）与 districtName（制氧区/群明湖/服贸会区）不一致，
  // 统一映射为 spaceList 中的规范名，保证批量请求与点击标点共用同一份缓存
  const key = normalizeSpaceName(spaceName)
  // 已成功请求过（有缓存）直接返回，避免重复请求（如初始化后再点地块模式不再重新调用）
  if (spaceSceneDataMap.value[key]) return
  const space = spaceList.value.find((s: any) => s.name === key)
  // spaceId 来源：spaceList 中该地块归属的 spaceId 数组（由场景详情 areaList.space 按 districtId 归属组装）
  const spaceIds: number[] = parseSpaceIds(space?.spaceIds)
  // 【临时验证】打印该地块 spaceIds，排查制氧区回路个数问题（验证完删除）
  console.log(`[verify] fetchSpaceSceneData key=${key} spaceIds=`, spaceIds)
  if (spaceIds.length === 0) {
    console.warn(`[index] 地块 [${key}] 无 spaceIds，跳过状态更新`)
    return
  }
  try {
    spaceSceneLoadingMap.value[key] = true
    // 每个 spaceId 走 spaceId 级缓存（同一 spaceId 只请求一次），再按 id 合并到地块
    const merged: any = { scenes: [], circuits: [] }
    let hasError = false
    const results = await Promise.all(
      spaceIds.map(async (sid) => {
        const r = await fetchSpaceDataById(sid)
        if (r === null) hasError = true
        return r
      }),
    )
    results.forEach((res) => {
      if (!res) return
      merged.scenes = mergeById(merged.scenes, res.scenes || [])
      merged.circuits = mergeById(merged.circuits, res.circuits || [])
    })
    console.log(merged.circuits, 'merged.circuits');
    // 【临时验证】回路重复检查：打印每条回路的 id/circuitId/名称，验证同名回路是否同 id（验证完删除）
    console.log(`[verify] ${key} circuits 明细:`, merged.circuits.map((c: any, i: number) => ({
      idx: i, id: c?.id, circuitId: c?.circuitId, name: c?.circuitName ?? c?.name, status: c?.status
    })))
    const nameCount: Record<string, number> = {}
    merged.circuits.forEach((c: any) => {
      const n = String(c?.circuitName ?? c?.name ?? '')
      nameCount[n] = (nameCount[n] || 0) + 1
    })
    console.log(`[verify] ${key} 回路名称重复统计:`, nameCount)
    const idCount: Record<string, number> = {}
    merged.circuits.forEach((c: any) => {
      const k = String(c?.id ?? c?.circuitId ?? '无id')
      idCount[k] = (idCount[k] || 0) + 1
    })
    console.log(`[verify] ${key} 回路 id 重复统计:`, idCount)
    if (merged.scenes.length || merged.circuits.length) {
      // 更新地块标点状态：circuits 中任一回路 status === '开启' → 亮灯，否则熄灭（空数组/无 circuits 均熄灭）
      // 短路遍历：发现第一个开启回路立即终止，避免全量扫描（最好 O(1)，最坏 O(n)，空间 O(1)）
      let isOn = false
      for (const c of merged.circuits) {
        if (c.status === '开启') {
          isOn = true
          break
        }
      }
      // 状态缓存进数据缓存（_isOn），供标点创建后重放：数据请求完成时标点可能尚未绘制，直接更新会因 DOM 不存在而丢失
      spaceSceneDataMap.value[key] = { ...merged, _isOn: isOn }
      // 【临时验证】打印合并后回路数，制氧区额外打印每个 spaceId 的回路与关联场景（验证完删除）
      console.log(`[verify] ${key} merged circuits=${merged.circuits.length} scenes=${merged.scenes.length}`)
      if (key.includes('制氧')) {
        spaceIds.forEach((sid) => {
          const d = spaceDataById.value[String(sid)]
          console.log(
            `[verify] ${key} spaceId=${sid} spaceName=${d?.spaceName} circuits=${d?.circuits?.length} scenes=${d?.scenes?.length} 场景tagId=`,
            [...new Set((d?.scenes || []).map((s: any) => s.tagId ?? s.tagIds).filter(Boolean))],
          )
        })
        console.log(
          '[verify] 制氧区关联场景(tagId=7):',
          allTagScenes.value.filter((s: any) => String(s.tagId ?? s.tagIds) === '7').map((s: any) => s.planName),
        )
      }
      // 用所有可能的标点名更新（districtName 与 JSON 标点名写法可能不一致）
      getSpaceMarkerNames(spaceName).forEach((n) => {
        mapViewRef.value?.updateSpaceMarkerState?.(n, isOn)
      })
    } else if (hasError) {
      // 所有请求均失败时按无开启回路处理，标点置为熄灭（不写缓存，下次可重试）
      getSpaceMarkerNames(spaceName).forEach((n) => {
        mapViewRef.value?.updateSpaceMarkerState?.(n, false)
      })
    }
  } finally {
    spaceSceneLoadingMap.value[key] = false
  }
}

// 确保地块数据已加载（未加载且未请求中时发起请求，返回完整数据或 null）
async function ensureSpaceSceneData(spaceName: string): Promise<any | null> {
  const key = normalizeSpaceName(spaceName)
  const loaded = spaceSceneDataMap.value[key]
  if (loaded) return loaded
  if (spaceSceneLoadingMap.value[key]) return null
  await fetchSpaceSceneData(spaceName)
  return spaceSceneDataMap.value[key] || null
}

// 点击地块模式时批量请求所有地块（除首钢园北区）的场景数据（带缓存）
function fetchAllSpaceSceneData() {
  const spaces = spaceList.value;

  if (spaces.length === 0) {
    console.warn('[index] 暂无地块列表数据，请稍后再试')
    return
  }
  spaces.forEach((space: any) => {
    fetchSpaceSceneData(space.name)
  })
}

// 将已缓存的地块灯泡状态重放到标点上（标点创建晚于数据加载时，直接用缓存状态点亮/熄灭）
function applyAllSpaceMarkerStates() {
  spaceList.value.forEach((space: any) => {
    const key = normalizeSpaceName(space.name)
    const data = spaceSceneDataMap.value[key]
    // 优先用缓存的 _isOn；兼容旧缓存（无 _isOn 时按 circuits 实时判断）
    const isOn =
      data?._isOn ??
      (Array.isArray(data?.circuits) ? data.circuits.some((c: any) => c.status === '开启') : false)
    getSpaceMarkerNames(space.name).forEach((n) => {
      mapViewRef.value?.updateSpaceMarkerState?.(n, isOn)
    })
  })
}

// 从 getSceneSpaceApi 返回的 result.circuits 中获取当前地块的回路列表（与 scenes 同级）
function getSpaceCircuitListFromApi(spaceName: string): any[] {
  const data = spaceSceneDataMap.value[normalizeSpaceName(spaceName)];
  if (!data) return [];
  const list = data.circuits;
  if (!Array.isArray(list)) return []
  return list.map((item: any, idx: number) => ({
    ...item,
    _key: item.id || item.circuitId || `${spaceName}-${idx}`,
    name: item.circuitName || item.name || '回路' + (idx + 1),
  }))
}

const defaultColors = ['#52c41a', '#38bdf8', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

// 场景/回路列表缓存：模板中使用稳定的数组引用，避免每次渲染都生成新数组导致 vxe-table 递归更新
// 场景模式弹框列表：数据来自 scene/listPage 返回的有 tagId 的场景，按当前地块 id 匹配 tagId 过滤
const spaceSceneList = computed(() => {
  const space = spaceList.value.find((s: any) => s.name === normalizeSpaceName(currentSpaceName.value))
  if (!space) {
    console.warn('[index] 场景模式弹框：当前地块未匹配到 spaceList，', {
      currentSpaceName: currentSpaceName.value,
      normalizeName: normalizeSpaceName(currentSpaceName.value),
      spaceListNames: spaceList.value.map((s: any) => s.name),
    })
    return []
  }
  const matched = allTagScenes.value.filter((item: any) => String(getSceneTagId(item)) === String(space.id))
  if (allTagScenes.value.length && !matched.length) {
    console.warn('[index] 场景模式弹框：无匹配场景', {
      spaceName: space.name,
      spaceId: space.id,
      sceneTagIds: allTagScenes.value.map((item: any) => getSceneTagId(item)),
      sceneTagNames: allTagScenes.value.map((item: any) => item.tagName),
    })
  }
  return matched.map((item: any, idx: number) => ({
    ...item,
    id: item.id || item.sceneId || idx,
    // 名称字段兼容：接口字段为 sceneName / planName，统一回退到 name 供确认弹框等场景使用
    name: item.name || item.sceneName || item.planName || '-',
    sceneName: item.sceneName || item.planName || '-',
    color: defaultColors[idx % defaultColors.length],
    enabled: item.status === '开启' || item.enabled === true,
  }))
})
const spaceCircuitList = computed(() => getSpaceCircuitListFromApi(currentSpaceName.value))

// 四页签弹框回路概览（开启数/总回路数，来自 circuit/listPage）
const lightCircuitSummary = computed(() => {
  const list = lightCircuitList.value
  return {
    on: list.filter((c: any) => c.status === '开启').length,
    total: list.length
  }
})

// 地块浮层内的场景详情
function showSpaceSceneDetail(scene: any) {
  sceneDetailModalRef.value?.showDetail?.(scene)
}

// 地块浮层内场景开
async function handleSpaceSceneOn(scene: any) {
  return handleSceneAction(scene, '开启')
}

// 地块浮层内场景关
async function handleSpaceSceneOff(scene: any) {
  return handleSceneAction(scene, '关闭')
}

// 统一二次确认弹窗（提示样式：标题栏"提示" + 蓝色信息图标 + 动作词高亮，同 comprehensivePreview ConfirmModal）
const confirmModalRef = ref<InstanceType<typeof ConfirmModal> | null>(null)
function showLightConfirm(opts: {
  content: string
  okText?: string
  onOk: () => void | Promise<void>
}) {
  confirmModalRef.value?.showModal(opts)
}

// 接口业务失败（success=false）时全局拦截器仍会正常 resolve（return data），这里统一抛错，
// 避免出现"接口已报错（500/业务失败）却提示指令下发成功"的假成功问题
function throwIfControlFailed(res: any) {
  if (res && res.success === false) {
    throw new Error(res.message || '操作失败')
  }
  return res
}

// 四页签弹框全开（默认按 areaId 调 setAreaOpenApi；标点 id=477 特殊：调节目全控接口 /bems/lighting/program/allControl；标点 id=478 特殊：调按空间名控制接口 /bems/lighting/area/controlBySpaceName）
function handleLightAreaOn() {
  if (!lightAreaId.value) {
    message.warning('该标点无地块 ID，无法执行全开')
    return
  }
  showLightConfirm({
    content: lightIsSpecial477.value
      ? `确定要 <strong class="tip-action">全开</strong> 所有节目吗？`
      : lightIsSpecial478.value
        ? `确定要 <strong class="tip-action">全开</strong> 地块"1号馆"的所有区域吗？`
        : `确定要 <strong class="tip-action">全开</strong> 地块"${lightAreaName.value || '该标点'}"的所有回路吗？`,
    onOk: async () => {
      try {
        if (lightIsSpecial477.value) {
          // 标点 id=477：节目全控（POST，query 传 operationType），成功提示由全局拦截器统一弹出
          await throwIfControlFailed(await postProgramAllControl({ operationType: '开启' }))
          // 刷新节目列表，更新状态列（programState），失败不影响成功提示（全局拦截器已弹错）
          await loadLightPlanList().catch(() => {})
        } else if (lightIsSpecial478.value) {
          // 标点 id=478：按空间名控制地块全开（POST，query 传 spaceName + operationType，spaceName 固定"1号馆"）
          await throwIfControlFailed(await postControlBySpaceName({ spaceName: '1号馆', operationType: '开启' }))
          // 刷新区域列表，更新状态列，失败不影响成功提示（全局拦截器已弹错）
          await loadLightArea478List().catch(() => {})
        } else {
          await throwIfControlFailed(await setAreaOpenApi({ id: lightAreaId.value }))
          message.success('开启成功')
          // 刷新回路列表：表格状态与左上侧"已开启回路数/总回路数"同步更新，失败不影响成功提示
          await loadLightCircuit(lightAreaId.value).catch(() => {})
        }
      } catch (error) {
        // 全局拦截器已统一弹出错误提示，这里只记录日志
        console.error('全开失败:', error)
      }
    },
  })
}

// 四页签弹框全关（默认按 areaId 调 setAreaCloseApi；标点 id=477 特殊：调节目全控接口 /bems/lighting/program/allControl；标点 id=478 特殊：调按空间名控制接口 /bems/lighting/area/controlBySpaceName）
function handleLightAreaOff() {
  if (!lightAreaId.value) {
    message.warning('该标点无地块 ID，无法执行全关')
    return
  }
  showLightConfirm({
    content: lightIsSpecial477.value
      ? `确定要 <strong class="tip-action">全关</strong> 所有节目吗？`
      : lightIsSpecial478.value
        ? `确定要 <strong class="tip-action">全关</strong> 地块"1号馆"的所有区域吗？`
        : `确定要 <strong class="tip-action">全关</strong> 地块"${lightAreaName.value || '该标点'}"的所有回路吗？`,
    onOk: async () => {
      try {
        if (lightIsSpecial477.value) {
          // 标点 id=477：节目全控（POST，query 传 operationType），成功提示由全局拦截器统一弹出
          await throwIfControlFailed(await postProgramAllControl({ operationType: '关闭' }))
          // 刷新节目列表，更新状态列（programState），失败不影响成功提示（全局拦截器已弹错）
          await loadLightPlanList().catch(() => {})
        } else if (lightIsSpecial478.value) {
          // 标点 id=478：按空间名控制地块全关（POST，query 传 spaceName + operationType，spaceName 固定"1号馆"）
          await throwIfControlFailed(await postControlBySpaceName({ spaceName: '1号馆', operationType: '关闭' }))
          // 刷新区域列表，更新状态列，失败不影响成功提示（全局拦截器已弹错）
          await loadLightArea478List().catch(() => {})
        } else {
          await throwIfControlFailed(await setAreaCloseApi({ id: lightAreaId.value }))
          message.success('关闭成功')
          // 刷新回路列表：表格状态与左上侧"已开启回路数/总回路数"同步更新，失败不影响成功提示
          await loadLightCircuit(lightAreaId.value).catch(() => {})
        }
      } catch (error) {
        // 全局拦截器已统一弹出错误提示，这里只记录日志
        console.error('全关失败:', error)
      }
    },
  })
}

// 地块级全开（/plan/control：对当前板块匹配的场景循环调用 allOnApi，参数用场景自身数据，与场景模式弹框的匹配逻辑一致）
function handleSpaceAllOn(spaceName: string) {
  const space = spaceList.value.find((s: any) => s.name === normalizeSpaceName(spaceName))
  if (!space?.id) {
    message.warning('该地块无 ID，无法执行全开')
    return
  }
  // 场景模式同款匹配：板块 id（spaceList.id）与场景 tagId 对应，取该板块匹配的场景作为控制参数来源
  const scenes = allTagScenes.value.filter((item: any) => String(getSceneTagId(item)) === String(space.id))
  if (scenes.length === 0) {
    message.warning(`地块【${spaceName}】无匹配场景，无法执行全开`)
    return
  }
  showLightConfirm({
    content: `确定要 <strong class="tip-action">全开</strong> 地块"${spaceName}"的 ${scenes.length} 个场景吗？`,
    onOk: async () => {
      try {
        await Promise.all(
          scenes.map(async (scene: any) => {
            await throwIfControlFailed(
              await allOnApi({
                operationType: '开启',
                relIds: scene.relIds,
                relType: scene.relType,
                sceneId: scene.id,
              }),
            )
          }),
        )
        message.success(`【${spaceName}】全开指令已下发`)
      } catch (error) {
        // 全局拦截器已统一弹出错误提示，这里只记录日志
        console.error(`[bigGis] 地块 [${spaceName}] 全开失败:`, error)
      } finally {
        allModalVisible.value = false
      }
    },
  })
}

// 地块级全关（/plan/control：对当前板块匹配的场景循环调用 allOffApi，参数用场景自身数据，与场景模式弹框的匹配逻辑一致）
function handleSpaceAllOff(spaceName: string) {
  const space = spaceList.value.find((s: any) => s.name === normalizeSpaceName(spaceName))
  if (!space?.id) {
    message.warning('该地块无 ID，无法执行全关')
    return
  }
  // 场景模式同款匹配：板块 id（spaceList.id）与场景 tagId 对应，取该板块匹配的场景作为控制参数来源
  const scenes = allTagScenes.value.filter((item: any) => String(getSceneTagId(item)) === String(space.id))
  if (scenes.length === 0) {
    message.warning(`地块【${spaceName}】无匹配场景，无法执行全关`)
    return
  }
  showLightConfirm({
    content: `确定要 <strong class="tip-action">全关</strong> 地块"${spaceName}"的 ${scenes.length} 个场景吗？`,
    onOk: async () => {
      try {
        await Promise.all(
          scenes.map(async (scene: any) => {
            await throwIfControlFailed(
              await allOffApi({
                operationType: '关闭',
                relIds: scene.relIds,
                relType: scene.relType,
                sceneId: scene.id,
              }),
            )
          }),
        )
        message.success(`【${spaceName}】全关指令已下发`)
      } catch (error) {
        // 全局拦截器已统一弹出错误提示，这里只记录日志
        console.error(`[bigGis] 地块 [${spaceName}] 全关失败:`, error)
      } finally {
        allModalVisible.value = false
      }
    },
  })
}

// ==================== 一键开关场景信息（复用综合预览页：/plan/control 场景级控制） ====================
// 进入页面先查询所有场景（/scene/listPage），再按固定场景 id 过滤出目标场景（relIds / relType 等），全开/全关时作为 /plan/control 参数
const SCENE_ID = '2086280558308143106'
const sceneInfo = ref<any>(null)

/** 查询场景信息（/scene/listPage?pageNo=1&pageSize=999 全量查询后按场景 id 过滤） */
async function loadSceneInfo() {
  try {
    const data: any = await getLightingPlanAPiNew({ pageNo: 1, pageSize: 999 })
    // 兼容分页结构（records/list/result/data）与纯数组返回
    const records = Array.isArray(data) ? data : (data?.records || data?.list || data?.result || data?.data || [])
    const target = (records as any[]).find((item: any) => String(item.id) === String(SCENE_ID))
    sceneInfo.value = target || null
  } catch (error) {
    console.error('[bigGis] 查询场景信息失败:', error)
    sceneInfo.value = null
  }
}

// 一键全开（复用综合预览页：/plan/control 场景级控制）
function handleAllOn() {
  if (!sceneInfo.value) {
    message.warning('场景信息未加载，无法执行一键全开')
    return
  }
  showLightConfirm({
    content: '确定要 <strong class="tip-action">一键全开</strong> 所有地块灯光吗？',
    onOk: async () => {
      try {
        await throwIfControlFailed(
          await allOnApi({
            operationType: '开启',
            relIds: sceneInfo.value.relIds,
            relType: sceneInfo.value.relType,
            sceneId: sceneInfo.value.id || SCENE_ID,
          }),
        )
        message.success('一键全开指令已下发')
        fetchCircuitStats() // 刷新数据
      } catch (error) {
        // 全局拦截器已统一弹出错误提示，这里只记录日志
        console.error('一键全开失败:', error)
      }
    },
  })
}

// 一键全关（复用综合预览页：/plan/control 场景级控制）
function handleAllOff() {
  if (!sceneInfo.value) {
    message.warning('场景信息未加载，无法执行一键全关')
    return
  }
  showLightConfirm({
    content: '确定要 <strong class="tip-action">一键全关</strong> 所有地块灯光吗？',
    onOk: async () => {
      try {
        await throwIfControlFailed(
          await allOffApi({
            operationType: '关闭',
            relIds: sceneInfo.value.relIds,
            relType: sceneInfo.value.relType,
            sceneId: sceneInfo.value.id || SCENE_ID,
          }),
        )
        message.success('一键全关指令已下发')
        fetchCircuitStats() // 刷新数据
      } catch (error) {
        // 全局拦截器已统一弹出错误提示，这里只记录日志
        console.error('一键全关失败:', error)
      }
    },
  })
}

// 获取回路统计数据 - 参考综合预览逻辑
async function fetchCircuitStats() {
  try {
    const circuitData = await getAllCircuitApi()

    // 解析回路总数
    if (Array.isArray(circuitData)) {
      circuitStats.value.total = circuitData.length
      // 统计 status === '开启' 的回路数
      circuitStats.value.active = circuitData.filter((c: any) => c.status === '开启').length
    } else if (circuitData && typeof circuitData === 'object') {
      circuitStats.value.total = circuitData.total || circuitData.count || circuitData.length || 0
      circuitStats.value.active = circuitData.open || circuitData.active || 0
    }
  } catch (error) {
    console.error('获取回路统计数据失败:', error)
    // 设置默认值
    circuitStats.value = { total: 0, active: 0 }
  }
}


// 全量场景列表：scene/listPage 返回的有 tagId 的场景（场景模式弹框按地块 id 匹配 tagId 使用）
const allTagScenes = ref<any[]>([])
const tagSceneListLoading = ref(false)

// relType==='回路' 的场景详情暂存回路（键为场景 tagId，即地块 district id）：
// scene/detail 对 relType==='回路' 的场景直接返回 circuitList（areaList 为 null，顶层 tagId 标识归属标签，circuits 项不带 tagId），
// 这类回路 scene/space 接口可能不返回，暂存后按 tagId 归并到对应 space 查回的 circuits 中
const tagCircuitMap = new Map<string, any[]>()
// tagId → 包含的 spaceId 集合：由 relType==='区域' 场景详情的 areaList.space 汇总（现有逻辑，tagId 可能包含多个 space），
// relType==='回路' 的暂存回路按此映射找到归属 space，与 getSceneSpaceApi 按 space 查回的 circuits 合并
const tagSpaceMap = new Map<string, Set<number>>()

// 查询所有场景并过滤出有 tagId 的场景（带加载中防重）
async function fetchTagSceneList(): Promise<any[]> {
  if (tagSceneListLoading.value) return allTagScenes.value
  tagSceneListLoading.value = true
  try {
    const data: any = await getLightingPlanAPiNew({ pageNo: 1, pageSize: 999 })
    // 兼容分页结构（records/list/result/data）与纯数组返回
    const records = Array.isArray(data) ? data : (data?.records || data?.list || data?.result || data?.data || [])
    allTagScenes.value = (records as any[]).filter((item: any) => getSceneTagId(item) != null)
    return allTagScenes.value
  } catch (error) {
    console.error('[index] 查询场景列表失败:', error)
    return []
  } finally {
    tagSceneListLoading.value = false
  }
}

// 获取所有片区（标签）数据并组装最终 spaceId 列表：
// 标签列表来自 district/listPage（id/name 以接口为准，不兜底），坐标由 space-boundaries.json 按 id 精确匹配组装；
// 标签 id 即场景（scene/listPage）的 tagId；
// 标签下包含的地块 = 该 tagId 所有场景详情（/scene/detail）areaList.space 的并集，作为 /scene/space 请求来源
async function fetchAllDistrictTags() {
  try {
    // 每次重新抓取前清空暂存与归属映射，避免重复调用时数据重复累积
    tagCircuitMap.clear()
    tagSpaceMap.clear()
    // 1. 查询所有场景（scene/listPage），只保留有 tagId 的场景（无 tagId 的场景过滤掉）
    const tagScenes = await fetchTagSceneList()

    // 2. 并行查询所有场景详情（一次发起，便于核对调用个数），取 areaList 下的 space 字段：
    // 全局去重为最终 spaceId 数组；按引用它的场景 tagId 归属到对应标签（标签与地块的包含关系，不再看 area 自身字段）
    const spaceIdSet = new Set<number>()
    await Promise.all(
      tagScenes.map(async (scene: any) => {
        const sceneTagId = getSceneTagId(scene)
        if (sceneTagId == null) return
        try {
          const detail: any = await planDetailApiNew({ id: scene.id })
          // relType==='回路'：areaList 一定为 null，detail 直接返回对应回路的 circuitList（顶层 tagId 标识归属标签）；
          // 该 tagId 可能包含多个 space，先把回路列表按 tagId 暂存，后续与各 space 查回的 circuits 合并
          if (detail?.relType === '回路' && Array.isArray(detail?.circuitList) && detail.circuitList.length) {
            const detailTagId = getSceneTagId(detail) ?? getSceneTagId(scene)
            if (detailTagId != null) {
              if (!tagCircuitMap.has(String(detailTagId))) tagCircuitMap.set(String(detailTagId), [])
              tagCircuitMap.get(String(detailTagId))!.push(...detail.circuitList)
            }
          }
          const areaList = Array.isArray(detail?.areaList) ? detail.areaList : []
          areaList.forEach((area: any) => {
            const sid = Number(area?.space)
            if (isNaN(sid) || sid <= 0) return
            spaceIdSet.add(sid)
            if (!tagSpaceMap.has(String(sceneTagId))) tagSpaceMap.set(String(sceneTagId), new Set())
            tagSpaceMap.get(String(sceneTagId))!.add(sid)
          })
        } catch (error) {
          console.error(`[index] 场景详情获取失败(场景 ${scene.id}):`, error)
        }
      }),
    )
    finalSpaceIdList.value = Array.from(spaceIdSet)

    // 3. allSpaceIdList 直接用最终 spaceId 数组组装（用于运行时长查询）
    allSpaceIdList.value = finalSpaceIdList.value.map(String)

    // 4. 填充标签列表 spaceList（district/listPage）：
    // id/name 以接口为准（不兜底）；坐标按 id 精确匹配 space-boundaries.json（spaceid 与接口 id 对应）
    const res: any = await getAllSpaceApi('1') // district/listPage，页面已有封装（type 传 "1"：只取地块数据）
    const list = Array.isArray(res) ? res : (res?.records || res?.list || res?.result || res?.data || [])
    if (list.length > 0) {
      spaceList.value = list.map((space: any, index: number) => {
        const boundary = spaceBoundariesData.find((b: any) => String(b.spaceid) === String(space.id))
        return {
          id: space.id,
          name: space.districtName,
          spaceIds: Array.from(tagSpaceMap.get(String(space.id)) ?? []),
          color: DEFAULT_SPACE_COLORS[index % DEFAULT_SPACE_COLORS.length],
          enabled: false,
          // 坐标组装：json 按 id 精确匹配（无匹配不带坐标，不按名称兜底）
          ...(boundary ? { path: boundary.path, center: boundary.center, lon: boundary.lon, lat: boundary.lat } : {}),
        }
      })
      // 【临时验证】打印各地块 spaceIds 归属，排查制氧区回路个数问题（验证完删除）
      spaceList.value.forEach((s: any) => {
        console.log(`[verify] 地块 id=${s.id} name=${s.name} spaceIds=`, s.spaceIds)
      })
      // 校验：仍有 spaceId 无任何标签场景引用（不会被请求）
      const lostSpaceIds = finalSpaceIdList.value.filter((sid) => !spaceList.value.some((s: any) => s.spaceIds.includes(sid)))
      if (lostSpaceIds.length) {
        console.warn('[index] 以下 spaceId 无任何标签场景引用，不会发起请求:', lostSpaceIds)
      }
      // 初始化后批量请求各地块场景数据（填充左侧场景列表与标点亮灭状态）
      fetchAllSpaceSceneData()
    }
  } catch (error) {
    console.error('获取片区数据(district/listPage)失败:', error)
  }
}

// 获取所有地块 ID（用于运行时长查询）
async function fetchAllSpaceIds() {
  try {
    const res: any = await getAllSpaceApi('1')
    // 兼容分页结构（records/list/result/data）与纯数组返回
    const list = Array.isArray(res) ? res : (res?.records || res?.list || res?.result || res?.data || [])
    // 新接口字段：id / districtName
    allSpaceIdList.value = list.map((item: any) => item.id).filter(Boolean)
    // 注意：不再用 getAllSpaceApi 的旧 spaceIds 字段初始化 spaceList / 发起 /scene/space 请求，
    // spaceList 与 space 请求统一由 fetchAllDistrictTags（detail 全部完成后）驱动，避免在 detail 之前提前调用
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

// 显示场景详情（先清除地图上的所有绘制，再打开详情弹窗）
function showSceneDetail(scene: any) {
  mapViewRef.value?.clearAllDrawings?.()
  mapViewRef.value?.clearLightingMarkers?.()
  sceneDetailModalRef.value?.showDetail(scene)
}

// 场景开/关通用操作
async function handleSceneAction(scene: any, action: '开启' | '关闭') {
  const actionText = action
  return new Promise<void>((resolve, reject) => {
    if (!confirmModalRef.value) {
      resolve()
      return
    }
    confirmModalRef.value.showModal({
      content: `确定要 <strong class="tip-action">${actionText}</strong> 场景"${scene.name || scene.sceneName || '-'}"吗？`,
      onOk: async () => {
        try {
          await throwIfControlFailed(
            await postSceneControlApi({
              sceneId: scene.id,
              operationType: action
            })
          )
          message.success(`${actionText}成功`)
          scene.enabled = action === '开启'
          await fetchCircuitStats()
          resolve()
        } catch (error) {
          // 全局拦截器已统一弹出错误提示，这里只记录日志
          console.error(`场景${actionText}失败:`, error)
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

// "详情模式"按钮 - 显示所有标点，清除地块
function handleShowDetails() {
  // 切换激活状态（再点一次取消）
  activeMode.value = activeMode.value === 'detail' ? null : 'detail'

  // 先清除地块绘制（如果存在）
  mapViewRef.value?.clearAllDrawings?.()

  // 激活时添加标点（数据已在初始化时加载）
  if (activeMode.value === 'detail') {
    mapViewRef.value?.AddLightingMarker?.()
  }
}

// 详情模式标点点击（仅单条数据时触发）：详情模式下打开四页签弹框，其他情况保持原灯光详情弹窗
function onLightMarkerSingleClick(data: any) {
  if (activeMode.value !== 'detail') {
    // 非详情模式：点击列表项后收起列表（保持原行为），打开原灯光详情弹窗
    mapViewRef.value?.collapseMarkerList?.()
    mapViewRef.value?.openLightDetail?.(data)
    return
  }
  openLightTabsModal(data)
}

// 打开标点四页签弹框（回路概览/一键开关/监控视频/详情），回路数据按 areaId 查询 circuit/listPage
async function openLightTabsModal(data: any) {
  const spaceName = data?.spaceName || ''
  const areaId = data?.id
  // 标点无地块归属或 areaId 时回退到原灯光详情弹窗
  if (!spaceName || !areaId) {
    mapViewRef.value?.openLightDetail?.(data)
    return
  }
  currentSpaceName.value = spaceName
  lightTabsModalVisible.value = true
  lightAreaId.value = String(areaId)
  lightAreaName.value = data?.areaName || ''
  lightVideoUrl.value = data?.monitorAdr ? MONITOR_BASE_URL + data.monitorAdr : ''
  // 标点 id=477/478 特殊处理：不按区域 id 查回路，477 展示节目列表、478 展示区域列表
  const isSpecial477 = String(areaId) === '477'
  const isSpecial478 = String(areaId) === '478'
  lightIsSpecial477.value = isSpecial477
  lightIsSpecial478.value = isSpecial478
  lightPlanList.value = []
  lightArea478List.value = []
  detailModalLoading.value = true
  try {
    if (isSpecial477) {
      await loadLightPlanList()
    } else if (isSpecial478) {
      // 标点 id=478：调 area/listBySpaceName（id 固定传 1）展示区域列表
      await loadLightArea478List()
    } else {
      // 回路概览/详情数据：按 areaId 查询 circuit/listPage
      await loadLightCircuit(String(areaId))
    }
  } finally {
    detailModalLoading.value = false
  }
}

// 刷新四页签弹框列表（一键开关页签：回路/节目/区域列表）
async function refreshLightTabsModal() {
  if (detailModalLoading.value) return
  detailModalLoading.value = true
  try {
    if (lightIsSpecial477.value) {
      await loadLightPlanList()
    } else if (lightIsSpecial478.value) {
      await loadLightArea478List()
    } else {
      await loadLightCircuit(String(lightAreaId.value))
    }
    message.success('刷新成功')
  } catch (error) {
    console.error('刷新失败:', error)
  } finally {
    detailModalLoading.value = false
  }
}

// 加载节目列表（独立节目接口 /bems/lighting/program/list），供标点 id=477 弹框展示（节目名称/状态/开/关）
async function loadLightPlanList() {
  const data: any = await getLightingProgramList({ pageNo: 1, pageSize: 999 })
  // 兼容分页结构（records/list/result/data）与纯数组返回
  const records = Array.isArray(data) ? data : (data?.records || data?.list || data?.result || data?.data || [])
  lightPlanList.value = (records as any[]).map((item: any, idx: number) => ({
    ...item,
    id: item.id || idx,
    name: item.programName,
    enabled: item.programStatus === '开启' || item.enabled === true,
  }))
}

// 节目开/关（标点 id=477 弹框）：GET /bems/lighting/program/control，传 operationType + programId
function handleProgramAction(row: any, action: '开启' | '关闭') {
  return new Promise<void>((resolve, reject) => {
    if (!confirmModalRef.value) {
      resolve()
      return
    }
    confirmModalRef.value.showModal({
      content: `确定要 <strong class="tip-action">${action}</strong> 节目"${row.name || row.programName || '-'}"吗？`,
      onOk: async () => {
        try {
          await throwIfControlFailed(
            await getLightingProgramControl({
              operationType: action,
              programId: row.id
            })
          )
          message.success(`${action}成功`)
          // 刷新节目列表，更新状态列（programState）
          await loadLightPlanList()
          resolve()
        } catch (error) {
          // 全局拦截器已统一弹出错误提示，这里只记录日志
          console.error(`节目${action}失败:`, error)
          reject(error)
        }
      },
      onCancel: () => {
        resolve()
      }
    })
  })
}

// 加载标点 id=478 的区域列表（GET /bems/lighting/area/listBySpaceName，id 固定传 1）
async function loadLightArea478List() {
  const data: any = await getAreaListBySpaceName({ id: 1 })
  // 兼容分页结构（records/list/result/data）与纯数组返回
  const records = Array.isArray(data) ? data : (data?.records || data?.list || data?.result || data?.data || [])
  lightArea478List.value = (records as any[]).map((item: any, idx: number) => ({
    ...item,
    id: item.id || item.areaId || idx,
    name: item.name || item.areaName || '区域' + (idx + 1),
    status: item.status || item.state || item.areaState || '关闭',
  }))
}

// 标点 id=478 弹框行级开/关（复用区域开/关接口 area/open、area/close，query 传行 id）
function handleArea478Action(row: any, action: '开启' | '关闭') {
  if (!row.id) {
    message.warning('该区域无 ID，无法执行操作')
    return
  }
  const actionText = action === '开启' ? '开启' : '关闭'
  showLightConfirm({
    content: `确定要 <strong class="tip-action">${actionText}</strong> 区域"${row.name || '-'}"吗？`,
    onOk: async () => {
      try {
        if (action === '开启') {
          await throwIfControlFailed(await setAreaOpenApi({ id: row.id }))
        } else {
          await throwIfControlFailed(await setAreaCloseApi({ id: row.id }))
        }
        message.success(`${actionText}成功`)
        // 刷新区域列表，更新状态列
        await loadLightArea478List()
      } catch (error) {
        // 全局拦截器已统一弹出错误提示，这里只记录日志
        console.error(`区域${actionText}失败:`, error)
      }
    },
  })
}

// 按 areaId 查询地块回路列表（circuit/listPage），供四页签弹框的回路概览与详情展示
async function loadLightCircuit(areaId: string) {
  const res: any = await getCircuitListApi({ pageSize: 999, areaId })
  // 分页结构返回 records，兼容纯数组
  const list = Array.isArray(res) ? res : (res?.records || res?.list || res?.result || res?.data || [])
  lightCircuitList.value = list.map((item: any, idx: number) => ({
    ...item,
    _key: item.id || item.circuitId || `light-${areaId}-${idx}`,
    name: item.circuitName || item.name || '回路' + (idx + 1),
  }))
}

// 加载地块视频列表（按地块 spaceId 查询，不再写死）
async function loadSpaceVideoList(spaceName: string) {
  videoLoading.value = true
  try {
    const space = spaceList.value.find((s: any) => s.name === normalizeSpaceName(spaceName))
    const res: any = await getVideoListBySpaceApi(space?.id ? String(space.id) : '')
    spaceVideoList.value = Array.isArray(res) ? res : (res?.result || res?.data || [])
  } catch (error) {
    console.error('获取地块视频列表失败:', error)
    spaceVideoList.value = []
  } finally {
    videoLoading.value = false
  }
}

// 构建视频播放地址（直接用返回结果的 videoAddress 完整地址，不拼接）
function getVideoPlayUrl(item: any) {
  const adr = item?.videoAddress
  return adr || SPACE_VIDEO_PLACEHOLDER
}

onMounted(() => {
  // 初始化：加载 district/all 填充地块列表 spaceList，并批量请求各地块场景数据（更新标点亮灭）
  fetchAllDistrictTags()
  // 初始化时获取回路统计数据
  fetchCircuitStats()
  // 获取各地块运行时长对比
  fetchRunTimeCompare()
  // 加载一键开关所需的场景信息（/plan/control 参数来源）
  loadSceneInfo()
})
</script>

<style scoped>
.big-gis-page {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  /* 大屏底：深蓝黑底 + 顶部青色光晕 + 细网格纹理（地图加载间隙同样保持科技感） */
  background-color: #050d1a;
  background-image:
    radial-gradient(ellipse 65% 45% at 50% -8%, rgba(0, 150, 255, 0.16) 0%, transparent 62%),
    radial-gradient(ellipse 45% 35% at 100% 105%, rgba(0, 200, 255, 0.1) 0%, transparent 60%),
    linear-gradient(rgba(0, 200, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 200, 255, 0.04) 1px, transparent 1px);
  background-size: auto, auto, 2.5vw 2.5vw, 2.5vw 2.5vw;
  /* 修复地图滚动问题：允许滚轮事件穿透 */
  overflow: visible;
}

/* 底部居中控制按钮 */
.bottom-controls {
  position: absolute;
  left: 50%;
  bottom: 0.32rem;
  transform: translateX(-50%);
  z-index: 60000;  /* 高于地图标点，确保不被遮挡 */
  display: flex;
  gap: 1.2rem;
}

.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.08rem;
  padding: 0.1rem 0.16rem;
  min-width: 1.04rem;
  background: linear-gradient(135deg, rgba(10, 34, 60, 0.92) 0%, rgba(4, 20, 42, 0.92) 100%);
  border: 1.5px solid rgba(0, 217, 255, 0.55);
  border-radius: 0.06rem;
  color: #8fe8ff;
  font-size: 0.14rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 
    0 0.04rem 0.16rem rgba(0, 150, 230, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-shadow: 0 0 0.08rem rgba(0, 217, 255, 0.5);
}

/* 外边框光晕层 */
.ctrl-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(0, 217, 255, 0.14) 0%,
    rgba(0, 150, 255, 0.07) 100%
  );
  opacity: 0.6;
  pointer-events: none;
}

/* 内发光和高光层 */
.ctrl-btn::after {
  content: '';
  position: absolute;
  inset: 1px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0) 50%,
    rgba(255, 255, 255, 0.04) 100%
  );
  pointer-events: none;
}

/* 图标样式 */
.ctrl-btn svg {
  width: 0.2rem;
  height: 0.2rem;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 0.04rem rgba(0, 0, 0, 0.3)) drop-shadow(0 0 0.06rem rgba(0, 217, 255, 0.5));
  transition: all 0.3s ease;
}

/* 文字提升层级，避免被光晕层覆盖 */
.ctrl-btn span {
  position: relative;
  z-index: 1;
}

/* Hover 效果（未激活时也可感知可点击） */
.ctrl-btn:hover {
  background: linear-gradient(135deg, rgba(13, 46, 82, 0.95) 0%, rgba(6, 30, 60, 0.95) 100%);
  border-color: rgba(0, 240, 255, 0.95);
  color: #fff;
  transform: translateY(-0.03rem);
  box-shadow: 
    0 0.08rem 0.24rem rgba(0, 180, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.ctrl-btn:hover::before {
  opacity: 1;
}

.ctrl-btn:hover svg {
  filter: drop-shadow(0 0.04rem 0.08rem rgba(0, 0, 0, 0.4)) drop-shadow(0 0 0.12rem rgba(0, 217, 255, 0.9));
}

/* 激活状态 - 亮青实心填充 + 发光 + 底部指示条，与未激活深底形成强烈反差 */
.ctrl-btn.is-active {
  background: linear-gradient(135deg, #00d9ff 0%, #00a6ff 100%);
  border-color: rgba(255, 255, 255, 0.95);
  color: #fff;
  text-shadow: 0 0 0.1rem rgba(255, 255, 255, 0.9), 0 0 0.2rem rgba(0, 217, 255, 0.7);
  box-shadow: 
    0 0.06rem 0.28rem rgba(0, 220, 255, 0.8),
    0 0 0.18rem rgba(0, 220, 255, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -0.03rem 0 #ffffff;
  animation: ctrlBtnActivePulse 2.2s ease-in-out infinite;
}

/* 激活状态呼吸发光动画 */
@keyframes ctrlBtnActivePulse {
  0%, 100% {
    box-shadow: 
      0 0.06rem 0.28rem rgba(0, 220, 255, 0.8),
      0 0 0.14rem rgba(0, 220, 255, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.45),
      inset 0 -0.03rem 0 #ffffff;
  }
  50% {
    box-shadow: 
      0 0.06rem 0.32rem rgba(0, 220, 255, 1),
      0 0 0.26rem rgba(0, 220, 255, 0.75),
      inset 0 1px 0 rgba(255, 255, 255, 0.45),
      inset 0 -0.03rem 0 #ffffff;
  }
}

.ctrl-btn.is-active::before {
  opacity: 1;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(0, 220, 255, 0.2) 100%);
}

.ctrl-btn.is-active::after {
  opacity: 0.7;
}

.ctrl-btn.is-active svg {
  filter: drop-shadow(0 0 0.08rem rgba(255, 255, 255, 0.9)) drop-shadow(0 0 0.16rem rgba(0, 220, 255, 1));
  transform: scale(1.08);
}

.ctrl-btn.is-active span {
  text-shadow: 0 0 0.12rem rgba(255, 255, 255, 0.95), 0 0 0.24rem rgba(0, 230, 255, 0.8);
}

/* 左上角控制按钮（位置用 vw/vh，随视口自适应） */
.top-left-controls {
  position: absolute;
  left: 1.05vw;  /* 0.2rem @1920 */
  top: 10.5vh;    /* 1.13rem @1080，位置下移避免遮挡地图内容 */
  z-index: 60000;  /* 高于地图标点（最高50000），确保不被遮挡 */
}

/* 控制开关按钮 - 矩形风格 */
.control-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.417vw;
  padding: 0.729vw 1.25vw;  /* 0.14rem 0.24rem @1920，随屏缩放 */
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.85) 0%, rgba(0, 20, 40, 0.75) 100%);
  backdrop-filter: blur(0.12rem);
  border: 1px solid rgba(0, 150, 255, 0.4);
  border-radius: 0.417vw;
  color: #00d9ff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 
    0 0 1.042vw rgba(0, 150, 255, 0.2),
    0 0.208vw 0.833vw rgba(0, 100, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.control-toggle-btn .toggle-text {
  font-size: 0.781vw;  /* 0.15rem @1920 */
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: 0.052vw;
  text-shadow: 0 0 0.417vw rgba(0, 217, 255, 0.6);
}

.control-toggle-btn svg {
  flex-shrink: 0;
  width: 1.25vw;  /* 0.24rem @1920，覆盖模板固定属性，随屏缩放 */
  height: 1.25vw;
  filter: drop-shadow(0 0 0.208vw rgba(0, 217, 255, 0.6));
}

/* Hover效果 */
.control-toggle-btn:hover {
  background: linear-gradient(135deg, rgba(0, 40, 80, 0.9) 0%, rgba(0, 30, 60, 0.85) 100%);
  border-color: rgba(0, 217, 255, 0.6);
  box-shadow: 
    0 0.06rem 0.24rem rgba(0, 150, 255, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* Click效果 */
.control-toggle-btn:active {
  transform: translateY(0);
}

/* 控制面板 - 简洁玻璃底（无边框/角标装饰） */
.control-panel {
  position: absolute;
  left: 0;
  top: 3.333vw;  /* 按钮放大后下移，确保在图标下方 */
  width: 22.917vw;  /* 4.4rem @1920，随屏缩放 */
  z-index: 60000;  /* 高于地图标点，确保不被遮挡 */
  max-height: calc(100vh - 3.646vw);
  background: linear-gradient(180deg, rgba(14, 32, 56, 0.88) 0%, rgba(8, 20, 38, 0.88) 100%);
  border-radius: 0.417vw;
  backdrop-filter: blur(0.12rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.control-panel .panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.521vw;
}

.control-panel .panel-body::-webkit-scrollbar {
  width: 0.06rem;
}

.control-panel .panel-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.control-panel .panel-body::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.3);
  border-radius: 0.03rem;
}

/* 面板主体 */
.panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.521vw;
  padding: 0.521vw;
  overflow-y: auto;
}

/* 三个独立模块卡片 - 统一风格 */
.module-card {
  background: rgba(0, 30, 60, 0.5);
  border: 1px solid rgba(0, 150, 255, 0.2);
  border-radius: 0.313vw;
  padding: 0.521vw 0.625vw;
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

/* 统计区域 */
.stat-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.08rem;
}

.stat-label {
  color: rgba(0, 217, 255, 0.7);  /* 青色 */
  font-size: 0.15rem;
  font-weight: 500;
  white-space: nowrap;  /* 保证与数字同行不换行 */
}

.stat-value {
  color: #00d9ff;  /* 青色亮色 */
  font-size: 0.22rem;  /* 数字放大突出 */
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  text-shadow: 0 0 0.08rem rgba(0, 217, 255, 0.6);
}

.highlight-text {
  color: #00d9ff;  /* 青色高亮 */
  font-weight: 700;
  text-shadow: 0 0 0.1rem rgba(0, 217, 255, 0.8);
}

.number {
  font-variant-numeric: tabular-nums;
}

/* 一键操作区域 */
.mini-action-group {
  display: flex;
  gap: 0.08rem;
  justify-content: center;
}

.icon-btn {
  display: flex;
  align-items: center;
  gap: 0.06rem;
  padding: 0.08rem 0.14rem;  /* 调整内边距 */
  background: rgba(56, 189, 248, 0.15);  /* 稍微提高 */
  border: 1px solid rgba(56, 189, 248, 0.3);  /* 恢复边框 */
  border-radius: 0.04rem;  /* 参考图的小圆角 */
  color: #38bdf8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn.with-text {
  width: auto;
  min-width: 0.56rem;
}

.icon-btn .btn-text {
  font-size: 0.14rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.icon-btn:hover {
  background: rgba(56, 189, 248, 0.2);
  border-color: rgba(56, 189, 248, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 0.04rem 0.12rem rgba(56, 189, 248, 0.2);
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

/* 左侧一键开关按钮：主体颜色对齐弹框全开/全关按钮（绿/红） */
.mini-action-group .icon-btn:first-child {
  background: rgba(0, 200, 120, 0.15);
  border-color: rgba(0, 200, 120, 0.45);
  color: #00e676;
}

.mini-action-group .icon-btn:first-child:hover {
  background: rgba(0, 200, 120, 0.3);
  border-color: rgba(0, 200, 120, 0.7);
  box-shadow: 0 0 0.14rem rgba(0, 200, 120, 0.3);
}

.mini-action-group .icon-btn.dark-btn {
  background: rgba(255, 80, 80, 0.15);
  border-color: rgba(255, 80, 80, 0.45);
  color: #ff5252;
}

.mini-action-group .icon-btn.dark-btn:hover {
  background: rgba(255, 80, 80, 0.3);
  border-color: rgba(255, 80, 80, 0.7);
  box-shadow: 0 0 0.14rem rgba(255, 80, 80, 0.3);
}

/* 地块列表区域 */
.space-section {
  flex: 1;
  min-height: 0;
}

.section-title {
  color: #00d9ff;  /* 青色，科技发光 */
  font-size: 0.781vw;  /* 0.15rem @1920 */
  font-weight: 600;
  padding: 0 0 0.417vw 0.417vw;
  margin-bottom: 0.417vw;
  border-left: 0.104vw solid rgba(0, 150, 255, 0.6);
  text-transform: none;
  letter-spacing: normal;
  text-shadow: 0 0 0.417vw rgba(0, 217, 255, 0.6);
  border-bottom: 1px dashed rgba(0, 150, 255, 0.2);
}

/* 场景列表标题行：标题 + 区域筛选下拉框 */
.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.417vw;
}

.section-title-row .section-title {
  margin-bottom: 0;
}

/* 区域筛选下拉框本体：深色底 + 紧凑高度（与场景行按钮协调） */
.scene-area-select :deep(.ant-select-selector) {
  background: rgba(0, 20, 45, 0.9) !important;
  border-color: rgba(0, 150, 255, 0.4) !important;
  border-radius: 0.04rem !important;
  height: 0.2rem !important;
  font-size: 0.14rem;
  display: flex;
  align-items: center;
}

.scene-area-select :deep(.ant-select-selection-placeholder),
.scene-area-select :deep(.ant-select-selection-item) {
  color: #8fe8ff;
  line-height: 0.2rem !important;
}

/* 搜索输入文字 + 清除按钮（X）：深色透明底，与整体风格一致 */
.scene-area-select :deep(.ant-select-selection-search-input) {
  color: #e8f4ff;
}

/* 选中文字（含「全部」）：青色发光，选中态清晰可见 */
.scene-area-select :deep(.ant-select-selection-item) {
  color: #00e5ff !important;
  text-shadow: 0 0 0.06rem rgba(0, 217, 255, 0.6);
}

.scene-area-select :deep(.ant-select-clear) {
  background: rgba(0, 60, 110, 0.6);
  color: rgba(143, 232, 255, 0.85);
  border-radius: 50%;
  font-size: 0.1rem;
  width: 0.14rem;
  height: 0.14rem;
  right: 0.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.scene-area-select :deep(.ant-select-clear:hover) {
  color: #00e5ff;
  background: rgba(0, 100, 170, 0.85);
  box-shadow: 0 0 0.08rem rgba(0, 217, 255, 0.5);
}

.scene-area-select :deep(.ant-select-arrow) {
  color: rgba(0, 217, 255, 0.7);
}

/* 虚拟滚动容器 - 限制高度，支持滚动 */
.space-list-scroll-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  max-height: 30vh;  /* 3.2rem @1080，高度随视口 */
  padding-right: 0.208vw;  /* 留出滚动条空间 */
}

/* 自定义滚动条 - 科技感 */
.space-list-scroll-container::-webkit-scrollbar {
  width: 0.05rem;
}

.space-list-scroll-container::-webkit-scrollbar-track {
  background: rgba(0, 30, 60, 0.2);
  border-radius: 0.03rem;
}

.space-list-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.4);
  border-radius: 0.03rem;
  transition: background 0.3s ease;
}

.space-list-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 200, 255, 0.6);
}

.space-list {
  display: flex;
  flex-direction: column;
  gap: 0.06rem;
}

.space-item-row {
  display: flex;
  align-items: center;
  gap: 0.365vw;
  padding: 0.469vw 0.365vw;  /* 0.09rem 0.07rem @1920 */
  background: transparent;  /* 完全透明 */
  border: none;  /* 移除边框 */
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.space-item-row:hover {
  background: rgba(56, 189, 248, 0.15);  /* 更明显的 hover 效果 */
  border-color: transparent;
  transform: translateX(0.03rem);  /* 增强左移效果 */
}

.space-item-row:active {
  transform: translateX(0);
}

.scene-indicator-icon {
  width: 0.12rem;
  height: 0.12rem;
  min-width: 0.12rem;
  border-radius: 0.04rem;
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
  font-size: 0.781vw;  /* 0.15rem @1920 */
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 0 0.313vw rgba(0, 217, 255, 0.5);
}

/* 详情按钮 */
.detail-btn {
  padding: 0.208vw 0.417vw;
  height: auto;
  min-width: 1.563vw;
  background: rgba(0, 150, 255, 0.25);
  border: 1px solid rgba(0, 180, 255, 0.55);
  border-radius: 0.26vw;
  color: #ffffff;
  font-size: 0.781vw;  /* 0.15rem @1920 */
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-right: 0.208vw;
}

.detail-btn:hover {
  background: rgba(0, 170, 255, 0.4);
  border-color: rgba(0, 200, 255, 0.8);
  transform: translateY(-1px);
}

/* 场景开/关按钮组 */
.scene-btn-group {
  display: flex;
  gap: 0.03rem;
  flex-shrink: 0;
}

.scene-action-btn {
  padding: 0.26vw 0.469vw;
  height: auto;
  min-width: 1.25vw;
  border-radius: 0.156vw;
  font-size: 0.781vw;  /* 0.15rem @1920 */
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
  box-shadow: 0 0 0.1rem rgba(0, 200, 120, 0.3);
}

.scene-action-btn.off-btn {
  background: rgba(255, 80, 80, 0.15);
  border: 1px solid rgba(255, 80, 80, 0.4);
  color: #ff5252;
}

.scene-action-btn.off-btn:hover {
  background: rgba(255, 80, 80, 0.3);
  border-color: rgba(255, 80, 80, 0.6);
  box-shadow: 0 0 0.1rem rgba(255, 80, 80, 0.3);
}

/* ========== 右上角统计面板 - 科技蓝主题 ========== */
.top-right-controls {
  position: absolute;
  top: 10.5vh;  /* 1.13rem @1080，与左上角整体管控按钮同步下移，随视口自适应 */
  right: 1.25vw;  /* 0.24rem @1920 */
  z-index: 60000;  /* 高于地图标点（最高50000），确保统计面板不被遮挡 */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.521vw;
}

/* 统计切换按钮 - 精致科技风 */
.stats-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.417vw;
  padding: 0.729vw 1.25vw;  /* 0.14rem 0.24rem @1920，随屏缩放 */
  background: linear-gradient(135deg, rgba(0, 30, 60, 0.85) 0%, rgba(0, 20, 40, 0.75) 100%);
  backdrop-filter: blur(0.12rem);
  border: 1px solid rgba(0, 150, 255, 0.4);
  border-radius: 0.417vw;
  color: #00d9ff;
  font-size: 0.781vw;  /* 0.15rem @1920 */
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;  /* 支撑 ::before 光晕层定位 */
  box-shadow: 
    0 0 1.042vw rgba(0, 150, 255, 0.2),
    0 0.208vw 0.833vw rgba(0, 100, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-shadow: 0 0 0.417vw rgba(0, 217, 255, 0.6);
}

.stats-toggle-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0.06rem;
  background: linear-gradient(135deg, rgba(0, 200, 255, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.stats-toggle-btn:hover {
  background: linear-gradient(135deg, rgba(0, 40, 80, 0.9) 0%, rgba(0, 30, 60, 0.85) 100%);
  border-color: rgba(0, 217, 255, 0.6);
  box-shadow: 
    0 0.06rem 0.24rem rgba(0, 150, 255, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.stats-toggle-btn:hover::before {
  opacity: 1;
}

.stats-toggle-btn:active {
  transform: translateY(0);
}

/* ===== 整体管控 / 统计按钮激活态（定义在所有 hover 之后，确保打开面板时高亮始终生效） ===== */
.control-toggle-btn::after,
.stats-toggle-btn::after {
  content: '';
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: -0.03rem;
  height: 0.03rem;
  border-radius: 0.015rem;
  background: linear-gradient(90deg, transparent, #00d9ff, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.control-toggle-btn.is-active,
.stats-toggle-btn.is-active {
  background: linear-gradient(135deg, rgba(0, 55, 105, 0.95) 0%, rgba(0, 35, 80, 0.92) 100%);
  border-color: rgba(0, 217, 255, 0.95);
  color: #00e5ff;
  box-shadow:
    0 0 0.24rem rgba(0, 200, 255, 0.45),
    0 0 0.6rem rgba(0, 180, 255, 0.2),
    inset 0 0 0.2rem rgba(0, 217, 255, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.control-toggle-btn.is-active .toggle-text,
.stats-toggle-btn.is-active .toggle-label {
  text-shadow: 0 0 0.3rem rgba(0, 229, 255, 0.9);
}

.control-toggle-btn.is-active::after,
.stats-toggle-btn.is-active::after {
  opacity: 1;
  box-shadow: 0 0 0.08rem rgba(0, 217, 255, 0.8);
}

/* 统计按钮图标 */
.stats-toggle-btn svg {
  flex-shrink: 0;
  width: 1.25vw;  /* 0.24rem @1920，覆盖模板固定属性，随屏缩放 */
  height: 1.25vw;
  filter: drop-shadow(0 0 0.208vw rgba(0, 217, 255, 0.6));
}

.toggle-label {
  white-space: nowrap;
  letter-spacing: 0.026vw;
}

/* 统计面板 - 大屏科技风：发光边框 + 渐变玻璃底 */
.stats-panel {
  width: 25vw;  /* 4.8rem @1920，随屏缩放 */
  max-height: 52vh;  /* 5.6rem @1080，高度随视口 */
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(14, 32, 56, 0.88) 0%, rgba(8, 20, 38, 0.88) 100%);
  backdrop-filter: blur(0.12rem);
  border: 1px solid rgba(0, 217, 255, 0.35);
  border-radius: 0.417vw;
  box-shadow: 
    0 0 1.354vw rgba(0, 150, 255, 0.14),
    0 0.417vw 1.25vw rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 150, 255, 0.05);
  padding: 0.625vw;
  display: flex;
  flex-direction: column;
  gap: 0.625vw;
}

/* 滚动条美化 */
.stats-panel::-webkit-scrollbar {
  width: 0.06rem;
}

.stats-panel::-webkit-scrollbar-track {
  background: rgba(0, 30, 60, 0.2);
  border-radius: 0.03rem;
}

.stats-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.4);
  border-radius: 0.03rem;
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
  border-radius: 0.313vw;
  padding: 0.833vw;
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
  margin: 0 0 0.833vw 0;
  font-size: 0.729vw;  /* 0.14rem @1920 */
  font-weight: 600;
  color: #00d9ff;
  text-shadow: 0 0 0.625vw rgba(0, 217, 255, 0.5);
  letter-spacing: 0.042vw;
  display: flex;
  align-items: center;
  gap: 0.313vw;
}

.chart-section h4::before,
.table-section h4::before {
  content: '';
  width: 0.156vw;
  height: 0.729vw;
  background: linear-gradient(180deg, #00d9ff, #0088ff);
  border-radius: 0.104vw;
  box-shadow: 0 0 0.417vw rgba(0, 217, 255, 0.6);
}

/* 柱状图区域 - 优化宽度 */
.bar-chart-section {
  min-height: 10.417vw;  /* 2rem @1920 */
}

.bar-chart-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 7.813vw;  /* 1.5rem @1920 */
  padding: 0 0.208vw;
  gap: 0.417vw;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.06rem;
  flex: 1;
  max-width: 0.7rem;  /* 限制每个条目的最大宽度 */
}

.bar-wrapper {
  position: relative;
  width: 100%;
  height: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.bar-fill {
  width: 0.36rem;  /* 柱体宽度从0.48rem减小到0.36rem */
  min-width: 0.32rem;
  background: linear-gradient(180deg, rgba(0, 200, 255, 0.9) 0%, rgba(0, 100, 255, 0.7) 100%);
  border-radius: 0.04rem 0.04rem 0 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 0 0.12rem rgba(0, 150, 255, 0.5),
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
  border-radius: 0.04rem 0.04rem 0 0;
}

.bar-value {
  position: absolute;
  top: -0.2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.11rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 0 0.08rem rgba(0, 217, 255, 0.6);
  white-space: nowrap;
}

.bar-label {
  font-size: 0.12rem;  /* 字体从0.13rem减小到0.12rem */
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
  font-size: 0.125rem;
}

.runtime-table thead th {
  background: linear-gradient(180deg, rgba(0, 80, 150, 0.4) 0%, rgba(0, 50, 100, 0.25) 100%);
  color: rgba(0, 217, 255, 0.95);
  padding: 0.12rem 0.06rem;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;  /* 表头文字不换行 */
  border-bottom: 2px solid rgba(0, 150, 255, 0.35);
  text-shadow: 0 0 0.08rem rgba(0, 217, 255, 0.4);
  letter-spacing: 0.5px;
}

.runtime-table thead th:first-child {
  border-radius: 0.04rem 0 0 0;
}

.runtime-table thead th:last-child {
  border-radius: 0 0.04rem 0 0;
}

.runtime-table tbody td {
  padding: 0.11rem 0.1rem;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(0, 100, 180, 0.12);
  transition: all 0.2s ease;
}

.runtime-table tbody tr {
  transition: all 0.2s ease;
}

.runtime-table tbody tr:hover {
  background: rgba(0, 150, 255, 0.1);
  box-shadow: inset 0 0 0.12rem rgba(0, 150, 255, 0.1);
}

.runtime-table tbody tr:last-child td {
  border-bottom: none;
}

.runtime-table tbody td:first-child {
  color: #00d9ff;
  font-weight: 600;
  text-shadow: 0 0 0.06rem rgba(0, 217, 255, 0.4);
}

.runtime-table .change-positive {
  color: #00e676;
  font-weight: 700;
  text-shadow: 0 0 0.06rem rgba(0, 230, 118, 0.5);
}

.runtime-table .change-negative {
  color: #ff5252;
  font-weight: 700;
  text-shadow: 0 0 0.06rem rgba(255, 82, 82, 0.5);
}

@media (max-width: 7.68rem) {
  .stats-panel {
    width: calc(100vw - 0.48rem);
    max-height: 4.8rem;
  }
}

/* ===== 地块标点功能浮层 ===== */
.space-menu {
  position: fixed;
  z-index: 70000;
  width: 1.5rem;
  background: linear-gradient(180deg, rgba(12, 28, 52, 0.97) 0%, rgba(8, 18, 36, 0.97) 100%);
  border: 1px solid rgba(0, 200, 255, 0.35);
  border-radius: 0.08rem;
  box-shadow: 0 0.12rem 0.4rem rgba(0, 0, 0, 0.6), 0 0 0.2rem rgba(0, 180, 255, 0.15);
  overflow: visible;
  animation: spaceMenuIn 0.18s ease-out;
  backdrop-filter: blur(0.12rem);
}

@keyframes spaceMenuIn {
  from { opacity: 0; transform: translateY(0.06rem); }
  to { opacity: 1; transform: translateY(0); }
}

.space-menu-item {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  padding: 0.1rem 0.14rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.13rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.space-menu-item:hover {
  background: rgba(0, 200, 255, 0.15);
  color: #00d9ff;
  padding-left: 0.18rem;
}

/* 激活状态（点击后弹框打开时保持高亮） */
.space-menu-item.is-active {
  background: rgba(0, 200, 255, 0.25);
  color: #00d9ff;
  border-left: 0.03rem solid #00d9ff;
  font-weight: 600;
  text-shadow: 0 0 0.08rem rgba(0, 217, 255, 0.6);
}

.space-menu-item.is-active .menu-label {
  color: #00d9ff;
}

.menu-label {
  flex: 1;
}

/* 全开全关卡片 */
.switch-card-body {
  display: flex;
  gap: 0.08rem;
  padding: 0.08rem 0.14rem;
}

.switch-btn {
  flex: 1;
  padding: 0.06rem 0;
  border-radius: 0.05rem;
  font-size: 0.12rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.switch-on {
  background: rgba(0, 200, 120, 0.15);
  border: 1px solid rgba(0, 200, 120, 0.45);
  color: #00e676;
}

.switch-on:hover {
  background: rgba(0, 200, 120, 0.3);
  border-color: rgba(0, 200, 120, 0.7);
  box-shadow: 0 0 0.14rem rgba(0, 200, 120, 0.3);
}

.switch-off {
  background: rgba(255, 80, 80, 0.15);
  border: 1px solid rgba(255, 80, 80, 0.45);
  color: #ff5252;
}

.switch-off:hover {
  background: rgba(255, 80, 80, 0.3);
  border-color: rgba(255, 80, 80, 0.7);
  box-shadow: 0 0 0.14rem rgba(255, 80, 80, 0.3);
}

.circuit-status {
  font-size: 0.12rem;
  font-weight: 600;
  flex-shrink: 0;
}

.circuit-status.is-on {
  color: #00e676;
}

.circuit-status.is-off {
  color: #ff5252;
}

/* 节目列表操作按钮（标点 id=477 弹框）：播放/停止 */
.plan-action-group {
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 0.06rem;
}

.mini-action-btn {
  /* 按钮文字永不换行、按钮不被压缩（防止"播放/停止"竖排换行） */
  white-space: nowrap;
  flex-shrink: 0;
  padding: 0.03rem 0.14rem;
  border-radius: 0.04rem;
  font-size: 0.12rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.25s ease;
  line-height: 1.4;
}

/* 节目状态文字（白色） */
.program-status {
  color: #ffffff;
  font-size: 0.12rem;
  font-weight: 600;
}

.mini-action-btn.is-on {
  color: #00e676;
  border-color: rgba(0, 230, 118, 0.45);
  background: rgba(0, 230, 118, 0.12);
}

.mini-action-btn.is-on:hover {
  background: rgba(0, 230, 118, 0.28);
  box-shadow: 0 0 0.1rem rgba(0, 230, 118, 0.35);
}

.mini-action-btn.is-off {
  color: #ff5252;
  border-color: rgba(255, 82, 82, 0.45);
  background: rgba(255, 82, 82, 0.12);
}

.mini-action-btn.is-off:hover {
  background: rgba(255, 82, 82, 0.28);
  box-shadow: 0 0 0.1rem rgba(255, 82, 82, 0.35);
}

.space-submenu-empty {
  padding: 0.14rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.12rem;
  text-align: center;
}

/* ===== 视频监控弹框 ===== */
.video-modal-wrap {
  background: #0b1a2f;
  border-radius: 0.06rem;
  /* 固定内容区高度：tab 导航约 0.52rem + 播放器区 4.2rem，空数据时保持一致 */
  height: 4.72rem;
  overflow: hidden;
}

.video-modal-wrap :deep(.ant-spin-nested-loading),
.video-modal-wrap :deep(.ant-spin-container) {
  height: 100%;
}

/* 视频弹框空状态：撑满固定高度并垂直居中 */
.video-modal-wrap .space-submenu-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.video-modal-item {
  height: 4.2rem;
  background: #060d1a;
  border-radius: 0.06rem;
  overflow: hidden;
}

.video-modal-item :deep(.video-player-wrap) {
  width: 100%;
  height: 100%;
}

/* ===== 详情模式标点四页签弹框 ===== */
/* 内容区高度自适应：数据少时弹框贴合内容（下边距紧凑，与图二一致）；
   数据多或视频页签时以 4.4rem 为上限（视频播放器高度契合） */
.space-tabs :deep(.ant-tabs-content-holder) {
  height: auto;
  max-height: 4.4rem;
}

/* 页签内容撑满高度，保证上下居中生效 */
.space-tabs :deep(.ant-tabs-content) {
  height: 100%;
}

.space-tabs :deep(.ant-tabs-tabpane) {
  height: 100%;
}

/* 四个页签铺满弹框宽度（flex 平分） */
.space-tabs :deep(.ant-tabs-nav-list) {
  display: flex;
  width: 100%;
}

.space-tabs :deep(.ant-tabs-tab) {
  flex: 1;
  margin: 0 !important;
  padding: 0.06rem 0 !important;  /* 压缩 tab 高度，让下部表格更宽绰 */
  justify-content: center;
  text-align: center;
  border-radius: 0 !important;
}

.space-tabs :deep(.ant-tabs-tab .ant-tabs-tab-btn) {
  width: 100%;
  text-align: center;
}

/* 四页签弹框内视频播放器：与内容区高度契合 */
.space-tabs .video-modal-item {
  height: 4.4rem;
}

/* 1. 灯光控制（整合页签）：一键开关（上）→ 回路列表（下），纵向排列 */
.light-pane {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  height: 100%;
}

/* 一键开关区（最上边）：两按钮居中，绿/红扁平风格（对称内边距保证按钮上下居中）
   注意：本区域位于 teleport 弹窗内，rem 基于 html 根字号全局生效（useScreenScale），同样随屏缩放 */
.pane-switch {
  display: flex;
  align-items: center;  /* 按钮垂直居中 */
  justify-content: center;
  gap: 0.18rem;
  padding: 0.08rem 0;  /* 上下对称，按钮在开关区内上下居中 */
  border-bottom: 1px dashed rgba(0, 150, 255, 0.25);
}

/* 全开：对齐全开全关弹框 switch-on 风格（半透明底 + 同色描边 + 同色文字，扁平化） */
.pane-switch .icon-btn {
  padding: 0.08rem 0.28rem;
  border-radius: 0.06rem;
  background: rgba(0, 200, 120, 0.15);
  border: 1px solid rgba(0, 200, 120, 0.45);
  color: #00e676;
}

.pane-switch .icon-btn:hover {
  background: rgba(0, 200, 120, 0.3);
  border-color: rgba(0, 200, 120, 0.7);
  box-shadow: 0 0 0.14rem rgba(0, 200, 120, 0.3);
}

/* 全关：对齐 switch-off 风格 */
.pane-switch .icon-btn.dark-btn {
  background: rgba(255, 80, 80, 0.15);
  border: 1px solid rgba(255, 80, 80, 0.45);
  color: #ff5252;
}

.pane-switch .icon-btn.dark-btn:hover {
  background: rgba(255, 80, 80, 0.3);
  border-color: rgba(255, 80, 80, 0.7);
  box-shadow: 0 0 0.14rem rgba(255, 80, 80, 0.3);
}

.pane-switch .icon-btn svg {
  width: 0.18rem;
  height: 0.18rem;
}

.pane-switch .icon-btn .btn-text {
  font-size: 0.13rem;
  font-weight: 600;
  letter-spacing: 2px;
}

/* 四页签弹框标题栏：标题左（右上角避开关闭按钮） */
.light-tabs-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 0.34rem;
}

/* 表格表头"操作"列内刷新按钮：纯图标、大号、青色科技风（四高炉/1号馆弹框） */
.plan-header-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.34rem;
}

.table-refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.26rem;
  height: 0.26rem;
  border-radius: 0.04rem;
  color: #00d9ff;
  background: rgba(0, 200, 255, 0.12);
  border: 1px solid rgba(0, 200, 255, 0.45);
  cursor: pointer;
  transition: all 0.2s;
  vertical-align: middle;
}

.table-refresh-btn:hover {
  background: rgba(0, 200, 255, 0.28);
  box-shadow: 0 0 0.1rem rgba(0, 200, 255, 0.4);
}

.table-refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 回路列表区（最下边）：标签 + 表格纵向排列，撑满剩余高度 */
.pane-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 回路统计标签：占满整行，标签左、数字右（space-between），整体加粗
   注意：位于 teleport 弹窗内，rem 全局生效随屏缩放 */
.circuit-count-tag {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 0.08rem;
  padding: 0.06rem 0.12rem;
  font-size: 0.13rem;
  color: #8fe8ff;
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 0.04rem;
  white-space: nowrap;
}

.circuit-count-tag .stat-label {
  font-size: 0.13rem;
  font-weight: 700;  /* 加粗 */
  color: #8fe8ff;
}

.circuit-count-tag .stat-value {
  font-size: 0.2rem;  /* 数字放大，与主界面回路统计一致 */
  font-weight: 700;
  color: #00d9ff;
  text-shadow: 0 0 0.08rem rgba(0, 217, 255, 0.6);
}

.circuit-count-tag .stat-value .highlight-text {
  color: #00e676;
  text-shadow: 0 0 0.1rem rgba(0, 230, 118, 0.8);
}

/* 计数条左侧组合：标签 + 数字一体（刷新按钮单独贴最右） */
.circuit-count-tag .circuit-count-left {
  display: inline-flex;
  align-items: baseline;
  gap: 0.08rem;
}

/* 表格加载区：撑满剩余高度 */
.pane-table .pane-spin {
  flex: 1;
  min-height: 0;
}

.pane-table .pane-spin :deep(.ant-spin-nested-loading),
.pane-table .pane-spin :deep(.ant-spin-container) {
  height: 100%;
  min-height: 0;
}

/* 回路表格容器：自适应剩余高度（表格与弹框契合） */
.space-tabs .circuit-vxe-table-wrap {
  height: 100%;
}

/* ===== 地块功能弹框内容（弹框头部/内容主题见文件底部全局样式） ===== */
/* 全开全关弹框按钮（放大） */
.all-modal-body {
  padding: 0.06rem 2px 2px;
}

.all-modal-body .switch-btn {
  padding: 0.14rem 0;
  font-size: 0.15rem;
  letter-spacing: 2px;
  border-radius: 0.06rem;
}

/* 场景虚拟列表：场景名单元格（颜色指示点 + 名称） */
.scene-cell {
  display: flex;
  align-items: center;
  gap: 0.08rem;
}

.scene-cell-name {
  color: #e8f4ff;
  font-size: 0.16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* tab 标签栏深色主题 */
.video-tabs {
  color: rgba(255, 255, 255, 0.85);
}

.video-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0.06rem;  /* 压缩 tab 与内容的间距 */
}

.video-tabs :deep(.ant-tabs-nav-wrap) {
  overflow-x: auto;
}

.video-tabs :deep(.ant-tabs-tab) {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(0, 200, 255, 0.25) !important;
  color: rgba(255, 255, 255, 0.7) !important;
  border-radius: 0.04rem;
  transition: all 0.2s ease;
}

.video-tabs :deep(.ant-tabs-tab-active) {
  background: rgba(0, 200, 255, 0.2) !important;
  border-color: rgba(0, 200, 255, 0.6) !important;
}

.video-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #00d9ff !important;
  font-weight: 600;
}

</style>

<style>
/* ===== 场景区域筛选下拉框：深色科技风 + 高层级（teleport 渲染到 body，需全局样式） ===== */
.scene-area-dropdown {
  background: linear-gradient(180deg, #0c1e38 0%, #081527 100%) !important;
  border: 1px solid rgba(0, 200, 255, 0.3) !important;
  border-radius: 0.06rem !important;
  box-shadow: 0 0.12rem 0.4rem rgba(0, 0, 0, 0.6), 0 0 0.2rem rgba(0, 180, 255, 0.15) !important;
  padding: 0.04rem !important;
  z-index: 70000 !important;  /* 高于控制面板 60000 与地图标点 50000，避免被遮挡 */
}

.scene-area-dropdown .ant-select-item {
  font-size: 0.13rem;
  color: rgba(255, 255, 255, 0.85);
  background: transparent;
  border-radius: 0.04rem;
  min-height: 0.32rem;
  line-height: 0.32rem;
}

.scene-area-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
  background: rgba(0, 200, 255, 0.15);
  color: #00e5ff;
}

.scene-area-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
  background: rgba(0, 150, 255, 0.25);
}

.scene-area-dropdown .ant-select-item-empty {
  color: rgba(255, 255, 255, 0.45);
}

.scene-area-dropdown .ant-empty-description {
  color: rgba(255, 255, 255, 0.45);
}

/* 搜索输入框（show-search 时面板内会出现） */
.scene-area-dropdown .ant-select-selection-search-input {
  color: #e8f4ff;
}

.scene-area-dropdown ::-webkit-scrollbar {
  width: 0.05rem;
}

.scene-area-dropdown ::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.4);
  border-radius: 0.03rem;
}

.scene-area-dropdown ::-webkit-scrollbar-track {
  background: rgba(0, 30, 60, 0.2);
}

/* ===== 地块功能弹框 / 视频弹框 深色科技主题 =====
   弹框经 teleport 渲染到 body，scoped 样式不生效，需全局样式（class + wrapClassName 均挂载到 .ant-modal-root） */
.video-modal .ant-modal-header,
.space-modal .ant-modal-header {
  background: linear-gradient(135deg, #102a4a 0%, #0a1a30 100%) !important;
  border-bottom: 1px solid rgba(0, 200, 255, 0.35) !important;
  border-radius: 0.08rem 0.08rem 0 0 !important;
  padding: 0.16rem 0.24rem !important;
  position: relative;
}

/* header 底部发光线条 */
.video-modal .ant-modal-header::after,
.space-modal .ant-modal-header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.55), transparent);
  pointer-events: none;
}

.video-modal .ant-modal-title,
.space-modal .ant-modal-title {
  color: #00d9ff !important;
  font-size: 0.16rem !important;
  font-weight: 600 !important;
  letter-spacing: 1px;
  text-shadow: 0 0 0.1rem rgba(0, 217, 255, 0.55);
}

.video-modal .ant-modal-close,
.space-modal .ant-modal-close {
  color: rgba(255, 255, 255, 0.55) !important;
  background: rgba(0, 200, 255, 0.08) !important;
  border-radius: 50% !important;
  top: 0.15rem !important;
  right: 0.15rem !important;
  width: 0.3rem !important;
  height: 0.3rem !important;
  transition: all 0.25s ease;
}

.video-modal .ant-modal-close:hover,
.space-modal .ant-modal-close:hover {
  color: #ffffff !important;
  background: rgba(0, 200, 255, 0.28) !important;
  box-shadow: 0 0 0.14rem rgba(0, 200, 255, 0.5);
  transform: rotate(90deg);
}

.video-modal .ant-modal-content,
.space-modal .ant-modal-content {
  background: linear-gradient(180deg, #0c1e38 0%, #081527 100%) !important;
  border: 1px solid rgba(0, 200, 255, 0.3) !important;
  border-radius: 0.08rem !important;
  box-shadow: 0 0.16rem 0.48rem rgba(0, 0, 0, 0.7), 0 0 0.24rem rgba(0, 180, 255, 0.18) !important;
}

/* 弹框遮罩 */
.video-modal .ant-modal-mask,
.space-modal .ant-modal-mask {
  background: rgba(2, 10, 22, 0.6) !important;
  backdrop-filter: blur(2px);
}

/* ===== 弹框层级：高于一级列表浮层（space-menu z-index: 70000） ===== */
.video-modal.ant-modal-root,
.space-modal.ant-modal-root,
.video-modal.ant-modal-wrap,
.space-modal.ant-modal-wrap,
.video-modal .ant-modal-wrap,
.space-modal .ant-modal-wrap,
.video-modal .ant-modal-mask,
.space-modal .ant-modal-mask {
  z-index: 90000 !important;
}

/* ===== 场景/回路 vxe-table 虚拟列表深色主题 =====
   vxe-table 4.7 全部颜色基于 CSS 变量（由 [data-vxe-ui-theme=light] 定义），
   在表格根元素重新定义变量即可全局继承生效；另加元素级 !important 双保险 */
.scene-vxe-table-wrap,
.circuit-vxe-table-wrap {
  /* 主题变量覆盖 */
  --vxe-ui-font-color: rgba(255, 255, 255, 0.85);
  --vxe-ui-font-primary-color: #00d9ff;
  --vxe-ui-font-lighten-color: rgba(255, 255, 255, 0.55);
  --vxe-ui-font-darken-color: #ffffff;
  --vxe-ui-font-disabled-color: rgba(255, 255, 255, 0.25);
  --vxe-ui-layout-background-color: #0b1a2f;
  --vxe-ui-table-background-color: transparent;
  --vxe-ui-table-border-color: rgba(0, 200, 255, 0.15);
  --vxe-ui-table-border-radius: 0.06rem;
  --vxe-ui-table-header-background-color: rgba(0, 40, 80, 0.35);
  --vxe-ui-table-header-hover-background-color: rgba(0, 60, 110, 0.45);
  --vxe-ui-table-header-font-color: #00d9ff;
  --vxe-ui-table-header-font-weight: 600;
  --vxe-ui-table-row-hover-background-color: rgba(0, 200, 255, 0.1);
  --vxe-ui-table-row-hover-color: #ffffff;
  --vxe-ui-table-row-striped-background-color: rgba(255, 255, 255, 0.02);
  --vxe-ui-table-row-hover-striped-background-color: rgba(0, 200, 255, 0.12);
  --vxe-ui-table-column-hover-background-color: rgba(0, 200, 255, 0.08);
  --vxe-ui-table-column-current-background-color: rgba(0, 200, 255, 0.08);
  --vxe-ui-table-row-current-background-color: rgba(0, 200, 255, 0.12);
  --vxe-ui-base-popup-border-color: rgba(0, 200, 255, 0.25);
  --vxe-ui-base-popup-box-shadow: 0 0.08rem 0.24rem rgba(0, 0, 0, 0.6);
  /* 元素级兜底 */
  background: transparent !important;
  color: rgba(255, 255, 255, 0.85) !important;
  font-size: 0.13rem;
}

/* 场景列表：最小宽度 5.68rem（比原内容区 4.68rem 宽 1rem，配合弹框加宽到 6rem） */
.scene-vxe-table-wrap {
  min-width: 5.68rem;
}

.scene-vxe-table-wrap .vxe-table--header-wrapper,
.circuit-vxe-table-wrap .vxe-table--header-wrapper {
  background: rgba(0, 40, 80, 0.35) !important;
}

.scene-vxe-table-wrap .vxe-header--column,
.circuit-vxe-table-wrap .vxe-header--column {
  background: transparent !important;
  color: #00d9ff !important;
  border-bottom: 1px solid rgba(0, 200, 255, 0.25) !important;
}

/* 回路表头：字号调小、不加粗，与正文内容拉开层次
   注意：位于 teleport 弹窗内，rem 全局生效（useScreenScale），随屏缩放 */
.circuit-vxe-table-wrap .vxe-header--column {
  font-size: 0.12rem;
  font-weight: 400;
}

.scene-vxe-table-wrap .vxe-body--column,
.circuit-vxe-table-wrap .vxe-body--column {
  background: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

.scene-vxe-table-wrap .vxe-row:hover .vxe-body--column,
.circuit-vxe-table-wrap .vxe-row:hover .vxe-body--column {
  background: rgba(0, 200, 255, 0.1) !important;
  color: #ffffff !important;
}

/* 单元格内边距：列间距更透气 */
.scene-vxe-table-wrap .vxe-cell,
.circuit-vxe-table-wrap .vxe-cell {
  padding: 0 0.1rem !important;
}

/* 回路表格深色滚动条（列表超宽/超高时可滚动查看） */
.circuit-vxe-table-wrap ::-webkit-scrollbar {
  width: 0.06rem;
  height: 0.06rem;
}

.circuit-vxe-table-wrap ::-webkit-scrollbar-track {
  background: rgba(0, 30, 60, 0.2);
  border-radius: 0.03rem;
}

.circuit-vxe-table-wrap ::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.4);
  border-radius: 0.03rem;
}

.circuit-vxe-table-wrap ::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 200, 255, 0.6);
}

/* 固定列分隔阴影 */
.scene-vxe-table-wrap .vxe-table--fixed-left-wrapper,
.circuit-vxe-table-wrap .vxe-table--fixed-left-wrapper {
  box-shadow: 0.04rem 0 0.12rem rgba(0, 0, 0, 0.25);
}

.scene-vxe-table-wrap .vxe-table--border-line,
.circuit-vxe-table-wrap .vxe-table--border-line,
.scene-vxe-table-wrap .vxe-table--main-wrapper,
.circuit-vxe-table-wrap .vxe-table--main-wrapper {
  border-color: rgba(0, 200, 255, 0.15) !important;
}

.scene-vxe-table-wrap .vxe-table--body-wrapper,
.circuit-vxe-table-wrap .vxe-table--body-wrapper,
.scene-vxe-table-wrap .vxe-table--virtual-wrapper,
.circuit-vxe-table-wrap .vxe-table--virtual-wrapper {
  background: transparent !important;
}

.scene-vxe-table-wrap .vxe-table--body-wrapper::-webkit-scrollbar,
.circuit-vxe-table-wrap .vxe-table--body-wrapper::-webkit-scrollbar {
  width: 0.06rem;
  height: 0.06rem;
}

.scene-vxe-table-wrap .vxe-table--body-wrapper::-webkit-scrollbar-thumb,
.circuit-vxe-table-wrap .vxe-table--body-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.4);
  border-radius: 0.03rem;
}

.scene-vxe-table-wrap .vxe-table--body-wrapper::-webkit-scrollbar-track,
.circuit-vxe-table-wrap .vxe-table--body-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 30, 60, 0.2);
}

/* ===== 场景列表单元格内容（teleport 后 scoped 可能失效，全局兜底） ===== */
.scene-cell {
  display: flex;
  align-items: center;
  gap: 0.1rem;
}

.scene-indicator-icon {
  width: 0.12rem;
  height: 0.12rem;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0.06rem currentColor;
}

.scene-cell-name {
  flex: 1;
  min-width: 0;
  color: #e8f4ff;
  font-size: 0.16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 场景行中间详情按钮：玻璃态描边风格 */
.scene-mid-detail {
  flex-shrink: 0;
  margin: 0 !important;
  padding: 0.04rem 0.18rem;
  height: 0.34rem;
  min-width: 0.68rem;
  border-radius: 0.08rem;
  font-size: 0.17rem;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 150, 255, 0.25);
  border: 1px solid rgba(0, 180, 255, 0.55);
  color: #ffffff;
  transition: all 0.2s ease;
}

.scene-mid-detail:hover {
  background: rgba(0, 170, 255, 0.4);
  border-color: rgba(0, 200, 255, 0.85);
  transform: translateY(-1px);
}

/* 场景行按钮组：统一玻璃态描边风格（详情/开/关） */
.scene-btn-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.06rem;
}

.scene-btn-group .detail-btn,
.scene-btn-group .scene-action-btn {
  padding: 0.03rem 0.1rem;
  height: 0.24rem;
  min-width: 0.4rem;
  border-radius: 0.04rem;
  font-size: 0.11rem;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(0, 80, 150, 0.15);
  border: 1px solid rgba(0, 150, 255, 0.45);
  color: #00d9ff;
  text-shadow: 0 0 0.06rem rgba(0, 217, 255, 0.5);
  transition: all 0.2s ease;
}

.scene-btn-group .detail-btn:hover {
  background: rgba(56, 189, 248, 0.25);
  border-color: rgba(56, 189, 248, 0.7);
  box-shadow: 0 0 0.12rem rgba(0, 200, 255, 0.35);
  transform: translateY(-1px);
}

.scene-btn-group .on-btn {
  background: rgba(16, 120, 80, 0.15);
  border-color: rgba(34, 197, 94, 0.5);
  color: #34d399;
  text-shadow: 0 0 0.06rem rgba(52, 211, 153, 0.5);
}

.scene-btn-group .on-btn:hover {
  background: rgba(34, 197, 94, 0.25);
  border-color: rgba(34, 197, 94, 0.8);
  box-shadow: 0 0 0.12rem rgba(34, 197, 94, 0.35);
  transform: translateY(-1px);
}

.scene-btn-group .off-btn {
  background: rgba(180, 40, 40, 0.15);
  border-color: rgba(239, 68, 68, 0.5);
  color: #f87171;
  text-shadow: 0 0 0.06rem rgba(248, 113, 113, 0.5);
}

.scene-btn-group .off-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.8);
  box-shadow: 0 0 0.12rem rgba(239, 68, 68, 0.35);
  transform: translateY(-1px);
}

/* 回路状态徽章（全局兜底） */
.circuit-vxe-table-wrap .circuit-status {
  font-size: 0.12rem;
  font-weight: 600;
  flex-shrink: 0;
}

.circuit-vxe-table-wrap .circuit-status.is-on {
  color: #00e676;
  text-shadow: 0 0 0.08rem rgba(0, 230, 118, 0.45);
}

.circuit-vxe-table-wrap .circuit-status.is-off {
  color: #ff5252;
  text-shadow: 0 0 0.08rem rgba(255, 82, 82, 0.45);
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped>
.theme-white.big-gis-page {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  background-color: #ffffff;
  background-image: none;
  /* 修复地图滚动问题：允许滚轮事件穿透 */
  overflow: visible;
}.theme-white /* 底部居中控制按钮 */
.bottom-controls {
  position: fixed;  /* 固定在视口底部，不受父容器溢出裁剪影响 */
  left: 50%;
  bottom: 2vh;
  transform: translateX(-50%);
  z-index: 60000;  /* 高于地图标点，确保不被遮挡 */
  display: flex;
  gap: 1.2rem;
}.theme-white .ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.08rem;
  padding: 0.1rem 0.16rem;
  min-width: 1.04rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.95) 100%);
  border: 1.5px solid rgba(24, 144, 255, 0.5);
  border-radius: 0.06rem;
  color: #1890ff;
  font-size: 0.14rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 
    0 0.04rem 0.16rem rgba(24, 144, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  text-shadow: none;
}.theme-white /* 外边框光晕层 */
.ctrl-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(24, 144, 255, 0.1) 0%,
    rgba(24, 144, 255, 0.05) 100%
  );
  opacity: 0.6;
  pointer-events: none;
}.theme-white /* 内发光和高光层 */
.ctrl-btn::after {
  content: '';
  position: absolute;
  inset: 1px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.5) 0%, 
    rgba(255, 255, 255, 0) 50%,
    rgba(255, 255, 255, 0.2) 100%
  );
  pointer-events: none;
}.theme-white /* 图标样式 */
.ctrl-btn svg {
  width: 0.2rem;
  height: 0.2rem;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 0.04rem rgba(0, 0, 0, 0.15)) drop-shadow(0 0 0.06rem rgba(24, 144, 255, 0.4));
  transition: all 0.3s ease;
}.theme-white /* 文字提升层级，避免被光晕层覆盖 */
.ctrl-btn span {
  position: relative;
  z-index: 1;
}.theme-white /* Hover 效果（未激活时也可感知可点击） */
.ctrl-btn:hover {
  background: linear-gradient(135deg, #f0f5fb 0%, #e8f0fa 100%);
  border-color: #40a9ff;
  color: #1890ff;
  transform: translateY(-0.03rem);
  box-shadow: 
    0 0.08rem 0.24rem rgba(24, 144, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}.theme-white .ctrl-btn:hover::before {
  opacity: 1;
}.theme-white .ctrl-btn:hover svg {
  filter: drop-shadow(0 0.04rem 0.08rem rgba(0, 0, 0, 0.15)) drop-shadow(0 0 0.12rem rgba(24, 144, 255, 0.5));
}.theme-white /* 激活状态 - 主蓝渐变填充 + 发光，与未激活浅底形成反差 */
.ctrl-btn.is-active {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-color: rgba(255, 255, 255, 0.9);
  color: #fff;
  text-shadow: 0 0 0.1rem rgba(255, 255, 255, 0.5), 0 0 0.2rem rgba(24, 144, 255, 0.4);
  box-shadow: 
    0 0.06rem 0.28rem rgba(24, 144, 255, 0.5),
    0 0 0.18rem rgba(24, 144, 255, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -0.03rem 0 #ffffff;
  animation: ctrlBtnActivePulse 2.2s ease-in-out infinite;
}

/* 激活状态呼吸发光动画 */
@keyframes ctrlBtnActivePulse  {
  0%, 100%  {
    box-shadow: 
      0 0.06rem 0.28rem rgba(24, 144, 255, 0.5),
      0 0 0.14rem rgba(24, 144, 255, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.45),
      inset 0 -0.03rem 0 #ffffff;
  }
  50%  {
    box-shadow: 
      0 0.06rem 0.32rem rgba(24, 144, 255, 0.7),
      0 0 0.26rem rgba(24, 144, 255, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.45),
      inset 0 -0.03rem 0 #ffffff;
  }}.theme-white .ctrl-btn.is-active::before {
  opacity: 1;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(24, 144, 255, 0.15) 100%);
}.theme-white .ctrl-btn.is-active::after {
  opacity: 0.7;
}.theme-white .ctrl-btn.is-active svg {
  filter: drop-shadow(0 0 0.08rem rgba(255, 255, 255, 0.6)) drop-shadow(0 0 0.16rem rgba(24, 144, 255, 0.8));
  transform: scale(1.08);
}.theme-white .ctrl-btn.is-active span {
  text-shadow: 0 0 0.12rem rgba(255, 255, 255, 0.5), 0 0 0.24rem rgba(24, 144, 255, 0.5);
}.theme-white /* 左上角控制按钮（位置用 vw/vh，随视口自适应） */
.top-left-controls {
  position: absolute;  /* 相对页面自身定位，位于内容区左上角（header 下方、sidebar 右侧） */
  left: 1.05vw;  /* 0.2rem @1920 */
  top: 1.5vh;    /* 页面顶部，紧贴内容区上沿 */
  z-index: 60000;  /* 高于地图标点（最高50000），确保不被遮挡 */
}.theme-white /* 控制开关按钮 - 矩形风格 */
.control-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.417vw;
  padding: 0.729vw 1.25vw;  /* 0.14rem 0.24rem @1920，随屏缩放 */
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.9) 100%);
  backdrop-filter: blur(0.12rem);
  border: 1px solid rgba(24, 144, 255, 0.4);
  border-radius: 0.417vw;
  color: #1890ff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 
    0 0 1.042vw rgba(24, 144, 255, 0.12),
    0 0.208vw 0.833vw rgba(24, 144, 255, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}.theme-white .control-toggle-btn .toggle-text {
  font-size: 0.781vw;  /* 0.15rem @1920 */
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: 0.052vw;
  text-shadow: none;
}.theme-white .control-toggle-btn svg {
  flex-shrink: 0;
  width: 1.25vw;  /* 0.24rem @1920，覆盖模板固定属性，随屏缩放 */
  height: 1.25vw;
  filter: drop-shadow(0 0 0.208vw rgba(24, 144, 255, 0.4));
}.theme-white /* Hover效果 */
.control-toggle-btn:hover {
  background: linear-gradient(135deg, #f0f5fb 0%, #e8f0fa 100%);
  border-color: #40a9ff;
  box-shadow: 
    0 0.06rem 0.24rem rgba(24, 144, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
}.theme-white /* Click效果 */
.control-toggle-btn:active {
  transform: translateY(0);
}.theme-white /* 控制面板 - 简洁白底卡片（无边框/角标装饰） */
.control-panel {
  position: absolute;
  left: 0;
  top: 3.333vw;  /* 按钮放大后下移，确保在图标下方 */
  width: 22.917vw;  /* 4.4rem @1920，随屏缩放 */
  z-index: 60000;  /* 高于地图标点，确保不被遮挡 */
  max-height: calc(100vh - 3.646vw);
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(24, 144, 255, 0.25);
  border-radius: 0.417vw;
  box-shadow: 0 0.08rem 0.32rem rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(0.12rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}.theme-white .control-panel .panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.521vw;
}.theme-white .control-panel .panel-body::-webkit-scrollbar {
  width: 0.06rem;
}.theme-white .control-panel .panel-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
}.theme-white .control-panel .panel-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.03rem;
}.theme-white /* 面板主体 */
.panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.521vw;
  padding: 0.521vw;
  overflow-y: auto;
}.theme-white /* 三个独立模块卡片 - 统一风格 */
.module-card {
  background: #fafbfc;
  border: 1px solid rgba(24, 144, 255, 0.2);
  border-radius: 0.313vw;
  padding: 0.521vw 0.625vw;
  position: relative;
  overflow: hidden;
}.theme-white /* 模块顶部高光线 */
.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.35), transparent);
}.theme-white /* 统计区域 */
.stat-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.08rem;
}.theme-white .stat-label {
  color: #606266;  /* 次级文字 */
  font-size: 0.15rem;
  font-weight: 500;
  white-space: nowrap;  /* 保证与数字同行不换行 */
}.theme-white .stat-value {
  color: #1890ff;  /* 主色 */
  font-size: 0.22rem;  /* 数字放大突出 */
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  text-shadow: 0 0 0.08rem rgba(24, 144, 255, 0.3);
}.theme-white .highlight-text {
  color: #1890ff;  /* 主色高亮 */
  font-weight: 700;
  text-shadow: 0 0 0.1rem rgba(24, 144, 255, 0.35);
}.theme-white .number {
  font-variant-numeric: tabular-nums;
}.theme-white /* 一键操作区域 */
.mini-action-group {
  display: flex;
  gap: 0.08rem;
  justify-content: center;
}.theme-white .icon-btn {
  display: flex;
  align-items: center;
  gap: 0.06rem;
  padding: 0.08rem 0.14rem;  /* 调整内边距 */
  background: rgba(24, 144, 255, 0.1);  /* 稍微提高 */
  border: 1px solid rgba(24, 144, 255, 0.3);  /* 恢复边框 */
  border-radius: 0.04rem;  /* 参考图的小圆角 */
  color: #1890ff;
  cursor: pointer;
  transition: all 0.2s ease;
}.theme-white .icon-btn.with-text {
  width: auto;
  min-width: 0.56rem;
}.theme-white .icon-btn .btn-text {
  font-size: 0.14rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}.theme-white .icon-btn:hover {
  background: rgba(24, 144, 255, 0.15);
  border-color: rgba(24, 144, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 0.04rem 0.12rem rgba(24, 144, 255, 0.15);
}.theme-white .icon-btn:active {
  transform: translateY(0);
}.theme-white .dark-btn {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.12);
  color: #606266;
}.theme-white .dark-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.2);
}.theme-white /* 左侧一键开关按钮：主体颜色对齐弹框全开/全关按钮（绿/红） */
.mini-action-group .icon-btn:first-child {
  background: rgba(82, 196, 26, 0.12);
  border-color: rgba(82, 196, 26, 0.45);
  color: #52c41a;
}.theme-white .mini-action-group .icon-btn:first-child:hover {
  background: rgba(82, 196, 26, 0.2);
  border-color: rgba(82, 196, 26, 0.7);
  box-shadow: 0 0 0.14rem rgba(82, 196, 26, 0.3);
}.theme-white .mini-action-group .icon-btn.dark-btn {
  background: rgba(255, 77, 79, 0.12);
  border-color: rgba(255, 77, 79, 0.45);
  color: #ff4d4f;
}.theme-white .mini-action-group .icon-btn.dark-btn:hover {
  background: rgba(255, 77, 79, 0.2);
  border-color: rgba(255, 77, 79, 0.7);
  box-shadow: 0 0 0.14rem rgba(255, 77, 79, 0.3);
}.theme-white /* 地块列表区域 */
.space-section {
  flex: 1;
  min-height: 0;
}.theme-white .section-title {
  color: #303133;  /* 主文字 */
  font-size: 0.781vw;  /* 0.15rem @1920 */
  font-weight: 600;
  padding: 0 0 0.417vw 0.417vw;
  margin-bottom: 0.417vw;
  border-left: 0.104vw solid #1890ff;
  text-transform: none;
  letter-spacing: normal;
  text-shadow: none;
  border-bottom: 1px dashed rgba(24, 144, 255, 0.25);
}.theme-white /* 场景列表标题行：标题 + 区域筛选下拉框 */
.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.417vw;
}.theme-white .section-title-row .section-title {
  margin-bottom: 0;
}.theme-white /* 区域筛选下拉框本体：白底 + 紧凑高度（与场景行按钮协调） */
.scene-area-select :deep(.ant-select-selector) {
  background: #ffffff !important;
  border-color: rgba(24, 144, 255, 0.4) !important;
  border-radius: 0.04rem !important;
  height: 0.2rem !important;
  font-size: 0.14rem;
  display: flex;
  align-items: center;
}.theme-white .scene-area-select :deep(.ant-select-selection-placeholder),
.theme-white .scene-area-select :deep(.ant-select-selection-item) {
  color: #606266;
  line-height: 0.2rem !important;
}.theme-white /* 搜索输入文字 + 清除按钮（X）：白底透明，与整体风格一致 */
.scene-area-select :deep(.ant-select-selection-search-input) {
  color: #303133;
}.theme-white /* 选中文字（含「全部」）：主蓝，选中态清晰可见 */
.scene-area-select :deep(.ant-select-selection-item) {
  color: #1890ff !important;
  text-shadow: none;
}.theme-white .scene-area-select :deep(.ant-select-clear) {
  background: rgba(0, 0, 0, 0.04);
  color: #909399;
  border-radius: 50%;
  font-size: 0.1rem;
  width: 0.14rem;
  height: 0.14rem;
  right: 0.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}.theme-white .scene-area-select :deep(.ant-select-clear:hover) {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
  box-shadow: 0 0 0.08rem rgba(24, 144, 255, 0.3);
}.theme-white .scene-area-select :deep(.ant-select-arrow) {
  color: #909399;
}.theme-white /* 虚拟滚动容器 - 限制高度，支持滚动 */
.space-list-scroll-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  max-height: 30vh;  /* 3.2rem @1080，高度随视口 */
  padding-right: 0.208vw;  /* 留出滚动条空间 */
}.theme-white /* 自定义滚动条 - 科技感 */
.space-list-scroll-container::-webkit-scrollbar {
  width: 0.05rem;
}.theme-white .space-list-scroll-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 0.03rem;
}.theme-white .space-list-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.03rem;
  transition: background 0.3s ease;
}.theme-white .space-list-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.35);
}.theme-white .space-list {
  display: flex;
  flex-direction: column;
  gap: 0.06rem;
}.theme-white .space-item-row {
  display: flex;
  align-items: center;
  gap: 0.365vw;
  padding: 0.469vw 0.365vw;  /* 0.09rem 0.07rem @1920 */
  background: transparent;  /* 完全透明 */
  border: none;  /* 移除边框 */
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}.theme-white .space-item-row:hover {
  background: rgba(24, 144, 255, 0.08);  /* 更明显的 hover 效果 */
  border-color: transparent;
  transform: translateX(0.03rem);  /* 增强左移效果 */
}.theme-white .space-item-row:active {
  transform: translateX(0);
}.theme-white .scene-indicator-icon {
  width: 0.12rem;
  height: 0.12rem;
  min-width: 0.12rem;
  border-radius: 0.04rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
}.theme-white .item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}.theme-white .item-name {
  color: #303133;  /* 主文字 */
  font-size: 0.781vw;  /* 0.15rem @1920 */
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: none;
}.theme-white /* 详情按钮 */
.detail-btn {
  padding: 0.208vw 0.417vw;
  height: auto;
  min-width: 1.563vw;
  background: rgba(24, 144, 255, 0.12);
  border: 1px solid rgba(24, 144, 255, 0.5);
  border-radius: 0.26vw;
  color: #1890ff;
  font-size: 0.781vw;  /* 0.15rem @1920 */
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-right: 0.208vw;
}.theme-white .detail-btn:hover {
  background: rgba(24, 144, 255, 0.2);
  border-color: rgba(24, 144, 255, 0.8);
  transform: translateY(-1px);
}.theme-white /* 场景开/关按钮组 */
.scene-btn-group {
  display: flex;
  gap: 0.03rem;
  flex-shrink: 0;
}.theme-white .scene-action-btn {
  padding: 0.26vw 0.469vw;
  height: auto;
  min-width: 1.25vw;
  border-radius: 0.156vw;
  font-size: 0.781vw;  /* 0.15rem @1920 */
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}.theme-white .scene-action-btn.on-btn {
  background: rgba(82, 196, 26, 0.12);
  border: 1px solid rgba(82, 196, 26, 0.4);
  color: #52c41a;
}.theme-white .scene-action-btn.on-btn:hover {
  background: rgba(82, 196, 26, 0.2);
  border-color: rgba(82, 196, 26, 0.6);
  box-shadow: 0 0 0.1rem rgba(82, 196, 26, 0.3);
}.theme-white .scene-action-btn.off-btn {
  background: rgba(255, 77, 79, 0.12);
  border: 1px solid rgba(255, 77, 79, 0.4);
  color: #ff4d4f;
}.theme-white .scene-action-btn.off-btn:hover {
  background: rgba(255, 77, 79, 0.2);
  border-color: rgba(255, 77, 79, 0.6);
  box-shadow: 0 0 0.1rem rgba(255, 77, 79, 0.3);
}.theme-white /* ========== 右上角统计面板 - 科技蓝主题 ========== */
.top-right-controls {
  position: absolute;  /* 相对页面自身定位，位于内容区右上角（header 下方） */
  top: 1.5vh;  /* 与左上角整体管控按钮同步，紧贴内容区上沿 */
  right: 1.25vw;  /* 0.24rem @1920 */
  z-index: 60000;  /* 高于地图标点（最高50000），确保统计面板不被遮挡 */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.521vw;
}.theme-white /* 统计切换按钮 - 精致风格 */
.stats-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.417vw;
  padding: 0.729vw 1.25vw;  /* 0.14rem 0.24rem @1920，随屏缩放 */
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.9) 100%);
  backdrop-filter: blur(0.12rem);
  border: 1px solid rgba(24, 144, 255, 0.4);
  border-radius: 0.417vw;
  color: #1890ff;
  font-size: 0.781vw;  /* 0.15rem @1920 */
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;  /* 支撑 ::before 光晕层定位 */
  box-shadow: 
    0 0 1.042vw rgba(24, 144, 255, 0.12),
    0 0.208vw 0.833vw rgba(24, 144, 255, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  text-shadow: none;
}.theme-white .stats-toggle-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0.06rem;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}.theme-white .stats-toggle-btn:hover {
  background: linear-gradient(135deg, #f0f5fb 0%, #e8f0fa 100%);
  border-color: #40a9ff;
  box-shadow: 
    0 0.06rem 0.24rem rgba(24, 144, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
}.theme-white .stats-toggle-btn:hover::before {
  opacity: 1;
}.theme-white .stats-toggle-btn:active {
  transform: translateY(0);
}.theme-white /* ===== 整体管控 / 统计按钮激活态（定义在所有 hover 之后，确保打开面板时高亮始终生效） ===== */
.control-toggle-btn::after,
.theme-white .stats-toggle-btn::after {
  content: '';
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: -0.03rem;
  height: 0.03rem;
  border-radius: 0.015rem;
  background: linear-gradient(90deg, transparent, #1890ff, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}.theme-white .control-toggle-btn.is-active,
.theme-white .stats-toggle-btn.is-active {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.95) 0%, rgba(9, 109, 217, 0.92) 100%);
  border-color: rgba(24, 144, 255, 0.95);
  color: #ffffff;
  box-shadow:
    0 0 0.24rem rgba(24, 144, 255, 0.35),
    0 0 0.6rem rgba(24, 144, 255, 0.2),
    inset 0 0 0.2rem rgba(24, 144, 255, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}.theme-white .control-toggle-btn.is-active .toggle-text,
.theme-white .stats-toggle-btn.is-active .toggle-label {
  text-shadow: 0 0 0.3rem rgba(255, 255, 255, 0.6);
}.theme-white .control-toggle-btn.is-active::after,
.theme-white .stats-toggle-btn.is-active::after {
  opacity: 1;
  box-shadow: 0 0 0.08rem rgba(24, 144, 255, 0.6);
}.theme-white /* 统计按钮图标 */
.stats-toggle-btn svg {
  flex-shrink: 0;
  width: 1.25vw;  /* 0.24rem @1920，覆盖模板固定属性，随屏缩放 */
  height: 1.25vw;
  filter: drop-shadow(0 0 0.208vw rgba(24, 144, 255, 0.4));
}.theme-white .toggle-label {
  white-space: nowrap;
  letter-spacing: 0.026vw;
}.theme-white /* 统计面板 - 浅色卡片风：蓝边框 + 白底 */
.stats-panel {
  width: 25vw;  /* 4.8rem @1920，随屏缩放 */
  max-height: 52vh;  /* 5.6rem @1080，高度随视口 */
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(0.12rem);
  border: 1px solid rgba(24, 144, 255, 0.3);
  border-radius: 0.417vw;
  box-shadow: 
    0 0 1.354vw rgba(24, 144, 255, 0.1),
    0 0.417vw 1.25vw rgba(0, 0, 0, 0.1);
  padding: 0.625vw;
  display: flex;
  flex-direction: column;
  gap: 0.625vw;
}.theme-white /* 滚动条美化 */
.stats-panel::-webkit-scrollbar {
  width: 0.06rem;
}.theme-white .stats-panel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 0.03rem;
}.theme-white .stats-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.03rem;
  transition: background 0.3s ease;
}.theme-white .stats-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.35);
}.theme-white /* 图表区域通用样式 */
.chart-section,
.theme-white .table-section {
  background: #fafbfc;
  border: 1px solid rgba(24, 144, 255, 0.15);
  border-radius: 0.313vw;
  padding: 0.833vw;
  position: relative;
  overflow: hidden;
}.theme-white .chart-section::before,
.theme-white .table-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.3), transparent);
}.theme-white .chart-section h4,
.theme-white .table-section h4 {
  margin: 0 0 0.833vw 0;
  font-size: 0.729vw;  /* 0.14rem @1920 */
  font-weight: 600;
  color: #303133;
  text-shadow: none;
  letter-spacing: 0.042vw;
  display: flex;
  align-items: center;
  gap: 0.313vw;
}.theme-white .chart-section h4::before,
.theme-white .table-section h4::before {
  content: '';
  width: 0.156vw;
  height: 0.729vw;
  background: linear-gradient(180deg, #1890ff, #096dd9);
  border-radius: 0.104vw;
  box-shadow: 0 0 0.417vw rgba(24, 144, 255, 0.4);
}.theme-white /* 柱状图区域 - 优化宽度 */
.bar-chart-section {
  min-height: 10.417vw;  /* 2rem @1920 */
}.theme-white .bar-chart-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 7.813vw;  /* 1.5rem @1920 */
  padding: 0 0.208vw;
  gap: 0.417vw;
}.theme-white .bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.06rem;
  flex: 1;
  max-width: 0.7rem;  /* 限制每个条目的最大宽度 */
}.theme-white .bar-wrapper {
  position: relative;
  width: 100%;
  height: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}.theme-white .bar-fill {
  width: 0.36rem;  /* 柱体宽度从0.48rem减小到0.36rem */
  min-width: 0.32rem;
  background: linear-gradient(180deg, rgba(24, 144, 255, 0.9) 0%, rgba(9, 109, 217, 0.75) 100%);
  border-radius: 0.04rem 0.04rem 0 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 0 0.12rem rgba(24, 144, 255, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
}.theme-white .bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 50%);
  border-radius: 0.04rem 0.04rem 0 0;
}.theme-white .bar-value {
  position: absolute;
  top: -0.2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.11rem;
  font-weight: 700;
  color: #303133;
  text-shadow: none;
  white-space: nowrap;
}.theme-white .bar-label {
  font-size: 0.12rem;  /* 字体从0.13rem减小到0.12rem */
  font-weight: 600;
  color: #606266;
  text-shadow: none;
  white-space: nowrap;  /* 不换行 */
}.theme-white /* 运行时长按对比表格 - 精致科技风 */
.runtime-table {
  overflow-x: auto;
}.theme-white .runtime-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.125rem;
}.theme-white .runtime-table thead th {
  background: #f5f7fa;
  color: #1890ff;
  padding: 0.12rem 0.06rem;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;  /* 表头文字不换行 */
  border-bottom: 2px solid rgba(24, 144, 255, 0.3);
  text-shadow: none;
  letter-spacing: 0.5px;
}.theme-white .runtime-table thead th:first-child {
  border-radius: 0.04rem 0 0 0;
}.theme-white .runtime-table thead th:last-child {
  border-radius: 0 0.04rem 0 0;
}.theme-white .runtime-table tbody td {
  padding: 0.11rem 0.1rem;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  transition: all 0.2s ease;
}.theme-white .runtime-table tbody tr {
  transition: all 0.2s ease;
}.theme-white .runtime-table tbody tr:hover {
  background: rgba(24, 144, 255, 0.05);
  box-shadow: inset 0 0 0.12rem rgba(24, 144, 255, 0.05);
}.theme-white .runtime-table tbody tr:last-child td {
  border-bottom: none;
}.theme-white .runtime-table tbody td:first-child {
  color: #1890ff;
  font-weight: 600;
  text-shadow: none;
}.theme-white .runtime-table .change-positive {
  color: #52c41a;
  font-weight: 700;
  text-shadow: none;
}.theme-white .runtime-table .change-negative {
  color: #ff4d4f;
  font-weight: 700;
  text-shadow: none;
}

@media (max-width: 7.68rem)  {.theme-white .stats-panel {
    width: calc(100vw - 0.48rem);
    max-height: 4.8rem;
  }}.theme-white /* ===== 地块标点功能浮层 ===== */
.space-menu {
  position: fixed;
  z-index: 70000;
  width: 1.5rem;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(24, 144, 255, 0.35);
  border-radius: 0.08rem;
  box-shadow: 0 0.12rem 0.4rem rgba(0, 0, 0, 0.15), 0 0 0.2rem rgba(24, 144, 255, 0.1);
  overflow: visible;
  animation: spaceMenuIn 0.18s ease-out;
  backdrop-filter: blur(0.12rem);
}

@keyframes spaceMenuIn  {
  from  { opacity: 0; transform: translateY(0.06rem); }
  to  { opacity: 1; transform: translateY(0); }}.theme-white .space-menu-item {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  padding: 0.1rem 0.14rem;
  color: #303133;
  font-size: 0.13rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f2f5;
}.theme-white .space-menu-item:hover {
  background: rgba(24, 144, 255, 0.08);
  color: #1890ff;
  padding-left: 0.18rem;
}.theme-white /* 激活状态（点击后弹框打开时保持高亮） */
.space-menu-item.is-active {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  border-left: 0.03rem solid #1890ff;
  font-weight: 600;
  text-shadow: none;
}.theme-white .space-menu-item.is-active .menu-label {
  color: #1890ff;
}.theme-white .menu-label {
  flex: 1;
}.theme-white /* 全开全关卡片 */
.switch-card-body {
  display: flex;
  gap: 0.08rem;
  padding: 0.08rem 0.14rem;
}.theme-white .switch-btn {
  flex: 1;
  padding: 0.06rem 0;
  border-radius: 0.05rem;
  font-size: 0.12rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}.theme-white .switch-on {
  background: rgba(82, 196, 26, 0.12);
  border: 1px solid rgba(82, 196, 26, 0.45);
  color: #52c41a;
}.theme-white .switch-on:hover {
  background: rgba(82, 196, 26, 0.2);
  border-color: rgba(82, 196, 26, 0.7);
  box-shadow: 0 0 0.14rem rgba(82, 196, 26, 0.3);
}.theme-white .switch-off {
  background: rgba(255, 77, 79, 0.12);
  border: 1px solid rgba(255, 77, 79, 0.45);
  color: #ff4d4f;
}.theme-white .switch-off:hover {
  background: rgba(255, 77, 79, 0.2);
  border-color: rgba(255, 77, 79, 0.7);
  box-shadow: 0 0 0.14rem rgba(255, 77, 79, 0.3);
}.theme-white .circuit-status {
  font-size: 0.12rem;
  font-weight: 600;
  flex-shrink: 0;
}.theme-white .circuit-status.is-on {
  color: #52c41a;
}.theme-white .circuit-status.is-off {
  color: #ff4d4f;
}.theme-white /* 节目列表操作按钮（标点 id=477 弹框）：播放/停止 */
.plan-action-group {
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 0.06rem;
}.theme-white .mini-action-btn {
  /* 按钮文字永不换行、按钮不被压缩（防止"播放/停止"竖排换行） */
  white-space: nowrap;
  flex-shrink: 0;
  padding: 0.03rem 0.14rem;
  border-radius: 0.04rem;
  font-size: 0.12rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.25s ease;
  line-height: 1.4;
}.theme-white /* 节目状态文字 */
.program-status {
  color: #303133;
  font-size: 0.12rem;
  font-weight: 600;
}.theme-white .mini-action-btn.is-on {
  color: #52c41a;
  border-color: rgba(82, 196, 26, 0.45);
  background: rgba(82, 196, 26, 0.1);
}.theme-white .mini-action-btn.is-on:hover {
  background: rgba(82, 196, 26, 0.18);
  box-shadow: 0 0 0.1rem rgba(82, 196, 26, 0.3);
}.theme-white .mini-action-btn.is-off {
  color: #ff4d4f;
  border-color: rgba(255, 77, 79, 0.45);
  background: rgba(255, 77, 79, 0.1);
}.theme-white .mini-action-btn.is-off:hover {
  background: rgba(255, 77, 79, 0.18);
  box-shadow: 0 0 0.1rem rgba(255, 77, 79, 0.3);
}.theme-white .space-submenu-empty {
  padding: 0.14rem;
  color: #c0c4cc;
  font-size: 0.12rem;
  text-align: center;
}.theme-white /* ===== 视频监控弹框 ===== */
.video-modal-wrap {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 0.06rem;
  /* 固定内容区高度：tab 导航约 0.52rem + 播放器区 4.2rem，空数据时保持一致 */
  height: 4.72rem;
  overflow: hidden;
}.theme-white .video-modal-wrap :deep(.ant-spin-nested-loading),
.theme-white .video-modal-wrap :deep(.ant-spin-container) {
  height: 100%;
}.theme-white /* 视频弹框空状态：撑满固定高度并垂直居中 */
.video-modal-wrap .space-submenu-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}.theme-white .video-modal-item {
  height: 4.2rem;
  background: #060d1a;
  border-radius: 0.06rem;
  overflow: hidden;
}.theme-white .video-modal-item :deep(.video-player-wrap) {
  width: 100%;
  height: 100%;
}.theme-white /* ===== 详情模式标点四页签弹框 ===== */
/* 内容区高度自适应：数据少时弹框贴合内容（下边距紧凑，与图二一致）；
   数据多或视频页签时以 4.4rem 为上限（视频播放器高度契合） */
.space-tabs :deep(.ant-tabs-content-holder) {
  height: auto;
  max-height: 4.4rem;
}.theme-white /* 页签内容撑满高度，保证上下居中生效 */
.space-tabs :deep(.ant-tabs-content) {
  height: 100%;
}.theme-white .space-tabs :deep(.ant-tabs-tabpane) {
  height: 100%;
}.theme-white /* 四个页签铺满弹框宽度（flex 平分） */
.space-tabs :deep(.ant-tabs-nav-list) {
  display: flex;
  width: 100%;
}.theme-white .space-tabs :deep(.ant-tabs-tab) {
  flex: 1;
  margin: 0 !important;
  padding: 0.06rem 0 !important;  /* 压缩 tab 高度，让下部表格更宽绰 */
  justify-content: center;
  text-align: center;
  border-radius: 0 !important;
}.theme-white .space-tabs :deep(.ant-tabs-tab .ant-tabs-tab-btn) {
  width: 100%;
  text-align: center;
}.theme-white /* 四页签弹框内视频播放器：与内容区高度契合 */
.space-tabs .video-modal-item {
  height: 4.4rem;
}.theme-white /* 1. 灯光控制（整合页签）：一键开关（上）→ 回路列表（下），纵向排列 */
.light-pane {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  height: 100%;
}.theme-white /* 一键开关区（最上边）：两按钮居中，绿/红扁平风格（对称内边距保证按钮上下居中）
   注意：本区域位于 teleport 弹窗内，rem 基于 html 根字号全局生效（useScreenScale），同样随屏缩放 */
.pane-switch {
  display: flex;
  align-items: center;  /* 按钮垂直居中 */
  justify-content: center;
  gap: 0.18rem;
  padding: 0.08rem 0;  /* 上下对称，按钮在开关区内上下居中 */
  border-bottom: 1px dashed rgba(24, 144, 255, 0.25);
}.theme-white /* 全开：对齐全开全关弹框 switch-on 风格（半透明底 + 同色描边 + 同色文字，扁平化） */
.pane-switch .icon-btn {
  padding: 0.08rem 0.28rem;
  border-radius: 0.06rem;
  background: rgba(82, 196, 26, 0.12);
  border: 1px solid rgba(82, 196, 26, 0.45);
  color: #52c41a;
}.theme-white .pane-switch .icon-btn:hover {
  background: rgba(82, 196, 26, 0.2);
  border-color: rgba(82, 196, 26, 0.7);
  box-shadow: 0 0 0.14rem rgba(82, 196, 26, 0.3);
}.theme-white /* 全关：对齐 switch-off 风格 */
.pane-switch .icon-btn.dark-btn {
  background: rgba(255, 77, 79, 0.12);
  border: 1px solid rgba(255, 77, 79, 0.45);
  color: #ff4d4f;
}.theme-white .pane-switch .icon-btn.dark-btn:hover {
  background: rgba(255, 77, 79, 0.2);
  border-color: rgba(255, 77, 79, 0.7);
  box-shadow: 0 0 0.14rem rgba(255, 77, 79, 0.3);
}.theme-white .pane-switch .icon-btn svg {
  width: 0.18rem;
  height: 0.18rem;
}.theme-white .pane-switch .icon-btn .btn-text {
  font-size: 0.13rem;
  font-weight: 600;
  letter-spacing: 2px;
}.theme-white /* 四页签弹框标题栏：标题左（右上角避开关闭按钮） */
.light-tabs-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 0.34rem;
}.theme-white /* 表格表头"操作"列内刷新按钮：纯图标、大号、青色科技风（四高炉/1号馆弹框） */
.plan-header-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.34rem;
}.theme-white .table-refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.26rem;
  height: 0.26rem;
  border-radius: 0.04rem;
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
  border: 1px solid rgba(24, 144, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s;
  vertical-align: middle;
}.theme-white .table-refresh-btn:hover {
  background: rgba(24, 144, 255, 0.2);
  box-shadow: 0 0 0.1rem rgba(24, 144, 255, 0.35);
}.theme-white .table-refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}.theme-white /* 回路列表区（最下边）：标签 + 表格纵向排列，撑满剩余高度 */
.pane-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}.theme-white /* 回路统计标签：占满整行，标签左、数字右（space-between），整体加粗
   注意：位于 teleport 弹窗内，rem 全局生效随屏缩放 */
.circuit-count-tag {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 0.08rem;
  padding: 0.06rem 0.12rem;
  font-size: 0.13rem;
  color: #303133;
  background: #fafbfc;
  border: 1px solid rgba(24, 144, 255, 0.3);
  border-radius: 0.04rem;
  white-space: nowrap;
}.theme-white .circuit-count-tag .stat-label {
  font-size: 0.13rem;
  font-weight: 700;  /* 加粗 */
  color: #606266;
}.theme-white .circuit-count-tag .stat-value {
  font-size: 0.2rem;  /* 数字放大，与主界面回路统计一致 */
  font-weight: 700;
  color: #1890ff;
  text-shadow: 0 0 0.08rem rgba(24, 144, 255, 0.4);
}.theme-white .circuit-count-tag .stat-value .highlight-text {
  color: #52c41a;
  text-shadow: 0 0 0.1rem rgba(82, 196, 26, 0.5);
}.theme-white /* 计数条左侧组合：标签 + 数字一体（刷新按钮单独贴最右） */
.circuit-count-tag .circuit-count-left {
  display: inline-flex;
  align-items: baseline;
  gap: 0.08rem;
}.theme-white /* 表格加载区：撑满剩余高度 */
.pane-table .pane-spin {
  flex: 1;
  min-height: 0;
}.theme-white .pane-table .pane-spin :deep(.ant-spin-nested-loading),
.theme-white .pane-table .pane-spin :deep(.ant-spin-container) {
  height: 100%;
  min-height: 0;
}.theme-white /* 回路表格容器：自适应剩余高度（表格与弹框契合） */
.space-tabs .circuit-vxe-table-wrap {
  height: 100%;
}.theme-white /* ===== 地块功能弹框内容（弹框头部/内容主题见文件底部全局样式） ===== */
/* 全开全关弹框按钮（放大） */
.all-modal-body {
  padding: 0.06rem 2px 2px;
}.theme-white .all-modal-body .switch-btn {
  padding: 0.14rem 0;
  font-size: 0.15rem;
  letter-spacing: 2px;
  border-radius: 0.06rem;
}.theme-white /* 场景虚拟列表：场景名单元格（颜色指示点 + 名称） */
.scene-cell {
  display: flex;
  align-items: center;
  gap: 0.08rem;
}.theme-white .scene-cell-name {
  color: #303133;
  font-size: 0.16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}.theme-white /* tab 标签栏浅色主题 */
.video-tabs {
  color: #303133;
}.theme-white .video-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0.06rem;  /* 压缩 tab 与内容的间距 */
}.theme-white .video-tabs :deep(.ant-tabs-nav-wrap) {
  overflow-x: auto;
}.theme-white .video-tabs :deep(.ant-tabs-tab) {
  background: #fafbfc !important;
  border: 1px solid rgba(24, 144, 255, 0.3) !important;
  color: #606266 !important;
  border-radius: 0.04rem;
  transition: all 0.2s ease;
}.theme-white .video-tabs :deep(.ant-tabs-tab-active) {
  background: rgba(24, 144, 255, 0.1) !important;
  border-color: rgba(24, 144, 255, 0.6) !important;
}.theme-white .video-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #1890ff !important;
  font-weight: 600;
}
</style>

<style lang="less">
.theme-white /* ===== 场景区域筛选下拉框：浅色科技风 + 高层级（teleport 渲染到 body，需全局样式） ===== */
.scene-area-dropdown {
  background: #ffffff !important;
  border: 1px solid rgba(24, 144, 255, 0.3) !important;
  border-radius: 0.06rem !important;
  box-shadow: 0 0.12rem 0.4rem rgba(0, 0, 0, 0.15), 0 0 0.16rem rgba(24, 144, 255, 0.08) !important;
  padding: 0.04rem !important;
  z-index: 70000 !important;  /* 高于控制面板 60000 与地图标点 50000，避免被遮挡 */
}.theme-white .scene-area-dropdown .ant-select-item {
  font-size: 0.13rem;
  color: #303133;
  background: transparent;
  border-radius: 0.04rem;
  min-height: 0.32rem;
  line-height: 0.32rem;
}.theme-white .scene-area-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}.theme-white .scene-area-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
  background: rgba(24, 144, 255, 0.08);
}.theme-white .scene-area-dropdown .ant-select-item-empty {
  color: #909399;
}.theme-white .scene-area-dropdown .ant-empty-description {
  color: #909399;
}.theme-white /* 搜索输入框（show-search 时面板内会出现） */
.scene-area-dropdown .ant-select-selection-search-input {
  color: #303133;
}.theme-white .scene-area-dropdown ::-webkit-scrollbar {
  width: 0.05rem;
}.theme-white .scene-area-dropdown ::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.03rem;
}.theme-white .scene-area-dropdown ::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
}.theme-white /* ===== 地块功能弹框 / 视频弹框 浅色科技主题 =====
   弹框经 teleport 渲染到 body，scoped 样式不生效，需全局样式（class + wrapClassName 均挂载到 .ant-modal-root） */
.video-modal .ant-modal-header,
.theme-white .space-modal .ant-modal-header {
  background: #fafbfc !important;
  border-bottom: 1px solid rgba(24, 144, 255, 0.25) !important;
  border-radius: 0.08rem 0.08rem 0 0 !important;
  padding: 0.16rem 0.24rem !important;
  position: relative;
}.theme-white /* header 底部发光线条 */
.video-modal .ant-modal-header::after,
.theme-white .space-modal .ant-modal-header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.45), transparent);
  pointer-events: none;
}.theme-white .video-modal .ant-modal-title,
.theme-white .space-modal .ant-modal-title {
  color: #303133 !important;
  font-size: 0.16rem !important;
  font-weight: 600 !important;
  letter-spacing: 1px;
  text-shadow: 0 0 0.1rem rgba(24, 144, 255, 0.25);
}.theme-white .video-modal .ant-modal-close,
.theme-white .space-modal .ant-modal-close {
  color: #909399 !important;
  background: rgba(0, 0, 0, 0.04) !important;
  border-radius: 50% !important;
  top: 0.15rem !important;
  right: 0.15rem !important;
  width: 0.3rem !important;
  height: 0.3rem !important;
  transition: all 0.25s ease;
}.theme-white .video-modal .ant-modal-close:hover,
.theme-white .space-modal .ant-modal-close:hover {
  color: #1890ff !important;
  background: rgba(24, 144, 255, 0.1) !important;
  box-shadow: 0 0 0.14rem rgba(24, 144, 255, 0.3);
  transform: rotate(90deg);
}.theme-white .video-modal .ant-modal-content,
.theme-white .space-modal .ant-modal-content {
  background: #ffffff !important;
  border: 1px solid rgba(24, 144, 255, 0.25) !important;
  border-radius: 0.08rem !important;
  box-shadow: 0 0.16rem 0.48rem rgba(0, 0, 0, 0.15), 0 0 0.2rem rgba(24, 144, 255, 0.08) !important;
}.theme-white /* 覆盖 a-modal bodyStyle 内联深色背景（#0b1a2f） */
.video-modal .ant-modal-body,
.theme-white .space-modal .ant-modal-body {
  background: #ffffff !important;
}.theme-white /* 弹框遮罩 */
.video-modal .ant-modal-mask,
.theme-white .space-modal .ant-modal-mask {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(2px);
}.theme-white /* ===== 弹框层级：高于一级列表浮层（space-menu z-index: 70000） ===== */
.video-modal.ant-modal-root,
.theme-white .space-modal.ant-modal-root,
.theme-white .video-modal.ant-modal-wrap,
.theme-white .space-modal.ant-modal-wrap,
.theme-white .video-modal .ant-modal-wrap,
.theme-white .space-modal .ant-modal-wrap,
.theme-white .video-modal .ant-modal-mask,
.theme-white .space-modal .ant-modal-mask {
  z-index: 90000 !important;
}.theme-white /* ===== 场景/回路 vxe-table 虚拟列表浅色主题 =====
   vxe-table 4.7 全部颜色基于 CSS 变量（由 [data-vxe-ui-theme=light] 定义），
   在表格根元素重新定义变量即可全局继承生效；另加元素级 !important 双保险 */
.scene-vxe-table-wrap,
.theme-white .circuit-vxe-table-wrap {
  /* 主题变量覆盖 */
  --vxe-ui-font-color: #303133;
  --vxe-ui-font-primary-color: #1890ff;
  --vxe-ui-font-lighten-color: #909399;
  --vxe-ui-font-darken-color: #303133;
  --vxe-ui-font-disabled-color: #c0c4cc;
  --vxe-ui-layout-background-color: #ffffff;
  --vxe-ui-table-background-color: #ffffff;
  --vxe-ui-table-border-color: #e4e7ed;
  --vxe-ui-table-border-radius: 0.06rem;
  --vxe-ui-table-header-background-color: #f5f7fa;
  --vxe-ui-table-header-hover-background-color: #eef3f8;
  --vxe-ui-table-header-font-color: #1890ff;
  --vxe-ui-table-header-font-weight: 600;
  --vxe-ui-table-row-hover-background-color: rgba(24, 144, 255, 0.05);
  --vxe-ui-table-row-hover-color: #303133;
  --vxe-ui-table-row-striped-background-color: #fafbfc;
  --vxe-ui-table-row-hover-striped-background-color: rgba(24, 144, 255, 0.08);
  --vxe-ui-table-column-hover-background-color: rgba(24, 144, 255, 0.05);
  --vxe-ui-table-column-current-background-color: rgba(24, 144, 255, 0.06);
  --vxe-ui-table-row-current-background-color: rgba(24, 144, 255, 0.08);
  --vxe-ui-base-popup-border-color: rgba(24, 144, 255, 0.3);
  --vxe-ui-base-popup-box-shadow: 0 0.08rem 0.24rem rgba(0, 0, 0, 0.15);
  /* 元素级兜底 */
  background: transparent !important;
  color: #303133 !important;
  font-size: 0.13rem;
}.theme-white /* 场景列表：最小宽度 5.68rem（比原内容区 4.68rem 宽 1rem，配合弹框加宽到 6rem） */
.scene-vxe-table-wrap {
  min-width: 5.68rem;
}.theme-white .scene-vxe-table-wrap .vxe-table--header-wrapper,
.theme-white .circuit-vxe-table-wrap .vxe-table--header-wrapper {
  background: #f5f7fa !important;
}.theme-white .scene-vxe-table-wrap .vxe-header--column,
.theme-white .circuit-vxe-table-wrap .vxe-header--column {
  background: transparent !important;
  color: #1890ff !important;
  border-bottom: 1px solid rgba(24, 144, 255, 0.25) !important;
}.theme-white /* 回路表头：字号调小、不加粗，与正文内容拉开层次
   注意：位于 teleport 弹窗内，rem 全局生效（useScreenScale），随屏缩放 */
.circuit-vxe-table-wrap .vxe-header--column {
  font-size: 0.12rem;
  font-weight: 400;
}.theme-white .scene-vxe-table-wrap .vxe-body--column,
.theme-white .circuit-vxe-table-wrap .vxe-body--column {
  background: transparent !important;
  border-bottom: 1px solid #e4e7ed !important;
  color: #303133 !important;
}.theme-white .scene-vxe-table-wrap .vxe-row:hover .vxe-body--column,
.theme-white .circuit-vxe-table-wrap .vxe-row:hover .vxe-body--column {
  background: rgba(24, 144, 255, 0.05) !important;
  color: #303133 !important;
}.theme-white /* 单元格内边距：列间距更透气 */
.scene-vxe-table-wrap .vxe-cell,
.theme-white .circuit-vxe-table-wrap .vxe-cell {
  padding: 0 0.1rem !important;
}.theme-white /* 回路表格浅色滚动条（列表超宽/超高时可滚动查看） */
.circuit-vxe-table-wrap ::-webkit-scrollbar {
  width: 0.06rem;
  height: 0.06rem;
}.theme-white .circuit-vxe-table-wrap ::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 0.03rem;
}.theme-white .circuit-vxe-table-wrap ::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.03rem;
}.theme-white .circuit-vxe-table-wrap ::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.35);
}.theme-white /* 固定列分隔阴影 */
.scene-vxe-table-wrap .vxe-table--fixed-left-wrapper,
.theme-white .circuit-vxe-table-wrap .vxe-table--fixed-left-wrapper {
  box-shadow: 0.04rem 0 0.12rem rgba(0, 0, 0, 0.25);
}.theme-white .scene-vxe-table-wrap .vxe-table--border-line,
.theme-white .circuit-vxe-table-wrap .vxe-table--border-line,
.theme-white .scene-vxe-table-wrap .vxe-table--main-wrapper,
.theme-white .circuit-vxe-table-wrap .vxe-table--main-wrapper {
  border-color: #e4e7ed !important;
}.theme-white .scene-vxe-table-wrap .vxe-table--body-wrapper,
.theme-white .circuit-vxe-table-wrap .vxe-table--body-wrapper,
.theme-white .scene-vxe-table-wrap .vxe-table--virtual-wrapper,
.theme-white .circuit-vxe-table-wrap .vxe-table--virtual-wrapper {
  background: transparent !important;
}.theme-white .scene-vxe-table-wrap .vxe-table--body-wrapper::-webkit-scrollbar,
.theme-white .circuit-vxe-table-wrap .vxe-table--body-wrapper::-webkit-scrollbar {
  width: 0.06rem;
  height: 0.06rem;
}.theme-white .scene-vxe-table-wrap .vxe-table--body-wrapper::-webkit-scrollbar-thumb,
.theme-white .circuit-vxe-table-wrap .vxe-table--body-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.03rem;
}.theme-white .scene-vxe-table-wrap .vxe-table--body-wrapper::-webkit-scrollbar-track,
.theme-white .circuit-vxe-table-wrap .vxe-table--body-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
}.theme-white /* ===== 场景列表单元格内容（teleport 后 scoped 可能失效，全局兜底） ===== */
.scene-cell {
  display: flex;
  align-items: center;
  gap: 0.1rem;
}.theme-white .scene-indicator-icon {
  width: 0.12rem;
  height: 0.12rem;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0.06rem currentColor;
}.theme-white .scene-cell-name {
  flex: 1;
  min-width: 0;
  color: #303133;
  font-size: 0.16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}.theme-white /* 场景行中间详情按钮：玻璃态描边风格 */
.scene-mid-detail {
  flex-shrink: 0;
  margin: 0 !important;
  padding: 0.04rem 0.18rem;
  height: 0.34rem;
  min-width: 0.68rem;
  border-radius: 0.08rem;
  font-size: 0.17rem;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(24, 144, 255, 0.12);
  border: 1px solid rgba(24, 144, 255, 0.5);
  color: #1890ff;
  transition: all 0.2s ease;
}.theme-white .scene-mid-detail:hover {
  background: rgba(24, 144, 255, 0.2);
  border-color: rgba(24, 144, 255, 0.8);
  transform: translateY(-1px);
}.theme-white /* 场景行按钮组：统一玻璃态描边风格（详情/开/关） */
.scene-btn-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.06rem;
}.theme-white .scene-btn-group .detail-btn,
.theme-white .scene-btn-group .scene-action-btn {
  padding: 0.03rem 0.1rem;
  height: 0.24rem;
  min-width: 0.4rem;
  border-radius: 0.04rem;
  font-size: 0.11rem;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(24, 144, 255, 0.08);
  border: 1px solid rgba(24, 144, 255, 0.4);
  color: #1890ff;
  text-shadow: 0 0 0.06rem rgba(24, 144, 255, 0.3);
  transition: all 0.2s ease;
}.theme-white .scene-btn-group .detail-btn:hover {
  background: rgba(24, 144, 255, 0.15);
  border-color: rgba(24, 144, 255, 0.7);
  box-shadow: 0 0 0.12rem rgba(24, 144, 255, 0.3);
  transform: translateY(-1px);
}.theme-white .scene-btn-group .on-btn {
  background: rgba(82, 196, 26, 0.1);
  border-color: rgba(82, 196, 26, 0.45);
  color: #52c41a;
  text-shadow: 0 0 0.06rem rgba(82, 196, 26, 0.3);
}.theme-white .scene-btn-group .on-btn:hover {
  background: rgba(82, 196, 26, 0.18);
  border-color: rgba(82, 196, 26, 0.7);
  box-shadow: 0 0 0.12rem rgba(82, 196, 26, 0.3);
  transform: translateY(-1px);
}.theme-white .scene-btn-group .off-btn {
  background: rgba(255, 77, 79, 0.1);
  border-color: rgba(255, 77, 79, 0.45);
  color: #ff4d4f;
  text-shadow: 0 0 0.06rem rgba(255, 77, 79, 0.3);
}.theme-white .scene-btn-group .off-btn:hover {
  background: rgba(255, 77, 79, 0.18);
  border-color: rgba(255, 77, 79, 0.7);
  box-shadow: 0 0 0.12rem rgba(255, 77, 79, 0.3);
  transform: translateY(-1px);
}.theme-white /* 回路状态徽章（全局兜底） */
.circuit-vxe-table-wrap .circuit-status {
  font-size: 0.12rem;
  font-weight: 600;
  flex-shrink: 0;
}.theme-white .circuit-vxe-table-wrap .circuit-status.is-on {
  color: #52c41a;
  text-shadow: 0 0 0.08rem rgba(82, 196, 26, 0.3);
}.theme-white .circuit-vxe-table-wrap .circuit-status.is-off {
  color: #ff4d4f;
  text-shadow: 0 0 0.08rem rgba(255, 77, 79, 0.3);
}
</style>
