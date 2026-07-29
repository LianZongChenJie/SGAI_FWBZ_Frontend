<template>
  <a-tabs v-model:activeKey="current" centered style="background-color: #fff">
    <a-tab-pane key="1" tab="仪表类别" v-if="hasPermission('bems:equipmentCategoryList')">
      <EquipmentCategory />
    </a-tab-pane>
    <a-tab-pane key="10" tab="设备类别" v-if="hasPermission('bems:equipmentCategoryList')">
      <DeviceCategory />
    </a-tab-pane>
    <a-tab-pane key="2" tab="空间位置" v-if="hasPermission('bems:spaceList')">
      <Space />
    </a-tab-pane>
    <a-tab-pane key="3" tab="折标煤系数" v-if="hasPermission('bems:standardCoalCoefficientList')">
      <StandardCoalCoefficient />
    </a-tab-pane>
    <a-tab-pane key="4" tab="碳排放因子" v-if="hasPermission('bems:carbonEmissionFactorList')">
      <CarbonEmissionFactor />
    </a-tab-pane>
    <a-tab-pane key="5" tab="能源价格" v-if="hasPermission('bems:energyPriceList')">
      <EnergyPrice />
    </a-tab-pane>
    <a-tab-pane key="6" tab="能源价格-新" v-if="hasPermission('bems:energyPriceList')">
      <EnergyPriceNew />
    </a-tab-pane>
    <a-tab-pane key="7" tab="能介" v-if="hasPermission('bems:energyMediumManageList')">
      <EnergyMediumManage />
    </a-tab-pane>
    <a-tab-pane key="8" tab="计量单位" v-if="hasPermission('bems:unitManagementList')">
      <UnitManage />
    </a-tab-pane>
    <a-tab-pane key="9" tab="能源属性" v-if="hasPermission('bems:energyAttributeManage')">
      <EnergyAttributeManage />
    </a-tab-pane>
    
  </a-tabs>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import EquipmentCategory from './module/equipmentCategory/EquipmentCategoryList.vue';
  import DeviceCategory from './module/deviceCategory/DeviceCategoryList.vue';
  import Space from './module/space/SpaceList.vue';
  import StandardCoalCoefficient from './module/standardCoalCoefficient/StandardCoalCoefficientList.vue';
  import CarbonEmissionFactor from './module/carbonEmissionFactor/CarbonEmissionFactorList.vue';
  import EnergyPrice from './module/energyPrice/EnergyPriceList.vue';
  import EnergyPriceNew from './module/energyPriceNew/EnergyPriceList.vue';
  import EnergyMediumManage from './module/energyMediumManage/EnergyMediumManageList.vue';
  import UnitManage from './module/unitManage/UnitManagementList.vue';
  import EnergyAttributeManage from './module/energyAttributeManage/EnergyAttributeManagementList.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  const { hasPermission } = usePermission();
  const current = ref<string>('1');
  onMounted(() => {
    if (hasPermission('bems:equipmentCategoryList')) {
      current.value = '1';
    } else if (hasPermission('bems:spaceList')) {
      current.value = '2';
    } else if (hasPermission('bems:standardCoalCoefficientList')) {
      current.value = '3';
    } else if (hasPermission('bems:carbonEmissionFactorList')) {
      current.value = '4';
    } else if (hasPermission('bems:energyPriceList')) {
      current.value = '5';
    } else if (hasPermission('bems:energyMediumManageList')) {
      current.value = '6';
    } else if (hasPermission('bems:unitManagementList')) {
      current.value = '7';
    } else if (hasPermission('bems:energyAttributeManage')) {
      current.value = '8';
    }
  });
</script>
<style lang="less" scoped></style>
