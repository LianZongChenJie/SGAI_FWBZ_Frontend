import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetInspectPlanList = '/jeecg-patrol/patrol/plan/queryPage',
  DeleteInspectPlan = '/jeecg-patrol/patrol/plan/remove',
  GetInspectPlanDetail = '/jeecg-patrol/patrol/plan/detail',
  AddInspectPlan = '/jeecg-patrol/patrol/plan/save',
  UpdateInspectPlan = '/jeecg-patrol/patrol/plan/edit',
  GetSpaceTree = '/jeecg-patrol/index/spaceTree',
  GetPlanNumber = '/jeecg-patrol/patrol/plan/getNo',
  GetAllGroups = '/jeecg-patrol/patrol/task/findUserGroup',
  SetBindRule = '/jeecg-patrol/patrol/plan/bindRule',
  CreateTask = '/jeecg-patrol/patrol/plan/createTask',
  Release = '/jeecg-patrol/patrol/plan/release',
  Cancel = '/jeecg-patrol/patrol/plan/cancel',
  GetAllRule = '/jeecg-patrol/patrol/rule/queryAll',
  GetSystem = '/jeecg-patrol/patrol/rule/getSpecialty',
  SetTaskDate = '/jeecg-patrol/patrol/task/modifyTime',
  GetWeekDay = '/jeecg-patrol/patrolScheme/getWeekDay',
  GetDayMonth = '/jeecg-patrol/patrolScheme/getDayMonth',
  GetYearDay = '/jeecg-patrol/patrolScheme/getYearDay',
  treeData = '/bems/space/getTree',
}

export const getInspectPlanList = (params: any) => {
  if (params.name) {
    params.name = '*' + params.name + '*';
  }
  return defHttp.get({ url: Api.GetInspectPlanList, params });
};

export const deleteInspectPlan = (params: any) => {
  return defHttp.post({ url: Api.DeleteInspectPlan, params }, { joinParamsToUrl: true });
};

export const getInspectPlanDetail = (params: any) => {
  return defHttp.get({ url: Api.GetInspectPlanDetail, params });
};

export const addInspectPlan = (params: any) => {
  return defHttp.post({ url: Api.AddInspectPlan, params });
};

export const updateInspectPlan = (params: any) => {
  return defHttp.post({ url: Api.UpdateInspectPlan, params });
};

export const getSpaceTree = () => {
  return defHttp.get({ url: Api.GetSpaceTree });
};

export const getPlanNumber = () => {
  return defHttp.get({ url: Api.GetPlanNumber });
};

export const getAllGroups = (params: any) => {
  return defHttp.get({ url: Api.GetAllGroups, params });
};

export const setBindRule = (params: any) => {
  return defHttp.post({ url: Api.SetBindRule, params }, { joinParamsToUrl: true });
};

export const createTask = (params: any) => {
  return defHttp.post({ url: Api.CreateTask, params }, { joinParamsToUrl: true });
};

export const release = (params: any) => {
  return defHttp.post({ url: Api.Release, params }, { joinParamsToUrl: true });
};

export const cancel = (params: any) => {
  return defHttp.post({ url: Api.Cancel, params }, { joinParamsToUrl: true });
};

export const getAllRule = (params: any) => {
  return defHttp.get({ url: Api.GetAllRule, params });
};

export const getSystem = () => {
  return defHttp.get({ url: Api.GetSystem });
};

export const setTaskDate = (params: any) => {
  return defHttp.post({ url: Api.SetTaskDate, params });
};

export const getWeekDay = () => {
  return defHttp.get({ url: Api.GetWeekDay });
};

export const getDayMonth = (start: number, end: number, type: string) => {
  return defHttp.get({ url: Api.GetDayMonth, params: { start, end, type } });
};

export const getYearDay = (start: number, end: number) => {
  return defHttp.get({ url: Api.GetYearDay, params: { start, end } });
};
/**
 * 获取空间树
 * @param params
 */
export const getTreeData = (params) => defHttp.get({ url: Api.treeData, params });