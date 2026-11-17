'use strict';
/* ---------- motores N20: giro de ruedas, ejes y banda ---------- */
const RPM_MAX=150;
function motRPM(m){const q=MOT[m]; return (q.on&&PW.target>0.5)?q.dir*q.spd:0;}
function refreshMot(){
  ['R','L'].forEach(m=>{const q=MOT[m], r=motRPM(m), v=Math.abs(r)*2*Math.PI/60*7;     // v = ω·r (rueda de 7 mm de radio)
    $('rd-'+m).textContent=(PW.target<0.5&&q.on?'robot apagado · ':'')+(r<0?'↻ adelante ':r>0?'↺ atrás ':'')+Math.abs(r)+' rpm · '+v.toFixed(0)+' mm/s';
    document.querySelectorAll('[data-mm="'+m+'"]').forEach(b=>{const d=+b.dataset.d; b.classList.toggle('on',d===0?!q.on:(q.on&&d===q.dir));});
    $('sp-'+m).value=q.spd; const g=$('gg-'+m); if(g){ g.style.width=Math.min(100,Math.abs(r)/RPM_MAX*100)+'%'; g.classList.toggle('rv',r>0); } });
}
function setMot(m,on,dir,spd){
  const q=MOT[m]; if(on!==undefined)q.on=on; if(dir!==undefined)q.dir=dir; if(spd!==undefined)q.spd=spd;
  if($('m-link').checked){ const o=MOT[m==='R'?'L':'R']; o.on=q.on; o.dir=q.dir; o.spd=q.spd; }
  refreshMot();
}
document.querySelectorAll('[data-mm]').forEach(b=>b.onclick=()=>{const d=+b.dataset.d; d===0?setMot(b.dataset.mm,false):setMot(b.dataset.mm,true,d);});
['R','L'].forEach(m=>$('sp-'+m).oninput=e=>{setMot(m,undefined,undefined,+e.target.value); if(+e.target.value>0&&!MOT[m].on)setMot(m,true);});
/* mando: cruceta + botones de acción + teclado */
function padDrive(f,t){ /* f: 1 avanzar, -1 retroceder, 0 nada · t: -1 izq., 1 der., 0 nada */
  const sp=Math.max(30,Math.max(MOT.R.spd,MOT.L.spd)), set=(r,l,sr,sl)=>{ [['R',r,sr],['L',l,sl]].forEach(([m,d,v])=>{ const q=MOT[m]; q.on=d!==0; if(d){ q.dir=d; q.spd=v; } }); refreshMot(); };
  if(!f&&!t) return set(0,0,0,0);
  if(!f) return t<0?set(-1,1,sp,sp):set(1,-1,sp,sp);
  const d=f>0?-1:1, inn=Math.max(10,Math.round(sp*0.4)); set(d,d,t>0?inn:sp,t<0?inn:sp); }
const PADK={fw:[1,0],bk:[-1,0],tl:[0,-1],tr:[0,1],st:[0,0]}, padHeld=new Set();
function padFromKeys(){ const f=(padHeld.has('fw')?1:0)-(padHeld.has('bk')?1:0), t=(padHeld.has('tr')?1:0)-(padHeld.has('tl')?1:0); padDrive(f,t);
  document.querySelectorAll('#m-pad [data-p]').forEach(b=>{ if(b.dataset.p!=='st') b.classList.toggle('press',padHeld.has(b.dataset.p)); }); }
document.querySelectorAll('#m-pad [data-p]').forEach(b=>{ const p=b.dataset.p;
  if(p==='st'){ b.onclick=()=>{ padHeld.clear(); padFromKeys(); }; return; }
  const dn=e=>{ e.preventDefault(); try{ b.setPointerCapture(e.pointerId); }catch(_){} padHeld.add(p); padFromKeys(); }, up=()=>{ if(!padHeld.has(p)) return; padHeld.delete(p); if($('pad-hold').checked) padFromKeys(); else b.classList.remove('press'); };
  b.addEventListener('pointerdown',dn); b.addEventListener('pointerup',up); b.addEventListener('pointercancel',up); b.addEventListener('lostpointercapture',up);
  b.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); e.stopPropagation(); padHeld.add(p); padFromKeys(); } }); b.addEventListener('keyup',e=>{ if(e.key==='Enter'||e.key===' '){ e.stopPropagation(); up(); } }); });
