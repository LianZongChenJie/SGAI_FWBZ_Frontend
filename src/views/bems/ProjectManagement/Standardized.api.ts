import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getProjectManagementListApi = '/bems/project/list',
  getProjectByIdApi = '/bems/project/queryById',
  getProjectStatisticsApi = '/bems/project/queryProjectStatistics',
  addProjectApi = '/bems/project/add',
  editProjectApi = '/bems/project/edit',
  deleteProjectApi = '/bems/project/delete',

  getProjectStatusApi = '/sys/dict/getDictItems/project_status',
  getProjectProjectSubjectApi = '/sys/dict/getDictItems/project_subject',
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
