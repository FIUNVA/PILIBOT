'use strict';
function buildDocHTML(){
  const main=bodies.slice(0,NMAIN), W=size.x, Hh=size.y, D=size.z, f=(x,n)=>x.toFixed(n==null?2:n);
  const imgA=snapshot(0,null,1), imgA2=snapshot(0,[-1,0.8,-1.2],1), imgA3=snapshot(0,[-1,0.8,1.2],1); let imgE; try{ imgE=fig4Image(); }catch(err){ console.error(err); imgE=snapshot(1); }
  const cat=new Map(); bodies.slice(NMAIN).forEach(b=>{ const key=b.o.cat||(b.o.group==='oled'?'Módulo OLED 1.3″':b.o.group==='band'?'Bandas elásticas':'Otros'); const c=cat.get(key)||{n:0,m:matOf(b,bodies.indexOf(b))}; c.n++; cat.set(key,c); });
  const matN=k=>MATD[k]?MATD[k].n:k;
  const chRows=main.map((b,k)=>{ const s=new THREE.Vector3(); b.g.boundingBox.getSize(s); const m=matOf(b,k);
    return '<tr><td>'+(k+1)+'</td><td>'+esc(NAMES[k])+'</td><td>'+f(s.x)+'</td><td>'+f(s.y)+'</td><td>'+f(s.z)+'</td><td>'+matN(m)+'</td></tr>'; }).join('');
  const thumbs=main.map((b,k)=>{ const s=new THREE.Vector3(); b.g.boundingBox.getSize(s);
    return '<figure class="card"><div class="views">'+['front','side','top'].map(v=>edgeSVG([b],v,150,130,false)).join('')+'</div><figcaption><b>Pieza '+(k+1)+'.</b> '+esc(NAMES[k])+' | '+f(s.x,1)+' × '+f(s.y,1)+' × '+f(s.z,1)+' mm</figcaption></figure>'; }).join('');
  const f4list=buildComps().map(c=>'<li><b>'+c.n+'</b><span>'+esc(c.name)+'</span></li>').join('');
  const partRows=buildComps().map(c=>'<tr><td>'+c.n+'</td><td>'+esc(c.name)+'</td><td>'+c.idx.length+'</td><td>'+(/Tornillería del módulo/.test(c.name)?'Acero / latón':/^Módulo OLED/.test(c.name)?'Vidrio + PCB (FR4)':/^Banda elástica/.test(c.name)?'Elastómero negro':matN(matOf(bodies[c.idx[0]],c.idx[0])))+'</td></tr>').join('');
  const matRows=Object.entries(MATD).filter(([k])=>k!=='bri').map(([k,m])=>'<tr><td>'+m.n+'</td><td>'+m.E+'</td><td>'+m.sy+'</td><td>'+m.rho+'</td></tr>').join('');
  const mass=AN.vox?('<p class="note">Masa total estimada por el modelo voxelizado: <b>'+AN.vox.M.toFixed(0)+' g</b>.</p>'):'';
  const css=`@page{size:A4 landscape;margin:10mm}*{box-sizing:border-box;font-style:normal!important}html{scroll-behavior:smooth;
--bg:#f5f8fc;--paper:#fff;--tx:#0b1f3a;--mut:#51607a;--bd:#b9c6da;--side:#eef3fb;--hov:#dfe8f5;--blue:#1d4ed8;--green:#15803d;--red:#b91c1c;--thb:#eaf1fd;--tipb:#ecf6ef;--warnb:#fbecec;--row:#e3e9f2;--code:#eef3fb;--sbg:#fff;--ln:#111;--dm:#2b2b2b}
html[data-dark]{--bg:#0a1322;--paper:#0f1b30;--tx:#e6edf7;--mut:#9fb0c9;--bd:#2c4064;--side:#0c1729;--hov:#17294a;--blue:#7aa7ff;--green:#5fd38a;--red:#ff8585;--thb:#12264a;--tipb:#0f2b1f;--warnb:#331418;--row:#1c2d4d;--code:#16263f;color-scheme:dark}
html[data-mk]{--sbg:#17479e;--ln:#fff;--dm:#ffffff}
body{margin:0;background:var(--bg);color:var(--tx);font:17px/1.55 "Latin Modern Roman","CMU Serif","Computer Modern Serif",KaTeX_Main,"Times New Roman",serif}
aside{position:fixed;left:0;top:0;bottom:0;width:260px;background:var(--side);border-right:1px solid var(--bd);padding:14px 12px;overflow:auto}
aside h1{font-size:21px;font-weight:400;margin:0}aside h1 .b{color:var(--blue)}aside .by{font-size:13px;color:var(--mut);margin:0 0 10px}aside .by b{color:var(--blue);letter-spacing:.08em}aside .by b{color:var(--blue);letter-spacing:.1em}
aside input{width:100%;font:inherit;font-size:14.5px;padding:4px 8px;border:1px solid var(--tx);background:var(--paper);color:var(--tx);margin:2px 0 8px}
aside a{display:block;color:var(--tx);text-decoration:none;padding:3px 8px;border-left:3px solid transparent;font-size:15px;cursor:pointer}aside a:hover{background:var(--hov)}
aside a.on{border-left-color:var(--blue);color:var(--blue);background:var(--paper);font-weight:700}aside a.off{opacity:.3}aside .gp{font-size:12px;letter-spacing:.12em;color:var(--mut);margin:10px 0 2px 4px}
aside .sty{display:flex;gap:4px;margin:4px 0 2px}aside .sty button,button.pr{flex:1;font:inherit;font-size:14px;border:1px solid var(--tx);background:var(--paper);color:var(--tx);padding:3px 6px;cursor:pointer}
aside .sty button.on{background:var(--blue);border-color:var(--blue);color:#fff}button.pr:hover{background:var(--tx);color:var(--paper)}
main{margin-left:260px;max-width:1100px;padding:24px 34px 70px;background:var(--paper);min-height:100vh;box-shadow:0 0 0 1px var(--bd)}
h2{font-size:24px;font-weight:700;margin:0 0 8px;border-bottom:1px solid var(--bd);padding-bottom:3px;display:flex;align-items:baseline;gap:8px} h2 .n{color:var(--blue)}h2 .tt{flex:1}
h2 .pop{font:inherit;font-size:13.5px;font-weight:400;border:1px solid var(--blue);color:var(--blue);background:transparent;padding:1px 10px;cursor:pointer}
section{display:none;padding-top:6px}section.on{display:block}h3{font-size:18px;margin:20px 0 4px;color:var(--green)} p{margin:8px 0;text-align:justify}
table{border-collapse:collapse;width:100%;margin:10px 0;font-size:15px;border-top:2px solid var(--tx);border-bottom:2px solid var(--tx)}
th{border-bottom:1px solid var(--tx);text-align:left;padding:4px 8px;color:var(--blue)}td{padding:3px 8px;border-bottom:1px solid var(--row);vertical-align:top}
figure{margin:14px 0}figure img{width:100%;border:1px solid var(--bd);display:block;background:#fff}figcaption,.hint{font-size:14.5px;color:var(--mut);margin-top:4px}figcaption b,.hint b{color:var(--tx)}
svg.sh{width:100%;height:auto;display:block;border:1px solid var(--bd);background:var(--sbg)}.sh .bg{fill:var(--sbg)}.sh .l{stroke:var(--ln);fill:none}.sh text.t{fill:var(--ln)}.sh .dm{stroke:var(--dm);fill:var(--dm)}.sh text{stroke:none;text-decoration:none!important;border:0}.sh text.t{text-decoration:none!important}
html[data-mk] svg.sh{background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:2.4% 3.4%}html[data-mk] .sh .bg{fill:transparent}
.th{border-left:4px solid var(--blue);background:var(--thb);padding:6px 12px;margin:10px 0}.tip{border-left:4px solid var(--green);background:var(--tipb);padding:6px 12px;margin:10px 0}.warn{border-left:4px solid var(--red);background:var(--warnb);padding:6px 12px;margin:10px 0}
.th b{color:var(--blue)}.tip b{color:var(--green)}.warn b{color:var(--red)}
code,kbd{font-family:inherit;background:var(--code);padding:0 4px;border:1px solid var(--bd)}ol li,ul li{margin:3px 0}
button.try{font:inherit;font-size:15px;border:1px solid var(--green);color:var(--green);background:transparent;padding:3px 13px;cursor:pointer;margin:4px 6px 0 0}button.try:hover{background:var(--green);color:#fff}button.try.sent{background:var(--blue);border-color:var(--blue);color:#fff}
.gl{display:grid;grid-template-columns:minmax(120px,26%) 1fr;gap:0 18px;margin:0 0 4px}.gl dt{color:var(--blue);font-weight:700;padding:4px 0;border-top:1px dotted var(--bd);font-style:normal;font-variant:small-caps;letter-spacing:.03em}.gl dd{margin:0;padding:4px 0;border-top:1px dotted var(--bd);font-size:.97em;text-align:justify;hyphens:auto}
.glh{display:flex;align-items:center;gap:10px;margin:16px 0 4px;color:var(--green)}.glh span{font-weight:700;font-size:1.25em;min-width:1.2em}.glh::after{content:"";flex:1;border-top:1.5px solid var(--green)}
.glidx{margin:2px 0 6px;padding:5px 0;border-top:1px solid var(--tx);border-bottom:1px solid var(--tx);color:var(--mut);text-align:center;letter-spacing:.1em}.glidx a{color:var(--blue);font-weight:700;text-decoration:none;cursor:pointer}
@media(max-width:640px){.gl{grid-template-columns:1fr}.gl dd{border-top:0;padding-top:0}}.pend{border:1px dashed var(--red);color:var(--red);padding:10px;text-align:center}
@media(max-width:820px){aside{position:static;width:auto;border:0}main{margin:0;padding:16px}}
@media print{html{--bg:#fff;--paper:#fff;--tx:#000}aside,button{display:none!important}main{margin:0;box-shadow:none;padding:0}section{display:block!important;break-after:page}figure{break-inside:avoid}svg.sh{border:0}}`;
  const T=a=>esc(JSON.stringify(a));
  const tryB=(txt,acts)=>'<button type="button" class="try" data-try="'+T(acts)+'">'+txt+'</button>';
  const cap=(n,t)=>'<caption style="caption-side:top;text-align:left;padding:4px 0;color:var(--mut)"><b style="color:var(--tx)">Tabla '+n+'.</b> '+t+'</caption>';
  const dropA=(o,h,s)=>[['tab',5],['chk','st-on',1],['btn','[data-st=drop]'],['rng','st-h',h],['btn','[data-so='+o+']'],['btn','[data-sf='+s+']'],['click','st-go']];
  const ex=(n,title,goal,steps,obs,ask,btns)=>'<div class="ex"><h3>Ejercicio '+n+'. '+title+'</h3><dl><dt>Objetivo</dt><dd>'+goal+'</dd><dt>Parámetros</dt><dd class="pm">'+steps+'</dd><dt>Qué observar</dt><dd>'+obs+'</dd><dt>Reflexiona</dt><dd>'+ask+'</dd></dl>'+btns+'</div>';
  const blk=(c,t)=>'<div class="'+c+'">'+t+'</div>';
  const specs=[]; const sp=(pg,title,sub,list,views,opt,mat)=>{ opt=opt||{}; if(!opt.keepB) list=list.filter(b=>b.o.mode!=='B'); list=list.filter(b=>!(opt.keepWire?NODRAW_NW:NODRAW).test(b.o.name||'')); if(list.length&&list.some(b=>b.lines)) specs.push({pg,title,sub,list,views,opt,mat}); };
  const acc=bodies.slice(NMAIN), byCat=re=>acc.filter(b=>re.test(b.o.cat||'')), byName=re=>bodies.filter(b=>re.test(b.o.name||'')), V4=['front','right','top','iso'];
  const mk=(v,p,q,off,t,ext)=>({v,p,q,off,t:(t==null?t:(''+t).replace(/\s*\([^)]*\)/g,'')),ext});
  const xm=(()=>{const r=bnd(main);return (r.x[0]+r.x[1])/2;})(), zc0=(()=>{const r=bnd(main);return (r.z[0]+r.z[1])/2;})(), RT={ax:2,lo:zc0+0.1,hi:1e9}, f1=x=>x.toFixed(1);
  sp('pl','PLANO GENERAL · HOJA 1','Chasis: vistas principales',main,V4,null,'MDF 3 mm');
  sp('pl','PLANO GENERAL · HOJA 2','Chasis: vistas complementarias',main,['back','left','bottom','iso2'],null,'MDF 3 mm');
  sp('pl','CONJUNTO COMPLETO','Ensamble con electrónica, motores y baterías (sin cableado ni bandas)',bodies.filter(b=>b.o.group!=='band'),V4,null,'MDF y varios');
  sp('pl','PLANO ISOMÉTRICO ACOTADO','Dimensiones generales del PILIBOT: largo, ancho y alto en proyección isométrica',bodies.filter(b=>b.o.group!=='band'),['iso'],{isoDims:1,big:1,noAuto:true,mg:12,notes:['Cotas isométricas: las líneas de cota son paralelas a los ejes isométricos y se leen sobre ellos.']},'MDF y varios');
  main.forEach((b,k)=>sp('ch','PIEZA '+(k+1)+' · '+NAMES[k].toUpperCase(),'Chasis',[b],V4,{circs:true},b.o.acrylic?'Acrílico':'MDF'));
  [['PCB1','Placa principal: ESP32-C3, DRV8833, MPU6050, VL53',/PCB1/,/PCB1 · placa base y cobre/],['PCB2','Placa de energía: BMS 2S, regulador 3.3 V, conector magnético',/PCB2/,/PCB2 · placa base y cobre/]].forEach(([nm,sub,rc,rb])=>{
    const L=byCat(rc).filter(b=>b.o.mode!=='B'&&!NODRAW.test(b.o.name||'')), al=bnd(L), pb=bnd(byName(rb)), zf=pb.z[0], x1=pb.x[1];
    const x0=pb.x[0], dims=[ mk('front',[x0,pb.y[0],zf],[x0,pb.y[1],zf],8,f1(pb.y[1]-pb.y[0])+''), mk('front',[x0,pb.y[1],zf],[x0,al.y[1],zf],19,f1(al.y[1]-pb.y[1])+' sup.'), mk('front',[x0,al.y[0],zf],[x0,pb.y[0],zf],30,f1(pb.y[0]-al.y[0])+' inf.') ].filter(d=>!/^0\.0/.test(d.t));
    sp('el',nm,sub,byCat(rc),V4,{dims},'FR4 (PCB)'); });
  /* --- acople de las dos PCB (PCB1 sobre PCB2, unidas por cabezales y zócalos) --- */
  { const L=byCat(/PCB1|PCB2/), a1=bnd(byName(/PCB1 · placa base y cobre/)), a2=bnd(byName(/PCB2 · placa base y cobre/)), all=bnd(L), x0=a1.x[0], x1=a1.x[1], zf=a1.z[0], zb=a1.z[1];
    const dims=[ mk('front',[x0,a2.y[0],zf],[x0,a1.y[1],zf],28,f1(a1.y[1]-a2.y[0])+' (pila)'), mk('front',[x0,a2.y[1],zf],[x0,a1.y[0],zf],12,f1(a1.y[0]-a2.y[1])+' (hueco)'),
      mk('front',[x1,a1.y[0],zf],[x1,a1.y[1],zf],-8,f1(a1.y[1]-a1.y[0])), mk('front',[x0,a1.y[1],zf],[x1,a1.y[1],zf],-9,f1(x1-x0)),
      mk('right',[x0,a2.y[0],zf],[x0,a1.y[0],zf],10,f1(a1.y[0]-a2.y[0])+' (paso)'), mk('right',[x0,a2.y[1],zf],[x0,a1.y[0],zf],24,f1(a1.y[0]-a2.y[1])+' (hueco)'),
      mk('right',[x0,a1.y[1],zf],[x0,a1.y[1],zb],-9,f1(zb-zf)+' (PCB1)'), mk('right',[x0,a2.y[0],a2.z[0]],[x0,a2.y[0],zb],9,f1(zb-a2.z[0])+' (PCB2)'),
      mk('top',[x0,a1.y[1],zf],[x1,a1.y[1],zf],8,f1(x1-x0)), mk('top',[x1,a1.y[1],zf],[x1,a1.y[1],zb],-8,f1(zb-zf)+' (PCB1)') ];
    const cl=[ {v:'front',p:[x0-3,a1.y[0],0],q:[x1+3,a1.y[0],0]}, {v:'front',p:[x0-3,a2.y[1],0],q:[x1+3,a2.y[1],0]} ];
    sp('el','ACOPLE DE PCB1 Y PCB2','PCB1 (control) apilada sobre PCB2 (energía)',L,['front','right','top','iso'],{dims,cl,noAuto:true,mg:2},'FR4 (PCB)'); }
  sp('el','MÓDULO OLED 1.3″','Pantalla 128×64, tapa, tornillos y tuercas',acc.filter(b=>b.o.group==='oled'),V4,{circs:true,topOnly:true,minR:.7,onlyDia:[2.5]});
  { const SW=byName(/Caparazón desmontable|Alambre rígido|interruptor · (caja|palanca)/), wr=bnd(byName(/Alambre rígido/)), cj=bnd(byName(/interruptor · caja/));
    const sz=e=>f1(e.x[1]-e.x[0])+' × '+f1(e.y[1]-e.y[0])+' × '+f1(e.z[1]-e.z[0]);
    sp('el','CONFIGURACIÓN DEL INTERRUPTOR DE ENCENDIDO','Palanca, alambre rígido doblado hacia el exterior y caparazón desmontable',SW,V4,{keepWire:true,notes:[
      'Caja plateada soldada en PCB1: '+sz(cj)+' mm; la palanca negra desliza en ella.',
      'Alambre rígido unido al caparazón, doblado hacia el exterior: '+sz(wr)+' mm.',
      'El caparazón se encaja sobre la palanca y se retira sin desoldar.',
      'La parte doblada cruza la placa posterior y acciona el interruptor desde fuera.']}); }
  /* --- motorreductor N20 (1 unidad: lado derecho) --- */
  { const L=byName(/Motores N20 \(2\)|Carcasa del reductor|(Engranaje|Piñón).*\(der\.\)|Eje en D.*\(der\.\)/), all=bnd(L,RT), mb=bnd(byName(/Motores N20 \(2\)/),RT), cb=bnd(byName(/Carcasa del reductor/),RT), sh=bnd(byName(/Eje en D.*\(der\./)),
      ay=(sh.y[0]+sh.y[1])/2, az=(sh.z[0]+sh.z[1])/2, xs=all.x[1], x0=all.x[0], zl=all.z[0], zh=all.z[1], yl=all.y[0], yh=all.y[1];
    const dims=[ mk('top',[x0,ay,zl],[xs,ay,zl],17,f1(xs-x0)+' (largo total con eje)'), mk('top',[x0,ay,zl],[cb.x[0],ay,zl],8,f1(cb.x[0]-x0)+' motor'), mk('top',[cb.x[0],ay,zl],[cb.x[1],ay,zl],8,f1(cb.x[1]-cb.x[0])+' red.'), mk('top',[cb.x[1],ay,zl],[xs,ay,zl],8,f1(xs-cb.x[1])+' eje'),
      mk('top',[x0,ay,zl],[x0,ay,zh],9,f1(zh-zl)+' (ancho)'),
      mk('front',[x0,yl,az],[xs,yl,az],9,f1(xs-x0)), mk('front',[x0,yl,az],[x0,yh,az],9,f1(yh-yl)+' (alto)'), mk('front',[xs,yl,az],[xs,ay,az],-7,f1(ay-yl)+' (eje)'),
      mk('right',[xs,yl,zl],[xs,yl,zh],9,f1(zh-zl)), mk('right',[xs,yl,zl],[xs,yh,zl],9,f1(yh-yl)+' (alto)') ];
    const cl=[ {v:'top',p:[x0-2,ay,az],q:[xs+3,ay,az]}, {v:'front',p:[x0-2,ay,az],q:[xs+3,ay,az]}, {v:'right',p:[xs,ay,zl-2],q:[xs,ay,zh+2]}, {v:'right',p:[xs,yl-2,az],q:[xs,yh+2,az]} ];
    sp('mo','MOTORREDUCTOR N20 · 1 UNIDAD','Motor, reductor de 3 etapas y eje en D de Ø3 mm',L,['top','front','right','iso'],{clip:RT,dims,cl,noAuto:true,mg:2,},'Motor / reductor'); }
  /* --- base de sujeción del motor (1 unidad) --- */
  { const L=byName(/^Bases de motor/), bb=bnd(L,RT), x0=bb.x[0], x1=bb.x[1], y0=bb.y[0], y1=bb.y[1], z0=bb.z[0], z1=bb.z[1], sh=bnd(byName(/Eje en D.*\(der\./)), az=(sh.z[0]+sh.z[1])/2, ay=(sh.y[0]+sh.y[1])/2;
    const dims=[ mk('top',[x0,y1,z0],[x0,y1,z1],9,f1(z1-z0)+' (largo)'), mk('top',[x0,y1,z0],[x1,y1,z0],9,f1(x1-x0)+' (ancho)'), mk('top',[x1,y1,z0],[x1,y1,az],-9,f1(az-z0)+' (a eje)'),
      mk('front',[x1,y0,z0],[x1,y1,z0],-9,f1(y1-y0)+' (alto)'), mk('front',[x0,y0,z0],[x1,y0,z0],9,f1(x1-x0)), mk('front',[x0,y0,z0],[x0,ay,z0],9,f1(ay-y0)+' (a eje)'),
      mk('right',[x1,y0,z0],[x1,y0,z1],9,f1(z1-z0)), mk('right',[x1,y0,z0],[x1,y1,z0],9,f1(y1-y0)) ];
    sp('mo','BASE DE SUJECIÓN DEL MOTOR · 1 UNIDAD','Soporte impreso del motorreductor N20',L,['top','front','right','iso'],{clip:RT,dims,noAuto:true,mg:2,circs:true,minR:.6,maxDia:3},'PETG impreso'); }
  /* --- ensamble de tracción: motores, bases, placa y baleros (sin ruedas) --- */
  { const L=byName(/Motores N20|Carcasa del reductor|Engranaje|Piñón|Eje en D|^Bases de motor|^Placa de motores|Balero|Separador hexagonal M3 × 6|Separador circular|Tuerca M3 \(rueda loca\)|Tornillo M3 × 10 \(cabeza plana\)|Tornillos M2|Tuercas M2/),
      wr=bnd(byName(/Ruedas centrales \(mayores\) · tracción \(der\./)), wl=bnd(byName(/Ruedas centrales \(mayores\) · tracción \(izq\./)), td=bnd(byName(/Eje en D.*\(der\./)), tl=bnd(byName(/Eje en D.*\(izq\./)),
      xR=(wr.x[0]+wr.x[1])/2, xL=(wl.x[0]+wl.x[1])/2, zD=(td.z[0]+td.z[1])/2, zL=(tl.z[0]+tl.z[1])/2, yA=(td.y[0]+td.y[1])/2, pl=bnd(byName(/^Placa de motores/)), zc=(pl.z[0]+pl.z[1])/2, bd=bnd(byName(/Banda de goma con ranura \(der\./)), yG=bd.y[0], rW=(wr.y[1]-wr.y[0])/2, all=bnd(L);
    const dims=[ mk('top',[xL,yA,all.z[0]],[xR,yA,all.z[0]],7,'b = '+f1(xR-xL)+' (vía)'),
      mk('top',[all.x[0],yA,zL],[all.x[0],yA,zD],9,'L = '+f1(zD-zL)+' (entre ejes)'), mk('top',[all.x[1],yA,zc],[all.x[1],yA,zD],-9,f1(zD-zc)), mk('top',[all.x[1],yA,zL],[all.x[1],yA,zc],-9,f1(zc-zL)),
      mk('front',[all.x[1],yG,zD],[all.x[1],yA,zD],-9,'r = '+f1(yA-yG)), mk('front',[xL,yA,zD],[xR,yA,zD],-9,f1(xR-xL)), mk('front',[xm,yG,zD],[xm,yA,zD],0,'',false),
      mk('right',[all.x[1],yG,zD],[all.x[1],yA,zD],-9,f1(yA-yG)), mk('right',[all.x[1],yA,zL],[all.x[1],yA,zD],-9,f1(zD-zL)), mk('right',[all.x[1],yA,zc],[all.x[1],yA,zD],-18,f1(zD-zc)) ].filter(d=>d.t!=='');
    const cl=[ {v:'top',p:[all.x[0]-3,yA,zD],q:[all.x[1]+3,yA,zD]}, {v:'top',p:[all.x[0]-3,yA,zL],q:[all.x[1]+3,yA,zL]}, {v:'top',p:[xm,yA,all.z[0]-3],q:[xm,yA,all.z[1]+3]}, {v:'top',p:[all.x[0]-3,yA,zc],q:[all.x[1]+3,yA,zc]},
      {v:'top',p:[xL,yA,all.z[0]-3],q:[xL,yA,all.z[1]+3]}, {v:'top',p:[xR,yA,all.z[0]-3],q:[xR,yA,all.z[1]+3]},
      {v:'front',p:[all.x[0]-3,yA,0],q:[all.x[1]+3,yA,0]}, {v:'front',p:[all.x[0]-3,yG,0],q:[all.x[1]+3,yG,0]}, {v:'front',p:[xm,yG-2,0],q:[xm,yA+14,0]},
      {v:'right',p:[0,yG,all.z[0]-3],q:[0,yG,all.z[1]+3]} ];
    const circ=[ {v:'right',c:[all.x[1],yA,zD],r:rW}, {v:'right',c:[all.x[1],yA,zL],r:rW} ];
    sp('mo','ENSAMBLE DE TRACCIÓN','Motores, bases, placa de motores y baleros; cotas de ejes de rotación (ruedas en trazo)',L,['top','front','right','iso'],{dims,cl,circ,noAuto:true,mg:2},'Varios'); }
  sp('mo','MOTORREDUCTORES N20 · PAR','Dos motores con reductor, vista de conjunto',byCat(/^Motores N20/),V4);
  sp('mo','BASES Y PLACA DE MOTORES','Soportes de motor y placa de montaje',byCat(/Bases de motor|Placa de motores/),V4,{circs:true,minR:.6},'PETG impreso');
  /* --- ruedas: cuatro conjuntos (A y B; tracción y rueda loca), lado derecho --- */
  [['A','tracción','RUEDA DE TRACCIÓN · ESTILO A','Banda ranurada: lateral interna + central mayor + lateral externa'],['A','rueda loca','RUEDA LOCA · ESTILO A','Banda ranurada: lateral interna + central mayor + lateral externa'],['B','tracción','RUEDA DE TRACCIÓN · ESTILO B','O-ring liso: lateral interna + central con canal + lateral externa'],['B','rueda loca','RUEDA LOCA · ESTILO B','O-ring liso: lateral interna + central con canal + lateral externa']].forEach(([m,k,title,sub])=>{
    const L=bodies.filter(b=>b.o.mode===m&&/^Ruedas/.test(b.o.name||'')&&(b.o.name||'').indexOf('· '+k+' (der.)')>=0); if(!L.length) return;
    const r=bnd(L), cy=(r.y[0]+r.y[1])/2, cz=(r.z[0]+r.z[1])/2, dims=[], cl=[{v:'right',p:[r.x[1],cy,r.z[0]-2],q:[r.x[1],cy,r.z[1]+2]},{v:'right',p:[r.x[1],r.y[0]-2,cz],q:[r.x[1],r.y[1]+2,cz]},{v:'front',p:[r.x[0]-2,cy,0],q:[r.x[1]+2,cy,0]}];
    L.slice().sort((a,b)=>bnd([a]).x[0]-bnd([b]).x[0]).forEach((b,i)=>{ const w=bnd([b]); dims.push(mk('front',[w.x[0],w.y[0],r.z[0]],[w.x[1],w.y[0],r.z[0]],8+i*8,f1(w.x[1]-w.x[0]))); });
    const ds=[...new Set(L.map(b=>{const w=bnd([b]); return f1(w.y[1]-w.y[0]);}))]; 
    dims.push(mk('top',[r.x[0],cy,r.z[0]],[r.x[1],cy,r.z[0]],9,f1(r.x[1]-r.x[0])+' (total)'));
    const dia=/tracción/.test(k)?[{v:'right',c:[r.x[1],cy,cz],r:1.5,t:'Ø3.0 (eje en D)',ang:Math.PI*.75,L:12}]:[];
    sp('mo',title,sub,L,['right','front','top','iso'],{keepB:true,dims,cl,dia,noAuto:true,mg:2,circs:true,minR:.6,maxDia:4},'PETG impreso'); });
  sp('mo','BANDAS DE GOMA','Banda con ranura y relieves (estilo A), pares izquierdo y derecho',byCat(/^Banda de goma/),V4,null,'Goma');
  /* --- acomodo de las bandas elásticas sobre las ruedas (lado derecho) --- */
  { const Lb=byName(/^(Banda de goma con ranura|Relieves de la banda) \(der\.\)/), Lw=byName(/^Ruedas .*\(der\.\)/).filter(b=>b.o.mode!=='B'), Lx=byName(/^Eje en D.*\(der\.\)|^Placa de motores|^Bases de motor/), L=Lb.concat(Lw,Lx),
      c1=BDESC['der.'].lugs.c1, c2=BDESC['der.'].lugs.c2, lg=BDESC['der.'].lugs,
      xa=lg.x0, xb=lg.x1, Ls=Math.hypot(c2[0]-c1[0],c2[1]-c1[1]), Lp=2*Ls+2*Math.PI*lg.ri, yc=(c1[0]+c2[0])/2;
    const dims=[ mk('right',[xb,c1[0],c1[1]],[xb,c2[0],c2[1]],-9,f1(Ls)+' (entre ejes)'),
      mk('front',[xa,c1[0]-lg.ro,c1[1]],[xb,c1[0]-lg.ro,c1[1]],10,f1(xb-xa)+' (ancho de banda)'),
      mk('top',[xa,yc,c1[1]-lg.ro],[xb,yc,c1[1]-lg.ro],10,f1(xb-xa)+' (ancho)') ];
    const cl=[ {v:'right',p:[xb,c1[0],c1[1]-lg.ro-3],q:[xb,c1[0],c2[1]+lg.ro+3]}, {v:'right',p:[xb,c1[0]-lg.ro-3,c1[1]],q:[xb,c1[0]+lg.ro+3,c1[1]]}, {v:'right',p:[xb,c2[0]-lg.ro-3,c2[1]],q:[xb,c2[0]+lg.ro+3,c2[1]]} ];
    const dia=[ {v:'right',c:[xb,c1[0],c1[1]],r:lg.ri,kind:'R',t:'R'+f1(lg.ri)+' (interior)',ang:-Math.PI*.75,L:16}, {v:'right',c:[xb,c2[0],c2[1]],r:lg.ro,kind:'R',t:'R'+f1(lg.ro)+' (exterior)',ang:Math.PI*.25,L:14} ];
    sp('mo','ACOMODO DE LA BANDA DE RODADURA','Banda sin fin (estilo A) rodeando rueda de tracción y rueda loca; '+lg.n+' relieves',L,['right','front','top','iso'],{keepB:false,dims,cl,dia,noAuto:true,mg:2},'Goma / PETG'); }
  { const L=byName(/Balero 693ZZ.*\(der\.\)|Separador circular \(der\.\)|Separador hexagonal M3 × 6 \(der\.\)|Tuerca M3 \(rueda loca\) \(der\.\)|Tornillo M3 × 10 \(cabeza plana\) \(der\.\)/), all=bnd(L), zf=all.z[0], yb=all.y[0];
    const short=n=>/Balero/.test(n)?'balero':/Separador circular/.test(n)?'sep. circ.':/Separador hex/.test(n)?'sep. hex.':/Tuerca/.test(n)?'tuerca':'tornillo';
    const dims=L.slice().sort((a,b)=>bnd([a]).x[0]-bnd([b]).x[0]).map((b,i)=>{ const w=bnd([b]); return mk('front',[w.x[0],yb,zf],[w.x[1],yb,zf],7+i*5.5,f1(w.x[1]-w.x[0])); });
    dims.push(mk('front',[all.x[0],yb,zf],[all.x[1],yb,zf],37,f1(all.x[1]-all.x[0])+' (total)'));
    sp('mo','EJE DE LA RUEDA LOCA Y BALERO 693ZZ','Longitudes del eje: tornillo, balero 4.0, sep. circular 0.8, sep. hex. 12.0 y tuerca 2.4 (lado derecho)',L,['front','right','top','iso'],{dims,noAuto:true,mg:3,circs:true,minR:.6,maxDia:5},'Acero / latón'); }
  /* --- batería: 1 celda sin cableado --- */
  { const L=byName(/Celda LiPo A/), cu=bnd(byName(/Celda LiPo A.*cuerpo/)), all=bnd(L.filter(b=>!NODRAW.test(b.o.name||''))), pcm=bnd(byName(/Celda LiPo A.*(PCM placa|lengüetas)/));
    const x0=all.x[0], x1=all.x[1], y0=all.y[0], y1=all.y[1], z0=all.z[0], z1=all.z[1];
    const dims=[ mk('top',[x0,y1,z0],[x1,y1,z0],8,f1(x1-x0)+' (ancho)'), mk('top',[x1,y1,z0],[x1,y1,z1],-8,f1(z1-z0)+' (total)'), mk('top',[x0,y1,cu.z[0]],[x0,y1,cu.z[1]],8,f1(cu.z[1]-cu.z[0])+' (celda)'),
      mk('front',[x0,y0,z0],[x1,y0,z0],8,f1(x1-x0)), mk('front',[x0,y0,z0],[x0,y1,z0],8,f1(y1-y0)+' (espesor)'),
      mk('right',[x1,y0,z0],[x1,y0,z1],8,f1(z1-z0)+' (total)'), mk('right',[x1,y0,cu.z[0]],[x1,y0,cu.z[1]],18,f1(cu.z[1]-cu.z[0])+' (celda)'), mk('right',[x1,y0,z0],[x1,y0,cu.z[0]],-14,f1(cu.z[0]-z0)+' (PCM)'), mk('right',[x1,y0,z0],[x1,y1,z0],24,f1(y1-y0)) ];
    sp('ba','BATERÍA LiPo 802040 · 1 CELDA','Celda de 40 × 20.5 × 8 mm con protección PCM; sin cableado',L,['top','front','right','iso'],{dims,noAuto:true,mg:2},'Celda LiPo'); }
  { const Lc=byCat(/Baterías LiPo|Separador de polímero/), L=Lc.concat(byName(/^Placa de motores|Separadores hexagonales M3 × 10/)), cA=bnd(byName(/Celda LiPo A.*cuerpo/)), cB=bnd(byName(/Celda LiPo B.*cuerpo/)), sp_=bnd(byName(/Separador de polímero/)), all=bnd(Lc.filter(b=>!NODRAW.test(b.o.name||''))), pm=bnd(byName(/^Placa de motores/)), hx=bnd(byName(/Separadores hexagonales M3 × 10/)),
      xa=Math.min(cA.x[0],cB.x[0]), xb=Math.max(cA.x[1],cB.x[1]), lo=cA.x[0]<cB.x[0]?cA:cB, hi=cA.x[0]<cB.x[0]?cB:cA, gap=hi.x[0]-lo.x[1], pitch=(hi.x[0]+hi.x[1])/2-(lo.x[0]+lo.x[1])/2, zf=all.z[0], zb=all.z[1], yt=all.y[1], yb=all.y[0];
    const dims=[ mk('front',[all.x[0],yb,zf],[all.x[1],yb,zf],10,f1(all.x[1]-all.x[0])+' (total)'), mk('front',[lo.x[1],yt,zf],[hi.x[0],yt,zf],-9,f1(gap)+' (entre celdas)'),
      mk('top',[all.x[0],yt,zf],[all.x[1],yt,zf],8,f1(all.x[1]-all.x[0])), mk('top',[xb,yt,zf],[xb,yt,zb],-8,f1(zb-zf)+' (total)'), mk('top',[xb,yt,cA.z[0]],[xb,yt,cA.z[1]],-16,f1(cA.z[1]-cA.z[0])+' (celda)'),
      mk('right',[all.x[1],yb,zf],[all.x[1],yb,zb],8,f1(zb-zf)), mk('right',[all.x[1],yb,zf],[all.x[1],yt,zf],8,f1(yt-yb)+' (alto)'), mk('right',[all.x[1],cA.y[0],zf],[all.x[1],cA.y[1],zf],16,f1(cA.y[1]-cA.y[0])+' (celda)'), mk('right',[all.x[1],pm.y[0],zb],[all.x[1],pm.y[1],zb],-8,f1(pm.y[1]-pm.y[0])+' (placa)'), mk('right',[all.x[1],hx.y[0],zb],[all.x[1],hx.y[1],zb],-16,f1(hx.y[1]-hx.y[0])+' (sep. M3)'), mk('top',[pm.x[0],yt,pm.z[0]],[pm.x[1],yt,pm.z[0]],16,f1(pm.x[1]-pm.x[0])+' (placa)') ];
    const cl=[ {v:'top',p:[lo.x[0]-3,yt,0],q:[hi.x[1]+3,yt,0],skip:true} ].slice(0,0);
    sp('ba','BATERÍAS LiPo 802040 · PAR','2 celdas, separador blando y su posición en el ensamble; paso entre celdas '+f1(pitch)+' mm',L,['front','right','top','iso'],{dims,noAuto:true,mg:2},'Goma / PETG'); }

  sp('ch','NÚCLEO DE SUJECIÓN','Placa inferior y placa de motores unidas por separadores hexagonales, tornillos M3 y tuercas',byCat(/Tornillos|Tuercas|Separadores hex/).filter(b=>!/bases/i.test(b.o.name||'')).concat([main[0]],byName(/^Placa de motores/)),V4,{},'Acero / MDF');
  /* --- bandas elásticas negras: acomodo sobre el chasis (cinta de 9.6 × 1.2 mm) --- */
  { const EB=bodies.filter(b=>b.o.group==='band'); if(EB.length===2){
    const all=bnd(main), yb0=all.y[0], yt0=all.y[1], WDb=9.6, THb=1.2, zf=-20.61-THb/2, zbo=36.39+THb/2, yl=-12.39, yf=12.86, yr=39.86, zA=all.z[0], xL=all.x[0], xR=all.x[1];
    const dA=[ mk('front',[xR,yb0,zA],[xL,yb0,zA],8,f1(xR-xL)), mk('front',[xL,yb0,zA],[xL,yt0,zA],10,f1(yt0-yb0)),
      mk('front',[xR,yl-WDb/2,zA],[xR,yl+WDb/2,zA],-10,f1(WDb)), mk('front',[xR,yb0,zA],[xR,yl,zA],-22,f1(yl-yb0)), mk('front',[xR,yb0,zA],[xR,yf,zA],-34,f1(yf-yb0)),
      mk('right',[xR,yb0,zA],[xR,yb0,all.z[1]],8,f1(all.z[1]-zA)), mk('right',[xR,yb0,zA],[xR,yt0,zA],10,f1(yt0-yb0)), mk('right',[xR,yb0,zf],[xR,yf,zf],22,f1(yf-yb0)), mk('right',[xR,yb0,all.z[1]],[xR,yr,all.z[1]],-10,f1(yr-yb0)),
      mk('top',[xR,yt0,all.z[1]],[xL,yt0,all.z[1]],-8,f1(xR-xL)), mk('top',[xR,yt0,zA],[xR,yt0,all.z[1]],-8,f1(all.z[1]-zA)) ];
    sp('pl','ACOMODO DE LAS BANDAS ELÁSTICAS','Dos bandas negras de 9.6 × 1.2 mm amarradas por fricción en las ranuras',main.concat(EB),V4,{dims:dA,noAuto:true,mg:2,notes:['Alturas medidas desde la base: banda inferior '+f1(yl-yb0)+' (horizontal); banda superior 38.8 al frente y '+f1(yr-yb0)+' atrás (inclinada).','Ancho de banda 9.6 mm; amarre por fricción en las ranuras de las tapas (x = 38.7, 42.7, 78.7 y 82.7 mm).']},'Elastómero negro'); } }

  { const ord=['pl','ch','el','mo','ba']; specs.sort((a,b)=>ord.indexOf(a.pg)-ord.indexOf(b.pg)); }
  const PN=re=>specs.findIndex(s=>re.test(s.title))+1;
  window.__espSvg=(()=>{ try{ const L=byName(/ESP32-C3 \(placa|ESP32-C3 componentes|separadores plásticos \(ESP32|ESP32-C3 · LED/); return sheetSVG('x','x',L,['top'],99,specs.length,'x',{noAuto:true,mg:0}); }catch(e){ return 'ERR '+e.message; } })();
  window.__sheetData=specs.map(s=>({title:s.title,list:s.list}));
  /* diagramas de la sección de electrónica: bloques y conexiones (la ESP32-C3 sale del modelo 3D) */
  /* imagen a color de la ESP32-C3 (vista superior real del modelo 3D) */
  window.__espImg=(()=>{ try{ const L=byName(/ESP32-C3 \(placa|ESP32-C3 componentes|ESP32-C3 · LED/); if(!L.length) return '';
      const W=900, Hh=Math.round(W*48.2/35.6), cv=document.createElement('canvas'); cv.width=W; cv.height=Hh;
      const rd=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,preserveDrawingBuffer:true}); rd.setSize(W,Hh,false); rd.setClearColor(0x000000,0);
      const sc=new THREE.Scene(); sc.add(new THREE.AmbientLight(0xffffff,0.7)); const dl=new THREE.DirectionalLight(0xffffff,0.32); dl.position.set(-30,100,-20); sc.add(dl);
      L.forEach(b=>{ if(!b.mesh) return; b.mesh.updateMatrixWorld(true); let m;
        if(/componentes/.test(b.o.name)){ const P=triPos(b), pos=new Float32Array(P), col=colESP(P);
          const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.computeVertexNormals();
          m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); }
        else { const mt=b.mesh.material.clone(); mt.transparent=false; mt.opacity=1; mt.side=THREE.DoubleSide; mt.clippingPlanes=[]; if(/placa/.test(b.o.name)) mt.color.setHex(0x1a1c22); m=new THREE.Mesh(b.mesh.geometry,mt); }
        m.matrixAutoUpdate=false; m.matrix.copy(b.mesh.matrixWorld); m.frustumCulled=false; sc.add(m); (b.silk||[]).forEach(sm=>{ sm.updateMatrixWorld(true); const m2=new THREE.Mesh(sm.geometry,sm.material); m2.matrixAutoUpdate=false; m2.matrix.copy(sm.matrixWorld); m2.frustumCulled=false; sc.add(m2); }); });
      const ww=17.8, hh=24.1, cx=60.39+ww/2, cz=-1.316+hh/2;
      const cam=new THREE.OrthographicCamera(-ww/2,ww/2,hh/2,-hh/2,0.1,400); cam.position.set(cx,150,cz); cam.up.set(0,0,-1); cam.lookAt(cx,0,cz); cam.updateMatrixWorld(true);
      rd.render(sc,cam); const url=cv.toDataURL('image/png'); rd.dispose(); return url; }catch(e){ return ''; } })();
  const ESPD=(()=>{ const m=/<path class="l" d="([^"]+)"/.exec(window.__espSvg||''); return m?m[1]:''; })();
  const DG=(()=>{
    const R='#b91c1c', B='#1d4ed8', G='#15803d', K='#6b7280';
    const defs=id=>'<defs>'+[['r',R],['b',B],['g',G]].map(q=>'<marker id="'+id+q[0]+'" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="'+q[1]+'"/></marker>').join('')+'</defs>';
    const box=(x,y,w,h,c,t1,t2,dash)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="var(--paper)" stroke="'+c+'" stroke-width="1.5"'+(dash?' stroke-dasharray="5 3"':'')+'/><text x="'+(x+w/2)+'" y="'+(y+h/2+(t2?-1:5))+'" text-anchor="middle" fill="currentColor" font-size="14">'+t1+'</text>'+(t2?'<text x="'+(x+w/2)+'" y="'+(y+h/2+14)+'" text-anchor="middle" fill="currentColor" font-size="11.5">'+t2+'</text>':'');
    const ln=(d,c,id,dash)=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="1.5"'+(dash?' stroke-dasharray="5 3"':'')+(id?' marker-end="url(#'+id+')"':'')+'/>';
    const tx=(x,y,s,a,c,f)=>'<text x="'+x+'" y="'+y+'" text-anchor="'+(a||'middle')+'" fill="'+(c||'currentColor')+'" font-size="'+(f||11.5)+'">'+s+'</text>';
    const SV=(w,h)=>'<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;border:1px solid var(--bd);background:var(--paper);color:var(--tx)" font-family="Latin Modern Roman,CMU Serif,KaTeX_Main,serif" font-size="14">';
    const legend=y=>'<g>'+[[R,'Energía',40],[B,'Control',200],[G,'Periféricos y actuadores',340]].map(q=>'<rect x="'+q[2]+'" y="'+(y-9)+'" width="14" height="10" fill="none" stroke="'+q[0]+'" stroke-width="1.5"/>'+tx(q[2]+22,y,q[1],'start')).join('')+'</g>';
    /* 5a: diagrama de bloques */
    let a=SV(1000,445)+defs('a');
    a+=box(20,24,130,46,R,'Conector','magnético')+box(190,24,110,46,R,'BMS 2S')+box(340,24,110,46,R,'Interruptor')+box(520,24,120,46,R,'Regulador','3.3 V')+box(190,100,110,46,R,'2 × LiPo','802040');
    a+=ln('M150 47H188',R,'ar')+tx(169,40,'carga')+ln('M300 47H338',R,'ar')+ln('M450 47H518',R,'ar')+tx(484,40,'VBAT','middle',R);
    a+='<path d="M245 70V100" stroke="'+R+'" stroke-width="1.5" fill="none"/>'+tx(256,90,'2S','start');
    a+=ln('M395 70V200',R,'ar')+tx(405,150,'VBAT','start',R);
    a+=ln('M395 24V8H905V100',R,'ar',1)+tx(760,28,'VBAT (medición)','middle',R);
    a+=box(540,200,250,72,B,'ESP32-C3 SuperMini','microcontrolador · Wi-Fi · BLE')+ln('M580 70V200',R,'ar')+tx(592,150,'3.3 V','start',R);
    a+=box(340,200,110,72,B,'DRV8833','puente H doble')+ln('M538 222H452',B,'ab')+tx(495,216,'IN1–IN4')+ln('M538 252H452',B,'ab')+tx(495,266,'EN');
    a+=box(170,200,120,72,G,'Motores N20','izq. y der.')+ln('M338 236H292',G,'ag');
    a+=box(820,100,170,46,G,'Divisor de voltaje','nivel de batería')+ln('M905 146V236H792',B,'ab')+tx(850,229,'ADC · GPIO0');
    a+='<path d="M600 272V322H180" stroke="'+B+'" stroke-width="1.5" fill="none"/>'+tx(390,314,'I2C · SDA GPIO8 · SCL GPIO9');
    a+=ln('M180 322V354',B,'ab')+ln('M330 322V354',B,'ab')+ln('M480 322V354',B,'ab');
    a+=box(120,356,120,46,G,'OLED 1.3″','I2C')+box(270,356,120,46,G,'MPU6050','I2C · INT GPIO6')+box(420,356,120,46,G,'VL53','I2C');
    a+=ln('M650 272V354',B,'ab')+tx(660,330,'DIN · GPIO7','start')+box(590,356,120,46,G,'LED RGB','WS2812B');
    a+=ln('M740 272V298H785V354',B,'ab')+tx(795,332,'GPIO5 · PWM','start')+box(730,356,110,46,G,'Buzzer','BUZ');
    a+=legend(432)+'</svg>';
    /* 5b: diagrama de conexiones centrado en la ESP32-C3 */
    const X0=500, Y0=300, S=6.5, py=k=>Y0+(27.34+5.08*k-45)*S, pxL=X0+(63.78-79)*S, pxR=X0+(94.26-79)*S;
    let p=SV(1000,545).replace('0 0 1000 545','0 95 1000 450')+defs('p');
    p+=tx(500,122,'ESP32-C3 SuperMini','middle','currentColor',16);
    p+='<g transform="translate('+X0+' '+Y0+') scale('+S+') translate(-79 -45)">'+(window.__espImg?'<image href="'+window.__espImg+'" x="61.2" y="20.9" width="35.6" height="48.2" preserveAspectRatio="none"/>':'<path d="'+ESPD+'" fill="none" stroke="currentColor" stroke-width="1.1" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>')+'</g>';
    p+=tx(500,Y0+(69.1-45)*S+18,'USB-C','middle',K);
    const L=[['GPIO21','TX',K],['GPIO20','RX',K],['GPIO10','EN',B],['GPIO9','SCL',B],['GPIO8','SDA',B],['GPIO7','DIN',B],['GPIO6','INT',B],['GPIO5','BUZ',B]];
    const Rr=[['GPIO0','ADC',B],['GPIO1','IN3',B],['GPIO2','IN4',B],['GPIO3','IN1',B],['GPIO4','IN2',B],['3V3','',R],['GND','',R],['5V','',R]];
    /* etiquetas de pines: lado izquierdo = GPIO0…5V, lado derecho = GPIO21…GPIO5 (orden de la placa real) */
    Rr.forEach((q,k)=>{ const y=py(k); p+=ln('M255 '+y+'H'+(pxL-5),q[2],null,q[2]===K)+'<circle cx="'+pxL+'" cy="'+y+'" r="5.5" fill="'+q[2]+'" stroke="#fff" stroke-width="1.6"/>'+tx(328,y-5,q[1]?q[0]+' · '+q[1]:q[0]); });
    L.forEach((q,k)=>{ const y=py(k); p+=ln('M'+(pxR+5)+' '+y+'H750',q[2],null,q[2]===K).replace('<path','<path')+'<circle cx="'+pxR+'" cy="'+y+'" r="5.5" fill="'+q[2]+'" stroke="#fff" stroke-width="1.6"/>'+tx(672,y-5,q[0]+' · '+q[1]); });
    p+=box(750,py(0)-14,230,py(1)-py(0)+28,K,'Sin asignar','UART0 · TX y RX',1);
    p+=box(750,py(2)-14,230,28,G,'DRV8833 · EN (habilitación)')+box(750,py(3)-14,230,py(4)-py(3)+28,G,'OLED 1.3″ y MPU6050','bus I2C compartido');
    p+=box(750,py(5)-14,230,28,G,'LED RGB WS2812B · DIN')+box(750,py(6)-14,230,28,G,'MPU6050 · INT')+box(750,py(7)-14,230,28,G,'Buzzer · BUZ');
    p+=box(10,py(0)-14,245,28,G,'Divisor de voltaje · batería');
    p+=box(150,py(1)-14,105,py(4)-py(1)+28,B,'DRV8833','puente H');
    p+=box(10,py(1)-14,110,py(2)-py(1)+28,G,'Motor der.')+box(10,py(3)-14,110,py(4)-py(3)+28,G,'Motor izq.');
    [py(1),py(2),py(3),py(4)].forEach(y=>{ p+=ln('M150 '+y+'H122',G,'pg'); });
    p+=box(10,py(5)-14,245,28,R,'3V3 · regulador de 3.3 V')+box(10,py(6)-14,245,28,R,'GND · referencia común')+box(10,py(7)-14,245,28,R,'5V · alimentación de entrada');
    p+=legend(520)+tx(990,520,'Vista superior del modelo 3D','end',K)+'</svg>';
    return {a:a,p:p};
  })();
  /* diagramas de conexiones de los módulos clave: DRV8833, MPU6050, BMS 2S y regulador Mini560 (imagen = vista superior del modelo 3D) */
  const MF=(()=>{
    const R='#b91c1c', B='#1d4ed8', G='#15803d', K='#6b7280';
    const topImg=(re,x0,x1,z0,z1,PX)=>{ try{ const L=byName(re); if(!L.length) return '';
      const W=Math.round((x1-x0)*PX), Hh=Math.round((z1-z0)*PX), cv=document.createElement('canvas'); cv.width=W; cv.height=Hh;
      const rd=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,preserveDrawingBuffer:true}); rd.setSize(W,Hh,false); rd.setClearColor(0x000000,0);
      const sc=new THREE.Scene(); sc.add(new THREE.AmbientLight(0xffffff,0.7)); const dl=new THREE.DirectionalLight(0xffffff,0.32); dl.position.set(-30,100,-20); sc.add(dl);
      L.forEach(b=>{ if(!b.mesh) return; b.mesh.updateMatrixWorld(true); const mt=b.mesh.material.clone(); mt.transparent=false; mt.opacity=1; mt.side=THREE.DoubleSide; mt.clippingPlanes=[]; const m=new THREE.Mesh(b.mesh.geometry,mt); m.matrixAutoUpdate=false; m.matrix.copy(b.mesh.matrixWorld); m.frustumCulled=false; sc.add(m); (b.silk||[]).forEach(sm=>{ sm.updateMatrixWorld(true); const m2=new THREE.Mesh(sm.geometry,sm.material); m2.matrixAutoUpdate=false; m2.matrix.copy(sm.matrixWorld); m2.frustumCulled=false; sc.add(m2); }); });
      const cx=(x0+x1)/2, cz=(z0+z1)/2, cam=new THREE.OrthographicCamera(-(x1-x0)/2,(x1-x0)/2,(z1-z0)/2,-(z1-z0)/2,0.1,400); cam.position.set(cx,150,cz); cam.up.set(0,0,-1); cam.lookAt(cx,0,cz); cam.updateMatrixWorld(true);
      rd.render(sc,cam); const u=cv.toDataURL('image/png'); rd.dispose(); return u; }catch(e){ return ''; } };
    const defs=id=>'<defs>'+[['r',R],['b',B],['g',G]].map(q=>'<marker id="'+id+q[0]+'" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="'+q[1]+'"/></marker>').join('')+'</defs>';
    const box=(x,y,w,h,c,t1,t2,dash)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="var(--paper)" stroke="'+c+'" stroke-width="1.5"'+(dash?' stroke-dasharray="5 3"':'')+'/><text x="'+(x+w/2)+'" y="'+(y+h/2+(t2?-1:5))+'" text-anchor="middle" fill="currentColor" font-size="'+(w<120?12.5:14)+'">'+t1+'</text>'+(t2?'<text x="'+(x+w/2)+'" y="'+(y+h/2+13)+'" text-anchor="middle" fill="currentColor" font-size="11">'+t2+'</text>':'');
    const ln=(d,c,dash)=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="1.5"'+(dash?' stroke-dasharray="5 3"':'')+'/>';
    const tx=(x,y,s,a,c,f)=>'<text x="'+x+'" y="'+y+'" text-anchor="'+(a||'middle')+'" fill="'+(c||'currentColor')+'" font-size="'+(f||11.5)+'">'+s+'</text>';
    const dot=(x,y,c)=>'<circle cx="'+x+'" cy="'+y+'" r="6" fill="'+c+'" stroke="#fff" stroke-width="1.6"/>';
    const SV=(h,y0)=>'<svg viewBox="0 '+(y0||0)+' 1000 '+h+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;border:1px solid var(--bd);background:var(--paper);color:var(--tx)" font-family="Latin Modern Roman,CMU Serif,KaTeX_Main,serif" font-size="14">';
    const legend=y=>[[R,'Energía',40],[B,'Control',200],[G,'Periféricos y actuadores',340]].map(q=>'<rect x="'+q[2]+'" y="'+(y-9)+'" width="14" height="10" fill="none" stroke="'+q[0]+'" stroke-width="1.5"/>'+tx(q[2]+22,y,q[1],'start')).join('');
    const foot=(y,s)=>tx(990,y,s,'end',K);
    const col=c=>c==='R'?R:c==='B'?B:c==='G'?G:K;
    const RH=36, ref=y=>'<g><path d="M40 '+(y+14)+'h130M40 '+(y+8)+'v12M170 '+(y+8)+'v12M105 '+(y+11)+'v6" stroke="currentColor" stroke-width="1.3" fill="none"/>'+tx(180,y+19,'10 mm · escala común a todas las figuras de módulos y a la ESP32-C3 (13 px por mm)','start',K,12)+'</g>';
    const out={};
    /* ---- DRV8833 ---- */
    { const x0=35.4,z0=-3.0,s=13, img=topImg(/DRV8833/,35.4,55.0,-3.0,14.6,60), ix=(1000-19.6*13)/2, iy=76, W=19.6*s, Hh=17.6*s, X=x=>ix+(x-x0)*s, Z=z=>iy+(z-z0)*s;
      const zs=[-0.55,1.975,4.525,7.075,9.6,12.15], xl=37.525, xr=52.775;
      const Lp=[['VM','R','VBAT · tras el interruptor'],['OUT1','G','Motor izq. · hilo 1'],['OUT2','G','Motor izq. · hilo 2'],['OUT3','G','Motor der. · hilo 1'],['OUT4','G','Motor der. · hilo 2'],['GND','R','GND común']];
      const Rp=[['EN','B','ESP32-C3 · GPIO10'],['IN1','B','ESP32-C3 · GPIO3'],['IN2','B','ESP32-C3 · GPIO4'],['IN3','B','ESP32-C3 · GPIO1'],['IN4','B','ESP32-C3 · GPIO2'],['FLT','K','Sin conexión']];
      let a=SV(Hh+iy+70+RH)+defs('d')+tx(500,40,'DRV8833 · puente H doble','middle','currentColor',16)+tx(500,58,'terminales del módulo en PCB1 (vista superior) · placa de 18.6 × 16.8 mm','middle',K,12);
      a+=img?'<image href="'+img+'" x="'+ix+'" y="'+iy+'" width="'+W+'" height="'+Hh+'" preserveAspectRatio="none"/>':'';
      Lp.forEach((q,k)=>{ const y=Z(zs[k]), c=col(q[1]); a+=ln('M250 '+y+'H'+X(xl),c)+dot(X(xl),y,c)+box(20,y-14,230,28,c,q[2]); });
      Rp.forEach((q,k)=>{ const y=Z(zs[k]), c=col(q[1]); a+=ln('M'+X(xr)+' '+y+'H750',c,q[1]==='K')+dot(X(xr),y,c)+box(750,y-14,230,28,c,q[2],'',q[1]==='K'); });
      Lp.forEach((q,k)=>{ a+=tx(ix-12,Z(zs[k])-5,q[0],'end','currentColor',12); }); Rp.forEach((q,k)=>{ a+=tx(ix+W+12,Z(zs[k])-5,q[0],'start','currentColor',12); }); 
      a+=legend(Hh+iy+52)+foot(Hh+iy+52,'Orden de pines propuesto: verificar con el módulo físico')+ref(Hh+iy+70)+'</svg>'; out.drv=a; }
    /* ---- MPU6050 (GY-521) ---- */
    { const x0=49.9,z0=13.6,s=13, img=topImg(/MPU6050|separador plástico \(MPU/,49.9,71.6,13.6,30.6,60), ix=(1000-21.7*s)/2, iy=190, W=21.7*s, Hh=17*s, cx0=ix+W/2, cy0=iy+Hh/2, X=x=>2*cx0-(ix+(x-x0)*s), Z=z=>2*cy0-(iy+(z-z0)*s);
      /* módulo girado 180°: los terminales quedan arriba y las etiquetas de conexión se acomodan sobre la placa */
      const xs=[51.825,54.375,56.925,59.45,62.0,64.55,67.075,69.625], zp=29.075;
      const P=[['VCC','R','3V3'],['GND','R','GND'],['SCL','B','GPIO9'],['SDA','B','GPIO8'],['XDA','K','sin uso'],['XCL','K','sin uso'],['AD0','K','sin conectar'],['INT','B','GPIO6']];
      const by=78, bot=iy+Hh; let a=SV(bot+28+64+RH)+defs('m')+tx(500,28,'MPU6050 · giroscopio y acelerómetro','middle','currentColor',16)+tx(500,46,'terminales del módulo en PCB1 (vista superior, girada 180°) · placa de 20.5 × 16.3 mm','middle',K,12);
      a+=img?'<g transform="rotate(180 '+cx0+' '+cy0+')"><image href="'+img+'" x="'+ix+'" y="'+iy+'" width="'+W+'" height="'+Hh+'" preserveAspectRatio="none"/></g>':'';
      P.forEach((q,k)=>{ const x=X(xs[k]), y=Z(zp), c=col(q[1]), kx=7-k, bx=500+(kx-3.5)*108, ym=iy-22-(kx<4?kx:7-kx)*16;
        a+=ln('M'+x+' '+(y-10.5)+'V'+ym+'H'+bx+'V'+(by+14),c,q[1]==='K')+'<circle cx="'+x+'" cy="'+y+'" r="10" fill="none" stroke="'+c+'" stroke-width="2"/>'+box(bx-50,by-14,100,28,c,q[2],'',q[1]==='K'); });
      a+=legend(bot+34)+foot(bot+34,'Alimentación de 3.3 V; dirección I2C 0x68')+ref(bot+50)+'</svg>'; out.mpu=a; }
    /* ---- BMS 2S ---- */
    { const x0=36.4,z0=1.8,s=13, img=topImg(/BMS2S/,36.4,64.4,1.8,15.8,60), ix=(1000-28*s)/2, iy=90, W=28*s, Hh=14*s, X=x=>ix+(x-x0)*s, Z=z=>iy+(z-z0)*s;
      let a=SV(Hh+iy+160+RH)+defs('b')+tx(500,40,'BMS 2S · protección del banco de celdas','middle','currentColor',16)+tx(500,58,'terminales del módulo en PCB2 (vista superior) · placa de 26.6 × 13.1 mm','middle',K,12);
      a+=img?'<image href="'+img+'" x="'+ix+'" y="'+iy+'" width="'+W+'" height="'+Hh+'" preserveAspectRatio="none"/>':'';
      const lx=X(40.0), ly=Z(12.375), rx=X(61.875), ry=Z(6.375), b1=X(57.475), b2=X(60.475), bz=Z(12.575), yb=Hh+iy+40;
      a+=ln('M200 '+ly+'H'+lx,R)+dot(lx,ly,R)+box(20,ly-14,180,28,R,'Celdas LiPo · B−');
      a+=ln('M'+rx+' '+ry+'H800',R)+dot(rx,ry,R)+box(800,ry-14,180,28,R,'Celdas LiPo · B+');
      a+=ln('M'+b1+' '+bz+'V'+yb+'H590',R)+dot(b1,bz,R)+tx(b1-8,yb-6,'P−','end')+box(430,yb-14,160,28,R,'Interruptor · GND');
      a+=ln('M'+b2+' '+bz+'V'+(yb+44)+'H810',R)+dot(b2,bz,R)+tx(b2+8,yb+38,'P+','start')+box(810,yb+30,170,28,R,'Interruptor · VBAT');
      a+=tx(438,153,'MOSFET','middle','#fff',10)+tx(575,153,'MOSFET','middle','#fff',10)+tx(423,222,'IC','middle','#fff',10)+tx(lx+4,ly+30,'B−','start','#fff',10)+tx(rx-4,ry-14,'B+','end','#fff',10)+tx(b1-4,bz-30,'P−','end','#fff',10)+tx(b2+4,bz-30,'P+','start','#fff',10);
      a+=legend(yb+104)+foot(yb+104,'Etiquetas propuestas: verificar con el módulo físico')+ref(yb+120)+'</svg>'; out.bms=a; }
    /* ---- Regulador Mini560 ---- */
    { const x0=65.2,z0=-9.2,s=13, img=topImg(/regulador/,65.2,85.2,-9.2,22.4,60), ix=(1000-20*s)/2, iy=190, W=20*s, Hh=31.6*s, X=x=>ix+(x-x0)*s, Z=z=>iy+(z-z0)*s;
      let a=SV(Hh+iy+72+RH)+defs('g')+tx(500,40,'Regulador reductor Mini560 · 3.3 V','middle','currentColor',16)+tx(500,58,'terminales del módulo en PCB2 (vista superior) · cuerpo de 18 × 30 mm','middle',K,12);
      a+=img?'<image href="'+img+'" x="'+ix+'" y="'+iy+'" width="'+W+'" height="'+Hh+'" preserveAspectRatio="none"/>':'';
      const zt=Z(-6.6), xsH=[X(68.725),X(71.275),X(80.2),X(82.725)], ya=iy-44, yb2=iy-92;
      a+=ln('M'+xsH[0]+' '+zt+'V'+ya+'H230',R)+box(20,ya-14,210,28,R,'VBAT · tras el interruptor');
      a+=ln('M'+xsH[1]+' '+zt+'V'+yb2+'H230',R)+box(20,yb2-14,210,28,R,'GND común');
      a+=ln('M'+xsH[2]+' '+zt+'V'+yb2+'H770',R)+box(770,yb2-14,210,28,R,'VOUT · 3V3 de PCB1');
      a+=ln('M'+xsH[3]+' '+zt+'V'+ya+'H770',R)+box(770,ya-14,210,28,R,'GND común');
      xsH.forEach((x,k)=>{ a+=dot(x,zt,R)+tx(x,zt+24,['VIN+','GND','VOUT','GND'][k],'middle','#fff',11); });
      const sx=X(67.8), sy=Z(1.0); a+=dot(sx,sy,K)+ln('M'+sx+' '+sy+'H230',K,1)+box(20,sy-14,210,28,K,'EN / PG · sin conexión','',1);
      a+=tx(551,382,'L','middle','#fff',13)+tx(424,376,'IC','middle','#fff',10)+tx(ix+W*0.5,iy+Hh-52,'MINI560','middle','#cfe0ff',11);
      a+=legend(Hh+iy+56)+foot(Hh+iy+56,'Pads inferiores duplican a los superiores · etiquetas propuestas')+ref(Hh+iy+72)+'</svg>'; out.reg=a; }
    return out;
  })();
  const NS=specs.length, pg={}, pcount={};
  specs.forEach((s,i)=>{ if(s.opt&&s.opt.pre) s.opt.pre(); const svg=sheetSVG(s.title,s.sub,s.list,s.views,i+1,NS,s.mat||matN(matOf(s.list[0],bodies.indexOf(s.list[0]))),s.opt); if(s.opt&&s.opt.post) s.opt.post(); pg[s.pg]=(pg[s.pg]||'')+'<figure>'+svg+'<figcaption><b>Plano '+(i+1)+'.</b> '+esc(s.title)+' | '+esc(s.sub)+'.</figcaption></figure>'; });
  const MEAS={M:201.41,com:[60.509,4.373,8.707],I:{xx:132356,yy:129763,zz:148249},grp:{'Chasis (MDF y acrílico)':64.17,'Baterías LiPo (2)':24.12,'Motorreductores N20 (2)':20.09,'PCB1 y componentes':20.52,'PCB2 y componentes':13.06,'Bandas de goma (2)':5.01,'Módulo OLED':7.10,'Separadores, tornillos y tuercas':20.62,'Ruedas (12)':2.39,'Bases, placa de motores y baleros':7.16,'Otros (separador blando, cableado, interruptor)':4.70}};
  const MD=(()=>{ const g=re=>bnd(byName(re).filter(b=>b.o.mode!=='B')), A=g(/Ruedas centrales \(mayores\) · tracción \(der\./), Bq=g(/Ruedas centrales \(mayores\) · tracción \(izq\./), td=g(/Eje en D.*\(der\./), tl=g(/Eje en D.*\(izq\./), ba=g(/Banda de goma con ranura \(der\./), bB=g(/Ruedas centrales \(canal del O-ring\) · tracción \(der\./),
      lat=g(/Ruedas laterales internas · tracción \(der\./), pl=g(/^Placa de motores/), ch=bnd(main), mt=bnd(byName(/Motores N20 \(2\)/),{ax:2,lo:zc0+0.1,hi:1e9}), rest=bnd(bodies.filter(b=>b.o.mode!=='B'&&!/Ruedas|Banda|O-ring|Relieves|[Cc]able|Alambre/.test(b.o.name||''))), bs=g(/^Bases de motor/);
    const xR=(A.x[0]+A.x[1])/2, xL=(Bq.x[0]+Bq.x[1])/2, zD=(td.z[0]+td.z[1])/2, zL=(tl.z[0]+tl.z[1])/2, yA=(td.y[0]+td.y[1])/2, yG=ba.y[0], zc=(pl.z[0]+pl.z[1])/2;
    return {xm:(xR+xL)/2,xR,xL,b:xR-xL,zD,zL,L:zD-zL,yA,yG,re:yA-yG,rc:(A.y[1]-A.y[0])/2,rl:(lat.y[1]-lat.y[0])/2,wBand:ba.x[1]-ba.x[0],zc,reB:yA-(yA-10.6),clear:rest.y[0]-yG,H:ch.y[1]-ch.y[0],mt,td}; })();
  const fx=(x,n)=>x.toFixed(n==null?1:n), sg=x=>(x>=0?'+':'−')+Math.abs(x).toFixed(1);
  const cmx=MEAS.com[0]-MD.xm, cmz=MEAS.com[2]-MD.zc, cmh=MEAS.com[1]-MD.yG, Iv=MEAS.I.yy*1e-9, Ix=MEAS.I.xx*1e-9, Iz=MEAS.I.zz*1e-9, grpRows=Object.entries(MEAS.grp).map(([k,v])=>'<tr><td>'+k+'</td><td>'+fx(v,1)+'</td><td>'+fx(100*v/MEAS.M,1)+' %</td></tr>').join('');
  const MDITEM=['md','Medidas destacables',`<p>Esta sección reúne las medidas que se necesitan para escribir el modelo matemático del sistema de tracción y del robot completo. Todas se miden sobre el modelo STEP en posición de ensamble, con las cotas de los planos ${PN(/^MOTORREDUCTOR N20 · 1/)} a ${PN(/^RUEDA LOCA · ESTILO B/)} y los análisis del simulador.</p>
<h3>Marco de referencia</h3>
<p>El origen $O$ está en el centro geométrico del chasis en planta, sobre el piso. En el modelo CAD el eje $x$ apunta a la derecha, $y$ hacia arriba y $z$ hacia atrás (el frente del robot es $-z$); el símbolo de ejes del simulador usa otra orientación (X al frente, Y a la izquierda, Z arriba). Las coordenadas de la tabla 6 están medidas desde $O$.</p>
<table>${cap(6,'Geometría del sistema de tracción (estilo A: banda ranurada).')}<tr><th>Símbolo</th><th>Valor</th><th>Significado</th></tr>
<tr><td>$b$</td><td>${fx(MD.b)} mm</td><td>Vía: distancia entre los planos medios de las dos bandas (ruedas centrales)</td></tr>
<tr><td>$L$</td><td>${fx(MD.L)} mm</td><td>Distancia entre ejes de una misma banda (eje motriz y eje de la rueda loca)</td></tr>
<tr><td>$r_c$</td><td>${fx(MD.rc)} mm</td><td>Radio de la rueda central; las laterales tienen $r_l=${fx(MD.rl)}$ mm</td></tr>
<tr><td>$r_e$</td><td>${fx(MD.re)} mm</td><td>Radio efectivo (eje | piso, con la banda); con el O-ring del estilo B vale 10.6 mm</td></tr>
<tr><td>$w$</td><td>${fx(MD.wBand)} mm</td><td>Ancho de la banda en contacto con el piso (tres ruedas de 3 mm)</td></tr>
<tr><td>$h_{\\min}$</td><td>${fx(MD.clear)} mm</td><td>Altura libre: de la pieza rígida más baja (base del motor) al piso</td></tr>
<tr><td>$H$</td><td>${fx(MD.H)} mm</td><td>Altura total del chasis</td></tr></table>
<table>${cap(7,'Posición de los ejes de rotación y de los puntos de apoyo, medida desde $O$ (mm).')}<tr><th>Elemento</th><th>$x$</th><th>$y$</th><th>$z$</th><th>Nota</th></tr>
<tr><td>Eje motriz derecho</td><td>línea en $x$</td><td>${fx(MD.re)}</td><td>${sg(MD.zD-MD.zc)}</td><td>Eje en D de Ø3 mm, atrás</td></tr>
<tr><td>Eje motriz izquierdo</td><td>línea en $x$</td><td>${fx(MD.re)}</td><td>${sg(MD.zL-MD.zc)}</td><td>Eje en D de Ø3 mm, adelante</td></tr>
<tr><td>Eje de rueda loca derecha</td><td>línea en $x$</td><td>${fx(MD.re)}</td><td>${sg(MD.zL-MD.zc)}</td><td>Tornillo M3 y balero 693ZZ</td></tr>
<tr><td>Eje de rueda loca izquierda</td><td>línea en $x$</td><td>${fx(MD.re)}</td><td>${sg(MD.zD-MD.zc)}</td><td>Tornillo M3 y balero 693ZZ</td></tr>
<tr><td>Plano medio de la banda derecha</td><td>${sg(MD.xR-MD.xm)}</td><td>0</td><td>—</td><td>Ruedas centrales</td></tr>
<tr><td>Plano medio de la banda izquierda</td><td>${sg(MD.xL-MD.xm)}</td><td>0</td><td>—</td><td>Ruedas centrales</td></tr>
<tr><td>Motor derecho: cuerpo y eje</td><td>de ${sg(MD.mt.x[0]-MD.xm)} a ${sg(MD.td.x[1]-MD.xm)}</td><td>${fx(MD.mt.y[0]-MD.yG)} a ${fx(MD.mt.y[1]-MD.yG)}</td><td>${sg(MD.mt.z[0]-MD.zc)} a ${sg(MD.mt.z[1]-MD.zc)}</td><td>12 × 10 mm de sección; el eje sale hacia $+x$</td></tr></table>
<p>La tracción es cruzada: el motor derecho se monta atrás y el izquierdo adelante, y cada banda une el eje motriz con la rueda loca del mismo lado. Los cuatro apoyos están en $x=\\pm${fx(MD.b/2,2)}$ mm y $z=\\pm${fx(MD.L/2)}$ mm respecto de $O$, de modo que el robot es simétrico por giro de 180° alrededor del eje $y$.</p>
<h3>Masa, centro de masas e inercia</h3>
<p>Se obtienen del modelo voxelizado a 1 mm con las densidades de la tabla 5, de modo que son estimaciones de ingeniería y deben ajustarse pesando el robot.</p>
<table>${cap(8,'Propiedades de masa respecto de $O$ y del centro de masas $G$.')}<tr><th>Símbolo</th><th>Valor</th><th>Significado</th></tr>
<tr><td>$m$</td><td>${fx(MEAS.M)} g</td><td>Masa total estimada</td></tr>
<tr><td>$G$</td><td>$(${sg(cmx)},\;${fx(cmh)},\;${sg(cmz)})$ mm</td><td>Centro de masas $(x,y,z)$; $y$ medida sobre el piso</td></tr>
<tr><td>$h_G$</td><td>${fx(cmh)} mm</td><td>Altura del centro de masas sobre el piso</td></tr>
<tr><td>$I_{y}$</td><td>${(Iv*1e4).toFixed(3)}×10<sup>−4</sup> kg·m²</td><td>Inercia respecto del eje vertical por $G$ (guiñada)</td></tr>
<tr><td>$I_{x}$</td><td>${(Ix*1e4).toFixed(3)}×10<sup>−4</sup> kg·m²</td><td>Inercia respecto del eje lateral por $G$ (cabeceo)</td></tr>
<tr><td>$I_{z}$</td><td>${(Iz*1e4).toFixed(3)}×10<sup>−4</sup> kg·m²</td><td>Inercia respecto del eje longitudinal por $G$ (alabeo)</td></tr></table>
<table>${cap(9,'Reparto de masa por subsistema.')}<tr><th>Subsistema</th><th>Masa (g)</th><th>Parte</th></tr>${grpRows}</table>
<h3>Modelo cinemático y dinámico</h3>
<p>Con velocidades angulares de rueda $\\omega_R$ y $\\omega_L$ y el radio efectivo $r_e$, la cinemática de tracción diferencial es:</p>
<div class="th">$$v=\\frac{r_e(\\omega_R+\\omega_L)}{2},\\qquad \\omega=\\frac{r_e(\\omega_R-\\omega_L)}{b_{\\mathrm{ef}}},\\qquad b_{\\mathrm{ef}}=\\chi\\,b .$$</div>
<p>El factor $\\chi\\ge 1$ corrige el deslizamiento lateral de las bandas (dos ejes por lado) y se identifica con una prueba de giro en el sitio. La dinámica planar con fuerzas de tracción $F_R,F_L$ en cada lado es:</p>
<div class="th">$$m\\dot v=F_R+F_L-F_{\\mathrm{res}},\\qquad I_y\\dot\\omega=\\frac{b_{\\mathrm{ef}}}{2}(F_R-F_L)-M_{\\mathrm{res}},\\qquad F_{R,L}=\\frac{i\\,\\eta\\,\\tau_{R,L}}{r_e}.$$</div>
<p>Para cada motor de corriente continua: $V=R_a i_a+k_e\\,i\\,\\omega_w$ y $\\tau=k_t i_a$, donde $i$ es la relación de reducción del reductor. Para la estabilidad ante vuelco y deslizamiento se usan $h_G$, $b$ y $L$ de las tablas 6 y 8, con coeficiente de fricción $\\mu$:</p>
<div class="th">$$a_{\\mathrm{vuelco}}=g\\,\\frac{b/2}{h_G},\\qquad a_{\\mathrm{desliz}}=\\mu g .$$</div>
<p>Con los valores de las tablas, $b/2h_G=${fx(MD.b/2/cmh,2)}$ y la aceleración lateral de vuelco es $a=${fx(9.81*MD.b/2/cmh,1)}$ m/s².</p>
<table>${cap(10,'Parámetros que no salen de la geometría y deben medirse.')}<tr><th>Símbolo</th><th>Cómo obtenerlo</th></tr>
<tr><td>$i$, $\\eta$</td><td>Relación y eficiencia del reductor (hoja de datos del N20 usado)</td></tr>
<tr><td>$R_a$, $k_t$, $k_e$, $J_m$</td><td>Resistencia, constantes y inercia del motor (ensayo con el puente H)</td></tr>
<tr><td>$\\mu$</td><td>Fricción banda | piso (plano inclinado)</td></tr>
<tr><td>$\\chi$</td><td>Giro en el sitio a velocidad conocida: $\\chi=b_{\\mathrm{medido}}/b$</td></tr></table>
<div class="tip"><b>Consejo.</b> El plano ${PN(/^ENSAMBLE DE TRACCI/)} (ensamble de tracción) acota $b$, $L$ y la altura de los ejes; el plano ${PN(/^MOTORREDUCTOR N20 · 1/)} acota el motor y su eje en D.</div>`];
  const PLANITEMS=[
['pl','Plano general',`<p>Hojas normalizadas A4 con rótulo, cotas generales y escala común. Cambia el estilo con los botones <b>Estándar</b> (fondo blanco, líneas negras) o <b>Maker</b> (fondo azul, líneas blancas) del índice lateral.</p>${pg.pl||''}`],
['ch','Planos del chasis',`<p>El chasis se compone de ${NMAIN} piezas principales. Cada hoja muestra vistas frontal, lateral, superior e isométrica de una pieza.</p>
<table>${cap(3,'Piezas del chasis.')}<tr><th>N.º</th><th>Pieza</th><th>X (mm)</th><th>Y (mm)</th><th>Z (mm)</th><th>Material</th></tr>${chRows}</table>${pg.ch||''}`],
['el','Planos de electrónica',`<p>Placas PCB1 y PCB2, módulo OLED, interruptor y cable plano, en su posición de ensamble.</p>${pg.el||''}`],
['mo','Motores y transmisión',`<p>Motorreductores N20, bases, placa de motores, ruedas, bandas, ejes y baleros.</p>${pg.mo||''}`],
['ba','Baterías y energía',`<p>Dos celdas LiPo 802040 separadas por un espaciador de polímero blando.</p>${pg.ba||''}`]];
  const CAPIMG=window.PB_CAPIMG;
  const secs=[
['s1','PILIBOT',`<h3>Inicio rápido</h3>
<p>Este documento acompaña al simulador y se organiza de lo general a lo particular. Está escrito para que lo entienda cualquier persona curiosa y, al mismo tiempo, incluye el planteamiento matemático que requieren estudiantes de ingeniería, maestría y doctorado: las ecuaciones aparecen en recuadros azules, los consejos en verde y las advertencias en rojo.</p>
<ol><li><b>Gira</b> el robot arrastrando; <b>acerca</b> con la rueda del ratón; <b>desplaza</b> con clic derecho.</li><li>Abre las pestañas de la barra superior (teclas <kbd>1</kbd>–<kbd>6</kbd>) y prueba los controles.</li><li>Pulsa <b>Encendido</b> para ver cómo responden la pantalla y los LED.</li><li>Consulta los planos (secciones 2 a 6), las piezas y su montaje; el documento sigue el modo claro u oscuro del simulador.</li></ol>
<p>${tryB('Encender y apagar el robot',[['click','t-pwr']])}${tryB('Ver la vista explosionada',[['tab',1],['rng','ex-level',1000]])}${tryB('Volver al ensamble',[['tab',1],['rng','ex-level',0]])}</p>
${blk('tip','<b>Consejo.</b> Los botones verdes ejecutan la acción en el simulador y cierran esta ventana; para regresar usa <b>↩ Documentación</b>, abajo a la izquierda. Cada sección se abre por separado desde el índice.')}
<h3>El robot</h3>
<p>PILIBOT es un robot móvil didáctico de tracción diferencial con bandas de goma, controlado por una ESP32-C3-MINI. Integra un puente H DRV8833 para dos motorreductores N20, una IMU MPU6050, un sensor de distancia VL53, un LED RGB WS2812B, una pantalla OLED de 1.3″ (128×64) y un banco de dos celdas LiPo 802040 con protección BMS 2S, regulador de 3.3 V, interruptor deslizante y conector magnético de carga.</p>
<table>${cap(1,'Ficha técnica.')}<tr><th>Característica</th><th>Valor</th></tr>
<tr><td>Dimensiones (ancho × profundidad × alto)</td><td>${f(W)} × ${f(D)} × ${f(Hh)} mm</td></tr>
<tr><td>Convención de ejes del modelo (igual que SolidWorks)</td><td>símbolo de ejes del simulador: $X$ al frente (rojo), $Y$ a la izquierda (verde), $Z$ arriba (azul). En el archivo STEP: frente = −z, arriba = +y, derecha = +x.</td></tr>
<tr><td>Masa estimada del modelo</td><td>${AN.vox?AN.vox.M.toFixed(0)+' g (voxelizado)':'se calcula al ejecutar un análisis'}</td></tr>
<tr><td>Control</td><td>ESP32-C3-MINI</td></tr><tr><td>Tracción</td><td>2 motorreductores N20, rueda de 7 mm de radio, bandas de goma</td></tr>
<tr><td>Sensores</td><td>IMU MPU6050, distancia VL53</td></tr><tr><td>Interfaz</td><td>OLED 1.3″ 128×64, LED RGB WS2812B, interruptor deslizante</td></tr>
<tr><td>Energía</td><td>2 × LiPo 802040 (40 × 20.5 × 8 mm), BMS 2S, regulador 3.3 V</td></tr></table>
<figure><div class="f1r"><div><img src="${imgA}" alt="Ensamble, esquina delantera derecha"><span>Delantera derecha</span></div><div><img src="${imgA2}" alt="Ensamble, esquina delantera izquierda"><span>Delantera izquierda</span></div><div><img src="${imgA3}" alt="Ensamble, esquina trasera"><span>Trasera</span></div></div><figcaption><b>Figura 1.</b> PILIBOT ensamblado en proyección isométrica desde tres esquinas: dos delanteras (derecha e izquierda) y una trasera.</figcaption></figure>
<h3>Ensamble</h3>
<figure class="f4g"><div class="f4w"><img src="${imgE}" alt="Vista explosionada"><button type="button" data-f4="1">Abrir figura interactiva</button></div><ol class="f4l">${f4list}</ol><figcaption><b>Figura 4.</b> Vista explosionada completa e interactiva: la pantalla OLED sube sobre las placas PCB1 y PCB2; la batería, la placa de motores y los motores bajan. Cada componente lleva un número con una flecha que señala su ubicación; al pulsar el número, la vista se acerca automáticamente a esa sección.</figcaption></figure>
<p><button type="button" class="dlb" data-f4="1">Abrir la figura interactiva</button> ${tryB('Abrir la vista explosionada en el simulador',[['tab',1],['rng','ex-level',1000]])}</p>
<h3>Secuencia de montaje sugerida</h3>
<ol>
<li><b>Chasis.</b> Paneles laterales (interior y exterior de cada lado) contra la placa inferior; tapas frontal y posterior encajadas entre los paneles.</li>
<li><b>Placa de motores.</b> Se fija con separadores hexagonales M3 × 10, tornillos M3 × 6 y tuercas M3.</li>
<li><b>Motores N20.</b> Cada motorreductor se monta en su base con tornillos M2 × 8 y tuercas M2; el eje en D de Ø3 mm entrega el giro a la rueda de tracción.</li>
<li><b>Ruedas locas.</b> Separador hexagonal M3 × 6, tornillo M3 × 10 de cabeza plana, tuerca M3, separador circular y balero 693ZZ (Ø3 × Ø8 × 4).</li>
<li><b>Bandas.</b> Banda de goma con ranura y O-ring liso sobre las ruedas centrales; los relieves de la banda se alinean con el canal.</li>
<li><b>Energía.</b> Dos celdas LiPo 802040 (una cara arriba y otra abajo) separadas por el espaciador de polímero blando de 2 mm; terminales JST hacia PCB2.</li>
<li><b>PCB2.</b> Protección BMS 2S, regulador de 3.3 V y conector magnético; recibe el conector hembra 1×4 de los motores.</li>
<li><b>PCB1.</b> ESP32-C3-MINI, DRV8833, MPU6050 y sensor VL53 sobre separadores plásticos; interruptor, LED RGB y cabezales de motor.</li>
<li><b>Pantalla.</b> Módulo OLED de 1.3″ sobre la tapa de acrílico con dos tornillos M2 y tuercas; cable plano de 4 hilos (VDD, GND, SCK, SDA) hacia PCB1.</li>
<li><b>Interruptor.</b> Alambre rígido con caparazón desmontable sobre la palanca, saliendo por el orificio de la placa posterior.</li>
<li><b>Bandas elásticas.</b> Se colocan al final alrededor del chasis para sujetar los paneles.</li></ol>
${blk('warn','<b>Verifica.</b> La secuencia se deduce de la geometría y los nombres de las piezas del modelo; confirma el orden con las tolerancias reales de impresión.')}
<h3>Componentes modelados y descarga de modelos 3D</h3>
<p>La Tabla 2 enumera todos los componentes modelados del PILIBOT, chasis incluido. El <b>N.º</b> es el mismo que aparece en los rótulos de la Figura 4 (ordenados de arriba abajo en la vista explosionada) y cada fila descarga el modelo STEP del componente completo.</p>
<p><button type="button" class="dlb" data-f4="1">Abrir la Figura 4 interactiva</button></p>
${blk('tip','<b>Formato.</b> Archivos STEP (AP214) en milímetros y en la posición de ensamble del robot (frente = −z, arriba = +y). Cada componente se exporta como sólidos de caras planas: los triángulos coplanares se funden en una sola cara y las superficies curvas quedan facetadas. Se abre en SolidWorks, FreeCAD, Fusion u Onshape como cuerpo sólido, pero sin historial paramétrico; en las piezas curvas muy detalladas (motores, cableado) el CAD puede pedir coser las caras.')}
${blk('warn','<b>Tamaño.</b> Los archivos se generan al pulsar el botón; los componentes con mucha geometría (PCB1, motores, cableado) pesan varios megabytes y tardan unos segundos.')}
<table>${cap(2,'Componentes modelados del PILIBOT.')}<tr><th>N.º</th><th>Componente</th><th>Cuerpos</th><th>Material supuesto</th></tr>${partRows}</table>`],
...PLANITEMS,MDITEM,
['s4','Electrónica y conexiones',`
<table>${cap(4,'Componentes electrónicos y su función.')}<tr><th>Componente</th><th>Función</th></tr>
<tr><td>ESP32-C3-MINI</td><td>Microcontrolador con Wi-Fi y Bluetooth LE; ejecuta el programa del robot.</td></tr>
<tr><td>DRV8833</td><td>Puente H doble que alimenta y controla el sentido y la velocidad de los dos motores.</td></tr>
<tr><td>Motorreductores N20</td><td>Convierten la corriente en giro de baja velocidad y alto par para las ruedas.</td></tr>
<tr><td>MPU6050</td><td>IMU de 6 ejes: acelerómetro y giroscopio para orientación y golpes.</td></tr>
<tr><td>VL53</td><td>Sensor óptico de distancia (tiempo de vuelo) para detectar obstáculos.</td></tr>
<tr><td>OLED 1.3″ (128×64)</td><td>Pantalla de los ojos y mensajes; conexión por cable plano de 4 hilos (VDD, GND, SCK, SDA).</td></tr>
<tr><td>LED RGB WS2812B</td><td>Indicador de color direccionable.</td></tr>
<tr><td>2 × LiPo 802040 + BMS 2S</td><td>Almacenan la energía y protegen contra sobrecarga, sobredescarga y cortocircuito.</td></tr>
<tr><td>Regulador de 3.3 V</td><td>Entrega la tensión de lógica a la ESP32-C3 y a los sensores.</td></tr>
<tr><td>Interruptor y conector magnético</td><td>Encendido general y carga de la batería.</td></tr></table>
<figure>${DG.a}<figcaption><b>Figura 5a.</b> Diagrama de bloques: energía en rojo, control en azul, periféricos y actuadores en verde.</figcaption></figure>
<figure>${DG.p}<figcaption><b>Figura 5b.</b> Diagrama de conexiones y distribución de pines de la ESP32-C3 SuperMini, dibujada a partir del modelo 3D de PCB1 (vista superior).</figcaption></figure>
<h3>Módulos clave: terminales y conexiones</h3>
<figure>${MF.drv}<figcaption><b>Figura 5c.</b> DRV8833: puente H doble que alimenta los dos motores N20 (señales IN1–IN4 y EN desde la ESP32-C3).</figcaption></figure>
<figure>${MF.mpu}<figcaption><b>Figura 5d.</b> MPU6050: IMU de seis ejes en bus I2C compartido con la OLED (SDA GPIO8, SCL GPIO9, INT GPIO6).</figcaption></figure>
<h3>Pines y cableado</h3><p>La Tabla 11 reúne la distribución de terminales de la PCB1 sobre la ESP32-C3 SuperMini. La pantalla OLED y el giroscopio MPU6050 comparten el bus I2C (GPIO8 y GPIO9); los motores y el enable pertenecen al controlador de motores. La Figura 5a muestra el flujo de energía y señales; la Figura 5b ubica cada señal sobre los pines de la ESP32-C3 SuperMini, dibujada a partir del modelo 3D.</p><table>${cap(11,'Distribución de terminales de la PCB1 del PILIBOT.')}<tr><th>Subsistema</th><th>Dispositivo / señal</th><th>Etiqueta en PCB</th><th>GPIO de la ESP32-C3 SuperMini</th><th>Tipo</th></tr><tr><td>Motor izquierdo</td><td>IN1 / IN2</td><td>N/A</td><td>GPIO3 / GPIO4</td><td>PWM</td></tr><tr><td>Motor derecho</td><td>IN3 / IN4</td><td>N/A</td><td>GPIO1 / GPIO2</td><td>PWM</td></tr><tr><td>Enable</td><td>EN</td><td>N/A</td><td>GPIO10</td><td>GPIO / PWM</td></tr><tr><td>LED RGB</td><td>DIN</td><td>RGB</td><td>GPIO7</td><td>GPIO / PWM</td></tr><tr><td>Nivel de batería</td><td>Divisor de voltaje</td><td>N/A</td><td>GPIO0 (A0)</td><td>ADC</td></tr><tr><td>Pantalla OLED</td><td>SDA / SCL</td><td>OLED</td><td>GPIO8 / GPIO9</td><td>I2C</td></tr><tr><td>Giroscopio MPU6050</td><td>SDA / SCL / INT</td><td>MPU6050</td><td>GPIO8 / GPIO9 / GPIO6</td><td>I2C / GPIO</td></tr><tr><td>Buzzer</td><td>Señal</td><td>BUZ</td><td>GPIO5</td><td>PWM</td></tr></table>`],
['s5','Guía del simulador',`
<p>El panel se organiza en seis pestañas de la barra superior; cada una se abre y se cierra al pulsarla. Junto a ellas están las casillas <b>Modo oscuro</b> y <b>Robot encendido</b>.</p>
<div class="th"><b>I · Piezas.</b> Lista jerárquica de todos los cuerpos con colores por grupo. Permite ocultar o aislar cada pieza, plegar grupos y mostrar u ocultar el módulo OLED y las bandas. <b>Estilo de ruedas y banda</b> alterna las variantes A (banda ranurada) y B. El <b>Editor de dibujo</b> pinta los paneles del chasis con trazos, colores, plantillas y texturas.</div>
<div class="th"><b>II · Vista.</b> Modo oscuro, <b>Transparencia</b> (revela la electrónica interior) y <b>Anatomy</b>, que corta el modelo con un plano x, y o z. Siete vistas normalizadas, giro automático y <b>vista explosionada</b> con nivel, reproducción y velocidad: primero se desdoblan las bandas y después salen las piezas.</div>
<div class="th"><b>III · Robot.</b> <b>Interruptor</b>: al encender, la palanca se desplaza 2.5 mm hacia atrás; al apagar se extinguen la pantalla OLED, el LED RGB y los LED de la ESP32-C3 y del DRV8833. <b>Ojos OLED</b>: estados de ánimo, parpadeo y seguimiento del cursor. <b>LED RGB</b>: color, brillo y secuencias. <b>Motores N20</b>: velocidad y sentido de cada motor, enlace entre ambos y maniobras (avanzar, retroceder, girar, detener).</div>
<div class="th"><b>IV · Escenario.</b> Activa un piso plano sobre el que el robot se desplaza según la cinemática diferencial de sus motores: $v=\\tfrac{v_R+v_L}{2}$ y $\\omega=\\tfrac{v_R-v_L}{\\text{ancho de vía}}$. Cuatro cámaras (estática, sigue al robot, persecución y cenital) y lectura de posición, rumbo y distancia.</div>
<div class="th"><b>V · Aerodinámica.</b> Muestra el mapa de presión sobre la superficie, las líneas de corriente y las fuerzas resultantes. Se configura el viento (túnel constante, ráfaga, golpe de aire o turbulencia), su velocidad (0–40 m/s), azimut y elevación. Con el escenario activo se suma el viento aparente del avance y, opcionalmente, el viento empuja o hace volcar al robot. <b>Radiografía</b> vuelve transparente el modelo para ver el mapa en las piezas internas.</div>
<div class="th"><b>VI · Estructura.</b> <b>Caída</b>: altura de 1 a 200 cm, orientación y superficie (concreto, madera, goma, espuma). <b>Golpe</b>: dirección, masa y velocidad del impactor y punto de impacto (o clic sobre el robot). Resultado: mapa de esfuerzo $\\sigma/\\sigma_y$, deformación exagerada en cámara lenta, piezas más esforzadas, veredicto de daño y altura o velocidad críticas.</div>
${blk('tip','<b>Atajos.</b> <kbd>1</kbd>–<kbd>6</kbd> abren las pestañas, <kbd>7</kbd> esta documentación y <kbd>Esc</kbd> cierra lo abierto. Las pruebas de caída y golpe activan solas el piso del Escenario.')}`],
['s7','Fundamentos y método',`
<h3>Aerodinámica</h3>
<p>El aire se modela como flujo potencial incompresible alrededor de la envolvente sólida del robot: $\\mathbf v=\\nabla\\phi$ con $\\nabla^2\\phi=0$, condición de no penetración en el cuerpo y flujo uniforme en el contorno del dominio. Se resuelve una vez por eje y el campo de cualquier dirección se obtiene por superposición. La presión se expresa con el coeficiente:</p>
<div class="th">$$C_p=1-\\frac{|\\mathbf v|^2}{U^2},\\qquad q=\\tfrac12\\rho U^2,\\qquad \\mathbf F=-q\\oint C_p\\,\\mathbf n\\,dA .$$</div>
<p>En sotavento y en la estela se impone una presión base $C_{p,b}\\approx-0.4$ (el flujo potencial puro daría arrastre nulo). El deslizamiento se compara con $\\mu m g$ ($\\mu=0.6$) y la volcadura con el momento restaurador respecto de la arista de apoyo.</p>
<h3>Estructura</h3>
<p>El ensamble se voxeliza (1 mm) y a cada voxel se le asigna el material de su pieza. La energía del impacto fija la fuerza máxima con un resorte de contacto equivalente (rigidez en serie del contacto, la estructura y el piso):</p>
<div class="th">$$E=mgh\;\\text{(caída)},\\qquad E=\\tfrac12\\mu v^2\;\\text{(golpe)},\\qquad F_{\\max}=\\sqrt{2K_{\\mathrm{eff}}E},\\qquad a=F_{\\max}/m .$$</div>
<p>La carga inercial de cada voxel se transmite hasta la zona de contacto por la red de rigideces del modelo (analogía de conducción, resuelta con gradiente conjugado); el flujo de carga por unidad de área da el esfuerzo equivalente, multiplicado por $K_tK_d=6$ (concentración y amplificación dinámica). El daño se evalúa con $r=\\sigma/\\sigma_y$; la altura crítica es $h_{cr}=h/r^2$ y la velocidad crítica de golpe es $v/r$.</p>
<table>${cap(5,'Propiedades supuestas de los materiales.')}<tr><th>Material</th><th>E (MPa)</th><th>σ<sub>y</sub> (MPa)</th><th>ρ (g/cm³)</th></tr>${matRows}</table>
${blk('warn','<b>Alcance.</b> Son modelos de ingeniería para análisis comparativo y docente: no sustituyen un análisis CFD ni de elementos finitos. Las propiedades de los materiales son estimaciones y deben ajustarse a los valores reales de impresión y de los componentes.')}`],
['s6','Capturas de análisis',`
<p>Capturas del simulador con los análisis aerodinámico (pestaña <b>V</b>) y estructural (pestaña <b>VI</b>). Se obtuvieron con la configuración por defecto; los valores cambian al modificar el viento, la altura de caída o la superficie.</p>
<h3>Aerodinámica</h3>
<figure><img src="${CAPIMG.aero1}" alt="Ráfaga frontal"><figcaption><b>Figura 6.</b> Ráfaga frontal de 12 m/s: líneas de corriente coloreadas por velocidad y mapa de presión (coeficiente <b>Cp</b>) sobre la superficie (rojo: sobrepresión en la cara de barlovento; azul: succión).</figcaption></figure>
<figure><img src="${CAPIMG.aero2}" alt="Viento lateral"><figcaption><b>Figura 7.</b> Viento lateral: el flujo rodea el chasis y deja una zona de baja presión en sotavento, origen de la fuerza lateral que se compara con la fricción μ·m·g.</figcaption></figure>
<p>${tryB('Abrir el análisis aerodinámico en el simulador',[['tab',4]])}</p>
<h3>Estructura</h3>
<figure><img src="${CAPIMG.struct0}" alt="Caída desde 50 cm"><figcaption><b>Figura 8.</b> Prueba de caída desde 50 cm sobre concreto, con el panel de controles: orientación, altura, superficie y escala de color del esfuerzo.</figcaption></figure>
<figure><img src="${CAPIMG.struct1}" alt="Esfuerzo en caída"><figcaption><b>Figura 9.</b> Mapa de esfuerzo durante el impacto: la zona de contacto concentra el esfuerzo (naranja y rojo) y el resto de la estructura permanece en azul y verde.</figcaption></figure>
<p>${tryB('Abrir el análisis estructural en el simulador',[['tab',5]])}</p>
${blk('warn','<b>Alcance.</b> Son capturas ilustrativas de modelos de ingeniería para comparación; no sustituyen un ensayo físico ni un análisis por elementos finitos completo.')}`],
['s8','Referencias y glosario',`
<h3>Referencias</h3>
<ol><li>J. D. Anderson, <i>Fundamentals of Aerodynamics</i>, McGraw-Hill.</li><li>K. L. Johnson, <i>Contact Mechanics</i>, Cambridge University Press.</li><li>W. C. Young y R. G. Budynas, <i>Roark's Formulas for Stress and Strain</i>, McGraw-Hill.</li><li>R. Siegwart, I. Nourbakhsh y D. Scaramuzza, <i>Introduction to Autonomous Mobile Robots</i>, MIT Press.</li><li>ISO 5456-3:1996, <i>Technical drawings — Projection methods — Part 3: Axonometric representations</i>.</li><li>ISO 128-30:2001, <i>Technical drawings — General principles of presentation — Part 30: Basic conventions for views</i>.</li><li>ISO 129-1:2018, <i>Technical product documentation — Presentation of dimensions and tolerances — Part 1: General principles</i>.</li><li>Espressif Systems, <i>ESP32-C3 Series Datasheet</i>.</li><li>Texas Instruments, <i>DRV8833 Dual H-Bridge Motor Driver</i>, hoja de datos.</li><li>InvenSense, <i>MPU-6000 and MPU-6050 Product Specification</i>.</li><li>WorldSemi, hoja de datos del LED RGB direccionable WS2812B.</li></ol>
<h3>Glosario</h3>
<dl class="gl"><dt>Tracción diferencial</dt><dd>Giro del robot por diferencia de velocidad entre sus dos ruedas motrices.</dd><dt>Voxel</dt><dd>Cubo de 1 mm usado para discretizar el volumen del modelo.</dd><dt>Coeficiente de presión $C_p$</dt><dd>Presión local adimensionalizada con la presión dinámica del viento.</dd><dt>Esfuerzo equivalente</dt><dd>Medida escalar del esfuerzo que se compara con el límite de fluencia $\\sigma_y$.</dd><dt>Altura crítica</dt><dd>Altura de caída a la que el esfuerzo máximo alcanza la fluencia del material.</dd><dt>B-Rep</dt><dd>Representación de un sólido por sus fronteras (caras, aristas, vértices), obtenida del archivo STEP.</dd><dt>BMS</dt><dd>Sistema de gestión de batería que protege las celdas.</dd><dt>Plano (dibujo técnico)</dt><dd>Hoja con las vistas ortogonales, la isométrica, las cotas y el cuadro de datos de una pieza o conjunto.</dd><dt>Vista ortogonal</dt><dd>Proyección de la pieza sobre un plano perpendicular a la mirada; frontal, lateral y superior son las tres principales.</dd><dt>Vista isométrica</dt><dd>Proyección axonométrica en la que los tres ejes forman ángulos iguales; permite ver la forma sin perspectiva.</dd><dt>Cota</dt><dd>Medida con sus líneas de extensión, línea de cota y flechas; en estos planos siempre está en milímetros.</dd><dt>Escala</dt><dd>Relación entre el tamaño dibujado y el real; aquí es común a todas las vistas de una misma hoja.</dd><dt>Vista explosionada</dt><dd>Representación del conjunto con sus componentes separados a lo largo de líneas de montaje para mostrar cómo se ensamblan.</dd><dt>STEP</dt><dd>Formato de intercambio de modelos CAD (ISO 10303) que abren SolidWorks, FreeCAD, Fusion y Onshape.</dd><dt>Sólido facetado</dt><dd>Sólido cuyas superficies curvas se aproximan con caras planas pequeñas; es lo que se exporta en los archivos STEP de esta documentación.</dd><dt>Malla</dt><dd>Conjunto de triángulos que aproxima la superficie de una pieza para dibujarla y calcularla.</dd><dt>Vía $b$</dt><dd>Distancia entre los planos medios de las dos ruedas motrices; junto con $L$ define el giro y la estabilidad.</dd><dt>Distancia entre ejes $L$</dt><dd>Separación longitudinal entre el eje de tracción y el de la rueda loca.</dd><dt>Rueda loca</dt><dd>Rueda libre, sin motor, que apoya el robot y guía la banda de rodadura.</dd><dt>Banda de rodadura</dt><dd>Banda de goma sin fin que transmite la tracción de la rueda motriz al piso.</dd><dt>Motorreductor N20</dt><dd>Motor de corriente continua miniatura con caja reductora de engranes y eje de salida en D.</dd><dt>Eje en D</dt><dd>Eje cilíndrico con un plano que impide el giro relativo entre el eje y la rueda.</dd><dt>Puente H</dt><dd>Circuito que invierte la polaridad del motor; el DRV8833 contiene dos para controlar los dos motores.</dd><dt>PWM</dt><dd>Modulación por ancho de pulso: controla la potencia media entregada al motor variando el ciclo de trabajo.</dd><dt>IMU</dt><dd>Unidad de medición inercial con acelerómetro y giroscopio; aquí, el MPU6050.</dd><dt>Sensor ToF</dt><dd>Sensor de distancia por tiempo de vuelo de luz infrarroja; aquí, el VL53.</dd><dt>LiPo</dt><dd>Batería de polímero de litio; el robot usa dos celdas 802040 con protección BMS.</dd><dt>I²C</dt><dd>Bus serie de dos hilos (SDA y SCL) con el que el microcontrolador habla con la IMU y el sensor de distancia.</dd><dt>Separador</dt><dd>Pieza cilíndrica o hexagonal que mantiene una distancia fija entre dos placas.</dd><dt>MDF</dt><dd>Tablero de fibra de media densidad usado en las piezas planas del chasis.</dd><dt>PETG</dt><dd>Termoplástico para impresión 3D usado en bases, ruedas y soportes.</dd><dt>FR4</dt><dd>Laminado de fibra de vidrio y epoxi con el que se fabrican las placas de circuito.</dd><dt>Ajuste a presión</dt><dd>Unión sin pegamento ni tornillos que se mantiene por la interferencia ligera entre ranura y lengüeta.</dd><dt>ESP32-C3-MINI</dt><dd>Módulo de control con CPU RISC-V, Wi-Fi y Bluetooth LE; ejecuta el programa del robot.</dd><dt>DRV8833</dt><dd>Circuito integrado con dos puentes H que alimenta y controla el sentido y la velocidad de los dos motores.</dd><dt>MPU6050</dt><dd>IMU de seis ejes (acelerómetro y giroscopio) que mide la inclinación y el giro del robot.</dd><dt>VL53</dt><dd>Sensor de distancia láser por tiempo de vuelo, montado al frente.</dd><dt>WS2812B</dt><dd>LED RGB direccionable con controlador integrado; se maneja con una sola línea de datos.</dd><dt>OLED</dt><dd>Pantalla de diodos orgánicos de 1.3″ y 128 × 64 píxeles; no necesita luz de fondo.</dd><dt>PCB</dt><dd>Placa de circuito impreso; PCB1 aloja el control y PCB2 la energía.</dd><dt>2S</dt><dd>Dos celdas LiPo conectadas en serie (7.4 V nominales).</dd><dt>JST</dt><dd>Familia de conectores de dos hilos usados en las celdas y los motores.</dd><dt>Relación de reducción</dt><dd>Cociente entre la velocidad del motor y la del eje de salida; reduce la velocidad y multiplica el par.</dd><dt>Par (torque)</dt><dd>Momento de giro que entrega el eje de salida al mover la rueda.</dd><dt>Balero 693ZZ</dt><dd>Rodamiento rígido de bolas de Ø3 × Ø8 × 4 mm con blindaje metálico, usado en la rueda loca.</dd><dt>M2, M3</dt><dd>Roscas métricas de 2 y 3 mm de diámetro nominal en tornillos, tuercas y separadores.</dd><dt>Separador hexagonal</dt><dd>Columna roscada de sección hexagonal que mantiene la distancia entre dos placas.</dd><dt>Banda elástica</dt><dd>Banda de elastómero negro que se ajusta en las ranuras del chasis para sujetar las tapas.</dd><dt>Tolerancia</dt><dd>Variación permitida en una medida; en las ranuras y lengüetas es de ±0.1 mm.</dd><dt>Ranura y lengüeta</dt><dd>Unión de paneles por encaje: la lengüeta de una pieza entra en la ranura de la otra.</dd><dt>Ø y R</dt><dd>Símbolos de diámetro y de radio en las cotas; los radios se acotan con una línea a 45°.</dd><dt>Línea de centro</dt><dd>Trazo de eje (raya y punto) que marca el centro de un orificio o el eje de simetría.</dd><dt>Envolvente</dt><dd>Caja mínima que contiene a la pieza; da su ancho, alto y profundidad máximos.</dd><dt>Renderizado de aristas</dt><dd>Dibujo de los bordes del modelo para resaltar su forma en las vistas de los planos.</dd><dt>Serigrafía</dt><dd>Texto y trazos blancos impresos sobre la placa (nombres de pines, códigos de componentes y contornos); en las figuras se dibujan sobre la vista superior del modelo 3D.</dd><dt>Cota isométrica</dt><dd>Cota cuya línea es paralela a uno de los ejes isométricos y cuyo texto se alinea con ese eje; así el largo, el ancho y el alto se leen en una sola vista.</dd><dt>Eje isométrico</dt><dd>Cada una de las tres direcciones (largo, ancho y alto) que en la vista isométrica se dibujan a 120° entre sí.</dd><dt>SMD</dt><dd>Componente de montaje superficial, soldado sobre las pistas sin atravesar la placa.</dd><dt>Pad</dt><dd>Isla de cobre de la placa donde se suelda un terminal.</dd><dt>Código de resistencia SMD</dt><dd>Número de tres cifras impreso en la resistencia: las dos primeras son dígitos y la tercera el exponente de 10, en ohmios (473 = 47 kΩ, 472 = 4.7 kΩ, 102 = 1 kΩ).</dd><dt>GPIO</dt><dd>Pin de propósito general del microcontrolador, configurable como entrada o salida.</dd><dt>ADC</dt><dd>Convertidor analógico-digital; lee el divisor de tensión de la batería en GPIO0.</dd><dt>Regulador reductor (Mini560)</dt><dd>Convertidor conmutado que baja la tensión de la batería a 3.3 V para alimentar la electrónica.</dd><dt>Reductor</dt><dd>Tren de engranes en carcasa de latón (dorada en el modelo) que baja la velocidad del motor N20 y aumenta su par.</dd><dt>Escala común de módulos</dt><dd>Relación de tamaño única (13 px por mm) con la que se dibujan la ESP32-C3 y los módulos de las figuras de conexiones, para comparar sus tamaños reales.</dd></dl>`]];
  /* numeración de figuras y tablas por orden de aparición, índices de figuras y de planos */
  (function(){
    const all=secs.map(s=>s[2]).join('\n');
    const mapOf=re=>{ const m=new Map(); let r; re.lastIndex=0; while((r=re.exec(all))){ if(!m.has(r[1])) m.set(r[1],m.size+1); } return m; };
    const mf=mapOf(/<figcaption><b>Figura (\d+[a-z]?)\./g); window.__fig4N=mf.get('4')||4; const mt=mapOf(/<caption[^>]*><b[^>]*>Tabla (\d+)\./g);
    const FI=[], PI=[];
    secs.forEach((s,i)=>{ s[2]=s[2].replace(/Figura (\d+[a-z]?)\b/g,(x,n)=>'Figura '+(mf.get(n)||n)).replace(/Tabla (\d+)\b/g,(x,n)=>'Tabla '+(mt.get(n)||n))
      .replace(/<figcaption><b>Figura (\d+)\.<\/b>\s*([^<]*)/g,(x,n,tx)=>{ FI.push({n:+n,t:tx.trim(),s:i}); return '<figcaption id="fg-'+n+'"><b>Figura '+n+'.</b> '+tx; })
      .replace(/<figcaption><b>Plano (\d+)\.<\/b>\s*([^<]*)/g,(x,n,tx)=>{ PI.push({n:+n,t:tx.trim(),s:i}); return '<figcaption id="pl-'+n+'"><b>Plano '+n+'.</b> '+tx; }); });
    const short=tx=>{ let u=tx.replace(/\s+/g,' ').trim(), k=u.search(/[:.](\s|$)/); if(k>10) u=u.slice(0,k); return u.length>96?u.slice(0,93)+'…':u; };
    const row=(lbl,p,pre)=>'<tr><td>'+lbl+' '+p.n+'</td><td><a href="#" class="ix" data-go="'+secs[p.s][0]+'" data-at="'+pre+p.n+'">'+(pre==='pl-'?p.t.split(' | ')[0]:short(p.t))+'</a></td><td>'+(p.s+1)+'</td></tr>';
    const glos=h=>{ const m=h.match(/^([\s\S]*?)<dl class="gl">([\s\S]*?)<\/dl>([\s\S]*)$/); if(!m) return h;
      const it=[]; m[2].replace(/<dt>([\s\S]*?)<\/dt><dd>([\s\S]*?)<\/dd>/g,(x,t,d)=>{ it.push([t,d]); return x; });
      const key=t=>t.replace(/\$[^$]*\$/g,'').replace(/<[^>]+>/g,'').trim().toLowerCase().replace(/ø/g,'o');
      const ini=t=>{ const k=key(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').charAt(0).toUpperCase(); return /[A-Z]/.test(k)?k:'#'; };
      it.sort((a,b)=>{ const x=key(a[0]).normalize('NFD').replace(/[\u0300-\u036f]/g,''), y=key(b[0]).normalize('NFD').replace(/[\u0300-\u036f]/g,''); return x.localeCompare(y,'es'); });
      let o='', cur='', L=[]; it.forEach(q=>{ const i=ini(q[0]); if(i!==cur){ cur=i; L.push(i); o+='</dl><div class="glh" id="gl-'+i+'"><span>'+i+'</span></div><dl class="gl">'; } o+='<dt>'+q[0]+'</dt><dd>'+q[1]+'</dd>'; });
      o=o.replace('</dl>','');
      return m[1]+'<div class="glidx">'+L.map(l=>'<a href="#" class="ix" data-go="s8" data-at="gl-'+l+'">'+l+'</a>').join(' · ')+'</div>'+o+'</dl>'+m[3]; };
    const nt=mt.size, ref=secs.find(s=>s[0]==='s8');
    ref[2]='<h3>Índice de figuras</h3>\n<table>'+cap(nt+1,'Índice de figuras (pulsa el título para ir a la figura).')+'<tr><th>Figura</th><th>Título</th><th>Sección</th></tr>'+FI.sort((a,b)=>a.n-b.n).map(p=>row('Figura',p,'fg-')).join('')+'</table>\n<h3>Índice de planos</h3>\n<table>'+cap(nt+2,'Índice de planos (pulsa el título para ir al plano).')+'<tr><th>Plano</th><th>Título</th><th>Sección</th></tr>'+PI.sort((a,b)=>a.n-b.n).map(p=>row('Plano',p,'pl-')).join('')+'</table>\n'+glos(ref[2]);
  })();
  const toc=secs.map((s,i)=>'<a data-s="'+s[0]+'">'+(i+1)+' · '+s[1]+'</a>').join('');
  const body=secs.map((s,i)=>'<section id="'+s[0]+'"><h2><span class="n">'+(i+1)+'</span><span class="tt">'+s[1]+'</span><button type="button" class="pop" title="Abrir esta sección en una ventana nueva">↗ Ventana nueva</button></h2>'+s[2]+'</section>').join('');
  const js=`(function(){var A=[].slice.call(document.querySelectorAll('aside a[data-s]')),S=A.map(function(a){return document.getElementById(a.dataset.s)}),R=document.documentElement,cur=0;
function show(id){var k=0;S.forEach(function(s,i){if(s.id===id)k=i});cur=k;S.forEach(function(s,i){s.classList.toggle('on',i===k)});A.forEach(function(a,i){a.classList.toggle('on',i===k)});window.scrollTo(0,0);}
A.forEach(function(a){a.addEventListener('click',function(){show(a.dataset.s)})});
var H=location.hash.slice(1).split('|');if(H[1]==='d')R.setAttribute('data-dark','');show(H[0]||S[0].id);
if(window.opener&&!window.opener.closed)[].forEach.call(document.querySelectorAll('.pop'),function(b){b.style.display='none'});
[].forEach.call(document.querySelectorAll('.pop'),function(b){b.addEventListener('click',function(){window.parent.postMessage({pilibot:'pop',sec:S[cur].id},'*')})});
var q=document.getElementById('q');function f(){var v=q.value.trim().toLowerCase(),first=-1;S.forEach(function(s,i){var ok=!v||s.textContent.toLowerCase().indexOf(v)>=0;A[i].classList.toggle('off',!ok);if(ok&&first<0&&v)first=i});return first}
q.addEventListener('input',f);q.addEventListener('keydown',function(e){if(e.key==='Enter'){var i=f();if(i>=0)show(S[i].id)}});
var sb=[].slice.call(document.querySelectorAll('[data-sty]'));function sty(m){if(m==='mk')R.setAttribute('data-mk','');else R.removeAttribute('data-mk');sb.forEach(function(b){b.classList.toggle('on',b.dataset.sty===m)})}
sb.forEach(function(b){b.addEventListener('click',function(){sty(b.dataset.sty)})});sty('std');
document.addEventListener('click',function(e){var g=e.target.closest('[data-go]');if(!g)return;e.preventDefault();show(g.dataset.go);var el=document.getElementById(g.dataset.at);if(el)el.scrollIntoView({block:'center'});});
window.addEventListener('message',function(e){var d=e.data;if(d&&d.pilibot==='theme'){if(d.dark)R.setAttribute('data-dark','');else R.removeAttribute('data-dark')}});
document.addEventListener('click',function(e){var b=e.target.closest('[data-try]');if(!b)return;var t=(window.opener&&!window.opener.closed)?window.opener:window.parent;try{t.postMessage({pilibot:'try',acts:JSON.parse(b.dataset.try)},'*');b.classList.add('sent')}catch(x){}});
 (function(){ var st=document.createElement('style'); st.textContent='.tb{position:absolute;top:0;right:0;z-index:3;width:28px;height:28px}.tb .tg{position:absolute;top:0;right:0;width:28px;height:28px;background:linear-gradient(225deg,var(--blue) 0 50%,transparent 50%);cursor:pointer;transition:width .15s,height .15s}.tb .tg::after{content:"";position:absolute;top:0;right:0;width:20px;height:20px;background:linear-gradient(225deg,transparent 0 46%,var(--paper) 46% 52%,transparent 52%);opacity:.8}.tb:hover .tg,.tb.zm .tg,.tb:focus-within .tg{opacity:0}.tb .tp{position:absolute;top:0;right:0;display:flex;gap:3px;align-items:center;padding:5px 5px 5px 8px;background:var(--paper);border:1px solid var(--blue);border-top:0;border-right:0;box-shadow:-2px 2px 0 var(--bd);opacity:0;visibility:hidden;transform:translate(8px,-8px);transition:opacity .16s,transform .16s,visibility .16s}.tb:hover .tp,.tb:focus-within .tp,.tb.zm .tp{opacity:1;visibility:visible;transform:none}.tb button{font:inherit;font-size:15px;line-height:1;width:26px;height:26px;border:1px solid var(--bd);color:var(--blue);background:var(--paper);padding:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}.tb button:hover,.tb button.on{background:var(--blue);border-color:var(--blue);color:#fff}.tb .zc{display:none;gap:3px;align-items:center;padding-right:5px;margin-right:2px;border-right:1px solid var(--bd)}.tb.zm .zc{display:inline-flex}.tb .zh{display:none;position:absolute;top:100%;right:0;margin-top:3px;white-space:nowrap;font-size:12px;color:var(--mut);background:var(--paper);border:1px solid var(--bd);padding:1px 7px}.tb.zm .zh{display:block}@media print{.tb{display:none}}.pw{position:relative;overflow:hidden;touch-action:none}.pw.zm{cursor:grab}.pw.zm.dr{cursor:grabbing}@media print{.tb{display:none}}'; document.head.appendChild(st); var IZ='<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6.5" cy="6.5" r="4.6"/><path d="M10 10l4.6 4.6M4.4 6.5h4.2M6.5 4.4v4.2"/></svg>'; var I3='<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 1.5l5.8 3.2v6.6L8 14.5l-5.8-3.2V4.7z"/><path d="M2.2 4.7L8 8l5.8-3.3M8 8v6.5"/></svg>'; document.querySelectorAll('figure').forEach(function(fig){   var s=fig.querySelector('svg.sh'); if(!s) return;   var cp=fig.querySelector('figcaption'), m=/Plano ([0-9]+)/.exec(cp?cp.textContent:''), n=m?+m[1]:0;   var pw=document.createElement('div'); pw.className='pw'; s.parentNode.insertBefore(pw,s); pw.appendChild(s);   var tb=document.createElement('div'); tb.className='tb';   tb.innerHTML='<i class="tg" title="Zoom y vista 3D"></i><div class="tp"><span class="zc"><button type="button" data-k="in" title="Acercar">+</button><button type="button" data-k="out" title="Alejar">&minus;</button><button type="button" data-k="rs" title="Restablecer (doble clic)">&#8634;</button></span><button type="button" data-k="z" title="Zoom: rueda para acercar y arrastrar para mover" aria-label="Zoom">'+IZ+'</button><button type="button" data-k="3d" title="Ver en 3D" aria-label="Ver en 3D">'+I3+'</button></div><span class="zh">Rueda: zoom | Arrastrar: mover | Doble clic: restablecer</span>';   pw.appendChild(tb);   var vb=[0,0,297,210], base=[0,0,297,210], on=false, drag=null;   function put(){ s.setAttribute('viewBox',vb.map(function(v){return +v.toFixed(3)}).join(' ')); }   function clamp(){ vb[2]=Math.min(base[2],vb[2]); vb[3]=vb[2]*base[3]/base[2]; vb[0]=Math.max(0,Math.min(base[2]-vb[2],vb[0])); vb[1]=Math.max(0,Math.min(base[3]-vb[3],vb[1])); }   function pt(e){ var r=s.getBoundingClientRect(); return [vb[0]+(e.clientX-r.left)/r.width*vb[2], vb[1]+(e.clientY-r.top)/r.height*vb[3]]; }   function zoom(f,c){ var nw=Math.max(base[2]/24,Math.min(base[2],vb[2]/f)), k=nw/vb[2]; c=c||[vb[0]+vb[2]/2,vb[1]+vb[3]/2]; vb=[c[0]-(c[0]-vb[0])*k,c[1]-(c[1]-vb[1])*k,nw,vb[3]*k]; clamp(); put(); }   function reset(){ vb=base.slice(); put(); }   function mode(v){ on=v; tb.classList.toggle('zm',on); pw.classList.toggle('zm',on); tb.querySelector('[data-k=z]').classList.toggle('on',on); if(!on) reset(); }   tb.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; var k=b.dataset.k;     if(k==='z') mode(!on); else if(k==='in') zoom(1.4); else if(k==='out') zoom(1/1.4); else if(k==='rs') reset();     else if(k==='3d'){ var t=(window.opener&&!window.opener.closed)?window.opener:window.parent; try{ var mm=/Plano ([0-9]+)/.exec(cp?cp.textContent:''); t.postMessage({pilibot:'v3d',n:mm?+mm[1]:n},'*'); }catch(x){} } });   pw.addEventListener('wheel',function(e){ if(!on) return; e.preventDefault(); zoom(e.deltaY<0?1.2:1/1.2,pt(e)); },{passive:false});   pw.addEventListener('pointerdown',function(e){ if(!on||e.button!==0||e.target.closest('.tb')) return; drag={x:e.clientX,y:e.clientY,vb:vb.slice()}; pw.classList.add('dr'); pw.setPointerCapture(e.pointerId); });   pw.addEventListener('pointermove',function(e){ if(!drag) return; var r=s.getBoundingClientRect(); vb[0]=drag.vb[0]-(e.clientX-drag.x)/r.width*vb[2]; vb[1]=drag.vb[1]-(e.clientY-drag.y)/r.height*vb[3]; clamp(); put(); });   pw.addEventListener('pointerup',function(){ drag=null; pw.classList.remove('dr'); });   pw.addEventListener('dblclick',function(){ if(on) reset(); }); }); })();  (function(){ var st=document.createElement('style'); st.textContent='.f4w{position:relative;display:block}.f1r{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.f1r div{text-align:center}.f1r img{width:100%}.f1r span{display:block;font-size:13px;color:var(--mut);margin-top:2px}.f4g{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:6px 20px;align-items:start}.f4g figcaption{grid-column:1/-1}.f4l{list-style:none;margin:0;padding:0;font-size:14.5px;line-height:1.28}.f4l li{display:grid;grid-template-columns:26px 1fr;gap:8px;padding:1.5px 0;border-bottom:1px solid var(--bd)}.f4l li b{color:var(--blue);text-align:right}@media(max-width:700px){.f4g{grid-template-columns:1fr}}.f4w img{display:block;width:100%}.f4w button{position:absolute;left:10px;bottom:10px;font:inherit;font-size:16px;border:1px solid var(--blue);background:var(--paper,#fff);color:var(--blue);padding:5px 16px;cursor:pointer}.f4w button:hover{background:var(--blue);color:#fff}.dlb{font:inherit;font-size:13.5px;border:1px solid var(--green);color:var(--green);background:transparent;padding:1px 9px;cursor:pointer}.dlb:hover{background:var(--green);color:#fff}a.ix{color:var(--blue);text-decoration:none}a.ix:hover{text-decoration:underline}ul.pl{margin:4px 0 2px;padding-left:18px;font-size:13.5px}ul.pl li{margin:2px 0}details summary{cursor:pointer;color:var(--blue);font-size:13.5px}'; document.head.appendChild(st);
  document.addEventListener('click',function(e){ var b=e.target.closest('[data-f4],[data-st]'); if(!b) return; var t=(window.opener&&!window.opener.closed)?window.opener:window.parent; try{ t.postMessage(b.hasAttribute('data-f4')?{pilibot:'fig4'}:{pilibot:'step',id:b.getAttribute('data-st')},'*'); }catch(x){} }); })();
window.addEventListener('load',function(){try{renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});}catch(e){}});})();`;
  const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PILIBOT | Documentación</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css"><style>${css}</style></head><body>
<aside><h1>PILIBOT <span class="b">|</span> Documentación</h1><p class="by">Simulador 3D · Powered by <b>FIUNVA</b></p><input id="q" type="search" placeholder="Buscar (Enter para abrir)…" aria-label="Buscar">${toc}<div class="gp">ESTILO DE LOS PLANOS</div><div class="sty"><button type="button" data-sty="std">Estándar</button><button type="button" data-sty="mk">Maker</button></div></aside>
<main>${body}</main><script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"><\/script><script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"><\/script><script>${js}<\/script></body></html>`;
  return html;
}
let docHTML=null, docDark=null; const docWins=[];
function docTheme(){ const d=!!S.dark; if(d===docDark) return; docDark=d;
  const fr=document.getElementById('docfr'); if(fr&&fr.contentWindow) fr.contentWindow.postMessage({pilibot:'theme',dark:d},'*');
  docWins.forEach(w=>{ try{ if(!w.closed) w.postMessage({pilibot:'theme',dark:d},'*'); }catch(_){} });
  const ov=document.getElementById('docov'); if(ov){ ov.style.background=d?'#0a1322':'#f5f8fc'; const bar=ov.firstChild; bar.style.background=d?'#0f1b30':'#fff'; bar.style.color=d?'#e6edf7':'#0b1f3a'; bar.style.borderBottomColor=d?'#7aa7ff':'#0b1f3a'; } }
setInterval(docTheme,400);

