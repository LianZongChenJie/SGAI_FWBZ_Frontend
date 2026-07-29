<template>
  <div class="my-tabs">
    <div class="left" :id="(isActive === 1) ? 'isActive' : ''" @click="switchDate(1)">{{ props.tabsTitle.left }}</div>
    <div class="middle" :id="(isActive === 2) ? 'isActive' : ''" @click="switchDate(2)">{{ props.tabsTitle.middle }}</div>
    <div class="right" :id="(isActive === 3) ? 'isActive' : ''" @click="switchDate(3)">{{ props.tabsTitle.right }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps({
  tabsTitle : {
    type: Object,
    default: {
      left: '当日',
      middle: '当月',
      right: '当年',
    }
  },
  handleSwitchDate: {
    type: Function,
    default: () => {}
  }
})

const isActive = ref(1)


// 切换日期
const switchDate = (active:number) => {
  isActive.value = active
  props.handleSwitchDate(active)
}
</script>

<style lang="less" scoped>
.my-tabs{
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;

  div{
    height: 100%;
    width: 33.33%;
    border: 1px solid #5f5e5e;
    color: #303030;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover{
      cursor: pointer;
    }
  }
  .left {
    border-radius: 20px 0 0 20px;
    border-right: none;
  }
  .right {
    border-radius: 0 20px 20px 0;
    border-left: none;
  }

  #isActive {
    background-color: #616060;
    color: #fff;
  }
}
</style>