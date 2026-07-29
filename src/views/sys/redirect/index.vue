<template>
  <div></div>
</template>
<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  const { currentRoute, replace } = useRouter();
  const { params, query } = currentRoute.value;
  const { path } = params;
  const _path = Array.isArray(path) ? path.join('/') : path;
  replace({
    path: _path.startsWith('/') ? _path : '/' + _path,
    query,
  });
</script>
