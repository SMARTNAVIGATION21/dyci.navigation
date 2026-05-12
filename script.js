'use strict';

/* ══════════════════════════════════════════
   PANEL TOGGLE
══════════════════════════════════════════ */
const LS_KEY = 'dyci_panel_v2';
let panelOpen = localStorage.getItem(LS_KEY) === 'true';

function applyPanel(animate) {
  const panel  = document.getElementById('navPanel');
  const fab    = document.getElementById('fab');
  const toggle = document.getElementById('hdrToggle');
  const dim    = document.getElementById('dimLayer');
  const isMob  = window.innerWidth <= 600;
  if (!animate) { panel.style.transition = 'none'; setTimeout(() => panel.style.transition = '', 20); }
  if (panelOpen) {
    panel.classList.remove('collapsed'); fab.classList.add('open');
    fab.setAttribute('data-tip','Close Panel'); toggle.classList.add('open');
    if (isMob) dim.classList.add('vis');
  } else {
    panel.classList.add('collapsed'); fab.classList.remove('open');
    fab.setAttribute('data-tip','Open Panel'); toggle.classList.remove('open');
    dim.classList.remove('vis');
  }
  setTimeout(resizeCanvas, animate ? 420 : 10);
  syncRouteOverlay();
  localStorage.setItem(LS_KEY, panelOpen);
}
function togglePanel() { panelOpen = !panelOpen; applyPanel(true); }
function closePanel()  { panelOpen = false; applyPanel(true); }

/* ══════════════════════════════════════════
   CAMPUS DATA
══════════════════════════════════════════ */
const BLDGS = {
  forest:      { x:-180, y:270, w:175, h:250, color:'#0a2a08', label:'NATURE\nAREA',         icon:'🌿', cat:'Open',    desc:'Campus forest — peaceful green space beside the parking lot', floors:0 },
  parking:     { x:20,   y:270, w:170, h:250, color:'#1a2030', label:'PARKING',               icon:'🅿', cat:'Facility',desc:'Campus parking area with designated vehicle slots', floors:0 },
  library:     { x:235,  y:45,  w:325, h:260, color:'#0b3d22', label:'LIBRARY /\nAULA MAGNA', icon:'📚', cat:'Facility',desc:'Library, Clinic, Guidance, Labs, Offices, Amphitheater & more — 2 floors', floors:2 },
  cibus:       { x:235,  y:365, w:200, h:145, color:'#0c2050', label:'CIBUS\nCANTEEN',        icon:'🍽', cat:'Facility',desc:'Cibus campus canteen — main cafeteria and food stalls', floors:1 },
  waiting:     { x:595,  y:180, w:95,  h:65,  color:'#1e3020', label:'WAITING\nSHED',         icon:'🏠', cat:'Facility',desc:'Covered waiting shed and student lounge area', floors:0 },
  veritas:     { x:595,  y:45,  w:110, h:120, color:'#3a2070', label:'VERITAS\nHALL',         icon:'🏛', cat:'Academic',desc:'Veritas Hall — seminars, events, multi-purpose hall', floors:2 },
  'bldg-c':    { x:745,  y:60,  w:155, h:165, color:'#5a2010', label:'BUILDING C',            icon:'🏛', cat:'Academic',desc:'Rooms 101–103 (1F) · RaiseLab · 201–202 (2F) · AVR', floors:2 },
  court:       { x:745,  y:285, w:255, h:245, color:'#163808', label:'ELIDA COURT',           icon:'🏀', cat:'Open',   desc:'Elida Court — basketball court and campus events stage', floors:0 },
  'bldg-b':    { x:1050, y:165, w:195, h:185, color:'#7a2e14', label:'BUILDING B',            icon:'🏫', cat:'Academic',desc:'Rooms 103–105 (GF) · Rooms 203–205 (2F)', floors:2 },
  'bldg-a':    { x:1305, y:165, w:205, h:185, color:'#6a2008', label:'BUILDING A',            icon:'🏫', cat:'Academic',desc:'Cashier · CAS · Rooms 101–102 (GF) · 201–202 (2F)', floors:2 },
  'canteen-r': { x:1135, y:410, w:245, h:115, color:'#0c2858', label:'CANTEEN',               icon:'🍱', cat:'Facility',desc:'Canteen — right side, near Building A', floors:1 },
  entrance:    { x:1570, y:230, w:100, h:220, color:'#142838', label:'ENTRANCE',               icon:'🚪', cat:'Entry',  desc:'Main campus entrance gate with Frontline Room and visitor services', floors:0 },
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
    'First Floor': ['Library','Clinic','Guidance','Nexus','Psych Lab','Sandbox','Inspire','AM 101','AM 102','Credo','Chapel','Canteen','CCS Office','CAS Office','SOP Office'],
    'Second Floor': ['Scientia 1','Scientia 2','CHS Office','Skills Lab','Amphitheater','Microbiology Lab','Physics Lab','Anatomy Lab','AM 201','AM 202','Resource Room','Chemistry Lab','Lecture Room','Huddle/Lecture Room','OSP Room','OVPAA Room'],
  },
  cibus:       { 'Ground Floor': ['Main Dining','Food Stalls','Faculty Dining','Snack Bar'] },
  'canteen-r': { 'Ground Floor': ['Dining Area','Food Court','Takeout Counter'] },
  waiting:     { 'Ground Floor': ['Bench Area','Notice Board'] },
  entrance:    { 'Ground Floor': ['Frontline Room','Entrance Information','Visitor Log','Security Post','Navigation Access Point'] },
};

const ROOM_MAP = {
  r101:'bldg-a',r102:'bldg-a',r201:'bldg-a',r202:'bldg-a',cashier:'bldg-a','cas-a':'bldg-a',
  r103:'bldg-b',r104:'bldg-b',r105:'bldg-b',r203:'bldg-b',r204:'bldg-b',r205:'bldg-b',
  'lib-library':'library','lib-clinic':'library','lib-guidance':'library','lib-nexus':'library',
  'lib-psych':'library','lib-sandbox':'library','lib-inspire':'library','lib-am101':'library',
  'lib-am102':'library','lib-credo':'library','lib-chapel':'library','lib-canteen':'library',
  'lib-ccs':'library','lib-cas':'library','lib-sop':'library',
  'lib-scientia1':'library','lib-scientia2':'library','lib-chs':'library','lib-skills':'library',
  'lib-amphitheater':'library','lib-micro':'library','lib-physics':'library','lib-anatomy':'library',
  'lib-am201':'library','lib-am202':'library','lib-resource':'library','lib-chemistry':'library',
  'lib-lecture':'library','lib-huddle':'library','lib-osp':'library','lib-ovpaa':'library',
  frontline:'entrance',
};

const GRAPH = {
  entrance:    { 'bldg-a':1.5, 'canteen-r':2.0 },
  'bldg-a':    { entrance:1.5, 'bldg-b':1.8, 'canteen-r':1.6 },
  'bldg-b':    { 'bldg-a':1.8, court:2.0, 'canteen-r':2.0, 'bldg-c':2.5 },
  'canteen-r': { entrance:2.0, 'bldg-a':1.6, 'bldg-b':2.0, court:1.8 },
  court:       { 'bldg-b':2.0, 'canteen-r':1.8, 'bldg-c':1.8, cibus:2.2, waiting:1.6 },
  'bldg-c':    { court:1.8, 'bldg-b':2.5, veritas:1.2, library:1.8, cibus:2.0, waiting:1.4 },
  veritas:     { 'bldg-c':1.2, library:1.4, waiting:1.1 },
  waiting:     { veritas:1.1, 'bldg-c':1.4, library:1.6, court:1.6, cibus:2.0 },
  cibus:       { court:2.2, 'bldg-c':2.0, waiting:2.0, library:2.2, parking:1.6 },
  library:     { veritas:1.4, 'bldg-c':1.8, cibus:2.2, waiting:1.6, parking:1.4 },
  parking:     { library:1.4, cibus:1.6, forest:0.6 },
  forest:      { parking:0.6 },
};

