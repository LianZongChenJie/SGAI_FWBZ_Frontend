/**
 * 大屏可视化 - 弹窗详情结构化数据
 * 用于配合 a-modal / a-table / a-progress 等组件渲染
 */

// ===== 类型定义 =====
export interface ModalStat {
  value: string;
  color: string;
  label: string;
}

export interface ModalTableCol {
  title: string;
  key: string;
  width?: number;
}

export interface ModalTableData {
  title: string;
  columns: ModalTableCol[];
  rows: Record<string, any>[];
}

export interface ModalBarItem {
  label: string;
  color: string; // blue/green/orange/purple/red
  percent: number;
  value: string;
}

export interface ModalBarData {
  title: string;
  items: ModalBarItem[];
  footer?: string;
}

export interface TrendBar {
  height: number;
  color: string;
  /** x轴标签 */
  label?: string;
  /** 柱上数值 */
  value?: number;
}

export interface TrendSeriesItem {
  name: string;
  color: string;
  values: number[];
}

export interface ModalTrend {
  title: string;
  bars: TrendBar[];
  footer: string;
  /** 多系列模式：x轴标签 */
  xAxis?: string[];
  /** 多系列模式：各系列数据 */
  series?: TrendSeriesItem[];
}

export interface ModalPanel {
  type: 'table' | 'bar';
  data: ModalTableData | ModalBarData;
}

export interface ModalContent {
  title: string;
  accent: string;
  stats: ModalStat[];
  leftPanel: ModalPanel;
  rightPanel: ModalPanel;
  trend?: ModalTrend;
  extraTable?: ModalTableData;
}

