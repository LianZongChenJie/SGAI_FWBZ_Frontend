<template>
  <div class="monitoring-source-main-box">
    <a-tabs v-model:activeKey="activeKey" centered class="full-height-tabs" :destroyInactiveTabPane="true">
      <a-tab-pane key="3" tab="变配电运行监控">
        <substationAndDistribution />
      </a-tab-pane>
      <!-- <a-tab-pane key="1" tab="冷源监控与分析(虚拟)">
        <ColdSourceMonitoring />
      </a-tab-pane> -->
      <!-- <a-tab-pane key="2" tab="环境监控与分析(虚拟)">
        <EnvironmentalMonitoring />
      </a-tab-pane> -->

      <!-- <a-tab-pane key="4" tab="照明监控">
        模式化
      </a-tab-pane> -->
      <!-- <a-tab-pane key="5" tab="给排水(虚拟)">
        <WaterSupplyAndDrainage />
      </a-tab-pane> -->
      <a-tab-pane key="6" tab="供水保障监控">
        <PressureSensor :apiParams="'26'" />
      </a-tab-pane>
      <a-tab-pane key="7" tab="供冷供热保障监控">
        <PressureSensor :apiParams="'36'" :isFilter="true" />
      </a-tab-pane>
      <a-tab-pane key="8" tab="空调机组">
        <MyTopoComponents :path="'kongTiao.json'" :categoryId="'8'" :deviceList="kongTiaoDeviceList" />
      </a-tab-pane>
      <a-tab-pane key="9" tab="新风机组">
        <MyTopoComponents :path="'xinFengJi.json'" :categoryId="'17'" :deviceList="xinFengJiZu" />
      </a-tab-pane>
      <a-tab-pane key="10" tab="热回收机组">
        <MyTopoComponents :path="'reHuiShou.json'" :categoryId="'37'" :deviceList="reHuiShouJi" />
      </a-tab-pane>
      <!-- <a-tab-pane key="11" tab="送排风机">
        <MyToPoComponent2 :path="'songPaiFengItem.json'" :categoryId="'23'" :deviceList="songPaiFengJi" />
      </a-tab-pane> -->
      <a-tab-pane key="12" tab="送风机">
        <MyToPoComponent2 :path="'songPaiFengItem.json'" :categoryId="'39'" :deviceList="songPaiFengJi" />
      </a-tab-pane>
      <a-tab-pane key="13" tab="排风机">
        <MyToPoComponent2 :path="'songPaiFengItem.json'" :categoryId="'38'" :deviceList="songPaiFengJi" />
      </a-tab-pane>
      <a-tab-pane key="14" tab="集水坑">
        <MyToPoComponent2 :path="'jiShuiKengItem.json'" :categoryId="'34'" :deviceList="jiShuiKeng" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import SubstationAndDistribution from './components/SubstationAndDistribution.vue';
  import ColdSourceMonitoring from './components/ColdSourceMonitoring.vue';
  import EnvironmentalMonitoring from './components/EnvironmentalMonitoring.vue';
  import WaterSupplyAndDrainage from './components/WaterSupplyAndDrainage.vue';
  import PressureSensor from './components/PressureSensor.vue';
  import MyTopoComponents from './components/MyTopoComponents.vue';
  import MyToPoComponent2 from './components/MyToPoComponent2.vue';
  import { ref } from 'vue';

  const activeKey = ref('3');

  /**
   * code是topo的tag
   * key是接口数据的code
   */
  const kongTiaoDeviceList = [
    {
      key: 'RA_TEMP',
      name: '回风温度',
      code: 'huiFengWenDu',
      valueKey: 'wenDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'RA_HUMIDITY',
      name: '回风湿度',
      code: 'huiFengShiDu',
      valueKey: 'shiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'OA_TEMP',
      name: '新风温度',
      code: 'xinFengWenDu',
      valueKey: 'wenDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'OA_HUMIDITY',
      name: '新风湿度',
      code: 'xinFengShiDu',
      valueKey: 'shiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'SA_TEMP',
      name: '送风温度',
      code: 'songFengWenDu',
      valueKey: 'wenDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'SA_HUMIDITY',
      name: '送风湿度',
      code: 'songFengShiDu',
      valueKey: 'shiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'OA_DAMPER_OPENING',
      name: '新风阀开度',
      code: 'xinFengFaKaiDu',
      valueKey: 'kaiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'OA_DAMPER_FEEDBACK',
      name: '新风阀反馈',
      code: 'xinFengFaFanKui',
      valueKey: 'fanKui',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'RA_DAMPER_OPENING',
      name: '回风阀开度',
      code: 'huiFengFaKaiDu',
      valueKey: 'kaiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'RA_DAMPER_FEEDBACK',
      name: '回风阀反馈',
      code: 'huiFengFaFanKui',
      valueKey: 'fanKui',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'VALVE_OPENING',
      name: '水阀开度',
      code: 'shuiFaKaiDu',
      valueKey: 'kaiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'VALVE_FEEDBACK',
      name: '水阀反馈',
      code: 'shuiFaFanKui',
      valueKey: 'fanKui',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'FILTER_ALARM',
      name: '过滤网报警',
      code: 'guLvWangBaoJing',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'LOW_TEMP_ALARM',
      name: '低温报警',
      code: 'diWenBaoJing',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'DXJ_MODE',
      name: '冬夏季模式',
      code: 'dxjms',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: true,
      options: [
        {
          value: '1',
          label: '夏天',
        },
        {
          value: '0',
          label: '冬天',
        },
      ],
    },
    {
      key: 'SA_TEMP_SETPOINT',
      name: '送风温度设定值',
      code: 'sfwdsdz',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'RA_TEMP_SETPOINT',
      name: '回风温度设定值',
      code: 'hfwdsdz',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'UNIT_ON_OFF',
      name: '机组启停',
      code: 'jzqt',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: true,
      options: [
        {
          value: '1',
          label: '运行',
        },
        {
          value: '0',
          label: '停止',
        },
      ],
    },
    {
      key: 'FREQUENCY_CTRL',
      name: '频率控制',
      code: 'plkz',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'FREQUENCY_FEEDBACK',
      name: '频率反馈',
      code: 'plfk',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'AUTO_MANUAL',
      name: '手动/自动',
      code: 'sd/zd',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: true,
      options: [
        {
          value: '1',
          label: '手动',
        },
        {
          value: '0',
          label: '自动',
        },
      ],
    },
    {
      key: 'STOP_RUN',
      name: '停止/运行',
      code: 'tz/yx',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: true,
      options: [
        {
          value: '1',
          label: '停止',
        },
        {
          value: '0',
          label: '运行',
        },
      ],
    },
    {
      key: 'FAN_RUNNING_STATUS',
      name: '送风静压',
      code: 'sfjy',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
  ];

  const xinFengJiZu = [
    {
      key: 'OA_TEMP',
      name: '新风温度',
      code: 'xinFengWenDu',
      valueKey: 'wenDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'OA_HUMIDITY',
      name: '新风湿度',
      code: 'xinFengShiDu',
      valueKey: 'shiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'SA_TEMP',
      name: '送风温度',
      code: 'songFengWenDu',
      valueKey: 'wenDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'SA_HUMIDITY',
      name: '送风湿度',
      code: 'songFengShiDu',
      valueKey: 'shiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'VALVE_OPENING',
      name: '水阀设定',
      code: 'shuiFaSheDing',
      valueKey: 'kaiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'VALVE_FEEDBACK',
      name: '水阀反馈',
      code: 'shuiFaFanKui',
      valueKey: 'fanKui',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'PM25',
      name: 'pm2.5',
      code: 'pm2.5',
      valueKey: 'pm25',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'LOW_TEMP_ALARM',
      name: '低温报警',
      code: 'diWenBaoJing',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'FILTER_ALARM',
      name: '过滤网报警',
      code: 'guoLvWangBaoJing',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'DXJ_MODE',
      name: '冬夏季模式',
      code: 'dxjms',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: true,
      options: [
        {
          value: '1',
          label: '夏天',
        },
        {
          value: '0',
          label: '冬天',
        },
      ],
    },
    {
      key: 'TEMP_SETPOINT',
      name: '温度设定值',
      code: 'wdsdz',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'UNIT_ON_OFF',
      name: '机组启停',
      code: 'jzqt',
      valueKey: 'baoJing',
      isSelect: true,
    },
    {
      key: 'FAN_AUTO_MODE',
      name: '手/自动模式',
      code: 'szdms',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
      options: [
        {
          value: '1',
          label: '手动',
        },
        {
          value: '0',
          label: '自动',
        },
      ],
    },
    {
      key: 'FAN_FAULT',
      name: '风机故障',
      code: 'fjgz',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'FAN_START_STOP',
      name: '启停控制',
      code: 'qtkz',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: true,
      options: [
        {
          value: '1',
          label: '启动',
        },
        {
          value: '0',
          label: '停止',
        },
      ],
    },
  ];

  const reHuiShouJi = [
    {
      key: 'RA_TEMP',
      name: '回风温度',
      code: 'huiFengWenDu',
      valueKey: 'wenDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'RA_HUMIDITY',
      name: '回风湿度',
      code: 'huiFengShiDu',
      valueKey: 'shiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'OA_TEMP',
      name: '新风温度',
      code: 'xinFengWenDu',
      valueKey: 'wenDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'OA_HUMIDITY',
      name: '新风湿度',
      code: 'xinFengShiDu',
      valueKey: 'shiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'SA_TEMP',
      name: '送风温度',
      code: 'songFengWenDu',
      valueKey: 'wenDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'SA_HUMIDITY',
      name: '送风湿度',
      code: 'songFengShiDu',
      valueKey: 'shiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'VALVE_OPENING',
      name: '水阀开度',
      code: 'shuiFaKaiDuSheDinfg',
      valueKey: 'kaiDu',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'VALVE_FEEDBACK',
      name: '水阀反馈',
      code: 'shuiFaKaiDuFanKui',
      valueKey: 'fanKui',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'FILTER_PRESSURE_DIFF',
      name: '滤网压差',
      code: 'lvWangYaCha',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'FAN_PRESSURE_DIFF',
      name: '送风机压差',
      code: 'xongFengJiYaCha',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'ANTI_FREEZE_ALARM',
      name: '防冻',
      code: 'fangDong',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'UNIT_ON_OFF',
      name: '机组启停',
      code: 'jzqt',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: true,
      options: [
        {
          value: '1',
          label: '启动',
        },
        {
          value: '0',
          label: '停止',
        },
      ],
    },
    {
      key: 'SA_FAN_AUTO_MANUAL',
      name: '送风机-手动/自动',
      code: 'sfj-sdzd',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: false,
      options: [
        {
          value: '1',
          label: '手动',
        },
        {
          value: '0',
          label: '自动',
        },
      ],
    },
    {
      key: 'SA_FAN_STOP_START',
      name: '送风机-停止/启动',
      code: 'sfj-tzqd',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: true,
      options: [
        {
          value: '1',
          label: '启动',
        },
        {
          value: '0',
          label: '停止',
        },
      ],
    },
    {
      key: 'EA_FAN_AUTO_MANUAL',
      name: '排风机-手动/自动',
      code: 'pfj-sdzd',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: false,
      options: [
        {
          value: '1',
          label: '手动',
        },
        {
          value: '0',
          label: '自动',
        },
      ],
    },
    {
      key: 'EA_FAN_STOP_START',
      name: '排风机-停止/启动',
      code: 'pfj-tzqd',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: true,
      options: [
        {
          value: '1',
          label: '启动',
        },
        {
          value: '0',
          label: '停止',
        },
      ],
    },
    {
      key: 'WHEEL_AUTO_MANUAL',
      name: '转轮-手动/自动',
      code: 'zl-sdzd',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: false,
      options: [
        {
          value: '1',
          label: '手动',
        },
        {
          value: '0',
          label: '自动',
        },
      ],
    },
    {
      key: 'WHEEL_STOP_START',
      name: '转轮-停止/启动',
      code: 'zl-tzqd',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: true,
      options: [
        {
          value: '1',
          label: '启动',
        },
        {
          value: '0',
          label: '停止',
        },
      ],
    },
    {
      key: 'TEMP_SETTING',
      name: '温度设定',
      code: 'wdsd',
      valueKey: 'baoJing',
      isSelect: false,
      isTransfor: false,
    },
    {
      key: 'MODE_SWITCH',
      name: '模式转换',
      code: 'mszh',
      valueKey: 'baoJing',
      isSelect: true,
      isTransfor: true,
      options: [
        {
          value: '1',
          label: '夏天',
        },
        {
          value: '0',
          label: '冬天',
        },
      ],
    },
  ];
  const songPaiFengJi = [
    {
      key: 'AUTO_MANUAL_STATUS',
      name: '手自动',
      code: 'huiFengWenDu',
      valueKey: 'wenDu',
    },
    {
      key: 'START_STOP_CTRL',
      name: '启停控制',
      code: 'huiFengWenDu',
      valueKey: 'wenDu',
    },
    {
      key: 'RUNNING_STATUS',
      name: '运行状态',
      code: 'huiFengWenDu',
      valueKey: 'wenDu',
    },
    {
      key: 'FAN_FAULT_SIGNAL',
      name: '风机故障',
      code: 'huiFengWenDu',
      valueKey: 'wenDu',
    },
  ];
  const jiShuiKeng = [
    {
      key: 'HOA',
      name: '手自动',
      code: 'szd',
      valueKey: 'wenDu',
    },
    {
      key: 'HIGH_LEVEL_ALARM',
      name: '高液位',
      code: 'gyw',
      valueKey: 'wenDu',
    },
    {
      key: 'PUMP1_OVERLOAD_ALARM',
      name: '1#泵过载报警',
      code: '1#gzbj',
      valueKey: 'wenDu',
    },
    {
      key: 'PUMP2_OVERLOAD_ALARM',
      name: '2#泵过载报警',
      code: '2#gzbj',
      valueKey: 'wenDu',
    },
    {
      key: 'PUMP1_RUNNING_STATUS',
      name: '1#泵运行状态',
      code: '1#yxzt',
      valueKey: 'wenDu',
    },
    {
      key: 'PUMP2_RUNNING_STATUS',
      name: '2#泵运行状态',
      code: '2#yxzt',
      valueKey: 'wenDu',
    },
  ];
</script>

<style scoped lang="less">
  .monitoring-source-main-box {
  }
</style>
