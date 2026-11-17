'use strict';
/* ---- superposición sobre el modelo (colores por vértice) ---- */
function ovlRefresh(){
  if(!AN.ovl) return;
  bodies.forEach((b,bi)=>{ const c=AN.cols[bi]; if(!c) return; b.col.set(c); b.g.attributes.color.needsUpdate=true;
    const fm=b.fm; fm.vertexColors=true; fm.color.set(0xffffff); fm.transparent=AN.xray; fm.opacity=AN.xray?0.42:1; fm.depthWrite=!AN.xray; fm.needsUpdate=true; b.lines.visible=false; b.mesh.frustumCulled=false; });
  flat.forEach(m=>{m.visible=false;});
}
window.__ovlHook=ovlRefresh;
function ovlOn(mode){
  if(AN.mode&&AN.mode!==mode) ovlOff();
  AN.mode=mode; AN.ovl=true; bodies.forEach((b,bi)=>{ if(!AN.cols[bi]||AN.cols[bi].length!==b.pos.length){ AN.cols[bi]=new Float32Array(b.pos.length); AN.cols[bi].fill(.7); } });
  if(EX.level>0){ EX.playing=false; setLevel(0); }
}
function ovlOff(){
  structRestore(); AN.ovl=false; AN.mode=null;
  bodies.forEach(b=>{ b.lines.visible=true; b.mesh.frustumCulled=true; }); applyAppearance();
}
AN.setX=v=>{ AN.xray=v; $('ae-x').checked=v; $('st-x').checked=v; ovlRefresh(); applyAppearance(); };

