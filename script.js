'use strict';

/* ═══════════════════════════════════════════════
   PANEL TOGGLE
═══════════════════════════════════════════════ */
const LS_KEY = 'dyci_panel_v4';
let panelOpen = localStorage.getItem(LS_KEY) === 'true';

function applyPanel(animate) {
  const panel  = document.getElementById('navPanel');
  const fab    = document.getElementById('fab');
  const toggle = document.getElementById('hdrToggle');
  const dim    = document.getElementById('dimLayer');
  const isMob  = window.innerWidth <= 640;
  if (!animate) { panel.style.transition = 'none'; setTimeout(() => panel.style.transition = '', 20); }
  if (panelOpen) {
    panel.classList.remove('collapsed');
    fab.textContent = '✕'; fab.title = 'Close Panel';
    toggle.style.color = '#2563eb';
    if (isMob) dim.classList.add('vis');
  } else {
    panel.classList.add('collapsed');
    fab.textContent = '☰'; fab.title = 'Toggle Panel';
    toggle.style.color = '';
    dim.classList.remove('vis');
  }
  setTimeout(resizeCanvas, animate ? 360 : 10);
  localStorage.setItem(LS_KEY, panelOpen);
}
function togglePanel() { panelOpen = !panelOpen; applyPanel(true); }
function closePanel()  { panelOpen = false; applyPanel(true); }
function toggleLegend() {
  const body = document.getElementById('legendBody');
  const btn  = document.getElementById('legToggleBtn');
  const hidden = body.style.display === 'none';
  body.style.display = hidden ? '' : 'none';
  btn.textContent = hidden ? '−' : '+';
}

/* ═══════════════════════════════════════════════
   CAMPUS DATA
═══════════════════════════════════════════════ */
const BLDGS = {
  // LEFT SIDE — Nature + Parking + Library/Aula aligned over both
  forest:      { x:-155, y:270, w:140, h:230, color:'#2d6a1a', label:'NATURE\nAREA',         icon:'🌿', cat:'Open',    desc:'Campus forest — green space beside the parking area', floors:0 },
  parking:     { x:18,   y:270, w:140, h:230, color:'#344a6a', label:'PARKING',               icon:'🅿', cat:'Facility',desc:'Campus parking area with designated vehicle slots', floors:0 },
  // Library/Aula Magna — centered over nature+parking (spans x:-185 to x:193)
  library:     { x:-55,  y:40,  w:310, h:200, color:'#145228', label:'LIBRARY /\nAULA MAGNA', icon:'📚', cat:'Facility',desc:'Library, Clinic, Guidance, Labs, Offices, Amphitheater — 2 floors', floors:2 },
  // Veritas Hall — beside Aula (to its right), same top alignment
  veritas:     { x:268,  y:40,  w:96,  h:105, color:'#3b1f6a', label:'VERITAS\nHALL',         icon:'🏛', cat:'Academic',desc:'Veritas Hall — seminars, events, multi-purpose hall', floors:2 },
  // Waiting Shed — below Veritas, same column
  waiting:     { x:268,  y:158, w:96,  h:52,  color:'#2d4030', label:'WAITING\nSHED',         icon:'🏠', cat:'Facility',desc:'Covered waiting shed and student lounge area', floors:0 },
  // Cibus stays; Building C positioned in front of the space before Cibus (not directly above it)
  cibus:       { x:232,  y:390, w:200, h:150, color:'#0f2d60', label:'CIBUS\nCANTEEN',        icon:'🍽', cat:'Facility',desc:'Cibus campus canteen — cafeteria and food stalls', floors:1 },
  'bldg-c':    { x:435,  y:200, w:160, h:175, color:'#5a2010', label:'BUILDING C',            icon:'🏛', cat:'Academic',desc:'Rooms 101–103 · RaiseLab · 201–202 · AVR', floors:2 },
  court:       { x:660,  y:278, w:258, h:252, color:'#1a5208', label:'ELIDA COURT',           icon:'🏀', cat:'Open',   desc:'Elida Court — basketball court and campus events stage', floors:0 },
  'bldg-b':    { x:980,  y:155, w:198, h:195, color:'#7a2e14', label:'BUILDING B',            icon:'🏫', cat:'Academic',desc:'Rooms 103–105 (GF) · Rooms 203–205 (2F)', floors:2 },
  'bldg-a':    { x:1200, y:155, w:198, h:195, color:'#6a2008', label:'BUILDING A',            icon:'🏫', cat:'Academic',desc:'Cashier · CAS · Rooms 101–102 (GF) · 201–202 (2F)', floors:2 },
  'canteen-r': { x:980,  y:412, w:350, h:118, color:'#0c2858', label:'CANTEEN',               icon:'🍱', cat:'Facility',desc:'Canteen — between Building B and Entrance', floors:1 },
  entrance:    { x:1440, y:220, w:105, h:200, color:'#1a3a5a', label:'ENTRANCE',               icon:'🚪', cat:'Entry',  desc:'Main entrance gate — Frontline Room, visitor services, navigation access', floors:0 },
};

const ROOMS = {
  'bldg-a': {
    'Ground Floor': ['Room 101','Room 102','Cashier','CAS Office','Registrar'],
    '2nd Floor':    ['Room 201','Room 202','Faculty Room','Dean\'s Office','Conference Room'],
  },
  'bldg-b': {
    'Ground Floor': ['Room 103','Room 104','Room 105'],
    '2nd Floor':    ['Room 203','Room 204','Room 205'],
  },
  'bldg-c': {
    'First Floor':  ['101','102','103','RaiseLab'],
    'Second Floor': ['201','202','AVR'],
  },
  veritas: {
    'Ground Floor': ['Event Hall','Audio-Visual Room','Multi-Purpose Area'],
    '2nd Floor':    ['Seminar Room A','Seminar Room B'],
  },
  library: {
    'First Floor':  ['Library','Clinic','Guidance','Nexus','Psych Lab','Sandbox','Inspire','AM 101','AM 102','Credo','Chapel','Aula Canteen','CCS Office','CAS Office','SOP Office'],
    'Second Floor': ['Scientia 1','Scientia 2','CHS Office','Skills Lab','Amphitheater','Microbiology Lab','Physics Lab','Anatomy Lab','AM 201','AM 202','Resource Room','Chemistry Lab','Lecture Room','Huddle Room','OSP Room','OVPAA Room'],
  },
  cibus:       { 'Ground Floor': ['Main Dining','Food Stalls','Faculty Dining','Snack Bar'] },
  'canteen-r': { 'Ground Floor': ['Dining Area','Food Court','Takeout Counter'] },
  waiting:     { 'Ground Floor': ['Bench Area','Notice Board'] },
  entrance:    { 'Ground Floor': ['Frontline Room','Entrance Information','Visitor Log','Security Post','Navigation Access Point'] },
};

const ROOM_MAP = {
  r101:'bldg-a', r102:'bldg-a', r201:'bldg-a', r202:'bldg-a', cashier:'bldg-a', 'cas-a':'bldg-a',
  r103:'bldg-b', r104:'bldg-b', r105:'bldg-b', r203:'bldg-b', r204:'bldg-b', r205:'bldg-b',
  'bc-101':'bldg-c','bc-102':'bldg-c','bc-103':'bldg-c',raiselab:'bldg-c','bc-201':'bldg-c','bc-202':'bldg-c',avr:'bldg-c',
  'lib-library':'library','lib-clinic':'library','lib-guidance':'library','lib-nexus':'library','lib-psych':'library','lib-sandbox':'library','lib-inspire':'library','lib-am101':'library','lib-am102':'library','lib-credo':'library','lib-chapel':'library','lib-aulacant':'library','lib-ccs':'library','lib-cas':'library','lib-sop':'library',
  'lib-sci1':'library','lib-sci2':'library','lib-chs':'library','lib-skills':'library','lib-amphi':'library','lib-micro':'library','lib-physics':'library','lib-anatomy':'library','lib-am201':'library','lib-am202':'library','lib-resource':'library','lib-chem':'library','lib-lecture':'library','lib-huddle':'library','lib-osp':'library','lib-ovpaa':'library',
  frontline:'entrance',
};

/* ═══════════════════════════════════════════════
   GRAPH — Updated to match two-route road layout
   ROUTE 1 (Academic): Entrance→BldgA→BldgB→Court→BldgC→Library→Veritas→Waiting
   ROUTE 2 (Secondary): Entrance→Canteen→Court→BldgC→Cibus→Parking→Nature
   Cross-links preserved for full Dijkstra/A* coverage
═══════════════════════════════════════════════ */
const GRAPH = {
  // ── Campus circulation spine ──
  // Main Campus Drive: Entrance → Canteen-R → Bldg A → Bldg B → Court → Bldg C → Cibus junction
  // Library/Aula branch: Cibus junction → past Cibus front → north curve → Library/Aula Magna
  // Parking branch: Cibus junction → west along Nature Drive → Parking
  // Nature branch: Parking → Nature Area (Forest)
  entrance:    { 'bldg-a':1.1, 'canteen-r':0.6 },
  'bldg-a':    { entrance:1.1, 'bldg-b':0.5, 'canteen-r':0.8 },
  'bldg-b':    { 'bldg-a':0.5, court:1.2 },
  court:       { 'bldg-b':1.2, 'bldg-c':0.9, 'canteen-r':1.0 },
  'bldg-c':    { court:0.9, cibus:0.7 },
  cibus:       { 'bldg-c':0.7, library:1.2, parking:1.0 },
  library:     { cibus:1.2, veritas:0.6 },
  veritas:     { library:0.6, waiting:0.4 },
  waiting:     { veritas:0.4, library:0.8 },
  parking:     { cibus:1.0, forest:0.4 },
  forest:      { parking:0.4 },
  'canteen-r': { entrance:0.6, 'bldg-a':0.8, court:1.0 },
};

