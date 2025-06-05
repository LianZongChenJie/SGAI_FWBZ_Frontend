<template>
  <div class="device_index">
    <a-tabs v-model:activeKey="activeKey" centered class="full-height-tabs">
      <a-tab-pane key="1" tab="设备台账">
        <EquipmentLedger />
      </a-tab-pane>
      <a-tab-pane key="2" tab="设备参数">
        <DataModel />
      </a-tab-pane>
      <a-tab-pane key="3" tab="基本信息">
        <DeviceStaticDataConfig />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import EquipmentLedger from '../equipmentLedger/index.vue'
  import DataModel from '../dataModel/index.vue'
  import DeviceStaticDataConfig from '../deviceStaticDataConfig/index.vue'

  const activeKey = ref('1');

</script>

<style lang="less" scoped>
  .device_index {
    border-radius: 4px;
    height: calc(100% - 40px);
    margin: 16px;
    background-color: #fff;

    :deep(.full-height-tabs) {
      height: 100%;
      display: flex;
      flex-direction: column;

      .ant-tabs-nav{
        margin-bottom: 0;
      }

      .ant-tabs-content {
        flex: 1;
        height: 100%;

        .ant-tabs-tabpane {
          height: 100%;
        }
      }
    }
  }
</style>
