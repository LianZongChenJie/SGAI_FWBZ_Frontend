import { fwbzHttp } from '/@/utils/http/axios';

enum Api {
  venues = '/api/ai-report/venues',
  history = '/api/ai-report/history',
  stats = '/api/ai-report/stats',
}

const aiGetOptions = { isTransformResponse: false, joinTime: false };

export function unwrapAiResponse<T>(res: unknown): T {
  const data = res as Record<string, any> | null;
  return (data?.result ?? data?.data ?? data) as T;
}

export function parseHistoryContent<T>(detail?: { content?: string } | null): T | null {
  if (!detail?.content) return null;
  try {
    return JSON.parse(detail.content) as T;
  } catch {
    return null;
  }
}

export interface VenueInfo {
  id: number;
  venue_name: string;
  location?: string | null;
  area?: string | null;
  floors?: number | null;
}

export interface VenueListResponse {
  items: VenueInfo[];
  total: number;
}

export interface AIReportHistoryListItem {
  id: number;
  report_type: string;
  title: string;
  time_range: string;
  target_id?: number | null;
  target_name?: string | null;
  scope?: string | null;
  summary?: string | null;
  data_volume: string;
  status: string;
  created_at: string;
}

export interface AIReportHistoryListResponse {
  items: AIReportHistoryListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AIReportHistoryResponse {
  id: number;
  report_type: string;
  title: string;
  time_range: string;
  target_id?: number | null;
  target_name?: string | null;
  scope?: string | null;
  content: string;
  summary?: string | null;
  query_params?: Record<string, any> | null;
  created_at: string;
  updated_at?: string | null;
}

export interface AIReportStatsResponse {
  total_count: number;
  by_type: Record<string, number>;
  by_time_range: Record<string, number>;
  recent_count: number;
}

export interface HistoryQueryParams {
  page?: number;
  page_size?: number;
  report_type?: string;
  time_range?: string;
  target_name?: string;
  start_date?: string;
  end_date?: string;
}

export const getVenues = () =>
  fwbzHttp.get<VenueListResponse>({ url: Api.venues }, aiGetOptions);

export const getReportStats = () =>
  fwbzHttp.get<AIReportStatsResponse>({ url: Api.stats }, aiGetOptions);

export const getReportHistory = (params: HistoryQueryParams) =>
  fwbzHttp.get<AIReportHistoryListResponse>({ url: Api.history, params }, aiGetOptions);

export const getReportDetail = (reportId: number) =>
  fwbzHttp.get<AIReportHistoryResponse>({ url: `${Api.history}/${reportId}` }, aiGetOptions);

export const deleteReport = (reportId: number) =>
  fwbzHttp.delete({ url: `${Api.history}/${reportId}` }, { isTransformResponse: false });
