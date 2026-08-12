<template>
  <div class="setpoint-tab">
    <!-- 运行模式 -->
    <a-card class="sp-card" :bordered="false">
      <div class="sp-card__header">
        <div class="sp-card__title">
          <span>运行模式</span>
          <span class="sp-card__tag">影子模式 → 单策略 → 全局闭环 渐进投放</span>
        </div>
      </div>
      <div class="sp-card__body">
        <div class="mode-switch">
          <div class="seg">
            <button
              v-for="m in modeList"
              :key="m.key"
              :class="{ active: mode === m.key }"
              @click="setMode(m.key)"
            >
              {{ m.label }}
            </button>
          </div>
          <span class="mode-tip">人工可随时切换 · 11.4 节</span>
        </div>
        <div class="mode-desc" v-html="modeInfo[mode].desc"></div>
        <div class="alert-bar" :class="modeInfo[mode].alert.cls" v-html="modeInfo[mode].alert.txt"></div>
      </div>
    </a-card>

    <!-- 本拍设定值下发决策 -->
    <a-card class="sp-card sp-card--mt14" :bordered="false">
      <div class="sp-card__header">
        <div class="sp-card__title">
          <span>本拍设定值下发决策</span>
          <span class="sp-card__tag">逐条 采纳 / 修改 / 跳过</span>
        </div>
        <div class="sp-card__note">每条已标注安全边界与变化率限制 · 越限自动钳位</div>
      </div>
      <div class="sp-card__body sp-card__body--plain">
        <table class="sp-tbl">
          <thead>
            <tr>
              <th>设备 / 子系统</th>
              <th>决策项</th>
              <th class="td-num">当前实测</th>
              <th class="td-num">厂商当前</th>
              <th class="td-num">优化推荐</th>
              <th>安全边界</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, idx) in decisions" :key="idx">
              <td><b>{{ d.dev }}</b> <span class="sp-sub">{{ d.sub || '' }}</span></td>
              <td>{{ d.item }}</td>
              <td class="td-num col-v">{{ measTxt(d) }}</td>
              <td class="td-num col-v">{{ d.vtxt }}</td>
              <td class="td-num col-o">{{ d.otxt }}</td>
              <td class="col-bound">{{ d.bound }}</td>
              <td>
                <div class="act">
                  <button :class="{ 'on-adopt': rowSel[idx] === 'adopt' }" @click="rowState(idx, 'adopt')">采纳</button>
                  <button v-if="d.kind === 'num'" :class="{ 'on-edit': rowSel[idx] === 'edit' }" @click="rowState(idx, 'edit')">修改</button>
                  <button :class="{ 'on-skip': rowSel[idx] === 'skip' }" @click="rowState(idx, 'skip')">跳过</button>
                  <input
                    v-if="rowSel[idx] === 'edit' && d.kind === 'num'"
                    v-model="editVal[idx]"
                    class="inp-edit"
                    type="number"
                    :step="d.unit === '℃' ? '0.1' : '1'"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </a-card>

    <!-- 下发操作区 -->
    <div class="dispatch-actions">
      <button class="sp-btn" @click="adoptAll">一键采纳全部</button>
      <button class="sp-btn sp-btn--primary" :disabled="mode !== 'closed'" @click="openModal">{{ dispatchText }}</button>
      <button class="sp-btn sp-btn--danger" @click="rollback">回退厂商基线</button>
      <button class="sp-btn sp-btn--ghost" @click="freeze">冻结</button>
      <span class="dispatch-actions__fill"></span>
      <span class="dispatch-actions__tip">下发经既有 MODBUS-TCP 可写点 · DDC 秒级 PID 跟踪 · 越限/通信中断自动冻结回退</span>
    </div>

    <!-- 下发日志 -->
    <a-card class="sp-card sp-card--mt14" :bordered="false">
      <div class="sp-card__header">
        <div class="sp-card__title">
          <span>下发日志</span>
          <span class="sp-card__tag">全程留痕 · 可监督可干预</span>
        </div>
        <div class="sp-card__note">最近 8 条</div>
      </div>
      <div class="sp-card__body sp-card__body--plain">
        <table class="sp-tbl">
          <thead>
            <tr>
              <th>时间</th>
              <th>下发点</th>
              <th class="td-num">推荐值</th>
              <th class="td-num">实际下发</th>
              <th>状态</th>
              <th>来源</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in dispatchLog" :key="i">
              <td class="num">{{ r.t }}</td>
              <td>{{ r.pt }}</td>
              <td class="td-num col-v">{{ r.rec }}</td>
              <td class="td-num col-o">{{ r.sent }}</td>
              <td><span class="badge" :class="r.cls">{{ r.st }}</span></td>
              <td class="sp-sub">{{ r.op }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </a-card>

    <!-- 下发确认模态 -->
    <div class="modal-mask" :class="{ show: modalVisible }">
      <div class="modal">
        <div class="m-h">⚡ 确认下发本拍设定值</div>
        <div class="m-b">
          将通过既有 MODBUS-TCP 可写点下发以下设定值，由厂商 DDC 秒级 PID 跟踪执行。<br />
          全部数值已通过边界钳位与变化率限制校验。
          <div class="sum" v-html="modalSum"></div>
        </div>
        <div class="m-f">
          <button class="sp-btn" @click="modalVisible = false">取消</button>
          <button class="sp-btn sp-btn--primary" @click="confirmDispatch">确认下发</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 父组件透传的数据（预留）
const props = defineProps<{ data?: any }>()

// ===================== 数据（原型口径：表3-7 / 表4-2 / 附录A.2） =====================
// 决策行（决策页 + 下发页共用来源），含真实可写点与安全边界
const decisions = ref<any[]>([
  { dev: '1#冷机', sub: '磁悬浮', item: '启停', vtxt: '运行', otxt: '运行', vnum: null, onum: null, unit: '', bound: '—', rate: '加减机稳定 20min', kind: 'onoff' },
  { dev: '2#冷机', sub: '磁悬浮', item: '启停', vtxt: '停止', otxt: '运行', vnum: null, onum: null, unit: '', bound: '—', rate: '加减机稳定 20min', kind: 'onoff', note: '预排程加机' },
  { dev: '3#冷机', sub: '定频离心', item: '启停', vtxt: '停止', otxt: '停止', vnum: null, onum: null, unit: '', bound: '喘振线 ≥40%', rate: '—', kind: 'onoff' },
  { dev: '1#冷机', sub: '磁悬浮', item: '负荷限定', vtxt: '70%', otxt: '62%', vnum: 70, onum: 62, unit: '%', bound: '40% ~ 100%', rate: '—', kind: 'num' },
  { dev: '冷冻水出水温度', sub: 'T_chw', item: '温度设定', vtxt: '7.0℃', otxt: '8.5℃', vnum: 7.0, onum: 8.5, unit: '℃', bound: '5℃ ~ 9℃(除湿上限)', rate: '≤0.5℃/拍', kind: 'num', note: '干日放开' },
  { dev: '冷冻水泵', sub: 'CHW泵', item: '频率', vtxt: '44Hz', otxt: '38Hz', vnum: 44, onum: 38, unit: 'Hz', bound: '30 ~ 50 Hz', rate: '≤30%/min', kind: 'num' },
  { dev: '冷却水泵', sub: 'CW泵', item: '频率', vtxt: '46Hz', otxt: '41Hz', vnum: 46, onum: 41, unit: 'Hz', bound: '30 ~ 50 Hz', rate: '≤30%/min', kind: 'num' },
  { dev: '冷却塔风机', sub: 'CT', item: '频率', vtxt: '42Hz', otxt: '35Hz', vnum: 42, onum: 35, unit: 'Hz', bound: '30 ~ 50 Hz', rate: '—', kind: 'num' },
  { dev: '冷却塔', sub: 'CT', item: '运行台数', vtxt: '4台', otxt: '3台', vnum: 4, onum: 3, unit: '台', bound: '1 ~ 4 台', rate: '—', kind: 'num' },
  { dev: '供冷场景', sub: '系统', item: '独立/集中', vtxt: '集中', otxt: '集中', vnum: null, onum: null, unit: '', bound: '阈值≈2500kW', rate: '知情迟滞', kind: 'onoff' },
  { dev: '2号馆热泵', sub: '分馆', item: '出水温度', vtxt: '8.0℃', otxt: '9.0℃', vnum: 8.0, onum: 9.0, unit: '℃', bound: '7 ~ 10 ℃', rate: '≤0.5℃/拍', kind: 'num' },
  { dev: '集中热泵', sub: '12台', item: '运行台数', vtxt: '8台', otxt: '6台', vnum: 8, onum: 6, unit: '台', bound: '0 ~ 12 台', rate: '—', kind: 'num', note: '边际COP调度' },
])

// 每行选择状态（adopt / edit / skip）与编辑值
const rowSel = ref<Record<number, string>>({})
const editVal = ref<Record<number, string>>({})

/** 当前实测列文案（演示：与厂商当前一致） */
const measTxt = (d: any) => (d.kind === 'num' ? d.vnum.toFixed(d.unit === '℃' ? 1 : 0) + d.unit : d.vtxt)

/** 逐条 采纳/修改/跳过 */
const rowState = (idx: number, act: string) => {
  rowSel.value[idx] = act
  if (act === 'edit' && decisions.value[idx].kind === 'num') {
    editVal.value[idx] = String(decisions.value[idx].onum)
  }
}

// 一键采纳全部
const adoptAll = () => {
  decisions.value.forEach((d, i) => rowState(i, 'adopt'))
  toast(`已全部采纳优化推荐值（${decisions.value.length} 条）`)
}

/** 汇总待下发条目 */
const pendingSummary = () => {
  let adopt = 0
  let edit = 0
  let skip = 0
  const edits: string[] = []
  decisions.value.forEach((d, i) => {
    const s = rowSel.value[i] || 'adopt'
    if (s === 'adopt') adopt++
    else if (s === 'skip') skip++
    else if (s === 'edit') {
      edit++
      edits.push(`${d.dev}·${d.item}=${editVal.value[i] ?? d.otxt}${d.unit}`)
    }
  })
  return { adopt, edit, skip, edits, total: decisions.value.length }
}

// ===================== 运行模式 =====================
const modeList = [
  { key: 'shadow', label: '影子模式' },
  { key: 'closed', label: '闭环模式' },
  { key: 'pause', label: '暂停冻结' },
]
const mode = ref('closed')

const modeInfo: Record<string, any> = {
  shadow: {
    desc: '<b>影子模式</b>：优化层与厂商系统并行计算，<b>只出建议不下发指令</b>，冷站仍由厂商 DDC 实际控制——零风险校验节能潜力与建议合理性。',
    alert: { cls: 'warn', txt: '⚠ 影子模式 · 下发按钮已禁用，所有推荐仅作对比展示，不写入可写点。' },
  },
  closed: {
    desc: '<b>闭环模式</b>：优化层按每小时一拍求解，<b>仅下发最近一时段设定值</b>给 DDC，下一拍用最新预测与实测重解。越限/通信中断自动冻结并回退厂商原逻辑。',
    alert: { cls: 'ok', txt: '● 闭环在线 · 14:00 拍推荐已生成，待人工确认下发（可逐条采纳/修改/跳过）。' },
  },
  pause: {
    desc: '<b>暂停冻结</b>：优化层停止下发，所有可写点保持当前值不变，冷站交由厂商 DDC 接管。',
    alert: { cls: 'warn', txt: '⏸ 已冻结 · 设定值维持不变，优化层退出控制，厂商 DDC 全权接管。' },
  },
}

const setMode = (m: string) => {
  mode.value = m
}

/** 下发按钮文案（随模式变化） */
const dispatchText = computed(() =>
  mode.value === 'closed' ? '下发本拍' : mode.value === 'shadow' ? '影子模式·不下发' : '已冻结',
)

// ===================== 下发日志 =====================
const dispatchLog = ref<any[]>([
  { t: '14:00', pt: '冷冻水出水温度 T_chw', rec: '8.5℃', sent: '8.5℃', st: '成功', cls: 'ok', op: '自动·闭环' },
  { t: '14:00', pt: '2#冷机 启停', rec: '启动', sent: '启动', st: '成功', cls: 'ok', op: '自动·闭环' },
  { t: '13:00', pt: '冷冻水泵频率', rec: '37Hz', sent: '38Hz', st: '越限钳位(变化率)', cls: 'warn', op: '自动·闭环' },
  { t: '12:00', pt: '供冷场景', rec: '集中', sent: '集中', st: '维持', cls: 'neutral', op: '自动·闭环' },
  { t: '11:00', pt: '3#冷机 负荷限定', rec: '38%', sent: '40%', st: '越限钳位(喘振下限)', cls: 'warn', op: '自动·闭环' },
  { t: '10:00', pt: '优化层通信', rec: '—', sent: '回退厂商基线', st: '已回退(瞬时中断)', cls: 'crit', op: '系统' },
  { t: '09:00', pt: '冷却塔风机频率', rec: '35Hz', sent: '35Hz', st: '成功', cls: 'ok', op: '自动·闭环' },
  { t: '08:00', pt: '1#冷机 负荷限定', rec: '60%', sent: '60%', st: '成功', cls: 'ok', op: '自动·闭环' },
])

/** 追加日志（保留最近 8 条） */
const pushLog = (row: any) => {
  dispatchLog.value.unshift(row)
  if (dispatchLog.value.length > 8) dispatchLog.value.pop()
}

// ===================== 下发交互 =====================
const modalVisible = ref(false)

const openModal = () => {
  if (mode.value !== 'closed') {
    toast('当前模式不可下发')
    return
  }
  modalVisible.value = true
}

const modalSum = computed(() => {
  const s = pendingSummary()
  const ed = s.edits.length ? `；修改 ${s.edits.join('、')}` : ''
  return (
    `共 <b>${s.total}</b> 条：采纳 <b>${s.adopt}</b> · 跳过 <b>${s.skip}</b> · 修改 <b>${s.edit}</b>` +
    ed +
    `<br><span style="color:#898781">写入 MODBUS-TCP 可写点 → DDC 秒级 PID 跟踪</span>`
  )
})

const confirmDispatch = () => {
  modalVisible.value = false
  const s = pendingSummary()
  const now = new Date()
  const t = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  pushLog({ t, pt: `本拍设定值集(${s.adopt + s.edit}条)`, rec: '优化推荐', sent: '已下发', st: '成功', cls: 'ok', op: 'admin·闭环' })
  toast(`⚡ 已下发 ${s.adopt + s.edit} 条设定值至 MODBUS-TCP 可写点 · DDC PID 跟踪中`)
}

const rollback = () => {
  const now = new Date()
  const t = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  pushLog({ t, pt: '优化层→厂商基线', rec: '—', sent: '回退厂商基线', st: '已回退(人工)', cls: 'crit', op: 'admin' })
  setMode('pause')
  toast('已回退厂商基线 · 优化层冻结')
}

const freeze = () => {
  setMode('pause')
  toast('优化层已冻结')
}

// ===================== Toast =====================
const toastVisible = ref(false)
const toastMsg = ref('')
let toastTimer: any
const toast = (msg: string) => {
  toastMsg.value = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toastVisible.value = false), 2600)
}

