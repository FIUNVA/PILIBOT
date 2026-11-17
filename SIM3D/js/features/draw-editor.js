'use strict';
/* ---------- editor de dibujo (paneles laterales exteriores y tapas) ---------- */
const PT=[{k:2,nm:'Lateral der.',n:[1,0,0],u:[0,0,-1]},{k:4,nm:'Lateral izq.',n:[-1,0,0],u:[0,0,1]},
          {k:6,nm:'Tapa frontal',n:[0,0,-1],u:[-1,0,0]},{k:7,nm:'Tapa posterior',n:[0,0,1],u:[1,0,0]}];
const PPM=6, paints=[], ED={on:false,face:0,tool:'brush',color:'#1f5fbf',size:3,sym:false,p3d:false,fillShape:true,all:false};
PT.forEach((f,i)=>{
  const b=bodies[f.k], P=b.g.attributes.position.array, I=b.g.index.array, n=new THREE.Vector3(...f.n), u=new THREE.Vector3(...f.u);
  let mx=-1e9; for(let j=0;j<P.length;j+=3) mx=Math.max(mx,P[j]*n.x+P[j+1]*n.y+P[j+2]*n.z);
  const tri=[]; let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;
  for(let j=0;j<I.length;j+=3){
    const v=[0,1,2].map(q=>new THREE.Vector3().fromArray(P,I[j+q]*3));
    if(v.every(p=>Math.abs(p.dot(n)-mx)<0.02)){ tri.push(v); v.forEach(p=>{const a=p.dot(u);a0=Math.min(a0,a);a1=Math.max(a1,a);b0=Math.min(b0,p.y);b1=Math.max(b1,p.y);}); }
  }
  const W=Math.ceil((a1-a0)*PPM), H=Math.ceil((b1-b0)*PPM), pos=[], uv=[], nor=[];
  const m=document.createElement('canvas'); m.width=W; m.height=H; const mc=m.getContext('2d');
  mc.fillStyle='rgba(125,160,205,.30)'; mc.strokeStyle='rgba(125,160,205,.75)'; mc.lineWidth=1;
  tri.forEach(v=>{ mc.beginPath(); v.forEach((p,q)=>{const s=(p.dot(u)-a0)/(a1-a0), t=(p.y-b0)/(b1-b0);
      pos.push(p.x+n.x*0.04,p.y+n.y*0.04,p.z+n.z*0.04); uv.push(s,t); nor.push(n.x,n.y,n.z);
      q?mc.lineTo(s*W,(1-t)*H):mc.moveTo(s*W,(1-t)*H);}); mc.closePath(); mc.fill(); });
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const c=document.createElement('canvas'); c.width=W; c.height=H; const ctx=c.getContext('2d',{willReadFrequently:true});
  const tex=new THREE.CanvasTexture(c); tex.anisotropy=8;
  const mat=new THREE.MeshLambertMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const mesh=new THREE.Mesh(g,mat); mesh.userData.paint=i; mesh.renderOrder=1; mesh.frustumCulled=false; b.grp.add(mesh); b.paintMesh=mesh;
  paints.push({f,b,mesh,c,ctx,tex,m,W,H,hist:[]});
});
const rgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const touch=p=>{p.tex.needsUpdate=true;};
function snap(p){p.hist.push(p.ctx.getImageData(0,0,p.W,p.H)); if(p.hist.length>20)p.hist.shift();}
function stamp(p,x,y,tool){
  const c=p.ctx, r=ED.size*PPM/2; c.save();
  if(tool==='erase') c.globalCompositeOperation='destination-out';
  c.fillStyle=ED.color;
  if(tool==='spray'){ c.globalAlpha=.6; for(let i=0;i<26;i++){const a=Math.random()*6.283,d=Math.sqrt(Math.random())*r*1.7;c.fillRect(x+Math.cos(a)*d-.9,y+Math.sin(a)*d-.9,1.9,1.9);} }
  else { c.beginPath(); c.arc(x,y,Math.max(.6,r),0,6.283); c.fill(); }
  c.restore();
}
const tl=()=>ED.tool==='erase'||ED.tool==='spray'?ED.tool:'brush';
function dab(p,x,y){ stamp(p,x,y,tl()); if(ED.sym) stamp(p,p.W-x,y,tl()); touch(p); }
function seg(p,x0,y0,x1,y1){ const d=Math.hypot(x1-x0,y1-y0), st=Math.max(1,ED.size*PPM*0.3), N=Math.max(1,Math.ceil(d/st));
  for(let i=1;i<=N;i++) dab(p,x0+(x1-x0)*i/N,y0+(y1-y0)*i/N); }
