<template>
  <div class="control-panel">
    <a-card :title="title" :bordered="false">
      <template #extra>
        <span class="panel-tag">{{ tag }}</span>
      </template>

      <div class="control-grid">
        <!-- 空调机组控制 -->
        <div class="control-section">
          <h4 class="section-title">�️ 空调机组控制</h4>
          <a-table
            :columns="acColumns"
            :data-source="acData"
            :loading="acLoading"
            :pagination="acPagination"
            row-key="id"
            :scroll="{ y: tableMaxHeight }"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'spaceId'">
                {{ findTreeNodePath(spaceTreeData, record.spaceId) || record.spaceId }}
              </template>
              <template v-if="column.key === 'runState'">
                <a-tag v-if="record.runState === '在线'" color="green">{{ record.runState }}</a-tag>
                <a-tag v-else color="red">{{ record.runState }}</a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click="handleControl('ac', record)">控制</a-button>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 照明回路控制 -->
        <div class="control-section">
          <h4 class="section-title">💡 照明回路控制</h4>
          <a-table
            :columns="lightingColumns"
            :data-source="lightingData"
            :loading="lightingLoading"
            :pagination="lightingPagination"
            row-key="id"
            :scroll="{ y: tableMaxHeight }"
            @change="handleLightingTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === '开启' ? 'green' : 'orange'">
                  {{ record.status }}
                </a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <div class="lighting-actions">
                  <a-button type="link" size="small" @click="handleLightingOpen(record)">全开</a-button>
                  <a-button type="link" danger size="small" @click="handleLightingClose(record)">全关</a-button>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-card>

    <!-- 空调机组控制弹窗 -->
    <a-modal
      v-model:open="controlVisible"
      title="❄️ 空调机组控制"
      width="800px"
      :mask-closable="false"
      @ok="controlVisible = false"
      ok-text="关闭"
      :cancel-button-props="{ hidden: true }"
    >
      <a-spin :spinning="controlPointLoading">
        <!-- 控制点位列表 -->
        <a-descriptions v-if="controlPointData.length > 0" bordered :column="2" size="small" :label-style="{ width: '150px' }">
          <a-descriptions-item v-for="item in controlPointData" :key="item.id" :label="item.attributeName || '--'">
            <template v-if="item.valueType === 'BOOL'">
              <a-switch :checked="item.value === '1'" :loading="item._loading" @change="(checked: boolean) => handleSwitchChange(item, checked)" />
            </template>
            <template v-else>
              <div class="input-with-btn">
                <a-input v-model:value="item._editValue" :placeholder="item.value ?? '--'" style="width: 120px" />
                <span v-if="item.unit" style="margin-left: 4px">{{ item.unit }}</span>
                <a-button type="primary" :loading="item._loading" style="margin-left: 8px" @click="handleInputConfirm(item)"> 确定 </a-button>
              </div>
            </template>
          </a-descriptions-item>
        </a-descriptions>
        <a-empty v-else description="暂无可控制点位" />
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { selectDevice, getSpaceTree, findDeviceControlPoint, realTimeData } from '../acTab/index.api';
  import { getAreaListPageApi, setAreaOpenApi, setAreaCloseApi } from '@/api/baseSettingBqZm';

  defineOptions({ name: 'ControlPanel' });

  // ===== Props =====
  withDefaults(
    defineProps<{
      title?: string;
      tag?: string;
    }>(),
    {
      title: '�️ 远程控制面板',
      tag: '实时控制',
    }
  );

  // ===== 表格最大高度（两边列表对齐） =====
  const tableMaxHeight = 'calc(100vh - 380px)';

  // ===== 位置树映射 =====
  const spaceTreeData = ref<any[]>([]);
  const loadSpaceTree = async () => {
    try {
      const res = await getSpaceTree();
      const rawList = Array.isArray(res) ? res : res.data || res.records || [];
      spaceTreeData.value = transformTreeData(rawList);
    } catch (e) {
      console.error('加载空间树数据失败:', e);
    }
  };

  /** 将接口返回的树数据转换为 a-tree 格式 */
  const transformTreeData = (nodes: any[]): any[] => {
    if (!nodes || !Array.isArray(nodes)) return [];
    return nodes.map((node) => {
      const children = [
        ...(node.child ? transformTreeData(node.child) : []),
        ...(node.device
          ? node.device.map((d: any) => ({
              key: `device-${d.id}`,
              title: d.deviceName,
              isLeaf: true,
              rawDevice: d,
            }))
          : []),
      ];
      return {
        key: `space-${node.spaceId}`,
        title: node.spaceName,
        children,
        rawSpace: node,
      };
    });
  };

  const findTreeNodePath = (treeData: any[], key: string | number, separator = '-'): string => {
    if (!treeData || !Array.isArray(treeData)) return '';
    const findPath = (nodes: any[], path: string[]): string[] | null => {
      for (const node of nodes) {
        const label = node.title || node.value || node.label || '';
        const currentPath = [...path, label];
        const nodeKey = String(node.key);
        const searchKey = String(key);
        if (nodeKey === searchKey || nodeKey === `space-${searchKey}` || nodeKey.endsWith(`-${searchKey}`)) {
          return currentPath;
        }
        if (node.children && Array.isArray(node.children)) {
          const result = findPath(node.children, currentPath);
          if (result) return result;
        }
      }
      return null;
    };
    const result = findPath(treeData, []);
    return result ? result.join(separator) : '';
  };

  // ===== 空调机组数据 =====
  const acData = ref<any[]>([]);
  const acLoading = ref(false);
  const acCurrentPage = ref(1);
  const acPageSize = ref(10);
  const acTotal = ref(0);

  const acPagination = computed(() => ({
    current: acCurrentPage.value,
    pageSize: acPageSize.value,
    total: acTotal.value,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
  }));

  const loadAcList = async () => {
    acLoading.value = true;
    try {
      const res = await selectDevice({
        pageNo: acCurrentPage.value,
        pageSize: acPageSize.value,
        categoryIds: '8',
      });
      acData.value = res?.records || [];
      acTotal.value = res?.total || 0;
    } catch (error) {
      console.error('加载空调机组列表失败:', error);
      acData.value = [];
      acTotal.value = 0;
    } finally {
      acLoading.value = false;
    }
  };

  // 空调表格分页变化
  const handleTableChange = (pag: any) => {
    acCurrentPage.value = pag.current;
    acPageSize.value = pag.pageSize;
    loadAcList();
  };

  // ===== 照明回路数据（从 API 获取真实数据） =====
  const lightingData = ref<any[]>([]);
  const lightingLoading = ref(false);
  const lightingCurrentPage = ref(1);
  const lightingPageSize = ref(10);
  const lightingTotal = ref(0);

  const lightingPagination = computed(() => ({
    current: lightingCurrentPage.value,
    pageSize: lightingPageSize.value,
    total: lightingTotal.value,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
  }));

  const loadLightingList = async () => {
    lightingLoading.value = true;
    try {
      const res = await getAreaListPageApi({
        pageNo: lightingCurrentPage.value,
        pageSize: lightingPageSize.value,
        column: 'createTime',
        order: 'desc',
      });
      // 映射接口数据到列表字段
      lightingData.value = (res?.records || []).map((item: any) => ({
        id: item.id,
        code: item.areaCode || '--',
        location: item.areaName || '--',
        status: item.status || '关闭',
        brightness: item.brightness ?? null,
      }));
      lightingTotal.value = res?.total || 0;
    } catch (error) {
      console.error('加载照明回路列表失败:', error);
      lightingData.value = [];
      lightingTotal.value = 0;
    } finally {
      lightingLoading.value = false;
    }
  };

  // 照明表格分页变化
  const handleLightingTableChange = (pag: any) => {
    lightingCurrentPage.value = pag.current;
    lightingPageSize.value = pag.pageSize;
    loadLightingList();
  };

  // ===== 表格列定义 =====
  const acColumns = [
    { title: '机组编号', dataIndex: 'deviceCode', key: 'deviceCode', width: 120 },
    { title: '位置', dataIndex: 'spaceId', key: 'spaceId', width: 120 },
    { title: '当前状态', dataIndex: 'runState', key: 'runState', width: 90 },
    { title: '操作', key: 'action', width: 70 },
  ];

  const lightingColumns = [
    { title: '名称', dataIndex: 'location', key: 'location', width: 120 },
    { title: '区域编号', dataIndex: 'code', key: 'code', width: 120 },
    { title: '当前状态', key: 'status', width: 100 },
    { title: '操作', key: 'action', width: 110 },
  ];

  // ===== 设备控制点位类型定义 =====
  interface DeviceAttribute {
    acquisitionCoding?: string;
    attributeCode?: string;
    attributeName?: string;
    deviceId?: number;
    id?: number;
    unit?: string;
    value?: string;
    valueType?: string;
    [property: string]: any;
  }

  // ===== 空调机组控制弹窗 =====
  const controlVisible = ref(false);
  const controlPointData = ref<DeviceAttribute[]>([]);
  const controlPointLoading = ref(false);

  const handleControl = async (type: 'ac' | 'lighting', record: any) => {
    if (type === 'ac') {
      controlPointData.value = [];
      controlVisible.value = true;

      const deviceId = record.id;
      if (!deviceId) return;

      controlPointLoading.value = true;
      try {
        const pointRes: any = await findDeviceControlPoint({ deviceId });
        const pointList = pointRes?.records || pointRes?.data || pointRes || [];
        const list: DeviceAttribute[] = Array.isArray(pointList) ? pointList : [];
        list.forEach((item: DeviceAttribute) => {
          item._editValue = item.value || '';
          item._loading = false;
        });
        controlPointData.value = list;
      } catch (e) {
        console.error('获取设备控制点位失败:', e);
      } finally {
        controlPointLoading.value = false;
      }
    }
  };

  /** 开关切换处理 */
  const handleSwitchChange = (item: DeviceAttribute, checked: boolean) => {
    const actionText = checked ? '开启' : '关闭';
    const pointName = item.attributeName || '该点位';
    Modal.confirm({
      title: '确认操作',
      content: '确定要' + actionText + pointName + '吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        item._loading = true;
        try {
          await realTimeData({
            tagid: item.acquisitionCoding,
            pv: checked,
          });
          item.value = checked ? '1' : '0';
        } catch (e) {
          console.error('写入实时数据失败:', e);
          message.error(actionText + '失败');
        } finally {
          item._loading = false;
        }
      },
    });
  };

  /** 输入框确认处理 */
  const handleInputConfirm = (item: DeviceAttribute) => {
    const newValue = item._editValue;
    const pointName = item.attributeName || '该点位';
    Modal.confirm({
      title: '确认操作',
      content: '确定要将' + pointName + '修改为 ' + newValue + ' 吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        item._loading = true;
        try {
          await realTimeData({
            tagid: item.acquisitionCoding,
            pv: newValue,
          });
          item.value = newValue;
        } catch (e) {
          console.error('写入实时数据失败:', e);
          message.error('修改失败');
        } finally {
          item._loading = false;
        }
      },
    });
  };

  // ===== 照明回路全开全关操作 =====
  /** 照明回路全开 */
  const handleLightingOpen = (record: any) => {
    const areaName = record.code || record.location || '该区域';
    Modal.confirm({
      title: '确认操作',
      content: '确定要将【' + areaName + '】设置为开启状态吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await setAreaOpenApi({ id: record.id });
          message.success('全开指令已下发');
          loadLightingList();
        } catch (error) {
          console.error('照明全开失败:', error);
          message.error('全开指令下发失败');
        }
      },
    });
  };

  /** 照明回路全关 */
  const handleLightingClose = (record: any) => {
    const areaName = record.code || record.location || '该区域';
    Modal.confirm({
      title: '确认操作',
      content: '确定要将【' + areaName + '】设置为关闭状态吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await setAreaCloseApi({ id: record.id });
          message.success('全关指令已下发');
          loadLightingList();
        } catch (error) {
          console.error('照明全关失败:', error);
          message.error('全关指令下发失败');
        }
      },
    });
  };

  // ===== 初始化 =====
  onMounted(() => {
    loadSpaceTree();
    loadAcList();
    loadLightingList();
  });
</script>

<style scoped lang="less">
  .control-panel {
    width: 100%;
  }

  .control-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .control-section {
    min-width: 0;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
      margin-bottom: 12px;
    }
  }

  .lighting-actions {
    display: flex;
    gap: 8px;
  }

  .panel-tag {
    font-size: 14px;
    color: #1677ff;
    background: #e6f4ff;
    padding: 2px 12px;
    border-radius: 12px;
  }

  .input-with-btn {
    display: flex;
    align-items: center;
  }

  :deep(.ant-descriptions-item-label) {
    white-space: normal !important;
    word-break: break-word;
  }
</style>
