# 能源管理模块（energy-management）技术文档

## 1. 模块概述

能源管理模块是 BEMS-Web 会展小镇服务保障平台中"能源管理"一级菜单下的核心业务模块，负责对场馆冷源系统、能源计量、负荷预测及控制策略进行统一监控与管理。

- **路由前缀**：`/fwbz/energy-management`
- **菜单标题**：能源管理
- **默认重定向**：`/fwbz/energy-management/metering`（进入后默认展示"能源计量"子页面）
- **布局**：沿用平台 `LAYOUT` 布局（左侧菜单 + 右侧面包屑 + 用户信息 + 内容区）
- **页面风格**：白底卡片式布局，与项目中其他页面（如安防管理、AI预测报告等）保持一致

---

## 2. 目录结构

```
src/views/bems-web/energy-management/
├── metering/              # 能源计量
├── centralized-water/     # 集中水冷
├── centralized-air/       # 集中风冷
├── branch-air/            # 分管风冷
├── cold-source/           # 冷源总览
├── load-forecast/         # 负荷预测与优化决策
├── setpoint-control/      # 设定值下发控制台
└── schedule-energy/       # 场馆日程与能源对应
```

每个子模块目录下需创建 `index.vue` 作为页面入口组件。

---

## 3. 路由配置

路由定义文件：`src/router/routes/modules/bems-web.ts`

在"节能低碳"模块之后新增"能源管理"一级菜单，配置如下：

| 子模块 | 路由路径 | 路由名称 | 页面标题 | 组件路径 |
|--------|----------|----------|----------|----------|
| 能源计量 | `/fwbz/energy-management/metering` | `BemsWebEnergyManagementMetering` | 能源计量 | `/@/views/bems-web/energy-management/metering/index.vue` |
| 集中水冷 | `/fwbz/energy-management/centralized-water` | `BemsWebEnergyManagementCentralizedWater` | 集中水冷 | `/@/views/bems-web/energy-management/centralized-water/index.vue` |
| 集中风冷 | `/fwbz/energy-management/centralized-air` | `BemsWebEnergyManagementCentralizedAir` | 集中风冷 | `/@/views/bems-web/energy-management/centralized-air/index.vue` |
| 分管风冷 | `/fwbz/energy-management/branch-air` | `BemsWebEnergyManagementBranchAir` | 分管风冷 | `/@/views/bems-web/energy-management/branch-air/index.vue` |
| 冷源总览 | `/fwbz/energy-management/cold-source` | `BemsWebEnergyManagementColdSource` | 冷源总览 | `/@/views/bems-web/energy-management/cold-source/index.vue` |
| 负荷预测与优化决策 | `/fwbz/energy-management/load-forecast` | `BemsWebEnergyManagementLoadForecast` | 负荷预测与优化决策 | `/@/views/bems-web/energy-management/load-forecast/index.vue` |
| 设定值下发控制台 | `/fwbz/energy-management/setpoint-control` | `BemsWebEnergyManagementSetpointControl` | 设定值下发控制台 | `/@/views/bems-web/energy-management/setpoint-control/index.vue` |
| 场馆日程与能源对应 | `/fwbz/energy-management/schedule-energy` | `BemsWebEnergyManagementScheduleEnergy` | 场馆日程与能源对应 | `/@/views/bems-web/energy-management/schedule-energy/index.vue` |

---

## 4. 各子模块说明

### 4.1 能源计量（metering）

- **功能定位**：对场馆各能源类型（电、水、燃气、冷热量）的计量数据进行统一采集、展示和分析
- **核心内容**：
  - 统计卡片：计量设备总数、今日总用电、今日总用水、数据采集率
  - 能耗趋势图：按日/周/月展示能耗变化趋势
  - 计量设备分布：饼图展示各类型计量设备占比
  - 设备列表：支持按名称、类型搜索，展示设备状态与最近读数

### 4.2 集中水冷（centralized-water）

- **功能定位**：集中水冷系统的实时监控与运行参数展示
- **核心内容**：
  - 统计卡片：系统总功率、当前制冷量、系统能效COP、今日累计用电
  - 系统拓扑图：冷却塔→冷水机组→冷冻水泵→冷却水泵→末端设备
  - 冷水机组运行状态表：各机组负载率、功率、供回水温度
  - 实时参数监测：温度/流量/功率趋势图

### 4.3 集中风冷（centralized-air）

- **功能定位**：集中风冷系统的实时监控与运行参数展示
- **核心内容**：
  - 统计卡片：风冷系统总功率、当前制冷量、风冷系统COP、今日累计用电
  - 风冷机组运行状态表
  - 实时参数监测趋势图
  - 室外温湿度联动展示

