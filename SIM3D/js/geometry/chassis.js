'use strict';
/* ---------- chasis interno: placa de motores, motores N20, ruedas, rueda loca y banda (B-Rep exacto) ---------- */
Object.assign(accCols,{
 plate:{light:[0xc9d6ea,0x1d4ed8],dark:[0x1a2b47,0x60a5fa]},
 bracket:{light:[0x7f9fd0,0x1e3a8a],dark:[0x3b5a8c,0x93c5fd]},
 motor:{light:[0xb4bfce,0x334155],dark:[0x6b7b93,0xcbd5e1]},
 gearbox:{light:[0xd9a62a,0x6b4a05],dark:[0xdcae3a,0xffe9a8]},
 wheel:{light:[0x2b3b5c,0x0b1f3a],dark:[0x2c3e5e,0x86abf0]},
 wheelC:{light:[0x3f74c4,0x0b1f3a],dark:[0x2f5aa3,0x9ec5ff]},
 bearing:{light:[0xd7dfeb,0x334155],dark:[0xaab6c8,0xe2e8f0]}});
const INT=[];
const MOT={R:{on:false,dir:-1,spd:40,ang:0,rpm:0},L:{on:false,dir:-1,spd:40,ang:0,rpm:0}};
const SPIN=[], LUGS=[];
function makeLugs(d){
  const Lg=d.lugs, N=Lg.n, Ri=Lg.ri, Ro=Lg.ro, xm=(Lg.x0+Lg.x1)/2;
  const c1=new THREE.Vector2(Lg.c1[0],Lg.c1[1]), c2=new THREE.Vector2(Lg.c2[0],Lg.c2[1]);   // (y,z)
  const dv=c2.clone().sub(c1), Ls=dv.length(); dv.normalize();
  const nm=new THREE.Vector2(-dv.y,dv.x), r90=v=>new THREE.Vector2(-v.y,v.x);
  const rot=(v,a)=>new THREE.Vector2(v.x*Math.cos(a)-v.y*Math.sin(a),v.x*Math.sin(a)+v.y*Math.cos(a));
  const Lp=2*Ls+2*Math.PI*Ri, arc=Math.PI*Ri;
  function path(s){                      // lazo horario: posición, normal exterior y tangente a lo largo de la banda
    s=((s%Lp)+Lp)%Lp; let p,n,tg;
    if(s<Ls){ n=nm; tg=dv; p=c1.clone().addScaledVector(nm,Ri).addScaledVector(dv,s); }
    else if(s<Ls+arc){ n=rot(nm,-(s-Ls)/Ri); tg=r90(n).negate(); p=c2.clone().addScaledVector(n,Ri); }
    else if(s<2*Ls+arc){ const u=s-Ls-arc; n=nm.clone().negate(); tg=dv.clone().negate(); p=c2.clone().addScaledVector(nm,-Ri).addScaledVector(dv,-u); }
    else { n=rot(nm.clone().negate(),-(s-2*Ls-arc)/Ri); tg=r90(n).negate(); p=c1.clone().addScaledVector(n,Ri); }
    return {p,n,tg};
  }
  // Relieve continuo: UN solo sólido por rayita, que recorre la cara plana y sigue el redondeo del borde (r=1) sin cortes
  const SURF=[]; { const prof=[]; const ph=[90,75,60,45,30,18,10];
    ph.forEach(f=>{ const r=f*Math.PI/180; prof.push({c:3.5+Math.cos(r),b:-1+Math.sin(r),nc:Math.cos(r),nb:Math.sin(r),H:0.05+0.5*(f-10)/80}); });
    // lado + (de c=3.5 hacia el borde) y su espejo; el tramo plano queda entre c=-3.5 y 3.5
    const pos=prof.slice(); const neg=prof.map(p=>({c:-p.c,b:p.b,nc:-p.nc,nb:p.nb,H:p.H})).reverse();
    neg.concat([{c:0,b:0,nc:0,nb:1,H:0.55}],pos).forEach(p=>SURF.push(p)); }
  const LV=[], LN=[], LE=[], idx=[];
  const ring=p=>[[p.c-.4*p.nc,-.95,p.b-.4*p.nb],[p.c-.4*p.nc,.95,p.b-.4*p.nb],[p.c+p.H*p.nc,.45,p.b+p.H*p.nb],[p.c+p.H*p.nc,-.45,p.b+p.H*p.nb]];
  const RG=SURF.map(ring);
  function addQuad(q,cen){   // q: 4 puntos locales; se orienta hacia fuera respecto al centro cen
    const u=[q[1][0]-q[0][0],q[1][1]-q[0][1],q[1][2]-q[0][2]], w=[q[2][0]-q[0][0],q[2][1]-q[0][1],q[2][2]-q[0][2]];
    let n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]]; const l=Math.hypot(...n)||1; n=n.map(x=>x/l);
    const m=[0,1,2].map(i=>(q[0][i]+q[1][i]+q[2][i]+q[3][i])/4-cen[i]);
    let qq=q; if(n[0]*m[0]+n[1]*m[1]+n[2]*m[2]<0){ qq=[q[0],q[3],q[2],q[1]]; n=n.map(x=>-x); }
    const o=LV.length; qq.forEach(v=>{ LV.push(v); LN.push(n); }); idx.push(o,o+1,o+2,o,o+2,o+3); }
  const cen=[0,0,0]; { let cnt=0; RG.forEach(r=>r.forEach(v=>{ cen[0]+=v[0];cen[1]+=v[1];cen[2]+=v[2];cnt++; })); cen[0]/=cnt;cen[1]/=cnt;cen[2]/=cnt; }
  for(let j=0;j<RG.length-1;j++){ const A_=RG[j],B_=RG[j+1];
    for(let e=0;e<4;e++){ const e2=(e+1)%4; addQuad([A_[e],A_[e2],B_[e2],B_[e]],cen); } }
  addQuad(RG[0],cen); addQuad(RG[RG.length-1],cen);
  // aristas: sólo las dos líneas continuas de la cara superior y los contornos de los extremos
  for(let j=0;j<RG.length-1;j++){ LE.push(RG[j][2],RG[j+1][2],RG[j][3],RG[j+1][3]); }
  const NV=LV.length, NE=LE.length;
  const P=new Float32Array(N*NV*3), Nn=new Float32Array(N*NV*3), Ep=new Float32Array(N*NE*3), IX=[];
  for(let k=0;k<N;k++) for(const i of idx) IX.push(k*NV+i);
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('normal',new THREE.BufferAttribute(Nn,3)); g.setIndex(IX);
  const eg=new THREE.BufferGeometry(); eg.setAttribute('position',new THREE.BufferAttribute(Ep,3));
  let phase=0;
  function update(ph){
    phase=ph;
    for(let k=0;k<N;k++){
      const {p,n,tg}=path(ph+k*Lp/N), q0=p.clone().addScaledVector(n,Ro-Ri), qy=q0.x, qz=q0.y;
      for(let v=0;v<NV;v++){ const [c,a,b]=LV[v], o=(k*NV+v)*3;
        P[o]=xm+c; P[o+1]=qy+tg.x*a+n.x*b; P[o+2]=qz+tg.y*a+n.y*b;
        const [nc,na,nb]=LN[v]; Nn[o]=nc; Nn[o+1]=tg.x*na+n.x*nb; Nn[o+2]=tg.y*na+n.y*nb; }
      for(let v=0;v<NE;v++){ const [c,a,b]=LE[v], o=(k*NE+v)*3;
        Ep[o]=xm+c; Ep[o+1]=qy+tg.x*a+n.x*b; Ep[o+2]=qz+tg.y*a+n.y*b; }
    }
    g.attributes.position.needsUpdate=g.attributes.normal.needsUpdate=eg.attributes.position.needsUpdate=true;
  }
  update(0);
  return {g,eg,update,Ri,get phase(){return phase;}};
}
let LEDB=null; const RLEDS=[], BELTS=[];
const BDESC={}; DATA2.forEach(d=>{ if(d.lugs) BDESC[/\((.*)\)/.exec(d.name)[1]]=d; });
/* colores por triángulo de los componentes: ESP32-C3, DRV8833 (modelo 3D y diagramas) */
const colR=(h)=>{ const c=new THREE.Color(h); return [c.r,c.g,c.b]; };
const ESPPADS=[]; for(let k=0;k<8;k++){ ESPPADS.push([61.68,-1.316+(27.34+5.08*k-20.9)/2],[76.92,-1.316+(27.34+5.08*k-20.9)/2]); }
function colESP(P){ const n=P.length/9, col=new Float32Array(P.length), PADS=ESPPADS;
          const CG=colR(0xd9b04a), CW=colR(0xeeeee8), CS=colR(0xbfc5ce), CD=colR(0x2a2c32), CL=colR(0x3b3e46), CB=colR(0x1b1d23);
          const par=new Map(), fd=k=>{ let r=k; while(par.get(r)!==r) r=par.get(r); let c=k; while(par.get(c)!==r){ const nx=par.get(c); par.set(c,r); c=nx; } return r; }, qk=(i)=>Math.round(P[i]*400)+','+Math.round(P[i+1]*400)+','+Math.round(P[i+2]*400), tc=new Int32Array(n);
          for(let t=0;t<n;t++){ const o=t*9, cy=(P[o+1]+P[o+4]+P[o+7])/3; if(cy<23.66){ tc[t]=-1; continue; } const ks=[qk(o),qk(o+3),qk(o+6)]; ks.forEach(k=>{ if(!par.has(k)) par.set(k,k); }); par.set(fd(ks[0]),fd(ks[1])); par.set(fd(ks[0]),fd(ks[2])); }
          const cb=new Map(), tk=new Array(n).fill(null); for(let t=0;t<n;t++){ if(tc[t]<0) continue; const rt=fd(qk(t*9)); tk[t]=rt; let b=cb.get(rt); if(!b){ b={x0:1e9,x1:-1e9,z0:1e9,z1:-1e9,y1:-1e9}; cb.set(rt,b); } for(let v=0;v<3;v++){ const x=P[t*9+v*3], z=P[t*9+v*3+2], y=P[t*9+v*3+1]; if(x<b.x0)b.x0=x; if(x>b.x1)b.x1=x; if(z<b.z0)b.z0=z; if(z>b.z1)b.z1=z; if(y>b.y1)b.y1=y; } }
          const CE=colR(0xc9ccd2);
          for(let t=0;t<n;t++){ const o=t*9; let cx=(P[o]+P[o+3]+P[o+6])/3, cy=(P[o+1]+P[o+4]+P[o+7])/3, cz=(P[o+2]+P[o+5]+P[o+8])/3;
            const ax=P[o+3]-P[o], ay=P[o+4]-P[o+1], az=P[o+5]-P[o+2], bx=P[o+6]-P[o], by=P[o+7]-P[o+1], bz=P[o+8]-P[o+2];
            const nx=ay*bz-az*by, ny=az*bx-ax*bz, nz=ax*by-ay*bx, nl=Math.hypot(nx,ny,nz)||1, up=Math.abs(ny/nl)>0.9;
            let c=CD; const cbb=tk[t]!==null?cb.get(tk[t]):null; let cc=null;
            if(cbb&&cy>=22.9){ const sx=cbb.x1-cbb.x0, sz=cbb.z1-cbb.z0, nr=(u,v)=>Math.abs(sx-u)<.08&&Math.abs(sz-v)<.08;
              if(nr(5.0,2.9)) cc=colR(0xcdd1d8); else if(nr(1.78,1.79)) cc=colR(0x14161a); else if(nr(3.1,3.2)) cc=colR(0x101216); else if(nr(3.2,2.5)) cc=colR(0xaeb4be);
              else if(nr(6.52,2.16)){ const u=(cx-cbb.x0)/sx; cc=(up&&cy>24.5)?((u<.18||u>.82)?colR(0xc5cad2):colR(0xc62a33)):colR(0xe4dfd0); } else if(nr(1.09,1.81)) cc=colR(0x2b2e36); }
            if(cy<22.9) c=CB;
            else if(cc) c=cc;
            else if(cz>14.5&&cx>63.5&&cx<74&&cy>22.4) c=CS;
            else if(Math.abs(cx-68.44)+Math.abs(cz-6.89)<3.6&&cy>23.7&&cy<24.9) c=(cy>24.3&&cy<24.4955)?CB:CS;
            else if(cy>=23.6&&cy<=23.72&&up){ let dm=1e9; PADS.forEach(q=>{ dm=Math.min(dm,Math.hypot(cx-q[0],cz-q[1])); }); c=dm<0.9?CG:CW; }
            else if(up){ c=CL; const b=tk[t]!==null?cb.get(tk[t]):null; if(b){ const sx=b.x1-b.x0, sz=b.z1-b.z0, lg=Math.max(sx,sz), sh=Math.min(sx,sz);
                if(lg>0.85&&lg<1.4&&sh>0.25&&sh<0.75&&b.y1<24.1){ const u=sx>=sz?(cx-b.x0)/sx:(cz-b.z0)/sz; c=(u<0.27||u>0.73)?CE:CB; } } }
            for(let v=0;v<3;v++){ col[o+v*3]=c[0]; col[o+v*3+1]=c[1]; col[o+v*3+2]=c[2]; } }
  return col; }