/* Heuristic coords for A* (world-space center estimates) */
function heuristic(a, b) {
  const ba = BLDGS[a], bb = BLDGS[b];
  if (!ba || !bb) return 0;
  const ax = ba.x + ba.w/2, ay = ba.y + ba.h/2;
  const bx = bb.x + bb.w/2, by = bb.y + bb.h/2;
  return Math.hypot(ax-bx, ay-by) / 200;
}

/* ═══════════════════════════════════════════════
   ROAD / PATHWAY NETWORK — Single unified central pathway
   Central spine at y=410 (campus vertical midpoint)
   Entrance → Bldg A → Bldg B (via A) → Court → Cibus → Library/Aula
   Library spur curves smoothly from spine junction at Cibus.
═══════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   ROAD NETWORK — Clean single-line campus pathways
   ─────────────────────────────────────────────────
   Building references (center-x / south-y / north-y):
     Entrance  cx=1492  south=420  north=220
     Bldg A    cx=1299  south=350  north=155
     Bldg B    cx=1079  south=350  north=155
     Court     cx=789   south=530  north=278
     Bldg C    cx=515   south=375  north=200
     Cibus     cx=332   south=540  north=390  right=432
     Veritas   cx=316   south=145  north=40   right=364
     Waiting   cx=316   south=210  north=158  right=364
     Aula/Lib  cx=100   right=255  top=40
     Parking   cx=105   top=255    bottom=545
     Forest    cx=-95   top=255    right=-5
═══════════════════════════════════════════════ */
const PATHS = [

  // ── 0. MAIN SPINE EAST: Entrance → Bldg A → Bldg B → Court  (y=380, straight)
  [[1545,380],[1492,380],[1299,380],[1079,380],[789,380]],

  // ── 1. ENTRANCE SPUR: Entrance south face → spine
  [[1492,380],[1492,420]],

  // ── 2. BLDG A SPUR: Bldg A south face → spine
  [[1299,350],[1299,380]],

  // ── 3. BLDG B SPUR: Bldg B south face → spine
  [[1079,350],[1079,380]],

  // ── 4. COURT NORTH SPUR: Court north face → spine
  [[789,278],[789,380]],

  // ── 5. SPINE WEST: Court → Bldg C → Cibus front junction (y=380)
  //    Road continues straight past Building C front then past Cibus front
  [[789,380],[660,380],[515,380],[432,380],[232,380]],

  // ── 6. BLDG C SPUR: Bldg C south face → spine
  [[515,375],[515,380]],

  // ── 7. CIBUS FRONT ROAD: From junction at (232,380) turns NORTH up the
  //    east face of Cibus canteen to the main fork point at (232,320)
  //    (This is the road running along the FRONT of Cibus before the turn)
  [[232,380],[232,320]],

  // ── 8. AULA MAGNA BRANCH: From fork (232,320) turns north-west
  //    sweeping smoothly past the Cibus north end up to Library/Aula Magna
  [[232,320],[220,270],[210,220],[200,175],[175,140],[150,105],[100,80],[55,60],[-55,40]],

  // ── 9. PARKING BRANCH: From CIBUS junction at (232,380) goes straight west
  //    directly to the parking area east edge — seamless straight connection
  [[232,380],[158,380],[18,380],[18,270]],

  // ── 10. NATURE BRANCH: From parking west edge continues straight west
  //     then south into the Nature / Forest area
  [[18,380],[-15,380],[-15,270]],

  // ── 11. CANTEEN-R SPUR: Canteen north face → main spine
  [[1155,412],[1155,380]],

  // ── 12. CIBUS SOUTH SPUR: Cibus south face connects down to main spine
  //     (short connector so Cibus building is reachable from the main road)
  [[232,390],[232,380]],
];

/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
let cam = { x:680, y:320, z:0.50 };
let mode = '3d';
let drag = false, lx = 0, ly = 0, pinchD = 0;
let route = null, hoverBldg = null, selBldg = null;
let hoverAnim = {};
let routeMeta  = { m:0, s:0, names:[] };
let toastTimer = null, frame = 0, routeProgress = 0;
let _selBldgForRoute = null;

const cv   = document.getElementById('c');
const ctx  = cv.getContext('2d');

function resizeCanvas() {
  const w = document.getElementById('mapWrap');
  cv.width  = w.clientWidth  * devicePixelRatio;
  cv.height = w.clientHeight * devicePixelRatio;
  cv.style.width  = w.clientWidth  + 'px';
  cv.style.height = w.clientHeight + 'px';
}
window.addEventListener('resize', resizeCanvas);

function W2S(wx, wy) { return { x:(wx-700)*cam.z+cam.x, y:(wy-320)*cam.z+cam.y }; }
function S2W(sx, sy) { return { x:(sx-cam.x)/cam.z+700, y:(sy-cam.y)/cam.z+320 }; }

/* ═══════════════════════════════════════════════
   RENDER LOOP
═══════════════════════════════════════════════ */
function render() {
  frame++;
  routeProgress += 0.015;
  const W = cv.width/devicePixelRatio, H = cv.height/devicePixelRatio;
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.save();
  ctx.scale(devicePixelRatio, devicePixelRatio);

  rBG(W, H);
  rWater();
  rGround();
  rLandscaping();
  rRoads();
  rLampPosts();
  if (route) rRoute();
  rBuildings();
  rLabels();
  rYouAreHere();

  ctx.restore();
}

/* ── Background ── */
function rBG(W, H) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0,   '#f0f9ff');
  g.addColorStop(0.35,'#dbeafe');
  g.addColorStop(0.70,'#bfdbfe');
  g.addColorStop(1,   '#93c5fd');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // subtle grid
  ctx.strokeStyle = 'rgba(147,197,253,0.22)';
  ctx.lineWidth = 0.5;
  const gs = 56*cam.z, ox = ((cam.x%gs)+gs)%gs, oy = ((cam.y%gs)+gs)%gs;
  for (let x = ox-gs; x < W+gs; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = oy-gs; y < H+gs; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
}

/* ── River ── */
function rWater() {
  const pts = [W2S(1080,0),W2S(1600,0),W2S(1600,215),W2S(1300,215),W2S(1080,130)];
  ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
  pts.slice(1).forEach(p => ctx.lineTo(p.x,p.y)); ctx.closePath();
  const gw = ctx.createLinearGradient(pts[0].x,pts[0].y,pts[0].x,pts[2].y);
  gw.addColorStop(0,'rgba(147,197,253,.88)'); gw.addColorStop(1,'rgba(96,165,250,.80)');
  ctx.fillStyle = gw; ctx.fill();
  ctx.strokeStyle = 'rgba(59,130,246,.28)'; ctx.lineWidth = 1.5; ctx.stroke();
  // waves
  for (let i=0; i<8; i++) {
    const a=W2S(1095,16+i*22), b=W2S(1590,16+i*22);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y + Math.sin(frame*.013+i*.7)*1.6);
    ctx.bezierCurveTo(a.x+(b.x-a.x)*.33, a.y+Math.sin(frame*.013+i*.7+1)*1.6, a.x+(b.x-a.x)*.66, b.y+Math.sin(frame*.013+i*.7+2)*1.6, b.x, b.y+Math.sin(frame*.013+i*.7+3)*1.6);
    ctx.strokeStyle = `rgba(59,130,246,${.06+i*.012})`; ctx.lineWidth = 1; ctx.stroke();
  }
  const wl = W2S(1340,100);
  ctx.save(); ctx.globalAlpha = .5;
  ctx.font = `italic ${Math.max(8,11*cam.z)}px Inter`;
  ctx.fillStyle='#2563eb'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('~ River ~', wl.x, wl.y); ctx.restore();
}

/* ── Ground ── */
function rGround() {
  const tl=W2S(-200,28), br=W2S(1600,595);
  if (br.x<=tl.x||br.y<=tl.y) return;
  const gg = ctx.createLinearGradient(tl.x,tl.y,br.x,br.y);
  gg.addColorStop(0,'rgba(196,230,192,.86)'); gg.addColorStop(.5,'rgba(182,224,176,.80)'); gg.addColorStop(1,'rgba(168,218,162,.72)');
  ctx.beginPath(); ctx.roundRect(tl.x,tl.y,br.x-tl.x,br.y-tl.y,8);
  ctx.fillStyle = gg; ctx.fill();
  ctx.strokeStyle = 'rgba(100,160,88,.18)'; ctx.lineWidth = 1.5; ctx.stroke();
}

