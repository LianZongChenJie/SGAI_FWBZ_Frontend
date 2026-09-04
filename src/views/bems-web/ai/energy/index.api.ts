import { fwbzLongHttp } from '/@/utils/http/axios';

enum Api {
  energy = '/api/ai-report/energy',
}

export interface AIEnergyReportRequest {
  time_range: 'week' | 'month' | 'quarter' | 'year';
  venue_name?: string | null;
  zone_name?: string | null;
}

export interface AIMetricItem {
  value: string;
  label: string;
}

export interface AIStrategyItem {
  strategy_name: string;
  implement_date: string;
  before_daily?: string | null;
  after_daily?: string | null;
  daily_saving?: string | null;
  saving_rate?: string | null;
  total_saving?: string | null;
  status: string;
}

export interface AIEnergyReportResponse {
  report_id?: number | null;
  report_title: string;
  report_desc: string;
  metrics?: AIMetricItem[];
  strategy_items?: AIStrategyItem[];
  summary: string;
  suggestions?: string[];
}

export const generateEnergyReport = (data: AIEnergyReportRequest) =>
  fwbzLongHttp.post<AIEnergyReportResponse>(
    { url: Api.energy, data, timeout: 60 * 1000 },
    { isTransformResponse: false },
  );
