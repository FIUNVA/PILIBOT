'use strict';
/* ---------- cámara tipo trackball (rotación libre) ---------- */
const target=ctr.clone(); let zoom=1, viewK=1; const exOff=new THREE.Vector3();
const offset=new THREE.Vector3();
function setView(dir,up){
  offset.copy(dir).normalize().multiplyScalar(R*3);
  camera.up.copy(up||new THREE.Vector3(0,1,0)); target.copy(ctr).add(exOff); zoom=1; place();
}
// Convención del robot (ejes de CAD): frente = −z, arriba = +y, derecha = +x. Ejes mostrados: X al frente (rojo), Y a la izquierda (verde), Z arriba (azul)
const VIEWS={iso:[[1,0.8,-1.2],[0,1,0]],front:[[0,0,-1],[0,1,0]],back:[[0,0,1],[0,1,0]],
  top:[[0,1,0],[0,0,1]],bottom:[[0,-1,0],[0,0,-1]],right:[[1,0,0],[0,1,0]],left:[[-1,0,0],[0,1,0]]};
function place(){
  camera.position.copy(target).add(offset); camera.lookAt(target);
  camera.up.copy(new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion));
  camera.zoom=zoom*viewK; camera.updateProjectionMatrix();
}
function resize(){
  const w=stage.clientWidth,h=stage.clientHeight; if(!w||!h)return;
  renderer.setSize(w,h,false);
  const a=w/h, hh=R*1.25; camera.left=-hh*a; camera.right=hh*a; camera.top=hh; camera.bottom=-hh;
  camera.updateProjectionMatrix();
}
function rotateBy(dx,dy){
  const k=Math.PI/Math.max(300,stage.clientHeight*0.9);
  const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
  const up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
  offset.applyAxisAngle(up,-dx*k).applyAxisAngle(right,-dy*k);
  camera.up.copy(up.applyAxisAngle(right,-dy*k)); place();
}
function panBy(dx,dy){
  const f=(camera.top-camera.bottom)/(camera.zoom*stage.clientHeight);
  const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
  const up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
  target.addScaledVector(right,-dx*f).addScaledVector(up,dy*f); place();
}
const ptrs=new Map(); let lastD=0;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY,b:e.button,s:e.shiftKey});
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];lastD=Math.hypot(a.x-b.x,a.y-b.y);} S.spin&&setSpin(false);});
canvas.addEventListener('pointermove',e=>{
  const p=ptrs.get(e.pointerId); if(!p)return;
  const dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
  if(ptrs.size===1){ (p.b===2||p.s||e.shiftKey)?panBy(dx,dy):rotateBy(dx,dy); }
  else if(ptrs.size===2){
    const [a,b]=[...ptrs.values()], d=Math.hypot(a.x-b.x,a.y-b.y);
    if(lastD){zoom=Math.min(40,Math.max(0.2,zoom*d/lastD));place();} lastD=d; panBy(dx/2,dy/2);
  }
});
const endP=e=>{ptrs.delete(e.pointerId);lastD=0;};
canvas.addEventListener('pointerup',endP); canvas.addEventListener('pointercancel',endP);
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.min(40,Math.max(0.2,zoom*Math.exp(-e.deltaY*0.0012)));place();},{passive:false});

