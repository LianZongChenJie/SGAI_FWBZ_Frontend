-- 注意：该页面对应的前台目录为views/bems文件夹下
-- 如果你想更改到其他目录，请修改sql中component字段对应的值


INSERT INTO sys_permission(id, parent_id, name, url, component, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_route, is_leaf, keep_alive, hidden, hide_tab, description, status, del_flag, rule_flag, create_by, create_time, update_by, update_time, internal_or_external) 
VALUES ('2025021904105890500', NULL, '采集管理-规则标准', '/bems/gatherRuleConfigList', 'bems/GatherRuleConfigList', NULL, NULL, 0, NULL, '1', 0.00, 0, NULL, 1, 0, 0, 0, 0, NULL, '1', 0, 0, 'admin', '2025-02-19 16:10:50', NULL, NULL, 0);

-- 权限控制sql
-- 新增
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2025021904105900501', '2025021904105890500', '添加采集管理-规则标准', NULL, NULL, 0, NULL, NULL, 2, 'bems:gather_rule_config:add', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-02-19 16:10:50', NULL, NULL, 0, 0, '1', 0);
-- 编辑
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2025021904105900502', '2025021904105890500', '编辑采集管理-规则标准', NULL, NULL, 0, NULL, NULL, 2, 'bems:gather_rule_config:edit', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-02-19 16:10:50', NULL, NULL, 0, 0, '1', 0);
-- 删除
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2025021904105900503', '2025021904105890500', '删除采集管理-规则标准', NULL, NULL, 0, NULL, NULL, 2, 'bems:gather_rule_config:delete', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-02-19 16:10:50', NULL, NULL, 0, 0, '1', 0);
-- 批量删除
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2025021904105900504', '2025021904105890500', '批量删除采集管理-规则标准', NULL, NULL, 0, NULL, NULL, 2, 'bems:gather_rule_config:deleteBatch', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-02-19 16:10:50', NULL, NULL, 0, 0, '1', 0);
-- 导出excel
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2025021904105900505', '2025021904105890500', '导出excel_采集管理-规则标准', NULL, NULL, 0, NULL, NULL, 2, 'bems:gather_rule_config:exportXls', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-02-19 16:10:50', NULL, NULL, 0, 0, '1', 0);
-- 导入excel
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2025021904105900506', '2025021904105890500', '导入excel_采集管理-规则标准', NULL, NULL, 0, NULL, NULL, 2, 'bems:gather_rule_config:importExcel', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-02-19 16:10:50', NULL, NULL, 0, 0, '1', 0);