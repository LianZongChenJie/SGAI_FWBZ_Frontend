<template>
  <div class="point-badge" :class="{ alarm }">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  alarm: { type: Boolean, default: false }
})
</script>

<style scoped>
.point-badge{padding:4px 7px;border:1px solid rgba(53,112,136,.48);background:rgba(6,30,43,.92);font-size:7px}
.point-badge span,.point-badge strong{display:block}
.point-badge span{color:#6f97a9}
.point-badge strong{margin-top:2px;color:#dff2f7;font-size:9px}
.point-badge.alarm strong{color:#ff7868}
</style>
