<template>
  <div class="north-lighting-overview" @click="onMapClick" :class="themeClass">
    <!-- 统计卡片（可折叠区域，右上角折叠按钮） -->
    <section class="panel-box stats-panel">
      <header class="panel-box-header">
        <div class="card-title">📊 数据总览</div>
        <!-- <div class="card-title"></div> -->
        <button class="collapse-btn" :class="{ collapsed: statsCollapsed }" @click="toggleStats">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <span>折叠</span>
        </button>
      </header>
      <div class="stats-row" v-show="!statsCollapsed">
        <div class="stat-card">
          <div class="stat-label">照明地块</div>
          <div class="stat-value" style="color: var(--accent)">{{ allSpaceList.length }}</div>
          <div class="stat-trend trend-up">
            <span>{{ stats.blockCoverage }} 覆盖</span>
          </div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">回路数</div>
          <div class="stat-value" style="color: var(--accent2)">{{ circuitCount }}</div>
          <div class="stat-trend trend-up">{{ onlineRate }} 在线率</div>
        </div>
        <div class="stat-card orange"> 
          <div class="stat-label">已开启回路数</div>
          <div class="stat-value" style="color: var(--accent2)">{{ openCircuitCount }} </div>
        </div>
        <div class="stat-card red">
          <div class="stat-label">待处理报警</div>
          <div class="stat-value">{{ pendingAlarm }}</div>
          <div class="stat-trend trend-down"></div>
        </div>
      </div>
    </section>

    <!-- 主内容区：左侧地图 + 右侧两栏（可折叠区域，右上角折叠按钮） -->
    <section class="panel-box main-panel" :class="{ 'collapsed-panel': mainCollapsed }">
      <header class="panel-box-header">
        <div class="card-title">⚡ 照明控制</div>
        <!-- <div class="card-title"></div> -->
        <button class="collapse-btn" :class="{ collapsed: mainCollapsed }" @click="toggleMain">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <span>折叠</span>
        </button>
      </header>
      <div class="main-area" v-show="!mainCollapsed">
      <!-- 左列：地图 -->
      <div class="main-left">
        <div ref="mapCardRef" class="card card-fill" :class="{ 'map-fullscreen': isMapFullscreen }">
          <div class="card-title-row">
            <div class="card-title">🗺️ 地图模式 - 北区照明地块分布</div>
            <button
              class="map-fullscreen-btn"
              :class="{ 'is-fullscreen': isMapFullscreen }"
              :title="isMapFullscreen ? '退出全屏（Esc）' : '全屏展示（Esc 退出）'"
              @click="toggleMapFullscreen"
            >
              <svg v-if="!isMapFullscreen" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
              </svg>
              <span class="btn-text">{{ isMapFullscreen ? '退出全屏' : '全屏' }}</span>
            </button>
          </div>
          <div class="map-shell">
            <MapView ref="mapViewRef" @light-marker-single-click="onLightMarkerSingleClick" @space-marker-click="onSpaceMarkerClick" />
            <!-- 底部控制按钮组：地块模式 / 详情模式（样式功能参考 bigGis） -->
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
          </div>
        </div>
      </div>

      <!-- 右列：一键控制 + 表单模式上下排列 -->
      <div class="main-right">
        <div class="card card-control">
          <div class="card-title">一键开关</div>
          <div style="display: flex; gap: 0.15rem; flex-wrap: wrap">
            <div class="control-box">
              <div style="font-size: 0.32rem; margin-bottom: 0.1rem">☀️</div>
              <div style="font-weight: 600; margin-bottom: 0.05rem">全区开灯</div>
              <div style="font-size: 0.12rem; color: var(--text2); margin-bottom: 0.15rem">开启所有地块照明</div>
              <button class="btn btn-success" style="width: 100%" @click="handleAllOn">全开</button>
            </div>
            <div class="control-box">
              <div style="font-size: 0.32rem; margin-bottom: 0.1rem">🌙</div>
              <div style="font-weight: 600; margin-bottom: 0.05rem">全区关灯</div>
              <div style="font-size: 0.12rem; color: var(--text2); margin-bottom: 0.15rem">关闭所有地块照明</div>
              <button class="btn btn-danger" style="width: 100%" @click="handleAllOff">全关</button>
            </div>
          </div>
        </div>

        <div class="card card-table">
          <div class="card-title">表单模式 - 地块运行状态</div>
          <table class="overview-table">
            <thead>
              <tr>
                <th>标签</th>
                <th>回路数</th>
                <th>回路开启数</th>
                <th>回路关闭数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in spaceTableData" :key="item.spaceName">
                <td>{{ item.spaceName }}</td>
                <td>{{ item.circuits }}</td>
                <td>{{ item.openCount }}</td>
                <td>{{ item.closeCount }}</td>
                <td>
                  <button class="btn btn-sm btn-success" style="padding: 0.04rem 0.12rem; font-size: 0.12rem" @click="handleControlOn(item)">开</button>
                  <button class="btn btn-sm btn-danger" style="margin-left: 0.06rem; padding: 0.04rem 0.12rem; font-size: 0.12rem" @click="handleControlOff(item)">关</button>
                  <button class="btn btn-sm btn-primary" style="margin-left: 0.06rem; padding: 0.04rem 0.12rem; font-size: 0.12rem" @click.stop="openVideoModal(item.spaceName)">监控视频</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </section>

    <!-- 定时控制（参照上面两个模块：外包盒子 + 右上角折叠按钮，折叠功能一致） -->
    <section class="panel-box schedule-panel" :class="{ 'collapsed-panel': timerCollapsed }">
      <header class="panel-box-header">
        <div class="card-title">⏰ 定时控制</div>
        <div style="display: flex; align-items: center; gap: 0.1rem;">
          <button class="collapse-btn" :class="{ collapsed: timerCollapsed }" @click="toggleTimer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            <span>折叠</span>
          </button>
        </div>
      </header>
      <div v-show="!timerCollapsed">
      <header class="panel-header">
        <div class="left">
          <svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <h2 class="panel-title">定时控制</h2>
          <span class="panel-count">
            <span class="count-label">已查</span>
            <span class="count-filtered">{{ filteredTimerList.length }}</span>
            <span class="count-label">条</span>
            <span class="count-sep">/</span>
            <span class="count-label">共</span>
            <span class="count-total">{{ timerTotal }}</span>
            <span class="count-label">条</span>
          </span>
        </div>
        <div class="header-right">
          <a-input
            v-model:value="timerFilters.planName"
            placeholder="名称"
            allowClear
            style="width: 160px"
          />
          <a-select
            v-model:value="timerFilters.relType"
            placeholder="控制类型"
            :options="relTypeFilterOptions"
            allowClear
            style="width: 140px"
          />
          <a-time-picker
            v-model:value="timerFilters.startTime"
            placeholder="开始时间"
            format="HH:mm:ss"
            style="width: 160px"
          />
          <span class="filter-separator">—</span>
          <a-time-picker
            v-model:value="timerFilters.endTime"
            placeholder="结束时间"
            format="HH:mm:ss"
            style="width: 160px"
          />
          <button class="btn btn-primary" @click="onTimerSearch">查询</button>
          <button class="btn btn-outline" @click="onTimerReset">重置</button>
          <button class="btn btn-outline export-btn" @click="onExportTimer" style="margin-right: 5%;">导出数据</button>
          <!-- 新建定时任务按钮（暂不展示） -->
          <!--
          <button class="btn btn-primary" @click="onAddTimer">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            新建定时任务
          </button>
          -->
        </div>
      </header>

      <!-- 表格 -->
      <div class="table-wrapper" v-loading="timerLoading">
        <table class="timer-table">
          <thead>
            <tr>
              <th style="width: 5%">序号</th>
              <th style="width: 5%">类型</th>
              <th style="width: 18%">名称</th>
              <th style="width: 9%">时间</th>
              <th style="width: 18%">时间范围</th>
              <th style="width: 13%">周期</th>
              <th style="width: 8%">控制指令</th>
              <th style="width: 7%">状态</th>
              <th style="width: 17%">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in filteredTimerList" :key="row.id">
              <td><span class="cell-text">{{ idx + 1 }}</span></td>
              <td><span class="cell-text" :title="row.relType">{{ row.relType }}</span></td>
              <td><span class="cell-text" :title="row.planName">{{ row.planName }}</span></td>
              <td><span class="cell-text" :title="row.executionLocalTime || row.executionTime">{{ row.executionLocalTime || row.executionTime }}</span></td>
              <td><span class="cell-text" :title="row.date">{{ row.date }}</span></td>
              <td><span class="cell-text" :title="row.weeks">{{ row.weeks }}</span></td>
              <td><span class="cell-text" :title="row.operationType">{{ row.operationType }}</span></td>
              <td>
                <span
                  class="timer-status-badge"
                  :class="row.status === '启用' ? 'status-enabled' : 'status-disabled'"
                  :title="row.status"
                >{{ row.status }}</span>
              </td>
              <td class="timer-actions">
                <button v-if="row.status === '禁用'" class="btn btn-secondary" @click="onEditTimer(row, 'edit')">编辑</button>
                <button v-else class="btn btn-secondary" @click="onEditTimer(row, 'detail')">详情</button>

                <a-popconfirm
                  v-if="row.status !== '启用'"
                  title="确认删除该条数据？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleDelete(row)"
                >
                  <button class="btn btn-danger">删除</button>
                </a-popconfirm>

                <button
                  v-if="row.status != '启用'"
                  class="btn btn-success"
                  @click="onToggleTimer(row)"
                >启用</button>
                <template v-else>
                  <a-popconfirm title="确认禁用该条计划？" ok-text="确定" cancel-text="取消" @confirm="handleDisable(row)">
                    <button
                      class="btn btn-danger"
                    >禁用</button>
                  </a-popconfirm>
                </template>

                <a-popconfirm
                  v-if="row.status == '启用'"
                  title="确认立即执行该条计划？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleExecuteNow(row)"
                >
                  <button
                  class="btn btn-success"
                >立即执行</button>
                </a-popconfirm>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </section>

    <!-- 控制日历（参照上面两个模块：外包盒子 + 右上角折叠按钮，折叠功能一致） -->
    <section class="panel-box calendar-panel" :class="{ 'collapsed-panel': calendarCollapsed }">
      <header class="panel-box-header">
        <div class="card-title">📅 控制日历</div>
        <button class="collapse-btn" :class="{ collapsed: calendarCollapsed }" @click="toggleCalendar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <span>折叠</span>
        </button>
      </header>
      <div v-show="!calendarCollapsed">
      <header class="panel-header">
        <div class="left">
          <svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <h2 class="panel-title">控制日历 - {{ calendarYear }}年{{ calendarMonth + 1 }}月</h2>
        </div>
        <div class="calendar-legend">
          <span class="legend-item"><i class="legend-dot" style="background:#00a2e8"></i>待执行</span>
          <span class="legend-item"><i class="legend-dot" style="background:#ff4d4f"></i>执行失败</span>
          <span class="legend-item"><i class="legend-dot" style="background:#52c41a"></i>执行成功</span>
        </div>
        <div class="calendar-nav">
          <button class="btn btn-text" title="上一年" @click="prevYear">«</button>
          <button class="btn btn-text" title="上一月" @click="prevMonth">‹</button>
          <button class="btn btn-secondary" @click="goToToday">日期</button>
          <button class="btn btn-text" title="下一月" @click="nextMonth">›</button>
          <button class="btn btn-text" title="下一年" @click="nextYear">»</button>
        </div>
      </header>

      <div v-loading="calendarLoading" class="calendar-grid">
        <div v-for="day in weekDays" :key="day" class="calendar-weekday">{{ day }}</div>
        <div
          v-for="(cell, idx) in calendarDays"
          :key="idx"
          class="calendar-day"
          :class="{ 'other-month': !cell.isCurrentMonth }"
        >
          <span class="day-number">{{ cell.date }}</span>
          <div class="day-tasks">
            <span
              v-for="event in cell.events"
              :key="`${event.planId}-${event.planName}`"
              class="task-tag"
              :class="getEventTagClass(event)"
              :title="`${event.label} [${event.planName}]（点击查看详情）`"
              @click.stop="openEventDetail(event)"
            >
               {{ event.label }}【{{ event.planName }}】
            </span>
          </div>
        </div>
      </div>
      </div>
    </section>

    <!-- 弹窗组件：新建定时任务 / 启用定时任务 / 控制日历详情（与设备监控页一致） -->
    <createNewTimerModal
      ref="createNewTimerModalRef"
      :key="`create-timer-modal-${isMapFullscreen ? 'fs' : 'normal'}`"
      :container="lightModalContainer"
      @success="createNewTimerModalSuccess"
    ></createNewTimerModal>
    <TimerEnableModal
      ref="timerEnableModalRef"
      :key="`timer-enable-modal-${isMapFullscreen ? 'fs' : 'normal'}`"
      :container="lightModalContainer"
      @success="onTimerEnableSuccess"
    ></TimerEnableModal>
    <CalendarEventDetailModal
      ref="calendarEventDetailModalRef"
      :key="`calendar-event-modal-${isMapFullscreen ? 'fs' : 'normal'}`"
      :container="lightModalContainer"
    ></CalendarEventDetailModal>

    <!-- 灯光详情弹框（点击地图标点打开：一键开关/监控视频，与 bigGis 详情模式标点弹框一致）
         弹框宽度参照地块模式监控视频弹框（820px），保证"监控视频"页签视频宽高与地块模式一致 -->
    <a-modal
      v-model:open="lightTabsModalVisible"
      :key="`light-tabs-modal-${isMapFullscreen ? 'fs' : 'normal'}`"
      :title="currentSpaceName + '-' + lightAreaName"
      :footer="null"
      width="820px"
      centered
      :zIndex="90000"
      :getContainer="lightModalContainer"
      class="space-modal"
      wrapClassName="space-modal"
      :bodyStyle="{ padding: '16px', background: '#0b1a2f' }"
      @cancel="onSpaceModalCancel"
    >
      <a-tabs type="card" class="video-tabs space-tabs">
        <!-- 1. 灯光控制（整合页签）：一键开关（上）→ 回路列表（下，左上侧展示已开启/总回路数） -->
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
        <!-- 2. 监控视频（与 bigGis 一致：写死地址前缀拼接 monitorAdr，不调接口） -->
        <a-tab-pane key="video" tab="监控视频">
          <div v-if="lightVideoUrl" class="video-modal-item">
            <VideoPlayer :url="lightVideoUrl" />
          </div>
          <div v-else class="space-submenu-empty">暂无监控视频</div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <!-- 统一二次确认弹框（提示样式：标题栏 + 信息图标 + 动作词高亮） -->
    <ConfirmModal ref="confirmModalRef" :container="lightModalContainer" />

    <!-- 地块功能浮层（地块模式点击灯光图标弹出：一键开关/场景模式/监控视频/详情，参考 bigGis space-menu；菜单点击逻辑后续补充） -->
    <!-- 挂载到 lightModalContainer（全屏时 = 地图卡片内部）：原生全屏下浏览器只渲染全屏元素，浮层挂在 body/根元素下会不可见，与弹框的挂载策略一致 -->
    <Teleport :to="lightModalContainer">
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
    </Teleport>

    <!-- 一键开关弹框（地块模式点击"一键开关"菜单打开：全开/全关，参照 bigGis 全开全关弹框） -->
    <a-modal
      v-model:open="allModalVisible"
      :key="`all-modal-${isMapFullscreen ? 'fs' : 'normal'}`"
      title="一键开关"
      :footer="null"
      width="360px"
      centered
      :zIndex="90000"
      :getContainer="lightModalContainer"
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

    <!-- 场景模式弹框（地块模式点击"场景模式"菜单打开：场景列表 + 详情/开/关，参照 bigGis） -->
    <a-modal
      v-model:open="sceneModalVisible"
      :key="`scene-modal-${isMapFullscreen ? 'fs' : 'normal'}`"
      title="场景模式"
      :footer="null"
      width="600px"
      centered
      :zIndex="90000"
      :getContainer="lightModalContainer"
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

    <!-- 监控视频弹框（地块模式点击"监控视频"菜单打开：tab 展示多个视频，参照 bigGis video-modal；挂载策略与其他弹框一致） -->
    <a-modal
      v-model:open="videoModalVisible"
      :key="`video-modal-${isMapFullscreen ? 'fs' : 'normal'}`"
      title="监控视频"
      :footer="null"
      width="820px"
      centered
      :zIndex="90000"
      :getContainer="lightModalContainer"
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

    <!-- 地块回路弹框（地块模式点击"详情"菜单打开：回路列表，参照 bigGis space-modal；挂载策略与其他弹框一致） -->
    <a-modal
      v-model:open="detailModalVisible"
      :key="`detail-modal-${isMapFullscreen ? 'fs' : 'normal'}`"
      title="地块回路"
      :footer="null"
      width="540px"
      centered
      :zIndex="90000"
      :getContainer="lightModalContainer"
      class="space-modal"
      wrapClassName="space-modal"
      :bodyStyle="{ padding: '16px', background: '#0b1a2f' }"
      @cancel="onSpaceModalCancel"
    >
      <a-spin :spinning="detailCircuitLoading">
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

    <!-- 场景详情弹窗（参照 bigGis：场景模式弹框点"详情"打开） -->
    <SceneDetailModal
      ref="sceneDetailModalRef"
      :map-view-ref="mapViewRef"
      :key="`scene-detail-${isMapFullscreen ? 'fs' : 'normal'}`"
      :container="lightModalContainer"
    />

    <!-- 操作日志（样式原样复制自 controlLog 页面操作日志模块，外面套 panel-box 盒子 + 右上角折叠按钮，参照上面模块） -->
    <section class="panel-box log-panel" :class="{ 'collapsed-panel': logCollapsed }">
      <header class="panel-box-header">
        <div class="card-title">📋 操作日志</div>
        <button class="collapse-btn" :class="{ collapsed: logCollapsed }" @click="toggleLog">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <span>折叠</span>
        </button>
      </header>
      <div v-show="!logCollapsed">
        <div class="log-card">
          <div class="card-header">
          <span class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </span>
          <h2 class="card-title">操作日志</h2>
        </div>
        <!-- 查询条件 -->
        <div class="filter-bar">
          <div class="filter-item">
            <label class="filter-label">操作时间</label>
            <a-range-picker
              v-model:value="dateRange"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="['开始日期', '结束日期']"
              class="filter-date-picker"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">操作类型</label>
            <select v-model="operationType" class="select">
              <option value="">全部</option>
              <option value="开">开启</option>
              <option value="关">关闭</option>
            </select>
          </div>
          <div class="filter-item">
            <label class="filter-label">名称</label>
            <el-input
              v-model="nameInput"
              placeholder="请输入名称"
              clearable
              class="filter-input"
              @keyup.enter="onSearch"
            />
          </div>
          <div class="filter-item">
            <el-button type="primary" @click="onSearch">查询</el-button>
            <el-button @click="onReset">重置</el-button>
            <el-button @click="onExportLog">导出数据</el-button>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="log-table">
            <colgroup>
              <col style="width: 100px;" />
              <col style="width: 70px;" />
              <col style="width: 230px;" />
              <col style="width: 80px;" />
              <col style="width: 80px;" />
              <col style="width: 100px;" />
              <col style="width: 80px;" />
            </colgroup>
            <thead>
              <tr>
                <th>操作时间</th>
                <th>类型</th>
                <th>名称</th>
                <th>操作状态</th>
                <th>触发类型</th>
                <th>操作人员</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in tableData" :key="item.id || index">
                <td>{{ item.operationTime }}</td>
                <td>{{ item.relType }}</td>
                <td class="cell-wrap">{{ item.name }}</td>
                <td class="cell-wrap">{{ item.operationType === '开' ? '开启' : item.operationType === '关' ? '关闭' : '-'}}</td>
                <td>{{ item.operatorType }}</td>
                <td>{{ item.operationBy }}</td>
                <td>
                  <el-button type="primary" link size="small" @click="onDetail(item)">详情</el-button>
                </td>
              </tr>
              <tr v-if="!loading && tableData.length === 0">
                <td colspan="7" style="text-align: center; padding: 24px;">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 分页 -->
        <div class="pagination-bar">
          <span class="pagination-info">共 {{ total }} 条</span>
          <button
            class="pagination-btn"
            :disabled="currentPage <= 1"
            @click="onPageChange(currentPage - 1)"
          >上一页</button>
          <span class="pagination-current">{{ currentPage }} / {{ Math.ceil(total / pageSize) || 1 }}</span>
          <button
            class="pagination-btn"
            :disabled="currentPage >= Math.ceil(total / pageSize)"
            @click="onPageChange(currentPage + 1)"
          >下一页</button>
        </div>
        </div>
      </div>
    </section>

    <!-- 操作日志详情弹窗（复制自 controlLog 页面操作日志详情） -->
    <a-modal
      v-model:open="detailVisible"
      title="操作日志详情"
      width="880px"
      :footer="null"
      wrapClassName="control-log-detail-modal"
      :getContainer="false"
      @cancel="closeDetail"
    >
      <!-- 标题信息 -->
      <section class="modal-title">
        <div class="title-left">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <div class="title-text">
            <span class="title-label">名称</span>
            <span class="title-value">{{ detailData?.name || detailRecord?.name || '-' }}</span>
          </div>
        </div>
        <div class="title-meta">
          <span>类型：{{ detailData?.relType || detailRecord?.relType || '-' }}</span>
          <span>操作类型：{{ detailData?.operationType === '开' ? '开启' : detailData?.operationType === '关' ? '关闭' : '-'}}</span>
          <span>操作人员：{{ detailData?.operationBy || detailRecord?.operationBy || '-' }}</span>
          <span>操作时间：{{ detailData?.operationTime || detailRecord?.operationTime || '-' }}</span>
        </div>
      </section>

      <!-- 详情列表 -->
      <section class="table-container" v-loading="detailLoading">
        <table class="device-table">
          <colgroup>
            <col style="width: 60px;" />
            <col />
            <col style="width: 90px;" />
            <col style="width: 90px;" />
            <col style="width: 90px;" />
          </colgroup>
          <thead>
            <tr>
              <th>序号</th>
              <th>回路名称</th>
              <th>类型</th>
              <th>操作类型</th>
              <th>操作人员</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in circuitDetailList" :key="idx">
              <td>{{ idx + 1 }}</td>
              <td class="ellipsis-cell" :title="item.name">{{ item.name || '-' }}</td>
              <td>{{ item.relType || '-' }}</td>
              <td>{{ item.operationType === '开' ? '开启' : item.operationType === '关' ? '关闭' : '-'}}</td>
              <td>{{ item.operationBy || '-' }}</td>
            </tr>
            <tr v-if="circuitDetailList.length === 0">
              <td colspan="6" style="text-align: center; padding: 24px; color: #8fa3bf;">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="modal-footer">
        <a-button class="btn-cancel" @click="closeDetail">关闭</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
