'use strict';
/* ---------- escenario: superficie plana (el robot se desplaza según los motores) ---------- */
const FL={on:false,x:0,z:0,th:0,px:0,pz:0,dark:null,dist:0,wx:0,wz:0,v:0,freeze:false};
const TRACK=2*(82.78-60.728), PIV=new THREE.Vector3(60.728,0,7.89), FL_T=100, FL_SZ=3000, YAX=new THREE.Vector3(0,1,0);
function flTex(dark){ const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d');
  g.fillStyle=dark?'#0a111d':'#eef2f8'; g.fillRect(0,0,256,256);
  g.strokeStyle=dark?'#16233a':'#d6deea'; g.lineWidth=1; for(let i=1;i<4;i++){ g.beginPath(); g.moveTo(i*64+.5,0); g.lineTo(i*64+.5,256); g.moveTo(0,i*64+.5); g.lineTo(256,i*64+.5); g.stroke(); }
  g.strokeStyle=dark?'#2b4163':'#aebcd2'; g.lineWidth=2; g.strokeRect(1,1,254,254);
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(FL_SZ/FL_T,FL_SZ/FL_T); t.anisotropy=8; return t; }
const flTx={l:flTex(false),d:flTex(true)};
const flGeo=new THREE.PlaneGeometry(FL_SZ,FL_SZ); flGeo.rotateX(-Math.PI/2);
const flMesh=new THREE.Mesh(flGeo,new THREE.MeshBasicMaterial({map:flTx.l,side:THREE.FrontSide})); flMesh.renderOrder=-5; flMesh.visible=false; flMesh.frustumCulled=false; scene.add(flMesh);
const shCv=document.createElement('canvas'); shCv.width=shCv.height=128; { const g=shCv.getContext('2d'), gr=g.createRadialGradient(64,64,10,64,64,64); gr.addColorStop(0,'rgba(0,0,0,.55)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128); }
const shGeo=new THREE.PlaneGeometry(1,1); shGeo.rotateX(-Math.PI/2);
const shMesh=new THREE.Mesh(shGeo,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shCv),transparent:true,depthWrite:false})); shMesh.scale.set(95,1,110); shMesh.renderOrder=-4; shMesh.visible=false; shMesh.frustumCulled=false; scene.add(shMesh);
function flApply(){
  const th=FL.th, rp=PIV.clone().applyAxisAngle(YAX,th); root.rotation.y=th; root.position.set(FL.x+PIV.x-rp.x,0,FL.z+PIV.z-rp.z);
  const gy=-19.09-(S.wm==='B'?10.6:9.0), cx=PIV.x+FL.x, cz=PIV.z+FL.z;
  flMesh.position.set(Math.round(cx/FL_T)*FL_T,gy,Math.round(cz/FL_T)*FL_T);
  shMesh.position.set(cx,gy+0.15,cz); shMesh.rotation.y=th;
  const hd=((th*180/Math.PI)%360+360)%360;
  $('fl-hud').innerHTML='X '+FL.x.toFixed(0)+' mm · Z '+(-FL.z).toFixed(0)+' mm<br>Rumbo '+hd.toFixed(0)+'° · recorrido '+(FL.dist/10).toFixed(1)+' cm';
}
const CAMI={static:'Estática: la cámara no se mueve; el robot se aleja del encuadre.',follow:'Sigue al robot: el encuadre acompaña su posición; el robot gira en pantalla.',chase:'Persecución: la cámara va detrás del robot y gira con su rumbo.',top:'Cenital: vista desde arriba que sigue al robot.'};
FL.cam='follow'; FL.cx=0; FL.cz=0; FL.cth=0;
function setCam(m){ FL.cam=m; document.querySelectorAll('[data-cam]').forEach(x=>x.classList.toggle('on',x.dataset.cam===m)); $('cam-info').textContent=CAMI[m];
  if(!FL.on) return; setSpin(false);
  if(m==='top'){ FL.cth=FL.th; setView(new THREE.Vector3(0,1,0).multiplyScalar(1),new THREE.Vector3(0,0,-1)); }
  if(m==='chase'){ FL.cth=FL.th; const f=new THREE.Vector3(-Math.sin(FL.th),0,-Math.cos(FL.th)); setView(f.clone().multiplyScalar(-1).multiplyScalar(0.82).add(new THREE.Vector3(0,0.57,0)),new THREE.Vector3(0,1,0)); } }
