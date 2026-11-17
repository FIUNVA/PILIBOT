'use strict';
/* ---- estructura ---- */
function stLabels(){ $('st-hv').textContent=ST.H+' cm'; $('st-mv').textContent=ST.mi+' g'; $('st-vv').textContent=(ST.v/10).toFixed(1)+' m/s'; $('st-pyv').textContent=ST.py+' %'; $('st-pxv').textContent=ST.px+' %'; $('st-av').textContent='×'+ST.amp; $('st-sv').textContent='×'+ST.sl.toFixed(2); }
$('st-on').onchange=e=>{ if(e.target.checked){ if(AIR.on){ $('ae-on').checked=false; aeroSet(false); } $('st-st').textContent='Listo. Elige la prueba y pulsa '+(ST.test==='drop'?'«Soltar».':'«Golpear».'); } else { structRestore(); if(AN.mode==='struct') ovlOff(); $('st-hud').innerHTML=''; $('st-st').textContent='Análisis desactivado.'; } };
document.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{ ST.test=b.dataset.st; document.querySelectorAll('[data-st]').forEach(x=>x.classList.toggle('on',x===b)); $('st-drop').style.display=ST.test==='drop'?'':'none'; $('st-hit').style.display=ST.test==='hit'?'':'none'; $('st-go').textContent=ST.test==='drop'?'Soltar':'Golpear'; });
const bindG=(sel,key,attr)=>document.querySelectorAll(sel).forEach(b=>b.onclick=()=>{ ST[key]=b.dataset[attr]; document.querySelectorAll(sel).forEach(x=>x.classList.toggle('on',x===b)); });
bindG('[data-so]','orient','so'); bindG('[data-sf]','surf','sf'); bindG('[data-sd]','dir','sd');
[['st-h','H',1],['st-m','mi',1],['st-v','v',1],['st-py','py',1],['st-px','px',1],['st-a','amp',1]].forEach(([id,k])=>{ $(id).oninput=e=>{ST[k]=+e.target.value; stLabels();}; });
$('st-s').oninput=e=>{ST.sl=+e.target.value/100; stLabels();};
$('st-aim').onchange=e=>{ST.aim=e.target.checked; $('st-st').textContent=ST.aim?'Haz clic sobre el robot: el impactor llegará por la dirección de la cámara.':'';};
$('st-go').onclick=()=>{ if($('st-on').checked===false){ $('st-on').checked=true; $('st-on').onchange({target:$('st-on')}); } ST.aimRay=null; structRun(); };
$('st-rs').onclick=()=>{ structRestore(); if(AN.mode==='struct') ovlOff(); $('st-hud').innerHTML=''; $('st-st').textContent='Robot restaurado.'; };
stLabels();
{ let dn=null; canvas.addEventListener('pointerdown',e=>{dn={x:e.clientX,y:e.clientY};});
  canvas.addEventListener('pointerup',async e=>{ if(!dn) return; const mv=Math.hypot(e.clientX-dn.x,e.clientY-dn.y); dn=null; if(mv>5||!ST.aim||ST.test!=='hit'||!$('st-on').checked||AN.busy) return;
    const V=await ensureVox(m=>{$('st-st').textContent=m;}); const r=canvas.getBoundingClientRect(), nd=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    const rc=new THREE.Raycaster(); rc.setFromCamera(nd,camera); root.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();
    const o=rc.ray.origin.clone().applyMatrix4(inv), d=rc.ray.direction.clone().transformDirection(inv).normalize();
    let t0=-1e9,t1=1e9; for(const ax of ['x','y','z']){ const lo=V.mn[ax]-4, hi=V.mx[ax]+4; if(Math.abs(d[ax])<1e-9){ if(o[ax]<lo||o[ax]>hi) return; } else { let a=(lo-o[ax])/d[ax], b=(hi-o[ax])/d[ax]; if(a>b)[a,b]=[b,a]; t0=Math.max(t0,a); t1=Math.min(t1,b); } }
    if(t0>t1) return; ST.aimRay={o:o.clone().addScaledVector(d,t0-10),d}; structRun(); }); }
window.__AN=AN; window.__AIR=AIR; window.__ST=ST; window.__aeroSet=aeroSet; window.__structRun=structRun;


