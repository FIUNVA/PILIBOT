'use strict';
/* ---------- arranque ---------- */
// S.dark is initialized in state.js from document.documentElement.dataset.theme
// which is set by the inline script from URL param or localStorage
$('t-dark').checked=S.dark;
new ResizeObserver(resize).observe(stage); resize();
setView(new THREE.Vector3(...VIEWS.iso[0]));
applyAppearance(); updateCut(); applyExplosion();
function loop(){
  if(S.spin){ const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),0.006);
    offset.applyQuaternion(q); camera.up.applyQuaternion(q); place(); }
  const now=performance.now(), dt=Math.min(0.1,(now-(loop.t||now))/1000); loop.t=now; updateEyes(dt); stepMotors(dt); stepFloor(dt); stepAnalysis(dt); stepLed(dt);
  if(PW.level!==PW.target){ const d_=PW.target-PW.level; PW.level+=Math.sign(d_)*Math.min(Math.abs(d_),dt/0.4); applyExplosion(); }
  if(EX.playing){ let l=EX.level+EX.dir*dt*0.2*EX.speed; if(l>=1){l=1;EX.dir=-1;} else if(l<=0){l=0;EX.dir=1;} setLevel(l); }
  renderer.render(scene,camera); drawTriad(); requestAnimationFrame(loop);
}
loop();
window.__MOT=MOT;window.__setMot=setMot;window.__S=S;window.__INT=INT;window.__EX=EX;window.__setLevel=setLevel;window.__bodies=bodies; window.__setView=setView; window.__THREE=THREE;
