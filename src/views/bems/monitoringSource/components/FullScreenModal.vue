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
          <div class="select-box" v-if="isSelect">
            <a-select v-model:value="selectValue" :options="selectOptions" style="width: 100%">
              <!-- <a-select-option value="1">开</a-select-option>
              <a-select-option value="0">关</a-select-option> -->
            </a-select>
          </div>
          <div class="select-box" v-else>
            <a-input type="number" v-model:value="deviceValue" style="width: 100%">
            </a-input>
          </div>
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
  isControlArr: {
    type: Array,
    default: []
  },
});

const isShow = ref(false);
const isSelect = ref(true);
const isOpen = ref('0');
const targetTop = ref('100px')
const targetLeft = ref('100px')
const targetId = ref('')
const modalTitle = ref('')
const selectOptions = ref([
  {
    value: '1',
    label: 'on'
  },
  {
    value: '0',
    label: 'off'
  },
])
const selectValue = ref('0');
const deviceValue = ref('');

const open = ref<boolean>(false);

const gv = ref();
const dm = ref();

const fullScreenContainer = ref();

const showModal = async () => {
  open.value = true;
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
  let path = ''
  if(props.path.includes('9号楼')) {
    path = props.path
  } else {
    path = 'jinAnQiao/' + props.path
  }
  gv.value.deserialize(`storage/displays/${path}`, function (json, dm, gv, data) {
    dm.getDataByTag(`deviceCode`).a('deviceCode', props.deviceCode);
    props.isControlArr.forEach((item: any, index) => {
      dm.getDataByTag(item.code).a(item.valueKey, item.value + (item.unit ? item.unit : ''))
    })


    gv.mi(function (e) {
      if ((e.kind === 'clickData') && e.data && (props.isControlArr.find((item: any) => item.code === e.data._tag).readwriteLevel === '1')) {
        const targetItem = props.isControlArr.find((item: any) => item.code === e.data._tag)
        modalTitle.value = targetItem.name
        targetId.value = targetItem.id
        isShow.value = targetItem.value
        isShow.value = true
        targetTop.value = (e.event.layerY) + 'px'
        targetLeft.value = (e.event.layerX) + 'px'
        isOpen.value = targetItem.value
        if (targetItem.options) {
          selectOptions.value = targetItem.options
        } else {
          selectOptions.value = [
            {
              value: '1',
              label: 'on'
            },
            {
              value: '0',
              label: 'off'
            },
          ]
        }
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
    value: isSelect.value ? selectValue.value : deviceValue.value,
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