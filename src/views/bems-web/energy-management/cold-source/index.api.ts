import { defHttp } from '/@/utils/http/axios'

enum Api {
  overview = '/sgai-fwbz-dev/fwbz/energyAnalysis/overview',
  loadChart = '/sgai-fwbz-dev/fwbz/energyAnalysis/loadChart',
  dispatchSummary = '/sgai-fwbz-dev/fwbz/energyAnalysis/dispatchSummary',
  optimizerStatus = '/sgai-fwbz-dev/fwbz/energyAnalysis/optimizerStatus',
  deviceStatus = '/sgai-fwbz-dev/fwbz/energyAnalysis/deviceStatus',
}

/**
 * 获取总览驾驶舱 KPI 统计数据
 */
export const getEnergyAnalysisOverview = () => defHttp.get({ url: Api.overview })

/**
 * 获取今日逐时冷负荷预测与实测数据
 * @param params - 可选查询参数
 */
export const getLoadChartData = (params = {}) => defHttp.get({ url: Api.loadChart, params })

/**
 * 获取本拍下发摘要
 */
export const getDispatchSummary = () => defHttp.get({ url: Api.dispatchSummary })

/**
 * 获取优化层状态
 */
export const getOptimizerStatus = () => defHttp.get({ url: Api.optimizerStatus })

/**
 * 获取设备在线概览
 */
export const getDeviceStatus = () => defHttp.get({ url: Api.deviceStatus })