const PATHS = [
  [[1680,420],[1570,415],[1500,410],[1420,406],[1305,402],[1200,398],[1050,394],[980,390],[905,386],[840,382],[790,378],[745,374],[700,370],[660,365],[620,360],[595,355],[560,350],[520,345],[475,340],[430,335],[390,330],[350,326],[310,322],[270,318],[235,315]],
  [[1620,450],[1620,420]],
  [[1405,402],[1405,375]],[[1490,402],[1490,375]],
  [[1380,375],[1380,430],[1260,455],[1135,455],[1135,410]],
  [[1148,394],[1148,370]],
  [[840,382],[840,350],[820,320],[800,305]],
  [[745,374],[745,315],[755,295]],
  [[820,240],[820,180],[810,145]],
  [[705,240],[705,175],[695,150]],
  [[595,240],[595,210],[580,175]],
  [[560,140],[490,140],[400,140],[310,140],[235,140]],
  [[335,365],[335,410],[315,440],[290,465],[265,475]],
  [[235,315],[235,370]],
  [[190,315],[155,312],[115,310],[72,316],[38,328]],
  [[38,395],[38,440],[38,480]],
];

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let cam = { x:760, y:320, z:0.50 };
let mode = '3d';
let drag = false, lx = 0, ly = 0, pinchD = 0;
let route = null, hoverBldg = null, selBldg = null;
let hoverAnim = {};
let routeMeta = { m:0, s:0, names:[] };
let toastTimer = null, frame = 0;
let routeProgress = 0;

const cv  = document.getElementById('c');
const ctx = cv.getContext('2d');

// Mini-map canvas
const mm = document.getElementById('minimap');
const mctx = mm ? mm.getContext('2d') : null;
const MM_W = 160, MM_H = 110;

/* Campus world bounds for minimap */
const WB = { x1:-180, y1:30, x2:1690, y2:590 };

function resizeCanvas() {
  const w = document.getElementById('mapWrap');
  cv.width  = w.clientWidth  * devicePixelRatio;
  cv.height = w.clientHeight * devicePixelRatio;
  cv.style.width  = w.clientWidth  + 'px';
  cv.style.height = w.clientHeight + 'px';
}
window.addEventListener('resize', resizeCanvas);

function W2S(wx,wy){ return { x:(wx-780)*cam.z+cam.x, y:(wy-320)*cam.z+cam.y }; }
function S2W(sx,sy){ return { x:(sx-cam.x)/cam.z+780, y:(sy-cam.y)/cam.z+320 }; }

/* World → minimap coords */
function W2M(wx,wy){
  const scx=(wx-WB.x1)/(WB.x2-WB.x1), scy=(wy-WB.y1)/(WB.y2-WB.y1);
  return { x:scx*MM_W, y:scy*MM_H };
}

/* ══════════════════════════════════════════
   MAIN RENDER
══════════════════════════════════════════ */
function render() {
  frame++;
  routeProgress += 0.016;
  const W = cv.width/devicePixelRatio, H = cv.height/devicePixelRatio;
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.save(); ctx.scale(devicePixelRatio,devicePixelRatio);
  rBG(W,H);
  rWater();
  rGround();
  rLandscaping();
  rWalkways();
  rLampPosts();
  if (route) rRoute();
  rBuildings();
  rLabels();
  rYouAreHere();
  ctx.restore();
  rMinimap();
}

/* ── BG — clean white/blue gradient, no particles or glows ── */
function rBG(W,H) {
  const g = ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,'#ffffff');
  g.addColorStop(0.35,'#ddeeff');
  g.addColorStop(0.7,'#b8d4f0');
  g.addColorStop(1,'#96bce8');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  // Subtle grid — very light blue lines only
  ctx.strokeStyle='rgba(160,200,240,0.22)'; ctx.lineWidth=0.5;
  const gs=58*cam.z, ox=((cam.x%gs)+gs)%gs, oy=((cam.y%gs)+gs)%gs;
  for(let x=ox-gs;x<W+gs;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=oy-gs;y<H+gs;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
}

/* ── "You're Here" marker at Entrance ── */
function rYouAreHere() {
  const b = BLDGS['entrance'];
  if (!b) return;
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const p = W2S(cx, cy - 18);
  const r = Math.max(7, 9 * cam.z);
  if (cam.z < 0.18) return;

  // Pin drop shadow
  ctx.save(); ctx.globalAlpha = 0.18;
  ctx.beginPath(); ctx.ellipse(p.x + 2, p.y + r * 2.8 + 2, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();

  // Pin stem
  ctx.beginPath();
  ctx.moveTo(p.x, p.y + r);
  ctx.quadraticCurveTo(p.x + r * 0.6, p.y + r * 1.8, p.x, p.y + r * 2.7);
  ctx.quadraticCurveTo(p.x - r * 0.6, p.y + r * 1.8, p.x, p.y + r);
  ctx.fillStyle = '#1a6fcf'; ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(0.8, 1.2 * cam.z); ctx.stroke();

  // Pin circle head — outer ring
  ctx.beginPath(); ctx.arc(p.x, p.y, r + 2 * cam.z, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff'; ctx.fill();

  // Pin circle head — filled
  const pg = ctx.createRadialGradient(p.x - r * 0.25, p.y - r * 0.25, 0, p.x, p.y, r);
  pg.addColorStop(0, '#4da3ff'); pg.addColorStop(1, '#1a6fcf');
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fillStyle = pg; ctx.fill();

  // Inner dot
  ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff'; ctx.fill();

  // Label bubble
  if (cam.z > 0.28) {
    const lbl = "📍 You're Here";
    const fs = Math.max(8, 10 * cam.z);
    ctx.font = `700 ${fs}px Sora`;
    const tw = ctx.measureText(lbl).width;
    const bx = p.x - tw / 2 - 7 * cam.z;
    const by = p.y - r - 28 * cam.z;
    const bw = tw + 14 * cam.z;
    const bh = fs + 10 * cam.z;
    // Bubble background
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 5 * cam.z);
    ctx.fillStyle = '#1a6fcf'; ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(0.8, 1.2 * cam.z); ctx.stroke();
    // Bubble tail
    ctx.beginPath();
    ctx.moveTo(p.x - 5 * cam.z, by + bh);
    ctx.lineTo(p.x, by + bh + 6 * cam.z);
    ctx.lineTo(p.x + 5 * cam.z, by + bh);
    ctx.closePath();
    ctx.fillStyle = '#1a6fcf'; ctx.fill();
    // Label text
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(lbl, p.x, by + bh / 2);
  }
}

/* ── River — clean light blue ── */
function rWater() {
  const pts=[W2S(1260,0),W2S(1760,0),W2S(1760,265),W2S(1385,265),W2S(1260,175)];
  ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
  pts.slice(1).forEach(p=>ctx.lineTo(p.x,p.y)); ctx.closePath();
  const gw=ctx.createLinearGradient(pts[0].x,pts[0].y,pts[0].x,pts[2].y);
  gw.addColorStop(0,'rgba(180,220,255,.92)'); gw.addColorStop(1,'rgba(140,195,245,.85)');
  ctx.fillStyle=gw; ctx.fill();
  ctx.strokeStyle='rgba(100,160,220,.35)'; ctx.lineWidth=1.5; ctx.stroke();
  // Gentle wave lines
  for(let i=0;i<8;i++){
    const a=W2S(1275,18+i*28), b=W2S(1740,18+i*28);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y+Math.sin(frame*.014+i*.7)*1.8);
    ctx.bezierCurveTo(
      a.x+(b.x-a.x)*.33, a.y+Math.sin(frame*.014+i*.7+1)*1.8,
      a.x+(b.x-a.x)*.66, b.y+Math.sin(frame*.014+i*.7+2)*1.8,
      b.x, b.y+Math.sin(frame*.014+i*.7+3)*1.8
    );
    ctx.strokeStyle=`rgba(100,165,230,${0.12+i*.012})`; ctx.lineWidth=1; ctx.stroke();
  }
  const wl=W2S(1480,130);
  ctx.save(); ctx.globalAlpha=0.55;
  ctx.font=`italic ${Math.max(8,11*cam.z)}px Sora`;
  ctx.fillStyle='#3a7ac0'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('~ River ~',wl.x,wl.y); ctx.restore();
}