function triBB(P,ymin){ const n=P.length/9, par=new Map(), fd=k=>{ let r=k; while(par.get(r)!==r) r=par.get(r); let c=k; while(par.get(c)!==r){ const nx=par.get(c); par.set(c,r); c=nx; } return r; }, qk=i=>Math.round(P[i]*400)+','+Math.round(P[i+1]*400)+','+Math.round(P[i+2]*400), tk=new Array(n).fill(null), cb=new Map();
  for(let t=0;t<n;t++){ const o=t*9; if((P[o+1]+P[o+4]+P[o+7])/3<ymin) continue; const ks=[qk(o),qk(o+3),qk(o+6)]; ks.forEach(k=>{ if(!par.has(k)) par.set(k,k); }); par.set(fd(ks[0]),fd(ks[1])); par.set(fd(ks[0]),fd(ks[2])); tk[t]=ks[0]; }
  for(let t=0;t<n;t++){ if(tk[t]===null) continue; const r=fd(tk[t]); tk[t]=r; let b=cb.get(r); if(!b){ b={x0:1e9,x1:-1e9,y0:1e9,y1:-1e9,z0:1e9,z1:-1e9}; cb.set(r,b); } for(let v=0;v<3;v++){ const x=P[t*9+v*3], y=P[t*9+v*3+1], z=P[t*9+v*3+2]; if(x<b.x0)b.x0=x; if(x>b.x1)b.x1=x; if(y<b.y0)b.y0=y; if(y>b.y1)b.y1=y; if(z<b.z0)b.z0=z; if(z>b.z1)b.z1=z; } }
  return tk.map(k=>k===null?null:cb.get(k)); }
