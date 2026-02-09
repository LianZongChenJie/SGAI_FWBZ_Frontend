<template>
  <div class="topo-item-main-box">
    <div class="device-topo-box">
      <div ref="container" class="topo-box">

      </div>
      <div class="full-screen" @click="fullScreen(1)">
        <ExpandOutlined />&ensp;全屏查看
      </div>
      <div v-show="isShow" class="control-div" :style="{ top: targetTop, left: targetLeft, }">
        <div class="title-box">
          {{ modalTitle }}:
        </div>
        <div class="select-box">
          <a-select v-model:value="isOpen" style="width: 100%">
            <a-select-option value="1">on</a-select-option>
            <a-select-option value="0">off</a-select-option>
          </a-select>
        </div>
        <div class="button-box">
          <a-button @click="cancel">取消</a-button>
          <a-button type="primary" @click="submitControl">确定</a-button>
        </div>
      </div>
    </div>
    <FullScreenModal2 :path="props.path" ref="fullScreenModalRef" :isControlArr="isControlArr" />
  </div>
</template>

<script setup lang="ts">
import { ExpandOutlined, CompressOutlined } from '@ant-design/icons-vue';
import FullScreenModal2 from './FullScreenModal2.vue';
import { ref, onMounted, nextTick, watch } from 'vue';
import { findSpaceDeviceByCategoryldApi, getByDeviceIdApi } from '../Standardized.api'
import { message } from 'ant-design-vue';

const songPaiFengJi = [
  {
    key: 'AUTO_MANUAL_STATUS',
    name: "手自动",
    code: "szd",
    valueKey: 'wenDu'
  },
  {
    key: 'START_STOP_CTRL',
    name: "启停控制",
    code: "qtkz",
    valueKey: 'wenDu'
  },
  {
    key: 'RUNNING_STATUS',
    name: "运行状态",
    code: "yxzt",
    valueKey: 'wenDu'
  },
  {
    key: 'FAN_FAULT_SIGNAL',
    name: "风机故障",
    code: "fjgz",
    valueKey: 'wenDu'
  },
]
const jiShuiKeng = [
  {
    key: 'HOA',
    name: "手自动",
    code: "szd",
    valueKey: 'wenDu'
  },
  {
    key: 'HIGH_LEVEL_ALARM',
    name: "高液位",
    code: "gyw",
    valueKey: 'wenDu'
  },
  {
    key: 'PUMP1_OVERLOAD_ALARM',
    name: "1#泵过载报警",
    code: "1#gzbj",
    valueKey: 'wenDu'
  },
  {
    key: 'PUMP2_OVERLOAD_ALARM',
    name: "2#泵过载报警",
    code: "2#gzbj",
    valueKey: 'wenDu'
  },
  {
    key: 'PUMP1_RUNNING_STATUS',
    name: "1#泵运行状态",
    code: "1#yxzt",
    valueKey: 'wenDu'
  },
  {
    key: 'PUMP2_RUNNING_STATUS',
    name: "2#泵运行状态",
    code: "2#yxzt",
    valueKey: 'wenDu'
  },
]

const props = defineProps({
  deviceId: {
    type: Number,
    default: 0
  },
  deviceCode: {
    type: String,
    default: 'Normal'
  },
  path: {
    type: String,
    default: 'songPaiFengItem.json'
  },
})

const isFull = ref(0);

const fullScreenModalRef = ref();
const isControlArr = ref<any>([])
const deviceDataList = ref<any>([])

const checkedKeys = ref<string[]>(['2']);

const topoPath = ref<any>('');

const isShow = ref(false);
const isOpen = ref('0');

const targetTop = ref('100px')
const targetLeft = ref('100px')
const targetId = ref('')
const modalTitle = ref('')

