<script setup lang="ts">
/* 回路诊断 · 规则与知识库子视图（版式参照 AIFD 规则与知识库图）：
 * 问题模型按故障域组织 | 问题定义 + 判定逻辑 + 规则明细 + 诊断输出 | 数据参与 + 模型可用度 + 知识关系。
 * 规则明细中的判定条件实时取自当前阈值 TH，与实时诊断引擎永远一致；"查看实时命中回路"跳回实时诊断并按规则筛选。 */
import { computed } from 'vue'
import { KB, KB_DOMAINS, KB_VERSION } from '../lib/kb.js'
import { TH, DG, alarms, alarmModelCode } from '../lib/store.js'

/* 各问题模型当前实时命中数（note 级不计） */
const counts = computed(() => {
  const m = {}
  alarms.value.forEach(a => { if (a.level !== 'note') { const k = alarmModelCode(a); m[k] = (m[k] || 0) + 1 } })
  return m
})

const probs = computed(() => {
  const q = DG.kbSearch.trim().toLowerCase()
  return KB.filter(x => (DG.kbDomain === '全部' || x.domain === DG.kbDomain) &&
    (!q || (x.name + x.summary + x.definition + x.rules.map(r => r.join('')).join('')).toLowerCase().indexOf(q) >= 0))
})

const model = computed(() => KB.find(k => k.id === DG.prob) || KB[0])

/* 阈值占位符替换：知识库展示与引擎判定共用同一 TH */
function fmt (s) {
  const loV = Math.round(TH.voltNom * (1 - TH.voltPct / 100))
  const hiV = Math.round(TH.voltNom * (1 + TH.voltPct / 100))
  return String(s)
    .replace(/{openA}/g, String(TH.openA)).replace(/{stuckA}/g, String(TH.stuckA))
    .replace(/{overA}/g, String(TH.overA)).replace(/{voltPct}/g, String(TH.voltPct))
    .replace(/{loV}/g, String(loV)).replace(/{hiV}/g, String(hiV))
}
function viewHits () { DG.codeFilter = DG.prob; DG.sub = 'live' }
const sevBadge = s => s === '严重' ? 'b-crit' : s === '预警' ? 'b-warn' : 'b-off'
const LGC = { req: 'lc-req', abn: 'lc-abn', exc: 'lc-exc', dur: 'lc-dur' }
const DPTXT = { ready: '已具备', missing: '缺失', optional: '可选' }
</script>

