import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetInspectPlanList = '/patrol/plan/queryPage',
  DeleteInspectPlan = '/patrol/plan/remove',
  GetInspectPlanDetail = '/patrol/plan/detail',
  AddInspectPlan = '/patrol/plan/save',
  UpdateInspectPlan = '/patrol/plan/edit',
  GetSpaceTree = '/index/spaceTree',
  GetPlanNumber = '/patrol/plan/getNo',
  GetAllGroups = '/patrol/task/findUserGroup',
  SetBindRule = '/patrol/plan/bindRule',
  CreateTask = '/patrol/plan/createTask',
  Release = '/patrol/plan/release',
  Cancel = '/patrol/plan/cancel',
  GetAllRule = '/patrol/rule/queryAll',
  GetSystem = '/patrol/rule/getSpecialty',
  SetTaskDate = '/patrol/task/modifyTime',
  GetWeekDay = '/patrolScheme/getWeekDay',
  GetDayMonth = '/patrolScheme/getDayMonth',
  GetYearDay = '/patrolScheme/getYearDay',
}

export const getInspectPlanList = (params: any) => {
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
  return defHttp.post({ url: Api.SetBindRule, params });
};

export const createTask = (params: any) => {
  return defHttp.post({ url: Api.CreateTask, params });
};

export const release = (params: any) => {
  return defHttp.post({ url: Api.Release, params });
};

export const cancel = (params: any) => {
  return defHttp.post({ url: Api.Cancel, params });
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
