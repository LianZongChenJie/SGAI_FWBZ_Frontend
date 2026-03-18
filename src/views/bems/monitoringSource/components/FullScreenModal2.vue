<template>
  <a-modal v-model:open="open" width="100%" wrap-class-name="full-modal" @cancel="handleClose" @ok="handleClose">
    <div class="full-screen" ref="fullScreenContainer">
      <div v-show="isShow" class="control-div" :style="{ top: targetTop, left: targetLeft, }">
        <div class="title-box">
          {{ modalTitle }}:
        </div>
        <div class="select-box">
          <a-select v-model:value="isOpen" style="width: 100%">
            <a-select-option value="1">开</a-select-option>
            <a-select-option value="0">关</a-select-option>
          </a-select>
        </div>
        <div class="button-box">
          <a-button @click="cancel">取消</a-button>
          <a-button type="primary" @click="submitControl">确定</a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { controlDeviceApi } from '../Standardized.api'
import { message } from 'ant-design-vue';

const props = defineProps({
  path: {
    type: String,
    default: '音乐厅配电室模拟屏.json',
  },
  deviceCode: {
    type: String,
    default: '',
  },
  categoryId: {
    type: String,
    default: '8'
  },
  deviceList: {
    type: Array,
    default: []
  },
  // isControlArr: {
  //   type: Array,
  //   default: []
  // },
});

const isShow = ref(false);
const isOpen = ref('0');
const targetTop = ref('100px')
const targetLeft = ref('100px')
const targetId = ref('')
const modalTitle = ref('')

const open = ref<boolean>(false);

const gv = ref();
const dm = ref();

const fullScreenContainer = ref();

const isControlArr:any = ref([])

const showModal = async (deviceDataList) => {
  open.value = true;
  isControlArr.value = [...deviceDataList]
  initEvent();
};

const handleClose = () => {
  clearTopoContent();
  open.value = false;
};

// 清除拓扑图内容
const clearTopoContent = () => {
  if (dm.value) {
    dm.value.clear(); // 清除数据模型中的所有数据
  }
  if (gv.value && fullScreenContainer.value) {
    // 清除容器内的所有子元素
    while (fullScreenContainer.value.firstChild) {
      fullScreenContainer.value.removeChild(fullScreenContainer.value.firstChild);
    }
  }
};