function floodFill(p,x,y){
  x=Math.floor(x); y=Math.floor(y); const {W,H}=p; if(x<0||y<0||x>=W||y>=H) return;
  const img=p.ctx.getImageData(0,0,W,H), d=img.data, o=(y*W+x)*4, t=[d[o],d[o+1],d[o+2],d[o+3]], col=rgb(ED.color);
  const near=i=>Math.abs(d[i]-t[0])+Math.abs(d[i+1]-t[1])+Math.abs(d[i+2]-t[2])+Math.abs(d[i+3]-t[3])<110;
  const seen=new Uint8Array(W*H), st=[x,y];
  while(st.length){ const yy=st.pop(), xx=st.pop(); let l=xx; while(l>=0&&!seen[yy*W+l]&&near((yy*W+l)*4)) l--; l++;
    let up=false,dn=false;
    for(let i=l;i<W&&!seen[yy*W+i]&&near((yy*W+i)*4);i++){ const k=yy*W+i; seen[k]=1; d[k*4]=col[0];d[k*4+1]=col[1];d[k*4+2]=col[2];d[k*4+3]=255;
      if(yy>0){const q=((yy-1)*W+i); const ok=!seen[q]&&near(q*4); if(ok&&!up)st.push(i,yy-1); up=ok;}
      if(yy<H-1){const q=((yy+1)*W+i); const ok=!seen[q]&&near(q*4); if(ok&&!dn)st.push(i,yy+1); dn=ok;} } }
  p.ctx.putImageData(img,0,0); touch(p);
}
function shape(p,s,x,y){
  const c=p.ctx; c.save(); c.fillStyle=c.strokeStyle=ED.color; c.lineWidth=Math.max(1,ED.size*PPM); c.lineCap=c.lineJoin='round';
  const one=(sx,ex)=>{ c.beginPath();
    if(ED.tool==='line'){c.moveTo(sx,s.y);c.lineTo(ex,y);c.stroke();}
    else if(ED.tool==='circle'){c.arc(sx,s.y,Math.hypot(ex-sx,y-s.y),0,6.283); ED.fillShape?c.fill():c.stroke();}
    else {const w=ex-sx,h=y-s.y; ED.fillShape?c.fillRect(sx,s.y,w,h):c.strokeRect(sx,s.y,w,h);} };
  one(s.x,x); if(ED.sym) one(p.W-s.x,p.W-x); c.restore(); touch(p);
}
function pxy(p,e){const r=p.c.getBoundingClientRect(); return [(e.clientX-r.left)/r.width*p.W,(e.clientY-r.top)/r.height*p.H];}
/* lienzo 2D */
let s2=null;
const SHAPES=['line','circle','rect'];
function wire2D(p){
  p.c.addEventListener('pointerdown',e=>{ if(e.button!==0)return; p.c.setPointerCapture(e.pointerId); const [x,y]=pxy(p,e); snap(p);
    if(ED.tool==='fill'){floodFill(p,x,y);return;}
    s2={id:e.pointerId,x,y,lx:x,ly:y,img:SHAPES.includes(ED.tool)?p.ctx.getImageData(0,0,p.W,p.H):null};
    if(!s2.img) dab(p,x,y); });
  p.c.addEventListener('pointermove',e=>{ if(!s2||e.pointerId!==s2.id)return; const [x,y]=pxy(p,e);
    if(s2.img){p.ctx.putImageData(s2.img,0,0); shape(p,s2,x,y);} else {seg(p,s2.lx,s2.ly,x,y); s2.lx=x;s2.ly=y;} });
  const end=e=>{ if(s2&&e.pointerId===s2.id) s2=null; };
  p.c.addEventListener('pointerup',end); p.c.addEventListener('pointercancel',end);
}
paints.forEach(wire2D);
/* pintura directa sobre el modelo */
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
function pick3D(e){
  const r=canvas.getBoundingClientRect(); ndc.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)); ray.setFromCamera(ndc,camera);
  const list=[]; bodies.slice(0,NMAIN).forEach((b,k)=>{ if(b.visible&&k!==5){list.push(b.mesh); if(b.paintMesh)list.push(b.paintMesh);} });
  const h=ray.intersectObjects(list,false)[0]; if(!h||h.object.userData.paint===undefined||!h.uv) return null;
  const i=h.object.userData.paint, p=paints[i]; return {i,x:h.uv.x*p.W,y:(1-h.uv.y)*p.H};
}
let s3=null;
stage.addEventListener('pointerdown',e=>{
  if(!ED.on||!ED.p3d||e.target!==canvas||e.button!==0) return;
  const h=pick3D(e); if(!h) return; e.stopPropagation(); S.spin&&setSpin(false);
  selectFace(h.i); const p=paints[h.i]; snap(p);
  if(ED.tool==='fill'){floodFill(p,h.x,h.y);return;}
  canvas.setPointerCapture(e.pointerId); s3={id:e.pointerId,i:h.i,x:h.x,y:h.y}; dab(p,h.x,h.y);
},true);
canvas.addEventListener('pointermove',e=>{ if(!s3||e.pointerId!==s3.id)return; const h=pick3D(e); if(h&&h.i===s3.i){seg(paints[h.i],s3.x,s3.y,h.x,h.y);s3.x=h.x;s3.y=h.y;} });
const end3=e=>{ if(s3&&e.pointerId===s3.id) s3=null; };
canvas.addEventListener('pointerup',end3); canvas.addEventListener('pointercancel',end3);
/* diseños predeterminados */
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const TAU=Math.PI*2;
const DES=[
 ['Circuito',(c,W,H,R)=>{ c.fillStyle='#08182b';c.fillRect(0,0,W,H); c.strokeStyle='rgba(56,189,248,.09)';c.lineWidth=1;
   for(let x=0;x<W;x+=24){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();} for(let y=0;y<H;y+=24){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
   c.shadowColor='#22d3ee';c.shadowBlur=7;c.lineWidth=2.6;
   for(let k=0;k<30;k++){ let x=Math.round(R()*W/24)*24,y=Math.round(R()*H/24)*24,dir=Math.floor(R()*4)*2; c.strokeStyle=['#22d3ee','#38bdf8','#7dd3fc','#818cf8'][k%4]; c.beginPath();c.moveTo(x,y);
     for(let s=0;s<5;s++){const L=(1+Math.floor(R()*3))*24,a=dir*Math.PI/4; x+=Math.cos(a)*L;y+=Math.sin(a)*L;c.lineTo(x,y);dir=(dir+(R()<.5?1:7))%8;} c.stroke(); c.beginPath();c.arc(x,y,6,0,TAU);c.stroke(); }
   c.shadowBlur=0; for(let k=0;k<3;k++){const w=70+R()*40,h=50+R()*30,x=R()*(W-w),y=R()*(H-h); c.fillStyle='#0d2a4a';c.fillRect(x,y,w,h);c.strokeStyle='#38bdf8';c.lineWidth=2;c.strokeRect(x,y,w,h);
     c.fillStyle='#7dd3fc'; for(let q=0;q<6;q++){c.fillRect(x+8+q*(w-16)/6,y-6,6,6);c.fillRect(x+8+q*(w-16)/6,y+h,6,6);} c.beginPath();c.arc(x+12,y+12,4,0,TAU);c.fill();}}],
 ['Ondas',(c,W,H,R)=>{ const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a2540');g.addColorStop(1,'#0e5a9c');c.fillStyle=g;c.fillRect(0,0,W,H);
   for(let k=0;k<9;k++){ const y0=H*(0.2+k*0.09),A=H*(0.03+0.01*k),f=2+k*0.4,ph=R()*TAU; c.beginPath();c.moveTo(0,H);
     for(let x=0;x<=W;x+=4)c.lineTo(x,y0+Math.sin(x/W*TAU*f+ph)*A); c.lineTo(W,H);c.closePath(); c.fillStyle=`hsla(${200+k*3},75%,${22+k*5}%,.55)`;c.fill(); c.strokeStyle='rgba(190,230,255,.45)';c.lineWidth=2;c.stroke(); }
   c.strokeStyle='rgba(200,235,255,.6)';c.lineWidth=2; for(let k=0;k<22;k++){c.beginPath();c.arc(R()*W,R()*H*0.7,3+R()*9,0,TAU);c.stroke();}}],
 ['Tron',(c,W,H)=>{ c.fillStyle='#02060f';c.fillRect(0,0,W,H); const hz=H*0.5;
   const sg=c.createLinearGradient(0,hz-H*0.3,0,hz); sg.addColorStop(0,'#6366f1');sg.addColorStop(1,'#22d3ee'); c.fillStyle=sg;c.beginPath();c.arc(W/2,hz,H*0.26,Math.PI,0);c.fill();
   c.fillStyle='#02060f'; for(let k=0;k<6;k++){c.fillRect(W/2-H*.3,hz-H*.02-k*H*.035,H*.6,H*.004*(k+1));}
   c.shadowColor='#22d3ee';c.shadowBlur=8;c.strokeStyle='#22d3ee';c.lineWidth=2;
   for(let i=-14;i<=14;i++){c.beginPath();c.moveTo(W/2+i*8,hz);c.lineTo(W/2+i*W*0.14,H);c.stroke();}
   for(let k=1;k<=10;k++){const y=hz+(H-hz)*Math.pow(k/10,2);c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
   c.beginPath();c.moveTo(0,hz);c.lineTo(W,hz);c.stroke(); c.shadowBlur=0}],
 ['Camuflaje',(c,W,H,R)=>{ c.fillStyle='#9fb4c8';c.fillRect(0,0,W,H); const cols=['#7e97b0','#566e8a','#2d4259','#d6e2ee'];
   for(let k=0;k<95;k++){ c.fillStyle=cols[k%4]; const x=R()*W,y=R()*H,r=16+R()*34; for(let q=0;q<3;q++){c.beginPath();c.ellipse(x+(R()-.5)*r,y+(R()-.5)*r*.6,r*(0.6+R()*.6),r*(0.3+R()*.4),R()*Math.PI,0,TAU);c.fill();} }}],
 ['Hexágonos',(c,W,H,R)=>{ c.fillStyle='#0b1c33';c.fillRect(0,0,W,H); const r=24,dx=r*Math.sqrt(3),dy=r*1.5; c.lineWidth=2.5;
   for(let j=-1;j*dy<H+r;j++)for(let i=-1;i*dx<W+r;i++){ const x=i*dx+(j&1?dx/2:0),y=j*dy; c.beginPath();for(let q=0;q<6;q++){const a=TAU*(q+.5)/6;c.lineTo(x+Math.cos(a)*(r-2),y+Math.sin(a)*(r-2));}c.closePath();
     c.fillStyle=`hsl(${205+(x/W)*25},${60+R()*20}%,${16+(y/H)*22+R()*16}%)`;c.fill(); if(R()<.12){c.strokeStyle='#67e8f9';c.stroke();} }}],
 ['Carreras',(c,W,H)=>{ c.fillStyle='#0f172a';c.fillRect(0,0,W,H); c.save();c.translate(W/2,H/2);c.rotate(-0.32);
   c.fillStyle='#22d3ee';c.fillRect(-W,-H*0.19,2*W,H*0.12); c.fillStyle='#f1f5f9';c.fillRect(-W,-H*0.03,2*W,H*0.05); c.fillStyle='#2563eb';c.fillRect(-W,H*0.06,2*W,H*0.14);
   c.fillStyle='#f8fafc';c.font=`italic 900 ${Math.min(H*0.2,W*0.16)}px "Arial Black",Arial,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('PILIBOT',0,H*0.13);c.restore();
   c.fillStyle='#f1f5f9';c.beginPath();c.arc(W*0.17,H*0.2,H*0.12,0,TAU);c.fill();c.fillStyle='#0f172a';c.font=`900 ${H*0.14}px Arial,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('01',W*0.17,H*0.21);}],
 ['Robot',(c,W,H)=>{ const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#e0f2fe');g.addColorStop(1,'#93c5fd');c.fillStyle=g;c.fillRect(0,0,W,H);
   const m=Math.min(W,H); c.fillStyle='#0b1220'; c.beginPath(); c.roundRect?c.roundRect(W*.12,H*.2,W*.76,H*.6,m*.1):c.rect(W*.12,H*.2,W*.76,H*.6); c.fill();
   c.shadowColor='#22d3ee';c.shadowBlur=14;c.fillStyle='#67e8f9'; [.34,.66].forEach(x=>{c.beginPath();c.roundRect?c.roundRect(W*x-m*.09,H*.32,m*.18,m*.26,m*.04):c.rect(W*x-m*.09,H*.32,m*.18,m*.26);c.fill();});
   c.strokeStyle='#67e8f9';c.lineWidth=m*.03;c.lineCap='round';c.beginPath();c.arc(W/2,H*.56,m*.12,0.15*Math.PI,0.85*Math.PI);c.stroke(); c.shadowBlur=0;
   c.fillStyle='rgba(125,196,255,.35)';[.22,.78].forEach(x=>{c.beginPath();c.ellipse(W*x,H*.62,m*.06,m*.035,0,0,TAU);c.fill();});
   c.strokeStyle='#0b1220';c.lineWidth=m*.025;c.beginPath();c.moveTo(W/2,H*.2);c.lineTo(W/2,H*.08);c.stroke();c.fillStyle='#22d3ee';c.beginPath();c.arc(W/2,H*.07,m*.035,0,TAU);c.fill();
   c.fillStyle='#475569';[[.06,.08],[.94,.08],[.06,.92],[.94,.92]].forEach(([x,y])=>{c.beginPath();c.arc(W*x,H*y,m*.025,0,TAU);c.fill();});}],
 ['Galaxia',(c,W,H,R)=>{ const g=c.createRadialGradient(W*.3,H*.3,0,W/2,H/2,Math.hypot(W,H)/1.5);g.addColorStop(0,'#1e1b4b');g.addColorStop(1,'#020617');c.fillStyle=g;c.fillRect(0,0,W,H);
   [['rgba(99,102,241,.35)',.25,.7,.5],['rgba(34,211,238,.25)',.75,.3,.45]].forEach(([col,x,y,r])=>{const n=c.createRadialGradient(W*x,H*y,0,W*x,H*y,W*r);n.addColorStop(0,col);n.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=n;c.fillRect(0,0,W,H);});
   for(let k=0;k<240;k++){const x=R()*W,y=R()*H,r=R()<.06?2.2:R()*1.2+.3;c.fillStyle=`rgba(${200+R()*55},${220+R()*35},255,${.4+R()*.6})`;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
   const px=W*.66,py=H*.42,pr=H*.2, pg=c.createRadialGradient(px-pr*.4,py-pr*.4,pr*.1,px,py,pr);pg.addColorStop(0,'#93c5fd');pg.addColorStop(1,'#1e3a8a');
   c.strokeStyle='rgba(191,219,254,.55)';c.lineWidth=H*.025;c.beginPath();c.ellipse(px,py,pr*1.7,pr*.45,-0.35,Math.PI,TAU);c.stroke();
   c.fillStyle=pg;c.beginPath();c.arc(px,py,pr,0,TAU);c.fill();
   c.beginPath();c.ellipse(px,py,pr*1.7,pr*.45,-0.35,0,Math.PI);c.stroke();}],
 ['Low-poly',(c,W,H,R)=>{ const n=9,m=Math.round(n*H/W)+1,pts=[]; for(let j=0;j<=m;j++){pts.push([]);for(let i=0;i<=n;i++)pts[j].push([i/n*W+(i&&i<n?(R()-.5)*W/n*.7:0),j/m*H+(j&&j<m?(R()-.5)*H/m*.7:0)]);}
   const col=(x,y)=>`hsl(${210+(x/W)*18},${55+R()*15}%,${18+(1-y/H)*30+R()*12}%)`;
   for(let j=0;j<m;j++)for(let i=0;i<n;i++){const a=pts[j][i],b=pts[j][i+1],d=pts[j+1][i],e=pts[j+1][i+1]; [[a,b,d],[b,e,d]].forEach(t=>{c.beginPath();t.forEach((p,q)=>q?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();
     c.fillStyle=col((t[0][0]+t[1][0]+t[2][0])/3,(t[0][1]+t[1][1]+t[2][1])/3);c.fill();c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=1;c.stroke();});}}],
 ['Plano técnico',(c,W,H)=>{ c.fillStyle='#0b3a6e';c.fillRect(0,0,W,H); c.lineWidth=1;
   for(let x=0;x<W;x+=12){c.strokeStyle=x%60?'rgba(255,255,255,.08)':'rgba(255,255,255,.2)';c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
   for(let y=0;y<H;y+=12){c.strokeStyle=y%60?'rgba(255,255,255,.08)':'rgba(255,255,255,.2)';c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
   c.strokeStyle='#e0f2fe';c.fillStyle='#e0f2fe';c.lineWidth=2;const cx=W/2,cy=H/2,r=Math.min(W,H)*.25; c.beginPath();c.arc(cx,cy,r,0,TAU);c.stroke();c.beginPath();c.arc(cx,cy,r*.45,0,TAU);c.stroke();
   c.setLineDash([10,5,2,5]);c.beginPath();c.moveTo(cx-r*1.4,cy);c.lineTo(cx+r*1.4,cy);c.moveTo(cx,cy-r*1.4);c.lineTo(cx,cy+r*1.4);c.stroke();c.setLineDash([]);
   const y=cy+r*1.25;c.beginPath();c.moveTo(cx-r,y);c.lineTo(cx+r,y);c.moveTo(cx-r,y-8);c.lineTo(cx-r,y+8);c.moveTo(cx+r,y-8);c.lineTo(cx+r,y+8);c.stroke();
   c.font=`italic ${Math.round(H*.07)}px "Latin Modern Roman",serif`;c.textAlign='center';c.fillText('Ø '+(2*r/PPM).toFixed(1)+' mm',cx,y-8);
   c.font=`${Math.round(Math.min(H*.055,W*.045))}px "Latin Modern Roman",serif`;c.textAlign='left';c.fillText('FIUNVA · PILIBOT',W*.06,H*.93);c.strokeRect(W*.03,H*.03,W*.94,H*.94);}]
];
let seedN=1;
function applyDesign(i,p){ snap(p); p.ctx.clearRect(0,0,p.W,p.H); p.ctx.save(); DES[i][1](p.ctx,p.W,p.H,rng(seedN*977+PT.indexOf(p.f)*131+i)); p.ctx.restore(); touch(p); }
/* interfaz del editor */
function selectFace(i){
  ED.face=i; const p=paints[i];
  document.querySelectorAll('#p-faces button').forEach((b,k)=>b.classList.toggle('on',k===i));
  const w=$('p-wrap'); w.style.aspectRatio=p.W+' / '+p.H; p.m.style.pointerEvents='none'; p.m.style.cursor='default'; w.replaceChildren(p.m,p.c);
}
PT.forEach((f,i)=>{const b=document.createElement('button');b.textContent=f.nm;b.onclick=()=>selectFace(i);$('p-faces').appendChild(b);});
[['brush','Pincel'],['spray','Aerógrafo'],['line','Línea'],['circle','Círculo'],['rect','Rectáng.'],['fill','Relleno'],['erase','Borrador']].forEach(([k,nm])=>{
  const b=document.createElement('button');b.textContent=nm;b.dataset.t=k;if(k==='brush')b.className='on';
  b.onclick=()=>{ED.tool=k;document.querySelectorAll('#p-tools button').forEach(x=>x.classList.toggle('on',x===b));};$('p-tools').appendChild(b);});
['#0b1220','#12355b','#1f5fbf','#3b8bd9','#7fc4ff','#b9d7ea','#f1f5f9','#5a6b7d','#22d3ee','#818cf8','#e11d48','#f59e0b'].forEach(c=>{
  const b=document.createElement('button');b.className='swc';b.style.background=c;b.setAttribute('aria-label','Color '+c);
  b.onclick=()=>{ED.color=c;$('p-col').value=c;};$('p-sw').appendChild(b);});
$('p-col').oninput=e=>{ED.color=e.target.value;};
$('p-size').oninput=e=>{ED.size=+e.target.value;$('p-size-v').textContent=ED.size.toFixed(1)+' mm';};
$('p-sym').onchange=e=>{ED.sym=e.target.checked;};
$('p-3d').onchange=e=>{ED.p3d=e.target.checked;canvas.style.cursor=ED.p3d?'crosshair':'';};
$('p-fs').onchange=e=>{ED.fillShape=e.target.checked;};
$('p-all').onchange=e=>{ED.all=e.target.checked;};
$('t-paint').onchange=e=>{ED.on=e.target.checked;$('paint-opts').classList.toggle('show',ED.on);if(!ED.on){canvas.style.cursor='';}else{canvas.style.cursor=ED.p3d?'crosshair':'';}};
$('p-undo').onclick=()=>{const p=paints[ED.face];const h=p.hist.pop();if(h){p.ctx.putImageData(h,0,0);touch(p);}};
$('p-clear').onclick=()=>{const p=paints[ED.face];snap(p);p.ctx.clearRect(0,0,p.W,p.H);touch(p);};
$('p-png').onclick=()=>{const p=paints[ED.face];p.c.toBlob(bl=>{const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='PILIBOT_'+p.f.nm.replace(/\W+/g,'_')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);});};
DES.forEach(([nm],i)=>{const b=document.createElement('button');b.textContent=nm;b.onclick=()=>{ if(ED.all){paints.forEach(p=>applyDesign(i,p));} else applyDesign(i,paints[ED.face]); seedN++; };$('p-designs').appendChild(b);});
selectFace(0);
window.__ED=ED;window.__paints=paints;window.__design=i=>paints.forEach(p=>applyDesign(i,p));

