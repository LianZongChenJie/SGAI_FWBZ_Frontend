<template>
  <section class="page-wrapper" :class="themeClass">
    <!-- 顶部 Tab 导航 -->
    <nav class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div class="page-content" v-loading="pageLoading">
      <!-- ========== 设备监控 ========== -->
      <template v-if="activeTab === 'monitor'">
        <!-- 实时设备监控 -->
        <section class="panel">
          <header class="panel-header">
            <div class="left">
              <svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <h2 class="panel-title">实时设备监控</h2>
            </div>
            <div class="header-right">
              <button v-loading="listVideoBtn" class="btn btn-primary" @click="onRefreshVideo('open')">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
                获取视频列表
              </button>
              <button class="btn-collapse" :class="{ collapsed: monitorCollapsed }" @click="toggleMonitor">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                <span>折叠</span>
              </button>
            </div>
          </header>

          <div class="video-grid" v-show="!monitorCollapsed">
          <div class="video-grid-cameras">
          <!-- 未选择摄像头 -->
          <div v-if="activeCameras.length === 0 && !modalLoading" class="video-placeholder">
            <video-camera-outlined class="video-icon" />
            <div class="video-text">请点击「获取视频列表」选择摄像头</div>
          </div>
          <!-- 加载中 -->
          <div v-if="modalLoading" class="video-placeholder">
            <a-spin size="large" />
            <div class="video-text">正在获取视频流...</div>
          </div>
          <!-- 播放视频 -->
          <div
            v-for="cam in activeCameras"
            :key="cam.id"
            class="detail-video"
          >
            <!-- <div class="video-label">{{ cam.name }}</div> -->
            <VideoPlayer :url="cam.url" />
          </div>
        </div>
          </div>
        </section>

        <!-- 场景控制面板 -->
        <section class="panel panel-scene-monitor" :class="{ 'panel-collapsed': sceneCollapsed }">
          <header class="panel-header panel-header--fixed">
            <div class="left">
              <svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              <h2 class="panel-title">场景控制面板</h2>
              <span class="panel-count">
                <span class="count-label">已查</span>
                <span class="count-filtered">{{ filteredMonitorSceneList.length }}</span>
                <span class="count-label">条</span>
                <span class="count-sep">/</span>
                <span class="count-label">共</span>
                <span class="count-total">{{ sceneList.length }}</span>
                <span class="count-label">条</span>
              </span>
            </div>
            <div class="header-right">
              <div class="scene-search-bar" v-show="!sceneCollapsed">
                <a-select
                  v-model:value="tagName"
                  placeholder="标签"
                  :options="sceneTagOptions"
                  :loading="sceneTagLoading"
                  allowClear
                  show-search
                  :filter-option="(input, option) => (option.label || '').toLowerCase().includes(input.toLowerCase())"
                  style="width: 120px"
                />
               <!-- <a-select
                  v-model:value="monitorTypeFilter"
                  placeholder="类型"
                  :options="monitorTypeOptions"
                  allowClear
                  style="width: 100px"
                />-->
                <a-input
                  v-model:value="monitorSearchName"
                  placeholder="请输入名称"
                  allowClear
                  autocomplete="off"
                  style="width: 160px"
                  @pressEnter="onMonitorSearch"
                />
                <button class="btn btn-primary btn-sm" @click="onMonitorSearch">查询</button>
                <button class="btn btn-outline btn-sm" @click="onMonitorSearchReset">重置</button>
              </div>
              <button class="btn-collapse" :class="{ collapsed: sceneCollapsed }" @click="toggleScene">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                <span>折叠</span>
              </button>
            </div>
          </header>

          <div class="scene-grid" v-show="!sceneCollapsed" v-loading="loadingSceneList">
            <div
              v-for="s in filteredMonitorSceneList"
              :key="s.id"
              class="scene-card"
            >
              <span class="scene-corner-tag" v-show="s.tagName">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ s.tagName }}</span>
              </span>
              <div class="scene-card-inner">
                <div class="scene-header">
                  <div class="scene-header-left">
                    <span class="scene-name">{{ s.name }}</span>
                  </div>
                  <div class="scene-top-actions">
                  </div>
                </div>
                <div class="scene-info">
                  <div class="scene-info-tags">
                    <span class="scene-info-tag scene-info-tag--scene" v-if="!s.groupId">场景</span>
                    <span class="scene-info-tag scene-info-tag--program" v-if="s.programSceneIds">节目</span>
                  </div>
                  <div class="scene-info-item">
                    <span class="info-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 3v4M16 3v4M2 13h20"/></svg>
                    </span>
                    <span class="info-label">包含</span>
                    <span class="info-value">{{ s.circuitCount }} 个{{ s.relType }}</span>
                  </div>
                  <div class="scene-info-item">
                    <span class="info-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </span>
                    <template v-if="s.programSceneIds">
                      <span class="info-label">当前运行节目</span>
                      <a-tooltip overlay-class-name="scene-program-tooltip" placement="top" :title="getProgramNames(s.programDetail).join('、') || '-'" :mouseLeaveDelay="0.1">
                        <span style="padding-left: 3px;" class="info-value program-names">{{ getProgramNamesSummary(s.programDetail) }}</span>
                      </a-tooltip>
                    </template>
                    <template v-else>
                      <span class="info-label">上次操作类型</span>
                      <span style="padding-left: 3px;" class="info-value" :class="s.operationType === '开启' ? 'val-on' : s.operationType === '关闭' ? 'val-off' : ''">{{ s.operationType || '-' }}</span>
                    </template>
                  </div>
                  <div class="scene-info-item">
                    <span class="info-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </span>
                    <span class="info-label">上次操作时间</span>
                    <span style="padding-left: 3px;" class="info-value">{{ s.updateTime || '-' }}</span>
                  </div>
                </div>
                <div v-auth="'northAreaLighting:switch'" class="scene-actions">
                  <div class="scene-actions-left">
                    <button :loading="btnCloseOpenLoaidng" class="btn btn-primary btn-sm" @click="onExecute(s)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12" style="margin-right:4px"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      开启
                    </button>
                    <button :loading="btnCloseOpenLoaidng" class="btn btn-danger btn-sm" @click="onDeleteScene(s)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12" style="margin-right:4px"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- ========== 场景配置 ========== -->
      <template v-if="activeTab === 'scene'">
        <section class="panel panel-scene">
          <header class="panel-header panel-header--fixed">
            <div class="left" v-loading="sceneSearchLoading">
              <svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              <h2 class="panel-title">场景配置</h2>
              <span class="panel-count">
                <span class="count-label">已查</span>
                <span class="count-filtered">{{ filteredSceneList.length }}</span>
                <span class="count-label">条</span>
                <span class="count-sep">/</span>
                <span class="count-label">共</span>
                <span class="count-total">{{ sceneList.length }}</span>
                <span class="count-label">条</span>
              </span>
            </div>
            <div class="header-right">
              <a-select
                v-model:value="sceneSearchTag"
                placeholder="标签"
                :options="sceneTagOptions"
                :loading="sceneTagLoading"
                allowClear
                show-search
                :filter-option="(input, option) => (option.label || '').toLowerCase().includes(input.toLowerCase())"
                style="width: 140px"
              />
              <!-- <a-select
                v-model:value="sceneTypeFilter"
                placeholder="类型"
                :options="sceneTypeOptions"
                allowClear
                style="width: 100px"
              /> -->
              <a-input
                v-model:value="sceneSearchName"
                placeholder="请输入名称"
                allowClear
                autocomplete="off"
                style="width: 180px"
                @pressEnter="onSceneSearch"
              />
              <button class="btn btn-primary" @click="onSceneSearch">查询</button>
              <button class="btn btn-outline" @click="onSceneSearchReset" style="margin-right: 5%;">重置</button>
              <button v-auth="'northAreaLighting:switch'" class="btn btn-primary" @click="onAddScene">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                新建场景
              </button>
            </div>
          </header>

          <div class="scene-grid">
            <div
              v-for="s in filteredSceneList"
              :key="s.id"
              class="scene-card"
            >
              <span class="scene-corner-tag" v-show="s.tagName">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ s.tagName }}</span>
              </span>
              <div class="scene-card-inner">
                <div class="scene-header">
                  <div class="scene-header-left">
                    <span class="scene-name">{{ s.name }}</span>
                  </div>

                </div>
                <div class="scene-info">
                  <div class="scene-info-tags">
                    <span class="scene-info-tag scene-info-tag--scene" v-if="!s.groupId">场景</span>
                    <span class="scene-info-tag scene-info-tag--program" v-if="s.programSceneIds">节目</span>
                  </div>
                  <div class="scene-info-item">
                    <span class="info-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 3v4M16 3v4M2 13h20"/></svg>
                    </span>
                    <span class="info-label">包含</span>
                    <span class="info-value">{{ s.circuitCount }} 个{{ s.relType }}</span>
                  </div>
                  <div class="scene-info-item">
                    <span class="info-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </span>
                    <template v-if="s.programSceneIds">
                      <span class="info-label">当前运行节目</span>
                      <a-tooltip overlay-class-name="scene-program-tooltip" placement="top" :title="getProgramNames(s.programDetail).join('、') || '-'" :mouseLeaveDelay="0.1">
                        <span class="info-value program-names">{{ getProgramNamesSummary(s.programDetail) }}</span>
                      </a-tooltip>
                    </template>
                    <template v-else>
                      <span class="info-label">上次操作类型</span>
                      <span class="info-value" :class="s.operationType === '开启' ? 'val-on' : s.operationType === '关闭' ? 'val-off' : ''">{{ s.operationType || '-' }}</span>
                    </template>
                  </div>
                  <div class="scene-info-item">
                    <span class="info-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </span>
                    <span class="info-label">上次操作时间</span>
                    <span class="info-value">{{ s.updateTime || '-' }}</span>
                  </div>
                </div>
                <div class="scene-actions">
                  <div class="scene-actions-left">
                    <button v-auth="'northAreaLighting:switch'" :loading="btnCloseOpenLoaidng" class="btn btn-primary btn-sm" @click="onExecute(s)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12" style="margin-right:4px"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      开启
                    </button>
                    <button v-auth="'northAreaLighting:switch'" :loading="btnCloseOpenLoaidng" class="btn btn-danger btn-sm" @click="onDeleteScene(s)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12" style="margin-right:4px"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      关闭
                    </button>
                  </div>
                  <div class="scene-actions-right">
                    <button v-auth="'northAreaLighting:switch'" class="scene-icon-btn" title="编辑" @click="onEditScene(s)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button v-auth="'northAreaLighting:switch'" v-if="s.category !== '一键开关'" class="scene-icon-btn danger" title="删除" @click="onDeleteSceneBtn(s)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                    <button class="btn btn-link" @click="createNewSceneModalRef?.showModal('detail', s)">详情</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- ========== 定时控制 ========== -->
      <template v-if="activeTab === 'timer'">
        <section class="panel panel-timer">
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
              <button class="btn btn-outline" @click="onExportTimer" style="margin-right: 5%;">导出数据</button>
              <button v-auth="'northAreaLighting:switch'" class="btn btn-primary" @click="onAddTimer">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                新建定时任务
              </button>
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
                  <th :style="{ width: opColumnWidth }">操作</th>
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
                    <button v-auth="'northAreaLighting:switch'" v-if="row.status === '禁用'" class="btn btn-secondary" @click="onEditTimer(row, 'edit')">编辑</button>
                    <button v-else class="btn btn-secondary" @click="onEditTimer(row, 'detail')">详情</button>
                   
                    <a-popconfirm
                      v-if="row.status !== '启用'"
                      title="确认删除该条数据？"
                      ok-text="确定"
                      cancel-text="取消"
                      @confirm="handleDelete(row)"
                    >
                      <button v-auth="'northAreaLighting:switch'" class="btn btn-danger">删除</button>
                    </a-popconfirm>

                    <button
                      v-auth="'northAreaLighting:switch'"
                      v-if="row.status != '启用'"
                      class="btn btn-success"
                      @click="onToggleTimer(row)"
                    >启用</button>
                     <template v-else>
                      <a-popconfirm title="确认禁用该条计划？" ok-text="确定" cancel-text="取消" @confirm="handleDisable(row)">
                        <button
                          v-auth="'northAreaLighting:switch'"
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
                      v-auth="'northAreaLighting:switch'"
                      class="btn btn-success"
                    >立即执行</button>
                    </a-popconfirm>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </section>
      </template>

      <!-- ========== 控制日历 ========== -->
      <template v-if="activeTab === 'calendar'">
        <section class="panel panel-calendar">
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
        </section>
      </template>
    </div>
  </section>
  <createNewSceneModal ref="createNewSceneModalRef" @success="createNewSceneModalSuccess"></createNewSceneModal>
  <createNewTimerModal ref="createNewTimerModalRef" @success="createNewTimerModalSuccess"></createNewTimerModal>
  <TimerEnableModal ref="timerEnableModalRef" @success="onTimerEnableSuccess"></TimerEnableModal>
  <sceneConfirmModal ref="sceneConfirmModalRef" @success="onSceneConfirmSuccess"></sceneConfirmModal>
  <CalendarEventDetailModal ref="calendarEventDetailModalRef"></CalendarEventDetailModal>
  <CameraListModal ref="cameraModalRef" :cameraList="allCameraList" @confirm="onCameraConfirm"></CameraListModal>