/* ====================== DOCUMENTACIÓN (ventana nueva) ====================== */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function projPt(view,x,y,z){ return view==='front'?[-x,y]:view==='side'?[-z,y]:[-x,z]; }
function edgeSVG(list,view,W,H,dim){
  const segs=[]; let mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
  list.forEach(b=>{ const P=b.lines.geometry.attributes.position.array; for(let i=0;i+5<P.length;i+=6){ const a=projPt(view,P[i],P[i+1],P[i+2]), c=projPt(view,P[i+3],P[i+4],P[i+5]); segs.push(a,c);
    for(const q of [a,c]){ if(q[0]<mnx)mnx=q[0]; if(q[0]>mxx)mxx=q[0]; if(q[1]<mny)mny=q[1]; if(q[1]>mxy)mxy=q[1]; } } });
  const rw=mxx-mnx||1, rh=mxy-mny||1, m=dim?34:8, s=Math.min((W-2*m)/rw,(H-2*m)/rh), ox=(W-rw*s)/2, oy=(H-rh*s)/2;
  const X=u=>(ox+(u-mnx)*s).toFixed(1), Y=v=>(H-oy-(v-mny)*s).toFixed(1); let d='';
  for(let i=0;i<segs.length;i+=2) d+='M'+X(segs[i][0])+' '+Y(segs[i][1])+'L'+X(segs[i+1][0])+' '+Y(segs[i+1][1]);
  let g='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg"><path d="'+d+'" fill="none" stroke="#0b1f3a" stroke-width="'+(dim?0.6:0.8)+'" stroke-linecap="round"/>';
  if(dim){ const x0=+X(mnx), x1=+X(mxx), y0=+Y(mny), y1=+Y(mxy), c='#b91c1c', ty=y0+22;
    g+='<g stroke="'+c+'" stroke-width="0.8" fill="'+c+'" font-size="11" font-family="serif">'
      +'<line x1="'+x0+'" y1="'+(y0+6)+'" x2="'+x0+'" y2="'+(ty+4)+'"/><line x1="'+x1+'" y1="'+(y0+6)+'" x2="'+x1+'" y2="'+(ty+4)+'"/><line x1="'+x0+'" y1="'+ty+'" x2="'+x1+'" y2="'+ty+'" marker-start="url(#arR)" marker-end="url(#arR)"/>'
      +'<text x="'+((x0+x1)/2)+'" y="'+(ty-4)+'" text-anchor="middle" stroke="none">'+rw.toFixed(2)+' mm</text>'
      +'<line x1="'+(x0-6)+'" y1="'+y0+'" x2="'+(x0-22)+'" y2="'+y0+'"/><line x1="'+(x0-6)+'" y1="'+y1+'" x2="'+(x0-22)+'" y2="'+y1+'"/><line x1="'+(x0-16)+'" y1="'+y0+'" x2="'+(x0-16)+'" y2="'+y1+'" marker-start="url(#arR)" marker-end="url(#arR)"/>'
      +'<text transform="translate('+(x0-19)+' '+((y0+y1)/2)+') rotate(-90)" text-anchor="middle" stroke="none">'+rh.toFixed(2)+' mm</text></g>'
      +'<defs><marker id="arR" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L6 3L0 6z" fill="#b91c1c"/></marker></defs>'; }
  return g+'</svg>';
}
function snapshot(level,vec,crop){
  const sv={lv:EX.level,off:offset.clone(),up:camera.up.clone(),tg:target.clone(),zm:zoom,dark:S.dark,fl:flMesh.visible,sh:shMesh.visible,rot:root.rotation.y,pos:root.position.clone()};
  EX.playing=false; flMesh.visible=shMesh.visible=false; root.rotation.y=0; root.position.set(0,0,0);
  S.dark=false; applyAppearance(); setLevel(level); setView(new THREE.Vector3(...(vec||VIEWS.iso[0]))); renderer.render(scene,camera);
  let url=canvas.toDataURL('image/jpeg',0.92);
  if(crop){ try{ const w=canvas.width, h=canvas.height, t=document.createElement('canvas'); t.width=w; t.height=h; const q=t.getContext('2d'); q.drawImage(canvas,0,0); const D=q.getImageData(0,0,w,h).data, b0=[D[0],D[1],D[2]]; let x0=w,x1=0,y0=h,y1=0;
      for(let y=0;y<h;y+=2) for(let x=0;x<w;x+=2){ const k=(y*w+x)*4; if(Math.abs(D[k]-b0[0])+Math.abs(D[k+1]-b0[1])+Math.abs(D[k+2]-b0[2])>24){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; } }
      if(x1>x0&&y1>y0){ const cw=1.0, m=Math.round(.05*Math.max(x1-x0,y1-y0)), cx=(x0+x1)/2, cy=(y0+y1)/2, side=Math.max(x1-x0,(y1-y0)/1.0)+2*m, ww=Math.round(side), hh=Math.round(side*.95), c2=document.createElement('canvas'); c2.width=ww; c2.height=hh; const g2=c2.getContext('2d'); g2.fillStyle='rgb('+b0.join(',')+')'; g2.fillRect(0,0,ww,hh); g2.drawImage(canvas,cx-ww/2,cy-hh/2,ww,hh,0,0,ww,hh); url=c2.toDataURL('image/jpeg',0.9); } }catch(e){ console.error(e); } }
  S.dark=sv.dark; applyAppearance(); setLevel(sv.lv); offset.copy(sv.off); camera.up.copy(sv.up); target.copy(sv.tg); zoom=sv.zm; place(); flMesh.visible=sv.fl; shMesh.visible=sv.sh; root.rotation.y=sv.rot; root.position.copy(sv.pos);
  return url;
}