/* ── Ground ── */
function rGround() {
  const tl=W2S(-200,30), br=W2S(1700,590);
  if(br.x<=tl.x||br.y<=tl.y) return;
  const gg=ctx.createLinearGradient(tl.x,tl.y,br.x,br.y);
  gg.addColorStop(0,'rgba(12,30,7,.88)'); gg.addColorStop(.5,'rgba(15,40,8,.82)'); gg.addColorStop(1,'rgba(8,22,5,.76)');
  ctx.beginPath(); ctx.roundRect(tl.x,tl.y,br.x-tl.x,br.y-tl.y,8); ctx.fillStyle=gg; ctx.fill();
  ctx.strokeStyle='rgba(0,180,80,.06)'; ctx.lineWidth=1.5; ctx.stroke();
}

/* ── Landscaping ── */
function rLandscaping() {
  // Grass patches
  const patches=[[570,130,62,42],[645,240,45,32],[895,125,50,38],[1015,138,40,30],[1185,148,44,34],[1460,152,42,32],[470,505,55,40],[835,520,46,34],[1070,518,40,30],[305,492,48,36],[165,518,44,32],[650,505,38,28]];
  patches.forEach(([wx,wy,rw,rh])=>{
    const tl=W2S(wx-rw/2,wy-rh/2),br=W2S(wx+rw/2,wy+rh/2);
    const bW=br.x-tl.x,bH=br.y-tl.y; if(bW<=0||bH<=0)return;
    ctx.beginPath(); ctx.ellipse(tl.x+bW/2,tl.y+bH/2,bW/2,bH/2,0,0,Math.PI*2);
    ctx.fillStyle='rgba(28,75,14,.55)'; ctx.fill();
    ctx.strokeStyle='rgba(40,100,18,.25)'; ctx.lineWidth=.5*cam.z; ctx.stroke();
  });

  // Standalone trees
  const trees=[[570,128,13],[648,238,11],[895,118,12],[1018,130,10],[1185,140,11],[472,502,12],[838,515,10],[1072,512,11],[308,488,13],[168,512,11],[652,500,10],[968,130,9],[1460,145,10],[550,502,9],[720,515,10],[1100,130,9]];
  trees.forEach(([wx,wy,r],ti)=>drawTree(wx,wy,r,ti));

  // Flower beds
  const flowers=[[235,48,8],[600,42,7],[745,58,6],[1050,162,7],[1305,162,7],[1570,228,6],[1450,410,6]];
  const fcols=['#ff6ba8','#ffd740','#69f0ae','#40c4ff','#e040fb','#ff8f00'];
  flowers.forEach(([wx,wy,count])=>{
    for(let i=0;i<count;i++){
      const ang=i*(Math.PI*2/count);
      const fp=W2S(wx+Math.cos(ang)*16,wy+Math.sin(ang)*9);
      const fr=Math.max(1.4,2.0*cam.z);
      ctx.beginPath(); ctx.arc(fp.x,fp.y,fr,0,Math.PI*2);
      ctx.fillStyle=fcols[i%fcols.length]; ctx.fill();
    }
  });

  // Hedges
  [[[235,38],[560,38]],[[235,308],[560,308]],[[745,38],[1050,38]],[[1050,158],[1305,158]]].forEach(([[x1,y1],[x2,y2]])=>{
    const a=W2S(x1,y1),b=W2S(x2,y2);
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
    ctx.strokeStyle='rgba(25,75,12,.55)'; ctx.lineWidth=Math.max(2,4*cam.z); ctx.lineCap='round'; ctx.stroke();
  });

  // Benches
  if(cam.z>0.3){
    [[612,200],[900,170],[1265,162],[1175,162],[472,375],[855,280]].forEach(([wx,wy])=>{
      const p=W2S(wx,wy), bw=10*cam.z, bh=3.5*cam.z;
      ctx.fillStyle='rgba(100,70,35,.7)';
      ctx.beginPath(); ctx.roundRect(p.x-bw/2,p.y-bh/2,bw,bh,1); ctx.fill();
      ctx.strokeStyle='rgba(180,130,70,.4)'; ctx.lineWidth=.6*cam.z; ctx.stroke();
    });
  }
}

function drawTree(wx,wy,r,ti) {
  const p=W2S(wx,wy), sr=r*cam.z;
  if(sr<2) return;
  // Ground shadow
  ctx.save(); ctx.globalAlpha=0.22;
  ctx.beginPath(); ctx.ellipse(p.x+sr*.35,p.y+sr*.6,sr*.88,sr*.36,0,0,Math.PI*2);
  ctx.fillStyle='#000'; ctx.fill(); ctx.restore();
  // Trunk — realistic tapered shape
  ctx.beginPath();
  ctx.moveTo(p.x-sr*.12,p.y+sr*.28); ctx.lineTo(p.x+sr*.12,p.y+sr*.28);
  ctx.lineTo(p.x+sr*.07,p.y+sr*.92); ctx.lineTo(p.x-sr*.07,p.y+sr*.92);
  ctx.closePath();
  const tg=ctx.createLinearGradient(p.x-sr*.12,p.y,p.x+sr*.12,p.y);
  tg.addColorStop(0,'#2a1205'); tg.addColorStop(.4,'#4a2210'); tg.addColorStop(1,'#2a1205');
  ctx.fillStyle=tg; ctx.fill();
  // Canopy — layered for depth
  const hue=108+((ti*13)%26);
  // Back/dark layer
  ctx.beginPath(); ctx.arc(p.x+sr*.08,p.y+sr*.05,sr*.92,0,Math.PI*2);
  ctx.fillStyle=`hsla(${hue},55%,${12+((ti*4)%7)}%,.98)`; ctx.fill();
  // Main layer
  ctx.beginPath(); ctx.arc(p.x,p.y,sr,0,Math.PI*2);
  const cg=ctx.createRadialGradient(p.x-sr*.2,p.y-sr*.2,0,p.x,p.y,sr);
  cg.addColorStop(0,`hsla(${hue+6},58%,${24+((ti*5)%9)}%,1)`);
  cg.addColorStop(.6,`hsla(${hue},52%,${16+((ti*3)%7)}%,1)`);
  cg.addColorStop(1,`hsla(${hue-4},48%,${10+((ti*2)%6)}%,1)`);
  ctx.fillStyle=cg; ctx.fill();
  // Top rim highlight
  ctx.beginPath(); ctx.arc(p.x-sr*.18,p.y-sr*.2,sr*.42,0,Math.PI*2);
  ctx.fillStyle=`hsla(${hue+10},60%,${36+((ti*3)%10)}%,.38)`; ctx.fill();
}