</template>

<script setup lang="ts">
// 主题切换：sessionStorage.realname === '北区照明' → 黑色，否则白色
import { useScreenTheme } from '../useScreenTheme';
const { themeClass } = useScreenTheme();

import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import type { Dayjs } from 'dayjs';
import createNewSceneModal from './components/createNewSceneModal.vue';
import createNewTimerModal from './components/createNewTimerModal.vue';
import TimerEnableModal from './components/TimerEnableModal.vue';
import sceneConfirmModal from './components/sceneConfirmModal.vue';
import CalendarEventDetailModal from './components/CalendarEventDetailModal.vue';
import CameraListModal from './components/CameraListModal.vue';
import { getLightingPlanAPi, deleteLightingPlanAPi, disableApi, executeNow, getCalendarControlApi, getLightingPlanAPiNew, postSceneSwitchApi, getAllVidoeListApi, deleteSceneItemAPi } from '@/api/equipmentMonitoring';
import { getAllDistrictTag } from '@/api/baseSettingBqZm';
import { exportExcel } from '/@/utils/export';
import { message } from 'ant-design-vue';
import VideoPlayer from './components/VideoPlayer.vue'
import { usePermission } from '/@/hooks/web/usePermission';

const { hasPermission } = usePermission();
// 操作列宽度：有 northAreaLighting:switch 权限时按钮全部展示，宽度 17%；无权限仅展示 1 个按钮，宽度 10%
const opColumnWidth = computed(() => (hasPermission('northAreaLighting:switch') ? '17%' : '10%'));

// 定时任务 src\views\bems\lightingControl\components\TimingControl.vue

const createNewSceneModalRef = ref<InstanceType<typeof createNewSceneModal>>();
const createNewTimerModalRef = ref<InstanceType<typeof createNewTimerModal>>();
const timerEnableModalRef = ref<InstanceType<typeof TimerEnableModal>>();
const sceneConfirmModalRef = ref<InstanceType<typeof sceneConfirmModal>>();
const calendarEventDetailModalRef = ref<InstanceType<typeof CalendarEventDetailModal>>();

/* --------------------- Tab 导航 --------------------- */
const tabs = [
  { key: 'monitor', label: '设备监控' },
  { key: 'scene', label: '场景配置' },
  { key: 'timer', label: '定时控制' },
  { key: 'calendar', label: '控制日历' },
];
const activeTab = ref('monitor');

/* --------------------- 面板折叠状态（默认展开） --------------------- */
const monitorCollapsed = ref(false);
const sceneCollapsed = ref(false);
function toggleMonitor() {
  monitorCollapsed.value = !monitorCollapsed.value;
}
function toggleScene() {
  sceneCollapsed.value = !sceneCollapsed.value;
}

/* --------------------- 视频流数据 --------------------- */

/* --------------------- 场景数据 --------------------- */
const sceneList = ref<any[]>([]);

/* --------------------- 场景搜索（场景配置 tab） --------------------- */
const sceneTagOptions = ref<{ label: string; value: string, tagId: string }[]>([]);
const sceneTagLoading = ref(false);
const sceneSearchTag = ref<string | undefined>(undefined);
const sceneSearchName = ref('');
const sceneSearchLoading = ref(false);
const sceneTypeFilter = ref<string | undefined>(undefined);
const sceneTypeOptions = [
  /*-----{ label: '节目', value: 'program' },------ */
  { label: '场景', value: 'scene' },
];

/** 已过滤的场景列表（场景配置 tab 本地筛选） */
const filteredSceneList = computed(() => {
  let data = sceneList.value;
  if (sceneSearchTag.value) {
    data = data.filter((item) => item.tagName === sceneSearchTag.value);
  }
  if (sceneTypeFilter.value === 'program') {
    data = data.filter((item) => item.groupId);
  } else if (sceneTypeFilter.value === 'scene') {
    data = data.filter((item) => !item.groupId);
  }
  if (sceneSearchName.value) {
    const kw = sceneSearchName.value.toLowerCase();
    data = data.filter((item) => (item.name || '').toLowerCase().includes(kw));
  }
  return data;
});

/* --------------------- 场景搜索（实时设备监控 tab） --------------------- */
const tagName = ref<string | undefined>(undefined);
const monitorSearchName = ref('');
const monitorSearchLoading = ref(false);
const monitorTypeFilter = ref<string | undefined>(undefined);
const monitorTypeOptions = [
  { label: '节目', value: 'program' },
  { label: '场景', value: 'scene' },
];

/** 已过滤的场景列表（监控 tab 本地筛选） */
const filteredMonitorSceneList = computed(() => {
  let data = sceneList.value;
  if (tagName.value) {
    data = data.filter((item) => item.tagName === tagName.value);
  }
  if (monitorTypeFilter.value === 'program') {
    data = data.filter((item) => item.groupId);
  } else if (monitorTypeFilter.value === 'scene') {
    data = data.filter((item) => !item.groupId);
  }
  if (monitorSearchName.value) {
    const kw = monitorSearchName.value.toLowerCase();
    data = data.filter((item) => (item.name || '').toLowerCase().includes(kw));
  }
  return data;
});

/** 加载标签下拉选项 — 调用 getAllDistrictTag 接口（兼容分页结构与纯数组返回） */
async function loadSceneTagOptions() {
  if (sceneTagOptions.value.length) return;
  try {
    sceneTagLoading.value = true;
    const res = await getAllDistrictTag();
    const list = Array.isArray(res)
      ? res
      : (res?.records || res?.list || res?.data || res?.result || []);
    sceneTagOptions.value = [
      { label: '全部区域', value: '全部区域', tagId: '' },
      ...(list as any[]).map((item: any) => ({
        label: item.districtName,
        value: item.districtName,
        tagId: String(item.id),
      })),
    ];
  } finally {
    sceneTagLoading.value = false;
  }
}

/** 场景搜索（防抖） */
let sceneSearchTimer: ReturnType<typeof setTimeout> | null = null;
function onSceneSearch() {
  if (sceneSearchTimer) clearTimeout(sceneSearchTimer);
  sceneSearchLoading.value = true;
  sceneSearchTimer = setTimeout(() => {
    if (!sceneSearchTag.value && !sceneSearchName.value && !sceneTypeFilter.value) {
      fetchSceneList();
    }
    sceneSearchLoading.value = false;
  }, 300);
}

/** 场景搜索重置（场景配置 tab） */
function onSceneSearchReset() {
  sceneSearchTag.value = undefined;
  sceneSearchName.value = '';
  sceneTypeFilter.value = undefined;
}

/** 场景搜索（监控 tab 防抖） */
let monitorSearchTimer: ReturnType<typeof setTimeout> | null = null;
function onMonitorSearch() {
  if (monitorSearchTimer) clearTimeout(monitorSearchTimer);
  monitorSearchLoading.value = true;
  monitorSearchTimer = setTimeout(() => {
    if (!tagName.value && !monitorSearchName.value && !monitorTypeFilter.value) {
      fetchSceneList();
    }
    monitorSearchLoading.value = false;
  }, 300);
}