const DRVPADS=[]; [37.525,52.775].forEach(x=>[-0.55,1.975,4.525,7.075,9.6,12.15].forEach(z=>DRVPADS.push([x,z])));
function colDRV(P){ const n=P.length/9, col=new Float32Array(P.length), BB=triBB(P,21.6), K=h=>colR(h);
  for(let t=0;t<n;t++){ const o=t*9, cx=(P[o]+P[o+3]+P[o+6])/3, cy=(P[o+1]+P[o+4]+P[o+7])/3, cz=(P[o+2]+P[o+5]+P[o+8])/3;
    const ax=P[o+3]-P[o], ay=P[o+4]-P[o+1], az=P[o+5]-P[o+2], bx=P[o+6]-P[o], by=P[o+7]-P[o+1], bz=P[o+8]-P[o+2], ny=az*bx-ax*bz, nl=Math.hypot(ay*bz-az*by,ny,ax*by-ay*bx)||1, up=Math.abs(ny/nl)>0.9;
    let c=K(0x2a2c32); const b=BB[t];
    if(b){ const sx=b.x1-b.x0, sz=b.z1-b.z0, h=b.y1-b.y0, nr=(u,v)=>Math.abs(sx-u)<.1&&Math.abs(sz-v)<.1, lg=sx>=sz, u=lg?(cx-b.x0)/sx:(cz-b.z0)/sz, endc=u<.17||u>.83;
      if(nr(4.5,5.1)) c=(up&&cy>b.y1-0.05)?(cy>22.825?K(0xc3c7cf):K(0x0e1013)):K(0x1f2126);
      else if(nr(6.62,0.3)) c=K(0xc9cdd4);
      else if(nr(3.4,1.8)) c=((cx-b.x0)<0.31||(b.x1-cx)<0.79||cy<22.5)?K(0xb9bec6):K(0xe6b92e);
      else if((nr(1.25,2.0)||nr(2.0,1.25))&&h>.5) c=endc?K(0xc5c9d0):K(0xd9c8a0);
      else if(nr(1.25,2.0)||nr(2.0,1.25)) c=endc?K(0xc5c9d0):K(0x17181c); }
    for(let v=0;v<3;v++){ col[o+v*3]=c[0]; col[o+v*3+1]=c[1]; col[o+v*3+2]=c[2]; } }
  return col; }