/* ── Lamp posts ── */
function rLampPosts() {
  if(cam.z<0.28) return;
  const lamps=[[400,135],[560,135],[745,58],[900,58],[1050,162],[1200,162],[1305,162],[1450,162],[400,318],[560,318],[745,280],[1000,382],[1200,382],[1400,382],[235,315],[235,140]];
  lamps.forEach(([wx,wy])=>{
    const p=W2S(wx,wy), h=13*cam.z, pw=1.6*cam.z;
    // Pole
    const pg=ctx.createLinearGradient(p.x-pw,p.y,p.x+pw,p.y);
    pg.addColorStop(0,'rgba(80,110,150,.4)'); pg.addColorStop(.5,'rgba(130,170,210,.65)'); pg.addColorStop(1,'rgba(80,110,150,.4)');
    ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x,p.y-h);
    ctx.strokeStyle=pg; ctx.lineWidth=pw; ctx.stroke();
    // Arm
    ctx.beginPath(); ctx.moveTo(p.x,p.y-h); ctx.lineTo(p.x+3*cam.z,p.y-h+2*cam.z);
    ctx.strokeStyle='rgba(120,160,200,.5)'; ctx.lineWidth=pw*.6; ctx.stroke();
    // Lamp head
    const lx2=p.x+3*cam.z, ly2=p.y-h+2*cam.z;
    ctx.beginPath(); ctx.arc(lx2,ly2,2*cam.z,0,Math.PI*2);
    ctx.fillStyle='rgba(230,245,255,.95)'; ctx.fill();
    // Ground cone (static, no bloom)
    if(cam.z>0.38){
      ctx.save(); ctx.globalAlpha=0.04;
      const cg=ctx.createRadialGradient(lx2,ly2,0,lx2,ly2+12*cam.z,12*cam.z);
      cg.addColorStop(0,'rgba(200,230,255,1)'); cg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(lx2,ly2+12*cam.z,12*cam.z,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
  });
}

/* ── Walkways — clean black/white realistic roads ── */
function rWalkways() {
  // Classify paths: first (longest) = main road spine; rest = secondary/pedestrian
  PATHS.forEach((pts, pi) => {
    if (pts.length < 2) return;
    const s = pts.map(([x,y]) => W2S(x,y));
    const isMain = pi === 0; // main horizontal spine
    const roadW  = isMain ? Math.max(9, 28*cam.z) : Math.max(5, 16*cam.z);
    const surfW  = isMain ? Math.max(7, 22*cam.z) : Math.max(3.5, 12*cam.z);
    const edgeW  = isMain ? Math.max(1.5, 3*cam.z)  : Math.max(.8, 1.8*cam.z);

    // 1. Shadow underneath road
    ctx.beginPath(); ctx.moveTo(s[0].x+1.5, s[0].y+1.5); s.slice(1).forEach(p=>ctx.lineTo(p.x+1.5, p.y+1.5));
    ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=roadW+2; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();

    // 2. Road base — dark asphalt
    ctx.beginPath(); ctx.moveTo(s[0].x,s[0].y); s.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
    ctx.strokeStyle=isMain?'rgba(22,22,24,.97)':'rgba(38,38,42,.93)';
    ctx.lineWidth=roadW; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();

    // 3. Road surface — slightly lighter center for depth
    ctx.beginPath(); ctx.moveTo(s[0].x,s[0].y); s.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
    ctx.strokeStyle=isMain?'rgba(42,42,46,.95)':'rgba(55,55,60,.88)';
    ctx.lineWidth=surfW; ctx.stroke();

    // 4. Edge lines — white outlines
    ctx.beginPath(); ctx.moveTo(s[0].x,s[0].y); s.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
    ctx.strokeStyle='rgba(200,200,205,.18)'; ctx.lineWidth=edgeW; ctx.stroke();

    // 5. Center line markings — dashed white (main road only)
    if (isMain) {
      ctx.beginPath(); ctx.moveTo(s[0].x,s[0].y); s.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
      ctx.strokeStyle='rgba(220,220,225,.22)'; ctx.lineWidth=Math.max(.8,1.2*cam.z);
      ctx.setLineDash([9*cam.z,11*cam.z]); ctx.stroke(); ctx.setLineDash([]);
    } else {
      // Pedestrian walkway — subtle edge marks only
      ctx.beginPath(); ctx.moveTo(s[0].x,s[0].y); s.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
      ctx.strokeStyle='rgba(180,180,185,.10)'; ctx.lineWidth=Math.max(.5,.9*cam.z); ctx.stroke();
    }
  });
}

/* ── Route ── */
function rRoute() {
  if(!route||route.length<2) return;
  const pts=route.map(id=>{const b=BLDGS[id];return b?[b.x+b.w/2,b.y+b.h/2]:null;}).filter(Boolean);
  if(pts.length<2) return;
  const s=pts.map(([x,y])=>W2S(x,y));

  // Outer glow
  ctx.save();
  ctx.shadowColor='#00c8f0'; ctx.shadowBlur=28;
  ctx.beginPath(); ctx.moveTo(s[0].x,s[0].y); s.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.strokeStyle='rgba(0,180,230,.22)'; ctx.lineWidth=Math.max(18,32*cam.z);
  ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke(); ctx.restore();

  // Mid glow
  ctx.beginPath(); ctx.moveTo(s[0].x,s[0].y); s.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.strokeStyle='rgba(0,200,240,.40)'; ctx.lineWidth=Math.max(8,14*cam.z); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();

  // Core line
  ctx.beginPath(); ctx.moveTo(s[0].x,s[0].y); s.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.strokeStyle='rgba(0,230,255,.85)'; ctx.lineWidth=Math.max(2.5,4*cam.z); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();

  // Moving dashes
  ctx.save(); ctx.globalAlpha=0.5;
  ctx.beginPath(); ctx.moveTo(s[0].x,s[0].y); s.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.strokeStyle='#fff'; ctx.lineWidth=Math.max(1.5,2.5*cam.z);
  ctx.setLineDash([10*cam.z,14*cam.z]); ctx.lineDashOffset=-routeProgress*24*cam.z; ctx.stroke();
  ctx.setLineDash([]); ctx.restore();

  // Nodes
  s.forEach((p,i)=>{
    const isS=i===0, isE=i===s.length-1;
    const r=(isS||isE?10:5)*cam.z;
    if(isS||isE){
      // Outer ring
      ctx.beginPath(); ctx.arc(p.x,p.y,(r+5)*cam.z,0,Math.PI*2);
      ctx.strokeStyle=isS?'rgba(0,232,122,.5)':'rgba(255,100,50,.5)'; ctx.lineWidth=1.5*cam.z; ctx.stroke();
    }
    const dotG=ctx.createRadialGradient(p.x-r*.25,p.y-r*.25,0,p.x,p.y,r);
    const col=isS?['#80ffb0','#00e87a']:isE?['#ffb080','#ff6b35']:['#80f0ff','#00c4e8'];
    dotG.addColorStop(0,col[0]); dotG.addColorStop(1,col[1]);
    ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
    ctx.fillStyle=dotG; ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.5)'; ctx.lineWidth=1.8*cam.z; ctx.stroke();
    if((isS||isE)&&cam.z>0.3){
      ctx.font=`700 ${Math.max(7,9*cam.z)}px Sora`; ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillStyle=isS?'#00e87a':'#ff6b35';
      ctx.fillText(isS?'START':'END',p.x,p.y-r-3*cam.z);
    }
  });
}