/** 场景搜索重置（监控 tab） */
function onMonitorSearchReset() {
  tagName.value = undefined;
  monitorSearchName.value = '';
  monitorTypeFilter.value = undefined;
}

/* --------------------- Loading --------------------- */
const pageLoading = ref(false);

/* --------------------- 事件 --------------------- */
/** Tab 切换事件 */
async function handleTabChange(key: string) {
  if (activeTab.value === key) return;
  activeTab.value = key;

  if (key === 'scene') {
    pageLoading.value = true;
    loadSceneTagOptions();
    try {
      await fetchSceneList();
    } finally {
      await nextTick();
      setTimeout(() => {
        pageLoading.value = false;
      }, 200);
    }
  } else if (key === 'monitor') {
    loadSceneTagOptions();
    await fetchSceneList();
  } else if (key === 'timer') {
    await fetchTimerList();
  } else if (key === 'calendar') {
    await fetchCalendarRecords();
  }
}

/* ---------- 场景配置事件 ---------- */
function onAddScene() {
  console.log('新建场景');
  createNewSceneModalRef.value?.showModal('add');
}
function onEditScene(s) {
  createNewSceneModalRef.value?.showModal('edit', s);
}
// 新建场景--回调
const createNewSceneModalSuccess = async () =>{
  // 刷新场景列表
  pageLoading.value = true;
  try {
    await fetchSceneList();
    // TODO: 其他 tab 的接口请求
  } finally {
    await nextTick();
    setTimeout(() => {
      pageLoading.value = false;
    }, 200);
  }
}

/** 获取场景配置列表 */
const loadingSceneList = ref(false);
async function fetchSceneList() {
  if(loadingSceneList.value) {
    return;
  }
  loadingSceneList.value = true
  try {
    const params = {
      pageNo: 1,
      pageSize: 999
    };

    const data = await getLightingPlanAPiNew(params);
    console.log('场景配置列表：', data);
    if (data?.records) {
      sceneList.value = (data.records as any[]).map((item) => {
        const relCount = item.relIds ? item.relIds.split(',').length : 0;
        const iconMap: Record<string, string> = {
          开启: '💡',
          关闭: '🔌',
        };
        return {
          ...item,
          id: item.id,
          name: item.planName || '',
          icon: iconMap[item.operationType] || '⚙️',
          circuitCount: relCount,
          desc: `控制类型 · ${item.relType || '-'}`,
          isDefault: item.sort === 1,
          relType: item.relType,
          operationType: item.operationType || '',
          updateTime: item.updateTime || item.updateDate || item.createTime || '',
        };
      });
    }
  } catch (err) {
    console.error('获取场景配置列表失败：', err);
  }
  loadingSceneList.value = false
}


/**
 * 解析 programDetail 字段为节目名称数组：
 * - 兼容 JSON 数组字符串（如 '["点火仪式3","点火仪式1"]'）
 * - 兼容已是数组、单个字符串
 */
function getProgramNames(raw: any): string[] {
  if (raw == null || raw === '') return [];
  if (Array.isArray(raw)) return raw.map((i: any) => String(i));
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((i: any) => String(i));
    } catch {
      // 非 JSON 格式，按单个节目名称处理
    }
    return [raw];
  }
  return [];
}

/**
 * 卡片上展示的节目名摘要：最多展示前 max 个，超出折叠为“等 N 个节目”，
 * 完整列表由 tooltip 展示，避免文本撑满卡片宽度
 */
function getProgramNamesSummary(raw: any, max = 2): string {
  const names = getProgramNames(raw);
  if (!names.length) return '-';
  if (names.length <= max) return names.join('、');
  return `${names.slice(0, max).join('、')} 等 ${names.length} 个节目`;
}

// 打开--场景
function onExecute(s) {
  // 场景有关联节目（programSceneIds 非空）时，走新的执行弹框（勾选数据与节目后二次确认）；否则走原直接二次确认逻辑
  if (s.programSceneIds) {
    createNewSceneModalRef.value?.showModal('execute', s, '开启');
  } else {
    sceneConfirmModalRef.value?.showModal('execute', s);
  }
}
// 关闭
function onDeleteScene(s) {
  // 同开启：有关联节目走执行弹框，否则走原逻辑
  if (s.programSceneIds) {
    createNewSceneModalRef.value?.showModal('execute', s, '关闭');
  } else {
    sceneConfirmModalRef.value?.showModal('delete', s);
  }
}
// 单个删除场景
const onDeleteSceneBtn = async (s) =>{
  sceneConfirmModalRef.value?.showModal('deleteBtn', s);
}


/** 二次确认回调 */
function onSceneConfirmSuccess(payload: { type: string; scene: any }) {
  console.log('场景确认回调：', payload.type, payload.scene);
  if (payload.type === 'execute') {
    // TODO: 调用执行场景接口--开启
    postSceneSwitchApiChange({
      "operationType": "开启",
      "relIds": payload.scene.relIds,
      "relType": payload.scene.relType,
      "sceneId": payload.scene.id
    })
  } else if (payload.type === 'delete') {
    // 调用 关闭 场景接口
    postSceneSwitchApiChange({
      "operationType": "关闭",
      "relIds": payload.scene.relIds,
      "relType": payload.scene.relType,
      "sceneId": payload.scene.id
    })
  } else if (payload.type === 'deleteBtn') {
    // 调用 删除 场景接口/
    deleteSceneItemAPi({ id: payload.scene.id }).then(() => {
      message.success('删除场景成功!');
      fetchSceneList();
    }).catch((err) => {
      console.error('删除场景失败：', err);
    });
  }
}
// 开启关闭，总接口
const btnCloseOpenLoaidng = ref(false)
const postSceneSwitchApiChange = async (params) =>{
  if(btnCloseOpenLoaidng.value) {
    return;
  }
  btnCloseOpenLoaidng.value = true
  await postSceneSwitchApi(params).then(res => {
    console.log('postSceneSwitchApiChange', res);
    message.success(`${params.operationType}成功!`);
  }).catch(err => {
    console.error('postSceneSwitchApiChange', err);
  });
  btnCloseOpenLoaidng.value = false
  // 刷新场景列表
  pageLoading.value = true;
  try {
    await fetchSceneList();
    // TODO: 其他 tab 的接口请求
  } finally {
    await nextTick();
    setTimeout(() => {
      pageLoading.value = false;
    }, 200);
  }
}
/* --------------------- 定时任务数据 --------------------- */
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
    console.log('定时控制列表：', data);
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
      allTimerList.value = mapped;
      timerList.value = mapped;
      timerTotal.value = data.total ?? mapped.length;
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

function onEditTimer(row ,type) {
  console.log('编辑--详情定时任务', row.planName);
  createNewTimerModalRef.value?.showModal(type, row);
}