/* ── Landscaping ── */
function rLandscaping() {
  // Grass verge patches along new road network
  const patches = [
    // Main spine (y=380): entrance side east
    [1492,366,54,18],[1380,366,48,18],[1299,366,44,18],[1189,366,44,18],[1079,366,44,18],[918,366,44,18],[789,366,40,18],
    [1492,394,54,18],[1380,394,48,18],[1299,394,44,18],[1189,394,44,18],[1079,394,40,18],[918,394,44,18],[789,394,40,18],
    // Spine west (court→cibus) y=380
    [660,366,50,18],[515,366,40,18],[432,366,36,18],
    [660,394,50,18],[515,394,40,18],[432,394,36,18],
    // Aula branch — between waiting shed and Aula right side
    [380,280,28,18],[340,250,28,18],[300,215,28,18],[272,185,28,18],
    // Nature/parking branch y=380 (now on CIBUS road level going west)
    [160,366,40,18],[80,366,40,18],
    [160,394,40,18],[80,394,40,18],
    // Parking vertical road x=18
    [8,390,18,36],[8,320,18,36],
    // Nature vertical road x=-15
    [-25,390,18,36],
    // Junction area around cibus fork
    [432,340,28,28],
    // Background boundary
    [500,490,54,38],[800,555,46,30],[1400,290,50,34],[1100,290,44,28],
  ];
  patches.forEach(([wx,wy,rw,rh]) => {
    const tl=W2S(wx-rw/2,wy-rh/2), br=W2S(wx+rw/2,wy+rh/2);
    const bW=br.x-tl.x, bH=br.y-tl.y; if(bW<=0||bH<=0) return;
    const pg = ctx.createRadialGradient(tl.x+bW/2,tl.y+bH/2,0,tl.x+bW/2,tl.y+bH/2,Math.max(bW,bH)/2);
    pg.addColorStop(0,'rgba(108,175,88,.55)'); pg.addColorStop(1,'rgba(78,150,58,.18)');
    ctx.beginPath(); ctx.ellipse(tl.x+bW/2,tl.y+bH/2,bW/2,bH/2,0,0,Math.PI*2);
    ctx.fillStyle = pg; ctx.fill();
  });

  const trees = [
    // Main spine trees (y≈364 and y≈396) — east segment
    [1492,364],[1380,364],[1299,364],[1189,364],[1079,364],[918,364],[789,364],
    [1492,396],[1380,396],[1299,396],[1189,396],[1079,396],[918,396],[789,396],
    // Spine west trees
    [660,364],[515,364],[432,364],
    [660,396],[515,396],[432,396],
    // Aula branch trees (along curve waypoints)
    [390,285],[360,252],[316,222],[280,192],[268,165],
    // Nature/Parking branch trees (y≈366 and y≈394 along new y=380 road)
    [160,366],[80,366],
    [160,394],[80,394],
    // Parking and nature vertical road trees
    [8,395],[8,315],[-25,395],
    // Background / boundary trees
    [1269,200],[1269,260],[1049,200],[1049,260],[779,290],[505,240],[505,310],
    [600,20],[700,14],[800,12],[900,14],[1000,10],[1100,12],[1200,14],[1300,12],[1400,14],
    [980,548],[1080,548],[1180,548],[1280,548],[1330,548],
    [-80,260],[18,260],[-80,240],[18,240],
  ];
  trees.forEach(([wx,wy,r=11],ti) => drawTree(wx,wy,r,ti));

  if (cam.z > 0.26) {
    const shrubs = [
      // Main spine shrubs
      [1492,368,5],[1380,368,6],[1299,368,5],[1079,368,6],[918,368,5],[789,368,6],[515,368,5],
      [1380,392,5],[1299,392,6],[1079,392,5],[918,392,6],[789,392,5],[515,392,6],
      // Aula branch shrubs
      [380,282,4],[342,253,4],[304,218,4],[272,188,4],
      // Nature branch shrubs (along y=380 road going west)
      [160,370,5],[80,370,6],
      [160,390,5],[80,390,6],
      // Background shrubs
      [1269,210,5],[1049,210,6],[779,302,5],[505,252,6],
    ];
    shrubs.forEach(([wx,wy,r],ti) => {
      const p=W2S(wx,wy), sr=r*cam.z; if(sr<1.5) return;
      ctx.beginPath(); ctx.ellipse(p.x+sr*.25,p.y+sr*.35,sr*.75,sr*.65,0,0,Math.PI*2);
      ctx.fillStyle='rgba(0,0,0,.10)'; ctx.fill();
      const hue=118+((ti*9)%20);
      const sg=ctx.createRadialGradient(p.x-sr*.14,p.y-sr*.12,0,p.x,p.y,sr);
      sg.addColorStop(0,`hsla(${hue},52%,38%,.96)`); sg.addColorStop(1,`hsla(${hue},46%,24%,.88)`);
      ctx.beginPath(); ctx.arc(p.x,p.y,sr,0,Math.PI*2); ctx.fillStyle=sg; ctx.fill();
    });
  }

  const fc = ['#f43f5e','#fbbf24','#34d399','#60a5fa','#a78bfa','#fb923c'];
  // Flower clusters at key junctions and along roads
  [[1492,380,8],[1299,380,7],[1079,380,6],[789,380,8],[515,380,7],
   [232,380,6],[158,380,6],[18,380,5],[355,255,5]].forEach(([wx,wy,n]) => {
    for (let i=0;i<n;i++) {
      const ang=i*(Math.PI*2/n), fp=W2S(wx+Math.cos(ang)*12,wy+Math.sin(ang)*7);
      ctx.beginPath(); ctx.arc(fp.x,fp.y,Math.max(1.2,1.7*cam.z),0,Math.PI*2);
      ctx.fillStyle=fc[i%fc.length]; ctx.fill();
    }
  });

  [
    [[500,32],[660,32]],[[660,32],[789,32]],[[789,32],[980,32]],[[980,32],[1200,32]],[[1200,32],[1440,32]],
    [[183,532],[432,532]],[[660,532],[980,532]],[[980,532],[1330,532]],[[432,532],[660,532]],
  ].forEach(([[x1,y1],[x2,y2]]) => {
    const a=W2S(x1,y1), b=W2S(x2,y2);
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
    ctx.strokeStyle='rgba(55,135,40,.52)'; ctx.lineWidth=Math.max(2.5,4*cam.z); ctx.lineCap='round'; ctx.stroke();
  });

  if (cam.z > 0.28) {
    // Bench planters along roads
    [[1492,372],[1380,372],[1299,372],[1189,372],[1079,372],[918,372],[789,372],
     [160,372],[80,372],[18,345]].forEach(([wx,wy]) => {
      const p=W2S(wx,wy), bw=10*cam.z, bh=3.2*cam.z;
      ctx.fillStyle='rgba(160,110,55,.70)';
      ctx.beginPath(); ctx.roundRect(p.x-bw/2,p.y-bh/2,bw,bh,1); ctx.fill();
      ctx.strokeStyle='rgba(200,150,80,.38)'; ctx.lineWidth=.6*cam.z; ctx.stroke();
    });
  }
}
function drawTree(wx, wy, r, ti) {
  const p=W2S(wx,wy), sr=r*cam.z;
  if (sr < 2) return;
  // shadow
  ctx.save(); ctx.globalAlpha=.18;
  ctx.beginPath(); ctx.ellipse(p.x+sr*.3,p.y+sr*.58,sr*.85,sr*.32,0,0,Math.PI*2);
  ctx.fillStyle='#000'; ctx.fill(); ctx.restore();
  // trunk
  ctx.beginPath();
  ctx.moveTo(p.x-sr*.1,p.y+sr*.26); ctx.lineTo(p.x+sr*.1,p.y+sr*.26);
  ctx.lineTo(p.x+sr*.07,p.y+sr*.9);  ctx.lineTo(p.x-sr*.07,p.y+sr*.9);
  ctx.closePath();
  const tg=ctx.createLinearGradient(p.x-sr*.1,0,p.x+sr*.1,0);
  tg.addColorStop(0,'#3b1a06'); tg.addColorStop(.5,'#5c2e0e'); tg.addColorStop(1,'#3b1a06');
  ctx.fillStyle=tg; ctx.fill();
  // canopy
  const hue=108+((ti*13)%26);
  const cg=ctx.createRadialGradient(p.x-sr*.2,p.y-sr*.18,0,p.x,p.y,sr);
  cg.addColorStop(0,`hsla(${hue+8},52%,${30+((ti*4)%10)}%,1)`);
  cg.addColorStop(.6,`hsla(${hue},48%,${20+((ti*3)%8)}%,1)`);
  cg.addColorStop(1,`hsla(${hue-4},44%,${13+((ti*2)%6)}%,1)`);
  ctx.beginPath(); ctx.arc(p.x,p.y,sr,0,Math.PI*2); ctx.fillStyle=cg; ctx.fill();
  // highlight
  ctx.beginPath(); ctx.arc(p.x-sr*.16,p.y-sr*.18,sr*.38,0,Math.PI*2);
  ctx.fillStyle=`hsla(${hue+12},55%,${40+((ti*3)%10)}%,.32)`; ctx.fill();
}

/* ── Lamp posts ── */
function rLampPosts() {
  if (cam.z < 0.25) return;
  const lamps = [
    // East spine lamps
    [1380,402],[1299,402],[1189,402],[1079,402],[918,402],[789,402],[515,402],
    [1493,402],[1493,420],
    // Entrance→Canteen road lamps
    [1400,452],[1300,452],[1200,452],[1155,440],
    // Nature/Parking branch lamps along y=380 road
    [160,402],[80,402],[18,402],[-15,402],
    // Parking & nature vertical road lamps
    [8,350],[8,295],[-15,350],
    // Background/building approach lamps
    [1299,260],[1299,310],[1079,260],[1079,310],
    [789,300],[789,360],[505,260],[505,310],
  ];
  lamps.forEach(([wx,wy]) => {
    const p=W2S(wx,wy), h=13*cam.z, pw=1.5*cam.z;
    const pg=ctx.createLinearGradient(p.x-pw,0,p.x+pw,0);
    pg.addColorStop(0,'rgba(80,110,150,.42)'); pg.addColorStop(.5,'rgba(130,165,210,.66)'); pg.addColorStop(1,'rgba(80,110,150,.42)');
    ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x,p.y-h);
    ctx.strokeStyle=pg; ctx.lineWidth=pw; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p.x,p.y-h); ctx.lineTo(p.x+2.6*cam.z,p.y-h+1.9*cam.z);
    ctx.strokeStyle='rgba(120,150,195,.50)'; ctx.lineWidth=pw*.55; ctx.stroke();
    const lx2=p.x+2.6*cam.z, ly2=p.y-h+1.9*cam.z;
    ctx.beginPath(); ctx.arc(lx2,ly2,1.9*cam.z,0,Math.PI*2);
    ctx.fillStyle='rgba(255,248,220,.95)'; ctx.fill();
    if (cam.z > 0.36) {
      ctx.save(); ctx.globalAlpha=.04;
      const cg=ctx.createRadialGradient(lx2,ly2+11*cam.z,0,lx2,ly2+11*cam.z,11*cam.z);
      cg.addColorStop(0,'rgba(255,240,170,1)'); cg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(lx2,ly2+11*cam.z,11*cam.z,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
  });
}