/* ── Buildings — realistic solid architecture ── */
function rBuildings() {
  Object.entries(BLDGS).forEach(([id,b])=>{
    const tl=W2S(b.x,b.y), br=W2S(b.x+b.w,b.y+b.h);
    const bW=br.x-tl.x, bH=br.y-tl.y;
    if(bW<=2||bH<=2) return;
    const isHov=hoverBldg===id, isRt=route&&route.includes(id), isSel=selBldg===id;
    const flat=b.floors===0;
    if(!hoverAnim[id]) hoverAnim[id]=0;
    hoverAnim[id]+=((isHov||isSel)?1:-1)*0.12;
    hoverAnim[id]=Math.max(0,Math.min(1,hoverAnim[id]));
    const hg=hoverAnim[id];

    /* ── FOREST ── */
    if(id==='forest'){
      // Base ground
      const fg2=ctx.createLinearGradient(tl.x,tl.y,tl.x,br.y);
      fg2.addColorStop(0,'rgba(10,46,6,.96)'); fg2.addColorStop(1,'rgba(4,18,2,.99)');
      ctx.beginPath(); ctx.roundRect(tl.x,tl.y,bW,bH,10);
      ctx.fillStyle=fg2; ctx.fill();
      ctx.strokeStyle=isHov?'rgba(0,200,80,.6)':'rgba(15,60,10,.5)'; ctx.lineWidth=(isHov?2:1)*cam.z; ctx.stroke();
      // Trees inside forest
      const td=[[.10,.14],[.32,.10],[.60,.14],[.82,.18],[.48,.10],[.20,.36],[.50,.32],[.78,.38],[.08,.58],[.35,.62],[.65,.58],[.88,.52],[.15,.80],[.45,.78],[.72,.82],[.92,.70],[.28,.50],[.92,.30],[.04,.32],[.58,.76]];
      td.forEach(([fx,fy],ti)=>{
        const twx=b.x+fx*b.w, twy=b.y+fy*b.h;
        drawTree(twx,twy,(5.5+((ti*5)%7)),ti+40);
      });
      if(cam.z>0.3){
        ctx.font=`600 ${Math.max(6,8*cam.z)}px Sora`; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle='rgba(80,200,60,.5)'; ctx.fillText('NATURE AREA',tl.x+bW/2,tl.y+bH*.9);
      }
      return;
    }

    /* ── Drop shadow ── */
    ctx.save(); ctx.globalAlpha=0.45;
    ctx.beginPath(); ctx.roundRect(tl.x+6*cam.z,tl.y+7*cam.z,bW,bH,5);
    ctx.fillStyle='rgba(0,0,0,.8)'; ctx.fill(); ctx.restore();

    const glowCol=isSel?'#00e87a':isRt?'#00d4ff':isHov?'#ffd740':'#00aaff';

    if(mode==='3d'&&!flat){
      const dp=Math.max(5,24*cam.z);

      /* Right face — darker brick */
      ctx.beginPath();
      ctx.moveTo(br.x,tl.y); ctx.lineTo(br.x+dp*.5,tl.y-dp*.6);
      ctx.lineTo(br.x+dp*.5,br.y-dp*.6); ctx.lineTo(br.x,br.y); ctx.closePath();
      const rfG=ctx.createLinearGradient(br.x,tl.y,br.x+dp*.5,tl.y);
      rfG.addColorStop(0,shd(b.color,-80)); rfG.addColorStop(1,shd(b.color,-55));
      ctx.fillStyle=rfG; ctx.fill();

      /* Top face — roof */
      ctx.beginPath();
      ctx.moveTo(tl.x,tl.y); ctx.lineTo(tl.x+dp*.5,tl.y-dp*.6);
      ctx.lineTo(br.x+dp*.5,tl.y-dp*.6); ctx.lineTo(br.x,tl.y); ctx.closePath();
      const topG=ctx.createLinearGradient(tl.x,tl.y-dp*.6,br.x,tl.y-dp*.6);
      topG.addColorStop(0,shd(b.color,70)); topG.addColorStop(.5,shd(b.color,55)); topG.addColorStop(1,shd(b.color,45));
      ctx.fillStyle=topG; ctx.fill();
      // Roof border/ledge
      ctx.strokeStyle=shd(b.color,80); ctx.lineWidth=.8*cam.z;
      ctx.beginPath();
      ctx.moveTo(tl.x,tl.y); ctx.lineTo(tl.x+dp*.5,tl.y-dp*.6);
      ctx.lineTo(br.x+dp*.5,tl.y-dp*.6); ctx.lineTo(br.x,tl.y); ctx.stroke();

      /* Front face — main wall with realistic gradient */
      const fg=ctx.createLinearGradient(tl.x,tl.y,tl.x+bW*.3,br.y);
      fg.addColorStop(0,shd(b.color,40)); fg.addColorStop(.3,shd(b.color,18));
      fg.addColorStop(.7,b.color); fg.addColorStop(1,shd(b.color,-20));
      ctx.beginPath(); ctx.roundRect(tl.x,tl.y,bW,bH,4);
      ctx.fillStyle=fg; ctx.fill();

      /* Horizontal floor lines */
      if(b.floors>1&&cam.z>0.3){
        for(let f=1;f<b.floors;f++){
          const fy=tl.y+(bH/b.floors)*f;
          ctx.beginPath(); ctx.moveTo(tl.x+1,fy); ctx.lineTo(br.x-1,fy);
          ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=Math.max(.8,1.2*cam.z); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(tl.x+1,fy+.8*cam.z); ctx.lineTo(br.x-1,fy+.8*cam.z);
          ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.lineWidth=Math.max(.4,.7*cam.z); ctx.stroke();
        }
      }

      /* Vertical column lines */
      if(cam.z>0.28){
        const cols=Math.max(2,Math.floor(bW/(30*cam.z)));
        for(let c=1;c<cols;c++){
          const cx2=tl.x+c*(bW/cols);
          ctx.beginPath(); ctx.moveTo(cx2,tl.y+2); ctx.lineTo(cx2,br.y-2);
          ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=Math.max(.6,1*cam.z); ctx.stroke();
        }
      }

      /* Windows — realistic grid */
      if(cam.z>0.26){
        const wRows=b.floors, wCols=Math.max(1,Math.floor(bW/(18*cam.z)));
        const wH=Math.min(12,(bH/wRows)*.55)*cam.z, wW=Math.min(10,bW/(wCols+1)*.7)*cam.z;
        const rowH=bH/wRows;
        for(let r=0;r<wRows;r++){
          const wy2=tl.y+r*rowH*cam.z/cam.z + rowH*.22*cam.z;
          // correct for scale
          const wyS=tl.y+(r*rowH+rowH*.22);
          for(let c=0;c<wCols;c++){
            const wxS=tl.x+(c+1)*(bW/(wCols+1));
            const lit=((r*7+c*3+Math.floor(frame/120)+hashId(id))%5!==0);
            const wg=ctx.createLinearGradient(wxS,wyS,wxS+wW,wyS+wH);
            if(lit){
              wg.addColorStop(0,'rgba(255,248,200,.78)'); wg.addColorStop(.4,'rgba(255,235,140,.65)'); wg.addColorStop(1,'rgba(200,160,60,.45)');
            } else {
              wg.addColorStop(0,'rgba(15,45,90,.55)'); wg.addColorStop(1,'rgba(8,25,55,.4)');
            }
            ctx.beginPath(); ctx.roundRect(wxS-wW/2,wyS,wW,wH,1.5);
            ctx.fillStyle=wg; ctx.fill();
            // Window frame
            ctx.strokeStyle=lit?'rgba(180,140,60,.4)':'rgba(40,70,120,.4)'; ctx.lineWidth=.7*cam.z; ctx.stroke();
            // Reflection streak
            if(lit&&cam.z>0.4){
              ctx.save(); ctx.globalAlpha=0.18;
              ctx.beginPath(); ctx.moveTo(wxS-wW/2+wW*.2,wyS); ctx.lineTo(wxS-wW/2+wW*.4,wyS+wH);
              ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=wW*.15; ctx.stroke(); ctx.restore();
            }
          }
        }
      }

      /* Entrance: Frontline Room marker */
      if(id==='entrance'&&cam.z>0.35){
        ctx.save(); ctx.globalAlpha=0.55;
        ctx.beginPath(); ctx.roundRect(tl.x+3*cam.z,tl.y+bH*.12,bW-6*cam.z,bH*.2,3);
        ctx.fillStyle='rgba(0,180,230,.3)'; ctx.fill();
        ctx.strokeStyle='rgba(0,200,255,.5)'; ctx.lineWidth=.8*cam.z; ctx.stroke();
        ctx.restore();
        if(cam.z>0.45){
          ctx.font=`600 ${Math.max(5,7*cam.z)}px Sora`; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillStyle='rgba(0,220,255,.8)'; ctx.fillText('FRONTLINE ROOM',tl.x+bW/2,tl.y+bH*.225);
        }
      }

      /* Outline / glow */
      if(hg>0||isRt){
        ctx.shadowColor=glowCol; ctx.shadowBlur=(isRt?20:12)*Math.max(hg,.4)+(isRt?Math.sin(frame*.08)*4:0);
      }
      ctx.strokeStyle=hg>.04||isRt?glowCol:shd(b.color,55);
      ctx.lineWidth=(hg>.04||isRt?2.2:1.2)*cam.z; ctx.stroke(); ctx.shadowBlur=0;

      // Parking lot lines
      if(id==='parking'){
        const n=Math.max(2,Math.floor(bW/(22*cam.z)));
        for(let i=1;i<n;i++){
          ctx.beginPath(); ctx.moveTo(tl.x+i*(bW/n),tl.y+5*cam.z); ctx.lineTo(tl.x+i*(bW/n),br.y-5*cam.z);
          ctx.strokeStyle='rgba(80,140,200,.28)'; ctx.lineWidth=cam.z; ctx.stroke();
        }
      }

    } else {
      /* 2D flat mode */
      const fg=ctx.createLinearGradient(tl.x,tl.y,tl.x,br.y);
      fg.addColorStop(0,shd(b.color,30)); fg.addColorStop(1,b.color);
      ctx.beginPath(); ctx.roundRect(tl.x,tl.y,bW,bH,5); ctx.fillStyle=fg; ctx.fill();
      if(hg>0||isRt){ctx.shadowColor=glowCol;ctx.shadowBlur=(isRt?18:10)*Math.max(hg,.35);}
      ctx.strokeStyle=hg>.04||isRt?glowCol:shd(b.color,42);
      ctx.lineWidth=(hg>.04||isRt?2:1)*cam.z; ctx.stroke(); ctx.shadowBlur=0;
    }

    // Court markings
    if(id==='court'){
      const ccx=(tl.x+br.x)/2, ccy=(tl.y+br.y)/2, cr=Math.min(bW,bH)*.28;
      ctx.beginPath(); ctx.arc(ccx,ccy,cr,0,Math.PI*2); ctx.strokeStyle='rgba(140,210,70,.22)'; ctx.lineWidth=2*cam.z; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ccx,tl.y+4*cam.z); ctx.lineTo(ccx,br.y-4*cam.z); ctx.strokeStyle='rgba(140,210,70,.16)'; ctx.lineWidth=cam.z; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tl.x+4*cam.z,ccy); ctx.lineTo(br.x-4*cam.z,ccy); ctx.strokeStyle='rgba(140,210,70,.12)'; ctx.lineWidth=cam.z; ctx.stroke();
      [[ccx,tl.y+8*cam.z],[ccx,br.y-8*cam.z]].forEach(([hx,hy])=>{ctx.beginPath();ctx.arc(hx,hy,cr*.16,Math.PI,Math.PI*2);ctx.strokeStyle='rgba(140,210,70,.18)';ctx.lineWidth=1.2*cam.z;ctx.stroke();});
    }

    // Route / selected highlight overlay
    if(isRt){
      ctx.beginPath(); ctx.roundRect(tl.x,tl.y,bW,bH,5);
      ctx.fillStyle=`rgba(0,210,255,${.08+Math.sin(frame*.09)*.04})`; ctx.fill();
    }
    if(isSel){ctx.beginPath();ctx.roundRect(tl.x,tl.y,bW,bH,5);ctx.fillStyle='rgba(0,232,122,.07)';ctx.fill();}
  });
}