document.querySelectorAll('[data-cam]').forEach(x=>x.onclick=()=>setCam(x.dataset.cam)); $('cam-info').textContent=CAMI.follow;
function stepFloor(dt){
  if(!FL.on) return;
  if(FL.dark!==S.dark){ FL.dark=S.dark; flMesh.material.map=S.dark?flTx.d:flTx.l; flMesh.material.needsUpdate=true; shMesh.material.opacity=S.dark?0.8:1; }
  const reff=S.wm==='B'?10.6:9.0, vR=-MOT.R.rpm*reff, vL=-MOT.L.rpm*reff, v=FL.freeze?0:(vR+vL)/2, om=FL.freeze?0:(vR-vL)/TRACK, thm=FL.th+om*dt/2;
  FL.v=v; FL.x+=-Math.sin(thm)*v*dt+(FL.wx||0)*dt; FL.z+=-Math.cos(thm)*v*dt+(FL.wz||0)*dt; FL.th+=om*dt; FL.dist+=Math.abs(v)*dt;
  const k=1-Math.exp(-dt*8), fol=FL.cam!=='static';
  if(fol){ const nx=FL.cx+(FL.x-FL.cx)*k, nz=FL.cz+(FL.z-FL.cz)*k; target.x+=nx-FL.cx; target.z+=nz-FL.cz; FL.cx=nx; FL.cz=nz; }
  if(FL.cam==='chase'||FL.cam==='top'){ const nt=FL.cth+(FL.th-FL.cth)*k, d=nt-FL.cth; if(d){ offset.applyAxisAngle(YAX,d); camera.up.applyAxisAngle(YAX,d); } FL.cth=nt; }
  place(); flApply();
}
function flSet(on){
  if(on===FL.on) return; FL.on=on; flMesh.visible=shMesh.visible=on; FL.dark=null;
  if(on){ FL.cx=FL.x; FL.cz=FL.z; FL.cth=FL.th; flApply(); if(FL.cam==='top'||FL.cam==='chase') setCam(FL.cam); }
  else { target.x-=FL.cx; target.z-=FL.cz; offset.applyAxisAngle(YAX,-FL.cth); camera.up.applyAxisAngle(YAX,-FL.cth); FL.x=FL.z=FL.th=FL.cx=FL.cz=FL.cth=FL.dist=0; root.rotation.y=0; root.position.set(0,0,0); place(); $('fl-hud').textContent='Activa el escenario y acciona los motores: el robot avanza y gira sobre el piso.'; }
}
$('fl-on').onchange=e=>flSet(e.target.checked);
$('fl-reset').onclick=()=>{ FL.x=FL.z=FL.th=FL.dist=0; if(FL.on) flApply(); };
window.__FL=FL; window.__flSet=flSet;
/* ====================== ANÁLISIS · AERODINÁMICA Y ESTRUCTURA ====================== */
const AN={vox:null,aero:null,ovl:false,cols:[],xray:false,mode:null,p0:null};
const anFr=m=>{ const q=m.match(/\(([0-9]+)\/([0-9]+)\)/); if(q) return .2+.6*(+q[1]/+q[2]); if(/muestreo/i.test(m)) return .88; if(/reparto/i.test(m)) return .6; if(/Voxeliz/i.test(m)) return .1; if(/Construyendo/.test(m)) return .2; if(/Dominio|Lista|Listo/.test(m)) return 1; const k=(anFr.k=(anFr.k||0)+1); return Math.min(.9,.08+k*.07); };
(function(){ let b=false, t0=0, iv=0; const E=id=>document.getElementById(id); { const d=document.createElement('div'); d.innerHTML='<div id="anload" role="status" aria-live="polite"><h3><span class="spin"></span><span id="an-tt">Preparando análisis</span><span id="an-pc">0 %</span></h3><div id="an-msg">Preparando…</div><div class="bar"><i id="an-bar"></i></div><div class="tm"><span id="an-step">Espera; la vista puede congelarse un momento.</span><span id="an-t" style="white-space:nowrap">0 s</span></div></div>'; document.body.appendChild(d.firstChild); }
  window.anLoad=(m,title,fr)=>{ if(fr!=null){ const f=Math.max(.03,Math.min(1,fr)); E('an-bar').style.transform='scaleX('+f+')'; E('an-pc').textContent=Math.round(f*100)+' %'; } const e=E('anload'); if(!e) return; if(e.parentNode!==document.body) document.body.appendChild(e); if(m) E('an-msg').textContent=m; if(title) E('an-tt').textContent=title; };
  Object.defineProperty(AN,'busy',{get:()=>b,set:v=>{ v=!!v; if(v===b) return; b=v; const e=E('anload'); if(!e) return;
    if(v){ if(e.parentNode!==document.body) document.body.appendChild(e); E('an-bar').style.transform='scaleX(.04)'; E('an-pc').textContent='0 %'; t0=Date.now(); E('an-t').textContent='0 s'; e.classList.add('show'); clearInterval(iv); iv=setInterval(()=>{E('an-t').textContent=((Date.now()-t0)/1000).toFixed(0)+' s';},500); }
    else { e.classList.remove('show'); clearInterval(iv); } },enumerable:true}); })();