/* ── Roads — Clean single-line campus pathway network ── */
function rRoads() {
  /*
   * PATH INDEX:
   *  0 = MAIN SPINE EAST  Entrance → BldgA → BldgB → Court  (y=380, straight)
   *  1 = ENTRANCE SPUR    Entrance south face → spine
   *  2 = BLDG A SPUR      Bldg A south face → spine
   *  3 = BLDG B SPUR      Bldg B south face → spine
   *  4 = COURT SPUR       Court north face → spine
   *  5 = SPINE WEST       Court → BldgC → Cibus front junction (y=380)
   *  6 = BLDG C SPUR      Bldg C south face → spine
   *  7 = CIBUS FRONT RD   Spine junction → north fork (runs up east side of Cibus)
   *  8 = AULA BRANCH      Fork (232,320) → smooth curve → Library/Aula Magna
   *  9 = PARKING BRANCH   CIBUS junction (232,380) → straight west → Parking entry
   * 10 = NATURE BRANCH    Parking junction (18,380) → west → Nature Area entry
   * 11 = CANTEEN-R SPUR   Right canteen north → spine
   * 12 = CIBUS SOUTH SPUR Cibus south face → spine junction
   */
  const SPINE_IDS  = new Set([0, 5]);      // main horizontal spines
  const SPUR_IDS   = new Set([1,2,3,4,6,7,11,12]); // short connector spurs
  const AULA_IDS   = new Set([8]);         // curved Aula Magna branch
  const NATURE_IDS = new Set([9, 10]);     // parking/nature branches

  // ── road width helpers ──
  const spW  = Math.max(6, 13*cam.z);
  const spuW = Math.max(4,  9*cam.z);
  const auW  = Math.max(4,  9*cam.z);
  const ntW  = Math.max(4,  9*cam.z);

  function getWidth(pi) {
    if (SPINE_IDS.has(pi))  return spW;
    if (AULA_IDS.has(pi))   return auW;
    if (NATURE_IDS.has(pi)) return ntW;
    return spuW;
  }

  // ── draw a polyline through screen-space points ──
  function drawPolyS(s, col, lw, dash=[]) {
    ctx.beginPath(); ctx.moveTo(s[0].x, s[0].y);
    s.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle=col; ctx.lineWidth=lw;
    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
  }

  // ── draw a smooth cardinal spline through world-space points ──
  function drawSplineW(pts, col, lw, dash=[]) {
    if (pts.length < 2) return;
    const s = pts.map(([x,y]) => W2S(x,y));
    ctx.beginPath(); ctx.moveTo(s[0].x, s[0].y);
    if (s.length === 2) {
      ctx.lineTo(s[1].x, s[1].y);
    } else {
      for (let i = 0; i < s.length - 1; i++) {
        const p0 = s[Math.max(0, i-1)];
        const p1 = s[i];
        const p2 = s[i+1];
        const p3 = s[Math.min(s.length-1, i+2)];
        const t = 0.5;
        const cp1x = p1.x + (p2.x - p0.x) * t / 3;
        const cp1y = p1.y + (p2.y - p0.y) * t / 3;
        const cp2x = p2.x - (p3.x - p1.x) * t / 3;
        const cp2y = p2.y - (p3.y - p1.y) * t / 3;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
    }
    ctx.strokeStyle=col; ctx.lineWidth=lw;
    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
  }

  // ── Pass 1: Grass verge glow under all roads ──
  PATHS.forEach((pts, pi) => {
    if (pts.length < 2) return;
    const rW = getWidth(pi);
    const vergeW = rW + Math.max(6, 14*cam.z);
    if (AULA_IDS.has(pi)) {
      drawSplineW(pts, 'rgba(110,180,80,.20)', vergeW);
    } else {
      const s = pts.map(([x,y]) => W2S(x,y));
      drawPolyS(s, 'rgba(110,180,80,.20)', vergeW);
    }
  });

  // ── Pass 2: Road body (shadow → border → surface → centre → dashes) ──
  PATHS.forEach((pts, pi) => {
    if (pts.length < 2) return;
    const rW  = getWidth(pi);
    const isSp   = SPINE_IDS.has(pi);
    const isAula = AULA_IDS.has(pi);
    const isNat  = NATURE_IDS.has(pi);

    const surfCol  = isSp   ? 'rgba(28,28,34,.97)'
                   : isAula ? 'rgba(36,36,44,.93)'
                   : isNat  ? 'rgba(36,36,44,.93)'
                   :           'rgba(44,46,54,.88)';
    const centreCol= isSp   ? 'rgba(50,50,58,.92)'
                   :           'rgba(58,58,66,.86)';

    const draw = isAula
      ? (col,lw,dash=[]) => drawSplineW(pts, col, lw, dash)
      : (col,lw,dash=[]) => { const s=pts.map(([x,y])=>W2S(x,y)); drawPolyS(s,col,lw,dash); };

    // drop shadow
    ctx.save(); ctx.translate(1.2,1.8);
    draw('rgba(0,0,0,.10)', rW+3);
    ctx.restore();
    // outer border highlight
    draw('rgba(200,200,208,.38)', rW+1.2);
    // road surface
    draw(surfCol, rW);
    // slightly lighter road centre
    draw(centreCol, rW * 0.68);
    // subtle gloss
    draw('rgba(220,220,226,.12)', Math.max(0.8, (isSp?1.8:1.2)*cam.z));
    // centre dashed line
    draw('rgba(230,230,236,.28)', Math.max(0.5, 0.7*cam.z),
         [7*cam.z, 9*cam.z]);
  });

  // ── Pass 3: Junction node dots at key intersections ──
  if (cam.z > 0.28) {
    const junctions = [
      [1492,380], // Entrance → spine
      [1299,380], // Bldg A junction
      [1079,380], // Bldg B junction
      [789, 380], // Court junction
      [515, 380], // Bldg C junction
      [232, 380], // Cibus front junction (main spine meets Cibus + parking branch)
      [18,  380], // Parking / Nature split (on main y=380 level)
      [232, 320], // Aula fork point
    ];
    junctions.forEach(([wx,wy]) => {
      const p = W2S(wx, wy);
      const jr = Math.max(2.8, 4.5*cam.z);
      ctx.beginPath(); ctx.arc(p.x, p.y, jr+1.5, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(200,205,215,.35)'; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y, jr, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(42,46,56,.92)'; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x-jr*.28, p.y-jr*.28, jr*.32, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill();
    });
  }

  // ── Pass 4: Crosswalk stripes at building junctions ──
  if (cam.z > 0.33) {
    // Horizontal-road crosswalks (stripes are vertical bars across the road)
    [[1299,380],[1079,380],[789,380],[515,380],[232,380]].forEach(([wx,wy]) => {
      const cp = W2S(wx, wy);
      const rH = Math.max(7, 10*cam.z);
      ctx.save(); ctx.globalAlpha=.22;
      for (let k=-3; k<=3; k++) {
        const sx = cp.x + k * Math.max(2, 2.8*cam.z);
        ctx.beginPath(); ctx.moveTo(sx, cp.y-rH); ctx.lineTo(sx, cp.y+rH);
        ctx.strokeStyle='rgba(248,248,252,.95)';
        ctx.lineWidth=Math.max(1.2, 1.9*cam.z); ctx.lineCap='square'; ctx.stroke();
      }
      ctx.restore();
    });
    // Vertical-road crosswalk at entrance spur
    if (cam.z > 0.36) {
      [[1492,400]].forEach(([wx,wy]) => {
        const cp = W2S(wx, wy);
        const rW2 = Math.max(6, 9*cam.z);
        ctx.save(); ctx.globalAlpha=.20;
        for (let k=-3; k<=3; k++) {
          const sy = cp.y + k * Math.max(1.8, 2.5*cam.z);
          ctx.beginPath(); ctx.moveTo(cp.x-rW2, sy); ctx.lineTo(cp.x+rW2, sy);
          ctx.strokeStyle='rgba(248,248,252,.95)';
          ctx.lineWidth=Math.max(1.1, 1.7*cam.z); ctx.lineCap='square'; ctx.stroke();
        }
        ctx.restore();
      });
    }
  }

  // ── Pass 5: Road name labels ──
  if (cam.z > 0.40) {
    // Main spine label
    const lp = W2S(1189, 370);
    ctx.save();
    ctx.font = `700 ${Math.max(7, 8*cam.z)}px Inter`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const txt='CAMPUS DRIVE', tw=ctx.measureText(txt).width+10*cam.z;
    ctx.beginPath(); ctx.roundRect(lp.x-tw/2, lp.y-7*cam.z, tw, 14*cam.z, 3.5);
    ctx.fillStyle='rgba(37,99,235,.80)'; ctx.fill();
    ctx.fillStyle='#fff'; ctx.fillText(txt, lp.x, lp.y);
    ctx.restore();

    // Aula Magna branch label (along the new curve from Cibus front)
    if (cam.z > 0.46) {
      const ap = W2S(180, 175);
      ctx.save();
      ctx.font = `600 ${Math.max(6, 7*cam.z)}px Inter`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.translate(ap.x, ap.y); ctx.rotate(-Math.PI/4.5);
      const atxt='AULA ROAD', atw=ctx.measureText(atxt).width+8*cam.z;
      ctx.beginPath(); ctx.roundRect(-atw/2, -6*cam.z, atw, 12*cam.z, 3);
      ctx.fillStyle='rgba(100,60,200,.72)'; ctx.fill();
      ctx.fillStyle='#fff'; ctx.fillText(atxt, 0, 0);
      ctx.restore();

      // Nature Drive label (west branch from cibus junction at y=380)
      const np = W2S(125, 370);
      ctx.save();
      ctx.font = `600 ${Math.max(6, 7*cam.z)}px Inter`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      const ntxt='NATURE DRIVE', ntw=ctx.measureText(ntxt).width+8*cam.z;
      ctx.beginPath(); ctx.roundRect(np.x-ntw/2, np.y-6*cam.z, ntw, 12*cam.z, 3);
      ctx.fillStyle='rgba(22,101,52,.78)'; ctx.fill();
      ctx.fillStyle='#fff'; ctx.fillText(ntxt, np.x, np.y);
      ctx.restore();

      // Parking Lane label (south from y=380 into parking)
      const pp = W2S(18, 325);
      ctx.save();
      ctx.font = `600 ${Math.max(6, 7*cam.z)}px Inter`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.translate(pp.x, pp.y); ctx.rotate(-Math.PI/2);
      const ptxt='PARKING LANE', ptw=ctx.measureText(ptxt).width+8*cam.z;
      ctx.beginPath(); ctx.roundRect(-ptw/2, -6*cam.z, ptw, 12*cam.z, 3);
      ctx.fillStyle='rgba(51,65,85,.78)'; ctx.fill();
      ctx.fillStyle='#fff'; ctx.fillText(ptxt, 0, 0);
      ctx.restore();
    }
  }
}

/* ── Animated glowing route (road-following) ── */
// Waypoints on the road network for each building (where the route line enters/exits)
const ROAD_WAYPOINTS = {
  entrance:    [[1492,380]],
  'bldg-a':    [[1299,380]],
  'bldg-b':    [[1079,380]],
  court:       [[789,380]],
  'bldg-c':    [[515,380]],
  cibus:       [[232,380],[232,320]],
  library:     [[232,320],[150,105],[55,60],[-55,40]],
  veritas:     [[232,320],[150,105],[55,60],[-55,40],[268,40]],
  waiting:     [[232,320],[150,105],[55,60],[-55,40],[268,158]],
  parking:     [[232,380],[18,380],[18,270]],
  forest:      [[232,380],[18,380],[-15,380],[-15,270]],
  'canteen-r': [[1155,380]],
};

// Build a road-following polyline for a route path
function buildRoutePolyline(routePath) {
  if (!routePath || routePath.length < 2) return [];
  const pts = [];
  for (let i = 0; i < routePath.length; i++) {
    const id = routePath[i];
    const b = BLDGS[id];
    if (!b) continue;
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    if (i === 0) {
      // Start: building center → road entry
      pts.push([cx, cy]);
      const wp = ROAD_WAYPOINTS[id];
      if (wp) wp.forEach(p => pts.push(p));
    } else if (i === routePath.length - 1) {
      // End: road entry → building center
      const wp = ROAD_WAYPOINTS[id];
      if (wp) [...wp].reverse().forEach(p => pts.push(p));
      pts.push([cx, cy]);
    } else {
      // Intermediate: include road waypoints
      const wp = ROAD_WAYPOINTS[id];
      if (wp) wp.forEach(p => pts.push(p));
    }
  }
  // Deduplicate consecutive identical points
  return pts.filter((p, i) => i === 0 || !(p[0] === pts[i-1][0] && p[1] === pts[i-1][1]));
}

function rRoute() {
  if (!route || route.length < 2) return;
  const worldPts = buildRoutePolyline(route);
  if (worldPts.length < 2) return;
  const s = worldPts.map(([x,y]) => W2S(x, y));

  function drawLine(col, lw, dash=[]) {
    ctx.beginPath(); ctx.moveTo(s[0].x, s[0].y);
    s.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = col; ctx.lineWidth = lw;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
  }

  // outer glow
  drawLine('rgba(59,130,246,.16)', Math.max(18,30*cam.z));
  // mid glow
  drawLine('rgba(37,99,235,.36)', Math.max(8,13*cam.z));
  // core line
  drawLine('rgba(29,78,216,.88)', Math.max(2.5,4*cam.z));
  // animated white dashes
  ctx.save(); ctx.globalAlpha = .45;
  ctx.beginPath(); ctx.moveTo(s[0].x, s[0].y);
  s.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5,2.5*cam.z);
  ctx.setLineDash([9*cam.z,12*cam.z]); ctx.lineDashOffset = -routeProgress*22*cam.z; ctx.stroke();
  ctx.setLineDash([]); ctx.restore();

  // Node markers — only at building centers (start and end)
  [[route[0], 0], [route[route.length-1], 1]].forEach(([id, idx]) => {
    const b = BLDGS[id]; if (!b) return;
    const p = W2S(b.x + b.w/2, b.y + b.h/2);
    const isS = idx === 0;
    const r = 10 * cam.z;
    const ph = 0.6 + Math.sin(frame*.09 + idx) * .35;
    ctx.beginPath(); ctx.arc(p.x,p.y,(r+5+Math.sin(frame*.11+idx)*2.5)*cam.z,0,Math.PI*2);
    ctx.strokeStyle = `rgba(${isS?'22,163,74':'220,38,38'},${ph*.38})`; ctx.lineWidth = 1.5*cam.z; ctx.stroke();
    ctx.beginPath(); ctx.arc(p.x,p.y,(r+2)*cam.z,0,Math.PI*2);
    ctx.strokeStyle = isS?`rgba(22,163,74,${ph*.72})`:`rgba(220,38,38,${ph*.72})`; ctx.lineWidth = 1.2*cam.z; ctx.stroke();
    const dg = ctx.createRadialGradient(p.x-r*.22,p.y-r*.22,0,p.x,p.y,r);
    dg.addColorStop(0, isS?'#86efac':'#fca5a5');
    dg.addColorStop(1, isS?'#16a34a':'#dc2626');
    ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fillStyle=dg; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=1.5*cam.z; ctx.stroke();
    if (cam.z > 0.28) {
      ctx.font = `700 ${Math.max(7,9*cam.z)}px Inter`;
      ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillStyle = isS?'#16a34a':'#dc2626';
      ctx.fillText(isS?'START':'END', p.x, p.y-r-2.5*cam.z);
    }
  });
}

/* ── Buildings – realistic 3D architecture ── */
function rBuildings() {
  Object.entries(BLDGS).forEach(([id, b]) => {
    const tl=W2S(b.x,b.y), br=W2S(b.x+b.w,b.y+b.h);
    const bW=br.x-tl.x, bH=br.y-tl.y;
    if (bW<=2||bH<=2) return;
    const isHov=hoverBldg===id, isRt=route&&route.includes(id), isSel=selBldg===id, flat=b.floors===0;
    if (!hoverAnim[id]) hoverAnim[id]=0;
    hoverAnim[id]+=((isHov||isSel)?1:-1)*0.11;
    hoverAnim[id]=Math.max(0,Math.min(1,hoverAnim[id]));
    const hg=hoverAnim[id];
    const glowCol=isSel?'#16a34a':isRt?'#2563eb':isHov?'#f59e0b':'#3b82f6';

    /* ── Forest (special) ── */
    if (id==='forest') {
      const fg=ctx.createLinearGradient(tl.x,tl.y,tl.x,br.y);
      fg.addColorStop(0,'rgba(38,108,22,.94)'); fg.addColorStop(1,'rgba(18,62,8,.98)');
      ctx.beginPath(); ctx.roundRect(tl.x,tl.y,bW,bH,10); ctx.fillStyle=fg; ctx.fill();
      ctx.strokeStyle=isHov?'rgba(22,163,74,.8)':'rgba(30,92,14,.42)'; ctx.lineWidth=(isHov?2:1)*cam.z; ctx.stroke();
      // forest interior trees
      [[.10,.12],[.32,.08],[.60,.12],[.82,.16],[.48,.08],[.20,.34],[.50,.30],[.78,.36],[.08,.56],[.35,.60],[.65,.56],[.88,.50],[.15,.78],[.45,.76],[.72,.80],[.92,.68],[.28,.48],[.92,.28],[.04,.30],[.58,.74]].forEach(([fx,fy],ti) => drawTree(b.x+fx*b.w,b.y+fy*b.h,(5+((ti*5)%7)),ti+40));
      if (cam.z>0.28) {
        ctx.font=`600 ${Math.max(6,8*cam.z)}px Inter`; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle='rgba(196,255,164,.58)'; ctx.fillText('NATURE AREA',tl.x+bW/2,tl.y+bH*.9);
      }
      return;
    }

    /* Drop shadow */
    ctx.save(); ctx.globalAlpha=.32;
    ctx.beginPath(); ctx.roundRect(tl.x+5*cam.z,tl.y+6*cam.z,bW,bH,5);
    ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fill(); ctx.restore();

    if (mode==='3d'&&!flat) {
      const dp=Math.max(5,22*cam.z);
      // Right face
      ctx.beginPath(); ctx.moveTo(br.x,tl.y); ctx.lineTo(br.x+dp*.46,tl.y-dp*.56); ctx.lineTo(br.x+dp*.46,br.y-dp*.56); ctx.lineTo(br.x,br.y); ctx.closePath();
      const rf=ctx.createLinearGradient(br.x,0,br.x+dp*.46,0); rf.addColorStop(0,shd(b.color,-70)); rf.addColorStop(1,shd(b.color,-52));
      ctx.fillStyle=rf; ctx.fill();
      // Top face
      ctx.beginPath(); ctx.moveTo(tl.x,tl.y); ctx.lineTo(tl.x+dp*.46,tl.y-dp*.56); ctx.lineTo(br.x+dp*.46,tl.y-dp*.56); ctx.lineTo(br.x,tl.y); ctx.closePath();
      const tf=ctx.createLinearGradient(tl.x,tl.y-dp*.56,br.x,tl.y-dp*.56); tf.addColorStop(0,shd(b.color,72)); tf.addColorStop(1,shd(b.color,52));
      ctx.fillStyle=tf; ctx.fill();
      ctx.strokeStyle=shd(b.color,82); ctx.lineWidth=.7*cam.z;
      ctx.beginPath(); ctx.moveTo(tl.x,tl.y); ctx.lineTo(tl.x+dp*.46,tl.y-dp*.56); ctx.lineTo(br.x+dp*.46,tl.y-dp*.56); ctx.lineTo(br.x,tl.y); ctx.stroke();
      // Front face
      const fg=ctx.createLinearGradient(tl.x,tl.y,tl.x+bW*.32,br.y);
      fg.addColorStop(0,shd(b.color,42)); fg.addColorStop(.28,shd(b.color,22)); fg.addColorStop(.75,b.color); fg.addColorStop(1,shd(b.color,-18));
      ctx.beginPath(); ctx.roundRect(tl.x,tl.y,bW,bH,4); ctx.fillStyle=fg; ctx.fill();
      // Floor separator lines
      if (b.floors>1&&cam.z>0.26) {
        for (let f=1;f<b.floors;f++) {
          const fy=tl.y+(bH/b.floors)*f;
          ctx.beginPath(); ctx.moveTo(tl.x+1,fy); ctx.lineTo(br.x-1,fy); ctx.strokeStyle='rgba(0,0,0,.22)'; ctx.lineWidth=Math.max(.8,1.1*cam.z); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(tl.x+1,fy+.7*cam.z); ctx.lineTo(br.x-1,fy+.7*cam.z); ctx.strokeStyle='rgba(255,255,255,.09)'; ctx.lineWidth=Math.max(.4,.6*cam.z); ctx.stroke();
        }
      }
      // Windows
      if (cam.z>0.22) {
        const wR=b.floors, wC=Math.max(1,Math.floor(bW/(18*cam.z)));
        const wH=Math.min(11,(bH/wR)*.52)*cam.z, wW=Math.min(9,bW/(wC+1)*.68)*cam.z;
        for (let r=0;r<wR;r++) for (let c=0;c<wC;c++) {
          const wxs=tl.x+(c+1)*(bW/(wC+1)), wys=tl.y+(r*(bH/wR)+bH/wR*.22);
          const lit=((r*7+c*3+Math.floor(frame/115)+hsh(id))%5!==0);
          const wg=ctx.createLinearGradient(wxs,wys,wxs+wW,wys+wH);
          if (lit) { wg.addColorStop(0,'rgba(255,248,195,.82)'); wg.addColorStop(1,'rgba(220,185,75,.55)'); }
          else      { wg.addColorStop(0,'rgba(18,50,100,.52)');   wg.addColorStop(1,'rgba(10,28,62,.40)'); }
          ctx.beginPath(); ctx.roundRect(wxs-wW/2,wys,wW,wH,1.5); ctx.fillStyle=wg; ctx.fill();
          ctx.strokeStyle=lit?'rgba(180,140,50,.32)':'rgba(30,60,110,.32)'; ctx.lineWidth=.6*cam.z; ctx.stroke();
          if (lit&&cam.z>0.40) {
            ctx.save(); ctx.globalAlpha=.14;
            ctx.beginPath(); ctx.moveTo(wxs-wW/2+wW*.18,wys); ctx.lineTo(wxs-wW/2+wW*.38,wys+wH);
            ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=wW*.13; ctx.stroke(); ctx.restore();
          }
        }
      }
      // Entrance frontline label
      if (id==='entrance'&&cam.z>0.30) {
        ctx.save(); ctx.globalAlpha=.48;
        ctx.beginPath(); ctx.roundRect(tl.x+3*cam.z,tl.y+bH*.10,bW-6*cam.z,bH*.20,3);
        ctx.fillStyle='rgba(37,99,235,.28)'; ctx.fill(); ctx.strokeStyle='rgba(59,130,246,.48)'; ctx.lineWidth=.8*cam.z; ctx.stroke();
        ctx.restore();
        if (cam.z>0.40) {
          ctx.font=`600 ${Math.max(5,6.5*cam.z)}px Inter`; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillStyle='rgba(37,99,235,.82)'; ctx.fillText('FRONTLINE ROOM',tl.x+bW/2,tl.y+bH*.205);
        }
      }
      // Glow outline
      if (hg>0.04||isRt) { ctx.shadowColor=glowCol; ctx.shadowBlur=(isRt?18:11)*Math.max(hg,.36); }
      ctx.strokeStyle=hg>.04||isRt?glowCol:shd(b.color,58); ctx.lineWidth=(hg>.04||isRt?2.2:1.2)*cam.z; ctx.stroke(); ctx.shadowBlur=0;

    } else {
      // 2D flat
      const fg=ctx.createLinearGradient(tl.x,tl.y,tl.x,br.y); fg.addColorStop(0,shd(b.color,28)); fg.addColorStop(1,b.color);
      ctx.beginPath(); ctx.roundRect(tl.x,tl.y,bW,bH,5); ctx.fillStyle=fg; ctx.fill();
      if (hg>0.04||isRt) { ctx.shadowColor=glowCol; ctx.shadowBlur=(isRt?16:10)*Math.max(hg,.34); }
      ctx.strokeStyle=hg>.04||isRt?glowCol:shd(b.color,42); ctx.lineWidth=(hg>.04||isRt?2:1)*cam.z; ctx.stroke(); ctx.shadowBlur=0;
    }

    // Court markings
    if (id==='court') {
      const ccx=(tl.x+br.x)/2, ccy=(tl.y+br.y)/2, cr=Math.min(bW,bH)*.28;
      ctx.beginPath(); ctx.arc(ccx,ccy,cr,0,Math.PI*2); ctx.strokeStyle='rgba(190,250,170,.26)'; ctx.lineWidth=2*cam.z; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ccx,tl.y+4*cam.z); ctx.lineTo(ccx,br.y-4*cam.z); ctx.strokeStyle='rgba(190,250,170,.18)'; ctx.lineWidth=cam.z; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tl.x+4*cam.z,ccy); ctx.lineTo(br.x-4*cam.z,ccy); ctx.strokeStyle='rgba(190,250,170,.14)'; ctx.lineWidth=cam.z; ctx.stroke();
      [[ccx,tl.y+8*cam.z],[ccx,br.y-8*cam.z]].forEach(([hx,hy]) => { ctx.beginPath(); ctx.arc(hx,hy,cr*.16,Math.PI,Math.PI*2); ctx.strokeStyle='rgba(190,250,170,.20)'; ctx.lineWidth=1.2*cam.z; ctx.stroke(); });
    }
    // Parking stripes
    if (id==='parking') {
      const n=Math.max(2,Math.floor(bW/(22*cam.z)));
      for (let i=1;i<n;i++) { ctx.beginPath(); ctx.moveTo(tl.x+i*(bW/n),tl.y+4*cam.z); ctx.lineTo(tl.x+i*(bW/n),br.y-4*cam.z); ctx.strokeStyle='rgba(150,185,240,.28)'; ctx.lineWidth=cam.z; ctx.stroke(); }
    }
    // Route / selected highlight overlay
    if (isRt) { ctx.beginPath(); ctx.roundRect(tl.x,tl.y,bW,bH,5); ctx.fillStyle=`rgba(37,99,235,${.07+Math.sin(frame*.09)*.03})`; ctx.fill(); }
    if (isSel){ ctx.beginPath(); ctx.roundRect(tl.x,tl.y,bW,bH,5); ctx.fillStyle='rgba(22,163,74,.07)'; ctx.fill(); }
  });
}

