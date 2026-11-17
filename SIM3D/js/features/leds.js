'use strict';
/* ---------- LED RGB WS2812B: emisión de color y secuencias ---------- */
const LED={on:true,col:[1,.18,.33],br:.8,sp:1,seq:'rainbow',t:0,out:[0,0,0],seed:1};
const hsv=(h,s,v)=>{h=((h%1)+1)%1; const i=Math.floor(h*6), f=h*6-i, p=v*(1-s), q=v*(1-f*s), t=v*(1-(1-f)*s); return [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i%6];};
const mixc=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
const sm=k=>k*k*(3-2*k), rnd=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const LSEQ=[
 ['fixed','Fijo',(t)=>LED.col],
 ['rainbow','Arcoíris',(t)=>hsv(t*.18,1,1)],
 ['sweep','Barrido RGB',(t)=>{const p=t*.7, i=Math.floor(p)%3, k=sm(p-Math.floor(p)), C=[[1,0,0],[0,1,0],[0,0,1]]; return mixc(C[i],C[(i+1)%3],k);}],
 ['xmas','Navidad',(t)=>{const p=t*1.1, i=Math.floor(p), k=sm(Math.min(1,(p-i)*2.2)), a=i%2?[0,.9,.1]:[1,0,0], b=i%2?[1,0,0]:[0,.9,.1]; let c=mixc(b,a,k); if(rnd(Math.floor(t*9))>.86) c=[1,.95,.8]; return c;}],
 ['breath','Respirar',(t)=>{const k=.5+.5*Math.sin(t*2.2-1.57); return LED.col.map(v=>v*(.08+.92*k));}],
 ['beat','Latido',(t)=>{const p=(t*1.1)%1, k=Math.exp(-Math.pow((p-.08)/.05,2))+.7*Math.exp(-Math.pow((p-.3)/.06,2)); return LED.col.map(v=>v*(.06+.94*Math.min(1,k)));}],
 ['police','Policía',(t)=>{const p=(t*2.4)%2, b=p%1; const on=b<.55&&Math.floor(b*10)%2===0; return on?(p<1?[1,0,0]:[0,.2,1]):[0,0,0];}],
 ['fire','Fuego',(t)=>{const n=.55+.45*rnd(Math.floor(t*14))*.7+.25*Math.sin(t*9); return [1*Math.min(1,n),.32*n*n,.02];}],
 ['disco','Disco',(t)=>hsv(rnd(Math.floor(t*4.5)),1,1)],
 ['strobe','Estrobo',(t)=>((t*7)%1<.18)?[1,1,1]:[0,0,0]],
 ['halloween','Halloween',(t)=>{const k=sm(.5+.5*Math.sin(t*1.6)); return mixc([1,.38,0],[.55,0,1],k);}],
 ['aurora','Aurora',(t)=>hsv(.33+.22*Math.sin(t*.6)+.05*Math.sin(t*1.9),.85,.55+.45*Math.pow(Math.sin(t*.9+1),2))]];
const ledHalo=(()=>{ if(!LEDB) return null; const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'), gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.25,'rgba(255,255,255,.55)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),color:0xffffff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  LEDB.g.computeBoundingBox(); const ctr=LEDB.g.boundingBox.getCenter(new THREE.Vector3()); ctr.y+=0.9; sp.position.copy(ctr); sp.renderOrder=40; sp.frustumCulled=false; LEDB.grp.add(sp);
  const pl=new THREE.SpotLight(0xffffff,0,60,Math.PI*0.42,0.8,1.2); pl.position.copy(ctr); const tg=new THREE.Object3D(); tg.position.copy(ctr).add(new THREE.Vector3(0,10,0)); LEDB.grp.add(tg); pl.target=tg; LEDB.grp.add(pl);
  const cp=new THREE.Plane(new THREE.Vector3(0,1,0),0); sp.material.clippingPlanes=[cp]; return {sp,pl,cp}; })();
