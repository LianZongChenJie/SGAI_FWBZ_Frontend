<template>
  <div class="report-management">
    <a-tabs v-model:activeKey="activeKey" centered class="full-height-tabs">
      <a-tab-pane key="1" tab="4G水表">
        <fourGenerationWaterMeter />
      </a-tab-pane>
      <!-- <a-tab-pane key="2" tab="空间位置">

      </a-tab-pane> -->
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import fourGenerationWaterMeter from '../4GWaterMeter/index.vue'

  const activeKey = ref('1');
  const categoryTreeData = ref([]);
  const spaceTreeData = ref([]);

  onMounted(() => {

  });
</script>

<style lang="less" scoped>
  .report-management {
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