/* ── Labels ── */
function rLabels() {
  Object.entries(BLDGS).forEach(([id, b]) => {
    if (id==='forest') return;
    const tl=W2S(b.x,b.y), br=W2S(b.x+b.w,b.y+b.h);
    const bW=br.x-tl.x, bH=br.y-tl.y;
    if (bW<12||bH<7) return;
    const flat=b.floors===0, dp=(mode==='3d'&&!flat)?22*cam.z:0;
    const ccx=tl.x+bW/2, ccy=tl.y-dp+bH/2;
    const fs=Math.max(7,Math.min(13,9.5*cam.z));
    const lines=b.label.split('\n'), lh=fs*1.35;
    ctx.font=`700 ${fs}px Inter`; ctx.textAlign='center'; ctx.textBaseline='middle';
    // drop shadow
    ctx.fillStyle='rgba(0,0,0,.52)'; lines.forEach((ln,i)=>ctx.fillText(ln,ccx+1,ccy+1+(i-(lines.length-1)/2)*lh));
    ctx.fillStyle='rgba(255,255,255,.97)'; lines.forEach((ln,i)=>ctx.fillText(ln,ccx,ccy+(i-(lines.length-1)/2)*lh));
    if (cam.z>0.34&&bW>18*cam.z) { ctx.font=`${Math.max(10,15*cam.z)}px sans-serif`; ctx.fillText(b.icon,ccx,ccy-lh*lines.length*.65-3.5*cam.z); }
  });
}

