import { defHttp, fwbzHttp } from '/@/utils/http/axios';

enum Api {
  /** AI预测报告 */
  predict = '/api/ai-report/predict',
}

/** 预测项 */
export interface PredictItem {
  item_name: string;
  predict_value: string;
  confidence: number;
  trend: string;
  description: string;
}

/** 预警项 */
export interface WarningItem {
  device_name: string;
  warning_type: string;
  warning_content: string;
  confidence: number;
  suggest_time: string;
}

/** AI预测报告响应 */
export interface PredictReport {
  report_id: number;
  report_title: string;
  predict_items: PredictItem[];
  warning_items: WarningItem[];
  summary: string;
  suggestions: string[];
}

/** AI预测报告请求参数 */
export interface PredictParams {
  predict_type: string;
  time_range: string;
  venue_name?: string;
  device_id?: number;
  device_name?: string;
}

/** 获取AI预测报告 */
export const getPredictReport = (data: PredictParams) =>
  fwbzHttp.post<PredictReport>({ url: Api.predict, data }, { isTransformResponse: false });
