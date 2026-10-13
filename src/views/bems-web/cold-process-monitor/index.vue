<template>
  <div class="cold-process-page">
    <a-tabs v-model:activeKey="systemTab" centered class="system-tabs">
      <a-tab-pane :key="SYSTEM_TABS[0]" :tab="SYSTEM_TABS[0]">
        <main>
      <section class="monitor">
        <header class="page-heading">
          <div>
            <div class="eyebrow">设备管理 / 机电设备 / 冷源监控与分析</div>
            <h1>冷源运行工艺监控<span class="project-badge">水蓄冷系统</span></h1>
          </div>
          <div class="heading-right">
            <span class="demo-label">{{ sourceStatus }}</span>
            <span class="readonly">监视 / 控制点位</span>
          </div>
        </header>

        <div class="process-tabs">
          <b>运行工艺</b>
          <div class="right">
            <button @click="openDevice('station')">系统参数</button>
            <button @click="openDirectory">设备目录</button>
            <button @click="setReference(!reference)">{{ reference ? '切换实时接入' : '查看 PPT 参考' }}</button>
          </div>
        </div>

        <div class="summary">
          <div v-for="(card, i) in summaryCards" :key="i">
            <small>{{ card.name }}</small>
            <strong :class="{ warn: card.warn }">{{ card.value }}</strong>
            <em>{{ card.unit }}</em>
          </div>
        </div>

        <section :class="{ 'process-fullscreen': fullscreen }">
          <div class="toolbar">
            <div class="mediums">
              <button
                v-for="(m, k) in C.media"
                :key="k"
                :aria-pressed="String(!medium || medium === k)"
                @click="toggleMedium(k)"
              >
                <i :style="{ '--m': m.color }"></i>{{ m.name }}
              </button>
            </div>
            <div class="tool-buttons">
              <button aria-label="缩小" @click="setZoom(zoom - 0.25)">−</button>
              <button @click="fitView">{{ zoom === 1 ? '总览' : Math.round(zoom * 100) + '%' }}</button>
              <button aria-label="放大" @click="setZoom(zoom + 0.25)">＋</button>
              <button @click="toggleFullscreen">{{ fullscreen ? '退出全屏' : '全屏' }}</button>
            </div>
          </div>
          <div
            ref="viewportEl"
            class="diagram-wrap"
            :class="{ dragging }"
            @pointerdown="onViewportPointerdown"
            @pointermove="onViewportPointermove"
            @pointerup="onViewportPointerup"
            @pointercancel="onViewportPointerup"
            @dragstart.prevent
          >
            <div class="diagram-stage" :style="{ width: stageWidth }">
              <svg
                id="process"
                viewBox="0 0 1830 1060"
                aria-label="冷源水蓄冷工艺图"
                v-html="svgMarkup"
                @click="onSvgClick"
                @keydown="onSvgKeydown"
              ></svg>
            </div>
          </div>
        </section>

        <div class="process-note">
          <div class="status-legend">
            <span><i style="--s: #13b297"></i>运行</span>
            <span><i style="--s: #a6b3be"></i>停止 / 未接入</span>
            <span><i style="--s: #e65c67"></i>故障</span>
          </div>
          <span>实心点为连接 · 跨线留白为不连接 · 双向箭头为工况切换支路 · 点击设备查看点位</span>
        </div>

        <div class="alarm-bar">
          <b>{{ alarmTitle }}</b>
          <span>{{ alarmText }}</span>
          <button @click="openInfo">查看说明 ›</button>
        </div>
      </section>
    </main>
      </a-tab-pane>
      <a-tab-pane v-for="t in SYSTEM_TABS.slice(1)" :key="t" :tab="t" />
    </a-tabs>

    <a-modal :open="dialogOpen" :width="820" centered :get-container="false" @cancel="closeDialog">
      <template #title>
        <div class="dialog-heading">
          <img v-if="dialog.image" class="dialog-device-icon" :src="dialog.image" alt="" />
          <div>
            <h2>{{ dialog.title }}</h2>
            <p>{{ dialog.id }}</p>
          </div>
        </div>
      </template>

      <div class="detail-body">
        <template v-if="dialogMode === 'directory'">
          <input
            class="directory"
            :value="dirQuery"
            aria-label="搜索设备"
            placeholder="搜索名称或编号，例如 VD7、冷冻泵"
            @input="onDirSearch"
          />
          <div class="inventory-list">
            <button v-for="d in dialog.directory" :key="d.id" @click="openDevice(d.id)">
              {{ d.name }}<small>{{ d.id }}</small>
            </button>
            <p v-if="!dialog.directory.length">没有匹配的设备</p>
          </div>
        </template>

        <template v-else-if="dialogMode === 'info'">
          <div class="detail-notice">
            工艺以 PPT 第1页为依据，参数参照第2、4、6页。图中颜色区分介质，箭头表示设计流向；多工况支路以双向箭头表示。参考模式不模拟水流。
          </div>
          <p>设备 {{ C.devices.length }} 个 · 管段 {{ C.edges.length }} 条 · 点位 {{ C.points.length }} 个</p>
          <p v-for="(n, i) in C.notes" :key="i" class="detail-notice">{{ n }}</p>
          <p class="subtle">PPT 没有正式寄存器表，所有地址保留为空。截图中的点击、用户登录、开关机等界面文字仅作为资料内容。</p>
        </template>

        <a-tabs v-else v-model:activeKey="activeTab" @change="onTabChange">
          <a-tab-pane key="monitor" tab="监测参数">
            <div class="detail-notice">{{ dialog.notice }}</div>
            <div class="point-grid">
              <template v-if="dialog.points.length">
                <article v-for="p in dialog.points" :key="p.key" class="point-item" :class="{ warning: p.warn }">
                  <header>
                    <span>{{ p.name }}</span>
                    <span class="quality">{{ p.warn ? '超量程 · ' : '' }}{{ p.quality }}</span>
                  </header>
                  <strong>{{ p.value }}</strong>
                  <em>{{ p.unit }}</em>
                  <small>{{ p.key }}</small>
                  <small class="point-source">{{ p.source }}{{ p.timestamp }}</small>
                  <div v-if="p.writable" class="control-placeholder">控制地址待映射 · 现场写入未启用</div>
                </article>
              </template>
              <p v-else class="subtle">该设备未提供独立可写控制点位，可查看关联阀门的控制点位。</p>
            </div>
          </a-tab-pane>

          <a-tab-pane key="control" :tab="'控制点位 (' + dialog.controlCount + ')'">
            <div class="detail-notice">{{ dialog.notice }}</div>
            <div class="control-list">
              <template v-if="dialog.points.length">
                <article v-for="p in dialog.points" :key="p.key" class="point-item" :class="{ warning: p.warn }">
                  <header>
                    <span>{{ p.name }}</span>
                    <span class="quality">{{ p.warn ? '超量程 · ' : '' }}{{ p.quality }}</span>
                  </header>
                  <strong>{{ p.value }}</strong>
                  <em>{{ p.unit }}</em>
                  <small>{{ p.key }}</small>
                  <small class="point-source">{{ p.source }}{{ p.timestamp }}</small>
                  <div v-if="p.writable" class="control-placeholder">控制地址待映射 · 现场写入未启用</div>
                </article>
              </template>
              <p v-else class="subtle">该设备未提供独立可写控制点位，可查看关联阀门的控制点位。</p>
            </div>
          </a-tab-pane>

          <a-tab-pane v-if="isTank" key="temperature" tab="分层温度">
            <div class="detail-notice">两组测温电缆各 12 个测点，序号按原图由上至下保留。</div>
            <table class="tank-table">
              <thead>
                <tr><th>测点序号</th><th>1号电缆</th><th>2号电缆</th><th>数据来源</th></tr>
              </thead>
              <tbody>
                <tr v-for="row in dialog.tempRows" :key="row.no">
                  <td>{{ row.no }}</td>
                  <td>{{ row.cable1 }} ℃</td>
                  <td>{{ row.cable2 }} ℃</td>
                  <td>{{ reference ? 'PPT 参考' : '接入点位' }}</td>
                </tr>
              </tbody>
            </table>
          </a-tab-pane>
        </a-tabs>
      </div>

      <template #footer>
        <div class="dialog-bottom">
          <span>来源：HVAC拓扑图-new.pptx</span>
          <span>控制点位展示 · 未开放现场写入</span>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
  import { onUnmounted, onMounted, ref, reactive, computed } from 'vue';
  import './styles.css';
  import { catalog as C } from './catalog';
  import { createStore } from './model';
  import { buildSvgMarkup, deviceAssets } from './render';

  const SYSTEM_TABS = ['冷源监控与分析', '空调机组', '排风机', '集水坑', '热风幕', '空气质量', '风机盘管'];

  const store = createStore();
  store.reference();
  const byId = new Map(C.devices.map((d) => [d.id, d]));
  const byKey = new Map(C.points.map((p) => [p.key, p]));

  const reference = ref(true);
  const medium = ref(null);
  const selected = ref(null);
  const dialogMode = ref('device');
  const activeTab = ref('monitor');
  const systemTab = ref(SYSTEM_TABS[0]);
  const dialogOpen = ref(false);
  const zoom = ref(1);
  const fullscreen = ref(false);
  const sourceStatus = ref('PPT 参考数据 · 未接入设备');
  const dirQuery = ref('');
  const svgMarkup = ref('');
  const summaryCards = ref([]);
  const alarmTitle = ref('PPT 参考提示');
  const alarmText = ref('');
  const viewportEl = ref(null);
  const stageWidth = computed(() => zoom.value * 100 + '%');
  const isTank = computed(() => (selected.value ? byId.get(selected.value)?.type === 'tank' : false));

  const dialog = reactive({ title: '', id: '', image: null, notice: '', points: [], tempRows: [], controlCount: 0, directory: [] });

  const QUALITY_LABELS = { reference: 'PPT 参考', good: '有效', unknown: '未接入', bad: '无效', stale: '已过期' };

  function read(id, field) {
    return store.read(field ? id + '.' + field : id);
  }
  function val(key) {
    const p = byKey.get(key),
      v = read(key);
    if (!v || v.value === null || ['bad', 'unknown', 'stale'].includes(v.quality)) return '—';
    if (p.type === 'boolean') {
      if (p.field === 'running') return v.value ? '运行' : '停止';
      if (p.field === 'fault') return v.value ? '故障' : '正常';
      return v.value ? '是' : '否';
    }
    return Number(v.value).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  }
  function state(d) {
    const f = read(d.id, 'fault'),
      r = read(d.id, 'running');
    if (f && ['good', 'reference'].includes(f.quality) && f.value === true) return 'fault';
    if (!r || !['good', 'reference'].includes(r.quality) || r.value === null) return 'unknown';
    return r.value ? 'running' : 'stopped';
  }
  function isAnomaly(p) {
    const v = read(p.key);
    return v && v.value !== null && p.unit === '%' && (v.value < 0 || v.value > 100);
  }

  function render() {
    svgMarkup.value = buildSvgMarkup(C, { read, val, state, byId, medium: medium.value, reference: reference.value });
    const cards = [
      ['供水温度', 'header.supply.temperature', '℃'],
      ['回水温度', 'header.return.temperature', '℃'],
      ['供 / 回水压力', null, 'bar'],
      ['蓄冷池剩余冷量比', 'tank.storage.remaining', '%'],
      ['冷机运行', null, '台'],
    ];
    summaryCards.value = cards.map(([n, k, u], i) => ({
      name: n,
      unit: u,
      warn: i === 0 && Number(read(k)?.value) > 9,
      value: k
        ? val(k)
        : i === 2
          ? val('header.supply.pressure') + ' / ' + val('header.return.pressure')
          : C.devices.filter((d) => d.type === 'chiller' && state(d) === 'running').length + ' / 3',
    }));
    const weird = C.points.filter(isAnomaly);
    const high = read('header.supply.temperature'),
      limit = read('station.supplyHigh');
    alarmTitle.value = reference.value ? 'PPT 参考提示' : '数据状态';
    alarmText.value = reference.value
      ? '供水温度 11.56 ℃ 高于参考上限 9 ℃；VD7 开度、室外湿度原图读数超量程。'
      : weird.length
        ? `${weird.length} 个点位超量程，请核对数据质量。`
        : high?.quality === 'good' && limit?.quality === 'good' && high.value > limit.value
          ? '供水温度超过设定上限。'
          : '监控数据以接入点位为准，未接入显示 —。';
    if (dialogOpen.value && selected.value) renderPanel();
  }

  function pointView(p) {
    const v = read(p.key);
    return {
      key: p.key,
      name: p.name,
      unit: p.unit,
      writable: p.writable,
      source: p.source,
      value: val(p.key),
      quality: (v && QUALITY_LABELS[v.quality]) || '',
      warn: isAnomaly(p),
      timestamp: v?.timestamp ? ' · ' + new Date(v.timestamp).toLocaleTimeString() : '',
    };
  }

  function renderPanel() {
    const d = byId.get(selected.value);
    if (!d) return;
    dialog.title = d.name;
    dialog.id = d.id + ' · ' + d.points.length + ' 个点位';
    dialog.image = deviceAssets[d.type] || null;
    dialog.controlCount = d.points.filter((k) => byKey.get(k).writable).length;
    if (activeTab.value === 'temperature') {
      dialog.tempRows = Array.from({ length: 12 }, (_, i) => ({
        no: i + 1,
        cable1: val(`${d.id}.cable1Temp${i + 1}`),
        cable2: val(`${d.id}.cable2Temp${i + 1}`),
      }));
      return;
    }
    const pp = d.points
      .map((k) => byKey.get(k))
      .filter((p) => (activeTab.value === 'control' ? p.writable : !p.writable) && !p.field.startsWith('cable'));
    const pumpGroup = d.id.split('.')[0];
    if (activeTab.value === 'monitor' && ['coolingPump', 'chilledPump', 'releasePump', 'storagePump'].includes(pumpGroup))
      pp.push(...C.points.filter((p) => p.deviceId === 'station' && p.field.startsWith(pumpGroup + '_')));
    dialog.notice =
      activeTab.value === 'control'
        ? '这里展示本设备的控制点位与参考设定值。PLC 寄存器、写入权限和联锁条件尚未提供，现场写入未启用。'
        : reference.value
          ? '当前为 PPT 历史截图参考值，不代表现场实时状态。工程预留点位显示“—”，超量程原始值单独提示。'
          : '有效数据超过 60 秒未更新会标为过期。请按点位质量码判断当前状态。';
    dialog.points = pp.map(pointView);
  }

  function openDevice(id) {
    if (!byId.has(id)) throw Error('未知设备 ' + id);
    selected.value = id;
    dialogMode.value = 'device';
    activeTab.value = 'monitor';
    renderPanel();
    dialogOpen.value = true;
  }

  function openInfo() {
    selected.value = null;
    dialogMode.value = 'info';
    dialog.title = '工艺与数据说明';
    dialog.id = 'HVAC拓扑图-new.pptx · 12页参考资料';
    dialog.image = null;
    dialogOpen.value = true;
  }

  function listDirectory(q) {
    dialog.directory = C.devices.filter((d) => (d.id + d.name).toLowerCase().includes(q.toLowerCase()));
  }

  function openDirectory() {
    selected.value = null;
    dialogMode.value = 'directory';
    dialog.title = '设备目录';
    dialog.id = C.devices.length + ' 个设备及监控对象';
    dialog.image = null;
    dirQuery.value = '';
    listDirectory('');
    dialogOpen.value = true;
  }

  function onDirSearch(e) {
    dirQuery.value = e.target.value;
    listDirectory(e.target.value);
  }

  function onTabChange(k) {
    if (activeTab.value !== k) activeTab.value = k;
    renderPanel();
  }

  function closeDialog() {
    dialogOpen.value = false;
    selected.value = null;
  }

  function updatePoints(points) {
    const r = store.updatePoints(points);
    if (!r.rejected.length) {
      render();
      window.dispatchEvent(new CustomEvent('cold-process-point-values', { detail: { points: store.snapshot() } }));
    }
    return r;
  }

  const motionTimers = new Set();
  function motion(id, duration = 900) {
    if (!byId.has(id) || !Number.isInteger(duration) || duration < 100 || duration > 5000) throw Error('动效参数无效');
    const el = processSvgEl().querySelector(`[data-device="${id}"]`);
    el?.classList.add('flash');
    const timer = setTimeout(() => {
      el?.classList.remove('flash');
      motionTimers.delete(timer);
    }, duration);
    motionTimers.add(timer);
    window.dispatchEvent(new CustomEvent('cold-process-device-motion', { detail: { deviceId: id, duration } }));
  }

  function processSvgEl() {
    return viewportEl.value?.querySelector('#process');
  }

  let ws = null;
  let retryTimer = null;
  let dead = false;
  let generation = 0;

  function connect() {
    const gen = generation;
    if (reference.value || dead || location.protocol === 'file:') return;
    ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
    ws.onopen = () => {
      if (gen !== generation) return;
      sourceStatus.value = '数据通道已连接 · 等待有效点位';
    };
    ws.onmessage = (e) => {
      if (gen !== generation || reference.value) return;
      try {
        const m = JSON.parse(e.data);
        if (m.type === 'cold-process-points') {
          updatePoints(m.points);
          const good = Object.values(store.snapshot()).filter((v) => v.quality === 'good').length;
          sourceStatus.value = good ? '实时接入 · ' + good + ' 个有效点位' : '数据通道已连接 · 未接入设备';
        }
        if (m.type === 'cold-process-device-motion') motion(m.deviceId, m.duration);
      } catch {}
    };
    ws.onclose = () => {
      if (gen !== generation || reference.value || dead) return;
      sourceStatus.value = '数据通道断开 · 正在重连';
      retryTimer = setTimeout(connect, 2500);
    };
    ws.onerror = () => ws.close();
  }

  function setReference(on) {
    reference.value = on;
    generation++;
    clearTimeout(retryTimer);
    if (ws) {
      ws.onclose = null;
      ws.close();
      ws = null;
    }
    if (on) store.reference();
    else store.clear();
    sourceStatus.value = on
      ? 'PPT 参考数据 · 未接入设备'
      : location.protocol === 'file:'
        ? '实时接入需使用本地服务'
        : '正在连接数据通道';
    render();
    if (!on) connect();
  }

  function toggleMedium(k) {
    medium.value = medium.value === k ? null : k;
    render();
  }

  function setZoom(n) {
    zoom.value = Math.min(2.5, Math.max(1, n));
  }

  function fitView() {
    setZoom(1);
    viewportEl.value?.scrollTo(0, 0);
  }

  function toggleFullscreen() {
    fullscreen.value = !fullscreen.value;
  }

  // 画布拖动平移：按住左键拖拽滚动容器，缩放与否均可（有溢出方向的都能拖）。
  // 用 Pointer Capture 保证窗口外松开也能收到抬起事件；位移超阈值视为拖动，松手后拦截紧随的 click，避免误开设备弹窗；
  // dragstart.prevent 阻止设备图（svg image）触发浏览器原生拖拽吞掉 pointerup。
  const dragging = ref(false);
  let dragState = null;
  let suppressNextClick = false;

  function onViewportPointerdown(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    suppressNextClick = false;
    const el = viewportEl.value;
    dragState = { id: e.pointerId, startX: e.clientX, startY: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop, moved: false };
  }

  function onViewportPointermove(e) {
    if (!dragState || e.pointerId !== dragState.id) return;
    const dx = e.clientX - dragState.startX,
      dy = e.clientY - dragState.startY;
    if (!dragState.moved && Math.hypot(dx, dy) > 4) {
      dragState.moved = true;
      dragging.value = true;
      try {
        viewportEl.value.setPointerCapture(dragState.id);
      } catch {}
    }
    if (dragState.moved) {
      const el = viewportEl.value;
      el.scrollLeft = dragState.scrollLeft - dx;
      el.scrollTop = dragState.scrollTop - dy;
    }
  }

  function onViewportPointerup(e) {
    if (!dragState || e.pointerId !== dragState.id) return;
    try {
      viewportEl.value?.releasePointerCapture(e.pointerId);
    } catch {}
    suppressNextClick = dragState.moved;
    dragState = null;
    dragging.value = false;
  }

  function onSvgClick(e) {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    const el = e.target.closest('[data-device]');
    if (el) openDevice(el.dataset.device);
  }

  function onSvgKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      const el = e.target.closest('[data-device]');
      if (el) {
        e.preventDefault();
        openDevice(el.dataset.device);
      }
    }
  }

  let staleTimer = null;

  function onDocKeydown(e) {
    if (e.key === 'Escape') fullscreen.value = false;
  }

  onMounted(() => {
    document.addEventListener('keydown', onDocKeydown);
    staleTimer = setInterval(() => {
      if (!reference.value) render();
    }, 10000);
    window.ColdProcess = {
      updatePoint: (key, value, options = {}) => updatePoints([{ ...options, key, value }]),
      updatePoints,
      getSnapshot: () => store.snapshot(),
      getPointCatalog: () => structuredClone(C.points),
      getDeviceCatalog: () => structuredClone(C.devices),
      getTopology: () => structuredClone({ nodes: C.nodes, edges: C.edges }),
      openDevicePanel: openDevice,
      closeDevicePanel: closeDialog,
      triggerDeviceMotion: motion,
      setReference,
    };
  });

  onUnmounted(() => {
    dead = true;
    clearInterval(staleTimer);
    clearTimeout(retryTimer);
    for (const id of motionTimers) clearTimeout(id);
    if (ws) {
      ws.onclose = null;
      ws.close();
    }
    window.removeEventListener('mousemove', onViewportMousemove);
    window.removeEventListener('mouseup', onViewportMouseup);
    document.removeEventListener('keydown', onDocKeydown);
    delete window.ColdProcess;
  });

  render();
</script>