const MATD={pet:{E:2100,sy:45,rho:0.9,n:'PETG impreso',br:0},mdf:{E:3500,sy:25,rho:0.75,n:'MDF',br:1},pmma:{E:3000,sy:62,rho:1.18,n:'Acrílico',br:1},fr4:{E:20000,sy:140,rho:1.9,n:'FR4 (PCB)',br:1},
  st:{E:150000,sy:300,rho:7.8,n:'Acero / latón',br:0},rub:{E:15,sy:9,rho:1.1,n:'Goma',br:0},lipo:{E:600,sy:14,rho:2.0,n:'Celda LiPo',br:0},
  mot:{E:70000,sy:150,rho:5.0,n:'Motor / reductor',br:0},cab:{E:3000,sy:20,rho:3.0,n:'Cableado',br:0},smd:{E:40000,sy:110,rho:2.5,n:'Componentes',br:1},
  bri:{E:150,sy:1e9,rho:0,n:'contacto',br:0}};
const MK=Object.keys(MATD), MID=Object.fromEntries(MK.map((k,i)=>[k,i+1]));
function matOf(b,k){
  if(b.o.acrylic) return 'pmma'; if(k>=0&&k<NMAIN) return 'mdf';
  const s=(b.o.name||'')+' '+(b.o.cat||'');
  if(/Banda de goma|O-ring|Relieves|polímero blando/.test(s)) return 'rub';
  if(/LiPo/.test(s)){ if(/cable|JST/.test(s)) return 'cab'; if(/lengüetas|pads/.test(s)) return 'st'; return 'lipo'; }
  if(/Cables de motores|Cable plano|Alambre|soldadura|Caparazón desmontable/.test(s)) return 'cab';
  if(/Motores N20|reductor|Engranaje|Piñón|Eje en D/.test(s)) return 'mot';
  if(/Tornillo|Tuerca|Separador|Balero|pines|Pines|contactos|imán|interruptor · caja/.test(s)) return 'st';
  if(/Ruedas|Bases de motor|Placa de motores|palanca|plásticos/.test(s)) return 'pet';
  if(/placa base|serigraf|pads y barrenos|BMS2S · placa|MPU6050 · placa|placa negra|placa \(azul\)|tarjeta/.test(s)) return 'fr4';
  return 'smd';
}
const tick=()=>new Promise(r=>setTimeout(r,30));
const GY=()=>-19.09-(S.wm==='B'?10.6:9.0);
const sst=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};

