'use strict';
/* ---------- visor 3D de los planos ("Ver en 3D") ---------- */
const V3={ov:null,r:null,sc:null,cam:null,grp:null,st:{az:0,el:0,d:100,t:new THREE.Vector3(),r:50},home:null,edges:true,title:null};
function v3Draw(){ if(!V3.r) return; const s=V3.st, c=Math.cos(s.el); V3.cam.position.set(s.t.x+s.d*c*Math.sin(s.az),s.t.y+s.d*Math.sin(s.el),s.t.z+s.d*c*Math.cos(s.az)); V3.cam.up.set(0,1,0); V3.cam.lookAt(s.t); V3.cam.updateMatrixWorld(); V3.r.render(V3.sc,V3.cam); if(V3.tri) triadTo(V3.tri,V3.cam); }
function v3EbSync(){ if(V3.eb) V3.eb.innerHTML='<span style="display:inline-block;width:11px;height:11px;border:1px solid #0b1f3a;margin-right:5px;vertical-align:-1px;text-align:center;line-height:10px;font-size:12px;color:#1d4ed8">'+(V3.edges?'&#10003;':'')+'</span>Aristas'; }
function v3Dir(x,y,z){ const l=Math.hypot(x,y,z); V3.st.az=Math.atan2(x,z); V3.st.el=Math.max(-1.55,Math.min(1.55,Math.asin(y/l))); V3.st.d=V3.st.r/Math.sin(V3.cam.fov*Math.PI/360)*1.12; v3Draw(); }
function v3Build(){
  if(V3.ov) return;
  const ov=document.createElement('div'); ov.id='v3d'; ov.style.cssText='position:fixed;inset:0;z-index:10001;display:none;align-items:center;justify-content:center;background:rgba(6,12,24,.62);font:15px "Latin Modern Roman","CMU Serif",KaTeX_Main,serif';
  const box=document.createElement('div'); box.style.cssText='width:min(1120px,95vw);height:min(760px,91vh);display:flex;flex-direction:column;border:3px double #0b1f3a;background:#f5f8fc;color:#0b1f3a;box-shadow:0 12px 40px rgba(0,0,0,.45)';
  const bar=document.createElement('div'); bar.style.cssText='display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:6px 12px;border-bottom:3px double #0b1f3a;background:#fff';
  const ttl=document.createElement('span'); ttl.style.cssText='flex:1;min-width:200px;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'; bar.appendChild(ttl); V3.title=ttl;
  const mkb=(txt,fn,c)=>{ const b=document.createElement('button'); b.type='button'; b.textContent=txt; b.style.cssText='font:inherit;font-size:14px;border:1px solid '+(c||'#1d4ed8')+';color:'+(c||'#1d4ed8')+';background:transparent;padding:2px 10px;cursor:pointer'; b.onclick=fn; bar.appendChild(b); return b; };
  mkb('Cerrar ✕',()=>v3Close(),'#e05252');
  const wrap=document.createElement('div'); wrap.style.cssText='position:relative;flex:1;min-height:0;background:#f5f8fc';
  const cv=document.createElement('canvas'); cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none'; wrap.appendChild(cv);
  { const pn=document.createElement('div'); pn.style.cssText='position:absolute;left:12px;top:12px;z-index:2;background:rgba(255,255,255,.94);border:1px solid #0b1f3a;box-shadow:3px 3px 0 #c9d6ea;padding:5px 8px 8px;user-select:none';
    const hd=document.createElement('div'); hd.textContent='VISTAS'; hd.style.cssText='font-size:11.5px;letter-spacing:.16em;color:#0b1f3a;border-bottom:1px solid #0b1f3a;margin-bottom:6px;padding-bottom:2px;text-align:center'; pn.appendChild(hd);
    const g=document.createElement('div'); g.style.cssText='display:grid;grid-template-columns:repeat(4,44px);grid-auto-rows:26px;gap:3px'; pn.appendChild(g);
    const cell=(c,rw,txt,tt,v)=>{ const b=document.createElement('button'); b.type='button'; b.textContent=txt; b.title=tt; b.setAttribute('aria-label',tt); b.style.cssText='grid-column:'+c+';grid-row:'+rw+';font:inherit;font-size:12.5px;padding:0;border:1px solid #1d4ed8;color:#1d4ed8;background:#fff;cursor:pointer';
      b.onmouseenter=()=>{ b.style.background='#1d4ed8'; b.style.color='#fff'; }; b.onmouseleave=()=>{ b.style.background='#fff'; b.style.color='#1d4ed8'; }; b.onclick=()=>v3Dir(v[0],v[1],v[2]); g.appendChild(b); };
    cell(2,1,'Sup.','Vista superior',[0,1,0]); cell(4,1,'Iso','Vista isométrica',[1,.8,-1.2]);
    cell(1,2,'Izq.','Vista lateral izquierda',[-1,0,0]); cell(2,2,'Front.','Vista frontal',[0,0,-1]); cell(3,2,'Der.','Vista lateral derecha',[1,0,0]); cell(4,2,'Post.','Vista posterior',[0,0,1]);
    cell(2,3,'Inf.','Vista inferior',[0,-1,0]);
    const eb=document.createElement('button'); eb.type='button'; eb.style.cssText='grid-column:3/5;grid-row:3;font:inherit;font-size:12.5px;padding:0;border:0;color:#0b1f3a;background:transparent;cursor:pointer;text-align:left;white-space:nowrap'; eb.title='Mostrar u ocultar aristas';
    eb.onclick=()=>{ V3.edges=!V3.edges; V3.grp.children.forEach(o=>{ if(o.isLineSegments) o.visible=V3.edges; }); v3EbSync(); v3Draw(); }; g.appendChild(eb); V3.eb=eb; v3EbSync();
    wrap.appendChild(pn); }
  { const t=document.createElementNS('http://www.w3.org/2000/svg','svg'); t.setAttribute('viewBox','-48 -48 96 96'); t.style.cssText='position:absolute;right:12px;bottom:12px;width:96px;height:96px;pointer-events:none;font:15px serif'; wrap.appendChild(t); V3.tri=t; }
  const ft=document.createElement('div'); ft.style.cssText='padding:4px 12px;font-size:13.5px;border-top:1px solid #9fb4d6;background:#fff'; ft.textContent='Arrastrar: girar · Clic derecho o Mayús + arrastrar: mover · Rueda: acercar o alejar · Doble clic: restablecer'; V3.ft=ft;
  box.appendChild(bar); box.appendChild(wrap); box.appendChild(ft); ov.appendChild(box); document.body.appendChild(ov);
  ov.addEventListener('mousedown',e=>{ if(e.target===ov) v3Close(); });
  V3.ov=ov; V3.box=box; V3.bar=bar; V3.wrap=wrap;
  const r=new THREE.WebGLRenderer({canvas:cv,antialias:true}); r.setPixelRatio(Math.min(2,window.devicePixelRatio||1)); V3.r=r;
  const sc=new THREE.Scene(), cam=new THREE.PerspectiveCamera(32,1,.5,5000); sc.add(cam); sc.add(new THREE.AmbientLight(0xffffff,.62));
  const l1=new THREE.DirectionalLight(0xffffff,.55); l1.position.set(1,.6,1.4); cam.add(l1); const l2=new THREE.DirectionalLight(0xbcd2ff,.3); l2.position.set(-1,-.4,.5); cam.add(l2);
  V3.sc=sc; V3.cam=cam; V3.grp=new THREE.Group(); sc.add(V3.grp);
  const fit=()=>{ const w=wrap.clientWidth, h=wrap.clientHeight; if(!w||!h) return; r.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); v3Draw(); };
  new ResizeObserver(fit).observe(wrap); V3.fit=fit;
  let ptr=null;
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('pointerdown',e=>{ ptr={x:e.clientX,y:e.clientY,pan:e.button===2||e.shiftKey}; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove',e=>{ if(!ptr) return; const dx=e.clientX-ptr.x, dy=e.clientY-ptr.y; ptr.x=e.clientX; ptr.y=e.clientY; const s=V3.st;
    if(ptr.pan){ const k=s.d*0.0016, right=new THREE.Vector3().setFromMatrixColumn(V3.cam.matrixWorld,0), up=new THREE.Vector3().setFromMatrixColumn(V3.cam.matrixWorld,1); s.t.addScaledVector(right,-dx*k).addScaledVector(up,dy*k); }
    else { s.az-=dx*0.008; s.el=Math.max(-1.55,Math.min(1.55,s.el+dy*0.008)); }
    v3Draw(); });
  cv.addEventListener('pointerup',()=>{ ptr=null; });
  cv.addEventListener('wheel',e=>{ e.preventDefault(); V3.st.d=Math.max(V3.st.r*.25,Math.min(V3.st.r*12,V3.st.d*Math.exp(e.deltaY*0.0012))); v3Draw(); },{passive:false});
  cv.addEventListener('dblclick',()=>v3Home());
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&V3.ov&&V3.ov.style.display!=='none'){ e.stopImmediatePropagation(); v3Close(); } },true);
}
function v3Home(){ const h=V3.home; if(!h) return; V3.st.t.copy(h.t); V3.st.r=h.r; v3Dir(1,.8,-1.2); }
function v3Close(){ if(V3.ov){ V3.ov.style.display='none'; V3.grp.clear(); } }
function open3D(n){
  const sd=window.__sheetData&&window.__sheetData[n-1]; if(!sd) return; v3Build();
  const dk=!!S.dark, bg=dk?'#0a1322':'#f5f8fc', pn=dk?'#0f1b30':'#fff', fg=dk?'#e6edf7':'#0b1f3a', ln=dk?'#7aa7ff':'#0b1f3a';
  V3.box.style.background=bg; V3.box.style.color=fg; V3.box.style.borderColor=ln; V3.bar.style.background=pn; V3.bar.style.borderBottomColor=ln; V3.ft.style.background=pn; V3.wrap.style.background=bg; V3.r.setClearColor(new THREE.Color(bg),1);
  V3.grp.clear(); const bb=new THREE.Box3(); let cnt=0;
  sd.list.forEach(b=>{ if(!b.mesh) return; const pv=b.o&&b.o.piv, M=new THREE.Matrix4().makeTranslation(0,pv?pv.y:0,pv?pv.z:0);
    const m=new THREE.Mesh(b.mesh.geometry,b.mesh.material); m.matrixAutoUpdate=false; m.matrix.copy(M); V3.grp.add(m);
    if(b.lines){ const l=new THREE.LineSegments(b.lines.geometry,b.lines.material); l.matrixAutoUpdate=false; l.matrix.copy(M); l.visible=V3.edges; V3.grp.add(l); }
    const g=b.mesh.geometry; if(!g.boundingBox) g.computeBoundingBox(); bb.union(g.boundingBox.clone().applyMatrix4(M)); cnt++; });
  const sp=new THREE.Sphere(); bb.getBoundingSphere(sp); V3.home={t:sp.center.clone(),r:Math.max(sp.radius,2)};
  V3.title.textContent='Plano '+n+' · '+sd.title+'  |  vista 3D ('+cnt+' piezas)';
  v3EbSync();
  V3.ov.style.display='flex'; V3.fit(); v3Home();
}
