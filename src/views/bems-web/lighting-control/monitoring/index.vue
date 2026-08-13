<template>
  <div class="lighting-monitoring">
    <div class="lighting-monitoring__box">
      <div class="lighting-monitoring__title">照明监控</div>
      <div v-if="loading" class="lighting-monitoring__tip">正在登录照明监控系统，请稍候…</div>
      <div v-else class="lighting-monitoring__error">登录失败，请检查网络或账号配置后重试</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

/** 登录接口地址 */
const LOGIN_URL = 'http://10.22.154.2:888/prod-api/login'
/** 登录成功后的跳转地址 */
const REDIRECT_URL = 'http://10.22.154.2:888/appWebtopoPreview/appWebtopoPreview'
/** 登录账号 */
const LOGIN_USERNAME = 'user001'
const LOGIN_PASSWORD = '123456'

const loading = ref(true)

/** 将 token 写入 cookie（path=/，默认 1 小时有效） */
function setCookie(name: string, value: string, hours = 1): void {
  const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

/** 初始化：调用登录接口获取 token -> 写入 cookie -> 跳转目标页面 */
async function initLogin(): Promise<void> {
  try {
    const resp = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: LOGIN_USERNAME, password: LOGIN_PASSWORD }),
    })
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`)
    }
    const data = await resp.json()
    // 兼容 { result: { token } } / { token } / { data: { token } } 等返回结构
    const token = data?.result?.token ?? data?.token ?? data?.data?.token
    if (!token) {
      throw new Error('响应中未找到 token 字段')
    }
    setCookie('token', token)
    window.location.href = REDIRECT_URL
  } catch (e) {
    console.error('照明监控自动登录失败:', e)
    loading.value = false
  }
}

onMounted(() => {
  initLogin()
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

  &__error {
    margin-top: 12px;
    font-size: 14px;
    color: #e8833a;
  }
}
</style>