const padSpeed=k=>{ ['R','L'].forEach(m=>{ MOT[m].spd=Math.max(0,Math.min(RPM_MAX,MOT[m].spd+k)); if(MOT[m].spd===0) MOT[m].on=false; }); refreshMot(); };
$('pad-up').onclick=()=>padSpeed(10); $('pad-dn').onclick=()=>padSpeed(-10);
$('pad-stop').onclick=()=>{ padHeld.clear(); padFromKeys(); };
const padLink=()=>{ const c=$('m-link'); c.checked=!c.checked; c.dispatchEvent(new Event('change',{bubbles:true})); if(c.checked){ const q=MOT.R; MOT.L.on=q.on; MOT.L.dir=q.dir; MOT.L.spd=q.spd; refreshMot(); } syncPad(); };
function syncPad(){ const on=$('m-link').checked, b=$('pad-link'); b.classList.toggle('on',on); b.setAttribute('aria-pressed',String(on)); }
$('pad-link').onclick=padLink; $('m-link').addEventListener('change',syncPad);
const KMAP={w:'fw',arrowup:'fw',s:'bk',arrowdown:'bk',a:'tl',arrowleft:'tl',d:'tr',arrowright:'tr'};
const typing=t=>t&&(t.tagName==='TEXTAREA'||t.tagName==='SELECT'||(t.tagName==='INPUT'&&/text|number|search|color/.test((t.type||'').toLowerCase())));
document.addEventListener('keydown',e=>{ if(e.metaKey||e.ctrlKey||e.altKey||typing(e.target)) return; const k=e.key.toLowerCase(), t=e.target;
  if(/^arrow/.test(k)&&t&&t.tagName==='INPUT'&&t.type==='range') return;
  const ov=document.getElementById('docov'); if(ov&&ov.style.display!=='none'&&ov.style.visibility!=='hidden') return;
  if(KMAP[k]){ e.preventDefault(); if(!padHeld.has(KMAP[k])){ padHeld.add(KMAP[k]); padFromKeys(); } }
  else if(k===' '&&!(t&&(t.tagName==='BUTTON'||t.tagName==='INPUT'))){ e.preventDefault(); padHeld.clear(); padFromKeys(); }
  else if(k==='e') padSpeed(10); else if(k==='q') padSpeed(-10); else if(k==='l') padLink(); });
document.addEventListener('keyup',e=>{ const k=KMAP[e.key.toLowerCase()]; if(!k||!padHeld.has(k)) return; padHeld.delete(k); if($('pad-hold').checked) padFromKeys(); });
addEventListener('blur',()=>{ if(padHeld.size&&$('pad-hold').checked){ padHeld.clear(); padFromKeys(); } });
function stepMotors(dt){
  ['R','L'].forEach(m=>{ const q=MOT[m], w=motRPM(m)*2*Math.PI/60; q.rpm=w; q.d=w*dt; q.ang=(q.ang+q.d)%(2*Math.PI); });
  SPIN.forEach(b=>{ b.grp.rotation.x=MOT[b.o.m].ang*(b.o.mult||1); });
  LUGS.forEach(({lg,m})=>{ if(MOT[m].d) lg.update(lg.phase-lg.Ri*MOT[m].d); });
  BELTS.forEach(({uni,m})=>{ const L=LUGS.find(l=>l.m===m); if(L) uni.uPh.value=L.lg.phase; });
  ['R','L'].forEach(m=>{ const ic=$('ico-'+m); ic.setAttribute('transform','rotate('+(MOT[m].ang*180/Math.PI)+')'); });
}
refreshMot();

