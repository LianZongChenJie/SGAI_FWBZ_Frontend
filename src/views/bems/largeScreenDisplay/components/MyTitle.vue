<template>
  <div class="my-title-box">
    <div class="left-icon"></div>
    <div class="title-text-box" :style="props.style">
      {{ props.title }}
    </div>
    <div class="right-icon"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: '无'
  },
  style: {
    type: Object,
    default: {
      color: '#fff',
      fontSize: '18px'
    }
  }
})
</script>

<style lang="less" scoped>
.my-title-box{
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  >div {
    height: 80%;
  }

  .left-icon,.right-icon{
    flex: 1;
    background-image: url('@/assets/images/leftIcon.png');
    background-size: 100% 100%;
  }
  .right-icon {
    background-image: url('@/assets/images/rightIcon.png');
  }

  .title-text-box{
    padding: 0 20px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-around;
    letter-spacing: 5px;
    font-size: 16px;
  }
}
</style>