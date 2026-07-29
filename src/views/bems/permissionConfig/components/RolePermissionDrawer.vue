<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" width="900px" destroyOnClose showFooter>
    <template #title>
      角色权限配置
      <span style="margin-right: 10px;">({{ roleCode }})</span>
      <a-space>
        <a-button type="link" size="small" danger @click="handleClearAll">
          清除所有权限
        </a-button>
        <a-dropdown>
          <Icon icon="ant-design:more-outlined" class="more-icon" />
          <template #overlay>
            <a-menu @click="treeMenuClick">
              <a-menu-item key="checkAll">选择全部</a-menu-item>
              <a-menu-item key="cancelCheck">取消选择</a-menu-item>
              <div class="line"></div>
              <a-menu-item key="openAll">展开全部</a-menu-item>
              <a-menu-item key="closeAll">折叠全部</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-space>
    </template>

    <!-- 右键菜单模态框 -->
    <a-modal
      :open="contextMenuVisible"
      :title="contextMenuTitle"
      :centered="true"
      :footer="null"
      @cancel="contextMenuVisible = false"
      :width="200"
      class="context-menu-modal"
    >
      <div style="padding: 8px 0;">
        <div
          style="padding: 8px; cursor: pointer; border-radius: 4px;"
          @click="confirmRemovePermission"
          onmouseover="this.style.backgroundColor='#f0f0f0'"
          onmouseout="this.style.backgroundColor='transparent'"
        >
          <Icon icon="ant-design:delete-outlined" style="margin-right: 8px; color: #ff4d4f;" />
          移除权限
        </div>
      </div>
    </a-modal>
    <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
      <!-- 空间权限tab -->
      <a-tab-pane key="space" tab="空间权限">
        <BasicTree
          ref="spaceTreeRef"
          checkable
          :treeData="spaceTreeData"
          :checkedKeys="spaceCheckedKeys"
          :expandedKeys="spaceExpandedKeys"
          :clickRowToExpand="false"
          :checkStrictly="true"
          title="空间权限"
          @check="onSpaceCheck"
          @node-context-menu="handleSpaceContextMenu"
        />
      </a-tab-pane>
      <!-- 专业权限tab -->
      <a-tab-pane key="category" tab="专业权限">
        <div class="category-container">
          <div class="category-section">
            <h4>仪表专业</h4>
            <BasicTree
              ref="measuringTreeRef"
              checkable
              :treeData="measuringTreeData"
              :checkedKeys="measuringCheckedKeys"
              :expandedKeys="measuringExpandedKeys"
              :clickRowToExpand="false"
              :checkStrictly="true"
              title="仪表专业"
              @check="onMeasuringCheck"
              @node-context-menu="handleCategoryContextMenu"
            />
          </div>
          <div class="category-section">
            <h4>设备专业</h4>
            <BasicTree
              ref="equipmentTreeRef"
              checkable
              :treeData="equipmentTreeData"
              :checkedKeys="equipmentCheckedKeys"
              :expandedKeys="equipmentExpandedKeys"
              :clickRowToExpand="false"
              :checkStrictly="true"
              title="设备专业"
              @check="onEquipmentCheck"
              @node-context-menu="handleCategoryContextMenu"
            />
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
    <!--右下角按钮-->
    <template #footer>
      <a-button @click="closeDrawer">取消</a-button>
      <a-button @click="handleSubmit(false)" type="primary" :loading="loading" ghost style="margin-right: 0.8rem">仅保存</a-button>
      <a-button @click="handleSubmit(true)" type="primary" :loading="loading">保存并关闭</a-button>
    </template>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, unref, nextTick } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { BasicDrawer, useDrawer, useDrawerInner } from '/@/components/Drawer';
  // import { BasicTree, useMessage } from '/@/components/Message';
  import { BasicTree } from '/@/components/Tree';
  // import { useMessage } from '/@/components/Message';
  import { message, Modal } from 'ant-design-vue';
  import {
    queryRoleDataPermission,
    getSpaceTree,
    getMeasuringCategoryTree,
    getEquipmentCategoryTree,
    PERMISSION_TYPE,
    removeDataPermission,
    clearDataPermission,
  } from '../role.api';
  import { ROLE_AUTH_CONFIG_KEY } from '/@/enums/cacheEnum';

  // 当前激活的tab
  const activeTab = ref('space');

  // 空间树相关
  const spaceTreeData = ref([]);
  const spaceTreeRef = ref(null);
  const spaceCheckedKeys = ref<any>([]);
  const defaultSpaceCheckedKeys = ref([]);
  const spaceExpandedKeys = ref<any>([]);
  const allSpaceKeys = ref([]);

  // 仪表专业树相关
  const measuringTreeData = ref([]);
  const measuringTreeRef = ref(null);
  const measuringCheckedKeys = ref<any>([]);
  const defaultMeasuringCheckedKeys = ref([]);
  const measuringExpandedKeys = ref<any>([]);
  const allMeasuringKeys = ref([]);

  // 设备专业树相关
  const equipmentTreeData = ref([]);
  const equipmentTreeRef = ref(null);
  const equipmentCheckedKeys = ref<any>([]);
  const defaultEquipmentCheckedKeys = ref([]);
  const equipmentExpandedKeys = ref<any>([]);
  const allEquipmentKeys = ref([]);

  const roleCode = ref('');
  const loading = ref(false);

  // 右键菜单相关
  const contextMenuVisible = ref(false);
  const contextMenuTitle = ref('');
  const contextMenuNodeInfo = ref(null);

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await reset();
    setDrawerProps({ confirmLoading: false, loading: true });
    roleCode.value = data.roleCode || data.record?.roleCode;

    // 初始化空间树
    const spaceResult = await getSpaceTree();
    spaceTreeData.value = formatSpaceTree(spaceResult);
    allSpaceKeys.value = getAllKeys(spaceTreeData.value);

    // 初始化仪表专业树
    const measuringResult = await getMeasuringCategoryTree();
    measuringTreeData.value = measuringResult;
    allMeasuringKeys.value = getAllKeys(measuringTreeData.value);

    // 初始化设备专业树
    const equipmentResult = await getEquipmentCategoryTree();
    equipmentTreeData.value = equipmentResult;
    allEquipmentKeys.value = getAllKeys(equipmentTreeData.value);

    // 初始化角色数据权限
    const permResult = await queryRoleDataPermission(roleCode.value);
    
    // 空间权限：确保与树的key类型一致（字符串）
    spaceCheckedKeys.value = (permResult.spaceIds || []).map(id => String(id));
    defaultSpaceCheckedKeys.value = (permResult.spaceIds || []).map(id => String(id));
    // 专业权限：根据专业树的数据结构分别设置选中状态，并转换为字符串类型
    if (measuringTreeData.value && measuringTreeData.value.length > 0) {
      const measuringIds = filterCategoryIdsByTree(permResult.categoryIds || [], measuringTreeData.value);
      measuringCheckedKeys.value = measuringIds;
      defaultMeasuringCheckedKeys.value = [...measuringIds];
    }
    if (equipmentTreeData.value && equipmentTreeData.value.length > 0) {
      const equipmentIds = filterCategoryIdsByTree(permResult.categoryIds || [], equipmentTreeData.value);
      equipmentCheckedKeys.value = equipmentIds;
      defaultEquipmentCheckedKeys.value = [...equipmentIds];
    }

    // 默认展开所有节点
    spaceExpandedKeys.value = allSpaceKeys.value;
    measuringExpandedKeys.value = allMeasuringKeys.value;
    equipmentExpandedKeys.value = allEquipmentKeys.value;

    setDrawerProps({ loading: false });
  });

  /**
   * 格式化空间树，将id转为字符串以匹配树组件的key类型
   */
  function formatSpaceTree(data) {
    if (!data || !data.length) return [];
    return data.map((item) => ({
      key: String(item.id),
      title: item.spaceName,
      ...item,
      children: item.children ? formatSpaceTree(item.children) : undefined,
    }));
  }

  /**
   * 根据树结构过滤出对应的权限ID
   * @param categoryIds 用户的所有权限ID数组
   * @param treeData 树数据
   * @returns 树中存在的权限ID数组（字符串类型）
   */
  function filterCategoryIdsByTree(categoryIds, treeData) {
    const result = [];

    const traverse = (nodes) => {
      if (!nodes || !nodes.length) return;
      nodes.forEach((node) => {
        // 检查当前节点是否在权限列表中
        if (categoryIds.includes(Number(node.key))) {
          result.push(String(node.key)); // 转换为字符串以匹配树组件的key类型
        }
        // 递归处理子节点
        if (node.children && node.children.length) {
          traverse(node.children);
        }
      });
    };

    traverse(treeData);
    console.log('filterCategoryIdsByTree0---------result---------->', result)
    return result;
  }

  /**
   * 获取树的所有key
   */
  function getAllKeys(data) {
    const keys = [];
    const traverse = (nodes) => {
      if (!nodes || !nodes.length) return;
      nodes.forEach((node) => {
        if (node.id) {
          keys.push(String(node.id));
        }
        if (node.children && node.children.length) {
          traverse(node.children);
        }
      });
    };
    traverse(data);
    return keys;
  }

  /**
   * 数据重置
   */
  function reset() {
    activeTab.value = 'space';
    spaceTreeData.value = [];
    spaceCheckedKeys.value = [];
    defaultSpaceCheckedKeys.value = [];
    spaceExpandedKeys.value = [];
    allSpaceKeys.value = [];
    measuringTreeData.value = [];
    measuringCheckedKeys.value = [];
    defaultMeasuringCheckedKeys.value = [];
    measuringExpandedKeys.value = [];
    allMeasuringKeys.value = [];
    equipmentTreeData.value = [];
    equipmentCheckedKeys.value = [];
    defaultEquipmentCheckedKeys.value = [];
    equipmentExpandedKeys.value = [];
    allEquipmentKeys.value = [];
    roleCode.value = '';
  }

  /**
   * 空间树选中事件
   */
  function onSpaceCheck(checkedKeys) {
    spaceCheckedKeys.value = checkedKeys.checked || checkedKeys;
  }

  /**
   * 仪表专业树选中事件
   */
  function onMeasuringCheck(checkedKeys) {
    measuringCheckedKeys.value = checkedKeys.checked || checkedKeys;
  }

  /**
   * 设备专业树选中事件
   */
  function onEquipmentCheck(checkedKeys) {
    equipmentCheckedKeys.value = checkedKeys.checked || checkedKeys;
  }

  /**
   * 获取树实例
   */
  function getTreeRef(treeRef) {
    const tree = unref(treeRef);
    console.log('return tree;------------------>', treeRef)
    if (!tree) {
      // 当树不存在时，返回一个空的树实例
      return {
        getCheckedKeys: () => [],
        getExpandedKeys: () => [],
        getSelectedKeys: () => []
      };
    }
    return tree;
  }

  /**
   * 提交
   */
  async function handleSubmit(exit) {
    if (loading.value) {
      console.log('请等待上次执行完毕!');
      return;
    }
    loading.value = true;
    try {
      // 保存空间权限 - 使用新的接口规范
      const spaceKeys = getTreeRef(spaceTreeRef).getCheckedKeys();
      const currentSpaceIds = (Array.isArray(spaceKeys) ? spaceKeys : spaceKeys.checked || []).map((key) =>
        isNaN(key) ? key : Number(key),
      );
      const defaultSpaceIds = defaultSpaceCheckedKeys.value || [];

      if (currentSpaceIds.join(',') !== defaultSpaceIds.join(',')) {
        await defHttp.post({
          url: '/bems/dataPermission/assign/space/batch',
          data: { roleCode: roleCode.value, ids: currentSpaceIds },
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 保存专业权限（合并仪表和设备专业）- 使用新的接口规范
      // 只有当树存在且有数据时才尝试获取选中状态
      const measuringKeys = measuringTreeRef.value
        ? getTreeRef(measuringTreeRef).getCheckedKeys()
        : [];
      const equipmentKeys = equipmentTreeRef.value
        ? getTreeRef(equipmentTreeRef).getCheckedKeys()
        : [];
      const currentMeasuringIds = Array.isArray(measuringKeys) ? measuringKeys : measuringKeys.checked || [];
      const currentEquipmentIds = Array.isArray(equipmentKeys) ? equipmentKeys : equipmentKeys.checked || [];
      // 专业树的 key 是字符串类型，需要转换为数字（根据API要求）
      const allCategoryIds = [...new Set([
        ...currentMeasuringIds.map(id => parseInt(id) || 0),
        ...currentEquipmentIds.map(id => parseInt(id) || 0)
      ])];
      // 如果当前没有专业权限，则传入空数组
      const defaultCategoryIds = allCategoryIds.length > 0
        ? defaultMeasuringCheckedKeys.value.filter(id => id !== '').map(id => parseInt(id) || 0).filter(id => id > 0)
        : [];

      if (allCategoryIds.join(',') !== defaultCategoryIds.join(',')) {
        await defHttp.post({
          url: '/bems/dataPermission/assign/category/batch',
          data: { roleCode: roleCode.value, ids: allCategoryIds },
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // message.success('保存成功');

      // 更新默认选中值（转换为字符串类型以匹配显示逻辑）
      defaultSpaceCheckedKeys.value = currentSpaceIds;
      defaultMeasuringCheckedKeys.value = allCategoryIds.map(String);
      defaultEquipmentCheckedKeys.value = allCategoryIds.map(String);

      if (exit) {
        closeDrawer();
      }
    } catch (error) {
      console.error('保存失败:', error);
      // message.error('保存失败');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 切换tab
   */
  function handleTabChange(key) {
    activeTab.value = key;
  }

  /**
   * 右键菜单点击
   */
  function onContextMenuClick({ key }, nodeInfo) {
    if (key === 'remove' && nodeInfo.node.key) {
      const nodeId = nodeInfo.node.key;
      if (activeTab.value === 'space') {
        // 移除空间权限
        Modal.confirm({
          title: '确认移除',
          content: `确定要移除空间 "${nodeInfo.node.title}" 吗？`,
          onOk: async () => {
            try {
              await removeDataPermission(roleCode.value, PERMISSION_TYPE.SPACE, parseInt(nodeId));
              message.success('权限已移除');
              spaceCheckedKeys.value = spaceCheckedKeys.value.filter(id => id !== nodeId);
            } catch (error) {
              console.error('移除权限失败:', error);
              message.error('移除权限失败');
            }
          },
        });
      } else {
        // 移除专业权限
        Modal.confirm({
          title: '确认移除',
          content: `确定要移除专业 "${nodeInfo.node.title}" 吗？`,
          onOk: async () => {
            try {
              await removeDataPermission(roleCode.value, PERMISSION_TYPE.CATEGORY, parseInt(nodeId));
              message.success('权限已移除');
              measuringCheckedKeys.value = measuringCheckedKeys.value.filter(id => id !== nodeId);
              equipmentCheckedKeys.value = equipmentCheckedKeys.value.filter(id => id !== nodeId);
            } catch (error) {
              console.error('移除权限失败:', error);
              message.error('移除权限失败');
            }
          },
        });
      }
    }
  }

  /**
   * 添加右键菜单
   */
  function renderTreeContextMenu(nodes) {
    if (!nodes || !nodes.length) return nodes;
    return nodes.map(node => {
      const newNode = { ...node };
      if (!newNode.extraProps) {
        newNode.extraProps = {};
      }
      newNode.extraProps.onContextMenu = (e, info) => {
        e.preventDefault();
        const menu = Modal.confirm({
          title: '操作',
          content: node.title,
          icon: null,
          okText: null,
          cancelText: null,
          centered: true,
          closable: true,
          wrapClassName: 'context-menu-modal',
        });
      };
      if (newNode.children) {
        newNode.children = renderTreeContextMenu(newNode.children);
      }
      return newNode;
    });
  }

  /**
   * 树菜单选择
   */
  function treeMenuClick({ key }) {
    if (key === 'checkAll') {
      if (activeTab.value === 'space') {
        spaceCheckedKeys.value = allSpaceKeys.value;
      } else {
        // 专业权限需要分别处理
        measuringCheckedKeys.value = allMeasuringKeys.value;
        equipmentCheckedKeys.value = allEquipmentKeys.value;
      }
    } else if (key === 'cancelCheck') {
      if (activeTab.value === 'space') {
        spaceCheckedKeys.value = [];
      } else {
        measuringCheckedKeys.value = [];
        equipmentCheckedKeys.value = [];
      }
    } else if (key === 'openAll') {
      if (activeTab.value === 'space') {
        spaceExpandedKeys.value = allSpaceKeys.value;
      } else {
        measuringExpandedKeys.value = allMeasuringKeys.value;
        equipmentExpandedKeys.value = allEquipmentKeys.value;
      }
      saveLocalOperation('expand', 'openAll');
    } else if (key === 'closeAll') {
      if (activeTab.value === 'space') {
        spaceExpandedKeys.value = [];
      } else {
        measuringExpandedKeys.value = [];
        equipmentExpandedKeys.value = [];
      }
      saveLocalOperation('expand', 'closeAll');
    }
  }

  /**
   * 清除所有权限
   */
  async function handleClearAll() {
    Modal.confirm({
      title: '确认清除',
      content: '确定要清除该角色的所有数据权限吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await clearDataPermission(roleCode.value);
          message.success('权限已清除');
          // 重置所有选中状态
          spaceCheckedKeys.value = [];
          measuringCheckedKeys.value = [];
          equipmentCheckedKeys.value = [];
          defaultSpaceCheckedKeys.value = [];
          defaultMeasuringCheckedKeys.value = [];
          defaultEquipmentCheckedKeys.value = [];
        } catch (error) {
          console.error('清除权限失败:', error);
          message.error('清除权限失败');
        }
      },
    });
  }

  /**
   * 空间树右键菜单
   */
  function handleSpaceContextMenu(nodeInfo) {
    contextMenuTitle.value = `空间: ${nodeInfo.node.title}`;
    contextMenuNodeInfo.value = nodeInfo;
    contextMenuVisible.value = true;
  }

  /**
   * 专业树右键菜单
   */
  function handleCategoryContextMenu(nodeInfo) {
    contextMenuTitle.value = `专业: ${nodeInfo.node.title}`;
    contextMenuNodeInfo.value = nodeInfo;
    contextMenuVisible.value = true;
  }

  /**
   * 确认移除权限
   */
  async function confirmRemovePermission() {
    if (!contextMenuNodeInfo.value) return;

    const nodeId = contextMenuNodeInfo.value.node.key;
    if (activeTab.value === 'space') {
      // 移除空间权限
      try {
        await removeDataPermission(roleCode.value, PERMISSION_TYPE.SPACE, parseInt(nodeId));
        message.success('空间权限已移除');
        spaceCheckedKeys.value = spaceCheckedKeys.value.filter(id => id !== nodeId);
      } catch (error) {
        console.error('移除权限失败:', error);
        message.error('移除权限失败');
      }
    } else {
      // 移除专业权限
      try {
        await removeDataPermission(roleCode.value, PERMISSION_TYPE.CATEGORY, parseInt(nodeId));
        message.success('专业权限已移除');
        measuringCheckedKeys.value = measuringCheckedKeys.value.filter(id => id !== nodeId);
        equipmentCheckedKeys.value = equipmentCheckedKeys.value.filter(id => id !== nodeId);
      } catch (error) {
        console.error('移除权限失败:', error);
        message.error('移除权限失败');
      }
    }

    contextMenuVisible.value = false;
  }

  /**
   * 保存本地操作缓存
   */
  const saveLocalOperation = (key, value) => {
    const localData = localStorage.getItem(ROLE_AUTH_CONFIG_KEY);
    const obj = localData ? JSON.parse(localData) : {};
    obj[key] = value;
    localStorage.setItem(ROLE_AUTH_CONFIG_KEY, JSON.stringify(obj));
  };
</script>

<style lang="less" scoped>
  //update-begin---author:wangshuai ---date:20230202  for：抽屉弹窗标题图标下拉样式------------
  .line {
    height: 1px;
    width: 100%;
    border-bottom: 1px solid #f0f0f0;
  }
  .more-icon {
    font-size: 20px !important;
    color: black;
    display: inline-flex;
    float: right;
    margin-right: 2px;
    cursor: pointer;
  }
  //update-end---author:wangshuai ---date:20230202  for：抽屉弹窗标题图标下拉样式------------

  .category-container {
    display: flex;
    gap: 20px;
    height: calc(100vh - 300px);
  }

  .category-section {
    flex: 1;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    padding: 10px;
    overflow-y: auto;

    h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
    }

    :deep(.jeecg-basic-tree) {
      height: calc(100% - 40px);
    }
  }

  // 右键菜单样式
  :deep(.context-menu-modal) {
    .ant-modal-content {
      border-radius: 4px;
    }
    .ant-modal-body {
      padding: 0;
    }
  }

  // 防止右键菜单触发树的默认行为
  .context-menu-modal {
    pointer-events: none;
  }

  .context-menu-modal > * {
    pointer-events: auto;
  }
</style>
