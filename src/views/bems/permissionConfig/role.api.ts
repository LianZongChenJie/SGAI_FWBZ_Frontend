import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/sys/role/list',
  listByTenant = '/sys/role/listByTenant',
  save = '/sys/role/add',
  edit = '/sys/role/edit',
  deleteRole = '/sys/role/delete',
  deleteBatch = '/sys/role/deleteBatch',
  exportXls = '/sys/role/exportXls',
  importExcel = '/sys/role/importExcel',
  isRoleExist = '/sys/role/checkRoleCode',
  queryTreeListForRole = '/sys/role/queryTreeList',
  queryRolePermission = '/sys/permission/queryRolePermission',
  saveRolePermission = '/sys/permission/saveRolePermission',
  queryDataRule = '/sys/role/datarule',
  getParentDesignList = '/act/process/extActDesignFlowData/getDesFormFlows',
  getRoleDegisnList = '/joa/designform/designFormCommuse/getRoleDegisnList',
  saveRoleDesign = '/joa/designform/designFormCommuse/sysRoleDesignAdd',
  userList = '/sys/user/userRoleList',
  deleteUserRole = '/sys/user/deleteUserRole',
  batchDeleteUserRole = '/sys/user/deleteUserRoleBatch',
  addUserRole = '/sys/user/addSysUserRole',
  saveRoleIndex = '/sys/sysRoleIndex/add',
  editRoleIndex = '/sys/sysRoleIndex/edit',
  queryIndexByCode = '/sys/sysRoleIndex/queryByCode',
}
/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * 系统角色列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
/**
 * 租户角色列表
 * @param params
 */
export const listByTenant = (params) => defHttp.get({ url: Api.listByTenant, params });

/**
 * 删除角色
 */
export const deleteRole = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteRole, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 批量删除角色
 * @param params
 */
export const batchDeleteRole = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};
/**
 * 保存或者更新角色
 * @param params
 */
export const saveOrUpdateRole = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};
/**
 * 编码校验
 * @param params
 */
// update-begin--author:liaozhiyang---date:20231215---for：【QQYUN-7415】表单调用接口进行校验的添加防抖
let timer;
export const isRoleExist = (params) => {
  return new Promise((resolve, rejected) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      defHttp
        .get({ url: Api.isRoleExist, params }, { isTransformResponse: false })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          rejected(error);
        });
    }, 500);
  });
};
// update-end--author:liaozhiyang---date:20231215---for：【QQYUN-7415】表单调用接口进行校验的添加防抖
/**
 * 根据角色查询树信息
 */
export const queryTreeListForRole = () => defHttp.get({ url: Api.queryTreeListForRole });
/**
 * 查询角色权限
 */
export const queryRolePermission = (params) => defHttp.get({ url: Api.queryRolePermission, params });
/**
 * 保存角色权限
 */
export const saveRolePermission = (params) => defHttp.post({ url: Api.saveRolePermission, params });
/**
 * 查询角色数据规则
 */
export const queryDataRule = (params) =>
  defHttp.get({ url: `${Api.queryDataRule}/${params.functionId}/${params.roleId}` }, { isTransformResponse: false });
/**
 * 保存角色数据规则
 */
export const saveDataRule = (params) => defHttp.post({ url: Api.queryDataRule, params });
/**
 * 获取表单数据
 * @return List<Map>
 */
export const getParentDesignList = () => defHttp.get({ url: Api.getParentDesignList });
/**
 * 获取角色表单数据
 * @return List<Map>
 */
export const getRoleDegisnList = (params) => defHttp.get({ url: Api.getRoleDegisnList, params });
/**
 * 提交角色工单信息
 */
export const saveRoleDesign = (params) => defHttp.post({ url: Api.saveRoleDesign, params });
/**
 * 角色列表接口
 * @param params
 */
export const userList = (params) => defHttp.get({ url: Api.userList, params });
/**
 * 删除角色用户
 */
