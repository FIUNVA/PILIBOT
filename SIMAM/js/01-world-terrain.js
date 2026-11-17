const G=[['Concreto liso',0,8,1,.3],['Madera barnizada',35,9,.95,.4],['Alfombra',215,16,.8,.1],['Azulejo mojado',190,6,.85,1.4],['Arena',50,22,.6,.2],['Bache / hueco',285,30,.3,.8],['Rampa (+12°)',130,10,.95,.5,12],['Rampa fuerte (+20°)',100,12,.9,.8,20]].map(([n,h,d,k,s,a])=>({n,h,d,k,s,a}));
let GL='52%';const gc=h=>`hsl(${h} ${h?55:0}% ${GL} / .4)`,gs=h=>`hsl(${h} ${h?55:0}% var(--gl) / .45)`;
const P=[['alpha','α pendiente (°)',0,30,.5,0,'E'],['psi','ψ cuesta abajo (°)',0,359,1,180,'E'],['asym','asimetría motores (%)',-15,15,.5,3,'E'],['noise','ruido IMU σ (°)',0,2,.05,.15,'E'],['drift','deriva IMU (°/min)',0,30,.5,0,'E'],['kw','K_ω (°/s por %)',1,5,.1,2.5,'E'],['tau','τ_v (s)',.03,.5,.01,.15,'E'],
['umax','u_max (%)',12,100,1,40,'C'],['umin','u_f suelo (%)',5,30,1,15,'C'],['zd','Z_d (°)',10,90,1,45,'C'],['eps','ε tolerancia (°)',.5,10,.1,2,'C'],['uc','u_c corrección (%)',10,40,1,20,'C'],['eref','e_ref (°)',5,60,1,20,'C'],['stab','stable_ms (ms)',0,500,10,200,'C'],['kp','K_p trayectoria',.1,5,.1,1.2,'C'],['cmax','c_max (%)',1,50,1,15,'C'],['antis','anti-estancamiento',0,1,1,1,'C'],['spd','Velocidad simulada ×',.25,8,.25,1,'S']];
const V={},H={},DEF={},GM={alpha:'E|Pendiente',psi:'E|Pendiente',asym:'E|Motores',kw:'E|Motores',tau:'E|Motores',noise:'E|IMU',drift:'E|IMU',umax:'C|Giro (TURN_YAW)',umin:'C|Giro (TURN_YAW)',zd:'C|Giro (TURN_YAW)',eps:'C|Giro (TURN_YAW)',uc:'C|Giro (TURN_YAW)',eref:'C|Giro (TURN_YAW)',stab:'C|Giro (TURN_YAW)',antis:'C|Giro (TURN_YAW)',kp:'C|Trayectoria lineal',cmax:'C|Trayectoria lineal',spd:'S|Simulación'};
P.forEach(([id,l,mn,mx,st,v,g])=>{V[id]=DEF[id]=v;H[GM[id]]=(H[GM[id]]||'')+`<label><span>${l.replace(/_([^\s()]+)/,'<sub>$1</sub>')}</span><input type=range id=${id} min=${mn} max=${mx} step=${st} value=${v}><output id=o_${id}>${v}</output></label>`});
const grp=k=>Object.keys(H).filter(x=>x[0]==k).map(x=>`<details class=sub ${/Pendiente|Giro/.test(x)?'open':''}><summary>${x.slice(2)} <span class=bd></span></summary>${H[x]}</details>`).join('');
$('#pE').innerHTML='<details class=sub open><summary>Suelo (pincel)</summary><div id=sl></div></details>'+grp('E');$('#pC').innerHTML=grp('C');$('#pS').innerHTML=H['S|Simulación'];$('#sl').append($('#soils'),$('#fill').parentElement);
P.forEach(([id])=>$('#'+id).oninput=e=>{V[id]=+e.target.value;$('#o_'+id).textContent=e.target.value});
const PRE={'Giro de 90°':'TURN_YAW_D 90','Cuadrado':'REPEAT 4\n FWD 1500 30\n TURN_YAW_D 90\nEND','Slalom':'REPEAT 2\n FWD 600 30\n TURN_YAW_D 60\n FWD 600 30\n TURN_YAW_D -60\nEND','Péndulo de giros':'TURN_YAW 90\nWAIT 500\nTURN_YAW -90\nWAIT 500\nTURN_YAW 0','Ida y vuelta':'FWD 1500 30\nTURN_YAW_D 180\nFWD 1500 30\nTURN_YAW_D 180','Rumbo bajo pendiente':'FWD 1800 35\nTURN_YAW_D 15 25\nBACK 1000 30','Triángulo equilátero':'REPEAT 3\n FWD 1200 30\n TURN_YAW_D 120\nEND','Pentágono regular':'REPEAT 5\n FWD 900 30\n TURN_YAW_D 72\nEND','Hexágono regular':'REPEAT 6\n FWD 800 30\n TURN_YAW_D 60\nEND','Pared: empuje de bloque':'FWD 1600 40\nWAIT 300\nBACK 1000 30'};
$('#pre').innerHTML=Object.keys(PRE).map(k=>`<option>${k}</option>`).join('');$('#pre').onchange=()=>$('#src').value=PRE[$('#pre').value];$('#src').value=PRE['Giro de 90°'];
let AR={c:23,r:14,mm:70},WP=805,HP=490,CP=35,br=0,grid=Array(322).fill(0);for(let j=3;j<11;j++){for(let i=16;i<20;i++)grid[j*23+i]=2;for(let i=3;i<7;i++)grid[j*23+i]=3}
$('#soils').innerHTML=G.map((g,i)=>`<button data-i=${i}><span class=sw style="background:${gs(g.h)}"></span>${g.n}</button>`).join('');
const sel=()=>document.querySelectorAll('#soils button').forEach((b,i)=>b.classList.toggle('on',i==br));sel();
$('#soils').onclick=e=>{const b=e.target.closest('button');if(b){br=+b.dataset.i;sel()}};$('#fill').onclick=()=>grid.fill(br);
const W=$('#W'),Pl=$('#Pl'),cw=W.getContext('2d');let LK=1,tool='paint',follow=false,cam={k:1,x:0,y:0},dpr=1,cm=null,TW=12;
{const d=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'lineWidth');Object.defineProperty(cw,'lineWidth',{get(){return d.get.call(cw)},set(v){d.set.call(cw,v*LK)}})}
const wp=e=>{const r=W.getBoundingClientRect();return[(e.clientX-r.left-cam.x)/cam.k,(e.clientY-r.top-cam.y)/cam.k]};
const paint=e=>{const[x,y]=wp(e),i=x/CP|0,j=y/CP|0;if(x>=0&&y>=0&&i<AR.c&&j<AR.r)grid[j*AR.c+i]=br};
const fit=()=>{const w=W.clientWidth,h=W.clientHeight,k=Math.min(w/WP,h/HP)*.9;cam={k,x:(w-WP*k)/2,y:(h-HP*k)/2};follow=false;syncTb()};
const zoom=(f,sx=W.clientWidth/2,sy=W.clientHeight/2)=>{const k=Math.min(14,Math.max(.25,cam.k*f));cam.x=sx-(sx-cam.x)*k/cam.k;cam.y=sy-(sy-cam.y)*k/cam.k;cam.k=k};
const pts=new Map();let pdist=0,panning=false,lp=null;
W.onpointerdown=e=>{W.setPointerCapture(e.pointerId);pts.set(e.pointerId,e);lp=e;panning=tool=='pan'||e.button>0||e.shiftKey;if(pts.size==1&&!panning)act(e,1);if(pts.size==2){const[a,b]=[...pts.values()];pdist=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}};
W.onpointermove=e=>{const r=W.getBoundingClientRect();cm=wp(e);if(!pts.has(e.pointerId))return;pts.set(e.pointerId,e);if(pts.size==2){const[a,b]=[...pts.values()],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);zoom(d/pdist,(a.clientX+b.clientX)/2-r.left,(a.clientY+b.clientY)/2-r.top);pdist=d;return}if(panning){if(!follow){cam.x+=e.clientX-lp.clientX;cam.y+=e.clientY-lp.clientY}}else act(e);lp=e};
W.onpointerup=W.onpointercancel=e=>pts.delete(e.pointerId);W.onpointerleave=()=>cm=null;
W.onwheel=e=>{e.preventDefault();const r=W.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top)};W.ondblclick=fit;W.oncontextmenu=e=>e.preventDefault();
const THEME_KEY = 'fiunva-theme';
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = matchMedia('(prefers-color-scheme:dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
}
$('#th').onclick = () => {
  const r = document.documentElement;
  const next = r.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
};
window.addEventListener('storage', (e) => {
  if (e.key === THEME_KEY && e.newValue) {
    applyTheme(e.newValue);
  }
});
initTheme();
let collided=false,blocks=[],PX=null,R,prog=[],pc=-1,ins=null,K={},running=false,paused=false,mode='REPOSO',cu=[0,0],T=0,n=0,hist=[],trail=[],results=[],PT={kw:1,tau:1,da:0},gOv=-1;
