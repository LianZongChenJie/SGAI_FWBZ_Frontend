import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetPlanRuleList = '/patrol/rule/queryPage',
  DeletePlanRule = '/patrol/rule/remove',
  GetPlanRuleDetail = '/patrol/rule/detail',
  AddPlanRule = '/patrol/rule/save',
  GetSpecialty = '/patrol/rule/getspecialty',
  GetPlanRuleNo = '/patrol/rule/getNo',
}

export const getPlanRuleList = (params) => {
  return defHttp.get({ url: Api.GetPlanRuleList, params });
};

export const deletePlanRule = (params) => {
  return defHttp.post({ url: Api.DeletePlanRule, params }, { joinParamsToUrl: true });
};

export const getPlanRuleDetail = (params) => {
  return defHttp.get({ url: Api.GetPlanRuleDetail, params });
};

export const addPlanRule = (params) => {
  return defHttp.post({ url: Api.AddPlanRule, params });
};

export const getSpecialty = () => {
  return defHttp.get({ url: Api.GetSpecialty });
};

export const getPlanRuleNo = () => {
  return defHttp.get({ url: Api.GetPlanRuleNo }, { joinParamsToUrl: true });
};
