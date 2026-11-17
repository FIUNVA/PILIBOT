'use strict';
/* ---- paso por fotograma del análisis aerodinámico ---- */
function aeroStep(dt){
  if(!AIR.on||!AN.aero||AN.busy) return;
  const A=AN.aero, th=FL.on?FL.th:0, v=FL.on?(FL.v||0):0;
  if(AIR.t>=0) AIR.t+=dt; const env=windEnv(), Uw=AIR.U*env, d=windDir();
  const wv=new THREE.Vector3(d.x*Uw,d.y*Uw,d.z*Uw);
  if(AIR.app&&FL.on){ wv.x-=(-Math.sin(th)*v+(FL.wx||0))/1000; wv.z-=(-Math.cos(th)*v+(FL.wz||0))/1000; }
  wv.applyAxisAngle(YAX,-th); const U=wv.length(), has=U>0.03;
  const P=AIR.ps; if(P) P.m.visible=has&&(AIR.view!=='cp');
  if(!has){ AIR.hud={U:0}; paintHud(null,0); pushHist(0); return; }
  const u=[wv.x/U,wv.y/U,wv.z/U], now=performance.now();
  if(!AIR.last||Math.acos(Math.min(1,u[0]*AIR.last[0]+u[1]*AIR.last[1]+u[2]*AIR.last[2]))>0.02&&now-AIR.lastT>110){ aeroField(u); AIR.last=u; AIR.lastT=now; }
  const uu=AIR.last||u;
  if(P&&P.m.visible) stepParticles(dt,uu,Math.max(30,U*1000*AIR.slow));
  const q=0.5*1.2*U*U, C=A.coef, k=q*1e-6, F=[C.F[0]*k,C.F[1]*k,C.F[2]*k], Dn=F[0]*uu[0]+F[1]*uu[1]+F[2]*uu[2];
  const Ap=C.Ap*1e-6, Cd=q>1e-6&&Ap>0?Dn/(q*Ap):0;
  const upv=new THREE.Vector3(0,1,0), uv=new THREE.Vector3(uu[0],uu[1],uu[2]); const upp=upv.clone().addScaledVector(uv,-upv.dot(uv)); const L=upp.length()>0.05?F[0]*upp.x/upp.length()+F[1]*upp.y/upp.length()+F[2]*upp.z/upp.length():F[1];
  const Vx=AN.vox, M=Vx.M*1e-3*MASSK(), g=9.81, mu=0.6, Fh=Math.hypot(F[0],F[2]);
  let tipPct=0, slidePct=0; slidePct=100*Fh/(mu*M*g);
  if(Fh>1e-6){ const dh=[F[0]/Fh,F[2]/Fh], com=Vx.com; let bmax=-1e9, px=0, pz=0; const sp=A.sup;
    for(let i=0;i<sp.length;i+=3){ const s=(sp[i]-com.x)*dh[0]+(sp[i+2]-com.z)*dh[1]; if(s>bmax){bmax=s;px=sp[i];pz=sp[i+2];} }
    const T0=[C.T0[0]*q*1e-9,C.T0[1]*q*1e-9,C.T0[2]*q*1e-9], P_=[px*1e-3,Vx.mn.y*1e-3,pz*1e-3], Fv=F;
    const TP=[T0[0]-(P_[1]*Fv[2]-P_[2]*Fv[1]), T0[1]-(P_[2]*Fv[0]-P_[0]*Fv[2]), T0[2]-(P_[0]*Fv[1]-P_[1]*Fv[0])];
    const axis=[dh[1],0,-dh[0]]; // ŷ × (dx,0,dz) = (dz, 0, -dx)
    const tau=TP[0]*axis[0]+TP[1]*axis[1]+TP[2]*axis[2], rest=M*g*Math.max(0.005,bmax*1e-3); tipPct=100*Math.max(0,tau)/rest; }
  AIR.hud={U,q,F,D:Dn,L,Cd,Ap,tip:tipPct,slide:slidePct,M};
  // empuje físico sobre el robot
  if(AIR.push&&FL.on&&!FL.freeze){ const Fw=new THREE.Vector3(F[0],0,F[2]).applyAxisAngle(YAX,FL.th), ax=Fw.x/M*1000, az=Fw.z/M*1000;
    let vx=FL.wx||0, vz=FL.wz||0; const sp=Math.hypot(vx,vz), fr=0.5*g*1000;
    if(sp<2&&Math.hypot(Fw.x,Fw.z)<mu*M*g){ vx=vz=0; } else { vx+=ax*dt; vz+=az*dt; const s2=Math.hypot(vx,vz); if(s2>0){ const dec=Math.min(s2,fr*dt); vx-=vx/s2*dec; vz-=vz/s2*dec; } }
    FL.wx=vx; FL.wz=vz; }
  paintHud(AIR.hud,Uw); pushHist(Dn);
}
function pushHist(v){ const H=AIR.hist; H.push(v); if(H.length>240) H.shift(); const c=$('ae-ch'), g=c.getContext('2d'), W=c.width, Hh=c.height; g.clearRect(0,0,W,Hh);
  const css=getComputedStyle(document.documentElement); g.strokeStyle=css.getPropertyValue('--rule')||'#888'; g.beginPath(); g.moveTo(0,Hh-.5); g.lineTo(W,Hh-.5); g.stroke();
  let mx=0.05; H.forEach(x=>{mx=Math.max(mx,Math.abs(x));}); g.strokeStyle=css.getPropertyValue('--accent')||'#2563eb'; g.lineWidth=1.6; g.beginPath();
  H.forEach((x,i)=>{ const px=i/239*W, py=Hh-6-(Math.abs(x)/mx)*(Hh-14); i?g.lineTo(px,py):g.moveTo(px,py); }); g.stroke();
  g.fillStyle=css.getPropertyValue('--muted')||'#888'; g.font='10px sans-serif'; g.fillText('Arrastre vs. tiempo (máx '+mx.toFixed(2)+' N)',4,10); }
