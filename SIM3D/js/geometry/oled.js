'use strict';
/* ---------- módulo OLED 1.3" (128x64) alineado a los barrenos de la tapa de pantalla ---------- */
const NV=new THREE.Vector3(0,2/Math.sqrt(5),-1/Math.sqrt(5)), WV=new THREE.Vector3(0,1/Math.sqrt(5),2/Math.sqrt(5));
const OLEDUP=120, EXUP={'Electrónica (PCB1)':[0,78,0],'Electrónica (PCB2)':[0,40,0],'Electrónica · alambre del interruptor y cable plano OLED':[0,78,0]};
const CXo=(30.728+90.728)/2, S0=WV.y*45.81+WV.z*24.0;          // s de los barrenos superiores (a lo largo de la pendiente)
const H_IN=27.237-0.05, H_OUT=30.237;                          // caras interior / exterior de la tapa de pantalla (n·p)
const MB=new THREE.Matrix4().makeBasis(new THREE.Vector3(-1,0,0),WV,NV); MB.setPosition(CXo,0,0);
const PCB_W=35.4, PCB_H=33.5, PCB_T=1.2, GL_T=1.6;
const S_TOP=S0+2.75, S_BOT=S_TOP-PCB_H, S_C=(S_TOP+S_BOT)/2;
const hPCB1=H_IN-GL_T, hPCB0=hPCB1-PCB_T;
// El módulo se gira 180° alrededor de su centro: pines arriba (lado de los barrenos fijados), vidrio abajo
const ROTc=new THREE.Matrix4().makeTranslation(0,S_C,0).multiply(new THREE.Matrix4().makeRotationZ(Math.PI)).multiply(new THREE.Matrix4().makeTranslation(0,-S_C,0));
function toW(g,keep){ if(!keep) g.applyMatrix4(ROTc); g.applyMatrix4(MB); return g; }
function box(u0,u1,s0,s1,h0,h1,keep){const g=new THREE.BoxGeometry(u1-u0,s1-s0,h1-h0);g.translate((u0+u1)/2,(s0+s1)/2,(h0+h1)/2);return toW(g,keep);}
function cyl(u,s,h0,h1,r,keep,seg){const g=new THREE.CylinderGeometry(r,r,h1-h0,seg||28);g.rotateX(Math.PI/2);g.translate(u,s,(h0+h1)/2);return toW(g,keep);}
const accCols={
 pcb:{light:[0x23549e,0x0b1f3a],dark:[0x1b3f7a,0x7fb2ff]},
 glass:{light:[0x070d1a,0x0b1f3a],dark:[0x070d1a,0x7fb2ff]},
 header:{light:[0x1e293b,0x0b1f3a],dark:[0x111c30,0x9ec5ff]},
 metal:{light:[0xaab6c8,0x334155],dark:[0xcbd5e1,0xcbd5e1]},
 steel:{light:[0x64748b,0x1e293b],dark:[0x8da2c0,0xdbe7ff]},
 band:{light:[0x07090f,0x4a6fb5],dark:[0x121a2c,0x86abf0]},
 blk:{light:[0x15181e,0x6b7a99],dark:[0x1a1f29,0x93a4c4]},
 wht:{light:[0xf4f6fa,0x8793aa],dark:[0xe9edf5,0xe9edf5]},
 silver:{light:[0x9097a3,0x3b4350],dark:[0xaeb5c1,0xf1f4f8]},
 chip:{light:[0x2c313b,0x7e8aa3],dark:[0x2a2f3b,0xa9b6cf]},
 tan:{light:[0xc99a52,0x6e4b14],dark:[0xb88a46,0xf0d9a6]},
 gold:{light:[0xe0b02e,0x7a5b0a],dark:[0xe6bb3f,0xffe8a0]},
 blue:{light:[0x1d5fd6,0x0b2a66],dark:[0x2a6fe8,0xa9c8ff]},
 ledk:{light:[0xf7f4e6,0x8793aa],dark:[0xf7f4e6,0xe9edf5]},
 solder:{light:[0xe6e9ee,0x5b6575],dark:[0xeef1f6,0xffffff]},
 rledk:{light:[0xd8434f,0x6b1020],dark:[0xff5a68,0xffc0c6]},
 bledk:{light:[0x2f7bff,0x0a2a66],dark:[0x5aa0ff,0xbcd6ff]},
 magn:{light:[0xc3c9d3,0x5b6575],dark:[0xcfd5df,0xf1f4f8]},
 padm:{light:[0x7d8593,0x2f3744],dark:[0x8c95a4,0xdfe5ee]},
 pcbred:{light:[0xc9202b,0x5a0c12],dark:[0xd8343e,0xffb0b5]},
 indm:{light:[0x5b616c,0x232832],dark:[0x7a8190,0xe3e8f0]},
 cellS:{light:[0xb4bac4,0x3f4a5c],dark:[0xaab2be,0xe3e8f0]},
 kapton:{light:[0xf0b429,0x7a4b00],dark:[0xf3c04b,0xffe3a3],tr:0.42},
 brass:{light:[0xc9a24a,0x5b4410],dark:[0xd9b55c,0xffe7a6]},
 pcmg:{light:[0x1d7a4a,0x0b3a22],dark:[0x23915a,0x9fe3bf]},
 wred:{light:[0xd1242f,0x5c0b12],dark:[0xff4a56,0xffb7bd]},
 sepr:{light:[0x8a8f98,0x383d46],dark:[0x9ba1ac,0xe4e7ed]},
 wgrn:{light:[0x2e9e4f,0x0d3d1c],dark:[0x3fd069,0xb8f0c8]},
 wblu:{light:[0x1d78d6,0x0b2a66],dark:[0x3aa0ff,0xbcd6ff]},
 wgry:{light:[0xa6abb4,0x3f4652],dark:[0xc4c9d1,0xe9edf5]}};
