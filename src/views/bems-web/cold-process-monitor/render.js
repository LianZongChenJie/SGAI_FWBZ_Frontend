import chillerImg from './assets/chiller.png';
import coolingTowerImg from './assets/cooling-tower.png';
import pumpImg from './assets/pump.png';
import headerVesselImg from './assets/header-vessel.png';

export const deviceAssets = { chiller: chillerImg, tower: coolingTowerImg, pump: pumpImg, header: headerVesselImg };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const assetBounds = {
  chiller: [154, 124, 1207, 810, 1536, 1024],
  pump: [223, 206, 955, 719, 1402, 1122],
  tower: [175, 65, 903, 1123, 1254, 1254],
  header: [66, 203, 1427, 674, 1536, 1024],
};

const t = (x, y, text, cls = '', extra = '') => `<text x="${x}" y="${y}" class="${cls}" ${extra}>${esc(text)}</text>`;

const definitions = `<defs><linearGradient id="steel" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#537785"/><stop offset=".23" stop-color="#b8cdd3"/><stop offset=".46" stop-color="#f3f8fa"/><stop offset=".72" stop-color="#a8c2ca"/><stop offset="1" stop-color="#4e737f"/></linearGradient><linearGradient id="tank-front" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="#c7e0ea"/><stop offset=".45" stop-color="#edf7fb"/><stop offset="1" stop-color="#95bdce"/></linearGradient><linearGradient id="tank-side" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#7fa8bc"/><stop offset="1" stop-color="#456e86"/></linearGradient><linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#66d1e0" stop-opacity=".7"/><stop offset="1" stop-color="#2591b7" stop-opacity=".75"/></linearGradient><linearGradient id="hx-front" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#315f75"/><stop offset=".4" stop-color="#678e9d"/><stop offset="1" stop-color="#193c53"/></linearGradient><linearGradient id="valve-body" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#adcbd4"/><stop offset=".4" stop-color="#5393a6"/><stop offset="1" stop-color="#265b72"/></linearGradient></defs>`;

function modelImage(type, x, y, w, h) {
  const [bx, by, bw, bh, iw, ih] = assetBounds[type];
  return `<svg class="equipment-model" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${bx} ${by} ${bw} ${bh}" style="overflow:visible"><image href="${deviceAssets[type]}" x="0" y="0" width="${iw}" height="${ih}"/></svg>`;
}

function plinth(x, y, w, h = 14) {
  return `<g class="plinth"><path d="M${x - w / 2},${y} l${w - 12},-8 22,${h} -${w - 12},8 Z" fill="#e5edf3" stroke="#c6d4df"/><path d="M${x - w / 2},${y} v5 l${w - 12},${h} 22,-8 v-5 l-22,8 Z" fill="#c6d5df"/></g>`;
}

