'use strict';
/* ---------- bandas elásticas negras (cinta abierta de 8 × 1.2 mm) ----------
   Recorrido de cada banda (simétrico):
   cara frontal: viene del lateral, pasa POR ENCIMA de la ranura más cercana al borde, entra por la ranura
   más cercana al centro, se dobla por detrás del puente y sale por la ranura del borde; la punta queda
   presionada por la propia banda. Luego rodea los laterales (oprimiendo las caras exteriores) hasta la tapa
   posterior, entra por su ranura, cruza el interior del robot y sale por el lado opuesto. */
function ribbonStrip(pts,rad,W,T,seg,anchor){
  const n=pts.length, P=[], TT=[];
  for(let i=0;i<n;i++){
    const p1=pts[i];
    if(i===0||i===n-1){ P.push(p1.clone()); TT.push((i===0?pts[1].clone().sub(p1):p1.clone().sub(pts[n-2])).normalize()); continue; }
    const a=p1.clone().sub(pts[i-1]).normalize(), b=pts[i+1].clone().sub(p1).normalize();
    const ang=Math.acos(THREE.MathUtils.clamp(a.dot(b),-1,1));
    if(ang<1e-4){ P.push(p1.clone()); TT.push(a); continue; }
    const rr=p1.r||rad, d=rr*Math.tan(ang/2), s=p1.clone().addScaledVector(a,-d);
    const axis=a.clone().cross(b).normalize(), bis=b.clone().sub(a).normalize();
    const c=p1.clone().addScaledVector(bis,rr/Math.cos(ang/2)), v0=s.clone().sub(c);
    const sg=Math.max(3,Math.ceil(seg*ang/(Math.PI/2)));
    for(let k=0;k<=sg;k++){ const th=ang*k/sg; P.push(c.clone().add(v0.clone().applyAxisAngle(axis,th))); TT.push(a.clone().applyAxisAngle(axis,th)); }
  }
  // la cinta es una superficie reglada vertical (generatriz ŷ): bordes siempre a ±W/2 en y, grosor perpendicular a la cara
  const N=P.length, Y=new THREE.Vector3(0,1,0), hw=W/2, ht=T/2, SG=[[1,1],[-1,1],[-1,-1],[1,-1]];
  const cum=[0]; for(let j=1;j<N;j++) cum[j]=cum[j-1]+P[j].distanceTo(P[j-1]);
  const Ltot=cum[N-1], rest=[], flat=[], cur=[];
  for(let j=0;j<N;j++){
    const nn=TT[j].clone().cross(Y).normalize(), p=P[j];
    rest.push(SG.map(([a,b])=>p.clone().addScaledVector(Y,a*hw).addScaledVector(nn,b*ht)));
    flat.push(SG.map(([a,b])=>new THREE.Vector3(anchor.x+cum[j]-Ltot/2,anchor.y+a*hw,anchor.z+b*ht)));   // cinta estirada y recta
    cur.push(SG.map(()=>new THREE.Vector3()));
  }
  const posA=new Float32Array((N*8+8)*3), epA=new Float32Array((4*(N-1)+8)*6);
  function fill(R){
    let o=0; const put=v=>{posA[o++]=v.x;posA[o++]=v.y;posA[o++]=v.z;};
    for(let j=0;j<N;j++){const c=R[j]; [0,1,1,2,2,3,3,0].forEach(i=>put(c[i]));}
    [0,N-1].forEach(j=>R[j].forEach(put));
    let e=0; const pe=v=>{epA[e++]=v.x;epA[e++]=v.y;epA[e++]=v.z;};
    for(let k=0;k<4;k++) for(let j=0;j<N-1;j++){pe(R[j][k]);pe(R[j+1][k]);}
    [0,N-1].forEach(j=>{for(let k=0;k<4;k++){pe(R[j][k]);pe(R[j][(k+1)%4]);}});
  }
  const idx=[];
  for(let j=0;j<N-1;j++) for(let f=0;f<4;f++){ const a0=j*8+f*2, b0=(j+1)*8+f*2; idx.push(a0,b0,a0+1, a0+1,b0,b0+1); }
  [N*8,N*8+4].forEach(bs=>idx.push(bs,bs+1,bs+2, bs,bs+2,bs+3));
  fill(rest);
  let vol=0; for(let i=0;i<idx.length;i+=3){const A=new THREE.Vector3().fromArray(posA,idx[i]*3),B=new THREE.Vector3().fromArray(posA,idx[i+1]*3),C=new THREE.Vector3().fromArray(posA,idx[i+2]*3); vol+=A.dot(B.clone().cross(C));}
  if(vol<0){ for(let i=0;i<idx.length;i+=3){const q=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=q;} }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(posA,3)); g.setIndex(idx); g.computeVertexNormals();
  const eg=new THREE.BufferGeometry(); eg.setAttribute('position',new THREE.BufferAttribute(epA,3));
  let last=0;
  function update(b){            // b = 0 envuelta en el robot · 1 desdoblada y estirada
    if(Math.abs(b-last)<1e-5) return; last=b;
    for(let j=0;j<N;j++) for(let k=0;k<4;k++) cur[j][k].lerpVectors(rest[j][k],flat[j][k],b);
    fill(cur); g.attributes.position.needsUpdate=true; eg.attributes.position.needsUpdate=true; g.computeVertexNormals();
  }
  return {g,eg,update};
}
{ const V=(x,y,z,r)=>{const v=new THREE.Vector3(x,y,z); if(r) v.r=r; return v;}, TH=1.2, WD=9.6, RAD=1.0, SEG=30, RC=1.6;   // alto de la banda: 9.6 mm (0.2 mm menos que los 9.8 originales; ranura de 11 mm) para librar el arco de las ranuras
  const zf=-20.61-TH/2, zf2=zf-TH, zbo=36.39+TH/2, zfi=-17.61+TH/2, zbi=33.39-TH/2;   // capas frontal 1/2, posterior, interiores
  const xcL=27.73-TH/2, xcR=93.73+TH/2;                                                 // caras laterales exteriores
  const cc=bbox.getCenter(new THREE.Vector3());
  // mitad frontal: del esquinero (2.ª capa) hacia el centro → ranura central → detrás → ranura del borde → punta (hasta el doblez lateral)
  function front(yf,xo,xi,dc){            // dc = +1 si el centro queda hacia +x (lado izquierdo), −1 en el derecho
    const xc=dc>0?xcL:xcR;
    return [ V(xc,yf,zf2,RC), V(xi,yf,zf2), V(xi,yf,zfi), V(xo,yf,zfi), V(xo,yf,zf), V(xc+dc*RC,yf,zf) ];
  }
  function band(o){
    const {yf,yr,xoL,xiL,xoR,xiR,xrL,xrR}=o;
    const L=front(yf,xoL,xiL,+1), R=front(yf,xoR,xiR,-1);
    return [ ...L.slice().reverse(),
             V(xcL,yr,zbo), V(xrL,yr,zbo), V(xrL,yr,zbi), V(xrR,yr,zbi), V(xrR,yr,zbo), V(xcR,yr,zbo),
             ...R ];
  }
  const mk=(o,anchor,pts)=>{const {g,eg,update}=ribbonStrip(pts||band(o),RAD,WD,TH,SEG,anchor); const body=addAcc(g,'band','band',eg);
    body.update=update; [body.mesh,body.lines,body.sb,body.sf].forEach(m=>m.frustumCulled=false);};
  // inferior: horizontal (y = −12.39). Amarre por fricción en la tapa POSTERIOR (ranuras 38.78/42.78 y 78.78/82.78);
  // al frente entra de fuera a dentro por la ranura más alejada del centro y sale por la más cercana al centro
  { const y=-12.39, zo=zbo, zo2=zbo+TH;
    const tie=(xo,xi,dc)=>{ const xc=dc>0?xcL:xcR; return [V(xc,y,zo2,RC),V(xi,y,zo2),V(xi,y,zbi),V(xo,y,zbi),V(xo,y,zo),V(xc+dc*RC,y,zo)]; };
    const pts=[ ...tie(38.78,42.78,+1).reverse(),
      V(xcL,y,zf,RC), V(38.73,y,zf), V(38.73,y,zfi), V(42.73,y,zfi), V(42.73,y,zf),
      V(78.73,y,zf), V(78.73,y,zfi), V(82.73,y,zfi), V(82.73,y,zf), V(xcR,y,zf,RC),
      ...tie(82.78,78.78,-1) ];
    mk(null,new THREE.Vector3(cc.x,-58,cc.z+10),pts); }
  // superior: inclinada por los laterales, de la tapa posterior (y = 39.86) a la frontal (y = 12.86)
  mk({yf:12.86,yr:39.86,xoL:39.73,xiL:44.73,xoR:81.73,xiR:76.73,xrL:40.82,xrR:80.73}, new THREE.Vector3(cc.x,100,cc.z+10)); }