function paintHud(h,Uw){
  const el=$('ae-hud'); if(!h||!h.q){ el.innerHTML='Sin flujo relativo (aire en calma y robot detenido).'; return; }
  const f=(x,n)=>x.toFixed(n), st=v=>v>=100?'<b style="color:#d33">'+f(v,0)+' %</b>':f(v,0)+' %';
  el.innerHTML='Viento relativo <b>'+f(h.U,1)+' m/s</b> · q = '+f(h.q,0)+' Pa<br>Arrastre <b>'+f(h.D,3)+' N</b> · Cd ≈ '+f(h.Cd,2)+' · A<sub>proy</sub> '+f(h.Ap*1e4,1)+' cm²<br>Sustentación '+f(h.L,3)+' N · '+(h.M*1000).toFixed(0)+' g<br>Deslizamiento (μ=0.6): '+st(h.slide)+(h.slide>=100?' → <b>se desplaza</b>':'')+'<br>Volcadura: '+st(h.tip)+(h.tip>=100?' → <b>vuelca</b>':'')+(FL.on?'<br>Desplazado por el viento: '+Math.hypot(FL.x-(AIR.x0||0),FL.z-(AIR.z0||0)).toFixed(0)+' mm':'');
}

/* ====================== ESTRUCTURA ====================== */
const SURF={conc:{k:10000,e:0.30,n:'concreto'},wood:{k:1500,e:0.25,n:'madera'},rub:{k:250,e:0.45,n:'goma'},foam:{k:40,e:0.08,n:'espuma'}};
const ORI={wheels:[0,-1,0],front:[0,0,-1],back:[0,0,1],left:[-1,0,0],right:[1,0,0],top:[0,1,0],corner:[1,-1,-1]};
const ORN={wheels:'sobre las ruedas',front:'sobre la tapa frontal',back:'sobre la tapa posterior',left:'sobre el lado izquierdo',right:'sobre el lado derecho',top:'boca abajo (tapa superior)',corner:'sobre una esquina'};
const HDIR={front:[0,0,1],back:[0,0,-1],left:[1,0,0],right:[-1,0,0],top:[0,-1,0]};
const HDN={front:'de frente',back:'por detrás',left:'desde la izquierda',right:'desde la derecha',top:'desde arriba'};
const ST={test:'drop',orient:'wheels',surf:'conc',H:50,dir:'front',mi:200,v:40,py:55,px:50,amp:15,sl:0.25,aim:false,phase:'idle',res:null,te:-1,y:0,vy:0,hit:false,aimRay:null};
const ramp=(r,out)=>{ const S_=[[0,.17,.35,.85],[.25,.1,.7,.85],[.5,.25,.8,.35],[.75,.95,.85,.2],[1,.95,.45,.1],[1.5,.85,.08,.1],[2.5,.45,0,.35]];
  if(r<0){out[0]=.62;out[1]=.67;out[2]=.76;return;} let k=0; while(k<S_.length-2&&r>S_[k+1][0]) k++; const a=S_[k], b=S_[k+1], t=Math.min(1,Math.max(0,(r-a[0])/(b[0]-a[0])));
  out[0]=a[1]+(b[1]-a[1])*t; out[1]=a[2]+(b[2]-a[2])*t; out[2]=a[3]+(b[3]-a[3])*t; };