const RL={on:true,t:0,halos:[]};
function stepRLeds(dt){
  RL.t+=dt;
  RLEDS.forEach((b,n)=>{
    if(!RL.halos[n]){ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'), gr=g.createRadialGradient(32,32,0,32,32,32);
      gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.3,'rgba(255,255,255,.45)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64);
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),color:0xff1a1a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
      b.g.computeBoundingBox(); const ctr=b.g.boundingBox.getCenter(new THREE.Vector3()); ctr.y+=0.6; sp.position.copy(ctr); sp.renderOrder=40; sp.frustumCulled=false; b.grp.add(sp); RL.halos[n]=sp; }
    const blue=b.o.rid==='blue', fm=b.fm, bc=new THREE.Color(b.o.cols[S.dark?'dark':'light'][0]);
    const rlOn=RL.on&&PWR(); let k=rlOn?1:0; if(blue&&rlOn){ const T=RL.t, g=rnd(Math.floor(T*1.7)+3)>.3?1:0.12, w=.5+.5*Math.sin(T*5.3+Math.sin(T*1.3)*2); k=Math.min(1,.08+g*(.35+.65*w)); }
    const em=blue?[.1,.45,1]:[1,.05,.06], hc=blue?[.1,.45,1]:[1,.1,.1];
    fm.emissive.setRGB(em[0]*k,em[1]*k,em[2]*k); fm.color.setRGB(bc.r+(em[0]-bc.r)*.25*k,bc.g+(em[1]-bc.g)*.25*k,bc.b+(em[2]-bc.b)*.25*k);
    RL.halos[n].material.color.setRGB(hc[0]*k,hc[1]*k,hc[2]*k); RL.halos[n].scale.setScalar(blue?(1.2+3.6*k):(1.0+2.4*k)); RL.halos[n].visible=k>.02;
  });
}
function stepLed(dt){ stepRLeds(dt);
  if(!LEDB) return; LED.t+=dt*LED.sp;
  const f=(LSEQ.find(s=>s[0]===LED.seq)||LSEQ[0])[2], c=(LED.on&&PWR())?f(LED.t):[0,0,0], k=(LED.on&&PWR())?LED.br:0, o=[c[0]*k,c[1]*k,c[2]*k]; LED.out=o;
  const lum=Math.max(o[0],o[1],o[2]), fm=LEDB.fm;
  const bc=new THREE.Color(LEDB.o.cols[S.dark?'dark':'light'][0]), kk=Math.min(1,lum*1.2);
  fm.emissive.setRGB(o[0],o[1],o[2]); fm.color.setRGB(bc.r+(o[0]-bc.r)*.55*kk,bc.g+(o[1]-bc.g)*.55*kk,bc.b+(o[2]-bc.b)*.55*kk);
  if(ledHalo){ const wp=new THREE.Vector3(); ledHalo.sp.getWorldPosition(wp); ledHalo.cp.constant=-(wp.y-0.9); ledHalo.sp.material.color.setRGB(o[0],o[1],o[2]); ledHalo.sp.scale.setScalar(2+11*lum); ledHalo.sp.visible=lum>.02;
    ledHalo.pl.color.setRGB(Math.min(1,o[0]/Math.max(lum,.01)),Math.min(1,o[1]/Math.max(lum,.01)),Math.min(1,o[2]/Math.max(lum,.01))); ledHalo.pl.intensity=lum*1.6; }
  const sw=$('led-sw'); if(sw) sw.style.background='rgb('+Math.round(o[0]*255)+','+Math.round(o[1]*255)+','+Math.round(o[2]*255)+')';
}
const hex2c=h=>[parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255];
$('led-seq').innerHTML=LSEQ.map(s=>'<button data-ls="'+s[0]+'">'+s[1]+'</button>').join('');
function refreshLed(){ document.querySelectorAll('[data-ls]').forEach(b=>b.classList.toggle('on',b.dataset.ls===LED.seq)); $('led-bv').textContent=Math.round(LED.br*100)+' %'; $('led-sv').textContent='×'+LED.sp.toFixed(1); $('led-on').checked=LED.on; }
document.querySelectorAll('[data-ls]').forEach(b=>b.onclick=()=>{LED.seq=b.dataset.ls; LED.on=true; refreshLed();});
$('rl-on').onchange=e=>{RL.on=e.target.checked;};
$('led-on').onchange=e=>{LED.on=e.target.checked;};
$('led-col').oninput=e=>{LED.col=hex2c(e.target.value); if(['rainbow','sweep','xmas','police','fire','disco','strobe','halloween','aurora'].includes(LED.seq)) LED.seq='fixed'; LED.on=true; refreshLed();};
$('led-br').oninput=e=>{LED.br=e.target.value/100; refreshLed();};
$('led-sp').oninput=e=>{LED.sp=e.target.value/100; refreshLed();};
refreshLed(); window.__LED=LED;