function deviceShape(ctx, d) {
  const { x, y, type } = d;
  let s = '',
    bounds = [-55, -46, 110, 94],
    labelY = y + 62;
  if (type === 'chiller') {
    bounds = [-95, -76, 190, 152];
    labelY = y - 57;
    s = plinth(x, y + 32, 180, 19);
    for (const [name, xy] of Object.entries(d.ports)) {
      const left = xy[0] < x;
      s += `<path d="M${xy[0]},${xy[1]} H${x + (left ? -20 : 20)}" stroke="${name.startsWith('cooling') ? '#77a48e' : '#8993c2'}" stroke-width="6"/>`;
    }
    s += modelImage('chiller', x - 79, y - 54, 158, 98);
    s += t(x, y + 62, '冷冻 ' + ctx.val(d.id + '.chilledInTemp') + ' / ' + ctx.val(d.id + '.chilledOutTemp') + ' ℃', 'metric', 'text-anchor="middle"');
    s += t(x, y + 83, '冷却 ' + ctx.val(d.id + '.coolingInTemp') + ' / ' + ctx.val(d.id + '.coolingOutTemp') + ' ℃', 'metric', 'text-anchor="middle"');
  } else if (type === 'pump') {
    bounds = [-48, -45, 96, 86];
    labelY = y + 39;
    s =
      plinth(x, y + 4, 80, 10) +
      `<path d="M${x - 35},${y} H${x + 35}" stroke="#486a77" stroke-width="8"/><path d="M${x - 35},${y - 1} H${x + 35}" stroke="#afd5da" stroke-width="3"/>` +
      modelImage('pump', x - 36, y - 43, 72, 54) +
      `<circle class="rotor" cx="${x - 12}" cy="${y - 10}" r="7" stroke="#96c4c4" stroke-width="2" stroke-dasharray="7 4" fill="none"/>`;
  } else if (type === 'tower') {
    bounds = [-64, -55, 130, 110];
    labelY = y - 56;
    s =
      plinth(x, y + 39, 103, 12) +
      `<path d="M${x - 25},${y + 40} v-12 M${x + 45},${y + 40} v-30 h-20" stroke="#537f83" stroke-width="7"/>` +
      modelImage('tower', x - 47, y - 48, 94, 95);
  } else if (type === 'hx') {
    bounds = [-38, -47, 76, 98];
    labelY = y + 51;
    s =
      plinth(x, y + 35, 67, 12) +
      `<path d="M${x - 22},${y - 36} l16,-11 h42 l-16,11 Z" fill="#9cb8c5" stroke="#4b7488"/><path d="M${x + 20},${y - 36} l16,-11 v75 l-16,12 Z" fill="#24495f" stroke="#173a50"/><rect x="${x - 22}" y="${y - 36}" width="42" height="76" rx="3" fill="url(#hx-front)" stroke="#315c72" stroke-width="2"/>`;
    for (let k = 0; k < 7; k++)
      s += `<path d="M${x + 22 + k * 2},${y - 36 - k * 1.5} v70" stroke="${k % 2 ? '#a6c2ca' : '#426f83'}" stroke-width="1.4"/>`;
    for (const xy of Object.values(d.ports))
      s += `<path d="M${xy[0]},${xy[1]} H${x + (xy[0] < x ? -12 : 15)}" stroke="#4e7c8f" stroke-width="8"/><path d="M${xy[0]},${xy[1] - 2} H${x + (xy[0] < x ? -12 : 15)}" stroke="#afd4db" stroke-width="2"/><ellipse cx="${xy[0]}" cy="${xy[1]}" rx="3" ry="7" fill="url(#steel)" stroke="#608598"/>`;
    for (const dx of [-16, 14]) for (const dy of [-29, 32]) s += `<circle cx="${x + dx}" cy="${y + dy}" r="2.5" fill="#c7d8dd"/>`;
  } else if (type === 'valve') {
    bounds = d.vertical ? [-22, -19, 44, 52] : [-24, -31, 48, 64];
    labelY = y + 33;
    s = `<g transform="translate(${x} ${y}) rotate(${d.vertical ? 90 : 0})"><ellipse cx="1" cy="5" rx="20" ry="6" fill="#163d4d" opacity=".12"/><rect x="-15" y="-5" width="30" height="10" rx="3" fill="url(#valve-body)" stroke="#3b697b"/><ellipse cx="-14" cy="0" rx="3" ry="8" fill="url(#steel)" stroke="#597f90"/><ellipse cx="14" cy="0" rx="3" ry="8" fill="url(#steel)" stroke="#597f90"/><path d="M-9,-7 L9,7 V-7 L-9,7 Z" fill="url(#valve-body)" stroke="#39768b"/><path d="M0,-3 V-16" stroke="#698c9a" stroke-width="4"/><path d="M-7,-22 l6,-4 h14 l-6,4 Z" fill="#9bbecb"/><path d="M7,-22 l6,-4 v11 l-6,4 Z" fill="#30556a"/><rect x="-7" y="-22" width="14" height="11" rx="2" fill="url(#valve-body)" stroke="#4d7689"/></g>`;
  } else if (type === 'header') {
    bounds = [-100, -45, 205, 98];
    labelY = y + 49;
    s = plinth(x, y + 26, 181, 14);
    for (const xy of Object.values(d.ports)) s += `<path d="M${xy[0]},${xy[1]} L${xy[0]},${y}" stroke="#557f8b" stroke-width="7"/>`;
    s += modelImage('header', x - 90, y - 35, 180, 72);
    s += t(x, y - 46, ctx.val(d.id + '.temperature') + ' ℃  /  ' + ctx.val(d.id + '.pressure') + ' bar', 'value', 'text-anchor="middle"');
  } else if (type === 'tank') {
    bounds = [-87, -103, 200, 267];
    labelY = y - 104;
    const level = ctx.read(d.id, 'level'),
      h = level?.value === null ? 0 : Math.min(1, Math.max(0, level.value / 6000)) * 224;
    s =
      plinth(1660, 996, 214, 19) +
      `<path d="M1560,750 L1592,725 H1772 L1740,750 Z" fill="#b9d5e2" stroke="#779db1" stroke-width="2"/><path d="M1740,750 L1772,725 V971 L1740,996 Z" fill="url(#tank-side)" stroke="#698fa4" stroke-width="2"/><rect x="1560" y="750" width="180" height="246" rx="3" fill="url(#tank-front)" stroke="#799fb2" stroke-width="2"/><rect x="1566" y="${990 - h}" width="168" height="${h}" fill="url(#water)"/><path d="M1566,${990 - h} Q1600,${980 - h} 1650,${990 - h} T1734,${990 - h}" stroke="#e8fcff" stroke-width="3" fill="none"/>`;
    for (let k = 1; k <= 5; k++) s += `<path d="M1560,${750 + k * 41} h180 l32,-25" stroke="#5889a3" opacity=".2"/>`;
    for (let k = 1; k < 3; k++) s += `<path d="M${1560 + k * 60},750 v246" stroke="#5889a3" opacity=".2"/>`;
    s +=
      t(1650, 790, '水蓄冷', 'device-name', 'text-anchor="middle"') +
      t(1650, 825, ctx.val(d.id + '.remaining') + ' %', 'value', 'text-anchor="middle"') +
      t(1650, 852, '剩余冷量比', 'metric', 'text-anchor="middle"') +
      t(1650, 889, '液位 ' + ctx.val(d.id + '.level') + ' mm', 'metric', 'text-anchor="middle"') +
      t(1650, 921, '上层 ' + ctx.val(d.id + '.topTemp') + ' ℃', 'metric', 'text-anchor="middle"') +
      t(1650, 946, '下层 ' + ctx.val(d.id + '.bottomTemp') + ' ℃', 'metric', 'text-anchor="middle"');
  } else if (type === 'smallTank') {
    bounds = [-49, -55, 98, 100];
    labelY = y - 52;
    s =
      plinth(x + 6, y + 39, 102, 12) +
      `<path d="M${x - 40},${y - 40} l18,-14 h80 l-18,14 Z" fill="#bed5df" stroke="#85a6b7"/><path d="M${x + 40},${y - 40} l18,-14 v76 l-18,14 Z" fill="url(#tank-side)" stroke="#85a6b7"/><rect x="${x - 40}" y="${y - 40}" width="80" height="76" rx="2" fill="url(#tank-front)" stroke="#83a5b7" stroke-width="2"/><path d="M${x - 35},${y} h70 v30 h-70 Z" fill="url(#water)"/><path d="M${x - 40},${y - 15} h80 M${x - 40},${y + 10} h80 M${x},${y - 40} v76" stroke="#83a5b7" opacity=".4"/>`;
  } else if (type === 'treatment') {
    bounds = [-38, -43, 76, 83];
    labelY = d.id === 'treatment.chilled' ? y + 43 : y + 56;
    s =
      plinth(x, y + 35, 68, 9) +
      `<path d="M${x - 17},${y + 25} v14 M${x + 17},${y + 25} v14" stroke="#6d8d99" stroke-width="5"/><path d="M${x - 25},${y - 24} v49 a25,9 0 0 0 50,0 v-49 Z" fill="url(#steel)" stroke="#72919b"/><ellipse cx="${x}" cy="${y - 24}" rx="25" ry="9" fill="#dce8ed" stroke="#72919b"/><ellipse cx="${x}" cy="${y - 25}" rx="7" ry="3" fill="#7699a5"/><rect x="${x - 10}" y="${y - 9}" width="20" height="26" rx="2" fill="#4d9484" stroke="#337265"/><path d="M${x - 6},${y - 4} h12 M${x - 6},${y + 1} h12" stroke="#a4d2bd"/>`;
  } else if (type === 'meter') {
    bounds = [-26, -28, 52, 63];
    labelY = y + 39;
    s = `<path d="M${x - 18},${y} h36" stroke="#7d9bac" stroke-width="7"/><rect x="${x - 12}" y="${y - 20}" width="24" height="18" rx="3" fill="#f1f6f9" stroke="#829eaf"/><path d="M${x - 7},${y - 10} h14" stroke="#79adc4"/>`;
  } else if (type === 'system') {
    bounds = [-280, -53, 510, 118];
    labelY = y - 25;
    s = `<rect x="${x - 280}" y="${y - 53}" width="510" height="118" rx="8" fill="#f4f8fc" stroke="#dbe7f0"/>`;
    s +=
      t(x - 253, y - 26, '系统运行状态', 'device-name') +
      t(x - 253, y + 4, '运行方式  ' + (ctx.val('station.auto') === '1' ? '半自动' : ctx.val('station.auto') === '0' ? '全自动' : '—'), 'metric') +
      t(x - 25, y + 4, '工作模式  ' + ctx.val('station.mode'), 'metric') +
      t(x - 253, y + 36, '蓄冷池  ' + (ctx.val('station.tankMode') === '2' ? '放冷' : ctx.val('station.tankMode') === '1' ? '蓄冷' : '—'), 'value') +
      t(x - 25, y + 36, '查看系统参数 ›', 'metric');
  }
  let label =
    type === 'system'
      ? ''
      : t(
          d.id === 'storagePump.1' ? 1130 : x,
          d.id === 'storagePump.1' ? 953 : labelY,
          d.name,
          type === 'valve' ? 'metric' : 'device-name',
          'text-anchor="middle"'
        );
  const statusDot = ['chiller', 'tower', 'pump'].includes(type)
    ? `<circle class="state" cx="${x + (type === 'chiller' ? 78 : 32)}" cy="${y - 30}" r="5"/>`
    : '';
  const ports = Object.values(d.ports)
    .map(([px, py]) => `<circle class="port" cx="${px}" cy="${py}" r="3" stroke="#839eaf"/>`)
    .join('');
  return `<g class="dev ${ctx.state(d)}" role="button" tabindex="0" aria-label="${esc(d.name)}，查看监控与控制点位" data-device="${d.id}"><title>${esc(d.name)} · 点击查看点位</title><rect class="device-hit" x="${x + bounds[0]}" y="${y + bounds[1]}" width="${bounds[2]}" height="${bounds[3]}" rx="7"/>${s}${ports}${label}${statusDot}</g>`;
}

