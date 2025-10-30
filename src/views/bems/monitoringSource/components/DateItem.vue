<template>
  <div class="date-item-main-box">
    <div class="date-number">
      {{ props.number }}
    </div>
    <div class="date-title">
      {{ props.title }}
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  title: {
    tytpe: String,
    default: '高压配电室（个）',
  },
  number: {
    type: String,
    default: '3',
  },
});
</script>

<style scoped lang="less">
.date-item-main-box {
  height: 70%;
  width: 70%;
  background-image: url('@/assets/images/kanBanBorder.png');
  background-size: 100% 100%;
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  .date-title,.date-number{
    width: 100%;
    height: 40%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .date-title{
    
    font-size: 16px;
  }
  .date-number{
    align-items: flex-end;
    font-size: 28px;
    font-weight: bold;
  }
}
</style>