let accK=NMAIN, curEx=null;
function addAcc(g,kind,group,egIn){
  const eg=egIn||new THREE.EdgesGeometry(g,25);
  return addBody(g,eg,accK++,{acc:true,group:group||'oled',cols:accCols[kind],ex:curEx});
}
curEx='pcb';
// PCB con esquinas redondeadas y 4 barrenos de montaje (30 mm × 28 mm entre centros)
{ const sh=new THREE.Shape(), x0=-PCB_W/2,x1=PCB_W/2,y0=S_BOT,y1=S_TOP,r=1.6;
  sh.moveTo(x0+r,y0); sh.lineTo(x1-r,y0); sh.quadraticCurveTo(x1,y0,x1,y0+r); sh.lineTo(x1,y1-r); sh.quadraticCurveTo(x1,y1,x1-r,y1);
  sh.lineTo(x0+r,y1); sh.quadraticCurveTo(x0,y1,x0,y1-r); sh.lineTo(x0,y0+r); sh.quadraticCurveTo(x0,y0,x0+r,y0);
  [[-15,S0],[15,S0],[-15,S_BOT+2.75],[15,S_BOT+2.75]].forEach(([u,s])=>{const h=new THREE.Path();h.absarc(u,s,1.25,0,Math.PI*2,true);sh.holes.push(h);});
  const g=new THREE.ExtrudeGeometry(sh,{depth:PCB_T,bevelEnabled:false,curveSegments:32}); g.translate(0,0,hPCB0); addAcc(toW(g,true),'pcb'); }
const S_GL0=S_TOP-28.5, S_GL1=S_TOP-5.5;
curEx='glass'; addAcc(box(-16.5,16.5,S_GL0,S_GL1,hPCB1,H_IN),'glass');                       // vidrio del panel OLED
addAcc(box(-6.5,6.5,S_GL0-0.25,S_GL0+0.1,hPCB1,hPCB1+0.25),'header');       // cinta flexible (FPC)
curEx='pcb'; addAcc(box(-5.3,5.3,S_BOT+1.0,S_BOT+3.5,hPCB0-2.5,hPCB0),'header');           // cabezal de 4 pines
[-3.81,-1.27,1.27,3.81].forEach(u=>addAcc(cyl(u,S_BOT+2.25,hPCB0-8,hPCB1+0.35,0.32,false,12),'metal'));
// pads anulares de oro con cono de soldadura en la cara superior (lado vidrio), alrededor de cada pin
[-3.81,-1.27,1.27,3.81].forEach(u=>{
  const sh=new THREE.Shape(); sh.absarc(0,0,0.85,0,Math.PI*2,false); const hh=new THREE.Path(); hh.absarc(0,0,0.33,0,Math.PI*2,true); sh.holes.push(hh);
  const g=new THREE.ExtrudeGeometry(sh,{depth:0.06,bevelEnabled:false,curveSegments:24}); g.translate(u,S_BOT+2.25,hPCB1); addAcc(toW(g,false),'gold');
  const c=new THREE.CylinderGeometry(0.36,0.72,0.42,20); c.rotateX(Math.PI/2); c.translate(u,S_BOT+2.25,hPCB1+0.06+0.21); addAcc(toW(c,false),'solder');
});
// componentes SMD en la cara posterior
[[-10,S_BOT+9,2.2,1.1],[ -7,S_BOT+9,2.2,1.1],[9,S_BOT+14,3.2,1.6],[-12,S_BOT+20,1.6,3.0]].forEach(([u,s,w,hh],i)=>
  addAcc(box(u-w/2,u+w/2,s-hh/2,s+hh/2,hPCB0-0.7,hPCB0),i%2?'metal':'header'));