function onToggleTimer(row) {
  timerEnableModalRef.value?.showModal(row);
}
const handleDisable = async (row) => {
   console.log('切换定时任务状态--禁用', row.planName, row.status);
    await disableApi({
      id: row.id,
    }).then((res) => {
      console.log('禁用定时任务成功', res);
      message.success('禁用成功！');
    });
    await fetchTimerList();
}
// 立即执行
const handleExecuteNow = async (row) => {
   await executeNow({
      id: row.id,
    }).then((res) => {
      console.log('立即执行成功！', res);
      message.success('立即执行成功！');
    });
    // 刷新
    await fetchTimerList();
}
// 删除
const handleDelete = async (record) => {
    await deleteLightingPlanAPi({
      id: record.id,
    }).then((res) => {
      console.log('删除定时任务成功', res);
    });
    // 刷新
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

/** 导出定时控制表格数据为 Excel（导出当前过滤后的列表，与表格显示一致） */
function onExportTimer() {
  if (!filteredTimerList.value.length) {
    // eslint-disable-next-line no-alert
    alert('暂无可导出的数据');
    return;
  }
  const rows = filteredTimerList.value.map((row, idx) => ({
    index: idx + 1,
    relType: row.relType,
    planName: row.planName,
    time: row.executionLocalTime || row.executionTime,
    date: row.date,
    weeks: row.weeks,
    operationType: row.operationType,
    status: row.status,
  }));
  exportExcel({
    tableData: rows,
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

/** tag 颜色：已执行→蓝色，待执行→红色 */
function getEventTagClass(event: CalendarEventItem) {
  if (event.status === '执行成功') return 'tag-success';
  if (event.status === '执行失败') return 'tag-danger';
  return 'tag-pending';
}

/** 点击日历标签打开详情弹框 */
function openEventDetail(event: CalendarEventItem) {
  console.log(event)
  calendarEventDetailModalRef.value?.showModal(event);
}

/** 获取控制日历事件 */
async function fetchCalendarRecords() {
  if (activeTab.value !== 'calendar') return;
  calendarLoading.value = true;
  try {
    const res = await getCalendarControlApi({
      year: calendarYear.value,
      month: calendarMonth.value + 1, // month 为 0-based，接口需要 1-based
    });
    console.log(res)
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

// 视频播放
const modalLoading = ref(false)
const listVideoBtn = ref(false)
const activeCameras = ref<{ id: number; name: string; url: string }[]>([])

// 视频列表（接口返回后填充）
const allCameraList = ref<{ id: number; name: string; url: string; areaName?: string; status?: string }[]>([])

/** 刷新视频列表：调用接口获取全部摄像头，写入 allCameraList 并取前 2 个进入主页面播放 */
async function onRefreshVideo(type) {
  try {
    listVideoBtn.value = true
    const res = await getAllVidoeListApi({})
    const list = (res && (res.data ?? res)) || []
    const dataArr = Array.isArray(list) ? list : []
    allCameraList.value = dataArr.map((item: any) => ({
      id: item.id,
      name: item.videoName,
      url: item.videoAddress,
      areaName: item.areaName,
      status: item.status,
    }))
    if(type === 'init') {
      // 进入主页面：取前两个用于自动播放
      activeCameras.value = allCameraList.value.slice(0, 2)
    }
    if(type === 'open'){
      // 打开弹框
      cameraModalRef.value?.showModal()
    }

  } catch(err) {
    console.error('获取视频列表失败：', err)
  } finally {
    listVideoBtn.value = false
  }
}

/** FIFO 弹框确认：新选中 → 移除最旧的 → push 新的，最多保持 2 个 */
function onCameraConfirm(cameras: { id: number; name: string; url: string }[]) {
  for (const cam of cameras) {
    // 跳过已在播放中的
    if (activeCameras.value.some((c) => c.id === cam.id)) continue
    if (activeCameras.value.length >= 2) {
      activeCameras.value.shift() // 移除最旧（先进先出）
    }
    activeCameras.value.push(cam)
  }
}

// 摄像头弹框 ref
const cameraModalRef = ref<InstanceType<typeof CameraListModal> | null>(null)

onMounted(() => {
  // 主题 class 同步到 body：弹窗/浮层默认 teleport 到 document.body，需在 body 上也能命中 .theme-white 覆盖层
  document.body.classList.add(themeClass);
  fetchSceneList();
  // 进入页面：拉取视频列表并自动播放前两个
  onRefreshVideo('init');
  // 预加载标签下拉数据到 store 缓存
  loadSceneTagOptions();
});
onBeforeUnmount(() => {
  document.body.classList.remove('theme-white', 'theme-black');
});
</script>

<style scoped>
/* ==================== 视频网格 ==================== */
.video-grid-cameras {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-video {
  margin-bottom: 20px;
  width: calc(50% - 8px);
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;

  .video-label {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 2;
    padding: 2px 10px;
    font-size: 11px;
    color: #fff;
    background: rgba(0, 0, 0, 0.55);
    border-radius: 4px;
    backdrop-filter: blur(4px);
    max-width: calc(100% - 16px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .video-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    
    .video-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
    
    .video-text {
      font-size: 16px;
    }
  }
}
/* ------------------- 颜色变量 ------------------- */
.page-wrapper {
  --bg-page: #0b111e;
  --bg-panel: #1b2533;
  --bg-video: #141d2b;
  --bg-card: #141d2b;
  --color-text: #ffffff;
  --color-muted: #a0aabf;
  --color-primary: #00a2e8;
  --color-primary-hover: #0090cf;
  --color-success: #52c41a;
  --color-success-hover: #47a814;
  --color-danger: #ff4d4f;
  --color-danger-hover: #e64446;
  --color-border: #303d50;

  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: calc(100vh - 60px);
  padding: 16px;
  overflow: hidden;
  background: var(--bg-page);
  color: var(--color-text);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.page-wrapper *,
.page-wrapper *::before,
.page-wrapper *::after {
  box-sizing: border-box;
}

/* ------------------- Tab 导航 ------------------- */
.tab-nav {
  display: flex;
  flex-shrink: 0;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.tab-item {
  position: relative;
  padding: 10px 20px;
  background: transparent;
  border: none;
  color: var(--color-muted);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.tab-item:hover {
  color: var(--color-text);
}

.tab-item.active {
  color: var(--color-primary);
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 100%;
  height: 2px;
  background: var(--color-primary);
}

/* ------------------- 页面内容 ------------------- */
.page-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ------------------- Panel ------------------- */
.panel {
  background: var(--bg-panel);
  border-radius: 8px;
  padding: 16px 20px 20px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 场景搜索栏 */
.scene-search-bar,
.panel-header .header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.scene-search-bar :deep(.ant-select-selector),
.panel-header .header-right :deep(.ant-select-selector) {
  background: #243447 !important;
  border: 1px solid #4a6380 !important;
  color: #ffffff !important;
  border-radius: 4px !important;
  height: 32px !important;
  padding: 0 28px 0 11px !important;
  display: flex !important;
  align-items: center !important;
  position: relative !important;
}

.scene-search-bar :deep(.ant-select-selector:hover),
.panel-header .header-right :deep(.ant-select-selector:hover) {
  border-color: #00a2e8 !important;
}

.scene-search-bar :deep(.ant-select-selection-item),
.scene-search-bar :deep(.ant-select-selection-placeholder),
.panel-header .header-right :deep(.ant-select-selection-item),
.panel-header .header-right :deep(.ant-select-selection-placeholder) {
  line-height: 30px !important;
  font-size: 13px !important;
}

.scene-search-bar :deep(.ant-select-selection-item),
.panel-header .header-right :deep(.ant-select-selection-item) {
  color: #ffffff !important;
}

.scene-search-bar :deep(.ant-select-selection-placeholder),
.panel-header .header-right :deep(.ant-select-selection-placeholder) {
  color: #c0d0e0 !important;
  font-size: 13px !important;
}

.scene-search-bar :deep(.ant-select-arrow),
.panel-header .header-right :deep(.ant-select-arrow) {
  color: #c0d0e0 !important;
  position: absolute !important;
  right: 8px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin-top: 0 !important;
  line-height: 1 !important;
  height: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.scene-search-bar :deep(.ant-select-clear),
.panel-header .header-right :deep(.ant-select-clear) {
  background: #243447 !important;
  color: #c0d0e0 !important;
}

.scene-search-bar :deep(.ant-input-affix-wrapper),
.panel-header .header-right :deep(.ant-input-affix-wrapper) {
  background: #243447 !important;
  border: 1px solid #4a6380 !important;
  border-radius: 4px !important;
  height: 32px !important;
  padding: 0 11px !important;
  box-shadow: none !important;
}

.scene-search-bar :deep(.ant-input-affix-wrapper:hover),
.panel-header .header-right :deep(.ant-input-affix-wrapper:hover) {
  border-color: #00a2e8 !important;
}

.scene-search-bar :deep(.ant-input-affix-wrapper.ant-input-affix-wrapper-focused),
.panel-header .header-right :deep(.ant-input-affix-wrapper.ant-input-affix-wrapper-focused) {
  border-color: #00a2e8 !important;
  box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

.scene-search-bar :deep(.ant-input-affix-wrapper > input),
.panel-header .header-right :deep(.ant-input-affix-wrapper > input) {
  background: transparent !important;
  border: none !important;
  color: #ffffff !important;
  font-size: 13px !important;
  height: 30px !important;
  line-height: 30px !important;
}

.scene-search-bar :deep(.ant-input-affix-wrapper > input::placeholder),
.panel-header .header-right :deep(.ant-input-affix-wrapper > input::placeholder) {
  color: #c0d0e0 !important;
}

.scene-search-bar .btn-sm {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  line-height: 32px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &.btn-primary {
    background: var(--color-primary);
    color: #fff;
    border: 1px solid var(--color-primary);
    &:hover { background: #008ecf; border-color: #008ecf; }
  }

  &.btn-outline {
    background: transparent;
    color: #6ecfef;
    border: 1px solid rgba(0, 162, 232, 0.4);
    &:hover { background: rgba(0, 162, 232, 0.1); border-color: #00a2e8; color: #fff; }
  }
}
.btn-collapse {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid rgba(0, 162, 232, 0.5);
  background: rgba(0, 162, 232, 0.15);
  color: #6ecfef;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  font-size: 13px;
  margin-left: 20px;

  svg {
    width: 18px;
    height: 18px;
    transition: transform 0.3s ease;
  }

  &:hover {
    border-color: var(--color-primary);
    color: #ffffff;
    background: rgba(0, 162, 232, 0.45);
  }

  &.collapsed svg {
    transform: rotate(-90deg);
  }
}

/* 折叠时面板移除下边距 */
.panel-collapsed {
  flex: none !important;
}

.panel-header .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-header .left :deep(.ant-select-selector) {
  background: #1b2533 !important;
  border: 1px solid #303d50 !important;
  color: #ffffff !important;
  border-radius: 4px !important;
  height: 32px !important;
  padding: 0 11px !important;
  display: flex !important;
  align-items: center !important;
}

.panel-header .left :deep(.ant-select-selection-item),
.panel-header .left :deep(.ant-select-selection-placeholder) {
  line-height: 30px !important;
  font-size: 13px !important;
}

.panel-header .left :deep(.ant-select-selection-item) {
  color: #ffffff !important;
}

.panel-header .left :deep(.ant-select-selection-placeholder) {
  color: #5a6a80 !important;
  font-size: 13px !important;
}

.panel-header .left :deep(.ant-select-arrow) {
  color: #5a6a80 !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin-top: 0 !important;
}

.panel-header .left :deep(.ant-select-clear) {
  background: #1b2533 !important;
  color: #5a6a80 !important;
}

.panel-header .left :deep(.ant-select-selector:hover) {
  border-color: #00a2e8 !important;
}

.panel-header .left :deep(.ant-select-focused .ant-select-selector) {
  border-color: #00a2e8 !important;
  box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

.panel-header .left :deep(.ant-input-affix-wrapper) {
  background: #1b2533 !important;
  border: 1px solid #303d50 !important;
  border-radius: 4px !important;
  height: 32px !important;
  padding: 0 11px !important;
  box-shadow: none !important;
}

.panel-header .left :deep(.ant-input-affix-wrapper > input) {
  background: transparent !important;
  border: none !important;
  color: #ffffff !important;
  font-size: 13px !important;
  height: 30px !important;
  line-height: 30px !important;
}

.panel-header .left :deep(.ant-input-affix-wrapper > input::placeholder) {
  color: #5a6a80 !important;
}

.panel-header .left :deep(.ant-input-affix-wrapper:hover) {
  border-color: #00a2e8 !important;
}

.panel-header .left :deep(.ant-input-affix-wrapper.ant-input-affix-wrapper-focused) {
  border-color: #00a2e8 !important;
  box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

.panel-header .left :deep(.ant-input-outlined) {
  background: #1b2533 !important;
  border-color: #303d50 !important;
  color: #ffffff !important;
  border-radius: 4px !important;
}

.panel-header .left :deep(.ant-input-outlined:hover) {
  border-color: #00a2e8 !important;
}

.panel-header .left :deep(.ant-input-outlined > input) {
  color: #ffffff !important;
  background: transparent !important;
}

.panel-header .left :deep(.ant-input-outlined > input::placeholder) {
  color: #5a6a80 !important;
}

.panel-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text);
  flex-shrink: 0;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text);
}

.panel-count {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 10px;
  padding: 2px 8px;
  background: rgba(0, 162, 232, 0.1);
  border: 1px solid rgba(0, 162, 232, 0.3);
  border-radius: 10px;
  font-size: 12px;
  line-height: 1;
  height: 20px;
}

.count-label {
  color: #8fa3bf;
}

.count-filtered {
  color: #00a2e8;
  font-weight: 600;
}

.count-sep {
  color: #5a6a80;
  margin: 0 1px;
}

.count-total {
  color: #8fa3bf;
}

/* ------------------- 按钮 ------------------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 32px;
  padding: 0 14px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  border: none;
  white-space: nowrap;
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}
.btn-outline {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.btn-secondary {
  background: #ffffff;
  color: #1a1a1a;
}

.btn-secondary:hover {
  opacity: 0.88;
}

.btn-success {
  background: var(--color-success);
  color: #1a1a1a;
}

.btn-success:hover {
  background: var(--color-success-hover);
}

.btn-danger {
  background: var(--color-danger);
  color: #fff;
}

.btn-danger:hover {
  background: var(--color-danger-hover);
}

.btn-icon {
  width: 14px;
  height: 14px;
}

/* ------------------- 视频流区域 ------------------- */
.video-grid {
  min-height: 260px;
}

.video-card {
  background: var(--bg-video);
  border-radius: 6px;
  overflow: hidden;
  min-height: 260px;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 260px;
  color: var(--color-muted);
  gap: 8px;
}

.video-icon {
  width: 40px;
  height: 40px;
  color: var(--color-muted);
  margin-bottom: 4px;
}

.video-name {
  margin: 0;
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
}

.video-desc {
  margin: 0;
  font-size: 12px;
  color: var(--color-muted);
}

/* ------------------- 场景控制面板（监控 tab） ------------------- */
.panel-scene-monitor {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-scene-monitor .scene-grid {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;
  align-content: start;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 229, 160, 0.85) rgba(255, 255, 255, 0.1);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 160, 0.85);
    border-radius: 8px;
    border: 1px solid rgba(0, 255, 180, 0.35);
    box-shadow: 0 0 8px rgba(0, 229, 160, 0.5);

    &:hover {
      background: rgba(0, 255, 180, 1);
      box-shadow: 0 0 12px rgba(0, 255, 180, 0.8);
    }
  }

  &::-webkit-scrollbar-thumb:active {
    background: rgba(0, 255, 180, 1);
    box-shadow: 0 0 14px rgba(0, 255, 180, 0.9);
  }
}

/* ------------------- 场景配置 ------------------- */
/* 场景面板：撑满 page-content，内部 flex 列布局 */
.panel-scene {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 固定 panel-header 不跟随滚动 */
.panel-header--fixed {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.scene-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  /* 每行固定展示 4 个，卡片宽度随容器自适应 */
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;
  align-content: start;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 229, 160, 0.85) rgba(255, 255, 255, 0.1);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 229, 160, 0.85);
    border-radius: 8px;
    border: 1px solid rgba(0, 255, 180, 0.35);
    box-shadow: 0 0 8px rgba(0, 229, 160, 0.5);

    &:hover {
      background: rgba(0, 255, 180, 1);
      box-shadow: 0 0 12px rgba(0, 255, 180, 0.8);
    }
  }

  &::-webkit-scrollbar-thumb:active {
    background: rgba(0, 255, 180, 1);
    box-shadow: 0 0 14px rgba(0, 255, 180, 0.9);
  }
}

.scene-card {
  background: linear-gradient(135deg, rgba(20, 35, 55, 0.95) 0%, rgba(15, 25, 42, 0.95) 100%);
  border-radius: 8px;
  border: 1px solid rgba(0, 162, 232, 0.2);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.scene-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #00a2e8 0%, #00d4ff 50%, #00a2e8 100%);
  box-shadow: 0 0 8px rgba(0, 162, 232, 0.6);
  border-radius: 8px 0 0 8px;
}

.scene-card::after {
  content: '';
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 12px;
  height: 12px;
  border-right: 1px solid rgba(0, 162, 232, 0.35);
  border-bottom: 1px solid rgba(0, 162, 232, 0.35);
  pointer-events: none;
}

.scene-card:hover {
  border-color: rgba(0, 162, 232, 0.5);
  box-shadow: 0 0 0 1px rgba(0, 162, 232, 0.2), 0 8px 24px rgba(0, 162, 232, 0.15);
  transform: translateY(-2px);
}

.scene-card:hover::before {
  box-shadow: 0 0 12px rgba(0, 162, 232, 0.8);
}

.scene-card-inner {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.scene-card.scene-default {
  border-color: var(--color-primary);
}

.scene-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
}

.scene-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.scene-tag {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  font-size: 11px;
  color: #6ecfef;
  background: rgba(0, 162, 232, 0.12);
  border: 1px solid rgba(0, 162, 232, 0.25);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.scene-top-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

/* ==================== 卡片右上角固定标签 ==================== */
.scene-corner-tag {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 10px 0 9px;
  border-radius: 11px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: #00d4ff;
  white-space: nowrap;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.18) 0%, rgba(0, 162, 232, 0.08) 100%);
  border: 1px solid rgba(0, 212, 255, 0.35);
  box-shadow:
    0 2px 8px rgba(0, 162, 232, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(2px);
  transition: all 0.3s ease;

  svg {
    width: 11px;
    height: 11px;
    stroke: #00d4ff;
  }
}

.scene-card:hover .scene-corner-tag {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.32) 0%, rgba(0, 162, 232, 0.18) 100%);
  border-color: rgba(0, 212, 255, 0.6);
  box-shadow:
    0 3px 12px rgba(0, 162, 232, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 0 6px rgba(0, 212, 255, 0.4);
}

.scene-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--color-text);
  }

  &.danger:hover {
    background: rgba(255, 77, 79, 0.15);
    color: #ff7875;
  }
}

.scene-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.scene-icon {
  font-size: 16px;
  line-height: 1;
}

.scene-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scene-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 162, 232, 0.05);
  border: 1px solid rgba(0, 162, 232, 0.1);
  border-radius: 6px;
  padding: 8px 10px;
  position: relative;
}

/* 右上角场景/节目类型标签 */
.scene-info-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  padding: 0 7px;
  border-radius: 3px;
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.5px;
  font-weight: 500;
  pointer-events: none;
}

/* 场景/节目标签容器（右上角，支持并列展示） */
.scene-info-tags {
  position: absolute;
  top: 6px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
  pointer-events: none;
}

.scene-info-tag--scene {
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.12);
  border: 1px solid rgba(0, 212, 255, 0.45);
  box-shadow: inset 0 0 6px rgba(0, 212, 255, 0.15);
}

.scene-info-tag--program {
  color: #d8b4fe;
  background: rgba(192, 132, 252, 0.12);
  border: 1px solid rgba(192, 132, 252, 0.45);
  box-shadow: inset 0 0 6px rgba(192, 132, 252, 0.15);
}

.scene-info-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 1.4;
}

.scene-info-item .info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: var(--color-muted);
  flex-shrink: 0;
  margin-right: 5px;

  svg {
    width: 12px;
    height: 12px;
  }
}

.scene-info-item .info-label {
  color: var(--color-muted);
  /* min-width: 48px; */
  padding-right: 6px;
  flex-shrink: 0;
}

.scene-info-item .info-value {
  color: var(--color-text);
  flex: 1;
  /* 允许 flex 子项收缩到内容宽度以下，避免长文本溢出卡片 */
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scene-info-item .info-value.val-on {
  color: #22c55e;
  font-weight: 500;
}

.scene-info-item .info-value.val-off {
  color: #ef4444;
  font-weight: 500;
}

/* 当前运行节目（programSceneIds 非空时） */
.scene-info-item .info-value.program-names {
  color: #00d4ff;
  font-weight: 500;
}

.scene-default-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  font-size: 11px;
  line-height: 1;
  color: var(--color-primary);
  background: rgba(0, 162, 232, 0.15);
}

.scene-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  flex-shrink: 0;

  &.status-on {
    color: #22c55e;
    background: rgba(34, 197, 94, 0.12);
  }

  &.status-off {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.12);
  }
}