function hashId(id){let h=0;for(const c of id)h+=c.charCodeAt(0);return h;}

/* ── Labels ── */
function rLabels() {
  Object.entries(BLDGS).forEach(([id,b])=>{
    if(id==='forest') return;
    const tl=W2S(b.x,b.y), br=W2S(b.x+b.w,b.y+b.h);
    const bW=br.x-tl.x, bH=br.y-tl.y;
    if(bW<12||bH<7) return;
    const flat=b.floors===0, dp=(mode==='3d'&&!flat)?24*cam.z:0;
    const ccx=tl.x+bW/2, ccy=tl.y-dp+bH/2;
    const fs=Math.max(7,Math.min(13,10*cam.z));
    const lines=b.label.split('\n'), lh=fs*1.35;
    ctx.font=`700 ${fs}px Sora`; ctx.textAlign='center'; ctx.textBaseline='middle';
    // Shadow
    ctx.fillStyle='rgba(0,0,0,.65)'; lines.forEach((ln,i)=>ctx.fillText(ln,ccx+1,ccy+1+(i-(lines.length-1)/2)*lh));
    ctx.fillStyle='rgba(255,255,255,.97)'; lines.forEach((ln,i)=>ctx.fillText(ln,ccx,ccy+(i-(lines.length-1)/2)*lh));
    if(cam.z>0.36&&bW>20*cam.z){
      ctx.font=`${Math.max(10,16*cam.z)}px sans-serif`;
      ctx.fillText(b.icon,ccx,ccy-lh*lines.length*.68-4*cam.z);
    }
  });
}

/* ── Minimap — light theme ── */
function rMinimap() {
  if(!mctx) return;
  const dpr = devicePixelRatio;
  mctx.clearRect(0,0,MM_W*dpr,MM_H*dpr);
  mctx.save(); mctx.scale(dpr,dpr);

  // Background
  const bg = mctx.createLinearGradient(0,0,MM_W,MM_H);
  bg.addColorStop(0,'#f0f7ff'); bg.addColorStop(1,'#daeaf8');
  mctx.fillStyle=bg; mctx.fillRect(0,0,MM_W,MM_H);
  mctx.strokeStyle='rgba(100,160,220,.35)'; mctx.lineWidth=1; mctx.strokeRect(0,0,MM_W,MM_H);

  // Ground
  const gtl=W2M(-200,30), gbr=W2M(1700,590);
  mctx.fillStyle='rgba(185,220,175,.75)'; mctx.fillRect(gtl.x,gtl.y,gbr.x-gtl.x,gbr.y-gtl.y);

  // River
  const rtl=W2M(1260,0), rbr=W2M(1760,265);
  mctx.fillStyle='rgba(140,195,245,.75)'; mctx.fillRect(rtl.x,rtl.y,rbr.x-rtl.x,rbr.y-rtl.y);

  // Walkways
  PATHS.forEach(pts=>{
    if(pts.length<2) return;
    const s=pts.map(([x,y])=>W2M(x,y));
    mctx.beginPath(); mctx.moveTo(s[0].x,s[0].y); s.slice(1).forEach(p=>mctx.lineTo(p.x,p.y));
    mctx.strokeStyle='rgba(80,80,90,.45)'; mctx.lineWidth=1.4; mctx.lineCap='round'; mctx.stroke();
  });

  // Buildings
  Object.entries(BLDGS).forEach(([id,b])=>{
    const p=W2M(b.x,b.y), p2=W2M(b.x+b.w,b.y+b.h);
    const w=p2.x-p.x, h=p2.y-p.y;
    if(w<1||h<1) return;
    const isRt=route&&route.includes(id), isSel=selBldg===id;
    mctx.fillStyle=id==='forest'?'rgba(100,180,90,.8)':b.color+'dd';
    mctx.beginPath(); mctx.roundRect(p.x,p.y,w,h,1); mctx.fill();
    mctx.strokeStyle=isSel?'#0a9e5c':isRt?'#1a6fcf':'rgba(255,255,255,.4)';
    mctx.lineWidth=isSel||isRt?1.5:.5; mctx.stroke();
  });

  // You're Here dot on minimap
  const eb = BLDGS['entrance'];
  if(eb){
    const ep=W2M(eb.x+eb.w/2, eb.y+eb.h/2);
    mctx.beginPath(); mctx.arc(ep.x,ep.y,3.5,0,Math.PI*2);
    mctx.fillStyle='#1a6fcf'; mctx.fill();
    mctx.strokeStyle='#fff'; mctx.lineWidth=1; mctx.stroke();
  }

  // Route
  if(route&&route.length>1){
    const rpts=route.map(id=>{const b=BLDGS[id];return b?W2M(b.x+b.w/2,b.y+b.h/2):null;}).filter(Boolean);
    mctx.beginPath(); mctx.moveTo(rpts[0].x,rpts[0].y); rpts.slice(1).forEach(p=>mctx.lineTo(p.x,p.y));
    mctx.strokeStyle='rgba(26,111,207,.85)'; mctx.lineWidth=2; mctx.lineCap='round'; mctx.stroke();
    mctx.beginPath(); mctx.arc(rpts[0].x,rpts[0].y,3,0,Math.PI*2);
    mctx.fillStyle='#0a9e5c'; mctx.fill();
    const last=rpts[rpts.length-1];
    mctx.beginPath(); mctx.arc(last.x,last.y,3,0,Math.PI*2);
    mctx.fillStyle='#e05a1e'; mctx.fill();
  }

  // Viewport rect
  const vpW=cv.width/devicePixelRatio, vpH=cv.height/devicePixelRatio;
  const vtl=S2W(0,0), vbr=S2W(vpW,vpH);
  const vp1=W2M(vtl.x,vtl.y), vp2=W2M(vbr.x,vbr.y);
  mctx.fillStyle='rgba(26,111,207,.07)'; mctx.fillRect(vp1.x,vp1.y,vp2.x-vp1.x,vp2.y-vp1.y);
  mctx.strokeStyle='rgba(26,111,207,.5)'; mctx.lineWidth=1; mctx.strokeRect(vp1.x,vp1.y,vp2.x-vp1.x,vp2.y-vp1.y);

  mctx.font='500 8px Sora'; mctx.textAlign='left'; mctx.textBaseline='top';
  mctx.fillStyle='rgba(26,111,207,.6)'; mctx.fillText('CAMPUS MAP',4,3);
  mctx.restore();
}

