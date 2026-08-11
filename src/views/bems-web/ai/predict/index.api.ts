import { defHttp, fwbzHttp, fwbzLongHttp } from '/@/utils/http/axios';

enum Api {
  /** 故障数据查询（快速） */
  faultQuery = '/api/ai-report/fault/query',
  /** AI故障分析（LLM推理） */
  faultAnalyze = '/api/ai-report/fault/analyze',
  /** 便捷模式（单接口，查询+分析） */
  fault = '/api/ai-report/fault',
}

/** 查询参数 */
export interface FaultQueryParams {
  time_range: string;
  venue_name?: string;
  device_id?: number;
  device_name?: string;
  zone_name?: string;
}

/** 查询参数回显 */
export interface QueryParamsInfo {
  time_range: string;
  venue_name: string | null;
  start_date: string;
  end_date: string;
  device_id: number | null;
  device_name: string | null;
  zone_name: string | null;
}

/** 故障统计核心数据 */
export interface FaultStats {
  total_faults: number;
  affected_devices: number;
  category_count: number;
  unresolved_count: number;
  resolved_count: number;
  unplanned_stop_count: number;
}

/** 按故障类别统计 */
export interface FaultByCategory {
  category: string;
  count: number;
  percentage: number;
}

/** 按告警级别统计 */
export interface FaultByLevel {
  level_name: string;
  count: number;
}

/** 故障明细项（查询接口） */
export interface FaultListItem {
  id: number;
  device_name: string;
  alarm_category_name: string;
  alarm_level_name: string;
  alarm_time: string;
  alarm_content: string;
  alarm_status: string;
  duration_minutes: number | null;
}

/** 按设备统计TOP10 */
export interface DeviceFaultCount {
  device_name: string;
  fault_count: number;
}

/** 故障时间分布 */
export interface FaultTimeDistribution {
  time_period: string;
  fault_count: number;
}

/** 故障空间分布 */
export interface FaultSpaceDistribution {
  space_name: string;
  full_name: string;
  fault_count: number;
  affected_devices: number;
}

/** 故障设备类别统计 */
export interface FaultDeviceCategory {
  category: string;
  full_name: string;
  fault_count: number;
  affected_devices: number;
  percentage: number;
}

/** 响应及时率统计 */
export interface ResponseRateStats {
  total_alarms: number;
  within_30min: number;
  within_1hour: number;
  within_4hour: number;
  over_4hour: number;
  not_processed: number;
}

/** 投诉建议统计 */
export interface ComplaintStats {
  total_complaints: number;
  pending_count: number;
  processing_count: number;
  resolved_count: number;
}

/** 投诉建议项 */
export interface ComplaintItem {
  id: number;
  title: string;
  complaint_date: string;
  content: string;
  status: string;
}

/** 近7天趋势数据 */
export interface RecentTrends {
  dates: string[];
  counts: number[];
}

/** 故障查询响应 */
export interface FaultQueryResponse {
  query_params: QueryParamsInfo;
  fault_stats: FaultStats;
  fault_by_category: FaultByCategory[];
  fault_by_level: FaultByLevel[];
  fault_list: FaultListItem[];
  device_fault_count: DeviceFaultCount[];
  fault_time_distribution: FaultTimeDistribution[];
  fault_space_distribution: FaultSpaceDistribution[];
  fault_device_category: FaultDeviceCategory[];
  response_rate_stats: ResponseRateStats;
  complaint_stats: ComplaintStats;
  complaint_list: ComplaintItem[];
  recent_trends: RecentTrends;
}

/** 核心指标（AI分析响应） */
export interface Metric {
  value: string;
  label: string;
}

/** 故障分布（AI分析响应） */
export interface FaultDistribution {
  category: string;
  count: number;
  percentage: number;
}

/** 故障明细项（AI分析） */
export interface FaultAnalysisItem {
  device_name: string;
  fault_type: string;
  fault_time: string;
  duration: string;
  cause: string;
  solution: string;
}

/** 维保优先级项 */
export interface MaintenancePriority {
  priority: string;
  device_name: string;
  location: string;
  fault_count: string;
  ai_risk_score: string;
  suggest_action: string;
  suggest_time: string;
}

/** AI故障分析响应 */
export interface FaultAnalyzeResponse {
  report_id: number;
  report_title: string;
  report_desc: string;
  metrics: Metric[];
  fault_distribution: FaultDistribution[];
  fault_items: FaultAnalysisItem[];
  maintenance_priorities: MaintenancePriority[];
  summary: string;
  suggestions: string[];
}

/** 查询故障数据（快速，<1秒） */
export const getFaultQuery = (data: FaultQueryParams) =>
  fwbzHttp.post<FaultQueryResponse>({ url: Api.faultQuery, data }, { isTransformResponse: false });

/** AI故障分析（LLM推理，20-30秒，使用长超时实例） */
export const getFaultAnalyze = (data: Partial<FaultQueryResponse>) =>
  fwbzLongHttp.post<FaultAnalyzeResponse>({ url: Api.faultAnalyze, data }, { isTransformResponse: false });

/** 便捷模式 - 单接口获取完整报告（20-30秒，使用长超时实例） */
export const getFaultReport = (data: FaultQueryParams) =>
  fwbzLongHttp.post<FaultAnalyzeResponse>({ url: Api.fault, data }, { isTransformResponse: false });
