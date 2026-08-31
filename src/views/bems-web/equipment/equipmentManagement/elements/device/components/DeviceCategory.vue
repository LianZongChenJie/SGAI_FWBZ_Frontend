<template>
  <div class="alert-page">
    <div class="card">
      <div class="card-header">
        <h3>⚙️ 设备信息管理</h3>
      </div>
      <div class="card-body">
        <div class="category-tab-bar">
          <button class="category-tab-arrow" @click="scrollCategoryTabs(-1)">
            <LeftOutlined />
          </button>
          <div ref="categoryTabScrollRef" class="category-tab-scroll" @scroll="updateScrollState">
            <button
              v-for="item in categoryTabList"
              :key="item.key"
              :class="['category-tab-item', { active: activeCategoryKey === item.key }]"
              @click="handleCategoryTabChange(item.key)"
            >
              {{ item.title }}
            </button>
            <!-- 固定 tab 项 -->
            <button
              :class="['category-tab-item', { active: activeCategoryKey === 'camera' }]"
              @click="handleFixedTabChange('camera')"
            >
              摄像头
            </button>
            <button
              :class="['category-tab-item', { active: activeCategoryKey === 'door' }]"
              @click="handleFixedTabChange('door')"
            >
              门禁通道
            </button>
            <button
              :class="['category-tab-item', { active: activeCategoryKey === 'door-controller' }]"
              @click="handleFixedTabChange('door-controller')"
            >
              门禁控制器
            </button>
          </div>
          <button class="category-tab-arrow" @click="scrollCategoryTabs(1)">
            <RightOutlined />
          </button>
        </div>

        <!-- 动态设备类型 tab 内容（DeviceTable） -->
        <!-- 只渲染一个 DeviceTable 实例，通过 v-show 控制显示，避免多个实例同时 watch 导致重复调用接口 -->
        <div v-show="activeCategoryKey && !['camera', 'door', 'door-controller'].includes(activeCategoryKey)">
          <div class="table-toolbar">
            <div class="header-actions">
              <a-input
                v-model:value="searchForm.deviceName"
                placeholder="设备名称"
                allow-clear
                style="width: 160px; margin-right: 8px;"
                @pressEnter="handleSearch"
              />
              <a-input
                v-model:value="searchForm.remark"
                placeholder="备注"
                allow-clear
                style="width: 160px; margin-right: 8px;"
                @pressEnter="handleSearch"
              />
              <a-select
                v-model:value="searchForm.runState"
                placeholder="状态"
                allow-clear
                style="width: 120px; margin-right: 8px;"
                :options="runStateOptions"
                @change="handleSearch"
              />
              <a-button type="primary" @click="handleSearch">搜索</a-button>
              <a-button type="primary" @click="handleCreate" style="margin-left: 8px;">新建</a-button>
              <a-button type="primary" :loading="deviceTableExportLoading" @click="handleDeviceTableExport" style="margin-left: 8px;">
                <DownloadOutlined v-if="!deviceTableExportLoading" />
                导出
              </a-button>
            </div>
          </div>
          <div class="device-space">
            <div class="space-table">
              <DeviceTable
                ref="deviceTableRef"
                :categoryKeys="activeCategoryKeys"
                :category-tree-data="treeData"
                :space-tree-data="spaceTreeData"
                :search-params="searchForm"
                @edit="handleEdit"
                @delete="handleDelete"
                @detail="handleDetail"
                @add="handleCreate"
                @refresh="handleRefresh"
              />
            </div>
          </div>
        </div>

        <!-- 摄像头 -->
        <div v-show="activeCategoryKey === 'camera'">
          <div class="table-toolbar">
            <div class="header-actions">
              <a-input
                v-model:value="cameraSearchForm.regionName"
                placeholder="区域名称"
                allow-clear
                style="width: 160px; margin-right: 8px;"
                @pressEnter="handleCameraSearch"
              />
              <a-input
                v-model:value="cameraSearchForm.name"
                placeholder="摄像头名称"
                allow-clear
                style="width: 160px; margin-right: 8px;"
                @pressEnter="handleCameraSearch"
              />
              <a-button type="primary" @click="handleCameraSearch">搜索</a-button>
              <a-button type="primary" :loading="cameraExportLoading" @click="handleCameraExport" style="margin-left: 8px;">
                <DownloadOutlined v-if="!cameraExportLoading" />
                导出
              </a-button>
            </div>
          </div>
          <a-table
            :columns="cameraColumns"
            :data-source="cameraData"
            :pagination="cameraPagination"
            :loading="cameraLoading"
            row-key="indexCode"
            size="small"
            @change="handleCameraTableChange"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'index'">
                {{ (cameraPagination.current - 1) * cameraPagination.pageSize + index + 1 }}
              </template>
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
        </div>

        <!-- 门禁通道 -->
        <div v-show="activeCategoryKey === 'door'">
          <div class="table-toolbar">
            <div class="header-actions">
              <a-input
                v-model:value="doorSearchForm.regionName"
                placeholder="区域名称"
                allow-clear
                style="width: 160px; margin-right: 8px;"
                @pressEnter="handleDoorSearch"
              />
              <a-input
                v-model:value="doorSearchForm.name"
                placeholder="门禁地点名称"
                allow-clear
                style="width: 160px; margin-right: 8px;"
                @pressEnter="handleDoorSearch"
              />
              <a-button type="primary" @click="handleDoorSearch">搜索</a-button>
              <a-button type="primary" :loading="syncLoading" @click="handleSyncAccessControlStatus" style="margin-left: 8px;">
                <SyncOutlined v-if="!syncLoading" />
                同步门禁状态
              </a-button>
              <a-button type="primary" :loading="doorExportLoading" @click="handleDoorExport" style="margin-left: 8px;">
                <DownloadOutlined v-if="!doorExportLoading" />
                导出
              </a-button>
            </div>
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
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'index'">
                {{ (doorPagination.current - 1) * doorPagination.pageSize + index + 1 }}
              </template>
              <template v-if="column.key === 'doorState'">
                <a-tag :color="doorStateMap[record.doorState]?.color">
                  {{ doorStateMap[record.doorState]?.text }}
                </a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <template v-if="record.doorState === '1'">
                  <a-button type="link" size="small" :loading="switchLoadingMap[record.indexCode]" @click="handleDoorControl(record, 1)">关闭</a-button>
                  <a-button type="link" size="small" :loading="switchLoadingMap[record.indexCode]" @click="handleDoorControl(record, 3)">常闭</a-button>
                </template>
                <template v-else-if="record.doorState === '2'">
                  <a-button type="link" size="small" :loading="switchLoadingMap[record.indexCode]" @click="handleDoorControl(record, 2)">开启</a-button>
                  <a-button type="link" size="small" :loading="switchLoadingMap[record.indexCode]" @click="handleDoorControl(record, 0)">常开</a-button>
                </template>
                <a-button type="link" size="small" @click="handleViewDoorDetail(record)">详情</a-button>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 门禁控制器 -->
        <div v-show="activeCategoryKey === 'door-controller'">
          <div class="table-toolbar">
            <div class="header-actions">
              <a-input
                v-model:value="deviceSearchForm.regionName"
                placeholder="区域名称"
                allow-clear
                style="width: 160px; margin-right: 8px;"
                @pressEnter="handleDeviceSearch"
              />
              <a-input
                v-model:value="deviceSearchForm.name"
                placeholder="设备名称"
                allow-clear
                style="width: 160px; margin-right: 8px;"
                @pressEnter="handleDeviceSearch"
              />
              <a-button type="primary" @click="handleDeviceSearch">搜索</a-button>
              <a-button type="primary" :loading="deviceExportLoading" @click="handleDeviceExport" style="margin-left: 8px;">
                <DownloadOutlined v-if="!deviceExportLoading" />
                导出
              </a-button>
            </div>
          </div>
          <a-table
            :columns="deviceColumns"
            :data-source="deviceData"
            :pagination="devicePagination"
            :loading="deviceLoading"
            row-key="indexCode"
            size="small"
            @change="handleDeviceTableChange"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'index'">
                {{ (devicePagination.current - 1) * devicePagination.pageSize + index + 1 }}
              </template>
              <template v-if="column.key === 'online'">
                <a-badge :status="Number(record.online) === 1 ? 'success' : 'default'" :text="Number(record.online) === 1 ? '在线' : '离线'" />
              </template>
            </template>
          </a-table>
        </div>
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
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index'">
              {{ (eventPagination.current - 1) * eventPagination.pageSize + index + 1 }}
            </template>
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
  import { ref, reactive, watch, computed, nextTick, onMounted } from 'vue';
  import DeviceTable from './DeviceTable.vue';
  import { useModal } from '@/components/Modal';
  import DeviceModal from './DeviceModal.vue';
  import DetailModal from './DetailModal.vue';
  import { Modal } from 'ant-design-vue';
  import { defHttp } from '/@/utils/http/axios';
  import { deleteDevice, getCategoryTreeData } from '../Device.api';
  import {
    getAccessControlDeviceList,
    getAccessControlDoorList,
    accessControlSwitch,
    getAccessControlEventList,
    syncAccessControlStatus,
    getCameraPageList,
  } from '/@/views/bems-web/safety/security/index.api';
  import { SyncOutlined, LeftOutlined, RightOutlined, DownloadOutlined } from '@ant-design/icons-vue';

  /** 通用导出方法 */
  const downloadBlob = (res: any, name: string) => {
    const blobOptions = { type: 'application/vnd.ms-excel' };
    const fileSuffix = '.xlsx';
    const url = window.URL.createObjectURL(new Blob([res], blobOptions));
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', name + fileSuffix);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // 添加 deviceTableRef 定义
  const deviceTableRef = ref();
  const detailModalRef = ref();

  // ===== 楼控设备 - 动态设备类型 Tab =====
  const categoryTabList = ref<any[]>([]);
  const activeCategoryKey = ref<string>('');
  const categoryTabScrollRef = ref<HTMLDivElement>();
  const canScrollLeft = ref(false);
  const canScrollRight = ref(false);

  /** 当前激活 tab 对应的 categoryKeys（含子节点） */
  // 固定 tab 的 key，这些 tab 不需要调用设备列表接口
  const FIXED_TAB_KEYS = ['camera', 'door', 'door-controller', 'lighting'];

  const activeCategoryKeys = computed(() => {
    if (!activeCategoryKey.value) return [];
    // 固定 tab 不需要设备列表接口，返回空数组避免触发 DeviceTable 的 watch
    if (FIXED_TAB_KEYS.includes(activeCategoryKey.value)) return [];
    const node = categoryTabList.value.find((n) => String(n.key) === String(activeCategoryKey.value));
    console.log('node',node, categoryTabList.value);
    if (!node) return [activeCategoryKey.value];
    // 收集该节点及其所有子节点的 key
    const keys: string[] = [String(node.key)];
    const collectChildren = (children: any[]) => {
      if (!children) return;
      children.forEach((child) => {
        keys.push(String(child.key));
        console.log('child',child);
        if (child.children && child.children.length > 0) {
          collectChildren(child.children);
        }
      });
    };
    if (node.children && node.children.length > 0) {
      collectChildren(node.children);
    }

    console.log('keys',keys);
    return keys;
  });

  /** Tab 切换（动态设备类型） */
  const handleCategoryTabChange = (key: string) => {
    activeCategoryKey.value = key;
    // 不需要手动 reload，DeviceTable 的 watch(categoryKeys) 会自动触发
  };

  /** Tab 切换（固定 tab：摄像头/门禁通道/门禁控制器） */
  const handleFixedTabChange = (key: string) => {
    activeCategoryKey.value = key;
  };

  /** 横向滚动 tab 条 */
  const scrollCategoryTabs = (direction: number) => {
    const el = categoryTabScrollRef.value;
    if (!el) return;
    el.scrollBy({ left: direction * 200, behavior: 'smooth' });
  };

  /** 更新箭头可用状态 */
  const updateScrollState = () => {
    const el = categoryTabScrollRef.value;
    if (!el) return;
    canScrollLeft.value = el.scrollLeft > 0;
    canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
  };

  // 搜索表单
  const searchForm = reactive({
    deviceName: '',
    spaceName: '',
    remark: '',
    runState: undefined as string | undefined,
  });

  // 状态下拉选项
  const runStateOptions = [
    { label: '在线', value: '在线' },
    { label: '离线', value: '离线' },
  ];

  // 搜索按钮：触发 DeviceTable 重新加载
  const handleSearch = () => {
    deviceTableRef.value?.reload();
  };

  // 楼控设备导出 loading
  const deviceTableExportLoading = ref(false);

  /** 楼控设备导出 */
  const handleDeviceTableExport = async () => {
    deviceTableExportLoading.value = true;
    try {
      const sp = searchForm;
      const res = await defHttp.get({
        url: '/fwbz/deviceData/deviceExport',
        params: {
          deviceName: sp.deviceName || undefined,
          remark: sp.remark || undefined,
          runState: sp.runState || undefined,
          categoryIds: activeCategoryKeys.value ? activeCategoryKeys.value.join(',') : undefined,
        },
        responseType: 'blob',
      }, { isTransformResponse: false });
      downloadBlob(res, '设备列表');
    } catch (error) {
      console.error('导出设备列表失败:', error);
    } finally {
      deviceTableExportLoading.value = false;
    }
  };

  const props = defineProps<{
    treeData: any[]; // categoryTreeData
    spaceTreeData: any[]; // spaceTreeData
    getTreeData: Function;
  }>();

  // 监听 treeData 变化
  watch(
    () => props.treeData,
    (newTreeData) => {
      if (newTreeData && newTreeData.length > 0) {
        nextTick(() => {});
      }
    },
    { immediate: true, deep: true }
  );

  const [registerModal, { openModal }] = useModal();

  // 设备类别树数据（用于新建/编辑弹窗）
  const categorySelectTreeData = ref<any[]>([]);

  const fetchCategoryTreeData = async () => {
    try {
      const res = await getCategoryTreeData();
      categorySelectTreeData.value = res || [];

      const flattenTree = (list: any[]): any[] => {
        return list.reduce((result, item) => {
          // 解构时排除children，只保留需要的三个字段
          const { children, ...rest } = item
          return result.concat(rest, flattenTree(children || []))
        }, [])
}
      // 用接口返回的顶层节点生成 tab 列表
      categoryTabList.value = (flattenTree(res) || []).map((item: any) => ({
        key: String(item.key),
        title: item.title,
        value: item.value,
        children: item.children || [],
      }));
      // 默认激活第一个 tab
      if (categoryTabList.value.length > 0 && !activeCategoryKey.value) {
        activeCategoryKey.value = categoryTabList.value[0].key;
      }
    } catch (error) {
      console.error('获取设备类别树失败:', error);
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
    { title: '序号', key: 'index', width: 70 },
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
  const cameraSearchForm = reactive({
    regionName: '',
    name: '',
  });
  const cameraExportLoading = ref(false);

  /** 获取摄像头列表 */
  const fetchCameraData = async () => {
    cameraLoading.value = true;
    try {
      const res = await getCameraPageList({
        pageNo: cameraPagination.value.current,
        pageSize: cameraPagination.value.pageSize,
        regionName: cameraSearchForm.regionName || undefined,
        name: cameraSearchForm.name || undefined,
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

  /** 摄像头搜索 */
  const handleCameraSearch = () => {
    cameraPagination.value.current = 1;
    fetchCameraData();
  };

  /** 摄像头导出 */
  const handleCameraExport = async () => {
    cameraExportLoading.value = true;
    try {
      const res = await defHttp.get({
        url: '/sgai-fwbz-dev/fwbz/hikvision/camera/export',
        params: {
          regionName: cameraSearchForm.regionName || undefined,
          name: cameraSearchForm.name || undefined,
        },
        responseType: 'blob',
      }, { isTransformResponse: false });
      downloadBlob(res, '摄像头列表');
    } catch (error) {
      console.error('导出摄像头列表失败:', error);
    } finally {
      cameraExportLoading.value = false;
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
    { title: '序号', key: 'index', width: 70 },
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
  const deviceSearchForm = reactive({
    regionName: '',
    name: '',
  });
  const deviceExportLoading = ref(false);

  /** 获取门禁控制器列表 */
  const fetchDeviceData = async () => {
    deviceLoading.value = true;
    try {
      const res = await getAccessControlDeviceList({
        pageNo: devicePagination.value.current,
        pageSize: devicePagination.value.pageSize,
        regionName: deviceSearchForm.regionName || undefined,
        name: deviceSearchForm.name || undefined,
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

  /** 控制器搜索 */
  const handleDeviceSearch = () => {
    devicePagination.value.current = 1;
    fetchDeviceData();
  };

  /** 控制器导出 */
  const handleDeviceExport = async () => {
    deviceExportLoading.value = true;
    try {
      const res = await defHttp.get({
        url: '/sgai-fwbz-dev/fwbz/hikvision/acsDevice/export',
        params: {
          regionName: deviceSearchForm.regionName || undefined,
          name: deviceSearchForm.name || undefined,
        },
        responseType: 'blob',
      }, { isTransformResponse: false });
      downloadBlob(res, '门禁控制器列表');
    } catch (error) {
      console.error('导出门禁控制器列表失败:', error);
    } finally {
      deviceExportLoading.value = false;
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
    { title: '序号', key: 'index', width: 70 },
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
  const doorSearchForm = reactive({
    regionName: '',
    name: '',
  });
  const doorExportLoading = ref(false);

  /** 获取门禁地点列表 */
  const fetchDoorData = async () => {
    doorLoading.value = true;
    try {
      const res = await getAccessControlDoorList({
        pageNo: doorPagination.value.current,
        pageSize: doorPagination.value.pageSize,
        regionName: doorSearchForm.regionName || undefined,
        name: doorSearchForm.name || undefined,
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

  /** 门禁地点搜索 */
  const handleDoorSearch = () => {
    doorPagination.value.current = 1;
    fetchDoorData();
  };

  /** 门禁通道导出 */
  const handleDoorExport = async () => {
    doorExportLoading.value = true;
    try {
      const res = await defHttp.get({
        url: '/sgai-fwbz-dev/fwbz/hikvision/door/export',
        params: {
          regionName: doorSearchForm.regionName || undefined,
          name: doorSearchForm.name || undefined,
        },
        responseType: 'blob',
      }, { isTransformResponse: false });
      downloadBlob(res, '门禁通道列表');
    } catch (error) {
      console.error('导出门禁通道列表失败:', error);
    } finally {
      doorExportLoading.value = false;
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
    { title: '序号', key: 'index', width: 70 },
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

  /* 楼控设备 - 动态设备类型 Tab 条 */
  .category-tab-bar {
    display: flex;
    align-items: center;
    margin-bottom: 14px;
    border-bottom: 1px solid #f0f0f0;
    position: relative;
  }

  .category-tab-arrow {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #666;
    transition: all 0.2s;

    &:hover {
      color: #1677ff;
      border-color: #1677ff;
    }
  }

  .category-tab-scroll {
    flex: 1;
    overflow-x: auto;
    display: flex;
    align-items: center;
    gap: 0;
    scrollbar-width: none; /* Firefox */
    padding: 0 4px;

    &::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
    }
  }

  .category-tab-item {
    flex-shrink: 0;
    padding: 8px 16px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      color: #1677ff;
    }

    &.active {
      color: #1677ff;
      border-bottom-color: #1677ff;
      font-weight: 500;
    }
  }
</style>