// 主题切换：sessionStorage.UserRoles 包含 'bqzm' → 黑色，否则白色
import { useScreenTheme } from '../useScreenTheme';
import { exportExcel } from '/@/utils/export';
const { themeClass } = useScreenTheme();
// 主题 class 同步到 body：弹窗/浮层挂载到 document.body，需在 body 上也能命中 .theme-white 覆盖层
onMounted(() => {
  document.body.classList.add(themeClass);
});
onBeforeUnmount(() => {
  document.body.classList.remove('theme-white', 'theme-black');
});

  import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import type { Dayjs } from 'dayjs';
  import MapView from './MapView.vue';
  import { useScreenScale } from '../useScreenScale';
  import { message } from 'ant-design-vue';
  import ConfirmModal from '../equipmentMonitoring/components/ConfirmModal.vue';
  import createNewTimerModal from '../equipmentMonitoring/components/createNewTimerModal.vue';
  import TimerEnableModal from '../equipmentMonitoring/components/TimerEnableModal.vue';
  import { getCircuitListApi, setAreaOpenApi, setAreaCloseApi } from '@/api/baseSettingBqZm';
  import {
    postSceneSwitchApi,
    getLightingPlanAPi,
    deleteLightingPlanAPi,
    disableApi,
    executeNow,
    getLightingPlanAPiNew,
    planDetailApiNew,
    getLightingProgramList,
    getLightingProgramControl,
    postProgramAllControl,
    getAreaListBySpaceName,
    postControlBySpaceName,
    getCalendarControlApi,
    postSceneControlApi,
    controlRecordListApi,
    getLogDetailApi,
  } from '@/api/equipmentMonitoring';
  import VideoPlayer from '../equipmentMonitoring/components/VideoPlayer.vue';
  import CalendarEventDetailModal from '../equipmentMonitoring/components/CalendarEventDetailModal.vue';
  import SceneDetailModal from '../bigGis/components/SceneDetailModal.vue';

  // 大屏自适应：动态 rem 基准（1rem = 100px @1920），样式统一 rem + flex + vw/vh
  useScreenScale();
  import { getOverviewStatsApi, allOnApi, allOffApi, getAllSpaceApi, getAllCircuitApi, getSceneSpaceApi, getVideoListBySpaceApi } from './comprehensivePreview.api';
  import { useMessage } from '/@/hooks/web/useMessage';

  const mapViewRef = ref<InstanceType<typeof MapView> | null>(null);

  // ==================== 地图全屏 ====================
  // 对「地图卡片元素」本身调用原生 Fullscreen API（F11 效果：隐藏浏览器工具栏/地址栏，
  // 仅地图占满整个视口，页面其余内容不显示），而非对整个页面根元素全屏；
  // 若处于无 allowfullscreen 权限的 iframe 中（requestFullscreen 被拒绝），
  // 则自动降级为 CSS fixed 定位覆盖视口（.map-fullscreen class），保证功能可用。
  const mapCardRef = ref<HTMLElement | null>(null);
  const isMapFullscreen = ref(false);
  // 是否为原生全屏（跟踪 document.fullscreenElement），用于区分 CSS 降级态
  const isBrowserFullscreen = ref(false);

  /**
   * 灯光弹框挂载容器：地图全屏时挂载到地图卡片内部，否则默认挂载到 body。
   * 原因：1) 原生全屏下浏览器只渲染全屏元素，teleport 到 body 的弹框不可见；
   *      2) CSS 降级全屏时 .map-fullscreen z-index(99999) 高于弹框(90000)，弹框会被地图卡片遮挡。
   * 挂载到地图卡片内部后，两种情况弹框都在全屏元素内，可正常显示。
   *
   * 注意：antd-vue 的 Portal 组件（es/_util/Portal.js）内部缓存了挂载容器，getContainer 变化时
   * PortalWrapper 只移除旧容器而不更新 Portal 的引用（teleport 指向脱离文档的 div），导致弹框不显示。
   * 因此所有弹框必须绑定 :key="isMapFullscreen ? 'fs' : 'normal'"，在全屏状态切换时强制重建
   * DialogWrap -> PortalWrapper -> Portal 整条链路，让 Portal 重新挂载到新容器。
   */
  const lightModalContainer = computed(() =>
    isMapFullscreen.value && mapCardRef.value ? mapCardRef.value : document.body,
  );

  /** 全屏状态切换后通知地图引擎重算渲染尺寸（SDK 未暴露 resize 时静默忽略）。
   *  布局（原生全屏 / CSS fixed 降级）是异步分帧完成的，单次 60ms 调用不可靠，
   *  故延迟多次调用兜底，确保 canvas 最终与容器一致；MapView 内另有 ResizeObserver 自动适配。 */
  function notifyMapResize(delay = 60) {
    setTimeout(() => {
      const map = mapViewRef.value?.map;
      if (map && typeof (map as any).resize === 'function') {
        (map as any).resize();
      }
    }, delay);
  }

  async function enterMapFullscreen() {
    if (isMapFullscreen.value) return;
    isMapFullscreen.value = true;
    // 先让 CSS fixed 全屏样式生效（原生全屏成功时同样用其覆盖视口隐藏其余内容）
    await nextTick();
    let native = false;
    try {
      const el = mapCardRef.value;
      if (el && el.requestFullscreen) {
        await el.requestFullscreen();
        native = true;
      }
    } catch {
      // iframe 无 fullscreen 权限时静默降级为 CSS 全屏
    }
    isBrowserFullscreen.value = native;
    // 等待样式生效后再通知地图适配新尺寸（多次延迟兜底，覆盖布局分帧完成的时序）
    [60, 250, 600].forEach(notifyMapResize);
  }

  function exitMapFullscreen() {
    if (!isMapFullscreen.value) return;
    // 原生全屏由浏览器退出（会触发 fullscreenchange 同步状态）
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    isMapFullscreen.value = false;
    isBrowserFullscreen.value = false;
    nextTick(() => [60, 250, 600].forEach(notifyMapResize));
  }

  function toggleMapFullscreen() {
    if (isMapFullscreen.value) {
      exitMapFullscreen();
    } else {
      enterMapFullscreen();
    }
  }

  /** 原生全屏切换（进入/退出均触发）：同步状态，避免按钮态与浏览器不一致 */
  function handleFsChange() {
    if (document.fullscreenElement) {
      isBrowserFullscreen.value = true;
    } else if (isBrowserFullscreen.value || isMapFullscreen.value) {
      // 原生全屏已退出（ESC / 浏览器手势），同步状态
      isBrowserFullscreen.value = false;
      isMapFullscreen.value = false;
      nextTick(() => [60, 250, 600].forEach(notifyMapResize));
    }
  }

  /** 按 Esc 退出全屏：原生全屏由浏览器自行处理，这里仅兜底 CSS 降级态 */
  function onKeydownEsc(e: KeyboardEvent) {
    if (e.key === 'Escape' && isMapFullscreen.value && !document.fullscreenElement) {
      exitMapFullscreen();
    }
  }

  // ==================== 区域折叠（统计区 / 主内容区，参照设备监控页折叠交互） ====================
  const statsCollapsed = ref(false);
  const mainCollapsed = ref(false);
  function toggleStats() {
    statsCollapsed.value = !statsCollapsed.value;
  }
  function toggleMain() {
    mainCollapsed.value = !mainCollapsed.value;
  }
  const timerCollapsed = ref(false);
  const calendarCollapsed = ref(false);
  function toggleTimer() {
    timerCollapsed.value = !timerCollapsed.value;
  }
  function toggleCalendar() {
    calendarCollapsed.value = !calendarCollapsed.value;
  }

  // ==================== 定时控制（与设备监控页定时控制 tab 一致，样式功能原样） ====================
  const createNewTimerModalRef = ref<InstanceType<typeof createNewTimerModal>>();
  const timerEnableModalRef = ref<InstanceType<typeof TimerEnableModal>>();
  const timerList = ref<any[]>([]);
  const allTimerList = ref<any[]>([]); // 本地过滤前的全量数据
  const timerLoading = ref(false);
  const timerTotal = ref(0);

  const timerFilters = ref({
    planName: '' as string,
    relType: undefined as string | undefined,
    startTime: null as Dayjs | null,
    endTime: null as Dayjs | null,
  });

  /** 本地过滤后的定时任务列表 */
  const filteredTimerList = computed(() => {
    let data = allTimerList.value;
    if (timerFilters.value.planName) {
      const kw = timerFilters.value.planName.toLowerCase();
      data = data.filter((item) => (item.planName || '').toLowerCase().includes(kw));
    }
    if (timerFilters.value.relType) {
      data = data.filter((item) => item.relType === timerFilters.value.relType);
    }
    if (timerFilters.value.startTime) {
      const start = timerFilters.value.startTime.format('HH:mm:ss');
      data = data.filter((item) => {
        const t = item.executionLocalTime || item.executionTime || '';
        return t >= start;
      });
    }
    if (timerFilters.value.endTime) {
      const end = timerFilters.value.endTime.format('HH:mm:ss');
      data = data.filter((item) => {
        const t = item.executionLocalTime || item.executionTime || '';
        return t <= end;
      });
    }
    return data;
  });

  const relTypeFilterOptions = [
    { label: '回路', value: '回路' },
    { label: '区域', value: '区域' },
    { label: '场景', value: '场景' },
  ];

  const weekDayMap: Record<string, string> = {
    '1': '周一', '2': '周二', '3': '周三', '4': '周四',
    '5': '周五', '6': '周六', '7': '周日',
  };

  /** 获取定时控制列表（全量数据，本地过滤） */
  async function fetchTimerList() {
    timerLoading.value = true;
    try {
      const params: Record<string, any> = {
        pageSize: 9999,
      };
      const data = await getLightingPlanAPi(params);
      if (data?.records) {
        const mapped = (data.records as any[]).map((item) => ({
          ...item,
          id: item.id,
          planName: item.planName || '',
          relType: item.relType || '',
          executionTime: item.executionTime || '',
          executionLocalTime: item.executionLocalTime || '',
          operationType: item.operationType || '',
          status: item.status || '',
          date: item.executionInfo
            ? `${item.executionInfo.startDate || ''} ~ ${item.executionInfo.endDate || ''}`
            : '',
          weeks: item.executionInfo?.enabledWeek
            ? item.executionInfo.enabledWeek
                .split(',')
                .map((d: string) => weekDayMap[d.trim()] || d.trim())
                .join('、')
            : '',
        }));
        // 过滤：只展示状态为"启用"的数据
        const enabled = mapped.filter((item) => item.status === '启用');
        allTimerList.value = enabled;
        timerList.value = enabled;
        timerTotal.value = enabled.length;
      } else {
        allTimerList.value = [];
        timerList.value = [];
        timerTotal.value = 0;
      }
    } catch (err) {
      console.error('获取定时控制列表失败：', err);
      allTimerList.value = [];
      timerList.value = [];
      timerTotal.value = 0;
    } finally {
      await nextTick();
      setTimeout(() => {
        timerLoading.value = false;
      }, 200);
    }
  }

  /* ---------- 定时任务事件 ---------- */
  function onAddTimer() {
    createNewTimerModalRef.value?.showModal('add');
  }

  function onEditTimer(row: any, type: 'add' | 'edit' | 'detail') {
    createNewTimerModalRef.value?.showModal(type, row);
  }

  function onToggleTimer(row: any) {
    timerEnableModalRef.value?.showModal(row);
  }

  const handleDisable = async (row: any) => {
    await disableApi({ id: row.id }).then((res) => {
      console.log('禁用定时任务成功', res);
      message.success('禁用成功！');
    });
    await fetchTimerList();
  };

  // 立即执行
  const handleExecuteNow = async (row: any) => {
    await executeNow({ id: row.id }).then((res) => {
      console.log('立即执行成功！', res);
      message.success('立即执行成功！');
    });
    await fetchTimerList();
  };

  // 删除
  const handleDelete = async (record: any) => {
    await deleteLightingPlanAPi({ id: record.id }).then((res) => {
      console.log('删除定时任务成功', res);
    });
    await fetchTimerList();
  };

  /** 新建定时任务成功回调 */
  async function createNewTimerModalSuccess() {
    await fetchTimerList();
  }

  /** 启用定时任务成功回调 */
  async function onTimerEnableSuccess() {
    await fetchTimerList();
  }

  /** 查询：搜索项都为空时调接口刷新，否则本地过滤 */
  function onTimerSearch() {
    const hasFilter = timerFilters.value.planName || timerFilters.value.relType || timerFilters.value.startTime || timerFilters.value.endTime;
    if (!hasFilter) {
      fetchTimerList();
    } else {
      timerList.value = filteredTimerList.value;
    }
  }

  function onTimerReset() {
    timerFilters.value = {
      planName: '',
      relType: undefined,
      startTime: null,
      endTime: null,
    };
    fetchTimerList();
  }

  /** 导出定时控制表格数据为 Excel（导出当前查询/过滤后的列表，与表格显示一致） */
  function onExportTimer() {
    if (!filteredTimerList.value.length) {
      // eslint-disable-next-line no-alert
      alert('暂无可导出的数据');
      return;
    }
    const tableData = filteredTimerList.value.map((row, idx) => ({
      index: idx + 1,
      relType: row.relType,
      planName: row.planName,
      time: row.executionLocalTime || row.executionTime || '',
      date: row.date,
      weeks: row.weeks,
      operationType: row.operationType,
      status: row.status,
    }));
    exportExcel({
      tableData,
      fileName: '定时控制数据',
      headers: [
        { key: 'index', title: '序号' },
        { key: 'relType', title: '类型' },
        { key: 'planName', title: '名称' },
        { key: 'time', title: '时间' },
        { key: 'date', title: '时间范围' },
        { key: 'weeks', title: '周期' },
        { key: 'operationType', title: '控制指令' },
        { key: 'status', title: '状态' },
      ],
    });
  }

  /* --------------------- 控制日历 --------------------- */
  const calendarEventDetailModalRef = ref<InstanceType<typeof CalendarEventDetailModal>>();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const currentDate = ref(new Date()); // 默认显示当前系统年月

  const calendarYear = computed(() => currentDate.value.getFullYear());
  const calendarMonth = computed(() => currentDate.value.getMonth());

  interface CalendarEventItem {
    source: string; // PLAN / SCHEDULE / LOG
    planId: number;
    planName: string;
    label: string; // 展示文本，如 "19:30:00 开灯"
    color: string; // blue / green / red / gray / orange
    planType: string; // 普通计划 / 历史记录 / 动态任务
    operationType: string;
    status: string; // 待执行 / 已执行
    dateStr: string;
  }

  interface CalendarCell {
    date: number;
    isCurrentMonth: boolean;
    events: CalendarEventItem[];
  }

  /** 日历事件按月分组数据 */
  const calendarResult = ref<{ date: string; dayOfWeek: string; events: CalendarEventItem[] }[]>([]);
  const calendarLoading = ref(false);

  /** tag 颜色：执行成功→绿色，执行失败→红色，待执行→蓝色 */
  function getEventTagClass(event: CalendarEventItem) {
    if (event.status === '执行成功') return 'tag-success';
    if (event.status === '执行失败') return 'tag-danger';
    return 'tag-pending';
  }

  /** 点击日历标签打开详情弹框 */
  function openEventDetail(event: CalendarEventItem) {
    calendarEventDetailModalRef.value?.showModal(event);
  }

  /** 获取控制日历事件 */
  async function fetchCalendarRecords() {
    calendarLoading.value = true;
    try {
      const res = await getCalendarControlApi({
        year: calendarYear.value,
        month: calendarMonth.value + 1, // month 为 0-based，接口需要 1-based
      });
      calendarResult.value = (res || []) as any;
    } catch (err) {
      console.error('获取控制日历事件失败：', err);
    } finally {
      calendarLoading.value = false;
    }
  }

  const calendarDays = computed<CalendarCell[]>(() => {
    const year = calendarYear.value;
    const month = calendarMonth.value;

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0=周日

    const days: CalendarCell[] = [];

    // 构建日期 → event 映射
    const eventMap: Record<string, CalendarEventItem[]> = {};
    calendarResult.value.forEach((item) => {
      const events = item.events || [];
      eventMap[item.date] = events.map((evt) => ({ ...evt, dateStr: item.date }));
    });

    // 上月末尾日期
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: prevMonthLastDay - i, isCurrentMonth: false, events: [] });
    }

    // 当月日期（全部展示，不截断不合并）
    for (let i = 1; i <= daysInMonth; i++) {
      const dayEvents = eventMap[`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`] || [];
      days.push({
        date: i,
        isCurrentMonth: true,
        events: dayEvents,
      });
    }

    // 下月开头日期，补足 42 格（6 行 × 7 列）
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: i, isCurrentMonth: false, events: [] });
    }

    return days;
  });

  function prevMonth() {
    currentDate.value = new Date(calendarYear.value, calendarMonth.value - 1, 1);
    fetchCalendarRecords();
  }

  function nextMonth() {
    currentDate.value = new Date(calendarYear.value, calendarMonth.value + 1, 1);
    fetchCalendarRecords();
  }

  function prevYear() {
    currentDate.value = new Date(calendarYear.value - 1, calendarMonth.value, 1);
    fetchCalendarRecords();
  }

  function nextYear() {
    currentDate.value = new Date(calendarYear.value + 1, calendarMonth.value, 1);
    fetchCalendarRecords();
  }

  function goToToday() {
    currentDate.value = new Date();
    fetchCalendarRecords();
  }

  // ==================== 灯光详情弹框（点击地图标点打开，与 bigGis 详情模式标点弹框一致） ====================
  // 监控平台 iframe 地址前缀（与设备监控页面保持一致），monitorAdr 为监控通道编码
  const MONITOR_BASE_URL = 'http://10.168.47.23:4000/index.html?id=';
  // 详情弹框显隐（点击标点且仅单条数据时打开）
  const lightTabsModalVisible = ref(false);
  // 详情弹框监控视频地址（点击标点时按 monitorAdr 拼接，不调接口）
  const lightVideoUrl = ref('');
  // 详情弹框回路列表（circuit/listPage 按 areaId 查询）
  const lightCircuitList = ref<any[]>([]);
  // 详情弹框当前标点的 areaId（全开/全关接口参数）
  const lightAreaId = ref('');
  // 详情弹框标题展示的区域名（取标点数据 areaName）
  const lightAreaName = ref('');
  // 当前弹框所属地块名（打开弹框时从标点带出）
  const currentSpaceName = ref('');
  // 回路列表加载状态（四页签弹框）
  const detailModalLoading = ref(false);
  // 地块回路弹框显隐（地块模式点击"详情"菜单打开，参照 bigGis detailModalVisible）
  const detailModalVisible = ref(false);
  // 地块回路弹框加载状态（与四页签弹框 loading 区分开，参照 bigGis detailModalLoading）
  const detailCircuitLoading = ref(false);
  // 标点 id=477 特殊弹框标记：下边不查回路，改为展示节目列表
  const lightIsSpecial477 = ref(false);
  // 标点 id=477 弹框的节目列表（getLightingProgramList 全量）
  const lightPlanList = ref<any[]>([]);
  // 标点 id=478 特殊弹框标记：下边不查回路，改为展示 area/listBySpaceName 区域列表
  const lightIsSpecial478 = ref(false);
  // 标点 id=478 弹框的区域列表（getAreaListBySpaceName，id 固定传 1）
  const lightArea478List = ref<any[]>([]);

  /** 已开启/总回路数统计 */
  const lightCircuitSummary = computed(() => {
    const list = lightCircuitList.value;
    return {
      on: list.filter((c: any) => c.status === '开启').length,
      total: list.length,
    };
  });

  /** 统一二次确认弹窗（提示样式：标题栏"提示" + 蓝色信息图标 + 动作词高亮，同 equipmentMonitoring sceneConfirmModal） */
  const confirmModalRef = ref<InstanceType<typeof ConfirmModal> | null>(null);
  function showLightConfirm(opts: {
    content: string;
    okText?: string;
    onOk: () => void | Promise<void>;
  }) {
    confirmModalRef.value?.showModal(opts);
  }

  // 接口业务失败（success=false）时全局拦截器仍会正常 resolve（return data），这里统一抛错，
  // 避免出现"接口已报错（500/业务失败）却提示指令下发成功"的假成功问题
  function throwIfControlFailed(res: any) {
    if (res && res.success === false) {
      throw new Error(res.message || '操作失败');
    }
    return res;
  }

  /** 标点点击（单条数据时触发）：打开灯光详情弹框 */
  // ==================== 地图模式切换（地块模式 / 详情模式，样式功能参考 bigGis） ====================
  // 初始详情模式：地图加载完成后默认显示灯光标点（AddLightingMarker），与现状一致
  const activeMode = ref<'area' | 'detail' | null>('detail');

  /** 地块模式：绘制地块边框 + 地块中心标点（已处于地块模式时不重复绘制，与 bigGis 一致） */
  function handleShowArea() {
    if (activeMode.value === 'area') return;
    activeMode.value = 'area';
    closeSpaceMenu();
    mapViewRef.value?.clearAllDrawings?.();
    mapViewRef.value?.drawAllSpacesExceptNorth?.();
    // 标点创建后立即用已缓存的地块状态点亮/熄灭（避免数据先于标点加载完成导致更新丢失）
    applyAllSpaceMarkerStates();
    // 批量请求所有地块的场景数据，请求完成后按回路状态更新标点亮/灭
    fetchAllSpaceSceneData();
  }

  /** 详情模式：切换激活状态（再点一次取消，与 bigGis 一致），显示灯光标点 */
  function handleShowDetails() {
    activeMode.value = activeMode.value === 'detail' ? null : 'detail';
    closeSpaceMenu();
    mapViewRef.value?.clearAllDrawings?.();
    if (activeMode.value === 'detail') {
      mapViewRef.value?.AddLightingMarker?.();
    }
  }

  // ==================== 地块功能浮层（地块模式点击灯光图标弹出，参考 bigGis space-menu） ====================
  const spaceMenu = ref<{ visible: boolean; x: number; y: number; spaceName: string }>({
    visible: false,
    x: 0,
    y: 0,
    spaceName: '',
  });
  // 当前激活的菜单项（点击菜单项后保持高亮，弹框/浮层关闭时清除）
  const activeMenuItem = ref<string>('');
  // 一键开关弹框（全开/全关）可见性
  const allModalVisible = ref(false);
  // 场景模式弹框（场景列表）可见性 + 加载态
  const sceneModalVisible = ref(false);
  const sceneModalLoading = ref(false);
  // 场景详情弹窗（bigGis SceneDetailModal 组件）
  const sceneDetailModalRef = ref<InstanceType<typeof SceneDetailModal> | null>(null);
  // 地块视频列表（点击"监控视频"菜单时调用 listBySpace 接口获取，与 bigGis 一致）
  const spaceVideoList = ref<any[]>([]);
  // 视频加载状态
  const videoLoading = ref(false);
  // 视频弹框显隐
  const videoModalVisible = ref(false);
  // 视频占位地址（暂用，后续接入真实视频）
  const SPACE_VIDEO_PLACEHOLDER = 'https://www.w3schools.com/html/mov_bbb.mp4';
  // 浮层尺寸/视口边距常量（与 bigGis clampMenuPosition 一致）
  const MENU_WIDTH = 150;
  const MENU_HEIGHT_MAX = 360;
  const VIEWPORT_MARGIN = 10;

  /** 限制浮层在视口内（参考 bigGis clampMenuPosition） */
  function clampMenuPosition(x: number, y: number) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    x = Math.min(Math.max(x, VIEWPORT_MARGIN), vw - MENU_WIDTH - VIEWPORT_MARGIN);
    y = Math.min(Math.max(y, VIEWPORT_MARGIN), vh - MENU_HEIGHT_MAX - VIEWPORT_MARGIN);
    return { x, y };
  }

  /** 关闭地块功能浮层 */
  function closeSpaceMenu() {
    spaceMenu.value.visible = false;
    activeMenuItem.value = '';
  }

  /** 地块模式灯光图标点击：弹出功能浮层（一键开关/场景模式/监控视频/详情），菜单点击逻辑后续补充 */
  function onSpaceMarkerClick(payload: { data: any; el: HTMLElement }) {
    const spaceName = payload.data?.spaceName || '';
    const rect = payload.el.getBoundingClientRect();
    // 浮层默认显示在标点右上（与 bigGis 一致：右侧偏移 20，上移 180）
    let x = Math.round(rect.left + rect.width / 2 + 20);
    let y = Math.round(rect.top - 180);
    const clamped = clampMenuPosition(x, y);
    // 切换地块标点时重置菜单激活态
    if (spaceMenu.value.visible && spaceMenu.value.spaceName !== spaceName) {
      activeMenuItem.value = '';
    }
    spaceMenu.value = { visible: true, x: clamped.x, y: clamped.y, spaceName };
  }

  /** 点击一级菜单项：打开对应弹框，同时关闭浮层（菜单不再保留展示） */
  function onMenuItemClick(key: string) {
    if (key === 'all') openSpaceAllModal();
    else if (key === 'scene') openSpaceSceneModal(spaceMenu.value.spaceName);
    else if (key === 'video') openVideoModal(spaceMenu.value.spaceName);
    else if (key === 'detail') openSpaceDetailModal(spaceMenu.value.spaceName);
    // 点击菜单后关闭功能浮层（含重置激活高亮）
    closeSpaceMenu();
  }

  /** 打开一键开关弹框（与 bigGis openSpaceAllModal 一致） */
  function openSpaceAllModal() {
    currentSpaceName.value = spaceMenu.value.spaceName;
    allModalVisible.value = true;
  }

  /** 打开场景模式弹框（与 bigGis openSpaceSceneModal 一致：确保场景列表已加载后显示弹框） */
  async function openSpaceSceneModal(spaceName: string) {
    currentSpaceName.value = spaceName;
    sceneModalVisible.value = true;
    sceneModalLoading.value = true;
    try {
      // 场景列表未加载时先加载（防重，已加载则直接复用；仍为空则记录警告）
      if (allTagScenes.value.length === 0) {
        await fetchTagSceneList();
        if (allTagScenes.value.length === 0) {
          console.warn('[preview] 场景模式弹框：场景列表仍为空（listPage 无有 tagId 的场景或接口失败）');
        }
      }
    } finally {
      sceneModalLoading.value = false;
    }
  }

  /** 打开监控视频弹框（加载视频列表，与 bigGis openVideoModal 一致） */
  async function openVideoModal(spaceName: string) {
    videoModalVisible.value = true;
    await loadSpaceVideoList(spaceName);
  }

  /** 打开地块回路弹框（先展示弹框再加载数据，与 bigGis openSpaceDetailModal 一致） */
  async function openSpaceDetailModal(spaceName: string) {
    currentSpaceName.value = spaceName;
    detailModalVisible.value = true;
    detailCircuitLoading.value = true;
    try {
      await ensureSpaceSceneData(spaceName);
    } finally {
      detailCircuitLoading.value = false;
    }
  }

  /** 加载地块视频列表（按地块 id 查询；与 bigGis loadSpaceVideoList 一致，地块名称字段适配 districtName） */
  async function loadSpaceVideoList(spaceName: string) {
    videoLoading.value = true;
    try {
      const space = allSpaceList.value.find((s: any) => s.districtName === normalizeSpaceName(spaceName));
      const res: any = await getVideoListBySpaceApi(space?.id ? String(space.id) : '');
      spaceVideoList.value = Array.isArray(res) ? res : (res?.result || res?.data || []);
    } catch (error) {
      console.error('获取地块视频列表失败:', error);
      spaceVideoList.value = [];
    } finally {
      videoLoading.value = false;
    }
  }

  /** 构建视频播放地址（返回结果 videoAddress 完整地址，无则用占位视频；与 bigGis getVideoPlayUrl 一致） */
  function getVideoPlayUrl(item: any) {
    const adr = item?.videoAddress;
    return adr || SPACE_VIDEO_PLACEHOLDER;
  }

  const defaultColors = ['#52c41a', '#38bdf8', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  /** 当前地块匹配的场景列表（数据来自 scene/listPage 返回的有 tagId 的场景，按地块 id 匹配 tagId 过滤；与 bigGis spaceSceneList 一致） */
  const spaceSceneList = computed(() => {
    const space = allSpaceList.value.find((s: any) => s.districtName === normalizeSpaceName(currentSpaceName.value));
    if (!space?.id) {
      console.warn('[preview] 场景模式弹框：当前地块未匹配到 allSpaceList，', {
        currentSpaceName: currentSpaceName.value,
        normalizeName: normalizeSpaceName(currentSpaceName.value),
        allSpaceListNames: allSpaceList.value.map((s: any) => s.districtName),
      });
      return [];
    }
    const matched = allTagScenes.value.filter((item: any) => String(getSceneTagId(item)) === String(space.id));
    if (allTagScenes.value.length && !matched.length) {
      console.warn('[preview] 场景模式弹框：无匹配场景', {
        spaceName: space.districtName,
        spaceId: space.id,
        sceneTagIds: allTagScenes.value.map((item: any) => getSceneTagId(item)),
        sceneTagNames: allTagScenes.value.map((item: any) => item.tagName),
      });
    }
    return matched.map((item: any, idx: number) => ({
      ...item,
      id: item.id || item.sceneId || idx,
      // 名称字段兼容：接口字段为 sceneName / planName，统一回退到 name 供确认弹框等场景使用
      name: item.name || item.sceneName || item.planName || '-',
      sceneName: item.sceneName || item.planName || '-',
      color: defaultColors[idx % defaultColors.length],
      enabled: item.status === '开启' || item.enabled === true,
    }));
  });

  /** 打开场景详情弹窗（与 bigGis showSpaceSceneDetail 一致） */
  function showSpaceSceneDetail(scene: any) {
    sceneDetailModalRef.value?.showDetail?.(scene);
  }

  /** 场景行 开/关（与 bigGis handleSceneAction 一致：二次确认 → postSceneControlApi → 成功提示并刷新回路统计） */
  function handleSceneAction(scene: any, action: '开启' | '关闭') {
    showLightConfirm({
      content: `确定要 <strong class="tip-action">${action}</strong> 场景"${scene.name || scene.sceneName || '-'}"吗？`,
      onOk: async () => {
        try {
          await throwIfControlFailed(
            await postSceneControlApi({
              sceneId: scene.id,
              operationType: action,
            }),
          );
          message.success(`${action}成功`);
          scene.enabled = action === '开启';
          // 成功后同步刷新回路统计（与 bigGis fetchCircuitStats 对应）
          loadAllCircuit();
        } catch (error) {
          // 全局拦截器已统一弹出错误提示，这里只记录日志
          console.error(`[preview] 场景 ${action}失败:`, error);
        }
      },
    });
  }

  /** 场景行 开启（与 bigGis handleSpaceSceneOn 一致） */
  function handleSpaceSceneOn(scene: any) {
    handleSceneAction(scene, '开启');
  }

  /** 场景行 关闭（与 bigGis handleSpaceSceneOff 一致） */
  function handleSpaceSceneOff(scene: any) {
    handleSceneAction(scene, '关闭');
  }

  // 地块级全开（/plan/control：对当前地块匹配的场景循环调用 allOnApi，参数用场景自身数据，与 bigGis handleSpaceAllOn 一致）
  function handleSpaceAllOn(spaceName: string) {
    const space = allSpaceList.value.find((s: any) => s.districtName === normalizeSpaceName(spaceName));
    if (!space?.id) {
      message.warning('该地块无 ID，无法执行全开');
      return;
    }
    // 场景模式同款匹配：地块 id（allSpaceList.id）与场景 tagId 对应，取该地块匹配的场景作为控制参数来源
    const scenes = allTagScenes.value.filter((item: any) => String(getSceneTagId(item)) === String(space.id));
    if (scenes.length === 0) {
      message.warning(`地块【${spaceName}】无匹配场景，无法执行全开`);
      return;
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
              );
            }),
          );
          message.success(`【${spaceName}】全开指令已下发`);
        } catch (error) {
          // 全局拦截器已统一弹出错误提示，这里只记录日志
          console.error(`[preview] 地块 [${spaceName}] 全开失败:`, error);
        } finally {
          allModalVisible.value = false;
        }
      },
    });
  }

  // 地块级全关（/plan/control：对当前地块匹配的场景循环调用 allOffApi，参数用场景自身数据，与 bigGis handleSpaceAllOff 一致）
  function handleSpaceAllOff(spaceName: string) {
    const space = allSpaceList.value.find((s: any) => s.districtName === normalizeSpaceName(spaceName));
    if (!space?.id) {
      message.warning('该地块无 ID，无法执行全关');
      return;
    }
    // 场景模式同款匹配：地块 id（allSpaceList.id）与场景 tagId 对应，取该地块匹配的场景作为控制参数来源
    const scenes = allTagScenes.value.filter((item: any) => String(getSceneTagId(item)) === String(space.id));
    if (scenes.length === 0) {
      message.warning(`地块【${spaceName}】无匹配场景，无法执行全关`);
      return;
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
              );
            }),
          );
          message.success(`【${spaceName}】全关指令已下发`);
        } catch (error) {
          // 全局拦截器已统一弹出错误提示，这里只记录日志
          console.error(`[preview] 地块 [${spaceName}] 全关失败:`, error);
        } finally {
          allModalVisible.value = false;
        }
      },
    });
  }

  /** 地图区域点击委托（参考 bigGis onMapClick）：点击空白关闭弹框与浮层 */
  function onMapClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // 灯光标点（含地块模式标点）：点击行为由 MapView 内部驱动（弹功能浮层/成员列表/详情弹框），不在此处理
    if (target.closest?.('.light-marker')) return;
    // 浮层自身：@click.stop 已阻止冒泡，此处兜底
    if (target.closest?.('.space-menu')) return;
    // 弹框（ant-modal-wrap / el-dialog）：点击弹框不关闭浮层，由弹框自身关闭逻辑处理
    if (target.closest?.('.ant-modal-wrap') || target.closest?.('.el-dialog')) return;
    closeAll();
  }

  function onLightMarkerSingleClick(data: any) {
    // 点击灯光标点：打印标点所包含的数据，便于排查
    console.log('点击灯光标点数据：', data);
    if (activeMode.value !== 'detail') {
      // 非详情模式：点击列表项后收起列表（保持原行为），打开原灯光详情弹窗
      mapViewRef.value?.collapseMarkerList?.();
      mapViewRef.value?.openLightDetail?.(data);
      return;
    }
    openLightTabsModal(data);
  }

  /** 打开灯光详情弹框（一键开关/监控视频），回路数据按 areaId 查询 circuit/listPage */
  async function openLightTabsModal(data: any) {
    const spaceName = data?.spaceName || '';
    const areaId = data?.id;
    // 标点无地块归属或 areaId 时回退到原灯光详情弹窗
    if (!spaceName || !areaId) {
      mapViewRef.value?.openLightDetail?.(data);
      return;
    }
    currentSpaceName.value = spaceName;
    lightTabsModalVisible.value = true;
    lightAreaId.value = String(areaId);
    lightAreaName.value = data?.areaName || '';
    // 兼容：monitorAdr 可能是通道编码（需拼前缀）或已是完整链接（477/478 硬编码标点），已带 http 前缀则直接使用，避免重复拼接
    lightVideoUrl.value = data?.monitorAdr
      ? /^https?:\/\//i.test(String(data.monitorAdr))
        ? String(data.monitorAdr)
        : MONITOR_BASE_URL + data.monitorAdr
      : '';
    // 打印监控视频链接地址（弹窗"监控视频"tab 播放的地址），便于排查
    console.log('监控视频链接地址：', lightVideoUrl.value);
    // 标点 id=477/478 特殊处理：不按区域 id 查回路，477 展示节目列表、478 展示区域列表
    const isSpecial477 = String(areaId) === '477';
    const isSpecial478 = String(areaId) === '478';
    lightIsSpecial477.value = isSpecial477;
    lightIsSpecial478.value = isSpecial478;
    lightPlanList.value = [];
    lightArea478List.value = [];
    detailModalLoading.value = true;
    try {
      if (isSpecial477) {
        await loadLightPlanList();
      } else if (isSpecial478) {
        // 标点 id=478：调 area/listBySpaceName（id 固定传 1）展示区域列表
        await loadLightArea478List();
      } else {
        // 回路数据：按 areaId 查询 circuit/listPage
        await loadLightCircuit(String(areaId));
      }
    } finally {
      detailModalLoading.value = false;
    }
  }

  /** 按 areaId 查询地块回路列表（circuit/listPage），供弹框的回路概览与详情展示 */
  async function loadLightCircuit(areaId: string) {
    const res: any = await getCircuitListApi({ pageSize: 999, areaId });
    // 分页结构返回 records，兼容纯数组
    const list = Array.isArray(res)
      ? res
      : res?.records || res?.list || res?.result || res?.data || [];
    lightCircuitList.value = list.map((item: any, idx: number) => ({
      ...item,
      _key: item.id || item.circuitId || `light-${areaId}-${idx}`,
      name: item.circuitName || item.name || '回路' + (idx + 1),
    }));
  }

  // 刷新四页签弹框列表（一键开关页签：回路/节目/区域列表）
  async function refreshLightTabsModal() {
    if (detailModalLoading.value) return;
    detailModalLoading.value = true;
    try {
      if (lightIsSpecial477.value) {
        await loadLightPlanList();
      } else if (lightIsSpecial478.value) {
        await loadLightArea478List();
      } else {
        await loadLightCircuit(String(lightAreaId.value));
      }
      message.success('刷新成功');
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      detailModalLoading.value = false;
    }
  }

  // 加载节目列表（独立节目接口 /bems/lighting/program/list），供标点 id=477 弹框展示（节目名称/状态/开/关）
  async function loadLightPlanList() {
    const data: any = await getLightingProgramList({ pageNo: 1, pageSize: 999 });
    // 兼容分页结构（records/list/result/data）与纯数组返回
    const records = Array.isArray(data) ? data : (data?.records || data?.list || data?.result || data?.data || []);
    lightPlanList.value = (records as any[]).map((item: any, idx: number) => ({
      ...item,
      id: item.id || idx,
      name: item.programName,
      enabled: item.programStatus === '开启' || item.enabled === true,
    }));
  }

  // 节目开/关（标点 id=477 弹框）：GET /bems/lighting/program/control，传 operationType + programId
  function handleProgramAction(row: any, action: '开启' | '关闭') {
    return new Promise<void>((resolve, reject) => {
      if (!confirmModalRef.value) {
        resolve();
        return;
      }
      confirmModalRef.value.showModal({
        content: `确定要 <strong class="tip-action">${action}</strong> 节目"${row.name || row.programName || '-'}"吗？`,
        onOk: async () => {
          try {
            await getLightingProgramControl({
              operationType: action,
              programId: row.id,
            });
            message.success(`${action}成功`);
            // 刷新节目列表，更新状态列（programState）
            await loadLightPlanList();
            resolve();
          } catch (error) {
            // 全局拦截器已统一弹出错误提示，这里只记录日志
            console.error(`${action}失败:`, error);
            reject(error);
          }
        },
      });
    });
  }

  // 标点 id=478 弹框的区域列表（getAreaListBySpaceName，id 固定传 1）
  async function loadLightArea478List() {
    const data: any = await getAreaListBySpaceName({ id: 1 });
    // 兼容分页结构（records/list/result/data）与纯数组返回
    const records = Array.isArray(data) ? data : (data?.records || data?.list || data?.result || data?.data || []);
    lightArea478List.value = (records as any[]).map((item: any, idx: number) => ({
      ...item,
      id: item.id || item.areaId || idx,
      name: item.name || item.areaName || '区域' + (idx + 1),
      status: item.status || item.state || item.areaState || '关闭',
    }));
  }

  // 标点 id=478 弹框行级开/关（复用区域开/关接口 area/open、area/close，query 传行 id）
  function handleArea478Action(row: any, action: '开启' | '关闭') {
    if (!row.id) {
      message.warning('该区域无 ID，无法执行操作');
      return;
    }
    const actionText = action === '开启' ? '开' : '关';
    showLightConfirm({
      content: `确定要 <strong class="tip-action">${actionText}</strong> 区域"${row.name || '-'}"吗？`,
      onOk: async () => {
        try {
          if (action === '开启') {
            await throwIfControlFailed(await setAreaOpenApi({ id: row.id }));
          } else {
            await throwIfControlFailed(await setAreaCloseApi({ id: row.id }));
          }
          message.success(`${actionText}成功`);
          // 刷新区域列表，更新状态列
          await loadLightArea478List();
        } catch (error) {
          // 全局拦截器已统一弹出错误提示，这里只记录日志
          console.error(`${actionText}失败:`, error);
        }
      },
    });
  }

  /** 弹框取消：点右上角 X 只关闭弹框（成员列表保持展开展示）；点击遮罩等其他区域全部关闭（与 bigGis 一致） */
  function onSpaceModalCancel(e: any) {
    const isCloseBtn = e?.target instanceof Element && !!e.target.closest('.ant-modal-close');
    if (isCloseBtn) {
      closeAllModals();
    } else {
      closeAll();
    }
  }

  /** 关闭弹框（成员列表保持展开展示），同时重置 477/478 特殊弹框状态，清除列表项激活高亮 */
  function closeAllModals() {
    videoModalVisible.value = false;
    detailModalVisible.value = false;
    lightTabsModalVisible.value = false;
    // 标点 id=477/478 特殊弹框状态重置
    lightIsSpecial477.value = false;
    lightPlanList.value = [];
    lightIsSpecial478.value = false;
    lightArea478List.value = [];
    // 详情模式成员列表：弹框关闭后列表保持展开展示，仅清除列表项激活高亮
    mapViewRef.value?.clearMarkerListActive?.();
  }

  /** 全部关闭：弹框 + 地块功能浮层（与 bigGis closeAll 一致） */
  function closeAll() {
    closeAllModals();
    closeSpaceMenu();
  }

  // ==================== 场景控制（与设备监控页场景配置同一逻辑：/plan/control） ====================
  // 进入页面先查询所有场景（/scene/listPage），再按固定场景 id 过滤出目标场景（relIds / relType 等），全开/全关时作为 /plan/control 参数
  const SCENE_ID = '2086280558308143106';
  const sceneInfo = ref<any>(null);

  /** 查询场景信息（/scene/listPage?pageNo=1&pageSize=999 全量查询后按场景 id 过滤） */
  async function loadSceneInfo() {
    try {
      const data: any = await getLightingPlanAPiNew({ pageNo: 1, pageSize: 999 });
      // 兼容分页结构（records/list/result/data）与纯数组返回
      const records = Array.isArray(data) ? data : (data?.records || data?.list || data?.result || data?.data || []);
      const target = (records as any[]).find((item: any) => String(item.id) === String(SCENE_ID));
      console.log('[preview] 场景列表:', records, '目标场景:', target);
      sceneInfo.value = target || null;
    } catch (error) {
      console.error('[preview] 查询场景信息失败:', error);
      sceneInfo.value = null;
    }
  }

  /** 详情弹框全开（标点 id=477 特殊：节目全控 /bems/lighting/program/allControl；标点 id=478 特殊：按空间名控制 /bems/lighting/area/controlBySpaceName；其余按 areaId 调 setAreaOpenApi，与 bigGis 一致） */
  function handleLightAreaOn() {
    if (!lightAreaId.value) {
      message.warning('该标点无地块 ID，无法执行全开');
      return;
    }
    if (lightIsSpecial477.value) {
      showLightConfirm({
        content: '确定要 <strong class="tip-action">全开</strong> 所有节目吗？',
        onOk: async () => {
          try {
            await throwIfControlFailed(await postProgramAllControl({ operationType: '开启' }));
            // 刷新节目列表，更新状态列（programState），失败不影响成功提示（全局拦截器已弹错）
            await loadLightPlanList().catch(() => {});
          } catch (error) {
            // 全局拦截器已统一弹出错误提示，这里只记录日志
            console.error('全开失败:', error);
          }
        },
      });
      return;
    }
    if (lightIsSpecial478.value) {
      showLightConfirm({
        content: '确定要 <strong class="tip-action">全开</strong> 地块"1号馆"的所有区域吗？',
        onOk: async () => {
          try {
            // 标点 id=478：按空间名控制地块全开（POST，query 传 spaceName + operationType，spaceName 固定"1号馆"）
            await throwIfControlFailed(await postControlBySpaceName({ spaceName: '1号馆', operationType: '开启' }));
            await loadLightArea478List().catch(() => {});
          } catch (error) {
            // 全局拦截器已统一弹出错误提示，这里只记录日志
            console.error('全开失败:', error);
          }
        },
      });
      return;
    }
    // 普通标点：按 areaId 调区域开灯接口（area/open），与 bigGis 一致
    showLightConfirm({
      content: `确定要 <strong class="tip-action">全开</strong> 地块"${lightAreaName.value || '该标点'}"的所有回路吗？`,
      onOk: async () => {
        try {
          await throwIfControlFailed(await setAreaOpenApi({ id: lightAreaId.value }));
          message.success('开启成功');
          // 刷新回路列表：表格状态与左上侧"已开启回路数/总回路数"同步更新，失败不影响成功提示
          await loadLightCircuit(lightAreaId.value).catch(() => {});
        } catch (error) {
          // 全局拦截器已统一弹出错误提示，这里只记录日志
          console.error('全开失败:', error);
        }
      },
    });
  }

  /** 详情弹框全关（标点 id=477 特殊：节目全控；标点 id=478 特殊：按空间名控制；其余按 areaId 调 setAreaCloseApi，与 bigGis 一致） */
  function handleLightAreaOff() {
    if (!lightAreaId.value) {
      message.warning('该标点无地块 ID，无法执行全关');
      return;
    }
    if (lightIsSpecial477.value) {
      showLightConfirm({
        content: '确定要 <strong class="tip-action">全关</strong> 所有节目吗？',
        onOk: async () => {
          try {
            await throwIfControlFailed(await postProgramAllControl({ operationType: '关闭' }));
            // 刷新节目列表，更新状态列（programState），失败不影响成功提示（全局拦截器已弹错）
            await loadLightPlanList().catch(() => {});
          } catch (error) {
            // 全局拦截器已统一弹出错误提示，这里只记录日志
            console.error('全关失败:', error);
          }
        },
      });
      return;
    }
    if (lightIsSpecial478.value) {
      showLightConfirm({
        content: '确定要 <strong class="tip-action">全关</strong> 地块"1号馆"的所有区域吗？',
        onOk: async () => {
          try {
            // 标点 id=478：按空间名控制地块全关（POST，query 传 spaceName + operationType，spaceName 固定"1号馆"）
            await throwIfControlFailed(await postControlBySpaceName({ spaceName: '1号馆', operationType: '关闭' }));
            // 刷新区域列表，更新状态列，失败不影响成功提示（全局拦截器已弹错）
            await loadLightArea478List().catch(() => {});
          } catch (error) {
            // 全局拦截器已统一弹出错误提示，这里只记录日志
            console.error('全关失败:', error);
          }
        },
      });
      return;
    }
    // 普通标点：按 areaId 调区域关灯接口（area/close），与 bigGis 一致
    showLightConfirm({
      content: `确定要 <strong class="tip-action">全关</strong> 地块"${lightAreaName.value || '该标点'}"的所有回路吗？`,
      onOk: async () => {
        try {
          await throwIfControlFailed(await setAreaCloseApi({ id: lightAreaId.value }));
          message.success('关闭成功');
          // 刷新回路列表：表格状态与左上侧"已开启回路数/总回路数"同步更新，失败不影响成功提示
          await loadLightCircuit(lightAreaId.value).catch(() => {});
        } catch (error) {
          // 全局拦截器已统一弹出错误提示，这里只记录日志
          console.error('全关失败:', error);
        }
      },
    });
  }

  const { createMessage } = useMessage();

  /** 总览统计数据 */
  const stats = ref({
    blockCoverage: '0%',
  });

  /** 地图状态统计 */
  const mapStatus = ref({
    normal: 0,
    warning: 0,
    offline: 0,
  });

  /** 所有地块数据（district/listPage 接口字段：id / districtName / spaceIds / relIds / relType / sceneId） */
  const allSpaceList = ref<
    { id: string; districtName: string; spaceIds?: any; relIds?: any; relType?: any; sceneId?: any }[]
  >([]);

  /** 回路总数 */
  const circuitCount = ref(0);

  /** 在线数（comstat === "在线"） */
  const onlineCount = ref(0);

  /** 在线率 */
  const onlineRate = ref('0%');

  /** 今日用电（在线数 * 18kWh + 随机波动） */
  const todayUsage = computed(() => {
    const base = onlineCount.value * 18;
    // 每个在线回路随机波动 ±5 kWh
    const variation = Array.from({ length: onlineCount.value }, () => Math.floor(Math.random() * 11) - 5)
      .reduce((sum, v) => sum + v, 0);
    return base + variation;
  });

  /** 所有回路原始数据 */
  const circuitList = ref<any[]>([]);

  /** 将接口返回的 spaceIds（逗号分隔字符串，如 "901,902"；或数组；或空字符串/空数组）解析为数字数组 */
  function parseSpaceIds(spaceIds: any): number[] {
    if (spaceIds == null) return [];
    const arr = Array.isArray(spaceIds)
      ? spaceIds
      : String(spaceIds)
          .replace(/[\[\]\s]/g, '')
          .split(',');
    return arr.map((v: any) => Number(v)).filter((n: number) => !isNaN(n) && n > 0);
  }

  /** 回路/场景去重键：优先取 id，缺失时用 circuitId（scene/space 返回的回路主键字段为 circuitId）；键统一转字符串避免数字/字符串类型不一致 */
  function getMergeKey(item: any): string {
    const v = item?.id ?? item?.circuitId;
    return v != null && v !== '' ? String(v) : '';
  }

  /** 按 id 合并数组（保留顺序，id 相同只保留第一个；无 id 的项直接追加） */
  function mergeById(list: any[], incoming: any): any[] {
    if (!Array.isArray(incoming)) return list;
    const exists = new Set<string>();
    for (const i of list) {
      const k = getMergeKey(i);
      if (k) exists.add(k);
    }
    for (const item of incoming) {
      const k = getMergeKey(item);
      if (!k || !exists.has(k)) {
        list.push(item);
        if (k) exists.add(k);
      }
    }
    return list;
  }

  /** 从 getSceneSpaceApi 返回的 result 中取回路列表（circuits 为回路数组） */
  function getCircuitListFromRes(res: any): any[] {
    return Array.isArray(res?.circuits) ? res.circuits : [];
  }

  /** spaceId 级回路缓存（请求成功即写入，含空结果；同一 spaceId 被多个地块引用时只请求一次，与 bigGis 一致） */
  const circuitDataById = ref<Record<string, any[]>>({});
  /** spaceId 级请求中的 Promise（并发请求同一 spaceId 时等待同一次请求，避免重复） */
  const circuitDataPromiseById: Record<string, Promise<any[] | null>> = {};

  /** 获取某个 spaceId 的回路数据（/scene/space），带 spaceId 级缓存与请求中防重；成功（含空结果）返回并缓存，失败返回 null（不缓存，可重试） */
  async function fetchCircuitDataById(sid: number | string): Promise<any[] | null> {
    const key = String(sid)
    if (circuitDataById.value[key]) return circuitDataById.value[key]
    if (circuitDataPromiseById[key]) return circuitDataPromiseById[key]
    circuitDataPromiseById[key] = (async () => {
      try {
        const res: any = await getSceneSpaceApi(key)
        const circuits = res ? getCircuitListFromRes(res) : []
        circuitDataById.value[key] = circuits
        return circuits
      } catch (e) {
        console.error(`[preview] spaceId=${key} 回路数据请求失败:`, e)
        return null
      } finally {
        delete circuitDataPromiseById[key]
      }
    })()
    return circuitDataPromiseById[key]
  }

  /** 各地块回路数据（按地块名索引：spaceIds 循环调用 /scene/space 后按 id 合并的 circuits） */
  const spaceCircuitMap = ref<Record<string, any[]>>({});

  // 全量场景列表：scene/listPage 返回的有 tagId 的场景（地块一键开关按地块 id 匹配 tagId 使用，与 bigGis 一致）
  const allTagScenes = ref<any[]>([]);
  const tagSceneListLoading = ref(false);

  // 取场景的标签 id（兼容 tagId / tagIds 字段），无标签时返回 undefined（与 bigGis getSceneTagId 一致）
  function getSceneTagId(item: any): any {
    const t = item?.tagId ?? item?.tagIds;
    return t == null || t === '' ? undefined : t;
  }

  // 查询所有场景并过滤出有 tagId 的场景（带加载中防重，与 bigGis fetchTagSceneList 一致）
  async function fetchTagSceneList(): Promise<any[]> {
    if (tagSceneListLoading.value) return allTagScenes.value;
    tagSceneListLoading.value = true;
    try {
      const data: any = await getLightingPlanAPiNew({ pageNo: 1, pageSize: 999 });
      // 兼容分页结构（records/list/result/data）与纯数组返回
      const records = Array.isArray(data)
        ? data
        : (data?.records || data?.list || data?.result || data?.data || []);
      allTagScenes.value = (records as any[]).filter((item: any) => getSceneTagId(item) != null);
      return allTagScenes.value;
    } catch (error) {
      console.error('[preview] 查询场景列表失败:', error);
      return [];
    } finally {
      tagSceneListLoading.value = false;
    }
  }

  /** 加载各地块回路数据：与 bigGis 地块模式数据逻辑一致——
   *  不再用 district 接口返回的 spaceIds 字段关联，改为：
   *  scene/listPage 过滤出有 tagId 的场景 → 并行查详情（/scene/detail）取 areaList.space，
   *  标签与地块的包含关系只按场景 tagId 归属（不再看 area 自身的 districtId 字段），
   *  各地块按归属的 spaceIds 循环调用 /scene/space 获取回路（spaceId 级去重，同一 spaceId 只请求一次）并按 id 合并 */
  async function loadSpaceCircuitData() {
    // 1. 查询所有场景（scene/listPage），只保留有 tagId 的场景（无 tagId 的场景过滤掉）；结果同时存入 allTagScenes 供地块一键开关复用
    const tagScenes = await fetchTagSceneList()

    // 2. 并行查询所有场景详情（一次发起），取 areaList 下的 space 字段：
    // 按引用它的场景 tagId 归属到对应标签（标签与地块的包含关系，不再看 area 自身字段）
    await Promise.all(
      tagScenes.map(async (scene: any) => {
        const sceneTagId = scene?.tagId ?? scene?.tagIds
        if (sceneTagId == null || sceneTagId === '') return
        try {
          const detail: any = await planDetailApiNew({ id: scene.id })
          const areaList = Array.isArray(detail?.areaList) ? detail.areaList : []
          areaList.forEach((area: any) => {
            const sid = Number(area?.space)
            if (isNaN(sid) || sid <= 0) return
            if (!spaceTagMap.value.has(String(sceneTagId))) spaceTagMap.value.set(String(sceneTagId), new Set())
            spaceTagMap.value.get(String(sceneTagId))!.add(sid)
          })
        } catch (error) {
          console.error(`[preview] 场景详情获取失败(场景 ${scene.id}):`, error)
        }
      }),
    )

    // 3. 各地块按归属的 spaceIds 请求 /scene/space 获取回路（spaceId 级去重），按 id 合并
    for (const space of allSpaceList.value) {
      const spaceIds = Array.from(spaceTagMap.value.get(String(space.id)) ?? [])
      if (spaceIds.length === 0) {
        console.warn(`[preview] 地块 [${space.districtName}] 无归属 spaceIds，跳过`)
        continue
      }
      const merged: any[] = []
      await Promise.all(
        spaceIds.map(async (sid) => {
          const circuits = await fetchCircuitDataById(sid)
          if (circuits) mergeById(merged, circuits)
        }),
      )
      spaceCircuitMap.value[space.districtName] = merged
    }
  }

  // ========== 地块模式标点亮灭（与 bigGis 一致） ==========

  /** 地块显示名（space-boundaries.json 标点名）与 district/listPage 的 districtName 不一致时的映射，
   *  用于点击标点（JSON 名）也能匹配到地块 spaceIds；目前 JSON 标点名已与接口 districtName 保持一致，该映射仅作兼容兜底 */
  const SPACE_NAME_ALIAS: Record<string, string> = {
    通明湖: '群明湖',
    制氧区域: '制氧区',
    首钢园服贸会: '服贸会区',
    // 标点/接口写法不一时双向兜底（群名湖=群明湖为同一地块的两种写法）
    群名湖: '群明湖',
    群明湖: '群名湖',
  };

  /** 将地块名归一化为 allSpaceList 中的规范名（districtName）；映射不到时返回原值 */
  function normalizeSpaceName(spaceName: string): string {
    if (!spaceName) return spaceName;
    if (allSpaceList.value.some((s: any) => s.districtName === spaceName)) return spaceName;
    const alias = SPACE_NAME_ALIAS[spaceName];
    if (alias && allSpaceList.value.some((s: any) => s.districtName === alias)) return alias;
    return spaceName;
  }

  /** 获取地块所有可能的标点名（原值 + 归一化名 + SPACE_NAME_ALIAS 反查的 JSON 标点名），
   *  用于 updateSpaceMarkerState 匹配 DOM 标点：批量请求传的是 districtName，标点 DOM 名是 JSON 标点名，两者写法可能不一致 */
  function getSpaceMarkerNames(spaceName: string): string[] {
    const names = new Set<string>();
    const normName = normalizeSpaceName(spaceName);
    names.add(spaceName);
    names.add(normName);
    for (const [jsonName, districtName] of Object.entries(SPACE_NAME_ALIAS)) {
      if (districtName === normName) names.add(jsonName);
    }
    return Array.from(names);
  }

  /** 场景详情按 tagId 归属的地块 spaceIds（loadSpaceCircuitData 填充，地块模式请求场景数据时复用同一套归属逻辑） */
  const spaceTagMap = ref(new Map<string, Set<number>>());

  /** 地块场景数据缓存（按归一化地块名索引：合并的回路列表 + 亮灭状态），与 bigGis spaceSceneDataMap 一致 */
  const spaceSceneDataMap = ref<Record<string, any>>({});
  /** 地块请求中标记（防止同一地块并发重复请求） */
  const spaceSceneLoadingMap = ref<Record<string, boolean>>({});

  /** 确保某个地块的场景/回路数据已加载（已缓存直接返回，请求中跳过，否则请求后返回；与 bigGis ensureSpaceSceneData 一致） */
  async function ensureSpaceSceneData(spaceName: string): Promise<any | null> {
    const key = normalizeSpaceName(spaceName);
    const loaded = spaceSceneDataMap.value[key];
    if (loaded) return loaded;
    if (spaceSceneLoadingMap.value[key]) return null;
    await fetchSpaceSceneData(spaceName);
    return spaceSceneDataMap.value[key] || null;
  }

  /** 获取某个地块的场景/回路数据：按归属 spaceIds 循环请求 /scene/space 后按 id 合并，
   *  任一回路 status==='开启' → 标点亮灯；带地块级缓存与请求中防重（与 bigGis fetchSpaceSceneData 一致） */
  async function fetchSpaceSceneData(spaceName: string) {
    const key = normalizeSpaceName(spaceName);
    if (spaceSceneDataMap.value[key]) return;
    if (spaceSceneLoadingMap.value[key]) return;
    const space = allSpaceList.value.find((s: any) => s.districtName === key);
    // 地块包含的 spaceIds：优先场景详情按 tagId 归属（与 loadSpaceCircuitData 一致），空时回退 district 接口返回的 spaceIds 字段
    const taggedIds = Array.from(spaceTagMap.value.get(String(space?.id ?? '')) ?? []);
    const spaceIds: number[] = taggedIds.length ? taggedIds : parseSpaceIds(space?.spaceIds);
    if (spaceIds.length === 0) {
      console.warn(`[preview] 地块 [${key}] 无 spaceIds，跳过状态更新`);
      return;
    }
    try {
      spaceSceneLoadingMap.value[key] = true;
      const results = await Promise.all(spaceIds.map((sid) => fetchCircuitDataById(sid)));
      const merged: any[] = [];
      results.forEach((c) => {
        if (c) mergeById(merged, c);
      });
      if (merged.length) {
        let isOn = false;
        for (const c of merged) {
          if (c.status === '开启') {
            isOn = true;
            break;
          }
        }
        spaceSceneDataMap.value[key] = { circuits: merged, _isOn: isOn };
        getSpaceMarkerNames(spaceName).forEach((n) => {
          mapViewRef.value?.updateSpaceMarkerState?.(n, isOn);
        });
      } else if (results.some((r) => r === null)) {
        // 所有请求均失败：标点置为熄灭（不写缓存，可重试）
        getSpaceMarkerNames(spaceName).forEach((n) => {
          mapViewRef.value?.updateSpaceMarkerState?.(n, false);
        });
      }
    } finally {
      spaceSceneLoadingMap.value[key] = false;
    }
  }

  /** 批量请求所有地块的场景数据（地块模式点击时调用，与 bigGis fetchAllSpaceSceneData 一致） */
  function fetchAllSpaceSceneData() {
    const spaces = allSpaceList.value;
    if (spaces.length === 0) {
      console.warn('[preview] 地块列表为空，跳过批量状态更新');
      return;
    }
    spaces.forEach((space: any) => {
      fetchSpaceSceneData(space.districtName);
    });
  }

  /** 用已缓存的地块场景数据刷新所有地块标点亮灭（解决数据先于标点加载完成导致更新丢失的问题，与 bigGis applyAllSpaceMarkerStates 一致） */
  function applyAllSpaceMarkerStates() {
    allSpaceList.value.forEach((space: any) => {
      const key = normalizeSpaceName(space.districtName);
      const data = spaceSceneDataMap.value[key];
      const isOn = data?._isOn ?? (Array.isArray(data?.circuits) ? data.circuits.some((c: any) => c.status === '开启') : false);
      getSpaceMarkerNames(space.districtName).forEach((n) => {
        mapViewRef.value?.updateSpaceMarkerState?.(n, isOn);
      });
    });
  }

  /** 当前地块的回路列表（来自 spaceSceneDataMap 缓存，补充 _key/name 展示字段；与 bigGis getSpaceCircuitListFromApi 一致） */
  function getSpaceCircuitListFromApi(spaceName: string): any[] {
    const data = spaceSceneDataMap.value[normalizeSpaceName(spaceName)];
    if (!data) return [];
    const list = data.circuits;
    if (!Array.isArray(list)) return [];
    return list.map((item: any, idx: number) => ({
      ...item,
      _key: item.id || item.circuitId || `${spaceName}-${idx}`,
      name: item.circuitName || item.name || '回路' + (idx + 1),
    }));
  }

  /** 地块回路弹框列表（与 bigGis spaceCircuitList 一致） */
  const spaceCircuitList = computed(() => getSpaceCircuitListFromApi(currentSpaceName.value));

  /** 按地块聚合的表格数据 */
  const spaceTableData = computed(() =>
    allSpaceList.value.map((space) => {
      const circuits = spaceCircuitMap.value[space.districtName] || [];
      const onlineCircuits = circuits.filter((c: any) => c.comstat === '在线');
      const openCircuits = circuits.filter((c: any) => c.status === '开启');
      const closeCircuits = circuits.filter((c: any) => c.status === '关闭');
      const todayEnergy = onlineCircuits.reduce((sum: number, c: any) => {
        const variation = Math.floor(Math.random() * 11) - 5;
        return sum + 18 + variation;
      }, 0);
      return {
        spaceId: space.id,
        spaceName: space.districtName,
        circuits: circuits.length,
        openCount: openCircuits.length,
        closeCount: closeCircuits.length,
        todayUsage: todayEnergy,
        // 开/关按钮控制参数（来自 district/listPage 接口当前地块返回的 relIds / relType / sceneId）
        relIds: space.relIds,
        relType: space.relType,
        sceneId: space.sceneId,
      };
    })
  );

  /** 开启的回路数（status === "开启"） */
  const openCircuitCount = computed(() => circuitList.value.filter((c: any) => c.status === '开启').length);

  /** 待处理报警数（areaStatistics 接口 pendingAlarm 字段） */
  const pendingAlarm = ref(0);

  /** 全区一键开关参数（areaStatistics 接口直接返回的 relIds / relType / allAreaSceneId，其中 allAreaSceneId 对应 sceneId） */
  const allAreaSceneInfo = ref<any>(null);

  /** 查询地块覆盖率 */
  async function loadStats() {
    try {
      const res = await getOverviewStatsApi();
      const data = res?.result ?? res;
      stats.value = {
        blockCoverage: data.coverageRate != null ? `${data.coverageRate}%` : '0%',
      };
      pendingAlarm.value = data.pendingAlarm != null ? data.pendingAlarm : 0;
      allAreaSceneInfo.value =
        data.relIds != null && data.relType != null && data.allAreaSceneId != null
          ? {
              relIds: data.relIds,
              relType: data.relType,
              sceneId: data.allAreaSceneId,
            }
          : null;
    } catch {
      stats.value = {
        blockCoverage: '0%',
      };
      pendingAlarm.value = 0;
      allAreaSceneInfo.value = null;
    }
  }

  /** 加载所有地块（解析与 bigGis fetchAllDistrictTags 一致：兼容 records/list/result/data 分页结构与纯数组返回） */
  async function loadAllSpace() {
    try {
      const res = await getAllSpaceApi('1');
      // 兼容分页结构（records/list/result/data）与纯数组返回
      allSpaceList.value = Array.isArray(res)
        ? res
        : (res?.records || res?.list || res?.result || res?.data || []);
    } catch {
      allSpaceList.value = [];
    }
  }

  /** 查询所有回路数 */
  async function loadAllCircuit() {
    try {
      const res = await getAllCircuitApi();
      const list = Array.isArray(res) ? res : [];
      circuitList.value = list;
      circuitCount.value = list.length;
      const online = list.filter((item: any) => item.comstat === '在线');
      onlineCount.value = online.length;
      onlineRate.value = list.length > 0
        ? (online.length / list.length * 100).toFixed(1) + '%'
        : '0%';
    } catch {
      circuitCount.value = 0;
      onlineCount.value = 0;
      onlineRate.value = '0%';
      circuitList.value = [];
    }
  }

  /** 全区开灯（/plan/control 场景级控制，参数来自 areaStatistics.allAreaSceneId → scene/detail） */
  function handleAllOn() {
    if (!allAreaSceneInfo.value) {
      createMessage.warning('场景信息未加载，无法执行全区开灯');
      return;
    }
    showLightConfirm({
      content: '确定要 <strong class="tip-action">执行全区开灯操作</strong> 吗？',
      onOk: async () => {
        try {
          await throwIfControlFailed(
            await allOnApi({
              operationType: '开启',
              relIds: allAreaSceneInfo.value.relIds,
              relType: allAreaSceneInfo.value.relType,
              sceneId: allAreaSceneInfo.value.sceneId,
            })
          );
          createMessage.success('全区开灯指令已下发');
        } catch {
          // 全局拦截器已统一弹出错误提示，这里只记录日志
          console.error('操作失败');
        }
      },
    });
  }

  /** 全区关灯（/plan/control 场景级控制，参数来自 areaStatistics.allAreaSceneId → scene/detail） */
  function handleAllOff() {
    if (!allAreaSceneInfo.value) {
      createMessage.warning('场景信息未加载，无法执行全区关灯');
      return;
    }
    showLightConfirm({
      content: '确定要 <strong class="tip-action">执行全区关灯操作</strong> 吗？',
      onOk: async () => {
        try {
          await throwIfControlFailed(
            await allOffApi({
              operationType: '关闭',
              relIds: allAreaSceneInfo.value.relIds,
              relType: allAreaSceneInfo.value.relType,
              sceneId: allAreaSceneInfo.value.sceneId,
            })
          );
          createMessage.success('全区关灯指令已下发');
        } catch {
          // 全局拦截器已统一弹出错误提示，这里只记录日志
          console.error('操作失败');
        }
      },
    });
  }

  /** 地块开灯控制（/plan/control 场景级控制，参数取 spaceTableData 行上的 relIds / relType / sceneId） */
  function handleControlOn(item: any) {
    console.log('handleControlOn item:', item);
    if (item.relIds == null || item.relType == null || item.sceneId == null) {
      createMessage.warning('场景信息未加载，无法执行开启');
      return;
    }
    // 聚焦地图到该地块
    mapViewRef.value?.focusToSpace(item.spaceName);
    showLightConfirm({
      content: `确定要 <strong class="tip-action">开启</strong> 【${item.spaceName}】的灯光吗？`,
      onOk: async () => {
        try {
          await throwIfControlFailed(
            await postSceneSwitchApi({
              operationType: '开启',
              relIds: item.relIds,
              relType: item.relType,
              sceneId: item.sceneId,
            })
          );
          createMessage.success(`${item.spaceName} 开灯指令已下发`);
        } catch {
          // 全局拦截器已统一弹出错误提示，这里只记录日志
          console.error('操作失败');
        }
      },
    });
  }

  /** 地块关灯控制（/plan/control 场景级控制，参数取 spaceTableData 行上的 relIds / relType / sceneId） */
  function handleControlOff(item: any) {
    if (item.relIds == null || item.relType == null || item.sceneId == null) {
      createMessage.warning('场景信息未加载，无法执行关闭');
      return;
    }
    // 聚焦地图到该地块
    mapViewRef.value?.focusToSpace(item.spaceName);
    showLightConfirm({
      content: `确定要 <strong class="tip-action">关闭</strong> 【${item.spaceName}】的灯光吗？`,
      onOk: async () => {
        try {
          await throwIfControlFailed(
            await postSceneSwitchApi({
              operationType: '关闭',
              relIds: item.relIds,
              relType: item.relType,
              sceneId: item.sceneId,
            })
          );
          createMessage.success(`${item.spaceName} 关灯指令已下发`);
        } catch {
          // 全局拦截器已统一弹出错误提示，这里只记录日志
          console.error('操作失败');
        }
      },
    });
  }

  // ==================== 操作日志（控制记录，复制自 controlLog 页面操作日志模块） ====================
  const loading = ref(false);
  const tableData = ref<any[]>([]);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  /** 查询条件 */
  const dateRange = ref<[string, string] | null>(null);
  const operationType = ref('');
  const nameInput = ref('');

  /** 加载控制记录数据 */
  async function fetchData() {
    loading.value = true;
    try {
      const params: Record<string, any> = {
        pageNo: currentPage.value,
        pageSize: pageSize.value,
      };
      if (dateRange.value && dateRange.value.length === 2) {
        params.startTime = dateRange.value[0] + ' 00:00:00';
        params.endTime = dateRange.value[1] + ' 23:59:59';
      }
      if (operationType.value) {
        params.operationType = operationType.value;
      }
      if (nameInput.value) {
        params.name = nameInput.value;
      }
      const res = await controlRecordListApi(params);
      console.log('控制记录数据：', res);
      if (res?.records) {
        tableData.value = res.records;
        total.value = res.total ?? res.records.length;
      } else {
        tableData.value = [];
        total.value = 0;
      }
    } catch (err) {
      console.error('获取控制记录失败：', err);
      tableData.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  }

  /** 查询 */
  function onSearch() {
    currentPage.value = 1;
    fetchData();
  }

  /** 重置 */
  function onReset() {
    dateRange.value = null;
    operationType.value = '';
    nameInput.value = '';
    currentPage.value = 1;
    fetchData();
  }

  /** 导出操作日志表格数据为 Excel（导出当前查询/过滤后的列表，与表格显示一致） */
  function onExportLog() {
    if (!tableData.value.length) {
      // eslint-disable-next-line no-alert
      alert('暂无可导出的数据');
      return;
    }
    const rows = tableData.value.map((row, idx) => ({
      index: idx + 1,
      operationTime: row.operationTime,
      relType: row.relType,
      name: row.name,
      operationType:
        row.operationType === '开' ? '开启' : row.operationType === '关' ? '关闭' : '-',
      operatorType: row.operatorType,
      operationBy: row.operationBy,
    }));
    exportExcel({
      tableData: rows,
      fileName: '操作日志数据',
      headers: [
        { key: 'index', title: '序号' },
        { key: 'operationTime', title: '操作时间' },
        { key: 'relType', title: '类型' },
        { key: 'name', title: '名称' },
        { key: 'operationType', title: '操作状态' },
        { key: 'operatorType', title: '触发类型' },
        { key: 'operationBy', title: '操作人员' },
      ],
    });
  }

  /** 分页切换 */
  function onPageChange(page: number) {
    currentPage.value = page;
    fetchData();
  }

  /** 详情弹窗 */
  const detailVisible = ref(false);
  const detailRecord = ref<any>(null);
  const detailData = ref<any>(null);
  const detailLoading = ref(false);

  /** 详情列表：优先使用 children，为空则用主记录包裹成数组 */
  const circuitDetailList = computed(() => {
    if (!detailData.value) return [];
    const children = detailData.value.children;
    if (Array.isArray(children) && children.length > 0) {
      return children;
    }
    return [detailData.value];
  });

  function onDetail(item: any) {
    detailRecord.value = item;
    detailData.value = null;
    detailVisible.value = true;
    detailLoading.value = true;
    getLogDetailApi({ id: item.id }).then((res: any) => {
      console.log(res);
      detailData.value = res ?? null;
    }).catch((err) => {
      console.error('获取日志详情失败：', err);
    }).finally(() => {
      detailLoading.value = false;
    });
  }

  function closeDetail() {
    detailVisible.value = false;
    detailRecord.value = null;
    detailData.value = null;
  }

  /** 操作日志折叠（参照上面模块） */
  const logCollapsed = ref(false);
  function toggleLog() {
    logCollapsed.value = !logCollapsed.value;
  }

  onMounted(() => {
    // 进入页面先查询场景信息（固定场景 id），供弹框全开/全关的 /plan/control 控制使用
    loadSceneInfo();
    loadStats();
    loadAllSpace().then(() => loadSpaceCircuitData());
    loadAllCircuit();
    // 定时控制列表
    fetchTimerList();
    // 控制日历
    fetchCalendarRecords();
    // 操作日志（控制记录）
    fetchData();
    // 全屏状态下按 Esc 退出
    document.addEventListener('keydown', onKeydownEsc);
    // 原生全屏切换（进入/退出）同步状态
    document.addEventListener('fullscreenchange', handleFsChange);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydownEsc);
    document.removeEventListener('fullscreenchange', handleFsChange);
  });
</script>

<style lang="less">
  @import './index.less';
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->