// separadores hexagonales, tornillos M2 con cabeza cilíndrica y ranura simple (desarmador plano) y tuercas en los 2 barrenos de la tapa
[-15,15].forEach(u=>{
  curEx='spacer'; addAcc(cyl(u,S0,hPCB1,H_IN+0.05,2.2,true,6),'metal');                          // separador
  curEx='screw'; addAcc(cyl(u,S0,hPCB0-3.0,H_OUT+0.05,1.05,true,20),'steel');                   // vástago
  curEx='nut'; addAcc(cyl(u,S0,hPCB0-1.8,hPCB0,2.2,true,6),'metal');                          // tuerca
  curEx='screw'; addAcc(cyl(u,S0,H_OUT,H_OUT+0.25,2.5,true,32),'steel');                        // base de la cabeza
  { const r=2.5, hd=1.05, zb=H_OUT+0.25, Rs=(r*r+hd*hd)/(2*hd), th=Math.asin(r/Rs), zc=zb+hd-Rs;    // cabeza abombada (casquete esférico)
    const g=new THREE.SphereGeometry(Rs,40,14,0,Math.PI*2,0,th); g.rotateX(Math.PI/2); g.translate(u,S0,zc); toW(g,true); addAcc(g,'steel');
    const N=28, w=0.35, P=[], I=[];                                                                  // ranura recta horizontal que cruza la cabeza de lado a lado
    for(let i=0;i<=N;i++){ const x=-r*0.985+2*r*0.985*i/N; [-w,w].forEach(y=>P.push(u+x,S0+y,zc+Math.sqrt(Rs*Rs-x*x-y*y)+0.012)); }
    for(let i=0;i<N;i++){ const a=2*i; I.push(a,a+1,a+3,a,a+3,a+2,a,a+3,a+1,a,a+2,a+3); }
    const gs=new THREE.BufferGeometry(); gs.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); gs.setIndex(I); gs.computeVertexNormals(); toW(gs,true); addAcc(gs,'header'); }
});
curEx=null;
// pantalla: textura animada (128×64 px) + brillo + serigrafía
const flat=[];
function flatMesh(g,mat,order,ex){const m=new THREE.Mesh(g,mat);m.renderOrder=order;m.userData.oled=true;m.userData.ex=ex||'glass';root.add(m);flat.push(m);return m;}
const SC=document.createElement('canvas'); SC.width=512; SC.height=256; const sctx=SC.getContext('2d');
const screenTex=new THREE.CanvasTexture(SC); screenTex.anisotropy=8;
{ const g=new THREE.PlaneGeometry(29.42,14.7); g.translate(0,S_BOT+17,H_IN+0.01); toW(g,true);
  flatMesh(g,new THREE.MeshBasicMaterial({map:screenTex,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),5);
  // halo
  const gc=document.createElement('canvas'); gc.width=gc.height=128; const gx=gc.getContext('2d');
  const gr=gx.createRadialGradient(64,64,6,64,64,64); gr.addColorStop(0,'rgba(120,200,255,0.55)'); gr.addColorStop(1,'rgba(120,200,255,0)');
  gx.fillStyle=gr; gx.fillRect(0,0,128,128);
  const hg=new THREE.PlaneGeometry(44,26); hg.translate(0,S_BOT+17,H_IN+0.02); toW(hg,true);
  const hm=flatMesh(hg,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(gc),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,opacity:0.5}),6);
  window.__halo=hm;
  // serigrafía de pines
  const tc=document.createElement('canvas'); tc.width=512; tc.height=78; const tx=tc.getContext('2d');
  tx.fillStyle='#dbe7ff'; tx.font='bold 44px Arial, sans-serif'; tx.textBaseline='middle';
  tx.save(); tx.translate(256,39); tx.rotate(Math.PI); tx.translate(-256,-39);                       // rótulos girados 180°: legibles de izquierda a derecha
  ['VDD','GND','SCK','SDA'].forEach((s,i)=>{tx.textAlign='center';tx.fillText(s,256+(i-1.5)*(2.54/13.16*512),39);}); tx.restore();
  const sg=new THREE.PlaneGeometry(13.16,2.0); sg.translate(0,S_BOT+4.1,hPCB1+0.02); toW(sg,false);
  flatMesh(sg,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(tc),transparent:true,side:THREE.DoubleSide,opacity:0.9}),4,'pcb');
}

