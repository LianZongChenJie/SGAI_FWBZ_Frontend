<template>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { transferJumpLoginApi } from './Standardized.api';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '/@/store/modules/user';

const username = '18019938';

const router = useRouter();
const route = useRoute()

const userStore = useUserStore();

onMounted(async () => {
  // 获取查询参数
  const token = route.query.token 
  let res = await transferJumpLoginApi({ token });
  if (res) {
    userStore.transferJump(res)
    // router.replace('/dashboard/analysis');
  }
});
</script>