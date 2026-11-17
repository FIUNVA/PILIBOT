'use strict';
/* ---- voxelización de todo el ensamble (paridad de rayos en z, 1 mm) ---- */
function voxelize(){
  const h=1.0, bb=new THREE.Box3(); bodies.forEach(b=>bb.union(b.g.boundingBox));
  const o=bb.min.clone().addScalar(-2*h);
  const nx=Math.ceil((bb.max.x-o.x)/h)+3, ny=Math.ceil((bb.max.y-o.y)/h)+3, nz=Math.ceil((bb.max.z-o.z)/h)+3, N=nx*ny*nz;
  const mat=new Uint8Array(N), bid=new Int16Array(N).fill(-1), JX=0.00137, JY=0.00093;
  bodies.forEach((b,bi)=>{
    const P=b.g.attributes.position.array, I=b.g.index?b.g.index.array:null, nt=I?I.length/3:P.length/9, mid=MID[matOf(b,bi)], hits=new Map();
    for(let t=0;t<nt;t++){
      const a=I?I[3*t]:3*t, c=I?I[3*t+1]:3*t+1, d=I?I[3*t+2]:3*t+2;
      const X0=(P[3*a]-o.x)/h-0.5-JX, Y0=(P[3*a+1]-o.y)/h-0.5-JY, Z0=(P[3*a+2]-o.z)/h-0.5;
      const X1=(P[3*c]-o.x)/h-0.5-JX, Y1=(P[3*c+1]-o.y)/h-0.5-JY, Z1=(P[3*c+2]-o.z)/h-0.5;
      const X2=(P[3*d]-o.x)/h-0.5-JX, Y2=(P[3*d+1]-o.y)/h-0.5-JY, Z2=(P[3*d+2]-o.z)/h-0.5;
      const A2=(X1-X0)*(Y2-Y0)-(X2-X0)*(Y1-Y0); if(Math.abs(A2)<1e-9) continue;
      const ix0=Math.max(0,Math.ceil(Math.min(X0,X1,X2))), ix1=Math.min(nx-1,Math.floor(Math.max(X0,X1,X2)));
      const iy0=Math.max(0,Math.ceil(Math.min(Y0,Y1,Y2))), iy1=Math.min(ny-1,Math.floor(Math.max(Y0,Y1,Y2)));
      for(let iy=iy0;iy<=iy1;iy++) for(let ix=ix0;ix<=ix1;ix++){
        const w0=((X1-ix)*(Y2-iy)-(X2-ix)*(Y1-iy))/A2, w1=((X2-ix)*(Y0-iy)-(X0-ix)*(Y2-iy))/A2, w2=1-w0-w1;
        if(w0<0||w1<0||w2<0) continue; const key=ix+nx*iy; let L=hits.get(key); if(!L){L=[];hits.set(key,L);} L.push(w0*Z0+w1*Z1+w2*Z2);
      }
    }
    hits.forEach((L,key)=>{ L.sort((u,v)=>u-v); const ix=key%nx, iy=(key-ix)/nx;
      for(let m=0;m+1<L.length;m+=2){ const k0=Math.max(0,Math.ceil(L[m])), k1=Math.min(nz-1,Math.floor(L[m+1]));
        for(let iz=k0;iz<=k1;iz++){ const id=ix+nx*(iy+ny*iz); mat[id]=mid; bid[id]=bi; } } });
  });
  // puentes de contacto: huecos de 1 voxel entre cuerpos distintos
  const sx=1, sy=nx, sz=nx*ny, br=MID.bri; let nb=0; const add=[];
  for(let iz=1;iz<nz-1;iz++) for(let iy=1;iy<ny-1;iy++) for(let ix=1;ix<nx-1;ix++){ const i=ix+nx*(iy+ny*iz); if(mat[i]) continue;
    for(const s of [sx,sy,sz]){ const a=i-s, c=i+s; if(mat[a]&&mat[c]&&mat[a]!==br&&mat[c]!==br&&bid[a]!==bid[c]){ add.push(i); break; } } }
  add.forEach(i=>{mat[i]=br;nb++;});
  // masa y centro de masas
  let M=0,cx=0,cy=0,cz=0; const mb=new Float64Array(bodies.length);
  let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9];
  for(let iz=0;iz<nz;iz++) for(let iy=0;iy<ny;iy++) for(let ix=0;ix<nx;ix++){ const i=ix+nx*(iy+ny*iz), m=mat[i]; if(!m) continue;
    const x=o.x+(ix+.5)*h, y=o.y+(iy+.5)*h, z=o.z+(iz+.5)*h;
    if(m!==br){ const g=MATD[MK[m-1]].rho*h*h*h/1000; M+=g; cx+=g*x; cy+=g*y; cz+=g*z; mb[bid[i]]+=g;
      if(x<mn[0])mn[0]=x; if(y<mn[1])mn[1]=y; if(z<mn[2])mn[2]=z; if(x>mx[0])mx[0]=x; if(y>mx[1])mx[1]=y; if(z>mx[2])mx[2]=z; } }
  return {h,o,nx,ny,nz,N,mat,bid,M,com:new THREE.Vector3(cx/M,cy/M,cz/M),mb,mn:new THREE.Vector3(...mn),mx:new THREE.Vector3(...mx),nb};
}
window.__vox=()=>voxelize(); window.__MATD={MATD,MK};
async function ensureVox(st){ if(AN.vox) return AN.vox; st('Voxelizando el ensamble (≈1 mm)…'); await tick(); AN.vox=voxelize(); return AN.vox; }
const MASSK=()=>1;     // factor de escala de masa (reservado)

