<!-- 照明监控 -->
<template>
  <div class="lighting-monitoring">
    <div class="lighting-monitoring__box">
      <div class="lighting-monitoring__title">照明监控</div>
      <div class="lighting-monitoring__tip">正在登录照明监控系统，即将返回总览仪表盘…</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../../store/modules/user'

const router = useRouter()
const userStore = useUserStore()

/** 照明监控自动登录地址（请求头携带 token 访问） */
const AUTO_LOGIN_URL = 'http://10.168.56.101:7004/jeecgboot/sgai-tp/fwbz/lighting/autoLogin'
/** token 请求头字段名（与项目 ConfigEnum.TOKEN 一致） */
const TOKEN_HEADER = 'X-Access-Token'
/** 本页跳转的总览仪表盘路由 */
const OVERVIEW_PATH = '/fwbz/overview'

/** 携带本项目 token 访问照明监控自动登录接口（不新开弹窗） */
async function autoLogin(): Promise<void> {
  const token = userStore.getToken
  if (!token) {
    console.warn('未获取到本项目 token，跳过照明监控自动登录')
    return
  }
  try {
    const resp = await fetch(AUTO_LOGIN_URL, {
      method: 'GET',
      headers: { [TOKEN_HEADER]: token },
    })
    if (!resp.ok) {
      throw new Error('HTTP ' + resp.status)
    }
  } catch (e) {
    console.error('照明监控自动登录失败:', e)
  }
}

onMounted(() => {
  autoLogin()
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