.scene-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: auto;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.scene-actions-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.scene-actions-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-sm {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  line-height: 32px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &.btn-primary {
    background: var(--color-primary);
    color: #fff;
    border: 1px solid var(--color-primary);
    &:hover { background: #008ecf; border-color: #008ecf; }
  }

  &.btn-danger {
    background: #ff4d4f;
    color: #fff;
    border: 1px solid #ff4d4f;
    &:hover { background: #e04345; border-color: #e04345; }
  }
}

.btn-link {
  background: transparent;
  color: var(--color-primary);
  border: none;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  height: auto;
  line-height: 1;
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary-hover);
    text-decoration: underline;
  }
}

/* ------------------- 占位提示 ------------------- */
.placeholder-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.placeholder-text {
  margin: 0;
  font-size: 14px;
  color: var(--color-muted);
}

/* ------------------- 定时任务搜索栏 ------------------- */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-separator {
  color: var(--color-muted);
  flex-shrink: 0;
}

/* 搜索栏时间选择器深色适配 */
.filter-bar :deep(.ant-picker),
.panel-header .header-right :deep(.ant-picker) {
  background: #243447 !important;
  border: 1px solid #4a6380 !important;
  border-radius: 4px !important;
  height: 32px !important;
  box-sizing: border-box !important;
  display: flex !important;
  align-items: center !important;
}

.filter-bar :deep(.ant-picker-input > input),
.panel-header .header-right :deep(.ant-picker-input > input) {
  color: #ffffff !important;
  font-size: 13px !important;
}

.filter-bar :deep(.ant-picker-input > input::placeholder),
.panel-header .header-right :deep(.ant-picker-input > input::placeholder) {
  color: #c0d0e0 !important;
}

.filter-bar :deep(.ant-picker-suffix),
.panel-header .header-right :deep(.ant-picker-suffix) {
  color: #c0d0e0 !important;
}

.filter-bar :deep(.ant-picker-clear),
.panel-header .header-right :deep(.ant-picker-clear) {
  background: #243447 !important;
  color: #c0d0e0 !important;
}

.filter-bar :deep(.ant-picker:hover),
.panel-header .header-right :deep(.ant-picker:hover) {
  border-color: #00a2e8 !important;
}

.filter-bar :deep(.ant-picker-focused),
.panel-header .header-right :deep(.ant-picker-focused) {
  border-color: #00a2e8 !important;
  box-shadow: 0 0 0 2px rgba(0, 162, 232, 0.15) !important;
}

