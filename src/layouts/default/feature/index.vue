<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { BackTop } from 'ant-design-vue';

  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { useUserStoreWithOut } from '/@/store/modules/user';

  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import SessionTimeoutLogin from '/@/views/sys/login/SessionTimeoutLogin.vue';
  export default defineComponent({
    name: 'LayoutFeatures',
    components: {
      BackTop,
      LayoutLockPage: createAsyncComponent(() => import('/@/views/sys/lock/index.vue')),
      SessionTimeoutLogin,
    },
    setup() {
      const { getUseOpenBackTop } = useRootSetting();
      const userStore = useUserStoreWithOut();

      const getIsSessionTimeout = computed(() => userStore.getSessionTimeout);

      return {
        getTarget: () => document.body,
        getUseOpenBackTop,
        getIsSessionTimeout,
      };
    },
  });
</script>

<template>
  <LayoutLockPage />
  <BackTop v-if="getUseOpenBackTop" :target="getTarget" />
  <SessionTimeoutLogin v-if="getIsSessionTimeout" />
</template>

