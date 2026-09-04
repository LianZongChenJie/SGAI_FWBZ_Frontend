<template>
  <div class="equip-page">
    <div class="stat-cards">
      <StatCard
        label="设备总数"
        :value="statData.count"
        change-text=""
        trend=""
        color="blue"
        :icon="DeviceTotalIcon"
      />
      <StatCard
        label="在线数量"
        :value="statData.online"
        change-text=""
        trend=""
        color="green"
        :icon="OnlineIcon"
      />
      <StatCard
        label="仪表数量"
        :value="statData.measuringCount"
        change-text=""
        trend=""
        color="orange"
        :icon="MeterIcon"
      />
      <StatCard
        label="运行数量"
        :value="statData.equipmentCount"
        change-text=""
        trend=""
        color="purple"
        :icon="RunningCountIcon"
      />
    </div>
    <div class="equip-management">
      <DeviceCategory
        :tree-data="categoryTreeData"
        :space-tree-data="spaceTreeData"
        :get-tree-data="getTreeData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { StatCard } from '/@/views/bems-web/components';
import DeviceCategory from './elements/device/components/DeviceCategory.vue';
import { getDeviceRunStateStatistics } from './index.api'
import { categoryTree, spaceTree2 } from './elements/device/Device.api';

// 自定义 emoji 图标组件
const DeviceTotalIcon = () => h('span', { style: 'font-size: 20px;' }, '📊')
const OnlineIcon = () => h('span', { style: 'font-size: 20px;' }, '📶')
const MeterIcon = () => h('span', { style: 'font-size: 20px;' }, '📏')
const RunningCountIcon = () => h('span', { style: 'font-size: 20px;' }, '⚙️')

const statData = ref({
  count: '--',
  online: '--',
  measuringCount: '--',
  equipmentCount: '--',
})

const categoryTreeData = ref<any[]>([])
const spaceTreeData = ref<any[]>([])

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

// 获取设备类别树数据
const getCategoryTree = async () => {
  try {
    const res = await categoryTree({});
    categoryTreeData.value = res;
  } catch (error) {
    console.error('获取设备类别失败:', error);
  }
};

// 获取设备位置树数据
const getSpaceTree = async () => {
  try {
    const res = await spaceTree2({
      categoryIds: getAllNodeKeys(categoryTreeData.value).join(','),
      deviceType: 1,
    });
    spaceTreeData.value = res;
  } catch (error) {
    console.error('获取设备位置失败:', error);
  }
};

const getTreeData = async () => {
  await getCategoryTree();
  await getSpaceTree();
};

const fetchStatData = async () => {
  try {
    const res = await getDeviceRunStateStatistics({})
    Object.assign(statData.value, res)
  } catch (error) {
    console.error('获取设备运行状态统计失败:', error)
  }
}

onMounted(async () => {
  fetchStatData()
  await getCategoryTree();
  await getSpaceTree();
})
</script>

<style scoped lang="less">
.equip-page {

  .stat-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 5px;
  }

  .equip-management {
    margin-top: 20px;
  }
}
</style>
