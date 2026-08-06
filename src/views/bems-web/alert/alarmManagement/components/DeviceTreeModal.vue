<template>
  <a-modal
    v-model:open="open"
    title="设备绑定"
    @ok="handleOk"
    @cancel="closeModal"
    style="top: 5vh"
    width="90vw"
  >
    <div class="dvie-tree-modal-box">
      <DeviceTreePage :selectKey="selectKey" />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { selectDevice, spaceTree, categoryTree, selectMeasuringDevice } from '../Standardized.api';
import DeviceTreePage from '/@/views/bems/deviceTreePage/index.vue';
import { message } from 'ant-design-vue';

const props = defineProps({
  setDeviceName: {
    type: Function,
    default: () => {},
  },
  isInstant: {
    type: Boolean,
    default: false,
  },
});

const open = ref<boolean>(false);

const target: any = ref('');

// 打开弹框
const showModal = async () => {
  open.value = true;
};

const selectKey = (key, record) => {
  if (record) {
    target.value = {
      id: record.key,
      deviceName: record.title,
    };
  } else {
    target.value = ''
  }
};

const handleOk = (e: MouseEvent) => {
  console.log(e);
  if(!target.value) {
    message.error('未选择设备！');
  } else {
    props.setDeviceName(1, target.value);
    open.value = false;
  }
};

const closeModal = () => {
  open.value = false;
};

onMounted(async () => {});

defineExpose({
  showModal,
  closeModal,
});
</script>

<style scoped lang="less">
.dvie-tree-modal-box {
  height: 80vh;
  width: 90vw;
}
</style>