/* 搜索栏 a-select 深色适配 */
.filter-bar :deep(.ant-select-selector) {
  background: var(--bg-card) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text) !important;
}

.filter-bar :deep(.ant-select-selection-item) {
  color: var(--color-text) !important;
}

.filter-bar :deep(.ant-select-selection-placeholder) {
  color: var(--color-muted) !important;
}

.filter-bar :deep(.ant-select-arrow) {
  color: var(--color-muted) !important;
}

/* ------------------- 分页 ------------------- */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 4px;
  user-select: none;
}

.pagination-info {
  font-size: 13px;
  color: var(--color-muted);
  margin-right: 8px;
}

.pagination-btn {
  padding: 4px 12px;
  font-size: 13px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--bg-card);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-current {
  font-size: 13px;
  color: var(--color-text);
  font-weight: 600;
}

/* ------------------- 定时任务表格 ------------------- */
.panel-timer {
  flex: 1;
  min-height: 0;
}

.table-wrapper {
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: auto;
}

.table-wrapper .timer-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #1a2332;
}

.timer-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 13px;
}

.timer-table thead tr {
  border-bottom: 1px solid var(--color-border);
}

.timer-table th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 500;
  color: var(--color-muted);
  white-space: nowrap;
}

.timer-table tbody tr {
  border-bottom: 1px solid var(--color-border);
}

.timer-table tbody tr:last-child {
  border-bottom: none;
}

.timer-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.timer-table td {
  padding: 12px;
  color: var(--color-text);
  vertical-align: middle;
  white-space: nowrap;
}

.timer-table td .cell-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timer-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 22px;
  padding: 0 10px;
  border-radius: 11px;
  font-size: 12px;
  line-height: 1;
}

.timer-status-badge.status-enabled {
  color: var(--color-success);
  background: rgba(82, 196, 26, 0.2);
}

.timer-status-badge.status-disabled {
  color: var(--color-danger);
  background: rgba(255, 77, 79, 0.2);
}

.timer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ------------------- 控制日历 ------------------- */
.calendar-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 24px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #a0aabf;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-text {
  background: transparent;
  color: var(--color-text);
  width: 28px;
  padding: 0;
  font-size: 14px;
}

.btn-text:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 日历面板充满剩余空间 */
.panel-calendar {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 0;
  padding-bottom: 12px;
}

.panel-calendar .panel-header {
  margin-bottom: 8px;
}

.calendar-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 1px;
  background: var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0;
}

.calendar-weekday {
  background: var(--bg-panel);
  padding: 6px 4px;
  text-align: center;
  font-size: 13px;
  color: var(--color-muted);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day {
  background: var(--bg-card);
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.15s;
  min-height: 0;
}

.calendar-day:hover {
  background: rgba(255, 255, 255, 0.04);
}

.calendar-day.other-month {
  opacity: 0.35;
}

.day-number {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  flex-shrink: 0;
  margin-bottom: 2px;
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }
}

.task-tag {
  display: block;
  width: 100%;
  height: 20px;
  line-height: 20px;
  padding: 0 6px;
  border-radius: 3px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
  text-align: left;
  flex-shrink: 0;
  cursor: pointer;
}

.tag-pending {
  background: var(--color-primary);
}

.tag-success {
  background: var(--color-success);
}

.tag-danger {
  background: var(--color-danger);
}

/* ------------------- 响应式 ------------------- */
@media (max-width: 1200px) {
  .scene-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .video-grid-cameras {
    flex-direction: column;
  }

  .detail-video {
    width: 100%;
  }

  .scene-grid {
    grid-template-columns: 1fr;
  }

  .tab-nav {
    overflow-x: auto;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>

<style>
/* ==================== 当前运行节目 tip（a-tooltip 挂载 body，需全局非 scoped 样式） ==================== */
.scene-program-tooltip .ant-tooltip-inner {
  /* 与页面主体（深蓝灰卡片）同色系，100% 不透明 */
  background: linear-gradient(180deg, #1e2a3d 0%, #152238 100%);
  border: 1px solid rgba(0, 212, 255, 0.5);
  box-shadow:
    0 0 12px rgba(0, 212, 255, 0.25),
    0 4px 16px rgba(0, 0, 0, 0.6);
  color: #e8f4ff;
  font-size: 12px;
  line-height: 1.6;
  border-radius: 4px;
  padding: 6px 10px;
  max-width: 320px;
}

.scene-program-tooltip .ant-tooltip-arrow-content,
.scene-program-tooltip .ant-tooltip-arrow::before {
  --antd-arrow-background-color: #152238;
  background: #152238;
}
</style>

<!-- ===== 白色主题覆盖层（自动生成）===== -->

<style scoped>
/* 白色主题颜色变量（挂在根节点，scoped 下 :root 无效，需与根类同级选择器命中） */
.theme-white.page-wrapper {
  --bg-page: #f5f7fa;
  --bg-panel: #ffffff;
  --bg-video: #0d1420;
  --bg-card: #ffffff;
  --color-text: #303133;
  --color-muted: #909399;
  --color-primary: #1890ff;
  --color-primary-hover: #40a9ff;
  --color-success: #52c41a;
  --color-success-hover: #47a814;
  --color-danger: #ff4d4f;
  --color-danger-hover: #e64446;
  --color-border: #e4e7ed;

  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: calc(100vh - 60px);
  padding: 16px;
  overflow: hidden;
  background: var(--bg-page);
  color: var(--color-text);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}.theme-white.page-wrapper *,
.theme-white.page-wrapper *::before,
.theme-white.page-wrapper *::after {
  box-sizing: border-box;
}.theme-white /* ------------------- Tab 导航 ------------------- */
.tab-nav {
  display: flex;
  flex-shrink: 0;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}.theme-white .tab-item {
  position: relative;
  padding: 10px 20px;
  background: transparent;
  border: none;
  color: var(--color-muted);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}.theme-white .tab-item:hover {
  color: var(--color-text);
}.theme-white .tab-item.active {
  color: var(--color-primary);
  font-weight: 500;
}.theme-white .tab-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 100%;
  height: 2px;
  background: var(--color-primary);
}.theme-white /* ------------------- 页面内容 ------------------- */
.page-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}.theme-white /* ------------------- Panel ------------------- */
.panel {
  background: var(--bg-panel);
  border-radius: 8px;
  padding: 16px 20px 20px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}.theme-white .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}.theme-white .header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}.theme-white /* 场景搜索栏 */
.scene-search-bar,
.theme-white .panel-header .header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}.theme-white .scene-search-bar :deep(.ant-select-selector),
.theme-white .panel-header .header-right :deep(.ant-select-selector) {
  background: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
  color: #303133 !important;
  border-radius: 4px !important;
  height: 32px !important;
  padding: 0 28px 0 11px !important;
  display: flex !important;
  align-items: center !important;
  position: relative !important;
}.theme-white .scene-search-bar :deep(.ant-select-selector:hover),
.theme-white .panel-header .header-right :deep(.ant-select-selector:hover) {
  border-color: #1890ff !important;
}.theme-white .scene-search-bar :deep(.ant-select-selection-item),
.theme-white .scene-search-bar :deep(.ant-select-selection-placeholder),
.theme-white .panel-header .header-right :deep(.ant-select-selection-item),
.theme-white .panel-header .header-right :deep(.ant-select-selection-placeholder) {
  line-height: 30px !important;
  font-size: 13px !important;
}.theme-white .scene-search-bar :deep(.ant-select-selection-item),
.theme-white .panel-header .header-right :deep(.ant-select-selection-item) {
  color: #303133 !important;
}.theme-white .scene-search-bar :deep(.ant-select-selection-placeholder),
.theme-white .panel-header .header-right :deep(.ant-select-selection-placeholder) {
  color: #909399 !important;
  font-size: 13px !important;
}.theme-white .scene-search-bar :deep(.ant-select-arrow),
.theme-white .panel-header .header-right :deep(.ant-select-arrow) {
  color: #909399 !important;
  position: absolute !important;
  right: 8px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin-top: 0 !important;
  line-height: 1 !important;
  height: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}.theme-white .scene-search-bar :deep(.ant-select-clear),
