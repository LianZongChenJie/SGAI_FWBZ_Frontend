<template>
  <div class="my-carbon-title">
    <div class="icon-box"></div>
    &nbsp;
    {{ props.title }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: '标题'
  }
})
</script>

<style lang="less" scoped>
.my-carbon-title  {
  height: 30px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  justify-content: flex-start;
  font-weight: 600;
  font-size: 16px;
  .icon-box {
    height: 16px;
    border-left: 3px solid rgb(49, 129, 235);
  }
}
</style>