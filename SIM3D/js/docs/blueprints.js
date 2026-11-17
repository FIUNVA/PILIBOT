'use strict';
/* ---------- planos tipo SolidWorks ---------- */
function pvFn(type){
  const m={front:(x,y,z)=>[-x,y,-z],back:(x,y,z)=>[x,y,z],right:(x,y,z)=>[-z,y,x],left:(x,y,z)=>[z,y,-x],top:(x,y,z)=>[x,-z,y],bottom:(x,y,z)=>[x,z,-y]};
  if(m[type]) return m[type];
  const az=type==='iso2'?Math.PI*1.25:Math.PI/4, E=Math.asin(1/Math.sqrt(3)), fx=Math.sin(az)*Math.cos(E), fy=-Math.sin(E), fz=Math.cos(az)*Math.cos(E);
  let rx=-fz, rz=fx; const n=Math.hypot(rx,rz); rx/=n; rz/=n;
  const ux=-rz*fy, uy=rz*fx-rx*fz, uz=rx*fy;
  return (x,y,z)=>[x*rx+z*rz, x*ux+y*uy+z*uz, -(x*fx+y*fy+z*fz)];
}
const VN={front:'VISTA FRONTAL',back:'VISTA POSTERIOR',right:'LATERAL DERECHA',left:'LATERAL IZQUIERDA',top:'VISTA SUPERIOR',bottom:'VISTA INFERIOR',iso:'ISOMÉTRICA',iso2:'ISOMÉTRICA POSTERIOR'};
function triPos(b){ if(b._tp) return b._tp; const g=b.g, P=g.attributes.position.array, I=g.index; if(!I) return b._tp=P; const A=I.array, Q=new Float32Array(A.length*3); for(let i=0;i<A.length;i++){ const k=A[i]*3; Q[i*3]=P[k]; Q[i*3+1]=P[k+1]; Q[i*3+2]=P[k+2]; } return b._tp=Q; }
/* utilidades para cotas de los planos */
function bnd(list,clip){ const r={x:[1e9,-1e9],y:[1e9,-1e9],z:[1e9,-1e9]};
  list.forEach(b=>{ const P=b.lines&&b.lines.geometry.attributes.position.array.length>6?b.lines.geometry.attributes.position.array:triPos(b), pv=b.o&&b.o.piv, py=pv?pv.y:0, pz=pv?pv.z:0;
    for(let i=0;i+2<P.length;i+=3){ const x=P[i], y=P[i+1]+py, z=P[i+2]+pz; if(clip){ const c=clip.ax===2?z:clip.ax===1?y:x; if(c<clip.lo||c>clip.hi) continue; }
      if(x<r.x[0])r.x[0]=x; if(x>r.x[1])r.x[1]=x; if(y<r.y[0])r.y[0]=y; if(y>r.y[1])r.y[1]=y; if(z<r.z[0])r.z[0]=z; if(z>r.z[1])r.z[1]=z; } });
  return r; }
window.__dbgBnd=(re,lo,hi,ax)=>{ const o={}; bodies.filter(b=>re.test(b.o.name||'')).forEach(b=>{ const r=bnd([b],lo==null?null:{lo,hi,ax:ax||0}); o[b.o.name]=[r.x,r.y,r.z].map(a=>a.map(v=>+v.toFixed(2))); }); return o; };
const VVEC={front:[0,0,-1],back:[0,0,1],right:[1,0,0],left:[-1,0,0],top:[0,1,0],bottom:[0,-1,0]};
function viewVec(type){ if(VVEC[type]) return VVEC[type]; const az=type==='iso2'?Math.PI*1.25:Math.PI/4, E=Math.asin(1/Math.sqrt(3)); return [-Math.sin(az)*Math.cos(E),Math.sin(E),-Math.cos(az)*Math.cos(E)]; }
/* aristas de contorno (silueta) de las superficies curvas: aristas de la malla entre caras con normales distintas pero suaves */
function silEdges(b){
  if(b._sil) return b._sil; const P=triPos(b), nT=Math.floor(P.length/9), vid=new Map(), out=[], cr=[], sparse=true, E=new Map(), q=v=>Math.round(v*200)+65536;
  const gid=(o)=>{ const k=(q(P[o])*131072+q(P[o+1]))*131072+q(P[o+2]); let i=vid.get(k); if(i===undefined){ i=vid.size; vid.set(k,i); } return i; };
  for(let t=0;t<nT;t++){ const o=t*9, ux=P[o+3]-P[o], uy=P[o+4]-P[o+1], uz=P[o+5]-P[o+2], wx=P[o+6]-P[o], wy=P[o+7]-P[o+1], wz=P[o+8]-P[o+2];
    let nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx; const l=Math.hypot(nx,ny,nz); if(l<1e-9) continue; nx/=l; ny/=l; nz/=l;
    const ids=[gid(o),gid(o+3),gid(o+6)];
    for(let e=0;e<3;e++){ const a=ids[e], c=ids[(e+1)%3]; if(a===c) continue; const key=a<c?a*4194304+c:c*4194304+a, r=E.get(key);
      if(r===undefined){ E.set(key,[nx,ny,nz,P[o+e*3],P[o+e*3+1],P[o+e*3+2],P[o+((e+1)%3)*3],P[o+((e+1)%3)*3+1],P[o+((e+1)%3)*3+2]]); }
      else { const d=nx*r[0]+ny*r[1]+nz*r[2]; if(d<0.99995&&d>0.17) out.push(r[3],r[4],r[5],r[6],r[7],r[8],r[0],r[1],r[2],nx,ny,nz); else if(sparse&&d<=0.17) cr.push(r[3],r[4],r[5],r[6],r[7],r[8]); E.delete(key); } } }
  E.forEach(r=>{ cr.push(r[3],r[4],r[5],r[6],r[7],r[8]); });
  b._cr=new Float32Array(cr); return b._sil=new Float32Array(out);
}

