'use strict';
/* ---- viento: cinemática y envolvente temporal ---- */
function windEnv(){
  const m=AIR.mode, t=AIR.t;
  if(m==='const') return 1;
  if(m==='turb'){ const T=performance.now()/1000; return Math.max(0.05,0.7+0.3*(0.5*Math.sin(2.1*T)+0.3*Math.sin(5.3*T+1)+0.2*Math.sin(11.7*T+2))); }
  if(t<0) return 0;
  if(m==='gust'){ if(t>AIR.dur) return 0; const x=t/AIR.dur; return Math.pow(Math.sin(Math.PI*x),2); }
  if(m==='bang'){ const d=Math.min(AIR.dur,1.8); if(t>d*2) return 0; return Math.exp(-t/0.30)*(1-Math.exp(-t/0.025))*1.0; }
  return 1;
}
function windDir(){ const az=AIR.az*Math.PI/180, el=AIR.el*Math.PI/180; return new THREE.Vector3(-Math.sin(az)*Math.cos(el),-Math.sin(el),Math.cos(az)*Math.cos(el)); }
function aeroPrepareParticles(){
  const A=AN.aero; if(AIR.ps) return; const NP=1300, TL=12;
  const hist=new Float32Array(NP*TL*3), age=new Float32Array(NP), alive=new Uint8Array(NP);
  const pos=new Float32Array(NP*(TL-1)*6), col=new Float32Array(NP*(TL-1)*6);
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const m=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.95,depthTest:true})); m.frustumCulled=false; m.renderOrder=30; m.visible=false; root.add(m);
  AIR.ps={NP,TL,hist,age,alive,pos,col,g,m,tmp:[0,0,0]};
}
function respawn(P,i,A,u,first){
  const half=[(A.nx-3)*A.c/2,(A.ny-3)*A.c/2,(A.nz-3)*A.c/2]; let tm=1e9; for(let a=0;a<3;a++){ const ua=Math.abs(u[a]); if(ua>1e-3) tm=Math.min(tm,half[a]/ua); }
  const L=tm*0.88; const e1=new THREE.Vector3().crossVectors(new THREE.Vector3(u[0],u[1],u[2]),Math.abs(u[1])<0.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0)).normalize(), e2=new THREE.Vector3().crossVectors(new THREE.Vector3(u[0],u[1],u[2]),e1).normalize();
  const r=Math.sqrt(Math.random())*58, th=Math.random()*6.2832, cx=A.cen[0], cy=A.cen[1], cz=A.cen[2];
  const x=cx-u[0]*L+e1.x*r*Math.cos(th)+e2.x*r*Math.sin(th), y=cy-u[1]*L+e1.y*r*Math.cos(th)+e2.y*r*Math.sin(th), z=cz-u[2]*L+e1.z*r*Math.cos(th)+e2.z*r*Math.sin(th);
  for(let j=0;j<P.TL;j++){ P.hist[(i*P.TL+j)*3]=x; P.hist[(i*P.TL+j)*3+1]=y; P.hist[(i*P.TL+j)*3+2]=z; }
  P.age[i]=first?Math.random()*6:0; P.alive[i]=1;
}
function stepParticles(dt,u,Uvis){
  const A=AN.aero, P=AIR.ps; if(!P) return; const TL=P.TL, out=P.tmp, dark=S.dark; const bg=dark?[0.04,0.07,0.12]:[0.98,0.99,1.0];
  const dmax=2.0; const step=Math.max(1,Math.ceil(Uvis*dt/dmax)), ds=Uvis*dt/step;
  for(let i=0;i<P.NP;i++){
    if(!P.alive[i]){ respawn(P,i,A,u,true); }
    const h=P.hist, b=i*TL*3; h.copyWithin(b+3,b,b+3*(TL-1));
    let x=h[b+3], y=h[b+4], z=h[b+5], ok=true, sp=1, wake=false;
    for(let s=0;s<step;s++){
      if(!sampleV(A,x,y,z,u,out)){ ok=false; break; }
      sp=Math.hypot(out[0],out[1],out[2]); const idc=Math.floor((x-A.ox)/A.c)+A.nx*(Math.floor((y-A.oy)/A.c)+A.ny*Math.floor((z-A.oz)/A.c));
      wake=A.shadow[idc]>0; const f=wake?0.5:1; x+=out[0]*ds*f; y+=out[1]*ds*f; z+=out[2]*ds*f;
      if(wake){ x+=(Math.random()-.5)*1.4; y+=(Math.random()-.5)*1.4; z+=(Math.random()-.5)*1.4; } }
    P.age[i]+=dt; if(!ok||P.age[i]>9){ P.alive[i]=0; continue; }
    h[b]=x;h[b+1]=y;h[b+2]=z;
    const hue=Math.min(1,Math.max(0,(sp-0.35)/1.1)); // azul → rojo
    const rgb=hsv(0.62-0.62*hue,0.85,0.95);
    for(let j=0;j<TL-1;j++){ const f=1-j/(TL-1), o=(i*(TL-1)+j)*6, a=(i*TL+j)*3, c=(i*TL+j+1)*3;
      P.pos[o]=h[a];P.pos[o+1]=h[a+1];P.pos[o+2]=h[a+2];P.pos[o+3]=h[c];P.pos[o+4]=h[c+1];P.pos[o+5]=h[c+2];
      const f1=f, f2=f-1/(TL-1); for(let q=0;q<3;q++){ P.col[o+q]=bg[q]+(rgb[q]-bg[q])*f1; P.col[o+3+q]=bg[q]+(rgb[q]-bg[q])*Math.max(0,f2); } }
  }
  P.g.attributes.position.needsUpdate=true; P.g.attributes.color.needsUpdate=true;
}
