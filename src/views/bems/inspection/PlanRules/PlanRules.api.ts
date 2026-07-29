import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetPlanRuleList = '/jeecg-patrol/patrol/rule/queryPage',
  DeletePlanRule = '/jeecg-patrol/patrol/rule/remove',
  GetPlanRuleDetail = '/jeecg-patrol/patrol/rule/detail',
  AddPlanRule = '/jeecg-patrol/patrol/rule/save',
  EditPlanRule = '/jeecg-patrol/patrol/rule/edit',
  GetSpecialty = '/jeecg-patrol/patrol/rule/getspecialty',
  GetPlanRuleNo = '/jeecg-patrol/patrol/rule/getNo',
  patrolInspectionObjects = '/sys/dict/getDictItems/patrol_inspection_objects',
}

export const getPlanRuleList = (params) => {
  if (params.name) {
    params.name = '*' + params.name + '*';
  }
  return defHttp.get({ url: Api.GetPlanRuleList, params });
};
/**
 * 能流图分类字典获取
 */
export const getPatrolInspectionObjects = () => defHttp.get({ url: Api.patrolInspectionObjects });
export const deletePlanRule = (params) => {
  return defHttp.post({ url: Api.DeletePlanRule, params }, { joinParamsToUrl: true });
};

export const getPlanRuleDetail = (params) => {
  return defHttp.get({ url: Api.GetPlanRuleDetail, params });
};

export const addPlanRule = (params) => {
  return defHttp.post({ url: Api.AddPlanRule, params });
};

export const updatePlanRule = (params) => {
  return defHttp.post({ url: Api.EditPlanRule, params });
};

export const getSpecialty = () => {
  return defHttp.get({ url: Api.GetSpecialty });
};

export const getPlanRuleNo = () => {
  return defHttp.get({ url: Api.GetPlanRuleNo }, { joinParamsToUrl: true });
};