const NODRAW=/[Cc]able|[Aa]lambre|soldadura|terminal JST|pads y barrenos|pads del módulo|[Cc]ableado|hilo \d/, NODRAW_NW=/[Cc]able|soldadura|terminal JST|pads y barrenos|pads del módulo|[Cc]ableado|hilo \d/;
function cutBody(b,pred,dx){
  const mk=(P,n)=>{ const out=[]; for(let i=0;i+3*n-1<P.length;i+=3*n){ let cx=0,cy=0,cz=0; for(let k=0;k<n;k++){cx+=P[i+3*k];cy+=P[i+3*k+1];cz+=P[i+3*k+2];} cx/=n;cy/=n;cz/=n;
      if(!pred||pred(cx,cy,cz)) for(let k=0;k<3*n;k+=3) out.push(P[i+k]+(dx||0),P[i+k+1],P[i+k+2]); } return new Float32Array(out); };
  return {o:b.o,lines:{geometry:{attributes:{position:{array:mk(b.lines.geometry.attributes.position.array,2)}}}},g:{attributes:{position:{array:mk(triPos(b),3)}},index:null,boundingBox:b.g.boundingBox},_pseudo:1};
}
function bbOf(list){ const mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9];
  list.forEach(b=>{ const P=triPos(b), pv=b.o&&b.o.piv, py=pv?pv.y:0, pz=pv?pv.z:0; for(let i=0;i+2<P.length;i+=3){ const v=[P[i],P[i+1]+py,P[i+2]+pz]; for(let k=0;k<3;k++){ if(v[k]<mn[k])mn[k]=v[k]; if(v[k]>mx[k])mx[k]=v[k]; } } });
  return {x0:mn[0],y0:mn[1],z0:mn[2],x1:mx[0],y1:mx[1],z1:mx[2]}; }
