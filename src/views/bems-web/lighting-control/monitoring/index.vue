<<<<<<< HEAD
<!-- 照明监控 -->
<template>
  <div class="lighting-monitoring">
    <div class="lighting-monitoring__box">
      <div class="lighting-monitoring__title">照明监控</div>
      <div class="lighting-monitoring__tip">正在打开照明监控系统，即将返回总览仪表盘…</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/** 照明监控系统地址（新开 tab 打开并登录） */
const LIGHTING_URL = 'http://10.168.56.101:7545/appWebtopoPreview/appWebtopoPreview'
/** 本页跳转的总览仪表盘路由 */
const OVERVIEW_PATH = '/fwbz'

onMounted(() => {
  // 新开浏览器 tab 并访问照明监控系统
  window.open(LIGHTING_URL, '_blank')
  // 本 tab 跳转到总览仪表盘
  router.push(OVERVIEW_PATH)
})
</script>

<style scoped lang="scss">
.lighting-monitoring {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  &__box {
    text-align: center;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
  }

  &__tip {
    margin-top: 12px;
    font-size: 14px;
    color: #8c8c8c;
  }
}
</style>
=======
<template>
    照明监控
</template>

>>>>>>> dev