function shd(hex,a){
  const n=parseInt(hex.replace('#',''),16);
  return`rgb(${Math.min(255,Math.max(0,(n>>16)+a))},${Math.min(255,Math.max(0,((n>>8)&255)+a))},${Math.min(255,Math.max(0,(n&255)+a))})`;
}
function loop(){ render(); requestAnimationFrame(loop); }

/* ══════════════════════════════════════════
   INPUT
══════════════════════════════════════════ */
cv.addEventListener('mousedown',e=>{drag=true;lx=e.clientX;ly=e.clientY;});
cv.addEventListener('mousemove',e=>{
  if(drag){cam.x+=e.clientX-lx;cam.y+=e.clientY-ly;lx=e.clientX;ly=e.clientY;}
  else checkHover(e);
});
cv.addEventListener('mouseup',e=>{
  if(drag&&Math.abs(e.clientX-lx)<4&&Math.abs(e.clientY-ly)<4) handleClick(e.clientX,e.clientY);
  drag=false;
});
cv.addEventListener('mouseleave',()=>{drag=false;hideTip();hoverBldg=null;});
cv.addEventListener('wheel',e=>{
  e.preventDefault();
  const prev=cam.z;
  cam.z=Math.min(3.2,Math.max(0.14,cam.z*(e.deltaY>0?.87:1.14)));
  const r=cv.getBoundingClientRect();
  const mx=e.clientX-r.left, my=e.clientY-r.top;
  cam.x=mx-(mx-cam.x)*(cam.z/prev); cam.y=my-(my-cam.y)*(cam.z/prev);
},{passive:false});
cv.addEventListener('touchstart',e=>{if(e.touches.length===2)pinchD=dist2(e.touches);else{drag=true;lx=e.touches[0].clientX;ly=e.touches[0].clientY;}},{passive:true});
cv.addEventListener('touchmove',e=>{
  if(e.touches.length===2){const d=dist2(e.touches);cam.z=Math.min(3.2,Math.max(0.14,cam.z*d/pinchD));pinchD=d;}
  else if(drag){cam.x+=e.touches[0].clientX-lx;cam.y+=e.touches[0].clientY-ly;lx=e.touches[0].clientX;ly=e.touches[0].clientY;}
  e.preventDefault();
},{passive:false});
cv.addEventListener('touchend',()=>{drag=false;});

// Minimap click to pan
if(mm){
  mm.addEventListener('click',e=>{
    const r=mm.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(MM_W/r.width), my=(e.clientY-r.top)*(MM_H/r.height);
    const wx=WB.x1+(mx/MM_W)*(WB.x2-WB.x1), wy=WB.y1+(my/MM_H)*(WB.y2-WB.y1);
    const vpW=cv.width/devicePixelRatio, vpH=cv.height/devicePixelRatio;
    cam.x=vpW/2-(wx-780)*cam.z; cam.y=vpH/2-(wy-320)*cam.z;
  });
}

function dist2(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);}
function hitTest(sx,sy){
  const w=S2W(sx,sy);
  for(const id of Object.keys(BLDGS)){
    const b=BLDGS[id], dp=(mode==='3d'&&b.floors>0)?24:0;
    if(w.x>=b.x&&w.x<=b.x+b.w&&w.y>=b.y-dp&&w.y<=b.y+b.h) return id;
  }
  return null;
}
function checkHover(e){
  const r=cv.getBoundingClientRect(), id=hitTest(e.clientX-r.left,e.clientY-r.top);
  hoverBldg=id;
  if(id){cv.style.cursor='pointer';showTip(id,e.clientX,e.clientY);}
  else{cv.style.cursor=drag?'grabbing':'grab';hideTip();}
}
function handleClick(cx2,cy2){
  const r=cv.getBoundingClientRect(), id=hitTest(cx2-r.left,cy2-r.top);
  if(!id){closeRoomPop();return;}
  selBldg=id; document.getElementById('toSel').value=id;
  showRoomPop(id); showToast(`${BLDGS[id].icon} ${BLDGS[id].label.replace('\n',' ')}`);
}
function showTip(id,mx,my){
  const b=BLDGS[id];
  document.getElementById('tipDot').style.background=b.color;
  document.getElementById('tipName').textContent=b.label.replace('\n',' / ');
  document.getElementById('tipDesc').textContent=b.desc;
  const tc=document.getElementById('tipCat');
  tc.textContent=b.cat; tc.style.background=b.color+'28'; tc.style.color=b.color;
  const tip=document.getElementById('tip');
  const area=document.getElementById('mapWrap').getBoundingClientRect();
  let tx=mx-area.left+14, ty=my-area.top-14;
  if(tx+225>area.width) tx-=240; if(ty+115>area.height) ty-=115;
  tip.style.left=tx+'px'; tip.style.top=ty+'px'; tip.classList.add('show');
}
function hideTip(){document.getElementById('tip').classList.remove('show');}
function showRoomPop(id){
  const b=BLDGS[id], rm=ROOMS[id];
  document.getElementById('rpCat').textContent=b.cat.toUpperCase()+' · '+b.icon;
  document.getElementById('rpName').textContent=b.label.replace('\n',' ');
  document.getElementById('rpDesc').textContent=b.desc;
  const grid=document.getElementById('rpGrid'); grid.innerHTML='';
  if(rm){Object.entries(rm).forEach(([fl,rooms])=>{
    const fd=document.createElement('div'); fd.className='rp-floor'; fd.textContent=fl; grid.appendChild(fd);
    rooms.forEach(r=>{
      const btn=document.createElement('div'); btn.className='rp-room'; btn.textContent=r; btn.style.background=b.color+'18';
      btn.onclick=()=>{document.querySelectorAll('.rp-room').forEach(x=>x.classList.remove('sel'));btn.classList.add('sel');showToast('📍 '+r+' — '+b.label.replace('\n',' '));};
      grid.appendChild(btn);
    });
  });}else grid.innerHTML='<div style="font-size:10px;color:var(--dim)">No rooms listed.</div>';
  document.getElementById('roomPop').classList.add('show');
}
function closeRoomPop(){document.getElementById('roomPop').classList.remove('show');selBldg=null;}