/* ====================== AERODINÁMICA ====================== */
const AIR={on:false,U:12,az:0,el:0,mode:'const',dur:2.5,t:-1,view:'both',push:true,app:true,slow:0.02,last:null,coef:null,hist:[],lastT:0,wx:0,wz:0,info:null};
const CPLUT=(()=>{ const L=new Float32Array(256*3); const stops=[[-1.2,.13,.33,.85],[-0.6,.35,.65,.95],[0,.95,.95,.96],[0.5,.98,.72,.35],[1,.86,.15,.12]];
  for(let i=0;i<256;i++){ const cp=-1.2+2.2*i/255; let k=0; while(k<stops.length-2&&cp>stops[k+1][0]) k++; const a=stops[k],b=stops[k+1], t=Math.min(1,Math.max(0,(cp-a[0])/(b[0]-a[0])));
    L[3*i]=a[1]+(b[1]-a[1])*t; L[3*i+1]=a[2]+(b[2]-a[2])*t; L[3*i+2]=a[3]+(b[3]-a[3])*t; } return L; })();
const cpIdx=cp=>Math.max(0,Math.min(255,Math.round((cp+1.2)/2.2*255)));
function drawBar(id,fn){ const c=$(id), g=c.getContext('2d'); for(let x=0;x<c.width;x++){ const [r,gg,b]=fn(x/(c.width-1)); g.fillStyle='rgb('+(r*255|0)+','+(gg*255|0)+','+(b*255|0)+')'; g.fillRect(x,0,1,c.height); } }
drawBar('ae-leg',t=>{const i=Math.round(t*255);return [CPLUT[3*i],CPLUT[3*i+1],CPLUT[3*i+2]];});