// ===== 弹窗数据 =====
export const modalData: Record<string, ModalContent> = {
  resilience: {
    title: '🛡️ 韧性安全详情',
    accent: '#f87171',
    stats: [
      { value: '8', color: '#38bdf8', label: '应急预案' },
      { value: '142', color: '#4ade80', label: '巡检完成' },
      { value: '8', color: '#fb923c', label: '待巡检' },
      { value: '95%', color: '#4ade80', label: '完成率' },
    ],
    leftPanel: {
      type: 'table',
      data: {
        title: '📋 应急预案状态',
        columns: [
          { title: '预案名称', key: 'name' },
          { title: '类型', key: 'type', width: 90 },
          { title: '状态', key: 'status', width: 70 },
          { title: '最后演练', key: 'date', width: 110 },
        ],
        rows: [
          { name: '火灾应急疏散', type: '消防', status: { text: '正常', color: '#4ade80' }, date: '2026-05-20' },
          { name: '防汛应急预案', type: '自然灾害', status: { text: '正常', color: '#4ade80' }, date: '2026-04-15' },
          { name: '停电应急响应', type: '设备故障', status: { text: '正常', color: '#4ade80' }, date: '2026-05-10' },
          { name: '反恐防暴预案', type: '安防', status: { text: '正常', color: '#4ade80' }, date: '2026-03-28' },
          { name: '疫情防控预案', type: '公共卫生', status: { text: '正常', color: '#4ade80' }, date: '2026-02-20' },
          { name: '电梯困人救援', type: '设备故障', status: { text: '正常', color: '#4ade80' }, date: '2026-05-25' },
        ],
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '🔧 设施巡检状态',
        columns: [
          { title: '设施类型', key: 'name' },
          { title: '总数', key: 'total', width: 60 },
          { title: '已检', key: 'done', width: 60 },
          { title: '待检', key: 'pending', width: 60 },
          { title: '异常', key: 'abnormal', width: 60 },
        ],
        rows: [
          { name: '配电设施', total: 45, done: 42, pending: 3, abnormal: { text: '0', color: '#4ade80' } },
          { name: '给排水系统', total: 32, done: 30, pending: 2, abnormal: { text: '0', color: '#4ade80' } },
          { name: '电梯设备', total: 18, done: 18, pending: 0, abnormal: { text: '0', color: '#4ade80' } },
          { name: '结构安全', total: 12, done: 11, pending: 1, abnormal: { text: '0', color: '#4ade80' } },
          { name: '防雷接地', total: 8, done: 8, pending: 0, abnormal: { text: '0', color: '#4ade80' } },
          { name: '应急物资', total: 25, done: 24, pending: 1, abnormal: { text: '1', color: '#fb923c' } },
        ],
      },
    },
    trend: {
      title: '📈 近7日巡检完成趋势',
      bars: [
        { height: 90, color: '#f87171' }, { height: 92, color: '#f87171' }, { height: 88, color: '#f87171' },
        { height: 95, color: '#f87171' }, { height: 93, color: '#f87171' }, { height: 96, color: '#f87171' }, { height: 94, color: '#f87171' },
      ],
      footer: '巡检完成率: 90% → 95% | 本周累计完成 142 项',
    },
  },

  iot: {
    title: '🔗 物联网详情',
    accent: '#38bdf8',
    stats: [
      { value: '12,580', color: '#38bdf8', label: '接入设备' },
      { value: '98.5%', color: '#4ade80', label: '在线率' },
      { value: '45,680', color: '#c084fc', label: '采集点' },
      { value: '2.8GB', color: '#fb923c', label: '今日数据' },
    ],
    leftPanel: {
      type: 'bar',
      data: {
        title: '📡 设备类型分布',
        items: [
          { label: '传感器', color: 'blue', percent: 42, value: '5,284' },
          { label: '控制器', color: 'green', percent: 28, value: '3,522' },
          { label: '执行器', color: 'orange', percent: 18, value: '2,264' },
          { label: '网关', color: 'purple', percent: 8, value: '1,006' },
          { label: '其他', color: 'red', percent: 4, value: '504' },
        ],
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '📊 协议覆盖情况',
        columns: [
          { title: '协议', key: 'name' },
          { title: '设备数', key: 'count', width: 80 },
          { title: '占比', key: 'ratio', width: 70 },
          { title: '状态', key: 'status', width: 70 },
        ],
        rows: [
          { name: 'Modbus RTU', count: '4,560', ratio: '36.2%', status: { text: '正常', color: '#4ade80' } },
          { name: 'BACnet/IP', count: '3,280', ratio: '26.1%', status: { text: '正常', color: '#4ade80' } },
          { name: 'OPC UA', count: '2,150', ratio: '17.1%', status: { text: '正常', color: '#4ade80' } },
          { name: 'MQTT', count: '1,680', ratio: '13.4%', status: { text: '正常', color: '#4ade80' } },
          { name: 'HTTP/REST', count: '890', ratio: '7.1%', status: { text: '正常', color: '#4ade80' } },
          { name: '其他', count: '20', ratio: '0.1%', status: { text: '正常', color: '#4ade80' } },
        ],
      },
    },
    trend: {
      title: '📈 近7日数据采集趋势',
      bars: [
        { height: 60, color: '#38bdf8' }, { height: 75, color: '#38bdf8' }, { height: 55, color: '#38bdf8' },
        { height: 80, color: '#38bdf8' }, { height: 70, color: '#38bdf8' }, { height: 85, color: '#38bdf8' }, { height: 90, color: '#38bdf8' },
      ],
      footer: '数据量: 2.1GB → 2.8GB | 峰值: 3.2GB (6月5日)',
    },
  },

  alarm: {
    title: '⚠️ 故障告警详情',
    accent: '#fb923c',
    stats: [
      { value: '23', color: '#f87171', label: '今日告警' },
      { value: '18', color: '#4ade80', label: '已处理' },
      { value: '5', color: '#fb923c', label: '待处理' },
      { value: '1', color: '#f87171', label: '严重告警' },
    ],
    leftPanel: {
      type: 'bar',
      data: {
        title: '📋 告警类型分布',
        items: [
          { label: '设备故障', color: 'orange', percent: 45, value: '10条' },
          { label: '能耗异常', color: 'blue', percent: 30, value: '7条' },
          { label: '安防告警', color: 'red', percent: 25, value: '6条' },
        ],
        footer: '平均响应时间: 3.2分钟 | 平均处理时间: 18分钟',
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '🔔 待处理告警',
        columns: [
          { title: '时间', key: 'time', width: 60 },
          { title: '类型', key: 'type' },
          { title: '位置', key: 'location' },
          { title: '等级', key: 'level', width: 90 },
        ],
        rows: [
          { time: '14:05', type: '应急照明故障', location: 'C馆走廊', level: { text: '一般', color: '#fb923c' } },
          { time: '16:30', type: '消防水压偏低', location: '水泵房', level: { text: '严重', color: '#f87171' } },
          { time: '11:42', type: '监控离线', location: '停车场C区', level: { text: '低', color: '#94a3b8' } },
          { time: '09:20', type: '空调温度异常', location: 'A馆F3', level: { text: '一般', color: '#fb923c' } },
          { time: '13:10', type: '能耗突增', location: 'B馆配电室', level: { text: '一般', color: '#fb923c' } },
        ],
      },
    },
    trend: {
      title: '📈 近7日告警趋势',
      bars: [
        { height: 30, color: '#fb923c' }, { height: 45, color: '#fb923c' }, { height: 25, color: '#fb923c' },
        { height: 60, color: '#fb923c' }, { height: 35, color: '#fb923c' }, { height: 50, color: '#fb923c' }, { height: 23, color: '#fb923c' },
      ],
      footer: '周一:12 → 周二:18 → 周三:10 → 周四:24 → 周五:14 → 周六:20 → 周日:23',
    },
  },

  ai: {
    title: '🤖 AI数据详情',
    accent: '#c084fc',
    stats: [
      { value: '18', color: '#c084fc', label: '策略运行' },
      { value: '94.5%', color: '#4ade80', label: '预测准确率' },
      { value: '87%', color: '#38bdf8', label: '异常检测命中' },
      { value: '156', color: '#fb923c', label: '调度次数/日' },
    ],
    leftPanel: {
      type: 'table',
      data: {
        title: '🧠 AI策略列表',
        columns: [
          { title: '策略名称', key: 'name' },
          { title: '类型', key: 'type', width: 70 },
          { title: '状态', key: 'status', width: 70 },
          { title: '效果', key: 'effect', width: 90 },
        ],
        rows: [
          { name: '空调冷机群控优化', type: '节能', status: { text: '运行中', color: '#4ade80' }, effect: '节能15%' },
          { name: '照明按需调光', type: '节能', status: { text: '运行中', color: '#4ade80' }, effect: '节能20%' },
          { name: '新风量自适应', type: '节能', status: { text: '运行中', color: '#4ade80' }, effect: '节能12%' },
          { name: '负荷预测调度', type: '预测', status: { text: '运行中', color: '#4ade80' }, effect: '准确率94%' },
          { name: '异常用电检测', type: '检测', status: { text: '运行中', color: '#4ade80' }, effect: '命中87%' },
          { name: '设备故障预警', type: '预警', status: { text: '运行中', color: '#4ade80' }, effect: '命中91%' },
        ],
      },
    },
    rightPanel: {
      type: 'bar',
      data: {
        title: '📊 模型性能指标',
        items: [
          { label: '负荷预测', color: 'purple', percent: 94.5, value: '94.5%' },
          { label: '异常检测', color: 'purple', percent: 87, value: '87%' },
          { label: '节能优化', color: 'green', percent: 92, value: '92%' },
          { label: '故障预警', color: 'blue', percent: 91, value: '91%' },
          { label: '客流预测', color: 'orange', percent: 88, value: '88%' },
        ],
        footer: '模型版本: v3.2.1 | 训练数据: 12.5TB | 最后更新: 2026-06-08',
      },
    },
    trend: {
      title: '📈 AI节能效果趋势',
      bars: [
        { height: 70, color: '#c084fc' }, { height: 75, color: '#c084fc' }, { height: 80, color: '#c084fc' },
        { height: 85, color: '#c084fc' }, { height: 90, color: '#c084fc' }, { height: 92, color: '#c084fc' }, { height: 94, color: '#c084fc' },
      ],
      footer: '近7日AI节能效果: 12.3% → 15.8% | 累计节能量: 156,780 kWh',
    },
  },

  energy: {
    title: '🌿 节能低碳详情',
    accent: '#4ade80',
    stats: [
      { value: '42,156', color: '#38bdf8', label: '今日用电kWh' },
      { value: '856', color: '#38bdf8', label: '今日用水m³' },
      { value: '156,780', color: '#4ade80', label: '累计节能kWh' },
      { value: '89.6', color: '#4ade80', label: '碳减排吨' },
    ],
    leftPanel: {
      type: 'bar',
      data: {
        title: '⚡ 用能结构分析',
        items: [
          { label: '空调', color: 'blue', percent: 45, value: '45%' },
          { label: '照明', color: 'green', percent: 25, value: '25%' },
          { label: '动力', color: 'orange', percent: 18, value: '18%' },
          { label: '其他', color: 'purple', percent: 12, value: '12%' },
        ],
        footer: '光伏发电: 2,450kW | 节能收益率: 23.5% | AI策略: 18个运行',
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '📊 各场馆能耗对比',
        columns: [
          { title: '场馆', key: 'name', width: 90 },
          { title: '用电kWh', key: 'power', width: 100 },
          { title: '用水m³', key: 'water', width: 80 },
          { title: '环比', key: 'trend', width: 80 },
        ],
        rows: [
          { name: 'A馆', power: '15,680', water: '320', trend: { text: '↓5.2%', color: '#4ade80' } },
          { name: 'B馆', power: '12,450', water: '245', trend: { text: '↓3.8%', color: '#4ade80' } },
          { name: 'C馆', power: '8,920', water: '186', trend: { text: '↑1.2%', color: '#f87171' } },
          { name: '会议中心', power: '3,200', water: '78', trend: { text: '↓8.5%', color: '#4ade80' } },
          { name: '公共区域', power: '1,906', water: '27', trend: { text: '↓2.1%', color: '#4ade80' } },
        ],
      },
    },
    trend: {
      title: '📈 近7日能耗趋势',
      bars: [
        { height: 75, color: '#4ade80' }, { height: 80, color: '#4ade80' }, { height: 70, color: '#4ade80' },
        { height: 85, color: '#4ade80' }, { height: 78, color: '#4ade80' }, { height: 82, color: '#4ade80' }, { height: 76, color: '#4ade80' },
      ],
      footer: '日均用电: 38,500kWh → 42,156kWh | 本周累计节能: 8,560kWh',
    },
  },

  venue: {
    title: '🏢 场馆运营详情',
    accent: '#38bdf8',
    stats: [
      { value: '86', color: '#38bdf8', label: '空调机组' },
      { value: '45', color: '#4ade80', label: '新风机组' },
      { value: '320', color: '#38bdf8', label: '配电回路' },
      { value: '72%', color: '#fb923c', label: '系统负荷' },
    ],
    leftPanel: {
      type: 'table',
      data: {
        title: '⚙️ 系统运行状态',
        columns: [
          { title: '系统', key: 'name' },
          { title: '运行数', key: 'running', width: 70 },
          { title: '总数', key: 'total', width: 70 },
          { title: '负荷', key: 'load', width: 60 },
          { title: '状态', key: 'status', width: 70 },
        ],
        rows: [
          { name: '空调机组', running: '86台', total: '92台', load: '78%', status: { text: '正常', color: '#4ade80' } },
          { name: '新风机组', running: '45台', total: '48台', load: '65%', status: { text: '正常', color: '#4ade80' } },
          { name: '配电回路', running: '320路', total: '320路', load: '72%', status: { text: '正常', color: '#4ade80' } },
          { name: '冷源系统', running: '4套', total: '4套', load: '85%', status: { text: '正常', color: '#4ade80' } },
          { name: '照明回路', running: '1,245路', total: '2,340路', load: '53%', status: { text: '节能', color: '#fb923c' } },
          { name: '光伏系统', running: '12组', total: '12组', load: '92%', status: { text: '正常', color: '#4ade80' } },
        ],
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '🌡️ 环境参数',
        columns: [
          { title: '区域', key: 'name' },
          { title: '温度', key: 'temp', width: 70 },
          { title: '湿度', key: 'humidity', width: 60 },
          { title: 'CO₂', key: 'co2', width: 70 },
          { title: 'PM2.5', key: 'pm25', width: 60 },
        ],
        rows: [
          { name: 'A馆大厅', temp: '24.5°C', humidity: '55%', co2: '420ppm', pm25: '12μg' },
          { name: 'B馆展厅', temp: '23.8°C', humidity: '52%', co2: '380ppm', pm25: '15μg' },
          { name: 'C馆会议', temp: '25.2°C', humidity: '58%', co2: '450ppm', pm25: '10μg' },
          { name: '会议中心', temp: '24.0°C', humidity: '50%', co2: '360ppm', pm25: '8μg' },
          { name: '公共区域', temp: '26.0°C', humidity: '60%', co2: '500ppm', pm25: '18μg' },
        ],
      },
    },
    trend: {
      title: '📈 今日系统负荷趋势',
      bars: [
        { height: 50, color: '#38bdf8' }, { height: 65, color: '#38bdf8' }, { height: 80, color: '#38bdf8' },
        { height: 75, color: '#38bdf8' }, { height: 90, color: '#38bdf8' }, { height: 85, color: '#38bdf8' }, { height: 72, color: '#38bdf8' },
      ],
      footer: '负荷峰值: 90% (14:00) | 当前负荷: 72% | 预计晚间降至 45%',
    },
  },

  exhibition: {
    title: '🎯 会展服务详情',
    accent: '#facc15',
    stats: [
      { value: '12,580', color: '#38bdf8', label: '今日客流' },
      { value: '3,420', color: '#fb923c', label: '当前在馆' },
      { value: '820', color: '#4ade80', label: '剩余车位' },
      { value: '67%', color: '#facc15', label: '车位使用' },
    ],
    leftPanel: {
      type: 'bar',
      data: {
        title: '👥 各场馆客流分布',
        items: [
          { label: 'A馆', color: 'blue', percent: 85, value: '5,420人' },
          { label: 'B馆', color: 'green', percent: 62, value: '3,980人' },
          { label: 'C馆', color: 'orange', percent: 48, value: '3,080人' },
          { label: '会议中心', color: 'purple', percent: 35, value: '1,100人' },
        ],
        footer: '峰值时段: 10:00-12:00 | 预计今日总客流: 15,000人',
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '🚗 停车场状态',
        columns: [
          { title: '区域', key: 'name' },
          { title: '总数', key: 'total', width: 60 },
          { title: '已用', key: 'used', width: 60 },
          { title: '剩余', key: 'remain', width: 60 },
          { title: '使用率', key: 'rate', width: 70 },
        ],
        rows: [
          { name: 'A区地面', total: '800', used: '620', remain: '180', rate: { text: '78%', color: '#fb923c' } },
          { name: 'B区地下', total: '900', used: '540', remain: '360', rate: { text: '60%', color: '#4ade80' } },
          { name: 'C区地面', total: '500', used: '320', remain: '180', rate: { text: '64%', color: '#fb923c' } },
          { name: '会议中心', total: '300', used: '200', remain: '100', rate: { text: '67%', color: '#fb923c' } },
        ],
      },
    },
    trend: {
      title: '📈 今日客流趋势',
      bars: [
        { height: 30, color: '#facc15' }, { height: 50, color: '#facc15' }, { height: 80, color: '#facc15' },
        { height: 95, color: '#facc15' }, { height: 85, color: '#facc15' }, { height: 70, color: '#facc15' }, { height: 55, color: '#facc15' },
      ],
      footer: '08:00:1,200 → 10:00:4,500 → 12:00:6,800 → 14:00:5,200 → 16:00:3,800',
    },
  },

  security: {
    title: '🔒 安全防范详情',
    accent: '#f87171',
    stats: [
      { value: '1,680', color: '#38bdf8', label: '监控点位' },
      { value: '2,340', color: '#4ade80', label: '消防设备' },
      { value: '5', color: '#f87171', label: '今日告警' },
      { value: '95%', color: '#4ade80', label: '巡检完成率' },
    ],
    leftPanel: {
      type: 'table',
      data: {
        title: '📹 监控点位分布',
        columns: [
          { title: '区域', key: 'name', width: 90 },
          { title: '点位数', key: 'count', width: 70 },
          { title: '在线率', key: 'rate', width: 70 },
          { title: '状态', key: 'status' },
        ],
        rows: [
          { name: 'A馆', count: '420', rate: '100%', status: { text: '正常', color: '#4ade80' } },
          { name: 'B馆', count: '380', rate: '99.2%', status: { text: '正常', color: '#4ade80' } },
          { name: 'C馆', count: '360', rate: '100%', status: { text: '正常', color: '#4ade80' } },
          { name: '会议中心', count: '280', rate: '98.5%', status: { text: '正常', color: '#4ade80' } },
          { name: '停车场', count: '120', rate: '100%', status: { text: '正常', color: '#4ade80' } },
          { name: '公共区域', count: '120', rate: '97.8%', status: { text: '1路离线', color: '#fb923c' } },
        ],
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '🧯 消防设备状态',
        columns: [
          { title: '设备类型', key: 'name' },
          { title: '数量', key: 'count', width: 80 },
          { title: '正常', key: 'normal', width: 80 },
          { title: '异常', key: 'abnormal', width: 80 },
        ],
        rows: [
          { name: '烟感探测器', count: '1,560', normal: '1,558', abnormal: { text: '2', color: '#f87171' } },
          { name: '手动报警按钮', count: '280', normal: '280', abnormal: { text: '0', color: '#4ade80' } },
          { name: '消防栓', count: '180', normal: '180', abnormal: { text: '0', color: '#4ade80' } },
          { name: '喷淋系统', count: '120', normal: '120', abnormal: { text: '0', color: '#4ade80' } },
          { name: '应急照明', count: '200', normal: '198', abnormal: { text: '2', color: '#f87171' } },
        ],
      },
    },
    extraTable: {
      title: '📋 今日安全事件',
      columns: [
        { title: '时间', key: 'time', width: 60 },
        { title: '事件类型', key: 'type' },
        { title: '位置', key: 'location' },
        { title: '等级', key: 'level', width: 70 },
        { title: '状态', key: 'status', width: 70 },
      ],
      rows: [
        { time: '08:23', type: '门禁异常开启', location: 'A馆F2', level: { text: '一般', color: '#fb923c' }, status: { text: '已处理', color: '#4ade80' } },
        { time: '10:15', type: '烟感误报', location: 'B馆F1', level: { text: '一般', color: '#fb923c' }, status: { text: '已处理', color: '#4ade80' } },
        { time: '11:42', type: '监控离线', location: '停车场C区', level: { text: '低', color: '#94a3b8' }, status: { text: '处理中', color: '#fb923c' } },
        { time: '14:05', type: '应急照明故障', location: 'C馆走廊', level: { text: '一般', color: '#fb923c' }, status: { text: '处理中', color: '#fb923c' } },
        { time: '16:30', type: '消防水压偏低', location: '水泵房', level: { text: '严重', color: '#f87171' }, status: { text: '处理中', color: '#fb923c' } },
      ],
    },
  },

  kpiPower: {
    title: '⚡ 今日用电量详情',
    accent: '#38bdf8',
    stats: [
      { value: '42,156', color: '#38bdf8', label: '今日用电kWh' },
      { value: '↓6.8%', color: '#4ade80', label: '环比昨日' },
      { value: '3,520', color: '#fb923c', label: '峰值kW' },
      { value: '1,245', color: '#c084fc', label: '平均kW' },
    ],
    leftPanel: {
      type: 'table',
      data: {
        title: '📊 各时段用电分布',
        columns: [
          { title: '时段', key: 'time' },
          { title: '用电量kWh', key: 'power', width: 110 },
          { title: '占比', key: 'ratio', width: 70 },
          { title: '环比', key: 'trend', width: 70 },
        ],
        rows: [
          { time: '00:00-06:00', power: '2,450', ratio: '5.8%', trend: { text: '↓12%', color: '#4ade80' } },
          { time: '06:00-09:00', power: '5,680', ratio: '13.5%', trend: { text: '↑8%', color: '#f87171' } },
          { time: '09:00-12:00', power: '12,340', ratio: '29.3%', trend: { text: '↑5%', color: '#f87171' } },
          { time: '12:00-14:00', power: '8,920', ratio: '21.2%', trend: { text: '↓3%', color: '#4ade80' } },
          { time: '14:00-18:00', power: '9,560', ratio: '22.7%', trend: { text: '↓2%', color: '#4ade80' } },
          { time: '18:00-24:00', power: '3,206', ratio: '7.5%', trend: { text: '↓15%', color: '#4ade80' } },
        ],
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '🏢 各场馆用电对比',
        columns: [
          { title: '场馆', key: 'name', width: 90 },
          { title: '用电kWh', key: 'power', width: 100 },
          { title: '占比', key: 'ratio', width: 70 },
          { title: '环比', key: 'trend', width: 70 },
        ],
        rows: [
          { name: 'A馆', power: '15,680', ratio: '37.2%', trend: { text: '↓5.2%', color: '#4ade80' } },
          { name: 'B馆', power: '12,450', ratio: '29.5%', trend: { text: '↓3.8%', color: '#4ade80' } },
          { name: 'C馆', power: '8,920', ratio: '21.2%', trend: { text: '↑1.2%', color: '#f87171' } },
          { name: '会议中心', power: '3,200', ratio: '7.6%', trend: { text: '↓8.5%', color: '#4ade80' } },
          { name: '公共区域', power: '1,906', ratio: '4.5%', trend: { text: '↓2.1%', color: '#4ade80' } },
        ],
      },
    },
    trend: {
      title: '📈 近7日用电趋势',
      bars: [
        { height: 75, color: '#38bdf8' }, { height: 80, color: '#38bdf8' }, { height: 70, color: '#38bdf8' },
        { height: 85, color: '#38bdf8' }, { height: 78, color: '#38bdf8' }, { height: 82, color: '#38bdf8' }, { height: 76, color: '#38bdf8' },
      ],
      footer: '日均: 38,500 → 42,156 kWh | 本周累计: 285,600 kWh',
    },
  },

  kpiPeople: {
    title: '👥 今日客流详情',
    accent: '#4ade80',
    stats: [
      { value: '12,580', color: '#38bdf8', label: '今日客流' },
      { value: '3,420', color: '#fb923c', label: '当前在馆' },
      { value: '↑15%', color: '#4ade80', label: '环比昨日' },
      { value: '6,800', color: '#c084fc', label: '峰值人数' },
    ],
    leftPanel: {
      type: 'table',
      data: {
        title: '📊 各时段客流分布',
        columns: [
          { title: '时段', key: 'time' },
          { title: '入场', key: 'in', width: 70 },
          { title: '离场', key: 'out', width: 70 },
          { title: '净增', key: 'net', width: 80 },
        ],
        rows: [
          { time: '08:00-09:00', in: '2,340', out: '120', net: { text: '+2,220', color: '#4ade80' } },
          { time: '09:00-10:00', in: '1,560', out: '280', net: { text: '+1,280', color: '#4ade80' } },
          { time: '10:00-12:00', in: '2,800', out: '450', net: { text: '+2,350', color: '#4ade80' } },
          { time: '12:00-14:00', in: '1,200', out: '1,680', net: { text: '-480', color: '#f87171' } },
          { time: '14:00-16:00', in: '1,680', out: '1,200', net: { text: '+480', color: '#4ade80' } },
          { time: '16:00-18:00', in: '890', out: '2,340', net: { text: '-1,450', color: '#f87171' } },
        ],
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '🏢 各场馆客流分布',
        columns: [
          { title: '场馆', key: 'name', width: 90 },
          { title: '客流', key: 'count', width: 80 },
          { title: '占比', key: 'ratio', width: 70 },
          { title: '峰值时段', key: 'peak' },
        ],
        rows: [
          { name: 'A馆', count: '5,420', ratio: '43.1%', peak: '10:00-12:00' },
          { name: 'B馆', count: '3,980', ratio: '31.6%', peak: '10:00-12:00' },
          { name: 'C馆', count: '2,080', ratio: '16.5%', peak: '14:00-16:00' },
          { name: '会议中心', count: '1,100', ratio: '8.8%', peak: '09:00-11:00' },
        ],
      },
    },
    trend: {
      title: '📈 近7日客流趋势',
      bars: [
        { height: 60, color: '#4ade80' }, { height: 72, color: '#4ade80' }, { height: 68, color: '#4ade80' },
        { height: 85, color: '#4ade80' }, { height: 90, color: '#4ade80' }, { height: 95, color: '#4ade80' }, { height: 88, color: '#4ade80' },
      ],
      footer: '日均: 9,800 → 12,580 人次 | 本周累计: 78,600 人次',
    },
  },

  kpiSave: {
    title: '🌿 累计节能详情',
    accent: '#fb923c',
    stats: [
      { value: '156,780', color: '#fb923c', label: '累计节能kWh' },
      { value: '23.5%', color: '#4ade80', label: '节能收益率' },
      { value: '¥18.8万', color: '#38bdf8', label: '节省费用' },
      { value: '18', color: '#c084fc', label: 'AI策略数' },
    ],
    leftPanel: {
      type: 'table',
      data: {
        title: '⚡ 节能措施效果',
        columns: [
          { title: '措施', key: 'name' },
          { title: '节能量kWh', key: 'save', width: 110 },
          { title: '占比', key: 'ratio', width: 70 },
          { title: '效果', key: 'effect', width: 80 },
        ],
        rows: [
          { name: '空调群控优化', save: '58,520', ratio: '37.3%', effect: { text: '节能15%', color: '#4ade80' } },
          { name: '照明按需调光', save: '42,340', ratio: '27.0%', effect: { text: '节能20%', color: '#4ade80' } },
          { name: '新风自适应', save: '28,560', ratio: '18.2%', effect: { text: '节能12%', color: '#4ade80' } },
          { name: '光伏自发自用', save: '18,900', ratio: '12.1%', effect: { text: '替代8%', color: '#4ade80' } },
          { name: '其他优化', save: '8,460', ratio: '5.4%', effect: { text: '节能5%', color: '#4ade80' } },
        ],
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '📊 各场馆节能对比',
        columns: [
          { title: '场馆', key: 'name', width: 90 },
          { title: '基准kWh', key: 'base', width: 90 },
          { title: '实际kWh', key: 'actual', width: 90 },
          { title: '节能率', key: 'rate', width: 80 },
        ],
        rows: [
          { name: 'A馆', base: '18,200', actual: '15,680', rate: { text: '13.8%', color: '#4ade80' } },
          { name: 'B馆', base: '14,500', actual: '12,450', rate: { text: '14.1%', color: '#4ade80' } },
          { name: 'C馆', base: '9,800', actual: '8,920', rate: { text: '9.0%', color: '#4ade80' } },
          { name: '会议中心', base: '3,800', actual: '3,200', rate: { text: '15.8%', color: '#4ade80' } },
        ],
      },
    },
    trend: {
      title: '📈 近12月节能趋势',
      bars: [
        { height: 50, color: '#fb923c' }, { height: 55, color: '#fb923c' }, { height: 60, color: '#fb923c' },
        { height: 65, color: '#fb923c' }, { height: 70, color: '#fb923c' }, { height: 75, color: '#fb923c' },
        { height: 80, color: '#fb923c' }, { height: 85, color: '#fb923c' }, { height: 88, color: '#fb923c' },
        { height: 90, color: '#fb923c' }, { height: 92, color: '#fb923c' }, { height: 95, color: '#fb923c' },
      ],
      footer: '累计节能量: 12万 → 15.7万 kWh | 年度目标: 20万 kWh',
    },
  },

  kpiCarbon: {
    title: '🌍 碳减排详情',
    accent: '#c084fc',
    stats: [
      { value: '89.6', color: '#c084fc', label: '碳减排吨' },
      { value: '↓8.7%', color: '#4ade80', label: '环比上月' },
      { value: '356', color: '#38bdf8', label: '年度累计吨' },
      { value: '1,200', color: '#fb923c', label: '年度目标吨' },
    ],
    leftPanel: {
      type: 'table',
      data: {
        title: '🏭 碳排放结构',
        columns: [
          { title: '排放源', key: 'name' },
          { title: '排放量吨', key: 'amount', width: 90 },
          { title: '占比', key: 'ratio', width: 70 },
          { title: '减排措施', key: 'measure' },
        ],
        rows: [
          { name: '电力消耗', amount: '42.3', ratio: '47.2%', measure: '光伏+AI优化' },
          { name: '空调制冷', amount: '28.6', ratio: '31.9%', measure: '群控优化' },
          { name: '照明用电', amount: '12.4', ratio: '13.8%', measure: 'LED+调光' },
          { name: '交通通勤', amount: '4.8', ratio: '5.4%', measure: '新能源车' },
          { name: '其他', amount: '1.5', ratio: '1.7%', measure: '综合优化' },
        ],
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '📊 双碳指标达成',
        columns: [
          { title: '指标', key: 'name' },
          { title: '当前值', key: 'current', width: 100 },
          { title: '目标值', key: 'target', width: 90 },
          { title: '达成率', key: 'rate', width: 80 },
        ],
        rows: [
          { name: '单位面积碳排', current: '12.5kg/m²', target: '15kg/m²', rate: { text: '116%', color: '#4ade80' } },
          { name: '可再生能源占比', current: '28%', target: '25%', rate: { text: '112%', color: '#4ade80' } },
          { name: '碳排放强度', current: '0.45t/万元', target: '0.50t/万元', rate: { text: '111%', color: '#4ade80' } },
          { name: '绿化覆盖率', current: '42%', target: '40%', rate: { text: '105%', color: '#4ade80' } },
        ],
      },
    },
    trend: {
      title: '📈 近12月碳减排趋势',
      bars: [
        { height: 40, color: '#c084fc' }, { height: 45, color: '#c084fc' }, { height: 50, color: '#c084fc' },
        { height: 55, color: '#c084fc' }, { height: 60, color: '#c084fc' }, { height: 65, color: '#c084fc' },
        { height: 70, color: '#c084fc' }, { height: 75, color: '#c084fc' }, { height: 80, color: '#c084fc' },
        { height: 85, color: '#c084fc' }, { height: 88, color: '#c084fc' }, { height: 90, color: '#c084fc' },
      ],
      footer: '年度累计: 356吨 | 年度目标: 1,200吨 | 达成率: 29.7%',
    },
  },

  mapPeople: {
    title: '👥 园区客流热力图',
    accent: '#4ade80',
    stats: [
      { value: '3,420', color: '#38bdf8', label: '当前在馆' },
      { value: '6,800', color: '#fb923c', label: '今日峰值' },
      { value: '12,580', color: '#4ade80', label: '今日总客流' },
      { value: 'A馆', color: '#c084fc', label: '最热区域' },
    ],
    leftPanel: {
      type: 'table',
      data: {
        title: '🗺️ 各区域实时人数',
        columns: [
          { title: '区域', key: 'name' },
          { title: '当前人数', key: 'count', width: 80 },
          { title: '密度人/千㎡', key: 'density', width: 110 },
          { title: '状态', key: 'status', width: 80 },
        ],
        rows: [
          { name: 'A馆展厅', count: '1,680', density: '420', status: { text: '拥挤', color: '#fb923c' } },
          { name: 'B馆展厅', count: '1,240', density: '310', status: { text: '适中', color: '#4ade80' } },
          { name: 'C馆会议区', count: '380', density: '190', status: { text: '舒适', color: '#4ade80' } },
          { name: '会议中心', count: '520', density: '260', status: { text: '适中', color: '#4ade80' } },
          { name: '餐饮区', count: '280', density: '350', status: { text: '较拥挤', color: '#fb923c' } },
          { name: '停车场', count: '120', density: '15', status: { text: '舒适', color: '#4ade80' } },
        ],
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '📊 客流预警设置',
        columns: [
          { title: '区域', key: 'name' },
          { title: '容量上限', key: 'capacity', width: 80 },
          { title: '预警阈值', key: 'threshold', width: 110 },
          { title: '当前状态', key: 'status', width: 90 },
        ],
        rows: [
          { name: 'A馆展厅', capacity: '2,000', threshold: '1,600 (80%)', status: { text: '预警中', color: '#fb923c' } },
          { name: 'B馆展厅', capacity: '1,800', threshold: '1,440 (80%)', status: { text: '正常', color: '#4ade80' } },
          { name: '会议中心', capacity: '800', threshold: '640 (80%)', status: { text: '正常', color: '#4ade80' } },
          { name: '餐饮区', capacity: '400', threshold: '320 (80%)', status: { text: '正常', color: '#4ade80' } },
        ],
      },
    },
    trend: {
      title: '📈 今日各时段客流分布',
      bars: [
        { height: 25, color: '#4ade80' }, { height: 40, color: '#4ade80' }, { height: 65, color: '#4ade80' },
        { height: 85, color: '#4ade80' }, { height: 100, color: '#4ade80' }, { height: 80, color: '#4ade80' },
        { height: 60, color: '#4ade80' }, { height: 45, color: '#4ade80' },
      ],
      footer: '08:00 1,200 → 10:00 4,500 → 12:00 6,800(峰值) → 14:00 5,200 → 16:00 3,800',
    },
  },

  mapSecurity: {
    title: '🔒 园区安防态势',
    accent: '#f87171',
    stats: [
      { value: '1,680', color: '#38bdf8', label: '监控在线' },
      { value: '0', color: '#4ade80', label: '异常入侵' },
      { value: '5', color: '#fb923c', label: '今日告警' },
      { value: '100%', color: '#4ade80', label: '周界正常' },
    ],
    leftPanel: {
      type: 'table',
      data: {
        title: '📹 监控点位状态',
        columns: [
          { title: '区域', key: 'name', width: 80 },
          { title: '总数', key: 'total', width: 60 },
          { title: '在线', key: 'online', width: 60 },
          { title: '离线', key: 'offline', width: 60 },
          { title: '状态', key: 'status' },
        ],
        rows: [
          { name: 'A馆', total: '420', online: '420', offline: '0', status: { text: '正常', color: '#4ade80' } },
          { name: 'B馆', total: '380', online: '378', offline: '2', status: { text: '2路离线', color: '#fb923c' } },
          { name: 'C馆', total: '360', online: '360', offline: '0', status: { text: '正常', color: '#4ade80' } },
          { name: '周界', total: '120', online: '120', offline: '0', status: { text: '正常', color: '#4ade80' } },
          { name: '停车场', total: '200', online: '198', offline: '2', status: { text: '2路离线', color: '#fb923c' } },
          { name: '公共区域', total: '200', online: '196', offline: '4', status: { text: '4路离线', color: '#fb923c' } },
        ],
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '🚨 安防事件记录',
        columns: [
          { title: '时间', key: 'time', width: 60 },
          { title: '事件', key: 'event' },
          { title: '位置', key: 'location' },
          { title: '等级', key: 'level', width: 60 },
          { title: '处理', key: 'handle', width: 70 },
        ],
        rows: [
          { time: '08:15', event: '人员聚集', location: 'A馆F1入口', level: { text: '一般', color: '#fb923c' }, handle: { text: '已疏导', color: '#4ade80' } },
          { time: '10:30', event: '物品遗留', location: 'B馆休息区', level: { text: '低', color: '#94a3b8' }, handle: { text: '已清理', color: '#4ade80' } },
          { time: '12:45', event: '越界告警', location: '周界西侧', level: { text: '一般', color: '#fb923c' }, handle: { text: '误报', color: '#4ade80' } },
          { time: '14:20', event: '异常徘徊', location: '停车场B区', level: { text: '低', color: '#94a3b8' }, handle: { text: '监控中', color: '#fb923c' } },
          { time: '16:00', event: '消防通道占用', location: 'C馆F2', level: { text: '一般', color: '#fb923c' }, handle: { text: '已处理', color: '#4ade80' } },
        ],
      },
    },
    trend: {
      title: '📈 近7日安防事件趋势',
      bars: [
        { height: 30, color: '#f87171' }, { height: 45, color: '#f87171' }, { height: 25, color: '#f87171' },
        { height: 60, color: '#f87171' }, { height: 35, color: '#f87171' }, { height: 50, color: '#f87171' }, { height: 40, color: '#f87171' },
      ],
      footer: '本周累计: 28起 | 已处理: 26起 | 处理率: 92.9%',
    },
  },

  mapLighting: {
    title: '💡 园区照明管控',
    accent: '#facc15',
    stats: [
      { value: '2,340', color: '#facc15', label: '照明回路' },
      { value: '1,245', color: '#4ade80', label: '当前开启' },
      { value: '53%', color: '#fb923c', label: '开启率' },
      { value: '节能', color: '#38bdf8', label: '模式运行' },
    ],
    leftPanel: {
      type: 'table',
      data: {
        title: '🏢 各区域照明状态',
        columns: [
          { title: '区域', key: 'name' },
          { title: '回路数', key: 'circuits', width: 70 },
          { title: '开启', key: 'on', width: 60 },
          { title: '亮度', key: 'brightness', width: 60 },
          { title: '模式', key: 'mode', width: 70 },
        ],
        rows: [
          { name: 'A馆展厅', circuits: '480', on: '420', brightness: '80%', mode: { text: '展会', color: '#fb923c' } },
          { name: 'B馆展厅', circuits: '420', on: '280', brightness: '60%', mode: { text: '日常', color: '#4ade80' } },
          { name: 'C馆会议', circuits: '360', on: '180', brightness: '50%', mode: { text: '节能', color: '#4ade80' } },
          { name: '走廊通道', circuits: '520', on: '260', brightness: '40%', mode: { text: '节能', color: '#4ade80' } },
          { name: '室外泛光', circuits: '280', on: '0', brightness: '0%', mode: { text: '关闭', color: '#94a3b8' } },
          { name: '应急照明', circuits: '280', on: '105', brightness: '100%', mode: { text: '常开', color: '#4ade80' } },
        ],
      },
    },
    rightPanel: {
      type: 'table',
      data: {
        title: '🎨 场景模式配置',
        columns: [
          { title: '模式', key: 'name' },
          { title: '开启回路', key: 'circuits', width: 80 },
          { title: '平均亮度', key: 'brightness', width: 90 },
          { title: '预计能耗', key: 'power', width: 100 },
        ],
        rows: [
          { name: '展会模式', circuits: '1,680', brightness: '85%', power: '8,500kWh/日' },
          { name: '日常模式', circuits: '1,245', brightness: '65%', power: '5,200kWh/日' },
          { name: '节能模式', circuits: '860', brightness: '45%', power: '3,100kWh/日' },
          { name: '清洁模式', circuits: '520', brightness: '70%', power: '2,800kWh/日' },
          { name: '应急模式', circuits: '280', brightness: '100%', power: '1,200kWh/日' },
        ],
      },
    },
    trend: {
      title: '📈 今日照明能耗趋势',
      bars: [
        { height: 20, color: '#facc15' }, { height: 35, color: '#facc15' }, { height: 60, color: '#facc15' },
        { height: 85, color: '#facc15' }, { height: 90, color: '#facc15' }, { height: 80, color: '#facc15' },
        { height: 55, color: '#facc15' }, { height: 30, color: '#facc15' },
      ],
      footer: '今日照明用电: 4,200kWh | 较昨日↓12% | 节能模式节省 1,800kWh',
    },
  },
};