const TNOTES=[
[/^PIEZA/,['Ajuste a presión entre paneles: tolerancia de ranuras y lengüetas de ±0.1 mm.']],
[/^PLANO GENERAL · HOJA 1/,['Las bandas elásticas no se dibujan; su colocación está en el plano de acomodo de bandas.']],
[/^PLANO GENERAL · HOJA 2/,['Vistas complementarias del chasis; las cotas generales están en la hoja 1.']],
[/^CONJUNTO COMPLETO/,['Incluye electrónica y tracción; excluye las bandas elásticas.','Altura total del chasis sobre el piso: 81.3 mm (véase Medidas destacables).']],
[/^ACOPLE DE PCB1/,['Los cabezales de PCB1 entran en los zócalos hembra de PCB2.','La separación entre placas la fijan separadores plásticos; no hay cables entre ellas.']],
[/^PCB1/,['Placa de control: ESP32-C3-MINI, DRV8833, MPU6050 y sensor VL53.','Cabezales de motor y de OLED al borde; interruptor y LED RGB hacia el frente.']],
[/^PCB2/,['Placa de energía: BMS 2S, regulador de 3.3 V y conector magnético.','Recibe las terminales JST de las celdas y el conector 1×4 de los motores.']],
[/^MÓDULO OLED/,['Pantalla OLED de 1.3″ y 128 × 64 píxeles; interfaz de 4 hilos: VDD, GND, SCK, SDA.','Se fija a la tapa de acrílico con dos tornillos M2 y sus tuercas.']],
[/^MOTORREDUCTOR N20/,['Eje de salida en D de Ø3 mm: transmite el giro a la rueda de tracción.','Se sujeta a su base con tornillos M2 × 8 y tuercas M2.']],
[/^BASE DE SUJECIÓN/,['Soporte impreso: fija el motorreductor y lo alinea con la rueda de tracción.','Se atornilla a la placa de motores; los orificios deben coincidir con la placa.']],
[/^ENSAMBLE DE TRACCI/,['b (vía) y L (distancia entre ejes) definen el vuelco y el radio de giro del robot.','La altura libre al piso es de 2.2 mm, medida desde la base del motor.']],
[/^MOTORREDUCTORES N20 · PAR/,['Los ejes motrices quedan alineados sobre el mismo eje transversal.','Cada motor lleva su cable de dos hilos hacia el conector 1×4 de PCB2.']],
[/^BASES Y PLACA DE MOTORES/,['La placa de motores se une al chasis con separadores hexagonales M3 × 10.']],
[/^BANDAS DE GOMA/,['Ancho de contacto con el piso: 9 mm (tres ruedas de 3 mm).','Los relieves se alinean con el canal de la rueda central.']],
[/^ACOMODO DE LA BANDA DE RODADURA/,['Banda sin fin entre rueda de tracción (R 8.0) y rueda loca; los relieves engranan en la rueda.']],
[/^EJE DE LA RUEDA LOCA/,['Tornillo M3 × 10 de cabeza plana, tuerca M3 y separador hexagonal M3 × 6.','Balero 693ZZ: Ø3 × Ø8 × 4 mm.']],
[/^RUEDA/,['Orificio central de Ø3.0 mm con plano en D para el eje del motorreductor.','Los relieves de la rueda guían y engranan la banda de rodadura.']],
[/^BATERÍA LiPo/,['Celda LiPo 802040 con protección PCM; no se dibuja el cableado.']],
[/^BATERÍAS LiPo/,['Las dos celdas van enfrentadas y separadas por un espaciador de polímero blando de 2 mm.','Terminales JST hacia PCB2.']],
[/^NÚCLEO DE SUJECI/,['Separadores hexagonales M3 × 10 entre la placa inferior y la placa de motores.','Tornillos M3 × 6 con tuercas M3 fijan las placas al núcleo; los tornillos M2 × 8 de las bases de motor no forman parte de este núcleo.']]
];
function relNotes(title,list,opt,circL){
  const f1=v=>v.toFixed(1), N=[]; (opt.notes||[]).forEach(s=>N.push(s));
  try{ const hit=TNOTES.find(r=>r[0].test(title)); if(hit&&!(opt.notes&&opt.notes.length)) hit[1].forEach(s=>N.push(s)); }catch(e){}
  try{ const e=bnd(list,opt.clip||undefined); if(isFinite(e.x[0])){ N.push('Envolvente: '+f1(e.x[1]-e.x[0])+' (ancho) × '+f1(e.y[1]-e.y[0])+' (alto) × '+f1(e.z[1]-e.z[0])+' (profundidad) mm.'); } }catch(e){}
  if(list.length<=3&&!/NÚCLEO DE SUJECI|EJE DE LA RUEDA|BANDA|RUEDA/i.test(title)){ try{ const m=new Map(); list.forEach(b=>{ if(!b.lines) return; circL(b).forEach(c=>{ const k=(2*c.r).toFixed(1); let G=m.get(k); if(!G) m.set(k,G=[]); if(!G.some(w=>Math.hypot(w[0]-c.c[0],w[1]-c.c[1],w[2]-c.c[2])<1.0)) G.push(c.c); }); });
    const a=[...m.entries()].sort((p,q)=>q[1].length-p[1].length).slice(0,4); if(a.length&&a.length<=4) N.push('Orificios: '+a.map(([k,v])=>(v.length>1?v.length+'× ':'')+'Ø'+k).join(', ')+' mm.'); }catch(e){} }
  return N.slice(0,5);
}
function nestDims(dims){
  const G=new Map();
  dims.forEach(d=>{ if(/^iso/.test(d.v)||!d.off) return; const f=pvFn(d.v), A=f(d.p[0],d.p[1],d.p[2]), B=f(d.q[0],d.q[1],d.q[2]), dx=B[0]-A[0], dy=B[1]-A[1], L=Math.hypot(dx,dy); if(L<.3) return;
    const hz=Math.abs(dx)>=Math.abs(dy), lo=hz?Math.min(A[0],B[0]):Math.min(A[1],B[1]), hi=hz?Math.max(A[0],B[0]):Math.max(A[1],B[1]), k=d.v+(hz?'h':'v')+(d.off<0?'-':'+'); if(!G.has(k)) G.set(k,[]); G.get(k).push({d,lo,hi,len:hi-lo}); });
  G.forEach(arr=>{
    const par=arr.map((_,i)=>i), find=i=>{ while(par[i]!==i){ par[i]=par[par[i]]; i=par[i]; } return i; };
    for(let i=0;i<arr.length;i++) for(let j=i+1;j<arr.length;j++) if(Math.min(arr[i].hi,arr[j].hi)-Math.max(arr[i].lo,arr[j].lo)>0.05) par[find(i)]=find(j);
    const cl=new Map(); arr.forEach((a,i)=>{ const r=find(i); if(!cl.has(r)) cl.set(r,[]); cl.get(r).push(a); });
    cl.forEach(c=>{ if(c.length<2) return; const e=0.05;
      const order=c.slice().sort((p,q)=>p.len-q.len), lvl=new Map();
      order.forEach(a=>{ let k=0; for(;;k++){ let bad=false; order.forEach(b=>{ if(b===a||!lvl.has(b)) return; const ov=Math.min(a.hi,b.hi)-Math.max(a.lo,b.lo)>e; if(lvl.get(b)===k&&ov) bad=true; if(lvl.get(b)>=k&&b.lo>=a.lo-e&&b.hi<=a.hi+e&&b.len<a.len-e) bad=true; if(lvl.get(b)<=k&&a.lo>=b.lo-e&&a.hi<=b.hi+e&&a.len<b.len-e&&false) bad=true; }); if(!bad) break; } lvl.set(a,k); });
      const mags=[...new Set(c.map(a=>Math.abs(a.d.off)))].sort((p,q)=>p-q), sg=c[0].d.off<0?-1:1;
      c.forEach(a=>{ const lv=Math.min(lvl.get(a),mags.length-1); a.d.off=sg*mags[lv]; }); });
  });
}
function sheetSVG(title,sub,list,views,n,N,mat,opt){ const AR='ar'+n;
  opt=opt||{}; if(opt.dims&&!opt.dims._n){ nestDims(opt.dims); opt.dims._n=1; } list=list.filter(b=>!(opt.keepWire?NODRAW_NW:NODRAW).test(b.o.name||'')); const mg=opt.mg||0;
  const CK=window.__noClip?null:(opt.clip||null), AX=CK&&CK.ax||0, inC=x=>!CK||(x>=CK.lo&&x<=CK.hi), clipS=P=>{ if(!CK) return P; const o=[]; for(let i=0;i+5<P.length;i+=6){ if(inC((P[i+AX]+P[i+3+AX])/2)) o.push(P[i],P[i+1],P[i+2],P[i+3],P[i+4],P[i+5]); } return new Float32Array(o); }, clipT=P=>{ if(!CK) return P; const o=[]; for(let i=0;i+8<P.length;i+=9){ if(inC((P[i+AX]+P[i+3+AX]+P[i+6+AX])/3)) o.push(P[i],P[i+1],P[i+2],P[i+3],P[i+4],P[i+5],P[i+6],P[i+7],P[i+8]); } return new Float32Array(o); };
  const clean=b=>/placa base y cobre/.test(b.o.name||'');
  const perim=b=>{ let A=b.lines.geometry.attributes.position.array; if(!A.length){ silEdges(b); A=b._cr; } if(!b.g.boundingBox) b.g.computeBoundingBox(); const bb=b.g.boundingBox, e=0.03, o=[];
    const on=(v,a,c)=>Math.abs(v-a)<e||Math.abs(v-c)<e;
    for(let i=0;i+5<A.length;i+=6){ const x1=A[i],z1=A[i+2],x2=A[i+3],z2=A[i+5];
      if((on(x1,bb.min.x,bb.max.x)&&on(x2,bb.min.x,bb.max.x)&&Math.abs(x1-x2)<e)||(on(z1,bb.min.z,bb.max.z)&&on(z2,bb.min.z,bb.max.z)&&Math.abs(z1-z2)<e)) o.push(A[i],A[i+1],A[i+2],A[i+3],A[i+4],A[i+5]); }
    return new Float32Array(o); };
  window.__circL=b=>circL(b); const circL=b=>{ if(b._ci) return b._ci; const A=tr(b.lines.geometry.attributes.position.array,b), par=new Map(), pts=new Map(), key=(x,y,z)=>Math.round(x*200)+','+Math.round(y*200)+','+Math.round(z*200), out=[];
    const find=k=>{ let r=k; while(par.get(r)!==r) r=par.get(r); let c=k; while(par.get(c)!==r){ const n=par.get(c); par.set(c,r); c=n; } return r; }, cnt=new Map(), segs=[];
    for(let i=0;i+5<A.length;i+=6){ const k1=key(A[i],A[i+1],A[i+2]), k2=key(A[i+3],A[i+4],A[i+5]); if(k1===k2) continue; if(!par.has(k1)){par.set(k1,k1);pts.set(k1,[A[i],A[i+1],A[i+2]]);} if(!par.has(k2)){par.set(k2,k2);pts.set(k2,[A[i+3],A[i+4],A[i+5]]);} par.set(find(k1),find(k2)); segs.push(k1); }
    segs.forEach(k=>{ const r=find(k); cnt.set(r,(cnt.get(r)||0)+1); }); const comp=new Map(); pts.forEach((p,k)=>{ const r=find(k); if(!comp.has(r)) comp.set(r,[]); comp.get(r).push(p); });
    comp.forEach((P,r)=>{ if((cnt.get(r)||0)<8||P.length<8) return; const mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9]; P.forEach(p=>{ for(let k=0;k<3;k++){ if(p[k]<mn[k])mn[k]=p[k]; if(p[k]>mx[k])mx[k]=p[k]; } }); const e=[mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2]]; const c=[(mn[0]+mx[0])/2,(mn[1]+mx[1])/2,(mn[2]+mx[2])/2];
      for(const ax of [0,1,2].sort((p,q)=>e[p]-e[q])){ if(e[ax]>0.03&&e[ax]>3.2) continue; const o1=(ax+1)%3, o2=(ax+2)%3, d1=e[o1], d2=e[o2], dm=Math.max(d1,d2); if(dm<0.8||dm>24||Math.abs(d1-d2)/dm>0.12) continue; const rr=dm/2;
        if(!P.every(p=>{ const q=[p[0]-c[0],p[1]-c[1],p[2]-c[2]]; q[ax]=0; return Math.abs(Math.hypot(q[0],q[1],q[2])-rr)<rr*0.1+0.03; })) continue; out.push({c,r:rr,ax}); break; } });
    return b._ci=out; };
  const TAIL=4.2, MK='" fill="none" marker-end="url(#'+AR+')"/>';
  /* línea de cota con flechas: dentro si cabe, fuera (apuntando hacia adentro) si es corta */
  const arrLine=(ax,ay,bx,by,fs)=>{ const Ln=Math.hypot(bx-ax,by-ay)||1e-6, ux=(bx-ax)/Ln, uy=(by-ay)/Ln, short=Ln<(fs||2.6)*3.4, p=(x,y)=>F(x)+' '+F(y);
    if(!short) return '<path d="M'+p(ax,ay)+'L'+p(bx,by)+'" fill="none" marker-start="url(#'+AR+')" marker-end="url(#'+AR+')"/>';
    return '<path d="M'+p(ax,ay)+'L'+p(bx,by)+'" fill="none"/><path d="M'+p(ax-ux*TAIL,ay-uy*TAIL)+'L'+p(ax,ay)+MK+'<path d="M'+p(bx+ux*TAIL,by+uy*TAIL)+'L'+p(bx,by)+MK; };
  const diaSVG=(a,Rs,ang,L,txt,kind)=>{ txt=(''+txt).replace(/\s*\([^)]*\)/g,''); const dx=Math.cos(ang), dy=Math.sin(ang), p1=[a[0]+dx*Rs,a[1]+dy*Rs], p2=[a[0]-dx*Rs,a[1]-dy*Rs], ex=[p1[0]+dx*L,p1[1]+dy*L], k=TAIL, fs=2.6, tw=(''+txt).length*1.35+1.4, sg=dx>=0?1:-1, big=2*Rs>=7, p=(x,y)=>F(x)+' '+F(y);
    let s='<g class="dm" stroke-width=".25" fill="none">';
    const cross='<path d="M'+p(a[0]-.9,a[1])+'h1.8M'+p(a[0],a[1]-.9)+'v1.8"/>';
    if(kind==='R'){ if(Rs>=4) s+='<path d="M'+p(a[0],a[1])+'L'+p(p1[0],p1[1])+MK+'<path d="M'+p(p1[0],p1[1])+'L'+p(ex[0],ex[1])+'"/>'; else s+='<path d="M'+p(a[0],a[1])+'L'+p(ex[0],ex[1])+'"/><path d="M'+p(p1[0]+dx*k,p1[1]+dy*k)+'L'+p(p1[0],p1[1])+MK; s+=cross; }
    else if(big) s+='<path d="M'+p(p2[0],p2[1])+'L'+p(p1[0],p1[1])+'" marker-start="url(#'+AR+')" marker-end="url(#'+AR+')"/><path d="M'+p(p1[0],p1[1])+'L'+p(ex[0],ex[1])+'"/>'+cross;
    else s+='<path d="M'+p(p2[0]-dx*k,p2[1]-dy*k)+'L'+p(ex[0],ex[1])+'"/><path d="M'+p(p1[0]+dx*k,p1[1]+dy*k)+'L'+p(p1[0],p1[1])+MK+'<path d="M'+p(p2[0]-dx*k,p2[1]-dy*k)+'L'+p(p2[0],p2[1])+MK+cross;
    /* repisa de la nota: el texto descansa sobre una línea horizontal */
    s+='<path d="M'+p(ex[0],ex[1])+'h'+F(sg*tw)+'"/><text x="'+F(ex[0]+sg*.7)+'" y="'+F(ex[1]-.7)+'" text-anchor="'+(sg>0?'start':'end')+'" font-size="'+fs+'" stroke="none">'+txt+'</text></g>'; return s; };
  const customDims=(v,pf,X,Y,sv)=>{ let o=''; const occ=[]; const P=a=>{ const r=pf(a[0],a[1],a[2]); return [X(r[0]),Y(r[1]),r]; };
    (opt.cl||[]).filter(c=>c.v===v.t).forEach(c=>{ const a=P(c.p), b=P(c.q); o+='<path class="dm" d="M'+F(a[0])+' '+F(a[1])+'L'+F(b[0])+' '+F(b[1])+'" stroke-dasharray="3 .7 .6 .7" fill="none" stroke-width=".25"/>'; });
    (opt.circ||[]).filter(c=>c.v===v.t).forEach(c=>{ const a=P(c.c); o+='<circle class="dm" cx="'+F(a[0])+'" cy="'+F(a[1])+'" r="'+F(c.r*sv)+'" stroke-dasharray="1.6 .8" fill="none" style="fill:none" stroke-width=".25"/>'; });
    (opt.dims||[]).filter(d=>d.v===v.t).forEach(d=>{ const a=P(d.p), b=P(d.q), dx=b[0]-a[0], dy=b[1]-a[1]; if(Math.hypot(dx,dy)<.3) return;
      const hz=Math.abs(dx)>=Math.abs(dy), off=(v.t==='top'?-1:1)*(d.off||0), sg=off<0?-1:1, nx=hz?0:1, ny=hz?1:0, g=.8, ex=1.6;
      const ax=a[0]+nx*off, ay=a[1]+ny*off, bx=b[0]+nx*off, by=b[1]+ny*off; let p='';
      if(d.ext!==false) p='M'+F(a[0]+nx*g*sg)+' '+F(a[1]+ny*g*sg)+'L'+F(ax+nx*ex*sg)+' '+F(ay+ny*ex*sg)+'M'+F(b[0]+nx*g*sg)+' '+F(b[1]+ny*g*sg)+'L'+F(bx+nx*ex*sg)+' '+F(by+ny*ex*sg);
      const txt=d.t!=null?d.t:Math.hypot(b[2][0]-a[2][0],b[2][1]-a[2][1]).toFixed(1);
      { const pd=2.2, mx=(ax+bx)/2, my=(ay+by)/2, tw=(''+(d.t!=null?d.t:'00.0')).length*1.7+3; occ.push([Math.min(ax,bx)-pd,Math.min(ay,by)-pd,Math.max(ax,bx)+pd,Math.max(ay,by)+pd]); occ.push(hz?[mx-tw/2,my-4,mx+tw/2,my+.5]:[mx-4,my-tw/2,mx+.5,my+tw/2]); }
      { const Ln=Math.hypot(bx-ax,by-ay), tw=(''+txt).length*1.35+1.2, short=Ln<2.6*3.4, wide=Ln<tw+TAIL*.4+1;
        let tt;
        if(!wide) tt='<text transform="translate('+F((ax+bx)/2)+' '+F((ay+by)/2)+')'+(hz?'':' rotate(-90)')+'" y="-.9" text-anchor="middle" font-size="2.8" stroke="none">'+txt+'</text>';
        else if(hz){ const xr=Math.max(ax,bx)+(short?TAIL:0)+1.2; tt='<text x="'+F(xr)+'" y="'+F(ay+.9)+'" text-anchor="start" font-size="2.8" stroke="none">'+txt+'</text>'; }
        else { const yt=Math.min(ay,by)-(short?TAIL:0)-1.2; tt='<text transform="translate('+F(ax-.9)+' '+F(yt)+') rotate(-90)" text-anchor="start" font-size="2.8" stroke="none">'+txt+'</text>'; }
        o+='<g class="dm" stroke-width=".25"><path d="'+p+'" fill="none"/>'+arrLine(ax,ay,bx,by,2.6)+tt+'</g>'; } });
    const dl=(opt.dia||[]).filter(d=>d.v===v.t).map(d=>({c:d.c,r:d.r,t:d.t,kind:d.kind,ang:d.ang,L:d.L}));
    const nrm={top:1,bottom:1,front:2,back:2,right:0,left:0}[v.t];
    if(opt.circs&&nrm!=null&&!/^iso/.test(v.t)&&!(opt.topOnly&&v.t!=='top'&&v.t!=='bottom')){ const grp=new Map(), x0=X(v.a), x1=X(v.c), y0=Y(v.d), y1=Y(v.b);
      list.forEach(b=>{ if(!b.lines) return; circL(b).forEach(c=>{ if(c.ax!==nrm||c.r<(opt.minR||0.5)) return; const q=pf(c.c[0],c.c[1],c.c[2]), kk=(2*c.r).toFixed(1); if(opt.onlyDia&&!opt.onlyDia.some(v=>Math.abs(v-2*c.r)<0.06)) return; if(!grp.has(kk)) grp.set(kk,{c:c.c,r:c.r,u:[]}); const G=grp.get(kk); if(opt.onlyDia&&P(c.c)[1]<P(G.c)[1]) G.c=c.c; if(!G.u.some(w=>Math.hypot(w[0]-q[0],w[1]-q[1])<1.0)) G.u.push(q); }); });
      const arr=[...grp.entries()].sort((p,q)=>q[1].u.length-p[1].u.length||q[1].r-p[1].r).slice(0,opt.maxDia||4);
      if(!opt.noAuto){ occ.push([x0-2,y1+1,x1+2,y1+13]); occ.push([x0-13,y0-2,x0-1,y1+2]); }
      const allC=[]; list.forEach(b=>{ if(!b.lines) return; circL(b).forEach(c=>{ if(c.ax===nrm){ const q=P(c.c); allC.push([q[0],q[1],c.r*sv]); } }); });
      const hit=(r,x,y)=>x>r[0]&&x<r[2]&&y>r[1]&&y<r[3];
      arr.forEach(([kk,g],i)=>{ const a=P(g.c), txt=(g.u.length>1?g.u.length+'× ':'')+'Ø'+kk, tw=txt.length*1.5+1.5; let best=null;
        for(let k=0;k<8;k++){ const ang=k*Math.PI/4+Math.PI/4; const cx_=Math.cos(ang), cy_=Math.sin(ang);
          const tx=cx_>1e-3?(x1-a[0])/cx_:cx_<-1e-3?(x0-a[0])/cx_:1e9, ty=cy_>1e-3?(y1-a[1])/cy_:cy_<-1e-3?(y0-a[1])/cy_:1e9, tt=Math.min(tx,ty);
          for(const ex of [4,8,12]){ const L=Math.max(3,tt-g.r*sv+ex), e=[a[0]+cx_*(g.r*sv+L),a[1]+cy_*(g.r*sv+L)];
            const rc=cx_>=0?[e[0]+.5,e[1]-3,e[0]+.8+tw,e[1]+1.2]:[e[0]-.8-tw,e[1]-3,e[0]-.5,e[1]+1.2];
            let sc=L*.3+(k%2?6:0); const mxc=(x0+x1)/2, myc=(y0+y1)/2; if(rc[0]<mxc-CW/2+3||rc[2]>mxc+CW/2-3||rc[1]<myc-CH/2+5||rc[3]>myc+CH/2-3) sc+=300; if(tt<0||tt>1e8) continue;
            for(let s=1;s<=20;s++){ const f=s/20, px=a[0]+cx_*(g.r*sv+L*f), py=a[1]+cy_*(g.r*sv+L*f); if(px>x0&&px<x1&&py>y0&&py<y1) sc+=2.5; }
            occ.forEach(r=>{ if(!(rc[2]<r[0]||rc[0]>r[2]||rc[3]<r[1]||rc[1]>r[3])) sc+=200; for(let s=0;s<=20;s++){ const f=s/20, px=a[0]+cx_*(g.r*sv+L*f), py=a[1]+cy_*(g.r*sv+L*f); if(hit(r,px,py)) sc+=40; } });
            allC.forEach(c=>{ if(Math.hypot(c[0]-a[0],c[1]-a[1])<1e-3) return; for(let s=1;s<=20;s++){ const f=s/20, px=a[0]+cx_*(g.r*sv+L*f), py=a[1]+cy_*(g.r*sv+L*f); if(Math.hypot(px-c[0],py-c[1])<c[2]+.8) sc+=60; } if(!(rc[2]<c[0]-c[2]||rc[0]>c[0]+c[2]||rc[3]<c[1]-c[2]||rc[1]>c[1]+c[2])) sc+=100; });
            if(!best||sc<best.sc) best={sc,ang,L,rc}; } }
        if(!best){ best={ang:-Math.PI/4,L:7,rc:[a[0],a[1],a[0]+tw,a[1]+3]}; }
        occ.push(best.rc); dl.push({c:g.c,r:g.r,t:txt,ang:best.ang,L:best.L}); }); }
    dl.forEach(d=>{ const a=P(d.c); const ang=d.ang!=null?d.ang:-Math.PI/4; o+=diaSVG(a,d.r*sv,ang,d.L!=null?d.L:7,d.t,d.kind||'D'); });
    return o; };
  const tr=(P,b)=>{ const pv=b.o&&b.o.piv; if(!pv) return P; const Q=new Float32Array(P.length); for(let i=0;i+2<P.length;i+=3){ Q[i]=P[i]; Q[i+1]=P[i+1]+pv.y; Q[i+2]=P[i+2]+pv.z; } return Q; };
  const arrs=list.filter(b=>b.lines&&(!window.__edgeRe||window.__edgeRe.test(b.o.name||''))).map(b=>clipS(tr(clean(b)?perim(b):b.lines.geometry.attributes.position.array,b))); if(!arrs.length) return '';
  const dimExt=tt=>{ const e={l:0,r:0,t:0,b:0}; if(/^iso/.test(tt)) return e; const pq=pvFn(tt); (opt.dims||[]).filter(d=>d.v===tt).forEach(d=>{ const A=pq(d.p[0],d.p[1],d.p[2]), B=pq(d.q[0],d.q[1],d.q[2]), du=B[0]-A[0], dv=B[1]-A[1], o=(tt==='top'?-1:1)*(d.off||0), hz=Math.abs(du)>=Math.abs(dv); if(hz){ if(o<0) e.t=Math.max(e.t,-o+4); else e.b=Math.max(e.b,o+4); } else { if(o<0) e.l=Math.max(e.l,-o+5); else e.r=Math.max(e.r,o+5); } }); return e; };
  const CW=opt.big?277:138,CH=opt.big?158:76,M=15,F=v=>(+v.toFixed(2));
  const tris=list.filter(b=>b.lines&&!/Kapton/.test(b.o.name||'')&&!(window.__skipRe&&window.__skipRe.test(b.o.name||''))).map(b=>clipT(tr(triPos(b),b)));
  const pj=views.map(t=>{ const f=pvFn(t), S=[], Wd=[]; let a=1e9,b=1e9,c=-1e9,d=-1e9;
    arrs.forEach(P=>{ for(let i=0;i+5<P.length;i+=6){ const p=f(P[i],P[i+1],P[i+2]), q=f(P[i+3],P[i+4],P[i+5]); S.push(p[0],p[1],q[0],q[1]); Wd.push(p[2],q[2]);
      for(const r of [p,q]){ if(r[0]<a)a=r[0]; if(r[0]>c)c=r[0]; if(r[1]<b)b=r[1]; if(r[1]>d)d=r[1]; } } });
    const vv=viewVec(t); list.forEach(bd=>{ if(!bd.lines||clean(bd)||(window.__edgeRe&&!window.__edgeRe.test(bd.o.name||''))) return; const Sl=silEdges(bd), pv=bd.o&&bd.o.piv, py=pv?pv.y:0, pz=pv?pv.z:0;
      for(let i=0;i+5<bd._cr.length;i+=6){ if(!inC(((bd._cr[i+AX]+bd._cr[i+3+AX])/2)+(AX===1?py:AX===2?pz:0))) continue; const p=f(bd._cr[i],bd._cr[i+1]+py,bd._cr[i+2]+pz), q=f(bd._cr[i+3],bd._cr[i+4]+py,bd._cr[i+5]+pz); S.push(p[0],p[1],q[0],q[1]); Wd.push(p[2],q[2]); }
      for(let i=0;i+11<Sl.length;i+=12){ const s1=Sl[i+6]*vv[0]+Sl[i+7]*vv[1]+Sl[i+8]*vv[2], s2=Sl[i+9]*vv[0]+Sl[i+10]*vv[1]+Sl[i+11]*vv[2]; if(s1*s2>=0||!inC(((Sl[i+AX]+Sl[i+3+AX])/2)+(AX===1?py:AX===2?pz:0))) continue;
        const p=f(Sl[i],Sl[i+1]+py,Sl[i+2]+pz), q=f(Sl[i+3],Sl[i+4]+py,Sl[i+5]+pz); S.push(p[0],p[1],q[0],q[1]); Wd.push(p[2],q[2]); } });
    return {t,S,Wd,a,b,c,d}; });
  const SL=[20,15,12,10,8,7,6,5,4,3.5,3,2.5,2,1.75,1.5,1.25,1,.9,.8,.75,.667,.6,.5,.45,.4,.35,.333,.3,.25,.2,.1,.05,.025].concat([]).sort((x,y)=>y-x), snap=x=>SL.find(y=>y<=x)||x, lab=x=>x>=1?x+':1':'1:'+F(1/x);
  let s=1e9, si=1e9; pj.forEach(v=>{ if(/^iso/.test(v.t)) si=Math.min(si,(CW-14-2*mg)/Math.max(v.c-v.a,1e-3),(CH-16-2*mg)/Math.max(v.d-v.b,1e-3)); else { const e=dimExt(v.t); s=Math.min(s,(CW-14-2*mg-e.l-e.r)/Math.max(v.c-v.a,1e-3),(CH-18-2*mg-e.t-e.b)/Math.max(v.d-v.b,1e-3)); } });
  if(s>1e8) s=si; if(si>1e8) si=s; s=si=snap(Math.min(s,si));
  const isoDims=(v,pf,X,Y)=>{ let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9]; tris.forEach(T=>{ for(let i=0;i+2<T.length;i+=3) for(let k=0;k<3;k++){ const q=T[i+k]; if(q<mn[k])mn[k]=q; if(q>mx[k])mx[k]=q; } });
    const S=p=>{ const r=pf(p[0],p[1],p[2]); return [X(r[0]),Y(r[1])]; }, pt=(a,b)=>F(a)+' '+F(b);
    let C=null, R=null; for(const xi of [0,1]) for(const zi of [0,1]){ const p=[xi?mx[0]:mn[0],mn[1],zi?mx[2]:mn[2]], q=S(p); if(!C||q[1]>C.q[1]) C={p,q,xi,zi}; if(!R||q[0]>R.q[0]) R={p,q,xi,zi}; }
    let o='<g class="dm" stroke-width=".25" fill="none">';
    const dim=(P1,P2,k,sg,off,txt)=>{ const e=[0,0,0]; e[k]=sg; const mv=(P,d)=>[P[0]+e[0]*d,P[1]+e[1]*d,P[2]+e[2]*d];
      const a0=S(mv(P1,2)), a1=S(mv(P1,off+3)), b0=S(mv(P2,2)), b1=S(mv(P2,off+3)), d1=S(mv(P1,off)), d2=S(mv(P2,off));
      o+='<path d="M'+pt(a0[0],a0[1])+'L'+pt(a1[0],a1[1])+'M'+pt(b0[0],b0[1])+'L'+pt(b1[0],b1[1])+'"/>'+arrLine(d1[0],d1[1],d2[0],d2[1],3);
      let ang=Math.atan2(d2[1]-d1[1],d2[0]-d1[0]); if(ang>Math.PI/2) ang-=Math.PI; if(ang<-Math.PI/2) ang+=Math.PI;
      o+='<text transform="translate('+pt((d1[0]+d2[0])/2,(d1[1]+d2[1])/2)+') rotate('+F(ang*180/Math.PI)+')" y="-1" text-anchor="middle" font-size="3.4" stroke="none">'+txt+'</text>'; };
    const zEnd=[C.p[0],mn[1],C.zi?mn[2]:mx[2]], xEnd=[C.xi?mn[0]:mx[0],mn[1],C.p[2]];
    dim(C.p,zEnd,0,C.xi?1:-1,14,Math.abs(mx[2]-mn[2]).toFixed(1));
    dim(C.p,xEnd,2,C.zi?1:-1,14,Math.abs(mx[0]-mn[0]).toFixed(1));
    const Rt=[R.p[0],mx[1],R.p[2]]; dim(R.p,Rt,R.xi?0:2,R.xi?1:1,14,(mx[1]-mn[1]).toFixed(1));
    window.__isoBox={mn,mx}; return o+'</g>'; };
  const sc=lab(s), O=[[10,10],[149,10],[10,88],[149,88]];
  let g='<defs><marker id="'+AR+'" viewBox="0 0 8 4" refX="8" refY="2" markerWidth="3.2" markerHeight="1.6" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0L8 2L0 4z" class="dm" stroke-width=".3"/></marker></defs><rect class="bg" width="297" height="210"/><rect class="l" x="6" y="6" width="285" height="198" stroke-width=".7"/>';
  pj.forEach((v,i)=>{ const ox=O[i][0], oy=O[i][1], sv=/^iso/.test(v.t)?si:s, cx=ox+CW/2+(dimExt(v.t).l-dimExt(v.t).r)/2, cy=oy+CH/2-(/^iso/.test(v.t)?0:3)+(dimExt(v.t).t-dimExt(v.t).b)/2, ua=(v.a+v.c)/2, va=(v.b+v.d)/2, X=u=>cx+(u-ua)*sv, Y=w=>cy-(w-va)*sv; let d='';
    const seen=new Set(); let lx=null, ly=null; const R=n=>Math.round(n*1000);
    const emit=(ax,ay,bx,by)=>{ const x1=R(ax), y1=R(ay), x2=R(bx), y2=R(by); if(x1===x2&&y1===y2) return;
      const key=(x1<x2||(x1===x2&&y1<y2))?x1+','+y1+','+x2+','+y2:x2+','+y2+','+x1+','+y1; if(seen.has(key)) return; seen.add(key);
      if(x1===lx&&y1===ly) d+='L'+x2/1000+' '+y2/1000; else d+='M'+x1/1000+' '+y1/1000+'L'+x2/1000+' '+y2/1000; lx=x2; ly=y2; };
    /* eliminación de líneas ocultas: z-buffer de los triángulos sólidos */
    const K=12, gw=Math.ceil(CW*K)+2, gh=Math.ceil(CH*K)+2, zb=new Float32Array(gw*gh).fill(-1e9), pf=pvFn(v.t);
    tris.forEach(P=>{ for(let i=0;i+8<P.length;i+=9){ const A=pf(P[i],P[i+1],P[i+2]), B=pf(P[i+3],P[i+4],P[i+5]), C=pf(P[i+6],P[i+7],P[i+8]);
      const ax=(X(A[0])-ox)*K, ay=(Y(A[1])-oy)*K, bx=(X(B[0])-ox)*K, by=(Y(B[1])-oy)*K, cx2=(X(C[0])-ox)*K, cy2=(Y(C[1])-oy)*K;
      const den=(by-cy2)*(ax-cx2)+(cx2-bx)*(ay-cy2); if(Math.abs(den)<1e-9) continue;
      const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx2))), x1=Math.min(gw-1,Math.ceil(Math.max(ax,bx,cx2))), y0=Math.max(0,Math.floor(Math.min(ay,by,cy2))), y1=Math.min(gh-1,Math.ceil(Math.max(ay,by,cy2)));
      for(let yy=y0;yy<=y1;yy++) for(let xx=x0;xx<=x1;xx++){ const px=xx+.5, py=yy+.5;
        const l0=((by-cy2)*(px-cx2)+(cx2-bx)*(py-cy2))/den, l1=((cy2-ay)*(px-cx2)+(ax-cx2)*(py-cy2))/den, l2=1-l0-l1;
        if(l0<-.02||l1<-.02||l2<-.02) continue; const w=A[2]*l0+B[2]*l1+C[2]*l2, id=yy*gw+xx; if(w>zb[id]) zb[id]=w; } } });
    const vis=(px,py,w)=>{ if(window.__noHLR) return true; const ix=Math.floor(px), iy=Math.floor(py); if(ix<0||iy<0||ix>=gw||iy>=gh) return true; return w>=zb[iy*gw+ix]-(window.__tol||0.6); };
    for(let k=0,sI=0;k<v.S.length;k+=4,sI+=2){ const X1=X(v.S[k]), Y1=Y(v.S[k+1]), X2=X(v.S[k+2]), Y2=Y(v.S[k+3]), w1=v.Wd[sI], w2=v.Wd[sI+1];
      const len=Math.hypot(X2-X1,Y2-Y1)*K, n=Math.max(1,Math.ceil(len/2)), vt=t=>vis((X1+(X2-X1)*t-ox)*K,(Y1+(Y2-Y1)*t-oy)*K,w1+(w2-w1)*t), pt=t=>[X1+(X2-X1)*t,Y1+(Y2-Y1)*t];
      const st=[]; for(let q=0;q<n;q++) st.push(vt((q+.5)/n)); let run=st[0]?0:null;
      for(let q=1;q<n;q++){ if(st[q]!==st[q-1]){ let a=(q-.5)/n, b=(q+.5)/n; for(let it=0;it<7;it++){ const m=(a+b)/2; if(vt(m)===st[q-1]) a=m; else b=m; } const tb=(a+b)/2;
          if(st[q]){ run=tb; } else { const P0=pt(run),P1=pt(tb); emit(P0[0],P0[1],P1[0],P1[1]); run=null; } } }
      if(run!==null){ const P0=pt(run); emit(P0[0],P0[1],X2,Y2); } }
    d=d.replace(/\.0(?=[ LM]|$)/g,'');
    g+='<rect class="l" x="'+ox+'" y="'+oy+'" width="'+CW+'" height="'+CH+'" stroke-width=".25"/><path class="l" d="'+d+'" stroke-width=".35" stroke-linecap="round" stroke-linejoin="round"/>';
    { const vl=VN[v.t]+(/^iso/.test(v.t)&&si!==s?' · '+lab(si):''); g+='<text class="t" x="'+(ox+3)+'" y="'+(oy+CH-2.7)+'" font-size="3.4">'+vl+'</text>'; }
    if(!/^iso/.test(v.t)&&!opt.noAuto){ const x0=X(v.a), x1=X(v.c), y0=Y(v.b), y1=Y(v.d), yb=y0+6, xl=x0-7;
      const wH=x1-x0, hH=y0-y1, shW=wH<14, shH=hH<14;
      g+='<g class="dm" stroke-width=".25"><path d="M'+F(x0)+' '+F(y0+1.5)+'V'+F(yb+1.5)+'M'+F(x1)+' '+F(y0+1.5)+'V'+F(yb+1.5)+'" fill="none"/>'+arrLine(x0,yb,x1,yb,3)
       +'<path d="M'+F(x0-1.5)+' '+F(y0)+'H'+F(xl-1.5)+'M'+F(x0-1.5)+' '+F(y1)+'H'+F(xl-1.5)+'" fill="none"/>'+arrLine(xl,y0,xl,y1,3)
       +'<text x="'+F(shW?x1+TAIL+1.5:(x0+x1)/2)+'" y="'+F(yb+(shW?1:3.6))+'" text-anchor="'+(shW?'start':'middle')+'" font-size="2.8" stroke="none">'+(v.c-v.a).toFixed(1)+'</text>'
       +'<text transform="translate('+F(xl-1.2)+' '+F(shH?y1-TAIL-1.5:(y0+y1)/2)+') rotate(-90)" text-anchor="'+(shH?'start':'middle')+'" font-size="2.8" stroke="none">'+(v.d-v.b).toFixed(1)+'</text></g>'; }
    g+=customDims(v,pf,X,Y,sv); if(opt.isoDims&&/^iso/.test(v.t)) g+=isoDims(v,pf,X,Y); });
  const tx=(x,y,z,t,w)=>'<text class="t" x="'+x+'" y="'+y+'" font-size="'+z+'"'+(w?' font-weight="700"':'')+'>'+t+'</text>';
  g+='<g class="l" stroke-width=".5"><rect x="177" y="172" width="114" height="32" fill="none"/><path d="M177 182H291M177 193H291M215 193V204M253 193V204" fill="none"/></g>'
    +tx(180,179,3.6,'PILIBOT | Simulador 3D · FIUNVA',1)+tx(180,187.6,F(Math.min(4,104/(.72*title.length))),esc(title),1)+tx(180,191.2,F(Math.max(2.5,Math.min(2.6,108/(.46*(sub||'x').length)))),esc(sub||''))
    +tx(179,196.2,2.5,'ESCALA')+tx(179,201.6,3.6,sc,1)+tx(217,196.2,2.5,'UNIDADES · MATERIAL')+tx(217,201.6,3,'mm · '+esc(mat||'—'),0)+tx(255,196.2,2.5,'HOJA')+tx(255,201.6,3.6,n+' / '+N,1)
    +tx(10,177,2.8,'NOTAS',1)+tx(10,181.5,2.6,'1. Cotas en milímetros; escala común a todas las vistas de la hoja.')+relNotes(title,list,opt,circL).map((s,i)=>tx(10,185.5+3.9*i,2.6,(i+2)+'. '+esc(s))).join('');
  return '<svg class="sh" viewBox="0 0 297 210" xmlns="http://www.w3.org/2000/svg" font-family="Latin Modern Roman,CMU Serif,KaTeX_Main,Times New Roman,serif">'+g+'</svg>';
}
