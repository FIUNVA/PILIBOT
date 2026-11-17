'use strict';
/* ---------- componentes modelados: Figura 4 interactiva y descarga STEP ---------- */
const OLEDN={pcb:'Módulo OLED 1.3″',glass:'Módulo OLED 1.3″',spacer:'Tornillería del módulo OLED',screw:'Tornillería del módulo OLED',nut:'Tornillería del módulo OLED'};
let COMPS=null;
function withLevel(l,fn){
  const sv={lv:EX.level,off:offset.clone(),up:camera.up.clone(),tg:target.clone(),zm:zoom,pl:EX.playing};
  EX.playing=false; setLevel(l); let r; try{ r=fn(); } finally { setLevel(sv.lv); offset.copy(sv.off); camera.up.copy(sv.up); target.copy(sv.tg); zoom=sv.zm; place(); EX.playing=sv.pl; }
  return r;
}
function bodyBox(b,pos){ const g=b.g; if(b.o.group==='band'||!g.boundingBox) g.computeBoundingBox(); return g.boundingBox.clone().translate(pos); }
function buildComps(){
  if(COMPS) return COMPS;
  const m=new Map(); let bn=0;
  bodies.forEach((b,i)=>{ let key;
    if(i<NMAIN) key=NAMES[i]||('Cuerpo '+(i+1));
    else if(b.o.group==='oled') key=OLEDN[b.o.ex]||'Módulo OLED · otros';
    else if(b.o.group==='band') key=(bn++===0)?'Banda elástica inferior':'Banda elástica superior';
    else key=(b.o.cat||'Otros').replace(/^"/,'').replace(/ \(corregidas\)/,'');
    if(!m.has(key)) m.set(key,{name:key,idx:[]}); m.get(key).idx.push(i); });
  const L=[...m.values()];
  withLevel(1,()=>{ L.forEach(c=>{ const U=new THREE.Box3(); let best=null, bv=-1;
    c.idx.forEach(i=>{ const b=bodies[i], bb=bodyBox(b,b.grp.position), s=bb.getSize(new THREE.Vector3()), vol=s.x*s.y*s.z+1e-6; U.union(bb); if(vol>bv){ bv=vol; best=bb.getCenter(new THREE.Vector3()); } });
    c.box=U; c.anc=best; c.tri=0; c.idx.forEach(i=>{ const g=bodies[i].g; c.tri+=(g.index?g.index.count:g.attributes.position.count)/3; }); }); });
  L.sort((a,b)=>(b.anc.y-a.anc.y)||(a.anc.x-b.anc.x)); L.forEach((c,k)=>c.n=k+1);
  return COMPS=L;
}
function partName(c,i){ const b=bodies[i]; return (b.o.name||'').replace(/^"/,'')||(c.name+' · '+(c.idx.indexOf(i)+1)); }
const asc=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\x20-\x7e]/g,'_').replace(/'/g,"''");
function fileSafe(s){ return asc(s).replace(/''/g,'').replace(/[^A-Za-z0-9._-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,80)||'pieza'; }
/* STEP (AP214) con sólidos de caras planas: los triángulos coplanares contiguos se funden en una sola cara con sus huecos */
function stepBuild(items,title){
  const out=[]; let n=0; const nx=()=>++n, f5=v=>{ const s=(+v).toFixed(5); return s==='-0.00000'?'0.00000':s; };
  const T=asc(title), FS=fileSafe(title);
  out.push("ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('PILIBOT - "+T+"'),'2;1');\nFILE_NAME('"+FS+".step','"+new Date().toISOString().slice(0,19)+"',('FIUNVA'),('FIUNVA'),'PILIBOT Simulador 3D','PILIBOT','');\nFILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));\nENDSEC;\nDATA;\n");
  const ac=nx(), ap=nx(), pcx=nx(), pr=nx(), pc=nx(), pf=nx(), pdc=nx(), pd=nx(), pds=nx(), len=nx(), ang=nx(), sa=nx(), unc=nx(), ctx=nx(), po=nx(), pz=nx(), px=nx(), ax=nx(), sr=nx(), sdr=nx();
  out.push(`#${ac}=APPLICATION_CONTEXT('automotive design');
#${ap}=APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000,#${ac});
#${pcx}=PRODUCT_CONTEXT('',#${ac},'mechanical');
#${pr}=PRODUCT('${FS}','${T}','',(#${pcx}));
#${pc}=PRODUCT_RELATED_PRODUCT_CATEGORY('part',$,(#${pr}));
#${pf}=PRODUCT_DEFINITION_FORMATION('','',#${pr});
#${pdc}=PRODUCT_DEFINITION_CONTEXT('part definition',#${ac},'design');
#${pd}=PRODUCT_DEFINITION('design','',#${pf},#${pdc});
#${pds}=PRODUCT_DEFINITION_SHAPE('','',#${pd});
#${len}=(LENGTH_UNIT()NAMED_UNIT(*)SI_UNIT(.MILLI.,.METRE.));
#${ang}=(NAMED_UNIT(*)PLANE_ANGLE_UNIT()SI_UNIT($,.RADIAN.));
#${sa}=(NAMED_UNIT(*)SI_UNIT($,.STERADIAN.)SOLID_ANGLE_UNIT());
#${unc}=UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-02),#${len},'distance_accuracy_value','confusion accuracy');
#${ctx}=(GEOMETRIC_REPRESENTATION_CONTEXT(3)GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#${unc}))GLOBAL_UNIT_ASSIGNED_CONTEXT((#${len},#${ang},#${sa}))REPRESENTATION_CONTEXT('${FS}','3D'));
#${po}=CARTESIAN_POINT('',(0.,0.,0.));
#${pz}=DIRECTION('',(0.,0.,1.));
#${px}=DIRECTION('',(1.,0.,0.));
#${ax}=AXIS2_PLACEMENT_3D('',#${po},#${pz},#${px});
`);
  const breps=[];
  items.forEach(it=>{
    const g=it.g, P=g.attributes.position.array, I=g.index?g.index.array:null, NT=(I?I.length:P.length/3)/3, tx=it.d.x, ty=it.d.y, tz=it.d.z;
    const wm=new Map(), V=[], tri=[], vp=[], cp=[];
    const wv=k=>{ const x=P[k*3]+tx, y=P[k*3+1]+ty, z=P[k*3+2]+tz, key=Math.round(x*1e4)+','+Math.round(y*1e4)+','+Math.round(z*1e4); let r=wm.get(key); if(r===undefined){ r=V.length/3; wm.set(key,r); V.push(Math.round(x*1e4)/1e4,Math.round(y*1e4)/1e4,Math.round(z*1e4)/1e4); } return r; };
    const nrm=[], dd=[];
    for(let t=0;t<NT;t++){ const a=wv(I?I[3*t]:3*t), b=wv(I?I[3*t+1]:3*t+1), c=wv(I?I[3*t+2]:3*t+2); if(a===b||b===c||a===c) continue;
      const ux=V[3*b]-V[3*a], uy=V[3*b+1]-V[3*a+1], uz=V[3*b+2]-V[3*a+2], vx=V[3*c]-V[3*a], vy=V[3*c+1]-V[3*a+1], vz=V[3*c+2]-V[3*a+2];
      let nx_=uy*vz-uz*vy, ny_=uz*vx-ux*vz, nz_=ux*vy-uy*vx; const l=Math.hypot(nx_,ny_,nz_); if(l<1e-9) continue; nx_/=l; ny_/=l; nz_/=l;
      tri.push([a,b,c]); nrm.push([nx_,ny_,nz_]); dd.push(nx_*V[3*a]+ny_*V[3*a+1]+nz_*V[3*a+2]); }
    /* agrupar por plano */
    const grp=new Map(); tri.forEach((t,i)=>{ const q=nrm[i], key=Math.round(q[0]*1e4)+','+Math.round(q[1]*1e4)+','+Math.round(q[2]*1e4)+','+Math.round(dd[i]*200); let a=grp.get(key); if(!a) grp.set(key,a=[]); a.push(i); });
    const faces=[], ecache=new Map(), vpt=v=>{ if(vp[v]) return vp[v]; const c=nx(), r=nx(); out.push(`#${c}=CARTESIAN_POINT('',(${f5(V[3*v])},${f5(V[3*v+1])},${f5(V[3*v+2])}));\n#${r}=VERTEX_POINT('',#${c});\n`); cp[v]=c; return vp[v]=r; };
    const oedge=(a,b)=>{ const lo=a<b?a:b, hi=a<b?b:a, key=lo*1048576+hi; let e=ecache.get(key);
      if(!e){ const v1=vpt(lo), v2=vpt(hi), dx=V[3*hi]-V[3*lo], dy=V[3*hi+1]-V[3*lo+1], dz=V[3*hi+2]-V[3*lo+2], L=Math.hypot(dx,dy,dz), di=nx(), ve=nx(), li=nx(), ec=nx();
        out.push(`#${di}=DIRECTION('',(${f5(dx/L)},${f5(dy/L)},${f5(dz/L)}));\n#${ve}=VECTOR('',#${di},${f5(L)});\n#${li}=LINE('',#${cp[lo]},#${ve});\n#${ec}=EDGE_CURVE('',#${v1},#${v2},#${li},.T.);\n`); e=ecache.set(key,ec)&&ec; }
      const o=nx(); out.push(`#${o}=ORIENTED_EDGE('',*,*,#${e},${a<b?'.T.':'.F.'});\n`); return o; };
    const addFace=(loops,q,v0)=>{ const bs=loops.map((lp,k)=>{ const oes=lp.map((v,i)=>oedge(v,lp[(i+1)%lp.length])), el=nx(), bd=nx(); out.push(`#${el}=EDGE_LOOP('',(${oes.map(o=>'#'+o).join(',')}));\n#${bd}=${k?'FACE_BOUND':'FACE_OUTER_BOUND'}('',#${el},.T.);\n`); return bd; });
      vpt(v0); const dn=nx(), dr=nx(), a2=nx(), pl=nx(), fc=nx(); let rx=Math.abs(q[0])<.9?1:0, ry=rx?0:1, rz=0; const dp=rx*q[0]+ry*q[1]; rx-=dp*q[0]; ry-=dp*q[1]; rz-=dp*q[2]; const rl=Math.hypot(rx,ry,rz);
      out.push(`#${dn}=DIRECTION('',(${f5(q[0])},${f5(q[1])},${f5(q[2])}));\n#${dr}=DIRECTION('',(${f5(rx/rl)},${f5(ry/rl)},${f5(rz/rl)}));\n#${a2}=AXIS2_PLACEMENT_3D('',#${cp[v0]},#${dn},#${dr});\n#${pl}=PLANE('',#${a2});\n#${fc}=ADVANCED_FACE('',(${bs.map(b=>'#'+b).join(',')}),#${pl},.T.);\n`); faces.push(fc); };
    grp.forEach(idx=>{ const q=nrm[idx[0]];
      /* componentes conexos por aristas compartidas */
      const par=idx.map((_,i)=>i), find=i=>{ while(par[i]!==i){ par[i]=par[par[i]]; i=par[i]; } return i; }, em=new Map();
      idx.forEach((ti,li)=>{ const t=tri[ti]; for(let k=0;k<3;k++){ const a=t[k], b=t[(k+1)%3], key=(a<b?a:b)*1048576+(a<b?b:a), o=em.get(key); if(o===undefined) em.set(key,li); else par[find(li)]=find(o); } });
      const comp=new Map(); idx.forEach((ti,li)=>{ const r=find(li); let a=comp.get(r); if(!a) comp.set(r,a=[]); a.push(ti); });
      comp.forEach(tl=>{
        const dir=new Map(); tl.forEach(ti=>{ const t=tri[ti]; for(let k=0;k<3;k++){ const a=t[k], b=t[(k+1)%3]; dir.set(a*1048576+b,[a,b]); } });
        const nxt=new Map(); dir.forEach(([a,b],key)=>{ if(dir.has(b*1048576+a)) return; let l=nxt.get(a); if(!l) nxt.set(a,l=[]); l.push(b); });
        const loops=[]; let ok=true;
        for(const [s0] of nxt){ while(nxt.get(s0)&&nxt.get(s0).length){ const lp=[s0]; let cur=nxt.get(s0).pop(), guard=0; while(cur!==s0&&guard++<1e6){ lp.push(cur); const l=nxt.get(cur); if(!l||!l.length){ ok=false; break; } cur=l.pop(); } if(!ok||guard>=1e6){ ok=false; break; } loops.push(lp); } if(!ok) break; }
        let outer=[], holes=[];
        if(ok){ loops.forEach(lp=>{ let sx=0,sy=0,sz=0; for(let i=0;i<lp.length;i++){ const a=lp[i], b=lp[(i+1)%lp.length]; sx+=V[3*a+1]*V[3*b+2]-V[3*a+2]*V[3*b+1]; sy+=V[3*a+2]*V[3*b]-V[3*a]*V[3*b+2]; sz+=V[3*a]*V[3*b+1]-V[3*a+1]*V[3*b]; } (sx*q[0]+sy*q[1]+sz*q[2]>0?outer:holes).push(lp); }); }
        if(ok&&outer.length===1&&(holes.length===0||tl.length>2)){ addFace([outer[0]].concat(holes),q,outer[0][0]); }
        else tl.forEach(ti=>{ const t=tri[ti]; addFace([[t[0],t[1],t[2]]],nrm[ti],t[0]); });
      });
    });
    if(!faces.length) return;
    const sh=nx(), br=nx(); let s=''; for(let k=0;k<faces.length;k++){ s+=(k?',':'')+'#'+faces[k]+(k%16===15?'\n':''); }
    out.push(`#${sh}=CLOSED_SHELL('',(${s}));\n#${br}=MANIFOLD_SOLID_BREP('${asc(it.name)}',#${sh});\n`); breps.push(br);
  });
  out.push(`#${sr}=ADVANCED_BREP_SHAPE_REPRESENTATION('',(#${ax}${breps.map(b=>',#'+b).join('')}),#${ctx});\n#${sdr}=SHAPE_DEFINITION_REPRESENTATION(#${pds},#${sr});\nENDSEC;\nEND-ISO-10303-21;\n`);
  return out;
}
function saveBlob(parts,fname,type){ const u=URL.createObjectURL(new Blob(parts,{type:type||'application/octet-stream'})), a=document.createElement('a'); a.href=u; a.download=fname; document.body.appendChild(a); a.click(); setTimeout(()=>{ a.remove(); URL.revokeObjectURL(u); },4000); }
function stepDownload(id){
  const C=buildComps(); let items,title;
  if(String(id).startsWith('c:')){ const c=C.find(x=>x.n===+String(id).slice(2)); if(!c) return; title=c.n+' '+c.name; items=c.idx.map(i=>({i,name:partName(c,i)})); }
  else { const m=/^p:(\d+)$/.exec(String(id)); if(!m) return; const i=+m[1], c=C.find(x=>x.idx.includes(i)); if(!c) return; title=partName(c,i); items=[{i,name:title}]; }
  const parts=withLevel(0,()=>stepBuild(items.map(it=>({name:it.name,g:bodies[it.i].g,d:bodies[it.i].grp.position})),title));
  saveBlob(parts,fileSafe(title)+'.step','model/step');
}
window.__stepText=id=>{ const o=[]; const C=buildComps(); const c=C.find(x=>x.n===+id); const parts=withLevel(0,()=>stepBuild(c.idx.map(i=>({name:partName(c,i),g:bodies[i].g,d:bodies[i].grp.position})),c.name)); return parts.join(''); };
window.__comps=()=>buildComps().map(c=>({n:c.n,name:c.name,k:c.idx.length,tri:c.tri}));