const pad = (n: number) => String(n).padStart(2, '0')

// ===================== 父组件透传数据覆盖 =====================
const loadApiData = () => {
  const d = props.data as any
  if (Array.isArray(d?.decisions) && d.decisions.length) decisions.value = d.decisions
  if (Array.isArray(d?.dispatchLog) && d.dispatchLog.length) dispatchLog.value = d.dispatchLog
}

onMounted(() => {
  loadApiData()
  decisions.value.forEach((d, i) => rowState(i, 'adopt'))
})
</script>

<style scoped lang="less">
.setpoint-tab {
  .sp-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.ant-card-body) {
      padding: 0;
    }

    &--mt14 {
      margin-top: 14px;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      padding: 11px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    &__title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }

    &__tag {
      font-size: 11px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.45);
      background: #eef3f9;
      padding: 2px 8px;
      border-radius: 10px;
    }

    &__note {
      font-size: 12px;
      color: #898781;
    }

    &__body {
      padding: 14px 16px;

      &--plain {
        padding: 0;
      }
    }
  }

  /* 运行模式 */
  .mode-switch {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;

    .seg {
      display: inline-flex;
      background: #eef1f6;
      border-radius: 7px;
      padding: 3px;

      button {
        border: 0;
        background: transparent;
        padding: 7px 16px;
        font-size: 13px;
        color: #52514e;
        border-radius: 5px;
        font-weight: 500;
        cursor: pointer;
        font-family: inherit;

        &.active {
          background: #fff;
          color: #1f3a5f;
          font-weight: 700;
          box-shadow: 0 1px 2px rgba(17, 24, 39, 0.05), 0 2px 8px rgba(17, 24, 39, 0.04);
        }
      }
    }

    .mode-tip {
      font-size: 12px;
      color: #898781;
    }
  }

  .mode-desc {
    font-size: 12.5px;
    color: #52514e;
    padding: 10px 14px;
    border-radius: 6px;
    background: #f7f9fc;
    border: 1px solid #eef0f3;
    margin-top: 14px;

    b {
      color: #1f3a5f;
    }
  }

  .alert-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 12.5px;
    margin-top: 10px;

    &.ok {
      background: rgba(12, 163, 12, 0.08);
      color: #1d6e1d;
      border: 1px solid rgba(12, 163, 12, 0.2);
    }

    &.warn {
      background: rgba(250, 178, 25, 0.12);
      color: #8a6a10;
      border: 1px solid rgba(250, 178, 25, 0.3);
    }
  }

  /* 表格 */
  .sp-tbl {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;

    th {
      background: #f4f6f9;
      color: #52514e;
      font-weight: 600;
      text-align: left;
      padding: 9px 12px;
      border-bottom: 1px solid rgba(17, 24, 39, 0.1);
      white-space: nowrap;
    }

    td {
      padding: 9px 12px;
      border-bottom: 1px solid #f0f2f5;
      vertical-align: middle;
      color: rgba(0, 0, 0, 0.65);
    }

    tr:hover td {
      background: #fafbfc;
    }

    .td-num {
      font-variant-numeric: tabular-nums;
      text-align: right;
    }

    .col-v {
      color: #52514e;
    }

    .col-o {
      color: #e8833a;
      font-weight: 700;
    }

    .col-bound {
      color: #898781;
      font-size: 11.5px;
    }

    .sp-sub {
      color: #898781;
    }

    .num {
      font-variant-numeric: tabular-nums;
    }
  }

  /* 状态徽标 */
  .badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
    white-space: nowrap;

    &.ok {
      color: #0ca30c;
      background: rgba(12, 163, 12, 0.12);
    }

    &.warn {
      color: #b07a18;
      background: rgba(250, 178, 25, 0.18);
    }

    &.crit {
      color: #d03b3b;
      background: rgba(208, 59, 59, 0.12);
    }

    &.neutral {
      color: #52514e;
      background: #eef0f9;
    }
  }

  /* 下发行操作 */
  .act {
    display: inline-flex;
    gap: 4px;
    align-items: center;

    button {
      border: 1px solid rgba(17, 24, 39, 0.1);
      background: #fff;
      color: #52514e;
      padding: 3px 9px;
      border-radius: 4px;
      font-size: 11.5px;
      cursor: pointer;
      font-family: inherit;

      &.on-adopt {
        background: rgba(46, 139, 87, 0.12);
        color: #2e8b57;
        border-color: rgba(46, 139, 87, 0.3);
        font-weight: 600;
      }

      &.on-edit {
        background: rgba(232, 131, 58, 0.14);
        color: #e8833a;
        border-color: rgba(232, 131, 58, 0.35);
        font-weight: 600;
      }

      &.on-skip {
        background: #eef1f6;
        color: #898781;
        border-color: rgba(17, 24, 39, 0.1);
        font-weight: 600;
      }
    }
  }

  .inp-edit {
    width: 84px;
    border: 1px solid #e8833a;
    border-radius: 4px;
    padding: 3px 6px;
    font-size: 12px;
    text-align: right;
    color: #1f3a5f;
    font-weight: 600;
    outline: none;
  }

  /* 操作按钮区 */
  .dispatch-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 14px;

    &__fill {
      flex: 1;
    }

    &__tip {
      font-size: 12px;
      color: #898781;
    }
  }

  .sp-btn {
    padding: 9px 18px;
    border-radius: 6px;
    border: 1px solid rgba(17, 24, 39, 0.1);
    background: #fff;
    color: #52514e;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;

    &:hover {
      background: #f4f6f9;
    }

    &--primary {
      background: #1f3a5f;
      color: #fff;
      border-color: #1f3a5f;

      &:hover {
        background: #173050;
      }

      &:disabled {
        background: #9aa6b5;
        border-color: #9aa6b5;
        cursor: not-allowed;
      }
    }

    &--danger {
      background: #fff;
      color: #d03b3b;
      border-color: rgba(208, 59, 59, 0.4);

      &:hover {
        background: rgba(208, 59, 59, 0.06);
      }
    }

    &--ghost {
      background: transparent;
    }
  }

  /* 模态框 */
  .modal-mask {
    position: fixed;
    inset: 0;
    background: rgba(17, 24, 39, 0.45);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1050;

    &.show {
      display: flex;
    }

    .modal {
      background: #fff;
      border-radius: 10px;
      width: 440px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
      overflow: hidden;

      .m-h {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(17, 24, 39, 0.1);
        font-size: 15px;
        font-weight: 700;
        color: #1f3a5f;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .m-b {
        padding: 18px 20px;
        font-size: 13px;
        color: #52514e;
        line-height: 1.7;

        .sum {
          background: #f7f9fc;
          border: 1px solid #eef0f3;
          border-radius: 6px;
          padding: 10px 12px;
          margin-top: 8px;
          font-size: 12.5px;
          color: #1f2937;
        }
      }

      .m-f {
        padding: 12px 20px;
        border-top: 1px solid rgba(17, 24, 39, 0.1);
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        background: #fafbfc;
      }
    }
  }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 46px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #1f3a5f;
    color: #fff;
    padding: 12px 22px;
    border-radius: 8px;
    font-size: 13px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
    opacity: 0;
    transition: 0.25s;
    z-index: 1060;
    pointer-events: none;

    &.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
}
</style>
