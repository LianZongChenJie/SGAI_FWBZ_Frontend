import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getProjectManagementListApi = '/bems/project/queryPage',
  getProjectByIdApi = '/bems/project/queryById',
  getProjectStatisticsApi = '/bems/project/queryProjectStatistics',
  addProjectApi = '/bems/project/add',
  editProjectApi = '/bems/project/edit',
  deleteProjectApi = '/bems/project/delete',

  getProjectStatusApi = '/sys/dict/getDictItems/project_status',
  getProjectTypeApi = '/sys/dict/getDictItems/project_type',
  getProjectProjectSubjectApi = '/sys/dict/getDictItems/project_subject',

  selectDevice = '/bems/device/measuring/list',

  getMeteringPointApi = '/bems/meteringPoint/getAllTree',

  getProjectEvaluationApi = '/bems/project/evaluation/getReport',

  startProjectApi = '/bems/project/startProject',
  pauseProjectApi = '/bems/project/pauseProject',
  completedProjectApi = '/bems/project/completedProject',

  getProjectNameApi = '/bems/project/queryById',
}

/**
 * 获取项目列表数据
 */
export const getProjectManagementListApi = (params) => defHttp.get({ url: Api.getProjectManagementListApi, params }, { joinParamsToUrl: true });

/**
 * 获取项目详情
 */
export const getProjectByIdApi = (params) => defHttp.get({ url: Api.getProjectByIdApi, params }, { joinParamsToUrl: true });

/**
 * 获取项目统计信息
 * @param params
 */
export const getProjectStatisticsApi = () => defHttp.get({ url: Api.getProjectStatisticsApi });

/**
 * 新增项目
 */
export const addProjectApi = (params) => defHttp.post({ url: Api.addProjectApi, params });

/**
 * 编辑告警级别
 */
export const editProjectApi = (params) => defHttp.post({ url: Api.editProjectApi, params });

/**
 * 删除项目
 * @param params
 */
export const deleteProjectApi = (params) => defHttp.delete({ url: Api.deleteProjectApi, params }, { joinParamsToUrl: true });

/**
 * 获取项目状态信息
 * @param params
 */
export const getProjectStatusApi = () => defHttp.get({ url: Api.getProjectStatusApi });

/**
 * 获取项目主体信息
 * @param params
 */
export const getProjectProjectSubjectApi = () => defHttp.get({ url: Api.getProjectProjectSubjectApi });

/**
 * 查询设备
 */
export const selectDevice = (params) => defHttp.get({ url: Api.selectDevice, params });

/**
 * 获取节能类型信息
 * @param params
 */
export const getProjectTypeApi = () => defHttp.get({ url: Api.getProjectTypeApi });

/**
 * 获取计量点位树
 * @param params
 */
export const getMeteringPointApi = () => defHttp.get({ url: Api.getMeteringPointApi });

/**
 * 查询设备
 */
export const getProjectEvaluationApi = (params) => defHttp.get({ url: Api.getProjectEvaluationApi, params });

/**
 * 启动项目
 * @param params
 */
export const startProjectApi = (params) => defHttp.get({ url: Api.startProjectApi, params }, { joinParamsToUrl: true });

/**
 * 暂停项目
 * @param params
 */
export const pauseProjectApi = (params) => defHttp.get({ url: Api.pauseProjectApi, params }, { joinParamsToUrl: true });

/**
 * 结项项目
 * @param params
 */
export const completedProjectApi = (params) => defHttp.get({ url: Api.completedProjectApi, params }, { joinParamsToUrl: true });

/**
 * 获取项目名称等信息
 * @param params
 */
export const getProjectNameApi = (params) => defHttp.get({ url: Api.getProjectNameApi, params }, { joinParamsToUrl: true });