/* ── "You Are Here" pulsing GPS marker ── */
function rYouAreHere() {
  const b=BLDGS['entrance']; if(!b||cam.z<0.15) return;
  const cx=b.x+b.w/2, cy=b.y+b.h/2;
  const p=W2S(cx, cy-22);
  const r=Math.max(7,9*cam.z);
  const ph=0.6+Math.sin(frame*.07)*.35;

  // outer pulsing ring
  ctx.beginPath(); ctx.arc(p.x,p.y,(r+10+Math.sin(frame*.07)*4)*cam.z,0,Math.PI*2);
  ctx.strokeStyle=`rgba(37,99,235,${ph*.22})`; ctx.lineWidth=1.5*cam.z; ctx.stroke();
  // mid ring
  ctx.beginPath(); ctx.arc(p.x,p.y,(r+4)*cam.z,0,Math.PI*2);
  ctx.strokeStyle=`rgba(37,99,235,${ph*.45})`; ctx.lineWidth=1.2*cam.z; ctx.stroke();

  // shadow
  ctx.save(); ctx.globalAlpha=.14;
  ctx.beginPath(); ctx.ellipse(p.x+2,p.y+r*2.85+2,r*.62,r*.22,0,0,Math.PI*2);
  ctx.fillStyle='#000'; ctx.fill(); ctx.restore();
  // pin stem
  ctx.beginPath(); ctx.moveTo(p.x,p.y+r); ctx.quadraticCurveTo(p.x+r*.55,p.y+r*1.85,p.x,p.y+r*2.72); ctx.quadraticCurveTo(p.x-r*.55,p.y+r*1.85,p.x,p.y+r); ctx.closePath();
  ctx.fillStyle='#1d4ed8'; ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.82)'; ctx.lineWidth=Math.max(.8,1.1*cam.z); ctx.stroke();
  // head ring
  ctx.beginPath(); ctx.arc(p.x,p.y,r+1.8*cam.z,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
  // head fill
  const pg=ctx.createRadialGradient(p.x-r*.22,p.y-r*.22,0,p.x,p.y,r);
  pg.addColorStop(0,'#60a5fa'); pg.addColorStop(1,'#1d4ed8');
  ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fillStyle=pg; ctx.fill();
  ctx.beginPath(); ctx.arc(p.x,p.y,r*.3,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,.88)'; ctx.fill();

  // label bubble
  if (cam.z>0.25) {
    const lbl="📍 You're Here", fs=Math.max(8,9.5*cam.z);
    ctx.font=`700 ${fs}px Inter`; const tw=ctx.measureText(lbl).width;
    const bx=p.x-tw/2-7*cam.z, by=p.y-r-27*cam.z, bw=tw+14*cam.z, bh=fs+10*cam.z;
    ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,5*cam.z); ctx.fillStyle='#1d4ed8'; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.lineWidth=Math.max(.8,1.1*cam.z); ctx.stroke();
    // tail
    ctx.beginPath(); ctx.moveTo(p.x-4.5*cam.z,by+bh); ctx.lineTo(p.x,by+bh+5.5*cam.z); ctx.lineTo(p.x+4.5*cam.z,by+bh); ctx.closePath(); ctx.fillStyle='#1d4ed8'; ctx.fill();
    ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(lbl,p.x,by+bh/2);
  }
}