const initEvent = async () => {
  await nextTick();
  if (!fullScreenContainer.value) return;

  // 清除之前的内容
  clearTopoContent();

  gv.value = new ht.graph.GraphView();
  dm.value = gv.value.getDataModel();
  gv.value.addToDOM(fullScreenContainer.value, {
    fill: false, // 关闭自动填充
  });

  gv.value.isMovable = function () {
    return false;
  }; // 禁止移动
  gv.value.getSelectWidth = function () {
    return 0;
  }; // 禁止选中
  gv.value.deserialize(`storage/displays/jinAnQiao/${props.path}`, function (json, dm, gv, data) {
    console.log('isControlArr--------------------->', isControlArr.value);

    if (props.path === 'songPaiFengItem.json') {
      dm.getDataByTag('spfjItem').a('deviceCode', props.deviceCode)
      // dm.getDataByTag('spfjItem').a('szd', isControlArr.value.find(item => item.attributeCode === 'AUTO_MANUAL_STATUS').value + (isControlArr.value.find(item => item.attributeCode === 'AUTO_MANUAL_STATUS').unit ? isControlArr.value.find(item => item.attributeCode === 'AUTO_MANUAL_STATUS').unit : ''))
      // dm.getDataByTag('spfjItem').a('qtkz', isControlArr.value.find(item => item.attributeCode === 'START_STOP_CTRL').value + (isControlArr.value.find(item => item.attributeCode === 'START_STOP_CTRL').unit ? isControlArr.value.find(item => item.attributeCode === 'START_STOP_CTRL').unit : ''))
      if (isControlArr.value.find(item => item.attributeCode === 'AUTO_MANUAL_STATUS').value === '0') {
        dm.getDataByTag('spfjItem').a('szd', '停止')
      } else {
        dm.getDataByTag('spfjItem').a('szd', '运行')
      }
      if (isControlArr.value.find(item => item.attributeCode === 'START_STOP_CTRL').value === '0') {
        dm.getDataByTag('spfjItem').a('qtkz', '手动')
      } else {
        dm.getDataByTag('spfjItem').a('qtkz', '自动')
      }
      dm.getDataByTag('spfjItem').a('yxzt', isControlArr.value.find(item => item.attributeCode === 'RUNNING_STATUS').value + (isControlArr.value.find(item => item.attributeCode === 'RUNNING_STATUS').unit ? isControlArr.value.find(item => item.attributeCode === 'RUNNING_STATUS').unit : ''))
      dm.getDataByTag('spfjItem').a('fjgz', isControlArr.value.find(item => item.attributeCode === 'FAN_FAULT_SIGNAL').value + (isControlArr.value.find(item => item.attributeCode === 'FAN_FAULT_SIGNAL').unit ? isControlArr.value.find(item => item.attributeCode === 'FAN_FAULT_SIGNAL').unit : ''))
    } else {
      dm.getDataByTag('jiSHuiKengItem').a('deviceCode', props.deviceCode)
      // dm.getDataByTag('jiSHuiKengItem').a('szd', isControlArr.value.find(item => item.attributeCode === 'HOA').value + (isControlArr.value.find(item => item.attributeCode === 'HOA').unit ? isControlArr.value.find(item => item.attributeCode === 'HOA').unit : ''))
      if (isControlArr.value.find(item => item.attributeCode === 'HOA').value === '0') {
              dm.getDataByTag('jiSHuiKengItem').a('szd', '停止')
            } else {
              dm.getDataByTag('jiSHuiKengItem').a('szd', '运行')
            }
      dm.getDataByTag('jiSHuiKengItem').a('gyw', isControlArr.value.find(item => item.attributeCode === 'HIGH_LEVEL_ALARM').value + (isControlArr.value.find(item => item.attributeCode === 'HIGH_LEVEL_ALARM').unit ? isControlArr.value.find(item => item.attributeCode === 'HIGH_LEVEL_ALARM').unit : ''))
      if (isControlArr.value.find(item => item.attributeCode === 'PUMP1_OVERLOAD_ALARM').value === '1') {
        dm.getDataByTag('jiSHuiKengItem').a('1#gzbj', 'rgb(242,83,75)')
      } else {
        dm.getDataByTag('jiSHuiKengItem').a('1#gzbj', 'rgba(150,150,150,1)')
      }
      if (isControlArr.value.find(item => item.attributeCode === 'PUMP2_OVERLOAD_ALARM').value === '1') {
        dm.getDataByTag('jiSHuiKengItem').a('2#gzbj', 'rgb(242,83,75)')
      } else {
        dm.getDataByTag('jiSHuiKengItem').a('2#gzbj', 'rgba(150,150,150,1)')
      }
      if (isControlArr.value.find(item => item.attributeCode === 'PUMP1_RUNNING_STATUS').value === '1') {
        dm.getDataByTag('jiSHuiKengItem').a('1#yxzt', 'rgb(242,83,75)')
      } else {
        dm.getDataByTag('jiSHuiKengItem').a('1#yxzt', '#979797')
      }
      if (isControlArr.value.find(item => item.attributeCode === 'PUMP2_RUNNING_STATUS').value === '1') {
        dm.getDataByTag('jiSHuiKengItem').a('2#yxzt', 'rgb(242,83,75)')
      } else {
        dm.getDataByTag('jiSHuiKengItem').a('2#yxzt', '#979797')
      }
      dm.getDataByTag('jiSHuiKengItem').a('progress', '1')
    }

    
    
    gv.mi(function (e) {
      if ((e.kind === 'clickData') && e.data && (isControlArr.value.find((item: any) => item.code === e.data._tag).readwriteLevel === '1')) {
        const targetItem = isControlArr.value.find((item: any) => item.code === e.data._tag)
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

const submitControl = async () => {
  if (!isOpen.value) message.error('请选择开关状态！')
  let res = await controlDeviceApi({
    deviceAttributeId: targetId.value,
    value: isOpen.value,
  })
  if (!res) {
    isShow.value = false
    message.success('操作成功！')
  }
}

const cancel = () => {
  targetId.value = ''
  isShow.value = false
}

defineExpose({
  showModal,
  handleClose,
});
</script>

<style lang="less" scoped>
.full-screen {
  position: relative;
  height: 100%;
  width: 100%;

  .control-div {
    z-index: 99999;
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
</style>

<style lang="less">
.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }

  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }

  .ant-modal-body {
    flex: 1;
  }
}
</style>