drawBar('st-leg',t=>{const o=[0,0,0]; ramp(t*1.5,o); return o;});
function bodyName(bi){ const b=bodies[bi]; return b.o.name||NAMES[bi]||('Pieza interna '+(bi+1)); }
function vIdx(V,x,y,z){ const i=Math.floor((x-V.o.x)/V.h), j=Math.floor((y-V.o.y)/V.h), k=Math.floor((z-V.o.z)/V.h); if(i<0||j<0||k<0||i>=V.nx||j>=V.ny||k>=V.nz) return -1; return i+V.nx*(j+V.ny*k); }
function buildGraph(V){
  if(AN.graph) return AN.graph; const {nx,ny,nz,N,mat,h}=V, sy=nx, sz=nx*ny, gX=new Float32Array(N), gY=new Float32Array(N), gZ=new Float32Array(N);
  const Ec=new Float32Array(MK.length+1); MK.forEach((k,i)=>Ec[i+1]=Math.max(5,Math.pow(MATD[k].E,0.8)));
  for(let k=0;k<nz;k++) for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){ const id=i+nx*(j+ny*k), a=mat[id]; if(!a) continue; const ea=Ec[a];
    if(i<nx-1&&mat[id+1]){ const e=Ec[mat[id+1]]; gX[id]=2*ea*e/(ea+e)*h; }
    if(j<ny-1&&mat[id+sy]){ const e=Ec[mat[id+sy]]; gY[id]=2*ea*e/(ea+e)*h; }
    if(k<nz-1&&mat[id+sz]){ const e=Ec[mat[id+sz]]; gZ[id]=2*ea*e/(ea+e)*h; } }
  return AN.graph={gX,gY,gZ};
}
// raya local → primer voxel sólido
function marchRay(V,o,d,t0,t1){ const br=MID.bri; for(let t=t0;t<=t1;t+=0.4){ const id=vIdx(V,o.x+d.x*t,o.y+d.y*t,o.z+d.z*t); if(id>=0&&V.mat[id]&&V.mat[id]!==br) return {id,t}; } return null; }
async function structSolve(cfg,st){
  const V=AN.vox, G=buildGraph(V), {nx,ny,nz,N,mat,bid,h}=V, sy=nx, sz=nx*ny, br=MID.bri, M=V.M*1e-3;
  const patch=cfg.patch; const isP=new Uint8Array(N); patch.forEach(i=>isP[i]=1);
  let Kc=0; patch.forEach(i=>{ Kc+=MATD[MK[mat[i]-1]].E*h*h/6; });
  const Kg=4000, Kf=cfg.Kf||1e9, Keff=1/(1/Math.max(Kc,1)+1/Kg+1/Kf);
  const E=cfg.E, F=Math.sqrt(2*Keff*E*1000), a_g=F/(M*9.81), Tms=Math.PI*Math.sqrt(M/(Keff*1000))*1000, dent=F/Keff;
  // componente conexa desde el parche
  const comp=new Uint8Array(N), stk=new Int32Array(N); let sp=0; patch.forEach(i=>{ comp[i]=1; stk[sp++]=i; });
  const {gX,gY,gZ}=G;
  while(sp){ const i=stk[--sp], x=i%nx, y=((i/nx)|0)%ny, z=(i/sz)|0; const tryp=(j,g)=>{ if(g>0&&!comp[j]){ comp[j]=1; stk[sp++]=j; } };
    if(x<nx-1) tryp(i+1,gX[i]); if(x>0) tryp(i-1,gX[i-1]); if(y<ny-1) tryp(i+sy,gY[i]); if(y>0) tryp(i-sy,gY[i-sy]); if(z<nz-1) tryp(i+sz,gZ[i]); if(z>0) tryp(i-sz,gZ[i-sz]); }
  const act=new Uint8Array(N), b=new Float64Array(N+sz+2), u=new Float64Array(N+sz+2); let nc=0;
  for(let i=0;i<N;i++){ if(comp[i]&&!isP[i]&&mat[i]!==br){ act[i]=1; b[i]=F*(MATD[MK[mat[i]-1]].rho*h*h*h/1000)/V.M; nc++; } else if(comp[i]&&!isP[i]) act[i]=1; }
  st('Resolviendo el reparto de esfuerzos ('+nc+' voxeles)…'); await tick();
  const cg=cgGrid(nx,ny,nz,act,gX,gY,gZ,b,u,700,1e-5);
  // esfuerzo equivalente por flujo de carga
  const sig=new Float32Array(N), rat=new Float32Array(N).fill(-1), A2=h*h;
  const ul=[]; for(let i=0;i<N;i++) if(comp[i]&&mat[i]!==br) ul.push(u[i]); ul.sort((p,q)=>p-q); const ucap=Math.max(1e-9,ul[Math.floor(ul.length*0.97)]||1e-9);
  for(let i=0;i<N;i++){ if(!comp[i]||mat[i]===br) continue; const x=i%nx, y=((i/nx)|0)%ny, z=(i/sz)|0; let sm=0;
    const fx=((x<nx-1&&comp[i+1]?Math.abs(gX[i]*(u[i]-u[i+1])):0)+(x>0&&comp[i-1]?Math.abs(gX[i-1]*(u[i-1]-u[i])):0))/2;
    const fy=((y<ny-1&&comp[i+sy]?Math.abs(gY[i]*(u[i]-u[i+sy])):0)+(y>0&&comp[i-sy]?Math.abs(gY[i-sy]*(u[i-sy]-u[i])):0))/2;
    const fz=((z<nz-1&&comp[i+sz]?Math.abs(gZ[i]*(u[i]-u[i+sz])):0)+(z>0&&comp[i-sz]?Math.abs(gZ[i-sz]*(u[i-sz]-u[i])):0))/2;
    sm=Math.max(fx,fy,fz)/A2*6; sig[i]=sm; /* ×6: concentración de esfuerzos (paredes delgadas, filetes, flexión) */ rat[i]=sm/MATD[MK[mat[i]-1]].sy; }
  // máximos por cuerpo
  const mr=new Float32Array(bodies.length), ms=new Float32Array(bodies.length); for(let i=0;i<N;i++){ if(rat[i]>=0&&bid[i]>=0){ if(rat[i]>mr[bid[i]]) mr[bid[i]]=rat[i]; if(sig[i]>ms[bid[i]]) ms[bid[i]]=sig[i]; } }
  // dilatación 3×3×3 (máximo)
  const Rd=new Float32Array(N).fill(-1), Wd=new Float32Array(N), Pd=new Float32Array(N);
  for(let k=1;k<nz-1;k++) for(let j=1;j<ny-1;j++) for(let i=1;i<nx-1;i++){ const id=i+nx*(j+ny*k); const r=rat[id]; if(r<0) continue;
    const w=Math.pow(Math.max(0,1-u[id]/ucap),2), pf=Math.min(1,Math.max(0,(r-0.8)/1.2))*0.55;
    for(let dz=-1;dz<=1;dz++) for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){ const q=id+dx+dy*sy+dz*sz; if(r>Rd[q]) Rd[q]=r; if(w>Wd[q]) Wd[q]=w; const pw=w*pf; if(pw>Pd[q]) Pd[q]=pw; } }
  return {F,Keff,Kc,a_g,Tms,dent,E,M,nc,cg,Rd,Wd,Pd,mr,ms,ucap};
}
function structPaint(R){
  const V=AN.vox, h=V.h; const out=[0,0,0]; R.vE=[]; R.vP=[];
  bodies.forEach((b,bi)=>{ const n=b.pos.length/3, col=AN.cols[bi], vE=new Float32Array(n), vP=new Float32Array(n);
    for(let k=0;k<n;k++){ const id=vIdx(V,b.pos[3*k],b.pos[3*k+1],b.pos[3*k+2]); const r=id>=0?R.Rd[id]:-1; ramp(r,out); col[3*k]=out[0];col[3*k+1]=out[1];col[3*k+2]=out[2];
      if(id>=0){ vE[k]=R.Wd[id]; vP[k]=R.Pd[id]; } }
    R.vE.push(vE); R.vP.push(vP); });
}
function structReport(R,hdr){
  const rows=[]; bodies.forEach((b,bi)=>{ const m=MK[MID[matOf(b,bi)]-1]; rows.push({bi,r:R.mr[bi],s:R.ms[bi],m}); });
  const grp=new Map(); rows.forEach(x=>{ if(x.r<=0) return; const nm=bodyName(x.bi).replace(/ \(?(der|izq)\.?\)?/g,'').replace(/ · .*/,' · …').slice(0,46); const g=grp.get(nm); if(!g||x.r>g.r) grp.set(nm,x); });
  const list=[...grp.entries()].map(([nm,x])=>({nm,...x})).filter(x=>x.m!=='rub'&&x.m!=='cab').sort((a,b)=>b.r-a.r).slice(0,5);
  const worst=list.length?list[0].r:0, brit=list.filter(x=>MATD[x.m].br&&x.r>=1);
  let verdict='<b style="color:#2a9d4a">SIN DAÑO</b> (todas las piezas por debajo de su límite)'; if(worst>=0.6) verdict='<b style="color:#d98a00">ESFUERZO ALTO</b> (sin falla)';
  if(worst>=1) verdict=brit.length?'<b style="color:#d33">FRACTURA PROBABLE</b>':'<b style="color:#d33">DEFORMACIÓN PLÁSTICA</b>';
  R.worst=worst; R.verdict=verdict;
  const f=(x,n)=>x.toFixed(n);
  let html=hdr+'Masa '+f(R.M*1000,0)+' g · F<sub>máx</sub> <b>'+f(R.F,0)+' N</b> · desaceleración <b>'+f(R.a_g,0)+' g</b><br>Duración del contacto '+f(R.Tms,2)+' ms · penetración '+f(R.dent,2)+' mm<br>Estado: '+verdict+'<br><span style="opacity:.85">Piezas más esforzadas (σ / σ<sub>y</sub>):</span><br>';
  html+=list.map(x=>'• '+x.nm+' | '+f(x.s,0)+' MPa · '+(x.r>=1?'<b style="color:#d33">':'<b>')+f(x.r,2)+'</b> '+MATD[x.m].n).join('<br>');
  html+='<br><span style="opacity:.7">σ incluye Kt·Kd = 6 (concentración de esfuerzos y amplificación dinámica); modelo de trayectoria de carga, no FEM completo.</span>'; return html;
}
function setPoseDrop(R,y){
  const q=ST.Q, P=ST.Pw; pose.quaternion.copy(q); const rp=P.clone().applyQuaternion(q); pose.position.set(P.x-rp.x,P.y-rp.y+ST.dy0+y,P.z-rp.z);
}
function structRestore(){
  if(AN.p0){ bodies.forEach((b,bi)=>{ b.pos.set(AN.p0[bi]); b.g.attributes.position.needsUpdate=true; }); AN.p0=null; }
  pose.position.set(0,0,0); pose.quaternion.identity(); if(ST.imp){ root.remove(ST.imp); ST.imp=null; }
  FL.freeze=false; FL.wx=FL.wz=0; ST.phase='idle'; ST.res=null; ST.te=-1; ST.hit=false; ST.aimRay=null;
}
function dispApply(sE,sP){
  const R=ST.res; if(!R||!AN.p0) return; const d=R.Din, dl=Math.min(R.dent*ST.amp,14);
  bodies.forEach((b,bi)=>{ const P=b.pos, P0=AN.p0[bi], vE=R.vE[bi], vP=R.vP[bi], n=vE.length;
    for(let k=0;k<n;k++){ const s=dl*(sE*vE[k]+sP*vP[k]); P[3*k]=P0[3*k]+d.x*s; P[3*k+1]=P0[3*k+1]+d.y*s; P[3*k+2]=P0[3*k+2]+d.z*s; }
    b.g.attributes.position.needsUpdate=true; });
}
function impactNow(){
  const R=ST.res; if(!R) return; ST.hit=true; ST.te=0; AN.p0=bodies.map(b=>b.pos.slice()); ovlOn('struct'); structPaint(R); ovlRefresh(); $('st-hud').innerHTML=R.html;
}
async function structRun(){
  if(AN.busy) return; AN.busy=true; anLoad('Preparando el análisis estructural…','Análisis estructural'); anFr.k=0; const st=m=>{$('st-st').textContent=m; anLoad(m,null,anFr(m));}; await tick();
  try{
    if(AN.mode==='aero'){ $('ae-on').checked=false; aeroSet(false); }
    structRestore(); if(AN.ovl) ovlOff(); AN.mode='struct'; ST.s0=0;
    if(!FL.on){ $('fl-on').checked=true; flSet(true); } FL.freeze=true; FL.wx=FL.wz=0; if(EX.level>0){EX.playing=false;setLevel(0);}
    const V=await ensureVox(st); const h=V.h, mat=V.mat, br=MID.bri, nx=V.nx, ny=V.ny, nz=V.nz;
    const C=ctr.clone(); let cfg, hdr, Din, res;
    if(ST.test==='drop'){
      const Dl=new THREE.Vector3(...ORI[ST.orient]).normalize(); let smax=-1e9; const sol=[];
      for(let iz=0;iz<nz;iz++) for(let iy=0;iy<ny;iy++) for(let ix=0;ix<nx;ix++){ const id=ix+nx*(iy+ny*iz), m=mat[id]; if(!m||m===br) continue;
        const s=(V.o.x+(ix+.5)*h-C.x)*Dl.x+(V.o.y+(iy+.5)*h-C.y)*Dl.y+(V.o.z+(iz+.5)*h-C.z)*Dl.z; sol.push(id,s); if(s>smax) smax=s; }
      const patch=[]; for(let i=0;i<sol.length;i+=2) if(sol[i+1]>=smax-1.6) patch.push(sol[i]);
      const Hm=ST.H*10, v=Math.sqrt(2*9810*Hm)/1000, Mk=V.M*1e-3, Ei=Mk*9.81*Hm/1000, S_=SURF[ST.surf];
      cfg={patch,E:Ei,Kf:S_.k}; Din=Dl.clone().multiplyScalar(-1);
      hdr='Caída <b>'+ST.H+' cm</b> '+ORN[ST.orient]+' sobre '+S_.n+'<br>Velocidad de impacto '+v.toFixed(2)+' m/s · energía '+Ei.toFixed(2)+' J<br>';
      res=await structSolve(cfg,st); res.Din=Din; res.e=S_.e; res.kind='drop'; res.v=v; res.Dl=Dl; res.smax=smax;
      const Wc=new THREE.Vector3(), q=new THREE.Quaternion(); const Dw=Dl.clone().applyAxisAngle(YAX,FL.th); q.setFromUnitVectors(Dw,new THREE.Vector3(0,-1,0));
      pose.position.set(0,0,0); pose.quaternion.identity(); pose.updateMatrixWorld(true); const Pw=root.localToWorld(C.clone());
      ST.Q=q; ST.Pw=Pw; ST.dy0=GY()+smax-Pw.y; ST.y=Hm; ST.vy=0; setPoseDrop(res,ST.y);
      res.html=structReport(res,hdr); res.html+='<br>Altura crítica en esta orientación ≈ <b>'+(ST.H/Math.max(1e-6,res.worst*res.worst)).toFixed(0)+' cm</b>';
      ST.res=res; ST.hit=false; ST.phase='fall';
    } else {
      let D, ray=ST.aimRay; const bb=[V.mn,V.mx];
      if(ray){ D=ray.d.clone().normalize(); } else { D=new THREE.Vector3(...HDIR[ST.dir]); }
      let o0; const fy=V.mn.y+(V.mx.y-V.mn.y)*ST.py/100, fl=ST.px/100, cxm=(V.mn.x+V.mx.x)/2, czm=(V.mn.z+V.mx.z)/2;
      if(ray) o0=ray.o.clone(); else { const aim=new THREE.Vector3();
        if(ST.dir==='front'||ST.dir==='back') aim.set(V.mn.x+(V.mx.x-V.mn.x)*fl,fy,czm);
        else if(ST.dir==='left'||ST.dir==='right') aim.set(cxm,fy,V.mn.z+(V.mx.z-V.mn.z)*fl);
        else aim.set(V.mn.x+(V.mx.x-V.mn.x)*fl,V.mx.y,V.mn.z+(V.mx.z-V.mn.z)*ST.py/100);
        o0=aim.addScaledVector(D,-200); }
      const hit=marchRay(V,o0,D,0,1200); if(!hit){ st('El golpe no alcanza al robot: ajusta el punto de impacto.'); ST.phase='idle'; FL.freeze=false; AN.busy=false; return; }
      const P=o0.clone().addScaledVector(D,hit.t); const patch=[]; const rr=3.5;
      for(let dz=-4;dz<=4;dz++) for(let dy=-4;dy<=4;dy++) for(let dx=-4;dx<=4;dx++){ const x=P.x+dx*h, y=P.y+dy*h, z=P.z+dz*h; if(dx*dx+dy*dy+dz*dz>rr*rr) continue; const id=vIdx(V,x,y,z); if(id>=0&&mat[id]&&mat[id]!==br) patch.push(id); }
      const mi=ST.mi/1000, v=ST.v/10, Mk=V.M*1e-3, mu=mi*Mk/(mi+Mk), Er=0.5*mu*v*v;
      cfg={patch,E:Er,Kf:1e9}; Din=D.clone();
      hdr='Golpe <b>'+(ray?'apuntado con clic':HDN[ST.dir])+'</b> · impactor '+ST.mi+' g a '+v.toFixed(1)+' m/s<br>Energía transferida '+Er.toFixed(2)+' J<br>';
      res=await structSolve(cfg,st); res.Din=Din; res.e=0.4; res.kind='hit'; res.Phit=P; res.D=D; res.v=v; res.mi=mi;
      res.html=structReport(res,hdr); res.html+='<br>Velocidad crítica del impactor ≈ <b>'+(v/Math.max(1e-6,res.worst)).toFixed(1)+' m/s</b>';
      // dinámica del robot: cuerpo rígido plano con contacto y fricción (simulado de antemano)
      const Dh=new THREE.Vector3(D.x,0,D.z), horiz=Dh.length()>0.5; res.horiz=horiz;
      if(horiz){ Dh.normalize(); const com=V.com; res.Dh=Dh;
        const cs=[]; for(const cx of [V.mn.x,V.mx.x]) for(const cz of [V.mn.z,V.mx.z]) cs.push(((cx-com.x)*Dh.x+(cz-com.z)*Dh.z)*1e-3);
        const sMin=Math.min(...cs), sMax=Math.max(...cs), hc=Math.max(0.005,(com.y-V.mn.y)*1e-3), ht=Math.max(0.005,(V.mx.y-com.y)*1e-3);
        const Jt=(1+0.4)*mu, Jx=Jt*v*Math.hypot(D.x,D.z), Jy=Jt*v*D.y, rx=((P.x-com.x)*Dh.x+(P.z-com.z)*Dh.z)*1e-3, ry=(P.y-com.y)*1e-3;
        const sim=simBox({sMin,sMax,hc,ht,M:Mk,Jx,Jy,rx,ry}); res.sim=sim;
        res.html+='<br>Tras el golpe: velocidad inicial '+(Jx/Mk).toFixed(2)+' m/s · recorre <b>'+(sim.dist*1000).toFixed(0)+' mm</b>'+(sim.hmax>0.02?' · se eleva '+(sim.hmax*100).toFixed(0)+' cm':'')+(sim.rot>=1.3?' · <b style="color:#d33">VUELCA'+(sim.turns>1.5?' y rueda ('+sim.turns.toFixed(1)+' vueltas)':'')+'</b>':' · se inclina '+(sim.rot*180/Math.PI).toFixed(1)+'°')+' · se detiene en '+sim.tend.toFixed(1)+' s'; }
      ST.res=res; ST.hit=false; ST.phase='approach'; ST.ta=0;
      if(!ST.imp){ ST.imp=new THREE.Mesh(new THREE.SphereGeometry(8,28,18),new THREE.MeshLambertMaterial({color:0xd0382b})); root.add(ST.imp); }
      ST.imp.position.copy(P).addScaledVector(D,-(8+140));
    }
    st('Listo: '+(ST.test==='drop'?'cayendo…':'golpeando…'));
  } catch(e){ console.error(e); $('st-st').textContent='Error: '+e.message; }
  AN.busy=false;
}
function structStep(dt){
  const R=ST.res; if(!R||ST.phase==='idle') return;
  if(ST.phase==='fall'){ const tp=dt*ST.sl, n=Math.max(1,Math.ceil(tp/0.002)), hh=tp/n;
    for(let i=0;i<n;i++){ ST.vy-=9810*hh; ST.y+=ST.vy*hh; if(ST.y<=0){ ST.y=0; if(!ST.hit) impactNow(); ST.vy=-ST.vy*R.e; if(ST.vy<250){ ST.vy=0; ST.phase='settle'; break; } } }
    setPoseDrop(R,ST.y); }
  else if(ST.phase==='approach'){ ST.ta+=dt; const t=Math.min(1,ST.ta/0.9), dist=140*(1-t*t); ST.imp.position.copy(R.Phit).addScaledVector(R.D,-(8+dist));
    if(t>=1){ impactNow(); ST.phase='react'; ST.tr=0; ST.trr=0; ST.c0=null; } }
  else if(ST.phase==='react'){ ST.trr=(ST.trr||0)+dt; if(ST.imp&&ST.trr>0.5){ root.remove(ST.imp); ST.imp=null; }
    const Sm=R.sim; if(R.horiz!==false&&Sm&&R.Dh){
      if(ST.c0===undefined||ST.c0===null){ ST.c0=root.localToWorld(AN.vox.com.clone()); ST.sP=0; ST.tr=0; ST.hc0=Math.max(0.005,(ST.c0.y-GY())*1e-3); }
      ST.tr+=dt*ST.sl; const f=Math.min(Sm.n-1,ST.tr*120), i0=Math.floor(f), i1=Math.min(Sm.n-1,i0+1), a=f-i0, L=(arr)=>arr[i0]*(1-a)+arr[i1]*a;
      const s=L(Sm.s), y=L(Sm.y), th=L(Sm.th), dw=R.Dh.clone().applyAxisAngle(YAX,FL.th), ds=(s-ST.sP)*1000; ST.sP=s; FL.x+=dw.x*ds; FL.z+=dw.z*ds;
      const cc=ST.c0.clone().addScaledVector(dw,s*1000), axis=new THREE.Vector3().crossVectors(dw,new THREE.Vector3(0,1,0)).normalize(), q=new THREE.Quaternion().setFromAxisAngle(axis,th); pose.quaternion.copy(q);
      const rp=cc.clone().applyQuaternion(q); pose.position.set(cc.x-rp.x,cc.y-rp.y+(y-Sm.y[0])*1000,cc.z-rp.z);
      if(ST.tr>Sm.tend+0.3) ST.phase='done'; }
    else if(ST.trr>3) ST.phase='done'; }
  else if(ST.phase==='settle'){ ST.ts=(ST.ts||0)+dt; if(ST.ts>2.8) ST.phase='done'; }
  if(ST.te>=0){ ST.te+=dt; const t=ST.te, sE=t<0.12?Math.sin(Math.PI/2*t/0.12):Math.exp(-(t-0.12)/0.35)*(0.82+0.18*Math.cos(26*(t-0.12))), sP=sst(0.05,0.9,t); dispApply(sE,sP); if(t>4) ST.te=-2; }
}
function simBox(o){
  const g=9.81, M=o.M, mu=0.6, e=0.2, Tc=0.004, hh=o.sMax-o.sMin, I=M*(hh*hh+(o.hc+o.ht)*(o.hc+o.ht))/12, sc=(o.sMax+o.sMin)/2;
  const K=M*Math.pow(2*Math.PI/0.005,2)/4, zt=-Math.log(e)/Math.sqrt(Math.PI*Math.PI+Math.log(e)*Math.log(e)), C=2*zt*Math.sqrt(K*M/2);
  const cr=[[o.sMin,-o.hc],[o.sMax,-o.hc],[o.sMin,o.ht],[o.sMax,o.ht]];
  let s=0,y=o.hc,th=0,vs=0,vy=0,w=0;
  const h=1/20000, rec=1/120, out={s:[],y:[],th:[]}; let thm=0, t=0, nr=0, rest=0, rot=0, hmax=0, smax=0, thP=0; const N=Math.floor(8/h);
  for(let n=0;n<N;n++){
    let Fs=0,Fy=-M*g,T=0, c=Math.cos(th), sn=Math.sin(th);
    if(t<Tc){ const jx=o.Jx/Tc, jy=o.Jy/Tc; Fs+=jx; Fy+=jy; T+=o.rx*jy-o.ry*jx; }
    { const sp=Math.hypot(vs,vy); Fs-=0.006*sp*vs; Fy-=0.006*sp*vy; T-=3e-6*Math.abs(w)*w; }
    for(const q of cr){ const X=q[0]*c-q[1]*sn, Y=q[0]*sn+q[1]*c, py=y+Y; if(py>=0) continue;
      const vx=vs-w*Y, vyc=vy+w*X, N_=Math.max(0,K*(-py)-C*vyc), ft=-mu*N_*Math.tanh(vx/0.02);
      Fs+=ft; Fy+=N_; T+=X*N_-Y*ft; }
    vs+=Fs/M*h; vy+=Fy/M*h; w+=T/I*h; s+=vs*h; y+=vy*h; th+=w*h; t+=h; rot+=Math.abs(w)*h; if(y-o.hc>hmax) hmax=y-o.hc; if(Math.abs(th)>thm) thm=Math.abs(th); 
    if(n%Math.round(rec/h)===0){ out.s.push(s); out.y.push(y); out.th.push(th); }
    const sp=Math.hypot(vs,vy)+Math.abs(w)*0.05; if(sp<0.02&&y<o.hc*1.3){ rest+=h; if(rest>0.4){ break; } } else rest=0;
  }
  out.n=out.s.length; out.dist=s; out.tend=t-0.4; out.hmax=hmax; out.rot=thm; out.turns=rot/(2*Math.PI); out.sc=sc; out.tend=Math.max(0.1,t-0.4); return out;
}
function rotPose(dw,ang,R){
  const V=AN.vox, com=root.localToWorld(V.com.clone()); const pv=new THREE.Vector3(com.x+dw.x*R.bm,GY()+0,com.z+dw.z*R.bm);
  const axis=new THREE.Vector3(0,1,0).cross(dw).normalize(), q=new THREE.Quaternion().setFromAxisAngle(axis,ang); pose.quaternion.copy(q); const rp=pv.clone().applyQuaternion(q); pose.position.set(pv.x-rp.x,pv.y-rp.y,pv.z-rp.z);
}