function shd(hex, a) {
  const n=parseInt(hex.replace('#',''),16);
  return `rgb(${Math.min(255,Math.max(0,(n>>16)+a))},${Math.min(255,Math.max(0,((n>>8)&255)+a))},${Math.min(255,Math.max(0,(n&255)+a))})`;
}
function hsh(id){ let h=0; for (const c of id) h+=c.charCodeAt(0); return h; }

function loop() { render(); requestAnimationFrame(loop); }

/* ═══════════════════════════════════════════════
   INPUT — mouse & touch
═══════════════════════════════════════════════ */
cv.addEventListener('mousedown', e=>{drag=true;lx=e.clientX;ly=e.clientY;});
cv.addEventListener('mousemove', e=>{
  if (drag) { cam.x+=e.clientX-lx; cam.y+=e.clientY-ly; lx=e.clientX; ly=e.clientY; }
  else checkHover(e);
});
cv.addEventListener('mouseup', e=>{
  if (drag&&Math.abs(e.clientX-lx)<4&&Math.abs(e.clientY-ly)<4) handleClick(e.clientX,e.clientY);
  drag=false;
});
cv.addEventListener('mouseleave', ()=>{drag=false;hideTip();hoverBldg=null;});
cv.addEventListener('wheel', e=>{
  e.preventDefault();
  const prev=cam.z;
  cam.z=Math.min(3.2,Math.max(0.14,cam.z*(e.deltaY>0?.88:1.13)));
  const r=cv.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top;
  cam.x=mx-(mx-cam.x)*(cam.z/prev); cam.y=my-(my-cam.y)*(cam.z/prev);
},{passive:false});
cv.addEventListener('touchstart', e=>{
  if (e.touches.length===2) pinchD=dist2(e.touches);
  else {drag=true;lx=e.touches[0].clientX;ly=e.touches[0].clientY;}
},{passive:true});
cv.addEventListener('touchmove', e=>{
  if (e.touches.length===2) { const d=dist2(e.touches); cam.z=Math.min(3.2,Math.max(0.14,cam.z*d/pinchD)); pinchD=d; }
  else if (drag) { cam.x+=e.touches[0].clientX-lx; cam.y+=e.touches[0].clientY-ly; lx=e.touches[0].clientX; ly=e.touches[0].clientY; }
  e.preventDefault();
},{passive:false});
cv.addEventListener('touchend', ()=>{drag=false;});

function dist2(t){ return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY); }

function hitTest(sx, sy) {
  const w=S2W(sx,sy);
  for (const id of Object.keys(BLDGS)) {
    const b=BLDGS[id], dp=(mode==='3d'&&b.floors>0)?22:0;
    if (w.x>=b.x&&w.x<=b.x+b.w&&w.y>=b.y-dp&&w.y<=b.y+b.h) return id;
  }
  return null;
}
function checkHover(e) {
  const r=cv.getBoundingClientRect(), id=hitTest(e.clientX-r.left,e.clientY-r.top);
  hoverBldg=id;
  if (id) { cv.style.cursor='pointer'; showTip(id,e.clientX,e.clientY); }
  else    { cv.style.cursor=drag?'grabbing':'grab'; hideTip(); }
}
function handleClick(cx, cy) {
  const r=cv.getBoundingClientRect(), id=hitTest(cx-r.left,cy-r.top);
  if (!id) { closeRoomPop(); return; }
  selBldg=id; document.getElementById('toSel').value=id;
  showRoomPop(id); showToast(`${BLDGS[id].icon} ${BLDGS[id].label.replace('\n',' ')}`);
}
function showTip(id, mx, my) {
  const b=BLDGS[id];
  document.getElementById('tipDot').style.background=b.color;
  document.getElementById('tipName').textContent=b.label.replace('\n',' / ');
  document.getElementById('tipDesc').textContent=b.desc;
  const tc=document.getElementById('tipCat'); tc.textContent=b.cat; tc.style.background=b.color+'22'; tc.style.color=b.color;
  const tip=document.getElementById('tip'), area=document.getElementById('mapWrap').getBoundingClientRect();
  let tx=mx-area.left+14, ty=my-area.top-14;
  if (tx+222>area.width) tx-=240; if (ty+120>area.height) ty-=120;
  tip.style.left=tx+'px'; tip.style.top=ty+'px'; tip.classList.add('show');
}
function hideTip(){ document.getElementById('tip').classList.remove('show'); }

function showRoomPop(id) {
  const b=BLDGS[id], rm=ROOMS[id]; _selBldgForRoute=id;
  document.getElementById('rpCat').textContent=b.cat.toUpperCase()+' · '+b.icon;
  document.getElementById('rpName').textContent=b.label.replace('\n',' ');
  document.getElementById('rpDesc').textContent=b.desc;
  const grid=document.getElementById('rpGrid'); grid.innerHTML='';
  if (rm) {
    Object.entries(rm).forEach(([fl,rooms])=>{
      const fd=document.createElement('div'); fd.className='rp-floor'; fd.textContent=fl; grid.appendChild(fd);
      rooms.forEach(r=>{
        const btn=document.createElement('div'); btn.className='rp-room'; btn.textContent=r; btn.style.background=b.color+'18';
        btn.onclick=()=>{ document.querySelectorAll('.rp-room').forEach(x=>x.classList.remove('sel')); btn.classList.add('sel'); showToast('📍 '+r+' — '+b.label.replace('\n',' ')); };
        grid.appendChild(btn);
      });
    });
  } else grid.innerHTML='<div style="font-size:10px;color:var(--gray-400)">No rooms listed.</div>';
  document.getElementById('roomPop').classList.add('show');
}
function routeToSelected(){ if(_selBldgForRoute){ document.getElementById('toSel').value=_selBldgForRoute; closeRoomPop(); findRoute(); } }
function closeRoomPop(){ document.getElementById('roomPop').classList.remove('show'); selBldg=null; _selBldgForRoute=null; }

/* ═══════════════════════════════════════════════
   ALGORITHMS
═══════════════════════════════════════════════ */

/* Dijkstra – guaranteed shortest path */
function dijkstra(graph, start, end) {
  const dist={}, prev={}, all=new Set([...Object.keys(graph),start,end]);
  all.forEach(n=>dist[n]=Infinity); dist[start]=0;
  const uv=new Set(all);
  while (uv.size) {
    let u=null; for (const n of uv) if(u===null||dist[n]<dist[u]) u=n;
    if (!u||dist[u]===Infinity||u===end) break;
    uv.delete(u);
    for (const [v,w] of Object.entries(graph[u]||{})) {
      const alt=dist[u]+w; if(alt<(dist[v]??Infinity)){ dist[v]=alt; prev[v]=u; }
    }
  }
  const path=[]; let c=end; while(c){path.unshift(c);c=prev[c];}
  return path[0]===start?{path,dist:dist[end]}:null;
}

/* A* – heuristic optimized */
function aStar(graph, start, end) {
  const g={}, f={}, prev={}, all=new Set([...Object.keys(graph),start,end]);
  all.forEach(n=>{g[n]=Infinity;f[n]=Infinity;}); g[start]=0; f[start]=heuristic(start,end);
  const open=new Set([start]);
  while (open.size) {
    let u=null; for (const n of open) if(u===null||f[n]<f[u]) u=n;
    if (u===end) break;
    open.delete(u);
    for (const [v,w] of Object.entries(graph[u]||{})) {
      const ng=g[u]+w;
      if (ng<g[v]) { g[v]=ng; f[v]=ng+heuristic(v,end); prev[v]=u; open.add(v); }
    }
  }
  const path=[]; let c=end; while(c){path.unshift(c);c=prev[c];}
  return path[0]===start?{path,dist:g[end]}:null;
}

/* BFS – unweighted (indoor rooms) */
function bfs(graph, start, end) {
  const queue=[[start]], visited=new Set([start]), prev={};
  while (queue.length) {
    const path=queue.shift(), node=path[path.length-1];
    if (node===end) return { path, dist:path.length-1 };
    for (const nb of Object.keys(graph[node]||{})) {
      if (!visited.has(nb)) { visited.add(nb); prev[nb]=node; queue.push([...path,nb]); }
    }
  }
  return null;
}

/* DFS – alternate exploration */
function dfs(graph, start, end) {
  const stack=[[start,[start]]], visited=new Set();
  while (stack.length) {
    const [node,path]=stack.pop();
    if (node===end) { let d=0; for(let i=0;i<path.length-1;i++) d+=(graph[path[i]]?.[path[i+1]]||1); return {path,dist:d}; }
    if (visited.has(node)) continue;
    visited.add(node);
    for (const nb of Object.keys(graph[node]||{})) { if(!visited.has(nb)) stack.push([nb,[...path,nb]]); }
  }
  return null;
}

