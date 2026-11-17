'use strict';
/* ---------- ojos animados de la OLED ---------- */
const MOODS={neutral:{w:24,h:32,li:0,lo:0,lw:0},happy:{w:26,h:30,li:0,lo:0,lw:.5},angry:{w:24,h:30,li:.55,lo:.05,lw:0},
  sad:{w:24,h:30,li:.05,lo:.5,lw:0},surprised:{w:28,h:42,li:0,lo:0,lw:0},sleepy:{w:26,h:30,li:.45,lo:.45,lw:0}};
const grid=document.createElement('canvas'); grid.width=512; grid.height=256; {const g=grid.getContext('2d'); g.strokeStyle='rgba(0,0,0,0.42)'; g.lineWidth=1;
  for(let x=0;x<=512;x+=4){g.beginPath();g.moveTo(x+.5,0);g.lineTo(x+.5,256);g.stroke();} for(let y=0;y<=256;y+=4){g.beginPath();g.moveTo(0,y+.5);g.lineTo(512,y+.5);g.stroke();}}
const E={cur:{...MOODS.neutral},mood:'neutral',lx:0,ly:0,tx:0,ty:0,blink:0,bt:-1,nextBlink:2,nextLook:1.5,nextMood:7,hold:0,auto:true,ptrT:-9,moodHold:0,time:0};
function setMood(m,hold){E.mood=m;E.moodHold=hold||0;document.querySelectorAll('#moods [data-m]').forEach(b=>b.classList.toggle('on',b.dataset.m===m));}
function doBlink(){E.bt=0;}
function drawEyes(){
  const c=sctx; c.setTransform(1,0,0,1,0,0); c.fillStyle='#02060f'; c.fillRect(0,0,512,256);
  if(!PWR()){ c.drawImage(grid,0,0); screenTex.needsUpdate=true; return; }                      // apagado: pantalla en negro
  c.scale(4,4);
  const k=E.cur, bl=E.blink;
  [-1,1].forEach(sg=>{
    const w=k.w, h=Math.max(2,k.h*(1-bl*0.94)), cx=64+sg*24+E.lx, cy=32+E.ly+(k.h-h)*0.0;
    c.save(); c.shadowColor='#6cc8ff'; c.shadowBlur=9; c.fillStyle='#c8ecff';
    const r=3, x=cx-w/2, y=cy-h/2; c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); c.fill(); c.restore();
    c.fillStyle='#02060f';
    if(k.li>0.01||k.lo>0.01){ const yi=y+k.li*h, yo=y+k.lo*h, xi=sg<0?x+w+1:x-1, xo=sg<0?x-1:x+w+1;   // párpado superior (borde interno hacia el centro)
      c.beginPath(); c.moveTo(xo,y-1); c.lineTo(xi,y-1); c.lineTo(xi,yi); c.lineTo(xo,yo); c.closePath(); c.fill(); }
    if(k.lw>0.01){ c.beginPath(); c.ellipse(cx,y+h+3,w*0.62,k.lw*h+3,0,0,Math.PI*2); c.fill(); }   // mejillas (feliz)
  });
  c.setTransform(1,0,0,1,0,0); c.drawImage(grid,0,0);
  screenTex.needsUpdate=true;
}
function updateEyes(dt){
  E.time+=dt;
  const auto=E.auto&&E.time-E.ptrT>2.5;
  if(E.moodHold>0){E.moodHold-=dt;}
  if(auto){
    E.nextLook-=dt; if(E.nextLook<=0){E.tx=(Math.random()*2-1)*11;E.ty=(Math.random()*2-1)*6; if(Math.random()<.4){E.tx=0;E.ty=0;} E.nextLook=1.2+Math.random()*2.6;}
    E.nextMood-=dt; if(E.nextMood<=0&&E.moodHold<=0){const ms=['neutral','neutral','happy','angry','sad','surprised','sleepy'];setMood(ms[Math.floor(Math.random()*ms.length)],0);E.nextMood=4+Math.random()*5;}
  }
  E.nextBlink-=dt; if(E.nextBlink<=0&&E.bt<0){doBlink();E.nextBlink=(E.mood==='sleepy'?1.5:2.2)+Math.random()*3.5;}
  if(E.bt>=0){E.bt+=dt/(E.mood==='sleepy'?0.45:0.2); const t=E.bt; E.blink=t<0.5?t*2:Math.max(0,2-t*2); if(t>=1){E.bt=-1;E.blink=0;}}
  const T=MOODS[E.mood], a=1-Math.exp(-dt*11), kk=E.cur;
  ['w','h','li','lo','lw'].forEach(p=>kk[p]+=(T[p]-kk[p])*a);
  const lookK=1-Math.exp(-dt*9); E.lx+=(E.tx-E.lx)*lookK; E.ly+=(E.ty-E.ly)*lookK;
  if(window.__halo) window.__halo.material.opacity=PWR()?(S.dark?0.55:0.3)*(0.8+0.2*Math.sin(E.time*2.2))*(1-E.blink*0.5):0;
  drawEyes();
}
// seguir cursor
stage.addEventListener('pointermove',e=>{
  if(ptrs.size) return;
  const r=stage.getBoundingClientRect(), nx=((e.clientX-r.left)/r.width-.5)*2, ny=((e.clientY-r.top)/r.height-.5)*2;
  E.tx=Math.max(-1,Math.min(1,nx*1.4))*11; E.ty=Math.max(-1,Math.min(1,ny*1.4))*6; E.ptrT=E.time;
});
let downAt=null;
canvas.addEventListener('pointerdown',e=>{downAt={x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointerup',e=>{ if(downAt&&Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)<4){doBlink();setMood('happy',1.8);E.nextMood=Math.max(E.nextMood,2.5);} downAt=null; });
$('t-auto').onchange=e=>{E.auto=e.target.checked;};
$('t-pwr').onchange=e=>{PW.target=e.target.checked?1:0; if(typeof refreshMot==='function')refreshMot();};
document.querySelectorAll('#moods [data-m]').forEach(b=>b.onclick=()=>{setMood(b.dataset.m,E.auto?5:1e9);E.nextMood=6;});
$('blink').onclick=doBlink;

