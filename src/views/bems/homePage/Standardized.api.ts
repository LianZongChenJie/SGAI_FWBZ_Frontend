import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getWaterEnergyConsumptionStatisticsDayApi = '/bems/homePage/waterStatisticsForDay',
  getWaterEnergyConsumptionStatisticsMonthApi = '/bems/homePage/waterStatisticsForMonth',
  getWaterEnergyConsumptionStatisticsYearApi = '/bems/homePage/waterStatisticsForYear',

  getelEctricityEnergyConsumptionStatisticsDayApi = '/bems/homePage/electricityStatisticsForDay',
  getelEctricityEnergyConsumptionStatisticsMonthApi = '/bems/homePage/electricityStatisticsForMonth',
  getelEctricityEnergyConsumptionStatisticsYearApi = '/bems/homePage/electricityStatisticsForYear',

  getEnergyConsumptionPSDElectricityApi = '/bems/homePage/energyConsumptionPSDElectricity',
  getEnergyConsumptionPSDWaterApi = '/bems/homePage/energyConsumptionPSDWater',

  getalarmStatisticsDayApi = '/bems/homePage/alarmStatisticsForDay',
  getalarmStatisticsMonthApi = '/bems/homePage/alarmStatisticsForMonth',
  getalarmStatisticsYearApi = '/bems/homePage/alarmStatisticsForYear',
  getalarmStatisticsListApi = '/bems/alarm/record/listPage',

  getEnvironmentApi = '/bems/homePage/environment',

  getEnergyUseSafetyApi = '/bems/homePage/energyUseSafety',
  getCarbonFootprintApi = '/bems/homePage/carbonFootprint',

  getEnergyConsumptionElectricityForDayApi = '/bems/homePage/energyConsumptionElectricityForDay',
  getEnergyConsumptionElectricityForMonthApi = '/bems/homePage/energyConsumptionElectricityForMonth',
  getEnergyConsumptionElectricityForYearApi = '/bems/homePage/energyConsumptionElectricityForYear',

  getEnergyConsumptionWaterForDayApi = '/bems/homePage/energyConsumptionWaterForDay',
  getEnergyConsumptionWaterForMonthApi = '/bems/homePage/energyConsumptionWaterForMonth',
  getEnergyConsumptionWaterForYearApi = '/bems/homePage/energyConsumptionWaterForYear',

  getAlarmStatisticsApi = '/bems/homePage/alarmStatistics', 
  getAlarmRecordListForMonthApi = '/bems/homePage/alarmRecordListForMonth',

  getEnergyConservationStatisticsApi = '/bems/homePage/energyConservationStatistics',

}

/**
 * 水能耗统计日
 */
export const getWaterEnergyConsumptionStatisticsDayApi = () => defHttp.get({ url: Api.getWaterEnergyConsumptionStatisticsDayApi });

/**
 * 水能耗统计月
 */
export const getWaterEnergyConsumptionStatisticsMonthApi = () => defHttp.get({ url: Api.getWaterEnergyConsumptionStatisticsMonthApi, });

/**
 * 水能耗统计年
 */
export const getWaterEnergyConsumptionStatisticsYearApi = () => defHttp.get({ url: Api.getWaterEnergyConsumptionStatisticsYearApi });

/**
 * 电能耗统计日
 */
export const getelEctricityEnergyConsumptionStatisticsDayApi = () => defHttp.get({ url: Api.getelEctricityEnergyConsumptionStatisticsDayApi });

/**
 * 电能耗统计月
 */
export const getelEctricityEnergyConsumptionStatisticsMonthApi = () => defHttp.get({ url: Api.getelEctricityEnergyConsumptionStatisticsMonthApi, });

/**
 * 电能耗统计年
 */
export const getelEctricityEnergyConsumptionStatisticsYearApi = () => defHttp.get({ url: Api.getelEctricityEnergyConsumptionStatisticsYearApi });

/**
 * 获取近七日电能耗趋势
 */
export const getEnergyConsumptionPSDElectricityApi = () => defHttp.get({ url: Api.getEnergyConsumptionPSDElectricityApi });

/**
 * 获取近七日水能耗趋势
 */
export const getEnergyConsumptionPSDWaterApi = () => defHttp.get({ url: Api.getEnergyConsumptionPSDWaterApi });

/**
 * 告警查询日
 */
export const getalarmStatisticsDayApi = () => defHttp.get({ url: Api.getalarmStatisticsDayApi });

/**
 * 告警查询月
 */
export const getalarmStatisticsMonthApi = () => defHttp.get({ url: Api.getalarmStatisticsMonthApi, });

/**
 * 告警查询年
 */
export const getalarmStatisticsYearApi = () => defHttp.get({ url: Api.getalarmStatisticsYearApi });

/**
 * 告警查询年
 */
export const getalarmStatisticsListApi = (params) => defHttp.get({ url: Api.getalarmStatisticsListApi, params });

/**
 * 环境信息
 */
export const getEnvironmentApi = () => defHttp.get({ url: Api.getEnvironmentApi }); 


/**
 * 用能安全
 */
export const getEnergyUseSafetyApi = () => defHttp.get({ url: Api.getEnergyUseSafetyApi }); 

/**
 * 碳足迹数据
 */
export const getCarbonFootprintApi = () => defHttp.get({ url: Api.getCarbonFootprintApi });

/**
 * 电能耗趋势统计日
 */
export const getEnergyConsumptionElectricityForDayApi = () => defHttp.get({ url: Api.getEnergyConsumptionElectricityForDayApi });

/**
 * 电能耗趋势统计月
 */
export const getEnergyConsumptionElectricityForMonthApi = () => defHttp.get({ url: Api.getEnergyConsumptionElectricityForMonthApi, });

/**
 * 电能耗趋势统计年
 */
export const getEnergyConsumptionElectricityForYearApi = () => defHttp.get({ url: Api.getEnergyConsumptionElectricityForYearApi });

/**
 * 水能耗趋势统计日
 */
export const getEnergyConsumptionWaterForDayApi = () => defHttp.get({ url: Api.getEnergyConsumptionWaterForDayApi });

/**
 * 水能耗趋势统计月
 */
export const getEnergyConsumptionWaterForMonthApi = () => defHttp.get({ url: Api.getEnergyConsumptionWaterForMonthApi, });

/**
 * 水能耗趋势统计年
 */
export const getEnergyConsumptionWaterForYearApi = () => defHttp.get({ url: Api.getEnergyConsumptionWaterForYearApi }); 

/**
 * 报警信息统计
 */
export const getAlarmStatisticsApi = () => defHttp.get({ url: Api.getAlarmStatisticsApi }); 

/**
 * 报警信息列表
 */
export const getAlarmRecordListForMonthApi = (params) => defHttp.get({ url: Api.getAlarmRecordListForMonthApi, params }, { joinParamsToUrl: true }); 

/**
 * 节能统计数据获取
 */
export const getEnergyConservationStatisticsApi = () => defHttp.get({ url: Api.getEnergyConservationStatisticsApi }); 