function colDRVB(P){ const n=P.length/9, col=new Float32Array(P.length), S=colR(0xcfd3d8), D=colR(0x14161a);
  for(let t=0;t<n;t++){ const o=t*9, cx=(P[o]+P[o+3]+P[o+6])/3, cz=(P[o+2]+P[o+5]+P[o+8])/3; let dm=1e9; DRVPADS.forEach(q=>{ dm=Math.min(dm,Math.hypot(cx-q[0],cz-q[1])); }); const c=dm<0.82?S:D;
    for(let v=0;v<3;v++){ col[o+v*3]=c[0]; col[o+v*3+1]=c[1]; col[o+v*3+2]=c[2]; } }
  return col; }
/* serigrafía y rótulos (texturas planas sobre las placas) */
function addSilk(b,y,x0,x1,z0,z1,PX,draw){ const W=Math.round((x1-x0)*PX), H=Math.round((z1-z0)*PX), cv=document.createElement('canvas'); cv.width=W; cv.height=H; const cx=cv.getContext('2d');
  draw(cx,x=>(x-x0)*PX,z=>(z-z0)*PX,PX);
  const tx=new THREE.CanvasTexture(cv); tx.anisotropy=8; const g=new THREE.PlaneGeometry(x1-x0,z1-z0); g.rotateX(-Math.PI/2); g.translate((x0+x1)/2,y,(z0+z1)/2);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,side:THREE.DoubleSide}));
  m.renderOrder=1; m.frustumCulled=false; b.grp.add(m); (b.silk=b.silk||[]).push(m); return m; }
const SW='rgba(255,255,255,0.95)';
function stx(cx,X,Z,PX,s,x,z,mm,col,ang,al,bold,dx,dy){ cx.save(); cx.translate(X(x),Z(z)); cx.rotate(ang||0); cx.fillStyle=col||SW; cx.font=(bold?'bold ':'')+Math.round(mm*PX)+'px "Latin Modern Roman","CMU Serif",Arial,sans-serif'; cx.textAlign=al||'center'; cx.textBaseline='middle'; cx.fillText(s,(dx||0)*PX,(dy||0)*PX); cx.restore(); }
function silkESP(b){ const x0=60.39,x1=78.19,z0=-1.32,z1=21.18;
  addSilk(b,23.76,x0,x1,z0,z1,60,(cx,X,Z,PX)=>{ const R=['21','20','10','9','8','7','6','5'], L=['0','1','2','3','4','3.3','G','5V'];
    const SKL=[2,3,4], SKR=[1,2,3,4,5,7]; for(let k=0;k<8;k++){ const z=1.904+2.54*k; if(SKL.indexOf(k)<0) stx(cx,X,Z,PX,L[k],61.68+1.2,z,0.9,SW,0,'left',1); if(SKR.indexOf(k)<0) stx(cx,X,Z,PX,R[k],76.92-1.2,z,0.9,SW,0,'right',1); } });
  addSilk(b,24.56,x0,x1,z0,z1,60,(cx,X,Z,PX)=>{ });
  addSilk(b,24.0,x0,x1,z0,z1,60,(cx,X,Z,PX)=>{ stx(cx,X,Z,PX,'40.000',73.65,3.64,0.55,'#2a2d34',-Math.PI/2,'center',0); });
  addSilk(b,24.76,x0,x1,z0,z1,60,(cx,X,Z,PX)=>{ stx(cx,X,Z,PX,'C3',69.23,0.08,1.5,SW,0,'center',1); }); }