/* ====================== INTERFAZ DEL ANÁLISIS ====================== */
function stepAnalysis(dt){ try{ aeroStep(dt); structStep(dt); }catch(e){ console.error('analysis',e); ST.phase='idle'; AIR.on=false; } }
async function aeroSet(on){
  if(on){
    if(AN.busy){ $('ae-on').checked=false; return; }
    if(AN.mode==='struct'){ $('st-on').checked=false; structRestore(); ovlOff(); }
    AN.busy=true; anLoad('Preparando el análisis aerodinámico…','Análisis aerodinámico'); anFr.k=0; const st=m=>{$('ae-st').textContent=m; anLoad(m,null,anFr(m));}; await tick();
    try{ const A=await ensureAero(st); aeroPrepareParticles(); AIR.on=true; AIR.last=null; AIR.x0=FL.x; AIR.z0=FL.z; ovlOn('aero'); st(AIR.info+'. Ajusta el viento o lanza un golpe de aire.'); if(AIR.mode==='gust'||AIR.mode==='bang') AIR.t=0; }
    catch(e){ console.error(e); $('ae-st').textContent='Error: '+e.message; AIR.on=false; $('ae-on').checked=false; }
    AN.busy=false;
  } else {
    AIR.on=false; if(AIR.ps) AIR.ps.m.visible=false; FL.wx=FL.wz=0; if(AN.mode==='aero') ovlOff(); $('ae-st').textContent='Análisis desactivado.'; $('ae-hud').textContent='';
  }
}
$('ae-on').onchange=e=>aeroSet(e.target.checked);
const azName=a=>a<20||a>340?'frente':a<70?'frente-der.':a<110?'derecha':a<160?'atrás-der.':a<200?'atrás':a<250?'atrás-izq.':a<290?'izquierda':'frente-izq.';
function aeLabels(){ $('ae-uv').textContent=AIR.U.toFixed(1)+' m/s'; $('ae-azv').textContent=AIR.az+'° · '+azName(AIR.az); $('ae-elv').textContent=AIR.el+'°'; $('ae-dv').textContent=AIR.dur.toFixed(1)+' s'; $('ae-sv').textContent='×'+AIR.slow.toFixed(3); }
function launch(){ AIR.t=0; AIR.last=null; }
$('ae-u').oninput=e=>{AIR.U=+e.target.value; aeLabels();};
$('ae-az').oninput=e=>{AIR.az=+e.target.value; AIR.last=null; aeLabels();};
$('ae-el').oninput=e=>{AIR.el=+e.target.value; AIR.last=null; aeLabels();};
$('ae-d').oninput=e=>{AIR.dur=+e.target.value/10; aeLabels();};
$('ae-s').oninput=e=>{AIR.slow=+e.target.value/1000; aeLabels();};
function setMode(m){ AIR.mode=m; document.querySelectorAll('[data-am]').forEach(b=>b.classList.toggle('on',b.dataset.am===m)); if(m==='gust'||m==='bang') launch(); }
document.querySelectorAll('[data-am]').forEach(b=>b.onclick=()=>setMode(b.dataset.am));
$('ae-go').onclick=()=>{ if(AIR.mode==='const'||AIR.mode==='turb') setMode('gust'); launch(); };
const PRE={front:{az:0,el:0,U:15,mode:'gust'},back:{az:180,el:0,U:15,mode:'gust'},side:{az:90,el:0,U:15,mode:'gust'},down:{az:0,el:75,U:18,mode:'gust'},bang:{az:0,el:0,U:32,mode:'bang'},calm:{az:0,el:0,U:0,mode:'const'}};
document.querySelectorAll('[data-ap]').forEach(b=>b.onclick=()=>{ const p=PRE[b.dataset.ap]; AIR.az=p.az; AIR.el=p.el; AIR.U=p.U; $('ae-az').value=p.az; $('ae-el').value=p.el; $('ae-u').value=p.U; setMode(p.mode); aeLabels(); if(!AIR.on){ $('ae-on').checked=true; aeroSet(true); } AIR.last=null; });
document.querySelectorAll('[data-av]').forEach(b=>b.onclick=()=>{ AIR.view=b.dataset.av; document.querySelectorAll('[data-av]').forEach(x=>x.classList.toggle('on',x===b)); 
  if(AIR.view==='flow'&&AN.aero){ bodies.forEach((bb,bi)=>{ AN.cols[bi].fill(.72); }); AIR.flowOnly=true; } else AIR.flowOnly=false; AIR.last=null; ovlRefresh(); });
$('ae-x').onchange=e=>AN.setX(e.target.checked); $('st-x').onchange=e=>AN.setX(e.target.checked);
$('ae-app').onchange=e=>{AIR.app=e.target.checked;}; $('ae-push').onchange=e=>{AIR.push=e.target.checked; if(!AIR.push) FL.wx=FL.wz=0;};
aeLabels();