<template>
  <div class="tabdiag">
    <div class="dg-toolbar">
      <div class="seg">
        <button :class="{ on: DG.sub === 'live' }" @click="DG.sub = 'live'">实时诊断</button>
        <button :class="{ on: DG.sub === 'kb' }">规则与知识库</button>
      </div>
      <strong style="font-size:14px">规则与知识库</strong>
      <span class="subh">问题模型 · 判定逻辑 · 数据要求 —— 与实时诊断引擎同源</span>
      <div class="tspacer"></div>
      <label class="dg-search">🔍<input v-model="DG.kbSearch" type="search" placeholder="搜索问题 / 规则 / 参与数据"></label>
      <button class="ghostbtn" @click="viewHits">📡 查看实时命中回路</button>
      <span class="kbver">{{ KB_VERSION }}</span>
    </div>

    <div class="dg-grid">
      <!-- 左：问题模型（按故障域） -->
      <div class="dg-col" style="flex:0 0 240px">
        <div class="card dg-fill dg-scroll">
          <h3>问题模型 <span class="subh">按故障域组织</span></h3>
          <div style="margin-bottom:8px">
            <button v-for="d in KB_DOMAINS" :key="d" class="chip" :class="{ on: DG.kbDomain === d }"
              style="margin:0 4px 4px 0" @click="DG.kbDomain = d">{{ d }}</button>
          </div>
          <button v-for="x in probs" :key="x.id" class="prob-item" :class="{ on: DG.prob === x.id }" @click="DG.prob = x.id">
            <span class="pi-h">
              <b>{{ x.name }}</b>
              <span class="pi-hit" :class="{ zero: !counts[x.id] }">{{ counts[x.id] || 0 }}</span>
            </span>
            <span class="subh">{{ x.domain }} · {{ x.summary }}</span>
          </button>
          <div v-if="!probs.length" class="hint" style="padding:16px">没有符合条件的问题模型</div>
        </div>
      </div>

      <!-- 中：问题定义 + 判定逻辑 + 规则明细 + 诊断输出 -->
      <div class="dg-col" style="flex:1;min-width:480px">
        <div class="card dg-fill dg-scroll">
          <div class="chead">
            <div>
              <div class="titleline">
                <span class="badge" :class="sevBadge(model.severity)">{{ model.severity }}</span>
                <h2>{{ model.name }}</h2>
              </div>
              <div class="meta" style="margin-top:4px">{{ model.definition }}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div class="subh">启用规则</div>
              <div class="num" style="font-size:22px;font-weight:700">{{ model.rules.length }}</div>
            </div>
          </div>

          <div class="section-head"><h3 style="margin:0">判定逻辑</h3><span class="subh">必要条件 · 异常条件 · 排除条件 · 持续时间</span></div>
          <div class="logic-flow">
            <div v-for="lg in model.logic" :key="lg[0]" class="logic-card" :class="LGC[lg[3]]">
              <span class="lt">{{ lg[0] }}</span><b>{{ lg[1] }}</b><p>{{ fmt(lg[2]) }}</p>
            </div>
          </div>

          <div class="section-head"><h3 style="margin:0">规则明细</h3><span class="subh">每条规则的指标、运算方式和判定作用（阈值为当前生效值）</span></div>
          <table class="tbl">
            <tr><th>规则</th><th>参与数据</th><th>判定条件</th><th>时间窗口</th><th>作用</th></tr>
            <tr v-for="r in model.rules" :key="r[0]">
              <td><strong>{{ r[0] }}</strong></td><td>{{ r[1] }}</td><td>{{ fmt(r[2]) }}</td><td>{{ r[3] }}</td><td>{{ r[4] }}</td>
            </tr>
          </table>

          <div class="section-head"><h3 style="margin:0">诊断输出</h3>
            <button class="ghostbtn" @click="viewHits">查看实时命中回路（{{ counts[model.id] || 0 }} 条）</button></div>
          <div class="outtiles">
            <div v-for="o in model.outputs" :key="o[0]" class="outtile"><span class="cl">{{ o[0] }}</span><span class="cv">{{ o[1] }}</span></div>
          </div>
        </div>
      </div>

      <!-- 右：数据参与 / 模型可用度 / 知识关系 -->
      <div class="dg-col" style="flex:0 0 300px">
        <div class="dg-colwrap">
          <div class="card">
            <h3>数据参与 <span class="subh">采集要求与当前可用性</span></h3>
            <div v-for="d in model.deps" :key="d[0]" class="dep">
              <div><b>{{ d[0] }}</b><div class="role">{{ d[1] }}</div></div>
              <i class="dbadge" :class="d[2]">{{ DPTXT[d[2]] }}</i>
            </div>
          </div>
          <div class="card">
            <h3>当前模型可用度</h3>
            <div style="display:flex;align-items:baseline;gap:8px">
              <span class="cov-big num">{{ model.coverage }}%</span>
              <span class="subh">基于现有采集数据</span>
            </div>
            <div class="cov-track"><div class="cov-fill" :style="{ width: model.coverage + '%' }"></div></div>
            <p class="ctext" style="font-size:12px;color:#52514e">{{ model.covNote }}</p>
          </div>
          <div class="card">
            <h3>知识关系</h3>
            <div class="rel">
              <template v-for="(n, i) in model.relation" :key="n">
                <i class="arr">→</i><span class="node">{{ n }}</span>
              </template>
            </div>
            <p class="cnote">后续可接入维修案例、设备手册和回路拓扑，为 GraphRAG 检索解释提供关系基础。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
