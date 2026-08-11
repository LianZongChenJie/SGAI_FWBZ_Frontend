import { defHttp, fwbzHttp } from '/@/utils/http/axios';

enum Api {
  /** 能源分析报告 */
  energyAnalysis = '/api/ai-report/energy-analysis',
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
  page: number;
  page_size: number;
  total_pages: number;
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
  device_online_rate: string | null;
  remote_control_count: number;
  today_command_count: number;
  air_conditions: any;
  fresh_air: any;
  power_distribution: any;
  cold_source: any;
  photovoltaic: any;
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

/** 能源分析报告响应 */
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

/** 能源分析报告请求参数 */
export interface EnergyAnalysisParams {
  system_type: string;
  venue_name?: string;
  time_range?: string;
  device_name?: string;
}

/** 获取能源分析报告 */
export const getEnergyAnalysis = (data: EnergyAnalysisParams) =>
  fwbzHttp.post<EnergyAnalysisReport>({ url: Api.energyAnalysis, data }, { isTransformResponse: false });
