<template>
  <div class="date-item-main-box">
    <div class="date-title">
      {{ props.title }}
    </div>
    <div class="date-number">
      {{ props.number }}
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
  height: 100%;
  width: 100%;
  .date-title,.date-number{
    width: 100%;
    height: 40%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .date-title{
    align-items: flex-end;
    font-size: 16px;
  }
  .date-number{
    font-size: 28px;
    font-weight: bold;
  }
}
</style>