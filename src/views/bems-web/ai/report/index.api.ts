import { fwbzLongHttp } from '/@/utils/http/axios';

enum Api {
  run = '/api/ai-report/run',
}

export interface AIRunReportRequest {
  scope: 'all' | 'zone' | 'device';
  time_range: 'day' | 'week' | 'month' | 'quarter' | 'year';
  venue_name?: string | null;
  zone_name?: string | null;
  device_id?: number | null;
  device_name?: string | null;
}

export interface AIMetricItem {
  value: string;
  label: string;
}

export interface DeviceCategoryItem {
  category_name: string;
  device_count: number;
  online_count: number;
  offline_count: number;
}

export interface AlarmDistributionItem {
  category?: string | null;
  alarm_category_name?: string | null;
  count: number;
  percentage?: number | null;
}

export interface ReportListItem {
  id: number;
  title: string;
  report_type: string;
  scope?: string | null;
  created_at: string;
  data_volume: string;
  status: string;
}

export interface AIRunReportResponse {
  report_id?: number | null;
  report_title: string;
  report_desc: string;
  scope: string;
  time_range: string;
  report_count: number;
  report_count_change?: string | null;
  device_count: number;
  device_count_subtitle?: string | null;
  device_online_rate?: string | null;
  analysis_dimension: number;
  analysis_dimension_subtitle?: string | null;
  report_accuracy?: string | null;
  report_accuracy_change?: string | null;
  metrics?: AIMetricItem[];
  summary: string;
  suggestions?: string[];
  device_stats?: Record<string, any>;
  alarm_stats?: Record<string, any>;
  device_categories?: DeviceCategoryItem[];
  alarm_distribution?: AlarmDistributionItem[];
  space_alarm_distribution?: Record<string, any>[];
  report_list?: ReportListItem[];
}

export const generateRunReport = (data: AIRunReportRequest) =>
  fwbzLongHttp.post<AIRunReportResponse>(
    { url: Api.run, data, timeout: 60 * 1000 },
    { isTransformResponse: false },
  );