/* Build turn-by-turn instructions */
function buildInstructions(path) {
  if (!path||path.length<2) return [];
  const names=path.map(id=>BLDGS[id]?.label.replace('\n',' ')||id);
  const instr=[{icon:'🚶',text:`Depart from <b>${names[0]}</b>`},{icon:'➡️',text:'Head along the main campus road'}];
  for (let i=1;i<path.length-1;i++) instr.push({icon:'↗️',text:`Continue toward <b>${names[i]}</b>`});
  if (path.length>2) instr.push({icon:'🔄',text:'Follow the campus pathway'});
  instr.push({icon:'✅',text:`Arrived at <b>${names[names.length-1]}</b>`});
  return instr;
}

function findRoute() {
  const from=document.getElementById('fromSel').value||'entrance';
  const to  =document.getElementById('toSel').value;
  if (!to){ showToast('⚠ Please select a destination'); return; }
  const fn=ROOM_MAP[from]||from, tn=ROOM_MAP[to]||to;
  if (fn===tn){ showToast('⚠ Already at that building!'); return; }

  // Use A* first, fall back to Dijkstra
  const res = aStar(GRAPH,fn,tn) || dijkstra(GRAPH,fn,tn);
  if (!res){ showToast('⚠ No route found'); return; }

  route=res.path; routeProgress=0; closeRoomPop();
  const names=res.path.map(id=>BLDGS[id]?.label.replace('\n',' ')||id);
  const m=Math.round(res.dist*55), s=Math.round(m/1.2);
  const tstr=s<60?s+'s walk':Math.ceil(s/60)+' min walk';
  routeMeta={m,s,names};

  // Route card
  document.getElementById('routeCard').classList.add('vis');
  document.getElementById('rcPath').textContent=names.join(' → ');
  const steps=document.getElementById('rcSteps'); steps.innerHTML='';
  for (let i=0;i<res.path.length-1;i++) {
    const d=document.createElement('div'); d.className='rc-step';
    d.textContent=`${BLDGS[res.path[i]]?.label.replace('\n',' ')} → ${BLDGS[res.path[i+1]]?.label.replace('\n',' ')}`;
    steps.appendChild(d);
  }
  document.getElementById('rcDist').textContent=m+'m';
  document.getElementById('rcTime').textContent=tstr;

  // Instructions panel
  const instrSec=document.getElementById('instrSection'), instrList=document.getElementById('instrList');
  instrSec.style.display='block'; instrList.innerHTML='';
  buildInstructions(res.path).forEach(({icon,text})=>{
    const item=document.createElement('div'); item.className='instr-item';
    item.innerHTML=`<div class="instr-icon">${icon}</div><div class="instr-text">${text}</div>`;
    instrList.appendChild(item);
  });

  // Bottom bar
  document.getElementById('bbFrom').textContent=names[0];
  document.getElementById('bbTo').textContent=names[names.length-1];
  document.getElementById('bbDist').textContent=m+'m';
  document.getElementById('bbTime').textContent=tstr;
  document.getElementById('bbProgressFill').style.width='100%';
  document.getElementById('bottomBar').classList.add('vis');

  document.querySelectorAll('.loc-item').forEach(el=>el.classList.toggle('active',route.includes(el.dataset.id)));
  showToast(`🧭 ${m}m · ${tstr}`);
}

function clearRoute() {
  route=null; selBldg=null; _selBldgForRoute=null; routeMeta={m:0,s:0,names:[]}; routeProgress=0;
  document.getElementById('routeCard').classList.remove('vis');
  document.getElementById('instrSection').style.display='none';
  document.getElementById('bottomBar').classList.remove('vis');
  document.getElementById('bbProgressFill').style.width='0%';
  document.getElementById('fromSel').value=''; document.getElementById('toSel').value='';
  document.querySelectorAll('.loc-item').forEach(el=>el.classList.remove('active'));
  closeRoomPop();
}

function zoomIn()    { cam.z=Math.min(3.2,cam.z*1.18); }
function zoomOut()   { cam.z=Math.max(0.14,cam.z/1.18); }
function resetView() {
  const w=document.getElementById('mapWrap');
  cam.x=w.clientWidth/2; cam.y=w.clientHeight/2; cam.z=0.48;
}
function setMode(m) {
  mode=m;
  document.getElementById('btn3d').classList.toggle('on',m==='3d');
  document.getElementById('btn2d').classList.toggle('on',m==='2d');
}
function showToast(msg) {
  const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}

/* ═══════════════════════════════════════════════
   LOCATION LIST
═══════════════════════════════════════════════ */
function buildList() {
  const el=document.getElementById('locList');
  // Merge-sort by label for display
  const sorted=Object.entries(BLDGS).sort(([,a],[,b])=>a.label.localeCompare(b.label));
  sorted.forEach(([id,b])=>{
    const div=document.createElement('div'); div.className='loc-item'; div.dataset.id=id;
    div.innerHTML=`<div class="loc-dot" style="background:${b.color}"></div><div class="loc-name">${b.icon} ${b.label.replace('\n',' ')}</div><div class="loc-cat">${b.cat}</div>`;
    div.onclick=()=>{
      selBldg=id; document.getElementById('toSel').value=id; showRoomPop(id);
      document.querySelectorAll('.loc-item').forEach(x=>x.classList.remove('active')); div.classList.add('active');
      showToast(b.icon+' '+b.label.replace('\n',' '));
    };
    el.appendChild(div);
  });
}

/* ═══════════════════════════════════════════════
   SEARCH (Hash Map O(1) + autocomplete)
═══════════════════════════════════════════════ */
// Pre-build hash map index for O(1) lookup
const SEARCH_INDEX = new Map();
function buildSearchIndex() {
  Object.entries(BLDGS).forEach(([id,b])=>{
    [b.label.toLowerCase(),b.cat.toLowerCase(),...b.desc.toLowerCase().split(' ')].forEach(token=>{
      if (!SEARCH_INDEX.has(token)) SEARCH_INDEX.set(token,[]);
      if (!SEARCH_INDEX.get(token).find(e=>e.id===id)) SEARCH_INDEX.get(token).push({id,b});
    });
  });
  Object.entries(ROOMS).forEach(([bid,rm])=>{
    Object.entries(rm).forEach(([fl,rooms])=>{
      rooms.forEach(r=>{
        const key=r.toLowerCase();
        if (!SEARCH_INDEX.has(key)) SEARCH_INDEX.set(key,[]);
        SEARCH_INDEX.get(key).push({id:bid,b:BLDGS[bid],rm:r,fl});
      });
    });
  });
}

const sI=document.getElementById('searchInput');
const sD=document.getElementById('searchDrop');
const sC=document.getElementById('searchClr');

sI.addEventListener('input', ()=>{
  const q=sI.value.toLowerCase().trim();
  sC.classList.toggle('vis',q.length>0);
  if (!q){ sD.classList.remove('open'); return; }

  // Collect matching results (partial match across index)
  const seen=new Set(), res=[];
  SEARCH_INDEX.forEach((entries,key)=>{
    if (key.includes(q)) entries.forEach(e=>{
      const uid=e.rm?`${e.id}::${e.rm}`:e.id;
      if (!seen.has(uid)){ seen.add(uid); res.push(e); }
    });
  });
  // Also scan buildings directly for partial label match
  Object.entries(BLDGS).forEach(([id,b])=>{
    if (b.label.toLowerCase().includes(q)&&!seen.has(id)){ seen.add(id); res.unshift({id,b}); }
  });
  // Merge-sort results by relevance (label starts with query first)
  res.sort((a,b)=>{
    const ak=(a.rm||a.b.label).toLowerCase(), bk=(b.rm||b.b.label).toLowerCase();
    const as=ak.startsWith(q)?0:1, bs=bk.startsWith(q)?0:1;
    return as-bs||ak.localeCompare(bk);
  });

  sD.innerHTML=res.length
    ?res.slice(0,9).map(({id,b,rm,fl})=>`
      <div class="sd-row" onclick="pickSearch('${id}','${(rm||'').replace(/'/g,"\\'")}')">
        <div class="sd-ic" style="background:${b.color}22">${b.icon}</div>
        <div class="sd-info">
          <div class="sd-name">${rm||b.label.replace('\n',' ')}</div>
          <div class="sd-sub">${rm?(b.label.replace('\n',' ')+' · '+fl):b.desc.substring(0,55)}</div>
        </div>
        <div class="sd-tag">${b.cat}</div>
      </div>`).join('')
    :'<div class="sd-empty">No results found for "'+q+'"</div>';
  sD.classList.add('open');
});

sC.addEventListener('click',()=>{sI.value='';sC.classList.remove('vis');sD.classList.remove('open');});
document.addEventListener('click',e=>{ if(!document.getElementById('searchWrap').contains(e.target)) sD.classList.remove('open'); });
document.addEventListener('keydown',e=>{
  if ((e.metaKey||e.ctrlKey)&&e.key==='k'){ e.preventDefault(); sI.focus(); }
  if (e.key==='Escape'){ sD.classList.remove('open'); sI.blur(); }
});

function pickSearch(id, rm) {
  const b=BLDGS[id]; sI.value=rm||b.label.replace('\n',' '); sC.classList.add('vis');
  sD.classList.remove('open'); selBldg=id; document.getElementById('toSel').value=id; showRoomPop(id);
  if (rm) setTimeout(()=>{ document.querySelectorAll('.rp-room').forEach(el=>{ if(el.textContent===rm){el.classList.add('sel');el.scrollIntoView({block:'nearest'});} }); },60);
  showToast(b.icon+' '+(rm||b.label.replace('\n',' ')));
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
resizeCanvas();
buildSearchIndex();
buildList();
applyPanel(false);
loop();
