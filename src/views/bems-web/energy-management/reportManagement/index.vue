<template>
  <div class="report-management">
    <a-tabs v-model:activeKey="activeKey" class="full-height-tabs" destroyInactiveTabPane>
      <!-- <a-tab-pane key="1" tab="水表">
        <fourGenerationWaterMeter :categoryId="'45'" />
      </a-tab-pane> -->
      <a-tab-pane key="2" tab="电表">
        <div class="tab-card">
          <fourGenerationWaterMeter :categoryId="'43'" />
        </div>
      </a-tab-pane>
      <!-- <a-tab-pane key="3" tab="压力变送器">
        <sensorPage :categoryId="'26'" />
      </a-tab-pane>
      <a-tab-pane key="4" tab="流量传感器">
        <sensorPage :categoryId="'36'" />
      </a-tab-pane> -->
      <a-tab-pane key="5" tab="冷源">
        <div class="tab-card">
          <coldSourcePage />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import fourGenerationWaterMeter from './4GWaterMeter/index.vue';
  import sensorPage from './sensorPage/index.vue';
  import coldSourcePage from './coldSource/index.vue';

  const activeKey = ref('2');
  const categoryTreeData = ref([]);
  const spaceTreeData = ref([]);

  onMounted(() => {});
</script>

<style lang="less" scoped>
  .report-management {
    border-radius: 4px;
    height: calc(100% - 40px);
    background-color: #f0f2f5;

    :deep(.full-height-tabs) {
      height: 100%;
      display: flex;
      flex-direction: column;

      .ant-tabs-nav-wrap {
        justify-content: left;
        padding-left: 12px;
      }
      .ant-tabs-nav {
        margin-bottom: 0;
      }

      .ant-tabs-content {
        flex: 1;
        height: 100%;
        overflow-y: auto;

        .ant-tabs-tabpane {
          height: 100%;
        }
      }
    }
  }

  .jeecg-basic-table-form-container {
    padding: 0;
  }

  /* 卡片包裹，与其他页面风格统一 */
  .tab-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    margin: 20px 0;
    overflow: hidden;
  }
</style>