.theme-white .panel-header .header-right :deep(.ant-select-clear) {
  background: #ffffff !important;
  color: #909399 !important;
}.theme-white .scene-search-bar :deep(.ant-input-affix-wrapper),
.theme-white .panel-header .header-right :deep(.ant-input-affix-wrapper) {
  background: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
  border-radius: 4px !important;
  height: 32px !important;
  padding: 0 11px !important;
  box-shadow: none !important;
}.theme-white .scene-search-bar :deep(.ant-input-affix-wrapper:hover),
.theme-white .panel-header .header-right :deep(.ant-input-affix-wrapper:hover) {
  border-color: #1890ff !important;
}.theme-white .scene-search-bar :deep(.ant-input-affix-wrapper.ant-input-affix-wrapper-focused),
.theme-white .panel-header .header-right :deep(.ant-input-affix-wrapper.ant-input-affix-wrapper-focused) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.08) !important;
}.theme-white .scene-search-bar :deep(.ant-input-affix-wrapper > input),
.theme-white .panel-header .header-right :deep(.ant-input-affix-wrapper > input) {
  background: transparent !important;
  border: none !important;
  color: #303133 !important;
  font-size: 13px !important;
  height: 30px !important;
  line-height: 30px !important;
}.theme-white .scene-search-bar :deep(.ant-input-affix-wrapper > input::placeholder),
.theme-white .panel-header .header-right :deep(.ant-input-affix-wrapper > input::placeholder) {
  color: #909399 !important;
}.theme-white .scene-search-bar .btn-sm {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  line-height: 32px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &.btn-primary  {
    background: var(--color-primary);
    color: #fff;
    border: 1px solid var(--color-primary);
    &:hover  { background: #40a9ff; border-color: #40a9ff; }}

  &.btn-outline  {
    background: transparent;
    color: #1890ff;
    border: 1px solid rgba(24, 144, 255, 0.4);
    &:hover  { background: rgba(24, 144, 255, 0.08); border-color: #1890ff; color: #1890ff; }}}.theme-white .btn-collapse {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid rgba(24, 144, 255, 0.5);
  background: rgba(24, 144, 255, 0.08);
  color: #1890ff;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  font-size: 13px;
  margin-left: 20px;

  svg  {
    width: 18px;
    height: 18px;
    transition: transform 0.3s ease;
  }

  &:hover  {
    border-color: var(--color-primary);
    color: #1890ff;
    background: rgba(24, 144, 255, 0.15);
  }

  &.collapsed svg  {
    transform: rotate(-90deg);
  }}.theme-white /* 折叠时面板移除下边距 */
.panel-collapsed {
  flex: none !important;
}.theme-white .panel-header .left {
  display: flex;
  align-items: center;
  gap: 8px;
}.theme-white .panel-header .left :deep(.ant-select-selector) {
  background: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
  color: #303133 !important;
  border-radius: 4px !important;
  height: 32px !important;
  padding: 0 11px !important;
  display: flex !important;
  align-items: center !important;
}.theme-white .panel-header .left :deep(.ant-select-selection-item),
.theme-white .panel-header .left :deep(.ant-select-selection-placeholder) {
  line-height: 30px !important;
  font-size: 13px !important;
}.theme-white .panel-header .left :deep(.ant-select-selection-item) {
  color: #303133 !important;
}.theme-white .panel-header .left :deep(.ant-select-selection-placeholder) {
  color: #909399 !important;
  font-size: 13px !important;
}.theme-white .panel-header .left :deep(.ant-select-arrow) {
  color: #909399 !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin-top: 0 !important;
}.theme-white .panel-header .left :deep(.ant-select-clear) {
  background: #ffffff !important;
  color: #909399 !important;
}.theme-white .panel-header .left :deep(.ant-select-selector:hover) {
  border-color: #1890ff !important;
}.theme-white .panel-header .left :deep(.ant-select-focused .ant-select-selector) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.08) !important;
}.theme-white .panel-header .left :deep(.ant-input-affix-wrapper) {
  background: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
  border-radius: 4px !important;
  height: 32px !important;
  padding: 0 11px !important;
  box-shadow: none !important;
}.theme-white .panel-header .left :deep(.ant-input-affix-wrapper > input) {
  background: transparent !important;
  border: none !important;
  color: #303133 !important;
  font-size: 13px !important;
  height: 30px !important;
  line-height: 30px !important;
}.theme-white .panel-header .left :deep(.ant-input-affix-wrapper > input::placeholder) {
  color: #909399 !important;
}.theme-white .panel-header .left :deep(.ant-input-affix-wrapper:hover) {
  border-color: #1890ff !important;
}.theme-white .panel-header .left :deep(.ant-input-affix-wrapper.ant-input-affix-wrapper-focused) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.08) !important;
}.theme-white .panel-header .left :deep(.ant-input-outlined) {
  background: #ffffff !important;
  border-color: #dcdfe6 !important;
  color: #303133 !important;
  border-radius: 4px !important;
}.theme-white .panel-header .left :deep(.ant-input-outlined:hover) {
  border-color: #1890ff !important;
}.theme-white .panel-header .left :deep(.ant-input-outlined > input) {
  color: #303133 !important;
  background: transparent !important;
}.theme-white .panel-header .left :deep(.ant-input-outlined > input::placeholder) {
  color: #909399 !important;
}.theme-white .panel-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text);
  flex-shrink: 0;
}.theme-white .panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text);
}.theme-white .panel-count {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 10px;
  padding: 2px 8px;
  background: rgba(24, 144, 255, 0.08);
  border: 1px solid rgba(24, 144, 255, 0.3);
  border-radius: 10px;
  font-size: 12px;
  line-height: 1;
  height: 20px;
}.theme-white .count-label {
  color: #606266;
}.theme-white .count-filtered {
  color: #1890ff;
  font-weight: 600;
}.theme-white .count-sep {
  color: #909399;
  margin: 0 1px;
}.theme-white .count-total {
  color: #606266;
}.theme-white /* ------------------- 按钮 ------------------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 32px;
  padding: 0 14px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  border: none;
  white-space: nowrap;
}.theme-white .btn-primary {
  background: var(--color-primary);
  color: #fff;
}.theme-white .btn-primary:hover {
  background: var(--color-primary-hover);
}.theme-white .btn-outline {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}.theme-white .btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}.theme-white .btn-secondary {
  background: #ffffff;
  color: #1a1a1a;
}.theme-white .btn-secondary:hover {
  opacity: 0.88;
}.theme-white .btn-success {
  background: var(--color-success);
  color: #1a1a1a;
}.theme-white .btn-success:hover {
  background: var(--color-success-hover);
}.theme-white .btn-danger {
  background: var(--color-danger);
  color: #fff;
}.theme-white .btn-danger:hover {
  background: var(--color-danger-hover);
}.theme-white .btn-icon {
  width: 14px;
  height: 14px;
}.theme-white /* ------------------- 视频流区域 ------------------- */
.video-grid {
  min-height: 260px;
}.theme-white .video-card {
  background: var(--bg-video);
  border-radius: 6px;
  overflow: hidden;
  min-height: 260px;
}.theme-white .video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 260px;
  color: var(--color-muted);
  gap: 8px;
}.theme-white .video-icon {
  width: 40px;
  height: 40px;
  color: var(--color-muted);
  margin-bottom: 4px;
}.theme-white .video-name {
  margin: 0;
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
}.theme-white .video-desc {
  margin: 0;
  font-size: 12px;
  color: var(--color-muted);
}.theme-white /* ------------------- 场景控制面板（监控 tab） ------------------- */
.panel-scene-monitor {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}.theme-white .panel-scene-monitor .scene-grid {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;
  align-content: start;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;

  &::-webkit-scrollbar  {
    width: 8px;
  }

  &::-webkit-scrollbar-track  {
    background: rgba(0, 0, 0, 0.04);
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb  {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.05);

    &:hover  {
      background: rgba(0, 0, 0, 0.35);
    }}

  &::-webkit-scrollbar-thumb:active  {
    background: rgba(0, 0, 0, 0.4);
  }}.theme-white /* ------------------- 场景配置 ------------------- */
/* 场景面板：撑满 page-content，内部 flex 列布局 */
.panel-scene {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}.theme-white /* 固定 panel-header 不跟随滚动 */
.panel-header--fixed {
  flex-shrink: 0;
  margin-bottom: 12px;
}.theme-white .scene-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  /* 每行固定展示 4 个，卡片宽度随容器自适应 */
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;
  align-content: start;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;

  &::-webkit-scrollbar  {
    width: 8px;
  }

  &::-webkit-scrollbar-track  {
    background: rgba(0, 0, 0, 0.04);
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb  {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.05);

    &:hover  {
      background: rgba(0, 0, 0, 0.35);
    }}

  &::-webkit-scrollbar-thumb:active  {
    background: rgba(0, 0, 0, 0.4);
  }}.theme-white .scene-card {
  background: #ffffff;
  border-radius: 8px;
  border: 2px solid rgba(24, 144, 255, 0.35);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}.theme-white .scene-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #1890ff 0%, #40a9ff 50%, #1890ff 100%);
  box-shadow: 0 0 8px rgba(24, 144, 255, 0.3);
  border-radius: 8px 0 0 8px;
}.theme-white .scene-card::after {
  content: '';
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 12px;
  height: 12px;
  border-right: 1px solid rgba(24, 144, 255, 0.4);
  border-bottom: 1px solid rgba(24, 144, 255, 0.4);
  pointer-events: none;
}.theme-white .scene-card:hover {
  border-color: rgba(24, 144, 255, 0.5);
  box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.2), 0 8px 24px rgba(24, 144, 255, 0.12);
  transform: translateY(-2px);
}.theme-white .scene-card:hover::before {
  box-shadow: 0 0 12px rgba(24, 144, 255, 0.5);
}.theme-white .scene-card-inner {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}.theme-white .scene-card.scene-default {
  border-color: var(--color-primary);
}.theme-white .scene-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
}.theme-white .scene-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}.theme-white .scene-tag {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  font-size: 11px;
  color: #1890ff;
  background: rgba(24, 144, 255, 0.08);
  border: 1px solid rgba(24, 144, 255, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}.theme-white .scene-top-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}.theme-white /* ==================== 卡片右上角固定标签 ==================== */