function pathPoints(C, e) {
  return [C.nodes[e.from], ...e.via.map(([x, y]) => ({ x, y })), C.nodes[e.to]];
}

function pipeMarkup(C, ctx) {
  let s = '';
  for (const e of C.edges) {
    const pts = pathPoints(C, e),
      color = C.media[e.medium].color,
      path = pts.map((p, i) => (i ? 'L' : 'M') + p.x + ',' + p.y).join(' ');
    let arrows = '';
    // Arrows describe design direction. No actual flow is inferred from a screenshot.
    if (e.direction !== 'schematic') {
      let best = null;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1],
          b = pts[i],
          len = Math.hypot(b.x - a.x, b.y - a.y);
        if (len > 55 && (!best || len > best.len)) best = { a, b, len };
      }
      if (best) {
        const { a, b } = best,
          x = (a.x + b.x) / 2,
          y = (a.y + b.y) / 2,
          angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        arrows = `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M-5,-4 L3,0 -5,4" fill="none" stroke="${color}" stroke-width="2"/>${e.direction === 'reversible' ? `<path d="M-13,-4 L-21,0 -13,4" fill="none" stroke="${color}" stroke-width="2"/>` : ''}</g>`;
      }
    }
    const d = ctx.byId.get(C.nodes[e.from].device) || ctx.byId.get(C.nodes[e.to].device),
      moving = !ctx.reference && d && ctx.state(d) === 'running' && !e.direction;
    s += `<g data-medium="${e.medium}" data-edge="${e.id}" opacity="${!ctx.medium || ctx.medium === e.medium ? 1 : 0.1}"><path d="${path}" class="pipe-shadow" transform="translate(3 5)"/><path d="${path}" class="pipe-back"/><path d="${path}" class="pipe-outline"/><path d="${path}" class="pipe" stroke="${color}"/><path d="${path}" class="pipe-highlight" transform="translate(-.8 -1.2)"/>${moving ? `<path d="${path}" class="flow"/>` : ''}${arrows}</g>`;
  }
  // Draw declared junctions after all bridge casings; unconnected crossings retain their white bridge.
  for (const [id, n] of Object.entries(C.nodes)) {
    if (!n.junction || id.startsWith('load') || id === 'city') continue;
    const e = C.edges.find((e) => e.from === id || e.to === id);
    if (e) s += `<circle cx="${n.x}" cy="${n.y}" r="3.6" fill="${C.media[e.medium].color}" opacity="${!ctx.medium || ctx.medium === e.medium ? 1 : 0.1}"/>`;
  }
  return s;
}

export function buildSvgMarkup(C, ctx) {
  const header = `<rect x="20" y="20" width="1790" height="1020" rx="8" fill="#fcfdff"/>${t(35, 43, '01', 'section-no')}${t(67, 43, '冷却水循环', 'section-label')}${t(435, 397, '02', 'section-no')}${t(467, 397, '冷水机组', 'section-label')}${t(895, 395, '03', 'section-no')}${t(927, 395, '蓄冷 / 放冷循环', 'section-label')}${t(1300, 43, '04', 'section-no')}${t(1332, 43, '冷冻水循环', 'section-label')}${t(1560, 700, '05', 'section-no')}${t(1592, 700, '蓄冷池', 'section-label')}${t(775, 261, '自来水', 'metric')}${t(1430, 78, '供末端', 'metric')}${t(1640, 78, '末端回水', 'metric', 'text-anchor="end"')}`;
  return definitions + header + pipeMarkup(C, ctx) + C.devices.map((d) => deviceShape(ctx, d)).join('');
}
