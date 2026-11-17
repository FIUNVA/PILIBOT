'use strict';
/* ---------- Figura 4 interactiva: vista explosionada con rótulos numerados ---------- */
const X3={ov:null};
function x3Build(){
  if(X3.ov) return;
  const FF='15px "Latin Modern Roman","CMU Serif",KaTeX_Main,serif';
  const ov=document.createElement('div'); ov.style.cssText='position:fixed;inset:0;z-index:10001;display:none;align-items:center;justify-content:center;background:rgba(6,12,24,.62);font:'+FF;
  const box=document.createElement('div'); box.style.cssText='width:min(1320px,97vw);height:min(820px,94vh);display:flex;flex-direction:column;border:3px double #0b1f3a;box-shadow:0 12px 40px rgba(0,0,0,.45)';
  const bar=document.createElement('div'); bar.style.cssText='display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:6px 12px;border-bottom:3px double #0b1f3a';
  const ttl=document.createElement('span'); ttl.style.cssText='flex:1;min-width:220px;font-size:17px'; ttl.innerHTML='<b>Figura 2.</b> Vista explosionada interactiva'; bar.appendChild(ttl);
  const mkb=(txt,fn,c)=>{ const b=document.createElement('button'); b.type='button'; b.textContent=txt; b.dataset.c=c||''; b.style.cssText='font:inherit;font-size:14px;border:1px solid '+(c||'#1d4ed8')+';color:'+(c||'#1d4ed8')+';background:transparent;padding:2px 10px;cursor:pointer'; b.onclick=fn; bar.appendChild(b); return b; };
  mkb('Ver todo',()=>x3Select(-1)); X3.bl=mkb('Rótulos',()=>{ X3.labels=!X3.labels; x3Draw(); });
  X3.be=mkb('Aristas',()=>{ X3.edges=!X3.edges; X3.grp.children.forEach(o=>{ if(o.isLineSegments) o.visible=X3.edges; }); x3Draw(); });
  mkb('Cerrar ✕',()=>x3Close(),'#e05252');
  const mid=document.createElement('div'); mid.style.cssText='display:flex;flex:1;min-height:0';
  const wrap=document.createElement('div'); wrap.style.cssText='position:relative;flex:1;min-width:0';
  const cv=document.createElement('canvas'); cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none'; wrap.appendChild(cv);
  const NS='http://www.w3.org/2000/svg', svg=document.createElementNS(NS,'svg'); svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:hidden'; wrap.appendChild(svg);
  { const t=document.createElementNS(NS,'svg'); t.setAttribute('viewBox','-48 -48 96 96'); t.style.cssText='position:absolute;left:12px;bottom:12px;width:96px;height:96px;pointer-events:none;font:15px serif'; wrap.appendChild(t); X3.tri=t; }
  const side=document.createElement('div'); side.style.cssText='width:272px;flex:none;display:flex;flex-direction:column;border-left:3px double #0b1f3a;min-height:0';
  const info=document.createElement('div'); info.style.cssText='padding:8px 10px;border-bottom:1px solid #9fb4d6;font-size:14px;line-height:1.35'; side.appendChild(info);
  const list=document.createElement('div'); list.style.cssText='flex:1;overflow:auto;padding:4px 0'; side.appendChild(list);
  const ft=document.createElement('div'); ft.style.cssText='padding:4px 12px;font-size:13.5px;border-top:1px solid #9fb4d6'; ft.textContent='Clic en un número (o en una pieza) para acercar · Arrastrar: girar · Clic derecho o Mayús + arrastrar: mover · Rueda: zoom · Doble clic: ver todo';
  mid.appendChild(wrap); mid.appendChild(side); box.appendChild(bar); box.appendChild(mid); box.appendChild(ft); ov.appendChild(box); document.body.appendChild(ov);
  ov.addEventListener('mousedown',e=>{ if(e.target===ov) x3Close(); });
  Object.assign(X3,{ov,box,bar,ttl,wrap,cv,svg,side,info,list,ft,sel:-1,labels:true,edges:true,st:{az:0,el:0,d:100,t:new THREE.Vector3(),r:50},anim:null});
  X3.NS=NS;
  const r=new THREE.WebGLRenderer({canvas:cv,antialias:true}); r.setPixelRatio(Math.min(2,window.devicePixelRatio||1)); X3.r=r;
  const sc=new THREE.Scene(), cam=new THREE.PerspectiveCamera(32,1,.5,6000); sc.add(cam); sc.add(new THREE.AmbientLight(0xffffff,.62));
  const l1=new THREE.DirectionalLight(0xffffff,.55); l1.position.set(1,.6,1.4); cam.add(l1); const l2=new THREE.DirectionalLight(0xbcd2ff,.3); l2.position.set(-1,-.4,.5); cam.add(l2);
  X3.sc=sc; X3.cam=cam; X3.grp=new THREE.Group(); sc.add(X3.grp); X3.ray=new THREE.Raycaster();
  const fit=()=>{ const w=wrap.clientWidth, h=wrap.clientHeight; if(!w||!h) return; r.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); x3Draw(); };
  new ResizeObserver(fit).observe(wrap);
  let ptr=null;
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('pointerdown',e=>{ x3Stop(); ptr={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,pan:e.button===2||e.shiftKey}; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove',e=>{ if(!ptr) return; const dx=e.clientX-ptr.x, dy=e.clientY-ptr.y; ptr.x=e.clientX; ptr.y=e.clientY; const s=X3.st;
    if(ptr.pan){ const k=s.d*0.0016, right=new THREE.Vector3().setFromMatrixColumn(X3.cam.matrixWorld,0), up=new THREE.Vector3().setFromMatrixColumn(X3.cam.matrixWorld,1); s.t.addScaledVector(right,-dx*k).addScaledVector(up,dy*k); }
    else { s.az-=dx*0.008; s.el=Math.max(-1.55,Math.min(1.55,s.el+dy*0.008)); }
    x3Draw(); });
  cv.addEventListener('pointerup',e=>{ const p=ptr; ptr=null; if(!p||Math.hypot(e.clientX-p.x0,e.clientY-p.y0)>4) return;
    const rc=cv.getBoundingClientRect(); X3.ray.setFromCamera(new THREE.Vector2(((e.clientX-rc.left)/rc.width)*2-1,-((e.clientY-rc.top)/rc.height)*2+1),X3.cam);
    const hit=X3.ray.intersectObjects(X3.grp.children.filter(o=>o.isMesh&&o.visible),false)[0]; if(hit&&hit.object.userData.ci!=null) x3Select(hit.object.userData.ci); });
  cv.addEventListener('wheel',e=>{ e.preventDefault(); x3Stop(); X3.st.d=Math.max(6,Math.min(X3.st.r*14,X3.st.d*Math.exp(e.deltaY*0.0012))); x3Draw(); },{passive:false});
  cv.addEventListener('dblclick',()=>x3Select(-1));
  svg.addEventListener('pointerup',e=>{ const g=e.target.closest&&e.target.closest('[data-i]'); if(g) x3Select(+g.dataset.i); });
  list.addEventListener('click',e=>{ const g=e.target.closest('[data-i]'); if(g) x3Select(+g.dataset.i); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&X3.ov&&X3.ov.style.display!=='none'){ e.stopImmediatePropagation(); if(X3.sel>=0) x3Select(-1); else x3Close(); } },true);
}
function x3Stop(){ if(X3.anim){ cancelAnimationFrame(X3.anim.raf); X3.anim=null; } }
function x3Draw(){
  if(!X3.r) return; const s=X3.st, c=Math.cos(s.el), cam=X3.cam;
  cam.position.set(s.t.x+s.d*c*Math.sin(s.az),s.t.y+s.d*Math.sin(s.el),s.t.z+s.d*c*Math.cos(s.az)); cam.up.set(0,1,0); cam.lookAt(s.t); cam.updateMatrixWorld(); X3.r.render(X3.sc,cam); if(X3.tri) triadTo(X3.tri,cam);
  const w=X3.wrap.clientWidth, h=X3.wrap.clientHeight, C=X3.comps, svg=X3.svg; if(!w||!h||!C) return;
  X3.bl.style.background=X3.labels?'#1d4ed8':'transparent'; X3.bl.style.color=X3.labels?'#fff':'#1d4ed8'; X3.be.style.background=X3.edges?'#1d4ed8':'transparent'; X3.be.style.color=X3.edges?'#fff':'#1d4ed8';
  svg.style.display=X3.labels?'block':'none'; if(!X3.labels) return;
  const R=13, PL=x3Place(w,h), A=PL.A, Q=PL.Q, dk=!!S.dark, fg=dk?'#7aa7ff':'#1d4ed8', bg=dk?'#0f1b30':'#fff', axc=dk?'#9aa8bd':'#44546a';
  C.forEach((c,i)=>{ const ax=PL.AX[i], el=X3.axs[i]; if(false&&ax&&(X3.sel<0||X3.sel===i)){ el.setAttribute('x1',ax[0][0]); el.setAttribute('y1',ax[0][1]); el.setAttribute('x2',ax[1][0]); el.setAttribute('y2',ax[1][1]); el.setAttribute('stroke',axc); el.style.display=''; } else el.style.display='none'; });
  C.forEach((c,i)=>{ const g=X3.gs[i], a=A[i], q=Q[i], t=PL.T[i], k=PL.K?PL.K[i]:null, sel=X3.sel; g.style.display=a.ok&&a.x>-30&&a.x<w+30&&a.y>-30&&a.y<h+30?'':'none';
    const on=sel===i, dim=sel>=0&&!on, f=k||t, dx=f.x-q.x, dy=f.y-q.y, dd=Math.hypot(dx,dy)||1, ux=dx/dd, uy=dy/dd, sx=q.x+ux*R, sy=q.y+uy*R;
    const ex=t.x, ey=t.y, vx=t.x-(k?k.x:q.x), vy=t.y-(k?k.y:q.y), vd=Math.hypot(vx,vy)||1, wx=vx/vd, wy=vy/vd, px=-wy, py=wx;
    const ln=g.children[0], ar=g.children[1], ci=g.children[2], tx=g.children[3];
    ln.setAttribute('points',sx+','+sy+' '+(k?k.x+','+k.y+' ':'')+(ex-wx*8)+','+(ey-wy*8));
    ar.setAttribute('points',ex+','+ey+' '+(ex-wx*10+px*3.6)+','+(ey-wy*10+py*3.6)+' '+(ex-wx*10-px*3.6)+','+(ey-wy*10-py*3.6));
    ci.setAttribute('cx',q.x); ci.setAttribute('cy',q.y); tx.setAttribute('x',q.x); tx.setAttribute('y',q.y+4.6); g.style.opacity=dim?.3:1;
    ln.setAttribute('stroke',fg); ar.setAttribute('fill',fg); ci.setAttribute('stroke',fg); ci.setAttribute('fill',on?fg:bg); tx.setAttribute('fill',on?bg:fg); ci.setAttribute('stroke-width',on?2.6:1.6); });
}
