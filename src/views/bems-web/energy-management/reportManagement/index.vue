<template>
  <div class="report-management">
    <a-tabs v-model:activeKey="activeKey" centered class="full-height-tabs" destroyInactiveTabPane>
      <a-tab-pane key="1" tab="水表">
        <fourGenerationWaterMeter :categoryId="'45'" />
      </a-tab-pane>
      <a-tab-pane key="2" tab="电表">
        <fourGenerationWaterMeter :categoryId="'43'" />
      </a-tab-pane>
      <a-tab-pane key="3" tab="压力变送器">
        <sensorPage :categoryId="'26'" />
      </a-tab-pane>
      <a-tab-pane key="4" tab="流量传感器">
        <sensorPage :categoryId="'36'" />
      </a-tab-pane>
      <a-tab-pane key="5" tab="冷源">
        <coldSourcePage />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import fourGenerationWaterMeter from './4GWaterMeter/index.vue';
  import sensorPage from './sensorPage/index.vue';
  import coldSourcePage from './coldSource/index.vue';

  const activeKey = ref('1');
  const categoryTreeData = ref([]);
  const spaceTreeData = ref([]);

  onMounted(() => {});
</script>

<style lang="less" scoped>
  .report-management {
    border-radius: 4px;
    height: calc(100% - 40px);
    background-color: #fff;



    :deep(.full-height-tabs) {
      height: 100%;
      display: flex;
      flex-direction: column;
      .ant-tabs-nav-wrap {
        justify-content: left;
      }
      .ant-tabs-nav {
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
