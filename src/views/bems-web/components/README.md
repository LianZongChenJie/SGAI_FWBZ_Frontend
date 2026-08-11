# BEMS-Web 业务组件

> 位于 `src/views/bems-web/components/` 目录下

## 组件列表

| 组件名 | 说明 | 状态 |
|--------|------|------|
| StatCard | 统计卡片 - 展示数据统计值，含趋势变化 | ✅ 已完成 |
| AlertCard | 告警卡片 - 展示告警信息 | ✅ 已完成 |
| DeviceCard | 设备/子系统卡片 - 展示设备信息 | ✅ 已完成 |

## 引用方式

```ts
import { StatCard, AlertCard, DeviceCard } from '@/views/bems-web/components'
// 或
import StatCard from '@/views/bems-web/components/StatCard/index.vue'
```

## 开发规范

1. 每个组件一个独立目录，目录名为组件名（大驼峰）
2. 组件文件统一命名为 `index.vue`
3. 使用 `<script setup lang="ts">` 语法
4. 使用 `defineOptions({ name: 'ComponentName' })` 注册组件名
5. 样式使用 `scoped lang="less"`
6. 组件顶部添加 JSDoc 注释说明
