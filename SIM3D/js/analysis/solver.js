'use strict';
/* ---- gradiente conjugado sobre rejilla 3D (laplaciano con conductancias por arista) ---- */
function cgGrid(nx,ny,nz,act,gX,gY,gZ,b,x,maxIt,tol){
  const N=nx*ny*nz, sy=nx, sz=nx*ny, F=Float64Array;
  const PD=N+sz+2, r=new F(PD),p=new F(PD),q=new F(PD),z=new F(PD),dg=new F(PD);   // x debe tener longitud ≥ N+nx*ny+2
  for(let i=0;i<N;i++){ if(!act[i]) continue; let d=gX[i]+gY[i]+gZ[i]; if(i>=1)d+=gX[i-1]; if(i>=sy)d+=gY[i-sy]; if(i>=sz)d+=gZ[i-sz]; dg[i]=d>0?d:1; }
  const mv=(v,o)=>{ for(let i=0;i<N;i++){ if(!act[i]){o[i]=0;continue;} const vi=v[i]; let s=0;
      s+=gX[i]*(vi-v[i+1]); s+=gY[i]*(vi-v[i+sy]); s+=gZ[i]*(vi-v[i+sz]);
      if(i>=1) s+=gX[i-1]*(vi-v[i-1]); if(i>=sy) s+=gY[i-sy]*(vi-v[i-sy]); if(i>=sz) s+=gZ[i-sz]*(vi-v[i-sz]); o[i]=s; } };
  mv(x,q); let bn=0; for(let i=0;i<N;i++){ if(act[i]){ r[i]=b[i]-q[i]; bn+=b[i]*b[i]; } }
  bn=Math.sqrt(bn)||1; let rz=0; for(let i=0;i<N;i++){ if(act[i]){ z[i]=r[i]/dg[i]; p[i]=z[i]; rz+=r[i]*z[i]; } }
  let it=0, rn=0;
  for(;it<maxIt;it++){
    mv(p,q); let pq=0; for(let i=0;i<N;i++) pq+=p[i]*q[i]; if(!(pq>0)) break; const al=rz/pq; rn=0;
    for(let i=0;i<N;i++){ if(!act[i]) continue; x[i]+=al*p[i]; r[i]-=al*q[i]; rn+=r[i]*r[i]; }
    if(Math.sqrt(rn)/bn<tol) {it++;break;}
    let rz2=0; for(let i=0;i<N;i++){ if(act[i]){ z[i]=r[i]/dg[i]; rz2+=r[i]*z[i]; } }
    const be=rz2/rz; rz=rz2; for(let i=0;i<N;i++){ if(act[i]) p[i]=z[i]+be*p[i]; }
  }
  return {it,res:Math.sqrt(rn)/bn};
}