.scene-corner-tag {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 10px 0 9px;
  border-radius: 11px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: #1890ff;
  white-space: nowrap;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.04) 100%);
  border: 1px solid rgba(24, 144, 255, 0.35);
  box-shadow:
    0 2px 8px rgba(24, 144, 255, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(2px);
  transition: all 0.3s ease;

  svg  {
    width: 11px;
    height: 11px;
    stroke: #1890ff;
  }}.theme-white .scene-card:hover .scene-corner-tag {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.18) 0%, rgba(24, 144, 255, 0.08) 100%);
  border-color: rgba(24, 144, 255, 0.6);
  box-shadow:
    0 3px 12px rgba(24, 144, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 0 6px rgba(24, 144, 255, 0.2);
}.theme-white .scene-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;

  svg  {
    width: 16px;
    height: 16px;
  }

  &:hover  {
    background: rgba(0, 0, 0, 0.06);
    color: var(--color-text);
  }

  &.danger:hover  {
    background: rgba(255, 77, 79, 0.15);
    color: #ff7875;
  }}.theme-white .scene-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}.theme-white .scene-icon {
  font-size: 16px;
  line-height: 1;
}.theme-white .scene-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}.theme-white .scene-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 8px 10px;
  position: relative;
}.theme-white /* 右上角场景/节目类型标签 */
.scene-info-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  padding: 0 7px;
  border-radius: 3px;
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.5px;
  font-weight: 500;
  pointer-events: none;
}.theme-white /* 场景/节目标签容器（右上角，支持并列展示） */
.scene-info-tags {
  position: absolute;
  top: 6px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
  pointer-events: none;
}.theme-white .scene-info-tag--scene {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
  border: 1px solid rgba(24, 144, 255, 0.4);
  box-shadow: inset 0 0 6px rgba(24, 144, 255, 0.08);
}.theme-white .scene-info-tag--program {
  color: #722ed1;
  background: rgba(114, 46, 209, 0.08);
  border: 1px solid rgba(114, 46, 209, 0.35);
  box-shadow: inset 0 0 6px rgba(114, 46, 209, 0.08);
}.theme-white .scene-info-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 1.4;
}.theme-white .scene-info-item .info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: var(--color-muted);
  flex-shrink: 0;
  margin-right: 5px;

  svg  {
    width: 12px;
    height: 12px;
  }}.theme-white .scene-info-item .info-label {
  color: var(--color-muted);
  /* min-width: 48px; */
  padding-right: 6px;
  flex-shrink: 0;
}.theme-white .scene-info-item .info-value {
  color: var(--color-text);
  flex: 1;
  /* 允许 flex 子项收缩到内容宽度以下，避免长文本溢出卡片 */
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}.theme-white .scene-info-item .info-value.val-on {
  color: #52c41a;
  font-weight: 500;
}.theme-white .scene-info-item .info-value.val-off {
  color: #ff4d4f;
  font-weight: 500;
}.theme-white /* 当前运行节目（programSceneIds 非空时） */
.scene-info-item .info-value.program-names {
  color: #1890ff;
  font-weight: 500;
}.theme-white .scene-default-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  font-size: 11px;
  line-height: 1;
  color: var(--color-primary);
  background: rgba(24, 144, 255, 0.1);
}.theme-white .scene-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  flex-shrink: 0;

  &.status-on  {
    color: #52c41a;
    background: rgba(82, 196, 26, 0.12);
  }

  &.status-off  {
    color: #ff4d4f;
    background: rgba(255, 77, 79, 0.12);
  }}.theme-white .scene-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: auto;
  padding-top: 6px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}.theme-white .scene-actions-left {
  display: flex;
  align-items: center;
  gap: 6px;
}.theme-white .scene-actions-right {
  display: flex;
  align-items: center;
  gap: 6px;
}.theme-white .btn-sm {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  line-height: 32px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &.btn-primary  {
    background: var(--color-primary);
    color: #fff;
    border: 1px solid var(--color-primary);
    &:hover  { background: #40a9ff; border-color: #40a9ff; }}

  &.btn-danger  {
    background: #ff4d4f;
    color: #fff;
    border: 1px solid #ff4d4f;
    &:hover  { background: #e04345; border-color: #e04345; }}}.theme-white /* 场景卡片开启按钮：浅蓝底 + 深蓝图标/文字，避免深蓝背景遮挡图标 */
.btn-primary.btn-execute {
  background: #e6f4ff;
  color: #1890ff;
  border: 1px solid #1890ff;
  &:hover  { background: #d6ecff; border-color: #1890ff; color: #1890ff; }}.theme-white /* 场景卡片关闭按钮：浅红底 + 红色图标/文字，与开启按钮风格一致 */
.btn-danger.btn-close {
  background: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
  &:hover  { background: #ffe3e2; border-color: #ff4d4f; color: #ff4d4f; }}.theme-white .btn-link {
  background: transparent;
  color: var(--color-primary);
  border: none;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  height: auto;
  line-height: 1;
  transition: color 0.2s;

  &:hover  {
    color: var(--color-primary-hover);
    text-decoration: underline;
  }}.theme-white /* ------------------- 占位提示 ------------------- */
.placeholder-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}.theme-white .placeholder-text {
  margin: 0;
  font-size: 14px;
  color: var(--color-muted);
}.theme-white /* ------------------- 定时任务搜索栏 ------------------- */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}.theme-white .filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}.theme-white .filter-separator {
  color: var(--color-muted);
  flex-shrink: 0;
}.theme-white /* 搜索栏时间选择器浅色适配 */
.filter-bar :deep(.ant-picker),
.theme-white .panel-header .header-right :deep(.ant-picker) {
  background: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
  border-radius: 4px !important;
  height: 32px !important;
  box-sizing: border-box !important;
  display: flex !important;
  align-items: center !important;
}.theme-white .filter-bar :deep(.ant-picker-input > input),
.theme-white .panel-header .header-right :deep(.ant-picker-input > input) {
  color: #303133 !important;
  font-size: 13px !important;
}.theme-white .filter-bar :deep(.ant-picker-input > input::placeholder),
.theme-white .panel-header .header-right :deep(.ant-picker-input > input::placeholder) {
  color: #909399 !important;
}.theme-white .filter-bar :deep(.ant-picker-suffix),
.theme-white .panel-header .header-right :deep(.ant-picker-suffix) {
  color: #909399 !important;
}.theme-white .filter-bar :deep(.ant-picker-clear),
.theme-white .panel-header .header-right :deep(.ant-picker-clear) {
  background: #ffffff !important;
  color: #909399 !important;
}.theme-white .filter-bar :deep(.ant-picker:hover),
.theme-white .panel-header .header-right :deep(.ant-picker:hover) {
  border-color: #1890ff !important;
}.theme-white .filter-bar :deep(.ant-picker-focused),
.theme-white .panel-header .header-right :deep(.ant-picker-focused) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15) !important;
}.theme-white /* 搜索栏 a-select 深色适配 */
.filter-bar :deep(.ant-select-selector) {
  background: var(--bg-card) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text) !important;
}.theme-white .filter-bar :deep(.ant-select-selection-item) {
  color: var(--color-text) !important;
}.theme-white .filter-bar :deep(.ant-select-selection-placeholder) {
  color: var(--color-muted) !important;
}.theme-white .filter-bar :deep(.ant-select-arrow) {
  color: var(--color-muted) !important;
}.theme-white /* ------------------- 分页 ------------------- */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 4px;
  user-select: none;
}.theme-white .pagination-info {
  font-size: 13px;
  color: var(--color-muted);
  margin-right: 8px;
}.theme-white .pagination-btn {
  padding: 4px 12px;
  font-size: 13px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--bg-card);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}.theme-white .pagination-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}.theme-white .pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}.theme-white .pagination-current {
  font-size: 13px;
  color: var(--color-text);
  font-weight: 600;
}.theme-white /* ------------------- 定时任务表格 ------------------- */
.panel-timer {
  flex: 1;
  min-height: 0;
}.theme-white .table-wrapper {
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: auto;
}.theme-white .table-wrapper .timer-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f5f7fa;
}.theme-white .timer-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 13px;
}.theme-white .timer-table thead tr {
  border-bottom: 1px solid var(--color-border);
}.theme-white .timer-table th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 500;
  color: var(--color-muted);
  white-space: nowrap;
}.theme-white .timer-table tbody tr {
  border-bottom: 1px solid var(--color-border);
}.theme-white .timer-table tbody tr:last-child {
  border-bottom: none;
}.theme-white .timer-table tbody tr:hover {
  background: rgba(0, 0, 0, 0.04);
}.theme-white .timer-table td {
  padding: 12px;
  color: var(--color-text);
  vertical-align: middle;
  white-space: nowrap;
}.theme-white .timer-table td .cell-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}.theme-white .timer-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 22px;
  padding: 0 10px;
  border-radius: 11px;
  font-size: 12px;
  line-height: 1;
}.theme-white .timer-status-badge.status-enabled {
  color: var(--color-success);
  background: rgba(82, 196, 26, 0.2);
}.theme-white .timer-status-badge.status-disabled {
  color: var(--color-danger);
  background: rgba(255, 77, 79, 0.2);
}.theme-white .timer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}.theme-white /* ------------------- 控制日历 ------------------- */
.calendar-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 24px;
}.theme-white .legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
}.theme-white .legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
}.theme-white .calendar-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}.theme-white .btn-text {
  background: transparent;
  color: var(--color-text);
  width: 28px;
  padding: 0;
  font-size: 14px;
}.theme-white .btn-text:hover {
  background: rgba(0, 0, 0, 0.06);
}.theme-white /* 日历面板充满剩余空间 */
.panel-calendar {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 0;
  padding-bottom: 12px;
}.theme-white .panel-calendar .panel-header {
  margin-bottom: 8px;
}.theme-white .calendar-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 1px;
  background: var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0;
}.theme-white .calendar-weekday {
  background: var(--bg-panel);
  padding: 6px 4px;
  text-align: center;
  font-size: 13px;
  color: var(--color-muted);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}.theme-white .calendar-day {
  background: var(--bg-card);
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.15s;
  min-height: 0;
}.theme-white .calendar-day:hover {
  background: rgba(0, 0, 0, 0.04);
}.theme-white .calendar-day.other-month {
  opacity: 0.35;
}.theme-white .day-number {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  flex-shrink: 0;
  margin-bottom: 2px;
}.theme-white .day-tasks {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  &::-webkit-scrollbar  {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb  {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }}.theme-white .task-tag {
  display: block;
  width: 100%;
  height: 20px;
  line-height: 20px;
  padding: 0 6px;
  border-radius: 3px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
  text-align: left;
  flex-shrink: 0;
  cursor: pointer;
}.theme-white .tag-pending {
  background: var(--color-primary);
}.theme-white .tag-success {
  background: var(--color-success);
}.theme-white .tag-danger {
  background: var(--color-danger);
}

/* ------------------- 响应式 ------------------- */
@media (max-width: 1200px)  {.theme-white .scene-grid {
    grid-template-columns: repeat(2, 1fr);
  }}

@media (max-width: 768px)  {.theme-white .video-grid-cameras {
    flex-direction: column;
  }.theme-white .detail-video {
    width: 100%;
  }.theme-white .scene-grid {
    grid-template-columns: 1fr;
  }.theme-white .tab-nav {
    overflow-x: auto;
  }.theme-white .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }}
</style>

<style lang="less">
.theme-white /* ==================== 当前运行节目 tip（a-tooltip 挂载 body，需全局非 scoped 样式） ==================== */
.scene-program-tooltip .ant-tooltip-inner {
  /* 与页面主体（白色卡片）同色系，100% 不透明 */
  background: #ffffff;
  border: 1px solid rgba(24, 144, 255, 0.3);
  box-shadow:
    0 0 12px rgba(24, 144, 255, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.15);
  color: #303133;
  font-size: 12px;
  line-height: 1.6;
  border-radius: 4px;
  padding: 6px 10px;
  max-width: 320px;
}.theme-white .scene-program-tooltip .ant-tooltip-arrow-content,
.theme-white .scene-program-tooltip .ant-tooltip-arrow::before {
  --antd-arrow-background-color: #ffffff;
  background: #ffffff;
}
</style>
