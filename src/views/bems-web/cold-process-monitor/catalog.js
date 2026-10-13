export function buildCatalog() {
  const devices = [],
    points = [],
    nodes = {},
    edges = [];
  const media = {
    cw: { name: '冷却供水', color: '#279b86' },
    cr: { name: '冷却回水', color: '#c09243' },
    primary: { name: '蓄 / 放冷一次水', color: '#737ac6' },
    supply: { name: '冷冻供水', color: '#168dc8' },
    return: { name: '冷冻回水', color: '#dc8c61' },
    makeup: { name: '补水', color: '#75a556' },
  };
  function device(id, name, type, x, y, ports = {}, extra = {}) {
    const d = { id, name, type, x, y, ports, points: [], ...extra };
    devices.push(d);
    for (const [p, xy] of Object.entries(ports)) nodes[id + '.' + p] = { x: xy[0], y: xy[1], device: id, port: p };
    return d;
  }
  function point(d, field, name, unit = '', value = null, control = false, source = 'PPT 第1页', type = 'number') {
    const p = { key: d.id + '.' + field, deviceId: d.id, field, name, unit, type, default: value, writable: control, source, address: null };
    points.push(p);
    d.points.push(p.key);
    return p;
  }
  function common(d, run = false) {
    point(d, 'running', '运行状态', '', run, false, 'PPT 第1页', 'boolean');
    point(d, 'fault', '故障状态', '', false, false, 'PPT 第1页', 'boolean');
    point(d, 'remote', '远程允许', '', null, false, '工程预留，待正式点表确认', 'boolean');
    point(d, 'startCommand', '启停控制', '', null, true, '工程预留，待正式点表确认', 'boolean');
  }
  function junction(id, x, y) {
    nodes[id] = { x, y, junction: true };
    return id;
  }
  function edge(a, b, medium, via = [], extra = {}) {
    edges.push({ id: 'pipe.' + (edges.length + 1), from: a, to: b, medium, via, ...extra });
  }
  function valve(num, x, y, vertical = false) {
    const id = typeof num === 'number' ? 'valve.VD' + num : 'valve.' + num;
    const d = device(
      id,
      typeof num === 'number' ? 'VD' + num : num === 'headerBypass' ? '分集水器旁通阀' : '浮球阀',
      'valve',
      x,
      y,
      vertical ? { a: [x, y - 13], b: [x, y + 13] } : { a: [x - 15, y], b: [x + 15, y] },
      { vertical }
    );
    point(d, 'position', '阀门开度', '%', { 7: 118.5, 8: 0.5, 15: 1.6 }[num] ?? null);
    point(d, 'openLimit', '开到位', '', null, false, '工程预留', 'boolean');
    point(d, 'closeLimit', '关到位', '', null, false, '工程预留', 'boolean');
    point(d, 'fault', '故障状态', '', null, false, '工程预留', 'boolean');
    point(d, 'setPosition', '开度设定', '%', null, true, '工程预留，待正式点表确认');
    return d;
  }
  const system = device('station', '系统运行参数', 'system', 880, 105);
  point(system, 'auto', '自动运行模式', '', 1, false, 'PPT 第1页');
  point(system, 'mode', '工作模式', '', 5, false, 'PPT 第2页');
  point(system, 'tankMode', '蓄冷池工况', '', 2, false, 'PPT 第1页');
  point(system, 'outdoorTemp', '室外温度', '℃', 13.33);
  point(system, 'outdoorHumidity', '室外湿度', '%', 118.5);
  for (const [f, n, u, v] of [
    ['autoCommand', '全自动 / 半自动切换', '', null],
    ['modeCommand', '工作模式选择', '', 5],
    ['loadTempSet', '加载温度设定', '℃', 13],
    ['loadGain', '加载增益', '', 5],
    ['loadIntegral', '加载积分', '', 180],
    ['refrigerationDP', '制冷压差设定', 'bar', 1.8],
    ['refrigerationGain', '制冷增益', '', 5],
    ['refrigerationIntegral', '制冷积分', '', 0.25],
    ['coolingTempSet', '冷却水温度设定', '℃', 30],
    ['coolingGain', '冷却水增益', '', 5],
    ['coolingIntegral', '冷却水积分', '', 20],
    ['towerAddTemp', '冷却塔加机温度', '℃', 30],
    ['towerGain', '冷却塔加机增益', '', 5],
    ['towerIntegral', '冷却塔加机积分', '', 50],
    ['supplyHigh', '冷冻供水温度上限', '℃', 9],
    ['supplyLow', '冷冻供水温度下限', '℃', 6],
    ['returnPressureHigh', '回水压力上限', 'bar', 7.2],
    ['returnPressureLow', '回水压力下限', 'bar', 5.5],
  ])
    point(system, f, n, u, v, true, 'PPT 第2页');
  point(system, 'loadOutput', '加载输出', '', 14.317, false, 'PPT 第2页');
  point(system, 'towerOutput', '冷却塔加机输出', '', 20, false, 'PPT 第2页');
  // Cooling tower and cooling pump manifolds. All devices have explicit hydraulic ports.
  for (let i = 1; i <= 3; i++) {
    const x = 110 + (i - 1) * 170,
      d = device('tower.' + i, i + '号冷却塔', 'tower', x, 120, { out: [x - 25, 160], in: [x + 45, 160] });
    common(d, false);
    point(d, 'frequency', '风机频率', 'Hz', 0);
    point(d, 'frequencySet', '频率设定', 'Hz', null, true, '工程预留');
    const vo = valve(15 + i * 2, x - 25, 195, true),
      vi = valve(16 + i * 2, x + 45, 195, true);
    edge(d.id + '.out', vo.id + '.a', 'cw');
    edge(vo.id + '.b', junction('towerOut.' + i, x - 25, 250), 'cw');
    edge(junction('towerReturn.' + i, x + 45, 225), vi.id + '.b', 'cr');
    edge(vi.id + '.a', d.id + '.in', 'cr');
  }
  edge('towerOut.3', 'towerOut.2', 'cw');
  edge('towerOut.2', 'towerOut.1', 'cw');
  edge('towerReturn.1', 'towerReturn.2', 'cr');
  edge('towerReturn.2', 'towerReturn.3', 'cr');
  junction('cwBottom', 60, 910);
  junction('crBottom', 335, 947);
  junction('cwChillerBottom', 395, 875);
  edge('towerOut.1', 'cwBottom', 'cw', [[60, 250]]);
  edge('crBottom', 'towerReturn.1', 'cr', [
    [335, 280],
    [155, 280],
  ]);
  for (let i = 1; i <= 3; i++) {
    const y = 910 - (i - 1) * 90,
      d = device('coolingPump.' + i, i + '号冷却泵', 'pump', 215, y, { in: [180, y], out: [250, y] });
    common(d, false);
    point(d, 'frequency', '运行频率', 'Hz', 0);
    point(d, 'frequencySet', '频率设定', 'Hz', null, true, '工程预留');
    junction('cpIn.' + i, 130, y);
    junction('cpOut.' + i, 300, y);
    edge('cpIn.' + i, d.id + '.in', 'cw');
    edge(d.id + '.out', 'cpOut.' + i, 'cw');
  }
  edge('cwBottom', 'cpIn.1', 'cw');
  edge('cpIn.1', 'cpIn.2', 'cw');
  edge('cpIn.2', 'cpIn.3', 'cw');
  edge('cpOut.3', 'cpOut.2', 'cw');
  edge('cpOut.2', 'cpOut.1', 'cw');
  edge('cpOut.1', 'cwChillerBottom', 'cw', [[395, 910]]);
  for (let i = 1; i <= 3; i++) {
    const y = 900 - (i - 1) * 210,
      d = device('chiller.' + i, i + '号冷水机组', 'chiller', 565, y, {
        coolingIn: [490, y - 25],
        coolingOut: [490, y + 27],
        chilledIn: [640, y - 25],
        chilledOut: [640, y + 27],
      });
    common(d, false);
    for (const [f, n, v] of [
      ['coolingInTemp', '冷却进水温度', [28.5, 26.9, 26.7][i - 1]],
      ['coolingOutTemp', '冷却出水温度', [28.8, 27.8, 27.6][i - 1]],
      ['chilledInTemp', '冷冻进水温度', [12.7, 13.5, 13.6][i - 1]],
      ['chilledOutTemp', '冷冻出水温度', [12.5, 14.1, 14.1][i - 1]],
    ])
      point(d, f, n, '℃', v);
    point(d, 'load', '机组负荷', '%', 0);
    point(d, 'coolTempSet', '制冷出水温度设定', '℃', 7, true, 'PPT 第2页');
    point(d, 'storageTempSet', '蓄冷出水温度设定', '℃', 4, true, 'PPT 第2页');
    const cv = valve(7 - i, 445, y + 27),
      v = valve(4 - i, 690, y + 27);
    junction('chCw.' + i, 395, y - 25);
    junction('chCr.' + i, 335, y + 27);
    junction('chReturn.' + i, 790, y - 25);
    junction('chOut.' + i, 745, y + 27);
    edge('chCw.' + i, d.id + '.coolingIn', 'cw');
    edge(d.id + '.coolingOut', cv.id + '.b', 'cr');
    edge(cv.id + '.a', 'chCr.' + i, 'cr');
    edge('chReturn.' + i, d.id + '.chilledIn', 'primary');
    edge(d.id + '.chilledOut', v.id + '.a', 'primary');
    edge(v.id + '.b', 'chOut.' + i, 'primary');
  }
  for (let i = 1; i < 3; i++) {
    edge('chCw.' + i, 'chCw.' + (i + 1), 'cw');
    edge('chCr.' + (i + 1), 'chCr.' + i, 'cr');
    edge('chReturn.' + i, 'chReturn.' + (i + 1), 'primary');
    edge('chOut.' + i, 'chOut.' + (i + 1), 'primary');
  }
  edge('cwChillerBottom', 'chCw.1', 'cw');
  edge('chCr.1', 'crBottom', 'cr', [[335, 947]]);
  const bypass = valve(15, 215, 370);
  edge('chCr.3', bypass.id + '.b', 'cr', [[335, 370]]);
  junction('cwBypass', 60, 370);
  edge(bypass.id + '.a', 'cwBypass', 'cw');
  point(bypass, 'tempSet', '温度设定', '℃', 28, true, 'PPT 第2页');
  point(bypass, 'gain', '增益', '', 5, true, 'PPT 第2页');
  point(bypass, 'integral', '积分', '', 20, true, 'PPT 第2页');
  function meter(i, x, y) {
    const d = device('meter.' + i, '冷量表' + i, 'meter', x, y, { a: [x - 18, y], b: [x + 18, y] });
    for (const [f, n, u] of [
      ['energy', '累计冷量', 'kWh'],
      ['power', '瞬时冷量', 'kW'],
      ['inTemp', '进水温度', '℃'],
      ['outTemp', '出水温度', '℃'],
    ])
      point(d, f, n, u, null, false, 'PPT 第6页，截图读数异常，未采用');
    return d;
  }
  meter(1, 835, 550);
  meter(2, 1155, 550);
  valve(7, 910, 550);
  junction('primaryCold', 875, 550);
  edge('chOut.3', 'meter.1.a', 'primary', [[745, 550]]);
  edge('meter.1.b', 'primaryCold', 'primary');
  edge('primaryCold', 'valve.VD7.a', 'primary');
  edge('valve.VD7.b', junction('releaseLeft', 955, 550), 'primary');
  for (const [group, name, ys, left, right, reverse] of [
    ['releasePump', '放冷泵', [620, 535, 450], 955, 1080, false],
    ['storagePump', '蓄冷泵', [930, 845, 760], 955, 1080, true],
    ['chilledPump', '冷冻泵', [605, 520, 435], 1550, 1725, true],
  ]) {
    for (let i = 1; i <= 3; i++) {
      const y = ys[i - 1],
        x = (left + right) / 2,
        d = device(
          group + '.' + i,
          i + '号' + name,
          'pump',
          x,
          y,
          { in: [x + (reverse ? 35 : -35), y], out: [x + (reverse ? -35 : 35), y] },
          { reverse }
        );
      common(d, group === 'chilledPump' || (group === 'releasePump' && i === 2));
      point(d, 'frequency', '运行频率', 'Hz', group === 'releasePump' ? 50 : group === 'chilledPump' ? 48.3 : 0);
      point(d, 'frequencySet', '频率设定', 'Hz', null, true, '工程预留');
      junction(group + '.left.' + i, left, y);
      junction(group + '.right.' + i, right, y);
      edge(reverse ? group + '.right.' + i : group + '.left.' + i, d.id + '.in', group === 'chilledPump' ? 'return' : 'primary');
      edge(d.id + '.out', reverse ? group + '.left.' + i : group + '.right.' + i, group === 'chilledPump' ? 'return' : 'primary');
    }
    for (const side of ['left', 'right'])
      for (let i = 1; i < 3; i++)
        edge(group + '.' + side + '.' + i, group + '.' + side + '.' + (i + 1), group === 'chilledPump' ? 'return' : 'primary', [], {
          direction: 'schematic',
        });
  }
  edge('releaseLeft', 'releasePump.left.2', 'primary', [[955, 535]]);
  edge('releasePump.right.2', 'meter.2.a', 'primary', [[1080, 550]]);
  junction('hxCold', 1230, 550);
  junction('hxWarm', 1190, 835);
  edge('meter.2.b', 'hxCold', 'primary');
  edge('hxWarm', 'storagePump.right.2', 'primary', [[1190, 845]]);
  edge('storagePump.left.2', 'chReturn.1', 'primary', [[790, 845]]);
  valve(8, 1010, 690);
  edge('hxCold', 'valve.VD8.b', 'primary', [[1230, 690]], { direction: 'reversible' });
  edge('valve.VD8.a', 'chReturn.2', 'primary', [[790, 690]], { direction: 'reversible' });
  for (let i = 1; i <= 3; i++) {
    const y = 890 - (i - 1) * 220,
      d = device('hx.' + i, i + '号换热器', 'hx', 1320, y, {
        primaryA: [1290, y - 22],
        primaryB: [1290, y + 22],
        secondaryOut: [1350, y - 22],
        secondaryIn: [1350, y + 22],
      });
    for (const [f, n] of [
      ['primaryIn', '一次侧入口温度'],
      ['primaryOut', '一次侧出口温度'],
      ['secondaryIn', '二次侧入口温度'],
      ['secondaryOut', '二次侧出口温度'],
    ])
      point(d, f, n, '℃', null, false, '工程预留');
    const va = valve(8 + i, 1250, y + 22),
      vb = valve(11 + i, 1400, y - 22);
    junction('hxA.' + i, 1230, y - 22);
    junction('hxB.' + i, 1190, y + 22);
    junction('hxS.' + i, 1460, y - 22);
    junction('hxR.' + i, 1500, y + 22);
    edge('hxA.' + i, d.id + '.primaryA', 'primary');
    edge(d.id + '.primaryB', va.id + '.b', 'primary');
    edge(va.id + '.a', 'hxB.' + i, 'primary');
    edge(d.id + '.secondaryOut', vb.id + '.a', 'supply');
    edge(vb.id + '.b', 'hxS.' + i, 'supply');
    edge('hxR.' + i, d.id + '.secondaryIn', 'return');
  }
  for (const [prefix, medium] of [
    ['hxA', 'primary'],
    ['hxB', 'primary'],
    ['hxS', 'supply'],
    ['hxR', 'return'],
  ])
    for (let i = 1; i < 3; i++) edge(prefix + '.' + i, prefix + '.' + (i + 1), medium, [], { direction: 'schematic' });
  edge('hxCold', 'hxA.3', 'primary');
  edge('hxB.1', 'hxWarm', 'primary');
  edge('chilledPump.left.2', 'hxR.2', 'return', [[1500, 520]]);
  const supply = device('header.supply', '分水器', 'header', 1420, 150, { process: [1460, 175], bypass: [1510, 150], load: [1420, 125] });
  point(supply, 'temperature', '供水温度', '℃', 11.56);
  point(supply, 'pressure', 'P1 供水压力', 'bar', 7.85);
  const ret = device('header.return', '集水器', 'header', 1680, 150, { process: [1750, 175], bypass: [1590, 150], load: [1680, 125] });
  point(ret, 'temperature', '回水温度', '℃', 13.6);
  point(ret, 'pressure', 'P3 回水压力', 'bar', 6.04);
  edge('hxS.3', 'header.supply.process', 'supply');
  junction('loadSupply', 1420, 70);
  junction('loadReturn', 1680, 70);
  edge('header.supply.load', 'loadSupply', 'supply');
  edge('loadReturn', 'header.return.load', 'return');
  valve('headerBypass', 1550, 150);
  edge('header.supply.bypass', 'valve.headerBypass.a', 'supply');
  edge('valve.headerBypass.b', 'header.return.bypass', 'return');
  meter(3, 1750, 350);
  edge('header.return.process', 'meter.3.a', 'return', [
    [1750, 320],
    [1732, 320],
  ]);
  edge('meter.3.b', 'chilledPump.right.2', 'return', [
    [1780, 350],
    [1780, 520],
  ]);
  const tank = device('tank.storage', '蓄冷池', 'tank', 1640, 850, { cold: [1560, 965], warm: [1560, 990], makeup: [1560, 760] });
  for (const [f, n, u, v] of [
    ['level', '液位', 'mm', 5434.4],
    ['coldAmount', '剩余冷量（原图单位）', 'kW', 11461.7],
    ['remaining', '剩余冷量比', '%', 31.5],
    ['topTemp', '上层温度', '℃', 12.26],
    ['bottomTemp', '下层温度', '℃', 6.47],
  ])
    point(tank, f, n, u, v);
  for (const [f, n, u, v] of [
    ['levelSet', '工作液位设定', 'mm', 5400],
    ['endTemp', '蓄冷结束温度', '℃', 4],
    ['releaseTemp', '放冷出水温度设定', '℃', 7],
    ['releaseGain', '放冷出水增益', '', 6],
    ['releaseIntegral', '放冷出水积分', '', 140],
    ['returnTempSet', '放冷回水温度设定', '℃', 11],
    ['returnGain', '放冷回水增益', '', 5],
    ['returnIntegral', '放冷回水积分', '', 50],
    ['releaseEnd', '放冷结束温度设定', '℃', 12],
  ])
    point(tank, f, n, u, v, true, 'PPT 第2页');
  const cable1 = [18.1, 18.1, 11.8, 12.4, 11.6, 11.3, 10.1, 8.8, 7, 6.6, 6.5, 7.1],
    cable2 = [14.3, 14.3, 11.8, 11.8, 11.4, 10.3, 8.5, 7.1, 6.6, 6.4, 5.8, 6.4];
  for (let c = 1; c <= 2; c++)
    for (let i = 1; i <= 12; i++)
      point(tank, 'cable' + c + 'Temp' + i, c + '号电缆 ' + i + '号温度', '℃', (c === 1 ? cable1 : cable2)[i - 1], false, 'PPT 第1、4页');
  edge('primaryCold', 'tank.storage.cold', 'primary', [[875, 965]], { direction: 'reversible' });
  edge('tank.storage.warm', 'hxWarm', 'primary', [[1190, 990]], { direction: 'reversible' });
  const makeup = device('tank.makeup', '补水箱', 'smallTank', 1060, 285, { in: [1020, 285], out: [1100, 285] });
  point(makeup, 'level', '水箱液位', '%', null, false, '工程预留');
  const soft = device('softener', '软水器', 'treatment', 885, 285, { in: [860, 285], out: [910, 285] });
  point(soft, 'fault', '故障状态', '', null, false, '工程预留', 'boolean');
  const mp = device('makeupPump', '补水泵', 'pump', 1180, 285, { in: [1145, 285], out: [1215, 285] });
  common(mp, null);
  junction('city', 790, 285);
  junction('makeupSplit', 960, 285);
  junction('makeupReturn', 1750, 285);
  edge('city', 'softener.in', 'makeup');
  edge('softener.out', 'makeupSplit', 'makeup');
  edge('makeupSplit', 'tank.makeup.in', 'makeup');
  edge('tank.makeup.out', 'makeupPump.in', 'makeup');
  edge('makeupPump.out', 'makeupReturn', 'makeup');
  valve('float', 1530, 760);
  edge('makeupSplit', 'valve.float.a', 'makeup', [
    [960, 340],
    [1480, 340],
    [1480, 760],
  ]);
  edge('valve.float.b', 'tank.storage.makeup', 'makeup');
  for (const [id, name, x, y, medium, mainX] of [
    ['treatment.cooling', '冷却水全程水处理', 160, 565, 'cw', 60],
    ['treatment.chilled', '冷冻水全程水处理', 1660, 230, 'return', 1750],
  ]) {
    const d = device(id, name, 'treatment', x, y, { in: [x - 25, y - 18], out: [x - 25, y + 18] });
    point(d, 'fault', '故障状态', '', null, false, '工程预留', 'boolean');
    junction(id + '.a', mainX, y - 18);
    junction(id + '.b', mainX, y + 18);
    edge(id + '.a', d.id + '.in', medium);
    edge(d.id + '.out', id + '.b', medium);
  }
  // Shared power meters belong to pump groups, never to individual pumps.
  const electric = [
    ['energy', '累计电量', 'kWh'],
    ['voltageAB', 'AB相电压', 'V'],
    ['voltageAC', 'AC相电压', 'V'],
    ['voltageBC', 'BC相电压', 'V'],
    ['currentA', 'A相电流', 'A'],
    ['currentB', 'B相电流', 'A'],
    ['currentC', 'C相电流', 'A'],
    ['powerFactor', '功率因数', ''],
  ];
  for (const d of devices.filter((d) => ['chiller', 'tower'].includes(d.type)))
    for (const [f, n, u] of electric) point(d, f, n, u, null, false, 'PPT 第6页，预留实时表计值');
  for (const [group, name] of [
    ['coolingPump', '冷却泵组'],
    ['chilledPump', '冷冻泵组'],
    ['releasePump', '放冷泵组'],
    ['storagePump', '蓄冷泵组'],
  ])
    for (const [f, n, u] of electric) point(system, group + '_' + f, name + ' · ' + n, u, null, false, 'PPT 第6页，泵组共用电表');
  // Remove redundant vertices. Split mains at explicitly declared tap nodes so the graph
  // and visible tee connections agree. Crossings without a declared tap stay separate.
  for (const e of edges) {
    const pts = [nodes[e.from], ...e.via.map(([x, y]) => ({ x, y })), nodes[e.to]];
    const clean = pts.filter((p, i) => i === 0 || p.x !== pts[i - 1].x || p.y !== pts[i - 1].y);
    e.via = clean.slice(1, -1).map((p) => [p.x, p.y]);
  }
  const aliases = {};
  for (const [id, n] of Object.entries(nodes)) {
    const match = Object.entries(nodes).find(([other, v]) => other !== id && v.x === n.x && v.y === n.y);
    if (match) aliases[id] = match[0];
  }
  const tapIds = ['cwBypass', 'treatment.cooling.a', 'treatment.cooling.b', 'treatment.chilled.a', 'treatment.chilled.b', 'makeupReturn'];
  for (const tapId of tapIds) {
    const tap = nodes[tapId];
    for (let i = edges.length - 1; i >= 0; i--) {
      const e = edges[i];
      if (e.from === tapId || e.to === tapId) continue;
      const pp = [nodes[e.from], ...e.via.map(([x, y]) => ({ x, y })), nodes[e.to]];
      const j = pp.findIndex((a, k) => {
        if (k === pp.length - 1) return false;
        const b = pp[k + 1];
        return (
          (a.x === b.x && tap.x === a.x && tap.y > Math.min(a.y, b.y) && tap.y < Math.max(a.y, b.y)) ||
          (a.y === b.y && tap.y === a.y && tap.x > Math.min(a.x, b.x) && tap.x < Math.max(a.x, b.x))
        );
      });
      if (j < 0) continue;
      const one = { ...e, to: tapId, via: pp.slice(1, j + 1).map((p) => [p.x, p.y]) },
        two = { ...e, from: tapId, via: pp.slice(j + 1, -1).map((p) => [p.x, p.y]) };
      edges.splice(i, 1, one, two);
    }
  }
  for (let i = edges.length - 1; i >= 0; i--) {
    const e = edges[i],
      a = nodes[e.from],
      b = nodes[e.to];
    if (a.x === b.x && a.y === b.y && !e.via.length) edges.splice(i, 1);
  }
  edges.forEach((e, i) => (e.id = 'pipe.' + (i + 1)));
  // Extra per-device readings accompany the process diagram, sourced from the same catalog.
  const catalog = {
    devices,
    points,
    nodes,
    edges,
    aliases,
    media,
    width: 1830,
    height: 1060,
    source: 'HVAC拓扑图-new.pptx',
    notes: [
      'VD16 在原图未标注，不擅自新增编号。分集水器旁通阀保留独立逻辑 ID。',
      '阀位 118.5%、室外湿度 118.5% 等原图异常值以质量提示保留。',
      '工况切换和蓄冷池管路方向需结合 PLC 逻辑确认，双向支路不展示实际流动。',
      '电表为泵组共用，不能将组表电量复制为各单泵电量。',
    ],
  };
  return catalog;
}

export const catalog = buildCatalog();
