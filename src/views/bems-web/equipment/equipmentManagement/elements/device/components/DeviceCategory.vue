<template>
  <div class="alert-page">
    <div class="card">
      <div class="card-header">
        <h3>⚙️ 设备信息管理</h3>
      </div>
      <div class="card-body">
        <a-tabs v-model:activeKey="activeTabKey">
          <a-tab-pane key="loukong" tab="楼控设备">
            <div class="table-toolbar">
              <div class="header-actions">
                <a-tree-select
                  v-model:value="categorySelectValue"
                  :tree-data="categorySelectTreeData"
                  :field-names="{ children: 'children', label: 'title', value: 'key', key: 'key' }"
                  placeholder="设备类型"
                  allow-clear
                  tree-default-expand-all
                  style="width: 200px; margin-right: 8px;"
                  @change="onCategorySelectChange"
                />
                <a-button type="primary" @click="handleCreate">新建</a-button>
              </div>
            </div>
            <div class="device-space">
              <div class="space-table">
                <DeviceTable
                  ref="deviceTableRef"
                  :categoryKeys="checkedKeys"
                  :category-tree-data="treeData"
                  :space-tree-data="spaceTreeData"
                  @edit="handleEdit"
                  @delete="handleDelete"
                  @detail="handleDetail"
                  @add="handleCreate"
                  @refresh="handleRefresh"
                  @category-filter="onCategoryFilterSelect"
                />
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="camera" tab="摄像头">
            <a-table
              :columns="cameraColumns"
              :data-source="cameraData"
              :pagination="cameraPagination"
              :loading="cameraLoading"
              row-key="indexCode"
              size="small"
              @change="handleCameraTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'cameraType'">
                  <a-tag :color="cameraTypeMap[record.cameraType]?.color">
                    {{ cameraTypeMap[record.cameraType]?.text }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'online'">
                  <a-badge :status="Number(record.online) === 1 ? 'success' : 'default'" :text="Number(record.online) === 1 ? '在线' : '离线'" />
                </template>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="door" tab="门禁通道">
            <div class="table-toolbar">
              <a-button type="primary" :loading="syncLoading" @click="handleSyncAccessControlStatus">
                <SyncOutlined v-if="!syncLoading" />
                同步门禁状态
              </a-button>
            </div>
            <a-table
              :columns="doorColumns"
              :data-source="doorData"
              :pagination="doorPagination"
              :loading="doorLoading"
              row-key="indexCode"
              size="small"
              @change="handleDoorTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'doorState'">
                  <a-tag :color="doorStateMap[record.doorState]?.color">
                    {{ doorStateMap[record.doorState]?.text }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                  <!-- 门状态: 1=开门状态 → 渲染"关闭"和"常闭" -->
                  <template v-if="record.doorState === '1'">
                    <a-button type="link" size="small" :loading="switchLoadingMap[record.indexCode]" @click="handleDoorControl(record, 1)">关闭</a-button>
                    <a-button type="link" size="small" :loading="switchLoadingMap[record.indexCode]" @click="handleDoorControl(record, 3)">常闭</a-button>
                  </template>
                  <!-- 门状态: 2=关门状态 → 渲染"开启"和"常开" -->
                  <template v-else-if="record.doorState === '2'">
                    <a-button type="link" size="small" :loading="switchLoadingMap[record.indexCode]" @click="handleDoorControl(record, 2)">开启</a-button>
                    <a-button type="link" size="small" :loading="switchLoadingMap[record.indexCode]" @click="handleDoorControl(record, 0)">常开</a-button>
                  </template>
                  <!-- 其他状态（初始/离线）不显示控制按钮 -->
                  <a-button type="link" size="small" @click="handleViewDoorDetail(record)">详情</a-button>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="door-controller" tab="门禁控制器">
            <a-table
              :columns="deviceColumns"
              :data-source="deviceData"
              :pagination="devicePagination"
              :loading="deviceLoading"
              row-key="indexCode"
              size="small"
              @change="handleDeviceTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'online'">
                  <a-badge :status="Number(record.online) === 1 ? 'success' : 'default'" :text="Number(record.online) === 1 ? '在线' : '离线'" />
                </template>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="lighting" tab="照明回路" />
        </a-tabs>
      </div>
    </div>
    <DeviceModal @register="registerModal" @success="handleSuccess" />
    <DetailModal ref="detailModalRef" />
    <!-- 门禁事件详情弹窗 -->
    <a-modal v-model:visible="eventModalVisible" title="门禁事件列表" width="900px" :footer="null">
      <div class="event-modal-body">
        <a-table
          :columns="eventColumns"
          :data-source="eventData"
          :pagination="eventPagination"
          :loading="eventLoading"
          row-key="id"
          size="small"
          @change="handleEventTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'inAndOutType'">
              <a-tag :color="inAndOutTypeMap[record.inAndOutType]?.color">
                {{ inAndOutTypeMap[record.inAndOutType]?.text }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch, nextTick, onMounted } from 'vue';
  import DeviceTable from './DeviceTable.vue';
  import { useModal } from '@/components/Modal';
  import DeviceModal from './DeviceModal.vue';
  import DetailModal from './DetailModal.vue';
  import { Modal } from 'ant-design-vue';
  import { deleteDevice, getCategoryTreeData } from '../Device.api';
  import {
    getAccessControlDeviceList,
    getAccessControlDoorList,
    accessControlSwitch,
    getAccessControlEventList,
    syncAccessControlStatus,
    getCameraPageList,
  } from '/@/views/bems-web/safety/security/index.api';
  import { SyncOutlined } from '@ant-design/icons-vue';

  // 添加 deviceTableRef 定义
  const deviceTableRef = ref();
  const detailModalRef = ref();

  // 当前激活的 Tab（默认楼控设备）
  const activeTabKey = ref('loukong');

  const props = defineProps<{
    treeData: any[]; // categoryTreeData
    spaceTreeData: any[]; // spaceTreeData
    getTreeData: Function;
  }>();

  // 监听 treeData 变化，当数据加载后自动勾选所有节点
  watch(
    () => props.treeData,
    (newTreeData) => {
      if (newTreeData && newTreeData.length > 0) {
        // 等待DOM更新后执行
        nextTick(() => {
          // 方法1：简单获取所有节点key
          // const allKeys = getAllNodeKeys(newTreeData);
          // checkedKeys.value = allKeys;

          // // 也可以同时展开所有节点
          // expandedKeys.value = allKeys;

          // console.log('自动勾选了', allKeys.length, '个节点');
        });
      }
    },
    { immediate: true, deep: true }
  );

  // 递归获取所有节点的key
  const getAllNodeKeys = (treeData: any[]): string[] => {
    const keys: string[] = [];

    const traverse = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.key) {
          keys.push(node.key.toString());
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    if (treeData && treeData.length > 0) {
      traverse(treeData);
    }

    return keys;
  };

  const [registerModal, { openModal }] = useModal();

  // 树相关数据
  const selectedKeys = ref<string[]>([]);
  const checkedKeys = ref<string[]>([]);
  const expandedKeys = ref<string[]>([]);

  // 树节点选择事件
  const onSelect = (selectedKeys: string[], info: any) => {
    console.log('selected', selectedKeys, info);
  };

  const onCheck = (checkedKeys: string[], info: any) => {
    console.log('checked', checkedKeys, info.checkedNodes);
  };

  // 查找节点及其所有子节点的key
  const getNodeWithChildrenKeys = (treeData: any[], targetKey: string): string[] => {
    const keys: string[] = [];
    const findAndCollect = (nodes: any[]) => {
      for (const node of nodes) {
        if (String(node.key) === targetKey) {
          keys.push(String(node.key));
          const traverseChildren = (children: any[]) => {
            children.forEach((child) => {
              keys.push(String(child.key));
              if (child.children && child.children.length > 0) {
                traverseChildren(child.children);
              }
            });
          };
          if (node.children && node.children.length > 0) {
            traverseChildren(node.children);
          }
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (findAndCollect(node.children)) return true;
        }
      }
      return false;
    };
    findAndCollect(treeData);
    return keys;
  };

  // 右侧选择框筛选事件 - 同步更新左侧树
  const onCategoryFilterSelect = (value: string | undefined) => {
    if (value) {
      const allKeys = getNodeWithChildrenKeys(categorySelectTreeData.value, value);
      checkedKeys.value = allKeys.length > 0 ? allKeys : [value];
      selectedKeys.value = [value];
    } else {
      checkedKeys.value = [];
      selectedKeys.value = [];
    }
  };

  // 设备类别下拉选择框
  const categorySelectValue = ref<string>();
  const categorySelectTreeData = ref<any[]>([]);

  const fetchCategoryTreeData = async () => {
    try {
      const res = await getCategoryTreeData();
      categorySelectTreeData.value = res || [];
    } catch (error) {
      console.error('获取设备类别树失败:', error);
    }
  };

  // 设备类别选择框变化
  const onCategorySelectChange = (value: string) => {
    if (value) {
      const allKeys = getNodeWithChildrenKeys(categorySelectTreeData.value, value);
      checkedKeys.value = allKeys.length > 0 ? allKeys : [value];
      selectedKeys.value = [value];
    } else {
      checkedKeys.value = [];
      selectedKeys.value = [];
    }
  };

  onMounted(() => {
    fetchCategoryTreeData();
    fetchCameraData();
    fetchDeviceData();
    fetchDoorData();
  });

  /** ============ 摄像头列表（摄像头 Tab） ============ */

  /** 摄像头列表列配置 */
  const cameraColumns = [
    { title: '摄像头名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '监控点类型', dataIndex: 'cameraType', key: 'cameraType', width: 120 },
    { title: '所属区域名称', dataIndex: 'regionName', key: 'regionName', width: 200 },
    { title: '在线状态', dataIndex: 'online', key: 'online', width: 120 },
  ];

  /** 监控点类型映射 (0-枪机, 1-半球, 2-快球, 3-带云台枪机) */
  const cameraTypeMap: Record<string, { text: string; color: string }> = {
    '0': { text: '枪机', color: 'default' },
    '1': { text: '半球', color: 'green' },
    '2': { text: '快球', color: 'blue' },
    '3': { text: '带云台枪机', color: 'orange' },
  };

  const cameraData = ref<any[]>([]);
  const cameraLoading = ref(false);
  const cameraPagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /** 获取摄像头列表 */
  const fetchCameraData = async () => {
    cameraLoading.value = true;
    try {
      const res = await getCameraPageList({
        pageNo: cameraPagination.value.current,
        pageSize: cameraPagination.value.pageSize,
      });
      cameraData.value = res.records || [];
      cameraPagination.value.total = res.total || 0;
      cameraPagination.value.pageSize = res.size || 10;
      cameraPagination.value.current = res.current || 1;
    } catch (error) {
      console.error('获取摄像头列表失败:', error);
    } finally {
      cameraLoading.value = false;
    }
  };

  /** 摄像头列表翻页 */
  const handleCameraTableChange = (pag: any) => {
    cameraPagination.value.current = pag.current;
    cameraPagination.value.pageSize = pag.pageSize;
    fetchCameraData();
  };

  /** ============ 门禁控制器列表（门禁控制器 Tab） ============ */

  /** 控制器列表列配置 */
  const deviceColumns = [
    { title: '设备名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '设备IP', dataIndex: 'ip', key: 'ip', width: 160 },
    { title: '区域名称', dataIndex: 'regionName', key: 'regionName', width: 200 },
    { title: '在线状态', dataIndex: 'online', key: 'online', width: 120 },
  ];

  const deviceData = ref<any[]>([]);
  const deviceLoading = ref(false);
  const devicePagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /** 获取门禁控制器列表 */
  const fetchDeviceData = async () => {
    deviceLoading.value = true;
    try {
      const res = await getAccessControlDeviceList({
        pageNo: devicePagination.value.current,
        pageSize: devicePagination.value.pageSize,
      });
      deviceData.value = res.records || [];
      devicePagination.value.total = res.total || 0;
      devicePagination.value.pageSize = res.size || 10;
      devicePagination.value.current = res.current || 1;
    } catch (error) {
      console.error('获取门禁控制器列表失败:', error);
    } finally {
      deviceLoading.value = false;
    }
  };

  /** 控制器列表翻页 */
  const handleDeviceTableChange = (pag: any) => {
    devicePagination.value.current = pag.current;
    devicePagination.value.pageSize = pag.pageSize;
    fetchDeviceData();
  };

  /** ============ 门禁地点列表（门禁通道 Tab） ============ */

  /** 门禁地点列表列配置 */
  const doorColumns = [
    { title: '门禁地点名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '门禁地点编号', dataIndex: 'doorNo', key: 'doorNo', width: 150 },
    { title: '区域名称', dataIndex: 'regionName', key: 'regionName', width: 200 },
    { title: '门状态', dataIndex: 'doorState', key: 'doorState', width: 120 },
    { title: '操作', key: 'action', width: 200 },
  ];

  /** 门状态映射 (0=初始状态, 1=开门状态, 2=关门状态, 3=离线状态) */
  const doorStateMap: Record<string, { text: string; color: string }> = {
    '0': { text: '初始状态', color: 'default' },
    '1': { text: '开门状态', color: 'green' },
    '2': { text: '关门状态', color: 'blue' },
    '3': { text: '离线状态', color: 'red' },
  };

  const doorData = ref<any[]>([]);
  const doorLoading = ref(false);
  const doorPagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /** 获取门禁地点列表 */
  const fetchDoorData = async () => {
    doorLoading.value = true;
    try {
      const res = await getAccessControlDoorList({
        pageNo: doorPagination.value.current,
        pageSize: doorPagination.value.pageSize,
      });
      doorData.value = res.records || [];
      doorPagination.value.total = res.total || 0;
      doorPagination.value.pageSize = res.size || 10;
      doorPagination.value.current = res.current || 1;
    } catch (error) {
      console.error('获取门禁地点列表失败:', error);
    } finally {
      doorLoading.value = false;
    }
  };

  /** 门禁地点列表翻页 */
  const handleDoorTableChange = (pag: any) => {
    doorPagination.value.current = pag.current;
    doorPagination.value.pageSize = pag.pageSize;
    fetchDoorData();
  };

  /** 同步门禁状态 */
  const syncLoading = ref(false);
  const handleSyncAccessControlStatus = async () => {
    syncLoading.value = true;
    try {
      await syncAccessControlStatus();
      fetchDoorData();
    } catch (error) {
      console.error('同步门禁状态失败:', error);
    } finally {
      syncLoading.value = false;
    }
  };

  /** ============ 门禁事件详情弹窗 ============ */

  const eventModalVisible = ref(false);
  const eventData = ref<any[]>([]);
  const eventLoading = ref(false);
  const eventPagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const currentDeviceIndexCode = ref('');

  const eventColumns = [
    { title: '事件名称', dataIndex: 'eventName', key: 'eventName', width: 200 },
    { title: '门禁地点名称', dataIndex: 'doorName', key: 'doorName', width: 200 },
    { title: '人员姓名', dataIndex: 'personName', key: 'personName', width: 150 },
    { title: '卡号', dataIndex: 'cardNo', key: 'cardNo', width: 150 },
    { title: '进出类型', dataIndex: 'inAndOutType', key: 'inAndOutType', width: 120 },
    { title: '事件时间', dataIndex: 'eventTime', key: 'eventTime', width: 180 },
  ];

  /** 进出类型映射 */
  const inAndOutTypeMap: Record<string, { text: string; color: string }> = {
    '1': { text: '进', color: 'green' },
    '0': { text: '出', color: 'blue' },
    '-1': { text: '未知', color: 'default' },
  };

  const fetchEventData = async () => {
    eventLoading.value = true;
    try {
      const res = await getAccessControlEventList({
        pageNo: eventPagination.value.current,
        pageSize: eventPagination.value.pageSize,
        doorIndexCode: currentDeviceIndexCode.value,
      });
      eventData.value = res.records || [];
      eventPagination.value.total = res.total || 0;
      eventPagination.value.pageSize = res.size || 10;
      eventPagination.value.current = res.current || 1;
    } catch (error) {
      console.error('获取门禁事件列表失败:', error);
    } finally {
      eventLoading.value = false;
    }
  };

  const handleEventTableChange = (pag: any) => {
    eventPagination.value.current = pag.current;
    eventPagination.value.pageSize = pag.pageSize;
    fetchEventData();
  };

  /** 门禁开关操作 loading 映射 */
  const switchLoadingMap = reactive<Record<string, boolean>>({});

  /**
   * 门禁控制操作
   * @param record 门禁点记录
   * @param controlType 控制类型：0-常开，1-门闭，2-门开，3-常闭
   */
  const handleDoorControl = (record: any, controlType: number) => {
    const actionTextMap: Record<number, string> = {
      0: '常开',
      1: '门闭',
      2: '门开',
      3: '常闭',
    };
    const actionText = actionTextMap[controlType] || '操作';

    Modal.confirm({
      title: '确认操作',
      content: `确定要对「${record.name}」执行「${actionText}」操作吗？`,
      onOk: async () => {
        const key = record.indexCode || '';
        switchLoadingMap[key] = true;
        try {
          await accessControlSwitch({
            controlType,
            doorIndexCodes: [key],
          });
          // 刷新门禁地点列表
          fetchDoorData();
        } finally {
          switchLoadingMap[key] = false;
        }
      },
    });
  };

  const handleViewDoorDetail = (record: any) => {
    currentDeviceIndexCode.value = record.indexCode || '';
    eventPagination.value.current = 1;
    eventModalVisible.value = true;
    fetchEventData();
  };

  // 新建设备
  function handleCreate() {
    openModal(true, {
      isUpdate: false,
      showFooter: true,
      categoryTreeData: categorySelectTreeData.value, // 设备类别树（与右侧设备类型下拉同源）
      spaceTreeData: props.spaceTreeData, // 设备位置树
    });
  }

  // 编辑设备
  const handleEdit = (record: any) => {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
      categoryTreeData: categorySelectTreeData.value, // 设备类别树（与右侧设备类型下拉同源）
      spaceTreeData: props.spaceTreeData, // 设备位置树
    });
  };

  // 表单提交成功后的回调
  function handleSuccess() {
    props.getTreeData();
    deviceTableRef.value?.reload();
  }

  // 设备详情
  const handleDetail = (record: any) => {
    console.log('设备详情', record);
    detailModalRef.value?.openModal(record.id);
  };

  const handleDelete = async (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除设备 "${record.deviceName}" 吗？`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          await deleteDevice({ id: record.id }, handleSuccess());
        } catch (error) {
          console.error('删除失败:', error);
        }
      },
    });
  };

  const handleRefresh = (params: any) => {
    console.log('刷新表格', params);
    // 这里实现获取表格数据的逻辑
  };

  // 截断文本函数
  const truncateText = (text, length = 10) => {
    const maxLength = length;
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };
</script>

<style lang="less" scoped>
  .alert-page {
    padding: 0;
  }

  .card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
    overflow: hidden;

    .card-header {
      padding: 18px 22px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #2d3748;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
      }
    }

    .card-body {
      padding: 22px;
    }
  }

  .table-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 14px;
  }

  .device-space {
    display: flex;
    height: 100%;
    width: 100%;

    .space-table {
      flex: 1;
      min-width: 0;
      overflow-x: auto;
    }
  }

  .event-modal-body {
    max-height: 60vh;
    overflow-y: auto;
  }
</style>
