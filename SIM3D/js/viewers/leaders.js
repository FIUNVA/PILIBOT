'use strict';
/* ---------- trazado de directrices de la vista explosionada ----------
   largo mínimo hacia el margen más cercano, abanico (30°–65°) en grupos densos, longitudes escalonadas,
   un solo quiebre obtuso si hace falta, y sin cruces con otras directrices ni con los ejes de ensamblaje */
const G2={
  hull(P){ P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]); if(P.length<3) return P; const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]); const lo=[]; P.forEach(p=>{ while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0) lo.pop(); lo.push(p); }); const up=[]; for(let i=P.length-1;i>=0;i--){ const p=P[i]; while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0) up.pop(); up.push(p); } up.pop(); lo.pop(); return lo.concat(up); },
  scan(H,y){ let a=1e9,b=-1e9; for(let i=0;i<H.length;i++){ const p=H[i], q=H[(i+1)%H.length]; if((p[1]<=y&&q[1]>=y)||(q[1]<=y&&p[1]>=y)){ const t=q[1]===p[1]?0:(y-p[1])/(q[1]-p[1]), x=p[0]+t*(q[0]-p[0]); if(x<a)a=x; if(x>b)b=x; } } return a>b?null:[a,b]; },
  inside(H,x,y){ let s=0; for(let i=0;i<H.length;i++){ const p=H[i], q=H[(i+1)%H.length], c=(q[0]-p[0])*(y-p[1])-(q[1]-p[1])*(x-p[0]); if(c>0){ if(s<0) return false; s=1; } else if(c<0){ if(s>0) return false; s=-1; } } return true; },
  dseg(x,y,a,b){ const dx=b[0]-a[0], dy=b[1]-a[1], l2=dx*dx+dy*dy||1; let t=((x-a[0])*dx+(y-a[1])*dy)/l2; t=Math.max(0,Math.min(1,t)); return Math.hypot(x-(a[0]+t*dx),y-(a[1]+t*dy)); },
  cross(a,b,c,d){ const o=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]); const d1=o(a,b,c), d2=o(a,b,d), d3=o(c,d,a), d4=o(c,d,b); return d1*d2<0&&d3*d4<0; }
};
function PSD(x,y,ax,ay,bx,by){ const dx=bx-ax, dy=by-ay, l2=dx*dx+dy*dy||1; let t=((x-ax)*dx+(y-ay)*dy)/l2; t=t<0?0:t>1?1:t; return Math.hypot(x-ax-t*dx,y-ay-t*dy); }
function x3Place(w,h){
  const C=X3.comps, cam=X3.cam, R=13, pad=R+8;
  const prj=v=>{ const q=v.clone().project(cam); return [(q.x+1)/2*w,(1-q.y)/2*h,q.z]; };
  const A=C.map(c=>{ const v=c.anc.clone().project(cam); return {x:(v.x+1)/2*w,y:(1-v.y)/2*h,ok:v.z<1}; });
  const Q=A.map(a=>({x:a.x,y:a.y}));
  if(X3.sel>=0){ /* seleccionado: un solo rótulo, a distancia fija del punto señalado y lejos del centro de la vista */
    const i=X3.sel, a=A[i]; A.forEach((b,k)=>{ if(k!==i) b.ok=false; });
    let dx=a.x-w/2, dy=a.y-h/2, d=Math.hypot(dx,dy); if(d<30){ dx=1; dy=-1; d=Math.SQRT2; } let ux=dx/d, uy=dy/d;
    if(Math.abs(uy)<.35) uy=(uy<0?-1:1)*.35; const l=Math.hypot(ux,uy); ux/=l; uy/=l;
    const L=62; let qx=a.x+ux*L, qy=a.y+uy*L; if(qx<pad||qx>w-pad){ ux=-ux; qx=a.x+ux*L; } if(qy<pad||qy>h-pad){ uy=-uy; qy=a.y+uy*L; }
    Q[i].x=Math.max(pad,Math.min(w-pad,qx)); Q[i].y=Math.max(pad,Math.min(h-pad,qy));
    const T=A.map(a2=>({x:a2.x,y:a2.y})); return {A,Q,T,K:A.map(()=>null),AX:C.map((c,k)=>k===i?G2axis(c,k,prj):null),S:null};
  }
  /* rectángulos proyectados de las piezas (sin bandas): contorno general */
  const rects=[]; let gx0=1e9,gx1=-1e9;
  (X3.BB||[]).forEach(bb=>{ let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(let k=0;k<8;k++){ const v=prj(new THREE.Vector3(k&1?bb.max.x:bb.min.x,k&2?bb.max.y:bb.min.y,k&4?bb.max.z:bb.min.z)); x0=Math.min(x0,v[0]); x1=Math.max(x1,v[0]); y0=Math.min(y0,v[1]); y1=Math.max(y1,v[1]); } rects.push([x0,x1,y0,y1]); gx0=Math.min(gx0,x0); gx1=Math.max(gx1,x1); });
  if(!rects.length){ A.forEach(a=>{ gx0=Math.min(gx0,a.x); gx1=Math.max(gx1,a.x); }); }
  const gap=Math.max(10,Math.min(22,w*0.016)), ext=Math.max(16,Math.min(30,w*0.025)), mx=(gx0+gx1)/2, sp=2*R+8;
  const H=C.map((c,i)=>A[i].ok&&X3.pts&&X3.pts[i]?G2.hull(X3.pts[i].map(v=>prj(v))):null);
  const AXs=C.map((c,i)=>G2axis(c,i,prj)), HB=H.map(hh=>hh?[Math.min(...hh.map(p=>p[0])),Math.max(...hh.map(p=>p[0])),Math.min(...hh.map(p=>p[1])),Math.max(...hh.map(p=>p[1]))]:null);
  /* punto de contacto: borde de la pieza visto desde cada lado, metido unos píxeles dentro del contorno de la propia pieza */
  const TS=C.map((c,i)=>{ const a=A[i]; if(!a.ok) return null; const sc=H[i]?G2.scan(H[i],a.y):null, ins=6;
    const l=sc?Math.min(a.x,sc[0]+ins):a.x, r=sc?Math.max(a.x,sc[1]-ins):a.x; return {'-1':{x:l,y:a.y},'1':{x:r,y:a.y}}; });
  const ids=C.map((c,i)=>i).filter(i=>A[i].ok);
  let S=(X3.S&&X3.S.length===C.length)?X3.S.slice():C.map((c,i)=>A[i].x<mx?-1:1), E=C.map(()=>0);
  if(!X3.S||X3.S.length!==C.length){ /* equilibrio inicial entre ambos lados */ let nl=0,nr=0; ids.forEach(i=>{ if(S[i]<0) nl++; else nr++; });
    ids.slice().sort((p,q)=>Math.abs(A[q].x-mx)-Math.abs(A[p].x-mx)).forEach(i=>{ if(S[i]<0&&nl>nr+2){ S[i]=1; nl--; nr++; } else if(S[i]>0&&nr>nl+2){ S[i]=-1; nr--; nl++; } }); }
  const BH=(X3.BP||[]).map(P=>G2.hull(P.map(v=>prj(v))));
  const edge=(y0,y1,left)=>{ let e=left?gx0:gx1, f=false; rects.forEach(r=>{ if(y1>r[2]-8&&y0<r[3]+8){ if(!f){ e=left?r[0]:r[1]; f=true; } else e=left?Math.min(e,r[0]):Math.max(e,r[1]); } });
    BH.forEach(hh=>{ for(let k=0;k<=4;k++){ const sc=G2.scan(hh,y0-8+(y1-y0+16)*k/4); if(sc) e=left?Math.min(e,sc[0]):Math.max(e,sc[1]); } }); return e; };
  const lay=(S,E)=>{ const Qs=A.map(a=>({x:a.x,y:a.y})), T=A.map((a,i)=>a.ok?Object.assign({},TS[i][S[i]]):{x:a.x,y:a.y}), K=A.map(()=>null), fan=A.map(()=>false);
    [-1,1].forEach(sd=>{ const arr=ids.filter(i=>S[i]===sd).sort((p,q)=>T[p].y-T[q].y); if(!arr.length) return; const left=sd<0;
      /* grupos densos: piezas contiguas cuyos puntos de contacto están a menos de un globo de distancia */
      const gr=[]; arr.forEach(i=>{ const g=gr[gr.length-1]; if(g&&T[i].y-T[g[g.length-1]].y<sp*1.6) g.push(i); else gr.push([i]); });
      let ys=[], xo=[]; arr.forEach(i=>{ ys.push(T[i].y); xo.push(0); }); let pos=0, tog=0;
      gr.forEach(g=>{ const n=g.length; if(n>=2){ const y0=T[g[0]].y, y1=T[g[n-1]].y, ec=edge(y0-n*sp,y1+n*sp,left);
          g.forEach((i,k)=>{ fan[i]=true; const mid=(n-1)/2, rk=mid?Math.abs(k-mid)/mid:0, up=k<mid?-1:k>mid?1:((tog++)%2?1:-1), th=(30+35*rk)*Math.PI/180, o=(k%2)*ext*1.3, bx=left?ec-gap-o:ec+gap+o, dx=Math.abs(bx-T[i].x); ys[pos+k]=T[i].y+up*dx*Math.tan(th); xo[pos+k]=o; }); }
        pos+=n; });
      /* separación mínima con regresión isotónica (conserva el orden, evita cruces) */
      const nn=arr.length, d=ys.map((v,k)=>v-k*sp), B=[]; d.forEach(v=>{ B.push({s:v,n:1}); while(B.length>1&&B[B.length-2].s/B[B.length-2].n>B[B.length-1].s/B[B.length-1].n){ const b=B.pop(); B[B.length-1].s+=b.s; B[B.length-1].n+=b.n; } });
      let k=0, yy=[]; B.forEach(b=>{ for(let j=0;j<b.n;j++){ yy.push(b.s/b.n+k*sp); k++; } });
      for(let q=0;q<4;q++){ for(let k=0;k<nn;k++){ if(yy[k]<pad+k*sp) yy[k]=pad+k*sp; if(k&&yy[k]<yy[k-1]+sp) yy[k]=yy[k-1]+sp; } for(let k=nn-1;k>=0;k--){ const mx2=h-pad-(nn-1-k)*sp; if(yy[k]>mx2) yy[k]=mx2; if(k<nn-1&&yy[k]>yy[k+1]-sp) yy[k]=yy[k+1]-sp; } }
      arr.forEach((i,k2)=>{ const y=yy[k2], ty=T[i].y, e=edge(Math.min(y,ty)-R,Math.max(y,ty)+R,left), o=fan[i]?xo[k2]:(k2%2)*ext*(gr.some(g=>g.length>1&&g.includes(i))?1:0);
        Qs[i].x=left?Math.max(pad,e-gap-o):Math.min(w-pad,e+gap+o); Qs[i].y=y; }); });
    /* quiebre único y obtuso: tramo final a 45° contra la pieza */
    ids.forEach(i=>{ if(!E[i]) return; const t=T[i], q=Qs[i], Le=E[i]===1?30:46, sx=S[i], sy=q.y>=t.y?1:-1, kx=t.x+sx*Le*Math.SQRT1_2, ky=t.y+sy*Le*Math.SQRT1_2;
      const dot=(kx-q.x)*(t.x-kx)+(ky-q.y)*(t.y-ky); if(dot>0&&(sx<0?kx>q.x:kx<q.x)) K[i]={x:kx,y:ky}; });
    const P=A.map((a,i)=>{ if(!a.ok) return null; const q=Qs[i], t=T[i], k=K[i], f=k||t, dd=Math.hypot(f.x-q.x,f.y-q.y)||1; const s0=[q.x+(f.x-q.x)/dd*R,q.y+(f.y-q.y)/dd*R]; return k?[s0,[k.x,k.y],[t.x,t.y]]:[s0,[t.x,t.y]]; });
    const bad=A.map(()=>0); let cost=0;
    ids.forEach(i=>{ for(let j=i+1;j<A.length;j++){ if(!P[j]) continue; let c=0; for(let a=0;a<P[i].length-1;a++) for(let b=0;b<P[j].length-1;b++) if(G2.cross(P[i][a],P[i][a+1],P[j][b],P[j][b+1])) c++; if(c){ bad[i]+=c; bad[j]+=c; cost+=100*c; } else { /* líneas casi pegadas o paralelas (se ven dobles) */ const u0=P[i][0],u1=P[i][P[i].length-1],v0=P[j][0],v1=P[j][P[j].length-1]; let dm=Math.min(PSD(u0[0],u0[1],v0[0],v0[1],v1[0],v1[1]),PSD(u1[0],u1[1],v0[0],v0[1],v1[0],v1[1]),PSD(v0[0],v0[1],u0[0],u0[1],u1[0],u1[1]),PSD(v1[0],v1[1],u0[0],u0[1],u1[0],u1[1])); if(dm<9){ const q=(9-dm)/9; cost+=60*q; bad[i]+=q; bad[j]+=q; } } }
      for(let j=0;j<A.length;j++){ const ax=AXs[j]; if(j===i||!ax) continue; let c=0; for(let a=0;a<P[i].length-1;a++) if(G2.cross(P[i][a],P[i][a+1],ax[0],ax[1])) c++; if(c){ bad[i]+=c; cost+=100*c; } }
      let tl=0; for(let a=0;a<P[i].length-1;a++){ const p0=P[i][a], p1=P[i][a+1], L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]); tl+=L;
        /* atravesar otras piezas */ const nS=Math.max(2,Math.ceil(L/5)); for(let k=1;k<nS;k++){ const t=k/nS; if(a===P[i].length-2&&L*(1-t)<14) break; const x=p0[0]+(p1[0]-p0[0])*t, y=p0[1]+(p1[1]-p0[1])*t; for(let j=0;j<H.length;j++){ if(j===i||!H[j]) continue; if(HB[j]&&x>=HB[j][0]&&x<=HB[j][1]&&y>=HB[j][2]&&y<=HB[j][3]&&G2.inside(H[j],x,y)){ cost+=0.7; bad[i]+=0.01; } } }
        /* rozar globos ajenos */ for(let j=0;j<Qs.length;j++){ if(j===i||!A[j].ok) continue; if(G2.dseg(Qs[j].x,Qs[j].y,p0,p1)<R+7){ cost+=30; bad[i]+=1; bad[j]+=1; } } }
      cost+=tl*0.05+Math.max(0,tl-170)*0.12; if(K[i]) cost+=1.5;
      if(fan[i]){ const f=K[i]||T[i], an=Math.abs(Math.atan2(f.y-Qs[i].y,f.x-Qs[i].x)); const dg=Math.min(an,Math.PI-an)*180/Math.PI; if(dg<28||dg>67) cost+=3; } });
    return {Q:Qs,T,K,P,bad,cost,fan}; };
  const fresh=!X3.S||X3.S.length!==C.length;
  const climb=(S,E)=>{ let best=lay(S,E);
    for(let pass=0;pass<4&&(fresh||best.cost>=100);pass++){ let imp=false;
      ids.slice().sort((p,q)=>best.bad[q]-best.bad[p]).forEach(i=>{
        const s0=S[i]; S[i]=-s0; const r=lay(S,E); if(r.cost<best.cost-0.5){ best=r; imp=true; return; } S[i]=s0;
        for(const e of []){ const e0=E[i]; if(e===e0) continue; E[i]=e; const r2=lay(S,E); if(r2.cost<best.cost-0.5){ best=r2; imp=true; return; } E[i]=e0; } });
      if(!imp) break; }
    return {best,S,E}; };
  let R0=climb(S.slice(),E.slice());
  if(fresh){ let seed=12345; const rnd=()=>(seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff;
    for(let r=0;r<6;r++){ const S2=S.slice(); ids.forEach(i=>{ if(rnd()<0.22) S2[i]=-S2[i]; }); const R1=climb(S2,C.map(()=>0)); if(R1.best.cost<R0.best.cost) R0=R1; } }
  const best=R0.best; S=R0.S; E=R0.E;
  X3.S=S; X3.E=E;
  return {A,Q:best.Q,T:best.T,K:best.K,AX:AXs,S};
}
/* eje de ensamblaje: del punto de la pieza explosionada al punto que ocuparía armada (trazo y punto) */
function G2axis(c,i,prj){ if(!X3.AXW||!X3.AXW[i]) return null; const a=prj(c.anc), b=prj(X3.AXW[i]); const dx=b[0]-a[0], dy=b[1]-a[1], d=Math.hypot(dx,dy); if(d<24||a[2]>=1||b[2]>=1) return null; const ux=dx/d, uy=dy/d; return [[a[0]-ux*10,a[1]-uy*10],[b[0]+ux*10,b[1]+uy*10]]; }
function x3Anim(t,d,ms){
  x3Stop(); const s=X3.st, t0=s.t.clone(), d0=s.d, T0=performance.now(); const A={raf:0}; X3.anim=A;
  const step=now=>{ const k=Math.min(1,(now-T0)/ms), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; s.t.lerpVectors(t0,t,e); s.d=d0+(d-d0)*e; x3Draw(); if(k<1) A.raf=requestAnimationFrame(step); else X3.anim=null; };
  A.raf=requestAnimationFrame(step);
}
function x3Fit(box,k){ const sp=new THREE.Sphere(); box.getBoundingSphere(sp); return {t:sp.center.clone(),d:Math.max(sp.radius,5)/Math.sin(X3.cam.fov*Math.PI/360)*(k||1.12),r:sp.radius}; }
function x3Select(i){
  if(!X3.comps) return; X3.sel=i;
  X3.meshes.forEach(m=>{ const dim=i>=0&&m.userData.ci!==i; const mt=m.material; if(m.isLineSegments){ mt.transparent=dim; mt.opacity=dim?.1:1; } else { mt.transparent=dim; mt.opacity=dim?.1:1; mt.depthWrite=!dim; } mt.needsUpdate=true; if(m.isMesh) m.raycast=dim?(()=>{}):THREE.Mesh.prototype.raycast; });
  const f=i>=0?x3Fit(X3.comps[i].box,1.3):{t:X3.home.t.clone(),d:X3.home.d};
  x3Anim(f.t,f.d,650);
  const C=X3.comps; X3.list.querySelectorAll('[data-i]').forEach(e=>{ const on=+e.dataset.i===i; e.style.background=on?(S.dark?'#1a2c4d':'#dbe7ff'):'transparent'; if(on) e.scrollIntoView({block:'nearest'}); });
  if(i>=0){ const c=C[i]; X3.info.innerHTML='<div style="font-size:16px"><b style="color:#1d4ed8">'+c.n+'</b> · <b>'+c.name+'</b></div><div style="opacity:.85">'+c.idx.length+(c.idx.length===1?' pieza':' piezas')+' · '+c.tri.toLocaleString('es-MX')+' triángulos</div>'; }
  else X3.info.innerHTML='<div><b>'+C.length+' componentes.</b> Cada número señala su pieza en la vista explosionada; haz clic en él para acercar.</div>';
  x3Draw();
}
function x3Load(C){
  X3.grp.clear(); X3.meshes=[]; X3.BB=[]; X3.BP=[]; X3.pos=[]; X3.S=null; X3.E=null; const U=new THREE.Box3();
  withLevel(1,()=>{ bodies.forEach((b,i)=>{ if(b.modeHide) return; const ci=C.findIndex(c=>c.idx.includes(i)), pos=b.grp.position.clone(), g=b.o.group==='band'?b.g.clone():b.g; X3.pos[i]=pos;
    const m=new THREE.Mesh(g,b.mesh.material.clone()); m.position.copy(pos); m.userData.ci=ci; X3.grp.add(m); X3.meshes.push(m);
    const l=new THREE.LineSegments(b.o.group==='band'?b.lines.geometry.clone():b.lines.geometry,b.lines.material.clone()); l.position.copy(pos); l.userData.ci=ci; l.visible=X3.edges; X3.grp.add(l); X3.meshes.push(l);
    const bb=bodyBox(b,pos); U.union(bb); if(b.o.group!=='band') X3.BB.push(bb); else { const pa=b.g.attributes.position, n=pa.count, st=Math.max(1,Math.floor(n/60)), P=[]; for(let v=0;v<n;v+=st) P.push(new THREE.Vector3(pa.getX(v)+pos.x,pa.getY(v)+pos.y,pa.getZ(v)+pos.z)); X3.BP.push(P); } }); });
  X3.meshes.forEach(m=>{ m.material.clippingPlanes=null; m.material.needsUpdate=true; });
  /* puntos de muestra de cada pieza (contorno) y posición armada de su ancla (ejes de ensamblaje) */
  X3.pts=C.map(c=>{ const P=[]; c.idx.forEach(i=>{ const b=bodies[i], pos=X3.pos[i]; if(!pos) return; const bb=bodyBox(b,pos); for(let k=0;k<8;k++) P.push(new THREE.Vector3(k&1?bb.max.x:bb.min.x,k&2?bb.max.y:bb.min.y,k&4?bb.max.z:bb.min.z));
      const pa=b.g.attributes.position, n=pa.count, st=Math.max(1,Math.floor(n/40)); for(let v=0;v<n;v+=st) P.push(new THREE.Vector3(pa.getX(v)+pos.x,pa.getY(v)+pos.y,pa.getZ(v)+pos.z)); }); return P; });
  { const p0=withLevel(0,()=>bodies.map(b=>b.grp.position.clone())); X3.AXW=C.map(c=>{ const i0=c.idx.find(i=>X3.pos[i]); if(i0===undefined) return null; return c.anc.clone().add(p0[i0]).sub(X3.pos[i0]); }); }
  X3.U=U.clone(); const f=x3Fit(U,.86); X3.home=f; X3.sel=-1; X3.st.t.copy(f.t); X3.st.r=f.r; X3.st.d=f.d; X3.st.az=Math.atan2(1,-1.2); X3.st.el=Math.asin(.5/Math.hypot(1,.5,1.2));
  return f;
}
function openFig4(){
  x3Build(); if(X3.ttl) X3.ttl.innerHTML=(window.__fig4N?'<b>Figura '+window.__fig4N+'.</b> ':'')+'Vista explosionada interactiva'; const C=buildComps(); X3.comps=C;
  const dk=!!S.dark, bg=dk?'#0a1322':'#f5f8fc', pn=dk?'#0f1b30':'#fff', fg=dk?'#e6edf7':'#0b1f3a', ln=dk?'#7aa7ff':'#0b1f3a';
  X3.box.style.background=bg; X3.box.style.color=fg; X3.box.style.borderColor=ln; [X3.bar,X3.ft].forEach(e=>{ e.style.background=pn; e.style.borderColor=ln; }); X3.side.style.background=pn; X3.side.style.borderColor=ln; X3.r.setClearColor(new THREE.Color(bg),1);
  const f=x3Load(C);
  const NS=X3.NS; X3.svg.innerHTML=''; X3.axs=C.map(()=>{ const l=document.createElementNS(NS,'line'); l.setAttribute('stroke-width',1); l.setAttribute('stroke-dasharray','9 3 2 3'); l.style.display='none'; X3.svg.appendChild(l); return l; }); X3.gs=C.map((c,i)=>{ const g=document.createElementNS(NS,'g'); g.dataset.i=i; g.style.cursor='pointer';
    const mk=(t,at)=>{ const e=document.createElementNS(NS,t); for(const k in at) e.setAttribute(k,at[k]); g.appendChild(e); return e; };
    mk('polyline',{'stroke-width':1.4,fill:'none','stroke-linejoin':'miter'}); mk('polygon',{}); mk('circle',{r:13,'pointer-events':'all'}); const tx=mk('text',{'text-anchor':'middle','font-size':c.n>9?13:14,'font-weight':700,'font-family':'Latin Modern Roman,CMU Serif,KaTeX_Main,serif','pointer-events':'none'}); tx.textContent=c.n;
    g.style.pointerEvents='auto'; X3.svg.appendChild(g); return g; });
  X3.list.innerHTML=C.map((c,i)=>'<div data-i="'+i+'" style="display:flex;gap:8px;align-items:baseline;padding:3px 10px;cursor:pointer"><b style="color:#1d4ed8;min-width:22px;text-align:right">'+c.n+'</b><span>'+c.name+'</span></div>').join('');
  X3.ov.style.display='flex'; X3.sel=-2; x3Select(-1); const w=X3.wrap.clientWidth,h=X3.wrap.clientHeight; if(w&&h){ X3.r.setSize(w,h,false); X3.cam.aspect=w/h; X3.cam.updateProjectionMatrix(); } x3Stop(); X3.st.t.copy(f.t); X3.st.d=f.d; x3Draw();
}
function fig4Image(){
  x3Build(); const C=buildComps(); X3.comps=C; const W=1500, H=900, pr=X3.r.getPixelRatio();
  X3.sel=-1; X3.r.setPixelRatio(1); X3.r.setSize(W,H,false); X3.cam.aspect=W/H; X3.cam.updateProjectionMatrix(); X3.r.setClearColor(new THREE.Color('#ffffff'),1);
  const f=x3Load(C); X3.st.t.copy(f.t); X3.st.r=f.r; X3.st.d=f.d*.97; X3.st.az=Math.atan2(1,-1.2); X3.st.el=Math.asin(.5/Math.hypot(1,.5,1.2));
  const s=X3.st, c=Math.cos(s.el), cam=X3.cam; cam.position.set(s.t.x+s.d*c*Math.sin(s.az),s.t.y+s.d*Math.sin(s.el),s.t.z+s.d*c*Math.cos(s.az)); cam.up.set(0,1,0); cam.lookAt(s.t); cam.updateMatrixWorld(); X3.r.render(X3.sc,cam);
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,W,H); g.drawImage(X3.r.domElement,0,0);
  const PL=x3Place(W,H), R=13;

  C.forEach((c,i)=>{ const a=PL.A[i], q=PL.Q[i], t=PL.T[i], k=PL.K[i]; if(!a.ok) return; const f=k||t, dx=f.x-q.x, dy=f.y-q.y, dd=Math.hypot(dx,dy)||1, ux=dx/dd, uy=dy/dd, vx=t.x-(k?k.x:q.x), vy=t.y-(k?k.y:q.y), vd=Math.hypot(vx,vy)||1, wx=vx/vd, wy=vy/vd, px=-wy, py=wx;
    g.strokeStyle=g.fillStyle='#1d4ed8'; g.lineWidth=1.4; g.beginPath(); g.moveTo(q.x+ux*R,q.y+uy*R); if(k) g.lineTo(k.x,k.y); g.lineTo(t.x-wx*8,t.y-wy*8); g.stroke();
    g.beginPath(); g.moveTo(t.x,t.y); g.lineTo(t.x-wx*10+px*3.6,t.y-wy*10+py*3.6); g.lineTo(t.x-wx*10-px*3.6,t.y-wy*10-py*3.6); g.closePath(); g.fill();
    g.beginPath(); g.arc(q.x,q.y,R,0,7); g.fillStyle='#fff'; g.fill(); g.lineWidth=1.6; g.strokeStyle='#1d4ed8'; g.stroke();
    g.fillStyle='#1d4ed8'; g.font='bold 14px "Latin Modern Roman","CMU Serif",KaTeX_Main,serif'; g.textAlign='center'; g.fillText(String(c.n),q.x,q.y+4.8); });
  /* recorte al contenido: la figura queda a la izquierda y el espacio sobrante lo ocupa la lista */
  let x0=W, x1=0, y0=H, y1=0; { const D=g.getImageData(0,0,W,H).data; for(let y=0;y<H;y+=2) for(let x=0;x<W;x+=2){ const k=(y*W+x)*4; if(D[k]<245||D[k+1]<245||D[k+2]<245){ if(x<x0) x0=x; if(x>x1) x1=x; if(y<y0) y0=y; if(y>y1) y1=y; } } }
  const m=18; x0=Math.max(0,x0-m); y0=Math.max(0,y0-m); x1=Math.min(W,x1+m); y1=Math.min(H,y1+m);
  const cc=document.createElement('canvas'); cc.width=x1-x0; cc.height=y1-y0+64; const g2=cc.getContext('2d'); g2.fillStyle='#fff'; g2.fillRect(0,0,cc.width,cc.height); g2.drawImage(cv,x0,y0,x1-x0,y1-y0,0,0,x1-x0,y1-y0);
  const url=cc.toDataURL('image/jpeg',0.92);
  X3.grp.clear(); X3.meshes=[]; X3.r.setPixelRatio(pr); return url;
}
function x3Close(){ if(X3.ov){ X3.sel=-1; x3Stop(); X3.ov.style.display='none'; X3.grp.clear(); X3.meshes=[]; } }
function ensureDocOv(){
  try{ if(!docHTML) docHTML=buildDocHTML(); }catch(e){ console.error(e); alert('Error al generar la documentación: '+e.message); return null; }
  let ov=document.getElementById('docov');
  if(!ov){
    ov=document.createElement('div'); ov.id='docov';
    ov.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;visibility:hidden;pointer-events:none;flex-direction:column;font:15px "Latin Modern Roman","CMU Serif",KaTeX_Main,serif';
    const bar=document.createElement('div'); bar.style.cssText='display:flex;gap:8px;align-items:center;padding:6px 12px;border-bottom:3px double #0b1f3a;background:#fff';
    bar.innerHTML='<span style="flex:1;font-size:18px">PILIBOT <span style="color:#1d4ed8">|</span> Documentación</span>';
    const mk=(t,c,fn)=>{ const b=document.createElement('button'); b.type='button'; b.textContent=t; b.style.cssText='font:inherit;border:1px solid '+c+';color:'+c+';background:transparent;padding:3px 12px;cursor:pointer'; b.onclick=fn; bar.appendChild(b); };
    mk('Cerrar ✕','#e05252',()=>window.__closeDocs());
    const fr=document.createElement('iframe'); fr.style.cssText='flex:1;border:0;width:100%'; fr.srcdoc=docHTML; fr.id='docfr'; fr.onload=()=>{ docDark=null; docTheme(); };
    ov.appendChild(bar); ov.appendChild(fr); document.body.appendChild(ov);
    const bk=document.createElement('button'); bk.id='docback'; bk.type='button'; bk.textContent='↩ Documentación'; bk.hidden=true;
    bk.style.cssText='position:fixed;left:14px;bottom:14px;z-index:9998;font:15px "Latin Modern Roman",KaTeX_Main,serif;border:1px solid #15803d;background:#15803d;color:#fff;padding:5px 14px;cursor:pointer'; bk.onclick=()=>window.__openDocs(); document.body.appendChild(bk);
  }
  return ov;
}
window.__openDocs=function(){
  const ov=ensureDocOv(); if(!ov) return;
  ov.hidden=false; ov.style.display='flex'; ov.style.visibility='visible'; ov.style.pointerEvents='auto'; document.getElementById('docback').hidden=true; docDark=null; docTheme();
  const fr=document.getElementById('docfr'); try{ fr&&fr.contentWindow&&fr.contentWindow.dispatchEvent(new Event('resize')); }catch(_){}
};
/* precarga: genera el documento y su iframe (oculto) cuando el navegador está libre, para que el primer clic sea inmediato */
window.__preloadDocs=function(){ try{ ensureDocOv(); }catch(e){ console.error(e); } };
(function(){ const go=()=>{ (window.requestIdleCallback||(f=>setTimeout(f,50)))(()=>window.__preloadDocs(),{timeout:4000}); }; if(document.readyState==='complete') setTimeout(go,1800); else addEventListener('load',()=>setTimeout(go,1800)); })();
window.__closeDocs=function(keepBack){ const ov=document.getElementById('docov'); if(ov){ ov.style.display='none'; ov.hidden=true; const bk=document.getElementById('docback'); if(bk) bk.hidden=!keepBack; } };
document.addEventListener('keydown',e=>{ const ov=document.getElementById('docov'); if(e.key==='Escape'&&ov&&ov.style.display!=='none'&&ov.style.visibility!=='hidden') window.__closeDocs(); });
window.addEventListener('message',e=>{
  const d=e.data; if(!d) return;
  if(d.pilibot==='fig4'){ try{ openFig4(); }catch(err){ console.error(err); } return; }
  if(d.pilibot==='step'){ try{ stepDownload(d.id); }catch(err){ console.error(err); } return; }
  if(d.pilibot==='v3d'){ try{ open3D(+d.n); }catch(err){ console.error(err); } return; }
  if(d.pilibot==='pop'){ const u=URL.createObjectURL(new Blob([docHTML],{type:'text/html'}))+'#'+d.sec+(S.dark?'|d':''); const w=window.open(u,'_blank'); if(w) docWins.push(w); else alert('El navegador bloqueó la ventana nueva; permite las ventanas emergentes para este sitio.'); return; }
  if(d.pilibot!=='try'||!Array.isArray(d.acts)) return;
  window.__closeDocs(true); window.focus();
  const run=(a)=>{ const [k,x,y]=a, el=typeof x==='string'&&k!=='btn'?document.getElementById(x):null;
    if(k==='tab'){ window.__openTab&&window.__openTab(x); }
    else if(k==='chk'){ if(el&&el.checked!==!!y) el.click(); }
    else if(k==='rng'){ if(el){ el.value=y; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); } }
    else if(k==='btn'){ const b=document.querySelector(x); if(b) b.click(); }
    else if(k==='click'){ if(el) el.click(); } };
  d.acts.forEach((a,i)=>setTimeout(()=>{ try{ run(a); }catch(err){ console.error(err); } },120*(i+1)));
});

