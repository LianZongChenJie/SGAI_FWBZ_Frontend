import { defHttp, fwbzHttp, fwbzLongHttp } from '/@/utils/http/axios';

enum Api {
  /** 能源分析报告（便捷模式，单接口） */
  energyAnalysis = '/api/ai-report/energy-analysis',
  /** 能源数据查询（快速，<1秒） */
  energyQuery = '/api/ai-report/energy-analysis/query',
  /** AI能源分析（LLM推理，20-30秒） */
  energyAnalyze = '/api/ai-report/energy-analysis/analyze',
}

/** 能源变化数据 */
export interface EnergyChangeData {
  value: number;
  change: string;
  unit: string | null;
}

/** 分类数据对比 */
export interface CategoryCompareData {
  categories: string[];
  data: Record<string, number[]>;
}

/** 用能结构数据 */
export interface EnergyStructureData {
  categories: string[];
  data: number[];
}

/** 表计实时数据项 */
export interface MeterDataItem {
  meter_no: string;
  meter_type: string;
  install_location: string;
  today_reading: number;
  today_usage: number;
  month_total: number;
  status: string;
  detail_link: string | null;
}

/** 表计实时数据（分页） */
export interface MeterData {
  items: MeterDataItem[];
  total: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  online_rate?: string;
}

/** 设备信息 */
export interface DeviceInfo {
  id: number;
  device_code: string;
  device_name: string;
  run_state: string;
  space_id: number;
  space_name: string;
}

/** 概览数据 */
export interface OverviewData {
  subsystem_count: number;
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  total_alarms: number;
  pending_alarms: number;
  device_online_rate: string | null;
  remote_control_count: number;
  today_command_count: number;
}

/** 空调机组数据 */
export interface AirConditionData {
  total_count: number;
  running_count: number;
  fault_count: number;
  avg_cop: number | null;
  today_energy: number;
  devices: DeviceInfo[];
}

/** 新风机组数据 */
export interface FreshAirData {
  total_count: number;
  running_count: number;
  avg_pm25: number | null;
  today_energy: number;
  devices: DeviceInfo[];
}

/** 配电系统数据 */
export interface PowerDistributionData {
  total_count: number;
  running_count: number;
  today_energy: number;
  power_factor: number | null;
  devices: DeviceInfo[];
}

/** 冷源系统数据 */
export interface ColdSourceData {
  total_count: number;
  running_count: number | null;
  today_cooling: number;
  avg_cop: number | null;
  devices: DeviceInfo[];
}

/** 光伏系统数据 */
export interface PhotovoltaicData {
  total_count: number;
  installed_capacity: number;
  today_generation: number;
  efficiency: number;
  devices: DeviceInfo[];
}

/** 今日用水用电量 */
export interface TodayUsage {
  electricity: EnergyChangeData;
  water: EnergyChangeData;
}

/** 查询参数回显 */
export interface QueryParamsInfo {
  system_type: string;
  venue_name: string | null;
  start_date: string;
  end_date: string;
  device_name: string | null;
}

/** 能源查询响应（步骤1，快速） */
export interface EnergyQueryResponse {
  query_params: QueryParamsInfo;
  overview: OverviewData;
  air_condition: AirConditionData;
  fresh_air: FreshAirData;
  power_distribution: PowerDistributionData;
  cold_source: ColdSourceData;
  photovoltaic: PhotovoltaicData;
  meter_data: MeterData;
  today_usage: TodayUsage;
  venue_electricity_compare: CategoryCompareData;
  energy_structure: EnergyStructureData;
}

/** 能源分析报告响应（步骤2，AI分析） */
export interface EnergyAnalysisReport {
  report_id: number;
  report_title: string;
  report_time: string;
  system_type: string;
  meter_total: number;
  meter_online_rate: string;
  today_electricity: EnergyChangeData;
  today_water: EnergyChangeData;
  venue_electricity_compare: CategoryCompareData;
  energy_structure: EnergyStructureData;
  meter_data: MeterData;
  overview: OverviewData;
  air_condition: AirConditionData;
  fresh_air: FreshAirData;
  power_distribution: PowerDistributionData;
  cold_source: ColdSourceData;
  photovoltaic: PhotovoltaicData;
  summary: string;
  suggestions: string[];
  warnings: string[];
}

/** 能源分析请求参数 */
export interface EnergyAnalysisParams {
  system_type: string;
  venue_name?: string;
  time_range?: string;
  device_name?: string;
}

/** 查询能源数据（快速，<1秒） */
export const getEnergyQuery = (data: EnergyAnalysisParams) =>
  fwbzHttp.post<EnergyQueryResponse>({ url: Api.energyQuery, data }, { isTransformResponse: false });

/** AI能源分析（LLM推理，20-30秒，使用长超时实例） */
export const getEnergyAnalyze = (data: Partial<EnergyQueryResponse>) =>
  fwbzLongHttp.post<EnergyAnalysisReport>({ url: Api.energyAnalyze, data }, { isTransformResponse: false });

/** 便捷模式 - 单接口获取完整报告（20-30秒，使用长超时实例） */
export const getEnergyAnalysis = (data: EnergyAnalysisParams) =>
  fwbzLongHttp.post<EnergyAnalysisReport>({ url: Api.energyAnalysis, data }, { isTransformResponse: false });
