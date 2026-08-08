/**
 * 大屏可视化 - 数据定义
 */

// ===== 类型定义 =====
export interface MetricCard {
  icon: string;
  value: string;
  valueColor: string;
  label: string;
}

export interface MetricRow {
  label: string;
  value: string;
  valueClass: string;
  unit?: string;
}

export interface PanelData {
  key: string;
  accent: string;
  title: string;
  metricCards: MetricCard[];
  metricRows: MetricRow[];
}

export interface KpiData {
  key: string;
  icon: string;
  number: number;
  label: string;
}

export interface TickerItem {
  dotColor: string;
  text: string;
}

export interface MapMarker {
  color: string;
  top: string;
  left: string;
  label: string;
}

export interface MapBox {
  color: string;
  top: string;
  left: string;
  width: string;
  height: string;
}

export interface MapBtn {
  icon: string;
  text: string;
  modalKey: string;
}

// ===== 左侧列面板数据 =====
export const leftPanels: PanelData[] = [
  {
    key: 'resilience',
    accent: '#f87171',
    title: '🛡️ 韧性安全',
    metricCards: [
      { icon: '📋', value: '8', valueColor: '#38bdf8', label: '应急预案' },
      { icon: '✅', value: '95%', valueColor: '#4ade80', label: '巡检完成率' },
    ],
    metricRows: [
      { label: '当前在场人数', value: '1', valueClass: 'red', unit: '人' },
      { label: '在场车辆/总车位', value: '98.2/100', valueClass: 'green', unit: '' },
      { label: '今日巡检完成', value: '142', valueClass: 'blue', unit: '项' },
      { label: '在线摄像头/总数', value: '96/100', valueClass: 'blue', unit: '' },
    ],
  },
  {
    key: 'iot',
    accent: '#38bdf8',
    title: '🔗 物联网',
    metricCards: [
      { icon: '📡', value: '12,580', valueColor: '#38bdf8', label: '接入设备' },
      { icon: '📊', value: '98.5%', valueColor: '#4ade80', label: '接口在线率' },
    ],
    metricRows: [
      { label: '数据采集点', value: '45,680', valueClass: 'blue', unit: '个' },
      { label: '系统对接', value: '2.8', valueClass: 'purple', unit: '个' },
      { label: '今日采集量', value: '2.8', valueClass: 'purple', unit: 'KB' },
      { label: '数据完整率', value: '2.8', valueClass: 'purple', unit: '' },
    ],
  },
  {
    key: 'alarm',
    accent: '#fb923c',
    title: '⚠️ 故障告警',
    metricCards: [
      { icon: '🔔', value: '23', valueColor: '#f87171', label: '今日告警' },
      { icon: '⏱️', value: '3.2', valueColor: '#fb923c', label: '响应分钟' },
    ],
    metricRows: [
      { label: '已处理', value: '18', valueClass: 'green', unit: '条' },
      { label: '待处理', value: '5', valueClass: 'orange', unit: '条' },
      { label: '严重告警', value: '1', valueClass: 'red', unit: '条' },
      { label: '平均处理时长', value: '18', valueClass: 'blue', unit: '分钟' },
    ],
  },
  {
    key: 'ai',
    accent: '#c084fc',
    title: '🤖 AI数据',
    metricCards: [
      { icon: '🧠', value: '18', valueColor: '#c084fc', label: '策略运行' },
      { icon: '🎯', value: '94.5%', valueColor: '#4ade80', label: '预测准确' },
    ],
    metricRows: [
      { label: '异常检测命中', value: '87', valueClass: 'blue', unit: '%' },
      { label: '智能调度', value: '156', valueClass: 'green', unit: '次/日' },
      { label: '模型版本', value: 'v3.2.1', valueClass: 'blue' },
      { label: '训练数据量', value: '12.5', valueClass: 'purple', unit: 'TB' },
    ],
  },
];