const getByDeviceId = async (id) => {
  let res = await getByDeviceIdApi({
    deviceId: id
  })
  deviceDataList.value = res
  const codeArr = res.map(item => item.attributeCode)
  // console.log('codeArr------------------->', res);
  isControlArr.value = jiShuiKeng.filter((item: any) => codeArr.includes(item.key))
  isControlArr.value.forEach(item => {
    for (let i = 0; i < deviceDataList.value.length; i++) {
      if (deviceDataList.value[i].attributeCode === item.key) {
        item.value = deviceDataList.value[i].value
        item.unit = deviceDataList.value[i].unit
        item.id = deviceDataList.value[i].id
        item.readwriteLevel = deviceDataList.value[i].readwriteLevel
        item.value = deviceDataList.value[i].value
      }
    }
  })
  initEvent();
}

const container = ref();

const gv = ref();
const dm = ref();

watch(() => props.deviceCode, async (val) => {
  if (val) {
    await nextTick()
    await initEvent();
  }
}, { immediate: true });


onMounted(async () => {
  await getByDeviceId(props.deviceId)

});

// 清除拓扑图内容
const clearTopoContent = () => {
  if (dm.value) {
    dm.value.clear(); // 清除数据模型中的所有数据
  }
  if (gv.value && container.value) {
    // 清除容器内的所有子元素
    while (container.value.firstChild) {
      container.value.removeChild(container.value.firstChild);
    }
  }
};

const initEvent = async () => {
  if (!deviceDataList.value.length) return
  await nextTick();
  if (!container.value) return;

  // 清除之前的内容
  clearTopoContent();

  gv.value = new ht.graph.GraphView();
  dm.value = gv.value.getDataModel();
  gv.value.addToDOM(container.value, {
    fill: false, // 关闭自动填充
  });

  gv.value.isMovable = function () {
    return false;
  }; // 禁止移动
  gv.value.getSelectWidth = function () {
    return 0;
  }; // 禁止选中
  gv.value.deserialize(`storage/displays/jinAnQiao/${props.path}`, function (json, dm, gv, data) {
    // let targetNode = dm.getDataByTag(`1AA16Modal`);
    if (props.path === 'songPaiFengItem.json') {
      dm.getDataByTag('spfjItem').a('deviceCode', props.deviceCode)
      dm.getDataByTag('spfjItem').a('szd', deviceDataList.value.find(item => item.attributeCode === 'AUTO_MANUAL_STATUS').value + ((deviceDataList.value.find(item => item.attributeCode === 'AUTO_MANUAL_STATUS').unit) ? deviceDataList.value.find(item => item.attributeCode === 'AUTO_MANUAL_STATUS').unit : ''))
      dm.getDataByTag('spfjItem').a('qtkz', deviceDataList.value.find(item => item.attributeCode === 'START_STOP_CTRL').value + (deviceDataList.value.find(item => item.attributeCode === 'START_STOP_CTRL').unit ? deviceDataList.value.find(item => item.attributeCode === 'START_STOP_CTRL').unit : ''))
      dm.getDataByTag('spfjItem').a('yxzt', deviceDataList.value.find(item => item.attributeCode === 'RUNNING_STATUS').value + (deviceDataList.value.find(item => item.attributeCode === 'RUNNING_STATUS').unit ? deviceDataList.value.find(item => item.attributeCode === 'RUNNING_STATUS').unit : ''))
      // dm.getDataByTag('spfjItem').a('fjgz', deviceDataList.value.find(item => item.attributeCode === 'FAN_FAULT_SIGNAL').value)
    } else {
      dm.getDataByTag('jiSHuiKengItem').a('deviceCode', props.deviceCode)
      dm.getDataByTag('jiSHuiKengItem').a('szd', deviceDataList.value.find(item => item.attributeCode === 'HOA').value + (deviceDataList.value.find(item => item.attributeCode === 'HOA').unit ? deviceDataList.value.find(item => item.attributeCode === 'HOA').unit : ''))
      dm.getDataByTag('jiSHuiKengItem').a('gyw', deviceDataList.value.find(item => item.attributeCode === 'HIGH_LEVEL_ALARM').value + (deviceDataList.value.find(item => item.attributeCode === 'HIGH_LEVEL_ALARM').unit ? deviceDataList.value.find(item => item.attributeCode === 'HIGH_LEVEL_ALARM').unit : ''))
      if (deviceDataList.value.find(item => item.attributeCode === 'PUMP1_OVERLOAD_ALARM').value === '1') {
        dm.getDataByTag('jiSHuiKengItem').a('1#gzbj', 'rgb(242,83,75)')
      } else {
        dm.getDataByTag('jiSHuiKengItem').a('1#gzbj', 'rgba(150,150,150,1)')
      }
      if (deviceDataList.value.find(item => item.attributeCode === 'PUMP2_OVERLOAD_ALARM').value === '1') {
        dm.getDataByTag('jiSHuiKengItem').a('2#gzbj', 'rgb(242,83,75)')
      } else {
        dm.getDataByTag('jiSHuiKengItem').a('2#gzbj', 'rgba(150,150,150,1)')
      }
      if (deviceDataList.value.find(item => item.attributeCode === 'PUMP1_RUNNING_STATUS').value === '1') {
        dm.getDataByTag('jiSHuiKengItem').a('1#yxzt', 'rgb(242,83,75)')
      } else {
        dm.getDataByTag('jiSHuiKengItem').a('1#yxzt', '#979797')
      }
      if (deviceDataList.value.find(item => item.attributeCode === 'PUMP2_RUNNING_STATUS').value === '1') {
        dm.getDataByTag('jiSHuiKengItem').a('2#yxzt', 'rgb(242,83,75)')
      } else {
        dm.getDataByTag('jiSHuiKengItem').a('2#yxzt', '#979797')
      }

      dm.getDataByTag('jiSHuiKengItem').a('progress', '1')

    }

    gv.mi(function (e) {
      if ((e.kind === 'clickData') && e.data && (isControlArr.value.find(item => item.code === e.data._tag).readwriteLevel === '1')) {
        const targetItem = isControlArr.value.find(item => item.code === e.data._tag)
        modalTitle.value = targetItem.name
        targetId.value = targetItem.id
        isShow.value = targetItem.value
        isShow.value = true
        targetTop.value = (e.event.layerY) + 'px'
        targetLeft.value = (e.event.layerX) + 'px'
        isOpen.value = targetItem.value
      } else {
        isShow.value = false
      }
    });

    gv.fitContent(); // 适配内容
  });
};

