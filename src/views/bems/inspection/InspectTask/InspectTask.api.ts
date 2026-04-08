import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetInspectTaskList = '/patrol/task/queryPageWithLimit',
  DeleteInspectTask = '/patrol/task/delTask',
  GetInspectTaskDetail = '/patrol/task/detail',
  AddInspectTask = '/patrol/task/save',
  UpdateInspectTask = '/patrol/task/update',
  GetAllGroups = '/patrol/task/getAllGroups',
  GetSystem = '/patrol/task/getSystem',
  GetTaskNumber = '/patrol/rule/getNo',
  GetSpaceTree = '/index/spaceTree',
  GetAllRule = '/patrol/rule/queryAll',
  BindRule = '/patrol/task/bindRule',
  ExportPdf = '/patrol/task/exportPdf',
  ReleaseTask = '/patrol/task/release',
  UpdateTaskDate = '/patrol/task/updateDate',
  ReassignTask = '/patrol/task/reassign',
  CancelTask = '/patrol/task/cancel',
}

export const getInspectTaskList = (params) => {
  return defHttp.get({ url: Api.GetInspectTaskList, params, requestOptions: { joinPrefix: false } });
};

export const deleteInspectTask = (params) => {
  return defHttp.post({ url: Api.DeleteInspectTask, params, requestOptions: { joinPrefix: false } });
};

export const getInspectTaskDetail = (params) => {
  return defHttp.get({ url: Api.GetInspectTaskDetail, params, requestOptions: { joinPrefix: false } });
};

export const addInspectTask = (data) => {
  return defHttp.post({ url: Api.AddInspectTask, data, requestOptions: { joinPrefix: false } });
};

export const updateInspectTask = (params) => {
  return defHttp.post({ url: Api.UpdateInspectTask, params, requestOptions: { joinPrefix: false } });
};

export const getAllGroups = (params) => {
  return defHttp.get({ url: Api.GetAllGroups, params, requestOptions: { joinPrefix: false } });
};

export const getSystem = () => {
  return defHttp.get({ url: Api.GetSystem, requestOptions: { joinPrefix: false } });
};

export const getTaskNumber = () => {
  return defHttp.get({ url: Api.GetTaskNumber, requestOptions: { joinPrefix: false, joinParamsToUrl: true } });
};

export const getSpaceTree = () => {
  return defHttp.get({ url: Api.GetSpaceTree, requestOptions: { joinPrefix: false } });
};

export const getAllRule = (params?) => {
  return defHttp.get({ url: Api.GetAllRule, params, requestOptions: { joinPrefix: false } });
};

export const bindRule = (data) => {
  return defHttp.post({ url: Api.BindRule, data, requestOptions: { joinPrefix: false } });
};

export const exportPdf = (params) => {
  return defHttp.get({ url: Api.ExportPdf, params, requestOptions: { joinPrefix: false, responseType: 'blob' } });
};

export const releaseTask = (params) => {
  return defHttp.post({ url: Api.ReleaseTask, params }, { joinPrefix: false, joinParamsToUrl: true });
};

export const updateTaskDate = (params) => {
  return defHttp.post({ url: Api.UpdateTaskDate, params }, { joinPrefix: false, joinParamsToUrl: true });
};

export const reassignTask = (params) => {
  return defHttp.post({ url: Api.ReassignTask, params }, { joinPrefix: false, joinParamsToUrl: true });
};

export const cancelTask = (params) => {
  return defHttp.post({ url: Api.CancelTask, params }, { joinPrefix: false, joinParamsToUrl: true });
};