// ===== 右侧列面板数据 =====
export const rightPanels: PanelData[] = [
  {
    key: 'energy',
    accent: '#4ade80',
    title: '🌿 节能低碳',
    metricCards: [
      { icon: '⚡', value: '42,156', valueColor: '#38bdf8', label: '用电kWh' },
      { icon: '💧', value: '856', valueColor: '#38bdf8', label: '用水m³' },
    ],
    metricRows: [
      { label: '光伏发电', value: '2,450', valueClass: 'green', unit: 'kW' },
      { label: '累计节能', value: '156,780', valueClass: 'green', unit: 'kWh' },
      { label: '节能收益率', value: '23.5', valueClass: 'green', unit: '%' },
      { label: '碳减排量', value: '89.6', valueClass: 'green', unit: '吨' },
    ],
  },
  {
    key: 'venue',
    accent: '#38bdf8',
    title: '🏢 场馆运营',
    metricCards: [
      { icon: '👥', value: '86', valueColor: '#38bdf8', label: '当前在场' },
      { icon: '🔢', value: '45', valueColor: '#4ade80', label: '今日活动数' },
    ],
    metricRows: [
      { label: '今日总客流', value: '320', valueClass: 'blue', unit: '人次' },
      { label: '待筹备活动', value: '4', valueClass: 'green', unit: '' },
      { label: '峰值客流', value: '1,245', valueClass: 'blue', unit: '' },
      { label: '本月活动数', value: '72', valueClass: 'orange', unit: '%' },
    ],
  },
  {
    key: 'exhibition',
    accent: '#facc15',
    title: '🎯 会展服务',
    metricCards: [
      { icon: '👥', value: '12,580', valueColor: '#38bdf8', label: '今日客流' },
      { icon: '🚗', value: '67%', valueColor: '#fb923c', label: '车位使用' },
    ],
    metricRows: [
      { label: '当前在馆', value: '3,420', valueClass: 'orange', unit: '人次' },
      { label: '峰值时段', value: '10:00-12:00', valueClass: 'purple' },
      { label: '剩余车位', value: '820', valueClass: 'green', unit: '个' },
      { label: 'A馆占用', value: '85', valueClass: 'blue', unit: '%' },
    ],
  },
  {
    key: 'security',
    accent: '#f87171',
    title: '🔒 安全防范',
    metricCards: [
      { icon: '📹', value: '1,680', valueColor: '#38bdf8', label: '监控点位' },
      { icon: '🧯', value: '2,340', valueColor: '#4ade80', label: '消防设备' },
    ],
    metricRows: [
      { label: '今日告警', value: '5', valueClass: 'red', unit: '条' },
      { label: '门禁通行', value: '8,560', valueClass: 'blue', unit: '人次' },
      { label: '门禁设备总数', value: '0.35', valueClass: 'green', unit: '个' },
      { label: '门禁点位总数', value: '1,558', valueClass: 'green', unit: '/1,560' },
    ],
  },
];

// ===== KPI 数据 =====
export const kpiData: KpiData[] = [
  { key: 'kpiPower', icon: '⚡', number: 42156, label: '今日用电量 kWh' },
  { key: 'kpiPeople', icon: '👥', number: 12580, label: '今日客流 人次' },
  { key: 'kpiSave', icon: '🌿', number: 156780, label: '累计节能 kWh' },
  { key: 'kpiCarbon', icon: '🌍', number: 89.6, label: '碳减排 吨CO₂' },
];

// ===== 跑马灯数据 =====
export const tickerData: TickerItem[] = [
  { dotColor: 'green', text: '安全防范：监控 1,680点在线 | 消防 2,340台正常 | 烟感 1,558/1,560' },
  { dotColor: 'green', text: '节能低碳：AI策略 18个运行 | 预计节能 15.8% | 光伏 2,450kW' },
  { dotColor: 'green', text: '物联网：设备 12,580台 | 在线率 98.5% | 采集 45,680点' },
  { dotColor: 'orange', text: '故障告警：今日 23条 | 已处理 18条 | 待处理 5条 | 严重 1条' },
  { dotColor: 'green', text: '场馆运营：空调 86台 | 新风 45台 | 照明 1,245路 | 负荷 72%' },
  { dotColor: 'green', text: '会展服务：在馆 3,420人 | 车位使用 67% | 剩余 820个' },
  { dotColor: 'green', text: 'AI数据：负荷预测 94.5% | 智能调度 156次/日 | 模型 v3.2.1' },
  { dotColor: 'green', text: '韧性安全：应急预案 8项 | 巡检完成 142项 | 完成率 95%' },
];

// ===== 地图标记数据 =====
export const mapMarkers: MapMarker[] = [
  { color: 'blue', top: '25%', left: '30%', label: 'A馆' },
  { color: 'green', top: '35%', left: '55%', label: 'B馆' },
  { color: 'orange', top: '55%', left: '45%', label: 'C馆' },
  { color: 'blue', top: '15%', left: '60%', label: '会议中心' },
  { color: 'purple', top: '70%', left: '20%', label: '停车场' },
  { color: 'red', top: '42%', left: '70%', label: '消防中控' },
];

export const mapBoxes: MapBox[] = [
  { color: 'red', top: '18%', left: '24%', width: '18%', height: '22%' },
  { color: 'blue', top: '28%', left: '48%', width: '15%', height: '18%' },
  { color: 'orange', top: '48%', left: '38%', width: '16%', height: '20%' },
];

export const mapBtns: MapBtn[] = [
  { icon: '👥', text: '客流', modalKey: 'mapPeople' },
  { icon: '🔒', text: '安防', modalKey: 'mapSecurity' },
  { icon: '💡', text: '照明', modalKey: 'mapLighting' },
];

// ===== 地图 iframe 地址 =====
export const mapIframeSrc =
  'http://39.103.216.15:3000/preview/viewer/viewer.html?token=5751e096467f0f8e3f4e6ded210cd953&bdid=B000A11DMD&lon=116.15879098007387&lat=39.91596283494254&floorId=DX0003640110100001&version=v3';
