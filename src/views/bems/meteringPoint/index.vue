<template>
  <div>
    <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" @click="menuClick" style="justify-content: center" />
    <div class="metering-point">
      <div class="space-tree">
        <EnergyFlowTree :energyFlowType="energyFlowTreeType" />
      </div>
      <div class="space-table">
        <MeteringPointList />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import type { MenuProps } from 'ant-design-vue';
  import { energyFlowType } from './index.api';
  import MeteringPointList from './components/MeteringPointList.vue';
  import EnergyFlowTree from './components/EnergyFlowTree.vue';

  const current = ref<string[]>([]);
  const items = ref<MenuProps['items']>([]);
  const energyFlowTreeType = ref<any>({
    type: '',
    name: '',
  });

  const findEnergyFlowType = async () => {
    const result = await energyFlowType();
    items.value = result.map((item) => ({
      label: item.label,
      key: item.value,
    }));
    energyFlowTreeType.value.type = result[0].value;
    energyFlowTreeType.value.name = result[0].label;
    current.value.push(result[0].value);
  };

  const menuClick: MenuProps['onClick'] = ({ item }) => {
    const { key, label } = item.originItemValue;
    energyFlowTreeType.value = { type: key, name: label };
  };

  findEnergyFlowType();
</script>

<style lang="less" scoped>
  .metering-point {
    display: flex;
  }
</style>