const fullScreen = (type) => {
  isFull.value = type;
  if (type) {
    fullScreenModalRef.value.showModal(deviceDataList.value);
  } else {
  }
};

// 截断文本函数
const truncateText = (text, length = 10) => {
  const maxLength = length
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

const submitControl = async () => {
  if (!isOpen.value) message.error('请选择开关状态！')
  // let res = await controlDeviceApi({
  //   deviceAttributeId: targetId.value,
  //   value: isOpen.value,
  // })
  // if (!res) {
  //   isShow.value = false
  //   message.success('操作成功！')
  // }
}

const cancel = () => {
  targetId.value = ''
  isShow.value = false
}
</script>

<style scoped lang="less">
.topo-item-main-box {
  width: 100%;
  height: 100%;
  padding: 0 12px;

  .device-topo-box {
    width: 100%;
    height: 100%;
    background-color: #fff;
    position: relative;
    margin: 0 auto;
    /* 居中显示 */
    overflow: hidden;
    position: relative;

    .topo-box {
      height: 100%;
      width: 100%;
    }

    .full-screen {
      color: #000;
      position: absolute;
      top: 15px;
      left: 15px;

      &:hover {
        cursor: pointer;
        color: #00000085;
      }
    }

    .control-div {
      padding: 3px 12px;
      top: 100px;
      left: 100px;
      position: absolute;
      height: 130px;
      width: 200px;
      border: 2px solid #adadad;
      background-color: #fff;

      >div {
        height: 40px;
        width: 100%;
      }

      .title-box {

        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 16px;
      }

      .select-box {
        height: 40px;
        width: 100%;
      }

      .button-box {
        display: flex;
        align-items: center;
        justify-content: space-around
      }
    }
  }

  #dianLuTopo {
    height: 32%;
    width: 25%;
    position: absolute;
  }
}
</style>