function silkDRV(b){ const x0=35.86,x1=54.46,z0=-2.57,z1=14.18;
  /* pads más pequeños: se oscurece la corona exterior de cada pad (r 0.55 → 0.85 mm) */
  addSilk(b,21.7,x0,x1,z0,z1,60,(cx,X,Z,PX)=>{ cx.fillStyle='#14161a'; DRVPADS.forEach(q=>{ cx.beginPath(); cx.arc(X(q[0]),Z(q[1]),0.9*PX,0,Math.PI*2); cx.arc(X(q[0]),Z(q[1]),0.5*PX,0,Math.PI*2,true); cx.fill('evenodd'); }); });
  addSilk(b,22.1,x0,x1,z0,z1,60,(cx,X,Z,PX)=>{ stx(cx,X,Z,PX,'473',40.485,0.43,0.72,SW,-Math.PI/2,'center',1); stx(cx,X,Z,PX,'472',47.46,10.055,0.72,SW,0,'center',1); });
  addSilk(b,23.45,x0,x1,z0,z1,60,(cx,X,Z,PX)=>{ stx(cx,X,Z,PX,'106C',41.82,11.53,0.8,'#3a2a05',0,'center',1); }); }
function silkMPU(b){ const x0=50.48,x1=70.98,z0=14.09,z1=30.09;
  addSilk(b,13.02,x0,x1,z0,z1,60,(cx,X,Z,PX)=>{
    stx(cx,X,Z,PX,'ITG/MPU',60.73,15.08,1.25,SW,Math.PI,'center',1);
    const xs=[51.825,54.375,56.925,59.45,62.0,64.55,67.075,69.625], nm=['VCC','GND','SCL','SDA','XDA','XCL','AD0','INT'];
    xs.forEach((x,k)=>stx(cx,X,Z,PX,nm[k],x,27.45,0.85,SW,-Math.PI/2,'left',1)); });
  addSilk(b,14.0,x0,x1,z0,z1,60,(cx,X,Z,PX)=>{ stx(cx,X,Z,PX,'INVENSENSE',61.33,22.34,0.5,SW,-Math.PI/2,'center',0,0,-0.75); stx(cx,X,Z,PX,'MPU-6050',61.33,22.34,0.78,SW,-Math.PI/2,'center',1,0,0.3);
    stx(cx,X,Z,PX,'S201',52.73,20.59,0.72,SW,0,'center',1); stx(cx,X,Z,PX,'472',66.43,20.09,0.62,SW,-Math.PI/2,'center',1); stx(cx,X,Z,PX,'472',56.23,20.09,0.62,SW,-Math.PI/2,'center',1); stx(cx,X,Z,PX,'422',57.72,20.09,0.62,SW,-Math.PI/2,'center',1); stx(cx,X,Z,PX,'102',64.94,20.09,0.62,SW,-Math.PI/2,'center',1); }); }
