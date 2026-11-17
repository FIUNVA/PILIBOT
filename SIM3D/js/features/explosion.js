'use strict';
/* ---------- vista explosionada ---------- */
const UPV=new THREE.Vector3(0,OLEDUP,0);
const EXV={pcb:NV.clone().multiplyScalar(-14).add(UPV),glass:NV.clone().multiplyScalar(-12).add(UPV),nut:NV.clone().multiplyScalar(-34).add(UPV),
           spacer:NV.clone().multiplyScalar(10).add(UPV),screw:NV.clone().multiplyScalar(62).add(UPV)};
const EXM=[new THREE.Vector3(0,24,0),new THREE.Vector3(22,0,0),new THREE.Vector3(44,0,0),new THREE.Vector3(-22,0,0),
           new THREE.Vector3(-44,0,0),NV.clone().multiplyScalar(34).add(new THREE.Vector3(0,OLEDUP,0)),new THREE.Vector3(0,0,-48),new THREE.Vector3(0,0,48)];
const EX={level:0,playing:false,dir:1,speed:1};
const PW={level:1,target:1}, SWD=2.5, PWR=()=>PW.level>0.5;                              // interruptor: 1 = encendido (palanca 2.5 mm hacia atrás, +z), 0 = apagado
const sstep=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
function applyExplosion(){
  const pk=sstep(0.2,1,EX.level), bk=sstep(0,0.55,EX.level);           // 1.º se desdoblan las bandas, luego salen las piezas
  bodies.forEach((b,k)=>{
    const v=b.o.exv||(b.o.acc?(b.o.ex?EXV[b.o.ex]:null):EXM[k]);
    if(v){ b.grp.position.copy(v).multiplyScalar(pk); if(b.o.piv) b.grp.position.add(b.o.piv); } else if(b.update) b.update(bk);
    if(b.o.sw) b.grp.position.z+=SWD*sstep(0,1,PW.level);
  });
  flat.forEach(m=>{const v=EXV[m.userData.ex]; if(v) m.position.copy(v).multiplyScalar(pk);});
  viewK=1/(1+1.5*EX.level);
  const no=new THREE.Vector3(0,-66*EX.level,0); target.add(no).sub(exOff); exOff.copy(no); place();
}
function setLevel(v,fromUI){
  EX.level=Math.min(1,Math.max(0,v)); if(!fromUI) $('ex-level').value=Math.round(EX.level*1000);
  $('ex-val').textContent=Math.round(EX.level*100)+' %'; applyExplosion();
}
function setPlay(v){EX.playing=v;$('ex-play').textContent=v?'Pausa':'Reproducir';$('ex-play').classList.toggle('on',v);}
$('ex-level').oninput=e=>{setPlay(false);setLevel(e.target.value/1000,true);};
$('ex-play').onclick=()=>{ if(!EX.playing){ if(EX.level>=1) EX.dir=-1; else if(EX.level<=0) EX.dir=1; } setPlay(!EX.playing); };
$('ex-fig').onclick=()=>{ try{ openFig4(); }catch(err){ console.error(err); } };
$('ex-reset').onclick=()=>{setPlay(false);EX.dir=1;setLevel(0);};
$('ex-speed').oninput=e=>{EX.speed=+e.target.value;$('sp-val').textContent='×'+EX.speed.toFixed(2);};

/* relleno del tramo recorrido en todos los controles deslizantes */
(function(){ const fill=r=>{ const mn=+r.min||0, mx=+r.max||100; r.style.setProperty('--p',((+r.value-mn)/(mx-mn)*100)+'%'); };
  const all=()=>document.querySelectorAll('input[type=range]').forEach(fill);
  document.addEventListener('input',e=>{ if(e.target.type==='range') fill(e.target); },true); all(); setInterval(all,700);
  document.addEventListener('click',e=>{ const sp=e.target.closest&&e.target.closest('.row>span'); if(!sp||sp.closest('.sw')) return; const row=sp.parentElement, inp=row.querySelector('.sw input'); if(inp&&e.target!==inp) inp.click(); }); })();