export const deleteUserRole = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteUserRole, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 批量删除角色用户
 * @param params
 */
export const batchDeleteUserRole = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.batchDeleteUserRole, params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};
/**
 * 添加已有用户
 */
export const addUserRole = (params, handleSuccess) => {
  return defHttp.post({ url: Api.addUserRole, params }).then(() => {
    handleSuccess();
  });
};
/**
 * 保存或者更新
 * @param params
 * @param isUpdate 是否是更新数据
 */
export const saveOrUpdateRoleIndex = (params, isUpdate) => {
  let url = isUpdate ? Api.editRoleIndex : Api.saveRoleIndex;
  return defHttp.post({ url: url, params });
};
/**
 * 根据code查询首页配置
 * @param params
 */
export const queryIndexByCode = (params) => defHttp.get({ url: Api.queryIndexByCode, params }, { isTransformResponse: false });

// ==================== 数据权限管理接口 ====================

// 权限类型常量
export const PERMISSION_TYPE = {
  CATEGORY: 'CATEGORY',  // 专业权限
  SPACE: 'SPACE',       // 空间权限
};

/**
 * 查询角色数据权限
 * @param roleCode 角色编码
 */
export const queryRoleDataPermission = (roleCode) => defHttp.get({ url: `/bems/dataPermission/role/${roleCode}` });

/**
 * 获取设备专业树
 */
export const getEquipmentCategoryTree = () => defHttp.get({ url: '/bems/dataPermission/equipment/category/tree' });

/**
 * 获取仪表专业树
 */
export const getMeasuringCategoryTree = () => defHttp.get({ url: '/bems/dataPermission/measuring/category/tree' });

/**
 * 获取空间树
 */
export const getSpaceTree = () => defHttp.get({ url: '/bems/dataPermission/space/tree' });

/**
 * 批量分配专业权限
 * @param roleCode 角色编码
 * @param categoryIds 专业ID集合
 */
export const batchAssignCategory = (roleCode, categoryIds) =>
  defHttp.post({
    url: '/bems/dataPermission/assign/category/batch',
    data: { roleCode, ids: categoryIds },
    headers: { 'Content-Type': 'application/json' }
  });

/**
 * 批量分配空间权限
 * @param roleCode 角色编码
 * @param spaceIds 空间ID集合
 */
export const batchAssignSpace = (roleCode, spaceIds) =>
  defHttp.post({
    url: '/bems/dataPermission/assign/space/batch',
    data: { roleCode, ids: spaceIds },
    headers: { 'Content-Type': 'application/json' }
  });

/**
 * 移除角色数据权限
 * @param roleCode 角色编码
 * @param permissionType 权限类型
 * @param resourceId 资源ID
 */
// export const removeDataPermission = (roleCode, permissionType, resourceId) =>
//   defHttp.delete({
//     url: '/bems/dataPermission/remove',
//     params: { roleCode, permissionType, resourceId },
//     joinParamsToUrl: true
//   });

/**
 * 清除角色所有数据权限
 * @param roleCode 角色编码
 */
// export const clearDataPermission = (roleCode) =>
//   defHttp.delete({
//     url: '/bems/dataPermission/clear',
//     params: { roleCode },
//     joinParamsToUrl: true
//   });

/**
 * 移除角色数据权限
 * @param roleCode 角色编码
 * @param permissionType 权限类型（CATEGORY-专业，SPACE-空间）
 * @param resourceId 资源ID
 */
export const removeDataPermission = (roleCode, permissionType, resourceId) =>
  defHttp.delete(
    { url: '/bems/dataPermission/remove', params: { roleCode, permissionType, resourceId } },
    { joinParamsToUrl: true }
  );

/**
 * 清除角色所有数据权限
 * @param roleCode 角色编码
 */
export const clearDataPermission = (roleCode) =>
  defHttp.delete(
    { url: '/bems/dataPermission/clear', params: { roleCode } },
    { joinParamsToUrl: true }
  );