### 4.4 分管风冷（branch-air）

- **功能定位**：各分馆（2号馆、3号馆、东会议室等）独立风冷系统的监控
- **核心内容**：
  - 分馆切换Tab
  - 各分馆风冷机组运行状态
  - 分馆能耗对比
  - 实时参数监测

### 4.5 冷源总览（cold-source）

- **功能定位**：集中水冷、集中风冷、分管风冷三大冷源系统的综合总览
- **核心内容**：
  - 冷源系统综合看板
  - 各系统COP对比
  - 冷负荷供需平衡图
  - 系统切换与联动状态

### 4.6 负荷预测与优化决策（load-forecast）

- **功能定位**：基于历史数据与AI算法的冷负荷预测及优化策略推荐
- **核心内容**：
  - 负荷预测曲线（未来24h/48h/7d）
  - 预测准确度评估
  - 优化决策建议（机组启停策略、温度设定优化等）
  - 历史预测对比分析

### 4.7 设定值下发控制台（setpoint-control）

- **功能定位**：冷源系统设定值的手动/自动下发与控制
- **核心内容**：
  - 设定值编辑面板（冷冻供水温度、冷却供水温度等）
  - 下发状态反馈（待执行/已执行/失败）
  - 控制模式切换（手动/自动/群控策略）
  - 操作日志记录

### 4.8 场馆日程与能源对应（schedule-energy）

- **功能定位**：场馆活动日程与能源消耗的关联展示与分析
- **核心内容**：
  - 场馆活动日程时间轴
  - 日程-能耗关联图
  - 活动期间能耗峰值分析
  - 日程驱动的能源调度建议

---

## 5. 页面风格规范

所有子模块页面须遵循项目统一风格规范：

- **背景**：页面白底（`#f7fafc` 页面背景，卡片 `white`）
- **卡片**：圆角 `12px`，阴影 `0 1px 3px rgba(0,0,0,0.08)`
- **卡片头部**：`padding: 18px 22px`，底部 `1px solid #f0f0f0` 分隔线
- **标题**：`16px / 600 / #2d3748`，带图标
- **统计卡片**：使用项目公共组件 `StatCard`（来自 `/@/views/bems-web/components`）
- **图表**：使用 `useECharts` Hook（来自 `/@/hooks/web/useECharts`）
- **图标**：使用 `@ant-design/icons-vue`
- **样式**：`<style scoped lang="less">`

### 参考页面

- 安防管理：`src/views/bems-web/safety/fire/index.vue`
- AI预测报告：`src/views/bems-web/ai/predict/index.vue`
- 运行保障：`src/views/bems-web/energy/operational-support/index.vue`

---

## 6. 开发指南

### 6.1 新建页面步骤

1. 在对应子模块目录下创建 `index.vue`
2. 使用 `defineOptions({ name: 'EnergyManagementXxxPage' })` 定义组件名
3. 按上述风格规范编写模板和样式
4. 路由已在 `bems-web.ts` 中配置完成，组件路径须与路由中 `component` 字段一致

### 6.2 公共组件引用

```ts
// 统计卡片组件
import { StatCard } from '/@/views/bems-web/components'

// ECharts Hook
import { useECharts } from '/@/hooks/web/useECharts'

// 图标
import { LineChartOutlined, PieChartOutlined, ... } from '@ant-design/icons-vue'
```

### 6.3 接口约定

各子模块的 API 文件建议放在各自目录下的 `index.api.ts` 中，遵循项目现有 `index.api.ts` 模式。

---

## 7. 当前状态

| 子模块 | 目录 | 路由 | 页面文件 | API文件 |
|--------|------|------|----------|--------|
| 能源计量 | ✅ | ✅ | ❌ 待创建 | ❌ 待创建 |
| 集中水冷 | ✅ | ✅ | ❌ 待创建 | ❌ 待创建 |
| 集中风冷 | ✅ | ✅ | ❌ 待创建 | ❌ 待创建 |
| 分管风冷 | ✅ | ✅ | ❌ 待创建 | ❌ 待创建 |
| 冷源总览 | ✅ | ✅ | ❌ 待创建 | ❌ 待创建 |
| 负荷预测与优化决策 | ✅ | ✅ | ❌ 待创建 | ❌ 待创建 |
| 设定值下发控制台 | ✅ | ✅ | ❌ 待创建 | ❌ 待创建 |
| 场馆日程与能源对应 | ✅ | ✅ | ❌ 待创建 | ❌ 待创建 |

> ✅ 已完成 ｜ ❌ 待完成