/* ══ DIJKSTRA ══ */
function dijkstra(graph,start,end){
  const dist={},prev={},all=new Set([...Object.keys(graph),start,end]);
  all.forEach(n=>dist[n]=Infinity); dist[start]=0;
  const uv=new Set(all);
  while(uv.size){
    let u=null; for(const n of uv)if(u===null||dist[n]<dist[u])u=n;
    if(!u||dist[u]===Infinity||u===end)break; uv.delete(u);
    for(const[v,w]of Object.entries(graph[u]||{})){const alt=dist[u]+w;if(alt<(dist[v]??Infinity)){dist[v]=alt;prev[v]=u;}}
  }
  const path=[]; let c=end; while(c){path.unshift(c);c=prev[c];}
  return path[0]===start?{path,dist:dist[end]}:null;
}
function findRoute(){
  const from=document.getElementById('fromSel').value||'entrance';
  const to=document.getElementById('toSel').value;
  if(!to){showToast('⚠ Please select a destination');return;}
  const fn=ROOM_MAP[from]||from, tn=ROOM_MAP[to]||to;
  if(fn===tn){showToast('⚠ Already at that building!');return;}
  const res=dijkstra(GRAPH,fn,tn);
  if(!res){showToast('⚠ No route found');return;}
  route=res.path; routeProgress=0; closeRoomPop();
  const names=res.path.map(id=>BLDGS[id]?.label.replace('\n',' ')||id);
  const m=Math.round(res.dist*55), s=Math.round(m/1.2);
  routeMeta={m,s,names};
  document.getElementById('routeCard').classList.add('vis');
  document.getElementById('rcPath').textContent=names.join(' → ');
  const steps=document.getElementById('rcSteps'); steps.innerHTML='';
  for(let i=0;i<res.path.length-1;i++){
    const d=document.createElement('div'); d.className='rc-step';
    d.textContent=`${BLDGS[res.path[i]]?.label.replace('\n',' ')} → ${BLDGS[res.path[i+1]]?.label.replace('\n',' ')}`;
    steps.appendChild(d);
  }
  const tstr=s<60?s+'s walk':Math.ceil(s/60)+' min walk';
  document.getElementById('rcDist').textContent=m+'m'; document.getElementById('rcTime').textContent=tstr;
  document.querySelectorAll('.loc-item').forEach(el=>el.classList.toggle('active',route.includes(el.dataset.id)));
  syncRouteOverlay(); showToast(`🧭 ${m}m · ${tstr}`);
}
function syncRouteOverlay(){
  const ov=document.getElementById('routeOverlay');
  if(route&&!panelOpen){
    document.getElementById('roPath').textContent=routeMeta.names.join(' → ');
    document.getElementById('roDist').textContent=routeMeta.m+'m';
    document.getElementById('roTime').textContent=routeMeta.s<60?routeMeta.s+'s walk':Math.ceil(routeMeta.s/60)+' min walk';
    ov.classList.add('vis');
  } else ov.classList.remove('vis');
}
function clearRoute(){
  route=null;selBldg=null;routeMeta={m:0,s:0,names:[]};routeProgress=0;
  document.getElementById('routeCard').classList.remove('vis'); document.getElementById('routeOverlay').classList.remove('vis');
  document.getElementById('fromSel').value=''; document.getElementById('toSel').value='';
  document.querySelectorAll('.loc-item').forEach(el=>el.classList.remove('active')); closeRoomPop();
}
function zoomIn(){cam.z=Math.min(3.2,cam.z*1.18);}
function zoomOut(){cam.z=Math.max(0.14,cam.z/1.18);}
function resetView(){const w=document.getElementById('mapWrap');cam.x=w.clientWidth/2;cam.y=w.clientHeight/2;cam.z=0.50;}
function setMode(m){mode=m;document.getElementById('btn3d').classList.toggle('on',m==='3d');document.getElementById('btn2d').classList.toggle('on',m==='2d');}
function showToast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}
function buildList(){
  const el=document.getElementById('locList');
  Object.entries(BLDGS).forEach(([id,b])=>{
    const div=document.createElement('div');div.className='loc-item';div.dataset.id=id;
    div.innerHTML=`<div class="loc-dot" style="background:${b.color}"></div><div class="loc-name">${b.icon} ${b.label.replace('\n',' ')}</div><div class="loc-cat">${b.cat}</div>`;
    div.onclick=()=>{selBldg=id;document.getElementById('toSel').value=id;showRoomPop(id);document.querySelectorAll('.loc-item').forEach(x=>x.classList.remove('active'));div.classList.add('active');showToast(b.icon+' '+b.label.replace('\n',' '));};
    el.appendChild(div);
  });
}
const sInput=document.getElementById('searchInput'),sDrop=document.getElementById('searchDrop'),sClr=document.getElementById('searchClr');
sInput.addEventListener('input',()=>{
  const q=sInput.value.toLowerCase().trim();
  sClr.classList.toggle('vis',q.length>0);
  if(!q){sDrop.classList.remove('open');return;}
  const res=[];
  Object.entries(BLDGS).forEach(([id,b])=>{if(b.label.toLowerCase().includes(q)||b.cat.toLowerCase().includes(q)||b.desc.toLowerCase().includes(q))res.push({id,b});});
  Object.entries(ROOMS).forEach(([bid,rm])=>{Object.entries(rm).forEach(([fl,rooms])=>{rooms.forEach(r=>{if(r.toLowerCase().includes(q))res.push({id:bid,b:BLDGS[bid],rm:r,fl});});});});
  sDrop.innerHTML=res.length?res.slice(0,9).map(({id,b,rm,fl})=>`<div class="sd-row" onclick="pickSearch('${id}','${(rm||'').replace(/'/g,"\\'")}')"><div class="sd-ic" style="background:${b.color}22">${b.icon}</div><div class="sd-info"><div class="sd-name">${rm||b.label.replace('\n',' ')}</div><div class="sd-sub">${rm?(b.label.replace('\n',' ')+' · '+fl):b.desc.substring(0,55)}</div></div><div class="sd-tag">${b.cat}</div></div>`).join(''):'<div class="sd-empty">No results found</div>';
  sDrop.classList.add('open');
});
sClr.addEventListener('click',()=>{sInput.value='';sClr.classList.remove('vis');sDrop.classList.remove('open');});
document.addEventListener('click',e=>{if(!document.getElementById('searchWrap').contains(e.target))sDrop.classList.remove('open');});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();sInput.focus();}if(e.key==='Escape'){sDrop.classList.remove('open');sInput.blur();}});
function pickSearch(id,rm){
  const b=BLDGS[id];sInput.value=rm||b.label.replace('\n',' ');sClr.classList.add('vis');
  sDrop.classList.remove('open');selBldg=id;document.getElementById('toSel').value=id;showRoomPop(id);
  if(rm)setTimeout(()=>{document.querySelectorAll('.rp-room').forEach(el=>{if(el.textContent===rm){el.classList.add('sel');el.scrollIntoView({block:'nearest'});}});},60);
  showToast(b.icon+' '+(rm||b.label.replace('\n',' ')));
}
resizeCanvas(); buildList(); applyPanel(false); loop();