async function ensureAero(st){
  if(AN.aero) return AN.aero;
  const V=await ensureVox(st);
  st('Construyendo el dominio de aire…'); await tick();
  const c=3, pad=60, h=V.h, mn=V.mn.clone(), mx=V.mx.clone();
  const ox=mn.x-pad, oy=mn.y-pad, oz=mn.z-pad, nx=Math.ceil((mx.x-mn.x+2*pad)/c)+2, ny=Math.ceil((mx.y-mn.y+2*pad)/c)+2, nz=Math.ceil((mx.z-mn.z+2*pad)/c)+2, N=nx*ny*nz, sy=nx, sz=nx*ny;
  const sol=new Uint8Array(N);
  for(let iz=0;iz<V.nz;iz++) for(let iy=0;iy<V.ny;iy++) for(let ix=0;ix<V.nx;ix++){ const m=V.mat[ix+V.nx*(iy+V.ny*iz)]; if(!m||m===MID.bri) continue;
    const x=V.o.x+(ix+.5)*h, y=V.o.y+(iy+.5)*h, z=V.o.z+(iz+.5)*h, i=Math.floor((x-ox)/c), j=Math.floor((y-oy)/c), k=Math.floor((z-oz)/c);
    if(i>0&&j>0&&k>0&&i<nx-1&&j<ny-1&&k<nz-1) sol[i+nx*(j+ny*k)]=1; }
  // exterior (inundación desde la frontera) → envolvente sólida = todo lo no alcanzable
  const ext=new Uint8Array(N), stk=new Int32Array(N); let sp=0;
  const push=i=>{ if(!ext[i]&&!sol[i]){ ext[i]=1; stk[sp++]=i; } };
  for(let k=0;k<nz;k++) for(let j=0;j<ny;j++){ push(nx*(j+ny*k)); push(nx-1+nx*(j+ny*k)); }
  for(let k=0;k<nz;k++) for(let i=0;i<nx;i++){ push(i+nx*ny*k); push(i+nx*(ny-1+ny*k)); }
  for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){ push(i+nx*j); push(i+nx*(j+ny*(nz-1))); }
  while(sp){ const i=stk[--sp], x=i%nx, j=((i/nx)|0)%ny, k=(i/sz)|0;
    if(x>0)push(i-1); if(x<nx-1)push(i+1); if(j>0)push(i-sy); if(j<ny-1)push(i+sy); if(k>0)push(i-sz); if(k<nz-1)push(i+sz); }
  const env=new Uint8Array(N); for(let i=0;i<N;i++) env[i]=ext[i]?0:1;
  const act=new Uint8Array(N), gX=new Float32Array(N), gY=new Float32Array(N), gZ=new Float32Array(N), bnd=new Uint8Array(N);
  for(let k=0;k<nz;k++) for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){ const id=i+nx*(j+ny*k); const b=(i===0||j===0||k===0||i===nx-1||j===ny-1||k===nz-1); bnd[id]=b?1:0;
    if(!b&&!env[id]) act[id]=1;
    if(!env[id]){ if(i<nx-1&&!env[id+1]) gX[id]=1; if(j<ny-1&&!env[id+sy]) gY[id]=1; if(k<nz-1&&!env[id+sz]) gZ[id]=1; } }
  const cen=[(mn.x+mx.x)/2,(mn.y+mx.y)/2,(mn.z+mx.z)/2], O=[ox,oy,oz], dims=[nx,ny,nz];
  const Vf=[];
  for(let ax=0;ax<3;ax++){
    st('Resolviendo flujo potencial '+['x','y','z'][ax]+' ('+(ax+1)+'/3)…'); await tick();
    const phi=new Float64Array(N+sz+2), b=new Float64Array(N+sz+2);
    for(let k=0;k<nz;k++) for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){ const id=i+nx*(j+ny*k); const p=[i,j,k][ax]; phi[id]=O[ax]+(p+.5)*c-cen[ax]; }
    const r=cgGrid(nx,ny,nz,act,gX,gY,gZ,b,phi,500,1e-6);
    const v=new Float32Array(3*N);
    for(let k=1;k<nz-1;k++) for(let j=1;j<ny-1;j++) for(let i=1;i<nx-1;i++){ const id=i+nx*(j+ny*k); if(env[id]) continue;
      const nb=(d)=>{ const q=id+d; return env[q]?phi[id]:phi[q]; };
      v[3*id]=(nb(1)-nb(-1))/(2*c); v[3*id+1]=(nb(sy)-nb(-sy))/(2*c); v[3*id+2]=(nb(sz)-nb(-sz))/(2*c); }
    for(let id=0;id<N;id++){ if(bnd[id]) v[3*id+ax]=1; }
    Vf.push(v); await tick();
  }
  // referencia de cada vértice: celda de muestreo 4.5 mm hacia afuera
  st('Preparando muestreo de la superficie…'); await tick();
  const vs=bodies.map(b=>{ const n=b.pos.length/3, o=new Int32Array(n);
    for(let k=0;k<n;k++){ const x=b.pos[3*k]+b.nor[3*k]*4.5, y=b.pos[3*k+1]+b.nor[3*k+1]*4.5, z=b.pos[3*k+2]+b.nor[3*k+2]*4.5;
      const i=Math.floor((x-ox)/c), j=Math.floor((y-oy)/c), kk=Math.floor((z-oz)/c);
      if(i<1||j<1||kk<1||i>=nx-1||j>=ny-1||kk>=nz-1){o[k]=-1;continue;} const id=i+nx*(j+ny*kk); o[k]=env[id]?-1:id; } return o; });
  // puntos de apoyo (franja inferior)
  const sup=[]; for(let iz=0;iz<V.nz;iz++) for(let iy=0;iy<V.ny;iy++) for(let ix=0;ix<V.nx;ix++){ const id=ix+V.nx*(iy+V.ny*iz), m=V.mat[id];
    if(m&&m!==MID.bri){ const y=V.o.y+(iy+.5)*h; if(y<V.mn.y+3) sup.push(V.o.x+(ix+.5)*h,y,V.o.z+(iz+.5)*h); } }
  AN.aero={c,ox,oy,oz,nx,ny,nz,N,env,Vf,vs,cen,sup:new Float32Array(sup),shadow:new Float32Array(N),cp:bodies.map(b=>new Float32Array(b.pos.length/3)),
    sp:null,lines:null};
  AIR.info='Dominio '+nx+'×'+ny+'×'+nz+' celdas de 3 mm · masa estimada '+V.M.toFixed(0)+' g';
  return AN.aero;
}
function sampleV(A,x,y,z,u,out){
  const c=A.c; let gx=(x-A.ox)/c-0.5, gy=(y-A.oy)/c-0.5, gz=(z-A.oz)/c-0.5;
  let i=Math.floor(gx), j=Math.floor(gy), k=Math.floor(gz); if(i<0||j<0||k<0||i>=A.nx-1||j>=A.ny-1||k>=A.nz-1) return false;
  const fx=gx-i, fy=gy-j, fz=gz-k, nx=A.nx, sy=nx, sz=nx*A.ny, b=i+nx*(j+A.ny*k); const [V0,V1,V2]=A.Vf; let vx=0,vy=0,vz=0;
  for(let dz=0;dz<2;dz++) for(let dy=0;dy<2;dy++) for(let dx=0;dx<2;dx++){ const id=b+dx+dy*sy+dz*sz, w=(dx?fx:1-fx)*(dy?fy:1-fy)*(dz?fz:1-fz); if(A.env[id]) continue;
    vx+=w*(u[0]*V0[3*id]+u[1]*V1[3*id]+u[2]*V2[3*id]); vy+=w*(u[0]*V0[3*id+1]+u[1]*V1[3*id+1]+u[2]*V2[3*id+1]); vz+=w*(u[0]*V0[3*id+2]+u[1]*V1[3*id+2]+u[2]*V2[3*id+2]); }
  out[0]=vx;out[1]=vy;out[2]=vz; return !A.env[b+(fx>.5?1:0)+(fy>.5?sy:0)+(fz>.5?sz:0)];
}
function computeShadow(A,u){
  const c=A.c, nx=A.nx, ny=A.ny, sh=A.shadow; sh.fill(0);
  const x0=Math.max(1,Math.floor((AN.vox.mn.x-30-A.ox)/c)), x1=Math.min(nx-2,Math.ceil((AN.vox.mx.x+30-A.ox)/c)), y0=Math.max(1,Math.floor((AN.vox.mn.y-30-A.oy)/c)), y1=Math.min(ny-2,Math.ceil((AN.vox.mx.y+30-A.oy)/c)), z0=Math.max(1,Math.floor((AN.vox.mn.z-30-A.oz)/c)), z1=Math.min(A.nz-2,Math.ceil((AN.vox.mx.z+30-A.oz)/c));
  for(let k=z0;k<=z1;k++) for(let j=y0;j<=y1;j++) for(let i=x0;i<=x1;i++){ const id=i+nx*(j+ny*k); if(A.env[id]) continue;
    let px=A.ox+(i+.5)*c, py=A.oy+(j+.5)*c, pz=A.oz+(k+.5)*c;
    for(let s=1;s<=14;s++){ const qx=px-u[0]*s*c, qy=py-u[1]*s*c, qz=pz-u[2]*s*c, a=Math.floor((qx-A.ox)/c), b=Math.floor((qy-A.oy)/c), d=Math.floor((qz-A.oz)/c);
      if(a<0||b<0||d<0||a>=nx||b>=ny||d>=A.nz) break; if(A.env[a+nx*(b+ny*d)]){ sh[id]=1; break; } } }
}
// Cp en cada vértice + integración de fuerzas (coeficientes por unidad de presión dinámica)
function aeroField(u){
  const A=AN.aero, V=AN.vox; computeShadow(A,u); const [V0,V1,V2]=A.Vf; let F=[0,0,0], T0=[0,0,0], Ap=0;
  bodies.forEach((b,bi)=>{
    const vs=A.vs[bi], cp=A.cp[bi], n=vs.length, col=AN.cols[bi]; const N_=b.nor;
    for(let k=0;k<n;k++){ const id=vs[k];
      if(id<0){ cp[k]=NaN; col[3*k]=.62;col[3*k+1]=.67;col[3*k+2]=.76; continue; }
      const vx=u[0]*V0[3*id]+u[1]*V1[3*id]+u[2]*V2[3*id], vy=u[0]*V0[3*id+1]+u[1]*V1[3*id+1]+u[2]*V2[3*id+1], vz=u[0]*V0[3*id+2]+u[1]*V1[3*id+2]+u[2]*V2[3*id+2];
      const sp2=vx*vx+vy*vy+vz*vz, cpot=Math.max(-3,1-sp2), cn=-(N_[3*k]*u[0]+N_[3*k+1]*u[1]+N_[3*k+2]*u[2]); let q;
      if(A.shadow[id]) q=-0.4; else if(cn>=0) q=cpot; else { const t=sst(0,-0.3,cn); q=cpot*(1-t)+(-0.4)*t; }
      cp[k]=q; const ci=cpIdx(q); col[3*k]=CPLUT[3*ci]; col[3*k+1]=CPLUT[3*ci+1]; col[3*k+2]=CPLUT[3*ci+2]; }
    const P=b.pos, I=b.g.index?b.g.index.array:null, nt=I?I.length/3:n/3;
    for(let t=0;t<nt;t++){ const a=I?I[3*t]:3*t, c=I?I[3*t+1]:3*t+1, d=I?I[3*t+2]:3*t+2; const ca=cp[a], cc=cp[c], cd=cp[d]; if(ca!==ca||cc!==cc||cd!==cd) continue;
      const e1x=P[3*c]-P[3*a], e1y=P[3*c+1]-P[3*a+1], e1z=P[3*c+2]-P[3*a+2], e2x=P[3*d]-P[3*a], e2y=P[3*d+1]-P[3*a+1], e2z=P[3*d+2]-P[3*a+2];
      let ax=.5*(e1y*e2z-e1z*e2y), ay=.5*(e1z*e2x-e1x*e2z), az=.5*(e1x*e2y-e1y*e2x);
      const nnx=N_[3*a]+N_[3*c]+N_[3*d], nny=N_[3*a+1]+N_[3*c+1]+N_[3*d+1], nnz=N_[3*a+2]+N_[3*c+2]+N_[3*d+2];
      if(ax*nnx+ay*nny+az*nnz<0){ax=-ax;ay=-ay;az=-az;}
      const cpt=(ca+cc+cd)/3, fx=-cpt*ax, fy=-cpt*ay, fz=-cpt*az, rx=(P[3*a]+P[3*c]+P[3*d])/3, ry=(P[3*a+1]+P[3*c+1]+P[3*d+1])/3, rz=(P[3*a+2]+P[3*c+2]+P[3*d+2])/3;
      F[0]+=fx;F[1]+=fy;F[2]+=fz; T0[0]+=ry*fz-rz*fy; T0[1]+=rz*fx-rx*fz; T0[2]+=rx*fy-ry*fx; const pr=-(u[0]*ax+u[1]*ay+u[2]*az); if(pr>0&&!A.shadow[vs[a]]) Ap+=pr; }
    b.g.attributes.color.needsUpdate=false;
  });
  A.coef={F,T0,Ap,u:u.slice()}; if(AIR.flowOnly) AN.cols.forEach(c=>c.fill(.72)); ovlRefresh();
}