function addBoxes(g,eg,B){ /* añade cajas [x0,x1,y0,y1,z0,z1] a una geometría indexada y sus aristas */
  const P=Array.from(g.attributes.position.array), N=Array.from(g.attributes.normal.array), I=Array.from(g.index.array), E=Array.from(eg.attributes.position.array);
  B.forEach(b=>{ const [x0,x1,y0,y1,z0,z1]=b, F=[[[0,0,1],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],[[0,0,-1],[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]],[[1,0,0],[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]],[[-1,0,0],[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]],[[0,1,0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]],[[0,-1,0],[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]]];
    F.forEach(f=>{ const o=P.length/3; for(let k=1;k<5;k++){ P.push(...f[k]); N.push(...f[0]); } I.push(o,o+1,o+2,o,o+2,o+3); });
    const C=[]; for(let k=0;k<8;k++) C.push([k&1?x1:x0,k&2?y1:y0,k&4?z1:z0]); [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]].forEach(e=>E.push(...C[e[0]],...C[e[1]])); });
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3)); g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(N),3)); g.setIndex(new THREE.BufferAttribute(new Uint32Array(I),1)); eg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(E),3)); }
DATA2.forEach(d=>{
  let g,eg,lg=null,vcol=null;
  if(d.lugs){ lg=makeLugs(d); g=lg.g; eg=lg.eg; }
  else {
    g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(dec(d.p,Float32Array),3));
    g.setAttribute('normal',new THREE.BufferAttribute(dec(d.n,Float32Array),3));
    g.setIndex(new THREE.BufferAttribute(dec(d.i,Uint32Array),1));
    eg=new THREE.BufferGeometry(); eg.setAttribute('position',new THREE.BufferAttribute(dec(d.e,Float32Array),3));
    if(/separador plástico \(MPU6050\)/.test(d.name)){ /* pads circulares metálicos (en lugar del separador rectangular) */
      const P=[],N=[],I=[],E=[], SG=40, R=0.62, y0=12.99, y1=13.12, cz=29.09;
      for(let k=0;k<8;k++){ const cx=51.84+2.54*k, o=P.length/3;
        for(let q=0;q<=SG;q++){ const a=q/SG*Math.PI*2, c=Math.cos(a), sn=Math.sin(a); P.push(cx+R*c,y0,cz+R*sn, cx+R*c,y1,cz+R*sn); N.push(c,0,sn,c,0,sn); }
        for(let q=0;q<SG;q++){ const a=o+q*2; I.push(a,a+1,a+3,a,a+3,a+2); }
        const oc=P.length/3; P.push(cx,y1,cz); N.push(0,1,0); for(let q=0;q<=SG;q++){ const a=q/SG*Math.PI*2; P.push(cx+R*Math.cos(a),y1,cz+R*Math.sin(a)); N.push(0,1,0); }
        for(let q=0;q<SG;q++) I.push(oc,oc+1+q+1,oc+1+q);
        for(let q=0;q<SG;q+=1){ const a1=q/SG*Math.PI*2, a2=(q+1)/SG*Math.PI*2; E.push(cx+R*Math.cos(a1),y1,cz+R*Math.sin(a1),cx+R*Math.cos(a2),y1,cz+R*Math.sin(a2)); } }
      g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3)); g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(N),3)); g.setIndex(new THREE.BufferAttribute(new Uint32Array(I),1)); eg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(E),3)); }
    /* capacitor de tantalio amarillo adicional en la IMU (extremo frontal, junto a los terminales) */
    if(/MPU6050 · SMD · condensadores/.test(d.name)) addBoxes(g,eg,[[69.3,70.7,12.99,13.99,23.36,24.56]]);
    if(/MPU6050 · SMD · terminales/.test(d.name)) addBoxes(g,eg,[[69.25,70.75,12.99,13.99,22.96,23.36],[69.25,70.75,12.99,13.99,24.56,24.96],[58.71,59.35,12.99,14.51,16.075,18.215],[62.65,63.29,12.99,14.51,16.075,18.215]]);
    if(/^Carcasa del reductor/.test(d.name)){ /* tornillos pasantes del reductor (componentes alargados de 2.4 mm) en plateado; carcasa en latón */
      const PA=g.attributes.position.array, nv=PA.length/3, IX=g.index.array, kk=new Map(), id=new Int32Array(nv); for(let v=0;v<nv;v++){ const t=Math.round(PA[v*3]*1e3)+'|'+Math.round(PA[v*3+1]*1e3)+'|'+Math.round(PA[v*3+2]*1e3); let q=kk.get(t); if(q===undefined){ q=kk.size; kk.set(t,q); } id[v]=q; }
      const par=new Int32Array(kk.size).map((_,i)=>i), fd=a=>{ while(par[a]!==a){ par[a]=par[par[a]]; a=par[a]; } return a; };
      for(let t=0;t<IX.length;t+=3){ const a=fd(id[IX[t]]), b=fd(id[IX[t+1]]), c=fd(id[IX[t+2]]); par[b]=a; par[fd(c)]=a; }
      const bb=new Map(); for(let v=0;v<nv;v++){ const r=fd(id[v]); let o=bb.get(r); if(!o){ o={mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9]}; bb.set(r,o); } for(let k=0;k<3;k++){ o.mn[k]=Math.min(o.mn[k],PA[v*3+k]); o.mx[k]=Math.max(o.mx[k],PA[v*3+k]); } }
      vcol=new Float32Array(nv*3); const br=new THREE.Color(0xd9a62a), sv=new THREE.Color(0xc4cad4);
      for(let v=0;v<nv;v++){ const o=bb.get(fd(id[v])), e=[0,1,2].map(k=>o.mx[k]-o.mn[k]).sort((x,y)=>x-y), scr=e[0]<3&&e[1]<3&&e[2]>8, c=scr?sv:br; vcol[v*3]=c.r; vcol[v*3+1]=c.g; vcol[v*3+2]=c.b; } }
    if(/ESP32-C3 componentes/.test(d.name)){ /* blindaje metálico completo (componente conexo) girado 180° en su plano: el texto y el logo quedan bien orientados */
      const PA=g.attributes.position.array, nv=PA.length/3, IX=g.index.array, kk=new Map(), id=new Int32Array(nv); for(let v=0;v<nv;v++){ const t=Math.round(PA[v*3]*1e3)+'|'+Math.round(PA[v*3+1]*1e3)+'|'+Math.round(PA[v*3+2]*1e3); let q=kk.get(t); if(q===undefined){ q=kk.size; kk.set(t,q); } id[v]=q; }
      const par=new Int32Array(kk.size).map((_,i)=>i), fd=a=>{ while(par[a]!==a){ par[a]=par[par[a]]; a=par[a]; } return a; };
      for(let t=0;t<IX.length;t+=3){ const a=fd(id[IX[t]]); par[fd(id[IX[t+1]])]=a; par[fd(id[IX[t+2]])]=a; }
      let root=-1; for(let v=0;v<nv;v++){ if(PA[v*3+1]>24.49&&Math.abs(PA[v*3]-68.45)<4&&Math.abs(PA[v*3+2]-6.89)<4){ root=fd(id[v]); break; } }
      if(root>=0){ let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; for(let v=0;v<nv;v++) if(fd(id[v])===root){ x0=Math.min(x0,PA[v*3]); x1=Math.max(x1,PA[v*3]); z0=Math.min(z0,PA[v*3+2]); z1=Math.max(z1,PA[v*3+2]); }
        const cx=x0+x1, cz=z0+z1; for(let v=0;v<nv;v++) if(fd(id[v])===root){ PA[v*3]=cx-PA[v*3]; PA[v*3+2]=cz-PA[v*3+2]; }
        const NA=g.attributes.normal.array; for(let v=0;v<nv;v++) if(fd(id[v])===root){ NA[v*3]=-NA[v*3]; NA[v*3+2]=-NA[v*3+2]; }
        const E=eg.attributes.position.array; for(let v=0;v<E.length;v+=3) if(E[v]>=x0-1e-3&&E[v]<=x1+1e-3&&E[v+2]>=z0-1e-3&&E[v+2]<=z1+1e-3&&E[v+1]>23.6){ E[v]=cx-E[v]; E[v+2]=cz-E[v+2]; }
        for(let v=0;v+5<E.length;v+=6){ if(E[v+1]>24.4&&E[v+4]>24.4&&Math.hypot(E[v+3]-E[v],E[v+5]-E[v+2])>6.5&&E[v]>=x0-1e-2&&E[v]<=x1+1e-2){ E[v+3]=E[v]; E[v+4]=E[v+1]; E[v+5]=E[v+2]; } } /* quita la X de esquina a esquina (diagonales de triangulación) */
        g.attributes.position.needsUpdate=true; g.attributes.normal.needsUpdate=true; eg.attributes.position.needsUpdate=true; } }
    if(/ESP32-C3 componentes|DRV8833 componentes|DRV8833 \(placa negra\)/.test(d.name)){ g=g.toNonIndexed(); const PP=g.attributes.position.array; vcol=/ESP32/.test(d.name)?colESP(PP):/componentes/.test(d.name)?colDRV(PP):colDRVB(PP); }
  }
  const piv=d.piv?new THREE.Vector3(0,d.piv[0],d.piv[1]):null;
  if(piv){ g.translate(0,-piv.y,-piv.z); eg.translate(0,-piv.y,-piv.z); }          // el eje de giro queda en el origen local
  const b=addBody(g,eg,accK++,{acc:true,group:'int',sw:/interruptor · palanca|Caparazón desmontable|Alambre rígido del interruptor/.test(d.name),cat:d.cat,name:d.name,cols:accCols[(d.kind==='gearbox'&&/Piñón|Engranaje de salida/.test(d.name))?'silver':d.kind],exv:(()=>{const e=EXUP[d.cat]||d.ex;return new THREE.Vector3(e[0],e[1],e[2]);})(),piv,m:d.m,role:d.role,mult:d.mult,rid:d.rid,mode:d.mode});
  if(piv) b.grp.position.copy(piv);
  if(/ESP32-C3 \(placa negra\)/.test(d.name)) silkESP(b); else if(/DRV8833 \(placa negra\)/.test(d.name)) silkDRV(b); else if(/MPU6050 · placa/.test(d.name)) silkMPU(b);
  if(vcol){ b.col.set(vcol); b.vc0=vcol; b.o.vcol=true; b.g.attributes.color.needsUpdate=true; }
  if(/MPU6050 · placa/.test(d.name)) b.o.cols={light:[0x1f4fb4,0x0b1f3a],dark:[0x1c47a0,0xa9c8ff]};
  if(/separador plástico \(MPU6050\)/.test(d.name)) b.o.cols=accCols.silver;
  if(/LED RGB WS2812B · aro/.test(d.name)) b.o.cols={light:[0xe3e7ee,0xd3d8e1],dark:[0xdde2ea,0xd3d8e1]};
  if(/MPU6050 · cristal/.test(d.name)) b.o.cols={light:[0xe3b52c,0x6b4a05],dark:[0xdcae3a,0xffe9a8]};
  if(d.label){ const Lb=d.label, cv=document.createElement('canvas'); cv.width=(Lb.cv||[1560,300])[0]; cv.height=(Lb.cv||[1560,300])[1]; const cx=cv.getContext('2d');
    if(Lb.rot){cx.translate(cv.width/2,cv.height/2);cx.rotate(Math.PI);cx.translate(-cv.width/2,-cv.height/2);} cx.fillStyle=Lb.col||'#2b3445'; cx.textAlign='center'; cx.textBaseline='middle'; cx.font=Lb.font||'bold 122px Arial,sans-serif'; cx.fillText(Lb.text||'650mAh 3.7V 2.42Wh',cv.width/2,cv.height/2+(Lb.text?0:10));
    const n=Lb.ax==='z'?new THREE.Vector3(0,0,Lb.n):new THREE.Vector3(0,Lb.n,0), rd=Lb.ax==='z'?new THREE.Vector3(1,0,0):new THREE.Vector3(0,0,1), up=new THREE.Vector3().crossVectors(n,rd), c=new THREE.Vector3(...Lb.c).addScaledVector(n,0.03);
    const P=[],U=[]; [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,bq])=>{ const p=c.clone().addScaledVector(rd,a*Lb.h/2).addScaledVector(up,bq*Lb.w/2); P.push(p.x,p.y,p.z); U.push(a*.5+.5,bq*.5+.5); });
    const lgm=new THREE.BufferGeometry(); lgm.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); lgm.setAttribute('uv',new THREE.Float32BufferAttribute(U,2)); lgm.setAttribute('normal',new THREE.Float32BufferAttribute([...n.toArray(),...n.toArray(),...n.toArray(),...n.toArray()],3)); lgm.setIndex(Lb.n>0?[0,1,2,0,2,3]:[0,2,1,0,3,2]);
    const tx=new THREE.CanvasTexture(cv); tx.anisotropy=8; const lm=new THREE.Mesh(lgm,new THREE.MeshLambertMaterial({map:tx,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide}));
    lm.renderOrder=1; lm.frustumCulled=false; b.grp.add(lm); b.labelMesh=lm; }
  if(d.role==='led') LEDB=b;
  if(d.role==='rled') RLEDS.push(b);
  if(d.cat==='Banda de goma'&&!d.lugs&&d.mode!=='B'){ const ds=BDESC[/\((.*)\)/.exec(d.name)[1]], Lg=ds.lugs, c1=new THREE.Vector2(Lg.c1[0],Lg.c1[1]), c2=new THREE.Vector2(Lg.c2[0],Lg.c2[1]);
    const dv=c2.clone().sub(c1), Ls=dv.length(); dv.normalize(); const nm=new THREE.Vector2(-dv.y,dv.x), Ri=Lg.ri, arc=Math.PI*Ri, Lp=2*Ls+2*Math.PI*Ri;
    const pos=g.attributes.position, aS=new Float32Array(pos.count), ang=(a,w)=>Math.atan2(a.x*w.y-a.y*w.x,a.x*w.x+a.y*w.y);
    for(let i=0;i<pos.count;i++){ const p=new THREE.Vector2(pos.getY(i),pos.getZ(i)), r=p.clone().sub(c1), tt=r.dot(dv), u=r.dot(nm); let s;
      if(tt>Ls){ const w=p.clone().sub(c2); s=Ls+Ri*Math.min(Math.PI,Math.max(0,-ang(nm,w))); }
      else if(tt<0){ const w=r, nn=nm.clone().negate(); s=2*Ls+arc+Ri*Math.min(Math.PI,Math.max(0,-ang(nn,w))); }
      else s=u>=0?tt:Ls+arc+(Ls-tt); aS[i]=s; }
    g.setAttribute('aS',new THREE.BufferAttribute(aS,1));
    const uni={uPh:{value:0},uP:{value:Lp/Lg.n}};
    b.fm.onBeforeCompile=sh=>{ sh.uniforms.uPh=uni.uPh; sh.uniforms.uP=uni.uP;
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aS; varying float vS;').replace('#include <begin_vertex>','#include <begin_vertex>\nvS=aS;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uPh,uP; varying float vS;').replace('#include <color_fragment>','#include <color_fragment>\n{ float f=abs(fract((vS-uPh)/uP+.5)-.5); float bd=1.-smoothstep(.12,.26,f); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.30,.34,.44),.6*bd); }'); };
    b.fm.customProgramCacheKey=()=>'belt'; b.fm.needsUpdate=true; BELTS.push({uni,m:ds.m}); }
  if(lg){ [b.mesh,b.lines,b.sb,b.sf].forEach(o=>o.frustumCulled=false); LUGS.push({b,lg,m:d.m}); }
  else if(d.m&&d.role) SPIN.push(b);
  INT.push(b);
});

const ctr=bbox.getCenter(new THREE.Vector3()), size=bbox.getSize(new THREE.Vector3());
const R=size.length()/2;
// colores por orientación (se recalculan al cambiar de tema)
function paintOrientation(theme){
  const a=PAL[theme].axisCol.map(c=>new THREE.Color(c));
  bodies.forEach(b=>{
    if(b.o.acc) return;
    for(let i=0;i<b.nor.length;i+=3){
      let x=Math.abs(b.nor[i]),y=Math.abs(b.nor[i+1]),z=Math.abs(b.nor[i+2]);
      const s=x+y+z||1; x/=s;y/=s;z/=s;
      b.col[i]  =a[0].r*x+a[1].r*y+a[2].r*z;
      b.col[i+1]=a[0].g*x+a[1].g*y+a[2].g*z;
      b.col[i+2]=a[0].b*x+a[1].b*y+a[2].b*z;
    }
    b.g.attributes.color.needsUpdate=true;
  });
}

