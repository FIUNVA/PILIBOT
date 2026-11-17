'use strict';
/* ---------- estado y apariencia ---------- */
let oledOn=true;
const S={dark:document.documentElement.dataset.theme==='dark',trans:false,anat:false,axis:0,cut:0.5,flip:false,spin:false};
function applyAppearance(){
  const th=S.dark?'dark':'light', P=PAL[th];
  document.documentElement.dataset.theme=th;
  scene.background=new THREE.Color(P.bg);
  paintOrientation(th);
  bodies.forEach((b,k)=>{
    const fm=b.fm, acc=b.o.acc, cp=S.anat?[clipPlane]:[];
    if(acc){
      const c=b.o.cols[th], vcl=!!b.o.vcol&&!S.trans; fm.vertexColors=vcl; fm.color.set(vcl?0xffffff:c[0]); if(vcl){ b.col.set(b.vc0); b.g.attributes.color.needsUpdate=true; }
      const tr=b.o.cols.tr; fm.transparent=S.trans||!!tr; fm.opacity=S.trans?0.35:(tr||1); fm.depthWrite=!(S.trans||tr); fm.needsUpdate=true;
      b.em.color.set(S.trans?P.edge[3]:c[1]);
    } else {
      const ac=b.o.acrylic;               // la tapa de pantalla es acrílico transparente siempre
      fm.vertexColors=S.trans; fm.transparent=S.trans||ac; fm.opacity=S.trans?(S.dark?0.26:0.20):(ac?(S.dark?0.30:0.26):1);
      fm.depthWrite=!(S.trans||ac); fm.color.set(S.trans?0xffffff:P.face[k%8]); fm.needsUpdate=true;
      b.em.color.set(S.trans?P.edge[k%8]:P.ink);
    }
    fm.clippingPlanes=cp; b.em.clippingPlanes=cp;
    b.sb.visible=b.sf.visible=b.cap.visible=S.anat&&b.visible&&!b.modeHide;
    b.capMat.uniforms.uFill.value.set(P.fillCap);
    b.capMat.uniforms.uLine.value.set(S.trans?P.edge[k%8]:P.hatch);
    b.grp.visible=b.visible&&!b.modeHide;
    if(b.labelMesh){const lm=b.labelMesh.material;lm.clippingPlanes=cp;lm.opacity=S.trans?0.35:1;}
    if(b.silk) b.silk.forEach(m=>{ m.material.clippingPlanes=cp; m.material.opacity=S.trans?0.35:1; });
    if(b.paintMesh){const pm=b.paintMesh.material;pm.clippingPlanes=cp;pm.opacity=S.trans?0.6:1;}
  });
  flat.forEach(m=>{m.material.clippingPlanes=S.anat?[clipPlane]:[];m.visible=oledOn;});
  document.querySelectorAll('#legend i').forEach(el=>{const i=+el.dataset.sw;el.style.background='#'+PAL[th].edge[i%8].toString(16).padStart(6,'0');});
  if(window.__ovlHook) window.__ovlHook();
  drawTriad();
}
function updateCut(){
  const ax=S.axis, lo=bbox.min.getComponent(ax), hi=bbox.max.getComponent(ax);
  const c=lo+(hi-lo)*S.cut, n=new THREE.Vector3(); n.setComponent(ax,S.flip?1:-1);
  clipPlane.normal.copy(n); clipPlane.constant=-n.getComponent(ax)*c;
  const dx=size.x*1.5+20, dy=size.y*1.5+20, dz=size.z*1.5+20;
  bodies.forEach(b=>{
    const m=b.cap; m.position.copy(ctr); m.position.setComponent(ax,c);
    m.rotation.set(0,0,0);
    if(ax===0){m.rotation.y=Math.PI/2; m.scale.set(dz,dy,1);}
    else if(ax===1){m.rotation.x=Math.PI/2; m.scale.set(dx,dz,1);}
    else {m.scale.set(dx,dy,1);}
  });
  const rv=[c-ctr.x,c-ctr.y,-(c-ctr.z)][ax]; document.getElementById('cut-val').textContent=['x','z','y'][ax]+' = '+(rv>=0?'+':'−')+Math.abs(rv).toFixed(2)+' mm (desde el centro)';
}

